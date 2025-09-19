import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const usePromptCollaboration = (promptId, onRemoteUpdate) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const socketRef = useRef(null);
  const cursorPositions = useRef({});

  useEffect(() => {
    if (!promptId) {
      return () => {};
    }
    const socket = io(socketUrl, {
      query: { promptId },
      auth: { userId: user?.id, token },
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectedUsers((prev) => Array.from(new Set([...prev, socket.id])));
    });

    socket.on('prompt:edit', (payload) => {
      if (payload.content && payload.userId !== user?.id) {
        onRemoteUpdate?.(payload.content);
      }
    });

    socket.on('prompt:cursor', ({ userId, position }) => {
      if (!userId) return;
      cursorPositions.current[userId] = position;
      setConnectedUsers(Object.keys(cursorPositions.current));
    });

    socket.on('chat:message', () => {
      // handled in chat component via events binding
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      cursorPositions.current = {};
      setConnectedUsers([]);
    };
  }, [promptId, onRemoteUpdate, user?.id, token]);

  const emitEdit = useMemo(() => {
    return (content) => {
      if (!socketRef.current || !promptId) return;
      socketRef.current.emit('prompt:edit', {
        promptId,
        content,
        userId: user?.id
      });
    };
  }, [promptId, user?.id]);

  const emitCursor = useMemo(() => {
    return (position) => {
      if (!socketRef.current || !promptId) return;
      socketRef.current.emit('prompt:cursor', {
        promptId,
        position
      });
    };
  }, [promptId]);

  return {
    emitEdit,
    emitCursor,
    connectedUsers
  };
};
