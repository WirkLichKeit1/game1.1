export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        // Barra de loading
        const { width, height } = this.scale

        const bar = this.add.rectangle(width / 2, height / 2, 0, 8, 0x7ec8a0)
        const bg  = this.add.rectangle(width / 2, height / 2, 300, 8, 0x1a3a28)
        bar.setDepth(1)

        this.load.on('progress', (v) => {
            bar.width = 300 * v
        })

        // Por enquanto criamos sprites via código (sem arquivos externos)
        // Vamos gerar um spritesheet de placeholder programaticamente
        this._createPlaceholderGraphics()
    }

    _createPlaceholderGraphics() {
        // Cria texturas via Graphics — não precisa de arquivos PNG externos
        // Isso permite rodar o jogo imediatamente sem assets

        // Player spritesheet: 4 frames de 48x48
        // idle(0), run1(1), run2(2), jump(3)
        const pg = this.make.graphics({ x: 0, y: 0, add: false })
        const W = 48, H = 48

        const drawPlayer = (gfx, fx, state) => {
            const x = fx * W

            // Sombra
            gfx.fillStyle(0x000000, 0.15)
            gfx.fillEllipse(x + W/2, H - 4, 28, 8)

            // Pernas
            const legOff = state === 'run1' ? 8 : state === 'run2' ? -8 : 0
            gfx.fillStyle(0x2a6fd4)
            gfx.fillRect(x + 14, H - 18, 8, 14 + legOff)
            gfx.fillRect(x + 26, H - 18, 8, 14 - legOff)

            // Corpo
            gfx.fillStyle(state === 'jump' ? 0x5ba3f5 : 0x4a90e2)
            gfx.fillRect(x + 10, H - 36, 28, 20)

            // Cabeça
            gfx.fillStyle(0x4a90e2)
            gfx.fillRect(x + 12, H - 46, 24, 14)

            // Olho
            gfx.fillStyle(0xffffff)
            gfx.fillRect(x + 26, H - 43, 7, 7)
            gfx.fillStyle(0x1a1a2e)
            gfx.fillRect(x + 28, H - 41, 4, 4)
        }

        drawPlayer(pg, 0, 'idle')
        drawPlayer(pg, 1, 'run1')
        drawPlayer(pg, 2, 'run2')
        drawPlayer(pg, 3, 'jump')

        pg.generateTexture('player', W * 4, H)
        this.textures.get('player').add(0, 0, 0, 0, W, H)
        this.textures.get('player').add(1, 0, W, 0, W, H)
        this.textures.get('player').add(2, 0, W*2, 0, W, H)
        this.textures.get('player').add(3, 0, W*3, 0, W, H)
        pg.destroy()

        // Tileset: tiles de 32x32
        // tile 0 = chão, tile 1 = plataforma topo, tile 2 = céu
        const tg = this.make.graphics({ x: 0, y: 0, add: false })
        const T = 32

        // Tile 0 — bloco de terra
        tg.fillStyle(0x5a7a4a)
        tg.fillRect(0, 0, T, T)
        tg.fillStyle(0x7ab870)
        tg.fillRect(0, 0, T, 6)
        tg.fillStyle(0x4a6a3a, 0.4)
        tg.fillRect(4, 10, 8, 6)
        tg.fillRect(18, 16, 6, 5)

        // Tile 1 — bloco de pedra
        tg.fillStyle(0x7a7a8a)
        tg.fillRect(T, 0, T, T)
        tg.fillStyle(0x9a9aaa)
        tg.fillRect(T, 0, T, 4)
        tg.fillStyle(0x5a5a6a, 0.5)
        tg.fillRect(T + 6, 8, 10, 5)
        tg.fillRect(T + 20, 14, 7, 6)

        // Tile 2 — bloco de tijolo
        tg.fillStyle(0x8a4a3a)
        tg.fillRect(T * 2, 0, T, T)
        tg.fillStyle(0x6a3a2a, 0.6)
        for (let row = 0; row < 4; row++) {
            const off = (row % 2) * 16
            for (let col = 0; col < 3; col++) {
                tg.fillRect(T*2 + off + col*32, row*8, 28, 6)
            }
        }

        // Tile 3 — bloco de grama clara (plataforma flutuante)
        tg.fillStyle(0x6aaa5a)
        tg.fillRect(T * 3, 0, T, T)
        tg.fillStyle(0x8acc70)
        tg.fillRect(T * 3, 0, T, 5)
        tg.fillStyle(0x4a8a3a, 0.3)
        tg.fillRect(T*3 + 2, 10, 12, 8)

        tg.generateTexture('tiles', T * 4, T)
        this.textures.get('tiles').add(0, 0, 0, 0, T, T)
        this.textures.get('tiles').add(1, 0, T, 0, T, T)
        this.textures.get('tiles').add(2, 0, T*2, 0, T, T)
        this.textures.get('tiles').add(3, 0, T*3, 0, T, T)
        tg.destroy()

        // Inimigo: 2 frames 40x40
        const eg = this.make.graphics({ x: 0, y: 0, add: false })
        const EW = 40, EH = 40

        const drawEnemy = (gfx, fx) => {
            const x = fx * EW
            const legOff = fx === 0 ? 6 : -6

            // Pernas
            gfx.fillStyle(0x922b21)
            gfx.fillRect(x + 10, EH - 14, 8, 14 + legOff)
            gfx.fillRect(x + 22, EH - 14, 8, 14 - legOff)

            // Corpo
            gfx.fillStyle(0xc0392b)
            gfx.fillRect(x + 6, EH - 30, 28, 18)

            // Cabeça
            gfx.fillStyle(0xe74c3c)
            gfx.fillRect(x + 8, EH - 40, 24, 14)

            // Olho maligno
            gfx.fillStyle(0xffffff)
            gfx.fillRect(x + 22, EH - 37, 7, 7)
            gfx.fillStyle(0x1a1a2e)
            gfx.fillRect(x + 24, EH - 35, 4, 4)
            gfx.fillStyle(0x1a1a2e)
            gfx.fillRect(x + 21, EH - 39, 9, 2)
        }

        drawEnemy(eg, 0)
        drawEnemy(eg, 1)
        eg.generateTexture('enemy', EW * 2, EH)
        this.textures.get('enemy').add(0, 0, 0, 0, EW, EH)
        this.textures.get('enemy').add(1, 0, EW, 0, EW, EH)
        eg.destroy()

        // Coin: 4 frames de 16x16
        const cg = this.make.graphics({ x: 0, y: 0, add: false })
        const CW = 16
        const coinColors = [0xf5c518, 0xffd700, 0xffe066, 0xffd700]
        coinColors.forEach((col, i) => {
            cg.fillStyle(col)
            cg.fillCircle(i * CW + CW/2, CW/2, 6)
            cg.fillStyle(0xffffff, 0.4)
            cg.fillCircle(i * CW + CW/2 - 2, CW/2 - 2, 2)
        })
        cg.generateTexture('coin', CW * 4, CW)
        cg.destroy()

        // Partícula
        const partG = this.make.graphics({ x: 0, y: 0, add: false })
        partG.fillStyle(0xffffff)
        partG.fillCircle(4, 4, 4)
        partG.generateTexture('particle', 8, 8)
        partG.destroy()

        // Background layers (parallax)
        // Layer 0 — céu com estrelas
        const sky = this.make.graphics({ x: 0, y: 0, add: false })
        sky.fillStyle(0x0d1b2a)
        sky.fillRect(0, 0, 800, 560)
        // Estrelas
        sky.fillStyle(0xc8d8e8)
        const starPositions = [
            [60,30],[150,80],[280,20],[420,60],[550,35],[700,15],
            [80,120],[320,100],[480,140],[640,90],[750,130],
            [200,180],[380,160],[560,200],[720,170],
        ]
        for (const [sx, sy] of starPositions) {
            sky.fillRect(sx, sy, 2, 2)
        }
        sky.generateTexture('bg-sky', 800, 560)
        sky.destroy()

        // Layer 1 — montanhas distantes
        const mtn = this.make.graphics({ x: 0, y: 0, add: false })
        mtn.fillStyle(0x1a3a5c, 0.7)
        const peaks = [[0,400],[80,300],[180,340],[300,260],[420,320],[560,280],[680,350],[800,400],[800,560],[0,560]]
        mtn.fillPoints(peaks.map(([mx,my]) => ({ x: mx, y: my })), true)
        mtn.generateTexture('bg-mountains', 800, 560)
        mtn.destroy()

        // Layer 2 — árvores médias
        const trees = this.make.graphics({ x: 0, y: 0, add: false })
        const treePositions = [40, 120, 220, 350, 480, 600, 720]
        for (const tx of treePositions) {
            trees.fillStyle(0x1a4a28)
            trees.fillRect(tx + 14, 380, 12, 80)
            trees.fillStyle(0x1e5c30)
            trees.fillTriangle(tx, 420, tx + 40, 420, tx + 20, 340)
            trees.fillTriangle(tx + 4, 390, tx + 36, 390, tx + 20, 310)
        }
        trees.generateTexture('bg-trees', 800, 560)
        trees.destroy()
    }

    create() {
        this.scene.start('GameScene')

        window._dpad = {
            press:   (key) => {
                if (key === 'left')  this.wasd.left.isDown  = true
                if (key === 'right') this.wasd.right.isDown = true
                if (key === 'jump')  { this.wasd.up.isDown = true; /* força JustDown */ }
            },
            release: (key) => {
                if (key === 'left')  this.wasd.left.isDown  = false
                if (key === 'right') this.wasd.right.isDown = false
                if (key === 'jump')  this.wasd.up.isDown    = false
            },
        }
    }
}