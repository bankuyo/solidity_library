import React from 'react';
import {Form, Button, Input, Message } from 'semantic-ui-react';
import "semantic-ui-css/semantic.min.css";
import Router from 'next/router'

import web3 from '../../ethereum/web3';
import library from '../../ethereum/Library';

class AddBookPage extends React.Component {
    state = {
        author : '',
        price : '',
        title: '',
        errorMessage: '',
        loading: false
    }

    renderForm(){
        return(
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                    <label>Title</label>
                    <Input 
                        placeholder='Title'
                        value={this.state.title}
                        onChange={event => this.setState({title: event.target.value})}    
                    />
                </Form.Field>
                <Form.Field>
                    <label>Author Address</label>
                    <Input 
                        placeholder='Author Address'
                        value={this.state.author}
                        onChange={event => this.setState({author: event.target.value})}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Price</label>
                    <Input 
                        placeholder='Price'
                        value={this.state.price}
                        onChange={event => this.setState({price: event.target.value})}    
                    />
                </Form.Field>

                <Message error content={this.state.errorMessage} />    
                <Button primary loading={this.state.loading}>Submit</Button>
            </Form>
        )
    }

    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({loading: true, errorMessage: ''});
        const accounts = await web3.eth.getAccounts();

        try{
            await library.methods.addBook(this.state.author,this.state.price,this.state.title).send({
                from: accounts[0]
            })
            Router.push('/book/store')
        } catch (err){
            this.setState({errorMessage: err.message});
        }
        this.setState({loading: false});
    }

    render(){
        return(
            <div>
                <h2>Add Book</h2>
                {this.renderForm()}
            </div>
        );
    }
}
export default AddBookPage;