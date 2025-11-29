# 📧 Configuration de la Vérification d'Email

## 🎯 Fonctionnalités

- ✅ Email de vérification automatique lors de l'inscription
- 🔒 Blocage de connexion tant que l'email n'est pas vérifié
- ♻️ Possibilité de renvoyer l'email de vérification
- ⏱️ Token d'expiration de 24 heures
- 🎨 Email HTML magnifiquement stylisé
- 🔐 Sécurité renforcée

## 📋 Prérequis

1. **Compte Gmail** (ou autre service SMTP)
2. **Validation en 2 étapes activée** sur votre compte Google
3. **Mot de passe d'application** Google

## 🚀 Configuration

### 1. Créer un mot de passe d'application Gmail

1. Allez sur [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez "Application" : **Autre (nom personnalisé)**
3. Nommez-la : `Theramind Backend`
4. Cliquez sur **Générer**
5. Copiez le mot de passe de 16 caractères

### 2. Configurer les variables d'environnement

Ouvrez `.env` et ajoutez :

\`\`\`env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # Le mot de passe d'application (16 caractères)
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Installer les dépendances

\`\`\`bash
cd ai-therapist-agent-backend-main
npm install
\`\`\`

Les packages suivants sont déjà installés :
- `nodemailer` - Envoi d'emails
- `@types/nodemailer` - Types TypeScript

### 4. Démarrer le backend

\`\`\`bash
npm run dev
\`\`\`

## 📁 Fichiers créés/modifiés

### Backend

✅ **Modèles**
- `src/models/EmailVerificationToken.ts` - Token de vérification avec expiration

✅ **Contrôleurs**
- `src/controllers/authController.ts` - Modifié pour envoyer l'email
- `src/controllers/emailVerificationController.ts` - Vérification et renvoi

✅ **Utilitaires**
- `src/utils/sendEmail.ts` - Envoi d'emails avec template HTML

✅ **Routes**
- `POST /auth/verify-email` - Vérifier le token
- `POST /auth/resend-verification` - Renvoyer l'email

### Frontend

✅ **Pages**
- `app/verify-email/page.tsx` - Page de vérification avec UI moderne
- `app/signup/page.tsx` - Modifiée pour afficher le message de vérification

## 🔄 Flux de vérification

1. **Inscription** (`POST /auth/register`)
   - ✅ Utilisateur s'inscrit
   - 📧 Email de vérification envoyé automatiquement
   - 💾 Token sauvegardé en DB (expire après 24h)
   - ℹ️ Message affiché : "Vérifiez votre email"

2. **Email reçu**
   - 📬 L'utilisateur reçoit un email élégant
   - 🔗 Contient un lien : `http://localhost:3000/verify-email?token=...`

3. **Vérification** (`POST /auth/verify-email`)
   - ✅ Token vérifié
   - 🔓 Champ `emailVerified` mis à jour
   - 🗑️ Token supprimé de la DB

4. **Connexion** (`POST /auth/login`)
   - ✅ Si email vérifié → Connexion réussie
   - ❌ Si email non vérifié → Erreur 403

5. **Renvoi** (`POST /auth/resend-verification`)
   - ♻️ Nouveau token généré
   - 📧 Nouvel email envoyé

## 🧪 Test

### 1. Inscription

\`\`\`bash
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234!"
  }'
\`\`\`

**Réponse attendue :**
\`\`\`json
{
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "emailVerified": null
  },
  "message": "Utilisateur créé avec succès. Veuillez vérifier votre email.",
  "requiresEmailVerification": true
}
\`\`\`

### 2. Vérifier l'email dans votre boîte

- 📬 Ouvrez votre boîte email
- 📧 Trouvez l'email "Vérifiez votre adresse email - Theramind"
- 🔗 Cliquez sur le bouton "Vérifier mon email"

### 3. Connexion (avant vérification)

\`\`\`bash
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
\`\`\`

**Réponse attendue :**
\`\`\`json
{
  "message": "Veuillez vérifier votre adresse email avant de vous connecter.",
  "requiresEmailVerification": true,
  "email": "test@example.com"
}
\`\`\`

### 4. Connexion (après vérification)

\`\`\`bash
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
\`\`\`

**Réponse attendue :**
\`\`\`json
{
  "user": { ... },
  "token": "...",
  "message": "Connexion réussie."
}
\`\`\`

## 📱 UI Frontend

### Page de vérification

- ⏳ **État loading** : Animation de chargement
- ✅ **Succès** : Check vert + redirection automatique
- ❌ **Erreur** : Message d'erreur + bouton de renvoi
- ⏱️ **Expiré** : Message + bouton de renvoi

### Page d'inscription

- 📧 **Message de succès** après inscription
- ℹ️ **Instructions** claires pour vérifier l'email
- 🔗 **Lien** vers la page de connexion

## 🔒 Sécurité

✅ **Token aléatoire** de 32 bytes (64 caractères hex)
✅ **Expiration** automatique après 24h
✅ **Nettoyage** auto des tokens expirés (MongoDB TTL index)
✅ **Un seul usage** - Token supprimé après vérification
✅ **Vérification obligatoire** - Impossible de se connecter sans

## 🛠️ Dépannage

### Email non reçu

1. ✅ Vérifiez les **spams**
2. ✅ Vérifiez `EMAIL_USER` et `EMAIL_PASS` dans `.env`
3. ✅ Vérifiez les logs du backend
4. ✅ Testez avec un autre email

### Erreur "Invalid login"

- Gmail bloque peut-être l'accès
- Utilisez un **mot de passe d'application**, pas votre mot de passe Gmail
- Activez la **validation en 2 étapes**

### Token expiré

- Le token expire après 24h
- Utilisez le bouton "Renvoyer l'email de vérification"

## 📧 Personnalisation de l'email

Le template HTML est dans `src/utils/sendEmail.ts` :

\`\`\`typescript
export function getVerificationEmailTemplate(verificationUrl: string, userName?: string) {
  return \`
    <!-- Modifiez le HTML ici -->
  \`;
}
\`\`\`

## 🎨 Personnalisation des couleurs

Dans le template HTML, changez :
- `#667eea` → Couleur primaire
- `#764ba2` → Couleur secondaire

## 🔄 Autres services email

### Outlook/Hotmail

\`\`\`typescript
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
\`\`\`

### SendGrid

\`\`\`typescript
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
\`\`\`

## 📚 Documentation

- [Nodemailer](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)

## ✅ Checklist finale

- [ ] Variables `.env` configurées
- [ ] Mot de passe d'application Gmail créé
- [ ] Backend démarré (`npm run dev`)
- [ ] Frontend démarré
- [ ] Test d'inscription effectué
- [ ] Email reçu et vérifié
- [ ] Connexion testée

🎉 **C'est prêt !** Votre système de vérification d'email est opérationnel.
