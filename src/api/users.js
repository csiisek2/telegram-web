import { supabase } from '../lib/supabase';

// Get all users from channels table
export const getAllUsers = async () => {
    try {
        // Query channels table for user info
        const { data, error } = await supabase
            .from('channels')
            .select('user_id, user_name, user_email')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Remove duplicates by user_id
        const uniqueUsers = [];
        const seenIds = new Set();

        if (data) {
            data.forEach(channel => {
                if (channel.user_id && !seenIds.has(channel.user_id)) {
                    seenIds.add(channel.user_id);
                    uniqueUsers.push({
                        id: channel.user_id,
                        email: channel.user_email || '이메일 없음',
                        nickname: channel.user_name || '닉네임 없음'
                    });
                }
            });
        }

        return uniqueUsers;
    } catch (error) {
        console.error('getAllUsers error:', error);
        // Return empty array instead of throwing to prevent admin page crash
        return [];
    }
};

// Delete user's channels (user cleanup)
export const deleteUserData = async (userId) => {
    try {
        // Delete all channels owned by this user
        const { error } = await supabase
            .from('channels')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deleteUserData error:', error);
        throw error;
    }
};
