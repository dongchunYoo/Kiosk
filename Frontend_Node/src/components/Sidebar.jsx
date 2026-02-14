import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Helper to decode JWT
const getUserRole = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64)).role;
    } catch (e) {
        return null;
    }
};

const Sidebar = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        setUserRole(getUserRole());
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <h1>KIOSK</h1>
            <ul>
                <li><NavLink to="/" end>홈</NavLink></li>
                {/* If user is pending (F), hide other menu items */}
                {userRole !== 'F' && (
                    <>
                        <li><NavLink to="/stores">매장정보</NavLink></li>
                        <li><NavLink to="/sales">매출정보</NavLink></li>
                        {userRole === 'U' && (
                            <li><NavLink to="/users">회원정보</NavLink></li>
                        )}
                    </>
                )}
            </ul>
            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
        </div>
    );
};

export default Sidebar;
