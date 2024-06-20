let curr_account = null;
let boss_account = null;

App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    // $.getJSON("../pets.json", function (data) {
    //   var petsRow = $("#prodRow");
    //   var petTemplate = $("#prodTemplate");

    //   for (i = 0; i < data.length; i++) {
    //     //petTemplate.find(".panel-title").text(data[i].name);
    //     petTemplate.find("img").attr("src", data[i].picture);
    //     //petTemplate.find(".pet-breed").text(data[i].breed);
    //     //petTemplate.find(".pet-age").text(data[i].age);
    //     //petTemplate.find(".pet-location").text(data[i].location);
    //     //petTemplate.find(".btn-adopt").attr("data-id", data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

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
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: async function () {

    // $.getJSON('Shopping.json', function(data) {
    //   // Get the necessary contract artifact file and instantiate it with @truffle/contract
    //   var ShoppingArtifact = data;
    //   App.contracts.Shopping = TruffleContract(ShoppingArtifact);
    //   // Set the provider for our contract
    //   App.contracts.Shopping.setProvider(App.web3Provider);

    //   // Use our contract to retrieve and mark the adopted pets
    //   // return App.markAdopted();
    //   var shoppingInstance;

  
    const shp = await $.getJSON("Shopping.json");
    App.contracts.Shopping = TruffleContract(shp);
    App.contracts.Shopping.setProvider(App.web3Provider);

    // Hydrate the smart contract with values from the blockchain
    App.shp = await App.contracts.Shopping.deployed();
    checkboss = await App.shp.isBoss({ from: curr_account });
    console.log("isBoss? " + checkboss);

    if (checkboss == true) {
      //   var userDiv = $(".user_type").find(".text-right");

      //   var btnAddProd = document.createElement("button");
      //   btnAddProd.innerText = "Add Product";
      //   btnAddProd.className = "btn btn-primary add-prod";
      //   userDiv.append(btnAddProd);

      //   boss_account = curr_account;
      window.location.href = "../index.html";
      console.log("Boss " + boss_account);
    } else {
      var userDiv = $(".user_type").find(".text-right");

      var btnMyInv = document.createElement("button");
      btnMyInv.innerText = "Return page";
      btnMyInv.className = "btn btn-primary return-page";
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
    // $(document).on("click", ".btn-buy", App.handlePurchase);
    // $(document).on("click", ".add-prod", App.addProduct);
    // $(document).on("click", ".view-inventory", App.viewInventory);
    $(document).on("click", ".return-page", App.returnPage);
  },

  refreshShop: async function () {
    

    // let prodsList = await App.shp.getInventory({ from: curr_account });
    let purchProd = await App.shp.getUserPurchases({ from: curr_account });

    // console.log("Inv List Length: ", prodsList.length);
    console.log(`purchProd: ${purchProd}`);

    // var invDiv = $(".user_inv").find(".row");
    // for (i = 0; i < prodsList.length; i++) {
    //   console.log(prodsList[i].toNumber());
    //   invDiv.append(prodsList[i]);
    // }

    // let prodsNamesList = await App.shp.getAllProductNames({
    //   from: curr_account,
    // });

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

    if (purchProd[0].length != 0) {
      for (i = 0; i < purchProd[0].length; i++) {
        // generate a random index between 0 and the length of the images array
        console.log(`purchaselist: ${purchProd[0][i]}`);
        
        let randomIndex = Math.floor(Math.random() * images.length);
        let randomImage = images[randomIndex];

          var id = `${purchProd[0][i]}`;
          var quantity = `${purchProd[1][i]}`;
          let curr_prod = await App.shp.getProduct(id, { from: curr_account });
          var name = `${curr_prod["0"]}`;
          var price = `${curr_prod["1"]}`
        console.log(`curr_prod: ${curr_prod["1"]}`);
        
        

        prodTemplate.find(".panel-title").text(name);
        prodTemplate.find(".prod-price").text(price);
        prodTemplate.find(".prod-quantity").text(quantity);
        // prodTemplate.find(".btn-buy").attr("data-id", id);

        $(".panel-prod").eq(i).find("img").attr("src", randomImage);

        // markOutOfStock
        // if (quantity == 0) {
        //   $(".panel-prod")
        //     .eq(i)
        //     .find("button")
        //     .text("Out Of Stock")
        //     .attr("disabled", true)
        //     .attr("data-id", -1);
        // }

        prodRow.append(prodTemplate.html());
      }
    }

    //return App.markBought();
  },

  returnPage: async function (event) {
    event.preventDefault();

    window.location.href = "../index.html";
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
