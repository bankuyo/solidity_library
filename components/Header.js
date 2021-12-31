import React, {useState, useEffect} from 'react';
import 'semantic-ui-css/semantic.min.css'
import {Container, Menu} from 'semantic-ui-react';
import Router from 'next/router';

import web3 from '../ethereum/web3';


const Header = (props) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = async (e, { name }) => {
        setActiveItem(name);
        console.log(name)
        let path;
        if(name === 'library' || name === 'home'){
            path = '/';
        } else if (name === 'store'){
            path ='/book/store';
        } 
        else if(name ==='user'){
            const accounts = await web3.eth.getAccounts();
            path = `/user/${accounts[0]}/overview`;
        } else{
            return;
        }
        Router.push(path);
    };

    return(
        <Menu color='blue' size='large'>
            <Menu.Item
                key='library'
                name='library'
                active={activeItem === 'library'}
                onClick={handleItemClick}
            >Library</Menu.Item>
            <Menu.Menu position='right'>
                <Menu.Item
                    key='home'
                    name='home'
                    active={activeItem === 'home'}
                    onClick={handleItemClick}
                >Home</Menu.Item>
                <Menu.Item
                    key='user'
                    name='user'
                    active={activeItem === 'user'}
                    onClick={handleItemClick}
                >User</Menu.Item>
                <Menu.Item
                    key='store'
                    name='store'
                    active={activeItem === 'store'}
                    onClick={handleItemClick}
                >Store</Menu.Item>
            </Menu.Menu>
        </Menu>
    );
}

export default Header;