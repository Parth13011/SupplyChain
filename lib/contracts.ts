import { ethers } from 'ethers';

// These will be available after compilation
let UserRegistryABI: any;
let ProductRegistryABI: any;
let SupplyChainABI: any;

try {
  UserRegistryABI = require('../artifacts/contracts/UserRegistry.sol/UserRegistry.json');
  ProductRegistryABI = require('../artifacts/contracts/ProductRegistry.sol/ProductRegistry.json');
  SupplyChainABI = require('../artifacts/contracts/SupplyChain.sol/SupplyChain.json');
} catch (e) {
  console.warn('Contract ABIs not found. Please compile contracts first: npm run compile');
}

const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY || '';
const PRODUCT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY || '';
const SUPPLY_CHAIN_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN || '';

// Validate contract addresses
if (typeof window !== 'undefined') {
  if (!USER_REGISTRY_ADDRESS || !PRODUCT_REGISTRY_ADDRESS || !SUPPLY_CHAIN_ADDRESS) {
    console.error('⚠️ Contract addresses not configured! Please check your .env file.');
    console.error('USER_REGISTRY:', USER_REGISTRY_ADDRESS || 'MISSING');
    console.error('PRODUCT_REGISTRY:', PRODUCT_REGISTRY_ADDRESS || 'MISSING');
    console.error('SUPPLY_CHAIN:', SUPPLY_CHAIN_ADDRESS || 'MISSING');
  }
}

export const getUserRegistryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  if (!UserRegistryABI || !UserRegistryABI.abi) {
    throw new Error('Contract ABIs not loaded. Please compile contracts first: npm run compile');
  }
  if (!USER_REGISTRY_ADDRESS) {
    throw new Error('UserRegistry address not configured. Please set NEXT_PUBLIC_USER_REGISTRY in .env');
  }
  return new ethers.Contract(
    USER_REGISTRY_ADDRESS,
    UserRegistryABI.abi,
    signerOrProvider
  );
};

export const getProductRegistryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  if (!ProductRegistryABI || !ProductRegistryABI.abi) {
    throw new Error('Contract ABIs not loaded. Please compile contracts first: npm run compile');
  }
  if (!PRODUCT_REGISTRY_ADDRESS) {
    throw new Error('ProductRegistry address not configured. Please set NEXT_PUBLIC_PRODUCT_REGISTRY in .env');
  }
  return new ethers.Contract(
    PRODUCT_REGISTRY_ADDRESS,
    ProductRegistryABI.abi,
    signerOrProvider
  );
};

export const getSupplyChainContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  if (!SupplyChainABI || !SupplyChainABI.abi) {
    throw new Error('Contract ABIs not loaded. Please compile contracts first: npm run compile');
  }
  if (!SUPPLY_CHAIN_ADDRESS) {
    throw new Error('SupplyChain address not configured. Please set NEXT_PUBLIC_SUPPLY_CHAIN in .env');
  }
  return new ethers.Contract(
    SUPPLY_CHAIN_ADDRESS,
    SupplyChainABI.abi,
    signerOrProvider
  );
};

export const formatAddress = (address: string | null | undefined) => {
  if (!address || typeof address !== 'string') return '';
  if (address.length < 10) return address; // Too short to format
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export enum UserRole {
  None = 0,
  Government = 1,
  Manufacturer = 2,
  Distributor = 3,
  Retailer = 4,
  Customer = 5,
}

export enum ProductStatus {
  Created = 0,
  ShippedToDistributor = 1,
  ReceivedByDistributor = 2,
  ShippedToRetailer = 3,
  ReceivedByRetailer = 4,
  SoldToCustomer = 5,
  DeliveredToCustomer = 6,
}

export const roleNames = {
  [UserRole.None]: 'None',
  [UserRole.Government]: 'Government',
  [UserRole.Manufacturer]: 'Manufacturer',
  [UserRole.Distributor]: 'Distributor',
  [UserRole.Retailer]: 'Retailer',
  [UserRole.Customer]: 'Customer',
};

export const statusNames = {
  [ProductStatus.Created]: 'Created',
  [ProductStatus.ShippedToDistributor]: 'Shipped to Distributor',
  [ProductStatus.ReceivedByDistributor]: 'Received by Distributor',
  [ProductStatus.ShippedToRetailer]: 'Shipped to Retailer',
  [ProductStatus.ReceivedByRetailer]: 'Received by Retailer',
  [ProductStatus.SoldToCustomer]: 'Sold to Customer',
  [ProductStatus.DeliveredToCustomer]: 'Delivered to Customer',
};

