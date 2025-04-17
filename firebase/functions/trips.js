const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Create a new trip
exports.createTrip = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a trip."
    );
  }

  const { destination, startDate, endDate, notes } = data;
  const userId = context.auth.uid;

  // Validate input
  if (!destination) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Destination is required."
    );
  }

  if (!startDate || !endDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Start and end dates are required."
    );
  }

  try {
    const tripData = {
      userId,
      destination,
      startDate,
      endDate,
      notes: notes || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const tripRef = await admin.firestore().collection("trips").add(tripData);

    return {
      success: true,
      tripId: tripRef.id,
      trip: { id: tripRef.id, ...tripData },
    };
  } catch (error) {
    console.error("Error creating trip:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Update a trip
exports.updateTrip = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to update a trip."
    );
  }

  const { tripId, destination, startDate, endDate, notes } = data;
  const userId = context.auth.uid;

  if (!tripId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Trip ID is required."
    );
  }

  try {
    // Check if trip exists and belongs to the user
    const tripDoc = await admin
      .firestore()
      .collection("trips")
      .doc(tripId)
      .get();

    if (!tripDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Trip not found.");
    }

    if (tripDoc.data().userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to update this trip."
      );
    }

    const updateData = {};
    if (destination) updateData.destination = destination;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore().collection("trips").doc(tripId).update(updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating trip:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Delete a trip
exports.deleteTrip = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to delete a trip."
    );
  }

  const { tripId } = data;
  const userId = context.auth.uid;

  if (!tripId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Trip ID is required."
    );
  }

  try {
    // Check if trip exists and belongs to the user
    const tripDoc = await admin
      .firestore()
      .collection("trips")
      .doc(tripId)
      .get();

    if (!tripDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Trip not found.");
    }

    if (tripDoc.data().userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to delete this trip."
      );
    }

    await admin.firestore().collection("trips").doc(tripId).delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get all trips for a user
exports.getTrips = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view trips."
    );
  }

  const userId = context.auth.uid;

  try {
    const tripsSnapshot = await admin
      .firestore()
      .collection("trips")
      .where("userId", "==", userId)
      .orderBy("startDate", "desc")
      .get();

    const trips = [];
    tripsSnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { trips };
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Get a specific trip by ID
exports.getTripById = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to view a trip."
    );
  }

  const { tripId } = data;
  const userId = context.auth.uid;

  if (!tripId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Trip ID is required."
    );
  }

  try {
    const tripDoc = await admin
      .firestore()
      .collection("trips")
      .doc(tripId)
      .get();

    if (!tripDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Trip not found.");
    }

    const tripData = tripDoc.data();

    // Check if trip belongs to the user
    if (tripData.userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to view this trip."
      );
    }

    return {
      trip: {
        id: tripDoc.id,
        ...tripData,
      },
    };
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
