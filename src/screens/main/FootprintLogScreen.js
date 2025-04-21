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
import Card from "../../components/common/Card";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const FootprintLogScreen = ({ route, navigation }) => {
  const { tripId } = route.params || {};
  const { logActivity } = useApp();

  const [activityType, setActivityType] = useState("transport");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Transport details
  const [transportMode, setTransportMode] = useState("car");
  const [distance, setDistance] = useState("");

  // Food details
  const [mealType, setMealType] = useState("vegetarian");
  const [mealCount, setMealCount] = useState("1");

  // Accommodation details
  const [accommodationType, setAccommodationType] = useState("hotel");
  const [nights, setNights] = useState("1");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const transportOptions = [
    { id: "car", name: "Car", icon: "car" },
    { id: "bus", name: "Bus", icon: "bus" },
    { id: "train", name: "Train", icon: "train" },
    { id: "plane", name: "Plane", icon: "plane" },
    { id: "bicycle", name: "Bicycle", icon: "bicycle" },
    { id: "walking", name: "Walking", icon: "walking" },
  ];

  const foodOptions = [
    { id: "meat", name: "Meat-based", icon: "drumstick-bite" },
    { id: "vegetarian", name: "Vegetarian", icon: "carrot" },
    { id: "vegan", name: "Vegan", icon: "leaf" },
    { id: "local", name: "Local Produce", icon: "store" },
  ];

  const accommodationOptions = [
    { id: "hotel", name: "Hotel", icon: "hotel" },
    { id: "hostel", name: "Hostel", icon: "bed" },
    { id: "camping", name: "Camping", icon: "campground" },
    { id: "eco_lodge", name: "Eco Lodge", icon: "leaf" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (activityType === "transport") {
      if (!distance || isNaN(distance) || parseFloat(distance) <= 0) {
        newErrors.distance = "Please enter a valid distance";
      }
    } else if (activityType === "food") {
      if (!mealCount || isNaN(mealCount) || parseInt(mealCount) <= 0) {
        newErrors.mealCount = "Please enter a valid number of meals";
      }
    } else if (activityType === "accommodation") {
      if (!nights || isNaN(nights) || parseInt(nights) <= 0) {
        newErrors.nights = "Please enter a valid number of nights";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogActivity = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let details = {};

      if (activityType === "transport") {
        details = {
          mode: transportMode,
          distance: parseFloat(distance),
        };
      } else if (activityType === "food") {
        details = {
          mealType,
          count: parseInt(mealCount),
        };
      } else if (activityType === "accommodation") {
        details = {
          type: accommodationType,
          nights: parseInt(nights),
        };
      }

      const activityData = {
        date: date.toISOString().split("T")[0],
        activityType,
        details,
        tripId,
      };

      const result = await logActivity(activityData);

      Alert.alert(
        "Activity Logged",
        `Your activity has been logged successfully. Carbon footprint: ${result.carbonFootprint.toFixed(
          2
        )} kg CO₂`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to log activity. Please try again.");
      console.error("Log activity error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderOptionButtons = (options, selectedOption, setOption) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedOption === option.id && styles.optionButtonActive,
            ]}
            onPress={() => setOption(option.id)}
          >
            <FontAwesome5
              name={option.icon}
              size={16}
              color={
                selectedOption === option.id ? colors.white : colors.primary
              }
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                selectedOption === option.id && styles.optionTextActive,
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Log Your Activity</Text>

      {/* Activity Type Selection */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Activity Type</Text>
        <View style={styles.activityTypeContainer}>
          <TouchableOpacity
            style={[
              styles.activityTypeButton,
              activityType === "transport" && styles.activityTypeButtonActive,
            ]}
            onPress={() => setActivityType("transport")}
          >
            <FontAwesome5
              name="car"
              size={20}
              color={
                activityType === "transport" ? colors.white : colors.primary
              }
            />
            <Text
              style={[
                styles.activityTypeText,
                activityType === "transport" && styles.activityTypeTextActive,
              ]}
            >
              Transport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.activityTypeButton,
              activityType === "food" && styles.activityTypeButtonActive,
            ]}
            onPress={() => setActivityType("food")}
          >
            <FontAwesome5
              name="utensils"
              size={20}
              color={activityType === "food" ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.activityTypeText,
                activityType === "food" && styles.activityTypeTextActive,
              ]}
            >
              Food
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.activityTypeButton,
              activityType === "accommodation" &&
                styles.activityTypeButtonActive,
            ]}
            onPress={() => setActivityType("accommodation")}
          >
            <FontAwesome5
              name="bed"
              size={20}
              color={
                activityType === "accommodation" ? colors.white : colors.primary
              }
            />
            <Text
              style={[
                styles.activityTypeText,
                activityType === "accommodation" &&
                  styles.activityTypeTextActive,
              ]}
            >
              Stay
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Date Selection */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={colors.primary}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </Card>

      {/* Activity Details */}
      {activityType === "transport" && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Transport Details</Text>
          <Text style={styles.sectionTitle}>Mode of Transport</Text>
          {renderOptionButtons(
            transportOptions,
            transportMode,
            setTransportMode
          )}

          <Input
            label="Distance (km)"
            value={distance}
            onChangeText={setDistance}
            placeholder="Enter distance in kilometers"
            keyboardType="numeric"
            error={errors.distance}
          />
        </Card>
      )}

      {activityType === "food" && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Food Details</Text>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          {renderOptionButtons(foodOptions, mealType, setMealType)}

          <Input
            label="Number of Meals"
            value={mealCount}
            onChangeText={setMealCount}
            placeholder="Enter number of meals"
            keyboardType="numeric"
            error={errors.mealCount}
          />
        </Card>
      )}

      {activityType === "accommodation" && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Accommodation Details</Text>
          <Text style={styles.sectionTitle}>Accommodation Type</Text>
          {renderOptionButtons(
            accommodationOptions,
            accommodationType,
            setAccommodationType
          )}

          <Input
            label="Number of Nights"
            value={nights}
            onChangeText={setNights}
            placeholder="Enter number of nights"
            keyboardType="numeric"
            error={errors.nights}
          />
        </Card>
      )}

      <Button
        title="Log Activity"
        onPress={handleLogActivity}
        loading={loading}
        style={styles.logButton}
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
    padding: spacing.medium,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.large,
    textAlign: "center",
  },
  card: {
    marginBottom: spacing.medium,
  },
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  activityTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityTypeButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.medium,
    marginHorizontal: spacing.xs,
  },
  activityTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  activityTypeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  activityTypeTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
    marginBottom: spacing.small,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.medium,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionIcon: {
    marginRight: spacing.xs,
  },
  optionText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
  },
  optionTextActive: {
    color: colors.white,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    padding: spacing.medium,
  },
  dateIcon: {
    marginRight: spacing.small,
  },
  dateText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
  },
  logButton: {
    marginTop: spacing.medium,
    marginBottom: spacing.large,
  },
});

export default FootprintLogScreen;
