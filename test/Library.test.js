const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledLibrary = require('../ethereum/build/Library.json');
const compiledBookManager = require('../ethereum/build/BookManager.json');
const compiledUserManager = require('../ethereum/build/UserManager.json');
const compiledTokenManager = require('../ethereum/build/TokenManager.json');

let accounts;
let library;
let bookManager;
let userManager;
let tokenManager;

const INITIAL_VALUE = 2;

//Create accounts and a Smart contract instance.
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    library = await new web3.eth.Contract(compiledLibrary.abi)
        .deploy({
            data: compiledLibrary.evm.bytecode.object,
            arguments: [INITIAL_VALUE]
        })
        .send({
            from: accounts[0],
            gas: '6000000'
        });

    [bookManagerAddress, userManagerAddress, tokenManagerAddress ] = await library.methods.getManagerAddress().call();
    bookManager = new web3.eth.Contract(compiledBookManager.abi, bookManagerAddress);
    userManager = new web3.eth.Contract(compiledUserManager.abi, userManagerAddress);
    tokenManager= new web3.eth.Contract(compiledTokenManager.abi, tokenManagerAddress);
});

describe('Library', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(library.options.address);
    });

    it('has a owner address', async () => {
        const ownerAddress = await library.methods.owner().call();
        assert.equal(ownerAddress, accounts[0]);
    });

    it('allow to add new book', async () => {
        await library.methods.addBook('100.100.100', 'Tommorow', '100', accounts[2])
            .send({
                from: accounts[0],
                gas: '1000000'
            })
        const bookInformation = await bookManager.methods.bookInformations(0).call();
        assert.equal(bookInformation.bookId, '100.100.100');
        assert.equal(bookInformation.title, 'Tommorow');
        assert.equal(bookInformation.price, '100');
        assert.equal(bookInformation.authorAddress, accounts[2]);

        const numBook = await bookManager.methods.numBook().call();
        assert.equal(numBook, 1);
    })

    it('denys to add new book from not owner account', async () => {
        try {
            await library.methods.addBook('100.100.100', 'Tommorow', '100', accounts[1])
                .send({
                    from: accounts[0],
                    gas: '1000000'
            })
            assert(false);
        } catch (err){
            assert.ok(err);
        }
    })

} )

describe('BookManager', () => {
    it('successfuly created by Library constructor', async () => {
        // console.log(bookManagerAddress);
        assert.ok(bookManager.options.address);
        assert.equal(bookManager.options.address, bookManagerAddress);
    })
})