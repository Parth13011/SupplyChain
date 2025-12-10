'use client';

import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getProvider, formatAddress } from '@/lib/web3';
import { getUserRegistryContract, UserRole, roleNames } from '@/lib/contracts';
import GovernmentDashboard from '@/components/GovernmentDashboard';
import ManufacturerDashboard from '@/components/ManufacturerDashboard';
import DistributorDashboard from '@/components/DistributorDashboard';
import RetailerDashboard from '@/components/RetailerDashboard';
import CustomerDashboard from '@/components/CustomerDashboard';
import ProductTracker from '@/components/ProductTracker';
import ProductBrowser from '@/components/ProductBrowser';
import AccountSwitcher from '@/components/AccountSwitcher';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.None);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const loadUserRole = useCallback(async (userAddress: string) => {
    try {
      const provider = getProvider();
      if (!provider) {
        console.warn('Provider not available');
        return;
      }

      // Check if contract address is configured
      const userRegistryAddress = process.env.NEXT_PUBLIC_USER_REGISTRY;
      if (!userRegistryAddress) {
        console.error('⚠️ UserRegistry address not configured in .env');
        setUserRole(UserRole.None);
        return;
      }

      const userRegistry = getUserRegistryContract(provider);
      
      // Try to check if user is registered with better error handling
      try {
        const isRegistered = await userRegistry.isUserRegistered(userAddress);
        
        if (isRegistered) {
          const role = await userRegistry.getUserRole(userAddress);
          setUserRole(Number(role));
        } else {
          setUserRole(UserRole.None);
        }
      } catch (contractError: any) {
        // If contract doesn't exist or address is wrong
        if (contractError.code === 'BAD_DATA' || contractError.message?.includes('0x')) {
          console.error('⚠️ Contract not found at address. Please verify:');
          console.error('1. Hardhat node is running: npm run node');
          console.error('2. Contracts are deployed: npm run deploy:local');
          console.error('3. Contract address in .env matches deployment');
          console.error('UserRegistry address:', userRegistryAddress);
        }
        setUserRole(UserRole.None);
      }
    } catch (error: any) {
      console.error('Error loading user role:', error.message || error);
      setUserRole(UserRole.None);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const provider = getProvider();
    if (provider) {
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = await accounts[0].getAddress();
          setAddress(address);
          setConnected(true);
          await loadUserRole(address);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }, [loadUserRole]);

  useEffect(() => {
    checkConnection();

    // Listen for account changes and chain changes in MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          await loadUserRole(accounts[0]);
        } else {
          // User disconnected
          setConnected(false);
          setAddress('');
          setUserRole(UserRole.None);
        }
      };

      const handleChainChanged = async (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // When chain changes, reload user role to ensure everything is in sync
        if (connected && address) {
          await loadUserRole(address);
        }
        // Optionally show a notification to user
        // You can add a toast notification here if needed
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [loadUserRole, checkConnection, connected, address]);


  const handleAccountChange = async (newAddress: string) => {
    setAddress(newAddress);
    await loadUserRole(newAddress);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setConnected(true);
      await loadUserRole(userAddress);
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(error.message || 'Failed to connect wallet. Make sure MetaMask is installed and unlocked.');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case UserRole.Government:
        return <GovernmentDashboard address={address} />;
      case UserRole.Manufacturer:
        return <ManufacturerDashboard address={address} />;
      case UserRole.Distributor:
        return <DistributorDashboard address={address} />;
      case UserRole.Retailer:
        return <RetailerDashboard address={address} />;
      case UserRole.Customer:
        return <CustomerDashboard address={address} />;
      default:
        return (
          <div className="text-center py-12 bg-white rounded-lg shadow p-8">
            <p className="text-xl mb-4 font-semibold">You are not registered in the system.</p>
            <p className="text-gray-600 mb-4">Please contact the Government to register your account.</p>
            <p className="text-sm text-gray-500">
              Government Address: <span className="font-mono">0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86</span>
            </p>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-indigo-600">
              Blockchain Supply Chain Management
            </h1>
            <div className="flex items-center gap-4">
              {connected ? (
                <AccountSwitcher
                  currentAddress={address}
                  currentRole={userRole}
                  onAccountChange={handleAccountChange}
                />
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connected ? (
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm mb-1">Connected Account</p>
                  <p className="text-2xl font-bold">{formatAddress(address)}</p>
                  <p className="text-indigo-100 mt-1">Role: {roleNames[userRole]}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                  <p className="text-xs text-indigo-100">Blockchain Network Active</p>
                </div>
              </div>
            </div>

            {renderDashboard()}
            <ProductBrowser onProductSelect={(productId) => setSelectedProductId(productId)} />
            <ProductTracker 
              userAddress={address} 
              userRole={userRole}
              initialProductId={selectedProductId?.toString()}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Welcome to Supply Chain Management</h2>
            <p className="text-gray-600 mb-8">
              Connect your MetaMask wallet to get started
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

