import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <main className="main-content" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
