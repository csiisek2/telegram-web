import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRooms, convertRoomsFromDB } from '../api/siteConfig';

const RoomGrid = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const ITEMS_PER_PAGE = 21;

    // 1. [사용자 + 관리자 설정] Supabase에서 데이터 가져오기
    const [manualItems, setManualItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shuffleTrigger, setShuffleTrigger] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsData = await getRooms();
                setManualItems(convertRoomsFromDB(roomsData));
            } catch (error) {
                console.error('추천방 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    // 5분마다 랜덤 셔플 트리거
    useEffect(() => {
        const interval = setInterval(() => {
            setShuffleTrigger(prev => prev + 1);
        }, 5 * 60 * 1000); // 5분 = 300,000ms

        return () => clearInterval(interval);
    }, []);

    // 2. [자동 생성] 테스트를 위해 대량의 데이터를 자동으로 만듭니다.
    // 실제 운영 시에는 이 부분을 삭제하고 서버에서 데이터를 가져오게 됩니다.
    const generateMockData = (count) => {
        return Array.from({ length: count }, (_, i) => ({
            id: `mock-${i + 10000}`, // Use unique IDs that won't conflict with manual items
            name: '입점 예정',
            desc: '입점 문의 환영',
            members: 0,
            imageColor: '#74b9ff' // Unified Sky Blue
        }));
    };

    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // 데이터 합치기 (수동 추가 + 자동 생성 200개)
    // 고정된 항목은 맨 위에 표시, 나머지는 5분마다 랜덤 셔플
    const TOTAL_MOCK_ITEMS = 200;
    const pinnedItems = manualItems.filter(item => item.isPinned);
    const unpinnedItems = manualItems.filter(item => !item.isPinned);

    // 고정되지 않은 항목 랜덤 셔플 (shuffleTrigger가 변경될 때마다)
    const shuffledUnpinned = shuffleArray(unpinnedItems);

    const allRooms = [...pinnedItems, ...shuffledUnpinned, ...generateMockData(TOTAL_MOCK_ITEMS)];

    // 검색 필터링
    const filteredRooms = searchTerm
        ? allRooms.filter(room =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.desc && room.desc.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : allRooms;

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredRooms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 검색어 변경 시 첫 페이지로
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="container" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <div style={styles.titleContainer}>
                <div className="section-title">추천 홍보방</div>
                {searchTerm && (
                    <span style={styles.searchInfo}>
                        '{searchTerm}' 검색 결과: {filteredRooms.length}개
                    </span>
                )}
            </div>

            {/* Grid Area */}
            {filteredRooms.length === 0 ? (
                <div style={styles.noResults}>
                    <p>검색 결과가 없습니다.</p>
                    <p style={{ fontSize: '14px', color: '#888' }}>다른 검색어를 시도해보세요.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {currentItems.map((room) => (
                        <div
                            key={room.id}
                            style={styles.card}
                            onClick={() => room.link ? window.open(room.link, '_blank') : null}
                        >
                            {room.image ? (
                                <div style={styles.imagePlaceholder}>
                                    {room.image.startsWith('data:video') ? (
                                        <video src={room.image} autoPlay loop muted playsInline style={styles.image} />
                                    ) : (
                                        <img src={room.image} alt={room.name} style={styles.image} />
                                    )}
                                </div>
                            ) : (
                                <div style={{ ...styles.imagePlaceholder, backgroundColor: room.imageColor }}>
                                    <span style={{ color: '#fff', fontSize: '24px' }}>IMG</span>
                                </div>
                            )}
                            <div style={styles.content}>
                                <h3 style={styles.name}>
                                    {room.isPinned && <span style={styles.badge}>추천 채널</span>}
                                    {room.name}
                                </h3>
                                <p style={styles.desc}>{room.desc}</p>
                                <div style={styles.meta}>
                                    <span>👤 {room.members.toLocaleString()}명</span>
                                </div>
                                <button style={styles.button}>입장하기</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={styles.pagination}>
                <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={styles.pageBtn}
                >
                    &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                            ...styles.pageBtn,
                            backgroundColor: currentPage === page ? 'var(--tg-primary)' : '#fff',
                            color: currentPage === page ? '#fff' : 'var(--tg-text)',
                            borderColor: currentPage === page ? 'var(--tg-primary)' : 'var(--tg-border)',
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
        </div>
    );
};

const styles = {
    titleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    searchInfo: {
        fontSize: '14px',
        color: 'var(--tg-primary)',
        fontWeight: '600',
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666',
        backgroundColor: '#fff',
        borderRadius: '12px',
        marginBottom: '20px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Responsive, approx 4 cols on desktop
        gap: '16px',
        marginBottom: '32px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
    },
    imagePlaceholder: {
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    content: {
        padding: '12px',
    },
    name: {
        fontSize: '15px',
        fontWeight: '700',
        marginBottom: '4px',
        color: 'var(--tg-text)',
    },
    desc: {
        fontSize: '12px',
        color: 'var(--tg-text-secondary)',
        marginBottom: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    meta: {
        fontSize: '11px',
        color: '#888',
        marginBottom: '10px',
    },
    button: {
        width: '100%',
        padding: '8px',
        backgroundColor: '#eff7fd',
        color: 'var(--tg-primary)',
        fontWeight: '600',
        borderRadius: '8px',
        fontSize: '13px',
        transition: 'background-color 0.2s',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    },
    pageBtn: {
        minWidth: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: '1px solid var(--tg-border)',
        backgroundColor: '#fff',
        fontSize: '14px',
        padding: '0 8px',
    },
    badge: {
        backgroundColor: '#ffd700', // Gold
        color: '#000',
        fontSize: '11px',
        padding: '2px 5px',
        borderRadius: '4px',
        marginRight: '6px',
        verticalAlign: 'middle',
    }
};

export default RoomGrid;
