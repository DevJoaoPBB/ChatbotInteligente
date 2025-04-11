import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Trash2, Edit, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos padrão



Modal.setAppElement("#root");

const Informacoes = () => {
  const [informacoes, setInformacoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaInformacao, setNovaInformacao] = useState({ palavrachave: "", descricao: "", usuario: "" });
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
      const response = await fetch("https://chatbotinteligente-x5rt.onrender.com/informacoes", {
      });
      const dados = await response.json();
      console.log("Resposta da API:", dados); // 👀 Aqui!
      setInformacoes(dados);
    } catch (error) {
      console.error("Erro ao buscar informações:", error);
      toast.error("Erro ao carregar informações.");
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
      info ? { palavrachave: info.palavrachave, descricao: info.descricao, usuario: info.usuario } : { palavrachave: "", descricao: "", usuario: "" }
    );
    setModalAberto(true);

    // Focar no primeiro campo do modal
    setTimeout(() => document.getElementsByName('palavrachave')[0]?.focus(), 0);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setInfoEditando(null);
  }, []);

  const handleInputChange = (e) => {
    setNovaInformacao({ ...novaInformacao, [e.target.name]: e.target.value });
  };

  const salvarInformacao = async () => {
    if (!novaInformacao.palavrachave.trim() || !novaInformacao.descricao.trim()) {
      toast.warning("Preencha todos os campos!");
      return;
    }
  
    const method = infoEditando ? "PUT" : "POST";
    const url = infoEditando
      ? `https://chatbotinteligente-x5rt.onrender.com/informacoes/${infoEditando.id}`
      : `https://chatbotinteligente-x5rt.onrender.com/informacoes`;
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          palavrachave: novaInformacao.palavrachave,
          descricao: novaInformacao.descricao,
          usuario: userEmail,
        }),
      });
  
      if (!response.ok) throw new Error("Erro ao salvar");
  
      toast.success(infoEditando ? "Informação atualizada!" : "Informação adicionada!");
      fecharModal();
      fetchInformacoes();
    } catch (error) {
      console.error("Erro ao salvar informação:", error);
      toast.error("Erro ao salvar informação.");
    }
  };
  
  

  const excluirInformacao = async (id) => {
    try {
      const response = await fetch(`https://chatbotinteligente-x5rt.onrender.com/informacoes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
  
      if (!response.ok) throw new Error("Erro ao excluir");
  
      toast.info("Informação excluída com sucesso!");
      fetchInformacoes();
    } catch (error) {
      console.error("Erro ao excluir informação:", error);
      toast.error("Erro ao excluir informação.");
    }
  };
  
  
  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-2xl h-full">

      <h1 className="w-full rounded-2xl bg-blue-700 text-center p-1 text-2xl text-white font-semibold mb-10">Informações Cadastradas</h1>
      <button onClick={() => abrirModal()} className="bg-green-700 text-white px-4 py-2 w-[20%] rounded-full hover:bg-green-800 mb-4">Adicionar Informação</button>
      {carregando ? (
        <p className="text-center text-gray-300">Carregando informações...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-white rounded-2xl">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-blue-700 py-4 px-4">
                <th className="py-4 px-4">ID</th>
                <th className="py-4 px-4">Palavras-Chave</th>
                <th className="py-4 px-4">Descrição</th>
                <th className="py-4 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {informacoes.map((info, index) => (
                <tr
                  key={info.id}
                  className="even:bg-gray-200 hover:bg-blue-200 transition-all duration-800 cursor-pointer"
                >
                  <td className="py-4 px-4 font-bold text-right text-black">{info.id}</td>
                  <td className="py-4 px-4 text-left text-black">{info.palavrachave}</td>
                  <td className="py-4 px-4 text-left text-black">{info.descricao}</td>
                  <td className="py-4 px-4 text-black text-center flex justify-center gap-2">
                    <button
                      onClick={() => excluirInformacao(info.id)}
                      className="bg-red-600 text-white px-5 py-1 rounded-2xl hover:bg-red-700 flex items-center gap-1"
                      aria-label="Excluir informação"
                    >
                      <Trash2 size={24} />
                    </button>
                    <button
                      onClick={() => abrirModal(info)}
                      className="bg-yellow-500 text-white px-5 py-1 rounded-2xl hover:bg-yellow-600 flex items-center gap-1"
                      aria-label="Editar informação"
                    >
                      <Edit size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={modalAberto}
        onRequestClose={fecharModal}
        contentLabel="Adicionar Informação"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          {/* Cabeçalho */}
          <div className="p-5">
            <h2 className="text-xl bg-blue-600 rounded-lg text-center text-white font-bold">{infoEditando ? "Editar" : "Adicionar"} Informação</h2>
            <h3 className="w-full p-2 border border-gray-300 font-bold text-gray-700 rounded-lg mt-4">Usuário: {userEmail}</h3>
          </div>

          {/* Conteúdo com rolagem se necessário */}
          <div className="flex-1 overflow-auto px-6">
            <input
              type="text"
              name="palavrachave"
              value={novaInformacao.palavrachave}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-400 rounded-lg mb-3"
              placeholder="Palavra-chave"
            />
            <textarea
              name="descricao"
              value={novaInformacao.descricao}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-400 rounded-lg resize-none mb-4"
              placeholder="Descrição"
              rows={8}
            />
          </div>

          {/* Rodapé fixo com botões */}
          <div className="sticky bottom-0 p-4 flex justify-end gap-4 rounded-2xl">
            <button
              onClick={fecharModal}
              className="bg-red-600 text-white px-5 py-2 rounded-2xl hover:bg-red-800"
            >Cancelar</button>

            <button
              onClick={salvarInformacao}
              className="bg-green-700 text-white px-5 py-2 rounded-2xl hover:bg-green-800"
            >
              {infoEditando ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>


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

export default Informacoes;
