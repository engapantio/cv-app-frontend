import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo/apollo-wrapper";

export const metadata = {
  title: "CV App",
  description: "Curriculum Vitae management application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
