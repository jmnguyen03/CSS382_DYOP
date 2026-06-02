import { Outlet, Link, useNavigate } from 'react-router';
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Award, 
  Search, 
  Bell, 
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-height-screen bg-slate-50 flex flex-col">
      {/* Top Navbar Header Section */}
      <header className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <GraduationCap className="h-6 width-6" />
            <span>Smart Budget</span>
          </Link>
          <div className="relative width-80 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 width-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search courses, professors..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Top Right Header Actions Bar */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-600">
            <Bell className="h-5 width-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-slate-600">
            <User className="h-5 width-5" />
          </Button>

          <div className="h-5 width-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

          {/* New Authentication Navigation Buttons */}
          <Button 
            variant="ghost" 
            className="text-slate-700 font-medium gap-2 hover:bg-slate-100 transition-colors"
            onClick={() => navigate('/login')}
          >
            <LogIn className="h-4 width-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>

          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 shadow-sm transition-colors"
            onClick={() => navigate('/signup')}
          >
            <UserPlus className="h-4 width-4" />
            <span className="hidden sm:inline">Sign Up</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Left Sidebar Menu */}
        <aside className="width-64 bg-white border-r border-slate-200 fixed bottom-0 top-16 left-0 hidden lg:flex flex-col p-4 justify-between">
          <div className="flex flex-col gap-1">
            <Link 
              to="/courses" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all"
            >
              <BookOpen className="h-5 width-5" />
              <span>Courses</span>
            </Link>
            <Link 
              to="/departments" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all"
            >
              <Layers className="h-5 width-5" />
              <span>Departments</span>
            </Link>
            <Link 
              to="/majors" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all"
            >
              <GraduationCap className="h-5 width-5" />
              <span>Majors</span>
            </Link>
            <Link 
              to="/professors" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all"
            >
              <Award className="h-5 width-5" />
              <span>Professors</span>
            </Link>
          </div>
          
          <div className="text-xs text-slate-400 px-4">
            &copy; 2026 Smart Budget
          </div>
        </aside>

        {/* Dynamic Nested Page Content Router Body */}
        <main className="flex-1 lg:pl-64 p-8 bg-slate-50">
          <div className="max-width-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}