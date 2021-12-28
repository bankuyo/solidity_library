import React from 'react';
import "semantic-ui-css/semantic.min.css";
import {Card, Statistic, Button} from 'semantic-ui-react';
import Link from 'next/link';

import library from '../ethereum/Library';


import Layout from '../components/Layout'

class LandingPage extends React.Component {
    static async getInitialProps(){
        const purchasersAddress = await library.methods.getPurchasersAddress().call();
        const purchasers = [];
        for (let i = 0; i < purchasersAddress.length; i++){
            let purchaser= await library.methods.getUserData(purchasersAddress[i]).call();
            let purchaserTokenNum = purchaser.tokenIds.length;
            let purchaserData = {...purchaser, purchaserAddress:purchasersAddress[i], purchaserTokenNum };
            purchasers.push(purchaserData);
        }
        return {purchasers};
    }

    renderCard(){
        const purchaserCards = this.props.purchasers.map((purchaser) => {
            return ({
                header: (
                    <Link href={`/${purchaser.purchaserAddress}/library`}>
                        <a style={{fontSize:'20px', color: 'inherit'}}>{purchaser.purchaserAddress}</a>
                    </Link>),
                meta: 'overview',
                description: (
                    <div>
                        <Statistic label="Books" value={purchaser.purchaserTokenNum} />
                    </div>
                    ),
                fluid: true
            })
        })
        return <Card.Group items={purchaserCards}/>
    }

    render() {
        console.log(this.props.purchasers);
        return(
            <Layout>
                <h2>Landing Page</h2>
                {this.renderCard()}
            </Layout>
        );
    };
};

export default LandingPage;