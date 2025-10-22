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

export {};
