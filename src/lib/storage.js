import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path (e.g., 'banners', 'rooms', 'right-banners')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, folder) => {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        console.log('Uploading file:', fileName, 'Type:', file.type, 'Size:', file.size);

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('telegrammedia')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        console.log('Upload successful:', data.path);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('telegrammedia')
            .getPublicUrl(filePath);

        console.log('Public URL:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('File upload failed:', error);
        throw new Error('파일 업로드에 실패했습니다: ' + error.message);
    }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (fileUrl) => {
    try {
        // Extract file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/telegrammedia/folder/filename
        const urlParts = fileUrl.split('/telegrammedia/');
        if (urlParts.length < 2) {
            console.warn('Invalid file URL, skipping delete:', fileUrl);
            return false;
        }

        const filePath = urlParts[1];

        console.log('Deleting file:', filePath);

        const { error } = await supabase.storage
            .from('telegrammedia')
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }

        console.log('Delete successful');
        return true;
    } catch (error) {
        console.error('File delete failed:', error);
        // Don't throw - deletion is not critical
        return false;
    }
};
