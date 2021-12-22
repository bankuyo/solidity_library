import React from 'react';
import { Menu } from 'semantic-ui-react';

// Track status with redux after
const Header = () => {
    return (
        <Menu style={{marginTop: '15px'}}>
            <Menu.Item>Block Library</Menu.Item>
            <Menu.Menu position='right'>
                <Menu.Item>Login</Menu.Item>
                <Menu.Item>Register</Menu.Item>
            </Menu.Menu>
        </Menu>
    )
}

export default Header;