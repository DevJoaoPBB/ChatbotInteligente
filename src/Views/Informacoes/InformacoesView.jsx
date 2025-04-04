import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Trash2, Edit, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos padrão
import { db } from "../../Models/FirebaseConfigModel.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

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
      toast.warning("Usuário não autenticado. Faça login novamente!");
    }
  }, []);

  const fetchInformacoes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, localStorage.getItem("userEmail")));
      const dados = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInformacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar informações:", error);
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
  
    try {
      if (infoEditando) {
        const docRef = doc(db, localStorage.getItem("userEmail"), infoEditando.id);
        await updateDoc(docRef, {
          palavrachave: novaInformacao.palavrachave,
          descricao: novaInformacao.descricao,
          usuario: userEmail,
        });
        toast.success("Informação atualizada com sucesso!");
      } else {
        await addDoc(collection(db, localStorage.getItem("userEmail")), {
          palavrachave: novaInformacao.palavrachave,
          descricao: novaInformacao.descricao,
          usuario: userEmail,
        });
        toast.success("Informação adicionada com sucesso!");
      }
  
      fecharModal();
      fetchInformacoes();
    } catch (error) {
      console.error("Erro ao salvar informação:", error);
      toast.error("Erro ao salvar informação.");
    }
  };

  const excluirInformacao = async (id) => {
    try {
      await deleteDoc(doc(db, localStorage.getItem("userEmail"), id));
      toast.info("Informação excluída com sucesso!");
      fetchInformacoes();
    } catch (error) {
      console.error("Erro ao excluir informação:", error);
      toast.error("Erro ao excluir informação.");
    }
  };

  return (
    <div className="flex flex-col p-4 sm:p-6 bg-gray-900 rounded-2xl h-full min-h-screen">

      <h1 className="w-full rounded-2xl bg-blue-700 text-center p-2 text-xl sm:text-2xl text-white font-semibold mb-6 sm:mb-10">Informações Cadastradas</h1>
      
      <button 
        onClick={() => abrirModal()} 
        className="bg-green-700 text-white px-4 py-2 w-full sm:w-[20%] rounded-full hover:bg-green-800 mb-4 text-sm sm:text-base"
      >
        Adicionar Informação
      </button>
      
      {carregando ? (
        <p className="text-center text-gray-300">Carregando informações...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-white rounded-2xl">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-blue-700">
                <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">ID</th>
                <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Palavras-Chave</th>
                <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Descrição</th>
                <th className="py-3 px-2 sm:px-4 text-sm sm:text-base text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {informacoes.map((info, index) => (
                <tr
                  key={info.id}
                  className="even:bg-gray-200 hover:bg-blue-200 transition-all duration-800 cursor-pointer"
                >
                  <td className="py-3 px-2 sm:px-4 font-bold text-right text-black text-xs sm:text-sm truncate max-w-[50px] sm:max-w-none">
                    {info.id}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left text-black text-xs sm:text-sm">
                    {info.palavrachave}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left text-black text-xs sm:text-sm">
                    {info.descricao.length > 30 ? `${info.descricao.substring(0, 30)}...` : info.descricao}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-black flex justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => excluirInformacao(info.id)}
                      className="bg-red-600 text-white p-1 sm:px-3 sm:py-1 rounded-2xl hover:bg-red-700 flex items-center gap-1"
                      aria-label="Excluir informação"
                    >
                      <Trash2 size={18} className="sm:size-5" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                    <button
                      onClick={() => abrirModal(info)}
                      className="bg-yellow-500 text-white p-1 sm:px-3 sm:py-1 rounded-2xl hover:bg-yellow-600 flex items-center gap-1"
                      aria-label="Editar informação"
                    >
                      <Edit size={18} className="sm:size-5" />
                      <span className="hidden sm:inline">Editar</span>
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
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Cabeçalho */}
          <div className="p-3 sm:p-5">
            <h2 className="text-lg sm:text-xl bg-blue-600 rounded-lg text-center text-white font-bold p-2">
              {infoEditando ? "Editar" : "Adicionar"} Informação
            </h2>
            <h3 className="w-full p-2 border border-gray-300 font-bold text-gray-700 rounded-lg mt-2 sm:mt-4 text-sm sm:text-base">
              Usuário: {userEmail}
            </h3>
          </div>

          {/* Conteúdo com rolagem se necessário */}
          <div className="flex-1 overflow-auto px-3 sm:px-6">
            <input
              type="text"
              name="palavrachave"
              value={novaInformacao.palavrachave}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-400 rounded-lg mb-2 sm:mb-3 text-sm sm:text-base"
              placeholder="Palavra-chave"
            />
            <textarea
              name="descricao"
              value={novaInformacao.descricao}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-400 rounded-lg resize-none mb-3 sm:mb-4 text-sm sm:text-base"
              placeholder="Descrição"
              rows={6}
            />
          </div>

          {/* Rodapé fixo com botões */}
          <div className="sticky bottom-0 p-3 sm:p-4 bg-white flex justify-end gap-2 sm:gap-4 rounded-b-2xl border-t">
            <button
              onClick={fecharModal}
              className="bg-red-600 text-white px-3 sm:px-5 py-1 sm:py-2 rounded-2xl hover:bg-red-800 text-sm sm:text-base"
            >
              Cancelar
            </button>

            <button
              onClick={salvarInformacao}
              className="bg-green-700 text-white px-3 sm:px-5 py-1 sm:py-2 rounded-2xl hover:bg-green-800 text-sm sm:text-base"
            >
              {infoEditando ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>

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
          fontSize: "14px",
        }}
        toastClassName="custom-toast"
      />
      
      <style>
        {`
          .custom-toast .Toastify__toast-icon {
            width: 24px !important;
            height: 24px !important;
          }
          @media (min-width: 640px) {
            .custom-toast .Toastify__toast-icon {
              width: 36px !important;
              height: 36px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Informacoes;