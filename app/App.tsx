import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Majors from './pages/Majors';
import MajorDetail from './pages/MajorDetail';
import Professors from './pages/Professors';
import ProfessorDetail from './pages/ProfessorDetail';
import NotFound from './pages/NotFound';
import {Login} from './pages/Login';
import {Signup} from './pages/Signup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Root Independent Authentication Views */}
        {/* Placed completely outside the "/" layout branch so they render independently */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 2. Core Application Layout Wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="departments" element={<Departments />} />
          <Route path="departments/:id" element={<DepartmentDetail />} />
          <Route path="majors" element={<Majors />} />
          <Route path="majors/:id" element={<MajorDetail />} />
          <Route path="professors" element={<Professors />} />
          <Route path="professors/:id" element={<ProfessorDetail />} />
          <Route path="textbooks" element={<Navigate to="/" replace />} />
          
          {/* Wildcard catch-all specifically for routes nested under the main frame */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}