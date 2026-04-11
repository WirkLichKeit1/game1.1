export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player')

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.body.setSize(28, 42)
        this.body.setOffset(10, 6)
        this.body.setMaxVelocityY(1200)
        this.setDepth(10)

        this.facing        = 1
        this.jumpCount     = 0
        this.maxJumps      = 2
        this.isAlive       = true
        this._lastOnGround = false
        this.dustEmitter   = null

        // HP e corações
        this.maxHearts   = 5
        this.hearts      = 5
        this.hp          = 100      // 0-100, zerar = perde 1 coração
        this._invincible = 0        // segundos de invencibilidade após dano
        this._flashTimer = 0        // controla o piscar

        // Dash
        this._dashCooldown = 0
        this._dashDuration = 0
        this._isDashing    = false
        this.DASH_SPEED    = 600
        this.DASH_DURATION = 0.18
        this.DASH_COOLDOWN = 0.8
        this._ghostTimer   = 0

        // Wall Jump
        this._onWall         = false
        this._wallDir        = 0
        this._wallSlideTimer = 0
        this._wallJumpTimer  = 0
        this.WALL_SLIDE_SPEED = 80

        this._createAnims(scene)
    }

    _createAnims(scene) {
        const anims = scene.anims
        if (!anims.exists('player-idle')) {
            anims.create({
                key: 'player-idle',
                frames: anims.generateFrameNumbers('player', { start: 0, end: 0 }),
                frameRate: 4, repeat: -1
            })
        }
        if (!anims.exists('player-run')) {
            anims.create({
                key: 'player-run',
                frames: anims.generateFrameNumbers('player', { start: 1, end: 2 }),
                frameRate: 10, repeat: -1
            })
        }
        if (!anims.exists('player-jump')) {
            anims.create({
                key: 'player-jump',
                frames: anims.generateFrameNumbers('player', { start: 3, end: 3 }),
                frameRate: 1, repeat: -1
            })
        }
    }

    // ── Dano ──────────────────────────────────────────────────────────────────

    takeDamage(amount) {
        // Invencível: ignora dano
        if (this._invincible > 0 || !this.isAlive) return

        this._invincible = 1.5
        this.hp = Math.max(0, this.hp - amount)

        // Emite atualização do HUD
        this.scene.registry.set('hp',     this.hp)
        this.scene.registry.set('hearts', this.hearts)

        if (this.hp <= 0) {
            // HP zerou — perde um coração e restaura HP
            this.hearts--
            this.hp = 100

            this.scene.registry.set('hp',     this.hp)
            this.scene.registry.set('hearts', this.hearts)

            if (this.hearts <= 0) {
                // Sem corações — game over, vai pro checkpoint
                this.hearts  = this.maxHearts
                this.hp      = 100
                this.scene.registry.set('hp',     this.hp)
                this.scene.registry.set('hearts', this.hearts)
                this._triggerDeath()
            }
        }
    }

    // Chamado ao cair no vazio — perde coração direto
    loseHeart() {
        if (!this.isAlive) return
        this.hearts = Math.max(0, this.hearts - 1)
        this.hp     = 100

        this.scene.registry.set('hp',     this.hp)
        this.scene.registry.set('hearts', this.hearts)

        if (this.hearts <= 0) {
            this.hearts = this.maxHearts
            this.scene.registry.set('hearts', this.hearts)
        }

        this._triggerDeath()
    }

    _triggerDeath() {
        if (!this.isAlive) return
        this.isAlive = false
        this.scene.events.emit('player-died')
    }

    // ── Update ────────────────────────────────────────────────────────────────

    update(delta, cursors, wasd, dashKey) {
        if (!this.isAlive) return

        const dt       = delta / 1000
        const onGround = this.body.blocked.down
        const onLeft   = this.body.blocked.left
        const onRight  = this.body.blocked.right

        const left  = cursors.left.isDown  || wasd.left.isDown
        const right = cursors.right.isDown || wasd.right.isDown
        const jumpP = Phaser.Input.Keyboard.JustDown(cursors.up)
                             || Phaser.Input.Keyboard.JustDown(wasd.up)
                             || Phaser.Input.Keyboard.JustDown(cursors.space)
        const dashP = Phaser.Input.Keyboard.JustDown(dashKey)

        if (onGround) this.jumpCount = 0

        // ── Invencibilidade (piscar) ───────────────────────────────────────────
        if (this._invincible > 0) {
            this._invincible -= dt
            this._flashTimer += dt
            // Alterna visibilidade a cada 0.1s
            this.setAlpha(Math.floor(this._flashTimer / 0.1) % 2 === 0 ? 1 : 0.2)
        } else {
            this.setAlpha(1)
            this._flashTimer = 0
        }

        // ── Detecção de parede ────────────────────────────────────────────────
        this._onWall = false
        this._wallDir = 0
        if (!onGround && !this._isDashing) {
            if (onLeft && left)       { this._onWall = true; this._wallDir = -1 }
            else if (onRight && right) { this._onWall = true; this._wallDir =  1 }
        }

        // ── Timers de dash ────────────────────────────────────────────────────
        if (this._dashCooldown > 0) this._dashCooldown -= dt
        if (this._dashDuration > 0) {
            this._dashDuration -= dt
            this._ghostTimer   -= dt
            if (this._ghostTimer <= 0) {
                this._spawnGhost()
                this._ghostTimer = 0.04
            }
        } else if (this._isDashing) {
            this._isDashing = false
            this.body.setGravityY(0)
        }

        if (this._isDashing) {
            this._updateAnim(onGround)
            this._lastOnGround = onGround
            return
        }

        // ── Wall slide ────────────────────────────────────────────────────────
        if (this._onWall && this.body.velocity.y > 0) {
            if (this.body.velocity.y > this.WALL_SLIDE_SPEED) {
                this.body.setVelocityY(this.WALL_SLIDE_SPEED)
            }
            this._wallSlideTimer -= dt
            if (this._wallSlideTimer <= 0) {
                this._spawnWallDust()
                this._wallSlideTimer = 0.12
            }
        } else {
            this._wallSlideTimer = 0
        }

        // ── Wall jump ─────────────────────────────────────────────────────────
        if (jumpP && this._onWall) {
            const dir = -this._wallDir
            this.setVelocityX(dir * 320)
            this.setVelocityY(-780)
            this.facing = dir
            this.setFlipX(dir < 0)
            this.jumpCount      = 1
            this._wallJumpTimer = 0.18
            this._onWall        = false
            this._spawnJumpDust()
        }
        // ── Pulo normal ───────────────────────────────────────────────────────
        else if (jumpP && this.jumpCount < this.maxJumps) {
            this.setVelocityY(-620)
            this.jumpCount++
            this._spawnJumpDust()
        }

        // ── Movimento horizontal ──────────────────────────────────────────────
        if (this._wallJumpTimer > 0) {
            this._wallJumpTimer -= dt
        } else if (!this._onWall) {
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
        }

        // ── Dash ──────────────────────────────────────────────────────────────
        if (dashP && this._dashCooldown <= 0) {
            this._startDash()
        }

        this._updateAnim(onGround)
        this._lastOnGround = onGround
    }

    // ── Dash ──────────────────────────────────────────────────────────────────

    _startDash() {
        this._isDashing    = true
        this._dashDuration = this.DASH_DURATION
        this._dashCooldown = this.DASH_COOLDOWN
        this._ghostTimer   = 0
        this.body.setGravityY(-900)
        this.setVelocityY(0)
        this.setVelocityX(this.facing * this.DASH_SPEED)
        if (this.dustEmitter) {
            this.dustEmitter.setPosition(this.x, this.y)
            this.dustEmitter.explode(8)
        }
    }

    _spawnGhost() {
        const ghost = this.scene.add.image(this.x, this.y, 'player', this.frame.name)
        ghost.setFlipX(this.flipX)
        ghost.setAlpha(0.35)
        ghost.setTint(0x88ccff)
        ghost.setDepth(9)
        ghost.setScale(this.scaleX, this.scaleY)
        this.scene.tweens.add({
            targets: ghost, alpha: 0, duration: 180,
            onComplete: () => ghost.destroy()
        })
    }

    // ── Animação ──────────────────────────────────────────────────────────────

    _updateAnim(onGround) {
        if (this._isDashing) {
            this.play('player-run', true)
            this.setScale(1.2, 0.85)
            return
        }
        if (this._onWall) {
            this.play('player-jump', true)
            this.setScale(this._wallDir > 0 ? 0.8 : 1.0, 1.1)
            return
        }
        if (!onGround) {
            this.play('player-jump', true)
            this.setScale(0.92, 1.08)
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.play('player-run', true)
            const sx = this.scaleX, sy = this.scaleY
            this.setScale(sx + (1 - sx) * 0.25, sy + (1 - sy) * 0.25)
        } else {
            this.play('player-idle', true)
            const sx = this.scaleX, sy = this.scaleY
            this.setScale(sx + (1 - sx) * 0.25, sy + (1 - sy) * 0.25)
        }
        if (onGround && !this._lastOnGround) {
            this.setScale(1.1, 0.9)
            this._spawnLandDust()
        }
    }

    // ── Partículas ────────────────────────────────────────────────────────────

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

    _spawnWallDust() {
        if (!this.dustEmitter) return
        this.dustEmitter.setPosition(this.x + this._wallDir * 14, this.y)
        this.dustEmitter.explode(3)
    }
}