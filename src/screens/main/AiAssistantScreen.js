import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useApp } from "../../context/AppContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const AiAssistantScreen = () => {
  const { getAIAdvice } = useApp();
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your sustainable travel assistant. Ask me anything about eco-friendly travel, carbon footprint reduction, or sustainable practices while traveling.",
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await getAIAdvice(userMessage.text);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI advice:", error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "ai",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <FontAwesome5 name="leaf" size={16} color={colors.white} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    const suggestions = [
      "How can I reduce my carbon footprint while traveling?",
      "What are the most eco-friendly transportation options?",
      "Suggest sustainable accommodations in popular destinations",
      "How can I support local communities while traveling?",
    ];

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
        <View style={styles.suggestionButtonsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => {
                setInputText(suggestion);
              }}
            >
              <Text style={styles.suggestionButtonText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No messages yet</Text>
        }
        ListHeaderComponent={messages.length <= 1 ? renderSuggestions() : null}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about sustainable travel..."
          placeholderTextColor={colors.textLight}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.disabledSendButton,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <FontAwesome5 name="paper-plane" size={16} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    padding: spacing.medium,
    paddingBottom: spacing.large,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: spacing.medium,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.small,
  },
  messageBubble: {
    borderRadius: 16,
    padding: spacing.medium,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
  },
  aiMessageBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    marginRight: spacing.small,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  disabledSendButton: {
    backgroundColor: colors.grey,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.large,
  },
  suggestionsContainer: {
    marginBottom: spacing.large,
  },
  suggestionsTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.small,
  },
  suggestionButtonsContainer: {
    flexDirection: "column",
  },
  suggestionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.small,
    marginBottom: spacing.small,
  },
  suggestionButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.primary,
  },
});

export default AiAssistantScreen;
