import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Button, Message, Form, Input} from 'semantic-ui-react';
import libraryFactory from '../../ethereum/instances/libraryFactory';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/web3';
import Router from 'next/router';

class createLibrary extends React.Component {
    state = {
        maxBorrowing: '',
        loading: false,
        errorMessage: ''
    }

    onChange = (event) => {
        this.setState({maxBorrowing: event.target.value});
    }

    onSubmit = async (event)  => {
        event.preventDefault();
        this.setState({loading : true, errorMessage: ''});
        try {
            const accounts = await web3.eth.getAccounts();
            console.log(event.target.value)
            await libraryFactory.methods.createLibrary(this.state.maxBorrowing).send({
                from : accounts[0]
            });
            Router.push('/');
        } catch (err){
            this.setState({errorMessage: err.message})
        }
        this.setState({loading : false});
    }

    renderForm () {
        return(
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                    <label>Max Borrowing Number</label>
                    <Input value = {this.state.maxBorrowing} onChange={this.onChange}/>
                </Form.Field>

                <Message error header="Failed!" content={this.state.errorMessage} />
                <Button loading={this.state.loading} primary>Create</Button>
            </Form>
        );
    }

    render(){
        return(
            <Layout>
                <h2>Create Library</h2>
                {this.renderForm()}
            </Layout>
        );
    }
}

export default createLibrary;