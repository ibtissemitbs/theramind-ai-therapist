# 🚀 Guide de Déploiement sur Render

## ✅ Préparation Terminée !

Tous les fichiers de configuration sont prêts. Suivez ce guide étape par étape.

---

## 📋 Prérequis

1. **Compte GitHub** avec votre code push
2. **Compte MongoDB Atlas** (base de données cloud gratuite)
3. **Compte Render** (gratuit)
4. **Variables d'environnement** prêtes (voir ci-dessous)

---

## 🗂️ Variables d'Environnement à Préparer

### Backend
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/therapie-db
JWT_SECRET=un-secret-tres-long-et-aleatoire-minimum-32-caracteres
OPENAI_API_KEY=sk-votre-cle-openai
INNGEST_EVENT_KEY=votre-inngest-event-key
INNGEST_SIGNING_KEY=votre-inngest-signing-key
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application-gmail
FRONTEND_URL=https://votre-frontend.onrender.com
```

### Frontend
```
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
```

---

## 🎯 ÉTAPE 1 : Pousser le Code sur GitHub

Si ce n'est pas déjà fait :

```powershell
# Dans le dossier backend
cd "C:\Users\LENOVO\Downloads\Agent-Therapie\ai-therapist-agent-backend-main"
git add .
git commit -m "Configuration pour déploiement Render"
git push origin main

# Dans le dossier frontend
cd "C:\Users\LENOVO\Downloads\Agent-Therapie\ai-therapist-agent-main"
git add .
git commit -m "Configuration pour déploiement Render"
git push origin main
```

---

## 🎯 ÉTAPE 2 : Créer un Compte Render

1. Allez sur : **https://render.com**
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec **GitHub**
4. Autorisez Render à accéder à vos repos

---

## 🎯 ÉTAPE 3 : Déployer le BACKEND (à faire en PREMIER)

### 3.1 Créer le service Backend

1. Dans le dashboard Render, cliquez **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repository backend :
   - Cherchez : `ai-therapist-agent-backend-main`
   - Cliquez **"Connect"**

### 3.2 Configuration du service

Remplissez les champs :

| Champ | Valeur |
|-------|--------|
| **Name** | `therapie-backend` |
| **Region** | `Frankfurt (EU Central)` ou le plus proche |
| **Branch** | `main` |
| **Root Directory** | *(laisser vide)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.3 Ajouter les Variables d'Environnement

Descendez à la section **"Environment Variables"**, cliquez **"Add Environment Variable"** :

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://votre-uri-mongodb
JWT_SECRET = votre-secret-jwt-minimum-32-caracteres
OPENAI_API_KEY = sk-votre-cle-openai
INNGEST_EVENT_KEY = votre-inngest-key
INNGEST_SIGNING_KEY = votre-inngest-signing-key
EMAIL_USER = votre-email@gmail.com
EMAIL_PASS = votre-mot-de-passe-app-gmail
FRONTEND_URL = https://therapie-frontend.onrender.com
```

⚠️ **IMPORTANT** : Pour `FRONTEND_URL`, utilisez le nom que vous donnerez au frontend à l'étape suivante.

### 3.4 Déployer

1. Cliquez **"Create Web Service"**
2. Attendez 5-10 minutes que le déploiement se termine
3. Vous verrez l'URL du backend : `https://therapie-backend.onrender.com`
4. **Copiez cette URL** - vous en aurez besoin pour le frontend !

### 3.5 Vérifier le Backend

1. Testez : `https://therapie-backend.onrender.com/health`
2. Vous devriez voir : `{"status":"ok","message":"Server is running"}`

---

## 🎯 ÉTAPE 4 : Déployer le FRONTEND

### 4.1 Créer le service Frontend

1. Dans le dashboard Render, cliquez **"New +"** 
2. Sélectionnez **"Web Service"**
3. Connectez votre repository frontend :
   - Cherchez : `ai-therapist-agent-main`
   - Cliquez **"Connect"**

### 4.2 Configuration du service

| Champ | Valeur |
|-------|--------|
| **Name** | `therapie-frontend` |
| **Region** | `Frankfurt (EU Central)` (même région que backend) |
| **Branch** | `main` |
| **Root Directory** | *(laisser vide)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 4.3 Ajouter les Variables d'Environnement

```
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://therapie-backend.onrender.com
```

⚠️ Utilisez l'URL du backend de l'étape 3.4 !

### 4.4 Déployer

1. Cliquez **"Create Web Service"**
2. Attendez 5-10 minutes
3. Votre app sera disponible : `https://therapie-frontend.onrender.com`

---

## 🎯 ÉTAPE 5 : Mettre à Jour le Backend avec l'URL Frontend

1. Retournez au service **backend** dans Render
2. Allez dans **"Environment"**
3. Modifiez `FRONTEND_URL` avec l'URL réelle du frontend
4. Cliquez **"Save Changes"**
5. Le backend redémarrera automatiquement

---

## ✅ ÉTAPE 6 : Test Final

### 6.1 Testez le Backend
```
https://therapie-backend.onrender.com/health
```
→ Doit retourner `{"status":"ok"}`

### 6.2 Testez le Frontend
```
https://therapie-frontend.onrender.com
```
→ Votre site doit s'afficher !

### 6.3 Testez la Connexion
1. Allez sur votre frontend
2. Créez un compte
3. Vérifiez l'email
4. Connectez-vous
5. Testez le chat

---

## 🚨 Problèmes Courants

### "Service Unavailable" au démarrage
- ⏰ **Normal** : Render met 1-2 minutes à démarrer les services gratuits après inactivité
- 💡 **Solution** : Attendez et rafraîchissez

### Erreur CORS
- ✅ Vérifiez que `FRONTEND_URL` dans le backend est correct
- ✅ Vérifiez qu'il n'y a pas de `/` à la fin de l'URL

### MongoDB connection failed
- ✅ Vérifiez votre `MONGODB_URI`
- ✅ Whitelist l'IP de Render dans MongoDB Atlas (0.0.0.0/0)

### Build failed
- ✅ Vérifiez les logs dans Render
- ✅ Assurez-vous que `npm run build` fonctionne localement

---

## 📊 Limites du Plan Gratuit

- **750 heures/mois** par service (2 services = 1500h total suffisant)
- **Services s'endorment** après 15 minutes d'inactivité
- **Premier accès lent** (1-2 minutes de réveil)
- **Redémarrage automatique** toutes les semaines

---

## 🎯 Prochaines Étapes

Une fois déployé :

1. **Custom Domain** (optionnel)
   - Achetez un domaine (ex: `therapie-ai.com`)
   - Configurez-le dans Render

2. **Monitoring**
   - Activez les notifications d'erreur
   - Consultez les logs régulièrement

3. **SSL/HTTPS**
   - ✅ Automatique avec Render !

---

## 🎉 Félicitations !

Votre application est maintenant en ligne et accessible au monde entier ! 🌍

**URLs à partager** :
- Frontend : `https://therapie-frontend.onrender.com`
- Backend API : `https://therapie-backend.onrender.com`

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans le dashboard Render
2. Vérifiez les variables d'environnement
3. Testez localement d'abord
4. Demandez de l'aide !

