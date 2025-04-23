import { DefaultTheme as PaperDefaultTheme } from "react-native-paper";

export const colors = {
  primary: "#2E7D32", // Deep Green
  primaryLight: "#60ad5e",
  primaryDark: "#005005",
  secondary: "#FFA000", // Amber
  secondaryLight: "#ffd149",
  secondaryDark: "#c67100",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  error: "#B00020",
  text: "#212121",
  textLight: "#757575",
  white: "#FFFFFF",
  black: "#000000",
  grey: "#9E9E9E",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
  footprintLow: "#4CAF50", // Green for low carbon footprint
  footprintMedium: "#FFC107", // Amber for medium carbon footprint
  footprintHigh: "#F44336", // Red for high carbon footprint
};

export const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    onSurface: colors.text,
    disabled: colors.grey,
    placeholder: colors.textLight,
    backdrop: "rgba(0, 0, 0, 0.5)",
    notification: colors.secondary,
  },
  roundness: 8,
};
