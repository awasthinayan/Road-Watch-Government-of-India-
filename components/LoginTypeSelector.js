// components/LoginTypeSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginTypeSelector({ loginTypes, onLoginTypeSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Login Type</Text>
      <View style={styles.loginTypesContainer}>
        {loginTypes.map((loginType) => (
          <TouchableOpacity
            key={loginType.id}
            style={styles.loginTypeButton}
            onPress={() => onLoginTypeSelect(loginType)}
          >
            <Text style={styles.loginTypeIcon}>{loginType.icon}</Text>
            <Text style={styles.loginTypeText}>{loginType.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  loginTypesContainer: {
    gap: 15,
  },
  loginTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginTypeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  loginTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});