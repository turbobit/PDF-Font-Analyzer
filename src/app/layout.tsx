import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PDF Font Analyzer",
    description: "Analyze fonts in your PDF files",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
