const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledLibrary = require('../build/contracts/Library.json');

let library;
let accounts;

// Helper function==============================
const setBook = async (price) => {
    await library.methods.addBook(accounts[0], price).send({from: accounts[0],gas: '1000000'})
}
const purchaseBook = async (bookId, account, value) => {
    await library.methods.purchaseBook(bookId, account).send({ from: account, value:value, gas:'1000000' });
}
//===============================================

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    library = await new web3.eth.Contract(compiledLibrary.abi)
        .deploy({
            data: compiledLibrary.bytecode,
        })
        .send({
            from: accounts[0],
            gas: '6000000'
        })
});

describe('Library: allow', () => {
    it('has a correct owner', async () =>{
        const owner = await library.methods.owner().call();
        assert.equal(owner, accounts[0]);
    });

    it('can add book by Library owner', async () => {
        await library.methods.addBook(accounts[1], 0).send({
            from: accounts[0],
            gas: '1000000'
        })
        const numTotalBook = await library.methods.getTotalBook().call();
        assert.equal(1, numTotalBook);
    });

    it('can purchase book', async () => {
        setBook(10);
        await library.methods.purchaseBook(1, accounts[0]).send({
            from: accounts[0],
            value:10,
            gas:'1000000'
        })
        const numTotalToken = await library.methods.totalSupply().call();
        const tokenOwner = await library.methods.ownerOf(1).call();
        assert.equal(1, numTotalToken);
        assert.equal(accounts[0],tokenOwner);
    });

    it('can purchase book from any user', async() => {
        setBook(10);
        await library.methods.purchaseBook(1, accounts[1]).send({
            from: accounts[1],
            value:10,
            gas:'1000000'
        });
        const tokenOwner = await library.methods.ownerOf(1).call();
        assert.equal(accounts[1],tokenOwner);
    });

    it('can borrow book', async () => {
        setBook(10);
        purchaseBook(1,accounts[0],10);
        await library.methods.borrowBook(1, accounts[0], accounts[1]).send({
            from :accounts[1],
            value: 0,
            gas: '1000000'
        });
        const tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(accounts[1],tokenBorrower);
    })
});


describe('Library: deny', () => {
    it('deny non-owner account to add book', async() => {
        try {
            await library.methods.addBook(accounts[0], 0).send({
                from: accounts[1],
                gas: '1000000'
            })
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    });

    it('sender and purchaser must be same to purchase book', async () => {
        setBook(10);
        try {
            await library.methods.purchaseBook(1, accounts[0]).send({
                from: accounts[1],
                value:10,
                gas:'1000000'
            })
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('require same price as msg.value to purchase book', async () => {
        setBook(10);
        try {
            await library.methods.purchaseBook(1, accounts[0]).send({
                from: accounts[0],
                value:100,
                gas:'1000000'
            })
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('deny to access undefined book Id ', async () => {
        setBook(10);
        try{
            purchaseBook(3,accounts[0],10);
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    })

    it('sender and borrower must be same to borrow book', async () => {
        setBook(10);
        purchaseBook(1,accounts[0],10);
        try {
            await library.methods.borrowBook(1, accounts[0], accounts[1]).send({
                from :accounts[2],
                value: 0,
                gas: '1000000'
            });
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    })
})