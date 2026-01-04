import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStorage } from '../data/userStorage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'findId' | 'findPassword'

    // 로컬 스토리지에서 세션 복원
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const login = async (id, password) => {
        try {
            const user = await userStorage.login(id, password);
            setCurrentUser(user);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setAuthModalOpen(false);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            // IndexedDB에 저장 (로그인용)
            const user = await userStorage.register(userData);

            // Supabase에도 저장 (관리자 페이지용)
            const { error: supabaseError } = await supabase
                .from('users')
                .insert([
                    {
                        login_id: userData.id,
                        password_hash: userStorage.hashPassword(userData.password),
                        nickname: userData.nickname,
                        telegram_id: userData.telegramId,
                        username: userData.telegramId,
                        is_active: true
                    }
                ]);

            if (supabaseError) {
                console.error('Supabase save error:', supabaseError);
                // Supabase 저장 실패해도 IndexedDB는 성공했으므로 계속 진행
            }

            // 회원가입 후 자동 로그인
            setCurrentUser(user);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setAuthModalOpen(false);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('currentUser');
    };

    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
    };

    const value = {
        currentUser,
        isLoggedIn,
        login,
        register,
        logout,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
