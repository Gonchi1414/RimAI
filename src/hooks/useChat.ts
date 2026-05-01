import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id?: string;
  senderId: string;
  content: string;
  timestamp?: string;
}

export const useChat = (serverUrl: string | null, currentUserId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Usamos una ref para evitar problemas de dependencias en closures
  const intentionalDisconnect = useRef(false);

  useEffect(() => {
    if (!serverUrl) {
      return;
    }

    intentionalDisconnect.current = false;
    setConnectionError(null);
    setMessages([]); // Limpiar mensajes al cambiar de sala/IP

    // Cargar el historial de mensajes desde la API REST
    const cleanUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    fetch(`${cleanUrl}/messages`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error("No se pudo cargar el historial:", err));

    // Inicializa el cliente WebSocket con un límite de reintentos
    const socketInstance = io(serverUrl, {
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log(`Conectado a ${serverUrl}`);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log(`Desconectado del servidor: ${reason}`);

      // Si la desconexión fue porque el servidor se cerró o se cayó repentinamente
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
        // Podríamos manejar la desconexión aquí, pero dejamos que socket.io intente reconectar
        // Si los reintentos fallan, lanzará un connect_error.
      }
    });

    socketInstance.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionError(`Error de conexión: Verifica la IP y que el servidor esté activo.`);
      console.error('Connection error:', err);
      // Detenemos los reintentos si hubo un error claro (opcional)
      // socketInstance.disconnect(); 
    });

    // Escucha el evento 'messageReceived' emitido por tu EventsGateway en NestJS
    socketInstance.on('messageReceived', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [serverUrl]);

  const sendMessage = useCallback((content: string) => {
    if (socket && content.trim()) {
      const createMessageDto = {
        senderId: currentUserId,
        content: content.trim(),
      };

      // Emite el evento 'newMessage' que espera tu servidor
      socket.emit('newMessage', createMessageDto);
    }
  }, [socket, currentUserId]);

  const disconnect = useCallback(() => {
    if (socket) {
      intentionalDisconnect.current = true;
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  return { messages, sendMessage, isConnected, connectionError, disconnect };
};
