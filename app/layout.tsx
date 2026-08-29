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

import { NetworkProvider, NetworkEffectiveType } from "@/components/providers/NetworkProvider";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const networkQualityCookie = cookieStore.get('x-network-quality')?.value as NetworkEffectiveType | undefined;
  
  return (
    <html lang="en">
      <body>
        <NetworkProvider initialType={networkQualityCookie}>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
