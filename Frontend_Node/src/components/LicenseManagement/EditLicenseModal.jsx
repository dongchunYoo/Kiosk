import React, { useState } from 'react';
import apiClient from '../../services/api';

const EditLicenseModal = ({ license, onClose, onSuccess }) => {
    const [expiryDt, setExpiryDt] = useState(license.expiry_dt ? license.expiry_dt.substring(0, 10) : '');
    const [enable, setEnable] = useState(license.enable === 1 || license.enable === true);
    const [deviceId, setDeviceId] = useState(license.device_id || license.deviceId || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiClient.put(`/licenses/${license.id}`, {
                expiry_dt: expiryDt,
                enable: enable ? 1 : 0,
                device_id: deviceId || null
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || '수정 실패');
        }
    };

    return (
        <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-content" style={{ width: '400px', padding: '32px', background: '#fff', borderRadius: '8px' }}>
                <h3>라이센스 수정</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>만료 날짜</label>
                        <input type="date" value={expiryDt} onChange={e => setExpiryDt(e.target.value)} required />
                    </div>
                    <div className="form-group form-group-inline" style={{ marginTop: '16px' }}>
                        <label>활성화</label>
                        <label className="switch">
                            <input type="checkbox" checked={enable} onChange={e => setEnable(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                        <label>기기번호</label>
                        <input type="text" value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="기기번호 (선택)" />
                    </div>
                    {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
                    <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                        <button type="submit" className="btn submit-btn">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLicenseModal;
