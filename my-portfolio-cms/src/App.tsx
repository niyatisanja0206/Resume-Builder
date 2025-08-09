// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Landing from '@/pages/Landing';

import { type Basic, type Project, type Experience, type Skill, type Education } from '@/types/portfolio';

const queryClient = new QueryClient();

export default function App() {
  const [basicInfo, setBasicInfo] = useState<Basic | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/portfolio"
            element={
              <Portfolio
                basicInfo={basicInfo}
                projects={projects}
                experiences={experiences}
                skills={skills}
                education={education}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                basicInfo={basicInfo}
                setBasicInfo={setBasicInfo}
                projects={projects}
                setProjects={setProjects}
                experiences={experiences}
                setExperiences={setExperiences}
                skills={skills}
                setSkills={setSkills}
                education={education}
                setEducation={setEducation}
              />
            }
          />
        </Routes>
        <Footer />
      </Router>
    </QueryClientProvider>
  );
}
