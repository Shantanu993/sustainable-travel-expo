import React, { useState } from "react";
import { StyleSheet, View, Text, Alert, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const validateForm = () => {
    if (!email) {
      setFormError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Email is invalid");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for instructions to reset your password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Reset Password Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive password reset instructions
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={formError}
        />

        <Button
          title="Send Reset Email"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.resetButton}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate("Login")}
          type="outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    marginBottom: spacing.large,
    textAlign: "center",
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.error,
    marginBottom: spacing.medium,
    textAlign: "center",
  },
  resetButton: {
    marginBottom: spacing.medium,
  },
});

export default ForgotPasswordScreen;
