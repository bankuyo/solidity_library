import web3 from '../web3';
import BookManager from '../build/BookManager.json';

export default (address) => {
    return new web3.eth.Contract(
        BookManager.abi,
        address
    )
}