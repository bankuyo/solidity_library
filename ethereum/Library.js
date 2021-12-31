import web3 from './web3';
import Library from '../build/contracts/Library.json';
import { LIBRARY_ADDRESS } from './keys/libraryAddress';

const library = new web3.eth.Contract(
    Library.abi,
    LIBRARY_ADDRESS
);

export default library;