import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay({
    width: 1920,
    height: 1080,
    background: [74, 48, 82],
})


loadSprite("player","assets/bean.png");

loadSprite("ant", "assets/Ant.png");

loadSprite("fish","assets/bobo.png");

loadSprite("peaShooter","assets/gun.png");

loadSprite("perkBackground", "assets/PerkMenu.png", {
    sliceX: 6,
    sliceY: 5,
    anims: {
        appear: { from: 0, to: 26},
        remain: { from: 24, to: 26, loop: true},
    },
});


scene("game", () => {



let SPEED = 500;
let bulletSpeed = 1500;
let playerHp = 50;
let rootHp = 100;
let size = 90;
let rootHealthsize = 150;
let antNum = 0;
let antId = "0";

const root = add([
    sprite("fish"),
    pos(center()),
    scale(2),
    anchor("center"),
    "root",
   health(rootHp),
   area(),
   
]);

const rootHealthbar = add([
    rect(rootHealthsize, 30),
    pos(root.pos.x, root.pos.y - 70),
    color(GREEN),
    outline(5,BLACK),

    {
        max: rootHp,
        set(hp) {
            this.width = rootHealthsize * hp / this.max;
        }
    }
]);

onUpdate(() => {
    if(get("menu").length > 0) return;

    if(playerHp <= 0) {
        perkChoice();
        destroy(player);
    }

    if (rootHp < 45) {
        rootHealthbar.use(color(RED));
    } 
    if (rootHp <= 0) {
        destroy(root);
        wait(1, () => {
            destroy(rootHealthbar);
            go("lose");
        })


    }
  });

const player = add([
    sprite("player"),
    pos(center()),
    anchor("center"),
    "player",
    health(playerHp)
]);

const playerHealthbar = player.add([
    rect(size,10),
    color(GREEN),
    anchor(vec2(0,8)),
    outline(5,BLACK),
    z(10),
    {
        max: playerHp,
        set(hp) {
            this.width = size * hp / this.max;
        }
    }
]);

function perkChoice() {
    const perkMenu = add([
        sprite("perkBackground"),
        pos(center()),
        anchor("center"),
        "menu",
    ]);

    perkMenu.play("appear");
    perkMenu.onAnimEnd(() => {
        perkMenu.play("remain");
    });
};
    

player.onHurt(() => {
    playerHealthbar.set(player.hp());
});

root.onHurt(() => {
    rootHealthbar.set(root.hp());
})

onKeyDown("a", () => {

    player.move(-SPEED, 0);
});

onKeyDown("d", () => {
    player.move(SPEED, 0);
});

onKeyDown("w", () => {
    player.move(0, -SPEED);
});

onKeyDown("s", () => {
    player.move(0, SPEED);
});

const peaShooter = player.add([
    sprite("peaShooter"),
    anchor(vec2(-2,0)),
    rotate(0),
    "player",
]);

onMouseMove(() => {
    peaShooter.angle = mousePos().sub(player.pos).angle();
    peaShooter.flipY = Math.abs(peaShooter.angle) > 90;
});
function spawnPea(p) {
        add([
    circle(10),
    pos(p),
    color(GREEN),
    "pea",
    area(),
    move(peaShooter.angle,bulletSpeed)
    ]) 
}

onMousePress(() => {
    if(playerHp > 0) {
   spawnPea(player.pos);
    }
})
 
function spawnBlackAnt(px, py, id) {
    const blackAnt = add([
        {
            add() {
                this.onStateUpdate("move", () => {
                    if(!root.exists() || !player.exists()) return;
                
                    if(this.pos.dist(root.pos) < 25) {
                        this.enterState("attackRoot");
                    };
                
                    if(this.pos.dist(player.pos) < 200) {
                        this.enterState("attackPlayer");
                    };
                
                    const dir = root.pos.sub(this.pos).unit();
                    this.move(dir.scale(200));
                });
                this.onStateUpdate("attackPlayer", () => {
                    if(!player.exists()) return;
                
                    const dir = player.pos.sub(this.pos).unit();
                    this.move(dir.scale(250));
                });
                this.onStateEnter("attackRoot", async () => {
                    if(!this.exists() || !root.exists()) return;
                    this.use(rotate(30));
                    rootHp = rootHp - 2;
                    root.hurt(2);
                    await wait(1);
                    this.use(rotate(0));
                    await wait(2);
                    this.enterState("attackRoot");
                });
                this.onStateEnter("attackPlayer", async () => {
                    if(!this.exists() || !player.exists()) return;
                    if(this.pos.dist(player.pos) < 200) {
                    this.use(rotate(30));
                    playerHp = playerHp - 10;
                    player.hurt(10);
                    await wait(1);
                    this.use(rotate(0));
                    await wait(2);
                    this.enterState("attackPlayer");
                    }
                    else return this.enterState("move");
                });
                onCollide("pea", id, (pea) => {
                    destroy(this)
                    destroy(pea)
                });
            },
        },
        sprite("ant"),
            scale(0.25, 0.25),
        pos(px, py),
        anchor("center"),
        area(),
        state("move", ["attackRoot", "attackPlayer", "move"]),
        "ant",
        id,
    ]);
    antNum++
    antId = antNum.toString();
    return blackAnt;
};


spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);

loop(1, () => {
    if(!root.exists() || !player.exists()) return;
    
    spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);

    });

})

scene("lose", () => {
    add([
        text("THE ROOT HAS DIED"),
        pos(center()),
    ]);

    add([
        text("PRESS SPACE TO RESTART"),
        pos(width() / 2, height() / 2 + 50),
    ]);

    // Press any key to go back
    onKeyPress("space", () => go("game"));
});

go("game")
