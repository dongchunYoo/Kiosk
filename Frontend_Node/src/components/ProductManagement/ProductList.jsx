import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { logError, logDebug } from '../../utils/logger';
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 가격을 원화로 포맷합니다. 소숫점은 반올림하여 제거합니다.
const formatKRW = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  const rounded = Math.round(n);
  return rounded.toLocaleString('ko-KR') + '원';
};

const ProductItem = ({ product, onEditProduct, onAddOption, isDragging, listeners }) => {
  const normalizeImagePath = (imgPath) => {
    if (!imgPath) return null;
    // absolute URL
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    let p = imgPath;
    // /image/uploads/... -> /image/...
    p = p.replace(/\/image\/uploads\//, '/image/');
    p = p.replace(/\/uploads\//, '/');
    // if path now starts with '/products' or '/image/products' ensure it has /image prefix
    if (p.startsWith('/products/')) p = '/image' + p;
    if (!p.startsWith('/image') && !p.startsWith('/uploads') && !p.startsWith('/')) p = '/' + p;
    return p;
  };

  try {
    const nodePath = (import.meta && import.meta.env && import.meta.env.NodePath) || 'http://localhost:3000';
    const rel = product && product.image_url ? normalizeImagePath(product.image_url) : null;
    const fullUrl = rel ? (rel.startsWith('http') ? rel : `${nodePath}${rel}`) : null;
    logDebug('[ProductList] render product image:', { id: product && product.id, image_url: product && product.image_url, fullUrl, nodePath });
  } catch (e) {
    logDebug('[ProductList] render product image: failed to compute image url', e);
  }
  return (
    <div
      className="store-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #eee',
        background: product.is_available ? (isDragging ? '#e3f2fd' : '#fff') : '#e0e0e0',
        color: product.is_available ? '#333' : '#888',
        boxShadow: isDragging ? '0 2px 8px rgba(33,150,243,0.2)' : 'none',
        marginLeft: '32px',
        borderLeft: '1.5px solid #e0e0e0',
      }}
    >
      <div className="product-details" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <span style={{ cursor: 'grab' }} {...listeners}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="5" r="2" fill="#888" />
            <circle cx="5" cy="15" r="2" fill="#888" />
            <circle cx="15" cy="5" r="2" fill="#888" />
            <circle cx="15" cy="15" r="2" fill="#888" />
          </svg>
        </span>
        {/* 이미지 미리보기 추가 */}
        <div style={{ width: 48, height: 48, marginRight: 8, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 6 }}>
          {product.image_url ? (
            (() => {
              const nodePath = (import.meta && import.meta.env && import.meta.env.NodePath) || 'http://localhost:3000';
              const rel = normalizeImagePath(product.image_url);
              const src = rel ? (rel.startsWith('http') ? rel : `${nodePath}${rel}`) : null;
              return src ? (
                <img src={src}
                  alt="상품이미지"
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 4 }} />
              ) : (
                <span style={{ color: '#bbb', fontSize: 12 }}>이미지 없음</span>
              );
            })()
          ) : (
            <span style={{ color: '#bbb', fontSize: 12 }}>이미지 없음</span>
          )}
        </div>
        <span className="product-name" style={{ fontWeight: 'bold', fontSize: '16px' }}>{product.name}</span>
        <span className="product-price">{formatKRW(product.price)}</span>
        <span className="product-enable">{product.is_available ? '활성화' : '비활성화'}</span>
      </div>
      <div>
        <button className="edit-button" onClick={() => onEditProduct(product)}>수정</button>
        <button className="edit-button" style={{ marginLeft: 8 }} onClick={() => onAddOption(product)}>옵션등록</button>
      </div>
    </div>
  );
}
const SortableProductItem = ({ product, onEditProduct, onAddOption, onEditOption, onDeleteOption }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `product-${product.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ProductItem product={product} onEditProduct={onEditProduct} onAddOption={onAddOption} isDragging={isDragging} listeners={listeners} />
      {/* 옵션 리스트 렌더링 */}
      {product.product_options && product.product_options.length > 0 && (
        <div style={{ marginLeft: 42, marginTop: 8 }}>
              {Array.isArray(product.product_options) && product.product_options.map(opt => (
            <div
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 24px',
                borderBottom: '1px solid #eee',
                background: opt.is_available !== false ? '#f7faff' : '#f0f0f0',
                color: opt.is_available !== false ? '#333' : '#888',
                boxShadow: '0 1px 4px rgba(33,150,243,0.07)',
                marginLeft: '10px',
                borderLeft: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '4px',
                minHeight: '40px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{opt.name}</span>
                <span style={{ fontSize: '15px', color: '#1976d2' }}>{formatKRW(opt.price)}</span>
              </div>
              <div>
                <button className="edit-button" onClick={() => onEditOption(product, opt)}>수정</button>
                <button className="edit-button" style={{ marginLeft: 8 }} onClick={() => onDeleteOption(opt.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryHeader = ({ category, isDragging, productsInCategory, onDeleteCategory, totalCategoryCount }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '16px 24px', background: isDragging ? '#e3f2fd' : '#f0f0f0', borderBottom: '1px solid #e0e0e0', position: 'relative' }}>
    <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#333', minWidth: '80px' }}>No.{category.display_order}</span>
    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#222', minWidth: '120px' }}>{category.name}</span>
    <span style={{ fontSize: '16px', color: '#666', minWidth: '200px' }}>{category.description}</span>
    {/* 삭제 버튼: 오른쪽 끝 */}
    <button
      style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: (totalCategoryCount > 1 && productsInCategory.length === 0) ? '#e53935' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: (totalCategoryCount > 1 && productsInCategory.length === 0) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: 14 }}
      disabled={!(totalCategoryCount > 1 && productsInCategory.length === 0)}
      onClick={() => (totalCategoryCount > 1 && productsInCategory.length === 0) && onDeleteCategory(category.id)}
    >삭제</button>
  </div>
);

const SortableCategoryItem = ({ category, products, onEditProduct, onAddOption, onEditOption, onDeleteOption, onDeleteCategory, totalCategoryCount }) => {
  const style = {
    marginBottom: '32px',
    border: '1px solid #eee',
    borderRadius: '8px',
    background: '#fafafa',
  };

  return (
    <div style={style}>
      <CategoryHeader category={category} isDragging={false} productsInCategory={products} onDeleteCategory={onDeleteCategory} totalCategoryCount={totalCategoryCount} />
      <SortableContext items={Array.isArray(products) ? products.map(p => `product-${p.id}`) : []} strategy={verticalListSortingStrategy}>
        {Array.isArray(products) && products.length > 0 ? (
          products.map(product => (
            <SortableProductItem key={product.id} product={product} onEditProduct={onEditProduct} onAddOption={onAddOption} onEditOption={onEditOption} onDeleteOption={onDeleteOption} />
          ))
        ) : (
          <p style={{ padding: '10px 24px' }}>이 카테고리에 상품이 없습니다.</p>
        )}
      </SortableContext>
    </div>
  );
};

const ProductList = ({ onEditProduct, refreshProducts, onAddCategory, onAddProduct }) => {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [activeId, setActiveId] = useState(null);

  // 옵션 관리 상태
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [optionEditData, setOptionEditData] = useState(null); // {productId, optionId}
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('');

  useEffect(() => {
    if (storeId) {
      fetchData(storeId);
    }
  }, [storeId, refreshProducts]);

  const fetchData = async (storeId) => {
    try {
      const storeUrl = `/stores/${storeId}`;
      const categoriesUrl = `/categories/${storeId}`;
      const productsUrl = `/products?storeId=${storeId}`;


      const [storeRes, catRes, prodRes] = await Promise.all([
        apiClient.get(storeUrl),
        apiClient.get(categoriesUrl),
        apiClient.get(productsUrl),
      ]);

      const extractPayload = (res) => {
        if (!res) return null;
        // Axios response where server returns array directly
        if (Array.isArray(res.data)) return res.data;
        // Server wraps payload as { ok: true, data: ... }
        if (res.data && Object.prototype.hasOwnProperty.call(res.data, 'data')) return res.data.data;
        // Fallback to raw data
        return res.data;
      };

      const storePayload = extractPayload(storeRes);
      const catPayload = extractPayload(catRes);
      const prodPayload = extractPayload(prodRes);

      try {
        if (Array.isArray(prodPayload)) {
          prodPayload.forEach(p => {
            logDebug('[ProductList] product image:', { id: p.id, image_url: p.image_url || p.relativeUrl || p.image || null });
          });
        }
      } catch (e) {
        logError('[ProductList] failed to log product images', e);
      }

      setStoreName(storePayload && storePayload.name ? storePayload.name : '');
      setCategories(Array.isArray(catPayload) ? catPayload.sort((a, b) => a.display_order - b.display_order) : []);
      setProducts(Array.isArray(prodPayload) ? prodPayload : []);
    } catch (error) {
      logError('Failed to fetch data:', error);
      alert('데이터를 불러오는 데 실패했습니다.');
    }
  };

  // Note: intentionally not using `useSensors`/`useSensor` here to avoid
  // potential invalid hook call issues originating from mixed/duplicated
  // package resolution in the dev environment. DndContext will use its
  // default sensors.

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const activeType = active.id.split('-')[0];
      const overType = over.id.split('-')[0];

      if (activeType === 'category' && overType === 'category') {
        const oldIndex = categories.findIndex((c) => `category-${c.id}` === active.id);
        const newIndex = categories.findIndex((c) => `category-${c.id}` === over.id);
        const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(reorderedCategories);
        const updatedCategories = reorderedCategories.map((cat, index) => ({
          ...cat,
          display_order: index + 1
        }));
        try {
          await Promise.all(updatedCategories.map(cat =>
            apiClient.put(`/categories/${cat.id}`, { display_order: cat.display_order })
          ));
        } catch (error) {
          logError('Failed to update category order:', error);
          alert('카테고리 순서 업데이트에 실패했습니다.');
          fetchData(storeId);
        }
      } else if (activeType === 'product') {
        const sourceContainerId = findContainer(active.id);
        let destContainerId = findContainer(over.id);
        if (!destContainerId) {
          if (over.id.startsWith('category')) {
            destContainerId = over.id;
          } else {
            return;
          }
        }

        const sourceCategoryId = parseInt(sourceContainerId.split('-')[1]);
        const destCategoryId = parseInt(destContainerId.split('-')[1]);

        const activeProductId = parseInt(active.id.split('-')[1]);

        let newProducts = [...products];

        if (sourceCategoryId === destCategoryId) {
          const productsInCategory = (Array.isArray(products) ? products : []).filter(p => p.category_id === sourceCategoryId).sort((a, b) => a.display_order - b.display_order);
          const oldIndex = productsInCategory.findIndex(p => `product-${p.id}` === active.id);
          const overProductId = parseInt(over.id.split('-')[1]);
          const newIndex = productsInCategory.findIndex(p => p.id === overProductId);

          const reordered = arrayMove(productsInCategory, oldIndex, newIndex);
          const updated = reordered.map((p, i) => ({ ...p, display_order: i + 1 }));
          newProducts = (Array.isArray(products) ? products : []).filter(p => p.category_id !== sourceCategoryId).concat(updated);
          setProducts(newProducts);
          await Promise.all(updated.map(p => apiClient.put(`/products/${p.id}`, { display_order: p.display_order })));
        } else {
          const productToMove = (Array.isArray(products) ? products : []).find(p => p.id === activeProductId);
          productToMove.category_id = destCategoryId;

          const sourceProducts = (Array.isArray(products) ? products : []).filter(p => p.category_id === sourceCategoryId && p.id !== activeProductId).sort((a, b) => a.display_order - b.display_order);
          const destProducts = (Array.isArray(products) ? products : []).filter(p => p.category_id === destCategoryId).sort((a, b) => a.display_order - b.display_order);

          const overId = over.id.split('-')[1];
          const newIndex = destProducts.findIndex(p => p.id === parseInt(overId));

          if (newIndex !== -1) {
            destProducts.splice(newIndex, 0, productToMove);
          } else {
            destProducts.push(productToMove);
          }

          const updatedStart = sourceProducts.map((p, i) => ({ ...p, display_order: i + 1 }));
          const updatedEnd = destProducts.map((p, i) => ({ ...p, display_order: i + 1 }));

          newProducts = (Array.isArray(products) ? products : []).filter(p => p.category_id !== sourceCategoryId && p.category_id !== destCategoryId).concat(updatedStart).concat(updatedEnd);
          setProducts(newProducts);

          await apiClient.put(`/products/${activeProductId}`, { category_id: destCategoryId });
          await Promise.all([
            ...updatedStart.map(p => apiClient.put(`/products/${p.id}`, { display_order: p.display_order })),
            ...updatedEnd.map(p => apiClient.put(`/products/${p.id}`, { display_order: p.display_order }))
          ]);
        }
      }
    }
  };

  const findContainer = (id) => {
    if (id.startsWith('category')) {
      return id;
    }
    const productId = parseInt(id.split('-')[1]);
    const product = (Array.isArray(products) ? products : []).find(p => p.id === productId);
    return product ? `category-${product.category_id}` : null;
  };

  const productsByCategory = categories.map(category => ({
    ...category,
    products: (Array.isArray(products) ? products : []).filter(p => p.category_id === category.id).sort((a, b) => a.display_order - b.display_order)
  }));

  const headerTitle = storeId ? `${storeName} (상품리스트)` : '전체 상품';

  const activeItem = activeId ? (activeId.startsWith('category') ? categories.find(c => `category-${c.id}` === activeId) : (Array.isArray(products) ? products : []).find(p => `product-${p.id}` === activeId)) : null;

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  // 옵션 추가 버튼
  const handleAddOption = (product) => {
    setOptionEditData({ productId: product.id });
    setOptionName('');
    setOptionPrice('');
    setOptionModalOpen(true);
  };

  // 옵션 수정 버튼
  const handleEditOption = (product, opt) => {
    setOptionEditData({ productId: product.id, optionId: opt.id });
    setOptionName(opt.name);
    setOptionPrice(opt.price);
    setOptionModalOpen(true);
  };

  // 옵션 저장 (등록/수정)
  const handleOptionSave = async (e) => {
    e.preventDefault();
    if (!optionName || optionPrice === '') return alert('이름과 가격을 입력하세요');
    try {
      if (optionEditData.optionId) {
        // 수정
        await apiClient.put(`/product-options/${optionEditData.optionId}`, { name: optionName, price: Number(optionPrice) });
      } else {
        // 등록
        await apiClient.post(`/product-options`, { product_id: optionEditData.productId, name: optionName, price: Number(optionPrice) });
      }
      setOptionModalOpen(false);
      setOptionEditData(null);
      setOptionName('');
      setOptionPrice('');
      fetchData(storeId);
    } catch (err) {
      logError(err);
      alert('옵션 저장에 실패했습니다.');
    }
  };

  // 옵션 삭제
  const handleDeleteOption = async (optionId) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/product-options/${optionId}`);
      fetchData(storeId);
    } catch (err) {
      logError(err);
      alert('옵션 삭제에 실패했습니다.');
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{headerTitle}</h2>
          <div>
            <button style={{ marginRight: '8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }} onClick={onAddCategory}>카테고리추가</button>
            <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }} onClick={onAddProduct}>상품추가</button>
          </div>
        </div>
        {/* 옵션등록/수정 Modal */}
        {optionModalOpen && (
          <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <form onSubmit={handleOptionSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ margin: 0 }}>{optionEditData?.optionId ? '옵션 수정' : '옵션 등록'}</h3>
                <input value={optionName} onChange={e => setOptionName(e.target.value)} placeholder="옵션명" style={{ padding: 8, fontSize: 16 }} />
                <input value={optionPrice} onChange={e => setOptionPrice(e.target.value)} placeholder="가격" type="number" style={{ padding: 8, fontSize: 16 }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="edit-button">저장</button>
                  <button type="button" className="edit-button" onClick={() => setOptionModalOpen(false)}>취소</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 카테고리에는 드래그앤드랍 영역 없이 일반 리스트로 렌더링 */}
        {productsByCategory.map((category) => (
          <SortableCategoryItem key={category.id} category={category} products={category.products} onEditProduct={onEditProduct} onAddOption={handleAddOption} onEditOption={handleEditOption} onDeleteOption={handleDeleteOption} onDeleteCategory={handleDeleteCategory} totalCategoryCount={categories.length} />
        ))}
      </div>
      <DragOverlay>
        {activeId && activeId.startsWith('product') && activeItem && <ProductItem product={activeItem} onEditProduct={() => { }} isDragging />}
        {activeId && activeId.startsWith('category') && activeItem && <CategoryHeader category={activeItem} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

export default ProductList;
