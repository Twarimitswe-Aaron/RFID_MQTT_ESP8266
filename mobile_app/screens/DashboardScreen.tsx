import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';
import { DashboardIcon } from '../components/Icons';

export default function DashboardScreen({ token }: { token: string | null }) {
  const [stats, setStats] = useState({
    topupsToday: { total: 0, count: 0 },
    paymentsToday: { total: 0, count: 0 },
    activeCards: 0,
    totalBalance: 0,
    totalCards: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const txData = await txRes.json();
      setStats({
        topupsToday: statsData.topupsToday ?? { total: 0, count: 0 },
        paymentsToday: statsData.paymentsToday ?? { total: 0, count: 0 },
        activeCards: statsData.activeCards ?? 0,
        totalBalance: statsData.totalBalance ?? 0,
        totalCards: statsData.totalCards ?? statsData.activeCards ?? 0,
      });
      setRecentTransactions(Array.isArray(txData) ? txData.slice(0, 15) : []);
    } catch {
      setStats({ topupsToday: { total: 0, count: 0 }, paymentsToday: { total: 0, count: 0 }, activeCards: 0, totalBalance: 0, totalCards: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.pageTitleRow}>
        <DashboardIcon size={26} color="#6366f1" />
        <Text style={styles.pageTitle}>Dashboard</Text>
      </View>
      <Text style={styles.pageSubtitle}>System overview and analytics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${(stats.topupsToday.total ?? 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Top-Ups Today</Text>
          <Text style={styles.statSub}>{stats.topupsToday.count} transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${(stats.paymentsToday.total ?? 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Payments Today</Text>
          <Text style={styles.statSub}>{stats.paymentsToday.count} transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeCards}</Text>
          <Text style={styles.statLabel}>Active Cards</Text>
          <Text style={styles.statSub}>Balance &gt; 0</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
          <Text style={styles.statSub}>Registered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${(stats.totalBalance ?? 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Balance</Text>
          <Text style={styles.statSub}>Across all cards</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Transactions</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {recentTransactions.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Time</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Card UID</Text>
                <Text style={styles.tableHeaderCell}>Amount</Text>
              </View>
              {recentTransactions.map(tx => (
                <View key={tx._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{new Date(tx.timestamp).toLocaleString()}</Text>
                  <View style={[styles.badge, tx.type === 'topup' ? styles.badgeTopup : styles.badgePayment]}>
                    <Text style={styles.badgeText}>{tx.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.tableCellMono}>{tx.uid}</Text>
                  <Text style={[styles.tableCell, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                    {tx.type === 'topup' ? '+' : '-'}${(tx.amount ?? 0).toLocaleString()}
                  </Text>
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
