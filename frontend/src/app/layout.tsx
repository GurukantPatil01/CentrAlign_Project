import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Enterprise Sandbox",
  description: "CentrAlign AI autonomous enterprise worker prototype"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
