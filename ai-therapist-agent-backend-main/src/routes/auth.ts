import { Router } from "express";
import { register, login, logout, verifyQRCode, checkQRStatus } from "../controllers/authController";
import { verifyEmail, resendVerificationEmail } from "../controllers/emailVerificationController";
import { auth } from "../middleware/auth";

const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/logout
router.post("/logout", auth, logout);

// POST /auth/verify-email - Vérifier l'email avec le token
router.post("/verify-email", verifyEmail);

// POST /auth/resend-verification - Renvoyer l'email de vérification
router.post("/resend-verification", resendVerificationEmail);

// POST /auth/verify-qr - Vérifier le QR code
router.post("/verify-qr", verifyQRCode);

// GET /auth/qr-status - Vérifier le statut du QR code (polling)
router.get("/qr-status", checkQRStatus);

// POST /auth/reset-totp - Réinitialiser le TOTP (pour tests)
router.post("/reset-totp", async (req, res) => {
  try {
    const { email } = req.body;
    const { User } = await import("../models/User");
    await User.findOneAndUpdate({ email }, { totpSecret: null, totpEnabled: false });
    res.json({ message: "TOTP réinitialisé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /auth/me
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
