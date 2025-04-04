import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Menu, Home, FileText, MessageSquareMore, LogOut, Settings } from "lucide-react";

function Principal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on first render

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    if (!userName && !userEmail) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (location.pathname !== "/home") {
      setShowInfo(false);
    } else {
      setShowInfo(true);
    }

    if (location.pathname === "/") {
      setShowInfo(true);
    }

    // Close sidebar when navigating on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const saudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const turno = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "sua manhã";
    if (hora < 18) return "sua tarde";
    return "sua noite";
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-3 flex justify-between items-center">
        <button
          className="p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold">Menu</h1>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Sidebar - Shows on desktop, toggles on mobile */}
      <div
        className={`bg-gray-900 text-white flex flex-col p-4 transition-all duration-300 ease-in-out overflow-hidden 
          ${isOpen ? "w-64 fixed md:relative z-50 h-full" : "w-0 md:w-20"} 
          ${isMobile && !isOpen ? "hidden" : ""}`}
        style={{ minHeight: isMobile ? "calc(100vh - 56px)" : "100vh" }}
      >
        {!isMobile && (
          <div className="flex items-center mb-6">
            <button
              className="flex gap-2 items-center justify-center text-white p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={32} />
              {isOpen && <span>Menu</span>}
            </button>
          </div>
        )}

        <nav className="flex flex-col gap-3 flex-grow">
          <NavLink 
            to="/home" 
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-12 justify-center"}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Home size={24} className="min-w-[24px]" />
            {isOpen && <span className="ml-3">Home</span>}
          </NavLink>

          <NavLink 
            to="/informacoes" 
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-12 justify-center"}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FileText size={24} className="min-w-[24px]" />
            {isOpen && <span className="ml-3">Informações</span>}
          </NavLink>

          <NavLink 
            to="/chatbot" 
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-12 justify-center"}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <MessageSquareMore size={24} className="min-w-[24px]" />
            {isOpen && <span className="ml-3">Chatbot</span>}
          </NavLink>

          <NavLink 
            to="/configuracoes" 
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-12 justify-center"}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Settings size={24} className="min-w-[24px]" />
            {isOpen && <span className="ml-3">Configurações</span>}
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-all ${isOpen ? "w-full" : "w-12 justify-center"}`}
        >
          <LogOut size={24} className="min-w-[24px]" />
          {isOpen && <span className="ml-3">Sair</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto" style={{ 
        height: isMobile ? "calc(100vh - 56px)" : "100vh",
        marginLeft: isMobile ? 0 : isOpen ? "256px" : "80px"
      }}>
        <Outlet />

        {showInfo && (
          <div className="bg-blue-100 p-4 rounded-lg shadow-md mb-4">
            <h1 className="text-lg font-semibold">{saudacao()}!</h1>
            <p className="text-gray-700">Aqui estão algumas informações importantes para começar {turno()}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Principal;