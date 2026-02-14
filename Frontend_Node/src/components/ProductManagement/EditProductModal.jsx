import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { logError, logDebug, logWarn } from '../../utils/logger';

const EditProductModal = ({ product, onClose, onSave }) => {
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
                })
                .catch(error => logError('Failed to fetch categories', error));
        }
    }, [storeId]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                image_url: product.image_url || '',
                is_available: product.is_available === 1 || product.is_available === true,
                category_id: product.category_id || (categories[0]?.id || ''),
                store_id: storeId
            });
        }
    }, [product, categories, storeId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(product.id, formData);
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('image', file);
        if (product && product.id) {
            form.append('productId', product.id);
        }
        try {
            const res = await apiClient.post(`/products/upload/product/${storeId}`, form);
            const backendUrl = (res && (res.data && (res.data.url || (res.data.data && res.data.data.path) || res.data.path))) || null;
            if (!backendUrl) throw new Error('no_url');
            setFormData(prev => ({ ...prev, image_url: backendUrl }));
            setImageUploaded(true);
        } catch (err) {
            logError('[handleImageUpload] error', err);
            alert('이미지 업로드 실패');
        }
    };

    const getRelativeImageUrl = (url) => {
        const nodePath = import.meta.env.NodePath || 'http://localhost:3000';
        return url.startsWith(nodePath) ? url.replace(nodePath, '') : url;
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

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h2>상품 수정</h2>
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
                        <label htmlFor="editProductName">상품명</label>
                        <input type="text" id="editProductName" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editProductPrice">가격</label>
                        <input type="text" id="editProductPrice" name="price" value={formData.price ? Number(formData.price).toLocaleString('ko-KR') : ''} onChange={e => {
                            // 입력값에서 콤마 제거 후 숫자만 저장
                            const raw = e.target.value.replace(/,/g, '');
                            if (!isNaN(raw)) {
                                handleChange({
                                    target: { name: 'price', value: raw, type: 'text' }
                                });
                            }
                        }} required />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                        {/* 이미지 미리보기 */}
                        <div style={{ width: 80, height: 80, marginRight: 16, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                            {formData.image_url ? (
                                <img src={`${import.meta.env.NodePath || ''}${formData.image_url}`} alt="미리보기" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                                <span style={{ color: '#bbb', fontSize: 12 }}>이미지 없음</span>
                            )}
                        </div>
                        <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} style={{ flex: 1, marginRight: 8 }} />
                        <input type="file" id="imageUploadInput" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                        <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => document.getElementById('imageUploadInput').click()}>등록</button>
                    </div>
                    <div className="form-group form-group-inline">
                        <label>활성화</label>
                        <label className="switch">
                            <input type="checkbox" id="editProductEnable" name="is_available" checked={formData.is_available} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">저장</button>
                        <button type="button" className="btn cancel-btn" onClick={handleCancel}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;
