import { AuthAPI } from './auth';

/**
 * Vendor Products API Service
 * Handles all product management operations for vendors
 * Uses AuthAPI for authentication with credentials
 */

/**
 * Get all products for the authenticated vendor
 * @returns {Promise<Object>} Response containing array of products
 */
export const getVendorProducts = async () => {
    try {
        return await AuthAPI.getAllVendorProducts();
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        throw error;
    }
};

/**
 * Get vendor products by category
 * @param {number} categoryId - The category ID
 * @returns {Promise<Object>} Response containing array of products in that category
 */
export const getVendorProductsByCategory = async (categoryId) => {
    try {
        return await AuthAPI.getVendorProductsByCategory(categoryId);
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        throw error;
    }
};

/**
 * Get a specific product by ID
 * @param {string} publicProductId - The public product ID
 * @returns {Promise<Object>} Response containing product details
 */
export const getVendorProduct = async (publicProductId) => {
    try {
        return await AuthAPI.getVendorProduct(publicProductId);
    } catch (error) {
        console.error(`Error fetching product ${publicProductId}:`, error);
        throw error;
    }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {string} productData.category - Product category
 * @param {boolean} productData.available - Availability status
 * @returns {Promise<Object>} Response containing created product
 */
export const createProduct = async (productData) => {
    try {
        return await AuthAPI.createProducts(productData);
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

/**
 * Update an existing product
 * @param {string} publicProductId - The public product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Response containing updated product
 */
export const updateProduct = async (publicProductId, productData) => {
    try {
        return await AuthAPI.editVendorProduct(publicProductId, productData);
    } catch (error) {
        console.error(`Error updating product ${publicProductId}:`, error);
        throw error;
    }
};

/**
 * Delete a product
 * @param {string} publicProductId - The public product ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteProduct = async (publicProductId) => {
    try {
        return await AuthAPI.deleteVendorProduct(publicProductId);
    } catch (error) {
        console.error(`Error deleting product ${publicProductId}:`, error);
        throw error;
    }
};

/**
 * Toggle product availability
 * @param {string} publicProductId - The public product ID
 * @param {boolean} available - New availability status
 * @returns {Promise<Object>} Response containing updated product
 */
export const toggleProductAvailability = async (publicProductId, available) => {
    try {
        return await AuthAPI.toggleProductAvailability(publicProductId, available);
    } catch (error) {
        console.error(`Error toggling availability for product ${publicProductId}:`, error);
        throw error;
    }
};

/**
 * Upload product image
 * @param {string} publicProductId - The public product ID
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Response containing image URL
 */
export const uploadProductImage = async (publicProductId, imageFile) => {
    try {
        return await AuthAPI.uploadProductImage(publicProductId, imageFile);
    } catch (error) {
        console.error(`Error uploading image for product ${publicProductId}:`, error);
        throw error;
    }
};
