// screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation, userData, onLogout }) {
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [photos, setPhotos] = useState([]);

  const priorityLevels = [
    { id: 'low', label: 'Low', subtitle: 'Minor issue' },
    { id: 'medium', label: 'Medium', subtitle: 'Moderate concern' },
    { id: 'high', label: 'High', subtitle: 'Safety hazard' }
  ];

 const requestPermission = async () => {
  // For newer versions of expo-image-picker
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return false;
    }
  }
  return true;
};

  // Replace the pickImage function in your HomeScreen.js
const pickImage = async () => {
  if (photos.length >= 3) {
    Alert.alert('Limit Reached', 'You can upload maximum 3 photos');
    return;
  }

  const hasPermission = await requestPermission();
  if (!hasPermission) return;

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images, // Fixed: Use MediaType instead of MediaTypeOptions
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets[0].uri) {
    const newPhoto = {
      uri: result.assets[0].uri,
      id: Date.now().toString(),
    };
    setPhotos([...photos, newPhoto]);
  }
};

  const removePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleSubmitReport = () => {
    if (!priority) {
      Alert.alert('Error', 'Please select a priority level');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the issue');
      return;
    }

    const reportData = {
      priority,
      description,
      contact,
      photos: photos.map(photo => photo.uri),
      timestamp: new Date().toISOString(),
      userType: userData?.loginType || 'anonymous'
    };

    console.log('Report submitted:', reportData);
    Alert.alert('Success', 'Report submitted successfully!');
    
    // Reset form
    setPriority('');
    setDescription('');
    setContact('');
    setPhotos([]);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header - Doesn't Scroll */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>RoadWatch</Text>
          {userData && (
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout ({userData.username})</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerSubtitle}>Smart Road Reporting System</Text>
      </View>

      {/* Scrollable Content Below Header */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Priority Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {priorityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.priorityButton,
                  priority === level.id && styles.priorityButtonSelected
                ]}
                onPress={() => setPriority(level.id)}
              >
                <Text style={[
                  styles.priorityLabel,
                  priority === level.id && styles.priorityLabelSelected
                ]}>
                  {level.label}
                </Text>
                <Text style={styles.prioritySubtitle}>{level.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>Describe the issue in detail...</Text>
          <TextInput
            style={styles.descriptionInput}
            multiline
            numberOfLines={4}
            placeholder="Provide detailed description of the road issue..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Login Info Section */}
        {!userData && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Login Required</Text>
            <Text style={styles.infoText}>
              Please log in to view recent reports and track their progress.
            </Text>
            <Text style={styles.infoSubtext}>
              Citizen Login: You can still submit reports anonymously using the form above.
            </Text>
          </View>
        )}

        {/* Photo Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Photos (Optional)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>Click to upload photos</Text>
            <Text style={styles.photoSubtext}>PNG, JPG up to 5MB each (max 3 photos)</Text>
          </TouchableOpacity>
          
          {/* Selected Photos Preview */}
          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Text style={styles.photosTitle}>Selected Photos ({photos.length}/3):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosList}>
                  {photos.map((photo) => (
                    <View key={photo.id} style={styles.photoItem}>
                      <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                      <TouchableOpacity 
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <Text style={styles.removePhotoText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Contact (Optional)</Text>
          <TextInput
            style={styles.contactInput}
            placeholder="email@example.com"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>

        {/* Footer Space */}
        <View style={styles.footer} />
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
    paddingTop: 50, // Added padding for status bar
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    fontSize: 16,
    color: '#e8f0fe',
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
    marginTop: 140, // Height of header + some margin
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: '#1a73e8',
    backgroundColor: '#e8f0fe',
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  priorityLabelSelected: {
    color: '#1a73e8',
  },
  prioritySubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  infoSection: {
    backgroundColor: '#fff3cd',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  photoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  photosContainer: {
    marginTop: 10,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  photosList: {
    flexDirection: 'row',
  },
  photoItem: {
    position: 'relative',
    marginRight: 10,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});