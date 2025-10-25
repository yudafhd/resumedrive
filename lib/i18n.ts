export type Language = "en" | "id";

type TranslationValue = string | TranslationDictionary;

type TranslationDictionary = {
  [key: string]: TranslationValue;
};

const translations: Record<Language, TranslationDictionary> = {
  en: {
    layout: {
      skipToContent: "Skip to main content",
    },
    language: {
      switcherLabel: "Language",
      selectEnglish: "Switch to English",
      selectIndonesian: "Switch to Bahasa Indonesia",
      englishShort: "EN",
      indonesianShort: "ID",
    },
    header: {
      editorTab: "Editor",
      previewTab: "Preview",
      openLeftPanel: "Open left panel",
    },
    leftPanel: {
      workspaceLabel: "Workspace",
      localDraftsTitle: "Local drafts",
      localDraftsDescription:
        "Save changes as JSON files or import a resume to edit again.",
      downloadJson: "Download",
      importJson: "Import",
      startFasterTitle: "Get started faster",
      driveLabel: "Google Drive",
      driveTitle: "Sync & history",
      driveDescriptionPrefix: "Files are stored in your private",
      driveDescriptionSuffix:
        " keeping them private to this app. Save to update the latest version.",
      syncToDrive: "Sync to Drive",
      syncingToDrive: "Loading…",
      refresh: "Refresh",
      failedToLoadFiles: "Failed to load saved files. Try refreshing.",
      confirmDelete: 'Delete "{{name}}" from Google Drive?',
      deleteError: "Failed to delete file.",
      signInPrompt: "Sign in with Google to sync files.",
    },
    quickStart: {
      "title": "Quick start",
      "step1": "1. Fill out the entire resume form.",
      "step2": "2. Click Preview to view the result.",
      "step3": "3. Click Print PDF to download your resume.",
      "step4": "4. You may save the resume data to your local PC or your personal Google Drive for future updates."
    },
    fileList: {
      loading: "Loading files from Google Drive…",
      empty:
        "No app files found. Create a file from the editor or upload with local file.",
      updatedAt: "Updated {{date}}",
    },
    resumeTabs: {
      editorTitle: "Editor",
      editorDescription: "Manage your resume content with a structured form.",
      previewTitle: "Preview",
      previewDescription: "Review the final resume before sharing.",
      exportPdf: "Export PDF",
      configFileName: "File name",
      syncToDrive: "Sync to Drive",
      syncingToDrive: "Loading…",
      loadFromDrive: "Load from Drive",
      loadingFromDrive: "Loading…",
      saveToLocal: "Save to local",
      loadFromLocal: "Load from local",
    },
    configPanel: {
      title: "Save to Google Drive",
      descriptionPrefix: "Resumes sync to your Google Drive",
      descriptionSuffix: " so they stay private to this app.",
      refreshFiles: "Refresh files",
      storedResumes: "Stored resumes",
      loadingFiles: "Loading saved files…",
      filesSaved: "{{count}} file{{suffix}} saved.",
      latestUpdate: "Latest update: {{date}}",
      noSavedResumes: "No saved resumes yet.",
      connectPrompt: "Connect with Google to create a private backup.",
      signedInSuccess: "Signed in successfully.",
    },
    resumePreview: {
      fallbackName: "Your Name",
      fallbackTitle: "Professional Title",
      summary: "Summary",
      experience: "Experience",
      present: "Present",
      education: "Education",
      skills: "Skills",
      additional: "Additional",
    },
    formEditor: {
      profile: "Profile",
      name: "Name",
      title: "Title",
      email: "Email",
      phone: "Phone",
      website: "Website",
      location: "Location",
      summary: "Summary",
      experience: "Experience",
      addRole: "Add role",
      emptyExperience: "Add your recent roles to showcase your impact.",
      company: "Company",
      role: "Role",
      startDate: "Start date",
      endDate: "End date",
      currentRole: "Current role",
      removeRole: "remove",
      description: "Description",
      education: "Education",
      addEducation: "Add education",
      emptyEducation: "Add education details to highlight your journey.",
      school: "School",
      degree: "Degree",
      startYear: "Start year",
      endYear: "End year",
      removeEducation: "Remove education",
      skills: "Skills",
      skillsDescription: "Separate skills with commas, e.g. TypeScript, Figma",
      customSections: "Custom sections",
      customSectionsDescription:
        "Create additional sections such as Certifications or Awards.",
      addCustomSection: "Add section",
      removeCustomSection: "Remove section",
      customSectionHeading: "Section title",
      customEntries: "Entries",
      addCustomEntry: "Add entry",
      removeCustomEntry: "Remove entry",
      customEntryTitle: "Entry title",
      customEntryDescription: "Entry description",
      emptyCustomSections: "Add a custom section to highlight more accomplishments.",
    },
    richEditor: {
      placeholder: "Write something…",
      bold: "Bold",
      italic: "Italic",
      underline: "Underline",
      alignLeft: "Align left",
      alignCenter: "Align center",
      alignRight: "Align right",
      characterCount: "{{count}} characters",
    },
    google: {
      missingClientId: "Missing Google Client ID",
      identityFailed: "Google Identity Services failed to load",
      connected: "Connected to Google Drive",
      signOut: "Sign out",
      connecting: "Connecting...",
      signInWithGoogle: "Sign in to Google Drive",
      signInFailed: "Google sign-in failed: {{error}}",
      startFailed: "Failed to start Google sign-in",
    },
    page: {
      previewRequired: "Open the Preview tab before downloading.",
      printPreviewError: "Unable to prepare print preview",
      loadedDraft: "Loaded draft from local storage.",
      invalidDraft: "Draft is invalid.",
      signInToSave: "Sign in to save your resume.",
      saveSettingsFailed:
        "Saved resume but failed to sync settings{{message}}.",
      savedToDrive: "Saved {{name}} to Drive.",
      saveJsonFailed: "Failed to save JSON.",
      importedSettingsFailed:
        "Imported resume but failed to sync settings{{message}}.",
      importedFile: "Imported {{name}}",
      invalidJson: "JSON file is invalid.",
      importFailed: "Failed to import JSON.",
      signInToLoad: "Sign in to load your resume from Drive.",
      loadedSettingsFailed:
        "Loaded resume but failed to sync settings{{message}}.",
      loadedFromDrive: "Resume loaded from Drive.",
      loadFailed: "Failed to load from Drive.",
      loadingFallback: "Loading…",
    },
    drawer: {
      settingsTitle: "Settings",
      closeSettings: "Close settings",
    },
  },
  id: {
    layout: {
      skipToContent: "Lewati ke konten utama",
    },
    language: {
      switcherLabel: "Bahasa",
      selectEnglish: "Ganti ke Bahasa Inggris",
      selectIndonesian: "Ganti ke Bahasa Indonesia",
      englishShort: "EN",
      indonesianShort: "ID",
    },
    header: {
      editorTab: "Editor",
      previewTab: "Pratinjau",
      openLeftPanel: "Buka panel kiri",
    },
    leftPanel: {
      workspaceLabel: "Workspace",
      localDraftsTitle: "Simpan lokal",
      localDraftsDescription:
        "Simpan perubahan sebagai file JSON atau impor resume untuk diedit ulang.",
      downloadJson: "Unduh",
      importJson: "Impor",
      startFasterTitle: "Mulai lebih cepat",
      driveLabel: "Google Drive",
      driveTitle: "Sinkron Drive",
      driveDescriptionPrefix: "File tersimpan di",
      driveDescriptionSuffix:
        " sehingga hanya aplikasi ini yang dapat mengaksesnya. Simpan untuk memperbarui versi terbaru.",
      syncToDrive: "Simpan ke Drive",
      syncingToDrive: "Memuat…",
      refresh: "Refresh File",
      failedToLoadFiles: "Gagal memuat file tersimpan. Coba muat ulang.",
      confirmDelete: 'Hapus "{{name}}" dari Google Drive?',
      deleteError: "Gagal menghapus file.",
      signInPrompt: "Masuk dengan Google untuk sinkronisasi file.",
    },
    quickStart: {
      "title": "Tutorial Cepat",
      "step1": "1. Isi semua form.",
      "step2": "2. Klik pertinjau untuk melihat hasil.",
      "step3": "3. Klik Expor PDF untuk mendownload resume.",
      "step4": "4. Anda bisa menyimpan data resume ke Komputer/HP anda atau bisa juga ke Google Drive pribadi sehingga sewaktu-waktu dapat melakukan update."
    },
    fileList: {
      loading: "Memuat file dari Google Drive…",
      empty:
        "Tidak ada file aplikasi. Buat dari editor atau unggah dengan lokal.",
      updatedAt: "Diperbarui {{date}}",
    },
    resumeTabs: {
      editorTitle: "Editor",
      editorDescription: "Kelola konten resume dengan formulir terstruktur.",
      previewTitle: "Pratinjau",
      previewDescription: "Tinjau hasil akhir resume sebelum dibagikan.",
      exportPdf: "Ekspor PDF",
      configFileName: "Nama file",
      syncToDrive: "Sinkron ke Drive",
      syncingToDrive: "Memuat…",
      loadFromDrive: "Muat dari Drive",
      loadingFromDrive: "Memuat…",
      saveToLocal: "Simpan ke lokal",
      loadFromLocal: "Muat dari lokal",
    },
    configPanel: {
      title: "Simpan ke Google Drive",
      descriptionPrefix: "Resume disinkronkan ke",
      descriptionSuffix: " sehingga tetap privat untuk aplikasi ini.",
      refreshFiles: "Muat ulang file",
      storedResumes: "Resume tersimpan",
      loadingFiles: "Memuat file tersimpan…",
      filesSaved: "{{count}} file{{suffix}} tersimpan.",
      latestUpdate: "Pembaruan terbaru: {{date}}",
      noSavedResumes: "Belum ada resume tersimpan.",
      connectPrompt: "Hubungkan Google untuk membuat cadangan privat.",
      signedInSuccess: "Berhasil masuk.",
    },
    resumePreview: {
      fallbackName: "Nama Anda",
      fallbackTitle: "Jabatan Profesional",
      summary: "Ringkasan",
      experience: "Pengalaman",
      present: "Sekarang",
      education: "Pendidikan",
      skills: "Keahlian",
      additional: "Tambahan",
    },
    formEditor: {
      profile: "Profil",
      name: "Nama",
      title: "Jabatan",
      email: "Email",
      phone: "Telepon",
      website: "Situs web",
      location: "Lokasi",
      summary: "Ringkasan",
      experience: "Pengalaman",
      addRole: "Tambah role",
      emptyExperience: "Tambahkan pengalaman terbaru untuk menonjolkan dampak Anda.",
      company: "Perusahaan",
      role: "Role",
      startDate: "Tanggal mulai",
      endDate: "Tanggal selesai",
      currentRole: "Sedang berlangsung",
      removeRole: "hapus",
      description: "Deskripsi",
      education: "Pendidikan",
      addEducation: "Tambah pendidikan",
      emptyEducation: "Tambahkan riwayat pendidikan untuk memperkuat profil.",
      school: "Sekolah",
      degree: "Gelar",
      startYear: "Tahun mulai",
      endYear: "Tahun selesai",
      removeEducation: "Hapus pendidikan",
      skills: "Keahlian",
      skillsDescription: "Pisahkan dengan koma, contoh: TypeScript, Figma",
      customSections: "Bagian kustom",
      customSectionsDescription:
        "Buat bagian tambahan seperti Sertifikasi atau Penghargaan.",
      addCustomSection: "Tambah bagian",
      removeCustomSection: "Hapus Kustom",
      customSectionHeading: "Judul bagian",
      customEntries: "Entri",
      addCustomEntry: "Tambah entri",
      removeCustomEntry: "Hapus entri",
      customEntryTitle: "Judul entri",
      customEntryDescription: "Deskripsi entri",
      emptyCustomSections: "Tambahkan bagian kustom untuk menonjolkan pencapaian lain.",
    },
    richEditor: {
      placeholder: "Tulis sesuatu…",
      bold: "Tebal",
      italic: "Miring",
      underline: "Garis bawah",
      alignLeft: "Rata kiri",
      alignCenter: "Rata tengah",
      alignRight: "Rata kanan",
      characterCount: "{{count}} karakter",
    },
    google: {
      missingClientId: "Google Client ID tidak tersedia",
      identityFailed: "Layanan Google Identity gagal dimuat",
      connected: "Terhubung ke Google Drive",
      signOut: "Keluar",
      connecting: "Menghubungkan...",
      signInWithGoogle: "Masuk ke Google Drive",
      signInFailed: "Gagal masuk Google: {{error}}",
      startFailed: "Gagal memulai proses masuk Google",
    },
    page: {
      previewRequired: "Buka tab Pratinjau sebelum mengunduh.",
      printPreviewError: "Tidak dapat menyiapkan pratinjau cetak",
      loadedDraft: "Draf dimuat dari penyimpanan lokal.",
      invalidDraft: "Draf tidak valid.",
      signInToSave: "Masuk untuk menyimpan resume Anda.",
      saveSettingsFailed:
        "Resume tersimpan tetapi gagal sinkron pengaturan{{message}}.",
      savedToDrive: "Berhasil menyimpan {{name}} ke Drive.",
      saveJsonFailed: "Gagal menyimpan JSON.",
      importedSettingsFailed:
        "Resume terimpor tetapi gagal sinkron pengaturan{{message}}.",
      importedFile: "Berhasil mengimpor {{name}}",
      invalidJson: "File JSON tidak valid.",
      importFailed: "Gagal mengimpor JSON.",
      signInToLoad: "Masuk untuk memuat resume dari Drive.",
      loadedSettingsFailed:
        "Resume termuat tetapi gagal sinkron pengaturan{{message}}.",
      loadedFromDrive: "Resume berhasil dimuat dari Drive.",
      loadFailed: "Gagal memuat dari Drive.",
      loadingFallback: "Memuat…",
    },
    drawer: {
      settingsTitle: "Pengaturan",
      closeSettings: "Tutup pengaturan",
    },
  },
};

function resolveTranslation(
  language: Language,
  key: string,
): string | undefined {
  const parts = key.split(".");
  let current: TranslationValue | undefined = translations[language];

  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      part in current
    ) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(
  template: string,
  params?: Record<string, string | number | null | undefined>,
): string {
  if (!params) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number | null | undefined>,
): string {
  const fallbackLanguage: Language = "en";
  const primary =
    resolveTranslation(language, key) ??
    resolveTranslation(fallbackLanguage, key);
  if (!primary) {
    return key;
  }
  return interpolate(primary, params);
}

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "id";
}
