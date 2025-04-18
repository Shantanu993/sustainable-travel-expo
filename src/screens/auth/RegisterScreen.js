import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const RegisterScreen = ({ navigation }) => {
  const { register, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(email, password, username);
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Registration Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join our community of eco-conscious travelers
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          autoCapitalize="none"
          error={formErrors.username}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={formErrors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
          error={formErrors.password}
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          error={formErrors.confirmPassword}
        />

        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </View>
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
  registerButton: {
    marginTop: spacing.medium,
    marginBottom: spacing.large,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  loginLink: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
});

export default RegisterScreen;
