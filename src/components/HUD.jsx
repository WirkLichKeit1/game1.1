const FONT = "'Courier New', Courier, monospace"

export function HUD({ score, coins }) {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 20,
            fontFamily: FONT,
        }}>
            {/* Score */}
            <div style={{
                position: 'absolute',
                top: 14,
                left: 16,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 14px',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: '0.2em' }}>
                    SCORE
                </span>
                <span style={{ color: '#f5c518', fontSize: 22, fontWeight: 'bold', lineHeight: 1 }}>
                    {String(score).padStart(6, '0')}
                </span>
            </div>

            {/* Coins */}
            <div style={{
                position: 'absolute',
                top: 14,
                right: 16,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 14px',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <span style={{ fontSize: 18 }}>🪙</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: '0.2em' }}>
                        COINS
                    </span>
                    <span style={{ color: '#f5c518', fontSize: 14, fontWeight: 'bold' }}>
                        {coins}
                    </span>
                </div>
            </div>

            {/* Controles — canto inferior */}
            <div style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 10,
                letterSpacing: '0.15em',
                textAlign: 'center',
                lineHeight: 1.6,
            }}>
                WASD / ↑←→  MOVER  &nbsp;|&nbsp;  W / ↑ / SPACE  PULAR (x2)
            </div>
            {/* D-Pad mobile */}
            <div style={{
                position: 'absolute',
                bottom: 32,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 24px',
                pointerEvents: 'none',
            }}>
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'all'}}>
                    <DPadBtn label="◀" onDown={() => window._dpad?.press('left')} onUp={() => window._dpad?.release('left')} />
                    <DPadBtn label="▶" onDown={() => window._dpad?.press('right')} onUp={() => window._dpad?.release('right')} />
                </div>
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'all'}}>
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
            onPointerUp={(e) => { e.preventDefault(); onUp() }}
            onPointerLeave={(e) => { e.preventDefault(); onUp() }}
            style={{
                width: 64, height: 64,
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: 12,
                display: 'flex', alignItems:'center', justifyContent: 'center',
                color: '#fff', fontSize: 24,
                userSelect: 'none', WebkitUserSelect: 'none',
                pointerEvents: 'all',
                cursor: 'pointer',
            }}
        >
            {label}
        </div>
    )
}