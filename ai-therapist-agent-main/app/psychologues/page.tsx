"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Star, Award, Calendar, Loader2 } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PsychologuesPage() {
  const { isAuthenticated, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  const psychologists = [
    {
      id: 1,
      name: "Mme Nour el houda BEN ROMDHANE",
      speciality: "Psychothérapeute",
      description: "Psychothérapeute spécialisée dans l'accompagnement thérapeutique et le soutien psychologique.",
      experience: "Expérience confirmée",
      rating: 4.8,
      reviews: 89,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "32, Avenue Habib Bourguiba, Nouvelle Ariana 2080, Ariana, Tunisie",
      languages: ["Arabe", "Français"],
      image: "https://ui-avatars.com/api/?name=Nour+Ben+Romdhane&size=400&background=10b981&color=fff&bold=true",
      disponibility: "Sur rendez-vous",
      website: "https://www.med.tn/medecin/psychotherapeute/ariana/nouvelle-ariana/mme-nour-el-houda-ben-romdhane",
    },
    {
      id: 2,
      name: "Dr Tasnim NSIBI",
      speciality: "Psychiatre",
      description: "Psychiatre spécialisée dans le traitement des troubles mentaux et la prescription de traitements médicamenteux.",
      experience: "Expérience confirmée",
      rating: 4.9,
      reviews: 124,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "Elysée Médical Bureau Nu 20, 2ème étage, Av. Mahdia, El Mourouj 1, 2074 Ben Arous, Tunisie",
      languages: ["Arabe", "Français"],
      image: "https://ui-avatars.com/api/?name=Tasnim+Nsibi&size=400&background=3b82f6&color=fff&bold=true",
      disponibility: "Sur rendez-vous",
      website: "https://www.med.tn/medecin/psychiatre/ben-arous/el-mourouj-1/dr-tasnim-nsibi",
    },
    {
      id: 3,
      name: "Mr Kamel ABDELHAK",
      speciality: "Psychologue",
      description: "Psychologue clinicien spécialisé dans l'évaluation psychologique et la thérapie comportementale.",
      experience: "Expérience confirmée",
      rating: 4.7,
      reviews: 97,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "23 avenue des Etats Unis d'Amerique, Le Belvédère Tunis, Tunis Belvédère 1002, Tunis, Tunisie",
      languages: ["Arabe", "Français"],
      image: "https://ui-avatars.com/api/?name=Kamel+Abdelhak&size=400&background=8b5cf6&color=fff&bold=true",
      disponibility: "Sur rendez-vous",
      website: "https://www.med.tn/medecin/psychologue/tunis/tunis-belvedere/mr-kamel-abdelhak",
    },
    {
      id: 4,
      name: "Dr. Amira Chelly",
      speciality: "Psychologue clinicienne",
      description: "Spécialisée dans la thérapie cognitivo-comportementale et le traitement de l'anxiété et de la dépression.",
      experience: "12 ans d'expérience",
      rating: 4.8,
      reviews: 112,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "Centre Ville, Tunis 1000",
      languages: ["Arabe", "Français", "Anglais"],
      image: "https://ui-avatars.com/api/?name=Amira+Chelly&size=400&background=ec4899&color=fff&bold=true",
      disponibility: "Lun-Ven: 9h-18h",
      website: "https://www.med.tn/medecin/psychologue/tunis/",
    },
    {
      id: 5,
      name: "Dr. Sami Zaouali",
      speciality: "Psychiatre et psychothérapeute",
      description: "Expert en psychiatrie générale, troubles de l'humeur et gestion du stress.",
      experience: "15 ans d'expérience",
      rating: 4.9,
      reviews: 145,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "La Marsa, Tunis 2078",
      languages: ["Arabe", "Français"],
      image: "https://ui-avatars.com/api/?name=Sami+Zaouali&size=400&background=f59e0b&color=fff&bold=true",
      disponibility: "Mar-Sam: 10h-19h",
      website: "https://www.med.tn/medecin/psychiatre/tunis/",
    },
    {
      id: 6,
      name: "Mme Leila Ben Ammar",
      speciality: "Psychologue pour enfants et adolescents",
      description: "Spécialisée dans le développement de l'enfant, troubles du comportement et soutien parental.",
      experience: "10 ans d'expérience",
      rating: 5.0,
      reviews: 156,
      phone: "Contactez via Med.tn",
      email: "contact@med.tn",
      address: "Menzah, Tunis 1004",
      languages: ["Arabe", "Français"],
      image: "https://ui-avatars.com/api/?name=Leila+Ben+Ammar&size=400&background=06b6d4&color=fff&bold=true",
      disponibility: "Lun-Jeu: 14h-19h",
      website: "https://www.med.tn/medecin/psychologue/tunis/",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Psychologues recommandés</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez le professionnel qui correspond à vos besoins. Tous nos psychologues sont diplômés et expérimentés.
          </p>
        </motion.div>

        {/* Liste des psychologues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {psychologists.map((psy, index) => (
            <motion.div
              key={psy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar Emoji */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary/30 flex items-center justify-center text-4xl">
                        {psy.id === 1 ? "👩‍⚕️" : psy.id === 2 ? "👩‍⚕️" : psy.id === 3 ? "👨‍⚕️" : psy.id === 4 ? "👩‍⚕️" : psy.id === 5 ? "👨‍⚕️" : "👩‍⚕️"}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{psy.name}</h3>
                          <p className="text-sm text-primary font-medium">{psy.speciality}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-sm">{psy.rating}</span>
                          <span className="text-xs text-muted-foreground">({psy.reviews})</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{psy.description}</p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                          <Award className="w-3 h-3" />
                          {psy.experience}
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                          <Calendar className="w-3 h-3" />
                          {psy.disponibility}
                        </div>
                      </div>

                      {/* Langues */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {psy.languages.map((lang) => (
                          <span key={lang} className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                            {lang}
                          </span>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="space-y-1 mb-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${psy.phone}`} className="hover:text-primary transition-colors">
                            {psy.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${psy.email}`} className="hover:text-primary transition-colors">
                            {psy.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{psy.address}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <a href={psy.website || `tel:${psy.phone}`} target="_blank" rel="noopener noreferrer">
                            Prendre RDV
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a href={`mailto:${psy.email}`}>Contacter</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note importante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Important
              </h3>
              <p className="text-sm text-muted-foreground">
                Cette liste est fournie à titre informatif. Theramind n'est pas responsable des services fournis par ces professionnels. 
                Nous vous recommandons de vérifier leurs qualifications et de choisir celui qui correspond le mieux à vos besoins.
                En cas d'urgence, contactez le 190 (Police), le 197 (Protection Civile) ou SOS Détresse : 23 288 588.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
