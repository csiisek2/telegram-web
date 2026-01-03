import { supabase } from '../lib/supabase';

/**
 * Get all users from the users table
 */
export const getAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getAllUsers error:', error);
        return [];
    }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (userId) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deleteUser error:', error);
        throw error;
    }
};

/**
 * Update user active status
 */
export const updateUserStatus = async (userId, isActive) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('updateUserStatus error:', error);
        throw error;
    }
};

/**
 * Search users by email or username
 */
export const searchUsers = async (searchTerm) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('searchUsers error:', error);
        throw error;
    }
};

/**
 * Suspend user for specified days
 * @param {string} userId - User ID
 * @param {number} days - Number of days to suspend
 */
export const suspendUser = async (userId, days) => {
    try {
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + days);

        const { error } = await supabase
            .from('users')
            .update({
                suspended_until: suspendUntil.toISOString(),
                is_permanently_banned: false, // Clear permanent ban if exists
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('suspendUser error:', error);
        throw error;
    }
};

/**
 * Permanently ban user
 */
export const permanentlyBanUser = async (userId) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                is_permanently_banned: true,
                suspended_until: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('permanentlyBanUser error:', error);
        throw error;
    }
};

/**
 * Lift suspension (clear both temp and permanent ban)
 */
export const liftSuspension = async (userId) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                suspended_until: null,
                is_permanently_banned: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('liftSuspension error:', error);
        throw error;
    }
};
