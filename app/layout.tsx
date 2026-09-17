import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NEXZZA — Good games. Better people.",
  description: "A new gaming community for builders, squad players, and co-op explorers. Find your people and apply to join NEXZZA.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
