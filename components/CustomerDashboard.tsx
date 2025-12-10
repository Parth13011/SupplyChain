'use client';

import { useState } from 'react';
import { getProvider } from '@/lib/web3';
import { getSupplyChainContract } from '@/lib/contracts';

interface CustomerDashboardProps {
  address: string;
}

export default function CustomerDashboard({ address }: CustomerDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirmDelivery = async (productId: number) => {
    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const supplyChain = getSupplyChainContract(signer);

      const tx = await supplyChain.confirmDelivery(productId, '');
      await tx.wait();

      setMessage('Delivery confirmed successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to confirm delivery'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          👤
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Customer Dashboard</h2>
          <p className="text-sm text-gray-500">Track and confirm product delivery</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">ℹ️</span>
            <h3 className="text-lg font-semibold text-purple-900">Instructions</h3>
          </div>
          <p className="text-sm text-purple-700">
            Use the Product Tracker below to view products you've purchased, then confirm delivery here.
          </p>
        </div>
        
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎉</span>
            <h3 className="text-lg font-semibold">Confirm Product Delivery</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID
              </label>
              <input
                type="number"
                id="confirmProductId"
                placeholder="Enter product ID you received"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={() => {
                const productId = (document.getElementById('confirmProductId') as HTMLInputElement)?.value;
                if (productId) handleConfirmDelivery(Number(productId));
              }}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-lg"
            >
              <span>✅</span>
              <span>{loading ? 'Confirming...' : 'Confirm Delivery'}</span>
            </button>
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

