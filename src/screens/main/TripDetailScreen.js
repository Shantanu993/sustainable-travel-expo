import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
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

const TripDetailScreen = ({ route, navigation }) => {
  const { tripId } = route.params;
  const { trips, loading, error, deleteTrip, getUserFootprints } = useApp();
  const [trip, setTrip] = useState(null);
  const [footprints, setFootprints] = useState({});

  useEffect(() => {
    const currentTrip = trips.find((t) => t.id === tripId);
    if (currentTrip) {
      setTrip(currentTrip);
      loadFootprints(currentTrip);
    }
  }, [tripId, trips]);

  const loadFootprints = async (currentTrip) => {
    try {
      const footprintData = await getUserFootprints(
        currentTrip.startDate,
        currentTrip.endDate
      );
      setFootprints(footprintData);
    } catch (err) {
      console.error("Error loading footprints:", err);
    }
  };

  const handleDeleteTrip = () => {
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
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", "Failed to delete trip. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading.trips) {
    return <Loading fullScreen message="Loading trip details..." />;
  }

  if (error.trips) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading trip: {error.trips}</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const calculateTotalFootprint = () => {
    return Object.values(footprints).reduce((sum, value) => sum + value, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.tripCard}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <View style={styles.dateContainer}>
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={colors.primary}
            style={styles.icon}
          />
          <Text style={styles.dates}>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.duration}>
          {duration} {duration === 1 ? "day" : "days"}
        </Text>
        {trip.notes && (
          <View style={styles.notesContainer}>
            <FontAwesome5
              name="sticky-note"
              size={16}
              color={colors.secondary}
              style={styles.icon}
            />
            <Text style={styles.notes}>{trip.notes}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.footprintCard}>
        <Text style={styles.cardTitle}>Carbon Footprint</Text>
        <View style={styles.footprintContainer}>
          <FontAwesome5
            name="leaf"
            size={24}
            color={colors.primary}
            style={styles.footprintIcon}
          />
          <View>
            <Text style={styles.footprintTotal}>
              {calculateTotalFootprint().toFixed(2)} kg CO₂
            </Text>
            <Text style={styles.footprintLabel}>Total for this trip</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() =>
            navigation.navigate("FootprintTab", {
              screen: "FootprintCalendar",
              params: { startDate: trip.startDate, endDate: trip.endDate },
            })
          }
        >
          <Text style={styles.viewDetailsText}>View Daily Breakdown</Text>
          <FontAwesome5 name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          title="Log Activity"
          onPress={() =>
            navigation.navigate("FootprintTab", {
              screen: "FootprintLog",
              params: { tripId: trip.id },
            })
          }
          icon={
            <FontAwesome5
              name="plus"
              size={16}
              color={colors.white}
              style={{ marginRight: 8 }}
            />
          }
          style={styles.actionButton}
        />
        <Button
          title="Find Eco Places"
          onPress={() =>
            navigation.navigate("Suggestions", { tripId: trip.id })
          }
          icon={
            <FontAwesome5
              name="map-marker-alt"
              size={16}
              color={colors.white}
              style={{ marginRight: 8 }}
            />
          }
          style={styles.actionButton}
        />
      </View>

      <Button
        title="Edit Trip"
        onPress={() => navigation.navigate("CreateTrip", { tripId: trip.id })}
        type="outline"
        style={styles.editButton}
      />

      <Button
        title="Delete Trip"
        onPress={handleDeleteTrip}
        type="text"
        textStyle={styles.deleteButtonText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tripCard: {
    margin: spacing.medium,
  },
  destination: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.small,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: spacing.small,
  },
  dates: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  duration: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.secondary,
    marginBottom: spacing.small,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.small,
  },
  notes: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
    flex: 1,
  },
  footprintCard: {
    margin: spacing.medium,
  },
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  footprintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  footprintIcon: {
    marginRight: spacing.medium,
  },
  footprintTotal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  footprintLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
  },
  viewDetailsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  editButton: {
    marginHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  deleteButtonText: {
    color: colors.error,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: "center",
    margin: spacing.large,
  },
});

export default TripDetailScreen;
