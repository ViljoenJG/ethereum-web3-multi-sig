# Ethereum multi signature wallet
Playground project to play with Ethereum development

## Usage
It is advisable to run this on a test network, private blockchain or testrpc because I am confident this does not comply to the required standards for a multiple signature wallet. It serves only for me to play around with development of dapps or smart contracts

## Requirements
1. Some Ethereum Blockchain (testrpc, geth)
1. Truffle framework `npm i -g truffle`

## Building and the frontend

1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
1. Then run `npm run dev` to build the app and serve it on http://localhost:8080

## Common Errors

* **Error: Can't resolve '../build/contracts/MetaCoin.json'**

This means you haven't compiled or migrated your contracts yet. Run `truffle compile` and `truffle migrate` first.

Full error:

```
ERROR in ./app/main.js
Module not found: Error: Can't resolve '../build/contracts/MetaCoin.json' in '/Users/tim/Documents/workspace/Consensys/test3/app'
 @ ./app/main.js 11:16-59
```
