var wallet = artifacts.require("./MyWallet.sol");

contract("MyWallet", function(accounts) {

    it('Should be able to add money to wallet', function () {
        var contractInstance;

        return wallet.deployed().then(function (instance) {
            contractInstance = instance;
            return contractInstance.sendTransaction({
                value: web3.toWei(10, 'ether'),
                address: contractInstance.address,
                from: accounts[0]
            });
        }).then(function (tx) {
            assert.equal(
                web3.eth.getBalance(contractInstance.address).toNumber(),
                web3.toWei(10, 'ether'),
                'The balance should be the same'
            );
        });
    });

    it('Should be able to send money as the owner', function () {
        var walletInstance;
        var balanceBeforeSend;
        var balanceAfterSend;
        var amountToSend = web3.toWei(5, 'ether');

        return wallet.deployed().then(function (instance) {
            walletInstance = instance;
            balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber();
            return walletInstance.spendMoney(accounts[0], amountToSend, "because I'm the owner", {from: accounts[0]});
        }).then(function () {
            return web3.eth.getBalance(walletInstance.address).toNumber();
        }).then(function (balance) {
            balanceAfterSend = balance;
            assert.equal(
                balanceBeforeSend - amountToSend,
                balanceAfterSend,
                'Balance should be 5 ether less than before'
            );
        });
    });

    it('Should be possible to propose spending of money', function () {
        var walletInstance;
        var balanceBeforeSend;

        return wallet.deployed().then(function (instance) {
            walletInstance = instance;
            balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber();
            return walletInstance.spendMoney(accounts[1], web3.toWei(5, 'ether'), "Because I need money", {from: accounts[1]});
        }).then(function (tx) {
            assert.equal(
                web3.eth.getBalance(walletInstance.address).toNumber(),
                balanceBeforeSend,
                'Balance should be the same before and after proposal'
            );
        });
    });

    it('Should be possible to confirm proposal as the owner', function () {
        var walletInstance;
        var balanceBeforeSend;

        return wallet.deployed().then(function (instance) {
            walletInstance = instance;
            balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber();
            return walletInstance.spendMoney(accounts[1], web3.toWei(5, 'ether'), "Because I need money", {from: accounts[1]});
        }).then(function () {
            return walletInstance.confirmProposal(1, {from: accounts[0]});
        }).then(function () {
            assert.equal(
                web3.eth.getBalance(walletInstance.address).toNumber(),
                balanceBeforeSend - web3.toWei(5, 'ether'),
                'Balance should be less after confirmation'
            );
        })
    })
});