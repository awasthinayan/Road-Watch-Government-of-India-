// screens/DatabaseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function DatabaseScreen({ navigation, userData }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - Replace with actual API calls
  const mockReports = [
    {
      id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole near the intersection causing vehicle damage',
      priority: 'high',
      status: 'pending',
      date: '2024-01-15',
      location: 'Main Street, Downtown',
      reporter: 'Anonymous',
      photos: []
    },
    {
      id: '2',
      title: 'Broken Street Light',
      description: 'Street light not working for past 3 days',
      priority: 'medium',
      status: 'in-progress',
      date: '2024-01-14',
      location: 'Oak Avenue',
      reporter: 'john_doe',
      photos: []
    },
    {
      id: '3',
      title: 'Garbage Accumulation',
      description: 'Garbage piling up near park entrance',
      priority: 'low',
      status: 'completed',
      date: '2024-01-10',
      location: 'Central Park',
      reporter: 'jane_smith',
      photos: []
    },
    {
      id: '4',
      title: 'Water Logging',
      description: 'Severe water logging after rain',
      priority: 'high',
      status: 'pending',
      date: '2024-01-16',
      location: 'Market Road',
      reporter: 'Anonymous',
      photos: []
    }
  ];

  useEffect(() => {
    // Simulate API call
    setReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchQuery, filterStatus, reports]);

  const filterReports = () => {
    let filtered = reports;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

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

  const handleReportAction = (reportId, action) => {
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Report`,
      `Are you sure you want to ${action} this report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update report status
            const updatedReports = reports.map(report =>
              report.id === reportId ? { ...report, status: action } : report
            );
            setReports(updatedReports);
            Alert.alert('Success', `Report ${action} successfully!`);
          }
        }
      ]
    );
  };

  const renderReportCard = (report) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{report.status.replace('-', ' ')}</Text>
        </View>
      </View>
      
      <View style={styles.reportDetails}>
        <Text style={styles.reportDescription}>{report.description}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Priority:</Text>
          <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
            {report.priority.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{report.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reporter:</Text>
          <Text style={styles.detailValue}>{report.reporter}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{report.date}</Text>
        </View>
      </View>

      {userData?.loginType === 'authority' && (
        <View style={styles.actionButtons}>
          {report.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleReportAction(report.id, 'in-progress')}
              >
                <Text style={styles.actionButtonText}>Start Work</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleReportAction(report.id, 'completed')}
              >
                <Text style={styles.actionButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </>
          )}
          {report.status === 'in-progress' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleReportAction(report.id, 'completed')}
            >
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports Database</Text>
        <Text style={styles.headerSubtitle}>
          Total Reports: {filteredReports.length}
          {userData?.loginType === 'authority' ? ' (Authority View)' : ' (Citizen View)'}
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView style={styles.reportsList}>
        {filteredReports.length > 0 ? (
          filteredReports.map(renderReportCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try changing your search or filter criteria' 
                : 'No reports available in the database'
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportDetails: {
    marginBottom: 10,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    width: 70,
  },
  detailValue: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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