import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const AddCategoryModal = ({ onClose, onSave }) => {
    const { storeId } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!storeId) {
            alert('상점 ID가 필요합니다.');
            return;
        }
        onSave({ storeId, name, description });
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h2>카테고리 추가</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="categoryName">카테고리명</label>
                        <input
                            type="text"
                            id="categoryName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryDescription">설명</label>
                        <textarea
                            id="categoryDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">추가</button>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;
