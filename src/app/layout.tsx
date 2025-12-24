import type { Metadata, Viewport } from "next";
import { Geist_Mono, Geist, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/metadata";

const NotoSansThai = Noto_Sans_Thai({
    variable: "--font-noto-sans-thai",
    subsets: ["thai"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const GeistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const GeistSans = Geist({
    variable: "--font-geist",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description:
        "Shop the best products at Vendure Store. Quality products, competitive prices, and fast delivery.",
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${NotoSansThai.variable} ${GeistMono.variable} ${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}
            >
                <ThemeProvider>
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
