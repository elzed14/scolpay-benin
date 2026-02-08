import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function LandingPage() {
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
