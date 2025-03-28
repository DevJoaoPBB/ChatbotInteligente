import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Views/home";
import Informacoes from "./Views/Informacoes/InformacoesView";
import Chatbot from "./Views/Chatbot/chatbotView";
import Login from "./Views/Login/loginView";
import Configuracoes from "./Views/Configurações/configuracoesView";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para Login */}
        <Route path="/login" element={<Login />} />
        <Route path="home" element={<Home />} />
        <Route path="/" element={<Home />}>
          <Route path="informacoes" element={<Informacoes />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="configuracoes" element={<Configuracoes/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
