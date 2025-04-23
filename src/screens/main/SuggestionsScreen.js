import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useApp } from "../../context/AppContext";
import MapView, { Marker } from "react-native-maps";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import * as Location from "expo-location";

const SuggestionsScreen = ({ route, navigation }) => {
  const { getEcoSuggestions } = useApp();
  const [location, setLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");

  const suggestionTypes = [
    { id: "all", name: "All", icon: "globe" },
    { id: "accommodation", name: "Stay", icon: "bed" },
    { id: "food", name: "Eat", icon: "utensils" },
    { id: "volunteer", name: "Volunteer", icon: "hands-helping" },
  ];

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (err) {
        setError("Error getting location");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchSuggestions();
    }
  }, [location, selectedType]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const result = await getEcoSuggestions(
        location.latitude,
        location.longitude,
        5000, // 5km radius
        selectedType === "all" ? null : selectedType
      );
      setSuggestions(result);
    } catch (err) {
      setError("Error fetching suggestions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <Card style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={12} color={colors.secondary} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.suggestionType}>{item.type}</Text>
      <Text style={styles.suggestionDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => {
          // Navigate to a detail screen or show more info
          Alert.alert("View Details", `Show more details for ${item.name}`);
        }}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <FontAwesome5 name="chevron-right" size={12} color={colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  if (loading && !suggestions.length) {
    return <Loading fullScreen message="Finding eco-friendly suggestions..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={fetchSuggestions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* User's current location marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              pinColor={colors.primary}
            />

            {/* Suggestion markers */}
            {suggestions.map((item) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.name}
                description={item.type}
                pinColor={
                  item.type === "accommodation"
                    ? colors.secondary
                    : item.type === "food"
                    ? colors.success
                    : colors.info
                }
              />
            ))}
          </MapView>
        </View>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                selectedType === type.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <FontAwesome5
                name={type.icon}
                size={16}
                color={selectedType === type.id ? colors.white : colors.primary}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedType === type.id && styles.filterTextActive,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="map-marked-alt"
                size={50}
                color={colors.grey}
              />
              <Text style={styles.emptyText}>No eco-friendly places found</Text>
              <Text style={styles.emptySubtext}>
                Try changing filters or location
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <Text style={styles.listTitle}>
            {suggestions.length} Eco-Friendly{" "}
            {selectedType !== "all"
              ? suggestionTypes.find((t) => t.id === selectedType).name
              : ""}{" "}
            Places Nearby
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 200,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  filterContainer: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.small,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterIcon: {
    marginRight: spacing.xs,
  },
  filterText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.medium,
  },
  listTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  suggestionCard: {
    marginBottom: spacing.medium,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  suggestionName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginLeft: spacing.xs / 2,
  },
  suggestionType: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
    textTransform: "capitalize",
    marginBottom: spacing.xs,
  },
  suggestionDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginBottom: spacing.small,
  },
  viewDetailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  viewDetailsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginTop: spacing.large,
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: "center",
    margin: spacing.large,
  },
});

export default SuggestionsScreen;
