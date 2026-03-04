import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import databse from "./src/config/database.js";
import { envConfig } from "./src/utils/accessEnv.js";
import errorHandler from "./src/middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const allowedOrigins = process.env.ORIGIN || "http://localhost:3000";

envConfig;

const app = express();

databse();
  
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
