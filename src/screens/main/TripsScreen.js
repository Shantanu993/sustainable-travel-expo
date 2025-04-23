import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const TripsScreen = ({ navigation }) => {
  const { trips, loading, error, deleteTrip } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  // Sort trips by start date (newest first)
  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  // Group trips by status (upcoming, ongoing, past)
  const today = new Date();

  const groupedTrips = sortedTrips.reduce(
    (acc, trip) => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);

      if (startDate > today) {
        acc.upcoming.push(trip);
      } else if (endDate < today) {
        acc.past.push(trip);
      } else {
        acc.ongoing.push(trip);
      }

      return acc;
    },
    { upcoming: [], ongoing: [], past: [] }
  );

  const handleDeleteTrip = (tripId) => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(tripId);
            } catch (err) {
              Alert.alert("Error", "Failed to delete trip. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderTripItem = ({ item }) => {
    const startDate = new Date(item.startDate).toLocaleDateString();
    const endDate = new Date(item.endDate).toLocaleDateString();

    return (
      <Card
        style={styles.tripCard}
        onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
      >
        <View style={styles.tripCardHeader}>
          <Text style={styles.tripDestination}>{item.destination}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteTrip(item.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <FontAwesome5 name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.tripCardContent}>
          <View style={styles.tripDatesContainer}>
            <FontAwesome5
              name="calendar-alt"
              size={16}
              color={colors.primary}
              style={styles.tripIcon}
            />
            <Text style={styles.tripDates}>
              {startDate} - {endDate}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.tripNotesContainer}>
              <FontAwesome5
                name="sticky-note"
                size={16}
                color={colors.secondary}
                style={styles.tripIcon}
              />
              <Text style={styles.tripNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderSectionHeader = (title, count) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  if (loading.trips && !refreshing) {
    return <Loading fullScreen message="Loading your trips..." />;
  }

  return (
    <View style={styles.container}>
      <Button
        title="Create New Trip"
        onPress={() => navigation.navigate("CreateTrip")}
        style={styles.createButton}
        icon={
          <FontAwesome5
            name="plus"
            size={16}
            color={colors.white}
            style={{ marginRight: 8 }}
          />
        }
      />

      {error.trips && (
        <Text style={styles.errorText}>Error loading trips: {error.trips}</Text>
      )}

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="route" size={50} color={colors.grey} />
          <Text style={styles.emptyText}>
            You haven't created any trips yet
          </Text>
          <Text style={styles.emptySubtext}>
            Start planning your sustainable adventures!
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            {
              type: "header",
              id: "ongoing",
              title: "Ongoing Trips",
              data: groupedTrips.ongoing,
            },
            ...groupedTrips.ongoing,
            {
              type: "header",
              id: "upcoming",
              title: "Upcoming Trips",
              data: groupedTrips.upcoming,
            },
            ...groupedTrips.upcoming,
            {
              type: "header",
              id: "past",
              title: "Past Trips",
              data: groupedTrips.past,
            },
            ...groupedTrips.past,
          ]}
          keyExtractor={(item) => (item.type === "header" ? item.id : item.id)}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return renderSectionHeader(item.title, item.data.length);
            }
            return renderTripItem({ item });
          }}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            // Refresh trips data
            setRefreshing(false);
          }}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  createButton: {
    margin: spacing.medium,
  },
  listContent: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.large,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    marginLeft: spacing.small,
  },
  countText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  tripCard: {
    marginBottom: spacing.medium,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.small,
  },
  tripDestination: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  tripCardContent: {
    marginTop: spacing.xs,
  },
  tripDatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.small,
  },
  tripIcon: {
    marginRight: spacing.small,
  },
  tripDates: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  tripNotesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tripNotes: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginTop: spacing.large,
    marginBottom: spacing.small,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    textAlign: "center",
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    margin: spacing.medium,
    textAlign: "center",
  },
});

export default TripsScreen;
