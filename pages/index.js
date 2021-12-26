import React from 'react';
import "semantic-ui-css/semantic.min.css";
import {Card} from 'semantic-ui-react';

import library from '../ethereum/Library';

class LandingPage extends React.Component {
    static async getInitialProps(){
        const tokenNum = await library.methods.totalSupply().call();

        const tokens = [];
        for(let i = 1; i <= tokenNum; i++){
            let token = await library.methods.getTokenData(i).call();
            let tokenOwner = await library.methods.ownerOf(i).call();
            let tokenData = {...token, owner: tokenOwner};
            tokens.push(tokenData);
        }
        return {tokens};
    }

    renderCard(){
        const tokenCards = this.props.tokens.map((token) => {
            return ({
                header: token.owner,
                meta: `You must return book at ${token.period} days after`,
                description: `Borrwoing cost: ${token.cost} wei`,
                fluid: true
            })
        })
        return <Card.Group items={tokenCards}/>
    }

    render() {
        return(
            <div>
                <h2>Landing Page</h2>
                {this.renderCard()}
            </div>
        );
    };
};

export default LandingPage;