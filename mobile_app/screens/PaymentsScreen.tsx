import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import {
  PaymentIcon, RfidIcon, CheckIcon, XIcon, UserIcon, CartIcon, ArrowUpIcon, WarningIcon
} from '../components/Icons';

interface Product { id: string; name: string; price: number; category: string; }
interface CartItem { product: Product; quantity: number; lineCost: number; }
interface Card { uid: string; holderName: string; balance: number; createdAt: string; }

interface PaymentsScreenProps {
  products: Product[];
  cart: { [key: string]: number };
  scannedCard: Card | null;
  setScannedCard: (card: Card | null) => void;
  onToggleProduct: (id: string) => void;
  onSetCartQty: (id: string, qty: number) => void;
  onPay: (items: { productId: string; quantity: number; amount: number }[]) => Promise<void>;
  getCartItems: () => CartItem[];
  getCartTotal: () => number;
}

export default function PaymentsScreen({
  products, cart, scannedCard, setScannedCard,
  onToggleProduct, onSetCartQty, onPay, getCartItems, getCartTotal,
}: PaymentsScreenProps) {
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cartItems = getCartItems();
  const cartTotal = getCartTotal();
  const hasCard = !!scannedCard?.holderName;
  const hasItems = cartItems.length > 0;
  const canPay = hasCard && hasItems && scannedCard!.balance >= cartTotal;

  const handlePay = async () => {
    if (!canPay) return;
    setPaying(true);
    setResult(null);
    // Snapshot values before async call so they're safe to display after
    const snapshot = cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      amount: item.product.price ?? 0,
    }));
    const totalSnapshot = cartTotal ?? 0;
    try {
      await onPay(snapshot);
      setResult({ type: 'success', message: `Payment of $${totalSnapshot.toLocaleString()} processed successfully` });
    } catch (e: any) {
      setResult({ type: 'error', message: e?.message || 'Payment failed' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#01010d' }}>

      {/* ── Sticky card header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, backgroundColor: '#01010d' }}>
        <View style={styles.pageTitleRow}>
          <PaymentIcon size={22} color="#6366f1" />
          <Text style={styles.pageTitle}>Payment</Text>
        </View>

        {/* Card widget — always visible */}
        {!scannedCard ? (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: '#0a0a12', borderWidth: 1, borderColor: '#1f2937',
            padding: 16, marginTop: 8,
          }}>
            <RfidIcon size={28} color="#6366f1" />
            <View>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>No card detected</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Tap your RFID card on the reader</Text>
            </View>
          </View>
        ) : !scannedCard.holderName ? (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: '#0a0a12', borderWidth: 1, borderColor: '#f59e0b',
            padding: 16, marginTop: 8,
          }}>
            <WarningIcon size={24} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: '600' }}>Unregistered card</Text>
              <Text style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>{scannedCard.uid}</Text>
            </View>
            <TouchableOpacity onPress={() => setScannedCard(null)}>
              <XIcon size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{
            backgroundColor: '#161b22', borderWidth: 1,
            borderColor: '#22c55e', padding: 16, marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 30, height: 22, backgroundColor: '#f59e0b', borderRadius: 3, opacity: 0.85 }} />
                <View>
                  <Text style={{ color: '#555570', fontSize: 9, letterSpacing: 1 }}>HOLDER</Text>
                  <View style={styles.iconRow}>
                    <UserIcon size={12} color="#9ca3af" />
                    <Text style={{ color: '#e5e7eb', fontSize: 13, marginLeft: 4, fontWeight: '600' }}>
                      {scannedCard.holderName}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#555570', fontSize: 9, letterSpacing: 1 }}>BALANCE</Text>
                <Text style={[
                  { fontSize: 20, fontWeight: 'bold' },
                  (scannedCard.balance ?? 0) < cartTotal ? { color: '#ef4444' } : { color: '#22c55e' }
                ]}>
                  ${(scannedCard.balance ?? 0).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#555570', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>
                {scannedCard.uid}
              </Text>
              <View style={styles.iconRow}>
                <CheckIcon size={12} color="#22c55e" />
                <Text style={{ color: '#22c55e', fontSize: 10, marginLeft: 3, letterSpacing: 1 }}>ACTIVE</Text>
              </View>
            </View>
            {hasItems && (scannedCard.balance ?? 0) < cartTotal && (
              <View style={[styles.iconRow, { marginTop: 8 }]}>
                <XIcon size={12} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 11, marginLeft: 4 }}>Insufficient balance for this order</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 8 }}>

        {/* Product Selection */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.iconRow}>
              <CartIcon size={16} color="#9ca3af" />
              <Text style={[styles.panelTitle, { marginLeft: 8 }]}>Select Products</Text>
            </View>
          </View>
          <View style={styles.panelBody}>
            {products.length === 0 ? (
              <Text style={styles.emptyText}>No products available</Text>
            ) : (
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
                      {inCart ? (
                        <View style={styles.productQuantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => qty > 1 ? onSetCartQty(product.id, qty - 1) : onToggleProduct(product.id)}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => onSetCartQty(product.id, qty + 1)}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.btnPrimary} onPress={() => onToggleProduct(product.id)}>
                          <Text style={styles.btnPrimaryText}>+ Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Cart Summary */}
        {hasItems && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Cart Summary</Text>
            </View>
            <View style={styles.panelBody}>
              {result && (
                <View style={[styles.alert, result.type === 'success' ? styles.alertSuccess : styles.alertError]}>
                  <View style={styles.iconRow}>
                    {result.type === 'success'
                      ? <CheckIcon size={16} color="#22c55e" />
                      : <XIcon size={16} color="#ef4444" />
                    }
                    <Text style={[styles.alertText, { marginLeft: 6 }]}>{result.message}</Text>
                  </View>
                </View>
              )}

              {cartItems.map(item => (
                <View key={item.product.id} style={styles.cartRow}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>x{item.quantity}</Text>
                  <Text style={styles.cartItemTotal}>${(item.lineCost ?? 0).toLocaleString()}</Text>
                  <TouchableOpacity style={styles.cartRemoveBtn} onPress={() => onToggleProduct(item.product.id)}>
                    <XIcon size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalValue}>${(cartTotal ?? 0).toLocaleString()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.btnSuccess, (!canPay || paying) && styles.btnDisabled]}
                onPress={handlePay}
                disabled={!canPay || paying}
              >
                <View style={styles.iconRow}>
                  <ArrowUpIcon size={16} color="#fff" />
                  <Text style={[styles.btnSuccessText, { marginLeft: 6 }]}>
                    {paying ? 'Processing...' : 'Confirm Payment'}
                  </Text>
                </View>
              </TouchableOpacity>

              {!hasCard && (
                <View style={[styles.iconRow, { marginTop: 8 }]}>
                  <WarningIcon size={14} color="#f59e0b" />
                  <Text style={{ color: '#f59e0b', fontSize: 13, marginLeft: 6 }}>Scan a card to pay</Text>
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
