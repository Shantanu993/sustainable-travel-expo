const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import function modules
const authFunctions = require("./auth");
const tripFunctions = require("./trips");
const suggestionFunctions = require("./suggestions");
const footprintFunctions = require("./footprint");
const socialFunctions = require("./social");
const leaderboardFunctions = require("./leaderboard");
const aiAssistantFunctions = require("./aiAssistant");

// Export all functions
exports.createUserProfile = authFunctions.createUserProfile;
exports.updateUserProfile = authFunctions.updateUserProfile;

exports.createTrip = tripFunctions.createTrip;
exports.updateTrip = tripFunctions.updateTrip;
exports.deleteTrip = tripFunctions.deleteTrip;
exports.getTrips = tripFunctions.getTrips;
exports.getTripById = tripFunctions.getTripById;

exports.getEcoSuggestions = suggestionFunctions.getEcoSuggestions;

exports.logActivityAndCalculateFootprint =
  footprintFunctions.logActivityAndCalculateFootprint;
exports.getUserFootprints = footprintFunctions.getUserFootprints;

exports.searchUsers = socialFunctions.searchUsers;
exports.sendFriendRequest = socialFunctions.sendFriendRequest;
exports.respondToFriendRequest = socialFunctions.respondToFriendRequest;
exports.getFriends = socialFunctions.getFriends;

exports.getLeaderboard = leaderboardFunctions.getLeaderboard;
exports.updateLeaderboard = leaderboardFunctions.updateLeaderboard;

exports.getAIAdvice = aiAssistantFunctions.getAIAdvice;
