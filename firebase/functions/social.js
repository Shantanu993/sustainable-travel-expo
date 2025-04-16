const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Search for users by username or email
exports.searchUsers = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to search for users."
    );
  }

  const { query } = data;
  const userId = context.auth.uid;

  if (!query || query.length < 3) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Search query must be at least 3 characters long."
    );
  }

  try {
    // Search by username (case insensitive)
    const usernameSnapshot = await admin
      .firestore()
      .collection("users")
      .where("username", ">=", query)
      .where("username", "<=", query + "\uf8ff")
      .limit(10)
      .get();

    // Search by email (case insensitive)
    const emailSnapshot = await admin
      .firestore()
      .collection("users")
      .where("email", ">=", query)
      .where("email", "<=", query + "\uf8ff")
      .limit(10)
      .get();

    const results = [];

    // Process username results
    usernameSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (doc.id !== userId) {
        // Don't include the current user
        results.push({
          id: doc.id,
          username: userData.username,
          email: userData.email,
          profilePicUrl: userData.profilePicUrl,
        });
      }
    });

    // Process email results and avoid duplicates
    emailSnapshot.forEach((doc) => {
      if (doc.id !== userId && !results.some((user) => user.id === doc.id)) {
        const userData = doc.data();
        results.push({
          id: doc.id,
          username: userData.username,
          email: userData.email,
          profilePicUrl: userData.profilePicUrl,
        });
      }
    });

    return { users: results };
  } catch (error) {
    console.error("Error searching users:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
// Send a friend request
exports.sendFriendRequest = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to send friend requests."
    );
  }

  const userId = context.auth.uid;
  const { friendId } = data;

  if (!friendId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Friend ID is required."
    );
  }

  try {
    // Check if friendId exists
    const friendDoc = await admin
      .firestore()
      .collection("users")
      .doc(friendId)
      .get();
    if (!friendDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Friend not found.");
    }

    // Create a friend request document
    await admin.firestore().collection("friendRequests").add({
      senderId: userId,
      receiverId: friendId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Accept a friend request
exports.acceptFriendRequest = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to accept friend requests."
    );
  }

  const userId = context.auth.uid;
  const { requestId } = data;

  if (!requestId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Request ID is required."
    );
  }

  try {
    // Get the friend request document
    const requestDoc = await admin
      .firestore()
      .collection("friendRequests")
      .doc(requestId)
      .get();
    if (!requestDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Friend request not found."
      );
    }

    const requestData = requestDoc.data();
    if (requestData.receiverId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to accept this request."
      );
    }

    // Create a friendship document
    await admin.firestore().collection("friendships").add({
      user1Id: requestData.senderId,
      user2Id: userId,
      status: "accepted",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Delete the friend request document
    await admin
      .firestore()
      .collection("friendRequests")
      .doc(requestId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Decline a friend request
exports.declineFriendRequest = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to decline friend requests."
    );
  }

  const userId = context.auth.uid;
  const { requestId } = data;

  if (!requestId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Request ID is required."
    );
  }

  try {
    // Get the friend request document
    const requestDoc = await admin
      .firestore()
      .collection("friendRequests")
      .doc(requestId)
      .get();
    if (!requestDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Friend request not found."
      );
    }

    const requestData = requestDoc.data();
    if (requestData.receiverId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to decline this request."
      );
    }

    // Delete the friend request document
    await admin
      .firestore()
      .collection("friendRequests")
      .doc(requestId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error("Error declining friend request:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get friend requests for a user
exports.getFriendRequests = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view friend requests."
    );
  }

  const userId = context.auth.uid;

  try {
    // Get incoming friend requests
    const requestsSnapshot = await admin
      .firestore()
      .collection("friendRequests")
      .where("receiverId", "==", userId)
      .where("status", "==", "pending")
      .get();

    const requests = [];

    // For each request, get the sender's details
    const userPromises = [];
    requestsSnapshot.forEach((doc) => {
      const requestData = doc.data();
      userPromises.push(
        admin
          .firestore()
          .collection("users")
          .doc(requestData.senderId)
          .get()
          .then((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              requests.push({
                id: doc.id,
                sender: {
                  id: userDoc.id,
                  username: userData.username,
                  profilePicUrl: userData.profilePicUrl,
                },
                createdAt: requestData.createdAt,
              });
            }
          })
      );
    });

    await Promise.all(userPromises);

    return { requests };
  } catch (error) {
    console.error("Error getting friend requests:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get friends list
exports.getFriends = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view friends."
    );
  }

  const userId = context.auth.uid;

  try {
    // Get friendships where user is either user1 or user2
    const friendships1 = await admin
      .firestore()
      .collection("friendships")
      .where("user1Id", "==", userId)
      .where("status", "==", "accepted")
      .get();

    const friendships2 = await admin
      .firestore()
      .collection("friendships")
      .where("user2Id", "==", userId)
      .where("status", "==", "accepted")
      .get();

    const friendIds = new Set();

    // Extract friend IDs from friendships
    friendships1.forEach((doc) => {
      friendIds.add(doc.data().user2Id);
    });

    friendships2.forEach((doc) => {
      friendIds.add(doc.data().user1Id);
    });

    // Get friend details
    const friends = [];
    const userPromises = [];

    friendIds.forEach((friendId) => {
      userPromises.push(
        admin
          .firestore()
          .collection("users")
          .doc(friendId)
          .get()
          .then((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              friends.push({
                id: userDoc.id,
                username: userData.username,
                profilePicUrl: userData.profilePicUrl,
                totalRewardPoints: userData.totalRewardPoints || 0,
              });
            }
          })
      );
    });

    await Promise.all(userPromises);

    return { friends };
  } catch (error) {
    console.error("Error getting friends:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
