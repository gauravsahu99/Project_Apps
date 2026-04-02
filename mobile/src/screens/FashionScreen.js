import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Dimensions, StatusBar, TextInput, FlatList, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ── DATA ─────────────────────────────────────────────────────────────
const GENDER_TABS = [
    { id: 'all', label: 'All', emoji: '🛍️' },
    { id: 'men', label: 'Men', emoji: '👔' },
    { id: 'women', label: 'Women', emoji: '👗' },
    { id: 'kids', label: 'Kids', emoji: '🧸' },
];

const BROWSE_TABS = [
    { id: 'products', label: '🛒 Products' },
    { id: 'shops', label: '🏪 Shops' },
    { id: 'ads', label: '📢 Ads' },
];

const FEATURED_ADS = [
    { id: 'fa1', shopName: 'Sharma Garments', tagline: '👕 New Summer Collection 2025', desc: 'Arrow, Raymond & Van Heusen shirts starting ₹499. Visit us at Civil Lines, Betul.', offer: '40% OFF on all shirts', emoji: '👔', gradColors: ['#1E3A5F', '#2563EB'], badge: 'PREMIUM AD', phone: '9876543210', address: 'Civil Lines, Betul', plan: 'Premium' },
    { id: 'fa2', shopName: 'Priya Saree Center', tagline: '🥻 Wedding & Festival Collection', desc: 'Pure silk, chiffon & cotton sarees from ₹999. 500+ designs. Free blouse stitching!', offer: 'Buy 2 Get 1 Free', emoji: '🥻', gradColors: ['#7C1C60', '#DB2777'], badge: 'FEATURED', phone: '9812345678', address: 'Sarafa Bazar, Betul', plan: 'Featured' },
    { id: 'fa3', shopName: 'Betul Jewellers', tagline: '💍 40 Years of Trust — Gold & Silver', desc: 'Hallmark certified jewelry. Special rates for weddings. Home delivery available!', offer: 'No Making Charges Today', emoji: '💍', gradColors: ['#78350F', '#D97706'], badge: 'TOP SPONSOR', phone: '9901234567', address: 'Sarafa Bazar, Betul', plan: 'Premium' },
    { id: 'fa4', shopName: 'Raj Footwear', tagline: '👟 Steps Ahead with Style', desc: 'Nike, Adidas, Bata & local brands. 85+ models for men, women & kids.', offer: 'Buy 1 Get 1 on Kids Shoes', emoji: '👟', gradColors: ['#7F1D1D', '#EF4444'], badge: 'DEAL OF WEEK', phone: '9823456789', address: 'Station Road, Betul', plan: 'Standard' },
];

const VIDEO_ADS = [
    { id: 'v1', shopName: 'Fashion Hub', title: '🎥 Betul Fashion Week Highlights', desc: 'Watch our exclusive showcase featuring 350+ brands. New arrivals every week!', thumbnail: '🎥', duration: '2:34', views: '12.4K', gradColors: ['#1E1E2E', '#7C3AED'] },
    { id: 'v2', shopName: 'Beauty World', title: '💄 Summer Makeup Tutorial', desc: "Learn trending looks with Lakme, Maybelline & L'Oreal products at our store.", thumbnail: '💄', duration: '5:12', views: '8.7K', gradColors: ['#1A0010', '#E11D48'] },
    { id: 'v3', shopName: 'Sports Corner', title: '🏋️ Gym Wear Review 2025', desc: 'Review of Nike, Puma & Adidas gym wear at Sports Corner, Betul.', thumbnail: '🏋️', duration: '3:45', views: '5.2K', gradColors: ['#0C1445', '#2563EB'] },
];

const SUBSCRIBED_SHOPS = [
    { id: 1, name: 'Sharma Garments', emoji: '👔', plan: 'Premium', color: '#2563EB' },
    { id: 2, name: 'Priya Sarees', emoji: '🥻', plan: 'Featured', color: '#DB2777' },
    { id: 3, name: 'Betul Jewellers', emoji: '💍', plan: 'Premium', color: '#D97706' },
    { id: 4, name: 'Raj Footwear', emoji: '👟', plan: 'Standard', color: '#EF4444' },
    { id: 5, name: 'Beauty World', emoji: '💄', plan: 'Standard', color: '#E11D48' },
    { id: 6, name: 'Sports Corner', emoji: '🏋️', plan: 'Featured', color: '#059669' },
];

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'clothes', label: '👕 Clothes' },
    { id: 'shoes', label: '👟 Shoes' },
    { id: 'accessories', label: '👜 Bags' },
    { id: 'watches', label: '⌚ Watches' },
    { id: 'jewelry', label: '💍 Jewelry' },
    { id: 'ethnic', label: '🥻 Ethnic' },
    { id: 'sports', label: '🏋️ Sports' },
    { id: 'beauty', label: '💄 Beauty' },
    { id: 'innerwear', label: '🩲 Innerwear' },
    { id: 'winter', label: '🧥 Winter' },
];

// Ad banners that appear between product rows
const AD_BANNERS = [
    { id: 'a1', title: 'Grand Festive Sale!', desc: 'Up to 70% off on all fashion items this weekend', emoji: '🎉', gradColors: ['#FF6B35', '#F59E0B'], cta: 'Shop Now' },
    { id: 'a2', title: 'New Arrivals 2025', desc: 'Check out the latest trends from top brands — delivered to Betul', emoji: '✨', gradColors: ['#7C3AED', '#EC4899'], cta: 'Explore' },
    { id: 'a3', title: 'Ladies Special 👗', desc: 'Exclusive women\'s collection from Priya Saree Center', emoji: '🥻', gradColors: ['#DB2777', '#9C27B0'], cta: 'View Collection' },
];

const PRODUCTS = [
    // Men
    { id: 1, name: 'Casual Shirt', nameHi: 'कैज़ुअल शर्ट', desc: 'Premium cotton fabric, perfect for office & casual outings. Available in 8 colours.', price: 599, mrp: 1200, emoji: '👕', gender: 'men', category: 'clothes', brand: 'Arrow', rating: 4.3, ratingCount: 218, color: '#3B82F6', tag: '50% OFF', shop: 'Sharma Garments', shopAddr: 'Civil Lines, Betul' },
    { id: 2, name: 'Sports Shoes', nameHi: 'स्पोर्ट्स जूते', desc: 'Lightweight air-mesh running shoes with anti-slip sole. Great for gym & morning runs.', price: 999, mrp: 2499, emoji: '👟', gender: 'men', category: 'shoes', brand: 'Nike', rating: 4.6, ratingCount: 542, color: '#EF4444', tag: 'Hot 🔥', shop: 'Raj Footwear', shopAddr: 'Station Road, Betul' },
    { id: 3, name: 'Business Trousers', nameHi: 'ट्राउज़र', desc: 'Slim-fit formal trousers in premium wool blend. Perfect for meetings & office wear.', price: 799, mrp: 1500, emoji: '👖', gender: 'men', category: 'clothes', brand: 'Van Heusen', rating: 4.1, ratingCount: 98, color: '#6B7280', tag: null, shop: 'Fashion Hub', shopAddr: 'Bypass Road, Betul' },
    { id: 4, name: 'Analog Watch', nameHi: 'घड़ी', desc: 'Elegant Titan analog watch with sapphire glass & leather strap. 3-year warranty.', price: 1499, mrp: 3999, emoji: '⌚', gender: 'men', category: 'watches', brand: 'Titan', rating: 4.7, ratingCount: 312, color: '#D97706', tag: 'Best Seller', shop: 'Watch World', shopAddr: 'Sarafa Bazar, Betul' },
    { id: 5, name: 'Leather Wallet', nameHi: 'बटुआ', desc: 'Genuine leather bifold wallet with 6 card slots & RFID protection.', price: 399, mrp: 799, emoji: '👜', gender: 'men', category: 'accessories', brand: 'Wildcraft', rating: 4.2, ratingCount: 175, color: '#92400E', tag: null, shop: 'Leather Villa', shopAddr: 'Bazar Road, Betul' },
    { id: 6, name: 'Jacket / Blazer', nameHi: 'जैकेट', desc: 'Warm padded jacket with water-resistant outer shell. Ideal for Betul winters.', price: 1299, mrp: 2999, emoji: '🧥', gender: 'men', category: 'winter', brand: 'Mufti', rating: 4.5, ratingCount: 410, color: '#1E40AF', tag: 'Winter Sale ❄️', shop: 'Sharma Garments', shopAddr: 'Civil Lines, Betul' },
    { id: 7, name: 'Sports Jersey', nameHi: 'जर्सी', desc: 'Quick-dry polyester jersey with mesh panels. Perfect for cricket, football & gym.', price: 449, mrp: 850, emoji: '🎽', gender: 'men', category: 'sports', brand: 'Puma', rating: 4.4, ratingCount: 230, color: '#059669', tag: null, shop: 'Sports Corner', shopAddr: 'Itarsi Road, Betul' },
    { id: 8, name: 'Formal Shoes', nameHi: 'फॉर्मल शूज़', desc: 'Full-grain leather oxford shoes with memory foam insoles. Office-ready style.', price: 1199, mrp: 2500, emoji: '👞', gender: 'men', category: 'shoes', brand: 'Bata', rating: 4.0, ratingCount: 85, color: '#374151', tag: null, shop: 'Raj Footwear', shopAddr: 'Station Road, Betul' },
    // Women
    { id: 9, name: 'Designer Saree', nameHi: 'डिज़ाइनर साड़ी', desc: 'Pure silk saree with Zari border & blouse piece. Perfect for weddings & festivals.', price: 1499, mrp: 3500, emoji: '🥻', gender: 'women', category: 'ethnic', brand: 'FabIndia', rating: 4.8, ratingCount: 620, color: '#EC4899', tag: 'Trending 🔥', shop: 'Priya Saree Center', shopAddr: 'Sarafa Bazar, Betul' },
    { id: 10, name: 'Kurti', nameHi: 'कुर्ती', desc: 'Rayon printed kurti with embroidery detailing. Comfortable all-day wear with ethnic charm.', price: 699, mrp: 1299, emoji: '👗', gender: 'women', category: 'clothes', brand: 'W', rating: 4.5, ratingCount: 380, color: '#7C3AED', tag: 'New Arrival', shop: 'Ladies Fashion', shopAddr: 'Civil Lines, Betul' },
    { id: 11, name: 'Heels / Sandals', nameHi: 'हील्स', desc: 'Block-heel sandals with cushioned footbed. Glamorous yet comfortable for long hours.', price: 799, mrp: 1800, emoji: '👠', gender: 'women', category: 'shoes', brand: 'Catwalk', rating: 4.3, ratingCount: 290, color: '#DB2777', tag: null, shop: 'Raj Footwear', shopAddr: 'Station Road, Betul' },
    { id: 12, name: 'Handbag', nameHi: 'हैंडबैग', desc: 'Structured faux-leather handbag with laptop compartment & stylish metal fittings.', price: 1199, mrp: 2999, emoji: '👜', gender: 'women', category: 'accessories', brand: 'Lavie', rating: 4.6, ratingCount: 445, color: '#DC2626', tag: 'Best Seller', shop: 'Leather Villa', shopAddr: 'Bazar Road, Betul' },
    { id: 13, name: 'Gold Earrings', nameHi: 'सोने की बालियां', desc: '18K gold cubic zirconia drop earrings. Hallmark certified, comes with gift box.', price: 2499, mrp: 5000, emoji: '💍', gender: 'women', category: 'jewelry', brand: 'Tanishq', rating: 4.9, ratingCount: 790, color: '#B45309', tag: '50% OFF', shop: 'Betul Jewellers', shopAddr: 'Sarafa Bazar, Betul' },
    { id: 14, name: 'Lipstick Set', nameHi: 'लिपस्टिक सेट', desc: 'Set of 5 long-lasting matte lipsticks in trending shades. 12-hour wear formula.', price: 499, mrp: 999, emoji: '💄', gender: 'women', category: 'beauty', brand: 'Lakme', rating: 4.4, ratingCount: 560, color: '#E11D48', tag: 'Combo 🎁', shop: 'Beauty World', shopAddr: 'Main Market, Betul' },
    { id: 15, name: 'Sports Bra', nameHi: 'स्पोर्ट्स ब्रा', desc: 'High-impact sports bra with moisture-wicking fabric. Ideal for yoga, gym & running.', price: 399, mrp: 799, emoji: '🩱', gender: 'women', category: 'sports', brand: 'Jockey', rating: 4.5, ratingCount: 310, color: '#7C3AED', tag: null, shop: 'Sports Corner', shopAddr: 'Itarsi Road, Betul' },
    { id: 16, name: 'Woollen Shawl', nameHi: 'ऊनी शॉल', desc: 'Pure Kashmiri wool shawl with traditional embroidery. Soft, warm, and elegant.', price: 899, mrp: 1999, emoji: '🧣', gender: 'women', category: 'winter', brand: 'Monte Carlo', rating: 4.6, ratingCount: 195, color: '#0D9488', tag: 'Winter ❄️', shop: 'Priya Saree Center', shopAddr: 'Sarafa Bazar, Betul' },
    // Kids
    { id: 17, name: 'School Bag', nameHi: 'स्कूल बैग', desc: 'Durable polyester bag with padded back support & ergonomic straps. Fits 15L.', price: 499, mrp: 999, emoji: '🎒', gender: 'kids', category: 'accessories', brand: 'Wildcraft', rating: 4.3, ratingCount: 120, color: '#2563EB', tag: null, shop: 'Kids Land', shopAddr: 'Station Road, Betul' },
    { id: 18, name: 'Kids T-Shirt', nameHi: 'बच्चों की टी-शर्ट', desc: '100% cotton soft t-shirt with fun graphic prints. Available in sizes 2Y to 12Y.', price: 249, mrp: 499, emoji: '👕', gender: 'kids', category: 'clothes', brand: 'UCB Kids', rating: 4.4, ratingCount: 88, color: '#D97706', tag: null, shop: 'Kids Land', shopAddr: 'Station Road, Betul' },
    { id: 19, name: 'Kids Sneakers', nameHi: 'बच्चों के जूते', desc: 'Velcro sneakers with anti-slip soles & cushioned insole. Easy for kids to wear.', price: 599, mrp: 1299, emoji: '👟', gender: 'kids', category: 'shoes', brand: 'Bata', rating: 4.2, ratingCount: 65, color: '#059669', tag: null, shop: 'Raj Footwear', shopAddr: 'Station Road, Betul' },
    { id: 20, name: 'Teddy Dress / Frock', nameHi: 'फ्रॉक', desc: 'Soft cotton frock with lace rim & bow detailing. Available in pink, yellow & blue.', price: 349, mrp: 799, emoji: '👗', gender: 'kids', category: 'clothes', brand: 'Max Fashion', rating: 4.6, ratingCount: 145, color: '#EC4899', tag: 'Cute 🧸', shop: 'Kids Land', shopAddr: 'Station Road, Betul' },
];

const SHOPS = [
    { id: 1, name: 'Sharma Garments', nameHi: 'शर्मा गारमेंट्स', emoji: '👔', category: 'Men\'s Clothes', rating: 4.5, products: 120, since: '2010', verified: true, color: '#3B82F6', address: 'Civil Lines, Betul', ad: 'New summer collection with 40% off on Arrow & Raymond!' },
    { id: 2, name: 'Raj Footwear', nameHi: 'राज फुटवियर', emoji: '👟', category: 'Shoes', rating: 4.7, products: 85, since: '2005', verified: true, color: '#EF4444', address: 'Station Road, Betul', ad: 'Buy 1 Get 1 Free on kids shoes this month!' },
    { id: 3, name: 'Priya Saree Center', nameHi: 'प्रिया साड़ी सेंटर', emoji: '🥻', category: 'Ethnic Wear', rating: 4.8, products: 200, since: '1998', verified: true, color: '#EC4899', address: 'Sarafa Bazar, Betul', ad: 'Wedding sarees from ₹999 — 500+ designs in stock!' },
    { id: 4, name: 'Fashion Hub', nameHi: 'फैशन हब', emoji: '🛍️', category: 'All Fashion', rating: 4.3, products: 350, since: '2015', verified: false, color: '#9C27B0', address: 'Bypass Road, Betul', ad: 'Biggest fashion store in Betul — 350+ branded items always in stock.' },
    { id: 5, name: 'Watch World', nameHi: 'वॉच वर्ल्ड', emoji: '⌚', category: 'Watches', rating: 4.6, products: 60, since: '2012', verified: true, color: '#D97706', address: 'Sarafa Bazar, Betul', ad: 'Titan, Fastrack & Casio — all original watches, free strap replacement!' },
    { id: 6, name: 'Beauty World', nameHi: 'ब्यूटी वर्ल्ड', emoji: '💄', category: 'Beauty', rating: 4.4, products: 140, since: '2018', verified: true, color: '#E11D48', address: 'Main Market, Betul', ad: 'Lakme, Maybelline & L\'Oréal — all beauty brands under one roof!' },
    { id: 7, name: 'Betul Jewellers', nameHi: 'बेतुल ज्वेलर्स', emoji: '💍', category: 'Jewelry', rating: 4.9, products: 90, since: '1985', verified: true, color: '#B45309', address: 'Sarafa Bazar, Betul', ad: '40-year legacy — Hallmark gold & silver jewelry at best prices in Betul!' },
    { id: 8, name: 'Kids Land', nameHi: 'किड्स लैंड', emoji: '🧸', category: 'Kids Fashion', rating: 4.5, products: 180, since: '2016', verified: false, color: '#059669', address: 'Station Road, Betul', ad: 'Complete school uniform & kids fashion — free alteration service!' },
    { id: 9, name: 'Sports Corner', nameHi: 'स्पोर्ट्स कॉर्नर', emoji: '🏋️', category: 'Sportswear', rating: 4.4, products: 95, since: '2014', verified: true, color: '#2563EB', address: 'Itarsi Road, Betul', ad: 'Nike, Puma, Adidas & Decathlon — sports wear & equipment all here!' },
    { id: 10, name: 'Leather Villa', nameHi: 'लेदर विला', emoji: '👜', category: 'Bags & Wallets', rating: 4.3, products: 75, since: '2011', verified: false, color: '#92400E', address: 'Bazar Road, Betul', ad: 'Custom name-engraved wallets & genuine leather bags made to order!' },
];

// ── AD BANNER ─────────────────────────────────────────────────────────
function AdBanner({ ad }) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Alert.alert(`${ad.emoji} ${ad.title}`, ad.desc)}
            style={styles.adBannerWrap}
        >
            <LinearGradient colors={ad.gradColors} style={styles.adBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.adBannerLeft}>
                    <Text style={styles.adBannerEmoji}>{ad.emoji}</Text>
                    <View style={styles.adBannerTextWrap}>
                        <Text style={styles.adBannerTitle}>{ad.title}</Text>
                        <Text style={styles.adBannerDesc} numberOfLines={2}>{ad.desc}</Text>
                    </View>
                </View>
                <View style={styles.adBannerCta}>
                    <Text style={styles.adBannerCtaText}>{ad.cta} →</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────
function ProductCard({ item, onPress }) {
    const [wished, setWished] = useState(false);
    const disc = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    return (
        <TouchableOpacity style={[styles.pCard, { width: CARD_W }]} onPress={onPress} activeOpacity={0.9}>
            {item.tag && (
                <View style={[styles.pTag, { backgroundColor: item.color }]}>
                    <Text style={styles.pTagText}>{item.tag}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.wishBtn} onPress={() => setWished(w => !w)}>
                <Text style={{ fontSize: 18 }}>{wished ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <View style={[styles.pEmojiBg, { backgroundColor: item.color + '18' }]}>
                <Text style={styles.pEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.pInfo}>
                <Text style={styles.pBrand}>{item.brand}</Text>
                <Text style={styles.pName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.pNameHi} numberOfLines={1}>{item.nameHi}</Text>
                {/* ── Description / Ad ── */}
                <Text style={styles.pDesc} numberOfLines={2}>{item.desc}</Text>
                <View style={styles.pRatingRow}>
                    <Text style={styles.pRating}>⭐ {item.rating}</Text>
                    <Text style={styles.pRatingCount}>({item.ratingCount})</Text>
                </View>
                <View style={styles.pPriceRow}>
                    <Text style={styles.pPrice}>₹{item.price}</Text>
                    <Text style={styles.pMrp}>₹{item.mrp}</Text>
                    <Text style={[styles.pDisc, { color: item.color }]}>{disc}% off</Text>
                </View>
                <Text style={styles.pShop}>🏪 {item.shop}</Text>
                <Text style={styles.pShopAddr}>📍 {item.shopAddr}</Text>
            </View>
            <TouchableOpacity
                style={[styles.addCartBtn, { backgroundColor: item.color }]}
                onPress={() => Alert.alert('Added to Cart! 🛒', `${item.name} added to cart.\n\nShop: ${item.shop}\nPrice: ₹${item.price}`)}
            >
                <Text style={styles.addCartText}>🛒  Add to Cart</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ── SHOP CARD ─────────────────────────────────────────────────────────
function ShopCard({ shop }) {
    return (
        <View style={styles.shopCard}>
            {/* Shop Header */}
            <View style={styles.shopHeader}>
                <View style={[styles.shopEmojiBg, { backgroundColor: shop.color + '18' }]}>
                    <Text style={{ fontSize: 32 }}>{shop.emoji}</Text>
                </View>
                <View style={styles.shopInfo}>
                    <View style={styles.shopNameRow}>
                        <Text style={styles.shopName}>{shop.name}</Text>
                        {shop.verified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓ Verified</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.shopNameHi}>{shop.nameHi}</Text>
                    <Text style={styles.shopCat}>📂 {shop.category} • Since {shop.since}</Text>
                    <View style={styles.shopStatsRow}>
                        <Text style={styles.shopStat}>⭐ {shop.rating}</Text>
                        <Text style={styles.shopStat}>🛍️ {shop.products} items</Text>
                    </View>
                </View>
            </View>
            {/* Address */}
            <View style={styles.shopAddrRow}>
                <Text style={styles.shopAddr}>📍 {shop.address}</Text>
            </View>
            {/* Advertisement */}
            <LinearGradient
                colors={[shop.color + '22', shop.color + '10']}
                style={styles.shopAdBox}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
                <Text style={styles.shopAdLabel}>📢 Advertisement</Text>
                <Text style={styles.shopAdText}>{shop.ad}</Text>
            </LinearGradient>
            {/* CTA */}
            <TouchableOpacity
                style={[styles.visitBtn, { backgroundColor: shop.color }]}
                onPress={() => Alert.alert(`🏪 ${shop.name}`, `${shop.ad}\n\n📍 ${shop.address}`)}
            >
                <Text style={styles.visitBtnText}>📞  Contact Shop</Text>
            </TouchableOpacity>
        </View>
    );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────
export default function FashionScreen({ navigation }) {
    const [gender, setGender] = useState('all');
    const [browse, setBrowse] = useState('products');
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('popular');

    const filteredProducts = PRODUCTS.filter(p => {
        const genderMatch = gender === 'all' || p.gender === gender;
        const catMatch = category === 'all' || p.category === category;
        const searchMatch = search.length < 2 || p.name.toLowerCase().includes(search.toLowerCase()) || p.nameHi.includes(search) || p.brand.toLowerCase().includes(search.toLowerCase());
        return genderMatch && catMatch && searchMatch;
    }).sort((a, b) => {
        if (sort === 'price_low') return a.price - b.price;
        if (sort === 'price_high') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating;
        return b.ratingCount - a.ratingCount;
    });

    // Interleave ad banners every 6 products
    const productsWithAds = [];
    filteredProducts.forEach((p, i) => {
        productsWithAds.push({ ...p, _type: 'product' });
        if ((i + 1) % 6 === 0 && i + 1 < filteredProducts.length) {
            const adIdx = Math.floor(i / 6) % AD_BANNERS.length;
            productsWithAds.push({ ...AD_BANNERS[adIdx], _type: 'ad' });
        }
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ── */}
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>👗 Fashion & Style</Text>
                        <Text style={styles.headerSub}>Betul की Best Shopping · Local Shops</Text>
                    </View>
                    <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                        <Text style={{ fontSize: 22 }}>🛒</Text>
                    </TouchableOpacity>
                </View>
                {/* Search */}
                <View style={styles.searchBox}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search clothes, shoes, brands..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Gender Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genderTabsRow}>
                    {GENDER_TABS.map(g => (
                        <TouchableOpacity
                            key={g.id}
                            style={[styles.genderTab, gender === g.id && styles.genderTabActive]}
                            onPress={() => { setGender(g.id); setCategory('all'); }}
                        >
                            <Text style={styles.genderTabEmoji}>{g.emoji}</Text>
                            <Text style={[styles.genderTabLabel, gender === g.id && styles.genderTabLabelActive]}>{g.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            {/* ── BROWSE TABS ── */}
            <View style={styles.browseTabs}>
                {BROWSE_TABS.map(b => (
                    <TouchableOpacity
                        key={b.id}
                        style={[styles.browseTab, browse === b.id && styles.browseTabActive]}
                        onPress={() => setBrowse(b.id)}
                    >
                        <Text style={[styles.browseTabText, browse === b.id && styles.browseTabTextActive]}>{b.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── PRODUCTS VIEW ── */}
            {browse === 'products' && (
                <View style={{ flex: 1 }}>
                    {/* Category Filter */}
                    <View style={styles.catScrollWrap}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.catContent}>
                                {CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c.id}
                                        style={[styles.catChip, category === c.id && styles.catChipActive]}
                                        onPress={() => setCategory(c.id)}
                                    >
                                        <Text style={styles.catChipEmoji}>{c.emoji}</Text>
                                        <Text style={[styles.catChipText, category === c.id && styles.catChipTextActive]}>
                                            {c.label.replace(c.emoji, '').trim()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Sort Row */}
                    <View style={styles.sortRow}>
                        <View style={styles.sortTopRow}>
                            <Text style={styles.resultCount}>🛍️ {filteredProducts.length} items found</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.sortChipsRow}>
                                {[
                                    { id: 'popular', label: '🔥 Popular' },
                                    { id: 'rating', label: '⭐ Top Rated' },
                                    { id: 'price_low', label: '💰 Low Price' },
                                    { id: 'price_high', label: '💎 Premium' },
                                ].map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.sortChip, sort === s.id && styles.sortChipActive]}
                                        onPress={() => setSort(s.id)}
                                    >
                                        <Text style={[styles.sortChipText, sort === s.id && styles.sortChipTextActive]}>{s.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Product list with interleaved ads (pair rows + ad banners) */}
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.productGrid}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={<AdBanner ad={AD_BANNERS[0]} />}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Text style={{ fontSize: 50 }}>🔍</Text>
                                <Text style={styles.emptyText}>No items found</Text>
                                <Text style={{ color: '#9CA3AF', marginTop: 4 }}>Try a different filter or search</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <>
                                <ProductCard
                                    item={item}
                                    onPress={() => Alert.alert(
                                        `${item.emoji} ${item.name}`,
                                        `${item.desc}\n\nBrand: ${item.brand}\nPrice: ₹${item.price} (MRP ₹${item.mrp})\nShop: ${item.shop}\n📍 ${item.shopAddr}\nRating: ⭐ ${item.rating} (${item.ratingCount} reviews)`
                                    )}
                                />
                                {/* Show ad banner after every 4th product pair */}
                                {(index + 1) % 8 === 0 && (
                                    <View style={{ width: '100%' }}>
                                        <AdBanner ad={AD_BANNERS[Math.floor(index / 8) % AD_BANNERS.length]} />
                                    </View>
                                )}
                            </>
                        )}
                    />
                </View>
            )}

            {/* ── SHOPS VIEW ── */}
            {browse === 'shops' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <AdBanner ad={AD_BANNERS[2]} />
                    <Text style={styles.sectionTitle}>🏪 {SHOPS.length} Shops in Betul</Text>
                    {SHOPS.map(shop => <ShopCard key={shop.id} shop={shop} />)}
                </ScrollView>
            )}

            {/* ── ADS / SUBSCRIPTION VIEW ── */}
            {browse === 'ads' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

                    {/* Advertise Your Shop CTA */}
                    <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.advertCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.advertCtaTitle}>📣 Advertise Your Shop</Text>
                            <Text style={styles.advertCtaDesc}>Reach 10,000+ Betul customers. Choose your plan!</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.advertCtaBtn}
                            onPress={() => Alert.alert('📢 Advertise with Us', 'Plans:\n\n🏆 Premium — ₹999/month\n  • Hero banner + Video ad\n  • Priority listing\n\n⭐ Featured — ₹499/month\n  • Banner ad + Badge\n\n✅ Standard — ₹199/month\n  • Shop listing badge\n\nCall: 9876543210')}
                        >
                            <Text style={styles.advertCtaBtnText}>View Plans</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Subscribed Shops */}
                    <Text style={styles.adsSection}>🏅 Subscribed Shops</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subscribedRow}>
                        {SUBSCRIBED_SHOPS.map(s => (
                            <TouchableOpacity key={s.id} style={[styles.subShopPill, { borderColor: s.color }]}
                                onPress={() => Alert.alert(`${s.emoji} ${s.name}`, `Plan: ${s.plan}\nThis shop is advertising on Apna Betul!`)}>
                                <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                                <View>
                                    <Text style={styles.subShopName}>{s.name}</Text>
                                    <Text style={[styles.subShopPlan, { color: s.color }]}>{s.plan}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Featured Banner Ads */}
                    <Text style={styles.adsSection}>🏷️ Featured Banner Ads</Text>
                    {FEATURED_ADS.map(ad => (
                        <TouchableOpacity key={ad.id} activeOpacity={0.9}
                            onPress={() => Alert.alert(`🏪 ${ad.shopName}`, `${ad.desc}\n\n🎁 Offer: ${ad.offer}\n📍 ${ad.address}\n📞 ${ad.phone}`)}
                            style={styles.featuredAdWrap}>
                            <LinearGradient colors={ad.gradColors} style={styles.featuredAd} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.featuredAdBadgeRow}>
                                    <View style={styles.adBadge}>
                                        <Text style={styles.adBadgeText}>{ad.badge}</Text>
                                    </View>
                                    <View style={[styles.planBadge, ad.plan === 'Premium' && styles.planBadgePremium]}>
                                        <Text style={styles.planBadgeText}>{ad.plan === 'Premium' ? '🏆' : ad.plan === 'Featured' ? '⭐' : '✅'} {ad.plan}</Text>
                                    </View>
                                </View>
                                <View style={styles.featuredAdBody}>
                                    <Text style={styles.featuredAdEmoji}>{ad.emoji}</Text>
                                    <View style={styles.featuredAdTextWrap}>
                                        <Text style={styles.featuredAdShop}>{ad.shopName}</Text>
                                        <Text style={styles.featuredAdTagline}>{ad.tagline}</Text>
                                        <Text style={styles.featuredAdDesc} numberOfLines={2}>{ad.desc}</Text>
                                    </View>
                                </View>
                                <View style={styles.featuredAdFooter}>
                                    <View style={styles.offerBadge}>
                                        <Text style={styles.offerBadgeText}>🎁 {ad.offer}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.callBtn}
                                        onPress={() => Alert.alert(`📞 Call ${ad.shopName}`, `Calling ${ad.phone}...`)}>
                                        <Text style={styles.callBtnText}>📞 Call Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}

                    {/* Video Ads Section */}
                    <Text style={styles.adsSection}>🎥 Video Advertisements</Text>
                    <Text style={styles.adsSectionSub}>Watch shop videos and discover the latest collections</Text>
                    {VIDEO_ADS.map(vid => (
                        <TouchableOpacity key={vid.id} activeOpacity={0.9}
                            onPress={() => Alert.alert(`🎥 ${vid.title}`, `${vid.desc}\n\nShop: ${vid.shopName}\nViews: ${vid.views}\nDuration: ${vid.duration}\n\n(Video playback coming soon!)`)}>
                            <LinearGradient colors={vid.gradColors} style={styles.videoAdCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.videoThumb}>
                                    <Text style={styles.videoThumbEmoji}>{vid.thumbnail}</Text>
                                    <View style={styles.playBtn}>
                                        <Text style={styles.playBtnIcon}>▶️</Text>
                                    </View>
                                    <View style={styles.videoDuration}>
                                        <Text style={styles.videoDurationText}>{vid.duration}</Text>
                                    </View>
                                </View>
                                <View style={styles.videoInfo}>
                                    <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
                                    <Text style={styles.videoShop}>🏪 {vid.shopName}</Text>
                                    <View style={styles.videoMeta}>
                                        <Text style={styles.videoMetaText}>👁️ {vid.views} views</Text>
                                        <View style={styles.videoAdLabel}><Text style={styles.videoAdLabelText}>AD</Text></View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}

                    {/* Subscription Plans */}
                    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.promoteCard}>
                        <Text style={styles.promoteTitle}>🚀 Grow Your Business!</Text>
                        <Text style={styles.promoteDesc}>Join 6+ shops already advertising on Apna Betul. Reach thousands of local customers daily.</Text>
                        <View style={styles.promotePlans}>
                            {[
                                { plan: '✅ Standard', price: '₹199/mo', desc: 'Basic badge' },
                                { plan: '⭐ Featured', price: '₹499/mo', desc: 'Banner + badge' },
                                { plan: '🏆 Premium', price: '₹999/mo', desc: 'Banner + Video' },
                            ].map((p, i) => (
                                <View key={i} style={styles.promotePlanCard}>
                                    <Text style={styles.promotePlanName}>{p.plan}</Text>
                                    <Text style={styles.promotePlanPrice}>{p.price}</Text>
                                    <Text style={styles.promotePlanDesc}>{p.desc}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.promoteBtn}
                            onPress={() => Alert.alert('📞 Subscribe Now', 'Call or WhatsApp:\n9876543210\n\nWe will set up your ad within 24 hours!')}>
                            <Text style={styles.promoteBtnText}>📞 Subscribe Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>
            )}
        </View>
    );
}

// ── STYLES ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },

    // Header
    header: { paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    cartBtn: { backgroundColor: 'rgba(255,255,255,0.12)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
    genderTabsRow: { marginBottom: 6 },
    genderTab: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, marginRight: 8, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
    genderTabActive: { backgroundColor: '#fff', borderColor: '#fff' },
    genderTabEmoji: { fontSize: 18 },
    genderTabLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginTop: 2 },
    genderTabLabelActive: { color: '#0F172A' },

    // Browse Tabs
    browseTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderColor: '#E2E8F0' },
    browseTab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 24, backgroundColor: '#F1F5F9' },
    browseTabActive: { backgroundColor: '#0F172A' },
    browseTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    browseTabTextActive: { color: '#FFFFFF' },

    // Category Chips
    catScrollWrap: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0', minHeight: 56 },
    catContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, backgroundColor: '#E2E8F0', borderWidth: 1.5, borderColor: '#94A3B8' },
    catChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
    catChipEmoji: { fontSize: 14 },
    catChipText: { fontSize: 13, fontWeight: '700', color: '#111827' },
    catChipTextActive: { color: '#FFFFFF' },

    // Sort Row
    sortRow: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    sortTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    resultCount: { fontSize: 13, color: '#111827', fontWeight: '700' },
    sortChipsRow: { gap: 8, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' },
    sortChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, backgroundColor: '#E2E8F0', borderWidth: 1.5, borderColor: '#94A3B8', marginRight: 4 },
    sortChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
    sortChipText: { fontSize: 13, color: '#111827', fontWeight: '700' },
    sortChipTextActive: { color: '#FFFFFF' },

    // Product Grid
    productGrid: { padding: 10, paddingBottom: 80 },
    row: { justifyContent: 'space-between', marginBottom: 10 },

    // Product Card
    pCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, elevation: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, position: 'relative' },
    pTag: { position: 'absolute', top: 10, left: 10, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, zIndex: 10 },
    pTagText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
    wishBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
    pEmojiBg: { width: '100%', height: 86, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    pEmoji: { fontSize: 40 },
    pInfo: {},
    pBrand: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 },
    pName: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 2, lineHeight: 17 },
    pNameHi: { fontSize: 11, color: '#64748B', marginTop: 1 },
    pDesc: { fontSize: 10, color: '#94A3B8', marginTop: 5, lineHeight: 14 },
    pRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    pRating: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
    pRatingCount: { fontSize: 10, color: '#94A3B8' },
    pPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' },
    pPrice: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
    pMrp: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
    pDisc: { fontSize: 11, fontWeight: '800' },
    pShop: { fontSize: 10, color: '#475569', marginTop: 5, fontWeight: '600' },
    pShopAddr: { fontSize: 9, color: '#94A3B8', marginTop: 1 },
    addCartBtn: { borderRadius: 12, paddingVertical: 9, alignItems: 'center', marginTop: 10 },
    addCartText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

    // Ad Banner
    adBannerWrap: { marginHorizontal: 0, marginBottom: 12 },
    adBanner: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    adBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    adBannerEmoji: { fontSize: 32 },
    adBannerTextWrap: { flex: 1 },
    adBannerTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
    adBannerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3, lineHeight: 16 },
    adBannerCta: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    adBannerCtaText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

    // Shop Card
    shopCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
    shopHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 10 },
    shopEmojiBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    shopInfo: { flex: 1 },
    shopNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    shopName: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
    verifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    verifiedText: { fontSize: 10, color: '#16A34A', fontWeight: '700' },
    shopNameHi: { fontSize: 12, color: '#64748B', marginTop: 1 },
    shopCat: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
    shopStatsRow: { flexDirection: 'row', gap: 14, marginTop: 6 },
    shopStat: { fontSize: 12, fontWeight: '700', color: '#334155' },
    shopAddrRow: { marginBottom: 10 },
    shopAddr: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    shopAdBox: { borderRadius: 14, padding: 12, marginBottom: 12 },
    shopAdLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    shopAdText: { fontSize: 13, color: '#1E293B', fontWeight: '600', lineHeight: 19 },
    visitBtn: { borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
    visitBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },

    // Section
    sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    emptyBox: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 14 },

    // Advertise CTA Bar
    advertCta: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
    advertCtaTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', marginBottom: 5 },
    advertCtaDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17 },
    advertCtaBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexShrink: 0 },
    advertCtaBtnText: { fontSize: 12, fontWeight: '900', color: '#1A1A1A' },

    // Ads section headings
    adsSection: { fontSize: 17, fontWeight: '900', color: '#1E293B', marginBottom: 6, marginTop: 6 },
    adsSectionSub: { fontSize: 12, color: '#64748B', marginBottom: 14 },

    // Subscribed Shops row
    subscribedRow: { gap: 10, paddingBottom: 20, paddingTop: 4 },
    subShopPill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, elevation: 2 },
    subShopName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
    subShopPlan: { fontSize: 10, fontWeight: '700', marginTop: 1 },

    // Featured Banner Ad
    featuredAdWrap: { marginBottom: 16 },
    featuredAd: { borderRadius: 22, padding: 18, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
    featuredAdBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14, alignItems: 'center' },
    adBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    adBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
    planBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    planBadgePremium: { backgroundColor: '#F59E0B' },
    planBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
    featuredAdBody: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
    featuredAdEmoji: { fontSize: 52 },
    featuredAdTextWrap: { flex: 1 },
    featuredAdShop: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    featuredAdTagline: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 4, lineHeight: 24 },
    featuredAdDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 17 },
    featuredAdFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    offerBadge: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
    offerBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    callBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 9, flexShrink: 0 },
    callBtnText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },

    // Video Ad Card
    videoAdCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 14, flexDirection: 'row', elevation: 4, minHeight: 110 },
    videoThumb: { width: 130, alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 110 },
    videoThumbEmoji: { fontSize: 44 },
    playBtn: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
    playBtnIcon: { fontSize: 18 },
    videoDuration: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
    videoDurationText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
    videoInfo: { flex: 1, padding: 14, justifyContent: 'center' },
    videoTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', lineHeight: 19 },
    videoShop: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
    videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    videoMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
    videoAdLabel: { backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    videoAdLabelText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },

    // Subscription Plan Card
    promoteCard: { borderRadius: 22, padding: 20, marginTop: 10 },
    promoteTitle: { fontSize: 22, fontWeight: '900', color: '#14532D', marginBottom: 8 },
    promoteDesc: { fontSize: 13, color: '#166534', lineHeight: 19, marginBottom: 18 },
    promotePlans: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    promotePlanCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 2 },
    promotePlanName: { fontSize: 11, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    promotePlanPrice: { fontSize: 16, fontWeight: '900', color: '#16A34A', marginTop: 4 },
    promotePlanDesc: { fontSize: 10, color: '#64748B', marginTop: 4, textAlign: 'center' },
    promoteBtn: { backgroundColor: '#16A34A', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
    promoteBtnText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
});
