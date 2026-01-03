import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getBanners,
    getRooms,
    getRightBanners,
    getPowerLinks,
    convertBannersFromDB,
    convertRoomsFromDB,
    convertRightBannersFromDB,
    convertPowerLinksFromDB
} from '../api/siteConfig';

const SiteDataContext = createContext();

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (!context) {
        throw new Error('useSiteData must be used within SiteDataProvider');
    }
    return context;
};

export const SiteDataProvider = ({ children }) => {
    const [data, setData] = useState({
        banners: [],
        rooms: [],
        rightBanners: [],
        powerLinks: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);

                // 모든 데이터를 병렬로 한 번에 로드
                const [bannersData, roomsData, rightBannersData, powerLinksData] = await Promise.all([
                    getBanners(),
                    getRooms(),
                    getRightBanners(),
                    getPowerLinks()
                ]);

                setData({
                    banners: convertBannersFromDB(bannersData),
                    rooms: convertRoomsFromDB(roomsData),
                    rightBanners: convertRightBannersFromDB(rightBannersData),
                    powerLinks: convertPowerLinksFromDB(powerLinksData).sort((a, b) => b.id - a.id)
                });
            } catch (err) {
                console.error('데이터 로드 실패:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    return (
        <SiteDataContext.Provider value={{ data, loading, error }}>
            {children}
        </SiteDataContext.Provider>
    );
};
