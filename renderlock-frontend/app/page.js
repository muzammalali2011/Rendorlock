'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useReadContracts, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { RENDERLOCK_ADDRESS, RENDERLOCK_ABI } from '@/lib/contract';
import { parseSpecs } from '@/lib/specs';
import Header from '@/app/components/Header';
import {
    Server, ShieldCheck, Activity, Lock, CheckCircle,
    XCircle, Clock, Terminal, Zap, Globe, HardDrive,
    Database, MonitorDot, Hash, Cpu,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  ActiveRentalCard  — timer: Math.floor(Date.now() / 1000) UNTOUCHED
// ─────────────────────────────────────────────────────────────
const ActiveRentalCard = ({ rental, address, isWriting, handleAction, specs }) => {
    const isRenter = rental.renter === address;
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const deadline = Number(rental.startTime) + 600;
    const timeLeft = Math.max(0, deadline - now);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const parsed = parseSpecs(specs);
    const connectionUrl = parsed.connectionUrl;

    return (
        <div className="card-accent rounded-xl overflow-hidden anim">

            {/* ── Header row ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid #FECACA' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-red">RENTAL #{rental.id.toString()}</span>
                        <span className="badge badge-stone mono" style={{ fontSize: '0.6rem' }}>
                            {isRenter ? 'YOU ARE RENTING' : 'YOU ARE PROVIDING'}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                        Payment:{' '}
                        <span className="font-bold mono" style={{ color: 'var(--text-1)' }}>
                            {formatEther(rental.amountLocked)}
                        </span>{' '}
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>AVAX</span>
                    </p>
                    {parsed.gpuModel && (
                        <p className="text-xs mono mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {parsed.gpuModel}
                            {parsed.gpuCount ? ` · ${parsed.gpuCount}x` : ''}
                            {parsed.vram ? ` · ${parsed.vram} VRAM` : ''}
                        </p>
                    )}
                </div>

                {/* Countdown timer */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
                    style={{
                        background: timeLeft > 0 ? 'var(--amber-light)' : 'var(--surface-2)',
                        border: `1px solid ${timeLeft > 0 ? 'var(--amber-border)' : 'var(--border)'}`,
                    }}>
                    <Clock className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: timeLeft > 0 ? 'var(--amber)' : 'var(--text-3)' }} />
                    <span className="mono text-sm font-semibold"
                        style={{ color: timeLeft > 0 ? 'var(--amber)' : 'var(--text-3)' }}>
                        {timeLeft > 0
                            ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
                            : 'Review Closed'}
                    </span>
                </div>
            </div>

            {/* ── Cloud workspace panel (renter only) ── */}
            {isRenter && connectionUrl && (
                <div className="mx-4 my-3 rounded-lg px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3"
                    style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: '#DCFCE7', border: '1px solid var(--green-border)' }}>
                            <Globe className="w-4 h-4" style={{ color: 'var(--green)' }} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: '#15803D' }}>
                                Cloud Workspace Ready
                            </p>
                            <p className="text-xs mono mt-0.5" style={{ color: 'var(--text-2)' }}>
                                user: <span style={{ color: 'var(--text-1)' }}>renter</span>
                                {' '}·{' '}
                                pass: <span style={{ color: 'var(--text-1)' }}>RenderLock2026!</span>
                            </p>
                        </div>
                    </div>
                    <a href={connectionUrl} target="_blank" rel="noreferrer"
                        className="btn-green whitespace-nowrap" style={{ textDecoration: 'none' }}>
                        <Terminal className="w-3.5 h-3.5" />
                        Open Terminal
                    </a>
                </div>
            )}

            {/* ── Actions ── */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
                style={{ borderTop: '1px solid #FECACA' }}>

                <div>
                    {isRenter && timeLeft > 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            Machine is running · reject within review period if not working
                        </p>
                    )}
                    {isRenter && timeLeft === 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            Review period ended · stop the machine when done
                        </p>
                    )}
                    {!isRenter && timeLeft > 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            Renter is verifying · {minutes}m {seconds.toString().padStart(2, '0')}s left
                        </p>
                    )}
                    {!isRenter && timeLeft === 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            Review period ended · collect your earnings
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Renter — reject within review window */}
                    {isRenter && timeLeft > 0 && (
                        <button onClick={() => handleAction('rejectAndRefund', [rental.id])}
                            disabled={isWriting} className="btn-danger-outline">
                            <XCircle className="w-3.5 h-3.5" />
                            Reject &amp; Refund
                        </button>
                    )}

                    {/* Renter — stop machine at any time (calls releaseFunds, pays provider) */}
                    {isRenter && (
                        <button onClick={() => handleAction('releaseFunds', [rental.id])}
                            disabled={isWriting} className="btn-dark"
                            style={{ background: '#374151' }}>
                            <XCircle className="w-3.5 h-3.5" />
                            Stop Machine
                        </button>
                    )}

                    {/* Provider — collect after review period */}
                    {!isRenter && timeLeft === 0 && (
                        <button onClick={() => handleAction('releaseFunds', [rental.id])}
                            disabled={isWriting} className="btn-primary">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Collect Payment
                        </button>
                    )}

                    {/* Provider — waiting */}
                    {!isRenter && timeLeft > 0 && (
                        <span className="text-xs mono px-3 py-1.5 rounded-lg"
                            style={{ color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            ⏳ Waiting for renter review…
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  Marketplace page  —  multicall logic UNTOUCHED
// ─────────────────────────────────────────────────────────────
export default function Marketplace() {
    const { address, isConnected } = useAccount();
    const { writeContract, isPending: isWriting } = useWriteContract();

    const contractConfig = { address: RENDERLOCK_ADDRESS, abi: RENDERLOCK_ABI };

    const { data: contractData, refetch, isLoading } = useReadContracts({
        contracts: [
            ...Array.from({ length: 20 }).map((_, i) => ({
                ...contractConfig, functionName: 'getMachine', args: [BigInt(i + 1)],
            })),
            ...Array.from({ length: 20 }).map((_, i) => ({
                ...contractConfig, functionName: 'getRental', args: [BigInt(i + 1)],
            }))
        ],
    });

    const activeMachines = contractData?.slice(0, 20)
        .map((res) => res.status === 'success' ? res.result : null)
        .filter((m) => m?.isListed) || [];

    const allMachines = contractData?.slice(0, 20)
        .map((res) => res.status === 'success' ? res.result : null)
        .filter(Boolean) || [];

    const userRentals = contractData?.slice(20, 40)
        .map((res) => res.status === 'success' ? res.result : null)
        .filter((r) => r && r.status === 0 && (r.renter === address || r.provider === address)) || [];

    const handleAction = async (functionName, args, value = 0n) => {
        writeContract({
            ...contractConfig, functionName, args,
            ...(value > 0n && { value }),
        }, { onSuccess: () => setTimeout(() => refetch(), 3000) });
    };

    const renderNodes = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                    <p className="text-sm mono" style={{ color: 'var(--text-3)' }}>Scanning network…</p>
                </div>
            );
        }

        if (activeMachines.length > 0) {
            return (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {activeMachines.map((machine, idx) => {
                        const s = parseSpecs(machine.specs);
                        const isOwner = address === machine.provider;
                        return (
                            <div key={machine.id.toString()}
                                className={`card card-hover flex flex-col justify-between anim d${Math.min(idx + 1, 5)}`}
                                style={{ overflow: 'hidden' }}>

                                {/* Card header */}
                                <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <h3 className="text-base font-bold mono" style={{ color: 'var(--text-1)' }}>
                                                {s.gpuModel || machine.specs.split('|')[0].trim()}
                                            </h3>
                                            <p className="text-xs mt-0.5 mono" style={{ color: 'var(--text-3)' }}>
                                                NODE {machine.id.toString().padStart(3, '0')}
                                            </p>
                                        </div>
                                        <span className="badge badge-green" style={{ flexShrink: 0 }}>
                                            <span className="live-dot" style={{ width: 5, height: 5 }} />
                                            ONLINE
                                        </span>
                                    </div>
                                </div>

                                {/* Spec grid */}
                                <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3"
                                    style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                    {[
                                        { icon: Hash, label: 'Count', value: s.gpuCount ? `${s.gpuCount}x` : '—' },
                                        { icon: MonitorDot, label: 'VRAM / Card', value: s.vram || '—' },
                                        { icon: Database, label: 'System RAM', value: s.ram || '—' },
                                        { icon: HardDrive, label: 'Storage', value: s.storage || '—' },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label}>
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <Icon className="w-3 h-3" style={{ color: 'var(--text-3)' }} />
                                                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
                                            </div>
                                            <span className="text-sm font-semibold mono" style={{ color: 'var(--text-1)' }}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer: price + CTA */}
                                <div className="px-5 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>Price From</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold mono" style={{ color: 'var(--accent)' }}>
                                                {formatEther(machine.hourlyRate)}
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--text-3)' }}>AVAX/hr</span>
                                        </div>
                                    </div>

                                    {isOwner ? (
                                        <span className="badge badge-stone mono">YOUR NODE</span>
                                    ) : (
                                        <button
                                            onClick={() => handleAction('rentMachine', [machine.id, 1n], machine.hourlyRate)}
                                            disabled={isWriting}
                                            className="btn-dark"
                                        >
                                            <Zap className="w-3.5 h-3.5" />
                                            Deploy Cluster
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center"
                style={{ border: '1.5px dashed var(--border-strong)', background: 'var(--surface)' }}>
                <Server className="w-10 h-10 mb-3" style={{ color: 'var(--text-3)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                    No compute nodes available right now.
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                    Check back soon or{' '}
                    <a href="/provide" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                        provide your own
                    </a>.
                </p>
            </div>
        );
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
                            <ShieldCheck className="w-9 h-9" style={{ color: 'var(--text-3)' }} />
                        </div>
                        <div className="text-center max-w-md">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                                GPU Compute on Demand
                            </h2>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                                Browse and rent GPU machines from providers worldwide. Payments are secured
                                on-chain — you only pay for what you use.
                            </p>
                        </div>
                        <div className="flex items-center gap-8 px-10 py-5 rounded-xl"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}>
                            {[
                                { label: 'Instant Access', icon: Zap },
                                { label: 'Secure Payment', icon: Lock },
                                { label: 'Trustless', icon: CheckCircle },
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

                        {/* ── Running Machines (active rentals) ── */}
                        {userRentals.length > 0 && (
                            <section className="anim d1">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text-1)' }}>
                                        <Lock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                        Running Machines
                                    </h2>
                                    <span className="badge badge-red">{userRentals.length} RUNNING</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {userRentals.map((rental) => {
                                        const matchingMachine = allMachines.find(
                                            m => m.id.toString() === rental.machineId.toString()
                                        );
                                        return (
                                            <ActiveRentalCard
                                                key={rental.id.toString()}
                                                rental={rental}
                                                address={address}
                                                isWriting={isWriting}
                                                handleAction={handleAction}
                                                specs={matchingMachine?.specs}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ── Available Nodes ── */}
                        <section className="anim d2">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                                        Available Nodes
                                    </h2>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                                        Select a machine to deploy your workload instantly
                                    </p>
                                </div>
                                {!isLoading && (
                                    <span className={`badge ${activeMachines.length > 0 ? 'badge-green' : 'badge-stone'}`}>
                                        {activeMachines.length > 0 && (
                                            <span className="live-dot" style={{ width: 5, height: 5 }} />
                                        )}
                                        {activeMachines.length} NODE{activeMachines.length !== 1 ? 'S' : ''} ONLINE
                                    </span>
                                )}
                            </div>
                            {renderNodes()}
                        </section>

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