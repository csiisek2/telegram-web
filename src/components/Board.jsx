import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPosts, incrementViews } from '../api/posts';
import { useAuth } from '../context/AuthContext';

const Board = ({ boardTitle = '자유게시판', boardCategory = '자유', id, preview = false, linkUrl = '#', writeUrl = null }) => {
    const { isLoggedIn, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const [posts, setPosts] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail'
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    // Map category names
    const categoryMap = {
        '자유': 'free',
        '사기꾼': 'scammer'
    };

    // Initial Data Fetch
    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true);
            try {
                const category = categoryMap[boardCategory];
                const result = await getPosts(category, 1, 100); // Get all posts for now
                setPosts(result.posts);
                setTotalPages(result.totalPages);
            } catch (error) {
                console.error('게시글 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();

        // Refresh every 10 seconds
        const interval = setInterval(loadPosts, 10000);
        return () => clearInterval(interval);
    }, [boardCategory]);

    // 검색 필터링
    const filteredPosts = searchTerm
        ? posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : posts;


    // Pagination Logic
    const ITEMS_PER_PAGE = 10; // Increased for full page view
    const [currentPage, setCurrentPage] = useState(1);

    // Derived state for pagination
    const paginatedTotalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    // In preview mode: show top 5. In full mode: show based on pagination
    const currentItems = preview ? filteredPosts.slice(0, 5) : filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 검색어 변경 시 첫 페이지로
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePostClick = async (post) => {
        if (preview) return;
        setSelectedPost(post);
        setViewMode('detail');

        // Increment views
        try {
            await incrementViews(post.id);
            // Update local state
            setPosts(prevPosts => prevPosts.map(p =>
                p.id === post.id ? { ...p, views: p.views + 1 } : p
            ));
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedPost(null);
    };

    const handleWriteClick = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            openAuthModal('login');
        } else {
            navigate(writeUrl);
        }
    };

    return (
        <section id={id} style={styles.section}>
            <div style={styles.header}>
                <div style={styles.titleContainer}>
                    <h2 style={styles.title}>{boardTitle}</h2>
                    {!preview && searchTerm && (
                        <span style={styles.searchInfo}>
                            '{searchTerm}' 검색 결과: {filteredPosts.length}개
                        </span>
                    )}
                </div>
                {preview ? (
                    <Link to={linkUrl} style={styles.viewAllBtn}>전체보기 &gt;</Link>
                ) : (
                    viewMode === 'list' && writeUrl && (
                        <button onClick={handleWriteClick} style={styles.writeButton}>글쓰기</button>
                    )
                )}
            </div>

            {viewMode === 'detail' && selectedPost && (
                <div style={styles.detailContainer}>
                    <div style={styles.detailHeader}>
                        <h3 style={styles.detailTitle}>{selectedPost.title}</h3>
                        <div style={styles.detailMeta}>
                            <span>작성자: {selectedPost.author}</span>
                            <span>날짜: {new Date(selectedPost.created_at).toLocaleDateString()}</span>
                            <span>조회: {selectedPost.views}</span>
                        </div>
                    </div>
                    <div style={styles.detailContent}>
                        {selectedPost.content.split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={styles.buttonGroup}>
                        <button style={styles.listBtn} onClick={handleBackToList}>목록으로</button>
                    </div>
                </div>
            )}

            {viewMode === 'list' && (
                <>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.thTitle}>제목</th>
                                <th style={styles.th}>작성자</th>
                                <th style={styles.th}>작성일</th>
                                <th style={styles.th}>조회</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((post) => (
                                    <tr key={post.id} style={styles.tr}>
                                        <td style={styles.tdTitle} onClick={() => handlePostClick(post)}>
                                            {post.pinned && <span style={styles.pinnedBadge}>📌 </span>}
                                            {post.title}
                                        </td>
                                        <td style={styles.td}>{post.author}</td>
                                        <td style={styles.td}>{new Date(post.created_at).toLocaleDateString()}</td>
                                        <td style={styles.td}>{post.views}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ ...styles.td, padding: '30px' }}>
                                        {searchTerm ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls - Hide in Preview Mode */}
                    {!preview && filteredPosts.length > 0 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                style={styles.pageBtn}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: paginatedTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                        ...styles.pageBtn,
                                        ...(currentPage === page ? styles.activePageBtn : {}),
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(Math.min(paginatedTotalPages, currentPage + 1))}
                                disabled={currentPage === paginatedTotalPages}
                                style={styles.pageBtn}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '2px solid var(--tg-primary)',
        paddingBottom: '10px',
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    searchInfo: {
        fontSize: '14px',
        color: 'var(--tg-primary)',
        fontWeight: '600',
    },
    viewAllBtn: {
        fontSize: '13px',
        color: '#666',
        textDecoration: 'none',
        cursor: 'pointer',
        fontWeight: '500',
    },
    writeButton: {
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    thRow: {
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #eee',
        color: '#555',
    },
    th: {
        padding: '12px 0',
        fontWeight: '600',
        textAlign: 'center',
    },
    thTitle: {
        padding: '12px 10px',
        fontWeight: '600',
        textAlign: 'left',
    },
    tr: {
        borderBottom: '1px solid #f5f5f5',
        ':hover': {
            backgroundColor: '#fcfcfc',
        }
    },
    td: {
        padding: '12px 0',
        textAlign: 'center',
        color: '#666',
    },
    tdCat: {
        padding: '12px 0',
        textAlign: 'center',
        color: 'var(--tg-primary)',
        fontWeight: 'bold',
    },
    tdTitle: {
        padding: '12px 10px',
        textAlign: 'left',
        color: '#333',
        cursor: 'pointer',
    },
    pinnedBadge: {
        color: '#f39c12',
        marginRight: '4px',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        gap: '5px',
    },
    pageBtn: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#333',
    },
    activePageBtn: {
        backgroundColor: 'var(--tg-primary)',
        color: '#fff',
        borderColor: 'var(--tg-primary)',
        fontWeight: 'bold',
    },
    detailContainer: {
        padding: '10px 0',
    },
    detailHeader: {
        borderBottom: '1px solid #eee',
        paddingBottom: '16px',
        marginBottom: '20px',
    },
    detailTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    detailMeta: {
        fontSize: '13px',
        color: '#888',
        display: 'flex',
        gap: '15px',
    },
    detailContent: {
        minHeight: '200px',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#444',
        marginBottom: '20px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px',
    },
    listBtn: {
        padding: '8px 16px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};

export default Board;
