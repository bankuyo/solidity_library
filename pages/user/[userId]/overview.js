import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Table, Button} from 'semantic-ui-react';
import Link from 'next/link'

import library from '../../../ethereum/Library';
import Layout from '../../../components/Layout';

class UserOverview extends React.Component {
    static async getInitialProps({query}){
        const userAddress = query.userId;
        const user = await library.methods.getUserData(userAddress).call();
        const tokenIds = user.tokenIds[Symbol.iterator]();
        const tokensData = [];
        const books = [];
        for(let tokenId of tokenIds){
            let token = await library.methods.getTokenData(tokenId).call();
            let book  = await library.methods.getBookData(token[1]).call();
            tokensData.push([...token, book[2], tokenId]); 
        }
        return { userAddress, tokensData};
    }

    renderTable(){
        const { Header, Row, HeaderCell,Body, Cell } = Table;
        return(
            <Table>
                <Header>
                    <Row>
                        <HeaderCell>Title</HeaderCell>
                        <HeaderCell>Current Borrower</HeaderCell>
                        <HeaderCell>Period</HeaderCell>
                        <HeaderCell>Cost</HeaderCell>
                        <HeaderCell>Config Lending Status</HeaderCell>
                    </Row>
                </Header>
                <Body>
                    {this.props.tokensData.map((item,index)=>{
                        return (
                            <Row key={index}>
                                <Cell>{item[6]}</Cell>
                                <Cell>{item[0]}</Cell>
                                <Cell>{item[3]}</Cell>
                                <Cell>{item[4]}</Cell>
                                <Cell>
                                    <Link href={`/token/${item[7]}/config`}>
                                        <Button negative>Modify</Button>
                                    </Link>
                                </Cell>
                            </Row>
                        )
                    })}
                </Body>
            </Table>
        )
    }

    render(){
        console.log(this.props.tokensData)
        return(
            <Layout>
                <h2>User Page</h2>
                {this.renderTable()}
                <Link href={`/library/${this.props.userAddress}/userStore`}>
                    <a>
                       <Button primary>View Library</Button>
                    </a>
                </Link>
            </Layout>
        )
    }
}

export default UserOverview;