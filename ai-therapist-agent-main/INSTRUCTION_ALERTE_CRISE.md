# 🚨 INSTRUCTION URGENTE - Ajout de l'alerte de crise

## Problème
L'alerte de crise n'apparaît PAS car le composant UI n'est pas dans le code.

## Solution MANUELLE (copier-coller)

### Étape 1 : Ouvrir le fichier
Ouvrez : `app/therapy/[sessionId]/page.tsx`

### Étape 2 : Trouver la ligne 989
Cherchez cette ligne EXACTE :
```tsx
          {/* Écran d'accueil si pas de messages */}
```

### Étape 3 : JUSTE AVANT cette ligne, ajoutez ce code :

```tsx
          {crisisDetected && crisisDetected.level !== 'none' && (
            <motion.div
              id="crisis-alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mx-4 my-4 p-4 rounded-lg border-2 relative",
                crisisDetected.level === 'critical' && "border-red-500 bg-red-50 dark:bg-red-950/20",
                crisisDetected.level === 'high' && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
                crisisDetected.level === 'medium' && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
                crisisDetected.level === 'low' && "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => setCrisisDetected(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">
                    {crisisDetected.level === 'critical' && '🚨'}
                    {crisisDetected.level === 'high' && '🛑'}
                    {crisisDetected.level === 'medium' && '🔔'}
                    {crisisDetected.level === 'low' && '💙'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{crisisDetected.message}</h3>
                    <p className="text-sm text-muted-foreground">Des ressources sont disponibles pour vous aider.</p>
                  </div>
                </div>

                {crisisDetected.resources && crisisDetected.resources.length > 0 && (
                  <div className="space-y-2">
                    {crisisDetected.resources.map((resource, idx) => (
                      <div key={idx} className="bg-background/80 p-3 rounded-md border">
                        <div className="font-medium text-sm">{resource.name}</div>
                        <div className="text-xs text-muted-foreground mb-1">{resource.description}</div>
                        <a
                          href={`tel:${resource.phone}`}
                          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          📞 {resource.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {crisisDetected.level === 'critical' && (
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      ⚠️ En cas d'urgence vitale, appelez immédiatement le 15 (SAMU) ou le 112
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

```

### Étape 4 : Sauvegarder et tester

Tapez dans le chat : **"Je suis stressé"**

Vous devriez voir apparaître une **boîte bleue 💙** avec des ressources d'aide.

## Tests à faire :
- ✅ "Je suis stressé" → Alerte BLEUE 💙
- ✅ "J'ai une crise d'angoisse" → Alerte JAUNE 🔔  
- ✅ "Je me sens désespéré" → Alerte ORANGE 🛑
- ✅ "Je veux mourir" → Alerte ROUGE 🚨 + message bloqué
