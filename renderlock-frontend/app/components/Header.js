'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Server, LayoutGrid, Cpu } from 'lucide-react';

const tabs = [
    { href: '/', label: 'Marketplace', icon: LayoutGrid },
    { href: '/provide', label: 'Provide Compute', icon: Cpu },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, zIndex: 50,
        }}>
            <div style={{
                maxWidth: 1280, margin: '0 auto',
                padding: '0 40px',
                display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
                height: 60,
            }}>
                {/* ── Logo ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 36, flexShrink: 0 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'var(--accent-light)', border: '1.5px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Server style={{ color: 'var(--accent)', width: 16, height: 16 }} />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.9375rem', fontWeight: 700,
                            color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1,
                        }}>
                            RenderLock
                        </div>
                        <div style={{
                            fontSize: '0.65rem', color: 'var(--text-3)',
                            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                            letterSpacing: '0.06em', marginTop: 3,
                        }}>
                            GPU Compute Marketplace
                        </div>
                    </div>
                </div>

                {/* ── Nav tabs ── */}
                <nav style={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
                    {tabs.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '0 18px',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? 'var(--accent)' : 'var(--text-2)',
                                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'color 0.15s ease, border-color 0.15s ease',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Icon style={{ width: 14, height: 14 }} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Right: status + connect ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 8,
                        background: 'var(--green-light)', border: '1px solid var(--green-border)',
                    }}>
                        <span className="live-dot" />
                        <span style={{
                            fontSize: '0.675rem', fontWeight: 600,
                            color: 'var(--green)',
                            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                            letterSpacing: '0.07em',
                        }}>
                            FUJI LIVE
                        </span>
                    </div>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
