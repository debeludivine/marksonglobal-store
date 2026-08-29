import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MarksonGlobal Stores — Nigeria's Premium Digital Supermarket",
    template: "%s | MarksonGlobal Stores",
  },
  description:
    "Shop premium groceries, provisions, and electronics at MarksonGlobal Stores. Quality products delivered across Nigeria.",
  keywords: ["supermarket", "Nigeria", "groceries", "electronics", "online shopping", "MarksonGlobal"],
  openGraph: {
    title: "MarksonGlobal Stores",
    description: "Nigeria's premium digital supermarket — Groceries & Electronics",
    type: "website",
  },
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
