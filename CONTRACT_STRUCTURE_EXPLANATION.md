# Smart Contract Structure & Functions

## ✅ Deployment Status

**All contracts successfully deployed to DIDLab Network!**

- **Network:** https://eth.didlab.org
- **Chain ID:** 252501
- **Explorer:** https://explorer.didlab.org

### Contract Addresses:

1. **UserRegistry:** `0xCB4d0df4f7631eC70ad66D02269ef3f944404e34`
   - [View on Explorer](https://explorer.didlab.org/address/0xCB4d0df4f7631eC70ad66D02269ef3f944404e34)

2. **ProductRegistry:** `0x066669570E938881d61fD6bf3b325E382fA0F23a`
   - [View on Explorer](https://explorer.didlab.org/address/0x066669570E938881d61fD6bf3b325E382fA0F23a)

3. **SupplyChain:** `0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa`
   - [View on Explorer](https://explorer.didlab.org/address/0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa)

**Government Account (Deployer):** `0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`

---

## 📋 Contract Structure

### Yes! Your contracts have the same structure:

**Roles:**
- ✅ **Government** - Controls user registration
- ✅ **Manufacturer** - Creates products (like "Vendor")
- ✅ **Distributor** - Receives from manufacturer, ships to retailer
- ✅ **Retailer** - Receives from distributor, sells to customers
- ✅ **Customer** - Final recipient

**Flow:** Manufacturer → Distributor → Retailer → Customer

---

## 🔍 Detailed Contract Functions

### 1. **UserRegistry Contract**

**Purpose:** Manages user roles and registration in the system.

**Key Functions:**

#### `registerUser(address _user, UserRole _role, string _name)`
- **Who can call:** Only Government
- **What it does:** Registers a new user with a specific role
- **Roles:** Government (1), Manufacturer (2), Distributor (3), Retailer (4), Customer (5)
- **Example:** Government registers a Manufacturer with address `0x123...` and name "ABC Corp"

#### `updateUserRole(address _user, UserRole _newRole)`
- **Who can call:** Only Government
- **What it does:** Changes a user's role
- **Example:** Change a user from Distributor to Retailer

#### `getUserRole(address _user)`
- **Who can call:** Anyone
- **What it does:** Returns the role of a user
- **Returns:** 0=None, 1=Government, 2=Manufacturer, 3=Distributor, 4=Retailer, 5=Customer

#### `isUserRegistered(address _user)`
- **Who can call:** Anyone
- **What it does:** Checks if a user is registered
- **Returns:** true/false

#### `getUsersByRole(UserRole _role)`
- **Who can call:** Anyone
- **What it does:** Gets all addresses with a specific role
- **Example:** Get all Manufacturer addresses

---

### 2. **ProductRegistry Contract**

**Purpose:** Manages product creation and tracking.

**Key Functions:**

#### `createProduct(string _name, string _description, string _metadata)`
- **Who can call:** Only registered Manufacturers
- **What it does:** Creates a new product with unique ID
- **Returns:** Product ID (uint256)
- **Example:** Manufacturer creates "Laptop Model X" with description and metadata
- **Stores:** Product name, description, metadata (IPFS hash), manufacturer address, creation timestamp

#### `getProduct(uint256 _productId)`
- **Who can call:** Anyone
- **What it does:** Gets full product information
- **Returns:** Product struct (id, name, description, metadata, manufacturer, createdAt)

#### `getProductsByManufacturer(address _manufacturer)`
- **Who can call:** Anyone
- **What it does:** Gets all product IDs created by a manufacturer
- **Returns:** Array of product IDs

#### `productExists(uint256 _productId)`
- **Who can call:** Anyone
- **What it does:** Checks if a product exists
- **Returns:** true/false

---

### 3. **SupplyChain Contract**

**Purpose:** Tracks product movement through the supply chain.

**Product Status Flow:**
1. **Created** - Product created by Manufacturer
2. **ShippedToDistributor** - Manufacturer ships to Distributor
3. **ReceivedByDistributor** - Distributor confirms receipt
4. **ShippedToRetailer** - Distributor ships to Retailer
5. **ReceivedByRetailer** - Retailer confirms receipt
6. **SoldToCustomer** - Retailer sells to Customer
7. **DeliveredToCustomer** - Customer confirms delivery

**Key Functions:**

#### `shipToDistributor(uint256 _productId, address _distributor, string _metadata)`
- **Who can call:** Only the Manufacturer who created the product
- **What it does:** Manufacturer ships product to a Distributor
- **Requirements:** 
  - Product must exist
  - Product status must be "Created"
  - Distributor address must be a registered Distributor
- **Example:** Manufacturer ships product #1 to Distributor at `0x456...`

#### `receiveFromManufacturer(uint256 _productId, string _metadata)`
- **Who can call:** Only registered Distributor
- **What it does:** Distributor confirms receiving product from Manufacturer
- **Requirements:** 
  - Product must be in "ShippedToDistributor" status
  - Must be shipped to this Distributor's address
- **Example:** Distributor confirms receipt of product #1

#### `shipToRetailer(uint256 _productId, address _retailer, string _metadata)`
- **Who can call:** Only registered Distributor
- **What it does:** Distributor ships product to a Retailer
- **Requirements:** 
  - Product must be in "ReceivedByDistributor" status
  - Retailer address must be a registered Retailer
- **Example:** Distributor ships product #1 to Retailer at `0x789...`

#### `receiveFromDistributor(uint256 _productId, string _metadata)`
- **Who can call:** Only registered Retailer
- **What it does:** Retailer confirms receiving product from Distributor
- **Requirements:** 
  - Product must be in "ShippedToRetailer" status
  - Must be shipped to this Retailer's address
- **Example:** Retailer confirms receipt of product #1

#### `sellToCustomer(uint256 _productId, address _customer, string _metadata)`
- **Who can call:** Only registered Retailer
- **What it does:** Retailer sells product to a Customer
- **Requirements:** 
  - Product must be in "ReceivedByRetailer" status
  - Customer address must be a registered Customer
- **Example:** Retailer sells product #1 to Customer at `0xabc...`

#### `confirmDelivery(uint256 _productId, string _metadata)`
- **Who can call:** Only registered Customer
- **What it does:** Customer confirms final delivery
- **Requirements:** 
  - Product must be in "SoldToCustomer" status
  - Must be sold to this Customer's address
- **Example:** Customer confirms delivery of product #1

#### `getProductHistory(uint256 _productId)`
- **Who can call:** Anyone
- **What it does:** Gets complete transaction history of a product
- **Returns:** Array of all transactions for the product
- **Example:** See all movements of product #1 from creation to delivery

#### `getProductStatus(uint256 _productId)`
- **Who can call:** Anyone
- **What it does:** Gets current status of a product
- **Returns:** ProductStatus enum (0-6)
- **Example:** Check if product #1 is "ReceivedByRetailer"

#### `getTransaction(uint256 _transactionId)`
- **Who can call:** Anyone
- **What it does:** Gets details of a specific transaction
- **Returns:** Transaction struct (id, productId, from, to, status, metadata, timestamp)

---

## 🔄 Complete Workflow Example

1. **Government** registers users:
   - Register Manufacturer: `0xM...`
   - Register Distributor: `0xD...`
   - Register Retailer: `0xR...`
   - Register Customer: `0xC...`

2. **Manufacturer** creates product:
   - `createProduct("Laptop", "Gaming laptop", "ipfs://...")` → Returns Product ID #1

3. **Manufacturer** ships to Distributor:
   - `shipToDistributor(1, 0xD..., "Shipment metadata")` → Status: ShippedToDistributor

4. **Distributor** receives:
   - `receiveFromManufacturer(1, "Received metadata")` → Status: ReceivedByDistributor

5. **Distributor** ships to Retailer:
   - `shipToRetailer(1, 0xR..., "Shipment metadata")` → Status: ShippedToRetailer

6. **Retailer** receives:
   - `receiveFromDistributor(1, "Received metadata")` → Status: ReceivedByRetailer

7. **Retailer** sells to Customer:
   - `sellToCustomer(1, 0xC..., "Sale metadata")` → Status: SoldToCustomer

8. **Customer** confirms delivery:
   - `confirmDelivery(1, "Delivery confirmed")` → Status: DeliveredToCustomer

9. **Anyone** can track:
   - `getProductHistory(1)` → See complete journey
   - `getProductStatus(1)` → See current status

---

## ✅ Verification

All contracts are deployed and working on the DIDLab network. You can:

1. **View on Explorer:**
   - Check contract code
   - See transactions
   - View events
   - Check contract state

2. **Test via Frontend:**
   - Connect MetaMask to Chain ID 252501
   - Use the deployed contract addresses
   - Start registering users and creating products!

3. **Test via Scripts:**
   - Use Hardhat scripts to interact with contracts
   - Check deployment status

---

## 📝 Next Steps

1. **Update .env file** with the new contract addresses
2. **Connect MetaMask** to Chain ID 252501 (didlab.org)
3. **Register users** using the Government account
4. **Start testing** the supply chain flow!



