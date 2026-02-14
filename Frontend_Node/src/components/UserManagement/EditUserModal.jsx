import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { logError } from '../../utils/logger';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: '',
        show_group: '',
        show_store: '',
    });
    const [storeGroups, setStoreGroups] = useState([]);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                role: user.role || '',
                show_group: user.show_group || '',
                show_store: user.show_store || '',
            });
        }
        populateGroups();
    }, [user]);

    useEffect(() => {
        if (formData.show_group) {
            populateStores(formData.show_group);
        } else {
            setStores([]);
        }
    }, [formData.show_group]);

    const populateGroups = async () => {
        try {
            const response = await apiClient.get('/store-groups');
            setStoreGroups(response.data);
        } catch (error) {
            logError('Failed to fetch store groups:', error);
        }
    };

    const populateStores = async (groupId) => {
        try {
            let url = '/stores';
            if (groupId) {
                url += `?groupId=${groupId}`;
            }
            const response = await apiClient.get(url);
            setStores(response.data);
        } catch (error) {
            logError('Failed to fetch stores:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(user.id, formData);
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h2>사용자 수정</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="editName">이름</label>
                        <input type="text" id="editName" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editPhone">전화번호</label>
                        <input type="text" id="editPhone" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editShowGroup">그룹</label>
                        <select id="editShowGroup" name="show_group" value={formData.show_group} onChange={handleChange}>
                            <option value="">그룹 선택</option>
                            {Array.isArray(storeGroups) && storeGroups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="editShowStore">매장</label>
                        <select id="editShowStore" name="show_store" value={formData.show_store} onChange={handleChange}>
                            <option value="">매장 선택</option>
                            {Array.isArray(stores) && stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="editRole">등급</label>
                        <select id="editRole" name="role" value={formData.role} onChange={handleChange}>
                            <option value="F">대기</option>
                            <option value="A">점주</option>
                            <option value="S">대리점</option>
                            <option value="U">관리자</option>
                        </select>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">저장</button>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
