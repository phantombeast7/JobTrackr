interface TokenData {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}

export const tokenStorage = {
  setTokens(tokens: TokenData) {
    localStorage.setItem('googleDriveTokens', JSON.stringify(tokens));
  },

  getTokens(): TokenData | null {
    const tokens = localStorage.getItem('googleDriveTokens');
    if (!tokens) return null;

    const parsedTokens = JSON.parse(tokens);
    // Check if tokens are expired
    if (parsedTokens.expiry_date && parsedTokens.expiry_date < Date.now()) {
      this.clearTokens();
      return null;
    }
    return parsedTokens;
  },

  clearTokens() {
    localStorage.removeItem('googleDriveTokens');
  },

  isAuthorized(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && tokens.access_token !== undefined;
  }
}; 