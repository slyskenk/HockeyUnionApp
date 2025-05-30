import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const allProducts = [
  { id: '1', name: 'Hockey Cap', price: '$20', category: 'Caps', image: 'https://example.com/cap.png' },
  { id: '2', name: 'Team Shorts', price: '$30', category: 'Shorts', image: 'https://example.com/shorts.png' },
  { id: '3', name: 'Official Shirt', price: '$35', category: 'Shirts', image: 'https://example.com/shirt.png' },
  { id: '4', name: 'Team Anthem', price: '$5', category: 'Songs', image: 'https://example.com/song.png' }
];

const categories = ['All', 'Caps', 'Shorts', 'Shirts', 'Songs'];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hockey Merch Store</Text>
        <Ionicons name="cart-outline" size={26} color="#007bff" />
      </View>

      {/* Search */}
      <TextInput style={styles.search} placeholder="Search merchandise..." />

      {/* Categories */}
      <View style={styles.categories}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </View>
        )}
      />

    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light blue-grey
  },
  header: {
    padding: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
     // Deep blue
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
    padding: 10,
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#C7D2E4',
  },
  categoryButtonActive: {
    backgroundColor: '#2E5AAC',
    borderColor: '#2E5AAC',
  },
  categoryText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: 'normal',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#333333',
    marginTop: 4,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#C7D2E4',
  },
});
