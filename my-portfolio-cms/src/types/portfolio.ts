export type Basic = {
  id?: string;
  name: string;
  contact_no: string;
  email: string;
  location: string;
  about: string;
};

export type Project = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
};

export type Experience = {
  id?: string;
  _id?: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skillsLearned: string[];
}

export type Skill = {
  id?: string;
  _id?: string;
  name: string;
  level: "beginner"|"intermediate"|"advanced";
};

export type Education = {
  id?: string;
  _id?: string;
  institution: string;
  degree: string;
  startDate: Date;
  endDate?: Date;
  Grade: string;
};

export type user = {
  id?: string;
  email: string;
  password: string;
}