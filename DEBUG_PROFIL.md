# Guide de débogage - Gestion de profil

## Problème rencontré
La page de profil redirige vers la page de connexion même quand l'utilisateur est connecté.

## Corrections appliquées

### 1. Middleware d'authentification backend (src/middleware/auth.ts)
- ✅ Ajout de `(req as any).userId = decoded.userId` pour compatibilité avec les contrôleurs

### 2. Route API frontend (app/api/auth/me/route.ts)
- ✅ Changé `BACKEND_API_URL` pour utiliser `NEXT_PUBLIC_API_URL` (http://localhost:3001)

### 3. Page de profil (app/settings/profile/page.tsx)
- ✅ Ajout du hook `useSession()` pour vérifier l'authentification
- ✅ Attente du chargement de la session avant de charger le profil
- ✅ Redirection vers /login seulement si vraiment non authentifié

## Comment tester

### Étape 1 : Vérifier que vous êtes connecté
1. Ouvrez la console du navigateur (F12)
2. Vérifiez dans localStorage qu'il y a un token :
   ```javascript
   localStorage.getItem("token")
   ```
   - Si null ou undefined → Vous devez vous reconnecter
   - Si présent → Continuez aux étapes suivantes

### Étape 2 : Tester l'endpoint /auth/me
1. Dans la console du navigateur :
   ```javascript
   const token = localStorage.getItem("token");
   fetch("http://localhost:3001/auth/me", {
     headers: { "Authorization": `Bearer ${token}` }
   })
   .then(r => r.json())
   .then(console.log)
   ```
   
   **Résultat attendu** :
   ```json
   {
     "user": {
       "_id": "...",
       "name": "...",
       "email": "..."
     }
   }
   ```
   
   **Si erreur 401** : Le token est invalide ou expiré → Reconnectez-vous

### Étape 3 : Tester l'endpoint /auth/profile
1. Dans la console du navigateur :
   ```javascript
   const token = localStorage.getItem("token");
   fetch("http://localhost:3001/auth/profile", {
     headers: { 
       "Authorization": `Bearer ${token}`,
       "Content-Type": "application/json"
     }
   })
   .then(r => r.json())
   .then(console.log)
   ```
   
   **Résultat attendu** :
   ```json
   {
     "user": {
       "_id": "...",
       "name": "...",
       "email": "...",
       "profileImage": null,
       "emailVerified": "...",
       "totpEnabled": true,
       "createdAt": "..."
     }
   }
   ```

### Étape 4 : Vérifier les logs dans la console
Quand vous cliquez sur l'icône de profil, vous devriez voir dans la console :
```
SessionContext: Token from localStorage: exists
SessionContext: Fetching user data...
SessionContext: Response status: 200
SessionContext: User data received: {...}
```

## Solutions si ça ne marche toujours pas

### Problème : Token expiré
**Solution** : Se déconnecter et se reconnecter
```javascript
localStorage.removeItem("token");
window.location.href = "/login";
```

### Problème : Backend ne répond pas
**Vérifier** :
- Backend tourne sur http://localhost:3001
- Pas d'erreur dans le terminal backend
- Tester : `curl http://localhost:3001/health`

### Problème : CORS
**Si erreur CORS dans la console** :
Vérifier que le backend a bien le middleware CORS configuré (déjà fait normalement)

### Problème : URL incorrecte
**Vérifier** dans `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Logs à surveiller

### Console navigateur (F12)
- Pas d'erreur 401
- Pas d'erreur CORS
- `SessionContext: User state updated: {...}`

### Terminal backend
- `✅ Server is running on port 3001`
- `GET /auth/me 200`
- `GET /auth/profile 200`

### Terminal frontend
- `✓ Ready in ...s`
- Pas d'erreur de compilation

## Test final
1. Connectez-vous à l'application
2. Cliquez sur l'icône utilisateur dans le header
3. Vous devriez voir la page de profil avec vos informations

Si ça ne marche toujours pas, envoyez-moi :
- Le contenu de `localStorage.getItem("token")`
- Les erreurs dans la console (F12)
- Les logs du backend quand vous cliquez sur l'icône profil
