import React from 'react';
import library from '../../ethereum/Library';
import {Card, Button, Table, Message, Form} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import Layout from '../../components/Layout';
import web3 from '../../ethereum/web3';

class BookStore extends React.Component{
    state = {
        errorMessages: Array(this.props.numBook).fill(''),
        loadings: Array(this.props.numBook).fill(false)
    }

    static async getInitialProps(){
        const numBook = await library.methods.getTotalBook().call();
        const books =[];
        for(let i = 1; i <= numBook; i++){
            let book = await library.methods.getBookData(i).call();
            books.push({
                author: book[0], price: book[1], title: book[2],
                purchased: book[3], purchasers: book[4]
            });
        }
        return {books,numBook};
    }

    renderTableContent(author, price, purchased){
        const {Header, Row, Body, Cell, HeaderCell} = Table;
        return (
            <Table definition>
                <Header>
                    <Row>
                        <HeaderCell />
                        <HeaderCell>Data</HeaderCell>
                    </Row>
                </Header>
                
                <Body>
                    <Row>
                        <Cell>author</Cell>
                        <Cell>{author}</Cell>
                    </Row>
                    <Row>
                        <Cell>price</Cell>
                        <Cell>{price}</Cell>
                    </Row>
                    <Row>
                        <Cell>Number of purchased</Cell>
                        <Cell>{purchased}</Cell>
                    </Row>
                </Body>
            </Table>
        );
    }

    renderCard(){
        const bookCards = this.props.books.map((book,index) => {
            return ({
                header: book.title,
                description: (
                    <Form error={!!this.state.errorMessages[index]}>
                        {this.renderTableContent(
                            book.author,
                            book.price,
                            book.purchasers.length
                        )}
                        <Button 
                            primary 
                            loading = {this.state.loadings[index]}
                            onClick={() => this.onClick(index+1, book.price)}
                        >Buy</Button>
                        <Message error content={this.state.errorMessages[index]} />
                    </Form>
                ),
                fluid: true
            })
        })
        return <Card.Group items={bookCards}/>
    }

    onClick = async (bookId,payment) => {
        const accounts = await web3.eth.getAccounts();
        this.setLoading(bookId-1, true);
        this.setError(bookId-1, '');
        try {
            await library.methods.purchaseBook(bookId).send({
                from: accounts[0],
                value: payment
            });

        } catch (err){
            this.setError(bookId-1, err.message);
        }
        this.setLoading(bookId-1, false);
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

    render(){
        return(
            <Layout>
                <h2>BookStore</h2>
                {this.renderCard()}
            </Layout>
        );
    };
};

export default BookStore;