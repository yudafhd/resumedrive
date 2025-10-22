import { z } from "zod";

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export const educationSchema = z.object({
  school: z.string().min(1, "School is required"),
  degree: z.string().min(1, "Degree is required"),
  startYear: z.string().min(1, "Start year is required"),
  endYear: z.string().optional(),
});

export const cvSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().default(""),
  contact: z.object({
    email: z.string().email("Valid email required"),
    phone: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
  }),
  summary: z.string().default(""),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
});

export type CvData = z.infer<typeof cvSchema>;

export const defaultCv: CvData = {
  name: "",
  title: "",
  contact: {
    email: "",
    phone: "",
    website: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};
