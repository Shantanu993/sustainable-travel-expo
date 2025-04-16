const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Create a user profile when a new user signs up
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split("@")[0],
      profilePicUrl: user.photoURL || null,
      totalRewardPoints: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("users").doc(user.uid).set(userProfile);

    // Also add user to leaderboard
    await admin.firestore().collection("leaderboard").doc(user.uid).set({
      userId: user.uid,
      username: userProfile.username,
      totalRewardPoints: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { error: error.message };
  }
});

// Update user profile
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to update your profile."
    );
  }

  const uid = context.auth.uid;
  const { username, profilePicUrl } = data;

  try {
    const updateData = {};

    if (username) updateData.username = username;
    if (profilePicUrl) updateData.profilePicUrl = profilePicUrl;

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore().collection("users").doc(uid).update(updateData);

    // Update username in leaderboard if changed
    if (username) {
      await admin.firestore().collection("leaderboard").doc(uid).update({
        username: username,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
