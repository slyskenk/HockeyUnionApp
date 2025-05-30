import { MaterialIcons } from '@expo/vector-icons'; // For various report icons
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Define ReportItem type
type ReportItem = {
  id: string;
  type: 'Player Performance' | 'Team Performance' | 'User Activity' | 'Financial Summary' | 'Event Attendance' | 'Forum Moderation' | 'Supporter Engagement' | 'Disciplinary Action';
  title: string;
  description: string;
  timestamp: number; // Unix timestamp
  relatedRole: 'All' | 'Admin' | 'Coach' | 'Player' | 'Supporter' | 'Financial' | 'Events'; // For filtering
  status?: 'Generated' | 'Pending Review' | 'Completed'; // Optional status
};

// Dummy data for various reports
const DUMMY_REPORTS: ReportItem[] = [
  {
    id: 'rep1',
    type: 'Player Performance',
    title: 'Q1 Player Performance Summary - U16',
    description: 'Summary of goals, assists, and disciplinary records for U16 players.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 30), // 30 days ago
    relatedRole: 'Player',
    status: 'Generated',
  },
  {
    id: 'rep2',
    type: 'User Activity',
    title: 'Admin Login Activity - Last 7 Days',
    description: 'Detailed log of admin login times and session durations.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 7), // 7 days ago
    relatedRole: 'Admin',
    status: 'Generated',
  },
  {
    id: 'rep3',
    type: 'Team Performance',
    title: 'Senior Men\'s Team Match Analysis - April',
    description: 'Breakdown of wins, losses, and key tactical insights from April matches.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 10), // 10 days ago
    relatedRole: 'Coach',
    status: 'Pending Review',
  },
  {
    id: 'rep4',
    type: 'Supporter Engagement',
    title: 'Supporter App Usage - March',
    description: 'Metrics on active supporters, forum engagement, and content consumption.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 45), // 45 days ago
    relatedRole: 'Supporter',
    status: 'Completed',
  },
  {
    id: 'rep5',
    type: 'Financial Summary',
    title: 'Q1 Financial Overview - Revenue & Expenses',
    description: 'Comprehensive report on all financial transactions for the first quarter.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 60), // 60 days ago
    relatedRole: 'Financial',
    status: 'Generated',
  },
  {
    id: 'rep6',
    type: 'Event Attendance',
    title: 'Annual Gala Dinner Attendance Report',
    description: 'Summary of attendees, ticket sales, and feedback from the recent gala.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 5), // 5 days ago
    relatedRole: 'Events',
    status: 'Generated',
  },
  {
    id: 'rep7',
    type: 'Disciplinary Action',
    title: 'Disciplinary Report - Player ID P123',
    description: 'Details regarding a recent disciplinary action taken against a player.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 2), // 2 days ago
    relatedRole: 'Player',
    status: 'Pending Review',
  },
  {
    id: 'rep8',
    type: 'Forum Moderation',
    title: 'Forum Moderation Log - Last Week',
    description: 'Overview of moderated posts, warnings issued, and user suspensions in the forum.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 7), // 7 days ago
    relatedRole: 'Admin',
    status: 'Generated',
  },
];

type ReportFilter = 'All' | 'Player' | 'Coach' | 'Admin' | 'Supporter' | 'Financial' | 'Events';

const ReportsScreen = () => {
  const [reports, setReports] = useState<ReportItem[]>(DUMMY_REPORTS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ReportFilter>('All'); // Default filter

  // Filter reports based on the selected category
  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'All') {
      return true; // Show all reports
    }
    return report.relatedRole === selectedFilter;
  });

  // Function to format timestamp for display
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  /**
   * Handles viewing details of a report.
   * @param report The report item to view.
   */
  const handleViewReportDetails = (report: ReportItem) => {
    Alert.alert(
      `Report: ${report.title}`,
      `${report.description}\n\nType: ${report.type}\nGenerated: ${formatTimeAgo(report.timestamp)}\nStatus: ${report.status || 'N/A'}`,
      [
        { text: 'OK' },
        // Add more actions here, e.g., 'Download', 'Share'
      ]
    );
    console.log('Viewing report details:', report.id);
    // In a real app, navigate to a detailed report screen or open a PDF viewer
  };

  /**
   * Simulates refreshing reports (e.g., fetching new data from a server).
   */
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      const newReport: ReportItem = {
        id: `new-rep-${Date.now()}`,
        type: 'Player Performance',
        title: 'New Player Attendance Report - U18',
        description: 'Automated report on player attendance for the last week.',
        timestamp: Date.now(),
        relatedRole: 'Player',
        status: 'Generated',
      };
      setReports(prev => [newReport, ...prev]);
      setRefreshing(false);
    }, 1500);
  }, []);

  const getIconForReportType = (type: ReportItem['type']) => {
    switch (type) {
      case 'Player Performance': return 'person-outline';
      case 'Team Performance': return 'group';
      case 'User Activity': return 'person-search';
      case 'Financial Summary': return 'attach-money';
      case 'Event Attendance': return 'event-note';
      case 'Forum Moderation': return 'gavel';
      case 'Supporter Engagement': return 'favorite-border';
      case 'Disciplinary Action': return 'warning';
      default: return 'description';
    }
  };

  const renderReportItem = ({ item }: { item: ReportItem }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleViewReportDetails(item)}
      activeOpacity={0.8}
    >
      <View style={styles.reportIconContainer}>
        <MaterialIcons name={getIconForReportType(item.type)} size={28} color="#007AFF" />
      </View>
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.reportMeta}>
          <Text style={styles.reportTime}>{formatTimeAgo(item.timestamp)}</Text>
          {item.status && (
            <Text style={[styles.reportStatus, styles[`status${item.status.replace(/\s/g, '')}`]]}>
              {item.status}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Report Category Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollViewContent}>
          {['All', 'Player', 'Coach', 'Admin', 'Supporter', 'Financial', 'Events'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter as ReportFilter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive,
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Report List or Empty State */}
      {filteredReports.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyListContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        >
          <MaterialIcons name="folder-off" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No reports found for this category.</Text>
          <Text style={styles.emptyListSubText}>Pull down to refresh or try another filter.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterScrollViewContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reportIconContainer: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E6F3FA', // Light blue background for icon
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reportTime: {
    fontSize: 12,
    color: '#999',
  },
  reportStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden', // Ensures borderRadius is applied
  },
  statusGenerated: {
    backgroundColor: '#D0EAFB',
    color: '#007AFF',
  },
  statusPendingReview: {
    backgroundColor: '#FFFBE6',
    color: '#FF9500',
  },
  statusCompleted: {
    backgroundColor: '#E6FBE6',
    color: '#28a745',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ReportsScreen;
