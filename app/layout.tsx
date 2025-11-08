import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "List Tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
  