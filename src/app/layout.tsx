import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChildcareOS — Safety operations for childcare centers",
  description: "Real-time ratio controls, pickup authorization, and grounded incident reporting for childcare centers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
