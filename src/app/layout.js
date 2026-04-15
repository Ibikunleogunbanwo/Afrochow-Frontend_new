import "./globals.css";
import ClientProviders from "@/app/ClientProviders";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";

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
    description: "Order authentic African food, groceries and farm produce from the best stores",
    icons: {
        icon: [
            { url: "/favicon.ico",  sizes: "any" },
            { url: "/icon.png",     type: "image/png", sizes: "512x512" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
        ],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
            <Toaster position="bottom-right" />
            {children}
        </ClientProviders>
        </body>
        </html>
    );
}