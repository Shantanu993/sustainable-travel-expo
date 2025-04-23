import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const { getUserFootprints } = useApp();

  const [profile, setProfile] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [footprintStats, setFootprintStats] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Determine if viewing own profile or another user's
        if (userId && userId !== user.uid) {
          setIsCurrentUser(false);

          // Fetch other user's profile
          const userDoc = await getDoc(doc(db, "users", userId));

          if (userDoc.exists()) {
            setProfile(userDoc.data());
          } else {
            setError("User not found");
          }
        } else {
          // Use current user's profile
          setIsCurrentUser(true);
          setProfile(userProfile);
          setUsername(userProfile?.username || "");
          setProfilePicUrl(userProfile?.profilePicUrl || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, user, userProfile]);

  useEffect(() => {
    // Load footprint stats for the user
    const loadFootprintStats = async () => {
      try {
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const startDate = lastMonth.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];

        const footprints = await getUserFootprints(startDate, endDate);

        // Calculate average and total
        const footprintValues = Object.values(footprints);

        if (footprintValues.length > 0) {
          const total = footprintValues.reduce((sum, value) => sum + value, 0);
          const average = total / footprintValues.length;

          setFootprintStats({
            total: total.toFixed(2),
            average: average.toFixed(2),
            count: footprintValues.length,
          });
        }
      } catch (err) {
        console.error("Error loading footprint stats:", err);
      }
    };

    if (isCurrentUser && profile) {
      loadFootprintStats();
    }
  }, [isCurrentUser, profile]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      await updateUserProfile({
        username,
        profilePicUrl,
      });

      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile?.profilePicUrl ? (
          <Image
            source={{ uri: profile.profilePicUrl }}
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <FontAwesome5 name="user" size={40} color={colors.white} />
          </View>
        )}

        {editMode ? (
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            style={styles.usernameInput}
          />
        ) : (
          <Text style={styles.username}>{profile?.username}</Text>
        )}

        {editMode ? (
          <Input
            value={profilePicUrl}
            onChangeText={setProfilePicUrl}
            placeholder="Enter profile picture URL"
            style={styles.profileUrlInput}
          />
        ) : null}

        {isCurrentUser && (
          <View style={styles.actionButtons}>
            {editMode ? (
              <>
                <Button
                  title="Save"
                  onPress={handleSaveProfile}
                  style={styles.actionButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => setEditMode(false)}
                  type="outline"
                  style={styles.actionButton}
                />
              </>
            ) : (
              <>
                <Button
                  title="Edit Profile"
                  onPress={() => setEditMode(true)}
                  style={styles.actionButton}
                />
                <Button
                  title="Logout"
                  onPress={handleLogout}
                  type="outline"
                  style={styles.actionButton}
                />
              </>
            )}
          </View>
        )}
      </View>

      {/* Stats Section */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Eco Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile?.totalRewardPoints || 0}
            </Text>
            <Text style={styles.statLabel}>Reward Points</Text>
          </View>

          {isCurrentUser && footprintStats && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{footprintStats.average}</Text>
                <Text style={styles.statLabel}>Avg. CO₂ (kg)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{footprintStats.count}</Text>
                <Text style={styles.statLabel}>Activities</Text>
              </View>
            </>
          )}
        </View>
      </Card>

      {/* Recent Activities Section (for current user only) */}
      {isCurrentUser && (
        <Card style={styles.activitiesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("FootprintTab")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* This would be populated with actual activity data */}
          <Text style={styles.emptyText}>No recent activities to display</Text>
        </Card>
      )}

      {/* Recent Trips Section (for current user only) */}
      {isCurrentUser && (
        <Card style={styles.tripsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate("TripsTab")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* This would be populated with actual trip data */}
          <Text style={styles.emptyText}>No recent trips to display</Text>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    padding: spacing.large,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.medium,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  username: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  usernameInput: {
    width: "100%",
    marginBottom: spacing.small,
  },
  profileUrlInput: {
    width: "100%",
    marginBottom: spacing.medium,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statsCard: {
    margin: spacing.medium,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.grey,
  },
  activitiesCard: {
    margin: spacing.medium,
    marginTop: 0,
  },
  tripsCard: {
    margin: spacing.medium,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  viewAllText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    textAlign: "center",
    padding: spacing.medium,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: "center",
    margin: spacing.large,
  },
});

export default ProfileScreen;
