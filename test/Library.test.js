const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledLibrary = require('../ethereum/build/Library.json');

let accounts;
let library;

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
            gas: '3000000'
        })
});

describe('Library', () => {
    it('has initialy created', () => {
        assert.ok(library.options.address);
    });

    it('has a default maxium borrowing number', async () => {
        const maxBorrowing = await library.methods.maxBorrowing().call();
        assert.equal(INITIAL_VALUE, maxBorrowing)
    });

    it('can add a new book by manager', async () => {
        await library.methods
            .addBook('First history', '10.10.10', '7days', 1200, 3)
            .send({
                from:accounts[0],
                gas: '1000000'
        })

        const book = await library.methods.books(0).call();
        assert.equal('First history', book.title);
    });

    it('allow manager to invite new staff. And staff can modify the books information.', async () => {
        // Invite staff
        await library.methods.inviteStaff(accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });

        // Add a new book
        await library.methods
            .addBook('First history', '10.10.10', '7days', 1200, 3)
            .send({ from:accounts[0], gas: '1000000'});

        // Modify a book
        await library.methods
            .modifyInformation(0,'Second history', '10.10.10', '7days', 1200, 3)
            .send({
                from: accounts[1],
                gas: '1000000'
            });
        
        const book = await library.methods.books(0).call();

        assert.equal('Second history',book.title);
    });

    it('allow user to register and marks them as member', async () =>{
        await library.methods.register().send({
            from: accounts[1],
            gas: '1000000'
        });

        const isMember = await library.methods.validUser(accounts[1]).call();
        assert.ok(isMember);
    });

    it('successfuly create a User class when the user register.', async() => {
        await library.methods.register().send({from: accounts[1],gas: '1000000'});
        const user = await library.methods.users(accounts[1]).call();
        assert.equal(accounts[1], user.userAddress);
    });

    it('process the borrowing contract.', async () => {
        // Add a Book
        await library.methods
            .addBook('First history', '10.10.10', '7days', 1200, 3)
            .send({ from:accounts[0], gas: '1000000'});
        
        // Register User
        await library.methods.register().send({from: accounts[1],gas: '1000000'});

        // Borrow a Book
        await library.methods.borrowBook(0).send({
            from: accounts[1],
            gas: '1000000'
        });
        const book = await library.methods.books(0).call();
        const user = await library.methods.users(accounts[1]).call();

        assert.equal(1 ,book.numBorrowed);
        assert.equal(1, user.numBorrow);
    });

    it('book stock is activating well.', async () => {
         // Add a Book
         await library.methods
            .addBook('First history', '10.10.10', '7days', 1200, 2)
            .send({ from:accounts[0], gas: '1000000'});
        
            // Register User * 3
        await library.methods.register().send({from: accounts[1],gas: '1000000'});
        await library.methods.register().send({from: accounts[2],gas: '1000000'});
        await library.methods.register().send({from: accounts[3],gas: '1000000'});

        // Borrow book * 2
        await library.methods.borrowBook(0).send({from: accounts[1], gas: '1000000' });
        await library.methods.borrowBook(0).send({from: accounts[2], gas: '1000000' });

        try{
            await library.methods.borrowBook(0).send({from: accounts[3], gas: '1000000' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('is not allowed for user to borrow over than maximum borroing number', async () => {
        // Add a Book * 3
        await library.methods
            .addBook('First history', '10.10.10', '7days', 1200, 3)
            .send({ from:accounts[0], gas: '1000000'});
        await library.methods
            .addBook('Second history', '10.10.11', '7days', 1200, 3)
            .send({ from:accounts[0], gas: '1000000'});
        await library.methods
            .addBook('Third history', '10.10.12', '7days', 1200, 3)
            .send({ from:accounts[0], gas: '1000000'});
        
        // Register User
        await library.methods.register().send({from: accounts[1],gas: '1000000'});

        // Borrow a Book * 3
        await library.methods.borrowBook(0).send({from: accounts[1], gas: '1000000' });
        await library.methods.borrowBook(1).send({from: accounts[1], gas: '1000000' });
        try {
            await library.methods.borrowBook(2).send({from: accounts[1], gas: '1000000' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })
})