// screens/HomeScreen.js
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation, userData, onLogout }) {
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photos, setPhotos] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [roadName, setRoadName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityLevels = [
    { id: "low", label: "Low", subtitle: "Minor issue", color: "#4CAF50", icon: "📗" },
    { id: "medium", label: "Medium", subtitle: "Moderate concern", color: "#FF9800", icon: "📙" },
    { id: "high", label: "High", subtitle: "Safety hazard", color: "#F44336", icon: "📕" },
  ];

  // Request permissions when component mounts
  React.useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    if (photos.length >= 3) {
      Alert.alert("Limit Reached", "You can upload maximum 3 photos");
      return;
    }

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = result.assets.map((asset, index) => ({
          uri: asset.uri,
          id: `${Date.now()}-${index}`,
          type: 'image/jpeg',
          name: `photo-${Date.now()}-${index}.jpg`,
        }));

        setPhotos([...photos, ...newPhotos]);
      } else {
        console.log("Image selection was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const removePhoto = (photoId) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId));
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission required", "Sorry, we need camera permissions to make this work!");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          uri: result.assets[0].uri,
          id: Date.now().toString(),
          type: 'image/jpeg',
          name: `photo-${Date.now()}.jpg`,
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const uploadReport = async (reportData) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Please log in to submit reports");
        setIsSubmitting(false);
        return;
      }

      // Validate required fields
      if (!zipCode.trim() || !landmark.trim() || !roadName.trim()) {
        Alert.alert("Error", "Please fill in all required location fields (ZIP Code, Landmark, Road Name)");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      
      // Add text fields
      formData.append("caption", reportData.description);
      
      // Location data
      formData.append(
        "location",
        JSON.stringify({
          address: address || "Not specified",
          street: roadName,
          city: city || "Delhi",
          zipCode: zipCode,
          landmark: landmark,
          roadName: roadName,
        })
      );

      // Add photos
      if (reportData.photos && reportData.photos.length > 0) {
        reportData.photos.forEach((photo, index) => {
          formData.append("image", {
            uri: photo.uri,
            type: 'image/jpeg',
            name: `photo-${Date.now()}-${index}.jpg`,
          });
        });
      }

      console.log("Submitting form data...");

      const response = await fetch(
        "https://noor-samsung.onrender.com/api/complaints/",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          Alert.alert("Error", errorData.message || `Server error: ${response.status}`);
        } catch {
          Alert.alert("Error", `Server error: ${response.status}`);
        }
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        Alert.alert("Success", "Report submitted successfully!");
        formReset();
      } else {
        Alert.alert("Error", data.message || "Failed to submit report");
      }
      
    } catch (error) {
      console.error("Network error during submission:", error);
      Alert.alert("Error", "Cannot connect to server. Please check your internet connection.");
    }
    setIsSubmitting(false);
  };

  const handleSubmitReport = () => {
    if (!priority) {
      Alert.alert("Error", "Please select a priority level");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please describe the issue");
      return;
    }

    const reportData = {
      priority,
      description,
      contact,
      photos: photos,
      timestamp: new Date().toISOString(),
      userType: userData?.loginType || "anonymous",
    };

    console.log("Report submitted:", reportData);
    uploadReport(reportData);
  };

  const formReset = () => {
    setPriority("");
    setDescription("");
    setContact("");
    setPhotos([]);
    setZipCode("");
    setLandmark("");
    setRoadName("");
    setCity("");
    setAddress("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>RoadWatch</Text>
            <Text style={styles.headerSubtitle}>Report Road Issues</Text>
          </View>
          {userData && (
            <TouchableOpacity style={styles.userBadge} onPress={onLogout}>
              <Ionicons name="person-circle" size={24} color="#fff" />
              <Text style={styles.userText}>{userData.username}</Text>
              <Ionicons name="log-out-outline" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Dashboard Section */}
        {userData && (
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>My Dashboard</Text>
            <View style={styles.dashboardGrid}>
              <TouchableOpacity 
                style={styles.dashboardCard}
                onPress={() => navigation.navigate("UserDatabase")}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="document-text" size={24} color="#2196F3" />
                </View>
                <Text style={styles.cardTitle}>My Reports</Text>
                <Text style={styles.cardSubtitle}>View your submissions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dashboardCard}
                onPress={() => navigation.navigate("Database")}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="people" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.cardTitle}>Community</Text>
                <Text style={styles.cardSubtitle}>See all reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Priority Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level *</Text>
          <Text style={styles.sectionSubtitle}>Select the urgency of the issue</Text>
          <View style={styles.priorityGrid}>
            {priorityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.priorityCard,
                  priority === level.id && { 
                    borderColor: level.color, 
                    backgroundColor: level.color + '15' 
                  }
                ]}
                onPress={() => setPriority(level.id)}
              >
                <Text style={styles.priorityIcon}>{level.icon}</Text>
                <Text style={[
                  styles.priorityLabel,
                  priority === level.id && { color: level.color }
                ]}>
                  {level.label}
                </Text>
                <Text style={styles.prioritySubtitle}>{level.subtitle}</Text>
                {priority === level.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: level.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details *</Text>
          <Text style={styles.sectionSubtitle}>Provide accurate location information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Road Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter road name"
                value={roadName}
                onChangeText={setRoadName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP Code *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter ZIP code"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Landmark *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nearby landmark"
              value={landmark}
              onChangeText={setLandmark}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Address details"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Description *</Text>
          <Text style={styles.sectionSubtitle}>Describe the problem in detail</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Provide detailed description of the road issue, including any safety concerns..."
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Add visual evidence (max 3 photos)</Text>
          
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color="#2196F3" />
              <Text style={styles.photoButtonText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#2196F3" />
              <Text style={styles.photoButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Text style={styles.photosTitle}>Selected Photos ({photos.length}/3)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosGrid}>
                  {photos.map((photo) => (
                    <View key={photo.id} style={styles.photoItem}>
                      <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ff4444" />
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
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.sectionSubtitle}>Optional - for follow-up updates</Text>
          <TextInput
            style={styles.textInput}
            placeholder="email@example.com or phone number"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
          />
        </View>

        {/* Login Info for Anonymous Users */}
        {!userData && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Login Required</Text>
              <Text style={styles.infoText}>
                Log in to track your reports and view community issues
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </View>
          ) : (
            <View style={styles.submitContent}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    opacity: 0.9,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  userText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dashboardSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    position: 'relative',
  },
  priorityIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  prioritySubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    gap: 8,
  },
  photoButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  photosContainer: {
    marginTop: 8,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    opacity: 0.8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});