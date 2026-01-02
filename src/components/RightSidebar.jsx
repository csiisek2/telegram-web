import React, { useState, useEffect } from 'react';
import { getRightBanners, convertRightBannersFromDB } from '../api/siteConfig';
import RoomGrid from './RoomGrid';

const RightSidebar = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const bannersData = await getRightBanners();
                setBanners(convertRightBannersFromDB(bannersData));
            } catch (error) {
                console.error('우측 배너 로드 실패:', error);
            }
        };
        fetchBanners();
    }, []);

    return (
        <aside style={styles.sidebar}>
            {/* 추천채널을 맨 위에 배치 */}
            <RoomGrid />

            <div className="section-title" style={{ marginTop: '40px' }}>스페셜 업소</div>

            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    style={banner.image ? { ...styles.bannerItem, padding: 0, overflow: 'hidden' } : styles.bannerItem}
                    onClick={() => banner.link ? window.open(banner.link, '_blank') : null}
                >
                    {banner.image ? (
                        banner.image.startsWith('data:video') ? (
                            <video
                                src={banner.image}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={styles.bannerImage}
                            />
                        ) : (
                            <img src={banner.image} alt={banner.title} style={styles.bannerImage} />
                        )
                    ) : (
                        <div style={styles.bannerContent}>
                            <h3 style={styles.inquiryText}>{banner.title}</h3>
                            <p style={styles.subText}>{banner.text}</p>
                        </div>
                    )}
                </div>
            ))}
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '400px', // 추천채널을 위해 너비 확장
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    bannerItem: {
        height: '240px',
        backgroundColor: '#f5f5f5', // Neutral gray
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#888',
        transition: 'background-color 0.2s',
    },
    bannerContent: {
        textAlign: 'center',
    },
    inquiryText: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#aaa',
    },
    subText: {
        fontSize: '14px',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    }
};

export default RightSidebar;
