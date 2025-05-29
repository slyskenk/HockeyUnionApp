import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';

export default function Dashboard(){
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏒 Welcome Tupopila</Text>
        <Text style={styles.headerSubtitle}>Your central hockey dashboard</Text>
      </LinearGradient>

      {/* Featured News */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.card}>
        <Image source={require('../../../assets/images/d-news.png')} style={styles.featuredImage} />
        <View style={styles.sectionHeader}>
          <Ionicons name="newspaper" size={20} color="#2E5AAC" />
          <Text style={styles.sectionTitle}>Featured News</Text>
        </View>
        <Text style={styles.subText}>Latest: Namibia Hawks Win!</Text>
      </MotiView>

      {/* Upcoming Events */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={100} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color="#2E5AAC" />
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.buttonLight}>
            <Text style={styles.buttonText}>Team A vs Team B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonLight}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      {/* Favorite Teams */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={200} style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="sports-hockey" size={20} color="#2E5AAC" />
          <Text style={styles.sectionTitle}>Favorite Teams</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.buttonLight}>
            <Text style={styles.buttonText}>Namibia Hawks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonLight}>
            <Text style={styles.buttonText}>Desert Blazers</Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      {/* Fan Forum */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={300} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Entypo name="chat" size={20} color="#2E5AAC" />
          <Text style={styles.sectionTitle}>Fan Forum</Text>
        </View>
        <TouchableOpacity style={styles.buttonLightFull}>
          <Text style={styles.buttonText}>Top Discussions</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Ask our HockeyBot */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} delay={400} style={styles.card}>
        <View style={styles.sectionHeader}>
          <FontAwesome5 name="robot" size={20} color="#2E5AAC" />
          <Text style={styles.sectionTitle}>Ask our HockeyBot</Text>
        </View>
        <TouchableOpacity style={styles.buttonLightFull}>
          <Text style={styles.buttonText}>Ask a Question</Text>
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F6F9',
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e0e0',
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuredImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#ccc',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2E5AAC',
  },
  subText: {
    color: '#444',
    fontSize: 16,
    marginLeft: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  buttonLight: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C7D2E4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
  },
  buttonLightFull: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#C7D2E4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#2E5AAC',
    fontSize: 16,
    fontWeight: '600',
  },
});
