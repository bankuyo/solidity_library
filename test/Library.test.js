const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledLibrary = require('../ethereum/build/Library.json');
const compiledLibraryFactory = require('../ethereum/build/LibraryFactory.json');
const compiledBookManager = require('../ethereum/build/BookManager.json');
const compiledUserManager = require('../ethereum/build/UserManager.json');
const compiledTokenManager = require('../ethereum/build/TokenManager.json');

let accounts;
let library;
let bookManager;
let userManager;
let tokenManager;

// INITIAL VALUES=====================================
const MAX_BORROWING = 2;
const INITIAL_BOOKID = '';
const INITIAL_TITLE = '';
const INITIAL_PRICE = 100;
const INITIAL_PERIOD = 7;
const INITIAL_COST = 0;

// Helper functions ===================================
const initialAddBook = async () => {
    await library.methods.addBook(INITIAL_BOOKID, INITIAL_TITLE, INITIAL_PRICE, accounts[3])
        .send({
            from: accounts[0],
            gas: '1000000'
    })
}

const initialRegister = async (account) => {
    await library.methods.register().send({
        from: account,
        gas: '1000000'
    })
}
const initialCreatingBookToken = async(account) => {
    await library.methods.createBookToken(0,INITIAL_PERIOD,INITIAL_COST).send({
        value: INITIAL_PRICE,
        from: account,
        gas:'1000000'
    })
}

const initialTurnTrueAllowabilityStatus = async (account) => {
    await library.methods.allowTokenToContract(0,true).send({
        from:account,
        gas:'1000000'
    })
}

const initialBorrowing = async (account) => {
    await library.methods.borrowBook(0).send({
        from: account,
        value: INITIAL_COST,
        gas: '1000000'
    })
}
// ===================================================

//Create accounts and a Smart contract instance.
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(compiledLibraryFactory.abi)
        .deploy({
            data: compiledLibraryFactory.evm.bytecode.object
        })
        .send({
            from: accounts[0],
            gas: '6000000'
        })

    await factory.methods.createLibrary(2).send({
        from : accounts[0],
        gas:'6000000'
    });

    [ libraryAddress ] = await factory.methods.getDeployedLibraries().call(); 
    library = await new web3.eth.Contract(
        compiledLibrary.abi,
        libraryAddress
    );
    // library = await new web3.eth.Contract(compiledLibrary.abi)
    //     .deploy({
    //         data: compiledLibrary.evm.bytecode.object,
    //         arguments: [MAX_BORROWING]
    //     })
    //     .send({
    //         from: accounts[0],
    //         gas: '6000000'
    //     });

    [bookManagerAddress, userManagerAddress, tokenManagerAddress] = await library.methods.getManagerAddress().call();
    bookManager = new web3.eth.Contract(compiledBookManager.abi, bookManagerAddress);
    userManager = new web3.eth.Contract(compiledUserManager.abi, userManagerAddress);
    tokenManager= new web3.eth.Contract(compiledTokenManager.abi, tokenManagerAddress);
});



describe('Library', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(library.options.address);
    });

    it('has a owner address && maxBorrowing', async () => {
        const ownerAddress = await library.methods.owner().call();
        const maxBorrowing = await library.methods.maxBorrowing().call();
        assert.equal(ownerAddress, accounts[0]);
        assert.equal(maxBorrowing, MAX_BORROWING);
    });

    it('can invite a staff', async () => {
        await library.methods.inviteStaff(accounts[1]).send({ from: accounts[0], gas: '1000000'});
        const isValid = await userManager.methods.getIsStaff(accounts[1]).call();
        assert(isValid);
    })

    it('user can register', async () => {
        await library.methods.register().send({
            from: accounts[1],
            gas: '1000000'
        })
        const isRegistered = await userManager.methods.isValidUser(accounts[1]).call();
        assert(isRegistered);
    });

    it('allow to add new book', async () => {
        await library.methods.addBook(INITIAL_BOOKID, INITIAL_TITLE, INITIAL_PRICE, accounts[3])
            .send({
                from: accounts[0],
                gas: '1000000'
            })
        const bookInformation = await bookManager.methods.bookInformations(0).call();
        assert.equal(bookInformation.bookId, INITIAL_BOOKID);
        assert.equal(bookInformation.title, INITIAL_TITLE);
        assert.equal(bookInformation.price, INITIAL_PRICE);
        assert.equal(bookInformation.authorAddress, accounts[3]);

        const numBook = await bookManager.methods.numBook().call();
        assert.equal(numBook, 1);
    })

    it('denys to add new book from non-owner account', async () => {
        try {
            await library.methods.addBook(INITIAL_BOOKID, INITIAL_TITLE, INITIAL_PRICE, accounts[3])
                .send({
                    from: accounts[0],
                    gas: '1000000'
            })
            assert(false);
        } catch (err){
            assert.ok(err);
        }
    })

    it('allow to modify book inforamtion', async () => {
        await initialAddBook();
        await library.methods.inviteStaff(accounts[1]).send({ from: accounts[0], gas: '1000000'});
        await library.methods.modifyBook(0, INITIAL_BOOKID, 'HELLO',INITIAL_PRICE).send({
            from: accounts[1],
            gas: '3000000'
        });
        const bookInformation = await bookManager.methods.bookInformations(0).call();
        assert.equal(bookInformation.title, 'HELLO');
    })

    it('allow user to create a new Book Token', async () => {
        await initialAddBook();
        await initialRegister(accounts[1]);
        await library.methods.createBookToken(0,INITIAL_PERIOD,INITIAL_COST).send({
            value: INITIAL_PRICE,
            from: accounts[1],
            gas:'1000000'
        })
        const token = await tokenManager.methods.bookTokens(0).call();
        assert.equal(token.owner, accounts[1]);
        assert.equal(token.reader, accounts[1]);
        assert.equal(token.allowToContract, false);
        assert.equal(token.period, INITIAL_PERIOD);
        assert.equal(token.cost, INITIAL_COST);


        const user = await userManager.methods.users(accounts[1]).call();
        assert.equal(user.numPurchased, 1);

        const { numToken } = await bookManager.methods.bookInformations(0).call();
        assert.equal(numToken, 1)
    })

    it('appropreatly process a borrow contract', async () => {
        await initialAddBook();
        await initialRegister(accounts[1]);
        await initialRegister(accounts[2]);
        await initialCreatingBookToken(accounts[1]);
        await initialTurnTrueAllowabilityStatus(accounts[1]);
        
        await library.methods.borrowBook(0).send({
            from: accounts[2],
            value: INITIAL_COST,
            gas: '1000000'
        })

        const token = await tokenManager.methods.bookTokens(0).call();
        assert.equal(token.reader, accounts[2])
        
        const user = await userManager.methods.users(accounts[2]).call();
        assert.equal(user.numBorrowing, 1);
        assert.equal(user.numBorrowed, 1);
        
        const isBorrowing = await userManager.methods.getIsBorrowing(accounts[2],0).call();
        assert(isBorrowing);
    });

    it('appropreatly process a return contract', async () => {
        await initialAddBook();
        await initialRegister(accounts[1]);
        await initialRegister(accounts[2]);
        await initialCreatingBookToken(accounts[1]);
        await initialTurnTrueAllowabilityStatus(accounts[1]);
        await initialBorrowing(accounts[2]);

        await library.methods.returnBook(0).send({
            from: accounts[2],
            gas: '1000000'
        })

        const token = await tokenManager.methods.bookTokens(0).call();
        assert.equal(token.reader, accounts[1]);

        const user = await userManager.methods.users(accounts[2]).call();
        assert.equal(user.numBorrowed, 1);
        assert.equal(user.numBorrowing, 0);

        const isBorrowing = await userManager.methods.getIsBorrowing(accounts[2],0).call();
        assert(!isBorrowing);
        
    })

})

describe('BookManager', () => {
    it('successfuly created by Library constructor', async () => {
        assert.ok(bookManager.options.address);
        assert.equal(bookManager.options.address, bookManagerAddress);
    })
})

describe('UserManager', () => {
    it('successfuly created by Library constructor', async () => {
        assert.ok(userManager.options.address);
        assert.equal(userManager.options.address, userManagerAddress);
    })
})

describe('TokenManager', () => {
    it('successfuly created by Library constructor', async () => {
        assert.ok(tokenManager.options.address);
        assert.equal(tokenManager.options.address, tokenManagerAddress);
    })
})