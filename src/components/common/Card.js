import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const Card = ({ children, style, onPress, elevation = 2 }) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, { elevation }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.medium,
    marginVertical: spacing.small,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Card;
