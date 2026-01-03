import React from 'react';

const MainBanner = () => {
    return (
        <div style={styles.banner}>
            <div style={styles.content}>
                <h2 style={styles.title}>텔레그램 홍보방 스페셜 이벤트</h2>
                <p style={styles.subtitle}>신규 제휴 등록 시 상단 노출 혜택 제공!</p>
                <button
                    style={styles.button}
                    onClick={() => window.open('https://t.me/xdev90', '_blank')}
                >
                    고객센터
                </button>
            </div>
            <div style={styles.decoration}>🎉</div>
        </div>
    );
};

const styles = {
    banner: {
        background: 'linear-gradient(135deg, #1a66a6 0%, #2481cc 100%)',
        borderRadius: '12px',
        padding: '30px',
        color: '#fff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #0088cc',
        boxShadow: '0 2px 4px rgba(0, 136, 204, 0.2)',
    },
    content: {
        zIndex: 1,
    },
    title: {
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        opacity: 0.9,
        marginBottom: '20px',
    },
    button: {
        backgroundColor: '#fff',
        color: '#2481cc',
        padding: '10px 20px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    decoration: {
        fontSize: '120px',
        position: 'absolute',
        right: '-20px',
        bottom: '-30px',
        opacity: 0.2,
        transform: 'rotate(-20deg)',
    }
};

export default MainBanner;
