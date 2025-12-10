'use client';

import { ProductStatus, statusNames } from '@/lib/contracts';
import { formatAddress } from '@/lib/web3';

interface SupplyChainFlowProps {
  currentStatus: ProductStatus;
  transactions?: any[];
}

export default function SupplyChainFlow({ currentStatus, transactions = [] }: SupplyChainFlowProps) {
  const steps = [
    { status: ProductStatus.Created, label: 'Created', icon: '🏭', color: 'bg-blue-500' },
    { status: ProductStatus.ShippedToDistributor, label: 'Shipped to Distributor', icon: '📦', color: 'bg-yellow-500' },
    { status: ProductStatus.ReceivedByDistributor, label: 'Received by Distributor', icon: '✅', color: 'bg-green-500' },
    { status: ProductStatus.ShippedToRetailer, label: 'Shipped to Retailer', icon: '🚚', color: 'bg-yellow-500' },
    { status: ProductStatus.ReceivedByRetailer, label: 'Received by Retailer', icon: '✅', color: 'bg-green-500' },
    { status: ProductStatus.SoldToCustomer, label: 'Sold to Customer', icon: '🛒', color: 'bg-purple-500' },
    { status: ProductStatus.DeliveredToCustomer, label: 'Delivered', icon: '🎉', color: 'bg-green-600' },
  ];

  const getStepStatus = (stepStatus: ProductStatus) => {
    if (currentStatus === stepStatus) return 'current';
    if (currentStatus > stepStatus) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-6 text-indigo-600">Supply Chain Flow</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${(currentStatus / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.status);
            const isCompleted = stepStatus === 'completed';
            const isCurrent = stepStatus === 'current';
            const isPending = stepStatus === 'pending';

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    isCompleted
                      ? `${step.color} text-white shadow-lg scale-110`
                      : isCurrent
                      ? `${step.color} text-white shadow-lg scale-110 ring-4 ring-indigo-200`
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-block mt-1 px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Details */}
      {transactions.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h4 className="font-semibold mb-4">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions.slice(-3).reverse().map((tx, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded">
                <span className="text-gray-500">{tx.timestamp}</span>
                <span className="font-medium">{statusNames[tx.status]}</span>
                <span className="text-gray-600">
                  {formatAddress(tx.from)} → {formatAddress(tx.to)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

