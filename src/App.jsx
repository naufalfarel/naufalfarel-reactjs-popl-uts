import React from "react";
import Navbar from "./components/navbar";
import HeroSection from "./components/HeroSection/HeroSection";
import Login from "./components/Login";
import SignIn from "./components/SignIn";
import About from "./components/about/About";
import InfiniteScrollSponsors from "./components/InfiniteScrollSponsor";
import Join from "./components/Howtojoin/Join";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Footer from "./components/Footer";

const App = () => {
  const location = useLocation();

  // Sembunyikan Footer & Sponsors di halaman login/signin
  const showFooterAndSponsors = !(
    location.pathname === "/login" || location.pathname === "/signin"
  );

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/join" element={<Join />} />
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
