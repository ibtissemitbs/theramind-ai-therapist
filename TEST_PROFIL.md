# Test manuel de la gestion de profil

## Étape 1 : Récupérer votre token

1. Ouvrez la console du navigateur (F12)
2. Exécutez :
```javascript
localStorage.getItem("token")
```
3. Copiez le token (sans les guillemets)

## Étape 2 : Tester GET /auth/profile

Remplacez `VOTRE_TOKEN` par le token copié :

```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

**Résultat attendu** : Vos informations de profil en JSON

## Étape 3 : Tester PUT /auth/profile (modifier le nom)

```bash
curl -X PUT http://localhost:3001/auth/profile \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Nouveau Nom Test\"}"
```

**Résultat attendu** : `{"message": "Profil mis à jour avec succès", "user": {...}}`

## Étape 4 : Tester PUT /auth/change-password

```bash
curl -X PUT http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\": \"votre_ancien_mdp\", \"newPassword\": \"nouveau_mdp_123\"}"
```

**Résultat attendu** : `{"message": "Mot de passe changé avec succès"}`

---

## Test dans le navigateur (plus simple)

### Test 1 : Récupérer le profil

```javascript
const token = localStorage.getItem("token");
fetch("http://localhost:3001/auth/profile", {
  headers: { "Authorization": `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Test 2 : Modifier le nom

```javascript
const token = localStorage.getItem("token");
fetch("http://localhost:3001/auth/profile", {
  method: "PUT",
  headers: { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "Test Nouveau Nom" })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Test 3 : Changer le mot de passe

```javascript
const token = localStorage.getItem("token");
fetch("http://localhost:3001/auth/change-password", {
  method: "PUT",
  headers: { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ 
    currentPassword: "votre_mdp_actuel",
    newPassword: "nouveau_mdp_123"
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Vérification des logs

### Dans la console du navigateur (F12), vous devriez voir :

**Lors de la mise à jour du profil** :
```
[PROFILE] Début mise à jour profil...
[PROFILE] Envoi des données: {name: "...", email: "..."}
[API] Mise à jour profil avec: {name: "...", email: "..."}
[API] Response status: 200
[API] Profil mis à jour: {...}
[PROFILE] Profil mis à jour: {...}
```

**Lors du changement de mot de passe** :
```
[PASSWORD] Validation...
[PASSWORD] Envoi requête changement...
[API] Changement mot de passe...
[API] Response status: 200
[API] Mot de passe changé: {...}
[PASSWORD] Mot de passe changé avec succès
```

### Dans le terminal backend, vous devriez voir :

```
[UPDATE_PROFILE] userId: ... body: {...}
[UPDATE_PROFILE] Profil mis à jour avec succès
PUT /auth/profile 200 ...ms
```

Ou :

```
[CHANGE_PASSWORD] userId: ...
[CHANGE_PASSWORD] Mot de passe changé avec succès
PUT /auth/change-password 200 ...ms
```

---

## Si ça ne marche toujours pas

1. **Vérifiez que les serveurs tournent** :
   - Backend : http://localhost:3001
   - Frontend : http://localhost:3000

2. **Ouvrez la console (F12)** et regardez :
   - Onglet "Console" : les logs `[PROFILE]`, `[API]`, `[PASSWORD]`
   - Onglet "Network" : les requêtes HTTP vers `/auth/profile` et `/auth/change-password`

3. **Si vous voyez une erreur 401** :
   - Votre token a expiré
   - Déconnectez-vous et reconnectez-vous

4. **Si vous voyez une erreur 404** :
   - Le backend n'est pas démarré
   - Ou l'URL est incorrecte dans `.env.local`

5. **Si rien ne se passe** :
   - Vérifiez que vous avez cliqué sur "Enregistrer les modifications"
   - Ouvrez F12 et regardez les logs

6. **Notification toast ne s'affiche pas** :
   - Regardez les logs dans la console
   - Le toast devrait apparaître en haut à droite avec ✅ ou ❌
