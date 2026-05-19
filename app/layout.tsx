import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import CategoriesBar from "@/components/layout/CategoriesBar";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/layout/SplashScreen";
import FloatingWhatsApp from "@/components/shared/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {

  title: "HYDER TRADERS | Solar Equipment Store",
  description: "Your one-stop shop for premium solar panels, inverters, and batteries in Pakistan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-poppins">
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <SplashScreen />
              <header>
                <TopBar />
                <Navbar />
                <CategoriesBar />
              </header>

              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <FloatingWhatsApp />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

