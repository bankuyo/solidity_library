import web3 from '../web3';
import LibraryFactory from '../build/LibraryFactory.json';
import { FACTORY_ADDRESS } from '../keys/factoryAddress';

const instance = new web3.eth.Contract(
    LibraryFactory.abi,
    FACTORY_ADDRESS
);

export default instance;