# Authentification à deux facteurs (2FA) avec TOTP

## 🎯 Fonctionnalité implémentée

L'authentification à deux facteurs (2FA) utilise maintenant le protocole **TOTP (Time-based One-Time Password)**, compatible avec les applications d'authentification comme :
- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ Duo Mobile
- ✅ 1Password
- ✅ LastPass Authenticator

## 🔧 Architecture technique

### Backend

#### 1. Génération du QR Code TOTP (`authController.ts`)
```typescript
// Génération d'un secret TOTP unique
const secret = speakeasy.generateSecret({
  name: `Theramind (${user.email})`,
  issuer: "Theramind",
  length: 32,
});

// Génération du QR code au format otpauth://
const otpauthUrl = secret.otpauth_url;
const qrCodeImage = await QRCode.toDataURL(otpauthUrl);
```

**Format de l'URL otpauth** :
```
otpauth://totp/Theramind(user@email)?secret=BASE32SECRET&issuer=Theramind
```

#### 2. Vérification du code TOTP
```typescript
const verified = speakeasy.totp.verify({
  secret: qrSession.totpSecret,
  encoding: "base32",
  token: totpCode, // Code à 6 chiffres saisi par l'utilisateur
  window: 2, // Accepter +/- 60 secondes (2 intervalles de 30s)
});
```

#### 3. Modèle de données (`QRSession.ts`)
```typescript
interface IQRSession {
  userId: ObjectId;
  qrCode: string;        // Image du QR code en base64
  token: string;         // Token de session temporaire
  totpSecret: string;    // Secret TOTP encodé en base32
  verified: boolean;     // Statut de vérification
  expiresAt: Date;      // Expiration après 5 minutes
}
```

### Frontend

#### 1. Affichage du QR Code (`qr-verification/page.tsx`)
- Affiche le QR code généré par le backend
- Compte à rebours de 5 minutes
- Champ de saisie pour le code à 6 chiffres
- Validation en temps réel (uniquement des chiffres, max 6)

#### 2. Flux utilisateur
```
1. Login → Redirection vers /qr-verification
2. Affichage du QR code
3. Scan avec application d'authentification
4. Saisie du code à 6 chiffres
5. Vérification → Redirection vers /dashboard
```

## 📋 Étapes d'utilisation

### Pour l'utilisateur

1. **Connexion initiale**
   - Entrer email et mot de passe
   - Cliquer sur "Se connecter"

2. **Configuration 2FA**
   - Un QR code s'affiche
   - Ouvrir votre application d'authentification (ex: Google Authenticator)
   - Scanner le QR code

3. **Vérification**
   - L'application d'authentification génère un code à 6 chiffres
   - Entrer ce code dans le champ prévu
   - Cliquer sur "Vérifier le code"

4. **Accès accordé**
   - Redirection automatique vers le dashboard
   - Token JWT stocké dans localStorage

## 🔐 Sécurité

### Points forts
- ✅ Secret TOTP unique par session (32 caractères)
- ✅ Code à 6 chiffres changeant toutes les 30 secondes
- ✅ Fenêtre de validation de ±60 secondes (window: 2)
- ✅ Session QR expire après 5 minutes
- ✅ Nettoyage automatique des sessions expirées (MongoDB TTL index)
- ✅ Code TOTP à usage unique (qrSession.verified)

### Flux de sécurité
```
1. Login valide → Génération secret TOTP + QR code
2. QR code → URL otpauth:// contient le secret
3. Scan QR → Application sauvegarde le secret
4. Application génère code TOTP basé sur le secret + timestamp
5. Serveur vérifie que le code TOTP correspond au secret stocké
6. Succès → Génération JWT token + Suppression de la session QR
```

## 🛠️ Endpoints API

### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Scannez le QR code avec votre application d'authentification",
  "requiresQRVerification": true,
  "qrCode": "data:image/png;base64,...",
  "qrToken": "abc123...",
  "totpSecret": "JBSWY3DPEHPK3PXP",
  "expiresIn": 300,
  "user": {
    "_id": "...",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### POST `/auth/verify-qr`
**Request:**
```json
{
  "qrToken": "abc123...",
  "totpCode": "123456"
}
```

**Response (succès):**
```json
{
  "message": "Authentification réussie",
  "token": "jwt_token_here",
  "user": { ... }
}
```

**Response (erreur):**
```json
{
  "message": "Code TOTP invalide."
}
```

## 🧪 Tests recommandés

1. **Test de génération QR**
   - Vérifier que le QR code s'affiche correctement
   - Scanner avec Google Authenticator
   - Vérifier que l'application affiche "Theramind (email)"

2. **Test de validation TOTP**
   - Saisir un code valide → Doit réussir
   - Saisir un code invalide → Doit échouer
   - Attendre 30s, utiliser nouveau code → Doit réussir
   - Utiliser un vieux code → Doit échouer

3. **Test d'expiration**
   - Attendre 5 minutes → QR code expiré
   - Vérifier le message d'erreur

4. **Test de réutilisation**
   - Utiliser le même code deux fois → Deuxième tentative échoue

## 📱 Applications d'authentification recommandées

| Application | Plateformes | Lien |
|------------|-------------|------|
| Google Authenticator | iOS, Android | [Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2) |
| Microsoft Authenticator | iOS, Android | [App Store](https://apps.apple.com/app/microsoft-authenticator/id983156458) |
| Authy | iOS, Android, Desktop | [authy.com](https://authy.com/download/) |
| 1Password | iOS, Android, Desktop | [1password.com](https://1password.com/) |

## 🐛 Dépannage

### Problème : "Code TOTP invalide"
**Solutions :**
- Vérifier que l'heure de votre téléphone est synchronisée
- Vérifier que vous utilisez le dernier code généré
- Attendre la génération d'un nouveau code (30 secondes)

### Problème : "QR code expiré"
**Solution :**
- Se reconnecter pour générer un nouveau QR code

### Problème : "Session QR non trouvée"
**Solution :**
- Vérifier la connexion au backend (port 3001)
- Vérifier que MongoDB est connecté
- Vérifier les logs backend pour les erreurs

## 📊 Logs backend

Le backend affiche des logs détaillés :
```
[LOGIN] QR code TOTP généré, secret: JBSWY3DPEHPK3PXP
[VERIFY_QR] Token reçu: abc123... Code TOTP: 123456
[VERIFY_QR] QR code vérifié avec succès
```

## 🔄 Changements par rapport à l'ancienne version

### Avant (JSON-based QR)
- QR code contenait des données JSON
- Non compatible avec les applications d'authentification
- Nécessitait un scanner personnalisé

### Maintenant (TOTP standard)
- QR code au format otpauth:// (standard TOTP)
- Compatible avec toutes les applications d'authentification
- Code à 6 chiffres qui change toutes les 30 secondes
- Sécurité renforcée (basée sur le temps)

## ✅ Avantages de la nouvelle implémentation

1. **Compatibilité universelle** : Fonctionne avec toutes les applications TOTP
2. **Sécurité accrue** : Codes à usage unique basés sur le temps
3. **Expérience utilisateur** : Applications d'authentification familières
4. **Pas de caméra requise** : Saisie manuelle du code à 6 chiffres
5. **Standard industriel** : RFC 6238 (TOTP)

## 📚 Références

- [RFC 6238 - TOTP](https://datatracker.ietf.org/doc/html/rfc6238)
- [speakeasy documentation](https://github.com/speakeasyjs/speakeasy)
- [Google Authenticator](https://github.com/google/google-authenticator)
- [TOTP Key URI Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
