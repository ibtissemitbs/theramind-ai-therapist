"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { articles, getAllCategories } from "@/lib/articles-data";
import { useState } from "react";

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category === selectedCategory)
    : articles;

  return (
    <div className="container mx-auto px-4 py-24">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Articles & Ressources
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos guides complets sur la santé mentale, le bien-être et les techniques de gestion émotionnelle
        </p>
      </motion.div>

      {/* Filtres par catégorie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
        >
          Tous les articles
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </motion.div>

      {/* Grille d'articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/articles/${article.slug}`}>
              <Card className="overflow-hidden h-full group cursor-pointer hover:shadow-2xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${article.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {article.category}
                  </Badge>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                    {article.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Bouton */}
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Lire l'article
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Message si aucun article */}
      {filteredArticles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground text-lg">
            Aucun article trouvé dans cette catégorie
          </p>
        </motion.div>
      )}

      {/* Section CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-20 text-center"
      >
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">
            Besoin d'un accompagnement personnalisé ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Discutez avec notre IA thérapeutique Aura pour un soutien adapté à vos besoins
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              Commencer une séance
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
