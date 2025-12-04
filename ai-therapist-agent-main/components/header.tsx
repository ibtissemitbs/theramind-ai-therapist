"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Menu,
  X,
  MessageCircle,
  AudioWaveform,
  LogOut,
  LogIn,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "@/lib/contexts/session-context";

export function Header() {
  const { isAuthenticated, logout, user, checkSession } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(user?.profileImage);

  // Synchroniser profileImageUrl avec user.profileImage
  useEffect(() => {
    console.log("Header: user.profileImage changed:", user?.profileImage ? `${user.profileImage.substring(0, 50)}...` : "null");
    setProfileImageUrl(user?.profileImage);
    setImageKey(prev => prev + 1);
  }, [user?.profileImage]);

  // Écouter les mises à jour de profil
  useEffect(() => {
    const handleProfileUpdate = async () => {
      console.log("Header: Profile updated event received, refreshing...");
      console.log("Header: Current user before refresh:", user);
      // Attendre un peu que le backend ait le temps de sauvegarder
      await new Promise(resolve => setTimeout(resolve, 200));
      // Forcer le rechargement de la session
      await checkSession();
      console.log("Header: After checkSession, user should be updated");
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [checkSession]);

  console.log("Header: Render - Auth state:", { isAuthenticated, userId: user?._id });
  console.log("Header: Render - profileImage:", user?.profileImage ? `${user.profileImage.substring(0, 50)}...` : "null");
  console.log("Header: Render - imageKey:", imageKey);

  // ── libellés FR ───────────────────────────────────────────────────────────────
  const navItems = [
    { href: "/features", label: "Fonctionnalités" },
    { href: "/activities", label: "Activités" },
    { href: "/articles", label: "Articles" },
    { href: "/about", label: "À propos" },
  ];

  const authNavItems = [
    { href: "/psychologues", label: "Psychologues" },
  ];

  return (
    <div className="w-full fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 border-b border-primary/10" />
      <header className="relative max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <AudioWaveform className="h-7 w-7 text-primary animate-pulse-gentle" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Theramind
              </span>
              <span className="text-xs dark:text-muted-foreground">
                Votre compagnon IA pour la santé mentale
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
              {isAuthenticated && authNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    className="hidden md:flex gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Link href="/dashboard">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Dashboard
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={user?.name || "Profile"}
                            className="w-full h-full rounded-full object-cover"
                            key={`profile-img-${imageKey}`}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Bonjour {user?.name || "utilisateur"} !</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/settings/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Gérer profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <SignInButton />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Ouvrir le menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10">
            <nav className="flex flex-col space-y-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && authNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Button
                    asChild
                    className="mt-2 mx-4 gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Link href="/dashboard">
                      <MessageCircle className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  <Link
                    href="/settings/profile"
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Mon Profil
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* <LoginModal /> */}
    </div>
  );
}
