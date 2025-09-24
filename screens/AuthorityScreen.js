// screens/AuthorityScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

export default function AuthorityScreen({ navigation, userData, onLogout }) {
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            onLogout();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>RoadWatch</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout ({userData?.username})</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Authority Dashboard</Text>
        <Text style={styles.userRole}>Role: {userData?.loginType}</Text>
      </View>

      {/* Authority Dashboard Content */}
      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authority Controls</Text>
          
          <TouchableOpacity style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>View All Reports</Text>
            <Text style={styles.dashboardButtonSubtext}>Monitor and manage citizen reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>Pending Approvals</Text>
            <Text style={styles.dashboardButtonSubtext}>Review and approve submissions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>Analytics</Text>
            <Text style={styles.dashboardButtonSubtext}>View reports statistics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('Database')}
          >
            <Text style={styles.dashboardButtonText}>Database</Text>
            <Text style={styles.dashboardButtonSubtext}>Access full database</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>User Management</Text>
            <Text style={styles.dashboardButtonSubtext}>Manage user accounts</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.noActivity}>No recent activity to display</Text>
        </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#e8f0fe',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#e8f0fe',
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    marginTop: 10,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dashboardButton: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 5,
  },
  dashboardButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  noActivity: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});