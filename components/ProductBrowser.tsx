'use client';

import { useState, useEffect } from 'react';
import { getProvider, formatAddress } from '@/lib/web3';
import { getProductRegistryContract, getSupplyChainContract, statusNames, ProductStatus } from '@/lib/contracts';

interface Product {
  productId: number;
  name: string;
  description: string;
  metadata: string;
  manufacturer: string;
  createdAt: number;
  exists: boolean;
}

interface ProductBrowserProps {
  onProductSelect?: (productId: number) => void;
}

export default function ProductBrowser({ onProductSelect }: ProductBrowserProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productStatuses, setProductStatuses] = useState<Record<number, number>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = getProvider();
      if (!provider) {
        setError('Please connect your wallet to browse products');
        setLoading(false);
        return;
      }

      const productRegistry = getProductRegistryContract(provider);
      
      // Try to use getAllProducts if available, otherwise fallback to manual iteration
      let allProducts: Product[] = [];
      try {
        // Check if getAllProducts exists (requires contract recompilation)
        if (typeof productRegistry.getAllProducts === 'function') {
          allProducts = await productRegistry.getAllProducts();
        } else {
          // Fallback: Get total count and iterate
          const totalProducts = await productRegistry.getTotalProducts();
          const totalCount = Number(totalProducts);
          
          if (totalCount === 0) {
            allProducts = [];
          } else {
            const productPromises = [];
            
            for (let i = 1; i <= totalCount; i++) {
              productPromises.push(
                productRegistry.getProduct(i).catch(() => null)
              );
            }
            
            const productResults = await Promise.all(productPromises);
            allProducts = productResults.filter((p): p is Product => p !== null && p.exists);
          }
        }
      } catch (error: any) {
        // If getAllProducts doesn't exist, use fallback method
        if (error.message?.includes('getAllProducts') || error.message?.includes('is not a function')) {
          try {
            const totalProducts = await productRegistry.getTotalProducts();
            const totalCount = Number(totalProducts);
            
            if (totalCount === 0) {
              allProducts = [];
            } else {
              const productPromises = [];
              
              for (let i = 1; i <= totalCount; i++) {
                productPromises.push(
                  productRegistry.getProduct(i).catch(() => null)
                );
              }
              
              const productResults = await Promise.all(productPromises);
              allProducts = productResults.filter((p): p is Product => p !== null && p.exists);
            }
          } catch (fallbackError: any) {
            console.error('Error loading products:', fallbackError);
            setError('Failed to load products. Make sure contracts are deployed and products exist.');
            setLoading(false);
            return;
          }
        } else {
          throw error;
        }
      }

      // Filter out products that don't exist (in case of gaps in IDs)
      const validProducts = allProducts.filter((p: Product) => p.exists);

      setProducts(validProducts);

      // Load statuses for each product
      if (validProducts.length > 0) {
        const supplyChain = getSupplyChainContract(provider);
        const statusPromises = validProducts.map(async (product: Product) => {
          try {
            const status = await supplyChain.getProductStatus(product.productId);
            return { id: product.productId, status: Number(status) };
          } catch {
            return { id: product.productId, status: ProductStatus.Created };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<number, number> = {};
        statuses.forEach(({ id, status }) => {
          statusMap[id] = status;
        });
        setProductStatuses(statusMap);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.productId.toString().includes(search) ||
      product.metadata.toLowerCase().includes(search)
    );
  });

  const handleProductClick = (productId: number) => {
    if (onProductSelect) {
      onProductSelect(productId);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl">
            📦
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-600">Browse Products</h2>
            <p className="text-sm text-gray-500">Search and explore all available products</p>
          </div>
        </div>
        <button
          onClick={loadProducts}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search by name, description, ID, or metadata..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
        />
      </div>

      {products.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600 mb-2">No products found</p>
          <p className="text-gray-500 mb-4">
            Products will appear here once they are created. Check back later or create a product as a Manufacturer.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-semibold mb-2">💡 To get started with default products:</p>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Run: <code className="bg-blue-100 px-1 rounded">npm run compile</code></li>
              <li>Run: <code className="bg-blue-100 px-1 rounded">npm run deploy:local</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-600 mb-2">No products match your search</p>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const status = productStatuses[product.productId] ?? ProductStatus.Created;
              return (
                <div
                  key={product.productId}
                  onClick={() => handleProductClick(product.productId)}
                  className={`border-2 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer ${
                    onProductSelect
                      ? 'hover:border-green-500 border-gray-200'
                      : 'border-gray-200'
                  } bg-gradient-to-br from-white to-gray-50`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">#{product.productId}</h3>
                        <p className="text-sm text-gray-500">Product ID</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === ProductStatus.Created
                          ? 'bg-blue-100 text-blue-700'
                          : status === ProductStatus.DeliveredToCustomer
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {statusNames[status as ProductStatus]}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  {product.metadata && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Metadata:</p>
                      <p className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {product.metadata}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                    <span>🏭</span>
                    <span className="font-mono">{formatAddress(product.manufacturer)}</span>
                  </div>

                  {onProductSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.productId);
                      }}
                      className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      Select Product #{product.productId}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

