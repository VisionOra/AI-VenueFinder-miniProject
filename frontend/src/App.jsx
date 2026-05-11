import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getMe } from "./api/auth";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShortlistPage from "./pages/ShortlistPage";
import VenueListPage from "./pages/VenueListPage";
import useAuthStore from "./store/authStore";
import useShortlistStore from "./store/shortlistStore";

// Pages that use their own full-screen layout (no shared Navbar)
const FULL_SCREEN_ROUTES = ["/", "/login", "/register"];

function AppRoutes() {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const { fetchShortlist } = useShortlistStore();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      getMe()
        .then(({ data }) => {
          setUser(data);
          fetchShortlist();
        })
        .catch(() => logout());
    }
  }, []);

  // Authenticated users never see the landing / auth pages
  if (isAuthenticated && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    return <Navigate to="/venues" replace />;
  }

  // Show Navbar only on inner app pages
  const showNavbar = isAuthenticated && !FULL_SCREEN_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-950">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public landing & auth */}
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/venues" replace />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/venues" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/venues" replace />} />

        {/* Protected app routes */}
        <Route path="/venues" element={isAuthenticated ? <VenueListPage /> : <Navigate to="/login" replace />} />
        <Route path="/shortlist" element={isAuthenticated ? <ShortlistPage /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/venues" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
