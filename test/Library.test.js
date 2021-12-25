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
    await library.methods.purchaseBook(bookId).send({ from: account, value:value, gas:'1000000' });
}
const borrowBook = async (tokenId, value, account) => {
    await library.methods.borrowBook(tokenId).send({ from :account, value: value, gas: '1000000' });
}
const configBorrow = async (_tokenId, account, period, cost) => {
    await library.methods.configBorrow(_tokenId, period, cost).send({
        from: account,
        gas: '1000000'
    });
}
//===============================================

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    library = await new web3.eth.Contract(compiledLibrary.abi)
        .deploy({
            data: compiledLibrary.bytecode,
            arguments: [2]
        })
        .send({
            from: accounts[0],
            gas: '5000000'
        })
});

describe('Fundamental', async () => {
    it('has a correct owner', async () =>{
        const owner = await library.methods.owner().call();
        assert.equal(owner, accounts[0]);
    });

    it('deny to access undefined book Id ', async () => {
        await setBook(10);
        try{
            await purchaseBook(3,accounts[0],10);
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('can configure the lending token cost and period', async () =>{
        await setBook(10);
        await purchaseBook(1,accounts[1],10);
        await library.methods.configBorrow(1, 7, 100).send({
            from: accounts[1],
            gas: '1000000'
        })

        const token = await library.methods.getTokenData(1).call();
        assert.equal(token.period, 7);
        assert.equal(token.cost, 100);
    });

    it('deny configuring token from non-owner user', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[1],10);
        try {
            await library.methods.configBorrow(1, 7, 100).send({
                from: accounts[0],
                gas: '1000000'
            });
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    });

    it('can change the allowToContract status from token owner', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[1],10);
        await library.methods.changeBorrowAllowance(1, false).send({
            from: accounts[1],
            gas:'1000000'
        });
        
        try{
            await library.methods.borrowBook(1).send({
                from: accounts[0],
                gas:'1000000'
            });
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    })

    it('deny changing the allowToContract status from non-tokenowner', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[1],10);
        try {
            await library.methods.changeBorrowAllowance(1, false).send({
                from: accounts[0],
                gas:'1000000'
            });
        } catch (err){
           assert(true);
           return;
        }
        assert(false);
    })

    it('can change the maxBorrowing', async () => {
        await library.methods.changeMaxBorrowing(10).send({
            from : accounts[0],
            gas:'1000000'
        });
        const maxNum  = await library.methods.maxBorrowing().call();
        assert.equal(maxNum, 10);
    })

    it('deny changing the maxBorrowing from non-owner user', async () => {
        try{
            await library.methods.changeMaxBorrowing(10).send({
                from : accounts[1],
                gas:'1000000'
            });
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    })
})

describe('Adding and Modify Book', async () => {
    it('can add book by Library owner', async () => {
        await library.methods.addBook(accounts[1], 0).send({
            from: accounts[0],
            gas: '1000000'
        })
        const numTotalBook = await library.methods.getTotalBook().call();
        assert.equal(1, numTotalBook);
    });

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

    it('can modify book by Library owner', async () => {
        await setBook(10);

        await library.methods.modifyBook(1, accounts[2], 100).send({
            from: accounts[0],
            gas: '1000000'
        })
        const book = await library.methods.getBookData(1).call();
        assert.equal(accounts[2], book.author);
        assert.equal(100, book.price)
    });

    it('deny non-owner account to modify book', async() => {
        await setBook(10);
        try {
            await library.methods.modifyBook(1,accounts[0], 0).send({
                from: accounts[1],
                gas: '1000000'
            })
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    });
});

describe('Purchase Book(Token)', async () => {
    it('can purchase book', async () => {
        await setBook(10);
        await library.methods.purchaseBook(1).send({
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
        await setBook(10);
        await library.methods.purchaseBook(1).send({
            from: accounts[1],
            value:10,
            gas:'1000000'
        });
        const tokenOwner = await library.methods.ownerOf(1).call();
        assert.equal(accounts[1],tokenOwner);
    });

    it('require same price as msg.value to purchase book', async () => {
        await setBook(10);
        try {
            await library.methods.purchaseBook(1).send({
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
})

describe('Borrow Book', async () => {
    it('can borrow book', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await library.methods.borrowBook(1).send({
            from :accounts[1],
            value: 0,
            gas: '1000000'
        });
        const tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(accounts[1],tokenBorrower);
    });

    it('can not borrow the book which is borrowed by other user', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await borrowBook(1,0,accounts[1]);
        try {
            await library.methods.borrowBook(1).send({
                from :accounts[2],
                value: 0,
                gas: '1000000'
            });
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('can not borrow the book which is already borrowed', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await borrowBook(1,0,accounts[1]);
        try {
            await library.methods.borrowBook(1).send({
                from :accounts[1],
                value: 0,
                gas: '1000000'
            });
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('can borrow book which configured', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],7,100);
        await library.methods.borrowBook(1).send({
            from :accounts[2],
            value: 100,
            gas: '1000000'
        });
        const tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(accounts[2],tokenBorrower);

    })

    it('require borrower to pay cost', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],7,100);
        try {
            await library.methods.borrowBook(1).send({
                from :accounts[2],
                value: 0,
                gas: '1000000'
            });
        } catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it('restricted by maxBorrowingNumber', async () =>{
        await setBook(10);

        await purchaseBook(1,accounts[0],10);
        await purchaseBook(1,accounts[0],10);
        await purchaseBook(1,accounts[0],10);

        await borrowBook(1,0,accounts[1]);
        await borrowBook(2,0,accounts[1]);

        try{
            await library.methods.borrowBook(3).send({
                from: accounts[1],
                value:0,
                gas:'1000000'
            })
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    });

})

describe('Return Book', async () => {
    it('can return book', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],7,100);
        await borrowBook(1,100,accounts[1]);

        let tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(accounts[1],tokenBorrower);

        await library.methods.returnBook(1).send({
            from: accounts[1],
            gas: '1000000'
        })

        tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(tokenBorrower, accounts[0]);
    });

    it('deny non-borrower to return book', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],7,100);
        await borrowBook(1,100,accounts[1]);

        try {
            await library.methods.returnBook(1).send({
                from: accounts[3],
                gas: '1000000'
            })
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    });

    it('owner can return book, after a period pass', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],1,100);
        await borrowBook(1,100,accounts[1]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        await library.methods.returnBook(1).send({
            from: accounts[0],
            gas: '1000000'
        });
        tokenBorrower = await library.methods.getTokenBorrower(1).call();
        assert.equal(tokenBorrower, accounts[0]);
    });

    it('deny owner to return book before a period pass', async () => {
        await setBook(10);
        await purchaseBook(1,accounts[0],10);
        await configBorrow(1,accounts[0],10,100);
        await borrowBook(1,100,accounts[1]);

        try{
            await library.methods.returnBook(1).send({
                from: accounts[0],
                gas: '1000000'
            });
        } catch (err) {
            assert(true);
            return;
        }
        assert(false);
    })
})