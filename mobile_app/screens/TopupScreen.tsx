import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';
import {
  TopUpIcon, RfidIcon, SearchIcon, CheckIcon, UserIcon, WarningIcon, ArrowUpIcon, XIcon
} from '../components/Icons';

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
}

interface TopupScreenProps {
  scannedCard: Card | null;
  setScannedCard: (card: Card | null) => void;
  onTopup: (uid: string, amount: number, holderName?: string) => Promise<void>;
}

export default function TopupScreen({ scannedCard, setScannedCard, onTopup }: TopupScreenProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [manualUid, setManualUid] = useState('');
  const [regHolder, setRegHolder] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const manualLookup = async () => {
    if (!manualUid.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/card/${manualUid.trim()}`);
      if (response.ok) {
        const card = await response.json();
        setScannedCard({ uid: card.uid, holderName: card.holderName, balance: card.balance, createdAt: card.createdAt });
      } else {
        setScannedCard({ uid: manualUid.trim(), holderName: '', balance: 0, createdAt: '' });
        setShowRegister(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to lookup card');
    }
  };

  const registerNewCard = async () => {
    if (!regHolder.trim() || !scannedCard) return;
    try {
      const response = await fetch(`${API_BASE}/api/cards/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: scannedCard.uid, holderName: regHolder.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setScannedCard(data.card);
        setShowRegister(false);
        setRegHolder('');
      } else {
        Alert.alert('Error', (await response.json()).error);
      }
    } catch {
      Alert.alert('Error', 'Failed to register card');
    }
  };

  const handleTopup = async () => {
    if (!scannedCard || !amount) return;
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return Alert.alert('Error', 'Enter a valid amount');
    setLoading(true);
    setResult(null);
    try {
      await onTopup(scannedCard.uid, amt, scannedCard.holderName || undefined);
      const newBal = (scannedCard.balance ?? 0) + amt;
      setResult({ type: 'success', message: `Added ${amt.toLocaleString()} — New Balance: ${newBal.toLocaleString()}` });
      setAmount('');
      setScannedCard({ ...scannedCard, balance: (scannedCard.balance ?? 0) + amt });
    } catch {
      setResult({ type: 'error', message: 'Top-up failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.pageTitleRow}>
        <TopUpIcon size={26} color="#6366f1" />
        <Text style={styles.pageTitle}>Top-Up Card</Text>
      </View>
      <Text style={styles.pageSubtitle}>Add funds to an RFID card</Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Card Selection</Text>
        </View>
        <View style={styles.panelBody}>
          {!scannedCard ? (
            <View style={styles.scanArea}>
              <RfidIcon size={48} color="#6366f1" />
              <Text style={styles.scanText}>Waiting for RFID card scan...</Text>
              <Text style={styles.scanSubtext}>Or enter UID manually below</Text>
              <View style={styles.manualLookup}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter UID"
                  placeholderTextColor="#555"
                  value={manualUid}
                  onChangeText={setManualUid}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={manualLookup}>
                  <Text style={styles.btnPrimaryText}>Lookup</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !scannedCard.holderName ? (
            <View style={styles.scanArea}>
              <SearchIcon size={48} color="#f59e0b" />
              <Text style={styles.scannedUid}>{scannedCard.uid}</Text>
              <Text style={styles.scanText}>Unknown Card</Text>
              {!showRegister ? (
                <TouchableOpacity style={styles.btnWarning} onPress={() => setShowRegister(true)}>
                  <View style={styles.iconRow}>
                    <WarningIcon size={16} color="#fff" />
                    <Text style={[styles.btnWarningText, { marginLeft: 6 }]}>Card not registered — Register it first</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.registerForm}>
                  <View style={[styles.iconRow, { marginBottom: 12 }]}>
                    <WarningIcon size={16} color="#f59e0b" />
                    <Text style={[styles.alertWarning, { marginLeft: 6, marginBottom: 0 }]}>Card not registered in database</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Card Holder Name"
                    placeholderTextColor="#555"
                    value={regHolder}
                    onChangeText={setRegHolder}
                  />
                  <TouchableOpacity style={styles.btnSuccess} onPress={registerNewCard}>
                    <Text style={styles.btnSuccessText}>Register Card</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.scanArea}>
              <CheckIcon size={48} color="#22c55e" />
              <Text style={styles.scannedUid}>{scannedCard.uid}</Text>
              <View style={styles.iconRow}>
                <UserIcon size={16} color="#9ca3af" />
                <Text style={[styles.scannedHolder, { marginLeft: 6 }]}>{scannedCard.holderName}</Text>
              </View>
              <Text style={styles.scannedBalance}>Balance: ${(scannedCard.balance ?? 0).toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      {scannedCard?.holderName && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Top-Up Amount</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              placeholderTextColor="#555"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.btnSuccess, loading && styles.btnDisabled]}
              onPress={handleTopup}
              disabled={loading}
            >
              <View style={styles.iconRow}>
                <ArrowUpIcon size={16} color="#fff" />
                <Text style={[styles.btnSuccessText, { marginLeft: 6 }]}>Process Top-Up</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Top-Ups</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          <Text style={styles.emptyText}>Recent top-ups will appear here</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}
