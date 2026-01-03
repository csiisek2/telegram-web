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
                // 1단계: 가장 중요한 rooms만 먼저 로드 (즉시 표시)
                const roomsData = await getRooms();
                setData(prev => ({
                    ...prev,
                    rooms: convertRoomsFromDB(roomsData)
                }));
                setLoading(false); // 메인 콘텐츠 로딩 완료

                // 2단계: 나머지 데이터를 병렬로 백그라운드 로드
                const [bannersData, rightBannersData, powerLinksData] = await Promise.all([
                    getBanners(),
                    getRightBanners(),
                    getPowerLinks()
                ]);

                setData(prev => ({
                    ...prev,
                    banners: convertBannersFromDB(bannersData),
                    rightBanners: convertRightBannersFromDB(rightBannersData),
                    powerLinks: convertPowerLinksFromDB(powerLinksData).sort((a, b) => b.id - a.id)
                }));
            } catch (err) {
                console.error('데이터 로드 실패:', err);
                setError(err);
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
