'use client';

import { useState, useEffect } from 'react';
import { getProvider } from '@/lib/web3';
import { getSupplyChainContract, ProductStatus, statusNames } from '@/lib/contracts';

interface DistributorDashboardProps {
  address: string;
}

export default function DistributorDashboard({ address }: DistributorDashboardProps) {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [retailerAddress, setRetailerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPendingProducts();
    const interval = setInterval(loadPendingProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingProducts = async () => {
    // In a real app, you'd filter products by status
    // For now, we'll show a message
    setPendingProducts([]);
  };

  const handleReceiveFromManufacturer = async (productId: number) => {
    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.receiveFromManufacturer(productId, '');
      await tx.wait();

      setMessage('Product received successfully!');
      await loadPendingProducts();
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to receive product'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShipToRetailer = async (productId: number) => {
    if (!retailerAddress) {
      setMessage('Please enter retailer address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.shipToRetailer(productId, retailerAddress, '');
      await tx.wait();

      setMessage('Product shipped to retailer successfully!');
      setRetailerAddress('');
      await loadPendingProducts();
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to ship product'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          🚚
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Distributor Dashboard</h2>
          <p className="text-sm text-gray-500">Receive and distribute products</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">ℹ️</span>
            <h3 className="text-lg font-semibold text-blue-900">Instructions</h3>
          </div>
          <p className="text-sm text-blue-700">
            Use the Product Tracker below to find products shipped to you, then use the product ID to receive them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Receive from Manufacturer */}
          <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📥</span>
              <h3 className="text-lg font-semibold">Receive from Manufacturer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="number"
                  id="receiveProductId"
                  placeholder="Enter product ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  const productId = (document.getElementById('receiveProductId') as HTMLInputElement)?.value;
                  if (productId) handleReceiveFromManufacturer(Number(productId));
                }}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>{loading ? 'Processing...' : 'Receive Product'}</span>
              </button>
            </div>
          </div>

          {/* Ship to Retailer */}
          <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-white to-green-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📤</span>
              <h3 className="text-lg font-semibold">Ship to Retailer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="number"
                  id="shipProductId"
                  placeholder="Enter product ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retailer Address
                </label>
                <input
                  type="text"
                  value={retailerAddress}
                  onChange={(e) => setRetailerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const productId = (document.getElementById('shipProductId') as HTMLInputElement)?.value;
                  if (productId) handleShipToRetailer(Number(productId));
                }}
                disabled={loading || !retailerAddress}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <span>🚚</span>
                <span>{loading ? 'Shipping...' : 'Ship to Retailer'}</span>
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

