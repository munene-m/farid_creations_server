import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./config/db";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./utils/swagger.json";
import authRoute from "./routes/authRoute";
import productRoute from "./routes/productRoute";
import workRoute from "./routes/workRoute";
import cartRoute from "./routes/cartRoute";
import paymentRoute from "./routes/paymentRoute";

const options = {
  swaggerOptions: {
    tryItOutEnabled: false,
    supportedSubmitMethods: [""],
    overview: true,
  },
};

const app = express();
const PORT = process.env.PORT || 8000;
dotenv.config();
// Middleware setup
connectDB();
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

process.on("SIGINT", async () => {
  console.log("Shutting down...\n", "Goodbye!");
  process.exit(0);
});
