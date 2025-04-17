import React from "react";
import { StyleSheet, View, TextInput, Text } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  style,
  inputStyle,
  labelStyle,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.errorInput,
          disabled && styles.disabledInput,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.medium,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: colors.error,
  },
  disabledInput: {
    backgroundColor: colors.background,
    color: colors.textLight,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;
