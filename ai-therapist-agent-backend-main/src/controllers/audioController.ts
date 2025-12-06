import { Request, Response } from "express";

export const analyzeAudio = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }
  // Ici tu pourrais appeler un service de transcription ou d’analyse
  // Pour le test, on retourne juste le nom du fichier
  res.json({ success: true, filename: req.file.originalname });
};
