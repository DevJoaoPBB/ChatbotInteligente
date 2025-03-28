import React, { useState, useCallback, useEffect, useRef } from "react";
import { MessageCircle, ArrowUp, Loader, X, MessageCirclePlus } from "lucide-react";

function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [IDConversa, setIDConversa] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Cria uma nova conversa
    const IniciarNovaConversa = () => {
        const newConversationId = GerarID();
        setIDConversa(newConversationId);
        setMessages([]);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    // Fecha o chat e limpa as conversas
    const handleCloseChat = () => {
        setIsOpen(false);
        setMessages([]);
        setIDConversa(null);
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen, isLoading]);

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

            const response = await fetch("http://localhost:7373/chatbot", {
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

    // Estilos inline para garantir que o componente funcione em qualquer site
    const styles = {
        floatingButton: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
            zIndex: 9999,
            border: 'none',
            outline: 'none'
        },
        chatContainer: {
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            zIndex: 9998,
            overflow: 'hidden'
        },
        chatHeader: {
            padding: '12px',
            backgroundColor: '#111827',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #374151'
        },
        messagesContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: '#1f2937'
        },
        inputContainer: {
            padding: '12px',
            backgroundColor: '#111827',
            borderTop: '1px solid #374151',
            display: 'flex',
            alignItems: 'center'
        },
        input: {
            flex: 1,
            backgroundColor: '#374151',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 12px',
            color: 'white',
            outline: 'none',
            marginRight: '8px'
        },
        sendButton: {
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        messagesContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: '#1f2937',
            /* Ocultar barra de rolagem */
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none', /* IE 10+ */
            '&::-webkit-scrollbar': {
              display: 'none', /* Chrome, Safari, Opera */
              width: 0,
              height: 0,
              background: 'transparent'
            }
        }
    };

    return (
        <>
            {/* Botão flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.floatingButton}
                aria-label="Abrir chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Container do chat */}
            <div style={styles.chatContainer} ref={chatContainerRef}>
                {/* Cabeçalho do chat */}
                <div style={styles.chatHeader}>
                    <div>
                        <button
                            onClick={IniciarNovaConversa}
                            style={{
                                backgroundColor: '#2563eb',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <MessageCirclePlus size={16} />
                            <span>Nova</span>
                        </button>
                    </div>
                    <button
                        onClick={handleCloseChat}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Área de mensagens */}
                <div style={{ ...styles.messagesContainer, overflowY: 'auto' }}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                padding: '8px 12px',
                                marginBottom: '8px',
                                borderRadius: '8px',
                                backgroundColor: msg.sender === 'user' ? '#2563eb' : '#374151',
                                color: 'white',
                                marginLeft: msg.sender === 'user' ? 'auto' : '0', // Alinha à direita se for usuário
                                marginRight: msg.sender === 'bot' ? 'auto' : '0', // Alinha à esquerda se for bot
                                maxWidth: '80%',
                                wordBreak: 'break-word'
                            }}
                            role="chat message"
                        >
                            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            <div style={{
                                fontSize: '0.75rem',
                                marginTop: '4px',
                                color: msg.sender === 'user' ? '#d1d5db' : '#9ca3af',
                                textAlign: msg.sender === 'user' ? 'right' : 'left' // Alinha o horário
                            }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input de mensagem */}
                <div style={styles.inputContainer}>
                    <input
                        ref={inputRef}
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            ...styles.sendButton,
                            opacity: (!input.trim() || isLoading) ? 0.5 : 1,
                            cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!input.trim() || isLoading}
                        aria-label="Enviar mensagem"
                    >
                        {isLoading ? (
                            <Loader size={16} className="animate-spin" />
                        ) : (
                            <ArrowUp size={16} />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

// Função para injetar o chatbot em qualquer site
export function injectChatbot() {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const style = document.createElement('style');
    style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `;
    document.head.appendChild(style);

    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const { createRoot } = ReactDOM;

    if (React && ReactDOM) {
        createRoot(root).render(<FloatingChatbot />);
    } else {
        console.error('React and ReactDOM must be available on window object');
    }
}

export default FloatingChatbot;