declare namespace google {
  namespace accounts {
    namespace oauth2 {
      type TokenResponse = {
        access_token?: string;
        expires_in?: string | number;
        error?: string;
      };

      interface TokenClient {
        callback: ((response: TokenResponse) => void) | null;
        requestAccessToken(options?: { prompt?: string }): void;
      }

      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }): TokenClient;
    }
  }
}
