'use client';

import { useState } from 'react';
import { getProvider } from '@/lib/web3';
import { getUserRegistryContract, UserRole, roleNames } from '@/lib/contracts';

interface GovernmentDashboardProps {
  address: string;
}

export default function GovernmentDashboard({ address }: GovernmentDashboardProps) {
  const [userAddress, setUserAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Manufacturer);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegisterUser = async () => {
    if (!userAddress || !userName) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const signer = await provider.getSigner();
      const userRegistry = getUserRegistryContract(signer);

      const tx = await userRegistry.registerUser(userAddress, selectedRole, userName);
      await tx.wait();

      setMessage(`Successfully registered ${userName} as ${roleNames[selectedRole]}`);
      setUserAddress('');
      setUserName('');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to register user'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
          🏛️
        </div>
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">Government Dashboard</h2>
          <p className="text-sm text-gray-500">Register and manage users in the system</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center gap-2">
            <span>👤</span>
            <span>Register New User</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Wallet Address
              </label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User/Organization Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter user or organization name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(Number(e.target.value) as UserRole)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value={UserRole.Manufacturer}>🏭 Manufacturer</option>
                <option value={UserRole.Distributor}>🚚 Distributor</option>
                <option value={UserRole.Retailer}>🏪 Retailer</option>
                <option value={UserRole.Customer}>👤 Customer</option>
              </select>
            </div>

            <button
              onClick={handleRegisterUser}
              disabled={loading || !userAddress || !userName}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              <span>✅</span>
              <span>{loading ? 'Registering...' : 'Register User'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border-2 ${
            message.includes('Error') 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{message.includes('Error') ? '❌' : '✅'}</span>
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

