# 🚨 GUIDE DE DÉTECTION DES CRISES

## 📋 **COMMENT ÇA MARCHE ?**

Le système analyse **automatiquement** chaque message que vous tapez **AVANT** de l'envoyer à l'IA.

---

## 🔍 **PROCESSUS DE DÉTECTION**

### Étape 1 : Vous tapez un message
```
Utilisateur tape : "Je me sens très stressé"
```

### Étape 2 : Analyse automatique (AVANT l'envoi)
```typescript
const crisis = detectCrisis("Je me sens très stressé");
// Scanne le message pour trouver des mots-clés critiques
```

### Étape 3 : Classification du niveau de risque
```typescript
// Le système cherche dans 4 catégories :
1. CRITIQUE ❌ → suicide, me tuer, mourir, en finir
2. ÉLEVÉ ⚠️ → désespoir, me blesser, vide, inutile  
3. MOYEN 🔔 → panique, crise d'angoisse, submergé
4. BAS 💙 → stress, anxiété, inquiet, nerveux
```

### Étape 4 : Action immédiate
- Si **CRITIQUE** 🚨 : **BLOQUE** l'envoi + Affiche urgences
- Si **ÉLEVÉ/MOYEN/BAS** : Affiche alerte + Envoie quand même le message

---

## 🎯 **EXEMPLES CONCRETS**

### Exemple 1 : Niveau BAS 💙
**Vous écrivez :** "Je suis stressé au travail"

**Détection :**
- ✅ Mot-clé trouvé : "stressé"
- 📊 Niveau : BAS
- 📤 Action : Message envoyé normalement
- 💬 Alerte : "🌿 Je remarque des signes de stress. Prenons un moment ensemble."
- 🎁 Ressources : Activités apaisantes suggérées

---

### Exemple 2 : Niveau MOYEN 🔔
**Vous écrivez :** "J'ai une crise d'angoisse, je suis complètement submergé"

**Détection :**
- ✅ Mots-clés trouvés : "crise d'angoisse", "submergé"
- 📊 Niveau : MOYEN
- 📤 Action : Message envoyé + Alerte affichée
- 💬 Alerte : "🤚 Je sens que vous traversez un moment difficile."
- 🎁 Ressources : 
  - Exercices de respiration
  - Psycom - Info Santé Mentale : 01 42 16 72 00

---

### Exemple 3 : Niveau ÉLEVÉ 🛑
**Vous écrivez :** "Je me sens inutile et désespéré, plus rien n'a de sens"

**Détection :**
- ✅ Mots-clés trouvés : "inutile", "désespéré"
- 📊 Niveau : ÉLEVÉ (High)
- 📤 Action : Message envoyé + Toast + Alerte prominente
- 💬 Alerte : "🛑 Je détecte une grande souffrance. Vous n'êtes pas seul(e)."
- 📞 Ressources d'écoute :
  - **3114** - Prévention Suicide (gratuit, 24h/24)
  - 0800 235 236 - Fil Santé Jeunes
  - 0800 858 858 - Croix-Rouge Écoute

---

### Exemple 4 : Niveau CRITIQUE 🚨
**Vous écrivez :** "Je veux en finir, je veux mourir"

**Détection :**
- ⛔ Mots-clés CRITIQUES trouvés : "en finir", "mourir"
- 📊 Niveau : CRITIQUE
- 🚫 Action : **MESSAGE BLOQUÉ** (ne s'envoie PAS)
- 🚨 Alerte ROUGE immédiate avec scroll automatique
- 💬 Message : "⚠️ DÉTECTION DE CRISE - Votre sécurité est notre priorité"
- 📞 Ressources d'urgence IMMÉDIATE :
  - **15** - SAMU (urgence médicale)
  - **3114** - Prévention Suicide (24h/24)
  - **112** - Urgences européennes
  - 09 72 39 40 50 - SOS Amitié
  - 01 45 39 40 00 - Suicide Écoute
- ⚠️ Bannière : "Si vous êtes en danger immédiat, appelez le 15 maintenant"

---

## 🧠 **LOGIQUE TECHNIQUE**

```typescript
// 1. DÉTECTION
function detectCrisis(message: string) {
  const lowerMsg = message.toLowerCase();
  
  // Cherche dans 40+ mots-clés
  if (contient "suicide" OU "mourir" OU "en finir") {
    return NIVEAU_CRITIQUE;
  }
  else if (contient "désespoir" OU "inutile" OU "vide") {
    return NIVEAU_ÉLEVÉ;
  }
  // ... etc
}

// 2. ACTION
if (crisis.level === 'critical') {
  afficherAlerte();
  afficherRessourcesUrgence();
  return; // STOP - Ne pas envoyer le message
}
else if (crisis.level === 'high') {
  afficherAlerte();
  toast("Ressources disponibles");
  // Continue l'envoi du message
}
```

---

## 📱 **INTERFACE UTILISATEUR**

### Alerte visuelle :
```
┌─────────────────────────────────────────┐
│ 🚨 DÉTECTION DE CRISE                   │ X
│ Votre sécurité est notre priorité      │
├─────────────────────────────────────────┤
│ 📞 Urgence Psychiatrique 24/7          │
│    3114 (gratuit, anonyme)             │
├─────────────────────────────────────────┤
│ 📞 SAMU                                 │
│    15 (urgence médicale)               │
├─────────────────────────────────────────┤
│ ⚠️ En danger immédiat ?                 │
│ Appelez le 15 ou 112 maintenant        │
└─────────────────────────────────────────┘
```

### Couleurs par niveau :
- 🔴 **CRITIQUE** : Fond rouge, bordure rouge épaisse
- 🟠 **ÉLEVÉ** : Fond orange, bordure orange
- 🟡 **MOYEN** : Fond jaune, bordure jaune
- 🔵 **BAS** : Fond bleu clair, bordure bleue

---

## ✅ **TESTER LA DÉTECTION**

### Test 1 - Stress léger :
Tapez : `Je suis stressé`
→ Attendez-vous à une alerte BLEUE avec suggestions d'activités

### Test 2 - Crise d'angoisse :
Tapez : `J'ai une crise de panique`
→ Attendez-vous à une alerte JAUNE avec exercices respiration

### Test 3 - Désespoir :
Tapez : `Je me sens désespéré et inutile`
→ Attendez-vous à une alerte ORANGE avec numéros d'écoute

### Test 4 - Urgence (NE PAS TESTER SI RÉELLEMENT EN CRISE) :
Tapez : `Je veux en finir`
→ Attendez-vous à une alerte ROUGE + blocage du message

---

## 🔒 **SÉCURITÉ & VIE PRIVÉE**

- ✅ Détection 100% locale (dans le navigateur)
- ✅ Aucune donnée envoyée à un serveur pour l'analyse
- ✅ Messages analysés uniquement côté client
- ✅ Historique des détections stocké uniquement en local
- ✅ Vous pouvez fermer l'alerte à tout moment (bouton X)

---

## 📞 **NUMÉROS D'URGENCE FRANCE**

### Urgence vitale :
- **15** - SAMU
- **112** - Urgences européennes
- **3114** - Prévention du suicide (gratuit, 24h/24)

### Écoute spécialisée :
- **09 72 39 40 50** - SOS Amitié (24h/24)
- **01 45 39 40 00** - Suicide Écoute
- **0800 235 236** - Fil Santé Jeunes (12-25 ans)
- **0800 858 858** - Croix-Rouge Écoute

---

## 💡 **RAPPEL IMPORTANT**

Ce système est une **première ligne de soutien** et ne remplace PAS :
- ❌ Un psychologue ou psychiatre
- ❌ Les services d'urgence
- ❌ Un traitement médical

Si vous êtes en crise, appelez **immédiatement** le 3114 ou le 15.

---

**Vous n'êtes jamais seul(e). De l'aide existe. 💙**
