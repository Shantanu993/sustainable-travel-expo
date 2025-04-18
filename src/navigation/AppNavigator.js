import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import DashboardScreen from "../screens/main/DashboardScreen";
import TripsScreen from "../screens/main/TripsScreen";
import TripDetailScreen from "../screens/main/TripDetailScreen";
import CreateTripScreen from "../screens/main/CreateTripScreen";
import SuggestionsScreen from "../screens/main/SuggestionsScreen";
import FootprintLogScreen from "../screens/main/FootprintLogScreen";
import FootprintCalendarScreen from "../screens/main/FootprintCalendarScreen";
import AiAssistantScreen from "../screens/main/AiAssistantScreen";
import FriendsScreen from "../screens/main/FriendsScreen";
import LeaderboardScreen from "../screens/main/LeaderboardScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import { theme } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
      <Stack.Screen
        name="AIAssistant"
        component={AiAssistantScreen}
        options={{ title: "Eco Assistant" }}
      />
    </Stack.Navigator>
  );
};

// Trips Stack Navigator
const TripsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="MyTrips"
        component={TripsScreen}
        options={{ title: "My Trips" }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: "Trip Details" }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: "Create Trip" }}
      />
    </Stack.Navigator>
  );
};

// Footprint Stack Navigator
const FootprintStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="FootprintCalendar"
        component={FootprintCalendarScreen}
        options={{ title: "Carbon Calendar" }}
      />
      <Stack.Screen
        name="FootprintLog"
        component={FootprintLogScreen}
        options={{ title: "Log Activity" }}
      />
    </Stack.Navigator>
  );
};

// Social Stack Navigator
const SocialStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.grey,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsStack}
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="route" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FootprintTab"
        component={FootprintStack}
        options={{
          title: "Footprint",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="leaf" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SocialTab"
        component={SocialStack}
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
