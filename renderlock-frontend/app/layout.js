import './globals.css';
import { Providers } from './providers';

export const metadata = {
    title: 'RenderLock | Decentralized GPU Compute on Avalanche',
    description: 'RenderLock is a trustless DePIN marketplace for renting and providing GPU compute power, secured by on-chain escrow on Avalanche Fuji.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ background: '#F8F7F4', color: '#1C1917' }}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}