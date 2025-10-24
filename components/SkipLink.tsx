"use client";

import { useTranslation } from "./providers/LanguageProvider";

export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a href="#main-content" className="skip-link">
      {t("layout.skipToContent")}
    </a>
  );
}

export default SkipLink;

