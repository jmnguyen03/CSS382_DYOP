import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CourseDetail } from './pages/CourseDetail';
import { Departments } from './pages/Departments';
import { DepartmentDetail } from './pages/DepartmentDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'course/:id', Component: CourseDetail },
      { path: 'departments', Component: Departments },
      { path: 'departments/:name', Component: DepartmentDetail },
    ],
  },
]);
