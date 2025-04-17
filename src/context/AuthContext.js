import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);

          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            // Cache user profile
            await AsyncStorage.setItem(
              "userProfile",
              JSON.stringify(userDoc.data())
            );
          }
        } else {
          setUser(null);
          setUserProfile(null);
          await AsyncStorage.removeItem("userProfile");
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Try to load cached user profile on startup
  useEffect(() => {
    const loadCachedProfile = async () => {
      try {
        const cachedProfile = await AsyncStorage.getItem("userProfile");
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
        }
      } catch (err) {
        console.error("Error loading cached profile:", err);
      }
    };

    loadCachedProfile();
  }, []);

  // Register a new user
  const register = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Firebase Auth onCreate trigger will create the user profile in Firestore
      // We'll update the display name
      await updateProfile(userCredential.user, { displayName: username });

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile in Firestore (uses Cloud Function)
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      // This will call the updateUserProfile Cloud Function
      const updateProfileFn = httpsCallable(functions, "updateUserProfile");
      await updateProfileFn(profileData);

      // Update local state
      setUserProfile((prev) => ({ ...prev, ...profileData }));

      // Update cache
      const cachedProfile = await AsyncStorage.getItem("userProfile");
      if (cachedProfile) {
        const updatedProfile = { ...JSON.parse(cachedProfile), ...profileData };
        await AsyncStorage.setItem(
          "userProfile",
          JSON.stringify(updatedProfile)
        );
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
