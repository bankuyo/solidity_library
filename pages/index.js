import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Card, Button } from 'semantic-ui-react';
import Layout from '../components/Layout';
import Link from 'next/link';

import libraryFactory from '../ethereum/instances/libraryFactory';
import Library from'../ethereum/instances/library';
import BookManager from '../ethereum/instances/bookManager';

class LibraryIndex extends React.Component{
    static async getInitialProps (){

        const libraries = await libraryFactory.methods.getDeployedLibraries().call();
        const libraryItemsInfo = await Promise.all(libraries.map(async (address) => {
            let library = await Library(address);
            let bookManagerAddress = await library.methods.managerAddress(0).call();
            let bookManager = BookManager(bookManagerAddress);
            let numBook = await bookManager.methods.numBook().call();
            let owner = await library.methods.owner().call();

            return {numBook, owner, address}
        }));
        return { libraries, libraryItemsInfo};
    }

    renderCard (){
        const libraryItems  = this.props.libraryItemsInfo.map((info) => {
            return {
                header: info.address,
                meta: (`number of book: ${info.numBook}`),
                description: (
                    <Link href={`/library/new`}>
                        <a>
                            <Button primary>View</Button>
                        </a>
                    </Link>
                ),
                fluid: true
            }
        })
        return <Card.Group items = {libraryItems} /> 
    }

    render(){
        return (
            <Layout>
                <h2>Libraries</h2>
                <Link href="/library/new">
                    <a>
                    <Button 
                        floated="right"
                        content="Create Library"
                        icon="add circle"
                        primary
                        labelPosition="left"
                    />
                    </a>
                </Link>
                {this.renderCard()}
            </Layout>
        );
    }
}

export default LibraryIndex;