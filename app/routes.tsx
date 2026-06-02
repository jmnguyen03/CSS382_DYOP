import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Departments from './pages/Departments'
import DepartmentDetail from './pages/DepartmentDetail'
import Professors from './pages/Professors'
import ProfessorDetail from './pages/ProfessorDetail'
import NotFound from './pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:id" element={<DepartmentDetail />} />
        <Route path="/professors" element={<Professors />} />
        <Route path="/professors/:id" element={<ProfessorDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}