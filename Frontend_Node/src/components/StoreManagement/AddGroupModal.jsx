import React, { useState } from 'react';
import apiClient from '../../services/api';

const AddGroupModal = ({ onClose, onSave }) => {
    const [groupName, setGroupName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(groupName);
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h2>그룹 추가</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newGroupName">그룹명</label>
                        <input
                            type="text"
                            id="newGroupName"
                            name="name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">등록</button>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGroupModal;
