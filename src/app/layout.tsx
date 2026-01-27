import { ConditionalFooter } from "@/components/ui/custom/layout/ConditionalFooter";
import Header from "@/components/ui/custom/layout/Header";
import { QueryProvider } from "@/components/ui/custom/providers/QueryProvider";
import { SessionProvider } from "@/components/ui/custom/providers/SessionProvider";
import { SonnerToast } from "@/components/ui/custom/SonnerToast";
import { ThemeProvider } from "@/components/ui/custom/theme/ThemeProvider";
import "@fontsource-variable/roboto";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Immerse - RPG Campaign Management & Worldbuilding",
  description: "Tool for managing your RPG campaigns and worldbuilding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
              <SonnerToast />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
