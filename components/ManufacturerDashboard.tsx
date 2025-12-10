'use client';

import { useState, useEffect, useRef } from 'react';
import { getProvider, isOnCorrectNetwork, ensureNetwork } from '@/lib/web3';
import { getProductRegistryContract, getSupplyChainContract } from '@/lib/contracts';
import { uploadFileToIPFS, uploadMetadataToIPFS, getIPFSGatewayURL, formatIPFSHash } from '@/lib/ipfs';
import ProductQRCode from './ProductQRCode';

interface ManufacturerDashboardProps {
  address: string;
}

interface UploadedFile {
  file: File;
  cid: string | null;
  preview?: string;
  uploading: boolean;
  progress: number;
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Helper function to parse IPFS metadata and extract image URLs
  const parseIPFSMetadata = (metadata: string) => {
    if (!metadata) return null;
    
    try {
      // Check if it's an IPFS hash (starts with ipfs://)
      if (metadata.startsWith('ipfs://')) {
        const cid = metadata.replace('ipfs://', '');
        // Try to fetch and parse the metadata
        // For now, return the gateway URL
        return {
          cid,
          gatewayUrl: getIPFSGatewayURL(cid),
          files: [],
        };
      }
      
      // Try to parse as JSON
      const parsed = JSON.parse(metadata);
      if (parsed.files && Array.isArray(parsed.files)) {
        const imageFiles = parsed.files.filter((f: any) => f.type?.startsWith('image/'));
        return {
          files: parsed.files,
          images: imageFiles.map((f: any) => f.url || getIPFSGatewayURL(f.cid)),
          metadata: parsed,
        };
      }
      
      return null;
    } catch {
      // Not JSON, might be a plain IPFS hash
      if (metadata.length > 20 && !metadata.includes(' ')) {
        return {
          cid: metadata,
          gatewayUrl: getIPFSGatewayURL(metadata),
          files: [],
        };
      }
      return null;
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
            const ipfsData = parseIPFSMetadata(product.metadata);
            return {
              id: Number(id),
              name: product.name,
              description: product.description,
              metadata: product.metadata,
              ipfsData,
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

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      cid: null,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploading: false,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Upload file to IPFS
  const uploadFile = async (index: number) => {
    const fileToUpload = uploadedFiles[index];
    if (!fileToUpload || fileToUpload.cid) return; // Already uploaded

    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploading: true, progress: 0 } : f
    ));

    try {
      const cid = await uploadFileToIPFS(
        fileToUpload.file,
        (progress) => {
          setUploadedFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        }
      );

      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, cid, uploading: false, progress: 100 } : f
      ));
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false } : f
      ));
      setMessage(`Error uploading file: ${error.message || 'Unknown error'}`);
    }
  };

  // Upload all files to IPFS
  const uploadAllFiles = async () => {
    for (let i = 0; i < uploadedFiles.length; i++) {
      if (!uploadedFiles[i].cid && !uploadedFiles[i].uploading) {
        await uploadFile(i);
      }
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreateProduct = async () => {
    if (!productName || !productDescription) {
      setMessage('Please fill in product name and description');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // First, upload all files to IPFS if not already uploaded
      const filesToUpload = uploadedFiles.filter(f => !f.cid && !f.uploading);
      if (filesToUpload.length > 0) {
        setMessage('Uploading files to IPFS...');
        await uploadAllFiles();
      }

      // Build metadata object with file information
      let finalMetadata = productMetadata;
      const uploadedCids = uploadedFiles
        .filter(f => f.cid)
        .map(f => ({
          name: f.file.name,
          type: f.file.type,
          size: f.file.size,
          cid: f.cid!,
          url: getIPFSGatewayURL(f.cid!),
        }));

      if (uploadedCids.length > 0) {
        const metadataObj: any = {};
        
        // If user provided JSON metadata, try to parse it
        if (productMetadata.trim()) {
          try {
            const parsed = JSON.parse(productMetadata);
            Object.assign(metadataObj, parsed);
          } catch {
            // If not JSON, add it as a text field
            metadataObj.customMetadata = productMetadata;
          }
        }
        
        metadataObj.files = uploadedCids;
        
        // Upload metadata to IPFS if we have files
        if (uploadedCids.length > 0) {
          setMessage('Uploading metadata to IPFS...');
          const metadataCid = await uploadMetadataToIPFS(metadataObj);
          finalMetadata = `ipfs://${metadataCid}`;
        } else {
          finalMetadata = JSON.stringify(metadataObj);
        }
      }

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
          finalMetadata || ''
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

      setMessage('Creating product on blockchain...');
      const tx = await productRegistry.createProduct(
        productName,
        productDescription,
        finalMetadata || ''
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
      setUploadedFiles([]); // Clear uploaded files
      
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
        } else if (error.message.includes('IPFS') || error.message.includes('Failed to upload')) {
          errorMessage = `IPFS Upload Error: ${error.message}`;
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

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Files (Optional - Images, Documents, etc.)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <div className="space-y-2">
                  <div className="text-4xl">📎</div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Images, PDFs, Documents (Files will be uploaded to IPFS)
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {/* Preview for images */}
                      {uploadedFile.preview && (
                        <img
                          src={uploadedFile.preview}
                          alt={uploadedFile.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      {!uploadedFile.preview && (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                          📄
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024).toFixed(2)} KB
                        </p>
                        {uploadedFile.uploading && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${uploadedFile.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {uploadedFile.progress}%
                            </p>
                          </div>
                        )}
                        {uploadedFile.cid && (
                          <p className="text-xs text-indigo-600 mt-1 font-mono">
                            IPFS: {formatIPFSHash(uploadedFile.cid)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!uploadedFile.cid && !uploadedFile.uploading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              uploadFile(index);
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Upload
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload All Button */}
                  {uploadedFiles.some(f => !f.cid && !f.uploading) && (
                    <button
                      onClick={uploadAllFiles}
                      className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Upload All Files to IPFS
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Metadata Input (for manual IPFS hash or JSON) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Metadata (Optional - JSON or IPFS hash)
              </label>
              <textarea
                value={productMetadata}
                onChange={(e) => setProductMetadata(e.target.value)}
                placeholder='{"key": "value"} or IPFS hash'
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                If files are uploaded above, this will be merged with file metadata. Otherwise, enter JSON or IPFS hash manually.
              </p>
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
                        {/* Show IPFS image if available */}
                        {product.ipfsData?.images && product.ipfsData.images.length > 0 ? (
                          <img
                            src={product.ipfsData.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Product #{product.id}</h4>
                          <p className="text-gray-700 font-medium">{product.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      
                      {/* Show IPFS metadata info */}
                      {product.ipfsData && (
                        <div className="mb-2">
                          {product.ipfsData.images && product.ipfsData.images.length > 0 && (
                            <div className="flex gap-2 mb-2">
                              {product.ipfsData.images.slice(0, 3).map((imgUrl: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`${product.name} - Image ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded border border-gray-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {product.ipfsData.files && product.ipfsData.files.length > 0 && (
                            <p className="text-xs text-indigo-600">
                              📎 {product.ipfsData.files.length} file(s) stored on IPFS
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {product.createdAt}</span>
                        {product.ipfsData?.cid && (
                          <span className="font-mono text-indigo-600">
                            IPFS: {formatIPFSHash(product.ipfsData.cid)}
                          </span>
                        )}
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

