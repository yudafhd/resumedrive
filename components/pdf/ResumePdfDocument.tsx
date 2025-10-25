import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CvData as ResumeData } from "@/lib/cv";
import { formatDisplayDate } from "@/lib/date";

type ResumePdfLabels = {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  present: string;
  fallbackName: string;
  fallbackTitle: string;
  additional: string;
};

type ResumePdfDocumentProps = {
  resume: ResumeData;
  labels: ResumePdfLabels;
  language: string;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 32,
    lineHeight: 1.4,
    color: "#202020",
  },
  header: {
    marginBottom: 18,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#555555",
  },
  contact: {
    fontSize: 10,
    marginTop: 6,
    color: "#444444",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    color: "#333333",
  },
  paragraph: {
    marginBottom: 6,
  },
  item: {
    marginBottom: 12,
  },
  itemHeading: {
    fontSize: 11,
    fontWeight: "bold",
  },
  meta: {
    fontSize: 10,
    color: "#555555",
    marginTop: 2,
  },
  bullet: {
    marginLeft: 12,
  },
  skills: {
    fontSize: 10,
  },
});

function richTextToLines(source?: string | null): string[] {
  if (!source) return [];
  return source
    .replace(/\r\n/g, "\n")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const joinContact = (resume: ResumeData) => {
  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email.trim());
  if (resume.contact.phone) contactParts.push(resume.contact.phone.trim());
  if (resume.contact.location) contactParts.push(resume.contact.location.trim());
  if (resume.contact.website) contactParts.push(resume.contact.website.trim());
  return contactParts.join(" | ");
};

export function ResumePdfDocument({ resume, labels, language }: ResumePdfDocumentProps) {
  const name = resume.name?.trim() || labels.fallbackName;
  const title = resume.title?.trim() || labels.fallbackTitle;
  const contactLine = joinContact(resume);
  const customSections = resume.customSections ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
        </View>

        {resume.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.summary}</Text>
            {richTextToLines(resume.summary).map((line, index) => (
              <Text key={`summary-${index}`} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {resume.experience.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.experience}</Text>
            {resume.experience.map((item, index) => {
              const role = item.role?.trim();
              const company = item.company?.trim();
              const heading = [role, company].filter(Boolean).join(" — ");
              const start = formatDisplayDate(item.startDate, language);
              const end = item.isCurrent
                ? labels.present
                : formatDisplayDate(item.endDate, language);
              const dateRange = [start, end].filter(Boolean).join(" - ");
              const lines = richTextToLines(item.description);
              return (
                <View key={`experience-${index}`} style={styles.item}>
                  {heading ? <Text style={styles.itemHeading}>{heading}</Text> : null}
                  {dateRange ? <Text style={styles.meta}>{dateRange}</Text> : null}
                  {lines.map((line, lineIndex) => {
                    const textStyle = line.startsWith("• ")
                      ? [styles.paragraph, styles.bullet]
                      : styles.paragraph;
                    return (
                      <Text
                        key={`experience-${index}-line-${lineIndex}`}
                        style={textStyle}
                      >
                        {line}
                      </Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ) : null}

        {resume.education.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.education}</Text>
            {resume.education.map((item, index) => {
              const degree = item.degree?.trim();
              const school = item.school?.trim();
              const heading = [degree, school].filter(Boolean).join(" — ");
              const start = formatDisplayDate(item.startYear, language);
              const end = formatDisplayDate(item.endYear, language) || labels.present;
              const dateRange = [start, end].filter(Boolean).join(" - ");
              return (
                <View key={`education-${index}`} style={styles.item}>
                  {heading ? <Text style={styles.itemHeading}>{heading}</Text> : null}
                  {dateRange ? <Text style={styles.meta}>{dateRange}</Text> : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {resume.skills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.skills}</Text>
            <Text style={[styles.paragraph, styles.skills]}>
              {resume.skills.join(", ")}
            </Text>
          </View>
        ) : null}

        {customSections.length
          ? customSections.map((section, sectionIndex) => {
              const heading = section.heading?.trim() || `${labels.additional} ${sectionIndex + 1}`;
              return (
                <View key={`custom-section-${sectionIndex}`} style={styles.section}>
                  {heading ? <Text style={styles.sectionTitle}>{heading}</Text> : null}
                  {section.entries.map((entry, entryIndex) => {
                    const entryTitle = entry.title?.trim();
                    const lines = richTextToLines(entry.description);
                    if (!entryTitle && lines.length === 0) return null;
                    return (
                      <View key={`custom-entry-${sectionIndex}-${entryIndex}`} style={styles.item}>
                        {entryTitle ? <Text style={styles.itemHeading}>{entryTitle}</Text> : null}
                        {lines.map((line, lineIndex) => (
                          <Text key={`custom-entry-${sectionIndex}-${entryIndex}-line-${lineIndex}`} style={styles.paragraph}>
                            {line}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              );
            })
          : null}
      </Page>
    </Document>
  );
}

export default ResumePdfDocument;
