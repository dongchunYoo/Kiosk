import React, { useState } from 'react';
import ProductList from '../components/ProductManagement/ProductList';
import EditProductModal from '../components/ProductManagement/EditProductModal';
import AddCategoryModal from '../components/ProductManagement/AddCategoryModal';
import AddProductModal from '../components/ProductManagement/AddProductModal';
import apiClient from '../services/api';
import { logError } from '../utils/logger';

const ProductsPage = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [refreshProducts, setRefreshProducts] = useState(false);

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setIsEditModalOpen(true);
    };

    const handleSaveEditProduct = async (productId, updatedData) => {
        try {
            // enable → is_available로 변환
            const sendData = { ...updatedData };
            if ('is_available' in sendData) {
                sendData.is_available = !!sendData.is_available;
            }
            await apiClient.put(`/products/${productId}`, sendData);
            setIsEditModalOpen(false);
            setRefreshProducts(prev => !prev);
        } catch (error) {
            logError('Failed to update product:', error);
            alert('상품 정보 업데이트에 실패했습니다.');
        }
    };

    const handleAddCategory = () => {
        setIsAddCategoryModalOpen(true);
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            await apiClient.post('/categories', categoryData);
            setIsAddCategoryModalOpen(false);
            setRefreshProducts(prev => !prev);
        } catch (error) {
            logError('Failed to add category:', error);
            alert('카테고리 추가에 실패했습니다.');
        }
    };

    const handleAddProduct = () => {
        setIsAddProductModalOpen(true);
    };

    const handleSaveProduct = (newProduct) => {
        setIsAddProductModalOpen(false);
        setCurrentProduct(newProduct);
        setIsEditModalOpen(true);
        setRefreshProducts(prev => !prev);
    };

    return (
        <div>
            <div className="header-buttons" style={{ padding: '10px', textAlign: 'right' }}>
            </div>

            <ProductList
                onEditProduct={handleEditProduct}
                refreshProducts={refreshProducts}
                onAddCategory={handleAddCategory}
                onAddProduct={handleAddProduct}
            />

            {isEditModalOpen && (
                <EditProductModal
                    product={currentProduct}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEditProduct}
                />
            )}

            {isAddCategoryModalOpen && (
                <AddCategoryModal
                    onClose={() => setIsAddCategoryModalOpen(false)}
                    onSave={handleSaveCategory}
                />
            )}

            {isAddProductModalOpen && (
                <AddProductModal
                    onClose={() => setIsAddProductModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default ProductsPage;
