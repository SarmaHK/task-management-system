import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// 1. Create a core HTTP server wrapping Express app
const server = http.createServer(app);

// 2. Initialize Socket.IO and export it
export const io = new Server(server, {
  cors: {
    origin: '*', // Allows React frontend to connect
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// 3. Socket.IO Authentication Middleware (Using Headers/Auth Payload)
io.use((socket, next) => {
  try {
    // Check for the token in the handshake auth object OR standard authorization header
    const authHeader = socket.handshake.headers.authorization;
    const token = socket.handshake.auth?.token || (authHeader && authHeader.split(' ')[1]);

    if (!token) {
      return next(new Error('Authentication error: Token missing from request.'));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Attach the decoded user data to the socket object
    socket.data.user = decoded;

    next(); // Security passed! Let them connect.
  } catch (error) {
    console.error('Socket JWT Error:', error);
    next(new Error('Authentication error: Invalid or expired token.'));
  }
});

// 4. Listen for real-time connections
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id} (User ID: ${socket.data.user?.id || 'Unknown'})`);

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    // 5. CRITICAL: Use server.listen instead of app.listen!
    server.listen(config.PORT, () => {
      console.log(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();