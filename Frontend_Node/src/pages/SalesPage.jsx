
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { logError, logDebug } from '../utils/logger';

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

const SalesPage = () => {
    const [cooldown, setCooldown] = useState(0);

    // 조회 버튼 쿨타임 카운트다운
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [stores, setStores] = useState([]);
    const [storeId, setStoreId] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [userShowStore, setUserShowStore] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    // 전체 총합 계산 (상태가 'completed'이고 취소유무가 '아니오'인 경우)
    const totalCompletedAmount = (rows || [])
        .filter(r => r && r.status === 'completed' && !r.is_cancelled)
        .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    useEffect(() => {
        // 기본 날짜: 오늘 -7 부터 오늘
        const today = new Date();
        const prior = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const fmt = d => d.toISOString().slice(0, 10);
        setFrom(fmt(prior));
        setTo(fmt(today));
        const claims = decodeToken();
        if (claims) {
            setUserRole(claims.role || null);
            setUserShowStore(claims.show_store || null);
        }
        fetchStores(claims);
    }, []);

    const fetchStores = async (claims = null) => {
        try {
            const tokenClaims = claims || decodeToken();
            // If no token, redirect to login
            if (!tokenClaims) {
                logDebug('[SalesPage] no tokenClaims, redirecting to /login');
                window.location.href = '/login';
                return;
            }

            const role = tokenClaims.role;
            const showStore = tokenClaims.show_store || tokenClaims.showStore || null;
            const showGroup = tokenClaims.show_group || tokenClaims.showGroup || null;

            if (role === 'A') {
                // A-role: call /stores/mine/:id with show_store
                try {
                    if (!showStore) {
                        logDebug('[SalesPage] A-role user has no show_store assigned');
                        setStores([]);
                    } else {
                        const res = await apiClient.get(`/stores/mine/${showStore}`);
                        const store = res.data ? [res.data] : [];
                        setStores(store);
                        setStoreId(String(showStore));
                    }
                } catch (e) {
                    logError('Failed to fetch /stores/mine/:id for A role', e, e.response && e.response.status, e.response && e.response.data);
                    setStores([]);
                }
                return;
            }

            // U (super admin) is allowed to fetch all stores
            if (role === 'U') {
                try {
                    const res = await apiClient.get('/stores');
                    setStores(res.data || []);
                } catch (e) {
                    logError('Failed to fetch /stores for U role', e);
                    setStores([]);
                }
                return;
            }

            // S (group-level admin): fetch stores in their group so store names resolve in reports
            if (role === 'S') {
                try {
                    if (showGroup) {
                        const res = await apiClient.get(`/stores?groupId=${showGroup}`);
                        setStores(res.data || []);
                    } else {
                        // If only show_store is present, call server endpoint that finds group by user's show_store
                        const res = await apiClient.get('/stores/group/by-my-store');
                        setStores(res.data || []);
                    }
                } catch (e) {
                    logError('Failed to fetch stores for S role', e);
                    setStores([]);
                }
                return;
            }

            // Other roles (F, etc.) should not call /stores; show none
            setStores([]);
        } catch (err) {
            logError('Failed to fetch stores for sales page', err);
        }
    };

    const getStoreName = (id) => {
        const s = (Array.isArray(stores) ? stores : []).find(x => String(x.id) === String(id));
        return s ? s.name : id || '';
    };

    const fetchSales = async (storeParam = '') => {
        if (cooldown > 0) return;
        if (!from || !to) return alert('from/to 날짜를 입력하세요');
        setLoading(true);
        setCooldown(5);
        try {
            // Query PaymentReceipt table by payment_time
            // If caller passes empty string '', treat as no-selection (all stores)
            let targetStore;
            if (typeof storeParam !== 'undefined') {
                targetStore = storeParam === '' ? undefined : storeParam;
            } else {
                targetStore = storeId === '' ? undefined : storeId;
            }

            const params = { from, to };
            if (typeof targetStore !== 'undefined' && targetStore !== null) params.storeId = targetStore;
            const res = await apiClient.get('/admin/receipts', { params });
            setRows(res.data || []);
        } catch (err) {
            logError('Failed to fetch receipts', err);
            alert('매출(영수증) 정보를 불러오는 데 실패했습니다. 콘솔을 확인하세요.');
        } finally {
            setLoading(false);
        }
    };

    const exportCsv = () => {
        if (!rows || rows.length === 0) return alert('내보낼 데이터가 없습니다');
        const header = ['store_name', 'storeId', 'payment_time', 'total_amount', 'is_cancelled', 'status'];
        const csv = [header.join(',')]
            .concat(rows.map(r => {
                const storeName = getStoreName(r.storeId);
                const fields = [storeName, r.storeId, r.payment_time, r.total_amount, r.is_cancelled, r.status];
                return fields.map(v => {
                    if (v === null || typeof v === 'undefined') return '';
                    if (typeof v === 'string') return `"${String(v).replace(/"/g, '""')}"`;
                    return v;
                }).join(',');
            }))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_${from}_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ paddingTop: 24 }}>
            <div className="header">
                <h2>매출정보</h2>
            </div>

            {/* 전체 총합 구간 */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>
                    총합: {totalCompletedAmount.toLocaleString()} 원
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: 0, padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: 0 }}>
                    <span style={{ minWidth: 60, textAlign: 'right', marginLeft: 0, marginRight: 0 }}>From</span>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        style={{ width: 180, borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', padding: '4px 12px', fontSize: 16, boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: 0 }}>
                    <span style={{ minWidth: 40, textAlign: 'right', marginLeft: 0, marginRight: 0 }}>To</span>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        style={{ width: 180, borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', padding: '4px 12px', fontSize: 16, boxSizing: 'border-box' }}
                    />
                </div>
                {/* Hide store selector and label for A-role and S-role users */}
                {!(userRole === 'A') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: 0 }}>
                        <span style={{ minWidth: 40, textAlign: 'right', marginLeft: 8, marginRight: 8 }}>매장</span>
                        <select
                            value={storeId}
                            onChange={e => {
                                const v = e.target.value;
                                setStoreId(v);
                                // When user selects a store from the dropdown, trigger 조회 automatically.
                                // Pass the selected value to fetchSales so it doesn't rely on state update timing.
                                fetchSales(v);
                            }}
                            style={{ width: 100, borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', padding: '4px 12px', fontSize: 16, boxSizing: 'border-box' }}
                        >
                            <option value="">전체</option>
                            {Array.isArray(stores) ? stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>) : null}
                        </select>
                    </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                    <button
                        onClick={() => fetchSales(storeId)}
                        disabled={cooldown > 0 || loading}
                        style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, opacity: cooldown > 0 || loading ? 0.6 : 1 }}
                    >
                        {loading ? '조회중...' : (cooldown > 0 ? cooldown : '조회')}
                    </button>
                    <button onClick={exportCsv} style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>CSV 내보내기</button>
                </div>
            </div>

            <div>
                {rows.length === 0 ? (
                    <p style={{ padding: 20 }}>조회된 매출 정보가 없습니다.</p>
                ) : (
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                {userRole !== 'A' && <th style={{ padding: '8px' }}>상점명</th>}
                                <th style={{ padding: '8px' }}>금액</th>
                                <th style={{ padding: '8px' }}>취소유무</th>
                                <th style={{ padding: '8px' }}>상태</th>
                                <th style={{ padding: '8px' }}>결제시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(rows) && rows.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    {userRole !== 'A' && <td style={{ padding: '8px' }}>{getStoreName(r.storeId)}</td>}
                                    <td style={{ padding: '8px' }}>{Number(r.total_amount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '8px' }}>{r.is_cancelled ? '예' : '아니오'}</td>
                                    <td style={{ padding: '8px' }}>{r.status}</td>
                                    <td style={{ padding: '8px' }}>{r.payment_time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesPage;
