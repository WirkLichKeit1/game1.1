const FONT = "'Courier New', Courier, monospace"

export function HUD({ score, coins, hp, hearts }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none', zIndex: 20,
            fontFamily: FONT,
        }}>

            {/* Painel superior esquerdo — corações + HP */}
            <div style={{
                position: 'absolute', top: 14, left: 16,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 14px', borderRadius: 3,
                display: 'flex', flexDirection: 'column', gap: 6,
            }}>
                {/* Corações */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{
                            fontSize: 18,
                            opacity: i < hearts ? 1 : 0.2,
                            filter:  i < hearts ? 'none' : 'grayscale(100%)',
                            transition: 'opacity 0.2s',
                        }}>
                            ❤️
                        </span>
                    ))}
                </div>

                {/* Barra de HP */}
                <div style={{
                    width: 140, height: 10,
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2, overflow: 'hidden',
                    position: 'relative',
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, bottom: 0,
                        width: `${hp}%`,
                        background: hp > 60
                            ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                            : hp > 30
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        transition: 'width 0.3s ease, background 0.3s ease',
                    }} />
                    {/* Brilho */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '40%', background: 'rgba(255,255,255,0.2)',
                    }} />
                </div>
            </div>

            {/* Painel superior direito — score + coins */}
            <div style={{
                position: 'absolute', top: 14, right: 16,
                display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '8px 14px', borderRadius: 3,
                    display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: '0.2em' }}>
                        SCORE
                    </span>
                    <span style={{ color: '#f5c518', fontSize: 18, fontWeight: 'bold', lineHeight: 1 }}>
                        {String(score).padStart(6, '0')}
                    </span>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '6px 14px', borderRadius: 3,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <span style={{ fontSize: 14 }}>🪙</span>
                    <span style={{ color: '#f5c518', fontSize: 13, fontWeight: 'bold' }}>
                        {coins}
                    </span>
                </div>
            </div>

            {/* Controles */}
            <div style={{
                position: 'absolute', bottom: 12, left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.3)', fontSize: 10,
                letterSpacing: '0.15em', textAlign: 'center', lineHeight: 1.6,
            }}>
                WASD / SETAS  MOVER  |  W / SPACE  PULAR  |  SHIFT  DASH
            </div>

            {/* D-Pad mobile */}
            <div style={{
                position: 'absolute', bottom: 32, left: 0, right: 0,
                display: 'flex', justifyContent: 'space-between',
                padding: '0 24px', pointerEvents: 'none',
            }}>
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
                    <DPadBtn label="◀" onDown={() => window._dpad?.press('left')}  onUp={() => window._dpad?.release('left')}  />
                    <DPadBtn label="▶" onDown={() => window._dpad?.press('right')} onUp={() => window._dpad?.release('right')} />
                </div>
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
                    <DPadBtn label="⚡" onDown={() => window._dpad?.press('dash')} onUp={() => window._dpad?.release('dash')} />
                    <DPadBtn label="▲" onDown={() => window._dpad?.press('jump')} onUp={() => window._dpad?.release('jump')} />
                </div>
            </div>
        </div>
    )
}

function DPadBtn({ label, onDown, onUp }) {
    return (
        <div
            onPointerDown={(e) => { e.preventDefault(); onDown() }}
            onPointerUp={(e)   => { e.preventDefault(); onUp()   }}
            onPointerLeave={(e) => { e.preventDefault(); onUp()  }}
            style={{
                width: 64, height: 64,
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24,
                userSelect: 'none', WebkitUserSelect: 'none',
                pointerEvents: 'all', cursor: 'pointer',
            }}
        >
            {label}
        </div>
    )
}