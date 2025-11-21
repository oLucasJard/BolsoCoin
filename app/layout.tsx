import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({ 
  subsets: ["latin"],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "BolsoCoin - Central de Gerenciamento de Carteira",
  description: "Gerenciamento financeiro pessoal com IA para entrada de dados por texto, áudio e imagem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans h-full antialiased`}>
        {children}
        <Toaster position="top-center" richColors toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #FFD100',
          },
        }} />
      </body>
    </html>
  );
}

