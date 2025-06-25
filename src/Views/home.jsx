import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Menu, Home, Tag, FileText, MessageSquareMore, LogOut, Settings } from "lucide-react";

function Principal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(true); // Estado para controlar a exibição da div com informações
  const navigate = useNavigate();
  const location = useLocation(); // Hook para capturar a rota atual

  useEffect(() => {
    // const authToken = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    if (!userName && !userEmail) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Quando a rota mudar, esconder a div de informações
    if (location.pathname !== "/home") {
      setShowInfo(false);
    }
    else
      setShowInfo(true);

    if (location.pathname == "/") {
      setShowInfo(true);
    }
  }, [location]); // Dependência de 'location' para monitorar mudanças de rota

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
    <div className="h-screen bg-gray-600 flex">
      {/* Menu Card */}
      <div
        className={`bg-gray-900 shadow-lg rounded-2xl text-white flex flex-col p-4 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-80" : "w-20"} mt-3 ml-3 mb-3`}>
        <div className="flex items-center mb-6">
          {isOpen && <h2 className="text-xl font-bold"></h2>}
          <button
  className={`flex items-center p-2 rounded-full transition-all duration-200 text-white ${isOpen ? "w-full" : "w-11"} justify-start`}
  onClick={() => setIsOpen(!isOpen)}
>
  <Menu size={28} className="min-w-[28px]" />
  {isOpen && <span className="ml-2 text-left">Menu</span>}
</button>

        </div>
        <nav className="flex flex-col gap-3">
          <NavLink to="/home" className={({ isActive }) =>
            `flex items-center p-2 rounded-full transition-all ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-11"}`}
          >
            <Home size={28} className="min-w-[28px]" />
            {isOpen && <span className="ml-2 text-left">Home</span>}
          </NavLink>
          
          <NavLink to="/informacoes" className={({ isActive }) =>
            `flex items-center p-2 rounded-full transition-all duration-200 ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-11"}`}
          >
            <FileText size={28} className="min-w-[28px]" />
            {isOpen && <span className="ml-2 text-left">Informações</span>}
          </NavLink>

          <NavLink to="/chatbot" className={({ isActive }) =>
            `flex items-center p-2 rounded-full transition-all duration-200 ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-11"}`}
          >
            <MessageSquareMore size={28} className="min-w-[28px]" />
            {isOpen && <span className="ml-2 text-left">Chatbot</span>}
          </NavLink>

          <NavLink to="/configuracoes" className={({ isActive }) =>
            `flex items-center p-2 rounded-full transition-all duration-200 ${isActive ? "bg-blue-700" : "hover:bg-gray-800"} ${isOpen ? "w-full" : "w-11"}`}
          >
            <Settings size={28} className="min-w-[28px]" />
            {isOpen && <span className="ml-2 text-left">Configurações</span>}
          </NavLink>
        </nav>
        <div>
      {/* Seu conteúdo do site */}
    </div>
        
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center p-2 rounded-full hover:bg-gray-800 transition-all duration-200 ${isOpen ? "w-full" : "w-11"}`}
        >
          <LogOut size={28} className="min-w-[28px]" />
          {isOpen && <span className="ml-2 text-left">Sair</span>}
        </button>
      </div>

      {/* Content Card */}
      <div className="flex-1 p-3 shadow-lg rounded-2xl">
        <Outlet />

        {showInfo && (
          <div >
            <div className="flex-1 bg-blue-200 p-4 rounded-2xl shadow-md mb-4">
              <h1 className="text-xl font-semibold">{saudacao()}! </h1>
              <p>Aqui estão algumas informações importantes para começar {turno()}.</p>
            </div>
          </div>

        )}
      </div>
    </div>
  );
}

export default Principal;
