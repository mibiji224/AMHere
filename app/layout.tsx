import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider"; // 👈 IMPORT THIS

export const metadata: Metadata = {
  title: "AM-HERE",
  description: "Employee Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* 👇 WRAP CHILDREN HERE */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}