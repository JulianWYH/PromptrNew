import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Connect to Socket.IO server on port 3001
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin  // In production, both servers run on same port
        : 'http://localhost:3001'; // In development, Socket.IO runs on 3001
        
      console.log('Connecting to Socket.IO server at:', socketUrl);
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected
  };
}

export default useSocket;
