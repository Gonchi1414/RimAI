"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Server, CheckCircle2, XCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function NlpWebSocketTest() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to the backend WebSocket server
    // Note: URL might need to be dynamic or use environment variables in production
    const socketInstance = io("http://localhost:3000", {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to RegIA WebSocket");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from RegIA WebSocket");
    });

    // Listen for the NLP response from the backend
    // Replace 'message_response' with your actual backend event name if different
    // Escuchar mensajes de CHAT (anonimizados)
    socketInstance.on("messageReceived", (data: any) => {
      const responseMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: data.content, // El backend devuelve 'content'
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, responseMessage]);
    });

    // Escuchar respuestas de COMANDOS
    socketInstance.on("commandExecuted", (data: any) => {
      const responseMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: `Comando: ${data.command}\nResultado: ${data.result}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, responseMessage]);
    });

    // Escuchar ERRORES (opcional pero recomendado)
    socketInstance.on("error", (data: any) => {
      console.error("Error desde el servidor:", data.message);
    });


    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !socket || !isConnected) return;

    // Add user message to UI
    const newUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);

    // Emit the message to the backend
    // Replace 'send_message' with your actual backend event name if different
    socket.emit("newMessage", {
      senderId: "test-user-123", // Necesario para el DTO
      content: inputValue.trim() // El backend espera 'content'
    });

    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[600px] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl font-sans text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Server size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white">Prueba NLP RegIA</h2>
            <p className="text-xs text-slate-400 flex items-center mt-0.5">
              <span className="mr-1">Estado:</span>
              {isConnected ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <CheckCircle2 size={12} className="mr-1" /> Conectado
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium animate-pulse">
                  <XCircle size={12} className="mr-1" /> Desconectado
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <p className="text-sm">Envía un mensaje para probar el flujo de NLP.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                  }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span
                  className={`text-[10px] mt-1.5 block opacity-60 ${isUser ? "text-right" : "text-left"
                    }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center w-full"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            placeholder={
              isConnected
                ? "Escribe un mensaje para probar el NLP..."
                : "Esperando conexión..."
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="absolute right-2 p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors flex items-center justify-center"
          >
            <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
