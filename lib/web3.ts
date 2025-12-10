import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// DIDLab Network Configuration
// Chain ID: 252501 (decimal) = 0x3d9f5 (hex)
// MetaMask requires hex format - must match exactly what RPC returns
const DIDLAB_CHAIN_ID_DECIMAL = 252501;
const DIDLAB_CHAIN_ID = '0x' + DIDLAB_CHAIN_ID_DECIMAL.toString(16); // Convert to hex: 0x3d9f5

const DIDLAB_NETWORK = {
  chainId: DIDLAB_CHAIN_ID, // Must be hex string matching RPC response
  chainName: 'DIDLab Besu (LabNet)',
  nativeCurrency: {
    name: 'TT',
    symbol: 'TT',
    decimals: 18,
  },
  rpcUrls: ['https://eth.didlab.org'],
  blockExplorerUrls: ['https://explorer.didlab.org'],
};

export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    return new ethers.BrowserProvider(window.ethereum);
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
};

export const getCurrentChainId = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return chainId as string;
  } catch (error) {
    console.error('Error getting current chain ID:', error);
    return null;
  }
};

// Verify chain ID from RPC endpoint before adding network
export const verifyRpcChainId = async (rpcUrl: string, expectedChainId: number): Promise<boolean> => {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.result) {
      const rpcChainId = parseInt(data.result, 16);
      return rpcChainId === expectedChainId;
    }
    return false;
  } catch (error) {
    console.error('Error verifying RPC chain ID:', error);
    return false;
  }
};

export const ensureNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // First, check if we're already on the correct chain
    const currentChainId = await getCurrentChainId();
    
    // Normalize chain IDs for comparison (handle both hex with and without 0x prefix)
    const normalizeChainId = (id: string | null): string | null => {
      if (!id) return null;
      // Remove 0x prefix if present, then add it back consistently
      const cleanId = id.startsWith('0x') ? id.slice(2) : id;
      return '0x' + cleanId.toLowerCase();
    };

    const normalizedCurrent = normalizeChainId(currentChainId);
    const normalizedTarget = normalizeChainId(DIDLAB_CHAIN_ID);

    // If already on the correct chain, don't switch
    if (normalizedCurrent === normalizedTarget) {
      console.log('Already on the correct network (DIDLab)');
      return;
    }

    // Try to switch to DIDLab network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: DIDLAB_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // If user rejected the switch, don't throw - just return
    if (switchError.code === 4001) {
      throw new Error('Network switch was rejected. Please switch to DIDLab network manually in MetaMask.');
    }
    
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        // Verify RPC chain ID matches before adding (optional check - if it fails, we'll still try)
        const rpcUrl = DIDLAB_NETWORK.rpcUrls[0];
        try {
          const isValid = await verifyRpcChainId(rpcUrl, DIDLAB_CHAIN_ID_DECIMAL);
          if (!isValid) {
            console.warn(`Warning: RPC chain ID verification failed. The RPC might return a different chain ID. Proceeding anyway...`);
            // Don't throw here - let MetaMask handle the validation
          }
        } catch (verifyError) {
          // If verification fails (CORS, network error, etc.), continue anyway
          // MetaMask will do its own validation
          console.warn('Could not verify RPC chain ID, but proceeding with network addition:', verifyError);
        }

        // Ensure chain ID is properly formatted as hex string
        // MetaMask requires: chainId must be 252501 (decimal) = 0x3d9f5 (hex)
        // The format must match exactly what the RPC endpoint returns
        const networkConfig = {
          chainId: DIDLAB_CHAIN_ID, // Hex format: 0x3d9f5 (must match RPC response exactly)
          chainName: DIDLAB_NETWORK.chainName,
          nativeCurrency: DIDLAB_NETWORK.nativeCurrency,
          rpcUrls: DIDLAB_NETWORK.rpcUrls,
          blockExplorerUrls: DIDLAB_NETWORK.blockExplorerUrls,
        };

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      } catch (addError: any) {
        // If user rejected adding the network
        if (addError.code === 4001) {
          throw new Error('Network addition was rejected. Please add DIDLab network manually in MetaMask.');
        }
        
        // Check for chain ID mismatch error (MetaMask's specific error)
        if (addError.message?.includes('Chain ID returned') || 
            addError.message?.includes('chain id must be') ||
            addError.message?.includes('does not match')) {
          throw new Error(
            `Chain ID mismatch error: MetaMask detected that the RPC endpoint (https://eth.didlab.org) ` +
            `returns a different chain ID than expected (252501). ` +
            `This usually means:\n` +
            `1. The RPC endpoint is misconfigured\n` +
            `2. The network is temporarily unavailable\n` +
            `3. There's a network configuration issue\n\n` +
            `Please verify the RPC endpoint is correct and try again. ` +
            `If the problem persists, contact the network administrator.`
          );
        }
        
        // Check if it's a duplicate network error
        if (addError.message?.includes('same RPC endpoint') || addError.message?.includes('existing network')) {
          throw new Error('A DIDLab network already exists in MetaMask. Please remove it first: MetaMask Settings > Networks > Find "DIDLab" network > Click ⋮ > Delete. Then refresh and try again.');
        }
        
        // Provide more helpful error message
        const errorMsg = addError.message || 'Failed to add DIDLab network to MetaMask';
        throw new Error(`${errorMsg}. If you have an old DIDLab network, please remove it from MetaMask Settings > Networks first.`);
      }
    } else {
      throw switchError;
    }
  }
};

export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access first (this doesn't change chain)
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Check if we're on the correct network, but don't force switch
    // Only ensure network is available, not force switch
    const currentChainId = await getCurrentChainId();
    const normalizeChainId = (id: string | null): string | null => {
      if (!id) return null;
      const cleanId = id.startsWith('0x') ? id.slice(2) : id;
      return '0x' + cleanId.toLowerCase();
    };

    const normalizedCurrent = normalizeChainId(currentChainId);
    const normalizedTarget = normalizeChainId(DIDLAB_CHAIN_ID);

    // Only ensure network if we're not on the correct chain
    // This way we don't force a switch if user is already connected
    if (normalizedCurrent !== normalizedTarget) {
      // Try to ensure network, but don't fail if user rejects
      try {
        await ensureNetwork();
      } catch (networkError: any) {
        // If user rejects network switch, warn but don't fail connection
        if (networkError.message?.includes('rejected')) {
          console.warn('Network switch rejected, but connection continues');
        } else {
          // For other errors, still throw
          throw networkError;
        }
      }
    }
    
    const provider = getProvider();
    if (!provider) {
      throw new Error('Failed to initialize provider. Please refresh the page and try again.');
    }
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { address, provider, signer };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getNetwork = async () => {
  const provider = getProvider();
  if (!provider) {
    return null;
  }

  try {
    const network = await provider.getNetwork();
    return network;
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

export const isOnCorrectNetwork = async (): Promise<boolean> => {
  const currentChainId = await getCurrentChainId();
  if (!currentChainId) return false;

  const normalizeChainId = (id: string): string => {
    const cleanId = id.startsWith('0x') ? id.slice(2) : id;
    return '0x' + cleanId.toLowerCase();
  };

  return normalizeChainId(currentChainId) === normalizeChainId(DIDLAB_CHAIN_ID);
};

export const switchNetwork = async (chainId: string) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      throw new Error('Please add the network to MetaMask first');
    }
    throw switchError;
  }
};

export const formatAddress = (address: string | null | undefined) => {
  if (!address || typeof address !== 'string') return '';
  if (address.length < 10) return address; // Too short to format
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getAllAccounts = async (): Promise<string[]> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    // Ensure accounts is an array
    if (Array.isArray(accounts)) {
      return accounts;
    }
    return [];
  } catch (error) {
    console.error('Error getting all accounts:', error);
    return [];
  }
};

export const switchAccount = async (address: string): Promise<void> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address provided');
  }

  try {
    // Request account access to ensure we can switch
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // MetaMask doesn't have a direct API to switch accounts,
    // but we can check if the account is in the list and use wallet_switchEthereumChain
    // The actual switching happens when MetaMask prompts the user
    // We'll rely on the accountsChanged event to detect the switch
    
    // Alternative: We can use wallet_requestPermissions to request specific account
    // But the standard way is to prompt user via MetaMask UI
    // The app will detect the change via accountsChanged event
  } catch (error) {
    console.error('Error switching account:', error);
    throw error;
  }
};

