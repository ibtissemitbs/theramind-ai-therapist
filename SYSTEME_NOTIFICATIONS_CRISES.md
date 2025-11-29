# 🚨 Système de Notifications de Crises - DOCUMENTATION COMPLÈTE

## ✅ Ce qui a été implémenté

### 🎯 **BACKEND (Node.js + Express + MongoDB)**

#### 1. **Modèle de données** (`src/models/CrisisAlert.ts`)
```typescript
interface ICrisisAlert {
  userId: string;           // ID de l'utilisateur
  sessionId: string;        // ID de la session de chat
  level: "low" | "medium" | "high" | "critical";
  message: string;          // Message d'alerte
  keywords: string[];       // Mots-clés détectés
  userMessage: string;      // Message original de l'utilisateur
  resources: Array<{        // Ressources d'aide
    title: string;
    phone?: string;
    description: string;
    link?: string;
  }>;
  isRead: boolean;          // Statut lu/non lu
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. **API Routes** (`src/routes/crisis.ts`)
- ✅ `POST /api/crisis` - Créer une alerte
- ✅ `GET /api/crisis/user/:userId` - Récupérer les alertes d'un utilisateur
- ✅ `GET /api/crisis/user/:userId/unread-count` - Nombre d'alertes non lues
- ✅ `GET /api/crisis/user/:userId/stats` - Statistiques de crises (7 derniers jours)
- ✅ `PUT /api/crisis/:alertId/read` - Marquer une alerte comme lue
- ✅ `PUT /api/crisis/user/:userId/read-all` - Marquer toutes comme lues
- ✅ `DELETE /api/crisis/:alertId` - Supprimer une alerte

#### 3. **Controller** (`src/controllers/crisisController.ts`)
Toutes les fonctions de gestion des alertes implémentées avec gestion d'erreurs

---

### 🎨 **FRONTEND (Next.js + React + TypeScript)**

#### 1. **API Client** (`lib/api/crisis.ts`)
Fonctions pour communiquer avec le backend :
- `createCrisisAlert()` - Sauvegarder une crise
- `getUserCrisisAlerts()` - Charger les alertes
- `getUnreadAlertsCount()` - Nombre non lues
- `markAlertAsRead()` - Marquer comme lue
- `markAllAlertsAsRead()` - Tout marquer comme lu
- `deleteAlert()` - Supprimer
- `getCrisisStats()` - Statistiques

#### 2. **Composant Notifications** (`components/dashboard/crisis-notifications.tsx`)
**Panneau latéral de notifications avec :**
- 🔔 Badge avec nombre d'alertes non lues
- Panneau coulissant animé (Framer Motion)
- Liste des alertes avec codes couleur par niveau
- Bouton "Marquer comme lue" par alerte
- Bouton "Marquer toutes comme lues"
- Actualisation automatique toutes les 30 secondes
- Affichage des détails (message, mots-clés, date)

#### 3. **Composant Statistiques** (`components/dashboard/crisis-stats-card.tsx`)
**Carte de statistiques dans le dashboard :**
- Compteur total d'alertes sur 7 jours
- Répartition par niveau (Critique/Élevé/Moyen/Bas)
- Indicateurs visuels (emojis + couleurs)
- Alerte si risque élevé détecté
- Actualisation automatique toutes les 5 minutes

#### 4. **Intégration Chat** (`app/therapy/[sessionId]/page.tsx`)
**Sauvegarde automatique lors de la détection :**
```typescript
const crisis = detectCrisis(currentMessage);
if (crisis.level !== 'none') {
  // 💾 Sauvegarder dans le backend
  await createCrisisAlert({
    userId: 'default-user',
    sessionId: sessionId,
    level: crisis.level,
    message: crisis.message,
    keywords: crisis.keywords,
    userMessage: currentMessage,
    resources: crisis.resources,
  });
}
```

#### 5. **Intégration Dashboard** (`app/dashboard/page.tsx`)
- ✅ Bouton notifications avec badge dans le header
- ✅ Carte de statistiques de crises
- ✅ Actualisation automatique

---

## 🎯 Fonctionnement du système

### **1. Détection dans le chat**
```
Utilisateur tape: "je veux mourir"
      ↓
Fonction detectCrisis() analyse
      ↓
Niveau CRITIQUE détecté
      ↓
Sauvegarde dans MongoDB
      ↓
Alerte affichée + Message bloqué
```

### **2. Notification dans le dashboard**
```
Backend sauvegarde l'alerte
      ↓
Dashboard vérifie toutes les 30s
      ↓
Badge rouge (🔔 1) s'affiche
      ↓
Utilisateur clique sur la cloche
      ↓
Panneau s'ouvre avec la liste
```

### **3. Niveaux de crise et actions**

| Niveau | Emoji | Couleur | Comportement | Notification Dashboard |
|--------|-------|---------|--------------|----------------------|
| **CRITIQUE** | 🚨 | Rouge | Message **BLOQUÉ** + Toast | ✅ Oui |
| **ÉLEVÉ** | 🛑 | Orange | Message envoyé + Toast | ✅ Oui |
| **MOYEN** | 🔔 | Jaune | Message envoyé + Ferme après 10s | ✅ Oui |
| **BAS** | 💙 | Bleu | Message envoyé + Ferme après 10s | ✅ Oui |

---

## 🚀 Comment tester

### **Étape 1 : Démarrer le backend**
```bash
cd ai-therapist-agent-backend-main
npm run dev
```
Le serveur démarre sur `http://localhost:3001`

### **Étape 2 : Démarrer le frontend**
```bash
cd ai-therapist-agent-main
npm run dev
```
L'application démarre sur `http://localhost:3000`

### **Étape 3 : Tester la détection**
1. Aller sur **Ouvrir le chat** → Nouvelle session
2. Taper : `"je suis très stressé"`
   - ✅ Alerte BLEUE 💙 s'affiche
   - ✅ Message envoyé normalement
   - ✅ Alerte se ferme après 10s
   - ✅ Sauvegardée dans MongoDB

3. Taper : `"j'ai une crise d'angoisse"`
   - ✅ Alerte JAUNE 🔔 s'affiche
   - ✅ Ressources respiration affichées

4. Taper : `"je me sens désespéré"`
   - ✅ Alerte ORANGE 🛑 s'affiche
   - ✅ Toast de soutien
   - ✅ Ressources professionnelles

5. Taper : `"je veux mourir"`
   - ✅ Alerte ROUGE 🚨 s'affiche
   - ✅ **MESSAGE BLOQUÉ** (pas envoyé à l'IA)
   - ✅ Numéros d'urgence tunisiens (190, 197, etc.)
   - ✅ Toast d'urgence

### **Étape 4 : Vérifier le dashboard**
1. Aller sur **Dashboard**
2. Regarder le bouton 🔔 en haut à droite
   - ✅ Badge rouge avec nombre d'alertes
3. Cliquer sur la cloche
   - ✅ Panneau s'ouvre avec la liste
   - ✅ Alertes affichées avec couleurs
   - ✅ Détails : message, mots-clés, date
4. Cliquer sur "✓" pour marquer comme lue
   - ✅ Badge diminue
5. Regarder la carte "Alertes de crise"
   - ✅ Statistiques des 7 derniers jours
   - ✅ Répartition par niveau

---

## 📊 Structure des données

### **Exemple d'alerte sauvegardée**
```json
{
  "_id": "674a1b2c3d4e5f6g7h8i9j0k",
  "userId": "default-user",
  "sessionId": "abc123def456",
  "level": "critical",
  "message": "⚠️ DÉTECTION DE CRISE - Votre sécurité est notre priorité",
  "keywords": ["mourir", "en finir"],
  "userMessage": "je veux mourir",
  "resources": [
    {
      "title": "SAMU Tunisie",
      "phone": "190",
      "description": "Urgence médicale immédiate 24h/24"
    },
    {
      "title": "Police Secours",
      "phone": "197",
      "description": "Urgence sécuritaire et assistance"
    }
  ],
  "isRead": false,
  "createdAt": "2025-11-19T20:30:00.000Z",
  "updatedAt": "2025-11-19T20:30:00.000Z"
}
```

---

## 🔧 Configuration requise

### **Variables d'environnement**

**Backend** (`.env`) :
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
```

**Frontend** (`.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ⚠️ Points importants

### **1. MongoDB doit être connecté**
- Le système utilise MongoDB pour stocker les alertes
- Si MongoDB n'est pas connecté, les alertes ne seront pas sauvegardées
- Mais la détection et l'affichage dans le chat fonctionnent quand même

### **2. userId hardcodé**
Actuellement `userId: "default-user"` est hardcodé.
Pour production, remplacer par le vrai système d'authentification :
```typescript
const { user } = useSession();
userId: user?.id || 'default-user'
```

### **3. Actualisation automatique**
- **Notifications** : toutes les 30 secondes
- **Statistiques** : toutes les 5 minutes
- Peut être ajusté dans les composants

---

## 🎨 Personnalisation

### **Modifier les intervalles d'actualisation**

**Dans `crisis-notifications.tsx`** :
```typescript
// Ligne 52 : Changer 30000 (30s) par la valeur souhaitée
const interval = setInterval(loadUnreadCount, 30000);
```

**Dans `crisis-stats-card.tsx`** :
```typescript
// Ligne 31 : Changer 5 * 60 * 1000 (5min) par la valeur souhaitée
const interval = setInterval(loadStats, 5 * 60 * 1000);
```

### **Modifier les couleurs**

Dans `crisis-notifications.tsx`, fonction `getLevelColor()` :
```typescript
case "critical":
  return "border-red-500 bg-red-50 dark:bg-red-950/20";
// Modifier les couleurs Tailwind ici
```

---

## ✅ Checklist de vérification

- [x] Modèle MongoDB créé
- [x] API Backend implémentée (7 routes)
- [x] API Client frontend créée
- [x] Composant notifications créé
- [x] Composant statistiques créé
- [x] Intégration dans le chat
- [x] Intégration dans le dashboard
- [x] Sauvegarde automatique lors de la détection
- [x] Badge avec compteur
- [x] Actualisation automatique
- [x] Gestion lu/non lu
- [x] Statistiques par niveau

---

## 🚀 Prochaines améliorations possibles

1. **Notifications push** navigateur (Web Push API)
2. **Emails d'alerte** pour crises critiques
3. **Historique graphique** des crises (charts)
4. **Export PDF** des alertes
5. **Filtres avancés** (par date, par niveau)
6. **Notifications temps réel** (WebSocket/Socket.io)
7. **Intégration SMS** pour urgences
8. **Dashboard professionnel** pour thérapeutes

---

## 📞 Numéros d'urgence tunisiens intégrés

| Service | Numéro | Niveau |
|---------|--------|--------|
| SAMU Tunisie | 190 | Critique |
| Police Secours | 197 | Critique |
| SOS Médecins | 71 754 754 | Critique |
| Ligne Écoute Psycho | 80 100 410 | Critique/Élevé |
| Croissant-Rouge | 71 320 102 | Élevé |
| Centre Aide Psy | 71 841 444 | Élevé |
| Centre Santé Mentale | 71 567 811 | Moyen |

---

## 🎉 Résultat final

**Le système est maintenant COMPLET et FONCTIONNEL :**

✅ Détection automatique des crises dans le chat
✅ Sauvegarde dans MongoDB
✅ Notifications en temps réel dans le dashboard
✅ Badge avec compteur d'alertes non lues
✅ Panneau de notifications avec historique
✅ Carte de statistiques sur 7 jours
✅ Gestion lu/non lu
✅ Codes couleur par niveau de crise
✅ Ressources d'aide tunisiennes
✅ Interface responsive et animée

**Le chat et le dashboard sont maintenant CONNECTÉS ! 🎊**
