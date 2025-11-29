import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { EmailVerificationToken } from "../models/EmailVerificationToken";
import { QRSession } from "../models/QRSession";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { sendEmail, getVerificationEmailTemplate } from "../utils/sendEmail";

/**
 * Inscription
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    console.log("[REGISTER] body =", req.body);

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Le nom, l’e-mail et le mot de passe sont obligatoires." });
    }

    // Vérifier si l’utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    console.log("[REGISTER] existingUser ?", !!existingUser);

    if (existingUser) {
      return res.status(409).json({ message: "Cet e-mail est déjà utilisé." });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création utilisateur (emailVerified = null)
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      emailVerified: null 
    });
    console.log("[REGISTER] new user =", user._id);

    await user.save();

    // Générer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    const tokenDoc = new EmailVerificationToken({
      userId: user._id,
      token: verificationToken,
    });
    
    await tokenDoc.save();
    console.log("[REGISTER] Token de vérification créé");

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail({
        to: email,
        subject: "Vérification de votre compte - Theramind",
        html: getVerificationEmailTemplate(verificationUrl, user.name),
      });
      console.log("[REGISTER] Email de vérification envoyé");
    } catch (emailError) {
      console.error("[REGISTER] Erreur envoi email:", emailError);
      // Supprimer l'utilisateur si l'email ne peut pas être envoyé
      await User.findByIdAndDelete(user._id);
      await EmailVerificationToken.deleteOne({ userId: user._id });
      return res.status(500).json({
        message: "Erreur lors de l'envoi de l'email de vérification. Veuillez réessayer.",
        error: emailError instanceof Error ? emailError.message : "Erreur d'envoi d'email",
      });
    }
    
    // Réponse : inscription réussie avec envoi d'email
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: null,
      },
      message: "Inscription réussie ! Un email de vérification a été envoyé à votre adresse email.",
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("[REGISTER] Erreur serveur :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l’inscription.",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Connexion
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] body =", req.body);

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "L’e-mail et le mot de passe sont obligatoires." });
    }

    // Recherche utilisateur
    const user = await User.findOne({ email });
    console.log("[LOGIN] user trouvé ?", !!user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "E-mail ou mot de passe incorrect." });
    }

    // Vérification mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] mot de passe valide ?", isPasswordValid);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "E-mail ou mot de passe incorrect." });
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      console.log("[LOGIN] Email non vérifié");
      return res.status(403).json({
        message: "Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.",
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    // Si l'utilisateur a déjà configuré le TOTP, afficher le QR code ET demander le code
    if (user.totpEnabled && user.totpSecret) {
      console.log("[LOGIN] TOTP déjà configuré, affichage du QR code existant");
      
      const qrToken = crypto.randomBytes(32).toString("hex");
      
      // Régénérer le QR code à partir du secret existant
      const secret = {
        base32: user.totpSecret,
        otpauth_url: `otpauth://totp/Theramind (${user.email})?secret=${user.totpSecret}&issuer=Theramind`
      };
      const qrCodeImage = await QRCode.toDataURL(secret.otpauth_url);
      
      const qrSession = new QRSession({
        userId: user._id,
        token: qrToken,
        totpSecret: user.totpSecret,
        qrCode: qrCodeImage,
        verified: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      await qrSession.save();

      return res.status(200).json({
        message: "Scannez le QR code avec votre application d'authentification",
        requiresQRVerification: true,
        qrCode: qrCodeImage,
        qrToken: qrToken,
        isFirstTimeSetup: false,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // Première connexion : Générer un secret TOTP pour l'utilisateur
    console.log("[LOGIN] Première configuration TOTP");
    const secret = speakeasy.generateSecret({
      name: `Theramind (${user.email})`,
      issuer: "Theramind",
      length: 32,
    });

    // Générer un token de session temporaire
    const qrToken = crypto.randomBytes(32).toString("hex");
    
    // Créer une session QR avec le secret TOTP
    const qrSession = new QRSession({
      userId: user._id,
      token: qrToken,
      totpSecret: secret.base32,
      verified: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Générer le QR code au format otpauth (compatible avec Google Authenticator)
    const otpauthUrl = secret.otpauth_url;
    const qrCodeImage = await QRCode.toDataURL(otpauthUrl || "");
    qrSession.qrCode = qrCodeImage;
    await qrSession.save();

    console.log("[LOGIN] QR code TOTP généré, secret:", secret.base32);

    return res.status(200).json({
      message: "Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)",
      requiresQRVerification: true,
      qrCode: qrCodeImage,
      qrToken: qrToken,
      isFirstTimeSetup: true,
      expiresIn: 300, // 5 minutes en secondes
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[LOGIN] Erreur serveur :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la connexion.",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Vérifier le scan du QR code
 */
export const verifyQRCode = async (req: Request, res: Response) => {
  try {
    const { qrToken, totpCode } = req.body;
    console.log("[VERIFY_QR] Token reçu:", qrToken, "Code TOTP:", totpCode);

    if (!qrToken || !totpCode) {
      return res.status(400).json({ message: "Token QR et code TOTP requis." });
    }

    // Trouver la session QR
    const qrSession = await QRSession.findOne({ token: qrToken });

    if (!qrSession) {
      return res.status(404).json({ message: "Session QR non trouvée ou expirée." });
    }

    // Vérifier si déjà vérifié
    if (qrSession.verified) {
      return res.status(400).json({ message: "QR code déjà utilisé." });
    }

    // Vérifier l'expiration
    if (qrSession.expiresAt < new Date()) {
      await QRSession.deleteOne({ _id: qrSession._id });
      return res.status(410).json({ message: "QR code expiré." });
    }

    // Vérifier le code TOTP
    const verified = speakeasy.totp.verify({
      secret: qrSession.totpSecret,
      encoding: "base32",
      token: totpCode,
      window: 2, // Accepter +/- 2 intervalles de temps (60 secondes)
    });

    if (!verified) {
      return res.status(401).json({ message: "Code TOTP invalide." });
    }

    // Marquer comme vérifié
    qrSession.verified = true;
    await qrSession.save();

    // Récupérer les infos utilisateur
    let user = await User.findById(qrSession.userId);

    // Si c'est la première configuration, sauvegarder le secret TOTP dans le profil utilisateur
    if (!user?.totpEnabled) {
      console.log("[VERIFY_QR] Activation du TOTP pour l'utilisateur");
      user = await User.findByIdAndUpdate(
        qrSession.userId, 
        {
          totpSecret: qrSession.totpSecret,
          totpEnabled: true,
        },
        { new: true } // Retourner le document mis à jour
      );
    }

    // Générer le JWT token final
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      { userId: qrSession.userId, qrVerified: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Créer une session permanente
    const session = new Session({
      userId: qrSession.userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });
    await session.save();

    console.log("[VERIFY_QR] Code TOTP vérifié avec succès pour:", user?.email);

    return res.status(200).json({
      message: "Authentification réussie.",
      token,
      user: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        emailVerified: user?.emailVerified,
      },
    });
  } catch (error) {
    console.error("[VERIFY_QR] Erreur serveur:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la vérification du QR code.",
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Vérifier le statut du QR code (polling)
 */
export const checkQRStatus = async (req: Request, res: Response) => {
  try {
    const { qrToken } = req.query;

    if (!qrToken) {
      return res.status(400).json({ message: "Token QR requis." });
    }

    const qrSession = await QRSession.findOne({ token: qrToken as string });

    if (!qrSession) {
      return res.status(404).json({ verified: false, message: "Session non trouvée ou expirée." });
    }

    if (qrSession.expiresAt < new Date()) {
      await QRSession.deleteOne({ _id: qrSession._id });
      return res.status(410).json({ verified: false, message: "QR code expiré." });
    }

    return res.status(200).json({
      verified: qrSession.verified,
      message: qrSession.verified ? "QR code vérifié" : "En attente de scan",
    });
  } catch (error) {
    console.error("[CHECK_QR_STATUS] Erreur:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

/**
 * Déconnexion
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("[LOGOUT] token reçu =", token ? "oui" : "non");

    if (token) {
      await Session.deleteOne({ token });
    }

    return res.json({ message: "Déconnexion réussie." });
  } catch (error) {
    console.error("[LOGOUT] Erreur serveur :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la déconnexion.",
      error: error instanceof Error ? error.message : error,
    });
  }
};
