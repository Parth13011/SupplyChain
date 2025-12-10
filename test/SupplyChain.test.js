const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Supply Chain Management System", function () {
  let userRegistry, productRegistry, supplyChain;
  let owner, manufacturer, distributor, retailer, customer;

  beforeEach(async function () {
    [owner, manufacturer, distributor, retailer, customer] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();
    await userRegistry.waitForDeployment();

    // Deploy ProductRegistry
    const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistry.deploy(await userRegistry.getAddress());
    await productRegistry.waitForDeployment();

    // Deploy SupplyChain
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy(
      await userRegistry.getAddress(),
      await productRegistry.getAddress()
    );
    await supplyChain.waitForDeployment();

    // Register users
    await userRegistry.registerUser(manufacturer.address, 2, "Test Manufacturer");
    await userRegistry.registerUser(distributor.address, 3, "Test Distributor");
    await userRegistry.registerUser(retailer.address, 4, "Test Retailer");
    await userRegistry.registerUser(customer.address, 5, "Test Customer");
  });

  describe("User Registration", function () {
    it("Should register users with correct roles", async function () {
      const manufacturerRole = await userRegistry.getUserRole(manufacturer.address);
      expect(manufacturerRole).to.equal(2); // Manufacturer

      const distributorRole = await userRegistry.getUserRole(distributor.address);
      expect(distributorRole).to.equal(3); // Distributor
    });
  });

  describe("Product Creation", function () {
    it("Should create a product with unique ID", async function () {
      const tx = await productRegistry.connect(manufacturer).createProduct(
        "Test Product",
        "Test Description",
        "{}"
      );
      await tx.wait();

      const product = await productRegistry.getProduct(1);
      expect(product.name).to.equal("Test Product");
      expect(product.manufacturer).to.equal(manufacturer.address);
    });
  });

  describe("Supply Chain Flow", function () {
    let productId;

    beforeEach(async function () {
      // Create a product
      const tx = await productRegistry.connect(manufacturer).createProduct(
        "Test Product",
        "Test Description",
        "{}"
      );
      await tx.wait();
      productId = 1;
    });

    it("Should complete full supply chain flow", async function () {
      // Manufacturer ships to distributor
      await supplyChain.connect(manufacturer).shipToDistributor(
        productId,
        distributor.address,
        ""
      );

      // Distributor receives
      await supplyChain.connect(distributor).receiveFromManufacturer(productId, "");

      // Distributor ships to retailer
      await supplyChain.connect(distributor).shipToRetailer(
        productId,
        retailer.address,
        ""
      );

      // Retailer receives
      await supplyChain.connect(retailer).receiveFromDistributor(productId, "");

      // Retailer sells to customer
      await supplyChain.connect(retailer).sellToCustomer(
        productId,
        customer.address,
        ""
      );

      // Customer confirms delivery
      await supplyChain.connect(customer).confirmDelivery(productId, "");

      // Check final status
      const status = await supplyChain.getProductStatus(productId);
      expect(status).to.equal(6); // DeliveredToCustomer

      // Check history
      const history = await supplyChain.getProductHistory(productId);
      expect(history.length).to.equal(6);
    });
  });
});

