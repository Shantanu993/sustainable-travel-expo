const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Log activity and calculate carbon footprint
exports.logActivityAndCalculateFootprint = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to log activities."
      );
    }

    const userId = context.auth.uid;
    const {
      date,
      activityType, // transport, food, accommodation
      details, // specific details about the activity
      tripId, // optional, if associated with a trip
    } = data;

    if (!date || !activityType || !details) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Date, activity type, and details are required."
      );
    }

    try {
      // Get emission factors from configuration
      const configDoc = await admin
        .firestore()
        .collection("configuration")
        .doc("emissionFactors")
        .get();

      if (!configDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Emission factors configuration not found."
        );
      }

      const emissionFactors = configDoc.data();

      // Calculate carbon footprint based on activity type and details
      let carbonFootprint = 0;

      if (activityType === "transport") {
        const { mode, distance } = details;

        if (!mode || !distance) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Transport mode and distance are required for transport activities."
          );
        }

        const factor = emissionFactors.transport[mode] || 0;
        carbonFootprint = factor * distance;
      } else if (activityType === "food") {
        const { mealType, count } = details;

        if (!mealType) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Meal type is required for food activities."
          );
        }

        const factor = emissionFactors.food[mealType] || 0;
        carbonFootprint = factor * (count || 1);
      } else if (activityType === "accommodation") {
        const { type, nights } = details;

        if (!type) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Accommodation type is required for accommodation activities."
          );
        }

        const factor = emissionFactors.accommodation[type] || 0;
        carbonFootprint = factor * (nights || 1);
      }

      // Save activity log
      const activityData = {
        userId,
        date,
        activityType,
        details,
        carbonFootprint,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (tripId) {
        activityData.tripId = tripId;
      }

      const activityRef = await admin
        .firestore()
        .collection("activityLogs")
        .add(activityData);

      // Update or create daily footprint aggregate
      const dateStr = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
      const dailyFootprintRef = admin
        .firestore()
        .collection("dailyFootprints")
        .doc(`${userId}_${dateStr}`);

      const dailyFootprintDoc = await dailyFootprintRef.get();

      if (dailyFootprintDoc.exists) {
        // Update existing daily footprint
        await dailyFootprintRef.update({
          totalFootprint: admin.firestore.FieldValue.increment(carbonFootprint),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Create new daily footprint
        await dailyFootprintRef.set({
          userId,
          date: dateStr,
          totalFootprint: carbonFootprint,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Award reward points for logging activity
      const userRef = admin.firestore().collection("users").doc(userId);
      await userRef.update({
        totalRewardPoints: admin.firestore.FieldValue.increment(10), // 10 points for logging an activity
      });

      // Update leaderboard
      await admin
        .firestore()
        .collection("leaderboard")
        .doc(userId)
        .update({
          totalRewardPoints: admin.firestore.FieldValue.increment(10),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        activityId: activityRef.id,
        carbonFootprint,
      };
    } catch (error) {
      console.error("Error logging activity:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

// Get user footprints for a date range
exports.getUserFootprints = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view footprints."
    );
  }

  const userId = context.auth.uid;
  const { startDate, endDate } = data;

  if (!startDate || !endDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Start and end dates are required."
    );
  }

  try {
    const footprintsSnapshot = await admin
      .firestore()
      .collection("dailyFootprints")
      .where("userId", "==", userId)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .get();

    const footprints = {};
    footprintsSnapshot.forEach((doc) => {
      const data = doc.data();
      footprints[data.date] = data.totalFootprint;
    });

    return { footprints };
  } catch (error) {
    console.error("Error fetching footprints:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
