import "../css/my-account.css";
import store from "../store/index";

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom'; // This will render nested routes
import { clearAuthUser } from "../store/authSlice";
import { useDispatch } from "react-redux";

import { HomeOutlined, FileOutlined, UserOutlined, PoweroffOutlined} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, path, children) {
    return {
        key,
        icon,
        children,
        label: path ? <Link to={path}>{label}</Link> : label, // Use Link for navigation
    };
}

const items = [
    getItem('Dashboard', '1', <HomeOutlined />, 'home'),
    getItem('Customers', '2', <UserOutlined />, 'customers'),
    getItem('Orders', '7', <FileOutlined />, 'orders'),
    getItem('Inventory', '8', <FileOutlined />, 'inventory'),
];

const NavLayout = () => {
    const dispatch = useDispatch();
    const user = store.getState().auth.user;

    const [collapsed, setCollapsed] = useState(false);
    const [menuActive, setMenuActive] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMouseEnter = () => {
        setMenuActive(true);
    };

    const handleMouseLeave = () => {
        setMenuActive(false);
    };

    const signOut = () => {
        dispatch(clearAuthUser());
    };

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width="260px">
                <div className="demo-logo-vertical" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, }}>
                    <div onMouseLeave={handleMouseLeave}>
                        <div className="profile" onMouseEnter={handleMouseEnter}>
                            <div className="img-box">
                                <img src="https://via.placeholder.com/40x40" alt="some user image" />
                            </div>
                            <div className="user">
                                <span className="user-name">{user.firstname} {user.lastname}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>
                        <div className={`menu ${menuActive ? 'active' : ''}`}>
                            <ul className="account-block">
                                <li><UserOutlined /><a href="#" className="links">Profile</a></li>
                                <hr />
                                <li><PoweroffOutlined/><a href="#" className="links" onClick={signOut}>Sign Out</a></li>
                            </ul>
                        </div>
                    </div>
                </Header>
                <Content style={{margin: '0 16px'}}>
                    <Outlet/>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    JavaNrd {new Date().getFullYear()} Created by Naz
                </Footer>
            </Layout>
        </Layout>
    );
};

export default NavLayout;
