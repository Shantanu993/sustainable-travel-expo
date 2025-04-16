const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Get leaderboard data
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view the leaderboard."
    );
  }

  const { limit = 20 } = data;

  try {
    // Get top users by reward points
    const leaderboardSnapshot = await admin
      .firestore()
      .collection("leaderboard")
      .orderBy("totalRewardPoints", "desc")
      .limit(limit)
      .get();

    const leaderboard = [];
    leaderboardSnapshot.forEach((doc) => {
      const userData = doc.data();
      leaderboard.push({
        id: doc.id,
        username: userData.username,
        totalRewardPoints: userData.totalRewardPoints,
        profilePicUrl: userData.profilePicUrl,
      });
    });

    // Get current user's rank
    const userId = context.auth.uid;
    const userDoc = await admin
      .firestore()
      .collection("leaderboard")
      .doc(userId)
      .get();

    let userRank = null;
    if (userDoc.exists) {
      const userPoints = userDoc.data().totalRewardPoints;

      // Count users with more points
      const higherRankedSnapshot = await admin
        .firestore()
        .collection("leaderboard")
        .where("totalRewardPoints", ">", userPoints)
        .count()
        .get();

      userRank = higherRankedSnapshot.data().count + 1;
    }

    return {
      leaderboard,
      userRank,
    };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Update leaderboard (scheduled function)
exports.updateLeaderboard = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await admin.firestore().collection("users").get();

      const batch = admin.firestore().batch();

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const leaderboardRef = admin
          .firestore()
          .collection("leaderboard")
          .doc(doc.id);

        batch.set(
          leaderboardRef,
          {
            userId: doc.id,
            username: userData.username,
            totalRewardPoints: userData.totalRewardPoints || 0,
            profilePicUrl: userData.profilePicUrl,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      });

      await batch.commit();

      return null;
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      return null;
    }
  });
