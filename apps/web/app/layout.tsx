import './globals.css';
import localFont from 'next/font/local';
import { Press_Start_2P } from 'next/font/google';
import type { Metadata } from 'next';
import { api, type Server } from '../lib/api';
import { SiteHeader } from '../components';

const sans = localFont({ src: '../fonts/plus-jakarta-sans-latin-wght-normal.woff2', variable: '--font-mc-sans', weight: '200 800', display: 'swap' });
const mono = localFont({ src: '../fonts/jetbrains-mono-latin-wght-normal.woff2', variable: '--font-mc-mono', weight: '100 800', display: 'swap' });
const display = localFont({ src: '../fonts/syne-latin-wght-normal.woff2', variable: '--font-mc-display', weight: '400 800', display: 'swap' });
const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-mc-pixel', display: 'swap' });

export const metadata: Metadata = { title: 'JPCS-APC Minecraft', description: 'JPCS-APC Minecraft server status and player list.' };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const servers = await api<Server[]>('/servers');
  const anyOnline = servers?.some((server) => server.online) ?? false;

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable} ${pixel.variable}`}>
      <body>
        <SiteHeader anyOnline={anyOnline} />
        <main className="shell">{children}</main>
        <footer className="nether-footer">Created by <a href="https://gelolaus.com">gelolaus.com</a></footer>
      </body>
    </html>
  );
}
