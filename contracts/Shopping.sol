pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Shopping is ERC20 {
    

    struct Product {
        string prodName;
        uint256 price;
        uint256 quantity;
        bool canSell;
    }

    struct User {
        bool isBoss;
        mapping(uint256 => uint256) purchases;
        uint256[] inventory;
    }

    mapping(address => User) private users;
    mapping(uint256 => Product) private products;
    uint256 private productCount = 0;
    address private bossaddress;

    event ProductAdded(
        uint256 productId,
        string prodName,
        uint256 price,
        uint256 quantity
    );
    event ProductReplenished(uint256 productId, uint256 quantity);
    event ProductPurchased(uint256 productId, uint256 quantity);

    constructor(
        string memory name,
        string memory symbol,
        uint initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply > 0, "Initial supply has to be greater than 0");
        _mint(msg.sender, initialSupply * 10 ** 18);
        // users[msg.sender] = User({isBoss: true, inventory: new uint256[](0), purchases: mapping(0 => 0)});
        bossaddress = msg.sender;
        initiateUser();
        
    }

    function initiateUser() private {
        User storage user1 = users[msg.sender];
        user1.isBoss = true;
        user1.inventory = new uint256[](0);
    }

    function addProduct(
        string memory name,
        uint256 price,
        uint256 quantity
    ) public {
        require(users[msg.sender].isBoss, "Only the boss can add products.");
        uint256 productId = productCount;
        products[productCount] = Product({
            prodName: name,
            price: price,
            quantity: quantity,
            canSell: true
        });

        emit ProductAdded(productId, name, price, quantity);
        productCount++;
    }


    function deleteProduct(uint256 productId) public {
        require(
            users[msg.sender].isBoss,
            "Only the boss can delete product."
        );
        Product storage product = products[productId];
        product.canSell = false;
        // emit ProductReplenished(productId, quantity);
    }

    function replenishProduct(uint256 productId, uint256 quantity) public {
        require(
            users[msg.sender].isBoss,
            "Only the boss can replenish inventory."
        );
        Product storage product = products[productId];
        product.quantity += quantity;
        emit ProductReplenished(productId, quantity);
    }

    function exists1(uint num) public view returns (bool) {
         for (uint i = 0; i< users[msg.sender].inventory.length; i++){
            if(users[msg.sender].inventory[i] == num){
                return true;
            }
        }

        return false;
    }

    function purchaseProduct(
        uint256 productId,
        uint256 quantity
    ) public {
        require(!users[msg.sender].isBoss, "Bosses cannot purchase products.");
        Product storage product = products[productId];
        require(product.quantity >= quantity, "Insufficient quantity.");
        uint256 totalPrice = product.price * quantity;
        require(balanceOf(msg.sender) >= totalPrice, "Insufficient token balance.");
        product.quantity -= quantity;
        users[msg.sender].purchases[productId] += quantity;
        if (!exists1(productId)){
            users[msg.sender].inventory.push(productId);
        }
        // _transfer(msg.sender, bossaddress, totalPrice);
        
        
        emit ProductPurchased(productId, quantity);
    }

    
    function getUserPurchases() public view returns (uint256[] memory, uint256[] memory) {
        User storage user = users[msg.sender];
        uint256[] memory productIds = new uint256[](user.inventory.length);
        uint256[] memory quantities = new uint256[](user.inventory.length);

        for (uint256 i = 0; i < user.inventory.length; i++) {
            uint256 productId = user.inventory[i];
            uint256 quantity = user.purchases[productId];
            productIds[i] = productId;
            quantities[i] = quantity;
        }

        return (productIds, quantities);
    }

    function getBossAddress() public view returns (address) {
        return bossaddress;
    }

    function getInventory() public view returns (uint256[] memory) {
        return users[msg.sender].inventory;
    }

    function getProduct(
        uint256 productId
    ) public view returns (string memory, uint256, uint256) {
        Product storage product = products[productId];
        return (product.prodName, product.price, product.quantity);
    }

    function getAllProduct()
        public
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            bool[] memory
        )
    {
        uint256[] memory ids = new uint256[](productCount);
        uint256[] memory prices = new uint256[](productCount);
        uint256[] memory quantities = new uint256[](productCount);
        bool[] memory canSells = new bool[](productCount);

        //string memory testName = '';

        for (uint256 i = 0; i < productCount; i++) {
            ids[i] = i;
            prices[i] = products[i].price;
            quantities[i] = products[i].quantity;
            canSells[i] = products[i].canSell;
        }
        return (ids, prices, quantities, canSells);
    }

    function getAllProductNames() public view returns (string[] memory) {
        string[] memory names = new string[](productCount+1);
        for (uint256 i = 0; i < productCount; i++) {
            names[i] = products[i].prodName;
        }
        return names;
    }

    function isBoss() public view returns (bool) {
        return users[msg.sender].isBoss;
    }

    // Set all new accounts as normal users
    // function isUser() public {
    //     if (!users[msg.sender].isBoss) {
    //         users[msg.sender] = User({
    //             isBoss: false,
    //             inventory: new uint256[](0)
    //         });
    //     }
    // }
}
