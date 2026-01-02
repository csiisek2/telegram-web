import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div className="container">
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
    }
};

export default Footer;
