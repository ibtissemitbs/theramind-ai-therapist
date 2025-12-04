import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Vérifier que les credentials sont configurées
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER ou EMAIL_PASS non configuré dans .env");
      throw new Error("Configuration email manquante. Veuillez configurer EMAIL_USER et EMAIL_PASS dans le fichier .env");
    }

    if (process.env.EMAIL_USER === "votre-email@gmail.com" || process.env.EMAIL_PASS === "votre-mot-de-passe-application") {
      console.error("❌ Credentials email par défaut détectées");
      throw new Error("Veuillez remplacer EMAIL_USER et EMAIL_PASS par vos vraies credentials Gmail");
    }

    // Créer le transporteur
    const transporter = nodemailer.createTransport({
      service: "gmail", // ou "outlook", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Utilisez un mot de passe d'application
      },
    });

    // Vérifier la connexion
    console.log("🔄 Vérification de la connexion email...");
    await transporter.verify();
    console.log("✅ Connexion email établie");

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: `"Theramind Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email envoyé:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ Erreur envoi email:", error);
    
    // Messages d'erreur plus clairs
    if (error.code === "EAUTH") {
      console.error("❌ Authentification Gmail échouée. Vérifiez EMAIL_USER et EMAIL_PASS");
      console.error("💡 Assurez-vous d'utiliser un mot de passe d'application : https://myaccount.google.com/apppasswords");
    } else if (error.code === "ESOCKET") {
      console.error("❌ Impossible de se connecter au serveur SMTP");
    }
    
    throw error;
  }
}

export function getVerificationEmailTemplate(verificationUrl: string, userName?: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérifiez votre email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🧠 Theramind</h1>
        <p style="color: white; margin: 10px 0 0 0;">Votre compagnon IA pour la santé mentale</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Bienvenue ${userName ? userName : ""} ! 👋</h2>
        
        <p>Merci de vous être inscrit sur <strong>Theramind</strong>. Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            ✅ Vérifier mon email
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          ⏱️ Ce lien expire dans 24 heures.<br>
          ⚠️ Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© 2025 Theramind - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailTemplate(resetUrl: string, userName?: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🧠 Theramind</h1>
        <p style="color: white; margin: 10px 0 0 0;">Votre compagnon IA pour la santé mentale</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">🔐 Réinitialisation de mot de passe</h2>
        
        <p>Bonjour ${userName ? userName : ""} 👋</p>
        
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Theramind</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            🔑 Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          ⏱️ Ce lien expire dans 1 heure.<br>
          ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe reste inchangé.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© 2025 Theramind - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;
}
