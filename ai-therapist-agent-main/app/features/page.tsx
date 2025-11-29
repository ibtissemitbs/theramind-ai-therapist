"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Fingerprint,
  Activity,
  Bot,
  LineChart,
  Wifi,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="w-10 h-10 text-primary" />,
    title: "Thérapie assistée par IA",
    description:
      "Accès 24h/24 et 7j/7 à des agents IA empathiques formés à différentes approches thérapeutiques, offrant un accompagnement personnalisé en santé mentale.",
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Sécurité renforcée par la blockchain",
    description:
      "Vos sessions sont protégées grâce à la technologie blockchain, garantissant confidentialité, intégrité et traçabilité des échanges.",
  },
  {
    icon: <Brain className="w-10 h-10 text-primary" />,
    title: "Analyse intelligente",
    description:
      "L’IA comprend vos émotions grâce à l’analyse du langage naturel et détecte les signaux émotionnels pour mieux adapter son accompagnement.",
  },
  {
    icon: <Activity className="w-10 h-10 text-primary" />,
    title: "Détection des crises",
    description:
      "Surveillance en temps réel et protocoles d’urgence pour assurer votre sécurité lors de situations émotionnelles critiques.",
  },
  {
    icon: <Wifi className="w-10 h-10 text-primary" />,
    title: "Intégration IoT",
    description:
      "Connectez vos objets connectés pour créer un environnement apaisant et adapté à votre bien-être mental.",
  },
  {
    icon: <LineChart className="w-10 h-10 text-primary" />,
    title: "Suivi de progression",
    description:
      "Visualisez vos progrès grâce à des tableaux de bord et analyses détaillés, avec un historique de sessions vérifié et sécurisé.",
  },
  {
    icon: <Fingerprint className="w-10 h-10 text-primary" />,
    title: "Confidentialité absolue",
    description:
      "Chiffrement de bout en bout et protocoles de confidentialité avancés pour garantir la sécurité totale de vos données.",
  },
  {
    icon: <Heart className="w-10 h-10 text-primary" />,
    title: "Prise en charge holistique",
    description:
      "Intégration avec les objets de santé connectés et professionnels du bien-être pour un suivi global et équilibré.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Titre principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Fonctionnalités de la plateforme
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez comment Theramind révolutionne l’accompagnement en santé
          mentale grâce à l’intelligence artificielle et à une protection
          optimale de votre vie privée.
        </p>
      </motion.div>

      {/* Grille des fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Appel à l’action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-16"
      >
        <h2 className="text-2xl font-semibold mb-4">Prêt à commencer ?</h2>
        <p className="text-muted-foreground mb-8">
          Rejoignez des milliers d’utilisateurs qui bénéficient d’un
          accompagnement intelligent et bienveillant grâce à l’IA Theramind.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Commencer votre parcours
          <Heart className="ml-2 w-5 h-5" />
        </a>
      </motion.div>
    </div>
  );
}
