import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { formatPrice, normalizeImageUrl, formatTime } from '../utils/format';
import { IDLE_TIMEOUT } from '../config/constants';
import { logDebug } from '../utils/logger';
import type { AppDataResponse, Category, Product, CartItem, ProductOption } from '../types';

interface MainScreenProps {
  storeData: AppDataResponse;
}

const MainScreen: React.FC<MainScreenProps> = ({ storeData }) => {
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);
  const [waitingScreenActive, setWaitingScreenActive] = useState(false);
  const [idleSeconds, setIdleSeconds] = useState(IDLE_TIMEOUT);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse categories and products (defensive: ensure arrays)
  const categories = Array.isArray(storeData.categories) ? storeData.categories : [];
  const products = Array.isArray(storeData.products) ? storeData.products : [];

  // Filter products by selected category
  const filteredProducts = (selectedCategoryId
    ? products.filter(p => p.category_id === selectedCategoryId && p.is_available)
    : products.filter(p => p.is_available)) || [];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Idle timer for waiting screen
  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
    };
  }, []);

  const startIdleTimer = () => {
    stopIdleTimer();
    setIdleSeconds(IDLE_TIMEOUT);
    
    idleTimerRef.current = setInterval(() => {
      setIdleSeconds(prev => {
        const next = prev - 1;
        if (next <= 0) {
          stopIdleTimer();
          setWaitingScreenActive(true);
          setCart([]); // Clear cart when idle timeout
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const stopIdleTimer = () => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const resetIdleTimer = () => {
    if (waitingScreenActive) {
      setWaitingScreenActive(false);
    }
    setIdleSeconds(IDLE_TIMEOUT);
    stopIdleTimer();
    startIdleTimer();
  };

  const handleProductPress = (product: Product) => {
    resetIdleTimer();
    if (product.product_options && product.product_options.length > 0) {
      setSelectedProduct(product);
      setSelectedOptions([]);
      setOptionModalVisible(true);
    } else {
      addToCart(product, []);
    }
  };

  const addToCart = (product: Product, options: ProductOption[]) => {
    const optionsPrice = options.reduce((sum, opt) => sum + opt.price, 0);
    const totalPrice = product.price + optionsPrice;
    
    // Check if same product with same options already exists
    const existingIndex = cart.findIndex(item => 
      item.product.id === product.id &&
      item.selectedOptions.length === options.length &&
      item.selectedOptions.every((opt, idx) => opt.id === options[idx]?.id)
    );

    if (existingIndex !== -1) {
      // Increment quantity
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        selectedOptions: options,
        quantity: 1,
        totalPrice,
      };
      setCart([...cart, newItem]);
    }
    
    setOptionModalVisible(false);
    logDebug('Added to cart:', product.name);
  };

  const updateCartQuantity = (index: number, delta: number) => {
    resetIdleTimer();
    const newCart = [...cart];
    const newQuantity = newCart[index].quantity + delta;
    
    if (newQuantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQuantity;
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    resetIdleTimer();
    setCart(cart.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  };

  const handleCheckout = () => {
    resetIdleTimer();
    
    if (cart.length === 0) {
      Alert.alert('알림', '장바구니가 비어있습니다');
      return;
    }

    const total = getTotalAmount();
    const vat = Math.floor(total / 11); // Simple VAT calculation
    
    Alert.alert(
      '결제',
      `총 금액: ${formatPrice(total)}원\n(VAT: ${formatPrice(vat)}원)\n\n결제를 진행하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: () => {
            // TODO: Implement payment flow (KICC/KIS integration)
            Alert.alert('알림', '결제 기능은 추후 구현 예정입니다');
          }
        }
      ]
    );
  };

  // Waiting screen overlay
  if (waitingScreenActive) {
    return (
      <TouchableOpacity 
        className="flex-1 items-center justify-center bg-blue-600"
        onPress={resetIdleTimer}
        activeOpacity={1}
      >
        <Text className="text-4xl font-bold text-white">화면을 터치하여 주문하세요</Text>
        <Text className="mt-4 text-xl text-white">Touch to start ordering</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-gray-100" onTouchStart={resetIdleTimer}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-blue-600 px-6 py-4">
        <Text className="text-2xl font-bold text-white">
          {storeData.store?.name || 'AI Kiosk'}
        </Text>
        <View className="flex-row items-center gap-4">
          <Text className="text-xl font-semibold text-white">
            대기시간: {idleSeconds}초
          </Text>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Left: Categories and Products */}
        <View className="flex-1 flex-col">
          {/* Categories - Fixed Height */}
          <View className="h-14 flex-row items-center border-b border-gray-300 bg-white px-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', height: '100%' }}
            >
              <TouchableOpacity
                className={`px-6 ${!selectedCategoryId ? 'border-b-2 border-blue-600' : ''}`}
                style={{ height: '100%', justifyContent: 'center' }}
                onPress={() => {
                  setSelectedCategoryId(null);
                  resetIdleTimer();
                }}
              >
                <Text className={`text-base font-semibold ${!selectedCategoryId ? 'text-blue-600' : 'text-gray-700'}`}>
                  전체
                </Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-6 ${selectedCategoryId === category.id ? 'border-b-2 border-blue-600' : ''}`}
                  style={{ height: '100%', justifyContent: 'center' }}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    resetIdleTimer();
                  }}
                >
                  <Text className={`text-base font-semibold ${selectedCategoryId === category.id ? 'text-blue-600' : 'text-gray-700'}`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Grid (safe render using ScrollView + flex-wrap to avoid VirtualizedList crashes) */}
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row flex-wrap justify-between">
              {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  className="m-2 w-[30%] overflow-hidden rounded-lg bg-white shadow"
                  onPress={() => handleProductPress(product)}
                >
                  {product.image_url && (
                    <Image
                      source={{ uri: normalizeImageUrl(product.image_url) || undefined }}
                      className="h-32 w-full bg-gray-200"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-3">
                    <Text className="mb-1 text-base font-semibold text-gray-800" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-sm font-medium text-blue-600">
                      {formatPrice(product.price)}원
                    </Text>
                    {product.description && (
                      <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right: Cart */}
        <View className="w-80 flex-col border-l border-gray-300 bg-white">
          {/* Fixed Header: 주문 내역 */}
          <View className="h-14 flex-row items-center border-b border-gray-300 px-4">
            <Text className="text-lg font-bold text-gray-800">주문 내역</Text>
          </View>

          {/* Scrollable Cart List */}
          <ScrollView className="flex-1 p-4">
            {cart.length === 0 ? (
              <Text className="mt-8 text-center text-gray-500">장바구니가 비어있습니다</Text>
            ) : (
              cart.map((item, index) => (
                <View key={index} className="mb-3 rounded-lg border border-gray-200 p-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="mb-1 text-base font-semibold text-gray-800">
                        {item.product.name}
                      </Text>
                      {item.selectedOptions.map(opt => (
                        <Text key={opt.id} className="text-sm text-gray-600">
                          + {opt.name} ({formatPrice(opt.price)}원)
                        </Text>
                      ))}
                      <Text className="mt-1 text-sm font-medium text-blue-600">
                        {formatPrice(item.totalPrice)}원 x {item.quantity}
                      </Text>
                    </View>
                    <View className="ml-2 flex-row gap-2">
                      <TouchableOpacity
                        className="rounded bg-gray-300 px-2 py-1"
                        onPress={() => updateCartQuantity(index, -1)}
                      >
                        <Text className="text-base font-bold text-gray-700">-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded bg-blue-500 px-2 py-1"
                        onPress={() => updateCartQuantity(index, 1)}
                      >
                        <Text className="text-base font-bold text-white">+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded bg-red-500 px-2 py-1"
                        onPress={() => removeFromCart(index)}
                      >
                        <Text className="text-sm text-white">삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Fixed Footer: 총 금액 and 결제하기 */}
          <View className="border-t border-gray-300 p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800">총 금액</Text>
              <Text className="text-xl font-bold text-blue-600">
                {formatPrice(getTotalAmount())}원
              </Text>
            </View>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                className="flex-1 rounded-lg bg-red-600 py-4"
                onPress={() => {
                  resetIdleTimer();
                  setCart([]);
                  setWaitingScreenActive(true);
                }}
              >
                <Text className="text-center text-base font-bold text-white">취소하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg py-4 ${cart.length === 0 ? 'bg-gray-400' : 'bg-blue-600'}`}
                onPress={handleCheckout}
                disabled={cart.length === 0}
              >
                <Text className="text-center text-base font-bold text-white">결제하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Option Modal */}
      <Modal
        visible={optionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-96 rounded-lg bg-white p-6">
            <Text className="mb-4 text-xl font-bold text-gray-800">
              {selectedProduct?.name}
            </Text>
            
            <ScrollView className="mb-4 max-h-96">
              {selectedProduct?.product_options.map(option => {
                const isSelected = selectedOptions.find(o => o.id === option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    className={`mb-2 rounded-lg border p-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                    onPress={() => {
                      setSelectedOptions(prev => {
                        const exists = prev.find(o => o.id === option.id);
                        if (exists) {
                          return prev.filter(o => o.id !== option.id);
                        } else {
                          return [...prev, option];
                        }
                      });
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-800">
                          {option.name}
                        </Text>
                        {option.is_required && (
                          <Text className="mt-1 text-xs font-semibold text-red-600">필수 옵션</Text>
                        )}
                      </View>
                      <Text className="text-sm font-medium text-blue-600">
                        +{formatPrice(option.price)}원
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 py-3"
                onPress={() => setOptionModalVisible(false)}
              >
                <Text className="text-center text-base font-semibold text-gray-700">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-lg bg-blue-600 py-3"
                onPress={() => {
                  if (selectedProduct) {
                    // Check required options
                    const requiredOptions = selectedProduct.product_options.filter(opt => opt.is_required);
                    const allRequiredSelected = requiredOptions.every(req => 
                      selectedOptions.find(sel => sel.id === req.id)
                    );
                    
                    if (!allRequiredSelected) {
                      Alert.alert('알림', '필수 옵션을 선택해주세요');
                      return;
                    }
                    
                    addToCart(selectedProduct, selectedOptions);
                  }
                }}
              >
                <Text className="text-center text-base font-semibold text-white">담기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MainScreen;
