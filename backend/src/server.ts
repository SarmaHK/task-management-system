import http from 'http';
import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { SocketService } from './services/socket.service';

const startServer = async (): Promise<void> => {
  try {
    // Await database connection
    await connectDatabase();

    const server = http.createServer(app);

    // Initialize Socket.io
    SocketService.init(server);

    server.listen(config.PORT, () => {
      console.log(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();

