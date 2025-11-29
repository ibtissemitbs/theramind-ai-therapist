import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { EmailVerificationToken } from "../models/EmailVerificationToken";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail, getVerificationEmailTemplate } from "../utils/sendEmail";

/**
 * Vérifier l'email avec le token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    // Rechercher le token
    const tokenDoc = await EmailVerificationToken.findOne({ token });

    if (!tokenDoc) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Vérifier l'expiration
    if (tokenDoc.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ 
        message: "Token expiré. Veuillez demander un nouveau lien.",
        expired: true 
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(tokenDoc.userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer le token utilisé
    await EmailVerificationToken.deleteOne({ _id: tokenDoc._id });

    console.log(`[VERIFY-EMAIL] Email vérifié pour: ${user.email}`);

    // Mettre à jour emailVerified
    user.emailVerified = new Date();
    await user.save();

    // Générer le token JWT pour la connexion
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Créer la session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = new Session({
      userId: user._id,
      token: jwtToken,
      expiresAt,
      deviceInfo: "Email verification",
    });

    await session.save();
    console.log(`[VERIFY-EMAIL] Session créée pour: ${user.email}`);

    return res.json({
      message: "Email vérifié avec succès !",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      token: jwtToken,
      authenticated: true,
    });
  } catch (error) {
    console.error("[VERIFY-EMAIL] Erreur:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la vérification",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Renvoyer un email de vérification
 */
export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email manquant" });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si déjà vérifié
    if (user.emailVerified) {
      return res.status(400).json({ 
        message: "Email déjà vérifié",
        alreadyVerified: true 
      });
    }

    // Supprimer les anciens tokens
    await EmailVerificationToken.deleteMany({ userId: user._id });

    // Créer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    const tokenDoc = new EmailVerificationToken({
      userId: user._id,
      token: verificationToken,
    });
    
    await tokenDoc.save();

    // Envoyer l'email
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail({
        to: email,
        subject: "Vérifiez votre adresse email - Theramind",
        html: getVerificationEmailTemplate(verificationUrl, user.name),
      });
      console.log(`[RESEND-VERIFICATION] Email renvoyé avec succès à: ${email}`);
    } catch (emailError) {
      console.error(`[RESEND-VERIFICATION] Erreur envoi email:`, emailError);
      return res.status(500).json({
        message: "Impossible d'envoyer l'email. Veuillez vérifier la configuration email du serveur.",
        error: emailError instanceof Error ? emailError.message : "Erreur d'envoi d'email",
      });
    }

    return res.json({
      message: "Email de vérification renvoyé avec succès",
    });
  } catch (error) {
    console.error("[RESEND-VERIFICATION] Erreur:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'envoi",
      error: error instanceof Error ? error.message : error,
    });
  }
};
