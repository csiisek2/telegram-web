import { supabase } from '../lib/supabase';

// ==================== BANNERS ====================

export const getBanners = async () => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('type', 'banner')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getBanners error:', error);
        throw error;
    }
};

export const addBanner = async (bannerData) => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .insert([{
                type: 'banner',
                name: bannerData.title,
                description: bannerData.text,
                image_url: bannerData.image,
                link: bannerData.link,
                display_order: bannerData.display_order || 0,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('addBanner error:', error);
        throw error;
    }
};

export const updateBanner = async (id, bannerData) => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .update({
                name: bannerData.title,
                description: bannerData.text,
                image_url: bannerData.image,
                link: bannerData.link,
                display_order: bannerData.display_order,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('updateBanner error:', error);
        throw error;
    }
};

export const updateAllBanners = async (banners) => {
    try {
        const updates = banners.map((banner, index) => ({
            id: banner.id,
            name: banner.title,
            description: banner.text,
            image_url: banner.image,
            link: banner.link,
            display_order: index,
        }));

        // Batch update
        const promises = updates.map(update =>
            supabase
                .from('site_config')
                .update(update)
                .eq('id', update.id)
        );

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('updateAllBanners error:', error);
        throw error;
    }
};

export const deleteBanner = async (id) => {
    try {
        const { error } = await supabase
            .from('site_config')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deleteBanner error:', error);
        throw error;
    }
};

// ==================== ROOMS ====================

export const getRooms = async () => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('type', 'room')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getRooms error:', error);
        throw error;
    }
};

export const addRoom = async (roomData) => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .insert([{
                type: 'room',
                name: roomData.name,
                description: roomData.desc,
                image_url: roomData.image,
                link: roomData.link,
                members: roomData.members || 0,
                display_order: roomData.display_order || 0,
                is_pinned: roomData.isPinned || false,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('addRoom error:', error);
        throw error;
    }
};

export const updateAllRooms = async (rooms) => {
    try {
        const updates = rooms.map((room, index) => ({
            id: room.id,
            name: room.name,
            description: room.desc,
            image_url: room.image,
            link: room.link,
            members: room.members || 0,
            display_order: index,
            is_pinned: room.isPinned || false,
        }));

        const promises = updates.map(update =>
            supabase
                .from('site_config')
                .update(update)
                .eq('id', update.id)
        );

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('updateAllRooms error:', error);
        throw error;
    }
};

export const deleteRoom = async (id) => {
    try {
        const { error } = await supabase
            .from('site_config')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deleteRoom error:', error);
        throw error;
    }
};

// ==================== RIGHT BANNERS ====================

export const getRightBanners = async () => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('type', 'right_banner')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getRightBanners error:', error);
        throw error;
    }
};

export const updateAllRightBanners = async (banners) => {
    try {
        const updates = banners.map((banner, index) => ({
            id: banner.id,
            name: banner.title,
            description: banner.text,
            image_url: banner.image,
            link: banner.link,
            display_order: index,
        }));

        const promises = updates.map(update =>
            supabase
                .from('site_config')
                .update(update)
                .eq('id', update.id)
        );

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('updateAllRightBanners error:', error);
        throw error;
    }
};

export const addRightBanner = async (bannerData) => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .insert([{
                type: 'right_banner',
                name: bannerData.title,
                description: bannerData.text,
                image_url: bannerData.image,
                link: bannerData.link,
                display_order: bannerData.display_order || 0,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('addRightBanner error:', error);
        throw error;
    }
};

export const deleteRightBanner = async (id) => {
    try {
        const { error } = await supabase
            .from('site_config')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deleteRightBanner error:', error);
        throw error;
    }
};

// ==================== POWER LINKS ====================

export const getPowerLinks = async () => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('type', 'powerlink')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getPowerLinks error:', error);
        throw error;
    }
};

export const addPowerLink = async (powerLinkData) => {
    try {
        const { data, error } = await supabase
            .from('site_config')
            .insert([{
                type: 'powerlink',
                name: powerLinkData.name,
                link: powerLinkData.link,
                display_order: powerLinkData.display_order || 0,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('addPowerLink error:', error);
        throw error;
    }
};

export const updateAllPowerLinks = async (powerLinks) => {
    try {
        const updates = powerLinks.map((link, index) => ({
            id: link.id,
            name: link.name,
            link: link.link,
            display_order: index,
        }));

        const promises = updates.map(update =>
            supabase
                .from('site_config')
                .update(update)
                .eq('id', update.id)
        );

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('updateAllPowerLinks error:', error);
        throw error;
    }
};

export const deletePowerLink = async (id) => {
    try {
        const { error } = await supabase
            .from('site_config')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deletePowerLink error:', error);
        throw error;
    }
};

// ==================== HELPER FUNCTIONS ====================

// Convert Supabase data to frontend format
export const convertBannersFromDB = (dbData) => {
    return dbData.map(item => ({
        id: item.id,
        title: item.name,
        text: item.description,
        image: item.image_url,
        link: item.link,
    }));
};

export const convertRoomsFromDB = (dbData) => {
    return dbData.map(item => ({
        id: item.id,
        name: item.name,
        desc: item.description,
        image: item.image_url,
        link: item.link,
        members: item.members || 0,
        isPinned: item.is_pinned || false,
    }));
};

export const convertRightBannersFromDB = (dbData) => {
    return dbData.map(item => ({
        id: item.id,
        title: item.name,
        text: item.description,
        image: item.image_url,
        link: item.link,
    }));
};

export const convertPowerLinksFromDB = (dbData) => {
    return dbData.map(item => ({
        id: item.id,
        name: item.name,
        link: item.link,
    }));
};
