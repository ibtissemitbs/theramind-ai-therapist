import { Router } from "express";
import { 
  register, 
  login, 
  logout, 
  verifyQRCode, 
  checkQRStatus,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword 
} from "../controllers/authController";
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
  const user = req.user as any;
  const { password, totpSecret, ...safeUser } = user.toObject ? user.toObject() : user;
  res.json({ user: safeUser });
});

// GET /auth/profile - Obtenir le profil complet
router.get("/profile", auth, getProfile);

// PUT /auth/profile - Mettre à jour le profil (nom, email, photo)
router.put("/profile", auth, updateProfile);

// PUT /auth/change-password - Changer le mot de passe
router.put("/change-password", auth, changePassword);

// POST /auth/forgot-password - Demander la réinitialisation du mot de passe
router.post("/forgot-password", forgotPassword);

// POST /auth/reset-password - Réinitialiser le mot de passe avec le token
router.post("/reset-password", resetPassword);

export default router;
