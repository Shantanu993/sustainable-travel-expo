import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { AppProvider } from "../src/context/AppContext";
import RootNavigator from "../src/navigation/RootNavigator";
import { PaperProvider } from "react-native-paper";
import { theme } from "../src/theme/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AppProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
