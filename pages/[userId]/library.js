import React from 'react';
import "semantic-ui-css/semantic.min.css";
import {Card, Form, Button, Message} from 'semantic-ui-react';

import Layout from '../../components/Layout';
import library from '../../ethereum/Library';
import web3 from '../../ethereum/web3';

class Library extends React.Component {
    state = {
        errorMessages: Array(this.props.numBook).fill(''),
        loadings: Array(this.props.numBook).fill(false)
    }

    static async getInitialProps({query}){
        const userAddress = query.userId;

        const user = await library.methods.getUserData(userAddress).call();
        const tokenIds = user.tokenIds;
        const tokens = [];

        for(let i =0; i < tokenIds.length; i++){
            let token = await library.methods.getTokenData(tokenIds[i]).call();
            let book = await library.methods.getBookData(token.bookId).call();
            let tokenData = {...token, title: book.title, tokenId: tokenIds[i]};
            tokens.push(tokenData);
        }
        return {tokens, userAddress};
    }


    renderCard(){
        const tokenCards = this.props.tokens.map((token,index) => {
            return ({
                header: token.title,
                meta: `You must return book at ${token.period} days after`,
                description: (
                    <div>
                        <p>{`Borrwoing cost: ${token.cost} wei`}</p>
                        <Form error={!!this.state.errorMessages[index]}>
                            <Button 
                                primary 
                                onClick={()=> this.onClickBorrow(index, token.tokenId, token.cost)} 
                            >Borrow</Button>
                            <Button 
                                negative 
                                onClick={() => this.onClickReturn(index, token.tokenId)}
                            >Return</Button>
                            <Message error content={this.state.errorMessages[index]} />
                        </Form>
                    </div>
                )
                ,
                fluid: true
            })
        })
        return <Card.Group items={tokenCards}/>
    }
    
    onClickBorrow = async (index, tokenId, payment) => {
        this.setLoading(index, true);
        this.setError(index, '');
        try {
            const accounts = await web3.eth.getAccounts();
            await library.methods.borrowBook(tokenId).send({
                from: accounts[0],
                value: payment
            });
        } catch (err){
            this.setError(index, err.message);
        }
        this.setLoading(index, false);
    }

    onClickReturn = async (index, tokenId) => {
        this.setLoading(index, true);
        this.setError(index, '');
        try {
            const accounts = await web3.eth.getAccounts();
            await library.methods.returnBook(tokenId).send({
                from: accounts[0]
            });
        } catch (err){
            this.setError(index, err.message);
        }
        this.setLoading(index, false);
    }

    setLoading(index, isLoading){
        let loadings = [...this.state.loadings];
        loadings[index] = isLoading;
        this.setState({loadings});
    }

    setError(index, err){
        console.log(err)
        let errorMessages = [...this.state.errorMessages];
        errorMessages[index] = err;
        this.setState({errorMessages});
    }

    render() {
        return(
            <Layout>
                <h2>Library: {this.props.userAddress}</h2>
                {this.renderCard()}
            </Layout>
        );
    };
};

export default Library;