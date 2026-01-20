import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import Header from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SonnerToast } from "@/components/ui/custom/SonnerToast";
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
