import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family Wealth',
  description: 'Collaborative financial goal tracking for families',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Family Wealth</h1>
          </header>
          <main className="flex-1 p-4">
            {children}
          </main>
          <footer className="bg-gray-200 p-4 text-center">
            <p>© 2024 Family Wealth. Building family financial goals together.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
