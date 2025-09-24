// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import LoginTypeSelector from '../components/LoginTypeSelector';
import LoginForm from '../components/LoginForm';

export default function LoginScreen({ onLogin }) { // Removed navigation prop
  const [selectedLoginType, setSelectedLoginType] = useState(null);

  const loginTypes = [
    { id: 'citizen', title: 'Citizen Login', icon: '👤' },
    { id: 'authority', title: 'Authority Login', icon: '🏛️' }
  ];

  const handleLoginTypeSelect = (loginType) => {
    setSelectedLoginType(loginType);
  };

  const handleLogin = (credentials) => {
    // TODO: Connect to backend API
    console.log('Login attempt:', credentials);
    
    // Mock login success
    if (credentials.username && credentials.password) {
      const userData = {
        loginType: credentials.loginType,
        username: credentials.username,
        timestamp: new Date().toISOString()
      };
      
      // Call the onLogin function passed from App.js
      onLogin(userData); // This will trigger navigation in App.js
      Alert.alert('Success', `Welcome ${credentials.username}!`);
    } else {
      Alert.alert('Error', 'Please enter valid credentials');
    }
  };

  const handleBack = () => {
    setSelectedLoginType(null);
  };

  return (
    <View style={styles.container}>
      {/* Welcome Gesture Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.appTitle}>RoadWatch</Text>
        <Text style={styles.welcomeSubtitle}>Smart Road Reporting System</Text>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_of_India_logo.svg/1200px-Government_of_India_logo.svg.png?20220331190844' }} 
          style={styles.logo}
        />
      </View>

      {/* Login Section */}
      <View style={styles.loginSection}>
        {!selectedLoginType ? (
          <LoginTypeSelector 
            loginTypes={loginTypes}
            onLoginTypeSelect={handleLoginTypeSelect}
          />
        ) : (
          <LoginForm 
            loginType={selectedLoginType}
            onLogin={handleLogin}
            onBack={handleBack}
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Choose your login type to continue
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  welcomeSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#e8f0fe',
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  loginSection: {
    flex: 2,
    padding: 20,
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});