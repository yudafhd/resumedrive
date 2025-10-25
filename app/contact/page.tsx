import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | Resume Drive",
  description: "Reach out to the Resume Drive maintainer for questions or collaboration.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
