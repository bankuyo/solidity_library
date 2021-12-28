import React, {useState, useEffect} from 'react';
import 'semantic-ui-css/semantic.min.css'
import {Container, Menu} from 'semantic-ui-react';


const Header = (props) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = (e, { name }) => {
        setActiveItem(name);
    };

    return(
        <Menu color='blue' size='large'>
            <Menu.Item
                key='library'
                active={activeItem === 'library'}
                onClick={handleItemClick}
            >Library</Menu.Item>
            <Menu.Menu position='right'>
                <Menu.Item
                    key='home'
                    active={activeItem === 'home'}
                    onClick={handleItemClick}
                >Home</Menu.Item>
                <Menu.Item
                    key='user'
                    active={activeItem === 'user'}
                    onClick={handleItemClick}
                >User</Menu.Item>
            </Menu.Menu>
        </Menu>
    );
}

export default Header;