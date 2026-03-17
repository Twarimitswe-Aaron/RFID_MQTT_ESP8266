import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';
import { ProductsIcon, CheckIcon, CardsIcon } from '../components/Icons';

interface Product { id: string; name: string; price: number; category: string; }
interface CartItem { product: Product; quantity: number; lineCost: number; }

interface ProductsScreenProps {
  products: Product[];
  onLoadProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  token?: string | null;
  readonly?: boolean;
  cart?: { [key: string]: number };
  onToggleProduct?: (id: string) => void;
  onSetCartQty?: (id: string, qty: number) => void;
  getCartItems?: () => CartItem[];
  getCartTotal?: () => number;
  onGoToPayment?: () => void;
}

export default function ProductsScreen({
  products, onLoadProducts, readonly = false, token,
  cart = {}, onToggleProduct, onSetCartQty, getCartItems, getCartTotal, onGoToPayment,
}: ProductsScreenProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'General' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { onLoadProducts(); }, []);

  const cartItems = getCartItems ? getCartItems() : [];
  const cartTotal = getCartTotal ? getCartTotal() : 0;

  const addProduct = async () => {
    const name = newProduct.name.trim();
    const price = parseFloat(newProduct.price);
    const category = newProduct.category.trim();
    if (!name || !price || price <= 0) return Alert.alert('Error', 'Name and valid price required');
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, name, price, category }),
      });
      if (res.ok) {
        await onLoadProducts();
        setNewProduct({ name: '', price: '', category: 'General' });
        setShowAddForm(false);
      } else {
        Alert.alert('Error', (await res.json()).error);
      }
    } catch {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/api/products/${id}`, {
              method: 'DELETE',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) await onLoadProducts();
          } catch {
            Alert.alert('Error', 'Failed to delete product');
          }
        }
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#01010d' }}>

      {/* ── Fixed header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, backgroundColor: '#01010d' }}>
        <View style={styles.pageTitleRow}>
          <ProductsIcon size={22} color="#6366f1" />
          <Text style={styles.pageTitle}>Products</Text>
        </View>

        {/* Cart bar — readonly with items */}
        {readonly && cartItems.length > 0 && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#0a0a12', borderWidth: 1, borderColor: '#6366f1',
            padding: 12, marginTop: 8,
          }}>
            <Text style={{ color: '#fff', fontSize: 13 }}>
              {cartItems.length} item(s) — ${(cartTotal ?? 0).toLocaleString()}
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={onGoToPayment}>
              <View style={styles.iconRow}>
                <CardsIcon size={13} color="#fff" />
                <Text style={[styles.btnPrimaryText, { marginLeft: 6, fontSize: 13 }]}>Pay</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Add product form — admin only */}
        {!readonly && (
          <View style={{
            backgroundColor: '#0a0a12', borderWidth: 1, borderColor: '#1f2937',
            marginTop: 8,
          }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                {showAddForm ? 'Cancel' : '+ Add New Product'}
              </Text>
              <Text style={{ color: '#6366f1', fontSize: 18 }}>{showAddForm ? '−' : '+'}</Text>
            </TouchableOpacity>

            {showAddForm && (
              <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
                <TextInput
                  style={[styles.input, { marginTop: 12, marginBottom: 8 }]}
                  placeholder="Product Name"
                  placeholderTextColor="#555"
                  value={newProduct.name}
                  onChangeText={name => setNewProduct({ ...newProduct, name })}
                />
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  placeholder="Price ($)"
                  placeholderTextColor="#555"
                  value={newProduct.price}
                  onChangeText={price => setNewProduct({ ...newProduct, price })}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  placeholder="Category"
                  placeholderTextColor="#555"
                  value={newProduct.category}
                  onChangeText={category => setNewProduct({ ...newProduct, category })}
                />
                <TouchableOpacity
                  style={[styles.btnSuccess, loading && styles.btnDisabled]}
                  onPress={addProduct}
                  disabled={loading}
                >
                  <Text style={styles.btnSuccessText}>{loading ? 'Adding...' : 'Add Product'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Scrollable products grid ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        {products.length > 0 ? (
          <View style={styles.productGrid}>
            {products.map(product => {
              const qty = cart[product.id] || 0;
              const inCart = qty > 0;
              return (
                <View key={product.id} style={[styles.productCard, inCart && styles.productCardSelected]}>
                  <View style={styles.productCardContent}>
                    {inCart && (
                      <View style={styles.productCheckIcon}>
                        <CheckIcon size={16} color="#6366f1" />
                      </View>
                    )}
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${(product.price ?? 0).toLocaleString()}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>

                  {readonly && onToggleProduct && onSetCartQty ? (
                    inCart ? (
                      <View style={styles.productQuantityControls}>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => qty > 1 ? onSetCartQty(product.id, qty - 1) : onToggleProduct(product.id)}>
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{qty}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => onSetCartQty(product.id, qty + 1)}>
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.btnPrimary} onPress={() => onToggleProduct(product.id)}>
                        <Text style={styles.btnPrimaryText}>+ Add</Text>
                      </TouchableOpacity>
                    )
                  ) : !readonly ? (
                    <View style={styles.inlineActions}>
                      <TouchableOpacity style={styles.btnDangerSmall} onPress={() => deleteProduct(product.id)}>
                        <Text style={styles.btnDangerSmallText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No products yet</Text>
        )}
      </ScrollView>
    </View>
  );
}
