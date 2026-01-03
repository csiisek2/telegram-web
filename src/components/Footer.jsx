import React from 'react';
import { useSiteData } from '../context/SiteDataContext';

const Footer = () => {
    const { data, loading } = useSiteData();
    const powerLinks = data.powerLinks;

    return (
        <footer style={styles.footer}>
            <div className="container">
                {/* Power Links Section */}
                {!loading && powerLinks.length > 0 && (
                    <div style={styles.powerLinksSection}>
                        <h3 style={styles.sectionTitle}>파워링크</h3>
                        <div style={styles.powerLinksGrid}>
                            {powerLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.powerLink}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div style={styles.links}>
                    <a href="#" style={styles.link}>이용약관</a>
                    <a href="#" style={styles.link}>개인정보처리방침</a>
                    <a href="#" style={styles.link}>광고문의</a>
                </div>
                <p style={styles.copy}>&copy; 2026 텔레그램 홍보방 모음. 모든 권리 보유.</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        borderTop: '1px solid var(--tg-border)',
        padding: '24px 0',
        backgroundColor: '#fff',
        marginTop: 'auto',
    },
    powerLinksSection: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #eee',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '15px',
        textAlign: 'center',
    },
    powerLinksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
    },
    powerLink: {
        display: 'block',
        padding: '10px 15px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        color: 'var(--tg-primary)',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '500',
        textAlign: 'center',
        transition: 'all 0.2s',
        cursor: 'pointer',
    },
    copy: {
        marginTop: '20px',
        color: '#888',
        fontSize: '12px',
        textAlign: 'center',
    },
    text: {
        color: '#888',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '10px',
    },
    links: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '12px',
        color: 'var(--tg-primary)',
        cursor: 'pointer',
    },
    link: {
        color: 'var(--tg-primary)',
        textDecoration: 'none',
    }
};

export default React.memo(Footer);
