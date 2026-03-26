import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { createAuth } from "./config/auth.js";
import { createApp } from "./app.js";

async function bootstrap() {
  // 1. Connect to MongoDB first
  await connectDatabase();

  // 2. Create better-auth instance (needs active DB connection)
  const auth = createAuth();

  // 3. Create Express app with auth injected
  const app = createApp(auth);

  // 4. Start listening
  const PORT = ENV.PORT;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/ok`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
