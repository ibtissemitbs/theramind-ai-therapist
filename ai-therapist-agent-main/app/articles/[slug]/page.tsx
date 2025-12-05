"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  BookmarkPlus,
  Bookmark,
  Check,
  Phone,
  ExternalLink
} from "lucide-react";
import { getArticleBySlug, articles } from "@/lib/articles-data";
import { useToast } from "@/hooks/use-toast";

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const article = getArticleBySlug(slug);
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  if (!article) {
    notFound();
  }

  // Fonction pour partager l'article
  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copier le lien
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié !",
          description: "Le lien de l'article a été copié dans le presse-papier.",
        });
      }
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  // Fonction pour sauvegarder l'article
  const handleSave = () => {
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    
    if (isSaved) {
      // Retirer de la liste
      const filtered = savedArticles.filter((s: string) => s !== slug);
      localStorage.setItem("savedArticles", JSON.stringify(filtered));
      setIsSaved(false);
      toast({
        title: "Article retiré",
        description: "L'article a été retiré de vos favoris.",
      });
    } else {
      // Ajouter à la liste
      savedArticles.push(slug);
      localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
      setIsSaved(true);
      toast({
        title: "Article sauvegardé !",
        description: "L'article a été ajouté à vos favoris.",
      });
    }
  };

  // Vérifier si l'article est déjà sauvegardé
  useState(() => {
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    setIsSaved(savedArticles.includes(slug));
  });

  // Articles similaires (même catégorie)
  const relatedArticles = articles
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Image hero */}
      <div className="relative h-[400px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        
        {/* Contenu hero */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {article.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} de lecture</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu de l'article */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/articles">
                <ArrowLeft className="w-4 h-4" />
                Retour aux articles
              </Link>
            </Button>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-3 mb-8"
          >
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${isSaved ? 'bg-primary/10 border-primary' : ''}`}
              onClick={handleSave}
            >
              {isSaved ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
              {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
            </Button>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {article.content.introduction}
              </p>
            </Card>
          </motion.div>

          {/* Sections de l'article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
          >
            {article.content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                En conclusion
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {article.content.conclusion}
              </p>
            </Card>
          </motion.div>

          {/* Ressources */}
          {article.content.resources && article.content.resources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="p-6 mb-12">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Ressources utiles
                </h3>
                <div className="space-y-3">
                  {article.content.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                    >
                      <span className="font-medium">{resource.title}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 mb-12">
              <h3 className="text-2xl font-bold mb-3">
                Besoin d'en parler ?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Notre IA thérapeutique Aura est disponible 24h/24 pour vous accompagner
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Commencer une conversation
                </Link>
              </Button>
            </Card>
          </motion.div>

          {/* Articles similaires */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <h3 className="text-2xl font-bold mb-6">Articles similaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/articles/${relatedArticle.slug}`}
                  >
                    <Card className="overflow-hidden h-full group cursor-pointer hover:shadow-xl transition-all duration-300">
                      <div className="relative h-40 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${relatedArticle.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedArticle.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {relatedArticle.readTime}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
