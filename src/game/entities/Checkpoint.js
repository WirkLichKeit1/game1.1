export class Checkpoint extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y)

        scene.add.existing(this)
        this.setDepth(6)

        this.activated = false

        // Base da fogueira (pedras) — deslocada para baixo para sentar no chão
        this._base = scene.add.graphics()
        this._drawBase()
        this.add(this._base)

        // Chamas (triângulos animados)
        this._flame1 = scene.add.graphics()
        this._flame2 = scene.add.graphics()
        this._flame3 = scene.add.graphics()
        this.add(this._flame1)
        this.add(this._flame2)
        this.add(this._flame3)

        // Partículas de faísca — só ativas após ativação
        this._sparks = scene.add.particles(x, y, 'particle', {
            speed:     { min: 20, max: 60 },
            angle:     { min: 250, max: 290 },
            scale:     { start: 0.3, end: 0 },
            alpha:     { start: 1, end: 0 },
            lifespan:  600,
            tint:      [0xff8800, 0xffcc00, 0xff4400],
            frequency: 120,
            emitting:  false,
        })
        this._sparks.setDepth(7)

        this._flameTimer = 0

        // Hitbox de trigger
        this._zone = scene.add.zone(x, y + 10, 48, 60)
        scene.physics.world.enable(this._zone, Phaser.Physics.Arcade.STATIC_BODY)
    }

    _drawBase() {
        const g = this._base
        g.clear()

        // Tudo deslocado +20 em Y para sentar no chão
        const BY = 1

        // Pedras da base
        g.fillStyle(0x5a5a6a)
        g.fillEllipse(0, BY + 8, 36, 12)
        g.fillStyle(0x6a6a7a)
        g.fillEllipse(-10, BY + 6, 14, 10)
        g.fillEllipse(10,  BY + 6, 14, 10)
        g.fillEllipse(0,   BY + 4, 12, 8)

        // Gravetos
        g.fillStyle(0x5a3a1a)
        g.fillRect(-12, BY - 4, 4, 14)
        g.fillRect(8,   BY - 4, 4, 14)
        g.fillRect(-4,  BY - 6, 4, 16)
    }

    _drawFlames(t) {
        // Chamas também deslocadas +20 em Y
        const BY = 1

        this._drawFlame(
            this._flame1,
            0, BY,
            this.activated ? 0xff6600 : 0x334455,
            8 + Math.sin(t * 7) * 2,
            18 + Math.sin(t * 5) * 3,
            this.activated ? 0.9 : 0.3
        )

        this._drawFlame(
            this._flame2,
            -6, BY + 4,
            this.activated ? 0xff9900 : 0x223344,
            5 + Math.sin(t * 9 + 1) * 1.5,
            12 + Math.sin(t * 6 + 1) * 2,
            this.activated ? 0.7 : 0.2
        )

        this._drawFlame(
            this._flame3,
            6, BY + 4,
            this.activated ? 0xffcc00 : 0x223344,
            5 + Math.sin(t * 8 + 2) * 1.5,
            12 + Math.sin(t * 7 + 2) * 2,
            this.activated ? 0.7 : 0.2
        )
    }

    _drawFlame(g, ox, oy, color, w, h, alpha) {
        g.clear()
        g.fillStyle(color, alpha)
        g.fillTriangle(
            ox,      oy - h,
            ox - w,  oy,
            ox + w,  oy
        )
        g.fillStyle(0xffffff, alpha * 0.3)
        g.fillTriangle(
            ox,           oy - h * 0.6,
            ox - w * 0.4, oy - h * 0.1,
            ox + w * 0.4, oy - h * 0.1
        )
    }

    activate() {
        if (this.activated) return
        this.activated = true
        this._sparks.emitting = true

        this.scene.tweens.add({
            targets:  this,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 120,
            yoyo:     true,
            ease:     'Power2',
        })
    }

    checkTrigger(player) {
        return this.scene.physics.overlap(player, this._zone)
    }

    update(delta) {
        this._flameTimer += delta / 1000
        this._drawFlames(this._flameTimer)
        this._sparks.setPosition(this.x, this.y + 12)
    }

    destroy() {
        this._sparks.destroy()
        super.destroy()
    }
}