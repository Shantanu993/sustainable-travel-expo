const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get AI advice for sustainable travel
exports.getAIAdvice = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to use the AI assistant."
    );
  }

  const { query } = data;

  if (!query) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Query is required."
    );
  }

  try {
    // Initialize the Gemini API with API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a context prompt for sustainable travel
    const contextPrompt = `You are a sustainable travel assistant. Your goal is to provide helpful, 
    environmentally-conscious advice for travelers. Focus on eco-friendly options, carbon footprint 
    reduction, and sustainable practices. The current date is ${
      new Date().toISOString().split("T")[0]
    }.`;

    // Combine context and user query
    const fullPrompt = `${contextPrompt}\n\nUser query: ${query}`;

    // Generate response from AI
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    return { response };
  } catch (error) {
    console.error("Error getting AI advice:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
