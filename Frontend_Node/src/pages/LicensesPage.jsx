import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { logError } from '../utils/logger';
import AddLicenseModal from '../components/LicenseManagement/AddLicenseModal';
import EditLicenseModal from '../components/LicenseManagement/EditLicenseModal';

// decode jwt helper
const decodeToken = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
};

const LicensesPage = () => {
    const { storeId } = useParams();
    const [licenses, setLicenses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editLicense, setEditLicense] = useState(null);
    const [storeName, setStoreName] = useState('');
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchLicenses();
        fetchStoreName();
        const claims = decodeToken();
        if (claims) setUserRole(claims.role || null);
    }, [storeId]);

    const fetchStoreName = async () => {
        try {
            const response = await apiClient.get(`/stores/${storeId}`);
            setStoreName(response.data.name || '');
        } catch (error) {
            setStoreName('');
        }
    };

    const fetchLicenses = async () => {
        try {
            const response = await apiClient.get(`/licenses?store_id=${storeId}`);
            const extract = (res) => {
                if (!res) return [];
                if (Array.isArray(res.data)) return res.data;
                if (res.data && Object.prototype.hasOwnProperty.call(res.data, 'data')) return res.data.data;
                return Array.isArray(res) ? res : (res.data || []);
            };
            setLicenses(extract(response));
        } catch (error) {
            logError('Failed to fetch licenses:', error);
            setLicenses([]);
        }
    };

    const handleAddLicense = () => {
        setShowAddModal(true);
    };

    const handleDeleteLicense = async (licenseId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await apiClient.delete(`/licenses/${licenseId}`);
            fetchLicenses();
        } catch (err) {
            alert('삭제 실패');
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>{storeName ? `${storeName} (라이센스관리)` : '라이센스관리'}</h2>
                <button
                    className="btn"
                    style={{ marginRight: '8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: userRole === 'A' || userRole === 'S' ? 'not-allowed' : 'pointer', opacity: userRole === 'A' || userRole === 'S' ? 0.6 : 1 }}
                    onClick={() => { if (!(userRole === 'A' || userRole === 'S')) handleAddLicense(); }}
                    disabled={userRole === 'A' || userRole === 'S'}
                >등록</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>License Key</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>만료날짜</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>기기번호</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>등록유무</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {!Array.isArray(licenses) || licenses.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>라이센스가 없습니다.</td></tr>
                    ) : (
                        licenses.map(lic => (
                            <tr key={lic.id}>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{lic.license_key}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{lic.expiry_dt ? lic.expiry_dt.substring(0, 10) : '-'}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{lic.device_id || lic.deviceId || '-'}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{lic.uuid ? '등록됨' : '미등록'}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                                    <button
                                        className="edit-button"
                                        style={{ marginRight: '8px', cursor: userRole === 'A' || userRole === 'S' ? 'not-allowed' : 'pointer', opacity: userRole === 'A' || userRole === 'S' ? 0.6 : 1 }}
                                        onClick={() => { if (!(userRole === 'A' || userRole === 'S')) setEditLicense(lic); }}
                                        disabled={userRole === 'A' || userRole === 'S'}
                                    >수정</button>
                                    <button
                                        className="edit-button"
                                        style={{ background: '#d32f2f', color: '#fff', marginRight: '0', cursor: userRole === 'A' || userRole === 'S' ? 'not-allowed' : 'pointer', opacity: userRole === 'A' || userRole === 'S' ? 0.6 : 1 }}
                                        onClick={() => { if (!(userRole === 'A' || userRole === 'S')) handleDeleteLicense(lic.id); }}
                                        disabled={userRole === 'A' || userRole === 'S'}
                                    >삭제</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {showAddModal && (
                <AddLicenseModal
                    storeId={storeId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchLicenses(); }}
                />
            )}
            {editLicense && (
                <EditLicenseModal
                    license={editLicense}
                    onClose={() => setEditLicense(null)}
                    onSuccess={() => { setEditLicense(null); fetchLicenses(); }}
                />
            )}
        </div>
    );
};

export default LicensesPage;
