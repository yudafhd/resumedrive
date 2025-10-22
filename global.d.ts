/* eslint-disable @typescript-eslint/no-unused-vars */

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      type TokenResponse = {
        access_token?: string;
        expires_in?: string | number;
        error?: string;
      };

      type TokenClientConfig = {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      };

      interface TokenClient {
        callback: ((response: TokenResponse) => void) | null;
        requestAccessToken(options?: { prompt?: string }): void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
    }
  }
}

type GapiLoadOptions = {
  callback: () => void;
  onerror?: () => void;
};

type GapiClient = {
  load: (modules: string, options: GapiLoadOptions) => void;
  client: {
    init: (config: { apiKey: string }) => Promise<void>;
  };
};

declare global {
  interface Window {
    gapi?: GapiClient;
    google?: typeof google;
  }

  const gapi: GapiClient;
}

export { };
