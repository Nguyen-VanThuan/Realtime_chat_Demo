import express from "express";
import { authMe } from "../controllers/userController.js";

const router = express.Router();

// Các route liên quan đến user sẽ được định nghĩa ở đây
router.get("/me" , authMe);

export default router;