import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const allProducts = [
  { id: '1', name: 'Hockey Cap', price: '$20', category: 'Caps', image: 'https://picsum.photos/seed/hockeycap/200/200' },
  { id: '2', name: 'Team Shorts', price: '$30', category: 'Shorts', image: 'https://picsum.photos/seed/hockeyshorts/200/200' },
  { id: '3', name: 'Official Shirt', price: '$35', category: 'Shirts', image: 'https://picsum.photos/seed/hockeyshirtt/200/200' },
  { id: '4', name: 'Team Anthem', price: '$5', category: 'Songs', image: 'https://picsum.photos/seed/hockeyanthem/200/200' },
  { id: '5', name: 'Hockey Stick', price: '$80', category: 'Equipment', image: 'https://picsum.photos/seed/hockeystick/200/200' },
  { id: '6', name: 'Puck Set', price: '$15', category: 'Equipment', image: 'https://picsum.photos/seed/puckset/200/200' },
  { id: '7', name: 'Goalie Gloves', price: '$70', category: 'Equipment', image: 'https://picsum.photos/seed/goaliegloves/200/200' },
  { id: '8', name: 'Fan Scarf', price: '$20', category: 'Accessories', image: 'https://picsum.photos/seed/fanscarf/200/200' },
];

const categories = ['All', 'Caps', 'Shorts', 'Shirts', 'Songs', 'Equipment', 'Accessories'];

export default function MerchStore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Function to navigate back to the Supporter Dashboard
  const handleGoBackToDashboard = () => {
    router.push('./Dashboard' as any); // Explicitly push to the Supporter Dashboard path
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F4F6F9" barStyle="dark-content" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackToDashboard} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2E5AAC" />
        </TouchableOpacity>
        <Text style={styles.title}>Hockey Merch Store</Text>
        <Ionicons name="cart-outline" size={26} color="#2E5AAC" />
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
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
});