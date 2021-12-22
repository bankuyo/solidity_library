import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Card } from 'semantic-ui-react';
import Layout from '../components/Layout';
import libraryFactory from '../ethereum/instances/libraryFactory';
import Library from'../ethereum/instances/library';
import BookManager from '../ethereum/instances/bookManager';

class LibraryIndex extends React.Component{
    static async getInitialProps (){
        let library;
        let bookManagerAddress;
        let bookManager;
        const libraries = await libraryFactory.methods.getDeployedLibraries().call();
        const libraryItems = await Promise.all(libraries.map(async (address) => {
            library = Library(address);
            console.log(address);
            bookManagerAddress = await library.methods.managerAddress(0).call();
            bookManager = BookManager(bookManagerAddress);
            return {
                header:  address,
                meta: 
                    `number of book: ${await bookManager.methods.numBook().call()}`,
                fluid: true,

            }
        }));
        return { libraries, libraryItems };
    }

    render(){
        return (
            <Layout>
                <h2>Libraries</h2>
                <Card.Group items = {this.props.libraryItems} />
            </Layout>
        );
    }
}

export default LibraryIndex;