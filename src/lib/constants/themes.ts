type ThemeColor = "light" | "dark";

export type ThemeColors = {
  background: string;
  foreground: string;
  primary: string;
  muted: string;
  heading: string;
};

export const THEMES: Record<ThemeColor, ThemeColors> = {
  light: {
    background: "#f5f5f7",
    foreground: "#2e2e2e",
    primary: "#c63031",
    muted: "#bdbdbd",
    heading: "#2e2e2e",
  },
  dark: {
    background: "#353535",
    foreground: "#ffffff",
    primary: "#c63031",
    muted: "#757575",
    heading: "#ffffff",
  },
} as const;
