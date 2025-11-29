"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles } from "lucide-react";
import Link from "next/link";

const missions = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Notre Mission",
    description:
      "Démocratiser l’accès au soutien en santé mentale grâce à une intelligence artificielle éthique et à la technologie blockchain, afin de rendre un accompagnement thérapeutique de qualité accessible à tous, partout et à tout moment.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Notre Vision",
    description:
      "Un monde où le soutien psychologique est accessible, confidentiel et personnalisé, grâce à des agents IA de confiance et à une sécurité renforcée par la blockchain.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Nos Valeurs",
    description:
      "Confidentialité, Innovation, Empathie et Confiance constituent les fondations de notre plateforme, garantissant les plus hauts standards de qualité et de sécurité.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Section d’en-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Theramind
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nous révolutionnons le soutien en santé mentale en combinant la
          puissance de l’intelligence artificielle et la transparence de la
          technologie blockchain.
        </p>
      </motion.div>

      {/* Cartes Mission / Vision / Valeurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4 flex justify-center">{mission.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{mission.title}</h3>
              <p className="text-muted-foreground">{mission.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Nos domaines d'intervention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">
          Nos domaines d'intervention
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Dépression", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop&q=80" },
            { title: "Anxiété", image: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=400&h=300&fit=crop&q=80" },
            { title: "Crise d'angoisse", image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop&q=80" },
            { title: "Relaxation", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&q=80" },
            { title: "Gestion du stress", image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=300&fit=crop&q=80" },
            { title: "Gestion de la colère", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=300&fit=crop&q=80" },
          ].map((domain, index) => (
            <motion.div
              key={domain.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden h-48 relative group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${domain.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-lg font-semibold text-center text-white z-10 drop-shadow-lg">
                    {domain.title}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA vers les articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-20"
      >
        <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h2 className="text-3xl font-bold mb-4">
            Ressources & Articles
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Découvrez nos guides complets sur la santé mentale, le bien-être et les techniques de gestion émotionnelle
          </p>
          <Link href="/articles">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Découvrir nos articles
            </button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
