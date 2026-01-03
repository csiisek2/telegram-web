import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    deleteUser as deleteUserAPI,
    suspendUser,
    permanentlyBanUser,
    liftSuspension,
    setPartnershipDuration,
    removePartnership
} from '../api/users';

const RegisterAdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isLoggedIn) {
            fetchRecentUsers();
        }
    }, [isLoggedIn]);

    const fetchRecentUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('fetchRecentUsers error:', error);
            showToast('사용자 목록을 불러오는데 실패했습니다', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'tmdwo8911!!') {
            setIsLoggedIn(true);
            showToast('로그인 성공!', 'success');
        } else {
            showToast('비밀번호가 틀렸습니다.', 'error');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setPassword('');
        showToast('로그아웃 되었습니다.');
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Login Form
    if (!isLoggedIn) {
        return (
            <div style={styles.container}>
                {/* Toast Notification */}
                {toast && (
                    <div style={{
                        ...styles.toast,
                        backgroundColor: toast.type === 'success' ? '#4caf50' : '#f44336'
                    }}>
                        {toast.message}
                    </div>
                )}

                <div style={styles.loginContainer}>
                    <div style={styles.loginBox}>
                        <h1 style={styles.loginTitle}>회원 관리 페이지</h1>
                        <p style={styles.loginSubtitle}>관리자 인증이 필요합니다</p>
                        <form onSubmit={handleLogin} style={styles.loginForm}>
                            <input
                                type="password"
                                placeholder="관리자 비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.loginInput}
                                required
                            />
                            <button type="submit" style={styles.loginBtn}>
                                로그인
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    ...styles.toast,
                    backgroundColor: toast.type === 'success' ? '#4caf50' : '#f44336'
                }}>
                    {toast.message}
                </div>
            )}

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>회원 관리</h1>
                    <p style={styles.subtitle}>회원 제휴 기간 관리 전용 페이지</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    로그아웃
                </button>
            </div>

            {/* User Management */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>전체 회원 목록 ({users.length}명)</h2>
                {loading ? (
                    <div style={styles.loading}>로딩 중...</div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>이메일</th>
                                    <th style={styles.th}>닉네임</th>
                                    <th style={styles.th}>나이</th>
                                    <th style={styles.th}>가입일</th>
                                    <th style={styles.th}>상태</th>
                                    <th style={styles.th}>제휴기간</th>
                                    <th style={styles.th}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const now = new Date();
                                    const suspendedUntil = user.suspended_until ? new Date(user.suspended_until) : null;
                                    const isSuspended = suspendedUntil && suspendedUntil > now;
                                    const isPermanentlyBanned = user.is_permanently_banned;

                                    const partnershipExpiresAt = user.partnership_expires_at ? new Date(user.partnership_expires_at) : null;
                                    const hasPartnership = partnershipExpiresAt && partnershipExpiresAt > now;
                                    const partnershipDaysLeft = hasPartnership ? Math.ceil((partnershipExpiresAt - now) / (1000 * 60 * 60 * 24)) : 0;

                                    return (
                                        <tr key={user.id} style={styles.tableRow}>
                                            <td style={styles.td}>{user.email}</td>
                                            <td style={styles.td}>{user.username || '-'}</td>
                                            <td style={styles.td}>{user.age || '-'}</td>
                                            <td style={styles.td}>
                                                {new Date(user.created_at).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td style={styles.td}>
                                                {isPermanentlyBanned ? (
                                                    <span style={{ color: '#c62828', fontWeight: 'bold' }}>영구정지</span>
                                                ) : isSuspended ? (
                                                    <span style={{ color: '#f57c00', fontWeight: 'bold' }}>
                                                        정지 ({Math.ceil((suspendedUntil - now) / (1000 * 60 * 60 * 24))}일)
                                                    </span>
                                                ) : user.is_active ? (
                                                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>활성</span>
                                                ) : (
                                                    <span style={{ color: '#757575' }}>비활성</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                {hasPartnership ? (
                                                    <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                        {partnershipDaysLeft}일 남음
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#999' }}>없음</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {/* User Status Controls */}
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        {(isSuspended || isPermanentlyBanned) ? (
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('정지를 해제하시겠습니까?')) {
                                                                        await liftSuspension(user.id);
                                                                        await fetchRecentUsers();
                                                                        showToast('정지가 해제되었습니다!');
                                                                    }
                                                                }}
                                                                style={styles.actionBtn}
                                                            >
                                                                해제
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="일수"
                                                                    id={`suspend-days-${user.id}`}
                                                                    style={styles.daysInput}
                                                                />
                                                                <button
                                                                    onClick={async () => {
                                                                        const days = parseInt(document.getElementById(`suspend-days-${user.id}`).value);
                                                                        if (!days || days < 1) {
                                                                            showToast('일수를 입력해주세요 (1일 이상)', 'error');
                                                                            return;
                                                                        }
                                                                        if (window.confirm(`${days}일간 정지하시겠습니까?`)) {
                                                                            await suspendUser(user.id, days);
                                                                            await fetchRecentUsers();
                                                                            showToast(`${days}일간 정지되었습니다!`);
                                                                        }
                                                                    }}
                                                                    style={styles.actionBtn}
                                                                >
                                                                    정지
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm('정말 영구정지 하시겠습니까?')) {
                                                                            await permanentlyBanUser(user.id);
                                                                            await fetchRecentUsers();
                                                                            showToast('영구정지되었습니다!');
                                                                        }
                                                                    }}
                                                                    style={styles.actionBtn}
                                                                >
                                                                    영구
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('정말 탈퇴 처리하시겠습니까?')) {
                                                                    await deleteUserAPI(user.id);
                                                                    await fetchRecentUsers();
                                                                    showToast('회원이 삭제되었습니다!');
                                                                }
                                                            }}
                                                            style={{...styles.actionBtn, backgroundColor: '#f44336'}}
                                                        >
                                                            탈퇴
                                                        </button>
                                                    </div>

                                                    {/* Partnership Controls */}
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="제휴일"
                                                            id={`partnership-days-${user.id}`}
                                                            style={styles.daysInput}
                                                        />
                                                        <button
                                                            onClick={async () => {
                                                                const days = parseInt(document.getElementById(`partnership-days-${user.id}`).value);
                                                                if (!days || days < 1) {
                                                                    showToast('제휴 일수를 입력해주세요', 'error');
                                                                    return;
                                                                }
                                                                if (window.confirm(`${days}일 제휴 기간을 설정하시겠습니까?`)) {
                                                                    await setPartnershipDuration(user.id, days);
                                                                    await fetchRecentUsers();
                                                                    showToast(`${days}일 제휴 설정 완료!`);
                                                                }
                                                            }}
                                                            style={{...styles.actionBtn, backgroundColor: '#1976d2'}}
                                                        >
                                                            제휴설정
                                                        </button>
                                                        {hasPartnership && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('제휴를 해제하시겠습니까?')) {
                                                                        await removePartnership(user.id);
                                                                        await fetchRecentUsers();
                                                                        showToast('제휴가 해제되었습니다!');
                                                                    }
                                                                }}
                                                                style={{...styles.actionBtn, backgroundColor: '#757575'}}
                                                            >
                                                                제휴해제
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div style={styles.emptyState}>
                                등록된 회원이 없습니다
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Security Info */}
            <section style={styles.infoBox}>
                <h3 style={styles.infoTitle}>🔒 보안 안내</h3>
                <ul style={styles.infoList}>
                    <li>이 페이지는 관리자 전용 회원 관리 페이지입니다</li>
                    <li>회원 등록, 정지, 영구정지, 탈퇴 등 모든 회원 관리 기능을 제공합니다</li>
                    <li>일반 사이트 관리는 /isc8806 페이지에서 진행하세요</li>
                    <li>페이지 주소를 외부에 절대 공개하지 마세요</li>
                </ul>
            </section>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #0088cc',
    },
    loginContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
    },
    loginBox: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        border: '2px solid #0088cc',
        boxShadow: '0 4px 12px rgba(0, 136, 204, 0.2)',
        maxWidth: '400px',
        width: '100%',
    },
    loginTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '30px',
        textAlign: 'center',
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    loginInput: {
        padding: '14px 16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
    },
    loginBtn: {
        padding: '14px',
        backgroundColor: '#0088cc',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    logoutBtn: {
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        border: '2px solid #0088cc',
        boxShadow: '0 2px 8px rgba(0, 136, 204, 0.1)',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333',
        paddingBottom: '10px',
        borderBottom: '2px solid #0088cc',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '600px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
    },
    input: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    submitBtn: {
        padding: '14px',
        backgroundColor: '#0088cc',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.2s',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    tableHeader: {
        backgroundColor: '#f9f9f9',
        borderBottom: '2px solid #ddd',
    },
    th: {
        padding: '12px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#333',
    },
    tableRow: {
        borderBottom: '1px solid #eee',
    },
    td: {
        padding: '12px',
        color: '#555',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#999',
        fontSize: '14px',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontSize: '14px',
    },
    infoBox: {
        backgroundColor: '#f0f8ff',
        borderRadius: '12px',
        padding: '25px',
        border: '2px solid #0088cc',
    },
    infoTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#0088cc',
    },
    infoList: {
        margin: 0,
        paddingLeft: '20px',
        color: '#555',
        lineHeight: '1.8',
    },
    toast: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 'bold',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.3s ease-out',
    },
    actionBtn: {
        padding: '6px 12px',
        backgroundColor: '#0088cc',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    daysInput: {
        width: '60px',
        padding: '4px',
        fontSize: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        textAlign: 'center',
    },
};

export default RegisterAdminPage;
