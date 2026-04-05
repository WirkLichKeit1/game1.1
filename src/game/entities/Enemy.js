export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'enemy')

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.body.setSize(30, 34)
        this.body.setOffset(5, 6)
        this.setDepth(8)

        // Patrulha
        this.patrolLeft  = config.patrolLeft  ?? x - 100
        this.patrolRight = config.patrolRight ?? x + 100
        this.speed       = config.speed       ?? 100
        this.facing      = 1
        this.isAlive     = true

        // Animação de walk
        this._createAnims(scene)
        this.play('enemy-walk')
    }

    _createAnims(scene) {
        if (!scene.anims.exists('enemy-walk')) {
            scene.anims.create({
                key: 'enemy-walk',
                frames: scene.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }),
                frameRate: 6,
                repeat: -1
            })
        }
    }

    update() {
        if (!this.isAlive || !this.body) return

        this.setVelocityX(this.facing * this.speed)
        this.setFlipX(this.facing < 0)

        // Inverte ao atingir borda de patrulha
        if (this.x <= this.patrolLeft) {
            this.x = this.patrolLeft
            this.facing = 1
        } else if (this.x >= this.patrolRight) {
            this.x = this.patrolRight
            this.facing = -1
        }
    }

    stomp() {
        if (!this.isAlive) return
        this.isAlive = false
        this.setVelocity(0, 0)
        this.body.enable = false

        this.scene.tweens.add({
            targets: this,
            scaleY: 0.15,
            scaleX: 1.6,
            alpha: 0,
            duration: 250,
            ease: 'Power2',
            onComplete: () => this.destroy()
        })
    }

    die() {
        if (!this.isAlive) return
        this.isAlive = false
        this.body.enable = false

        this.scene.tweens.add({
            targets: this,
            y: this.y - 40,
            alpha: 0,
            angle: 180,
            duration: 400,
            ease: 'Power2',
            onComplete: () => this.destroy()
        })
    }
}