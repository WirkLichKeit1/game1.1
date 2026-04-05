import { useState } from 'react'
import { PhaserGame } from './components/PhaserGame.jsx'
import { HUD } from './components/HUD.jsx'

export default function App() {
    const [score, setScore] = useState(0)
    const [coins, setCoins] = useState('0/0')

    return (
        <div style={{
            width: '100vw',
            height: '100dvh',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <PhaserGame
                onScoreChange={setScore}
                onCoinsChange={setCoins}
            />
            <HUD score={score} coins={coins} />
        </div>
    )
}