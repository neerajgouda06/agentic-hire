import { io } from 'socket.io-client';

// 'http://localhost:5000' should match backend URL
export const socket = io('http://localhost:5000', {
  autoConnect: false, // Prevents automatic connection until we manually call connect()
});
