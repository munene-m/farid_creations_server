import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { db } from "./db";
import config  from "./src/config"
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/utils/swagger.json";
import authRoute from "./src/routes/authRoute";
import productRoute from "./src/routes/productRoute";
import workRoute from "./src/routes/workRoute";
import cartRoute from "./src/routes/cartRoute";
import paymentRoute from "./src/routes/paymentRoute";

const options = {
  swaggerOptions: {
    tryItOutEnabled: false,
    supportedSubmitMethods: [""],
    overview: true,
  },
};

const app = express();
const PORT = config.port;
dotenv.config();
// Middleware setup
const startServer = async () => {
  try {
    await db.query.userTable.findMany({ limit: 1 });
    console.log("PostgreSQL connected successfully");

    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(helmet());

    app.use("/api/v1/auth", authRoute);
    app.use("/api/v1/products", productRoute);
    app.use("/api/v1/work", workRoute);
    app.use("/api/v1/cart", cartRoute);
    app.use("/api/v1/payment", paymentRoute);
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options)
    );

    app.get("/current", (req, res) => {
      const currentTime = new Date().toLocaleString();
      console.log(`The current time is ${currentTime}`);
      req.destroy();
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}. Access the docs on http://localhost:${PORT}/api-docs`
      );
      // logger.info(`Server running on port ${PORT}`)
    });
  } catch (err: any) {
    console.error("Failed to connect to PostgreSQL", err);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  console.log("Shutting down...\n", "Goodbye!");
  process.exit(0);
});
