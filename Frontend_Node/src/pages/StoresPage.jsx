import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreList from '../components/StoreManagement/StoreList';
import EditStoreModal from '../components/StoreManagement/EditStoreModal';
import AddStoreModal from '../components/StoreManagement/AddStoreModal';
import AddGroupModal from '../components/StoreManagement/AddGroupModal';
import apiClient from '../services/api';
import { logError } from '../utils/logger';

const StoresPage = () => {
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [currentStore, setCurrentStore] = useState(null);
    const [refreshStores, setRefreshStores] = useState(false); // State to trigger store list refresh

    const handleEditStore = (store) => {
        setCurrentStore(store);
        setIsEditModalOpen(true);
    };

    const handleSaveEditStore = async (storeId, updatedData) => {
        try {
            await apiClient.put(`/stores/${storeId}`, updatedData);
            setIsEditModalOpen(false);
            setRefreshStores(prev => !prev); // Toggle to trigger refresh
        } catch (error) {
            logError('Failed to update store:', error);
            alert('매장 정보 업데이트에 실패했습니다.');
        }
    };

    const handleAddStore = () => {
        setIsAddStoreModalOpen(true);
    };

    const handleSaveAddStore = async (newData) => {
        try {
            await apiClient.post('/stores', newData);
            setIsAddStoreModalOpen(false);
            setRefreshStores(prev => !prev); // Toggle to trigger refresh
        } catch (error) {
            logError('Failed to create store:', error);
            alert('매장 생성에 실패했습니다.');
        }
    };

    const handleAddGroup = () => {
        setIsAddGroupModalOpen(true);
    };

    const handleSaveAddGroup = async (groupName) => {
        try {
            await apiClient.post('/store-groups', { name: groupName });
            setIsAddGroupModalOpen(false);
            setRefreshStores(prev => !prev); // Toggle to trigger refresh
        } catch (error) {
            logError('Failed to create group:', error);
            alert('그룹 생성에 실패했습니다.');
        }
    };

    const navigateToProducts = (storeId) => {
        navigate(`/products/${storeId}`);
    };

    return (
        <div>
            <StoreList
                onEditStore={handleEditStore}
                onAddStore={handleAddStore}
                onAddGroup={handleAddGroup}
                navigateToProducts={navigateToProducts}
                refreshStores={refreshStores} // Pass refresh state to trigger re-fetch in StoreList
            />

            {isEditModalOpen && (
                <EditStoreModal
                    store={currentStore}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEditStore}
                />
            )}

            {isAddStoreModalOpen && (
                <AddStoreModal
                    onClose={() => setIsAddStoreModalOpen(false)}
                    onSave={handleSaveAddStore}
                />
            )}

            {isAddGroupModalOpen && (
                <AddGroupModal
                    onClose={() => setIsAddGroupModalOpen(false)}
                    onSave={handleSaveAddGroup}
                />
            )}
        </div>
    );
};

export default StoresPage;
