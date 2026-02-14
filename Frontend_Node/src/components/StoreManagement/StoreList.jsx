import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { logError, logDebug } from '../../utils/logger';

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

const StoreList = ({ onEditStore, onAddStore, onAddGroup, navigateToProducts }) => {
    // 라이센스 페이지 이동 핸들러
    const navigateToLicense = (storeId) => {
        window.location.href = `/licenses/${storeId}`;
    };
    const [stores, setStores] = useState([]);
    const [storeGroups, setStoreGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');

    const [userRole, setUserRole] = useState(null);
    const [userShowStore, setUserShowStore] = useState(null);

    useEffect(() => {
        const claims = decodeToken();
        if (claims) {
            setUserRole(claims.role || null);
            setUserShowStore(claims.show_store || null);
        }
        fetchStoreGroups();
        fetchStores(claims);
    }, []);

    const fetchStoreGroups = async () => {
        try {
            const response = await apiClient.get('/store-groups');
            setStoreGroups(response.data);
        } catch (error) {
            logError('Failed to fetch store groups:', error);
            // Handle error, e.g., redirect to login if 401
        }
    };

    const fetchStores = async (claimsOrGroupId = '') => {
        try {
            // If called with claims object (on mount), use it. Otherwise decode token.
            const tokenClaims = (claimsOrGroupId && typeof claimsOrGroupId === 'object') ? claimsOrGroupId : decodeToken();

            // If no token, redirect to login
            if (!tokenClaims) {
                logDebug('[StoreList] no tokenClaims, redirecting to /login');
                window.location.href = '/login';
                return;
            }

            // Extract commonly used token claims
            const showGroup = tokenClaims.show_group || tokenClaims.showGroup || null;
            const showStore = tokenClaims.show_store || tokenClaims.showStore || null;

            // If A-role, fetch only assigned store
            if (tokenClaims.role === 'A') {
                try {
                    if (!showStore) {
                        logDebug('[StoreList] A-role user has no show_store assigned');
                        setStores([]);
                        return;
                    }
                    // call endpoint that takes store id to fetch specific store ensuring backend checks match
                    const res = await apiClient.get(`/stores/mine/${showStore}`);
                    setStores(res.data ? [res.data] : []);
                } catch (err) {
                    logError('Failed to fetch /stores/mine/:id:', err, err.response && err.response.status, err.response && err.response.data);
                    setStores([]);
                }
                return;
            }

            // If S-role (group-limited admin), fetch stores in their show_group
            if (tokenClaims.role === 'S') {
                try {
                    if (!showGroup) {
                        logDebug('[StoreList] S-role user has no show_group assigned');
                        setStores([]);
                    } else {
                        // default selected group to user's show_group
                        setSelectedGroup(String(showGroup));
                        const res = await apiClient.get(`/stores?groupId=${showGroup}`);
                        setStores(res.data || []);
                    }
                } catch (err) {
                    logError('Failed to fetch /stores for S role by group:', err, err.response && err.response.status, err.response && err.response.data);
                    setStores([]);
                }
                return;
            }

            // If super-admin, optionally filter by group
            if (tokenClaims.role === 'U') {
                const groupId = typeof claimsOrGroupId === 'string' ? claimsOrGroupId : '';
                const url = groupId ? `/stores?groupId=${groupId}` : '/stores';
                try {
                    const response = await apiClient.get(url);
                    const showStore = tokenClaims.show_store;
                    const showGroup = tokenClaims.show_group;
                    setStores(response.data);
                } catch (err) {
                    logError('Failed to fetch /stores for U role:', err, err.response && err.response.status, err.response && err.response.data);
                    setStores([]);
                }
                return;
            }

            // Other roles should not request /stores
            setStores([]);
        } catch (error) {
            logError('Failed to fetch stores:', error);
            setStores([]);


        }
    };

    const handleGroupFilterChange = (e) => {
        setSelectedGroup(e.target.value);
        fetchStores(e.target.value);
    };

    const handleViewAll = () => {
        setSelectedGroup('');
        fetchStores();
    };

    return (
        <div>
            <div className="header">
                <h2>매장목록</h2>
            </div>

            <div className="filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                {/* If user is A or S level, hide view-all, group filter and add buttons */}
                {(userRole === 'A' || userRole === 'S') ? (
                    <div />
                ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                        <select value={selectedGroup} onChange={handleGroupFilterChange}>
                            <option value="">전체 그룹</option>
                            {Array.isArray(storeGroups) && storeGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <button onClick={handleViewAll}>전체보기</button>
                        <div style={{ marginLeft: 'auto' }}>
                            <button onClick={onAddStore} style={{ marginRight: '8px' }}>매장추가</button>
                            <button onClick={onAddGroup}>그룹추가</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="store-list-header">
                <div className="store-details">
                    <span className="store-name">매장명</span>
                    <span className="store-group">그룹</span>
                    <span className="store-contact">연락처</span>
                    <span className="store-hours">영업시간</span>
                </div>
                <div className="edit-button-placeholder"></div>
            </div>
            <div className="store-list" id="store-list-container">
                {stores.length === 0 ? (
                    <p style={{ padding: '20px' }}>표시할 매장이 없습니다.</p>
                ) : (
                    (userRole === 'A' && userShowStore) ? (
                        (Array.isArray(stores) ? stores : [])
                            .filter(s => String(s.id) === String(userShowStore))
                            .map(store => (
                                <div key={store.id} className={`store-item ${!store.enable ? 'inactive' : ''}`}>
                                    <div className="store-details">
                                        <span className="store-name">{store.name}</span>
                                        <span className="store-group">{store.group_name || '그룹 없음'}</span>
                                        <span className="store-contact">{store.phone || '-'}</span>
                                        <span className="store-hours">{(store.open_dt && store.close_dt) ? `${store.open_dt} - ${store.close_dt}` : '-'}</span>
                                    </div>
                                    {/* Hide license button for A-level users; show it disabled for S-level users */}
                                    {userRole !== 'A' && (
                                        <button
                                            className="edit-button"
                                            onClick={() => { if (userRole === 'S') return; navigateToLicense(store.id); }}
                                            disabled={userRole === 'S'}
                                            style={{ marginRight: '8px', opacity: userRole === 'S' ? 0.5 : 1, cursor: userRole === 'S' ? 'not-allowed' : 'pointer' }}
                                        >
                                            라이센스
                                        </button>
                                    )}
                                    <button className="edit-button" onClick={() => onEditStore(store)}>수정</button>
                                    <button className="edit-button products-button" onClick={() => navigateToProducts(store.id)}>상품</button>
                                </div>
                            ))
                    ) : (
                        Array.isArray(stores) && stores.map(store => (
                            <div key={store.id} className={`store-item ${!store.enable ? 'inactive' : ''}`}>
                                <div className="store-details">
                                    <span className="store-name">{store.name}</span>
                                    <span className="store-group">{store.group_name || '그룹 없음'}</span>
                                    <span className="store-contact">{store.phone || '-'}</span>
                                    <span className="store-hours">{(store.open_dt && store.close_dt) ? `${store.open_dt} - ${store.close_dt}` : '-'}</span>
                                </div>
                                {/* Hide license button for A-level users; show it disabled for S-level users */}
                                {userRole !== 'A' && (
                                    <button
                                        className="edit-button"
                                        onClick={() => { if (userRole === 'S') return; navigateToLicense(store.id); }}
                                        disabled={userRole === 'S'}
                                        style={{ marginRight: '8px', opacity: userRole === 'S' ? 0.5 : 1, cursor: userRole === 'S' ? 'not-allowed' : 'pointer' }}
                                    >
                                        라이센스
                                    </button>
                                )}
                                <button className="edit-button" onClick={() => onEditStore(store)}>수정</button>
                                <button className="edit-button products-button" onClick={() => navigateToProducts(store.id)}>상품</button>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default StoreList;
