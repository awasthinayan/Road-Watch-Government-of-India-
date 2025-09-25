// screens/UserDatabaseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserDatabaseScreen({ userData }) {
  const [userReports, setUserReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const response = await fetch(
        'https://noor-samsung.onrender.com/api/complaints/my-complaints',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log('Fetched user reports:', data.data.complaints);
      
      if (response.ok && data.data.complaints) {
        // Transform API data to match UI expectations
        const transformedReports = data.data.complaints.map(report => ({
          id: report._id,
          title: report.caption || 'No Title',
          description: report.caption || 'No description provided',
          priority: getPriorityFromReport(report),
          status: getStatusFromReport(report),
          date: formatDate(report.createdAt),
          location: report.location ? 
            `${report.location.roadName}, ${report.location.landmark} - ${report.location.zipCode}` 
            : 'Location not specified',
          submittedBy: userData?.username || 'You',
          imageUrl: report.imageUrl
        }));
        
        setUserReports(transformedReports);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch reports');
        setUserReports([]);
      }

    } catch (error) {
      console.error('Network or storage error:', error);
      Alert.alert('Error', 'Cannot connect to server. Check your internet.');
      setUserReports([]);
    }
  };

  // Helper functions to transform API data
  const getPriorityFromReport = (report) => {
    // You can modify this logic based on your business rules
    if (report.priority) return report.priority;
    return 'medium'; // default priority
  };

  const getStatusFromReport = (report) => {
    if (report.isLegitimate === true) return 'completed';
    if (report.isLegitimate === false) return 'pending';
    if (report.isLegitimate === null) return 'in-progress';
    return 'pending'; // default status
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    getData();
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
      case 'in-progress': return 'Verification in Progress';
      case 'completed': return 'Verified & Completed';
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
              {/* Report Image */}
              {report.imageUrl && (
                <Image 
                  source={{ uri: report.imageUrl }} 
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              )}
              
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
                  <Text style={styles.detailValue}>#{report.id.substring(0, 8)}...</Text>
                </View>
              </View>

              {/* Status Message */}
              {report.status === 'pending' && (
                <Text style={styles.statusMessage}>
                  ⏳ Your report is under initial review
                </Text>
              )}
              {report.status === 'in-progress' && (
                <Text style={styles.statusMessage}>
                  🔧 Authorities are verifying the report
                </Text>
              )}
              {report.status === 'completed' && (
                <Text style={styles.statusMessage}>
                  ✅ Report verified and marked as legitimate
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
  reportImage: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 10,
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