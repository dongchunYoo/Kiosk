import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { logError, logDebug, logWarn } from '../../utils/logger';

const AddProductModal = ({ onClose, onSave }) => {
    const { storeId } = useParams();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        is_available: true,
        category_id: '',
        store_id: storeId
    });
    const [imageUploaded, setImageUploaded] = useState(false);

    useEffect(() => {
        if (storeId) {
            apiClient.get(`/categories/${storeId}`)
                .then(response => {
                    setCategories(response.data);
                    if (response.data.length > 0) {
                        setFormData(prev => ({ ...prev, category_id: response.data[0].id }));
                    }
                })
                .catch(error => logError('Failed to fetch categories', error));
        }
    }, [storeId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // NodePath 제거 함수
    const getRelativeImageUrl = (url) => {
        const nodePath = import.meta.env.NodePath || 'http://localhost:3000';
        // 항상 /image/... 형태로 반환
        if (url.startsWith(nodePath)) {
            return url.replace(nodePath, '');
        }
        if (!url.startsWith('/image')) {
            return `/image${url}`;
        }
        return url;
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('image', file);
        // 상품 등록 전이므로 productId는 없음
        try {
            // Let axios set Content-Type with proper multipart boundary
            const res = await apiClient.post(`/products/upload/product/${storeId}`, form);
            // Support multiple backend shapes: top-level `url`, or `data.path`, or `data.url`.
            const backendUrl = (res && (res.data && (res.data.url || (res.data.data && res.data.data.path) || res.data.path))) || null;
            if (!backendUrl) {
                throw new Error('no_url');
            }
            const relativeUrl = getRelativeImageUrl(backendUrl);
            setFormData(prev => ({ ...prev, image_url: relativeUrl }));
            setImageUploaded(true);
        } catch (err) {
            logError('[handleImageUpload] error', err);
            alert('이미지 업로드 실패');
        }
    };

    // 취소 버튼 핸들러
    const handleCancel = async () => {
        const relativeUrl = getRelativeImageUrl(formData.image_url);
        if (imageUploaded && relativeUrl && relativeUrl.startsWith('/')) {
            logDebug('[취소] 이미지 삭제 요청:', relativeUrl);
            try {
                const res = await apiClient.post('/products/delete-image', { imageUrl: relativeUrl });
                logDebug('[취소] 이미지 삭제 응답:', res.data);
            } catch (err) {
                logWarn('[취소] 이미지 삭제 실패:', err);
            }
        }
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 상품 등록 후, 등록된 상품 객체를 반환
        try {
            const res = await apiClient.post('/products', formData);
            onSave(res.data); // 등록된 상품 객체 반환
        } catch (error) {
            alert('상품 추가에 실패했습니다.');
        }
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h2>상품 추가</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>카테고리</label>
                        <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                            {Array.isArray(categories) && categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>상품명</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>가격</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                        {/* 이미지 미리보기 */}
                        <div style={{ width: 80, height: 80, marginRight: 16, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                            {formData.image_url ? (
                                <img src={`${import.meta.env.NodePath}${formData.image_url}`} alt="미리보기" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                                <span style={{ color: '#bbb', fontSize: 12 }}>이미지 없음</span>
                            )}
                        </div>
                        <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} style={{ flex: 1, marginRight: 8 }} />
                        <input type="file" id="addImageUploadInput" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                        <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => document.getElementById('addImageUploadInput').click()}>등록</button>
                    </div>
                    <div className="form-group">
                        <label>활성화</label>
                        <label className="switch">
                            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">추가</button>
                        <button type="button" className="btn cancel-btn" onClick={handleCancel}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
