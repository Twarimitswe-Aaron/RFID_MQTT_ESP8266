import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';
import { WalletIcon, RefreshIcon, UserIcon } from '../components/Icons';

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface MyWalletScreenProps {
  username: string;
  token: string | null;
}

export default function MyWalletScreen({ username, token }: MyWalletScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCards();
  }, []);

  const loadMyCards = async () => {
    setLoading(true);
    try {
      // Fetch all cards then filter by holderName matching logged-in username
      const res = await fetch(`${API_BASE}/api/cards`);
      const data: Card[] = await res.json();
      const mine = Array.isArray(data)
        ? data.filter(c => c.holderName.toLowerCase() === username.toLowerCase())
        : [];
      setCards(mine);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.pageTitleRow}>
        <WalletIcon size={26} color="#6366f1" />
        <Text style={styles.pageTitle}>My Wallet</Text>
      </View>
      <Text style={styles.pageSubtitle}>Cards linked to your account</Text>

      {/* Total balance summary */}
      <View style={styles.panel}>
        <View style={styles.panelBody}>
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>${(totalBalance ?? 0).toFixed(2)}</Text>
            <Text style={{ color: '#8888aa', fontSize: 13, marginTop: 4 }}>
              {cards.length} card{cards.length !== 1 ? 's' : ''} registered
            </Text>
          </View>
        </View>
      </View>

      {/* Cards list */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.panelTitle}>My Cards</Text>
            <TouchableOpacity onPress={loadMyCards}>
              <View style={styles.iconRow}>
                <RefreshIcon size={14} color="#6366f1" />
                <Text style={{ color: '#6366f1', fontSize: 13, marginLeft: 4 }}>Refresh</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.panelBody}>
          {loading ? (
            <ActivityIndicator color="#6366f1" />
          ) : cards.length === 0 ? (
            <Text style={styles.emptyText}>
              No cards registered to your account yet.{'\n'}Ask an agent to register a card with your username.
            </Text>
          ) : (
            cards.map(card => (
              <View
                key={card.uid}
                style={{
                  backgroundColor: '#161b22',
                  borderWidth: 1,
                  borderColor: '#1f2937',
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                {/* Card chip decoration */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{
                    width: 36, height: 28,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                    opacity: 0.8,
                  }} />
                  <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>RFID</Text>
                </View>

                <Text style={{ color: '#8888aa', fontSize: 11, marginBottom: 4, letterSpacing: 1 }}>
                  CARD UID
                </Text>
                <Text style={{ color: '#fff', fontFamily: 'monospace', fontSize: 16, marginBottom: 16, letterSpacing: 2 }}>
                  {card.uid}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ color: '#8888aa', fontSize: 11, marginBottom: 2 }}>HOLDER</Text>
                    <View style={styles.iconRow}>
                      <UserIcon size={13} color="#8888aa" />
                      <Text style={{ color: '#e5e7eb', fontSize: 14, marginLeft: 4 }}>{card.holderName}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#8888aa', fontSize: 11, marginBottom: 2 }}>BALANCE</Text>
                    <Text style={{ color: '#22c55e', fontSize: 22, fontWeight: 'bold' }}>
                      ${(card.balance ?? 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#555570', fontSize: 11, marginTop: 12 }}>
                  Registered: {new Date(card.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
