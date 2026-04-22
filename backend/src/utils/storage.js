const path = require('path');
const supabase = require('../supabase');

/**
 * Upload a file buffer to Supabase Storage and return its public URL.
 * @param {string} bucket       - Storage bucket name ('avatars', 'cvs', 'cv-submissions')
 * @param {string} prefix       - Filename prefix ('avatar', 'cv', 'cvbox')
 * @param {Buffer} buffer       - File data
 * @param {string} originalname - Original filename (used to extract extension)
 * @param {string} mimetype     - MIME type of the file
 */
const uploadToStorage = async (bucket, prefix, buffer, originalname, mimetype) => {
  const ext      = path.extname(originalname).toLowerCase();
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: mimetype, upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return publicUrl;
};

/**
 * Delete a file from Supabase Storage by its public URL.
 * @param {string} bucket - Storage bucket name ('avatars', 'cvs', etc.)
 * @param {string} publicUrl - The full public URL of the file to delete
 */
const deleteFromStorage = async (bucket, publicUrl) => {
  // Extract the filename from the URL (last path segment)
  const filename = publicUrl.split('/').pop().split('?')[0];
  const { error } = await supabase.storage.from(bucket).remove([filename]);
  if (error) throw error;
};

module.exports = { uploadToStorage, deleteFromStorage };
