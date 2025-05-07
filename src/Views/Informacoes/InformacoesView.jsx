import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Trash2, Edit, Printer } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


Modal.setAppElement("#root");

const Informacoes = () => {
  const [informacoes, setInformacoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaInformacao, setNovaInformacao] = useState({ palavrachave: "", descricao: "", usuario: "" });
  const [infoEditando, setInfoEditando] = useState(null);
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

  // Exemplo de função para buscar informações
  const buscarInformacoes = async () => {
    try {
      const response = await fetch("https://chatbotinteligente-x5rt.onrender.com/informacoes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        }
      });

      const resultado = await response.json();

      if (!resultado.success) {
        console.error("Erro ao buscar informações:", resultado.message);
        return;
      }

      // Map the data to ensure consistent field names
      const formattedData = resultado.data.map(item => ({
        id: item.id,
        palavrachave: item.palavrachave || item.PALAVRASCHAVE || '',
        descricao: item.descricao || item.INFORMACAO || '',
        usuario: item.usuario || item.USUARIO || ''
      }));

      setInformacoes(formattedData);
    } catch (error) {
      console.error("Erro geral ao buscar informações:", error);
      toast.error("Erro ao buscar informações");
    }
  };


  useEffect(() => {
    if (userEmail) {
      buscarInformacoes();
      setCarregando(false);
    }
  }, [userEmail]);


  const abrirModal = useCallback((info = null) => {
    setInfoEditando(info);
    setNovaInformacao(
      info
        ? { palavrachave: info.palavrachave, descricao: info.descricao, usuario: info.usuario }
        : { palavrachave: "", descricao: "", usuario: "" }
    );
    setModalAberto(true);
    setTimeout(() => document.getElementsByName("palavrachave")[0]?.focus(), 0);
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

    if (!userEmail) {
      toast.error("Usuário não autenticado!");
      return;
    }

    const method = infoEditando ? "PUT" : "POST";
    const url = infoEditando
      ? `https://chatbotinteligente-x5rt.onrender.com/informacoes/${infoEditando.id}`
      : `https://chatbotinteligente-x5rt.onrender.com/informacoes`;

    try {
      console.log('Sending request:', {
        method,
        url,
        body: {
          palavraChave: novaInformacao.palavrachave,
          descricao: novaInformacao.descricao
        }
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        },
        body: JSON.stringify({
          palavraChave: novaInformacao.palavrachave,
          descricao: novaInformacao.descricao
        }),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao salvar");
      }

      toast.success(infoEditando ? "Informação atualizada!" : "Informação adicionada!");
      fecharModal();
      buscarInformacoes();
    } catch (error) {
      console.error("Full error:", error);
      toast.error(`Erro ao salvar informação: ${error.message}`);
    }
  };


  const excluirInformacao = async (id) => {
    try {
      const response = await fetch(`https://chatbotinteligente-x5rt.onrender.com/informacoes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail
        }
      });


      if (!response.ok) throw new Error("Erro ao excluir");

      toast.info("Informação excluída com sucesso!");
      buscarInformacoes();
    } catch (error) {
      console.error("Erro ao excluir informação:", error);
      toast.error("Erro ao excluir informação.");
    }
  };

  const carregarImagemComoBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  //GERAÇÃO DO PDF
  const gerarPDF = (info) => {
    const doc = new jsPDF();

    // Definir o caminho para o logo
    const logoUrl = "https://drive.google.com/uc?export=view&id=1rfmfqREllB7Wl_PGQVO5Ou_h4izX_4mZ";
    
    // Definir as posições
    const marginTop = 10;
    const marginLeft = 10;
    const logoWidth = 30;
    const logoHeight = 30;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 2 * marginLeft; // Largura da tabela igual à largura da página (menos as margens)
    const headerHeight = 25; // Altura do cabeçalho

    // Cabeçalho com logo e título dentro de um quadro
    doc.setDrawColor(52, 73, 94); // Cor da borda do quadro
    doc.setFillColor(236, 240, 241); // Cor de fundo do quadro
    doc.rect(marginLeft, marginTop, tableWidth, headerHeight, 'F'); // Desenha o quadro com a mesma largura da tabela

    // Inserir logo
    doc.addImage(logoUrl, 'PNG', marginLeft + 5, marginTop - 2, logoWidth, logoHeight);

    // Inserir título dentro do quadro
    const titulo = "Cadastro de Informações";
    doc.setTextColor(52, 73, 94); // Cor do texto do título
    const textWidth = doc.getTextWidth(titulo);
    const titleX = marginLeft + logoWidth + 10; // Coloca o título à direita do logo
    const titleY = marginTop + 15; // Ajusta a posição vertical do título

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, titleX, titleY);

    // Adicionando a tabela
    autoTable(doc, {
      startY: marginTop + headerHeight + 5,
      head: [["Campo", "Valor"]],
      body: [
        ["ID", "********"],
        ["Palavra-chave", info.palavrachave],
        ["Descrição", info.descricao],
        ["Usuário", info.usuario],
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
      margin: { left: marginLeft, right: marginLeft }, // <-- Essencial para alinhar com o cabeçalho
      tableWidth: tableWidth,
    });


    // Gera um Blob e abre em nova aba
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  //FIM GERAÇÃO PDF

  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-2xl h-full">
      <h1 className="w-full rounded-2xl bg-blue-700 text-center p-1 text-2xl text-white font-semibold mb-10">
        Informações Cadastradas
      </h1>
      <button
        onClick={() => abrirModal()}
        className="bg-green-700 text-white px-4 py-2 w-[20%] rounded-full hover:bg-green-800 mb-4"
      >
        Adicionar Informação
      </button>

      {carregando ? (
        <p className="text-center text-gray-300">Carregando informações...</p>
      ) : informacoes.length === 0 ? (
        <p className="text-center text-gray-400">Nenhuma informação cadastrada.</p>
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
              {informacoes.map((info) => (
                <tr
                  key={info.id}
                  className="even:bg-gray-200 hover:bg-blue-200 transition-all duration-800 cursor-pointer"
                >
                  <td className="px-2 font-bold text-right text-black">{info.id}</td>
                  <td className="px-4 max-h-20 w-60 text-left text-black">{info.palavrachave}</td>
                  <td className="text-left text-black max-h-32 overflow-y-auto whitespace-pre-wrap">
                  <div className="max-h-24 h-24 text-left overflow-y-auto">
                      {info.descricao}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-black text-center flex justify-center gap-2">
                    <button
                      onClick={() => excluirInformacao(info.id)}
                      className="bg-red-600 text-white px-5 py-1 rounded-2xl hover:bg-red-700 flex items-center gap-1"
                      aria-label="Excluir informação"
                    >
                      <Trash2 size={28} />
                    </button>
                    <button
                      onClick={() => abrirModal(info)}
                      className="bg-yellow-500 text-white px-5 py-1 rounded-2xl hover:bg-yellow-600 flex items-center gap-1"
                      aria-label="Editar informação"
                    >

                      <Edit size={24} />
                    </button>
                    <button
                      onClick={() => gerarPDF(info)}
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
        contentLabel="Adicionar Informação"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          <div className="p-5">
            <h2 className="text-xl bg-blue-600 rounded-lg text-center text-white font-bold">
              {infoEditando ? "Editar" : "Adicionar"} Informação
            </h2>
            <h3 className="w-full p-2 border border-gray-300 font-bold text-gray-700 rounded-lg mt-4">
              Usuário: {userEmail}
            </h3>
          </div>

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

          <div className="sticky bottom-0 p-4 flex justify-end gap-4 rounded-2xl">
            <button onClick={fecharModal} className="bg-red-600 text-white px-5 py-2 rounded-2xl hover:bg-red-800">
              Cancelar
            </button>
            <button
              onClick={salvarInformacao}
              className="bg-green-700 text-white px-5 py-2 rounded-2xl hover:bg-green-800"
              disabled={!novaInformacao.palavrachave.trim() || !novaInformacao.descricao.trim()}
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


export default Informacoes;
