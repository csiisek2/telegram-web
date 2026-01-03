import React from 'react';

export const RoomGridSkeleton = () => {
    return (
        <div style={styles.grid}>
            {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} style={styles.skeletonCard}>
                    <div style={styles.skeletonImage}></div>
                    <div style={styles.skeletonText}></div>
                    <div style={styles.skeletonTextShort}></div>
                </div>
            ))}
        </div>
    );
};

export const SidebarSkeleton = () => {
    return (
        <div style={styles.sidebar}>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={styles.skeletonBanner}></div>
            ))}
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    skeletonCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        padding: '12px',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    skeletonImage: {
        width: '100%',
        height: '120px',
        backgroundColor: '#e0e0e0',
        borderRadius: '6px',
        marginBottom: '8px',
    },
    skeletonText: {
        width: '80%',
        height: '16px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '4px',
    },
    skeletonTextShort: {
        width: '60%',
        height: '14px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    skeletonBanner: {
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        animation: 'pulse 1.5s ease-in-out infinite',
    }
};

export default { RoomGridSkeleton, SidebarSkeleton };
