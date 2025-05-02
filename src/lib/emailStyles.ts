export const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #F9FAFB;
    margin: 0;
    padding: 0;
  }

  .email-container {
    max-width: 600px;
    margin: 20px auto;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .email-header {
    background-color: #F4A300;
    padding: 24px;
    text-align: center;
  }

  .email-content {
    padding: 32px 24px;
    color: #1E293B;
  }

  .email-footer {
    background-color: #F5F7FA;
    padding: 24px;
    text-align: center;
    color: #64748B;
    font-size: 14px;
  }

  .button-primary {
    display: inline-block;
    padding: 12px 24px;
    background-color: #F4A300;
    color: #1E293B;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
  }

  .button-secondary {
    display: inline-block;
    padding: 12px 24px;
    background-color: #7C3AED;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
  }

  .info-card {
    background-color: #F5F7FA;
    border-radius: 8px;
    padding: 20px;
    margin: 16px 0;
  }

  @media only screen and (max-width: 600px) {
    .email-container {
      margin: 0;
      border-radius: 0;
    }
    .email-content {
      padding: 24px 16px;
    }
  }
`;
