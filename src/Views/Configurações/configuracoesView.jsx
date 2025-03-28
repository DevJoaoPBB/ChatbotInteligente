import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Trash2, Edit, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos padrão


Modal.setAppElement("#root");

const Configuracoes = () => {
  const [informacoes, setInformacoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaInformacao, setNovaInformacao] = useState({ palavraChave: "", descricao: "", usuario: "" });
  const [infoEditando, setInfoEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  // Verificar se o usuário está logado
  useEffect(() => {
    const Usuario = localStorage.getItem("userEmail");
    if (Usuario) {
      setUserEmail(Usuario);
    } else {
      toast.warning("Usuário não autenticado. Faça login novamente!"); // Alerta de aviso
      // Aqui poderia redirecionar para a página de login, se necessário
    }
  }, []);

  const fetchInformacoes = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        toast.warning("Usuário não autenticado. Faça login novamente!"); // Alerta de aviso
        return;
      }

      const response = await fetch("http://localhost:7373/informacoes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail, // Passa o e-mail no cabeçalho
        },
      });

      if (!response.ok) {
        //throw new Error();
        toast.error(`Erro ao buscar informações: ${response.statusText}`); // Alerta de erro
      }

      const data = await response.json();
      setInformacoes(data.data);
    } catch (error) {
      console.error("Erro ao carregar informações:", error);
      toast.error("Erro ao carregar informações." || error.message); // Alerta de erro
    } finally {
      setCarregando(false);
    }
  };


  useEffect(() => {
    fetchInformacoes();
  }, []);

  const abrirModal = useCallback((info = null) => {
    setInfoEditando(info);
    setNovaInformacao(
      info ? { palavraChave: info.PALAVRASCHAVE, descricao: info.INFORMACAO, usuario: info.USUARIO } : { palavraChave: "", descricao: "", usuario: "" }
    );
    setModalAberto(true);

    // Focar no primeiro campo do modal
    setTimeout(() => document.getElementsByName('palavraChave')[0]?.focus(), 0);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setInfoEditando(null);
  }, []);

  const handleInputChange = (e) => {
    setNovaInformacao({ ...novaInformacao, [e.target.name]: e.target.value });
  };

  const salvarInformacao = async () => {
    if (!novaInformacao.palavraChave.trim() || !novaInformacao.descricao.trim()) {
      //alert("Preencha todos os campos!");
      toast.warning("Preencha todos os campos!");

      return;
    }

    if (!userEmail) {
      toast.warning("Usuário não autenticado. Faça login novamente!"); // Alerta de erro

      return;
    }

    const method = infoEditando ? "PUT" : "POST";
    const url = infoEditando
      ? `http://localhost:7373/informacoes/${infoEditando.REGISTRO}`
      : "http://localhost:7373/informacoes";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail, // Passa o e-mail no cabeçalho
        },
        body: JSON.stringify(novaInformacao),
      });

      if (!response.ok)
        toast.error(`Erro ao salvar informação: ${response.statusText}`); // Alerta de erro

      fecharModal();
      fetchInformacoes();
      //alert("Informação salva com sucesso!");
      toast.success("Informação salva com sucesso!"); // Alerta de sucesso
    } catch (error) {
      console.error("Erro:", error);
      //alert(error.message || "Erro ao salvar informação");
      toast.error("Erro ao salvar informação." || error.message);
    }
  };

  const excluirInformacao = async (id) => {
    try {
      const response = await fetch(`http://localhost:7373/configuracoes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Erro ao excluir informação: ${response.statusText}`);
      fetchInformacoes();
      //alert("Informação excluída com sucesso!");
      toast.info("Informação excluída com sucesso!"); // Alerta de informação
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao excluir informação." || error.message); // Alerta de erro
    }
  };

  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-2xl h-full">
        <h1 className="w-full rounded-2xl bg-blue-700 text-center p-1 text-2xl text-white font-semibold mb-4">Configurações do Chatbot</h1>


      <ToastContainer
        position="top-right"
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
};

export default Configuracoes;
