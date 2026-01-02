import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginBox = () => {
    const { isLoggedIn, currentUser, logout, openAuthModal } = useAuth();

    if (isLoggedIn) {
        return (
            <div style={styles.container}>
                <div style={styles.loggedInContent}>
                    <div style={styles.welcomeSection}>
                        <span style={styles.welcomeText}>{currentUser?.nickname}님</span>
                        <span style={styles.welcomeSubText}>환영합니다!</span>
                    </div>
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
};

export default LoginBox;
