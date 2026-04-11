import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { BootScene } from '../game/scenes/BootScene.js'
import { GameScene } from '../game/scenes/GameScene.js'

export function PhaserGame({ onScoreChange, onCoinsChange, onHpChange, onHeartsChange }) {
    const containerRef = useRef(null)
    const gameRef      = useRef(null)

    useEffect(() => {
        if (gameRef.current) return

        const config = {
            type: Phaser.AUTO,          // usa WebGL se disponível, senão Canvas
            width: 800,
            height: 560,
            parent: containerRef.current,
            backgroundColor: '#0d1b2a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 900 },
                    debug: false,           // mude para true para ver hitboxes
                },
            },
            scene: [BootScene, GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            pixelArt: true,             // sem anti-aliasing (visual pixel-art nítido)
            roundPixels: true,
        }

        const game = new Phaser.Game(config)
        gameRef.current = game

        // Escuta mudanças no registry para atualizar o HUD React
        game.events.on('ready', () => {
            game.registry.events.on('changedata', (parent, key, value) => {
                if (key === 'score')  onScoreChange?.(value)
                if (key === 'coins')  onCoinsChange?.(value)
                if (key === 'hp')     onHpChange?.(value)
                if (key === 'hearts') onHeartsChange?.(value)
            })
        })

        return () => {
            game.destroy(true)
            gameRef.current = null
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        />
    )
}