"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  uploadProfileImage,
  type UserProfile,
  type UpdateProfileData,
  type ChangePasswordData 
} from "@/lib/api/profile";
import { User, Mail, Lock, Camera, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading: sessionLoading, user: sessionUser, checkSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Formulaire profil
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Image de profil
  const selectedImageRef = useRef<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    // Attendre que la session soit chargée
    if (sessionLoading) return;
    
    // Si pas authentifié, rediriger
    if (!isAuthenticated) {
      toast({
        title: "Non authentifié",
        description: "Veuillez vous connecter pour accéder à votre profil",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    
    // Charger le profil
    loadProfile();
  }, [sessionLoading, isAuthenticated]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      // Ne pas remplir les champs, les garder vides
      // Les données actuelles seront affichées dans les placeholders
      if (data.profileImage) {
        setPreviewImage(data.profileImage);
        // Forcer le rechargement de l'image
        setImageKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du chargement du profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("[IMAGE_CHANGE] =================================");
    console.log("[IMAGE_CHANGE] Event déclenché");
    console.log("[IMAGE_CHANGE] Files:", e.target.files);
    console.log("[IMAGE_CHANGE] Fichier sélectionné:", file);
    
    if (!file) {
      console.log("[IMAGE_CHANGE] ❌ Aucun fichier sélectionné");
      return;
    }

    console.log("[IMAGE_CHANGE] 📁 Info fichier:");
    console.log("[IMAGE_CHANGE]   - Nom:", file.name);
    console.log("[IMAGE_CHANGE]   - Type:", file.type);
    console.log("[IMAGE_CHANGE]   - Taille:", (file.size / 1024).toFixed(2), "KB");

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      console.log("[IMAGE_CHANGE] ❌ Type non valide");
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide (JPG, PNG ou GIF)",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) {
      console.log("[IMAGE_CHANGE] ❌ Fichier trop gros");
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      });
      return;
    }

    console.log("[IMAGE_CHANGE] ✓ Fichier valide, lecture en cours...");
    console.log("[IMAGE_CHANGE] Fichier à traiter:", file.name, file.size, "bytes");
    
    setLoadingImage(true);
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      console.log("[IMAGE_CHANGE] 📖 Début de lecture...");
    };
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(0);
        console.log(`[IMAGE_CHANGE] 📊 Progression: ${percent}%`);
      }
    };
    
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log("[IMAGE_CHANGE] ✅ Lecture terminée !");
      console.log("[IMAGE_CHANGE]   - Result type:", typeof result);
      console.log("[IMAGE_CHANGE]   - Preview length:", result?.length);
      console.log("[IMAGE_CHANGE]   - Preview start:", result?.substring(0, 50));
      
      console.log("[IMAGE_CHANGE] 🔄 Mise à jour des states...");
      
      // Mettre à jour TOUS les states et refs ensemble
      selectedImageRef.current = file;
      setSelectedImageName(file.name);
      setPreviewImage(result);
      setImageKey(Date.now());
      setLoadingImage(false);
      
      console.log("[IMAGE_CHANGE]   - Tous les states mis à jour");
      console.log("[IMAGE_CHANGE]   - selectedImageRef.current:", selectedImageRef.current?.name);
      console.log("[IMAGE_CHANGE]   - selectedImageName:", file.name);
      console.log("[IMAGE_CHANGE]   - previewImage length:", result.length);
      
      console.log("[IMAGE_CHANGE] ✅ TOUT EST PRÊT !");
      
      toast({
        title: "✓ Image chargée",
        description: "Cliquez sur 'Enregistrer la photo' pour sauvegarder",
        duration: 3000,
      });
    };
    
    reader.onerror = (error) => {
      console.error("[IMAGE_CHANGE] ❌ Erreur lecture fichier:", error);
      console.error("[IMAGE_CHANGE] Reader error:", reader.error);
      setLoadingImage(false);
      toast({
        title: "Erreur",
        description: "Erreur lors de la lecture du fichier",
        variant: "destructive",
      });
    };
    
    console.log("[IMAGE_CHANGE] 🚀 Démarrage lecture DataURL...");
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      console.log("[PROFILE] Début mise à jour profil...");
      const updateData: UpdateProfileData = {
        name: profileForm.name || profile?.name || "",
        email: profileForm.email || profile?.email || "",
      };

      // Si une nouvelle image est sélectionnée
      if (selectedImageRef.current) {
        console.log("[PROFILE] Upload image...");
        const base64Image = await uploadProfileImage(selectedImageRef.current);
        updateData.profileImage = base64Image;
      }

      console.log("[PROFILE] Envoi des données:", updateData);
      const updatedProfile = await updateProfile(updateData);
      console.log("[PROFILE] Profil mis à jour:", updatedProfile);
      
      // Mettre à jour immédiatement avec les données retournées par le serveur
      setProfile(updatedProfile);
      if (updatedProfile.profileImage) {
        setPreviewImage(updatedProfile.profileImage);
        setImageKey(prev => prev + 1);
      }
      
      // Vider les champs du formulaire
      setProfileForm({
        name: "",
        email: "",
      });
      selectedImageRef.current = null;
      setSelectedImageName("");
      
      // Mettre à jour le contexte de session pour rafraîchir le header
      console.log("[PROFILE] Mise à jour session...");
      await checkSession();
      console.log("[PROFILE] Session mise à jour");
      
      // Émettre l'événement pour que le header se mette à jour
      window.dispatchEvent(new Event('profileUpdated'));
      console.log("[PROFILE] Événement profileUpdated émis");
      
      toast({
        title: "✅ Succès",
        description: "Votre profil a été mis à jour avec succès",
      });
      
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("[PROFILE] Erreur mise à jour:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[PASSWORD] Validation...");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setChangingPassword(true);

    try {
      console.log("[PASSWORD] Envoi requête changement...");
      const passwordData: ChangePasswordData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      await changePassword(passwordData);
      
      console.log("[PASSWORD] Mot de passe changé avec succès");
      
      toast({
        title: "✅ Succès",
        description: "Mot de passe changé avec succès",
        duration: 3000,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("[PASSWORD] Erreur:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du changement de mot de passe",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié après chargement, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et votre sécurité
            </p>
          </div>
        </div>

        {/* Formulaire unique pour tout */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Photo de profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo de profil
              </CardTitle>
              <CardDescription>
                Changez votre photo de profil (Max 5 Mo)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="relative">
                  {loadingImage ? (
                    <div className="h-24 w-24 rounded-full border-2 border-primary/20 flex items-center justify-center bg-muted">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : previewImage ? (
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                      <img 
                        src={previewImage} 
                        alt={profile?.name}
                        className="h-full w-full object-cover"
                        key={imageKey}
                      />
                    </div>
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {selectedImageName && !loadingImage && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Camera className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="profile-image" className="text-sm font-medium mb-2 block">
                        Choisir une image
                      </Label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full max-w-xs text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-primary-foreground
                          hover:file:bg-primary/90
                          cursor-pointer"
                      />
                    </div>
                    
                    {/* Debug info 
                    <div className="text-xs space-y-1 bg-muted p-2 rounded">
                      <p>selectedImageName: {selectedImageName ? `✓ ${selectedImageName}` : '✗ vide'}</p>
                      <p>selectedImageRef: {selectedImageRef.current ? `✓ ${selectedImageRef.current.name}` : '✗ null'}</p>
                      <p>previewImage: {previewImage ? `✓ ${previewImage.substring(0, 30)}...` : '✗ null'}</p>
                      <p>loadingImage: {loadingImage ? '✓ true' : '✗ false'}</p>
                      <p>imageKey: {imageKey}</p>
                    </div>*/}
                    
                    {selectedImageName && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Image sélectionnée: {selectedImageName}
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG ou GIF. Maximum 5 Mo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Modifiez votre nom et votre adresse e-mail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <div className="text-sm text-muted-foreground mb-1">
                  Actuel: {profile?.name}
                </div>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Nouveau nom (laissez vide pour garder l'actuel)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="text-sm text-muted-foreground mb-1">
                  Actuel: {profile?.email}
                </div>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="Nouvel email (laissez vide pour garder l'actuel)"
                />
                {profile?.emailVerified ? (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ E-mail vérifié
                  </p>
                ) : (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    ⚠ E-mail non vérifié
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={updating || (!profileForm.name && !profileForm.email && !selectedImageRef.current)}
              >
                <Save className="h-4 w-4 mr-2" />
                {updating ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                * Remplissez seulement les champs que vous souhaitez modifier
              </p>
            </div>
          </CardContent>
        </Card>
      </form>

        <Separator />

        {/* Changer le mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Changer le mot de passe
            </CardTitle>
            <CardDescription>
              Assurez-vous d'utiliser un mot de passe sécurisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" disabled={changingPassword} variant="secondary">
                <Lock className="h-4 w-4 mr-2" />
                {changingPassword ? "Changement..." : "Changer le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compte créé le</span>
              <span className="font-medium">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("fr-FR") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Authentification 2FA</span>
              <span className="font-medium">
                {profile?.totpEnabled ? (
                  <span className="text-green-600">✓ Activée</span>
                ) : (
                  <span className="text-orange-600">Désactivée</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
