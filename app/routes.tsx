import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Majors from './pages/Majors';
import MajorDetail from './pages/MajorDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Professors from './pages/Professors';
import ProfessorDetail from './pages/ProfessorDetail';
import NotFound from './pages/NotFound';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

import SubmitResource from './pages/SubmitResource';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'departments',
        children: [
          { index: true, element: <Departments /> },
          { path: ':id', element: <DepartmentDetail /> },
        ],
      },
      {
        path: 'majors',
        children: [
          { index: true, element: <Majors /> },
          { path: ':id', element: <MajorDetail /> },
        ],
      },
      {
        path: 'courses',
        children: [
          { index: true, element: <Courses /> },
          { path: ':id', element: <CourseDetail /> },
        ],
      },
      {
        path: 'submit-material',
        element: <SubmitResource />,
      },
      {
        path: 'professors',
        children: [
          { index: true, element: <Professors /> },
          { path: ':id', element: <ProfessorDetail /> },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);