import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CourseManagement } from '@/pages/CourseManagement';
import { TeacherManagement } from '@/pages/TeacherManagement';
import { SmartScheduling } from '@/pages/SmartScheduling';
import { ScheduleDisplay } from '@/pages/ScheduleDisplay';
import { initializeDatabase } from '@/utils/database';

const App: React.FC = () => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/teachers" element={<TeacherManagement />} />
          <Route path="/scheduling" element={<SmartScheduling />} />
          <Route path="/schedule" element={<ScheduleDisplay />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
