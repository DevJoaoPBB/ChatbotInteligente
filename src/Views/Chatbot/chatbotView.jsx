import React, { useState, useCallback, useEffect, useRef } from "react";
import { MessageCirclePlus, ArrowUp, Loader, Menu, X, Trash2 } from "lucide-react";

function Chatbot() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [IDConversa, setIDConversa] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Carrega conversas do localStorage ao iniciar
  useEffect(() => {
    const ConversasSalvas = localStorage.getItem('chatbot-conversations');
    if (ConversasSalvas) {
      setConversations(JSON.parse(ConversasSalvas));
    }
  }, []);

  // Salva conversas no localStorage quando elas mudam
  useEffect(() => {
    localStorage.setItem('chatbot-conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Cria uma nova conversa
  const IniciarNovaConversa = () => {
    const newConversationId = GerarID();
    setIDConversa(newConversationId);
    setMessages([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Carrega uma conversa existente
  const CarregarConversa = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setIDConversa(conversationId);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Atualiza o histórico de conversas quando as mensagens mudam
  useEffect(() => {
    if (messages.length > 0 && IDConversa) {
      const existingConvIndex = conversations.findIndex(c => c.id === IDConversa);

      const conversationData = {
        id: IDConversa,
        messages: messages,
        lastMessage: messages[messages.length - 1].text.replace(/<[^>]*>/g, '').substring(0, 30),
        updatedAt: Date.now()
      };

      if (existingConvIndex >= 0) {
        // Atualiza conversa existente
        const updatedConversations = [...conversations];
        updatedConversations[existingConvIndex] = conversationData;
        setConversations(updatedConversations);
      } else {
        // Adiciona nova conversa
        setConversations(prev => [conversationData, ...prev]);
      }
    }
  }, [messages, IDConversa]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  const GerarID = () => crypto.randomUUID();

  const formatarTexto = (texto) => {
    return texto
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  };

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Se não houver conversa atual, cria uma nova
    if (!IDConversa) {
      setIDConversa(GerarID());
    }

    const EntradaUsuario = {
      id: GerarID(),
      text: trimmedInput,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, EntradaUsuario]);
    setInput("");
    setIsLoading(true);

    try {
      const userEmail = localStorage.getItem("userEmail");

      const response = await fetch("https://chatbotinteligente-x5rt.onrender.com/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-email": userEmail,
        },
        body: JSON.stringify({ prompt: trimmedInput }),
      });

      const respostaData = await response.json();
      const textoFormatado = formatarTexto(respostaData.response || "Erro ao processar a resposta");

      const RespostaIA = {
        id: GerarID(),
        text: textoFormatado,
        sender: "bot",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, RespostaIA]);
    } catch (error) {
      console.error("Erro ao gerar resposta do bot:", error);

      const RespostaErro = {
        id: GerarID(),
        text: "Desculpe, ocorreu um erro ao processar sua mensagem.",
        sender: "bot",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, RespostaErro]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, IDConversa]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteConversation = (conversationId, e) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);

    if (IDConversa === conversationId) {
      setMessages([]);
      setIDConversa(null);
    }
  };

  return (
    <div className="flex h-full bg-gray-900 rounded-2xl">
      {/* Sidebar */}
      <div className={`rounded-l-2xl transform translate-x-0 md:relative md:translate-x-0 w-60 bg-gray-800 text-white flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex justify-center items-center">
          <h2 className="text-xl font-bold">Histórico</h2>
          <button
            className="md:hidden p-1 rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-2 mt-2 mb-2">
          <button
            onClick={IniciarNovaConversa}
            className="w-full p-3 bg-blue-700 hover:bg-blue-800 rounded-2xl text-white font-medium flex items-center justify-center gap-2"
          >
            <MessageCirclePlus size={28} className="min-w-[28px]" />
            <span>Nova conversa</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => CarregarConversa(conversation.id)}
              className={`p-3 mx-2 my-1 rounded-2xl cursor-pointer hover:bg-gray-700 ${IDConversa === conversation.id ? 'bg-gray-600' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="truncate flex-1">
                  {conversation.lastMessage || "Nova conversa"}
                </div>
                <button
                  onClick={(e) => deleteConversation(conversation.id, e)}
                  className="ml-2 text-white hover:text-red-400"
                >
                  <Trash2 size={26} className="min-w-[28px]" />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(conversation.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile header with menu button */}
        <div className="md:hidden p-4 border-b border-gray-700 flex items-center">
          <button
            className="p-1 rounded-full hover:bg-gray-700 mr-2"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-white">
            {IDConversa ? "Conversa" : "Nova conversa"}
          </h2>
        </div>

        <div className="flex flex-col justify-center items-center bg-gray-900 rounded-2xl h-full">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto space-y-4 w-2/3 scrollbar-hide">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-white text-black flex items-center gap-2">
                <Loader size={24} className="animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center justify-center gap-4 m-4 p-2 rounded-full border-4 border-blue-600 w-2/3 hover:border-blue-400">
            <input
              ref={inputRef}
              aria-label="Digite sua mensagem"
              className="flex-1 ml-3 rounded-lg bg-transparent outline-none text-xl text-white"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              disabled={isLoading}
            />

            <button
              onClick={handleSend}
              className="bg-white text-gray-900 rounded-full p-1 font-semibold cursor-pointer 
                         disabled:cursor-not-allowed disabled:opacity-50 h-[50px] w-[50px] flex items-center justify-center"
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <Loader size={28} className="animate-spin" />
              ) : (
                <ArrowUp size={28} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`p-3 mt-4 rounded-2xl ${isUser ? "bg-gray-700 text-white ml-auto" : "bg-white text-black mr-auto"} 
                  flex flex-col max-w-lg break-words`}
      role="chat message"
    >
      <div dangerouslySetInnerHTML={{ __html: message.text }} />
      <div className={`text-xs mt-2 ${isUser ? "text-gray-300" : "text-gray-600"} text-left`}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Chatbot;