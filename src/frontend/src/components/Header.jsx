import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container flex justify-between items-center py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="text-3xl font-bold text-red-600">X</div>
          <span className="text-2xl font-bold text-gray-800">XSS Checker</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-gray-700 font-medium hover:text-red-600 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/analyze"
            className="text-gray-700 font-medium hover:text-red-600 transition"
          >
            Analyze
          </Link>

          <div className="flex items-center gap-4 border-l pl-6">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

