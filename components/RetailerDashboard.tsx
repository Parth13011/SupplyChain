'use client';

import { useState } from 'react';
import { getProvider } from '@/lib/web3';
import { getSupplyChainContract } from '@/lib/contracts';

interface RetailerDashboardProps {
  address: string;
}

export default function RetailerDashboard({ address }: RetailerDashboardProps) {
  const [customerAddress, setCustomerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReceiveFromDistributor = async (productId: number) => {
    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.receiveFromDistributor(productId, '');
      await tx.wait();

      setMessage('Product received successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to receive product'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSellToCustomer = async (productId: number) => {
    if (!customerAddress) {
      setMessage('Please enter customer address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.sellToCustomer(productId, customerAddress, '');
      await tx.wait();

      setMessage('Product sold to customer successfully!');
      setCustomerAddress('');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to sell product'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          🏪
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Retailer Dashboard</h2>
          <p className="text-sm text-gray-500">Receive products and sell to customers</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Receive from Distributor */}
          <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📥</span>
              <h3 className="text-lg font-semibold">Receive from Distributor</h3>
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
                  if (productId) handleReceiveFromDistributor(Number(productId));
                }}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>{loading ? 'Processing...' : 'Receive Product'}</span>
              </button>
            </div>
          </div>

          {/* Sell to Customer */}
          <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-white to-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛒</span>
              <h3 className="text-lg font-semibold">Sell to Customer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="number"
                  id="sellProductId"
                  placeholder="Enter product ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const productId = (document.getElementById('sellProductId') as HTMLInputElement)?.value;
                  if (productId) handleSellToCustomer(Number(productId));
                }}
                disabled={loading || !customerAddress}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <span>💰</span>
                <span>{loading ? 'Processing...' : 'Sell to Customer'}</span>
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

