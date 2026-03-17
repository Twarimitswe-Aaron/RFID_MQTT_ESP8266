import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a12',
    zIndex: 102,
  },
  appLayout: {
  flex: 1,
  backgroundColor: '#01010d',
  flexDirection: 'row',
  overflow: 'hidden',
},


mobileHeaderGrandTitle: {
  flexDirection: 'row',
  alignItems: 'center',
},
  sidebar: {
    width: 280,
    backgroundColor: '#0a0a12',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    left: -280,
    top: 60,
    bottom: 60,   // stop above bottom nav
    zIndex: 100,
  },
  sidebarOpen: {
    left: 0,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#01010d',
    marginTop: 60,
    marginBottom: 60,   // leave room for bottom nav
  },

  // Mobile Header
  mobileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#0a0a12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 101,
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 12,
  },
  mobileHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  brand: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: '#fff',
    letterSpacing: 2,
  },
  brandAccent: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: '#6366f1',
    letterSpacing: 2,
  },
  titleRest: {
    color: '#555580',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  statusDotOnline: {
    backgroundColor: '#22c55e',
  },

  // Menu Overlay
  menuOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 60,   // stop above bottom nav
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  edgeSwipeArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 98,
  },

  // Sidebar Header
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  userRoleAdmin: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  userRoleAgent: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
  },
  userRoleCashier: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
  },
  connStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  connStatusOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  connStatusOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  connStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  connStatusDotActive: {
    backgroundColor: '#22c55e',
  },
  connStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8888aa',
    letterSpacing: 0.5,
  },

  // Sidebar
  sidebarBrand: {
    marginBottom: 32,
  },
  sidebarBrandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  sidebarBrandSubtitle: {
    fontSize: 12,
    color: '#6366f1',
    textAlign: 'center',
    marginTop: 4,
  },
  sidebarNav: {
    flex: 1,
    paddingVertical: 12,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    paddingTop: 16 
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 0,
    backgroundColor: 'transparent',
    gap: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  navItemText: {
    fontSize: 14,
    color: '#8888aa',
  },
  navItemTextActive: {
    color: '#6366f1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#8888aa',
  },
 
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },

  // Auth Screen
  authWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#01010d',
    padding: 20,
  },
  authBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0a0a12',
    borderRadius: 0,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 0,
    marginBottom: 16,
  },
  picker: {
    color: '#fff',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  authTabActive: {
    borderBottomColor: '#6366f1',
  },
  authTabText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  authTabTextActive: {
    color: '#6366f1',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 0,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: '#01010d',
    padding: 20,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 32,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#01010d',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a12',
    borderRadius: 0,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
    overflow: 'visible',
  },
  statCardCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#22c55e',
    zIndex: 10,
  },
  statCardCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: '#22c55e',
    zIndex: 10,
  },
  statCardCornerTLBlue: {
    borderColor: '#3b82f6',
  },
  statCardCornerTRBlue: {
    borderColor: '#3b82f6',
  },
  statCardCornerTLOrange: {
    borderColor: '#f59e0b',
  },
  statCardCornerTROrange: {
    borderColor: '#f59e0b',
  },
  statCardCornerTLPurple: {
    borderColor: '#6366f1',
  },
  statCardCornerTRPurple: {
    borderColor: '#6366f1',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 12,
    color: '#6366f1',
  },

  // Panel
  panel: {
    backgroundColor: '#0a0a12',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 24,
    position: 'relative',
    overflow: 'visible',
  },
  panelCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  panelCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  panelHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  panelBody: {
    padding: 20,
  },

  // Data Table
  dataTable: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#e5e7eb',
  },
  tableCellMono: {
    flex: 1,
    fontSize: 14,
    color: '#e5e7eb',
    fontFamily: 'monospace',
  },

  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTopup: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  badgePayment: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Text Colors
  textSuccess: {
    color: '#22c55e',
  },
  textDanger: {
    color: '#ef4444',
  },

  // Empty State
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    paddingVertical: 40,
  },

  // Scan Area
  scanArea: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#161b22',
    borderRadius: 0,
    marginBottom: 20,
    gap: 12,
  },
  scanIcon: {
    marginBottom: 4,
  },
  scanText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  scannedUid: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  scannedHolder: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  scannedBalance: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '500',
  },

  // Manual Lookup
  manualLookup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
    maxWidth: 300,
  },
  manualInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0a0a12',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 0,
    color: '#fff',
    fontSize: 14,
  },

  // Register Form
  registerForm: {
    marginTop: 16,
  },
  alertWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Buttons
  btnSuccess: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnSuccessText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  btnWarning: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnWarningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#161b22',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  productCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  productCardContent: {
    padding: 16,
  },
  productCheckIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productCheck: {
    fontSize: 18,
    color: '#6366f1',
    marginBottom: 8,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#22c55e',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  productQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.3)',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },

  // Selection Hint
  selectionHint: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 20,
  },

  // Cart
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#161b22',
    borderRadius: 0,
    marginBottom: 8,
    gap: 8,
  },
  cartItemName: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  cartItemPrice: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cartQtyInput: {
    width: 40,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#0a0a12',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 0,
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  cartItemTotal: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'right',
  },
  cartRemoveBtn: {
    padding: 4,
  },
  cartRemoveText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginTop: 16,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },

  // Balance Display
  balanceDisplay: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#161b22',
    borderRadius: 0,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  balanceInsufficient: {
    color: '#ef4444',
  },
  balanceHolder: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  insufficientText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },

  // Payment Summary
  paymentSummary: {
    backgroundColor: '#161b22',
    borderRadius: 0,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 1,
    textAlign: 'right',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  summaryValueSuccess: {
    color: '#22c55e',
  },
  summaryValueWarning: {
    color: '#f59e0b',
  },

  // Add Form
  addForm: {
    backgroundColor: '#161b22',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
  },

  // Editable Cell
  editableCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    color: '#e5e7eb',
    fontSize: 14,
  },

  // Inline Actions
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimarySmall: {
    backgroundColor: '#6366f1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  btnPrimarySmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  btnDangerSmall: {
    backgroundColor: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  btnDangerSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Alerts
  alert: {
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
  },
  alertSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
  },

  // Home Screen
  homeContainer: {
    flex: 1,
    backgroundColor: '#01010d',
  },
  homeContent: {
    padding: 20,
  },
  homeHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  homeTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  homeSubtitle: {
    fontSize: 16,
    color: '#8888aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  homePanel: {
    backgroundColor: '#0a0a12',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 0,
    marginBottom: 24,
    overflow: 'visible',
    position: 'relative',
  },
  homePanelCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homePanelCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homePanelCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homePanelCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homePanelHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  homePanelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f5',
  },
  homePanelBody: {
    padding: 20,
  },
  homeFormGroup: {
    marginBottom: 20,
  },
  homeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8888aa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  homeInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeInput: {
    flex: 1,
    backgroundColor: '#181825',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#f0f0f5',
    fontSize: 16,
  },
  homeInputMono: {
    fontFamily: 'Courier New',
  },
  homeInputWithSymbol: {
    paddingLeft: 40,
  },
  homeInputIcon: {
    position: 'absolute',
    right: 14,
    padding: 8,
  },
  homeInputIconText: {
    fontSize: 20,
  },
  homeCurrencySymbol: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    color: '#8888aa',
    zIndex: 1,
  },
  homeProcessButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 8,
  },
  homeProcessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  homeTerminal: {
    backgroundColor: '#0a0a12',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 0,
    marginBottom: 24,
    overflow: 'visible',
    position: 'relative',
  },
  homeTerminalCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homeTerminalCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#6366f1',
    zIndex: 10,
  },
  homeTerminalHeader: {
    backgroundColor: '#0d0d15',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  homeTerminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  homeTerminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  homeTerminalTitle: {
    fontSize: 12,
    color: '#8888aa',
    flex: 1,
    textAlign: 'center',
  },
  homeTerminalAction: {
    fontSize: 10,
    color: '#8888aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  homeTerminalBody: {
    padding: 16,
    backgroundColor: '#05050a',
    minHeight: 120,
  },
  homeTerminalText: {
    fontSize: 13,
    color: '#f0f0f5',
    fontFamily: 'Courier New',
    marginBottom: 4,
    lineHeight: 20,
  },
  homeTerminalPrompt: {
    color: '#4ade80',
    fontWeight: 'bold',
  },
  homeTerminalError: {
    color: '#ef4444',
  },
  homeTerminalErrorLabel: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  homeTerminalSystem: {
    color: '#f59e0b',
  },
  homeTerminalSystemLabel: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  homeFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  homeFooterText: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'center',
  },
  homeAuthButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  homeAuthButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  connBadgeOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  connBadgeOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  connBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  connBadgeTextOnline: {
    color: '#4ade80',
  },
  connBadgeTextOffline: {
    color: '#f87171',
  },
  connDot: {
     width: 6,
    height: 6,
    borderRadius: 3,
    marginRight : 6
  } ,
  connDotOnline: {
    
    backgroundColor: '#22c55e',
    
  },
  connDotOffline: {
    
    backgroundColor: '#ef4444',
    
  },

  // ── Bottom Navigation Bar ────────────────────────────────────────────────
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#0a0a12',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    zIndex: 101,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
  },
  bottomNavIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: 'transparent',
  },
  bottomNavIndicatorActive: {
    backgroundColor: '#6366f1',
  },
  bottomNavLabel: {
    fontSize: 9,
    color: '#555570',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bottomNavLabelActive: {
    color: '#6366f1',
  },
});
