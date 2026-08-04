import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ApolloWrapper } from "@/lib/apollo/apollo-wrapper";
import { ThemeProvider } from "next-themes";
import { IntlProvider } from "@/components/providers/intl-provider";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV App",
  description: "Curriculum Vitae management application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <IntlProvider>
            <ApolloWrapper>{children}</ApolloWrapper>
          </IntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
