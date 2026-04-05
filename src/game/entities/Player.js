export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player')

        scene.add.existing(this)
        scene.physics.add.existing(this)

        // Hitbox menor que o sprite
        this.body.setSize(28, 42)
        this.body.setOffset(10, 6)
        this.body.setMaxVelocityY(900)
        this.setDepth(10)

        // Estado
        this.facing    = 1
        this.jumpCount = 0      // double jump
        this.maxJumps  = 2
        this.isAlive   = true

        // Partículas de poeira
        this._lastOnGround = false

        // Cria animações
        this._createAnims(scene)

        // Referência ao emitter de partículas (criado pela cena)
        this.dustEmitter = null
    }

    _createAnims(scene) {
        const anims = scene.anims

        if (!anims.exists('player-idle')) {
            anims.create({
                key: 'player-idle',
                frames: anims.generateFrameNumbers('player', { start: 0, end: 0 }),
                frameRate: 4,
                repeat: -1
            })
        }

        if (!anims.exists('player-run')) {
            anims.create({
                key: 'player-run',
                frames: anims.generateFrameNumbers('player', { start: 1, end: 2 }),
                frameRate: 10,
                repeat: -1
            })
        }

        if (!anims.exists('player-jump')) {
            anims.create({
                key: 'player-jump',
                frames: anims.generateFrameNumbers('player', { start: 3, end: 3 }),
                frameRate: 1,
                repeat: -1
            })
        }
    }

    update(cursors, wasd) {
        if (!this.isAlive) return

        const onGround = this.body.blocked.down
        const left  = cursors.left.isDown  || wasd.left.isDown
        const right = cursors.right.isDown || wasd.right.isDown
        const jumpP = Phaser.Input.Keyboard.JustDown(cursors.up)
                        || Phaser.Input.Keyboard.JustDown(wasd.up)
                        || Phaser.Input.Keyboard.JustDown(cursors.space)

        // Reset de pulo ao tocar no chão
        if (onGround) this.jumpCount = 0

        // Movimento horizontal
        if (left) {
            this.setVelocityX(-280)
            this.facing = -1
            this.setFlipX(true)
        } else if (right) {
            this.setVelocityX(280)
            this.facing = 1
            this.setFlipX(false)
        } else {
            this.setVelocityX(0)
        }

        // Pulo (com double jump)
        if (jumpP && this.jumpCount < this.maxJumps) {
            this.setVelocityY(-620)
            this.jumpCount++
            this._spawnJumpDust()
        }

        // Animação
        if (!onGround) {
            this.play('player-jump', true)
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.play('player-run', true)
        } else {
            this.play('player-idle', true)
        }

        // Squash & stretch leve via scaleY
        if (!onGround && this.body.velocity.y < -100) {
            this.setScale(0.92, 1.08) // stretch no pulo
        } else if (onGround && !this._lastOnGround) {
            this.setScale(1.1, 0.9)   // squash ao aterrissar
            this._spawnLandDust()
        } else {
            const sx = this.scaleX
            const sy = this.scaleY
            this.setScale(
                sx + (1 - sx) * 0.25,
                sy + (1 - sy) * 0.25
            )
        }

        this._lastOnGround = onGround
    }

    _spawnJumpDust() {
        if (!this.dustEmitter) return
        this.dustEmitter.setPosition(this.x, this.y + 20)
        this.dustEmitter.explode(6)
    }

    _spawnLandDust() {
        if (!this.dustEmitter) return
        this.dustEmitter.setPosition(this.x, this.y + 20)
        this.dustEmitter.explode(10)
    }

    die() {
        if (!this.isAlive) return
        this.isAlive = false
        this.setTint(0xff4444)
        this.scene.tweens.add({
            targets: this,
            y: this.y - 60,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                this.scene.events.emit('player-died')
            }
        })
    }
}