import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, StatusBar, ScrollView, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { validatePromo, getSettings } from '../constants/dataStore';

const DELIVERY_SLOTS = [
    { id: '1', label: 'सुबह 7-9 बजे', icon: '🌅', available: true },
    { id: '2', label: 'सुबह 10-12 बजे', icon: '☀️', available: true },
    { id: '3', label: 'दोपहर 2-4 बजे', icon: '🌤️', available: false },
    { id: '4', label: 'शाम 5-7 बजे', icon: '🌇', available: true },
];

const PAYMENT_METHODS = [
    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
    { id: 'upi', label: 'UPI Payment', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
    { id: 'card', label: 'Debit/Credit Card', icon: '💳', desc: 'Visa, Mastercard' },
];

export default function CartScreen({ navigation }) {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, placeOrder } = useCart();
    const { user, savedAddresses } = useAuth();
    const [promo, setPromo] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [slot, setSlot] = useState('1');
    const [payment, setPayment] = useState('cod');
    const [address, setAddress] = useState('');
    const [step, setStep] = useState(1);

    const settings = getSettings();
    const deliveryFee = cartTotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFeeDefault;

    const promoDiscount = appliedPromo
        ? appliedPromo.type === 'flat'
            ? appliedPromo.discount
            : Math.floor(cartTotal * appliedPromo.discount / 100)
        : 0;

    const finalTotal = Math.max(0, cartTotal + deliveryFee - promoDiscount);

    const applyPromo = () => {
        const code = promo.trim().toUpperCase();
        if (!code) return;
        const result = validatePromo(code);
        if (result) {
            setAppliedPromo(result);
            Alert.alert('🎉 Promo Applied!', `${result.label} applied successfully!`);
        } else {
            Alert.alert('❌ Invalid Code', 'This promo code is not valid or has expired.');
        }
    };

    const handleCheckout = () => {
        if (step < 3) { setStep(step + 1); return; }
        if (!address.trim()) {
            Alert.alert('⚠️ Address Required', 'Please enter your delivery address.');
            return;
        }
        const slotLabel = DELIVERY_SLOTS.find(s => s.id === slot)?.label || '';
        const payLabel = PAYMENT_METHODS.find(p => p.id === payment)?.label || '';

        const order = placeOrder({
            userId: user?.id || 'guest',
            userName: user?.name || 'Guest',
            phone: user?.phone || '',
            items: cart,
            total: finalTotal,
            deliveryFee,
            promoDiscount,
            address,
            slot: slotLabel,
            payment: payLabel,
            category: 'essentials',
        });

        Alert.alert(
            '✅ Order Confirmed! 🎉',
            `Order #${order.id.slice(-6).toUpperCase()} placed!\n\n📦 Total: ₹${finalTotal}\n🕐 Delivery: ${slotLabel}\n💳 Payment: ${payLabel}\n\nThank you for using Apna Betul! 🙏`,
            [{ text: '📦 Track Order', onPress: () => navigation.navigate('Orders') }]
        );
    };

    if (cart.length === 0) {
        return (
            <View style={styles.empty}>
                <StatusBar barStyle="dark-content" />
                <Text style={{ fontSize: 80, marginBottom: 20 }}>🛒</Text>
                <Text style={styles.emptyTitle}>Cart खाली है!</Text>
                <Text style={styles.emptyDesc}>कुछ items add करके order करें</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Essentials')}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.shopBtnGrad}>
                        <Text style={styles.shopBtnText}>🌅 Daily Essentials देखें</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('Fashion')}>
                    <Text style={styles.shopBtnAlt}>👗 Fashion देखें →</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
                <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>🛒 My Cart</Text>
                    <Text style={styles.headerSub}>{cart.length} items · ₹{cartTotal}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Clear Cart?', 'Remove all items?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearCart }
                ])}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Step Indicator */}
            <View style={styles.stepBar}>
                {['Cart', 'Delivery', 'Payment'].map((s, i) => (
                    <React.Fragment key={i}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, step > i && styles.stepDone, step === i + 1 && styles.stepActive]}>
                                <Text style={[styles.stepNum, (step > i || step === i + 1) && styles.stepNumActive]}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </Text>
                            </View>
                            <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{s}</Text>
                        </View>
                        {i < 2 && <View style={[styles.stepLine, step > i + 1 && styles.stepLineDone]} />}
                    </React.Fragment>
                ))}
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* STEP 1 */}
                {step === 1 && (
                    <>
                        {cart.map(item => (
                            <View key={item.id} style={styles.cartItem}>
                                <View style={[styles.itemEmojiBg, { backgroundColor: (item.color || '#FF6B35') + '22' }]}>
                                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemUnit}>{item.unit}</Text>
                                    <View style={styles.itemPriceRow}>
                                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                                        <Text style={styles.itemPriceSub}> × {item.quantity} = </Text>
                                        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                                    </View>
                                </View>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Text style={styles.qtyBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyNum}>{item.quantity}</Text>
                                    <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Text style={[styles.qtyBtnText, { color: '#FFFFFF' }]}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Promo Code */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🎁 Promo Code</Text>
                            {appliedPromo ? (
                                <View style={styles.promoApplied}>
                                    <Text style={styles.promoAppliedText}>✅ {appliedPromo.label} Applied!</Text>
                                    <TouchableOpacity onPress={() => { setAppliedPromo(null); setPromo(''); }}>
                                        <Text style={styles.promoRemove}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.promoRow}>
                                    <TextInput
                                        style={styles.promoInput} placeholder="Enter promo code"
                                        placeholderTextColor="#9CA3AF" value={promo}
                                        onChangeText={setPromo} autoCapitalize="characters"
                                    />
                                    <TouchableOpacity style={styles.promoBtn} onPress={applyPromo}>
                                        <Text style={styles.promoBtnText}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <Text style={styles.promoHint}>Try: BETUL10 · APNA20 · FREE50</Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>📋 Order Summary</Text>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{cartTotal}</Text></View>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text style={[styles.summaryValue, { color: deliveryFee === 0 ? '#16A34A' : '#1E293B' }]}>{deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}</Text></View>
                            {appliedPromo && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Promo ({appliedPromo.label})</Text><Text style={[styles.summaryValue, { color: '#16A34A' }]}>−₹{promoDiscount}</Text></View>}
                            {deliveryFee === 0 && <Text style={styles.freeDeliveryNote}>🎉 Free delivery on orders above ₹{settings.freeDeliveryThreshold}!</Text>}
                            <View style={[styles.summaryRow, styles.summaryTotal]}>
                                <Text style={styles.totalLabel}>Total Payable</Text>
                                <Text style={styles.totalValue}>₹{finalTotal}</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>📍 Delivery Address</Text>
                            {savedAddresses.length > 0 && (
                                <>
                                    <Text style={styles.savedAddrLabel}>Saved Addresses</Text>
                                    {savedAddresses.map(addr => (
                                        <TouchableOpacity key={addr.id} style={[styles.savedAddrItem, address === addr.text && styles.savedAddrActive]} onPress={() => setAddress(addr.text)}>
                                            <Text style={{ fontSize: 16 }}>📍</Text>
                                            <Text style={styles.savedAddrText}>{addr.text}</Text>
                                            {address === addr.text && <Text>✓</Text>}
                                        </TouchableOpacity>
                                    ))}
                                    <Text style={[styles.savedAddrLabel, { marginTop: 14 }]}>Or Enter New Address</Text>
                                </>
                            )}
                            <TextInput
                                style={styles.addressInput} placeholder="Enter delivery address in Betul..."
                                placeholderTextColor="#9CA3AF" multiline numberOfLines={3}
                                value={address} onChangeText={setAddress}
                            />
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🕐 Delivery Time Slot</Text>
                            {DELIVERY_SLOTS.map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.slotItem, slot === s.id && styles.slotActive, !s.available && styles.slotDisabled]}
                                    onPress={() => s.available && setSlot(s.id)} disabled={!s.available}
                                >
                                    <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.slotLabel, slot === s.id && styles.slotLabelActive]}>{s.label}</Text>
                                        {!s.available && <Text style={styles.slotUnavailable}>Not available today</Text>}
                                    </View>
                                    <View style={[styles.slotRadio, slot === s.id && styles.slotRadioActive]}>
                                        {slot === s.id && <View style={styles.slotRadioDot} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>💳 Payment Method</Text>
                            {PAYMENT_METHODS.map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[styles.payItem, payment === m.id && styles.payItemActive]}
                                    onPress={() => setPayment(m.id)}
                                >
                                    <Text style={{ fontSize: 28 }}>{m.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.payLabel, payment === m.id && styles.payLabelActive]}>{m.label}</Text>
                                        <Text style={styles.payDesc}>{m.desc}</Text>
                                    </View>
                                    <View style={[styles.slotRadio, payment === m.id && styles.slotRadioActive]}>
                                        {payment === m.id && <View style={styles.slotRadioDot} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>📋 Final Summary</Text>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Items ({cart.length})</Text><Text style={styles.summaryValue}>₹{cartTotal}</Text></View>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text style={[styles.summaryValue, { color: deliveryFee === 0 ? '#16A34A' : '#1E293B' }]}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text></View>
                            {appliedPromo && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Promo Discount</Text><Text style={[styles.summaryValue, { color: '#16A34A' }]}>−₹{promoDiscount}</Text></View>}
                            <View style={[styles.summaryRow, styles.summaryTotal]}>
                                <Text style={styles.totalLabel}>Amount Payable</Text>
                                <Text style={styles.totalValue}>₹{finalTotal}</Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={styles.checkoutBar}>
                <View>
                    <Text style={styles.checkoutTotal}>₹{finalTotal}</Text>
                    <Text style={styles.checkoutHint}>{step === 3 ? 'Final amount' : 'Total amount'}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.9} onPress={handleCheckout}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.checkoutBtn}>
                        <Text style={styles.checkoutBtnText}>
                            {step === 1 ? 'Proceed to Delivery →' : step === 2 ? 'Choose Payment →' : '✅ Place Order'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 24 },
    emptyTitle: { fontSize: 26, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyDesc: { color: '#94A3B8', fontSize: 14, marginBottom: 28, textAlign: 'center' },
    shopBtn: { width: '100%' },
    shopBtnGrad: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    shopBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    shopBtnAlt: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    backText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    clearText: { color: 'rgba(255,100,100,0.9)', fontWeight: '700', fontSize: 13 },
    stepBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#E2E8F0' },
    stepItem: { alignItems: 'center', gap: 4 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    stepActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7F5' },
    stepDone: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    stepNum: { fontSize: 13, fontWeight: '800', color: '#94A3B8' },
    stepNumActive: { color: '#1E293B' },
    stepLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
    stepLabelActive: { color: '#FF6B35' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 6, marginBottom: 14 },
    stepLineDone: { backgroundColor: '#16A34A' },
    scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
    cartItem: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    itemEmojiBg: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    itemEmoji: { fontSize: 28 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
    itemUnit: { fontSize: 11, color: '#94A3B8', marginBottom: 5 },
    itemPriceRow: { flexDirection: 'row', alignItems: 'center' },
    itemPrice: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
    itemPriceSub: { fontSize: 12, color: '#94A3B8' },
    itemTotal: { fontSize: 14, fontWeight: '900', color: '#FF6B35' },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#CBD5E1' },
    qtyBtnAdd: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
    qtyBtnText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    qtyNum: { fontSize: 16, fontWeight: '900', color: '#1E293B', minWidth: 22, textAlign: 'center' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    cardTitle: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    promoRow: { flexDirection: 'row', gap: 10 },
    promoInput: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1E293B', fontWeight: '700' },
    promoBtn: { backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
    promoBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    promoApplied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#86EFAC' },
    promoAppliedText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
    promoRemove: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
    promoHint: { fontSize: 11, color: '#94A3B8', marginTop: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: '#64748B', fontSize: 14 },
    summaryValue: { fontWeight: '700', fontSize: 14, color: '#1E293B' },
    freeDeliveryNote: { fontSize: 11, color: '#16A34A', fontWeight: '600', backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
    summaryTotal: { borderTopWidth: 1.5, borderTopColor: '#E2E8F0', paddingTop: 12, marginTop: 4 },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#FF6B35' },
    savedAddrLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
    savedAddrItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 8, backgroundColor: '#F8FAFC' },
    savedAddrActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7F5' },
    savedAddrText: { flex: 1, fontSize: 13, color: '#1E293B' },
    addressInput: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14, fontSize: 14, color: '#1E293B', minHeight: 90, textAlignVertical: 'top' },
    slotItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 8, backgroundColor: '#F8FAFC' },
    slotActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7F5' },
    slotDisabled: { opacity: 0.45 },
    slotLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    slotLabelActive: { color: '#FF6B35' },
    slotUnavailable: { fontSize: 11, color: '#EF4444', marginTop: 2 },
    slotRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    slotRadioActive: { borderColor: '#FF6B35' },
    slotRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B35' },
    payItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 8, backgroundColor: '#F8FAFC' },
    payItemActive: { borderColor: '#1E3A5F', backgroundColor: '#F0F6FF' },
    payLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    payLabelActive: { color: '#1E3A5F' },
    payDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    checkoutBar: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10 },
    checkoutTotal: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
    checkoutHint: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    checkoutBtn: { paddingHorizontal: 22, paddingVertical: 15, borderRadius: 16 },
    checkoutBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
