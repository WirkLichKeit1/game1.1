import { Player } from '../entities/Player.js'
import { Enemy }  from '../entities/Enemy.js'

const MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1],
    [2,2,2,2,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2],
    [2,2,2,2,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2],
    [2,2,2,2,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2],
    [2,2,2,2,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2],
    [2,2,2,2,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2],
]

const TILE_SIZE = 32
const COIN_POSITIONS = [
    { col: 1, row: 10 }, { col: 2, row: 10 }, { col: 3, row: 10 },
    { col: 7, row: 10 }, { col: 8, row: 10 },
    { col: 12, row: 3 }, { col: 13, row: 3 }, { col: 14, row: 3 },
    { col: 18, row: 4 }, { col: 19, row: 4 },
    { col: 24, row: 6 }, { col: 25, row: 6 },
    { col: 15, row: 10 }, { col: 16, row: 10 }, { col: 17, row: 10 },
    { col: 25, row: 9 }, { col: 26, row: 9 }, { col: 27, row: 9 },
]

const ENEMY_POSITIONS = [
    { col: 7,  row: 10, left: 6*32,  right: 10*32 },
    { col: 15, row: 10, left: 14*32, right: 19*32 },
    { col: 24, row: 10, left: 23*32, right: 28*32 },
]

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }

    create() {
        const mapW = MAP[0].length * TILE_SIZE
        const mapH = MAP.length    * TILE_SIZE

        this.physics.world.setBounds(0, 0, mapW, mapH + 200)

        this._buildParallax(mapW, mapH)

        this.platforms = this.physics.add.staticGroup()
        this._buildMap()

        this.coins = this.physics.add.staticGroup()
        this._buildCoins()

        this.enemies = this.physics.add.group()
        this._buildEnemies()

        this.player = new Player(this, 80, 300)

        this.dustEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 80 },
            angle: { min: 200, max: 340 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            lifespan: 350,
            tint: [0x9aaa70, 0xc4b882, 0x8a9a60],
            emitting: false,
            depth: 9,
        })
        this.player.dustEmitter = this.dustEmitter

        // ── Input ─────────────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys()
        this.wasd    = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        })

        // ── D-Pad touch ───────────────────────────────────────────────────────────
        this._jumpPressed = false
        this._dashPressed = false

        window._dpad = {
            press: (key) => {
                if (key === 'left')  this.wasd.left.isDown  = true
                if (key === 'right') this.wasd.right.isDown = true
                if (key === 'jump')  this._jumpPressed = true
                if (key === 'dash') this._dashPressed = true
            },
            release: (key) => {
                if (key === 'left')  this.wasd.left.isDown  = false
                if (key === 'right') this.wasd.right.isDown = false
                if (key === 'jump')  this._jumpPressed = false
                if (key === 'dash') this._dashPressed = false
            },
        }

        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.enemies, this.platforms)
        this.physics.add.overlap(this.player, this.coins, this._collectCoin, null, this)
        this.physics.add.overlap(this.player, this.enemies, this._hitEnemy, null, this)

        this.cameras.main.setBounds(0, 0, mapW, mapH)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
        this.cameras.main.setDeadzone(80, 60)
        this.cameras.main.setLerp(0.1, 0.1)

        this.score     = 0
        this.coinTotal = COIN_POSITIONS.length
        this.isDead    = false

        this.events.on('player-died', this._onPlayerDied, this)
        this._emitHUD()

        this._deathY = mapH + 100
    }

    _buildParallax(mapW) {
        const layers = [
            { key: 'bg-sky',       scrollX: 0,    scrollY: 0    },
            { key: 'bg-mountains', scrollX: 0.15, scrollY: 0.05 },
            { key: 'bg-trees',     scrollX: 0.35, scrollY: 0.1  },
        ]
        for (const { key, scrollX, scrollY } of layers) {
            const img = this.add.tileSprite(0, 0, mapW, 560, key)
            img.setOrigin(0, 0)
            img.setScrollFactor(scrollX, scrollY)
            img.setDepth(-10)
        }
    }

    _buildMap() {
        for (let row = 0; row < MAP.length; row++) {
            for (let col = 0; col < MAP[row].length; col++) {
                const tile = MAP[row][col]
                if (tile === 0) continue

                const x = col * TILE_SIZE + TILE_SIZE / 2
                const y = row * TILE_SIZE + TILE_SIZE / 2
                const frameMap = { 1: 0, 2: 1, 3: 3, 4: 2 }
                const frame = frameMap[tile] ?? 0

                this.add.image(x, y, 'tiles', frame).setDepth(0)
                const body = this.physics.add.staticImage(x, y, 'tiles', frame)
                body.setDepth(0)
                body.refreshBody()
                this.platforms.add(body)
            }
        }
    }

    _buildCoins() {
        for (const { col, row } of COIN_POSITIONS) {
            const x = col * TILE_SIZE + TILE_SIZE / 2
            const y = row * TILE_SIZE + TILE_SIZE / 2
            const coin = this.physics.add.staticImage(x, y, 'coin', 0)
            coin.setDepth(5)
            this.coins.add(coin)
            this.tweens.add({
                targets: coin,
                y: y - 6,
                duration: 800 + Math.random() * 400,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 600,
            })
        }
    }

    _buildEnemies() {
        for (const { col, row, left, right } of ENEMY_POSITIONS) {
            const x = col * TILE_SIZE + TILE_SIZE / 2
            const y = row * TILE_SIZE
            const enemy = new Enemy(this, x, y, { patrolLeft: left, patrolRight: right, speed: 90 })
            this.enemies.add(enemy)
        }
    }

    _collectCoin(player, coin) {
        const x = coin.x, y = coin.y
        coin.destroy()
        this.add.particles(x, y, 'particle', {
            speed: { min: 60, max: 160 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xf5c518, 0xffd700, 0xffeaa0],
            lifespan: 500,
            emitting: false,
        }).explode(8)
        this.score += 10
        this._emitHUD()
        this.tweens.add({ targets: this.player, scaleX: 1.2, scaleY: 0.85, duration: 80, yoyo: true })
    }

    _hitEnemy(player, enemy) {
        if (!enemy.isAlive || !player.isAlive) return
        const pVy  = player.body.velocity.y
        const pBot = player.body.bottom
        const eTop = enemy.body.top
        if (pVy > 0 && pBot < eTop + 20) {
            enemy.stomp()
            player.setVelocityY(-400)
            this.score += 50
            this._emitHUD()
            this.cameras.main.shake(80, 0.006)
        } else {
            player.die()
        }
    }

    _onPlayerDied() {
        if (this.isDead) return
        this.isDead = true
        this.cameras.main.shake(300, 0.015)
        this.cameras.main.fade(800, 0, 0, 0)
        this.time.delayedCall(900, () => {
            this.events.emit('game-over', this.score)
            this.scene.restart()
        })
    }

    _emitHUD() {
        this.registry.set('score', this.score)
        this.registry.set('coins', `${this.coinTotal - this.coins.getLength()}/${this.coinTotal}`)
    }

    update() {
        if (!this.player.isAlive) return

        // Injeta pulo do D-Pad touch no cursor antes do player processar
        if (this._jumpPressed) {
            this._jumpPressed = false
            this.cursors.up.isDown = true
            this.cursors.up._justDown = true
        } else {
            this.cursors.up.isDown = false
        }

        if (this._dashPressed) {
            this._dashPressed = false
            this.wasd.dash.__justDown = true
        }

        this.player.update(this.sys.game.loop.delta, this.cursors, this.wasd, this.wasd.dash)
        this.enemies.getChildren().forEach(e => e.update())

        if (this.player.y > this._deathY) {
            this.player.die()
        }
    }
}