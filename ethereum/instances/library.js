import web3 from '../web3';
import Library from '../build/Library.json';

export default (address) => {
    return new web3.eth.Contract(
        Library.abi,
        address
    )
}