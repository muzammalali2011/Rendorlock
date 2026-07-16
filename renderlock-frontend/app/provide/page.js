'use client';

import { useState } from 'react';
import { useWriteContract, useReadContracts, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { RENDERLOCK_ADDRESS, RENDERLOCK_ABI } from '@/lib/contract';
import { parseSpecs, buildSpecString } from '@/lib/specs';
import Header from '@/app/components/Header';
import {
    Cpu, Server, ShieldCheck, Lock, Trash2,
    HardDrive, Database, MonitorDot, Hash, CheckCircle, Zap,
    Terminal, Copy, Monitor, Globe,
} from 'lucide-react';

// ── Quick Start command snippets ──
const SETUP_COMMANDS = {
    windows: `# Run in PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
irm https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent/start.ps1 | iex`,
    linux: `# Run in Terminal (Linux / macOS)
curl -sSL https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent/start.sh | bash`,
};

// ── Quick Start Guide component ──
const QuickStartGuide = () => {
    const [os, setOs] = useState('windows');
    const [copied, setCopied] = useState(false);

    const copyCmd = () => {
        navigator.clipboard.writeText(SETUP_COMMANDS[os]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const steps = [
        {
            num: '01',
            icon: Terminal,
            title: 'Run the setup script',
            desc: 'One command installs Docker + tunnel and starts your workspace in the background.',
        },
        {
            num: '02',
            icon: Globe,
            title: 'Copy your tunnel URL',
            desc: 'The script outputs a public URL (e.g. https://abc123.trycloudflare.com) — copy it.',
        },
        {
            num: '03',
            icon: CheckCircle,
            title: 'Paste URL below and publish',
            desc: 'Enter the URL in the Tunnel / Access URL field in the form, then click Publish Listing.',
        },
    ];

    return (
        <div className="card mb-8 overflow-hidden anim">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                        <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Quick Start — Single Command Setup</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>No Docker knowledge required · runs entirely in the background</p>
                    </div>
                </div>
                <span className="badge badge-green">
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    RECOMMENDED
                </span>
            </div>

            <div className="px-6 py-5">
                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    {steps.map(({ num, icon: Icon, title, desc }) => (
                        <div key={num} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="mono text-xs font-bold px-2 py-0.5 rounded"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                                    {num}
                                </span>
                                <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
                        </div>
                    ))}
                </div>

                {/* OS tab + command box */}
                <div>
                    <div className="flex gap-1 mb-3">
                        {[{ key: 'windows', label: '🪟 Windows' }, { key: 'linux', label: '🐧 Linux / macOS' }].map(({ key, label }) => (
                            <button key={key} onClick={() => setOs(key)}
                                className={os === key ? 'btn-dark' : 'btn-secondary'}
                                style={{ padding: '5px 14px', fontSize: '0.8rem' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="relative rounded-xl overflow-hidden"
                        style={{ background: '#1C1917', border: '1px solid #3F3A37' }}>
                        <div className="flex items-center justify-between px-4 py-2.5"
                            style={{ borderBottom: '1px solid #3F3A37' }}>
                            <div className="flex gap-1.5">
                                <span style={{ width: 10, height: 10, borderRadius: 99, background: '#DC2626', display: 'inline-block' }} />
                                <span style={{ width: 10, height: 10, borderRadius: 99, background: '#D97706', display: 'inline-block' }} />
                                <span style={{ width: 10, height: 10, borderRadius: 99, background: '#16A34A', display: 'inline-block' }} />
                            </div>
                            <button onClick={copyCmd}
                                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg"
                                style={{ background: copied ? '#16A34A' : '#374151', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                <Copy className="w-3 h-3" />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="px-4 py-3 text-xs overflow-x-auto"
                            style={{ color: '#A8A29E', fontFamily: "'JetBrains Mono', ui-monospace, monospace", lineHeight: 1.7, margin: 0 }}>
                            <code>{SETUP_COMMANDS[os]}</code>
                        </pre>
                    </div>

                    <p className="text-xs mt-2.5" style={{ color: 'var(--text-3)' }}>
                        💡 The script outputs your tunnel URL automatically. No Cloudflare account needed.
                        The workspace runs in the background — renters get instant browser terminal access.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  Provide Compute page
//  useWriteContract / useReadContracts logic — UNTOUCHED
// ─────────────────────────────────────────────────────────────
export default function Provide() {
    const { address, isConnected } = useAccount();
    const { writeContract, isPending: isWriting } = useWriteContract();

    // ── Structured spec form state ──
    const [formFields, setFormFields] = useState({
        gpuModel: '', gpuCount: '', vram: '', ram: '', storage: '', connectionUrl: '',
    });
    const [hourlyRate, setHourlyRate] = useState('');

    const setField = (key) => (e) => setFormFields(prev => ({ ...prev, [key]: e.target.value }));

    const contractConfig = { address: RENDERLOCK_ADDRESS, abi: RENDERLOCK_ABI };

    // Read all machines (for "My Nodes" section)
    const { data: contractData, refetch, isLoading } = useReadContracts({
        contracts: [
            ...Array.from({ length: 20 }).map((_, i) => ({
                ...contractConfig, functionName: 'getMachine', args: [BigInt(i + 1)],
            }))
        ],
    });

    // Provider's listed machines
    const myMachines = contractData?.slice(0, 20)
        .map((res) => res.status === 'success' ? res.result : null)
        .filter((m) => m && m.provider === address && m.isListed) || [];

    const handleAction = async (functionName, args, value = 0n) => {
        writeContract({
            ...contractConfig, functionName, args,
            ...(value > 0n && { value }),
        }, { onSuccess: () => setTimeout(() => refetch(), 3000) });
    };

    const handleListMachine = (e) => {
        e.preventDefault();
        if (!formFields.gpuModel || !hourlyRate) return;
        const specsString = buildSpecString(formFields);
        handleAction('listMachine', [specsString, parseEther(hourlyRate)]);
        setFormFields({ gpuModel: '', gpuCount: '', vram: '', ram: '', storage: '', connectionUrl: '' });
        setHourlyRate('');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">

                {/* ── Not connected ── */}
                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center py-28 gap-6 anim">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', boxShadow: '0 4px 16px rgba(28,25,23,0.08)' }}>
                            <Cpu className="w-9 h-9" style={{ color: 'var(--text-3)' }} />
                        </div>
                        <div className="text-center max-w-md">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                                Monetize Your Hardware
                            </h2>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                                Connect your wallet to list your GPU or CPU on the network and start earning AVAX passively.
                            </p>
                        </div>
                        <div className="flex items-center gap-8 px-10 py-5 rounded-xl"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}>
                            {[
                                { label: 'Earn AVAX', icon: Zap },
                                { label: 'Trustless Escrow', icon: Lock },
                                { label: 'Full Control', icon: CheckCircle },
                            ].map(({ label, icon: Icon }) => (
                                <div key={label} className="flex flex-col items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                        style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                                        <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-2)' }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (
                    <div className="flex flex-col gap-10">

                        {/* ── Quick Start Guide ── */}
                        <QuickStartGuide />

                        <div className="grid lg:grid-cols-12 gap-8">

                            {/* ── LEFT: List Machine form ── */}
                            <section className="lg:col-span-5 anim d1">
                                <div className="card p-6 sticky top-[73px]">

                                    {/* Panel header */}
                                    <div className="flex items-center gap-3 mb-6 pb-5"
                                        style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'var(--accent-light)', border: '1.5px solid var(--accent-border)' }}>
                                            <Cpu className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                                                List a Machine
                                            </h2>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                                                Fill in your hardware specs to go live
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleListMachine} className="space-y-3">

                                        {/* GPU Model */}
                                        <div>
                                            <label htmlFor="gpuModel" className="label">GPU / CPU Model</label>
                                            <input
                                                id="gpuModel"
                                                type="text"
                                                placeholder="e.g., RTX 4090, H100 SXM, A100"
                                                className="input"
                                                value={formFields.gpuModel}
                                                onChange={setField('gpuModel')}
                                                required
                                            />
                                        </div>

                                        {/* Count + VRAM */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="gpuCount" className="label">GPU Count</label>
                                                <input
                                                    id="gpuCount" type="number" min="1" placeholder="1"
                                                    className="input" value={formFields.gpuCount}
                                                    onChange={setField('gpuCount')}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="vram" className="label">VRAM / Card</label>
                                                <input
                                                    id="vram" type="text" placeholder="24 GB"
                                                    className="input" value={formFields.vram}
                                                    onChange={setField('vram')}
                                                />
                                            </div>
                                        </div>

                                        {/* RAM + Storage */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="ram" className="label">System RAM</label>
                                                <input
                                                    id="ram" type="text" placeholder="64 GB"
                                                    className="input" value={formFields.ram}
                                                    onChange={setField('ram')}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="storage" className="label">Storage</label>
                                                <input
                                                    id="storage" type="text" placeholder="2 TB NVMe"
                                                    className="input" value={formFields.storage}
                                                    onChange={setField('storage')}
                                                />
                                            </div>
                                        </div>

                                        <div className="divider" />

                                        {/* Tunnel URL */}
                                        <div>
                                            <label htmlFor="connectionUrl" className="label">Tunnel / Access URL</label>
                                            <input
                                                id="connectionUrl" type="url"
                                                placeholder="https://your-cloudflare-tunnel.com"
                                                className="input" value={formFields.connectionUrl}
                                                onChange={setField('connectionUrl')}
                                            />
                                            <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>
                                                Shown to the renter after payment is confirmed
                                            </p>
                                        </div>

                                        {/* Hourly rate */}
                                        <div>
                                            <label htmlFor="rateInput" className="label">Hourly Rate (AVAX)</label>
                                            <input
                                                id="rateInput" type="number" step="0.001" min="0.001"
                                                placeholder="0.05"
                                                className="input" value={hourlyRate}
                                                onChange={(e) => setHourlyRate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isWriting}
                                            className="btn-primary w-full"
                                            style={{ padding: '11px 20px', marginTop: 6 }}
                                        >
                                            {isWriting ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 rounded-full animate-spin"
                                                        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                                    Listing on Fuji…
                                                </>
                                            ) : (
                                                <>
                                                    <Cpu className="w-4 h-4" />
                                                    Publish Listing
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Info note */}
                                    <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                        <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-3)' }} />
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                                            Your earnings are held in a trustless on-chain escrow and automatically released to you after the renter's 10-minute review period.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* ── RIGHT: My Listed Nodes ── */}
                            <section className="lg:col-span-7 anim d2">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                                            My Listed Nodes
                                        </h2>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                                            Manage your active listings on the network
                                        </p>
                                    </div>
                                    {!isLoading && (
                                        <span className={`badge ${myMachines.length > 0 ? 'badge-green' : 'badge-stone'}`}>
                                            {myMachines.length > 0 && (
                                                <span className="live-dot" style={{ width: 5, height: 5 }} />
                                            )}
                                            {myMachines.length} LISTED
                                        </span>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 animate-spin"
                                            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                                        <p className="text-sm mono" style={{ color: 'var(--text-3)' }}>Loading your nodes…</p>
                                    </div>

                                ) : myMachines.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {myMachines.map((machine, idx) => {
                                            const s = parseSpecs(machine.specs);
                                            return (
                                                <div key={machine.id.toString()}
                                                    className={`card overflow-hidden anim d${Math.min(idx + 1, 5)}`}>

                                                    {/* Top row */}
                                                    <div className="px-5 pt-4 pb-4 flex items-center justify-between gap-4"
                                                        style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="badge badge-stone mono">
                                                                    NODE {machine.id.toString().padStart(3, '0')}
                                                                </span>
                                                                <span className="badge badge-green">
                                                                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                                                                    LIVE
                                                                </span>
                                                            </div>
                                                            <h3 className="text-base font-bold mono" style={{ color: 'var(--text-1)' }}>
                                                                {s.gpuModel || machine.specs.split('|')[0].trim()}
                                                            </h3>
                                                        </div>

                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Hourly Rate</p>
                                                            <div className="flex items-baseline gap-1 justify-end">
                                                                <span className="text-lg font-bold mono" style={{ color: 'var(--accent)' }}>
                                                                    {formatEther(machine.hourlyRate)}
                                                                </span>
                                                                <span className="text-xs" style={{ color: 'var(--text-3)' }}>AVAX</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Spec row */}
                                                    <div className="px-5 py-3 flex items-center gap-6"
                                                        style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                                        {[
                                                            { icon: Hash, label: 'Count', value: s.gpuCount ? `${s.gpuCount}x` : '—' },
                                                            { icon: MonitorDot, label: 'VRAM', value: s.vram || '—' },
                                                            { icon: Database, label: 'RAM', value: s.ram || '—' },
                                                            { icon: HardDrive, label: 'Storage', value: s.storage || '—' },
                                                        ].map(({ icon: Icon, label, value }) => (
                                                            <div key={label}>
                                                                <div className="flex items-center gap-1">
                                                                    <Icon className="w-3 h-3" style={{ color: 'var(--text-3)' }} />
                                                                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
                                                                </div>
                                                                <span className="text-sm font-semibold mono" style={{ color: 'var(--text-1)' }}>
                                                                    {value}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="px-5 py-3.5 flex justify-between items-center">
                                                        <p className="text-xs mono truncate max-w-[180px]"
                                                            title={machine.provider}
                                                            style={{ color: 'var(--text-3)' }}>
                                                            {machine.provider.slice(0, 6)}…{machine.provider.slice(-4)}
                                                        </p>
                                                        <button
                                                            onClick={() => handleAction('unlistMachine', [machine.id])}
                                                            disabled={isWriting}
                                                            className="btn-danger-outline"
                                                            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Remove Listing
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center"
                                        style={{ border: '1.5px dashed var(--border-strong)', background: 'var(--surface)' }}>
                                        <Server className="w-10 h-10 mb-3" style={{ color: 'var(--text-3)' }} />
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                                            You have no active listings.
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                                            Fill in the form to publish your first node.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                )}
            </main>

            <footer style={{ borderTop: '1px solid var(--border)', marginTop: 64 }}>
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p className="text-xs mono" style={{ color: 'var(--text-3)' }}>
                        RenderLock · Decentralized GPU Compute · Avalanche Fuji
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        Trustless · Non-custodial · On-chain
                    </p>
                </div>
            </footer>
        </div>
    );
}
