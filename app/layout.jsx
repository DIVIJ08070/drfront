
import "./globals.css";
import ClientProviders from "./components/ClientProviders";
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "My PWA",
  manifest: "/manifest.json",
  themeColor: "#000000"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}