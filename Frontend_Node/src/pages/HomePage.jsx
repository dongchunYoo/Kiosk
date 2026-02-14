import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { pageLoad } from '../utils/apiLogger.js';
import { logError, logDebug } from '../utils/logger';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import apiClient from '../services/api';

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

const CircleGauge = ({ percent = 0, size = 144, stroke = 15 }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, percent));
    const dash = (clamped / 100) * c;
    const strokeColor = clamped >= 90 ? '#f44336' : (clamped >= 70 ? '#ff9800' : '#1976d2');
    const fontSize = Math.max(12, Math.round(size * 0.12));
    const textY = Math.round(fontSize / 3);
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
            <g transform={`translate(${size / 2}, ${size / 2})`}>
                <circle r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
                <circle r={r} fill="none" stroke={strokeColor} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90)`} />
                <text x="0" y={textY} textAnchor="middle" fontSize={fontSize} fontWeight={600} fill={strokeColor}>{Math.round(clamped)}%</text>
            </g>
        </svg>
    );
};

const HomePage = () => {
    const [redisMetrics, setRedisMetrics] = useState(null);
    const [kafkaMetrics, setKafkaMetrics] = useState(null);
    const [redisLoading, setRedisLoading] = useState(false);
    const [kafkaLoading, setKafkaLoading] = useState(false);
    const [rateRemaining, setRateRemaining] = useState(null);

    // missing state hooks (restored)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rpm, setRpm] = useState(null);
    const [rpmLoading, setRpmLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [topLatency, setTopLatency] = useState([]);
    const [topCount, setTopCount] = useState([]);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [cpuUsage, setCpuUsage] = useState(null);
    const [memUsage, setMemUsage] = useState(null);
    const [systemLoading, setSystemLoading] = useState(false);

    // Polling configuration
    const DEFAULT_POLL_MS = 20000; // global default: 20s
    const HOME_POLL_MS = Math.floor(DEFAULT_POLL_MS / 2); // homepage uses half (10s)

    // refs to chart instances to perform in-place updates (avoid re-mount flicker)
    const latencyChartRef = useRef(null);
    const countChartRef = useRef(null);

    // memoized chart data/option objects to avoid new object identity on each render
    const latencyData = useMemo(() => ({
        labels: (Array.isArray(topLatency) ? topLatency : []).map(i => i.route),
        datasets: [{
            label: '평균 응답시간 (ms)',
            data: (Array.isArray(topLatency) ? topLatency : []).map(i => Math.round(i.avg_ms)),
            backgroundColor: 'rgba(25,118,210,0.8)'
        }]
    }), [topLatency]);

    const countData = useMemo(() => ({
        labels: (Array.isArray(topCount) ? topCount : []).map(i => i.route),
        datasets: [{
            label: '호출수',
            data: (Array.isArray(topCount) ? topCount : []).map(i => i.count),
            backgroundColor: 'rgba(56,142,60,0.85)'
        }]
    }), [topCount]);

    const commonOptions = useMemo(() => ({
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeOutCubic' },
        elements: { bar: { borderRadius: 6, maxBarThickness: 42 } },
        scales: { x: { title: { display: true } } },
        plugins: { legend: { display: false } }
    }), []);

    // custom plugin: draw value labels at end of each horizontal bar
    const valueLabelPlugin = {
        id: 'valueLabels',
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const pluginOpts = chart.options.plugins && chart.options.plugins.valueLabels ? chart.options.plugins.valueLabels : {};
            const unit = pluginOpts.unit || '';
            const color = pluginOpts.color || '#222';
            ctx.save();
            ctx.font = pluginOpts.font || '12px Arial';
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (!meta || meta.hidden) return;
                meta.data.forEach((bar, index) => {
                    const data = dataset.data[index];
                    const txt = data == null ? '' : `${data}${unit}`;
                    if (!txt) return;
                    const pos = bar.tooltipPosition();
                    const xCenter = pos.x;
                    const y = pos.y;
                    // compute bar width (for horizontal bars base -> x)
                    const barBase = typeof bar.base !== 'undefined' ? bar.base : (bar._model && bar._model.base);
                    const barWidth = Math.abs(xCenter - (barBase || 0));
                    // measure text width
                    const textWidth = ctx.measureText(txt).width;
                    // if text fits inside the bar, draw inside aligned to the right edge; otherwise draw outside to the right
                    if (textWidth + 8 < barWidth) {
                        // inside
                        ctx.fillStyle = '#fff';
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(txt, xCenter - 6, y);
                    } else {
                        // outside
                        ctx.fillStyle = color;
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(txt, xCenter + 6, y);
                    }
                });
            });
            ctx.restore();
        }
    };

    const latencyOptions = useMemo(() => ({
        ...commonOptions,
        scales: { x: { title: { display: true, text: 'ms' } } },
        plugins: { ...(commonOptions.plugins || {}), valueLabels: { unit: 'ms', color: '#0b57a4', font: '12px Arial' } }
    }), [commonOptions]);

    const countOptions = useMemo(() => ({
        ...commonOptions,
        scales: { x: { title: { display: true, text: 'count' } } },
        plugins: { ...(commonOptions.plugins || {}), valueLabels: { unit: '', color: '#2e7d32', font: '12px Arial' } }
    }), [commonOptions]);

    // reusable gauge card wrapper to ensure all circular gauge cards share identical styling
    const gaugeCardOuterStyle = { flex: 1, background: '#fff', padding: 12, borderRadius: 8, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const gaugeCardInnerStyle = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' };
    // GaugeCard now enforces left/right children layout with a 2:3 ratio
    const GaugeCard = ({ children }) => {
        // flatten children and handle fragments: accept either two direct children or a single Fragment wrapping the two
        let arr = React.Children.toArray(children);
        if (arr.length === 1) {
            const only = arr[0];
            // if the only child is a Fragment, extract its children
            if (React.isValidElement(only) && only.type === React.Fragment) {
                arr = React.Children.toArray(only.props.children);
            }
        }
        const left = arr[0] || null;
        const right = arr[1] || null;
        return (
            <div style={gaugeCardOuterStyle}>
                <div style={gaugeCardInnerStyle}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '40%' }}>{left}</div>
                    <div style={{ flex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{right}</div>
                </div>
            </div>
        );
    };

    // perform in-place updates on chart instances to avoid remount flicker
    useEffect(() => {
        const c = latencyChartRef.current;
        if (c && c.data) {
            c.data.labels = (Array.isArray(topLatency) ? topLatency : []).map(i => i.route);
            c.data.datasets[0].data = (Array.isArray(topLatency) ? topLatency : []).map(i => Math.round(i.avg_ms));
            try { c.update(); } catch (e) { /* ignore */ }
        }
    }, [topLatency]);

    useEffect(() => {
        const c = countChartRef.current;
        if (c && c.data) {
            c.data.labels = (Array.isArray(topCount) ? topCount : []).map(i => i.route);
            c.data.datasets[0].data = (Array.isArray(topCount) ? topCount : []).map(i => i.count);
            try { c.update(); } catch (e) { /* ignore */ }
        }
    }, [topCount]);

    useEffect(() => {
        // Emit a page-load log each time this component mounts
        try { pageLoad('HomePage.jsx'); } catch (e) { }
        let mounted = true;
        const claims = decodeToken();
        if (claims) setUserRole(claims.role || null);

        const isHidden = claims && (claims.role === 'A' || claims.role === 'S');

        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/admin/rate-limit-status');
                if (!mounted) return;
                setStats(res.data);
            } catch (err) {
                logError('Failed to fetch rate limit status', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchRpm = async () => {
            setRpmLoading(true);
            try {
                const r = await apiClient.get('/admin/receipts-per-minute');
                if (!mounted) return;
                setRpm(r.data);
            } catch (err) {
                logError('Failed to fetch receipts per minute', err);
            } finally {
                setRpmLoading(false);
            }
        };

        const fetchTopMetrics = async () => {
            setMetricsLoading(true);
            try {
                if (process.env.NODE_ENV !== 'production') logDebug('fetchTopMetrics start');
                const [latRes, cntRes] = await Promise.all([
                    apiClient.get('/admin/metrics/top-latency?limit=5').catch(e => ({ data: { items: [] } })),
                    apiClient.get('/admin/metrics/top-count?limit=5').catch(e => ({ data: { items: [] } }))
                ]);
                if (process.env.NODE_ENV !== 'production') logDebug('fetchTopMetrics result', latRes, cntRes);
                if (!mounted) return;
                setTopLatency(latRes.data.items || []);
                setTopCount(cntRes.data.items || []);
            } catch (err) {
                logError('Failed to fetch top metrics', err);
            } finally {
                setMetricsLoading(false);
            }
        };

        const fetchSystemMetrics = async () => {
            setSystemLoading(true);
            try {
                // backend endpoint may not exist; fail silently if 404
                const r = await apiClient.get('/admin/metrics/system').catch(() => ({ data: null }));
                if (!mounted) return;
                if (r && r.data) {
                    // expect { cpu: number(0-100), memory: number(0-100) }
                    setCpuUsage(typeof r.data.cpu === 'number' ? Math.round(r.data.cpu) : null);
                    setMemUsage(typeof r.data.memory === 'number' ? Math.round(r.data.memory) : null);
                } else {
                    setCpuUsage(null);
                    setMemUsage(null);
                }
            } catch (err) {
                logError('Failed to fetch system metrics', err);
            } finally {
                setSystemLoading(false);
            }
        };

        const fetchRedisMetrics = async () => {
            setRedisLoading(true);
            try {
                const r = await apiClient.get('/admin/metrics/redis').catch(() => ({ data: null }));
                if (!mounted) return;
                setRedisMetrics(r.data || null);
            } catch (err) {
                logError('Failed to fetch redis metrics', err);
            } finally {
                setRedisLoading(false);
            }
        };

        const fetchKafkaMetrics = async () => {
            setKafkaLoading(true);
            try {
                const r = await apiClient.get('/admin/metrics/kafka').catch(() => ({ data: null }));
                if (!mounted) return;
                setKafkaMetrics(r.data || null);
            } catch (err) {
                logError('Failed to fetch kafka metrics', err);
            } finally {
                setKafkaLoading(false);
            }
        };

        // If A or S role, skip fetching rate-limit stats but still fetch RPM
        if (isHidden) {
            setStats(null);
            fetchRpm();
            fetchSystemMetrics();
            fetchRedisMetrics();
            fetchKafkaMetrics();
            const t = setInterval(() => { fetchRpm(); }, HOME_POLL_MS);
            const t3 = setInterval(() => { fetchSystemMetrics(); }, HOME_POLL_MS);
            const t4 = setInterval(() => { fetchRedisMetrics(); }, HOME_POLL_MS);
            const t5 = setInterval(() => { fetchKafkaMetrics(); }, HOME_POLL_MS);
            return () => { mounted = false; clearInterval(t); clearInterval(t3); };
        }

        fetchStats();
        fetchRpm();
        fetchTopMetrics();
        fetchSystemMetrics();
        fetchRedisMetrics();
        fetchKafkaMetrics();
        const t = setInterval(() => { fetchStats(); fetchRpm(); }, HOME_POLL_MS);
        const t2 = setInterval(() => { fetchTopMetrics(); }, HOME_POLL_MS);
        const t3 = setInterval(() => { fetchSystemMetrics(); }, HOME_POLL_MS);
        const t4 = setInterval(() => { fetchRedisMetrics(); }, HOME_POLL_MS);
        const t5 = setInterval(() => { fetchKafkaMetrics(); }, HOME_POLL_MS);
        return () => { mounted = false; clearInterval(t); clearInterval(t2); clearInterval(t3); };
    }, []);

    // Keep a per-second countdown display for the rate limit window based on backend remainingSeconds
    useEffect(() => {
        let t = null;
        if (stats && typeof stats.remainingSeconds === 'number') {
            setRateRemaining(Number(stats.remainingSeconds));
            t = setInterval(() => {
                setRateRemaining(prev => {
                    if (prev == null) return null;
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
        } else {
            setRateRemaining(null);
        }
        return () => { if (t) clearInterval(t); };
    }, [stats]);

    const formatSeconds = (s) => {
        if (s == null) return '—';
        const sec = Number(s);
        if (sec <= 0) return '0s';
        if (sec < 60) return `${sec}s`;
        const m = Math.floor(sec / 60);
        const r = sec % 60;
        return `${m}m ${r}s`;
    };

    const percent = stats && stats.max ? (stats.totalRequests / stats.max) * 100 : 0;

    return (
        // If user is pending (F), show centered waiting message and hide all other home content
        userRole === 'F' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
                <div>
                    <h2 style={{ fontSize: 28, marginBottom: 8 }}>가입 대기중입니다.</h2>
                </div>
            </div>
        ) : (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0 }}>홈</h2>
                    {/* Show API/Swagger button only for Super Admin (role 'U') */}
                    {userRole === 'U' ? (
                        <button
                            onClick={() => window.open('/api/docs', '_blank')}
                            style={{
                                padding: '6px 10px',
                                borderRadius: 4,
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            API
                        </button>
                    ) : null}
                </div>

                {/* Top API metrics area (moved above circular gauges) */}
                <div style={{ marginTop: 24 }}>
                    {/* make two columns equal width (1:1) and visually enlarge charts horizontally by 1.5x */}
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div style={{ flex: 1, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minHeight: 220 }}>
                            <h3 style={{ marginTop: 0 }}>상위 지연 API (평균 시간 기준)</h3>
                            {metricsLoading ? <div>불러오는 중...</div> : (
                                // always render the chart area to avoid unmount/mount flicker
                                <div style={{ position: 'relative', height: 240 }}>
                                    {topLatency.length === 0 && !metricsLoading ? (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>데이터 없음</div>
                                    ) : null}
                                    <Bar
                                        ref={latencyChartRef}
                                        data={latencyData}
                                        options={latencyOptions}
                                        plugins={[valueLabelPlugin]}
                                        height={240}
                                    />
                                    {metricsLoading ? (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>불러오는 중...</div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minHeight: 220 }}>
                            <h3 style={{ marginTop: 0 }}>상위 호출수 API (호출수 기준)</h3>
                            {metricsLoading ? <div>불러오는 중...</div> : (
                                <div style={{ position: 'relative', height: 240 }}>
                                    {topCount.length === 0 && !metricsLoading ? (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>데이터 없음</div>
                                    ) : null}
                                    <Bar
                                        ref={countChartRef}
                                        data={countData}
                                        options={countOptions}
                                        plugins={[valueLabelPlugin]}
                                        height={240}
                                    />
                                    {metricsLoading ? (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>불러오는 중...</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Circular gauges area moved below metrics: 4 equal-width columns */}
                <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                    {/* Column 1: RPM */}
                    <GaugeCard>
                        <>
                            <CircleGauge percent={rpm && rpm.max ? Math.min(100, (rpm.count / rpm.max) * 100) : 0} size={140} stroke={14} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600 }}>분당 주문수 (Last 1 min)</div>
                                {rpm ? (
                                    <div style={{ color: '#666' }}>{rpm.count} / {rpm.max}</div>
                                ) : (
                                    <div style={{ color: '#666' }}>{rpmLoading ? '불러오는 중...' : '데이터 없음'}</div>
                                )}
                            </div>
                        </>
                    </GaugeCard>

                    {/* Column 2: Rate Limit (if hidden for some roles, show placeholder to keep layout) */}
                    <GaugeCard>
                        {!(userRole === 'A' || userRole === 'S') ? (
                            <>
                                <CircleGauge percent={Math.min(100, percent)} size={140} stroke={14} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 600 }}>Rate Limit</div>
                                    {stats ? (
                                        <div style={{ color: '#666' }}>
                                            {stats.totalRequests} / {stats.max} 요청 (차단: {stats.blockedRequests})
                                            {stats.redisErrors ? (<div style={{ color: '#c0392b' }}>Redis 에러: {stats.redisErrors}</div>) : null}
                                            <div style={{ marginTop: 6, color: '#666' }}>Cnt: {formatSeconds(rateRemaining)} {stats.windowSeconds ? (<span style={{ color: '#999' }}></span>) : null}</div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666' }}>{loading ? '불러오는 중...' : '데이터 없음'}</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ color: '#999' }}>권한에 의해 숨김</div>
                        )}
                    </GaugeCard>

                    {/* Column 3: CPU usage */}
                    <GaugeCard>
                        <>
                            <CircleGauge percent={cpuUsage != null ? cpuUsage : 0} size={140} stroke={14} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600 }}>CPU 점유율</div>
                                {cpuUsage != null ? (
                                    <div style={{ color: '#666' }}>{cpuUsage}%</div>
                                ) : (
                                    <div style={{ color: '#666' }}>{systemLoading ? '불러오는 중...' : '데이터 없음'}</div>
                                )}
                            </div>
                        </>
                    </GaugeCard>

                    {/* Column 4: Memory usage */}
                    <GaugeCard>
                        <>
                            <CircleGauge percent={memUsage != null ? memUsage : 0} size={140} stroke={14} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600 }}>메모리 사용량</div>
                                {memUsage != null ? (
                                    <div style={{ color: '#666' }}>{memUsage}%</div>
                                ) : (
                                    <div style={{ color: '#666' }}>{systemLoading ? '불러오는 중...' : '데이터 없음'}</div>
                                )}
                            </div>
                        </>
                    </GaugeCard>
                </div>

                {/* Redis & Kafka monitoring section: new bottom area, two columns */}
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1, background: '#fff', padding: 12, borderRadius: 8, minHeight: 120 }}>
                            <h3 style={{ marginTop: 0 }}>Redis 상태</h3>
                            {redisLoading ? <div>불러오는 중...</div> : (
                                redisMetrics ? (
                                    <div>
                                        <div style={{ fontWeight: 600 }}>메모리: <span style={{ color: '#666' }}>{redisMetrics.used_memory_human || (redisMetrics.used_memory ? `${Math.round(redisMetrics.used_memory / 1024)} KB` : '—')}</span></div>
                                        <div style={{ marginTop: 6 }}>연결 클라이언트: <span style={{ color: '#666' }}>{redisMetrics.connected_clients}</span></div>
                                        <div style={{ marginTop: 6 }}>명령/sec: <span style={{ color: '#666' }}>{redisMetrics.instantaneous_ops_per_sec}</span></div>
                                        <div style={{ marginTop: 6 }}>키스페이스 히트율: <span style={{ color: '#666' }}>{redisMetrics.hitRatio != null ? `${redisMetrics.hitRatio}%` : '데이터 없음'}</span></div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#666' }}>데이터 없음</div>
                                )
                            )}
                        </div>

                        <div style={{ flex: 1, background: '#fff', padding: 12, borderRadius: 8, minHeight: 120 }}>
                            <h3 style={{ marginTop: 0 }}>Kafka 상태 (토픽)</h3>
                            {kafkaLoading ? <div>불러오는 중...</div> : (
                                kafkaMetrics ? (
                                    <div>
                                        <div style={{ fontWeight: 600 }}>토픽: <span style={{ color: '#666' }}>{kafkaMetrics.topic}</span></div>
                                        <div style={{ marginTop: 6 }}>컨슈머 그룹: <span style={{ color: '#666' }}>{kafkaMetrics.groupId}</span></div>
                                        <div style={{ marginTop: 6 }}>전체 지연(합): <span style={{ color: '#666' }}>{kafkaMetrics.totalLag}</span></div>
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ fontWeight: 600 }}>파티션별 지연</div>
                                            {Array.isArray(kafkaMetrics.partitions) && kafkaMetrics.partitions.length > 0 ? (
                                                <ul style={{ marginTop: 6, color: '#666' }}>{kafkaMetrics.partitions.map(p => (
                                                    <li key={p.partition}>파티션 {p.partition}: lag {p.lag == null ? '—' : p.lag} (end {p.endOffset}, group {p.groupOffset})</li>
                                                ))}</ul>
                                            ) : (<div style={{ color: '#666' }}>파티션 데이터 없음</div>)}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#666' }}>데이터 없음</div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default HomePage;
