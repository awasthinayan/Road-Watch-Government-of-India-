// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import AuthorityScreen from './screens/AuthorityScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (userData) => {
    setUserData(userData);
    setIsLoggedIn(true);
    console.log('Login successful:', userData);
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {isLoggedIn ? (
          // User is logged in - show appropriate screen based on user type
          userData?.loginType === 'authority' ? (
            <Stack.Screen name="Authority" options={{ headerShown: false }}>
              {props => (
                <AuthorityScreen 
                  {...props} 
                  userData={userData}
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {props => (
                <HomeScreen 
                  {...props} 
                  userData={userData}
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
          )
        ) : (
          // User is not logged in - show Login screen
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => (
              <LoginScreen 
                {...props} 
                onLogin={handleLogin} 
              />
            )}
          </Stack.Screen>
        )}

        {/* Common screens accessible from both user types */}
        <Stack.Screen 
          name="Database" 
          options={{ 
            headerShown: true, 
            title: 'Database',
            headerStyle: {
              backgroundColor: '#1a73e8',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {props => <DatabaseScreen {...props} userData={userData} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}