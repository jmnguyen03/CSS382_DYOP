import { Outlet, Link, useNavigate } from 'react-router-dom'; 
import {
  BookOpen,
  Layers,
  GraduationCap,
  Award,
  Search,
  Bell,
  User,
  LogIn,
  UserPlus,
  CalendarDays,
  LogOut,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar Header Section */}
      <header className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 no-underline">
            <GraduationCap className="h-6 w-6" />
            <span>CourseShelf</span>
          </Link>
          <div className="relative w-80 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search courses, professors..."
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-600">
            <Bell className="h-5 w-5" />
          </Button>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                    <User className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-slate-500 font-normal truncate">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/schedule')} className="cursor-pointer gap-2">
                      <CalendarDays className="h-4 w-4" />
                      My Schedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
                  <Button
                    variant="ghost"
                    className="text-slate-700 font-medium gap-2 hover:bg-slate-100 transition-colors"
                    onClick={() => navigate('/login')}
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 shadow-sm transition-colors"
                    onClick={() => navigate('/signup')}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Left Sidebar Menu */}
        <aside className="w-64 bg-white border-r border-slate-200 fixed bottom-0 top-16 left-0 hidden lg:flex flex-col p-4 justify-between">
          <div className="flex flex-col gap-1">
            <Link
              to="/courses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all no-underline"
            >
              <BookOpen className="h-5 w-5" />
              <span>Courses</span>
            </Link>
            <Link
              to="/departments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all no-underline"
            >
              <Layers className="h-5 w-5" />
              <span>Departments</span>
            </Link>
            <Link
              to="/majors"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all no-underline"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Majors</span>
            </Link>
            <Link
              to="/professors"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all no-underline"
            >
              <Award className="h-5 w-5" />
              <span>Professors</span>
            </Link>

            {/* Fixed Navigation link routing exactly to /submit */}
            <Link
              to="/submit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all border-t border-b-0 border-l-0 border-r-0 border-slate-100 pt-4 mt-2 no-underline"
            >
              <Upload className="h-5 w-5 text-indigo-500" />
              <span>Submit Material</span>
            </Link>

            {user && (
              <Link
                to="/schedule"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-all no-underline"
              >
                <CalendarDays className="h-5 w-5" />
                <span>My Schedule</span>
              </Link>
            )}
          </div>

          <div className="text-xs text-slate-400 px-4">
            &copy; 2026 CourseShelf
          </div>
        </aside>

        {/* Nested Display Frame Content Slot */}
        <main className="flex-1 lg:pl-64 p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}