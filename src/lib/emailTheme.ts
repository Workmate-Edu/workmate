// Email-safe equivalents of the light theme in src/app/globals.css.
// Inter matches src/app/layout.tsx; fallback fonts work without web-font support.
export const emailTheme = {
  colors: {
    primary: '#F4A300',
    primaryLight: '#FFF4D6',
    primaryDark: '#A66F00',
    secondary: '#7C3AED',
    secondaryLight: '#EDE9FE',
    secondaryDark: '#5B21B6',
    background: '#F9FAFB',
    backgroundDark: '#1E293B',
    backgroundAccent: '#F5F7FA',
    text: '#1E293B',
    textMuted: '#64748B',
    textLight: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#7C3AED',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
  },
  typography: { fontFamily: 'Inter, Arial, Helvetica, sans-serif' },
};

// Essential styles are also inline in the shell/content for mail clients that
// strip head styles. No external fonts, CSS variables or flex layout required.
export const baseEmailStyles = `
  body, table, td { font-family: ${emailTheme.typography.fontFamily}; }
  table { border-spacing: 0; }
  img { border: 0; outline: none; text-decoration: none; }
  p, li { line-height: 1.6; }
  a { color: ${emailTheme.colors.secondary}; }
  .info-card, .credentials-card { background-color: ${emailTheme.colors.backgroundAccent}; border: 1px solid ${emailTheme.colors.border}; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .button-primary { background-color: ${emailTheme.colors.primary}; color: ${emailTheme.colors.text} !important; }
  .button-secondary { background-color: ${emailTheme.colors.secondary}; color: #FFFFFF !important; }
  @media only screen and (max-width: 600px) {
    .email-outer { padding: 12px 8px !important; }
    .email-padding { padding: 24px 20px !important; }
    .email-content h1 { font-size: 23px !important; }
    .button-primary, .button-secondary { box-sizing: border-box; max-width: 100%; }
  }
`;
