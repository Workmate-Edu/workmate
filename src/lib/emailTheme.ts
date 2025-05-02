export const emailTheme = {
  colors: {
    // Primary Colors
    primary: "#0066FF", // Main brand color
    primaryLight: "#4D94FF",
    primaryDark: "#0047B3",

    // Secondary Colors 
    secondary: "#7C3AED", // Vibrant purple
    secondaryLight: "#9D6DF3",
    secondaryDark: "#5B21B6",

    // Background Colors
    background: "#F9FAFB",
    backgroundDark: "#1E293B",
    backgroundAccent: "#F0F7FF",

    // Text Colors
    text: "#1E293B",
    textMuted: "#64748B",
    textLight: "#FFFFFF",

    // Supporting Colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Border Colors
    border: "#E2E8F0",
    borderLight: "#F1F5F9"
  },

  spacing: {
    padding: {
      container: "40px 20px",
      content: "24px",
      button: "12px 24px"
    },
    borderRadius: {
      container: "12px",
      button: "6px",
      card: "8px"
    }
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px"
    },
    lineHeight: {
      tight: "1.2",
      base: "1.6",
      relaxed: "1.8"
    }
  }
}

export const baseEmailStyles = `
  body {
    font-family: ${emailTheme.typography.fontFamily};
    line-height: ${emailTheme.typography.lineHeight.base};
    background-color: ${emailTheme.colors.background};
    margin: 0;
    padding: 0;
  }

  .email-wrapper {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: ${emailTheme.spacing.borderRadius.container};
    overflow: hidden;
    margin: 20px auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .email-header {
    background-color: ${emailTheme.colors.primary};
    padding: ${emailTheme.spacing.padding.content};
    text-align: center;
    color: ${emailTheme.colors.textLight};
  }

  .email-content {
    padding: ${emailTheme.spacing.padding.content};
    color: ${emailTheme.colors.text};
  }

  .email-footer {
    padding: ${emailTheme.spacing.padding.content};
    background-color: ${emailTheme.colors.backgroundAccent};
    text-align: center;
    font-size: ${emailTheme.typography.fontSize.sm};
    color: ${emailTheme.colors.textMuted};
  }

  .button-primary {
    display: inline-block;
    padding: ${emailTheme.spacing.padding.button};
    background-color: ${emailTheme.colors.primary};
    color: ${emailTheme.colors.textLight} !important;
    text-decoration: none;
    border-radius: ${emailTheme.spacing.borderRadius.button};
    font-weight: 500;
    text-align: center;
  }

  .button-secondary {
    display: inline-block;
    padding: ${emailTheme.spacing.padding.button};
    background-color: ${emailTheme.colors.secondary};
    color: ${emailTheme.colors.textLight} !important;
    text-decoration: none;
    border-radius: ${emailTheme.spacing.borderRadius.button};
    font-weight: 500;
    text-align: center;
  }

  .info-card {
    background-color: ${emailTheme.colors.backgroundAccent};
    border-radius: ${emailTheme.spacing.borderRadius.card};
    padding: ${emailTheme.spacing.padding.content};
    margin: 16px 0;
  }

  @media only screen and (max-width: 600px) {
    .email-wrapper {
      width: 100% !important;
      margin: 0 !important;
    }

    .email-content {
      padding: 20px 16px !important;
    }

    .button-primary,
    .button-secondary {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
  }
`
