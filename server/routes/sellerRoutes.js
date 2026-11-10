import express from "express";
import { getAnalytics } from "../controllers/sellerController.js";

const router = express.Router();

router.get("/:sellerId/analytics", getAnalytics);

export default router;
