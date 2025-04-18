import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { View, ActivityIndicator } from "react-native";
import { theme } from "../theme/colors";

const RootNavigator = () => {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize before rendering
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
