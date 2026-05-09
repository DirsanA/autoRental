import { createServer } from "http";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { createAuth } from "./config/auth.js";
import { createApp } from "./app.js";
import { notificationSocketService } from "./services/notification-socket.service.js";

async function bootstrap() {
  // 1. Connect to MongoDB first
  await connectDatabase();

  // 2. Create better-auth instance (needs active DB connection)
  const auth = createAuth();

  // 3. Create Express app with auth injected
  const app = createApp(auth);

  // 4. Create HTTP server (required for Socket.io)
  const httpServer = createServer(app);

  // 5. Initialize Socket.io for real-time notifications
  notificationSocketService.initialize(httpServer);

  // 6. Start background watchers
  const { walletService } = await import("./services/wallet.service.js");
  walletService.startWatcher();

  // 7. Start listening
  const PORT = ENV.PORT;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/ok`);
    console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
