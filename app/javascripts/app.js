// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import "bootstrap/dist/css/bootstrap.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import myWallet_artifact from '../../build/contracts/MyWallet.json'

// Wallet is our usable abstraction, which we'll use through the code below.
var MyWallet = contract(myWallet_artifact);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var mainAccount;
var outstandingProposals = [];
var elements = {};

window.App = {
    start() {
        // Bootstrap the MyWallet abstraction for Use.
        MyWallet.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            mainAccount = accounts[0];

            App.listenToEvents();
            App.basicInfoUpdate();
        });
    },

    basicInfoUpdate() {
        MyWallet.deployed().then(function (instance) {
            elements.walletAddress.innerHTML = instance.address;
            elements.walletEther.innerHTML = getAccountBalance(instance.address);
        });

        elements.addressList.innerHTML = '';
        elements.allAccounts.innerHTML ='';

        accounts.forEach((account) => {
            var accountBalance = getAccountBalance(account);
            var option = document.createElement('option');
            option.value = account;
            option.innerHTML = `(${ accountBalance })`;
            elements.addressList.appendChild(option);

            var li = document.createElement('li');
            li.innerHTML = `${ account } <strong>(${ accountBalance } Ether)</strong>`;
            elements.allAccounts.appendChild(li)
        });
    },

    submitEtherToWallet() {
        var fromAcc = elements.fromAddress.value || mainAccount;

        MyWallet.deployed().then(function (instance) {
            return instance.sendTransaction({
                from: fromAcc,
                to: instance.address,
                value: web3.toWei(5, 'ether')
            });
        }).then(function (result) {
            App.basicInfoUpdate();
        });
    },

    confirmProposal() {
        // Logic still outstanding
    },

    sendProposal() {
        var from = elements.fromAddress.value || mainAccount;
        var to = elements.toAccount.value;
        var reason = elements.sendReason.value;
        var value = web3.toWei(parseInt(elements.value.value, 10), 'ether');

        MyWallet.deployed().then(function (instance) {
            return instance.spendMoney(to, value, reason, { from: from, gas: 500000 });
        }).then(function (resp) {
            console.log(resp);
        }).catch(function (err) {
            console.error(err);
        })
        return false;
    },

    listenToEvents() {
        MyWallet.deployed().then(function (instance) {
            instance.proposalReceived({}, {fromBlock:0, toBlock:'latest'}).watch(function(err, event) {
                var id = event.args._counter.toString(10);
                instance.getProposalDetails(parseInt(id, 10)).then(function (data) {
                    var proposal = new Proposal(data);
                    if (!proposal.sent) {
                        console.log(proposal);
                        outstandingProposals.push(proposal);
                        var option = document.createElement('option');
                        option.value = proposal.id;
                        option.innerHTML = `To: ${proposal.to}, value: ${ web3.fromWei(proposal.value, 'ether') } ether`;
                        elements.outstanding.appendChild(option)
                    }
                })
            });

            instance.receivedFunds({}, {fromBlock:0, toBlock:'latest'}).watch(function (err, event) {
                console.log(event)
            });

            instance.defaultSend({}, {fromBlock:0, toBlock:'latest'}).watch(function (err, event) {
                console.log(event)
            });
        })
    },
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    elements.addressList= document.getElementById('addressList');
    elements.fromAddress = document.getElementById('fromAddr');
    elements.toAccount = document.getElementById('toAccount');
    elements.sendReason = document.getElementById('reason');
    elements.value = document.getElementById('value');
    elements.walletAddress = document.getElementById('walletAddress');
    elements.walletEther = document.getElementById('walletEther');
    elements.allAccounts = document.getElementById('allAccounts');
    elements.outstanding = document.getElementById('outstanding');

    App.start();
});

function Proposal(dataArr) {
    if (!dataArr) {
        dataArr = [];
    }

    var idx = 0;

    this.from = dataArr[idx++];
    this.to = dataArr[idx++];
    this.reason = dataArr[idx++];
    this.value = parseInt(dataArr[idx++].toString(10));
    this.sent = dataArr[idx++];
    this.id = parseInt(dataArr[idx++].toString(10));
}

function getAccountBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether')
}
