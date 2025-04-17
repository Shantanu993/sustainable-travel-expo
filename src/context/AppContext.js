import React, { createContext, useState, useContext, useEffect } from "react";
import { db, functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState({
    trips: false,
    friends: false,
    friendRequests: false,
    leaderboard: false,
  });
  const [error, setError] = useState({
    trips: null,
    friends: null,
    friendRequests: null,
    leaderboard: null,
  });

  // Fetch user trips
  useEffect(() => {
    if (!user) return;

    setLoading((prev) => ({ ...prev, trips: true }));

    const tripsQuery = query(
      collection(db, "trips"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripsData);
        setLoading((prev) => ({ ...prev, trips: false }));
        setError((prev) => ({ ...prev, trips: null }));
      },
      (err) => {
        console.error("Error fetching trips:", err);
        setError((prev) => ({ ...prev, trips: err.message }));
        setLoading((prev) => ({ ...prev, trips: false }));
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch friend requests
  useEffect(() => {
    if (!user) return;

    setLoading((prev) => ({ ...prev, friendRequests: true }));

    const getFriendRequests = async () => {
      try {
        const getFriendRequestsFn = httpsCallable(
          functions,
          "getFriendRequests"
        );
        const result = await getFriendRequestsFn();
        setFriendRequests(result.data.requests || []);
        setError((prev) => ({ ...prev, friendRequests: null }));
      } catch (err) {
        console.error("Error fetching friend requests:", err);
        setError((prev) => ({ ...prev, friendRequests: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, friendRequests: false }));
      }
    };

    getFriendRequests();

    // Set up a timer to refresh friend requests every 5 minutes
    const intervalId = setInterval(getFriendRequests, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Fetch friends list
  useEffect(() => {
    if (!user) return;

    setLoading((prev) => ({ ...prev, friends: true }));

    const getFriends = async () => {
      try {
        const getFriendsFn = httpsCallable(functions, "getFriends");
        const result = await getFriendsFn();
        setFriends(result.data.friends || []);
        setError((prev) => ({ ...prev, friends: null }));
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError((prev) => ({ ...prev, friends: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, friends: false }));
      }
    };

    getFriends();
  }, [user]);

  // Fetch leaderboard
  useEffect(() => {
    if (!user) return;

    setLoading((prev) => ({ ...prev, leaderboard: true }));

    const getLeaderboard = async () => {
      try {
        const getLeaderboardFn = httpsCallable(functions, "getLeaderboard");
        const result = await getLeaderboardFn({ limit: 20 });
        setLeaderboard(result.data.leaderboard || []);
        setUserRank(result.data.userRank);
        setError((prev) => ({ ...prev, leaderboard: null }));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError((prev) => ({ ...prev, leaderboard: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, leaderboard: false }));
      }
    };

    getLeaderboard();

    // Set up a timer to refresh leaderboard every 15 minutes
    const intervalId = setInterval(getLeaderboard, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Create a new trip
  const createTrip = async (tripData) => {
    try {
      const createTripFn = httpsCallable(functions, "createTrip");
      const result = await createTripFn(tripData);
      return result.data;
    } catch (err) {
      console.error("Error creating trip:", err);
      throw err;
    }
  };

  // Update a trip
  const updateTrip = async (tripId, tripData) => {
    try {
      const updateTripFn = httpsCallable(functions, "updateTrip");
      const result = await updateTripFn({ tripId, ...tripData });
      return result.data;
    } catch (err) {
      console.error("Error updating trip:", err);
      throw err;
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    try {
      const deleteTripFn = httpsCallable(functions, "deleteTrip");
      const result = await deleteTripFn({ tripId });
      return result.data;
    } catch (err) {
      console.error("Error deleting trip:", err);
      throw err;
    }
  };

  // Get eco-friendly suggestions
  const getEcoSuggestions = async (latitude, longitude, radius, type) => {
    try {
      const getEcoSuggestionsFn = httpsCallable(functions, "getEcoSuggestions");
      const result = await getEcoSuggestionsFn({
        latitude,
        longitude,
        radius,
        type,
      });
      return result.data.suggestions;
    } catch (err) {
      console.error("Error getting eco suggestions:", err);
      throw err;
    }
  };

  // Log activity and calculate carbon footprint
  const logActivity = async (activityData) => {
    try {
      const logActivityFn = httpsCallable(
        functions,
        "logActivityAndCalculateFootprint"
      );
      const result = await logActivityFn(activityData);
      return result.data;
    } catch (err) {
      console.error("Error logging activity:", err);
      throw err;
    }
  };

  // Get user footprints for a date range
  const getUserFootprints = async (startDate, endDate) => {
    try {
      const getUserFootprintsFn = httpsCallable(functions, "getUserFootprints");
      const result = await getUserFootprintsFn({ startDate, endDate });
      return result.data.footprints;
    } catch (err) {
      console.error("Error getting user footprints:", err);
      throw err;
    }
  };

  // Search for users
  const searchUsers = async (query) => {
    try {
      const searchUsersFn = httpsCallable(functions, "searchUsers");
      const result = await searchUsersFn({ query });
      return result.data.users;
    } catch (err) {
      console.error("Error searching users:", err);
      throw err;
    }
  };

  // Send friend request
  const sendFriendRequest = async (friendId) => {
    try {
      const sendFriendRequestFn = httpsCallable(functions, "sendFriendRequest");
      const result = await sendFriendRequestFn({ friendId });
      return result.data;
    } catch (err) {
      console.error("Error sending friend request:", err);
      throw err;
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const acceptFriendRequestFn = httpsCallable(
        functions,
        "acceptFriendRequest"
      );
      const result = await acceptFriendRequestFn({ requestId });
      return result.data;
    } catch (err) {
      console.error("Error accepting friend request:", err);
      throw err;
    }
  };

  // Decline friend request
  const declineFriendRequest = async (requestId) => {
    try {
      const declineFriendRequestFn = httpsCallable(
        functions,
        "declineFriendRequest"
      );
      const result = await declineFriendRequestFn({ requestId });
      return result.data;
    } catch (err) {
      console.error("Error declining friend request:", err);
      throw err;
    }
  };

  // Get AI advice
  const getAIAdvice = async (query) => {
    try {
      const getAIAdviceFn = httpsCallable(functions, "getAIAdvice");
      const result = await getAIAdviceFn({ query });
      return result.data.response;
    } catch (err) {
      console.error("Error getting AI advice:", err);
      throw err;
    }
  };

  const value = {
    trips,
    friends,
    friendRequests,
    leaderboard,
    userRank,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    getEcoSuggestions,
    logActivity,
    getUserFootprints,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getAIAdvice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
