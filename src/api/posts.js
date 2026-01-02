import { supabase } from '../lib/supabase';

// ==================== POSTS ====================

export const getPosts = async (category = null, page = 1, limit = 10) => {
    try {
        let query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .order('pinned', { ascending: false })  // 고정글 먼저
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const start = (page - 1) * limit;
        query = query.range(start, start + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            posts: data || [],
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        };
    } catch (error) {
        console.error('getPosts error:', error);
        throw error;
    }
};

export const getPost = async (id) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('getPost error:', error);
        throw error;
    }
};

export const createPost = async (postData) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                title: postData.title,
                content: postData.content,
                author: postData.author,
                category: postData.category,
                views: 0,
                pinned: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('createPost error:', error);
        throw error;
    }
};

export const updatePost = async (id, postData) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({
                title: postData.title,
                content: postData.content,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('updatePost error:', error);
        throw error;
    }
};

export const deletePost = async (id) => {
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('deletePost error:', error);
        throw error;
    }
};

export const togglePinPost = async (id, isPinned) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({ pinned: isPinned })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('togglePinPost error:', error);
        throw error;
    }
};

export const incrementViews = async (id) => {
    try {
        const { error } = await supabase.rpc('increment_views', { post_id: id });
        if (error) throw error;
    } catch (error) {
        // Views increment is not critical, just log
        console.error('incrementViews error:', error);
    }
};

// Admin: Get all posts (no pagination)
export const getAllPosts = async () => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('getAllPosts error:', error);
        throw error;
    }
};
