import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useApp } from "../../context/AppContext";
import { Calendar } from "react-native-calendars";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const FootprintCalendarScreen = ({ route, navigation }) => {
  const { startDate, endDate } = route.params || {};
  const { getUserFootprints } = useApp();
  const [footprints, setFootprints] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate date range (default to current month if not provided)
  const today = new Date();
  const defaultStartDate =
    startDate ||
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const defaultEndDate =
    endDate ||
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

  useEffect(() => {
    loadFootprints(defaultStartDate, defaultEndDate);
  }, [defaultStartDate, defaultEndDate]);

  const loadFootprints = async (start, end) => {
    try {
      setLoading(true);
      const footprintData = await getUserFootprints(start, end);
      setFootprints(footprintData);

      // Select today if it's in the range and has data
      const todayStr = today.toISOString().split("T")[0];
      if (footprintData[todayStr]) {
        setSelectedDate(todayStr);
      }
    } catch (err) {
      console.error("Error loading footprints:", err);
      setError("Failed to load carbon footprint data");
    } finally {
      setLoading(false);
    }
  };

  // Get color based on footprint value
  const getFootprintColor = (value) => {
    if (!value) return colors.grey;

    // Define thresholds (these could be configured based on user averages)
    const lowThreshold = 5; // kg CO2
    const mediumThreshold = 15; // kg CO2

    if (value < lowThreshold) {
      return colors.footprintLow;
    } else if (value < mediumThreshold) {
      return colors.footprintMedium;
    } else {
      return colors.footprintHigh;
    }
  };

  // Prepare calendar marked dates
  const getMarkedDates = () => {
    const markedDates = {};

    Object.entries(footprints).forEach(([date, value]) => {
      const color = getFootprintColor(value);

      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: color,
          },
          text: {
            color: colors.white,
            fontWeight: "bold",
          },
        },
      };

      // Add selected state if this date is selected
      if (date === selectedDate) {
        markedDates[date].selected = true;
        markedDates[date].customStyles.container.borderWidth = 2;
        markedDates[date].customStyles.container.borderColor = colors.black;
      }
    });

    return markedDates;
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };

  // Get footprint description based on value
  const getFootprintDescription = (value) => {
    if (!value) return "No data";

    const lowThreshold = 5; // kg CO2
    const mediumThreshold = 15; // kg CO2

    if (value < lowThreshold) {
      return "Great! Your carbon footprint was low on this day.";
    } else if (value < mediumThreshold) {
      return "Your carbon footprint was moderate on this day.";
    } else {
      return "Your carbon footprint was high on this day. Consider more sustainable options.";
    }
  };

  if (loading) {
    return (
      <Loading fullScreen message="Loading your carbon footprint data..." />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carbon Footprint Calendar</Text>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Calendar
            style={styles.calendar}
            theme={{
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.text,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.grey,
              dotColor: colors.primary,
              selectedDotColor: colors.white,
              arrowColor: colors.primary,
              monthTextColor: colors.primary,
              indicatorColor: colors.primary,
            }}
            markingType={"custom"}
            markedDates={getMarkedDates()}
            onDayPress={handleDateSelect}
            enableSwipeMonths={true}
          />

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.footprintLow },
                ]}
              />
              <Text style={styles.legendText}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.footprintMedium },
                ]}
              />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.footprintHigh },
                ]}
              />
              <Text style={styles.legendText}>High</Text>
            </View>
          </View>

          {selectedDate && (
            <Card style={styles.detailCard}>
              <Text style={styles.selectedDate}>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>

              <View style={styles.footprintContainer}>
                <FontAwesome5
                  name="leaf"
                  size={24}
                  color={getFootprintColor(footprints[selectedDate])}
                  style={styles.footprintIcon}
                />
                <View>
                  <Text style={styles.footprintValue}>
                    {footprints[selectedDate]
                      ? `${footprints[selectedDate].toFixed(2)} kg CO₂`
                      : "No data"}
                  </Text>
                  <Text style={styles.footprintDescription}>
                    {getFootprintDescription(footprints[selectedDate])}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logButton}
                onPress={() =>
                  navigation.navigate("FootprintLog", { date: selectedDate })
                }
              >
                <Text style={styles.logButtonText}>
                  Log Activity for This Day
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.medium,
    textAlign: "center",
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: spacing.medium,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.medium,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.small,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  legendText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  detailCard: {
    marginBottom: spacing.medium,
  },
  selectedDate: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
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
  footprintValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  footprintDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.medium,
    alignItems: "center",
  },
  logButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.large,
  },
});

export default FootprintCalendarScreen;
