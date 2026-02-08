export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center p-12 bg-blue-600 text-white">
                <div className="max-w-md">
                    <h2 className="text-4xl font-bold mb-6">Simplifiez la gestion des frais scolaires.</h2>
                    <p className="text-xl text-blue-100">
                        Une interface intuitive pour les parents, une gestion rigoureuse pour les écoles.
                        Le futur de la fintech éducative au Bénin commence ici.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
