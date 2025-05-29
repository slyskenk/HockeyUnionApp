import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ArticlePage = () => {
  const router = useRouter();
  const { title, imageUrl, content = '' } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
      </TouchableOpacity>

      <Text style={styles.section}>Hockey News</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>April 18, 2025 by Sports Daily</Text>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.body}>
        {content || 'No description available for this article.'}
      </Text>
    </ScrollView>
  );
};

export default ArticlePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fbff',
  },
  backBtn: {
    marginBottom: 10,
  },
  section: {
    color: '#336699',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#003366',
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});
