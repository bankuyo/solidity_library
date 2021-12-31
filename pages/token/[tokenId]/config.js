import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Form, Input, Button, Label, Message} from 'semantic-ui-react';
import Router from 'next/router';

import Layout from '../../../components/Layout';
import library from '../../../ethereum/Library';
import web3 from '../../../ethereum/web3';

class ModifyToken extends React.Component {
    state = {
        period: this.props.period,
        cost: this.props.cost,
        allow: this.props.allowToContract,
        errorMessage: '',
        loading: false
    }

    static async getInitialProps({query}){
        const tokenId = query.tokenId;
        const token = await library.methods.getTokenData(tokenId).call();
        const book = await library.methods.getBookData(token[1]).call();
        const owner = await library.methods.ownerOf(tokenId).call();
        return ({
            title:book[2], period: token[3], cost: token[4], 
            allowToContract: token[2], tokenId, owner
        });
    }

    onSubmit = async event => {
        event.preventDefault();
        this.setState({loading: true, errorMessage:''});
        try {
            const accounts = await web3.eth.getAccounts();

            await library.methods.configBorrow(this.props.tokenId, this.state.period, this.state.cost).send({
                from: accounts[0]
            })
            Router.push(`/user/${this.props.owner}/overview`);

        } catch (err){
            this.setState({errorMessage: err.message})
        }
        this.setState({loading:false})
    }

    renderForm(){
        return (
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                    <Input labelPosition='right'>
                        <Label>period</Label>
                        <input 
                            value={this.state.period}
                            onChange={ event => this.setState({period: event.target.value})}
                        />
                        <Label color='teal'>days</Label>
                    </Input>
                </Form.Field>
                <Form.Field>
                    <Input labelPosition='right' >
                        <Label>Cost</Label>
                        <input 
                            value={this.state.cost}
                            onChange={ event => this.setState({cost: event.target.value})}
                        />
                        <Label color='teal'>wei</Label>
                    </Input>
                </Form.Field>
                <Message error content={this.state.errorMessage}/>
                <Button primary loading={this.state.loading}>Config</Button>
            </Form>
        );
    }


    render(){
        console.log(this.props.owner)
        return(
            <Layout>
                <h2>Modify Token</h2>
                <h3>{`Title: " ${this.props.title} "`}</h3>
                {this.renderForm()}
            </Layout>    
        );
    }
}

export default ModifyToken;