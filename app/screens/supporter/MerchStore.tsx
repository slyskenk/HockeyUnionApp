import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print'; // For printing invoices
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing'; // For sharing printed invoices
import React, { useMemo, useState } from 'react'; // Added useMemo
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal, // For checkout form
  Platform,
  SafeAreaView, // Import Modal for checkout
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Product Data in NAD ---
const allProducts = [
  { id: '1', name: 'Hockey Cap', price: 200.00, category: 'Caps', image: 'https://picsum.photos/seed/hockeycap/200/200' },
  { id: '2', name: 'Team Shorts', price: 300.00, category: 'Shorts', image: 'https://picsum.photos/seed/hockeyshorts/200/200' },
  { id: '3', name: 'Official Shirt', price: 350.00, category: 'Shirts', image: 'https://picsum.photos/seed/hockeyshirtt/200/200' },
  { id: '4', name: 'Team Anthem', price: 50.00, category: 'Songs', image: 'https://picsum.photos/seed/hockeyanthem/200/200' },
  { id: '5', name: 'Hockey Stick', price: 800.00, category: 'Equipment', image: 'https://picsum.photos/seed/hockeystick/200/200' },
  { id: '6', name: 'Puck Set', price: 150.00, category: 'Equipment', image: 'https://picsum.photos/seed/puckset/200/200' },
  { id: '7', name: 'Goalie Gloves', price: 700.00, category: 'Equipment', image: 'https://picsum.photos/seed/goaliegloves/200/200' },
  { id: '8', name: 'Fan Scarf', price: 200.00, category: 'Accessories', image: 'https://picsum.photos/seed/fanscarf/200/200' },
];

const categories = ['All', 'Caps', 'Shorts', 'Shirts', 'Songs', 'Equipment', 'Accessories'];

// --- Type Definitions for Cart Item and Order ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderDetails {
  items: CartItem[];
  total: number;
  date: string;
  orderId: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export default function MerchStore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // State for checkout form
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // --- Cart Functions ---
  const addToCart = (product: typeof allProducts[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // --- Checkout Functions ---
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }
    setIsCartModalVisible(false);
    setIsCheckoutModalVisible(true);
  };

  const handlePlaceOrder = () => {
    if (!fullName || !address || !city || !postalCode) {
      Alert.alert('Missing Information', 'Please fill in all shipping details.');
      return;
    }

    // Simulate payment processing (e.g., API call)
    // In a real app, this would involve a payment gateway
    Alert.alert('Payment Successful!', 'Your order has been placed successfully!', [
      {
        text: 'OK',
        onPress: () => {
          const orderId = `ORD-${Date.now()}`;
          const orderDate = new Date().toLocaleDateString('en-NA', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          setOrderDetails({
            items: cart,
            total: cartTotal,
            date: orderDate,
            orderId: orderId,
            shippingAddress: {
              name: fullName,
              address: address,
              city: city,
              postalCode: postalCode,
            },
          });

          setCart([]); // Clear cart after successful order
          setIsCheckoutModalVisible(false);
          setIsInvoiceModalVisible(true); // Show invoice
          // Reset form fields
          setFullName('');
          setAddress('');
          setCity('');
          setPostalCode('');
        },
      },
    ]);
  };

  // --- Invoice Printing Functionality ---
  const generateInvoiceHtml = (order: OrderDetails) => {
    const itemRows = order.items.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${item.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">NAD ${item.price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">NAD ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - Hockey Merch</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
          .container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h1 { text-align: center; color: #2E5AAC; margin-bottom: 20px; }
          .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .header-info div { flex: 1; }
          .header-info p { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f2f2f2; color: #555; }
          .total-row { text-align: right; padding-top: 15px; font-size: 16px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>INVOICE</h1>
          <div class="header-info">
            <div>
              <p><strong>Invoice ID:</strong> ${order.orderId}</p>
              <p><strong>Date:</strong> ${order.date}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Billed To:</strong></p>
              <p>${order.shippingAddress.name}</p>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Item</th>
                <th style="width: 15%; text-align: center;">Quantity</th>
                <th style="width: 20%; text-align: right;">Unit Price</th>
                <th style="width: 25%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              <tr>
                <td colspan="3" class="total-row">Subtotal:</td>
                <td class="total-row">NAD ${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="total-row">Shipping:</td>
                <td class="total-row">NAD 0.00</td>
              </tr>
              <tr>
                <td colspan="3" class="total-row">Grand Total:</td>
                <td class="total-row">NAD ${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p class="footer">Thank you for your purchase from Hockey Merch!.</p>
          <p class="footer">E-mail: support@hockeymerch.com | Phone: +264 81 123 4567</p>
        </div>
      </body>
      </html>
    `;
  };

  const printInvoice = async () => {
    if (!orderDetails) {
      Alert.alert('Error', 'No order details to print.');
      return;
    }

    try {
      const htmlContent = generateInvoiceHtml(orderDetails);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
      } else {
        // For web or other platforms, you might open the URI in a new tab
        Alert.alert('Invoice Ready', `Invoice saved to: ${uri}\nYou can manually open or download it.`);
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      Alert.alert('Print Error', 'Could not generate or share invoice. Please try again.');
    }
  };

  // --- Navigation ---
  const handleGoBackToDashboard = () => {
    router.push('./Dashboard' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F4F6F9" barStyle="dark-content" />

      {/* Header with Back Button and Cart Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackToDashboard} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2E5AAC" />
        </TouchableOpacity>
        <Text style={styles.title}>Hockey Merch Store</Text>
        <TouchableOpacity onPress={() => setIsCartModalVisible(true)}>
          <Ionicons name="cart-outline" size={26} color="#2E5AAC" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search merchandise..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Categories */}
      <View style={styles.categories}>
        <FlatList
          data={categories}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productListContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>NAD {item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* --- Cart Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartModalVisible}
        onRequestClose={() => setIsCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cartModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setIsCartModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            ) : (
              <FlatList
                data={cart}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>NAD {item.price.toFixed(2)}</Text>
                      <View style={styles.cartItemQuantityControl}>
                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity - 1)}>
                          <Ionicons name="remove-circle-outline" size={24} color="#FF6F61" />
                        </TouchableOpacity>
                        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity + 1)}>
                          <Ionicons name="add-circle-outline" size={24} color="#34C759" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.cartItemRemove}>
                      <MaterialIcons name="delete" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}

            <View style={styles.cartSummary}>
              <Text style={styles.cartTotalText}>Total: NAD {cartTotal.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleProceedToCheckout}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Checkout Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCheckoutModalVisible}
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.checkoutModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => setIsCheckoutModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Shipping Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Shipping Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
            />

            <Text style={styles.sectionHeading}>Order Summary</Text>
            {cart.map(item => (
              <View key={item.id} style={styles.orderSummaryItem}>
                <Text style={styles.orderSummaryText}>{item.name} x {item.quantity}</Text>
                <Text style={styles.orderSummaryText}>NAD {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <Text style={styles.orderTotal}>Total: NAD {cartTotal.toFixed(2)}</Text>

            <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
              <Text style={styles.placeOrderButtonText}>Place Order (Simulated Payment)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* --- Invoice Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isInvoiceModalVisible}
        onRequestClose={() => setIsInvoiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.invoiceModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Confirmation & Invoice</Text>
              <TouchableOpacity onPress={() => setIsInvoiceModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {orderDetails && (
              <>
                <Text style={styles.invoiceText}>Thank you for your purchase!</Text>
                <Text style={styles.invoiceText}>Order ID: <Text style={styles.invoiceHighlight}>{orderDetails.orderId}</Text></Text>
                <Text style={styles.invoiceText}>Date: <Text style={styles.invoiceHighlight}>{orderDetails.date}</Text></Text>

                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionHeading}>Shipping Address:</Text>
                  <Text style={styles.invoiceDetailText}>{orderDetails.shippingAddress.name}</Text>
                  <Text style={styles.invoiceDetailText}>{orderDetails.shippingAddress.address}</Text>
                  <Text style={styles.invoiceDetailText}>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</Text>
                </View>

                <View style={styles.invoiceSection}>
                  <Text style={styles.sectionHeading}>Items:</Text>
                  {orderDetails.items.map(item => (
                    <Text key={item.id} style={styles.invoiceItemText}>
                      - {item.name} (x{item.quantity}) - NAD {(item.price * item.quantity).toFixed(2)}
                    </Text>
                  ))}
                </View>

                <Text style={styles.invoiceTotal}>Grand Total: NAD {orderDetails.total.toFixed(2)}</Text>

                <TouchableOpacity style={styles.printInvoiceButton} onPress={printInvoice}>
                  <Ionicons name="print" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.printInvoiceButtonText}>Print/Share Invoice</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E5AAC',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  search: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categories: {
    marginBottom: 15,
  },
  categoryListContent: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 25,
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#C7D2E4',
    marginHorizontal: 5,
  },
  categoryButtonActive: {
    backgroundColor: '#2E5AAC',
    borderColor: '#2E5AAC',
  },
  categoryText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  productListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  productImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E63946',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addToCartButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Position modals at the bottom
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cartModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%', // Limit height
    width: '100%',
  },
  checkoutModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // More padding for scroll
    width: '100%',
  },
  invoiceModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E5AAC',
  },
  emptyCartText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingVertical: 30,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#E63946',
    marginTop: 2,
  },
  cartItemQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  cartItemQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  cartItemRemove: {
    padding: 8,
  },
  cartSummary: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    alignItems: 'flex-end',
  },
  cartTotalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  orderSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderSummaryText: {
    fontSize: 15,
    color: '#444',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    textAlign: 'right',
    marginTop: 15,
  },
  placeOrderButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  invoiceText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  invoiceHighlight: {
    fontWeight: 'bold',
    color: '#2E5AAC',
  },
  invoiceSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  invoiceDetailText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 3,
  },
  invoiceItemText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 5,
  },
  invoiceTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E63946',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 20,
  },
  printInvoiceButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  printInvoiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});