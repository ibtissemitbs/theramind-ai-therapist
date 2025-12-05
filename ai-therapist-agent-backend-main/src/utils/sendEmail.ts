interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Vérifier que la clé API est configurée
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY non configuré dans les variables d'environnement");
      throw new Error("Configuration email manquante. Veuillez configurer BREVO_API_KEY");
    }

    console.log("📧 Envoi d'email via Brevo à:", to);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: "Theramind", email: "moussaibtissem44@gmail.com" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur Brevo:", result);
      throw new Error(result.message || 'Erreur envoi email');
    }

    console.log("✅ Email envoyé via Brevo:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("❌ Erreur envoi email Brevo:", error);
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
