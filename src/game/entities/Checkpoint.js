export class Checkpoint extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y)

        scene.add.existing(this)
        this.setDepth(6)

        this.activated = false

        this._base   = scene.add.graphics()
        this._flame1 = scene.add.graphics()
        this._flame2 = scene.add.graphics()
        this._flame3 = scene.add.graphics()

        this.add(this._base)
        this.add(this._flame1)
        this.add(this._flame2)
        this.add(this._flame3)

        this._drawBase()

        // Partículas — posicionadas no mundo, não no container
        this._sparks = scene.add.particles(x, y + 16, 'particle', {
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

        // Zona de trigger — centralizada no container, cobrindo área da fogueira
        this._zone = scene.add.zone(x, y + 16, 48, 64)
        scene.physics.world.enable(this._zone, Phaser.Physics.Arcade.STATIC_BODY)
    }

    // ── Desenho ──────────────────────────────────────────────────────────────
    // Origem do container = centro do tile de ar (y = 16*32 = 512)
    // Chão está em y+32 no mundo, ou seja, em +32 no espaço do container
    // A fogueira deve ocupar de y=0 a y=32 (da base até o topo das chamas)

    _drawBase() {
        const g  = this._base
        const BY = 28   // base das pedras — quase na borda inferior do tile de ar

        g.clear()

        // Pedras
        g.fillStyle(0x5a5a6a)
        g.fillEllipse(0,   BY,     36, 10)
        g.fillStyle(0x6a6a7a)
        g.fillEllipse(-10, BY - 2, 14, 8)
        g.fillEllipse(10,  BY - 2, 14, 8)

        // Gravetos
        g.fillStyle(0x5a3a1a)
        g.fillRect(-10, BY - 14, 3, 14)
        g.fillRect(7,   BY - 14, 3, 14)
        g.fillRect(-2,  BY - 16, 3, 16)
    }

    _drawFlames(t) {
        const BY = 24   // base das chamas — logo acima das pedras

        this._drawFlame(
            this._flame1, 0, BY,
            this.activated ? 0xff6600 : 0x334455,
            7 + Math.sin(t * 7) * 2,
            18 + Math.sin(t * 5) * 3,
            this.activated ? 0.9 : 0.25
        )
        this._drawFlame(
            this._flame2, -5, BY + 3,
            this.activated ? 0xff9900 : 0x223344,
            4 + Math.sin(t * 9 + 1) * 1.5,
            11 + Math.sin(t * 6 + 1) * 2,
            this.activated ? 0.7 : 0.15
        )
        this._drawFlame(
            this._flame3, 5, BY + 3,
            this.activated ? 0xffcc00 : 0x223344,
            4 + Math.sin(t * 8 + 2) * 1.5,
            11 + Math.sin(t * 7 + 2) * 2,
            this.activated ? 0.7 : 0.15
        )
    }

    _drawFlame(g, ox, oy, color, w, h, alpha) {
        g.clear()
        g.fillStyle(color, alpha)
        g.fillTriangle(ox, oy - h, ox - w, oy, ox + w, oy)
        g.fillStyle(0xffffff, alpha * 0.3)
        g.fillTriangle(ox, oy - h * 0.6, ox - w * 0.4, oy - h * 0.1, ox + w * 0.4, oy - h * 0.1)
    }

    // ── API ───────────────────────────────────────────────────────────────────

    activate() {
        if (this.activated) return
        this.activated = true
        this._sparks.emitting = true

        this.scene.tweens.add({
            targets: this, scaleX: 1.3, scaleY: 1.3,
            duration: 120, yoyo: true, ease: 'Power2',
        })
    }

    checkTrigger(player) {
        return this.scene.physics.overlap(player, this._zone)
    }

    update(delta) {
        this._flameTimer += delta / 1000
        this._drawFlames(this._flameTimer)
        // Partículas seguem o container no mundo
        this._sparks.setPosition(this.x, this.y + 10)
    }

    destroy() {
        this._sparks.destroy()
        super.destroy()
    }
}