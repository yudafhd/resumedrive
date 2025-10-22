/// <reference types="google.picker" />

type PickerDocument = {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
};

type PickerOptions = {
  accessToken: string;
  developerKey: string;
  showFolders?: boolean;
  mimeTypes?: string[];
  onPicked: (doc: PickerDocument) => void;
};

let pickerInitPromise: Promise<void> | null = null;

export async function openDrivePicker(options: PickerOptions) {
  if (typeof window === "undefined") {
    throw new Error("Picker is a client-side feature");
  }

  await ensurePickerLoaded(options.developerKey);

  return new Promise<void>((resolve) => {
    const { google } = window as typeof window & {
      google?: typeof google;
    };
    if (!google?.picker) {
      throw new Error("Google Picker failed to load");
    }

    const view = new google.picker.DocsView();
    view.setIncludeFolders(true);
    view.setSelectFolderEnabled(Boolean(options.showFolders));
    if (options.mimeTypes?.length) {
      view.setMimeTypes(options.mimeTypes.join(","));
    }

    const picker = new google.picker.PickerBuilder()
      .setDeveloperKey(options.developerKey)
      .setOAuthToken(options.accessToken)
      .addView(view)
      .setOrigin(window.location.origin)
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.CANCEL) {
          resolve();
          return;
        }

        if (data.action === google.picker.Action.PICKED && data.docs?.length) {
          const doc = data.docs[0];
          options.onPicked({
            id: doc.id ?? "",
            name: doc.name ?? doc.id ?? "",
            mimeType: doc.mimeType ?? "",
            isFolder: doc.type === "folder",
          });
          resolve();
        }
      })
      .build();

    picker.setVisible(true);
  });
}

async function ensurePickerLoaded(apiKey: string) {
  if (!pickerInitPromise) {
    pickerInitPromise = new Promise<void>((resolve, reject) => {
      const { gapi } = window as typeof window & { gapi?: GapiClient };
      if (!gapi) {
        reject(new Error("gapi script failed to load"));
        return;
      }

      gapi.load("client", {
        callback: () => {
          gapi.client
            .init({ apiKey })
            .then(() => loadPickerModules(gapi))
            .then(resolve)
            .catch(reject);
        },
        onerror: () => reject(new Error("Failed to load gapi client")),
      });
    });
  }

  await pickerInitPromise;
}

function loadPickerModules(gapi: GapiClient) {
  return new Promise<void>((resolve, reject) => {
    gapi.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Failed to load picker module")),
    });
  });
}
