const { PASSPHRASE, PROVIDER } = require('./keys/provider');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledLibrary = require('../build/contracts/Library.json');


const provider = new HDWalletProvider({
    mnemonic: {
      phrase: PASSPHRASE
    },
    providerOrUrl: PROVIDER
});
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(`Attempting to deploy from account ${accounts[0]}`);

    const result = await new web3.eth.Contract(compiledLibrary.abi)
        .deploy({ data: compiledLibrary.bytecode})
        .send(({
            from: accounts[0],
            gas: '5000000'
        }))
    
    console.log(`Contract deployed to ${result.options.address}`);
    provider.engine.stop();
};

deploy();