import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = { title: "PMS — Poultry Management System", description: "Farm records, flocks, daily logs and alerts" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={cn("font-sans", geist.variable)}><body className="min-h-screen antialiased">{children}</body></html>);
}
