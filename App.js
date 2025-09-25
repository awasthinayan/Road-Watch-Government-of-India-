// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text } from 'react-native';

// Import screens
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import DatabaseScreen from "./screens/DatabaseScreen";
import AuthorityScreen from "./screens/AuthorityScreen";
import UserDatabaseScreen from "./screens/UserDatabaseScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const savedUserData = await AsyncStorage.getItem("userData");
      
      if (token && savedUserData) {
        setUserData(JSON.parse(savedUserData));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking existing auth:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const auth = async (username, password, url, loginType) => {
    try {
      console.log("Attempting login for:", loginType);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok || !data.success) {
        alert(data.message || `Login failed: ${response.status}`);
        return { success: false };
      }

      if (data.token) {
        // Store token and user data
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify({
          ...data.user,
          loginType: loginType
        }));

        // Update state
        setIsLoggedIn(true);
        setUserData({
          ...data.user,
          loginType: loginType
        });

        console.log("Login successful, user type:", loginType);
        return { success: true, user: data.user };
      } else {
        alert("No token received from server");
        return { success: false };
      }
    } catch (error) {
      console.error("Network error during authentication:", error);
      alert("Cannot connect to server. Please check your internet connection.");
      return { success: false };
    }
  };

  const authenticateHandler = async (loginType, username, password) => {
    console.log("Authenticating:", loginType, username);
    
    let url;
    if (loginType === "citizen") {
      url = "https://noor-samsung.onrender.com/api/auth/citizen/login";
    } else if (loginType === "authority") {
      url = "https://noor-samsung.onrender.com/api/auth/admin/login";
    } else {
      alert("Invalid login type");
      return;
    }

    const result = await auth(username, password, url, loginType);
    
    if (!result.success) {
      console.log("Authentication failed");
      // Reset states on failure
      setIsLoggedIn(false);
      setUserData(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
    }
  };

  const handleLogin = (userData) => {
    console.log("Handle login called with:", userData);
    authenticateHandler(
      userData.loginType,
      userData.username,
      userData.password
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.error("Error during logout:", error);
    }
    
    setUserData(null);
    setIsLoggedIn(false);
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator>
          <Stack.Screen 
            name="Loading" 
            component={LoadingScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {isLoggedIn ? (
          // User is logged in - show appropriate screen based on user type
          userData?.loginType === "authority" ? (
            <Stack.Screen name="Authority" options={{ headerShown: false }}>
              {(props) => (
                <AuthorityScreen
                  {...props}
                  userData={userData}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {(props) => (
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
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}

        {/* Common screens accessible from both user types */}
        <Stack.Screen
          name="Database"
          options={{
            headerShown: true,
            title: "Database",
            headerStyle: {
              backgroundColor: "#1a73e8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {(props) => <DatabaseScreen {...props} userData={userData} />}
        </Stack.Screen>

        <Stack.Screen
          name="UserDatabase"
          options={{
            headerShown: true,
            title: "My Reports",
            headerStyle: {
              backgroundColor: "#1a73e8",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {(props) => <UserDatabaseScreen {...props} userData={userData} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simple loading screen component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
    </View>
  );
}

// Add these imports at the top if not already present
