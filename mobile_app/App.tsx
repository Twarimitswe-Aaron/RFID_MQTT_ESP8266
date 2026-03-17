import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Orbitron_700Bold } from '@expo-google-fonts/orbitron';

// Import screens
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import TopupScreen from './screens/TopupScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ProductsScreen from './screens/ProductsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import CardsScreen from './screens/CardsScreen';
import MyWalletScreen from './screens/MyWalletScreen';

// Import components
import CornerAccents from './components/CornerAccents';
import {
  DashboardIcon,
  TopUpIcon,
  PaymentIcon,
  ProductsIcon,
  TransactionsIcon,
  CardsIcon,
  LogoutIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  WalletIcon,
  BrandText
} from './components/Icons';

// Import styles
import { styles } from './styles';
import { API_BASE } from './config';
import { getSocket } from './socket';

interface User {
  username: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  lineCost: number;
}

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  async function handleLogin(loginData: { token: string; username: string; role: string }) {
    const userData = { username: loginData.username, role: loginData.role };
    setUser(userData);
    setToken(loginData.token);
    setIsAuthenticated(true);
    setShowAuth(false);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('token', loginData.token);
  }

  async function handleLogout() {
    setUser(null);
    setIsAuthenticated(false);
    setShowAuth(false);
    await AsyncStorage.removeItem('user');
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#0a0a12" />
          {!isAuthenticated && !showAuth ? (
            <HomeScreen onShowAuth={() => setShowAuth(true)} />
          ) : !isAuthenticated && showAuth ? (
            <AuthScreen onLogin={handleLogin} onBack={() => setShowAuth(false)} />
          ) : (
            <MainApp user={user!} token={token} onLogout={handleLogout} />
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// Maps DB role values to display labels
function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'ADMIN';
    case 'agent': return 'AGENT';
    case 'user': return 'SALESPERSON';
    default: return role?.toUpperCase() || 'UNKNOWN';
  }
}

function AuthScreen({ onLogin, onBack }: { onLogin: (loginData: { token: string; username: string; role: string }) => void; onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] =
    useState<'user' | 'admin' | 'agent'>('user');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      console.log('✅ Backend connected successfully - Login response:', data);
      onLogin(data);
    } catch {
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !password) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role: signupRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Signup failed');
        return;
      }

      // Signup returns { message } not a token — switch to login
      alert('Account created! Please log in.');
      setIsLogin(true);
    } catch {
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authWrapper}>
      <View style={styles.authBox}>
        <CornerAccents color="#6366f1" size={12} thickness={2} />

        {/* Back Button */}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}
          onPress={onBack}
        >
          <Text style={{ color: '#6366f1', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.authTitle}>
          <BrandText size={28} />
        </Text>
        <Text style={styles.authSubtitle}>Secure Transaction System</Text>

        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, isLogin && styles.authTabActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.authTabText, isLogin && styles.authTabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authTab, !isLogin && styles.authTabActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.authTabText, !isLogin && styles.authTabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {!isLogin && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>

            <Picker
              selectedValue={signupRole}
              onValueChange={(v) => setSignupRole(v)}
              style={{ color: '#000', backgroundColor: '#fff' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Admin" value="admin" color="#000" />
              <Picker.Item label="Salesperson" value="user" color="#000" />
              <Picker.Item label="Agent" value="agent" color="#000" />
            </Picker>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>
              {isLogin ? 'Log In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}

function MainApp({ user, token, onLogout }: { user: User; token: string | null; onLogout: () => void }) {
  const insets = useSafeAreaInsets();

  const [currentView, setCurrentView] = useState<string>(
    user.role === 'agent'
      ? 'topup'
      : user.role === 'user'
      ? 'payment'
      : 'dashboard'
  );

  const [scannedCard, setScannedCard] = useState<Card | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isOnline, setIsOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateTo = (key: string, direction: 'left' | 'right') => {
    const outVal = direction === 'left' ? -400 : 400;
    const inVal  = direction === 'left' ?  400 : -400;
    Animated.timing(slideAnim, {
      toValue: outVal,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentView(key);
      setScannedCard(null);
      setCart({});
      slideAnim.setValue(inVal);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    });
  };

  useEffect(() => {
    loadProducts();

    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => setIsOnline(true));
    socket.on('disconnect', () => setIsOnline(false));

    // Card tapped on RFID reader — auto-populate scannedCard
    socket.on('card-status', (data: { uid: string; holderName: string | null; balance: number; status: string; present: boolean; ts: number }) => {
      if (data.present) {
        setScannedCard({
          uid: data.uid,
          holderName: data.holderName ?? '',
          balance: data.balance,
          createdAt: '',
        });
      } else {
        setScannedCard(null);
      }
    });

    // Balance updated (after topup/payment) — sync local card state
    socket.on('card-balance', (data: { uid: string; balance: number }) => {
      setScannedCard(prev =>
        prev?.uid === data.uid ? { ...prev, balance: data.balance } : prev
      );
    });

    // Card removed from reader
    socket.on('card-removed', () => setScannedCard(null));

    // Payment confirmed by backend
    socket.on('payment-success', (data: { uid: string; balanceAfter: number }) => {
      setScannedCard(prev =>
        prev?.uid === data.uid ? { ...prev, balance: data.balanceAfter } : prev
      );
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('card-status');
      socket.off('card-balance');
      socket.off('card-removed');
      socket.off('payment-success');
      socket.disconnect();
    };
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      setProducts(await response.json());
    } catch {
      setProducts([]);
    }
  };

  const handleTopup = async (uid: string, amount: number, holderName?: string) => {
    const response = await fetch(`${API_BASE}/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ uid, amount, holderName })
    });

    if (!response.ok) throw new Error('Top-up failed');
  };

  const handlePay = async (items: { productId: string; quantity: number; amount: number }[]) => {
    // Send one request per cart line — use amount directly since backend PRODUCTS lookup is unreliable
    for (const item of items) {
      const totalLineAmount = item.amount * item.quantity;
      const response = await fetch(`${API_BASE}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          uid: scannedCard?.uid,
          amount: totalLineAmount,
          description: `Purchase x${item.quantity}`,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');
    }
  };

  const toggleProduct = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId]) delete newCart[productId];
      else newCart[productId] = 1;
      return newCart;
    });
  };

  const setCartQty = (productId: string, qty: number) => {
    setCart(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const getCartItems = (): CartItem[] => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = products.find(p => String(p.id) === id);
        return product
          ? { product, quantity: qty, lineCost: product.price * qty }
          : null;
      })
      .filter(Boolean) as CartItem[];
  };

  const getCartTotal = () =>
    getCartItems().reduce((sum, item) => sum + item.lineCost, 0);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardScreen token={token} />;

      case 'topup':
        return (
          <TopupScreen
            scannedCard={scannedCard}
            setScannedCard={setScannedCard}
            onTopup={handleTopup}
          />
        );

      case 'payment':
        return (
          <PaymentsScreen
            products={products}
            cart={cart}
            scannedCard={scannedCard}
            setScannedCard={setScannedCard}
            onToggleProduct={toggleProduct}
            onSetCartQty={setCartQty}
            onPay={handlePay}
            getCartItems={getCartItems}
            getCartTotal={getCartTotal}
          />
        );

      case 'products':
        return (
          <ProductsScreen
            products={products}
            onLoadProducts={loadProducts}
            setProducts={setProducts}
            token={token}
            readonly={user.role === 'user'}
            cart={cart}
            onToggleProduct={toggleProduct}
            onSetCartQty={setCartQty}
            getCartItems={getCartItems}
            getCartTotal={getCartTotal}
            onGoToPayment={() => setCurrentView('payment')}
          />
        );

      case 'transactions':
        return <TransactionsScreen username={user.username} role={user.role} token={token} />;

      case 'cards':
        return <CardsScreen scannedCard={scannedCard} token={token} role={user.role} />;

      case 'wallet':
        return <MyWalletScreen username={user.username} token={token} />;

      default:
        return <DashboardScreen token={token}/>;
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items = [];
    
    // Admin gets all views
    if (user.role === 'admin') {
      items.push(
        { key: 'dashboard', label: 'Dashboard', IconComponent: DashboardIcon },
        { key: 'products', label: 'Products', IconComponent: ProductsIcon },
        { key: 'transactions', label: 'Transactions', IconComponent: TransactionsIcon },
        { key: 'cards', label: 'Cards', IconComponent: CardsIcon }
      );
    }
    // Agent gets top-up and cards
    else if (user.role === 'agent') {
      items.push(
        { key: 'topup', label: 'Top-Up', IconComponent: TopUpIcon },
        { key: 'cards', label: 'Cards', IconComponent: CardsIcon }
      );
    }
    // Salesperson (user) gets payment, products, wallet, and transactions
    else if (user.role === 'user') {
      items.push(
        { key: 'payment', label: 'Payment', IconComponent: PaymentIcon },
        { key: 'products', label: 'Products', IconComponent: ProductsIcon },
        { key: 'wallet', label: 'My Wallet', IconComponent: WalletIcon },
        { key: 'transactions', label: 'Transactions', IconComponent: TransactionsIcon }
      );
    }
    
    return items;
  };

  const navItems = getNavItems();

  const onSwipeGesture = (event: any) => {
    const { state, translationX, translationY, x } = event.nativeEvent;

    // Only act on END state — fires exactly once per swipe
    if (state !== State.END) return;

    // Ignore mostly-vertical gestures
    if (Math.abs(translationY) > Math.abs(translationX) * 0.7) return;

    if (!menuOpen) {
      // Open menu: swipe right from left edge
      if (x < 60 && translationX > 60) {
        setMenuOpen(true);
        return;
      }
      // Navigate: require at least 80px horizontal travel
      if (Math.abs(translationX) < 80) return;
      const keys = navItems.map(i => i.key);
      const idx = keys.indexOf(currentView);
      if (translationX < 0 && idx < keys.length - 1) {
        navigateTo(keys[idx + 1], 'left');
      } else if (translationX > 0 && idx > 0) {
        navigateTo(keys[idx - 1], 'right');
      }
    } else {
      if (translationX < -60) setMenuOpen(false);
    }
  };

  const goToView = (key: string) => {
    const keys = navItems.map(i => i.key);
    const from = keys.indexOf(currentView);
    const to   = keys.indexOf(key);
    if (from === to) return;
    navigateTo(key, to > from ? 'left' : 'right');
    setMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Status Bar Background */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />
      
      <View style={styles.appLayout}>

        {/* Edge Swipe Area for Menu */}
        <PanGestureHandler 
          onHandlerStateChange={onSwipeGesture}
          activeOffsetX={[-15, 15]}
          failOffsetY={[-30, 30]}
        >
          <View style={styles.edgeSwipeArea} />
        </PanGestureHandler>

        {/* Mobile Header */}
        <View style={styles.mobileHeader}>
          <TouchableOpacity 
            style={styles.hamburgerButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <CloseIcon size={24} color="#fff" />
            ) : (
              <MenuIcon size={24} color="#fff" />
            )}
          </TouchableOpacity>
          
          <Text style={styles.mobileHeaderTitle}>
            <BrandText size={20} />
            <Text style={styles.titleRest}>  RFID Wallet</Text>
          </Text>
          
          <View style={styles.mobileHeaderRight}>
            <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          </View>
        </View>

        {/* Sidebar / Mobile Menu */}
        <View style={[styles.sidebar, menuOpen && styles.sidebarOpen]}>

          {/* User Info */}
          <View style={styles.sidebarHeader}>
            <View style={styles.userInfoSection}>
              <View style={styles.userIconWrapper}>
                <UserIcon size={20} color="#6366f1" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={[styles.userRole, user.role ? styles[`userRole${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as keyof typeof styles] : styles.userRole]}>
                  {getRoleLabel(user.role)}
                </Text>
              </View>
            </View>
            
            {/* Connection Status */}
            <View style={[styles.connStatusBadge, isOnline ? styles.connStatusOnline : styles.connStatusOffline]}>
              <View style={[styles.connStatusDot, isOnline && styles.connStatusDotActive]} />
              <Text style={styles.connStatusText}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>

          {/* Navigation Items */}
          <View style={styles.sidebarNav}>
            {navItems.map(item => {
              const IconComponent = item.IconComponent;
              const isActive = currentView === item.key;
              
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => goToView(item.key)}
                >
                  <IconComponent size={18} color={isActive ? '#6366f1' : '#8888aa'} />
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={() => { setMenuOpen(false); onLogout(); }}
            >
              <LogoutIcon size={18} color="#8888aa" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Overlay for mobile menu */}
        {menuOpen && (
          <TouchableOpacity 
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <PanGestureHandler
          onHandlerStateChange={onSwipeGesture}
          activeOffsetX={[-15, 15]}
          failOffsetY={[-30, 30]}
        >
          <Animated.View style={[styles.mainContent, { transform: [{ translateX: slideAnim }] }]}>
            {renderCurrentView()}
          </Animated.View>
        </PanGestureHandler>

        {/* ── Bottom Navigation Bar ── */}
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
          {navItems.map(item => {
            const IconComponent = item.IconComponent;
            const isActive = currentView === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.bottomNavItem}
                onPress={() => goToView(item.key)}
                activeOpacity={0.7}
              >
                {/* Active indicator line */}
                <View style={[styles.bottomNavIndicator, isActive && styles.bottomNavIndicatorActive]} />
                <IconComponent size={20} color={isActive ? '#6366f1' : '#555570'} />
                <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
}