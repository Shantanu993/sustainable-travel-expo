import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const LeaderboardScreen = ({ navigation }) => {
  const { leaderboard, userRank, loading, error } = useApp();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("all"); // 'all', 'month', 'week'

  // Find the current user in the leaderboard
  const currentUserEntry = leaderboard.find((entry) => entry.id === user.uid);

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.id === user.uid;
    const rank = index + 1;

    // Determine medal or rank number
    const renderRank = () => {
      if (rank === 1) {
        return <FontAwesome5 name="medal" size={24} color="#FFD700" />;
      } else if (rank === 2) {
        return <FontAwesome5 name="medal" size={24} color="#C0C0C0" />;
      } else if (rank === 3) {
        return <FontAwesome5 name="medal" size={24} color="#CD7F32" />;
      } else {
        return <Text style={styles.rankNumber}>{rank}</Text>;
      }
    };

    return (
      <Card
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
        ]}
      >
        <View style={styles.rankContainer}>{renderRank()}</View>

        <View style={styles.userInfo}>
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
          <Text
            style={[styles.username, isCurrentUser && styles.currentUsername]}
          >
            {item.username}
            {isCurrentUser && " (You)"}
          </Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{item.totalRewardPoints}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Eco Leaderboard</Text>

        <View style={styles.timeframeContainer}>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === "all" && styles.activeTimeframeButton,
            ]}
            onPress={() => setTimeframe("all")}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === "all" && styles.activeTimeframeText,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === "month" && styles.activeTimeframeButton,
            ]}
            onPress={() => setTimeframe("month")}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === "month" && styles.activeTimeframeText,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === "week" && styles.activeTimeframeButton,
            ]}
            onPress={() => setTimeframe("week")}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === "week" && styles.activeTimeframeText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User's rank card */}
      {currentUserEntry && (
        <Card style={styles.userRankCard}>
          <View style={styles.userRankInfo}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <View style={styles.userRankValueContainer}>
              <Text style={styles.userRankValue}>#{userRank}</Text>
              <Text style={styles.userRankTotal}>of {leaderboard.length}</Text>
            </View>
          </View>

          <View style={styles.userPointsInfo}>
            <Text style={styles.userPointsLabel}>Your Points</Text>
            <Text style={styles.userPointsValue}>
              {currentUserEntry.totalRewardPoints}
            </Text>
          </View>
        </Card>
      )}

      {loading.leaderboard ? (
        <Loading message="Loading leaderboard..." />
      ) : error.leaderboard ? (
        <Text style={styles.errorText}>{error.leaderboard}</Text>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="trophy" size={50} color={colors.grey} />
              <Text style={styles.emptyText}>
                No leaderboard data available
              </Text>
            </View>
          }
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
  headerContainer: {
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.medium,
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.xs,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.small,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTimeframeButton: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  activeTimeframeText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  userRankCard: {
    margin: spacing.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primaryLight,
  },
  userRankInfo: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.white,
    padding: spacing.small,
  },
  userRankLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userRankValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  userRankValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  userRankTotal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  userPointsInfo: {
    flex: 1,
    padding: spacing.small,
  },
  userPointsLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userPointsValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  listContainer: {
    padding: spacing.medium,
    paddingTop: 0,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.small,
  },
  currentUserItem: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rankContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.small,
  },
  rankNumber: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.small,
  },
  profilePicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.small,
  },
  username: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
  },
  currentUsername: {
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  pointsContainer: {
    alignItems: "center",
  },
  pointsValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  pointsLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
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
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: "center",
    margin: spacing.large,
  },
});

export default LeaderboardScreen;
