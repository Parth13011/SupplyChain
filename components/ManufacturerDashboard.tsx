'use client';

import { useState, useEffect } from 'react';
import { getProvider, isOnCorrectNetwork, ensureNetwork } from '@/lib/web3';
import { getProductRegistryContract, getSupplyChainContract } from '@/lib/contracts';
import ProductQRCode from './ProductQRCode';

interface ManufacturerDashboardProps {
  address: string;
}

export default function ManufacturerDashboard({ address }: ManufacturerDashboardProps) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productMetadata, setProductMetadata] = useState('');
  const [distributorAddress, setDistributorAddress] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [roleVerified, setRoleVerified] = useState<boolean | null>(null);
  const [newlyCreatedProductId, setNewlyCreatedProductId] = useState<number | null>(null);
  const [showQRCodeForProduct, setShowQRCodeForProduct] = useState<number | null>(null);

  useEffect(() => {
    verifyRole();
    loadProducts();
  }, [address]);

  const verifyRole = async () => {
    try {
      const provider = getProvider();
      if (!provider) return;

      const { getUserRegistryContract, UserRole } = await import('@/lib/contracts');
      const userRegistry = getUserRegistryContract(provider);
      
      const isRegistered = await userRegistry.isUserRegistered(address);
      if (!isRegistered) {
        setRoleVerified(false);
        return;
      }

      const role = await userRegistry.getUserRole(address);
      setRoleVerified(Number(role) === UserRole.Manufacturer);
    } catch (error) {
      console.error('Error verifying role:', error);
      setRoleVerified(null);
    }
  };

  const loadProducts = async () => {
    try {
      const provider = getProvider();
      if (!provider) return;

      // Get the actual signer address (the one that created products)
      const signer = await provider.getSigner();
      const actualAddress = await signer.getAddress();
      
      // Use actual signer address instead of prop address
      // This ensures we get products created by the current connected account
      const productRegistry = getProductRegistryContract(provider);
      const productIds = await productRegistry.getProductsByManufacturer(actualAddress);
      
      console.log('Loading products for address:', actualAddress);
      console.log('Found product IDs:', productIds.map(id => id.toString()));
      
      const productData = await Promise.all(
        productIds.map(async (id: bigint) => {
          try {
            const product = await productRegistry.getProduct(id);
            return {
              id: Number(id),
              name: product.name,
              description: product.description,
              metadata: product.metadata,
              createdAt: new Date(Number(product.createdAt) * 1000).toLocaleString(),
            };
          } catch (error) {
            console.error(`Error loading product ${id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null results
      const validProducts = productData.filter(p => p !== null);
      setProducts(validProducts);
      
      console.log('Loaded products:', validProducts.length);
    } catch (error) {
      console.error('Error loading products:', error);
      setMessage(`Error loading products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName || !productDescription) {
      setMessage('Please fill in product name and description');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      // Validate network before attempting transaction
      const onCorrectNetwork = await isOnCorrectNetwork();
      if (!onCorrectNetwork) {
        setMessage('Error: You are not on the correct network. Please switch to DIDLab network in MetaMask.');
        setLoading(false);
        
        // Try to switch network automatically
        try {
          await ensureNetwork();
          // If successful, wait a moment and retry
          setTimeout(() => {
            setMessage('Network switched. Please try creating the product again.');
          }, 1000);
        } catch (networkError: any) {
          if (networkError.message?.includes('rejected')) {
            setMessage('Error: Network switch was rejected. Please manually switch to DIDLab network in MetaMask and try again.');
          } else {
            setMessage(`Error: ${networkError.message || 'Failed to switch network. Please switch to DIDLab network manually.'}`);
          }
        }
        return;
      }

      // Validate user registration and role before attempting transaction
      const { getUserRegistryContract, UserRole } = await import('@/lib/contracts');
      const userRegistry = getUserRegistryContract(provider);
      
      try {
        const isRegistered = await userRegistry.isUserRegistered(address);
        if (!isRegistered) {
          setMessage('Error: Your account is not registered. Please contact the Government to register your account.');
          setLoading(false);
          return;
        }

        const role = await userRegistry.getUserRole(address);
        if (Number(role) !== UserRole.Manufacturer) {
          setMessage(`Error: Your account does not have Manufacturer role. Current role: ${role}. Please contact the Government to update your role.`);
          setLoading(false);
          return;
        }
      } catch (checkError: any) {
        console.error('Error checking registration:', checkError);
        
        // Check if it's a network-related error
        if (checkError.message?.includes('network') || checkError.code === 'NETWORK_ERROR' || checkError.code === 'UNSUPPORTED_OPERATION') {
          setMessage('Error: Network connection issue. Please ensure you are connected to the DIDLab network and try again.');
        } else {
          setMessage('Error: Could not verify account registration. Please try again.');
        }
        setLoading(false);
        return;
      }

      const signer = await provider.getSigner();
      const productRegistry = getProductRegistryContract(signer);

      // Estimate gas first to catch errors early
      try {
        await productRegistry.createProduct.estimateGas(
          productName,
          productDescription,
          productMetadata || ''
        );
      } catch (estimateError: any) {
        // Try to extract revert reason
        const errorMessage = estimateError.message || estimateError.reason || 'Transaction would revert';
        if (errorMessage.includes('Only Manufacturer')) {
          setMessage('Error: Only accounts with Manufacturer role can create products.');
        } else if (errorMessage.includes('not registered')) {
          setMessage('Error: Your account is not registered in the system.');
        } else {
          setMessage(`Error: ${errorMessage}`);
        }
        setLoading(false);
        return;
      }

      // Double-check network before sending transaction
      const networkCheck = await isOnCorrectNetwork();
      if (!networkCheck) {
        setMessage('Error: Network changed during transaction. Please switch to DIDLab network and try again.');
        setLoading(false);
        return;
      }

      const tx = await productRegistry.createProduct(
        productName,
        productDescription,
        productMetadata || ''
      );
      
      console.log('Product creation transaction:', tx.hash);
      const receipt = await tx.wait();
      console.log('Product creation confirmed in block:', receipt.blockNumber);
      
      // Get the product ID from the return value
      // The createProduct function returns the product ID
      let createdProductId: number;
      try {
        // Try to get the return value from the transaction
        const result = await tx.wait();
        // Get total products to determine the new product ID
        const totalProducts = await productRegistry.getTotalProducts();
        createdProductId = Number(totalProducts);
      } catch (e) {
        // Fallback: get total products
        const totalProducts = await productRegistry.getTotalProducts();
        createdProductId = Number(totalProducts);
      }
      
      // Get the actual signer address to verify (reuse existing signer)
      const actualAddress = await signer.getAddress();
      console.log('Product created by address:', actualAddress);
      console.log('Created Product ID:', createdProductId);
      
      setMessage(`Product created successfully! Product ID: #${createdProductId}. Transaction: ${tx.hash}`);
      setNewlyCreatedProductId(createdProductId);
      setProductName('');
      setProductDescription('');
      setProductMetadata('');
      
      // Reload products after a short delay to ensure blockchain state is updated
      setTimeout(() => {
        loadProducts();
      }, 2000);
    } catch (error: any) {
      console.error('Create product error:', error);
      
      // Try to extract more specific error information
      let errorMessage = 'Failed to create product';
      
      if (error.message) {
        errorMessage = error.message;
        
        // Check for network-related errors first
        if (error.message.includes('network') || error.code === 'NETWORK_ERROR' || error.code === 'UNSUPPORTED_OPERATION') {
          errorMessage = 'Error: Network connection issue. Please ensure you are connected to the DIDLab network and try again.';
        } else if (error.message.includes('revert') || error.message.includes('execution reverted')) {
          if (error.message.includes('Only Manufacturer')) {
            errorMessage = 'Error: Only accounts with Manufacturer role can create products. Please verify your account role.';
          } else if (error.message.includes('not registered') || error.message.includes('User not registered')) {
            errorMessage = 'Error: Your account is not registered. Please contact the Government to register your account.';
          } else if (error.message.includes('Internal JSON-RPC')) {
            errorMessage = 'Error: Transaction failed. This usually means: 1) Your account is not registered as Manufacturer, 2) Network connection issue, or 3) Insufficient gas. Please check your account role and try again.';
          } else {
            errorMessage = `Error: Transaction reverted. ${error.message}`;
          }
        } else if (error.message.includes('user rejected') || error.code === 4001) {
          errorMessage = 'Transaction cancelled by user.';
        } else if (error.message.includes('insufficient funds') || error.message.includes('insufficient balance')) {
          errorMessage = 'Error: Insufficient funds for gas. Please add more ETH to your account.';
        } else if (error.message.includes('nonce') || error.message.includes('replacement')) {
          errorMessage = 'Error: Transaction nonce issue. Please wait a moment and try again.';
        }
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShipToDistributor = async (productId: number) => {
    if (!distributorAddress) {
      setMessage('Please enter distributor address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.shipToDistributor(
        productId,
        distributorAddress,
        ''
      );
      await tx.wait();

      setMessage('Product shipped to distributor successfully!');
      setDistributorAddress('');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to ship product'}`);
    } finally {
      setLoading(false);
    }
  };

  // Show warning if role is not verified
  if (roleVerified === false) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
            🏭
          </div>
          <div>
            <h2 className="text-2xl font-bold text-indigo-600">Manufacturer Dashboard</h2>
            <p className="text-sm text-gray-500">Create products and manage shipments</p>
          </div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Account Not Registered as Manufacturer</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Your account ({address.slice(0, 6)}...{address.slice(-4)}) is not registered as a Manufacturer in the system.</p>
                <p className="mt-2">To create products, you need to:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Contact the Government account to register your address</li>
                  <li>Request to be registered with the Manufacturer role</li>
                  <li>Government Address: <span className="font-mono text-xs">0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86</span></li>
                </ol>
                <p className="mt-3 font-semibold">If you just created this account, make sure it's registered with the Manufacturer role before trying to create products.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          🏭
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Manufacturer Dashboard</h2>
          <p className="text-sm text-gray-500">Create products and manage shipments</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-4">Create New Product</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata (Optional - IPFS hash or JSON)
              </label>
              <input
                type="text"
                value={productMetadata}
                onChange={(e) => setProductMetadata(e.target.value)}
                placeholder="IPFS hash or additional metadata"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleCreateProduct}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Products</h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-500 font-medium">No products created yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first product above</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="border-2 border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition-all bg-gradient-to-r from-white to-gray-50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📦</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Product #{product.id}</h4>
                          <p className="text-gray-700 font-medium">{product.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {product.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[280px]">
                      <button
                        onClick={() => setShowQRCodeForProduct(showQRCodeForProduct === product.id ? null : product.id)}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 flex items-center justify-center gap-2"
                      >
                        <span>📱</span>
                        <span>{showQRCodeForProduct === product.id ? 'Hide QR Code' : 'Show QR Code'}</span>
                      </button>
                      <input
                        type="text"
                        value={distributorAddress}
                        onChange={(e) => setDistributorAddress(e.target.value)}
                        placeholder="Distributor address (0x...)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleShipToDistributor(product.id)}
                        disabled={loading || !distributorAddress}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span>🚚</span>
                        <span>{loading ? 'Shipping...' : 'Ship to Distributor'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* QR Code Display for this product */}
                  {showQRCodeForProduct === product.id && (
                    <div className="mt-4 border-t pt-4">
                      <ProductQRCode 
                        productId={product.id} 
                        productName={product.name}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Show QR Code for newly created product */}
        {newlyCreatedProductId !== null && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-indigo-600">📱 Product QR Code</h3>
              <button
                onClick={() => setNewlyCreatedProductId(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>
            <ProductQRCode 
              productId={newlyCreatedProductId} 
              productName={products.find(p => p.id === newlyCreatedProductId)?.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

