import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay({
    width: 1920,
    height: 1080,
    background: [74, 48, 82],
})


loadSprite("player","assets/bean.png");

loadSprite("ant", "assets/Ant.png", {
    sliceX: 4,
    sliceY: 4,
    anims: {
        idle: { from: 0, to: 0, loop: true},
        walk: { from: 11, to: 15, loop: true},
        chomp: { from: 0, to: 10},
    },
});

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

loadSprite("perkHp", "assets/PerkFrameRed.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

loadSprite("perkSpeed", "assets/PerkFrameOrange.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

loadSprite("perkAttack", "assets/PerkFrameYellow.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

scene("game", () => {

layers(["background", "game", "foreground", "menues"], "game");



let SPEED = 500;
let bulletSpeed = 1500;
let playerHp = 50;
let rootHp = 100;
let size = 90;
let rootHealthsize = 150;
let antNum = 0;
let antId = "0";
let speedMod = 0
let attackMod = 0
let hpMod = 0
let perkTimer = 0

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
        destroy(player);
        destroy(playerHealthbar);
        perkChoice();
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
    health(playerHp),
    timer(),
]);

player.loop(1, () => {
    perkTimer++
});

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
        layer("menues"),
        "menu",
    ]);

    perkMenu.play("appear");
    perkMenu.onAnimEnd((appear) => {
        perkMenu.play("remain");
        perkSelection();
    });
};  

function perkSelection() {

    const perkHp = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    hpMod++;
                    playerHp = 50 + (hpMod * 25)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkHp"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
    ]);

    const perkSpeed = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    speedMod++;
                    playerHp = 50 + (hpMod * 25)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkSpeed"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
    ]);

    const perkAttack = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    attackMod++;
                    playerHp = 50 + (hpMod * 25)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkAttack"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
    ]);

    const perks = [perkHp, perkSpeed, perkAttack, 3, 4, 5, 6]

    if(perkTimer <= 30) {
        if(rand(1, 100) <= 80) {
            let perk1 = Math.round(rand(0,2));
            add(perks[perk1]);
            perks[perk1].play("play");
        } else {
            let perk1 = Math.round(rand(0,2));
            let perk2 = Math.round(rand(0,2));
            while(perk1 == perk2) {
                perk2 = Math.round(rand(0,2));
            };
            add(perks[perk1]);
            perks[perk1].use(pos(center().x - 100, center().y + 75))
            perks[perk1].play("play");
            add(perks[perk2]);
            perks[perk2].use(pos(center().x + 100, center().y + 75))
            perks[perk2].play("play");
        };

    } else if(30 < perkTimer <= 60) {
        let i = rand(1, 100)
        if(i <= 50) {
            let perk1 = Math.round(rand(0,5));
            add(perks[perk1]);
            perks[perk1].play("play");
        } else if(50 < i <= 90) {
            let perk1 = Math.round(rand(0,5));
            let perk2 = Math.round(rand(0,5));
            while(perk1 == perk2) {
                perk2 = Math.round(rand(0,5));
            };
            add(perks[perk1]);
            perks[perk1].use(pos(center().x - 100, center().y + 75))
            perks[perk1].play("play");
            add(perks[perk2]);
            perks[perk2].use(pos(center().x + 100, center().y + 75))
            perks[perk2].play("play");
        } else {
            let perk1 = Math.round(rand(0,6));
            let perk2 = Math.round(rand(0,6));
            let perk3 = Math.round(rand(0,6));
            while (perk1 == perk2) {
                perk2 = Math.round(rand(0,6));
            };
            while (perk3 == perk1 || perk2) {
                perk3 = Math.round(rand(0,6));
            };
            add(perks[perk1]);
            perks[perk1].use(pos(center().x - 200, center().y + 75))
            perks[perk1].play("play");
            add(perks[perk2]);
            perks[perk2].play("play");
            add(perks[perk3]);
            perks[perk3].use(pos(center().x + 200, center().y + 75))
            perks[perk3].play("play");
        };
    };

    perkTimer = 0;
};













player.onHurt(() => {
    playerHealthbar.set(player.hp());
});

root.onHurt(() => {
    rootHealthbar.set(root.hp());
})

onKeyDown("a", () => {

    player.move(-(SPEED + (speedMod * 100)), 0);
});

onKeyDown("d", () => {
    player.move((SPEED + (speedMod * 100)), 0);
});

onKeyDown("w", () => {
    player.move(0, -(SPEED + (speedMod * 100)));
});

onKeyDown("s", () => {
    player.move(0, (SPEED + (speedMod * 100)));
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
                this.onStateEnter("move", () => {
                    this.play("walk");
                });
                this.onStateUpdate("move", () => {
                    if(!root.exists() || !player.exists()) return;
                
                    if(this.pos.dist(root.pos) < 25) {
                        this.enterState("attackRoot");
                    };

                    if(this.pos.dist(player.pos) < 250) {
                        this.enterState("attackPlayer");
                    };
                
                    const dir = root.pos.sub(this.pos).unit();
                    this.move(dir.scale(200));
                });

                this.onStateEnter("attackRoot", async () => {
                    if(!this.exists() || !root.exists()) return;
                    this.play("chomp")
                    this.onAnimEnd(async (chomp) => {
                        rootHp = rootHp - 2;
                        root.hurt(2);
                        await wait(3);
                        this.enterState("attackRoot");
                    });
                });
                this.onStateEnter("attackPlayer", async () => {
                    if(!this.exists() || !player.exists()) return;

                    const dir = player.pos.sub(this.pos).unit();
                    this.move(dir.scale(250));

                    if()
                    };
                });
                this.onStateUpdate("attackPlayer", () => {
                    if(this.pos.dist(player.pos) < 50) {
                        this.play("chomp");
                        this.onAnimEnd(async (chomp) => {
                            if(this.pos.dist(player.pos) < 50) {
                                playerHp = playerHp - 10;
                                player.hurt(10);
                                await wait(3);
                                this.enterState("move");
                            };
                        });
                    };    
                });
                onCollide("pea", id, (pea) => {
                    this.hurt(5 + (attackMod * 5));
                    destroy(pea);
                });
                this.onDeath(() => {
                    destroy(this);
                });
            },
        },
        sprite("ant"),
            scale(0.3, 0.3),
        pos(px, py),
        anchor("center"),
        area(),
        health(15),
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
