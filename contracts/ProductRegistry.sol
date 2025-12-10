// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserRegistry.sol";

/**
 * @title ProductRegistry
 * @dev Manages unique product identities
 */
contract ProductRegistry {
    UserRegistry public userRegistry;

    struct Product {
        uint256 productId;
        string name;
        string description;
        string metadata; // IPFS hash or JSON string
        address manufacturer;
        uint256 createdAt;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public productsByManufacturer;
    uint256 public productCounter;

    event ProductCreated(
        uint256 indexed productId,
        address indexed manufacturer,
        string name,
        uint256 timestamp
    );

    modifier onlyManufacturer() {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Manufacturer,
            "Only Manufacturer can perform this action"
        );
        _;
    }

    modifier onlyRegistered() {
        require(
            userRegistry.isUserRegistered(msg.sender),
            "User not registered"
        );
        _;
    }

    constructor(address _userRegistryAddress) {
        userRegistry = UserRegistry(_userRegistryAddress);
        productCounter = 0;
    }

    /**
     * @dev Create a new product with unique ID
     * @param _name Product name
     * @param _description Product description
     * @param _metadata Additional metadata (IPFS hash or JSON)
     * @return productId Unique product identifier
     */
    function createProduct(
        string memory _name,
        string memory _description,
        string memory _metadata
    ) public onlyManufacturer onlyRegistered returns (uint256) {
        productCounter++;
        uint256 newProductId = productCounter;

        products[newProductId] = Product({
            productId: newProductId,
            name: _name,
            description: _description,
            metadata: _metadata,
            manufacturer: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        productsByManufacturer[msg.sender].push(newProductId);

        emit ProductCreated(newProductId, msg.sender, _name, block.timestamp);
        return newProductId;
    }

    /**
     * @dev Get product information
     * @param _productId Product ID
     * @return Product struct
     */
    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(products[_productId].exists, "Product does not exist");
        return products[_productId];
    }

    /**
     * @dev Get all products by manufacturer
     * @param _manufacturer Manufacturer address
     * @return uint256[] Array of product IDs
     */
    function getProductsByManufacturer(
        address _manufacturer
    ) public view returns (uint256[] memory) {
        return productsByManufacturer[_manufacturer];
    }

    /**
     * @dev Check if product exists
     * @param _productId Product ID
     * @return bool
     */
    function productExists(uint256 _productId) public view returns (bool) {
        return products[_productId].exists;
    }

    /**
     * @dev Get total product count
     * @return uint256
     */
    function getTotalProducts() public view returns (uint256) {
        return productCounter;
    }

    /**
     * @dev Get all products (for browsing/searching)
     * @return Product[] Array of all products
     */
    function getAllProducts() public view returns (Product[] memory) {
        uint256 total = productCounter;
        Product[] memory allProducts = new Product[](total);
        
        for (uint256 i = 1; i <= total; i++) {
            if (products[i].exists) {
                allProducts[i - 1] = products[i];
            }
        }
        
        return allProducts;
    }
}

