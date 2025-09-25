// App.js
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

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

  const auth = async(username, password, url)=>{
    try {
      const response = await fetch(
          url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: username, password }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        alert(errorData.message || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        alert(
          data.message ||
            "Authentication failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Network error during authentication:", error);
      alert("Cannot connect to server. Please check your internet connection.");
    }
  }
  const authenticateHandler = async (loginType, username, password) => {
    if(loginType==="citizen") auth(username, password,"https://noor-samsung.onrender.com/api/auth/citizen/login");
    if(loginType==="admin") auth(username, password,"https://noor-samsung.onrender.com/api/auth/admin/login");
  };

  const handleLogin = (userData) => {
    setUserData(userData);
    authenticateHandler(userData.loginType, userData.username, userData.password);
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
