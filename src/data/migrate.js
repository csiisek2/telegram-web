import { supabase } from '../lib/supabase';
import { powerLinkChannels } from './powerLinkData';
import { initialBanners, initialRecommendedRooms, initialRightBanners } from './mockData';

// 파워링크 채널 데이터 마이그레이션
export const migrateChannels = async () => {
    try {
        console.log('🔄 Channels 마이그레이션 시작...');

        // 기존 데이터 삭제 (선택사항)
        // await supabase.from('channels').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 데이터 변환 및 삽입
        const channelsData = powerLinkChannels.map((channel, index) => ({
            name: channel.name,
            link: channel.link,
            category: null,
            display_order: index + 1,
        }));

        const { data, error } = await supabase
            .from('channels')
            .insert(channelsData)
            .select();

        if (error) throw error;

        console.log(`✅ ${data.length}개의 채널 마이그레이션 완료!`);
        return { success: true, count: data.length };
    } catch (error) {
        console.error('❌ Channels 마이그레이션 실패:', error.message);
        return { success: false, error: error.message };
    }
};

// Site Config 데이터 마이그레이션
export const migrateSiteConfig = async () => {
    try {
        console.log('🔄 Site Config 마이그레이션 시작...');

        // Banner 데이터 변환
        const bannersData = initialBanners.map((banner, index) => ({
            type: 'banner',
            name: banner.title,
            description: banner.text,
            image_url: banner.image,
            link: banner.link,
            display_order: index + 1,
        }));

        // Recommended Rooms 데이터 변환
        const roomsData = initialRecommendedRooms.map((room, index) => ({
            type: 'room',
            name: room.name,
            description: room.desc,
            image_url: room.image,
            link: room.link,
            members: room.members || 0,
            display_order: index + 1,
            is_pinned: room.isPinned || false,
        }));

        // Right Banners 데이터 변환
        const rightBannersData = initialRightBanners.map((banner, index) => ({
            type: 'right_banner',
            name: banner.title,
            description: banner.text,
            image_url: banner.image,
            link: banner.link,
            display_order: index + 1,
        }));

        // 모든 site_config 데이터 삽입
        const allData = [...bannersData, ...roomsData, ...rightBannersData];

        const { data, error } = await supabase
            .from('site_config')
            .insert(allData)
            .select();

        if (error) throw error;

        console.log(`✅ ${data.length}개의 Site Config 마이그레이션 완료!`);
        return { success: true, count: data.length };
    } catch (error) {
        console.error('❌ Site Config 마이그레이션 실패:', error.message);
        return { success: false, error: error.message };
    }
};

// 전체 마이그레이션 실행
export const migrateAllData = async () => {
    console.log('🚀 데이터 마이그레이션 시작...\n');

    const channelsResult = await migrateChannels();
    const siteConfigResult = await migrateSiteConfig();

    console.log('\n📊 마이그레이션 결과:');
    console.log(`Channels: ${channelsResult.success ? '✅ 성공' : '❌ 실패'} (${channelsResult.count || 0}개)`);
    console.log(`Site Config: ${siteConfigResult.success ? '✅ 성공' : '❌ 실패'} (${siteConfigResult.count || 0}개)`);

    return {
        channels: channelsResult,
        siteConfig: siteConfigResult,
    };
};
