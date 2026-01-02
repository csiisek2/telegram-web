import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
    const { authModalOpen, authModalMode, closeAuthModal, setAuthModalMode, login, register } = useAuth();

    const [formData, setFormData] = useState({
        id: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        telegramId: ''
    });
    const [error, setError] = useState('');

    if (!authModalOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(formData.id, formData.password);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // 비밀번호 확인
        if (formData.password !== formData.passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        const result = await register({
            id: formData.id,
            password: formData.password,
            nickname: formData.nickname,
            telegramId: formData.telegramId
        });

        if (!result.success) {
            setError(result.error);
        }
    };

    const handleFindAccount = () => {
        if (!formData.telegramId) {
            setError('텔레그램 아이디를 입력해주세요.');
            return;
        }
        window.open('https://t.me/xdev90', '_blank');
    };

    const resetForm = () => {
        setFormData({
            id: '',
            password: '',
            passwordConfirm: '',
            nickname: '',
            telegramId: ''
        });
        setError('');
    };

    const switchMode = (mode) => {
        resetForm();
        setAuthModalMode(mode);
    };

    const handleClose = () => {
        resetForm();
        closeAuthModal();
    };

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={handleClose}>✕</button>

                {/* 로그인 모드 */}
                {authModalMode === 'login' && (
                    <>
                        <h2 style={styles.title}>로그인</h2>
                        <form onSubmit={handleLogin} style={styles.form}>
                            <input
                                type="text"
                                name="id"
                                placeholder="아이디"
                                value={formData.id}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            {error && <div style={styles.error}>{error}</div>}
                            <button type="submit" style={styles.submitBtn}>로그인</button>

                            <div style={styles.links}>
                                <span onClick={() => switchMode('findId')} style={styles.link}>아이디 찾기</span>
                                <span style={styles.separator}>|</span>
                                <span onClick={() => switchMode('findPassword')} style={styles.link}>비밀번호 찾기</span>
                                <span style={styles.separator}>|</span>
                                <span onClick={() => switchMode('signup')} style={styles.link}>회원가입</span>
                            </div>
                        </form>
                    </>
                )}

                {/* 회원가입 모드 */}
                {authModalMode === 'signup' && (
                    <>
                        <h2 style={styles.title}>회원가입</h2>
                        <form onSubmit={handleSignup} style={styles.form}>
                            <input
                                type="text"
                                name="id"
                                placeholder="아이디"
                                value={formData.id}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <input
                                type="password"
                                name="passwordConfirm"
                                placeholder="비밀번호 확인"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                name="telegramId"
                                placeholder="텔레그램 아이디 (@username)"
                                value={formData.telegramId}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                name="nickname"
                                placeholder="닉네임"
                                value={formData.nickname}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            {error && <div style={styles.error}>{error}</div>}
                            <button type="submit" style={styles.submitBtn}>회원가입</button>

                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                style={styles.switchBtn}
                            >
                                로그인으로 돌아가기
                            </button>
                        </form>
                    </>
                )}

                {/* 아이디 찾기 모드 */}
                {authModalMode === 'findId' && (
                    <>
                        <h2 style={styles.title}>아이디 찾기</h2>
                        <div style={styles.form}>
                            <p style={styles.infoText}>
                                등록하신 텔레그램 아이디를 통해 아이디를 찾을 수 있습니다
                            </p>
                            <input
                                type="text"
                                name="telegramId"
                                placeholder="텔레그램 아이디 (@username)"
                                value={formData.telegramId}
                                onChange={handleChange}
                                style={styles.input}
                            />
                            {error && <div style={styles.error}>{error}</div>}
                            <button onClick={handleFindAccount} style={styles.submitBtn}>
                                고객센터 문의
                            </button>
                            <p style={styles.helpText}>
                                입력하신 텔레그램 아이디로 고객센터에 문의하시면 아이디를 찾아드립니다
                            </p>

                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                style={styles.switchBtn}
                            >
                                로그인으로 돌아가기
                            </button>
                        </div>
                    </>
                )}

                {/* 비밀번호 찾기 모드 */}
                {authModalMode === 'findPassword' && (
                    <>
                        <h2 style={styles.title}>비밀번호 찾기</h2>
                        <div style={styles.form}>
                            <p style={styles.infoText}>
                                등록하신 텔레그램 아이디를 통해 비밀번호를 찾을 수 있습니다
                            </p>
                            <input
                                type="text"
                                name="telegramId"
                                placeholder="텔레그램 아이디 (@username)"
                                value={formData.telegramId}
                                onChange={handleChange}
                                style={styles.input}
                            />
                            {error && <div style={styles.error}>{error}</div>}
                            <button onClick={handleFindAccount} style={styles.submitBtn}>
                                고객센터 문의
                            </button>
                            <p style={styles.helpText}>
                                입력하신 텔레그램 아이디로 고객센터에 문의하시면 비밀번호를 찾아드립니다
                            </p>

                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                style={styles.switchBtn}
                            >
                                로그인으로 돌아가기
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        width: '90%',
        maxWidth: '450px',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    },
    closeBtn: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
        textAlign: 'center',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
    },
    error: {
        color: '#e74c3c',
        fontSize: '13px',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#ffe5e5',
        borderRadius: '6px',
    },
    submitBtn: {
        padding: '12px',
        backgroundColor: 'var(--tg-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
    },
    switchBtn: {
        padding: '10px',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '5px',
    },
    links: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '15px',
        fontSize: '13px',
    },
    link: {
        color: 'var(--tg-primary)',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    separator: {
        color: '#ddd',
    },
    infoText: {
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        marginBottom: '10px',
        lineHeight: '1.6',
    },
    helpText: {
        textAlign: 'center',
        color: '#999',
        fontSize: '12px',
        marginTop: '10px',
        lineHeight: '1.5',
    },
};

export default AuthModal;
