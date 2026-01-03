# Theramind - AI Therapist Agent

Application de thérapie assistée par IA avec système de chat, suivi d'humeur, activités thérapeutiques et détection de crises.

## 🔗 Live Demo

Accédez à la Live Demo  : [https://theramind-frontend.onrender.com/](https://theramind-frontend.onrender.com/)

## 🏗️ Architecture

Le projet est composé de deux parties principales :

### Frontend (`ai-therapist-agent-main/`)
- **Framework**: Next.js 14.2.3 avec App Router
- **UI**: React, Tailwind CSS, Framer Motion
- **Authentification**: JWT, vérification email, 2FA TOTP
- **Fonctionnalités**:
  - Chat thérapeutique avec IA
  - Suivi d'humeur et activités
  - Système d'articles internes
  - Dashboard avec statistiques
  - Jeux thérapeutiques
  - Notifications de crises

### Backend (`ai-therapist-agent-backend-main/`)
- **Framework**: Express + TypeScript
- **Base de données**: MongoDB Atlas
- **Sécurité**: 
  - Chiffrement AES-256-GCM des messages
  - Hachage bcrypt des mots de passe
  - Authentification JWT
  - Vérification email
- **IA**: Intégration Gemini API
- **Collections MongoDB**:
  - `users` - Utilisateurs
  - `chatsessions` - Sessions de chat (messages chiffrés)
  - `moods` - Suivi d'humeur
  - `activities` - Activités thérapeutiques
  - `crisisalerts` - Alertes de crise

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte MongoDB Atlas
- Clé API Gemini (Google AI)

### Configuration Backend

1. Installer les dépendances :
```bash
cd ai-therapist-agent-backend-main
npm install
```

2. Créer le fichier `.env` :
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=votre_uri_mongodb_atlas

# JWT
JWT_SECRET=votre_secret_jwt_aleatoire

# Encryption (générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=votre_cle_de_chiffrement_32_bytes

# Email (Gmail)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# AI
GEMINI_API_KEY=votre_cle_api_gemini
```

3. Démarrer le serveur :
```bash
npm run dev
```

### Configuration Frontend

1. Installer les dépendances :
```bash
cd ai-therapist-agent-main
npm install
```

2. Créer le fichier `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Démarrer l'application :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔒 Sécurité

- **Messages chiffrés**: Tous les messages de chat sont chiffrés en AES-256-GCM avant stockage
- **Mots de passe**: Hachés avec bcrypt (10 rounds)
- **Authentification**: Tokens JWT avec expiration
- **Vérification email**: Obligatoire pour activer le compte
- **2FA optionnel**: TOTP pour sécurité renforcée

## 📚 Fonctionnalités

### Pour les patients
- Chat thérapeutique avec IA contextuelle
- Suivi quotidien de l'humeur
- Journal d'activités thérapeutiques
- Jeux de gestion du stress et émotions
- Articles sur la santé mentale
- Système de détection et d'alerte de crises

### Pour les thérapeutes (futur)
- Dashboard de suivi patients
- Historique des sessions
- Analyse des tendances émotionnelles
- Gestion des alertes de crise

## 🛠️ Technologies

**Frontend**:
- Next.js 14, React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- React Hook Form

**Backend**:
- Node.js, Express
- TypeScript
- MongoDB, Mongoose
- JWT, bcrypt
- Nodemailer
- Gemini AI API

## 📝 License

Ce projet est sous licence privée. Tous droits réservés.

## 👥 Contributeurs

Développé par l'équipe Theramind
