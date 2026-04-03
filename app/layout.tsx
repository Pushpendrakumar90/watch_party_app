import "./globals.css";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "YouTube Watch Party",
  description: "Sync and watch with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen font-sans">
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}