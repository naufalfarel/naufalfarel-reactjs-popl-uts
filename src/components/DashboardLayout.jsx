import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Obat", path: "/obat", icon: "💊" },
    { name: "Progres", path: "/progres", icon: "📊" },
    { name: "Kunjungan", path: "/kunjungan", icon: "📅" },
    { name: "Edukasi", path: "/edukasi", icon: "📚" },
    { name: "Notifikasi", path: "/notifications", icon: "🔔" },
    { name: "Keluarga", path: "/family", icon: "👨‍👩‍👧" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-18">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center group"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl md:text-3xl"
                >
                  ❤️
                </motion.span>
                <span className="ml-2 text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-pink-700 transition-all">
                  TabbyCare
                </span>
              </button>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                      isActive
                        ? "text-red-600"
                        : "text-gray-700 hover:text-red-600"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-red-50 rounded-xl"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <span>{item.icon}</span>
                      {item.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-red-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </motion.div>
                  <span className="hidden md:block text-sm font-semibold text-gray-700">
                    {user?.name || "User"}
                  </span>
                  <motion.svg
                    animate={{ rotate: showProfileMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl py-2 border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
                        <p className="text-sm font-bold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ x: 5, backgroundColor: "#f3f4f6" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/profile");
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <span>👤</span>
                        Profile
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 5, backgroundColor: "#fef2f2" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <span>🚪</span>
                        Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden ml-4 p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(item.path);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive
                          ? "bg-red-50 text-red-600 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Click outside to close menus */}
      {(showProfileMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
