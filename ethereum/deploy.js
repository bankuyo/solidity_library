const { PASSPHRASE, PROVIDER } = require('./confidentials/provider');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledLibraryFactory = require('./build/LibraryFactory.json');

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

    const result = await new web3.eth.Contract(compiledLibraryFactory.abi)
        .deploy({ data: compiledLibraryFactory.evm.bytecode.object })
        .send(({
            from: accounts[0],
            gas: '6000000'
        }))
    
    console.log(`Contract deployed to ${result.options.address}`);
    provider.engine.stop();
};

deploy();