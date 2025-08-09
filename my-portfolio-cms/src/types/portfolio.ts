export type Basic = {
  id: string;
  name: string;
  contact_no: string;
  email: string;
  location: string;
  about: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skillsLearned: string[];
}

export type Skill = {
  id: string;
  name: string;
  level: "beginner"|"intermediate"|"advanced";
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  startDate: Date;
  endDate?: Date;
  Grade: string;
};