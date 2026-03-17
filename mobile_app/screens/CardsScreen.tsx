import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles';
import { API_BASE } from '../config';
import { CardsIcon, WarningIcon, XIcon, UserIcon, SearchIcon } from '../components/Icons';

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
}

interface AppUser {
  _id: string;
  username: string;
  role: string;
}

interface CardsScreenProps {
  scannedCard?: Card | null;
  token?: string | null;
  role?: string;
}

export default function CardsScreen({ scannedCard, token, role }: CardsScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [uid, setUid] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [lookupUid, setLookupUid] = useState('');
  const [lookedUpCard, setLookedUpCard] = useState<Card | null | 'not-found'>(null);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    loadCards();
    loadUsers();
  }, []);

  useEffect(() => {
    if (scannedCard && !scannedCard.holderName) {
      setUid(scannedCard.uid);
      setShowForm(true);
    }
  }, [scannedCard]);

  const loadCards = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cards`);
      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  const registerCard = async () => {
    if (!uid.trim() || !selectedUsername) {
      return Alert.alert('Error', 'UID and card holder are required');
    }
    setRegistering(true);
    try {
      const res = await fetch(`${API_BASE}/api/cards/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uid.trim(), holderName: selectedUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', `Card registered for ${selectedUsername}`);
        setUid('');
        setSelectedUsername('');
        setShowForm(false);
        await loadCards();
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setRegistering(false);
    }
  };

  const lookupCard = async () => {
    if (!lookupUid.trim()) return;
    setLooking(true);
    setLookedUpCard(null);
    try {
      const res = await fetch(`${API_BASE}/api/card/${lookupUid.trim()}`);
      if (res.ok) setLookedUpCard(await res.json());
      else setLookedUpCard('not-found');
    } catch {
      setLookedUpCard('not-found');
    } finally {
      setLooking(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.pageTitleRow}>
        <CardsIcon size={26} color="#6366f1" />
        <Text style={styles.pageTitle}>Cards</Text>
      </View>
      <Text style={styles.pageSubtitle}>Register and manage RFID cards</Text>

      {/* Unregistered card banner — agents only */}
      {role === 'agent' && scannedCard && !scannedCard.holderName && (
        <View style={[styles.panel, { borderColor: '#f59e0b', borderWidth: 1 }]}>
          <View style={styles.panelBody}>
            <View style={styles.iconRow}>
              <WarningIcon size={16} color="#f59e0b" />
              <Text style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: 6 }}>
                Unregistered card detected: {scannedCard.uid}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btnPrimary, { marginTop: 10 }]}
              onPress={() => { setUid(scannedCard.uid); setShowForm(true); }}
            >
              <Text style={styles.btnPrimaryText}>Register this card</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Register Card — agents only */}
      {role === 'agent' && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Register Card</Text>
          </View>
          <View style={styles.panelBody}>
            <TouchableOpacity style={styles.btnSuccess} onPress={() => setShowForm(!showForm)}>
              <Text style={styles.btnSuccessText}>{showForm ? '- Cancel' : '+ Register New Card'}</Text>
            </TouchableOpacity>

            {showForm && (
              <View style={styles.addForm}>
                <Text style={styles.label}>Card UID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A1B2C3D4"
                  placeholderTextColor="#555"
                  value={uid}
                  onChangeText={setUid}
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>Card Holder (select user)</Text>
                {users.length === 0 ? (
                  <Text style={{ color: '#8888aa', marginBottom: 16 }}>Loading users...</Text>
                ) : (
                  <View style={{ backgroundColor: '#fff', marginBottom: 16 }}>
                    <Picker
                      selectedValue={selectedUsername}
                      onValueChange={v => setSelectedUsername(v)}
                      style={{ color: '#000' }}
                      dropdownIconColor="#000"
                    >
                      <Picker.Item label="— Select a user —" value="" color="#000" />
                      {users.map(u => (
                        <Picker.Item
                          key={u._id}
                          label={`${u.username} (${u.role === 'user' ? 'Salesperson' : u.role === 'agent' ? 'Agent' : 'Admin'})`}
                          value={u.username}
                          color="#000"
                        />
                      ))}
                    </Picker>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.btnPrimary, registering && styles.btnDisabled]}
                  onPress={registerCard}
                  disabled={registering}
                >
                  {registering
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>Register Card</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Lookup */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Lookup Card by UID</Text>
        </View>
        <View style={styles.panelBody}>
          <View style={styles.manualLookup}>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter UID"
              placeholderTextColor="#555"
              value={lookupUid}
              onChangeText={setLookupUid}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={lookupCard}>
              {looking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Search</Text>}
            </TouchableOpacity>
          </View>

          {lookedUpCard === 'not-found' && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.iconRow}>
                <XIcon size={16} color="#f87171" />
                <Text style={{ color: '#f87171', marginLeft: 6, marginBottom: 8 }}>Card not found — register it?</Text>
              </View>
              <TouchableOpacity style={styles.btnSuccess} onPress={() => { setUid(lookupUid); setShowForm(true); }}>
                <Text style={styles.btnSuccessText}>+ Register this UID</Text>
              </TouchableOpacity>
            </View>
          )}

          {lookedUpCard && lookedUpCard !== 'not-found' && (
            <View style={styles.balanceDisplay}>
              <View style={styles.iconRow}>
                <UserIcon size={16} color="#9ca3af" />
                <Text style={[styles.balanceHolder, { marginLeft: 6 }]}>{lookedUpCard.holderName}</Text>
              </View>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>${(lookedUpCard.balance ?? 0).toLocaleString()}</Text>
              <Text style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>UID: {lookedUpCard.uid}</Text>
              <Text style={{ color: '#8888aa', fontSize: 12 }}>
                Registered: {new Date(lookedUpCard.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* All Cards */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>All Registered Cards ({cards.length})</Text>
        </View>
        <View style={styles.panelBody}>
          {loading ? (
            <ActivityIndicator color="#6366f1" />
          ) : cards.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>UID</Text>
                <Text style={styles.tableHeaderCell}>Holder</Text>
                <Text style={styles.tableHeaderCell}>Balance</Text>
                <Text style={styles.tableHeaderCell}>Date</Text>
              </View>
              {cards.map(card => (
                <View key={card.uid} style={styles.tableRow}>
                  <Text style={styles.tableCellMono}>{card.uid}</Text>
                  <Text style={styles.tableCell}>{card.holderName}</Text>
                  <Text style={[styles.tableCell, styles.textSuccess]}>${(card.balance ?? 0).toLocaleString()}</Text>
                  <Text style={styles.tableCell}>{new Date(card.createdAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No cards registered yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
