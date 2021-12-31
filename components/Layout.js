import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import {Container} from 'semantic-ui-react';

import Header from './Header';


const Layout = (props) => {
    return(
        <div style={{marginTop: '12px'}}>
            <Container>
                <Header />
                {props.children}
            </Container>
        </div>
    );
}

export default Layout;