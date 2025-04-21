import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const DashboardScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { trips, userRank, loading, getUserFootprints } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [footprintData, setFootprintData] = useState(null);
  const [loadingFootprint, setLoadingFootprint] = useState(false);

  // Get current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Load footprint data for the last 7 days
  const loadFootprintData = async () => {
    try {
      setLoadingFootprint(true);

      // Calculate date range (last 7 days)
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const footprints = await getUserFootprints(startDate, endDate);
      setFootprintData(footprints);
    } catch (error) {
      console.error("Error loading footprint data:", error);
    } finally {
      setLoadingFootprint(false);
    }
  };

  useEffect(() => {
    loadFootprintData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFootprintData();
    setRefreshing(false);
  };

  // Calculate average footprint
  const calculateAverageFootprint = () => {
    if (!footprintData) return null;

    const footprintValues = Object.values(footprintData);
    if (footprintValues.length === 0) return null;

    const sum = footprintValues.reduce((acc, val) => acc + val, 0);
    return (sum / footprintValues.length).toFixed(2);
  };

  const averageFootprint = calculateAverageFootprint();

  // Get upcoming trips
  const upcomingTrips = trips
    .filter((trip) => new Date(trip.startDate) > today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {userProfile?.username || "Traveler"}!
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons
            name="leaf"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.statValue}>
            {averageFootprint ? `${averageFootprint} kg` : "N/A"}
          </Text>
          <Text style={styles.statLabel}>Avg. CO₂ (7 days)</Text>
        </Card>

        <Card style={styles.statCard}>
          <FontAwesome5 name="trophy" size={24} color={colors.secondary} />
          <Text style={styles.statValue}>
            {userRank ? `#${userRank}` : "N/A"}
          </Text>
          <Text style={styles.statLabel}>Leaderboard Rank</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="star" size={24} color={colors.secondary} />
          <Text style={styles.statValue}>
            {userProfile?.totalRewardPoints || 0}
          </Text>
          <Text style={styles.statLabel}>Reward Points</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("FootprintTab", { screen: "FootprintLog" })
          }
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color={colors.white}
            />
          </View>
          <Text style={styles.actionText}>Log Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Suggestions")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color={colors.white}
            />
          </View>
          <Text style={styles.actionText}>Find Eco Places</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("TripsTab", { screen: "CreateTrip" })
          }
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.info }]}>
            <FontAwesome5 name="route" size={24} color={colors.white} />
          </View>
          <Text style={styles.actionText}>Plan Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AIAssistant")}
        >
          <View
            style={[styles.actionIcon, { backgroundColor: colors.success }]}
          >
            <MaterialCommunityIcons
              name="robot"
              size={24}
              color={colors.white}
            />
          </View>
          <Text style={styles.actionText}>Eco Assistant</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Trips */}
      <View style={styles.upcomingTripsHeader}>
        <Text style={styles.sectionTitle}>Upcoming Trips</Text>
        <TouchableOpacity onPress={() => navigation.navigate("TripsTab")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading.trips ? (
        <Loading message="Loading trips..." />
      ) : upcomingTrips.length > 0 ? (
        upcomingTrips.map((trip) => (
          <Card
            key={trip.id}
            style={styles.tripCard}
            onPress={() =>
              navigation.navigate("TripsTab", {
                screen: "TripDetail",
                params: { tripId: trip.id },
              })
            }
          >
            <View style={styles.tripCardContent}>
              <View>
                <Text style={styles.tripDestination}>{trip.destination}</Text>
                <Text style={styles.tripDates}>
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </Text>
              </View>
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={colors.grey}
              />
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming trips</Text>
          <TouchableOpacity
            style={styles.createTripButton}
            onPress={() =>
              navigation.navigate("TripsTab", { screen: "CreateTrip" })
            }
          >
            <Text style={styles.createTripText}>Plan a Trip</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Eco Tips */}
      <Text style={styles.sectionTitle}>Eco Tip of the Day</Text>
      <Card style={styles.tipCard}>
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={24}
          color={colors.secondary}
          style={styles.tipIcon}
        />
        <Text style={styles.tipText}>
          Try using public transportation or biking during your next trip to
          reduce your carbon footprint.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.large,
    paddingBottom: spacing.medium,
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.large,
    marginBottom: spacing.large,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: "center",
    padding: spacing.small,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginHorizontal: spacing.large,
    marginBottom: spacing.medium,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.large,
    marginBottom: spacing.large,
  },
  actionButton: {
    width: "25%",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  actionText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text,
    textAlign: "center",
  },
  upcomingTripsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: spacing.large,
    marginBottom: spacing.small,
  },
  viewAllText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
  },
  tripCard: {
    marginHorizontal: spacing.large,
  },
  tripCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripDestination: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tripDates: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
  },
  emptyCard: {
    marginHorizontal: spacing.large,
    alignItems: "center",
    padding: spacing.large,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginBottom: spacing.medium,
  },
  createTripButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
  },
  createTripText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  tipCard: {
    marginHorizontal: spacing.large,
    marginBottom: spacing.large,
    flexDirection: "row",
    alignItems: "center",
  },
  tipIcon: {
    marginRight: spacing.medium,
  },
  tipText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
    flex: 1,
  },
});

export default DashboardScreen;
