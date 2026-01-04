import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const LoginBox = () => {
    const { isLoggedIn, currentUser, logout, openAuthModal } = useAuth();
    const [partnershipDays, setPartnershipDays] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn && currentUser?.id) {
            fetchPartnershipInfo();
        }
    }, [isLoggedIn, currentUser]);

    const fetchPartnershipInfo = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('partnership_expires_at')
                .eq('login_id', currentUser.id)
                .single();

            if (error) {
                console.error('Partnership fetch error:', error);
                setPartnershipDays(null);
                setLoading(false);
                return;
            }

            if (data?.partnership_expires_at) {
                const expiresAt = new Date(data.partnership_expires_at);
                const now = new Date();
                const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

                if (daysLeft > 0) {
                    setPartnershipDays(daysLeft);
                } else {
                    setPartnershipDays(null);
                }
            } else {
                setPartnershipDays(null);
            }
        } catch (error) {
            console.error('Partnership fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoggedIn) {
        return (
            <div style={styles.container}>
                <div style={styles.loggedInContent}>
                    <div style={styles.welcomeSection}>
                        <span style={styles.welcomeText}>{currentUser?.nickname}님</span>
                        <span style={styles.welcomeSubText}>환영합니다!</span>
                    </div>

                    {partnershipDays !== null && (
                        <div style={styles.partnershipBox}>
                            <span style={styles.partnershipLabel}>🎉 제휴 기간</span>
                            <span style={styles.partnershipDays}>{partnershipDays}일 남음</span>
                        </div>
                    )}

                    <button onClick={logout} style={styles.logoutBtn}>
                        로그아웃
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header Tabs */}
            <div style={styles.header}>
                <div
                    style={{ ...styles.tab, borderBottom: '2px solid var(--tg-primary)', fontWeight: 'bold' }}
                    onClick={() => openAuthModal('login')}
                >
                    회원로그인
                </div>
                <div
                    style={{ ...styles.tab, fontWeight: 'normal' }}
                    onClick={() => openAuthModal('signup')}
                >
                    회원가입
                </div>
            </div>

            {/* Info Area */}
            <div style={styles.infoArea}>
                <p style={styles.infoText}>로그인하여 더 많은 기능을 이용하세요</p>
                <button onClick={() => openAuthModal('login')} style={styles.loginBtn}>
                    로그인
                </button>
                <button onClick={() => openAuthModal('signup')} style={styles.signupBtn}>
                    회원가입
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        border: '1px solid var(--tg-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
    },
    header: {
        display: 'flex',
        borderBottom: '1px solid var(--tg-border)',
        backgroundColor: '#f9f9f9',
    },
    tab: {
        flex: 1,
        textAlign: 'center',
        padding: '12px 0',
        fontSize: '13px',
        cursor: 'pointer',
        color: 'var(--tg-text)',
    },
    infoArea: {
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
    },
    infoText: {
        fontSize: '13px',
        color: '#666',
        textAlign: 'center',
        margin: 0,
    },
    loginBtn: {
        backgroundColor: 'var(--tg-primary)',
        color: '#fff',
        padding: '12px',
        borderRadius: '24px',
        fontWeight: 'bold',
        fontSize: '14px',
        width: '100%',
        border: 'none',
        cursor: 'pointer',
    },
    signupBtn: {
        backgroundColor: '#f5f5f5',
        color: '#333',
        padding: '12px',
        borderRadius: '24px',
        fontWeight: '600',
        fontSize: '14px',
        width: '100%',
        border: '1px solid #ddd',
        cursor: 'pointer',
    },
    loggedInContent: {
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    welcomeSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
    },
    welcomeSubText: {
        fontSize: '13px',
        color: '#666',
    },
    logoutBtn: {
        backgroundColor: '#f5f5f5',
        color: '#666',
        padding: '10px',
        borderRadius: '24px',
        fontWeight: '600',
        fontSize: '13px',
        width: '100%',
        border: '1px solid #ddd',
        cursor: 'pointer',
    },
    partnershipBox: {
        backgroundColor: '#e3f2fd',
        border: '2px solid #1976d2',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
    },
    partnershipLabel: {
        fontSize: '12px',
        color: '#1976d2',
        fontWeight: '600',
    },
    partnershipDays: {
        fontSize: '18px',
        color: '#1976d2',
        fontWeight: 'bold',
    },
};

export default LoginBox;
