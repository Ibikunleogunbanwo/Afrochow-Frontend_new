import "./globals.css";
import ClientProviders from "@/app/ClientProviders";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Afrochow - African Food Delivery",
    description: "Order authentic African cuisine from the best restaurants",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
            <Toaster position="top-right" richColors />
            {children}
        </ClientProviders>
        </body>
        </html>
    );
}