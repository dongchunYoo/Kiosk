import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { logError } from '../../utils/logger';

const getRoleDisplayName = (role) => {
    switch (role) {
        case 'F': return '대기';
        case 'A': return '점주';
        case 'S': return '대리점';
        case 'U': return '관리자';
        default: return role;
    }
};

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        logError('Error decoding token:', error);
        return null;
    }
};

const UserList = ({ onEditUser, onDeleteUser, refreshUsers }) => {
    const [users, setUsers] = useState([]);
    const [storeGroups, setStoreGroups] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [loggedInUserRole, setLoggedInUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        const decodedToken = token ? decodeToken(token) : null;
        setLoggedInUserRole(decodedToken ? decodedToken.role : null);
        fetchUsers(filterType, filterValue);
        if (filterType === 'group') {
            fetchStoreGroups();
        }
    }, [filterType, filterValue, refreshUsers]);

    const fetchStoreGroups = async () => {
        try {
            const response = await apiClient.get('/store-groups');
            setStoreGroups(response.data);
        } catch (error) {
            logError('Failed to fetch store groups:', error);
        }
    };

    const fetchUsers = async (type = 'all', value = '') => {
        try {
            let url = '/users';
            const params = new URLSearchParams();
            if (type !== 'all') {
                params.append('filterType', type);
                if (value) {
                    params.append('filterValue', value);
                }
            }
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await apiClient.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            logError('Failed to fetch users:', error);
            alert('사용자 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setFilterValue(''); // Reset filter value when type changes
    };

    const handleFilterValueChange = (e) => {
        setFilterValue(e.target.value);
    };

    const renderFilterValueDropdown = () => {
        if (filterType === 'role') {
            return (
                <select id="filterValueDropdown" value={filterValue} onChange={handleFilterValueChange}>
                    <option value="">모두</option>
                    <option value="F">대기</option>
                    <option value="A">점주</option>
                    <option value="S">대리점</option>
                    <option value="U">관리자</option>
                </select>
            );
        } else if (filterType === 'group') {
            return (
                <select id="filterValueDropdown" value={filterValue} onChange={handleFilterValueChange}>
                    <option value="">모두</option>
                    {Array.isArray(storeGroups) && storeGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
            );
        } else {
            return null;
        }
    };

    return (
        <div>
            <div className="header">
                <h2>사용자 관리</h2>
            </div>
            <div className="filters">
                <select id="filterTypeDropdown" style={{ marginRight: '10px' }} value={filterType} onChange={handleFilterTypeChange}>
                    <option value="all">모두</option>
                    <option value="role">등급</option>
                    <option value="group">그룹</option>
                </select>
                {renderFilterValueDropdown()}
            </div>
            <div className="store-list-header">
                <div className="store-details">
                    <span className="user-id-header">ID</span>
                    <span className="user-user_id-header">사용자 ID</span>
                    <span className="user-name-header">이름</span>
                    <span className="user-phone-header">전화번호</span>
                    <span className="user-role-header">등급</span>
                    <span className="user-created_at-header">생성일</span>
                </div>
                <div className="edit-button-placeholder"></div>
            </div>
            <div className="store-list" id="users-list-container">
                {users.length === 0 ? (
                    <p style={{ padding: '20px' }}>표시할 사용자가 없습니다.</p>
                ) : (
                    Array.isArray(users) && users.map(user => (
                        <div key={user.id} className="store-item">
                            <div className="store-details">
                                <span className="user-id">{user.id}</span>
                                <span className="user-user_id">{user.user_Id}</span>
                                <span className="user-name">{user.name}</span>
                                <span className="user-phone">{user.phone}</span>
                                <span className="user-role">{getRoleDisplayName(user.role)}</span>
                                <span className="user-created_at">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            {loggedInUserRole === 'U' && (
                                <button className="edit-button" onClick={() => onEditUser(user)}>수정</button>
                            )}
                            {loggedInUserRole === 'U' && (
                                <button className="edit-button delete-button" onClick={() => onDeleteUser(user.id)}>삭제</button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
