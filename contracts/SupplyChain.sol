// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserRegistry.sol";
import "./ProductRegistry.sol";

/**
 * @title SupplyChain
 * @dev Tracks product flow through the supply chain
 * Flow: Manufacturer -> Distributor -> Retailer -> Customer
 */
contract SupplyChain {
    UserRegistry public userRegistry;
    ProductRegistry public productRegistry;

    enum ProductStatus {
        Created,
        ShippedToDistributor,
        ReceivedByDistributor,
        ShippedToRetailer,
        ReceivedByRetailer,
        SoldToCustomer,
        DeliveredToCustomer
    }

    struct Transaction {
        uint256 transactionId;
        uint256 productId;
        address from;
        address to;
        ProductStatus status;
        string metadata; // IPFS hash or additional info
        uint256 timestamp;
        bool exists;
    }

    struct ProductHistory {
        uint256 productId;
        Transaction[] transactions;
    }

    mapping(uint256 => ProductHistory) public productHistories;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => ProductStatus) public productStatuses;
    uint256 public transactionCounter;

    event TransactionCreated(
        uint256 indexed transactionId,
        uint256 indexed productId,
        address indexed from,
        address to,
        ProductStatus status,
        uint256 timestamp
    );

    modifier onlyRegistered() {
        require(
            userRegistry.isUserRegistered(msg.sender),
            "User not registered"
        );
        _;
    }

    modifier validProduct(uint256 _productId) {
        require(
            productRegistry.productExists(_productId),
            "Product does not exist"
        );
        _;
    }

    constructor(address _userRegistryAddress, address _productRegistryAddress) {
        userRegistry = UserRegistry(_userRegistryAddress);
        productRegistry = ProductRegistry(_productRegistryAddress);
        transactionCounter = 0;
    }

    /**
     * @dev Manufacturer ships product to distributor
     */
    function shipToDistributor(
        uint256 _productId,
        address _distributor,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Manufacturer,
            "Only Manufacturer can ship to distributor"
        );
        require(
            userRegistry.getUserRole(_distributor) == UserRegistry.UserRole.Distributor,
            "Invalid distributor address"
        );
        require(
            productRegistry.getProduct(_productId).manufacturer == msg.sender,
            "Only product manufacturer can ship"
        );
        require(
            productStatuses[_productId] == ProductStatus.Created,
            "Product already shipped"
        );

        _createTransaction(
            _productId,
            msg.sender,
            _distributor,
            ProductStatus.ShippedToDistributor,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.ShippedToDistributor;
    }

    /**
     * @dev Distributor receives product from manufacturer
     */
    function receiveFromManufacturer(
        uint256 _productId,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Distributor,
            "Only Distributor can receive from manufacturer"
        );

        ProductHistory storage history = productHistories[_productId];
        require(history.transactions.length > 0, "No shipment found");
        
        Transaction memory lastTransaction = history.transactions[history.transactions.length - 1];
        require(
            lastTransaction.to == msg.sender &&
            lastTransaction.status == ProductStatus.ShippedToDistributor,
            "Invalid transaction"
        );

        _createTransaction(
            _productId,
            lastTransaction.from,
            msg.sender,
            ProductStatus.ReceivedByDistributor,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.ReceivedByDistributor;
    }

    /**
     * @dev Distributor ships product to retailer
     */
    function shipToRetailer(
        uint256 _productId,
        address _retailer,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Distributor,
            "Only Distributor can ship to retailer"
        );
        require(
            userRegistry.getUserRole(_retailer) == UserRegistry.UserRole.Retailer,
            "Invalid retailer address"
        );
        require(
            productStatuses[_productId] == ProductStatus.ReceivedByDistributor,
            "Product not received by distributor"
        );

        _createTransaction(
            _productId,
            msg.sender,
            _retailer,
            ProductStatus.ShippedToRetailer,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.ShippedToRetailer;
    }

    /**
     * @dev Retailer receives product from distributor
     */
    function receiveFromDistributor(
        uint256 _productId,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Retailer,
            "Only Retailer can receive from distributor"
        );

        ProductHistory storage history = productHistories[_productId];
        require(history.transactions.length > 0, "No shipment found");
        
        Transaction memory lastTransaction = history.transactions[history.transactions.length - 1];
        require(
            lastTransaction.to == msg.sender &&
            lastTransaction.status == ProductStatus.ShippedToRetailer,
            "Invalid transaction"
        );

        _createTransaction(
            _productId,
            lastTransaction.from,
            msg.sender,
            ProductStatus.ReceivedByRetailer,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.ReceivedByRetailer;
    }

    /**
     * @dev Retailer sells product to customer
     */
    function sellToCustomer(
        uint256 _productId,
        address _customer,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Retailer,
            "Only Retailer can sell to customer"
        );
        require(
            userRegistry.getUserRole(_customer) == UserRegistry.UserRole.Customer,
            "Invalid customer address"
        );
        require(
            productStatuses[_productId] == ProductStatus.ReceivedByRetailer,
            "Product not received by retailer"
        );

        _createTransaction(
            _productId,
            msg.sender,
            _customer,
            ProductStatus.SoldToCustomer,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.SoldToCustomer;
    }

    /**
     * @dev Customer confirms delivery
     */
    function confirmDelivery(
        uint256 _productId,
        string memory _metadata
    ) public onlyRegistered validProduct(_productId) {
        require(
            userRegistry.getUserRole(msg.sender) == UserRegistry.UserRole.Customer,
            "Only Customer can confirm delivery"
        );

        ProductHistory storage history = productHistories[_productId];
        require(history.transactions.length > 0, "No transaction found");
        
        Transaction memory lastTransaction = history.transactions[history.transactions.length - 1];
        require(
            lastTransaction.to == msg.sender &&
            lastTransaction.status == ProductStatus.SoldToCustomer,
            "Invalid transaction"
        );

        _createTransaction(
            _productId,
            lastTransaction.from,
            msg.sender,
            ProductStatus.DeliveredToCustomer,
            _metadata
        );
        productStatuses[_productId] = ProductStatus.DeliveredToCustomer;
    }

    /**
     * @dev Internal function to create transaction
     */
    function _createTransaction(
        uint256 _productId,
        address _from,
        address _to,
        ProductStatus _status,
        string memory _metadata
    ) internal {
        transactionCounter++;
        uint256 newTransactionId = transactionCounter;

        Transaction memory newTransaction = Transaction({
            transactionId: newTransactionId,
            productId: _productId,
            from: _from,
            to: _to,
            status: _status,
            metadata: _metadata,
            timestamp: block.timestamp,
            exists: true
        });

        transactions[newTransactionId] = newTransaction;
        productHistories[_productId].productId = _productId;
        productHistories[_productId].transactions.push(newTransaction);

        emit TransactionCreated(
            newTransactionId,
            _productId,
            _from,
            _to,
            _status,
            block.timestamp
        );
    }

    /**
     * @dev Get product history
     * @param _productId Product ID
     * @return Transaction[] Array of transactions
     */
    function getProductHistory(
        uint256 _productId
    ) public view validProduct(_productId) returns (Transaction[] memory) {
        return productHistories[_productId].transactions;
    }

    /**
     * @dev Get transaction details
     * @param _transactionId Transaction ID
     * @return Transaction struct
     */
    function getTransaction(
        uint256 _transactionId
    ) public view returns (Transaction memory) {
        require(transactions[_transactionId].exists, "Transaction does not exist");
        return transactions[_transactionId];
    }

    /**
     * @dev Get current product status
     * @param _productId Product ID
     * @return ProductStatus
     */
    function getProductStatus(
        uint256 _productId
    ) public view validProduct(_productId) returns (ProductStatus) {
        return productStatuses[_productId];
    }

    /**
     * @dev Get total transaction count
     * @return uint256
     */
    function getTotalTransactions() public view returns (uint256) {
        return transactionCounter;
    }
}

