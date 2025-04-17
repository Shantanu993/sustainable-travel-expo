const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Get eco-friendly suggestions based on location
exports.getEcoSuggestions = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to get suggestions."
    );
  }

  const { latitude, longitude, radius = 5000, type } = data;

  if (!latitude || !longitude) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Latitude and longitude are required."
    );
  }

  try {
    // Check if we have cached results for this location and type
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(
      3
    )}_${radius}_${type || "all"}`;
    const cacheDoc = await admin
      .firestore()
      .collection("suggestionCache")
      .doc(cacheKey)
      .get();

    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const cacheTime = cacheData.timestamp.toDate();
      const currentTime = new Date();

      // If cache is less than 24 hours old, return cached results
      if (currentTime - cacheTime < 24 * 60 * 60 * 1000) {
        return { suggestions: cacheData.suggestions };
      }
    }

    // If no valid cache, fetch from external API
    // This is a placeholder for the actual API call
    // In a real implementation, you would call a specific eco-friendly POI API

    // Example using OpenStreetMap Overpass API (simplified)
    let query = "";
    if (type === "accommodation") {
      query = `
        [out:json];
        (
          node["tourism"="hotel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          node["tourism"="hostel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          way["tourism"="hotel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          way["tourism"="hostel"]["eco"="yes"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    } else if (type === "food") {
      query = `
        [out:json];
        (
          node["amenity"="restaurant"]["organic"="yes"](around:${radius},${latitude},${longitude});
          node["amenity"="cafe"]["organic"="yes"](around:${radius},${latitude},${longitude});
          way["amenity"="restaurant"]["organic"="yes"](around:${radius},${latitude},${longitude});
          way["amenity"="cafe"]["organic"="yes"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    } else if (type === "volunteer") {
      query = `
        [out:json];
        (
          node["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          node["office"="ngo"](around:${radius},${latitude},${longitude});
          way["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          way["office"="ngo"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    } else {
      // All types
      query = `
        [out:json];
        (
          node["tourism"="hotel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          node["tourism"="hostel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          node["amenity"="restaurant"]["organic"="yes"](around:${radius},${latitude},${longitude});
          node["amenity"="cafe"]["organic"="yes"](around:${radius},${latitude},${longitude});
          node["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          node["office"="ngo"](around:${radius},${latitude},${longitude});
          way["tourism"="hotel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          way["tourism"="hostel"]["eco"="yes"](around:${radius},${latitude},${longitude});
          way["amenity"="restaurant"]["organic"="yes"](around:${radius},${latitude},${longitude});
          way["amenity"="cafe"]["organic"="yes"](around:${radius},${latitude},${longitude});
          way["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          way["office"="ngo"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    }

    // In a real implementation, you would make the API call:
    // const response = await axios.post('https://overpass-api.de/api/interpreter', query);
    // const results = response.data;

    // For this example, we'll return mock data
    const mockSuggestions = [
      {
        id: "1",
        name: "Eco-Friendly Hotel",
        type: "accommodation",
        description: "Solar-powered hotel with organic bedding",
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        rating: 4.5,
        image: "https://example.com/eco-hotel.jpg",
      },
      {
        id: "2",
        name: "Organic Cafe",
        type: "food",
        description: "Local, seasonal, and organic ingredients",
        latitude: latitude - 0.01,
        longitude: longitude - 0.01,
        rating: 4.8,
        image: "https://example.com/organic-cafe.jpg",
      },
      {
        id: "3",
        name: "Wildlife Conservation Center",
        type: "volunteer",
        description: "Help protect local wildlife",
        latitude: latitude + 0.02,
        longitude: longitude - 0.02,
        rating: 4.9,
        image: "https://example.com/conservation.jpg",
      },
    ];

    // Filter by type if specified
    const suggestions = type
      ? mockSuggestions.filter((s) => s.type === type)
      : mockSuggestions;

    // Cache the results
    await admin
      .firestore()
      .collection("suggestionCache")
      .doc(cacheKey)
      .set({
        suggestions,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        location: new admin.firestore.GeoPoint(latitude, longitude),
        radius,
        type: type || "all",
      });

    return { suggestions };
  } catch (error) {
    console.error("Error fetching eco suggestions:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
