import express from "express";
import multer from "multer";
import { analyzeAudio } from "../controllers/audioController";
import { auth } from "../middleware/auth";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", auth, upload.single("audio"), analyzeAudio);

export default router;
