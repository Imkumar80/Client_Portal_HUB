import app from "./app";
import { logger } from "./lib/logger";
import { connectDb } from "@workspace/db";

const rawPort = process.env["PORT"];
const mongoUri = process.env["MONGO_URI"] || "mongodb+srv://kumarrshet701_db_user:kQXkxZ9c14jLYPVA@cluster0.yfdlspl.mongodb.net/client-portal?appName=Cluster0";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

connectDb(mongoUri).then(() => {
  logger.info("Connected to MongoDB");
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}).catch((err) => {
  logger.error({ err }, "Failed to connect to MongoDB");
  process.exit(1);
});
