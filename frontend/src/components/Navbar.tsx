import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-slate-900">StoryForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium">Home</Link>
            <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium">My Stories</Link>
            <Link to="/create" className="px-5 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition">
              Create Book
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
