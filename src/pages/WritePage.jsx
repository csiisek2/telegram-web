
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost } from '../api/posts';
import { useAuth } from '../context/AuthContext';

const WritePage = ({ category }) => {
    const navigate = useNavigate();
    const { isLoggedIn, currentUser, openAuthModal } = useAuth();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 로그인 체크 및 작성자 자동 입력
    useEffect(() => {
        if (!isLoggedIn) {
            // 비로그인 시 로그인 모달 열고 홈으로 이동
            openAuthModal('login');
            navigate('/');
            return;
        }
        // 로그인 시 작성자 자동 입력
        setAuthor(currentUser?.nickname || '');
    }, [isLoggedIn, currentUser, navigate, openAuthModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !author.trim() || !content.trim()) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await createPost({
                title: title.trim(),
                author: author,
                content: content.trim(),
                category: category === 'free' ? 'free' : 'scammer',
                user_id: currentUser?.id || null
            });

            alert('게시글이 등록되었습니다!');

            if (category === 'free') {
                navigate('/free');
            } else {
                navigate('/scammer');
            }
        } catch (error) {
            console.error('게시글 등록 실패:', error);
            alert('게시글 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const pageTitle = category === 'free' ? '자유게시판 글쓰기' : '사기꾼 게시판 글쓰기';

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h2 style={styles.title}>{pageTitle}</h2>
            </div>
            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>작성자 (로그인 정보)</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={author}
                            readOnly
                            placeholder="작성자 이름"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>제목</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="글 제목"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>내용</label>
                        <textarea
                            style={styles.textarea}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="글 내용을 입력하세요"
                        />
                    </div>
                    <div style={styles.buttonGroup}>
                        <button type="button" style={styles.cancelBtn} onClick={handleCancel}>취소</button>
                        <button type="submit" style={styles.submitBtn} disabled={submitting}>
                            {submitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

const styles = {
    section: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #eee',
        marginBottom: '24px',
    },
    header: {
        borderBottom: '2px solid var(--tg-primary)',
        paddingBottom: '10px',
        marginBottom: '20px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
    },
    formContainer: {
        padding: '10px 0',
    },
    formGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        minHeight: '300px',
        resize: 'vertical',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px',
    },
    cancelBtn: {
        padding: '8px 16px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        color: '#666',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '8px 16px',
        border: 'none',
        backgroundColor: 'var(--tg-primary)',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};

export default WritePage;
