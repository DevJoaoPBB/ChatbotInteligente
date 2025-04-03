import React, { useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const Configuracoes = () => {
  const [selectedAI, setSelectedAI] = useState("Gemini");

  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-2xl h-full">
      <h1 className="w-full rounded-2xl bg-blue-700 text-center p-1 text-2xl text-white font-semibold mb-4">
        Configurações do Chatbot
      </h1>

      {/* Seleção de IA */}
      <div className="mb-4">
        <label className="text-white rounded-lg font-semibold block mb-2">Selecionar IA:</label>
        <select
          className="p-2 rounded-lg bg-gray-800 w-[50%] text-white border border-gray-600"
          value={selectedAI}
          onChange={(e) => setSelectedAI(e.target.value)}
        >
          <option value="Gemini">Gemini</option>
          <option value="ChatGPT">ChatGPT</option>
          <option value="DeepSeek">DeepSeek</option>
        </select>
      </div>

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
        toastStyle={{ color: "white", fontSize: "18px" }}
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
