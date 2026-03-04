import type { Metadata, Viewport } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AudioProvider } from "./context/AudioContext";
import { KeyboardHandler } from "./components/KeyboardHandler";
import AudioToggle from "./components/ui/AudioToggle";
import { SecretCursor } from "./components/easter-eggs";
import { WebGLChecker } from "./components/ui/WebGLFallback";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "HORROR PORTFOLIO | SYSTEM v3.0",
  description: "An immersive horror 3D portfolio experience",
  keywords: ["horror", "portfolio", "3D", "interactive", "dark"],
  authors: [{ name: "Horror Portfolio" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root Layout
 * Structure: AppProvider > AudioProvider > WebGLChecker > SecretCursor > children
 * KeyboardHandler est placé à l'intérieur pour accéder au contexte
 * SecretCursor global pour l'easter egg du curseur
 * WebGLChecker vérifie le support WebGL au montage
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${vt323.variable} ${vt323.className} antialiased bg-horror-bg text-foreground min-h-screen scanlines`}
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* Provider global de l'application (state + navigation) */}
        <AppProvider>
          {/* Provider audio global */}
          <AudioProvider>
            {/* Vérification WebGL avec fallback */}
            <WebGLChecker>
              {/* Curseur secret (easter egg) */}
              <SecretCursor idleTime={10000}>
                {/* Gestionnaire de raccourcis clavier */}
                <KeyboardHandler />
                
                {/* Bouton mute/unmute visible sur toutes les pages */}
                <AudioToggle />
                
                {/* Contenu de l'application */}
                {children}
              </SecretCursor>
            </WebGLChecker>
          </AudioProvider>
        </AppProvider>
      </body>
    </html>
  );
}
