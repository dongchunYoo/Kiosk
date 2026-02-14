import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

function generateLicenseKey() {
    // 3자리-3자리-3자리-3자리 랜덤값 생성
    const part = () => Math.floor(100 + Math.random() * 900).toString();
    return `${part()}-${part()}-${part()}-${part()}`;
}

const AddLicenseModal = ({ storeId, onClose, onSuccess }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [expiryDt, setExpiryDt] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 기본값: 1년 뒤 날짜
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setExpiryDt(nextYear.toISOString().substring(0, 10));
        generateUniqueKey();
    }, []);

    const generateUniqueKey = async () => {
        setChecking(true);
        let key;
        let exists = true;
        let tryCount = 0;
        while (exists && tryCount < 10) {
            key = generateLicenseKey();
            try {
                const res = await apiClient.get(`/licenses/check-key?license_key=${key}`);
                exists = res.data.exists;
            } catch (err) {
                exists = true;
            }
            tryCount++;
        }
        setLicenseKey(key);
        setChecking(false);
        if (exists) setError('라이센스키 생성 실패. 다시 시도하세요.');
        else setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiClient.post('/licenses', {
                store_id: storeId,
                license_key: licenseKey,
                expiry_dt: expiryDt,
                device_id: deviceId || null
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || '등록 실패');
        }
    };

    return (
        <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-content" style={{ width: '400px', padding: '32px', background: '#fff', borderRadius: '8px' }}>
                <h3>라이센스 등록</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>License Key</label>
                        <input type="text" value={licenseKey} readOnly style={{ fontWeight: 'bold', letterSpacing: '2px' }} />
                        <button type="button" onClick={generateUniqueKey} disabled={checking} style={{ marginTop: '8px' }}>다시 생성</button>
                    </div>
                    <div className="form-group">
                        <label>만료 날짜</label>
                        <input type="date" value={expiryDt} onChange={e => setExpiryDt(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>기기번호</label>
                        <input type="text" value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="기기번호 (선택)" />
                    </div>
                    {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
                    <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                        <button type="submit" className="btn submit-btn" disabled={checking || !!error}>등록</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLicenseModal;
