import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const Button = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "text":
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "text":
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={type === "primary" ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.small,
  },
  mediumButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
  },
  largeButton: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
  },
  disabledButton: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeights.medium,
    fontSize: typography.sizes.medium,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textButtonText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textLight,
  },
});

export default Button;
