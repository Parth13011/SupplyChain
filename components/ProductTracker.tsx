'use client';

import { useState, useEffect, useRef } from 'react';
import { getProvider, formatAddress } from '@/lib/web3';
import { getProductRegistryContract, getSupplyChainContract, getUserRegistryContract, statusNames, UserRole } from '@/lib/contracts';
import { ProductStatus } from '@/lib/contracts';
import SupplyChainFlow from './SupplyChainFlow';
import { Html5Qrcode } from 'html5-qrcode';

interface ProductTrackerProps {
  userAddress?: string;
  userRole?: UserRole;
  initialProductId?: string;
}

export default function ProductTracker({ userAddress, userRole, initialProductId }: ProductTrackerProps) {
  const [productId, setProductId] = useState('');
  const [productInfo, setProductInfo] = useState<any>(null);
  const [productHistory, setProductHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<number>(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const productIdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkRegistration();
    loadAvailableProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  useEffect(() => {
    if (initialProductId) {
      // Validate initialProductId is a valid number
      const idNum = Number(initialProductId);
      if (!isNaN(idNum) && idNum > 0 && Number.isInteger(idNum)) {
        setProductId(initialProductId);
        // Auto-track if product ID is provided and user is registered
        if (isRegistered && userAddress) {
          // Use setTimeout to avoid calling during render
          setTimeout(() => {
            handleTrackProduct(initialProductId);
          }, 100);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductId, isRegistered, userAddress]);

  const checkRegistration = async () => {
    if (!userAddress) {
      setIsRegistered(false);
      return;
    }

    try {
      const provider = getProvider();
      if (!provider) {
        setIsRegistered(false);
        return;
      }

      const userRegistry = getUserRegistryContract(provider);
      const registered = await userRegistry.isUserRegistered(userAddress);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const provider = getProvider();
      if (!provider) return;

      const productRegistry = getProductRegistryContract(provider);
      const total = await productRegistry.getTotalProducts();
      setAvailableProducts(Number(total));
    } catch (error) {
      console.error('Error loading available products:', error);
      setAvailableProducts(0);
    }
  };

  const parseQRCodeData = (data: string): number | null => {
    // Parse QR code data - format: "PRODUCT_ID:123" or just "123"
    if (data.startsWith('PRODUCT_ID:')) {
      const id = data.replace('PRODUCT_ID:', '').trim();
      const numId = Number(id);
      return !isNaN(numId) && numId > 0 ? numId : null;
    }
    // Try parsing as just a number
    const numId = Number(data.trim());
    return !isNaN(numId) && numId > 0 ? numId : null;
  };

  const startQRScanner = async () => {
    try {
      setShowQRScanner(true);
      setScanning(true);
      setError('');

      // Wait for the DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      const qrCode = new Html5Qrcode('qr-reader');
      qrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          console.log('QR Code scanned:', decodedText);
          const productId = parseQRCodeData(decodedText);
          if (productId) {
            setProductId(productId.toString());
            stopQRScanner();
            // Auto-track the product
            setTimeout(() => {
              handleTrackProduct(productId.toString());
            }, 500);
          } else {
            setError(`Invalid QR code format. Expected PRODUCT_ID:123 or product ID number. Got: ${decodedText}`);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
          // Only log if it's not a common "not found" error
          if (!errorMessage.includes('No QR code found')) {
            // console.log('Scanning...', errorMessage);
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting QR scanner:', error);
      let errorMsg = 'Failed to start camera. ';
      if (error.message?.includes('Permission denied') || error.message?.includes('NotAllowedError')) {
        errorMsg += 'Please grant camera permissions and try again.';
      } else if (error.message?.includes('NotFoundError')) {
        errorMsg += 'No camera found. Please use a device with a camera.';
      } else {
        errorMsg += error.message || 'Please ensure camera permissions are granted.';
      }
      setError(errorMsg);
      setScanning(false);
      setShowQRScanner(false);
    }
  };

  const stopQRScanner = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.stop().then(() => {
        qrCodeRef.current?.clear();
        qrCodeRef.current = null;
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
      });
    }
    setScanning(false);
    setShowQRScanner(false);
  };

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleTrackProduct = async (id?: string) => {
    // Get the product ID from parameter, input ref, or state (in that order)
    // IMPORTANT: If id is not a string (e.g., it's an event object), ignore it
    let inputValue: string | undefined = undefined;
    
    // If id is provided and is a string, use it
    if (id && typeof id === 'string') {
      inputValue = id;
    }
    
    // Try to read directly from input element to avoid state sync issues
    if (!inputValue && productIdInputRef.current) {
      inputValue = productIdInputRef.current.value;
    }
    
    // Fallback to state if input ref is not available
    if (!inputValue) {
      inputValue = productId;
    }
    
    // Clear any previous errors first
    setError('');
    setLoading(true);
    
    // Convert to string and trim whitespace
    const targetId = String(inputValue || '').trim();
    
    console.log('Tracking product - Input:', { 
      idParam: id, 
      inputRefValue: productIdInputRef.current?.value, 
      stateValue: productId,
      finalValue: inputValue,
      targetId, 
      availableProducts 
    });
    
    // Check if input is empty
    if (!targetId || targetId.length === 0) {
      setError('Please enter a product ID');
      setLoading(false);
      return;
    }

    // Extract product ID from input - handle both formats:
    // 1. Just a number: "1", "2", etc.
    // 2. QR code format: "PRODUCT_ID:1", "PRODUCT_ID:2", etc.
    let productIdNum: number;
    
    // Handle QR code format (case-insensitive)
    let idToParse = targetId.trim();
    if (idToParse.toUpperCase().startsWith('PRODUCT_ID:')) {
      idToParse = idToParse.replace(/^PRODUCT_ID:/i, '').trim();
    }
    
    // Extract all digits from the string
    const digitsOnly = idToParse.match(/\d+/);
    
    console.log('🔍 Validation Debug:', { 
      originalInput: targetId,
      afterTrim: idToParse,
      digitsFound: digitsOnly,
      availableProducts 
    });
    
    if (!digitsOnly || digitsOnly.length === 0) {
      setError(`Invalid format. Please enter a product ID number (e.g., 1, 2, 3) or PRODUCT_ID:1`);
      setLoading(false);
      return;
    }
    
    // Parse the first sequence of digits found
    productIdNum = parseInt(digitsOnly[0], 10);
    
    console.log('✅ Parsed:', { 
      productIdNum, 
      isValid: !isNaN(productIdNum) && productIdNum > 0 && Number.isInteger(productIdNum)
    });
    
    // Validate the parsed number
    if (isNaN(productIdNum)) {
      setError(`Invalid format. Could not parse product ID. Please enter a number (e.g., 1, 2, 3)`);
      setLoading(false);
      return;
    }
    
    if (productIdNum <= 0) {
      setError(`Product ID must be greater than 0. Please enter a positive number (1, 2, 3, etc.)`);
      setLoading(false);
      return;
    }
    
    if (!Number.isInteger(productIdNum)) {
      setError(`Product ID must be a whole number (no decimals)`);
      setLoading(false);
      return;
    }
    
    console.log('Product ID validated:', productIdNum, 'Available:', availableProducts);

    // Check if product ID is within available range (if we know the range)
    if (availableProducts > 0 && productIdNum > availableProducts) {
      setError(`Product #${productIdNum} does not exist. Available products are #1 to #${availableProducts}.`);
      setLoading(false);
      return;
    }

    console.log('Tracking product ID:', productIdNum, 'Available products:', availableProducts);

    // Product tracking is read-only and should be available to everyone
    // No registration required for viewing product information

    // Clear any previous errors and reset state
    setProductInfo(null);
    setProductHistory([]);

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found. Please connect MetaMask.');

      // Convert to BigInt for contract calls (Solidity uint256)
      const productIdBigInt = BigInt(productIdNum);

      // Check if product exists first
      const productRegistry = getProductRegistryContract(provider);
      
      let productExists = false;
      try {
        productExists = await productRegistry.productExists(productIdBigInt);
      } catch (checkError: any) {
        console.error('Error checking product existence:', checkError);
        // If productExists fails, try to get the product directly
        // This handles cases where the contract method might have issues
      }
      
      if (!productExists) {
        // Try to get the product directly to see if it exists
        try {
          await productRegistry.getProduct(productIdBigInt);
          productExists = true; // If getProduct succeeds, product exists
        } catch (getError: any) {
          // Product doesn't exist
          // Get total products to provide helpful message
          let totalProducts = 0;
          try {
            totalProducts = Number(await productRegistry.getTotalProducts());
          } catch (e) {
            // Ignore error
          }
          
          if (totalProducts === 0) {
            setError(`Product #${productIdNum} does not exist. No products have been created yet.`);
          } else {
            setError(`Product #${productIdNum} does not exist. Available products are #1 to #${totalProducts}. Please check the Product Browser to see all available products.`);
          }
          setLoading(false);
          return;
        }
      }

      // Get product info - use BigInt
      const product = await productRegistry.getProduct(productIdBigInt);
      
      // Get supply chain contract for history
      const supplyChain = getSupplyChainContract(provider);
      
      // Product tracking is read-only - anyone can view product information
      
      setProductInfo({
        id: Number(product.productId),
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        manufacturer: product.manufacturer,
        createdAt: new Date(Number(product.createdAt) * 1000).toLocaleString(),
      });

      // Get product history and status (may not exist if product just created)
      let history: any[] = [];
      let status = ProductStatus.Created;
      try {
        // Use BigInt for contract calls
        history = await supplyChain.getProductHistory(productIdBigInt);
        status = await supplyChain.getProductStatus(productIdBigInt);
      } catch (historyError: any) {
        // Product exists but may not have any supply chain transactions yet
        console.log('No supply chain history yet for this product:', historyError.message);
        history = [];
        // Try to get status from product statuses mapping
        try {
          status = await supplyChain.getProductStatus(productIdBigInt);
        } catch (statusError) {
          status = ProductStatus.Created;
        }
      }

      // Process history data
      const historyData = (history || []).map((tx: any) => ({
        transactionId: Number(tx.transactionId),
        from: tx.from,
        to: tx.to,
        status: Number(tx.status),
        metadata: tx.metadata || '',
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
      }));

      setProductHistory(historyData);
      setProductInfo((prev: any) => ({ ...prev, currentStatus: Number(status) }));
    } catch (error: any) {
      console.error('Error tracking product:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to track product';
      
      if (error.message) {
        if (error.message.includes('Product does not exist')) {
          errorMessage = `Product #${productIdNum} does not exist. Please check the product ID and try again.`;
        } else if (error.message.includes('execution reverted')) {
          errorMessage = `Transaction failed: ${error.message}. The product may not exist or there may be a contract issue.`;
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and ensure you are on the correct network.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!userAddress) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 mb-2">🔍 Product Tracker</p>
          <p className="text-gray-500">Please connect your wallet to track products</p>
        </div>
      </div>
    );
  }

  // Product tracking is available to all connected users (read-only)
  // No registration required for viewing product information

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          🔍
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Product Tracker</h2>
          <p className="text-sm text-gray-500">Track products you're authorized to view</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>🔍 Product Tracking:</strong> Enter a product ID to view its complete history, current status, and all transactions in the supply chain.
          </p>
          {availableProducts > 0 && (
            <p className="text-sm text-blue-700 mt-2">
              <strong>📦 Available Products:</strong> {availableProducts} product{availableProducts !== 1 ? 's' : ''} available (IDs: 1-{availableProducts})
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={productIdInputRef}
              type="text"
              inputMode="numeric"
              value={productId}
            onChange={(e) => {
              const value = e.target.value;
              // Always clear error when user types
              setError('');
              
              // Allow any input while typing - validation happens on button click
              // This allows users to type PRODUCT_ID:1 character by character
              setProductId(value);
            }}
              onFocus={() => {
                // Clear error when user focuses on input
                setError('');
              }}
              placeholder="Enter Product ID or paste QR code text (PRODUCT_ID:123)"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          <button
            onClick={showQRScanner ? stopQRScanner : startQRScanner}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              showQRScanner
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span>{showQRScanner ? '🛑' : '📷'}</span>
            <span>{showQRScanner ? 'Stop Scan' : 'Scan QR'}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleTrackProduct();
            }}
            disabled={loading || !productId}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            <span>🔍</span>
            <span>{loading ? 'Tracking...' : 'Track Product'}</span>
          </button>
        </div>

        {/* QR Code Scanner */}
        {showQRScanner && (
          <div className="border-2 border-indigo-300 rounded-lg p-4 bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">📷 Point camera at QR code</p>
              <button
                onClick={stopQRScanner}
                className="text-white hover:text-red-300"
              >
                ✕ Close
              </button>
            </div>
            <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
            <p className="text-white text-xs text-center mt-2">
              Make sure the QR code is clearly visible in the camera view
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {productInfo && (
          <>
            {/* Supply Chain Flow Visualization */}
            {productInfo.currentStatus !== undefined && (
              <SupplyChainFlow 
                currentStatus={productInfo.currentStatus as ProductStatus}
                transactions={productHistory}
              />
            )}

            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">Product Information</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product ID</p>
                    <p className="text-lg font-bold text-indigo-600">#{productInfo.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold">
                      {productInfo.currentStatus !== undefined 
                        ? statusNames[productInfo.currentStatus as ProductStatus]
                        : 'Created'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="text-xl font-semibold text-gray-900">{productInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-700">{productInfo.description}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Manufacturer:</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded">{formatAddress(productInfo.manufacturer)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {productInfo.createdAt}
                </div>
              </div>
            </div>
          </>
        )}

        {productHistory.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-4">📋 Complete Transaction History</h3>
            <div className="space-y-3">
              {productHistory.map((tx, index) => {
                const isLatest = index === productHistory.length - 1;
                // Determine who sent it and where it is now
                const sender = tx.from;
                const receiver = tx.to;
                const currentLocation = isLatest ? receiver : tx.to;
                
                return (
                  <div 
                    key={tx.transactionId} 
                    className={`border rounded-lg p-4 transition-all ${
                      isLatest 
                        ? 'bg-indigo-50 border-indigo-300 shadow-md ring-2 ring-indigo-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                        isLatest ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        #{tx.transactionId}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isLatest 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {statusNames[tx.status as ProductStatus]}
                          </span>
                          {isLatest && (
                            <span className="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-1 rounded">
                              ⭐ CURRENT STATUS
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-600 w-20">Sent From:</span>
                              <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded flex-1">
                                {formatAddress(sender)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-600 w-20">Sent To:</span>
                              <span className={`font-mono text-xs px-2 py-1 rounded flex-1 ${
                                isLatest ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-gray-50'
                              }`}>
                                {formatAddress(receiver)}
                                {isLatest && ' (Current Location)'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <p className="text-gray-500 flex items-center gap-1">
                            <span>📅</span>
                            <span>{tx.timestamp}</span>
                          </p>
                          {tx.metadata && (
                            <p className="text-gray-400 italic">
                              {tx.metadata}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Box */}
            {productHistory.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">📍 Current Location</h4>
                <p className="text-sm text-indigo-800">
                  The product is currently with: <span className="font-mono font-semibold">
                    {formatAddress(productHistory[productHistory.length - 1].to)}
                  </span>
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Status: <span className="font-semibold">
                    {statusNames[productHistory[productHistory.length - 1].status as ProductStatus]}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

