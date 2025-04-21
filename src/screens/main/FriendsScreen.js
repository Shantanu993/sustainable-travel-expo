import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
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

const FriendsScreen = ({ navigation }) => {
  const {
    friends,
    friendRequests,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("friends"); // 'friends', 'requests', 'search'

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      Alert.alert(
        "Search Error",
        "Please enter at least 3 characters to search"
      );
      return;
    }

    setSearching(true);

    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      Alert.alert("Search Error", err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      Alert.alert("Success", "Friend request sent successfully");

      // Remove user from search results
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      Alert.alert("Error", "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      Alert.alert("Success", "Friend request accepted");
    } catch (err) {
      Alert.alert("Error", "Failed to accept friend request");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineFriendRequest(requestId);
      Alert.alert("Success", "Friend request declined");
    } catch (err) {
      Alert.alert("Error", "Failed to decline friend request");
    }
  };

  const renderFriendItem = ({ item }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendInfo}>
        {item.profilePicUrl ? (
          <Image
            source={{ uri: item.profilePicUrl }}
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <FontAwesome5 name="user" size={20} color={colors.white} />
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.pointsContainer}>
            <FontAwesome5 name="leaf" size={12} color={colors.primary} />
            <Text style={styles.pointsText}>
              {item.totalRewardPoints || 0} points
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.viewProfileButton}
        onPress={() => navigation.navigate("Profile", { userId: item.id })}
      >
        <Text style={styles.viewProfileText}>View Profile</Text>
      </TouchableOpacity>
    </Card>
  );

  const renderRequestItem = ({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.friendInfo}>
        {item.sender.profilePicUrl ? (
          <Image
            source={{ uri: item.sender.profilePicUrl }}
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <FontAwesome5 name="user" size={20} color={colors.white} />
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.username}>{item.sender.username}</Text>
          <Text style={styles.requestText}>Sent you a friend request</Text>
        </View>
      </View>
      <View style={styles.requestButtons}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <FontAwesome5 name="check" size={16} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <FontAwesome5 name="times" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderSearchResultItem = ({ item }) => (
    <Card style={styles.searchResultCard}>
      <View style={styles.friendInfo}>
        {item.profilePicUrl ? (
          <Image
            source={{ uri: item.profilePicUrl }}
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <FontAwesome5 name="user" size={20} color={colors.white} />
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
      </View>
      <Button
        title="Add Friend"
        onPress={() => handleSendRequest(item.id)}
        size="small"
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Requests ({friendRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "search" && styles.activeTab]}
          onPress={() => setActiveTab("search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "search" && styles.activeTabText,
            ]}
          >
            Find Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === "friends" && (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            loading.friends ? (
              <Loading message="Loading friends..." />
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="users" size={50} color={colors.grey} />
                <Text style={styles.emptyText}>
                  You don't have any friends yet
                </Text>
                <TouchableOpacity
                  style={styles.findFriendsButton}
                  onPress={() => setActiveTab("search")}
                >
                  <Text style={styles.findFriendsText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}

      {activeTab === "requests" && (
        <FlatList
          data={friendRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            loading.friendRequests ? (
              <Loading message="Loading requests..." />
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="user-plus" size={50} color={colors.grey} />
                <Text style={styles.emptyText}>No pending friend requests</Text>
              </View>
            )
          }
        />
      )}

      {activeTab === "search" && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by username or email"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching || searchQuery.length < 3}
            >
              {searching ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <FontAwesome5 name="search" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              searching ? (
                <Loading message="Searching..." />
              ) : (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 name="search" size={50} color={colors.grey} />
                  <Text style={styles.emptyText}>
                    {searchQuery.length > 0
                      ? "No users found matching your search"
                      : "Search for users to add as friends"}
                  </Text>
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.medium,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  listContainer: {
    padding: spacing.medium,
  },
  friendCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profilePicPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.grey,
    justifyContent: "center",
    alignItems: "center",
  },
  friendDetails: {
    marginLeft: spacing.medium,
  },
  username: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  pointsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  viewProfileButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.medium,
    borderRadius: 16,
  },
  viewProfileText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.white,
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  requestButtons: {
    flexDirection: "row",
  },
  requestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.small,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  declineButton: {
    backgroundColor: colors.error,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    padding: spacing.medium,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
    marginRight: spacing.small,
  },
  searchButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emailText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
    marginTop: spacing.large,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.medium,
    marginBottom: spacing.medium,
  },
  findFriendsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
  },
  findFriendsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.white,
  },
});

export default FriendsScreen;
