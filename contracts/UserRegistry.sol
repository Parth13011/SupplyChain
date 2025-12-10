// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserRegistry
 * @dev Manages user roles in the supply chain system
 * Only Government can assign roles to users
 */
contract UserRegistry {
    enum UserRole {
        None,
        Government,
        Manufacturer,
        Distributor,
        Retailer,
        Customer
    }

    struct User {
        address userAddress;
        UserRole role;
        string name;
        bool isRegistered;
        uint256 registeredAt;
    }

    address public government;
    mapping(address => User) public users;
    mapping(UserRole => address[]) public usersByRole;

    event UserRegistered(
        address indexed user,
        UserRole role,
        string name,
        uint256 timestamp
    );
    event RoleUpdated(
        address indexed user,
        UserRole oldRole,
        UserRole newRole,
        uint256 timestamp
    );

    modifier onlyGovernment() {
        require(
            users[msg.sender].role == UserRole.Government,
            "Only Government can perform this action"
        );
        _;
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    constructor() {
        government = msg.sender;
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: UserRole.Government,
            name: "Government",
            isRegistered: true,
            registeredAt: block.timestamp
        });
        usersByRole[UserRole.Government].push(msg.sender);
        emit UserRegistered(msg.sender, UserRole.Government, "Government", block.timestamp);
    }

    /**
     * @dev Register a new user with a specific role
     * @param _user Address of the user to register
     * @param _role Role to assign
     * @param _name Name of the user/organization
     */
    function registerUser(
        address _user,
        UserRole _role,
        string memory _name
    ) public onlyGovernment {
        require(_user != address(0), "Invalid address");
        require(_role != UserRole.None, "Invalid role");
        require(!users[_user].isRegistered, "User already registered");

        users[_user] = User({
            userAddress: _user,
            role: _role,
            name: _name,
            isRegistered: true,
            registeredAt: block.timestamp
        });

        usersByRole[_role].push(_user);
        emit UserRegistered(_user, _role, _name, block.timestamp);
    }

    /**
     * @dev Update user role
     * @param _user Address of the user
     * @param _newRole New role to assign
     */
    function updateUserRole(
        address _user,
        UserRole _newRole
    ) public onlyGovernment {
        require(users[_user].isRegistered, "User not registered");
        require(_newRole != UserRole.None, "Invalid role");

        UserRole oldRole = users[_user].role;
        users[_user].role = _newRole;

        // Remove from old role array
        address[] storage oldRoleUsers = usersByRole[oldRole];
        for (uint256 i = 0; i < oldRoleUsers.length; i++) {
            if (oldRoleUsers[i] == _user) {
                oldRoleUsers[i] = oldRoleUsers[oldRoleUsers.length - 1];
                oldRoleUsers.pop();
                break;
            }
        }

        // Add to new role array
        usersByRole[_newRole].push(_user);

        emit RoleUpdated(_user, oldRole, _newRole, block.timestamp);
    }

    /**
     * @dev Get user information
     * @param _user Address of the user
     * @return User struct
     */
    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }

    /**
     * @dev Get user role
     * @param _user Address of the user
     * @return UserRole
     */
    function getUserRole(address _user) public view returns (UserRole) {
        return users[_user].role;
    }

    /**
     * @dev Check if user is registered
     * @param _user Address of the user
     * @return bool
     */
    function isUserRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }

    /**
     * @dev Get all users by role
     * @param _role Role to filter by
     * @return address[] Array of user addresses
     */
    function getUsersByRole(UserRole _role) public view returns (address[] memory) {
        return usersByRole[_role];
    }
}

