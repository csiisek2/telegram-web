import { supabase } from '../lib/supabase';

// Get all users from auth.users
export const getAllUsers = async () => {
    try {
        // Since we can't directly query auth.users with anon key,
        // we'll query from channels table to get unique users
        const { data, error } = await supabase
            .from('channels')
            .select('user_id, email, nickname')
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
                        email: channel.email,
                        nickname: channel.nickname
                    });
                }
            });
        }

        return uniqueUsers;
    } catch (error) {
        console.error('getAllUsers error:', error);
        throw error;
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
