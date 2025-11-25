import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection/HeroSection";
import Login from "./components/Login";
import SignIn from "./components/SignIn";
import About from "./components/about/About";
import InfiniteScrollSponsors from "./components/InfiniteScrollSponsor";
import Join from "./components/Howtojoin/Join";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import EdukasiList from "./pages/Edukasi/EdukasiList";
import EdukasiDetail from "./pages/Edukasi/EdukasiDetail";
import ObatList from "./pages/Obat/ObatList";
import ObatForm from "./pages/Obat/ObatForm";
import ProgresList from "./pages/Progres/ProgresList";
import ProgresForm from "./pages/Progres/ProgresForm";
import KunjunganList from "./pages/Kunjungan/KunjunganList";
import KunjunganForm from "./pages/Kunjungan/KunjunganForm";
import NotificationList from "./pages/Notifications/NotificationList";
import FamilyManagement from "./pages/Family/FamilyManagement";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Halaman setelah login (navbar harus hilang)
  const protectedRoutes = [
    "/dashboard",
    "/edukasi",
    "/progres",
    "/kunjungan",
    "/obat",
    "/notifications",
    "/family",
  ];

  // Hide Footer & Sponsors on login/signin AND authenticated pages
  const showFooterAndSponsors = !(
    location.pathname === "/login" ||
    location.pathname === "/signin" ||
    isAuthenticated
  );

  // Navbar hanya muncul jika:
  // 1. Bukan halaman login / signin
  // 2. Bukan halaman protected (setelah login)
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signin" ||
    protectedRoutes.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/join" element={<Join />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Edukasi */}
        <Route
          path="/edukasi"
          element={
            <ProtectedRoute>
              <EdukasiList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edukasi/:id"
          element={
            <ProtectedRoute>
              <EdukasiDetail />
            </ProtectedRoute>
          }
        />

        {/* Obat */}
        <Route
          path="/obat"
          element={
            <ProtectedRoute>
              <ObatList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obat/add"
          element={
            <ProtectedRoute>
              <ObatForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obat/edit/:id"
          element={
            <ProtectedRoute>
              <ObatForm />
            </ProtectedRoute>
          }
        />

        {/* Progres */}
        <Route
          path="/progres"
          element={
            <ProtectedRoute>
              <ProgresList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progres/add"
          element={
            <ProtectedRoute>
              <ProgresForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progres/edit/:id"
          element={
            <ProtectedRoute>
              <ProgresForm />
            </ProtectedRoute>
          }
        />

        {/* Kunjungan */}
        <Route
          path="/kunjungan"
          element={
            <ProtectedRoute>
              <KunjunganList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kunjungan/add"
          element={
            <ProtectedRoute>
              <KunjunganForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kunjungan/edit/:id"
          element={
            <ProtectedRoute>
              <KunjunganForm />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationList />
            </ProtectedRoute>
          }
        />

        {/* Family Management */}
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <FamilyManagement />
            </ProtectedRoute>
          }
        />
      </Routes>

      {showFooterAndSponsors && <InfiniteScrollSponsors />}
      {showFooterAndSponsors && <Footer />}
    </div>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
