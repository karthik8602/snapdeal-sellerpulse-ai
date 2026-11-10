import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sellerRoutes from "./routes/sellerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/sellers", sellerRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SellerPulse AI Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SellerPulse AI server running on port ${PORT}`);
});
