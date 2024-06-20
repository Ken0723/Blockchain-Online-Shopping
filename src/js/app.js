let curr_account = null;
let boss_account = null;

App = {
  web3Provider: null,
  contracts: {},

  init: async function () {


    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            curr_account = accounts[0];
            console.log("Metamask account:", accounts[0]);
          })
          .catch((err) => {
            console.error("Failed to retrieve Metamask account:", err);
          });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      // App.web3Provider = new Web3.providers.HttpProvider(
      //   "http://localhost:7545"
      // );
      App.web3Provider = new Web3.providers.HttpProvider(
        `https://sepolia.infura.io/v3/9e1899b4e7b54fd89084965ac8d6a72d`
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: async function () {

    //   var shoppingInstance;

    //   App.contracts.Shopping.deployed().then(function(instance) {
    //     shoppingInstance = instance;
    //     return shoppingInstance.isBoss.call({ from: account });
    //   }).then(function(products) {
    //     // for (i = 0; i < adopters.length; i++) {
    //     //   if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //     //     $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //     //   }
    //     // }
    //     console.log(products);
    //   }).catch(function(err) {
    //     console.log(err.message);
    //   });
    // });
    const shp = await $.getJSON("Shopping.json");
    App.contracts.Shopping = TruffleContract(shp);
    App.contracts.Shopping.setProvider(App.web3Provider);

    // Hydrate the smart contract with values from the blockchain
    App.shp = await App.contracts.Shopping.deployed();
    checkboss = await App.shp.isBoss({ from: curr_account });
    console.log("isBoss? " + checkboss);
    bossAddres = await App.shp.getBossAddress({ from: curr_account });
    console.log(`boss address: ${bossAddres}`);

    // console.log(`contract address: ${App.shp.address}`)
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: App.shp.address, // The address that the token is at.
            symbol: 'TT', // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
          },
        },
      });
    
      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log(error);
    }

    if (checkboss) {
      var userDiv = $(".user_type").find(".text-right");

      var btnAddProd = document.createElement("button");
      btnAddProd.innerText = "Add Product";
      btnAddProd.className = "btn btn-primary show-add-prod-btn";
      userDiv.append(btnAddProd);

      boss_account = curr_account;
      console.log("Boss " + boss_account);
    } else {
      var userDiv = $(".user_type").find(".text-right");

      var btnMyInv = document.createElement("button");
      btnMyInv.innerText = "My Inventory";
      btnMyInv.className = "btn btn-primary view-inventory";
      userDiv.append(btnMyInv);
    }

    App.refreshShop();
    return App.bindEvents();
  },

  bindEvents: function () {
    if (typeof window.ethereum !== "undefined") {
      // Listen for account changes
      window.ethereum.on("accountsChanged", function (accounts) {
        // Handle account change
        console.log("MetaMask account changed:", accounts[0]);
        window.location.reload();
      });
    } else {
      console.log("MetaMask not detected");
    }
    $(document).on("click", ".btn-buy", App.handlePurchase);
    $(document).on("click", ".btn-replenish", App.handleReplenish);
    $(document).on("click", ".show-add-prod-btn", App.showAddProductBtn);
    $(document).on("click", ".add-prod", App.addProduct);
    $(document).on("click", ".view-inventory", App.viewInventory);
    $(document).on("click", ".run_pass", App.handleTransfer);
    $(document).on("click", ".delete-prod", App.deleteProd);
  },

  refreshShop: async function () {
    let cancelButton = document.querySelector(".cancel-prod");
    if (cancelButton) {
      cancelButton.click();
    }

    let prodsList = await App.shp.getAllProduct({ from: curr_account });

    let prodsNamesList = await App.shp.getAllProductNames({
      from: curr_account,
    });

    var prodRow = $("#prodRow");
    prodRow.empty();
    var prodTemplate = $("#prodTemplate");

    let images = [
      "./images/product0.png",
      "./images/product1.png",
      "./images/product2.png",
      "./images/product3.png",
      "./images/product4.png",
      "./images/product5.png",
      "./images/product6.png",
    ];

    if (prodsList["0"].length != 0) {
      for (i = 0; i < prodsList["0"].length; i++) {
        // generate a random index between 0 and the length of the images array
        let randomIndex = Math.floor(Math.random() * images.length);
        let randomImage = images[randomIndex];
        console.log(`canSell?: ${prodsList["3"][i]}`)
        if (prodsList["3"][i] == false) {
          continue;
        }
        
        var id = `${prodsList["0"][i]}`;
        var name = `${prodsNamesList[i + 1]}`;
        var price = `${prodsList["1"][i]}`;
        var quantity = `${prodsList["2"][i]}`;
        var action = "actionQty" + id;

        prodTemplate.find(".panel-title").text(name);
        prodTemplate.find(".prod-price").text(price);
        prodTemplate.find(".prod-quantity").text(quantity);
        prodTemplate.find(".actionQty").attr("id", action);
        prodTemplate.find(".actionQty").attr("name", action);
        prodTemplate.find(".btn-buy-replenish").attr("data-id", id);
        prodTemplate.find(".delete-prod").attr("data-id", id);

        $(".panel-prod").eq(i).find("img").attr("src", randomImage);

        checkboss = await App.shp.isBoss({ from: curr_account });
        if (checkboss == true) {
          var button = document.querySelector(".btn-buy-replenish");

          // Change the properties in the class
          button.classList.add("btn-replenish");
          button.innerText = "Replenish";
        } else {
          var button = document.querySelector(".btn-buy-replenish");
          button.classList.add("btn-buy");
          document.querySelector(".delete-prod").style.visibility = 'hidden';
          // markOutOfStock
          if (quantity == 0) {
            $(".panel-prod")
              .eq(i)
              .find("input")
              .attr("disabled", true)
            $(".panel-prod")
              .eq(i)
              .find("button")
              .text("Out Of Stock")
              .attr("disabled", true)
              .attr("data-id", -1);
          }
        }

        prodRow.append(prodTemplate.html());
      }
    }
  },
  handlePurchase: async function (event) {
    event.preventDefault();

    var productId = parseInt($(event.target).data("id"));
    var action = "actionQty" + productId;
    let actQty = document.getElementById(action).value;
    console.log(`QTY . ${actQty}`);

    let prod1 = await App.shp.getProduct(productId, { from: curr_account });
    console.log(`product ID: ${productId}`);
    console.log(`price: ${prod1["1"].toNumber()}`);
    console.log(`quantity: ${prod1["2"].toNumber()}`);
    // const priceInWei = web3.utils.toWei(prod1['1'].toNumber().toString(), 'ether');

    const options = {
      from: curr_account,
      value: prod1["1"].toNumber() * prod1["2"].toNumber(),
      gas: prod1["1"].toNumber() * prod1["2"].toNumber(),
    };
    var price = prod1["1"].toNumber() * Math.pow(10, 18) * actQty;
    const start = Date.now();
    App.contracts.Shopping.deployed()
      .then(function (instance) {
        purchase = instance;

        return purchase.transfer(bossAddres, price, {
          from: curr_account,
          gas: "100000",
        });
      })
      .then(function (result) {
        if (result.receipt.status == '0x1') {
          App.shp.purchaseProduct(productId, actQty, {
            from: curr_account,
          });  
          App.refreshShop();
        }
      })
      .catch(function (err) {
        console.log("Transaction failed");
        console.log(err.message);
      });
    // await App.shp.purchaseProduct(productId, 1, {
    //   from: curr_account,
    //   value: prod1["1"] * 1,
    // }); // change "1" refers to value

    // App.shp.transfer(bossAddres, 1000000000000000, {from: curr_account, gas: 100000})
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    return App.refreshShop();

    // App.contracts.Shopping.deployed().then(function(instance) {
    //   prodInstance = instance;

    // Execute adopt as a transaction by sending account
    // const options = {
    //   from: curr_account,
    //   gas: 300000
    // };
    //   return prodInstance.purchaseProduct(productId, 1, options);
    // }).then(function(result) {
    //   return App.markBought();
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
    // });
  },
  handleReplenish: async function (event) {
    event.preventDefault();

    var productId = parseInt($(event.target).data("id"));
    var action = "actionQty" + productId;
    let actQty = document.getElementById(action).value;

    const start = Date.now();
    await App.shp.replenishProduct(productId, actQty, { from: curr_account });
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    return App.refreshShop();
  },
  deleteProd: async function (event) {
    event.preventDefault();

    var productId = parseInt($(event.target).data("id"));
    console.log(productId);
    // var action = "actionQty" + productId;
    // let actQty = document.getElementById(action).value;
    const start = Date.now();
    await App.shp.deleteProduct(productId, { from: curr_account });
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    return App.refreshShop();
  },

  showAddProductBtn: async function (event) {
    event.preventDefault();

    let cardDiv = $(".add-product").find(".add-product-form");

    let prodNameDiv = document.createElement("div");
    prodNameDiv.classList.add("form-group");

    let inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");

    // Name Div
    let nameDiv = document.createElement("div");
    nameDiv.classList.add("input-group-addon");
    let nameSpan = document.createElement("span");
    nameSpan.textContent = "Name";
    nameDiv.appendChild(nameSpan);
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "prodName";
    nameInput.name = "prodName";
    nameInput.className = "form-control";
    nameInput.required = true;

    cardDiv.append(prodNameDiv);
    prodNameDiv.append(inputGroup);
    inputGroup.append(nameDiv);
    inputGroup.append(nameInput);

    // Price Div
    let priceDiv = document.createElement("div");
    priceDiv.classList.add("form-group");

    let priceInputGroup = document.createElement("div");
    priceInputGroup.classList.add("input-group");

    let priceDivAddon = document.createElement("div");
    priceDivAddon.classList.add("input-group-addon");
    let priceDivText = document.createTextNode("Price");
    priceDivAddon.appendChild(priceDivText);

    let priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.id = "prodPrice";
    priceInput.name = "prodPrice";
    priceInput.className = "form-control";
    priceInput.min = 0;
    priceInput.required = true;

    cardDiv.append(priceDiv);
    priceDiv.append(priceInputGroup);
    priceInputGroup.append(priceDivAddon);
    priceInputGroup.append(priceInput);

    // Quantity Div
    let qtyDiv = document.createElement("div");
    qtyDiv.classList.add("form-group");

    let qtyInputGroup = document.createElement("div");
    qtyInputGroup.classList.add("input-group");

    let qtyDivAddon = document.createElement("div");
    qtyDivAddon.classList.add("input-group-addon");
    let qtyDivText = document.createTextNode("Quantity");
    qtyDivAddon.appendChild(qtyDivText);

    let qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.id = "prodQty";
    qtyInput.name = "prodQty";
    qtyInput.className = "form-control";
    qtyInput.min = 0;
    qtyInput.required = true;

    cardDiv.append(qtyDiv);
    qtyDiv.append(qtyInputGroup);
    qtyInputGroup.append(qtyDivAddon);
    qtyInputGroup.append(qtyInput);

    // Form submit
    let prodSubmitDiv = document.createElement("div");
    prodSubmitDiv.classList.add("form-actions", "form-group-submit");

    let submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.classList.add("btn", "btn-primary", "add-prod");
    let submitButtonText = document.createTextNode("Submit");
    submitButton.appendChild(submitButtonText);

    prodSubmitDiv.appendChild(submitButton);
    cardDiv.append(prodSubmitDiv);
    cardDiv.append(document.createElement("br"));

    // Create the cancel button
    let cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("btn", "btn-danger", "cancel-prod");
    cancelButton.innerText = "Cancel";

    // Add an event listener to remove the input fields and titles when the cancel button is clicked
    cancelButton.addEventListener("click", function () {
      var userDiv = $(".user_type").find(".text-right");

      var btnAddProd = document.createElement("button");
      btnAddProd.innerText = "Add Product";
      btnAddProd.className = "btn btn-primary show-add-prod-btn";
      userDiv.append(btnAddProd);

      prodNameDiv.remove();

      // Remove the price input field and its title
      priceDiv.remove();

      // Remove the quantity input field and its title
      qtyDiv.remove();

      // Remove the form actions div
      prodSubmitDiv.remove();

      // Remove the cancel itself
      this.remove();
    });

    // Append the cancel button to the card block
    cardDiv.append(cancelButton);
    this.remove();
  },
  addProduct: async function (event) {
    event.preventDefault();

    let name = document.getElementById("prodName").value;
    let price = parseInt(document.getElementById("prodPrice").value);
    let qty = parseInt(document.getElementById("prodQty").value);

    const start = Date.now();
    await App.shp.addProduct(name, price, qty, { from: curr_account });
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    App.refreshShop();
  },

  viewInventory: async function (event) {
    event.preventDefault();

    window.location.href = "../my_inventory.html";
  },
  handleTransfer: function (event) {
    event.preventDefault();

    var amount =
      parseInt(document.getElementById("token").value) * Math.pow(10, 18);
    var toAddress = document.getElementById("address").value;

    console.log("Transfer " + amount + " TT to " + toAddress);

    var transaction;
    const start = Date.now();
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Shopping.deployed()
        .then(function (instance) {
          transaction = instance;

          return transaction.transfer(toAddress, amount, {
            from: account,
            gas: 100000,
          });
        })
        .then(function (result) {
          alert("Transfer Successful!");
          App.refreshShop();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
