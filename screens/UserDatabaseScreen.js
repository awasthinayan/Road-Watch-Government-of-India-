// screens/UserDatabaseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function UserDatabaseScreen({ userData }) {
  const [userReports, setUserReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock user-specific reports data
  const mockUserReports = [
    {
      id: '1',
      title: 'Pothole near my house',
      description: 'Large pothole causing vehicle damage every day',
      priority: 'high',
      status: 'pending',
      date: '2024-01-15',
      location: 'Near Central Park',
      submittedBy: userData?.username || 'You'
    },
    {
      id: '2',
      title: 'Broken sidewalk',
      description: 'Sidewalk tiles broken, dangerous for pedestrians',
      priority: 'medium',
      status: 'in-progress',
      date: '2024-01-12',
      location: 'Main Street',
      submittedBy: userData?.username || 'You'
    },
    {
      id: '3',
      title: 'Street light outage',
      description: 'Light not working for past week',
      priority: 'high',
      status: 'completed',
      date: '2024-01-05',
      location: 'Oak Avenue',
      submittedBy: userData?.username || 'You'
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch user's reports
    setUserReports(mockUserReports);
  }, []);

  const filteredReports = filterStatus === 'all' 
    ? userReports 
    : userReports.filter(report => report.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'in-progress': return '#007AFF';
      case 'completed': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'in-progress': return 'Work in Progress';
      case 'completed': return 'Issue Resolved';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <Text style={styles.headerSubtitle}>
          Track your submitted reports ({filteredReports.length} total)
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'in-progress', 'completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'All' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView style={styles.reportsList}>
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(report.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.reportDescription}>{report.description}</Text>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority:</Text>
                  <Text style={[styles.detailValue, { color: getPriorityColor(report.priority) }]}>
                    {report.priority.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{report.location}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submitted:</Text>
                  <Text style={styles.detailValue}>{report.date}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Report ID:</Text>
                  <Text style={styles.detailValue}>#{report.id}</Text>
                </View>
              </View>

              {/* Status Message */}
              {report.status === 'pending' && (
                <Text style={styles.statusMessage}>
                  ⏳ Your report is under review by authorities
                </Text>
              )}
              {report.status === 'in-progress' && (
                <Text style={styles.statusMessage}>
                  🔧 Authorities are working on resolving this issue
                </Text>
              )}
              {report.status === 'completed' && (
                <Text style={styles.statusMessage}>
                  ✅ This issue has been resolved successfully
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterStatus !== 'all' 
                ? `You don't have any ${filterStatus} reports` 
                : "You haven't submitted any reports yet"
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e8f0fe',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#1a73e8',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  reportsList: {
    flex: 1,
    padding: 10,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  statusMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 5,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});