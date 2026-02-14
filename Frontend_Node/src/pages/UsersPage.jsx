import React, { useState } from 'react';
import UserList from '../components/UserManagement/UserList';
import EditUserModal from '../components/UserManagement/EditUserModal';
import apiClient from '../services/api';
import { logError } from '../utils/logger';

const UsersPage = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshUsers, setRefreshUsers] = useState(false); // State to trigger user list refresh

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveEditUser = async (userId, updatedData) => {
        try {
            await apiClient.put(`/users/${userId}`, updatedData);
            setIsEditModalOpen(false);
            setRefreshUsers(prev => !prev); // Toggle to trigger refresh
        } catch (error) {
            logError('Failed to update user:', error);
            alert('사용자 정보 업데이트에 실패했습니다.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;
        try {
            await apiClient.delete(`/users/${userId}`);
            setRefreshUsers(prev => !prev); // Toggle to trigger refresh
        } catch (error) {
            logError('Failed to delete user:', error);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    return (
        <div>
            <UserList
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                refreshUsers={refreshUsers}
            />

            {isEditModalOpen && (
                <EditUserModal
                    user={currentUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEditUser}
                />
            )}
        </div>
    );
};

export default UsersPage;
