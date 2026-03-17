import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';
import { TransactionsIcon, RefreshIcon } from '../components/Icons';

interface Transaction {
  _id: string;
  uid: string;
  holderName: string;
  type: 'topup' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

interface Props {
  username: string;
  role: string;
  token: string | null;
}

export default function TransactionsScreen({ username, role, token }: Props): React.ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const url = role === 'admin'
        ? `${API_BASE}/api/transactions`
        : `${API_BASE}/user/transactions`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#6366f1" size="large" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.pageTitleRow}>
        <TransactionsIcon size={26} color="#6366f1" />
        <Text style={styles.pageTitle}>
          {role === 'admin' ? 'All Transactions' : 'My Transactions'}
        </Text>
      </View>
      <Text style={styles.pageSubtitle}>
        {role === 'admin' ? 'Complete system ledger' : `Transactions for ${username}`}
      </Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.panelTitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={loadTransactions}>
              <View style={styles.iconRow}>
                <RefreshIcon size={14} color="#6366f1" />
                <Text style={{ color: '#6366f1', fontSize: 13, marginLeft: 4 }}>Refresh</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.panelBody}>
          {transactions.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Time</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                {role === 'admin' && (
                  <Text style={styles.tableHeaderCell}>Holder</Text>
                )}
                <Text style={styles.tableHeaderCell}>Amount</Text>
                <Text style={styles.tableHeaderCell}>After</Text>
              </View>
              {transactions.map(tx => (
                <View key={tx._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </Text>
                  <View style={[styles.badge, tx.type === 'topup' ? styles.badgeTopup : styles.badgePayment]}>
                    <Text style={[styles.badgeText, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                      {tx.type === 'topup' ? 'TOPUP' : 'PAY'}
                    </Text>
                  </View>
                  {role === 'admin' && (
                    <Text style={styles.tableCell}>{tx.holderName}</Text>
                  )}
                  <Text style={[styles.tableCell, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                    {tx.type === 'topup' ? '+' : '-'}${(tx.amount ?? 0).toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>${(tx.balanceAfter ?? 0).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
