# shopping-blockchain
A smart contract for blockchain shop

## Installation:
Install all necesary packages with `npm install`

## Network Set up:
This project uses Sepolia test network to make transactions, if you don't have 1, you can go to [https://sepoliafaucet.com/](https://sepoliafaucet.com/) to get 1 free ETH per day.


## Metamask Setup
This application requires the use of Metamask wallet for token and ETH transactions.

1. You can follow the steps to create your own wallet at: [https://metamask.io/](https://metamask.io/)


## Wallet Set up:
### in the `.env` file: 
1. Change the `MNEMONIC` (Your metamask 12 secret phasekey. `Settings & privacy -> Reveal Secret Recovery Phase`)
2. The `PROJECT_ID` is based on the project ID that is given by infura. This help to deploy the project onto the Sepolia network. You can apply one for free: [https://app.infura.io/register](https://app.infura.io/register). You can use the current one for personal use only.

All settings can be manually changed in truffle-config.js file

## console
1. Compile the contracts
```console 
truffle compile
```

* Note: if you are unable to compile the files, please delete all files in `build/contracts` folder of the project and recompile

2. Migrate the contract into the network
```console
truffle migrate --reset --network sepolia
```
* Remember to copy contract address as it may be required to connect tokens in case if import token does not prompt automatically when project is being run.

* If you have `Error: Cannot find module 'truffle-hdwallet-provider'` while migrating, install `npm install @truffle/hdwallet-provider` then migrate again


3. Run the project
Open a new terminal then run:
```console
npm run dev
```
The project should run on your default browser, and it will prompt a connect request to your metamask account. Once connected, it will then prompt to ask import token. (You can skip 4. if your account is connected.)

4. Connect your wallet to the website (localhost) using `sepolia network` (If it is not connected, it should say "Not connected" beside your account; Choose your first account of your metamask (The first account of your Metamask account is set as boss, while the rest is set as normal user) and connect it.)

* If token is not imported:
In your metamsk account, click `import tokens` in `Assets` of your metamask wallet, paste the contract address into the `Token contract address`, enter `Token symbol` as `TT` and `Token decimal` will be automatically entered, or you can enter 18. If Token number is still 0, re-compile the contracts, and migrate the contract into the network again.


### Creating fake wallet account
1. Open another terminal and enter:
```console
truffle develop
```

There will be at least 10 accounts with private keys

2. Choose a private key with the corresponding account and import it into the metamask wallet

3. You will also need to `import tokens` in order to receive or send tokens in your Metamask

# Final
Refresh the page and ensure everything is working fine

The default account connected first in your Metamask is set as boss, with a token of 10000TT; while other accounts will have 0TT

Boss can only `add product`, `replenish product` and `delete product`, while normal users can only `purchase product` and view `my inventory`. `Transactions` can be done in both Boss and normal users.


