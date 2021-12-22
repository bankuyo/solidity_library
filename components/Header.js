import React from 'react';
import { Menu } from 'semantic-ui-react';
import Link from 'next/link';

// Track status with redux after
const Header = () => {
    return (
        <Menu style={{marginTop: '15px'}}>
            <Link href={'/'}>
                <a className='item'>Block Library</a>
            </Link>
            <Menu.Menu position='right'>
                <Link href={'/'}>
                    <a className='item'>Login</a>
                </Link>
                <Link href={'/'}>
                    <a className='item'>Register</a>
                </Link>
            </Menu.Menu>
        </Menu>
    )
}

export default Header;