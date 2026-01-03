import React from 'react';
import { useSiteData } from '../context/SiteDataContext';

const RightSidebar = () => {
    const { data } = useSiteData();
    const banners = data.rightBanners;

    return (
        <aside style={styles.sidebar}>
            <div className="section-title">스페셜 업소</div>

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
        width: '180px',
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
