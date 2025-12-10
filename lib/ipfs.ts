/**
 * IPFS Utility Service
 * Handles uploading files and metadata to IPFS
 */

// Get IPFS configuration from environment variables
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.didlab.org';
const IPFS_API = process.env.NEXT_PUBLIC_IPFS_API || 'https://ipfs.didlab.org/api/v0';

// Initialize IPFS client (lazy load to avoid SSR issues)
let ipfsClient: any = null;
let ipfsClientPromise: Promise<any> | null = null;

/**
 * Get or create IPFS client instance (lazy loaded)
 */
async function getIPFSClient() {
  if (ipfsClient) {
    return ipfsClient;
  }

  if (ipfsClientPromise) {
    return ipfsClientPromise;
  }

  ipfsClientPromise = (async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { create } = await import('ipfs-http-client');
      ipfsClient = create({
        url: IPFS_API,
      });
      return ipfsClient;
    } catch (error) {
      console.error('Failed to create IPFS client:', error);
      ipfsClientPromise = null;
      throw new Error(`Failed to connect to IPFS gateway: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  })();

  return ipfsClientPromise;
}

/**
 * Upload a single file to IPFS
 * @param file File object to upload
 * @param onProgress Optional progress callback (0-100)
 * @returns IPFS CID (hash)
 */
export async function uploadFileToIPFS(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const ipfs = await getIPFSClient();
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Upload to IPFS
    onProgress?.(50);
    const result = await ipfs.add(fileBuffer, {
      pin: true,
      progress: (bytes: number) => {
        if (file.size > 0) {
          const progress = Math.min(100, Math.round((bytes / file.size) * 50));
          onProgress?.(progress);
        }
      },
    });
    
    onProgress?.(100);
    
    // Return CID as string
    return result.cid.toString();
  } catch (error: any) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload file to IPFS: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to IPFS
 * @param files Array of File objects
 * @param onProgress Optional progress callback (0-100)
 * @returns Array of IPFS CIDs
 */
export async function uploadFilesToIPFS(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<string[]> {
  try {
    const cids: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (fileProgressValue: number) => {
        const overallProgress = ((i / files.length) * 100) + (fileProgressValue / files.length);
        onProgress?.(Math.min(100, overallProgress));
      };
      
      const cid = await uploadFileToIPFS(file, fileProgress);
      cids.push(cid);
    }
    
    onProgress?.(100);
    return cids;
  } catch (error: any) {
    console.error('IPFS multi-upload error:', error);
    throw new Error(`Failed to upload files to IPFS: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata JSON object to upload
 * @param onProgress Optional progress callback (0-100)
 * @returns IPFS CID (hash)
 */
export async function uploadMetadataToIPFS(
  metadata: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const ipfs = await getIPFSClient();
    
    // Convert metadata to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);
    const jsonBuffer = new TextEncoder().encode(jsonString);
    
    onProgress?.(50);
    
    // Upload to IPFS
    const result = await ipfs.add(jsonBuffer, {
      pin: true,
    });
    
    onProgress?.(100);
    
    return result.cid.toString();
  } catch (error: any) {
    console.error('IPFS metadata upload error:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid IPFS CID (hash)
 * @returns Full URL to access the file via gateway
 */
export function getIPFSGatewayURL(cid: string): string {
  // Remove ipfs:// prefix if present
  const cleanCid = cid.replace(/^ipfs:\/\//, '');
  return `${IPFS_GATEWAY}/ipfs/${cleanCid}`;
}

/**
 * Check if a string is a valid IPFS CID
 * @param str String to check
 * @returns true if it looks like an IPFS CID
 */
export function isIPFSCID(str: string): boolean {
  // IPFS CIDs typically start with Qm (v0) or are base58/base32 encoded (v1)
  // This is a simple check - you might want to use a library for validation
  return /^[Qm][a-zA-Z0-9]{43,}$/.test(str) || /^[a-z0-9]{46,}$/.test(str) || str.startsWith('ipfs://');
}

/**
 * Format IPFS hash for display
 * @param cid IPFS CID
 * @returns Formatted string (first 10 chars...last 6 chars)
 */
export function formatIPFSHash(cid: string): string {
  const cleanCid = cid.replace(/^ipfs:\/\//, '');
  if (cleanCid.length <= 16) return cleanCid;
  return `${cleanCid.slice(0, 10)}...${cleanCid.slice(-6)}`;
}

