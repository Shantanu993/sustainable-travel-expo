import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useApp } from "../../context/AppContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { DateTimePicker } from "@react-native-community/datetimepicker";

const CreateTripScreen = ({ navigation }) => {
  const { createTrip } = useApp();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ); // Default to 1 week
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    if (endDate < startDate) {
      newErrors.dates = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const tripData = {
        destination: destination.trim(),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        notes: notes.trim(),
      };

      const result = await createTrip(tripData);

      if (result.success) {
        Alert.alert("Success", "Your trip has been created!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("MyTrips"),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create trip. Please try again.");
      console.error("Create trip error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);

      // If end date is before new start date, update end date
      if (endDate < selectedDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)); // Next day
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Plan Your Sustainable Trip</Text>

      <Input
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="Where are you going?"
        error={errors.destination}
      />

      <Text style={styles.label}>Trip Dates</Text>

      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={colors.primary}
            style={styles.dateIcon}
          />
          <View>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </View>
        </TouchableOpacity>

        <FontAwesome5
          name="arrow-right"
          size={16}
          color={colors.grey}
          style={styles.arrowIcon}
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={colors.primary}
            style={styles.dateIcon}
          />
          <View>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes or plans for your trip..."
        multiline
        numberOfLines={4}
      />

      <View style={styles.tipContainer}>
        <FontAwesome5
          name="lightbulb"
          size={16}
          color={colors.secondary}
          style={styles.tipIcon}
        />
        <Text style={styles.tipText}>
          Tip: After creating your trip, you can log activities and find
          eco-friendly options at your destination.
        </Text>
      </View>

      <Button
        title="Create Trip"
        onPress={handleCreateTrip}
        loading={loading}
        style={styles.createButton}
      />

      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        type="outline"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.large,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.large,
    textAlign: "center",
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.medium,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    padding: spacing.medium,
    flex: 1,
  },
  dateIcon: {
    marginRight: spacing.small,
  },
  arrowIcon: {
    marginHorizontal: spacing.small,
  },
  dateLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  dateValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.error,
    marginBottom: spacing.medium,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.large,
  },
  tipIcon: {
    marginRight: spacing.small,
  },
  tipText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
    flex: 1,
  },
  createButton: {
    marginBottom: spacing.medium,
  },
});

export default CreateTripScreen;
