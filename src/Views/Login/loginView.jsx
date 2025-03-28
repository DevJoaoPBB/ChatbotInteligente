import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../Assets/Imagens/ICONE.PNG";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos padrão

// Funções de validação
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (senha) => senha.length >= 6;
const validateName = (nome) => nome.trim().length >= 3;

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userEmail")) {
      navigate("/home");
    }
  }, [navigate]);

  const resetFields = () => {
    setEmail("");
    setSenha("");
    setNome("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.warning("Insira um email válido!")
      return;
    }
    if (!validatePassword(senha)) {
      toast.warning("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:7373/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.nome)
        
        navigate("/home");
      } else {
        toast.error("Credenciais inválidas, tente novamente.")
        
      }
    } catch (error) {
      toast.error("Erro ao tentar relizar login, tente novamente.")
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateName(nome)) {
      toast.warning("O nome deve ter pelo menos 3 letras!")
      return;
    }
    if (!validateEmail(email)) {
      toast.warning("Insira um email válido!")
      return;
    }
    if (!validatePassword(senha)) {
      toast.warning("A senha deve ter no minimo 6 caracteres!")
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:7373/nlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar!")
        setIsFlipped(false);
        resetFields();
      } else {
        toast.error("Erro ao realizar cadastro!" || data.message)
      }
    } catch (error) {
      toast.error("Erro ao realizar cadastro!")
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsFlipped(!isFlipped);
    resetFields();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-96 h-[450px] flex items-center justify-center">
        <motion.div
          className="absolute w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Tela de Login (frente) */}
          <div className="absolute w-full h-full backface-hidden" style={{ backfaceVisibility: "hidden" }}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-36 h-36 bg-gray-700 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Logo" className="w-full" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-6">MyChatbot</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                {loading ? (
                  <div className="spinner w-6 h-6 border-t-4 border-blue-600 animate-spin mx-auto mb-4"></div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition"
                  >
                    Acessar
                  </button>
                )}
              </form>
              <p className="text-gray-400 mt-4">
                Não tem uma conta?{" "}
                <button className="text-blue-400" onClick={toggleForm}>
                  Crie agora, é grátis!
                </button>
              </p>
              
            </div>
          </div>

          {/* Tela de Cadastro (verso) */}
          <div
            className="absolute w-full h-full backface-hidden"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-36 h-36 bg-gray-700 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Logo" className="w-full" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-6">Crie sua Conta</h2>
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                {loading ? (
                  <div className="spinner w-6 h-6 border-t-4 border-green-600 animate-spin mx-auto mb-4"></div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg transition"
                  >
                    Cadastrar
                  </button>
                )}
              </form>
              <p className="text-gray-400 mt-4">
                Já tem uma conta?{" "}
                <button className="text-blue-400" onClick={toggleForm}>
                  Faça login
                </button>
              </p>
              
            </div>
          </div>
        </motion.div>
      </div>
      <ToastContainer
              position="top-center"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastStyle={{
                color: "white",
                //fontWeight: "bold",
                fontSize: "18px",
              }}
              toastClassName="custom-toast"
            />
            <style>
              {`
          .custom-toast .Toastify__toast-icon {
            width: 36px !important;
            height: 36px !important;
          }
        `}
            </style>
      
    </div>
  );
}
