import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Trash2, Edit, Printer } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import icone from "./icone.png"; // Caminho relativo para o logo

Modal.setAppElement("#root");

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({ categoria: "", usuario: "" });
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const Usuario = localStorage.getItem("userEmail");
    if (Usuario) {
      setUserEmail(Usuario);
    } else {
      toast.warning("Usuário não autenticado. Faça login novamente!");
    }
  }, []);

  const buscarCategorias = async () => {
    try {
      const response = await fetch("https://chatbotinteligente-x5rt.onrender.com/categorias", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        }
      });

      const resultado = await response.json();

      if (!resultado.success) {
        console.error("Erro ao buscar categorias:", resultado.message);
        return;
      }

      // Map the data to ensure consistent field names
      const formattedData = resultado.data.map(item => ({
        id: item.id,
        categoria: item.categoria || item.CATEGORIA || '',
        usuario: item.usuario || item.USUARIO || '',
        data_atualizacao: item.data_atualizacao || item.DATA_ATUALIZACAO || ''
      }));

      setCategorias(formattedData);
    } catch (error) {
      console.error("Erro geral ao buscar categorias:", error);
      toast.error("Erro ao buscar categorias");
    }
  };

  useEffect(() => {
    if (userEmail) {
      buscarCategorias();
      setCarregando(false);
    }
  }, [userEmail]);

  const abrirModal = useCallback((categoria = null) => {
    setCategoriaEditando(categoria);
    setNovaCategoria(
      categoria
        ? { categoria: categoria.categoria, usuario: categoria.usuario }
        : { categoria: "", usuario: "" }
    );
    setModalAberto(true);
    setTimeout(() => document.getElementsByName("categoria")[0]?.focus(), 0);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setCategoriaEditando(null);
  }, []);

  const handleInputChange = (e) => {
    setNovaCategoria({ ...novaCategoria, [e.target.name]: e.target.value });
  };

  const salvarCategoria = async () => {
    if (!novaCategoria.categoria.trim()) {
      toast.warning("Preencha o campo categoria!");
      return;
    }

    if (!userEmail) {
      toast.error("Usuário não autenticado!");
      return;
    }

    const method = categoriaEditando ? "PUT" : "POST";
    const url = categoriaEditando
      ? `https://chatbotinteligente-x5rt.onrender.com/categorias/${categoriaEditando.id}`
      : `https://chatbotinteligente-x5rt.onrender.com/categorias`;

    try {
      console.log('Sending request:', {
        method,
        url,
        body: {
          categoria: novaCategoria.categoria
        }
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        },
        body: JSON.stringify({
          categoria: novaCategoria.categoria
        }),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao salvar");
      }

      toast.success(categoriaEditando ? "Categoria atualizada!" : "Categoria adicionada!");
      fecharModal();
      buscarCategorias();
    } catch (error) {
      console.error("Full error:", error);
      toast.error(`Erro ao salvar categoria: ${error.message}`);
    }
  };

  const excluirCategoria = async (id) => {
    try {
      const response = await fetch(`https://chatbotinteligente-x5rt.onrender.com/categorias/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        }
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.info("Categoria excluída com sucesso!");
      buscarCategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria.");
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    
    try {
      const data = new Date(dataString);
      
      // Verifica se a data é válida
      if (isNaN(data.getTime())) return dataString;
      
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      
      return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dataString;
    }
  };

  const gerarPDF = async (categoria) => {
    const doc = new jsPDF();
  
    try {
      // Carrega a imagem do import (icone.png) como Blob -> base64
      const response = await fetch(icone);
      const blob = await response.blob();
      const reader = new FileReader();
  
      const logoBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  
      // Layout
      const marginTop = 10;
      const marginLeft = 10;
      const logoWidth = 30;
      const logoHeight = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = pageWidth - 2 * marginLeft;
      const headerHeight = 25;
  
      // Cabeçalho
      doc.setDrawColor(52, 73, 94);
      doc.setFillColor(236, 240, 241);
      doc.rect(marginLeft, marginTop, tableWidth, headerHeight, 'F');
      doc.addImage(logoBase64, 'PNG', marginLeft + 5, marginTop - 2, logoWidth, logoHeight);
  
      const titulo = "Cadastro de Categorias";
      doc.setTextColor(52, 73, 94);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(titulo, marginLeft + logoWidth + 10, marginTop + 15);
  
      // Tabela
      autoTable(doc, {
        startY: marginTop + headerHeight + 5,
        head: [["Campo", "Valor"]],
        body: [
          ["ID", "********"],
          ["Categoria", categoria.categoria],
          ["Usuário", categoria.usuario],
          ["Data de Atualização", categoria.data_atualizacao],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          halign: "center",
        },
        styles: {
          fontSize: 12,
        },
        margin: { left: marginLeft, right: marginLeft },
        tableWidth: tableWidth,
      });
  
      // Abre o PDF
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-2xl h-full">
      <h1 className="w-full rounded-2xl bg-blue-700 text-center p-1 text-2xl text-white font-semibold mb-10">
        Categorias Cadastradas
      </h1>
      <button
        onClick={() => abrirModal()}
        className="bg-green-700 text-white px-4 py-2 w-[20%] rounded-full hover:bg-green-800 mb-4"
      >
        Adicionar Categoria
      </button>

      {carregando ? (
        <p className="text-center text-gray-300">Carregando categorias...</p>
      ) : categorias.length === 0 ? (
        <p className="text-center text-gray-400">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-white rounded-2xl">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-blue-700 py-4 px-4">
                <th className="py-4 text-right px-4">ID</th>
                <th className="py-4 text-left px-4">Categoria</th>
                <th className="py-4 text-left px-4">Data de Atualização</th>
                <th className="py-4 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr
                  key={cat.id}
                  className="even:bg-gray-200 hover:bg-blue-200 transition-all duration-800 cursor-pointer"
                >
                  <td className="px-2 font-bold text-right text-black">{cat.id}</td>
                  <td className="px-4 max-h-20 w-60 text-left text-black">{cat.categoria}</td>
                  <td className="px-4 text-left text-black">{formatarData(cat.data_atualizacao)}</td>
                  <td className="py-4 px-4 text-black text-center flex justify-center gap-2">
                    <button
                      onClick={() => excluirCategoria(cat.id)}
                      className="bg-red-600 text-white px-5 py-1 rounded-2xl hover:bg-red-700 flex items-center gap-1"
                      aria-label="Excluir categoria"
                    >
                      <Trash2 size={28} />
                    </button>
                    <button
                      onClick={() => abrirModal(cat)}
                      className="bg-yellow-500 text-white px-5 py-1 rounded-2xl hover:bg-yellow-600 flex items-center gap-1"
                      aria-label="Editar categoria"
                    >
                      <Edit size={24} />
                    </button>
                    <button
                      onClick={() => gerarPDF(cat)}
                      className="bg-white text-black px-5 py-1 border border-gray-500 rounded-2xl hover:bg-gray-200 flex items-center gap-1"
                      aria-label="Imprimir"
                    >
                      <Printer size={24} />
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
        contentLabel="Adicionar Categoria"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          <div className="p-5">
            <h2 className="text-xl bg-blue-600 rounded-lg text-center text-white font-bold">
              {categoriaEditando ? "Editar" : "Adicionar"} Categoria
            </h2>
            <h3 className="w-full p-2 border border-gray-300 font-bold text-gray-700 rounded-lg mt-4">
              Usuário: {userEmail}
            </h3>
          </div>

          <div className="flex-1 overflow-auto px-6">
            <input
              type="text"
              name="categoria"
              value={novaCategoria.categoria}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-400 rounded-lg mb-3"
              placeholder="Nome da Categoria"
            />
          </div>

          <div className="sticky bottom-0 p-4 flex justify-end gap-4 rounded-2xl">
            <button onClick={fecharModal} className="bg-red-600 text-white px-5 py-2 rounded-2xl hover:bg-red-800">
              Cancelar
            </button>
            <button
              onClick={salvarCategoria}
              className="bg-green-700 text-white px-5 py-2 rounded-2xl hover:bg-green-800"
              disabled={!novaCategoria.categoria.trim()}
            >
              {categoriaEditando ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick={false}
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{ color: "white", fontSize: "18px" }}
        toastClassName="custom-toast"
      />

      <style>{`.custom-toast .Toastify__toast-icon { width: 36px !important; height: 36px !important; }`}</style>
    </div>
  );
};

export default Categorias;