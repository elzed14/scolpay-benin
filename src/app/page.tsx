"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet, ShieldCheck, BarChart3, Megaphone, Clock, ChevronRight, School } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  schools: {
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

export default function LandingPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/public/announcements/latest");
        if (res.ok) {
          const data = await res.json();
          setNews(data.announcements || []);
        }
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl/none text-gray-900">
                  Le Paiement Scolaire Simple <br />
                  <span className="text-blue-600">Directement vers l&apos;École</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-400 mt-4">
                  Payez vos frais scolaires par Mobile Money (MTN & Moov) sans intermédiaire financier.
                  Une plateforme sécurisée pour les parents et un suivi en temps réel pour les établissements.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-200" asChild>
                  <Link href="/parent">Commencer maintenant</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300" asChild>
                  <Link href="#features">Comment ça marche ?</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-blue-50/30">
                <CardHeader>
                  <Wallet className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Zéro Détention de Fonds</CardTitle>
                  <CardDescription className="text-gray-600">
                    L&apos;argent arrive directement sur le compte Mobile Money marchand de l&apos;école. Nous sommes un prestataire technique uniquement.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-blue-50/30">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Sécurisé & Certifié</CardTitle>
                  <CardDescription className="text-gray-600">
                    Toutes les transactions sont tracées avec des reçus PDF générés instantanément pour garantir la preuve de paiement.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-blue-50/30">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Suivi Simplifié</CardTitle>
                  <CardDescription className="text-gray-600">
                    Les écoles gèrent les élèves, les classes et exportent les données de paiement en un clic vers Excel.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Latest News Feed */}
        <section className="w-full py-12 md:py-24 bg-white border-t">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter">Actualités des Établissements</h2>
              </div>
              <Link href="/parent" className="text-blue-600 font-medium flex items-center hover:underline">
                Voir toutes les écoles <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loadingNews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4 shadow-sm animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                    <div className="h-3 w-full bg-gray-100 rounded mb-1" />
                    <div className="h-3 w-full bg-gray-100 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : news.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Aucune actualité publiée pour le moment.{" "}
                <Link href="/school/register" className="text-blue-600 hover:underline">
                  Inscrivez votre école
                </Link>{" "}
                pour commencer !
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {news.map((item) => (
                  <Card key={item.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                          {item.schools.logo_url ? (
                            <img src={item.schools.logo_url} alt={item.schools.name} className="h-full w-full object-cover" />
                          ) : (
                            <School className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-blue-600 truncate max-w-[150px]">
                          {item.schools.name}
                        </span>
                      </div>
                      <CardTitle className="text-base line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors h-10">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-center text-[10px] text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                        </div>
                        <Link
                          href={`/public/school/${item.schools.slug}#annonces`}
                          className="text-[10px] font-bold text-gray-900 flex items-center group-hover:underline"
                        >
                          Lire plus <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Steps for Parents */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Comment payer pour mon enfant ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
                <h3 className="font-semibold">Rechercher l&apos;école</h3>
                <p className="text-sm text-gray-500">Trouvez l&apos;établissement dans notre base certifiée.</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
                <h3 className="font-semibold">Saisir le matricule</h3>
                <p className="text-sm text-gray-500">Identifiez votre enfant pour voir son solde.</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
                <h3 className="font-semibold">Scanner le QR Code</h3>
                <p className="text-sm text-gray-500">Scannez le code MoMo Pay de l&apos;école ou utilisez l&apos;USSD.</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">4</div>
                <h3 className="font-semibold">Recevoir le reçu</h3>
                <p className="text-sm text-gray-500">Téléchargez votre reçu PDF immédiatement.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 border-t bg-white px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 ScolPay Bénin. Tous droits réservés. Conformité BCEAO.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">Conditions d&apos;utilisation</Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
