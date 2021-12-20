const { PASSPHRASE, PROVIDER } = require('./confidentials/provider');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledLibrary = require('./build/Library.json');

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
        .deploy({
            data
        })
}