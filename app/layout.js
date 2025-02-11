import { geistSans, geistMono } from "./theme";
import "./globals.css";

// Metadata export (for title, description, etc.)
export const metadata = {
  title: "Learning Tree",
  description: "Community Tutoring",
};

// Viewport export (for viewport and themeColor)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
      <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="antialiased bg-white text-black">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>

          <footer className="w-full py-4 text-center text-sm text-gray-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p>© {currentYear} Learning Tree. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}