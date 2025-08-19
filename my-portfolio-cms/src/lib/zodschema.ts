import { z } from "zod";

// Very lenient phone regex that accepts most formats or empty strings
const phoneRegex = /^$|^[+]?[(]?[0-9]{0,4}[)]?[-\s.]?[0-9]{0,4}[-\s.]?[0-9]{0,9}$/;

export const basicSchema = z.object({
  // Removed 'id' field to use MongoDB's _id
  name: z.string().min(1, 'Full Name is required'),
  contact_no: z.string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, "Invalid phone number format"),
  email: z.string().email("Invalid email address").min(1, 'Email is required'),
  location: z.string().min(1, 'Location is required'),
  about: z.string().min(1, 'Summary/About is required'),
});

export type BasicFormSchema = z.infer<typeof basicSchema>;

export const projectSchema = z.object({
  id: z.string().optional(), // Now optional
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  techStack: z
    .array(z.string().min(1, "Tech stack item cannot be empty"))
    .min(1, "Add at least one technology"),
  link: z.string().url("Invalid URL").optional(),
});

export type ProjectFormSchema = z.infer<typeof projectSchema>;

export const experienceSchema = z.object({
  id: z.string().optional(), // Now optional
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string().optional(),
  skillsLearned: z.array(z.string().min(1, "Skill cannot be empty"))
});

export type ExperienceFormSchema = z.infer<typeof experienceSchema>;

export const skillSchema = z.object({
  id: z.string().optional(), // Now optional
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Invalid skill level",
  }),
});

export type SkillFormSchema = z.infer<typeof skillSchema>;

export const educationSchema = z.object({
  id: z.string().optional(), // Now optional
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  Grade: z.string().min(1, "Grade is required"),
});

export type EducationFormSchema = z.infer<typeof educationSchema>;

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserFormSchema = z.infer<typeof userSchema>;
