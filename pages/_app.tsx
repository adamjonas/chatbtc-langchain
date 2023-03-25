import '@/styles/base.css';
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider enableSystem={true} attribute='class' >
      <main className={`${inter.variable} h-full`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;
