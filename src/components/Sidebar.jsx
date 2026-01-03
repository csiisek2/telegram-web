import React from 'react';
import LoginBox from './LoginBox';
import { siteConfigStore } from '../data/mockData';

const Sidebar = () => {
    const [banners, setBanners] = React.useState(siteConfigStore.getBanners());

    React.useEffect(() => {
        const unsubscribe = siteConfigStore.subscribe(() => {
            setBanners([...siteConfigStore.getBanners()]);
        });
        return () => unsubscribe();
    }, []);

    const categories = [
        '비트코인/가상화폐', '주식/재테크',
        '의료/병원', '의류/패션', '교육/강의',
        'IT/개발', '자동차', '여행', '기타'
    ];

    return (
        <aside style={styles.sidebar}>
            <LoginBox />

            {/* 3 Side Banners */}
            {banners.map((banner, index) => (
                <div
                    key={index}
                    style={banner.image ? { ...styles.sideBanner, padding: 0, overflow: 'hidden' } : styles.sideBanner}
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
                            <img src={banner.image} alt={banner.title} style={styles.bannerImage} loading="lazy" />
                        )
                    ) : (
                        <>
                            <div style={styles.bannerTitle}>{banner.title}</div>
                            <p style={styles.bannerText}>{banner.text}</p>
                        </>
                    )}
                </div>
            ))}

            {/* Category Section */}
            <div style={styles.categoryBox}>
                <h3 style={styles.catTitle}>카테고리</h3>
                <ul style={styles.catList}>
                    {categories.map((cat, i) => (
                        <li key={i} style={styles.catItem}>
                            <span style={styles.arrow}>▶</span> {cat}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    sideBanner: {
        backgroundColor: '#3b92d6',
        borderRadius: '8px',
        padding: '20px',
        color: '#fff',
        textAlign: 'center',
        cursor: 'pointer',
        height: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid #0088cc',
        boxShadow: '0 2px 4px rgba(0, 136, 204, 0.1)',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    bannerTitle: {
        fontWeight: 'bold',
        fontSize: '18px',
        marginBottom: '8px',
    },
    bannerText: {
        fontSize: '14px',
        lineHeight: '1.4',
        opacity: 0.9,
    },
    categoryBox: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '2px solid #0088cc',
        padding: '16px',
        marginTop: '8px',
        boxShadow: '0 2px 4px rgba(0, 136, 204, 0.1)',
    },
    catTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid var(--tg-primary)',
        color: '#333',
    },
    catList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    catItem: {
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer',
        transition: 'color 0.2s',
        padding: '4px 0',
        ':hover': {
            color: 'var(--tg-primary)',
            fontWeight: 'bold',
        }
    },
    arrow: {
        color: 'var(--tg-primary)',
        fontSize: '10px',
        marginRight: '6px',
    }
};

export default Sidebar;
