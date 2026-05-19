import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Departments from './pages/Departments'
import DepartmentDetail from './pages/DepartmentDetail'
import CourseDetail from './pages/CourseDetail'
import NotFound from './pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Core Site Entry Views */}
        <Route path="/" element={<Home />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:id" element={<DepartmentDetail />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        
        {/* Global Route Catch Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}