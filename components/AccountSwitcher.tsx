'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllAccounts, formatAddress } from '@/lib/web3';
import { getUserRegistryContract, UserRole, roleNames } from '@/lib/contracts';

interface AccountSwitcherProps {
  currentAddress: string;
  currentRole: UserRole;
  onAccountChange: (address: string) => void;
}

export default function AccountSwitcher({ currentAddress, currentRole, onAccountChange }: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [accountRoles, setAccountRoles] = useState<Record<string, UserRole>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAccounts();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadAccounts = async () => {
    try {
      const allAccounts = await getAllAccounts();
      setAccounts(allAccounts);

      // Load roles for each account
      const roles: Record<string, UserRole> = {};
      const { getProvider } = await import('@/lib/web3');
      const provider = getProvider();

      if (provider) {
        for (const account of allAccounts) {
          try {
            const userRegistry = getUserRegistryContract(provider);
            const isRegistered = await userRegistry.isUserRegistered(account);
            if (isRegistered) {
              const role = await userRegistry.getUserRole(account);
              roles[account.toLowerCase()] = Number(role);
            } else {
              roles[account.toLowerCase()] = UserRole.None;
            }
          } catch (error) {
            roles[account.toLowerCase()] = UserRole.None;
          }
        }
      }

      setAccountRoles(roles);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleAccountSwitch = async (address: string) => {
    if (address.toLowerCase() === currentAddress.toLowerCase()) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(false);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check if the account is already available
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        const accountExists = accounts.some(
          (acc: string) => acc.toLowerCase() === address.toLowerCase()
        );

        if (accountExists && accounts[0]?.toLowerCase() === address.toLowerCase()) {
          // Account is already the primary account
          onAccountChange(address);
          setLoading(false);
          return;
        }

        // Request permissions which will open MetaMask
        // User will need to select the account in MetaMask
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });

        // Get the current account after permission request
        const newAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (newAccounts && newAccounts.length > 0) {
          const selectedAccount = newAccounts[0];
          if (selectedAccount.toLowerCase() === address.toLowerCase()) {
            onAccountChange(selectedAccount);
          } else {
            // The user selected a different account or needs to switch in MetaMask
            // The accountsChanged event will handle the update when they switch
            console.log('Please select the account in MetaMask. The page will update automatically.');
          }
        }
      }
    } catch (error: any) {
      console.error('Error switching account:', error);
      // User might have rejected or there was an error
      // The accountsChanged event will still fire if they switch manually
      if (error.code !== 4001) { // Not a user rejection
        console.log('If the account doesn\'t switch, please switch manually in MetaMask.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadAccounts();
          }
        }}
        className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
        disabled={loading}
      >
        <div className="text-left">
          <p className="font-semibold text-sm text-gray-900">{formatAddress(currentAddress)}</p>
          <p className="text-xs text-gray-600">{roleNames[currentRole]}</p>
        </div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Switch Account
            </div>
            {accounts.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No accounts found. Add accounts in MetaMask.
              </div>
            ) : (
              accounts.map((account) => {
                const accountRole = accountRoles[account.toLowerCase()] || UserRole.None;
                const isCurrent = account.toLowerCase() === currentAddress.toLowerCase();

                return (
                  <button
                    key={account}
                    onClick={() => handleAccountSwitch(account)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'hover:bg-gray-50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={loading || isCurrent}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900">
                            {formatAddress(account)}
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {roleNames[accountRole]}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-3 py-2 text-xs text-gray-500">
                💡 Tip: Add more accounts in MetaMask to see them here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

