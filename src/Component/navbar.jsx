import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthData } from "../context/authContext"; // Make sure this path is correct

const Navbar = () => {
  const { isAuth, user, Logout } = AuthData();
  const navigate = useNavigate();
  
  // Get first character of user's name for profile button
  const profileInitial = isAuth && user?.name ? user.name.charAt(0).toUpperCase() : "";

  const handleLogout = () => {
    Logout(navigate);
  };

  return (
    <nav className="fixed w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Medimate"
              className="h-12 w-12 rounded-full mr-3"
            />
            <span className="text-2xl font-bold text-blue-600">Medimate</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 flex items-center">
                Departments
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md p-2 mt-2">
                <Link
                  to="/departments/cardiology"
                  className="block px-4 py-2 hover:bg-blue-50"
                >
                  Cardiology
                </Link>
                <Link
                  to="/departments/neurology"
                  className="block px-4 py-2 hover:bg-blue-50"
                >
                  Neurology
                </Link>
                <Link
                  to="/departments/orthopedics"
                  className="block px-4 py-2 hover:bg-blue-50"
                >
                  Orthopedics
                </Link>
              </div>
            </div>
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Services
            </Link>
            <Link
              to="/doctors"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Doctors
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Contact
            </Link>
          </div>
          
          {/* Sign-In/Profile Button */}
          <div className="flex items-center space-x-4">
            {isAuth ? (
              <div className="relative group">
                <button className="bg-blue-500 text-white w-10 h-10 rounded-full hover:bg-blue-600 transition flex items-center justify-center font-medium">
                  {profileInitial}
                </button>
                <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md p-2 mt-2 w-48">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-blue-50"
                  >
                    My Profile
                  </Link>
                  {user?.role === "doctor" && (
                    <Link
                      to="/appointments"
                      className="block px-4 py-2 hover:bg-blue-50"
                    >
                      My Appointments
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-blue-50"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;