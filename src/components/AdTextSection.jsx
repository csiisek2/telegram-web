import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { powerLinkChannels } from '../data/powerLinkData';

const AdTextSection = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    // 검색 필터 로직
    const filteredChannels = searchTerm
        ? powerLinkChannels.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (channel.category && channel.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : powerLinkChannels;

    // Pagination Logic
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredChannels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 검색어가 변경되면 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 페이지네이션 버튼 최대 5개만 표시
    const getPageNumbers = () => {
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxButtons / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxButtons - 1);

        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <section style={styles.section} id="home">
            <div style={styles.titleContainer}>
                <h2 style={styles.title}>파워링크</h2>
                {searchTerm && (
                    <span style={styles.searchInfo}>
                        '{searchTerm}' 검색 결과: {filteredChannels.length}개
                    </span>
                )}
            </div>
            {filteredChannels.length === 0 ? (
                <div style={styles.noResults}>
                    <p>검색 결과가 없습니다.</p>
                    <p style={{ fontSize: '14px', color: '#888' }}>다른 검색어를 시도해보세요.</p>
                </div>
            ) : (
                <ul style={styles.list}>
                    {currentItems.map((channel, index) => (
                        <li key={channel.id} style={styles.item}>
                            <span style={styles.number}>{startIndex + index + 1}</span>
                            <div style={styles.content}>
                                <span style={styles.adTitle}>{channel.name}</span>
                            </div>
                            <button
                                style={styles.linkBtn}
                                onClick={() => window.open(channel.link, '_blank')}
                            >
                                방문하기
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Controls */}
            <div style={styles.pagination}>
                <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={styles.pageBtn}
                >
                    &lt;
                </button>
                {getPageNumbers().map((page) => (
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={styles.pageBtn}
                >
                    &gt;
                </button>
            </div>
        </section>
    );
};

const styles = {
    section: {
        marginBottom: '24px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #eee',
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        borderLeft: '4px solid var(--tg-primary)',
        paddingLeft: '10px',
        margin: 0,
    },
    searchInfo: {
        fontSize: '14px',
        color: 'var(--tg-primary)',
        fontWeight: '600',
    },
    noResults: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#666',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f0f0f0',
    },
    number: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginRight: '12px',
        color: 'var(--tg-primary)',
        width: '24px',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    adTitle: {
        fontWeight: 'bold',
        fontSize: '15px',
        marginBottom: '4px',
        color: '#333',
    },
    adDesc: {
        fontSize: '13px',
        color: '#888',
    },
    linkBtn: {
        padding: '6px 12px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        color: '#555',
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
    }
};

export default AdTextSection;
