import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { logError } from '../../utils/logger';

const AddStoreModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        store_group_id: '',
        open_dt: '',
        close_dt: '',
        enable: true,
    });
    // 결제 정보 입력 영역: EditStoreModal과 동일하게
    const [paymentInfo, setPaymentInfo] = useState({
        bizNumber: '',
        vanType: '',
        PG_MERCHANT_ID: '',
        PG_PRIVATE_KEY: '',
        PG_PAYMENT_KEY: '',
    });

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [storeGroups, setStoreGroups] = useState([]);

    useEffect(() => {
        fetchStoreGroupsForModal();
    }, []);

    const fetchStoreGroupsForModal = async () => {
        try {
            const response = await apiClient.get('/store-groups');
            setStoreGroups(response.data);
        } catch (error) {
            logError('Failed to fetch store groups for modal:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, ...paymentInfo };
        onSave(payload);
    };

    return (
        <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-content" style={{ width: '1500px !important', minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* 상단: 가로 2분할 */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '32px', flex: 1 }}>
                    {/* 왼쪽: 매장 정보 */}
                    <div style={{ flex: 1, paddingRight: '24px', borderRight: '1px solid #eee' }}>
                        <h2>매장 추가</h2>
                        <div className="form-group">
                            <label htmlFor="addStoreName">매장명</label>
                            <input type="text" id="addStoreName" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addStorePhone">연락처</label>
                            <input type="text" id="addStorePhone" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addStoreAddress">주소</label>
                            <input type="text" id="addStoreAddress" name="address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addStoreGroup">그룹</label>
                            <select id="addStoreGroup" name="store_group_id" value={formData.store_group_id} onChange={handleChange}>
                                <option value="">그룹 선택 안함</option>
                                {Array.isArray(storeGroups) && storeGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="addStoreOpenDt">개점시간</label>
                            <input type="time" id="addStoreOpenDt" name="open_dt" value={formData.open_dt} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addStoreCloseDt">폐점시간</label>
                            <input type="time" id="addStoreCloseDt" name="close_dt" value={formData.close_dt} onChange={handleChange} required />
                        </div>
                        <div className="form-group form-group-inline">
                            <label>활성화</label>
                            <label className="switch">
                                <input type="checkbox" id="addStoreEnable" name="enable" checked={formData.enable} onChange={handleChange} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                    {/* 오른쪽: 결제 정보 */}
                    <div style={{ flex: 1, paddingLeft: '24px' }}>
                        <h3 style={{ marginBottom: '24px' }}>결제 정보</h3>
                        <div className="form-group">
                            <label htmlFor="bizNumber">사업자등록번호</label>
                            <input type="text" id="bizNumber" name="bizNumber" value={paymentInfo.bizNumber} onChange={handlePaymentChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vanType">Van Type</label>
                            <select id="vanType" name="vanType" value={paymentInfo.vanType} onChange={handlePaymentChange}>
                                <option value="">Select Van Type</option>
                                <option value="KIS">KIS</option>
                                <option value="KICC">KICC</option>
                                <option value="VPOS">VPOS</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="PG_MERCHANT_ID">MERCHANT_ID</label>
                            <input type="text" id="PG_MERCHANT_ID" name="PG_MERCHANT_ID" value={paymentInfo.PG_MERCHANT_ID} onChange={handlePaymentChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="PG_PRIVATE_KEY">PRIVATE_KEY</label>
                            <input type="text" id="PG_PRIVATE_KEY" name="PG_PRIVATE_KEY" value={paymentInfo.PG_PRIVATE_KEY} onChange={handlePaymentChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="PG_PAYMENT_KEY">PAYMENT_KEY</label>
                            <input type="text" id="PG_PAYMENT_KEY" name="PG_PAYMENT_KEY" value={paymentInfo.PG_PAYMENT_KEY} onChange={handlePaymentChange} required />
                        </div>
                    </div>
                </form>
                {/* 하단: 버튼 영역 */}
                <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px' }}>
                    <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                    <button type="submit" className="btn submit-btn" onClick={handleSubmit}>저장</button>
                </div>
            </div>
        </div>
    );
};

export default AddStoreModal;
