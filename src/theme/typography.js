import { Platform } from "react-native";

export const typography = {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  fontWeights: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
  sizes: {
    xs: 12,
    small: 14,
    medium: 16,
    large: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};
