import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    deleteUser as deleteUserAPI,
    suspendUser,
    permanentlyBanUser,
    liftSuspension
} from '../api/users';

const RegisterAdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        age: '',
        password: ''
    });

    useEffect(() => {
        fetchRecentUsers();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.username || !formData.age) {
            showToast('모든 필드를 입력해주세요', 'error');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        email: formData.email,
                        username: formData.username,
                        age: parseInt(formData.age),
                        is_active: true
                    }
                ])
                .select();

            if (error) {
                if (error.code === '23505') { // Unique violation
                    showToast('이미 등록된 이메일입니다', 'error');
                } else {
                    throw error;
                }
                return;
            }

            showToast('회원 등록이 완료되었습니다!', 'success');
            setFormData({
                email: '',
                username: '',
                age: '',
                password: ''
            });
            fetchRecentUsers();
        } catch (error) {
            console.error('handleRegister error:', error);
            showToast('회원 등록에 실패했습니다', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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
                <h1 style={styles.title}>회원 관리</h1>
                <p style={styles.subtitle}>회원 등록 및 관리를 위한 전용 페이지</p>
            </div>

            {/* Registration Form */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>새 회원 등록</h2>
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>이메일 *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>닉네임 (@username) *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="@username"
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>나이 *</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="예: 25"
                            min="1"
                            max="120"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        회원 등록
                    </button>
                </form>
            </section>

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
                                    <th style={styles.th}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const now = new Date();
                                    const suspendedUntil = user.suspended_until ? new Date(user.suspended_until) : null;
                                    const isSuspended = suspendedUntil && suspendedUntil > now;
                                    const isPermanentlyBanned = user.is_permanently_banned;

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
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #0088cc',
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
