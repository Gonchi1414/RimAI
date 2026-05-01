"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Send, User, MoreVertical, Search, Paperclip, LogOut, Server } from 'lucide-react';

const CURRENT_USER_ID = 'mi-usuario-id'; // Reemplázalo por la sesión real

export default function ChatApp() {
  const [activeServerUrl, setActiveServerUrl] = useState<string | null>(null);
  const [ipInput, setIpInput] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
  const [recentError, setRecentError] = useState<string | null>(null);

  const { messages, sendMessage, isConnected, connectionError, disconnect } = useChat(activeServerUrl, CURRENT_USER_ID);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Si hay un error de conexión, regresamos a la pantalla de IP
  useEffect(() => {
    if (connectionError && activeServerUrl) {
      setRecentError(connectionError);
      setActiveServerUrl(null);
      disconnect(); // Asegurar limpieza
    }
  }, [connectionError, activeServerUrl, disconnect]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipInput.trim()) {
      setRecentError(null);
      setActiveServerUrl(ipInput.trim());
    }
  };

  const handleManualDisconnect = () => {
    setActiveServerUrl(null);
    setRecentError(null);
    disconnect();
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- PANTALLA DE CONEXIÓN (IP) ---
  if (!activeServerUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#09090b] flex items-center justify-center p-4 md:p-8 font-sans text-slate-100">
        <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col items-center relative overflow-hidden">
          
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)] rotate-3">
            <Server size={40} className="text-white -rotate-3" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 mb-2">
            Nexus Gateway
          </h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Ingresa la dirección IP o URL de tu servidor seguro para acceder a la red cifrada.
          </p>

          {recentError && (
            <div className="w-full bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-6 text-sm text-center">
              {recentError}
            </div>
          )}

          <form onSubmit={handleConnect} className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider ml-1">URL del Servidor</label>
              <input 
                type="text" 
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Ej: http://192.168.1.50:3000"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-medium tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Conectar a la Red
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- PANTALLA PRINCIPAL DEL CHAT ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#09090b] flex items-center justify-center p-4 md:p-8 font-sans text-slate-100">
      
      {/* Contenedor Principal: Glassmorphism */}
      <div className="w-full max-w-6xl h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex overflow-hidden relative">
        
        {/* Sidebar (Contactos / Salas) */}
        <div className="hidden md:flex flex-col w-80 border-r border-white/10 bg-black/20 z-10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Nexus Chat
            </h2>
            <button onClick={handleManualDisconnect} className="p-2 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition" title="Desconectar">
              <LogOut size={20} />
            </button>
          </div>
          <div className="p-4">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar mensajes..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-500 transition-all"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/10 cursor-pointer border border-white/5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.03)]">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User size={24} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#1e1b4b] rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-100 font-medium truncate">Canal Global Segura</h3>
                <p className="text-sm text-indigo-300 truncate">Encriptación GCM Activa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área Central de Chat */}
        <div className="flex-1 flex flex-col relative bg-black/10">
          
          {/* Cabecera del Chat */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md z-20 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                {isConnected ? (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-transparent rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                ) : (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-rose-500 border-2 border-transparent rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
                )}
              </div>
              <div>
                <h3 className="text-slate-100 font-medium">Canal Global</h3>
                <p className="text-xs font-medium text-slate-400">
                  {isConnected ? <span className="text-emerald-400">Conectado a {activeServerUrl}</span> : <span className="text-rose-400">Conectando...</span>}
                </p>
              </div>
            </div>
            
            {/* Botón de desconectar para móvil */}
            <button onClick={handleManualDisconnect} className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-rose-400">
               <LogOut size={18} />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-10">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                   <User size={32} className="text-indigo-400/50" />
                </div>
                <p className="font-medium text-slate-400 tracking-wide">Sala vacía. ¡Envía el primer mensaje seguro!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === CURRENT_USER_ID;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group hover:-translate-y-0.5 transition-transform duration-200`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center mr-3 flex-shrink-0 border border-white/10 shadow-md">
                      <span className="text-xs font-bold text-slate-300">{msg.senderId.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div 
                    className={`max-w-[70%] px-5 py-3.5 rounded-3xl backdrop-blur-md relative text-sm md:text-base leading-relaxed ${
                      isMe 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)]' 
                        : 'bg-white/10 text-slate-100 rounded-bl-sm border border-white/10 shadow-lg'
                    }`}
                  >
                    {!isMe && <div className="text-[11px] font-semibold tracking-wider text-indigo-300 mb-1 uppercase">{msg.senderId}</div>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Área del Input */}
          <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/10 z-20">
            <div className="max-w-4xl mx-auto relative flex items-end space-x-2 bg-white/5 border border-white/10 rounded-3xl p-2 transition-all focus-within:bg-white/10 focus-within:border-indigo-500/50 shadow-inner">
              <button className="p-3 text-slate-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/5">
                <Paperclip size={20} />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje seguro..."
                className="w-full max-h-32 min-h-[44px] bg-transparent text-slate-100 placeholder-slate-500 resize-none py-3 focus:outline-none scroll-smooth"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || !isConnected}
                className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                  inputValue.trim() && isConnected
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] hover:scale-105 active:scale-95' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send size={20} className={inputValue.trim() && isConnected ? 'translate-x-0.5 -translate-y-0.5' : ''} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
