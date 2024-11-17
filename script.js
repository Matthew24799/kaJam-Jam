import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay({
    width: 1920,
    height: 1080,
    background: [74, 48, 82],
})


loadSprite("player", "assets/flowr.png", {
    sliceX: 4,
    sliceY: 4,
    anims: {
        idle: {from: 8, to: 14, loop: true},
        walk: {from: 0, to: 7, loop: true},
    },
});

loadSprite("ant", "assets/Ant.png", {
    sliceX: 4,
    sliceY: 4,
    anims: {
        idle: { from: 0, to: 0, loop: true},
        walk: { from: 11, to: 15, loop: true},
        chomp: { from: 0, to: 10},
    },
});

loadSprite("root","assets/Root.png", {
    sliceX: 10,
    anims: {
        pulse: { from: 0, to: 9, loop:true},
    },
});

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

loadSprite("perkPierce", "assets/PerkFrameGreen.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

loadSprite("perkDefense", "assets/PerkFrameBlue.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

loadSprite("perkSize", "assets/PerkFramePurple.png", {
    sliceX: 3,
    anims: {
        play: { from: 0, to: 2, loop: true},
    },
});

loadSprite("perkAll", "assets/PerkFrameRainbow.png", {
    sliceX: 3,
    sliceY: 2,
    anims: {
        play: { from: 0, to: 5, loop: true},
    },
});

loadSprite("mainBackground", "assets/MainMenu.png", {
    sliceX: 3,
    sliceY: 2,
    anims: {
        play: { from: 0, to: 4, loop: true},
    },
});

loadSprite("mainStart", "assets/MainMenuButton.png", {
    sliceX: 3,
    sliceY: 2,
    anims: {
        default: { from: 0, to: 2, loop: true},
        hover: { from: 3, to: 5, loop: true},
    },
});

layers(["background", "game", "foreground", "menues"], "game");


scene("menu", () => {

    onUpdate(() => {
        setCursor("default");
    });
        
    
    
    const mainBack = add([
        sprite("mainBackground"),
        pos(center()),
        anchor("center"),
    ]);

    mainBack.play("play");

    const start = add([
        {
            add() {
                this.onHoverEnd(() => {
                    this.play("default");
                });

                this.onHover(() => {
                    this.play("hover");
                });
            },
        },
        sprite("mainStart"),
            scale(0.8),
        pos(center().x, center().y + 250),
        area(),
        anchor("center"),
    ]);

    start.play("default");

    start.onHoverUpdate(() => {
        setCursor("pointer");
    });

    start.onClick(() => {
       go("game");
    });
});

scene("game", () => {

add([
    rect(width(),1),
    pos(0,0),
    color(BLACK),
    area(),
    body(),
    body({ isStatic: true }),
])

add([
    rect(1,height()),
    pos(0,0),
    color(BLACK),
    area(),
    body(),
    body({ isStatic: true }),
])

add([
    rect(1,height()),
    pos(1920,0),
    color(BLACK),
    area(),
    body(),
    body({ isStatic: true }),
])

add([
    rect(width(),1),
    pos(0,1080),
    color(BLACK),
    area(),
    body(),
    body({ isStatic: true }),
])

let SPEED = 200;
let bulletSpeed = 700;
let playerHp = 10;
let rootHp = 50;
let size = 90;
let rootHealthsize = 150;
let antNum = 0;
let antId = "0";
let speedMod = 0
let attackMod = 0
let hpMod = 0
let pierceMod = 0
let bulletMod = 0
let defenseMod = 0
let perkTimer = 0

const root = add([
    sprite("root"),
    pos(center()),
    anchor("bot"),
    "root",
    health(rootHp),
    area(),
    layer("foreground")
   
]);

const rootHitbox1 = add([
    rect(300, 200),
    pos(center().x, center().y - 300),
    anchor("bot"),
    area(),
    body(),
    body({ isStatic: true}),
    opacity(0),
]);

const rootHitbox2 = add([
    rect(100, 100),
    pos(center().x, center().y - 200),
    anchor("bot"),
    area(),
    body(),
    body({ isStatic: true}),
    opacity(0),
]);

root.play("pulse");

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
    },
    layer("menues"),
]);

onUpdate(() => {

    if(get("menu").length > 0) return;

    if(playerHp <= 0) {
        destroy(player);
        perkChoice();
    }

    if (rootHp < 15) {
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
    {
        add() {
            this.onStateEnter("moving", () => {
                this.play("walk");
            });

            this.onStateUpdate("moving", () => {
                if(isKeyDown(["a", "d", "s", "w"]) == false) {
                    this.enterState("idle");
                } else return;
            });

            this.onStateEnter("idle", () => {
                this.play("idle");
            });
        },
    },
    sprite("player"),
    pos(center().x, center().y + 200),
    scale(0.5,0.5),
    anchor("center"),
    "player",
    health(playerHp),
    timer(), 
    area(),
    body(),
    opacity(1),
    state("idle", ["idle", "moving"]),
]);

player.loop(1, () => {
    perkTimer++
});


player.onUpdate(() => {
    
    camPos(player.worldPos());
});

camScale(1.5);



onUpdate(() => {
    displayHealth.text = `Health: ${Math.round(playerHp)}`;
    displayMovementSpeed.text = `Movement: ${SPEED}`;
    displayAttkSpeed.text = `AttackSpd: ${bulletSpeed}`;
    displayArmor.text = `Armor: ${defenseMod}`;
})

const displayHealth = add([
    text(`Health: ${playerHp}`),
    pos(250,10),
    fixed(),
]) 

const displayMovementSpeed = add([
    text(`Movement: ${SPEED}`),
    pos(600,10),
    fixed(),
])

const displayAttkSpeed = add([
    text(`AttackSpd: ${bulletSpeed}`),
    pos(1000,10),
    fixed(),
])

const displayArmor = add([
    text(`Armor: ${defenseMod}`),
    pos(1400, 10),
    fixed(),
])

function perkChoice() {
    
    const perkMenu = add([
        sprite("perkBackground"),
        pos(center()),
        anchor("center"),
        layer("menues"),
        "menu",
        fixed(),
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
                    playerHp = 12 + (hpMod * 5)
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
        fixed(),
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
                    playerHp = 10 + (hpMod * 5)
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
        fixed(),
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
                    playerHp = 10 + (hpMod * 5)
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
        fixed(),
    ]);

    const perkPierce = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    pierceMod++;
                    playerHp = 10 + (hpMod * 5)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkPierce"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
        fixed(),
    ]);

    const perkDefense = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    defenseMod++;
                    playerHp = 10 + (hpMod * 5)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkDefense"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
        fixed(),
    ]);

    const perkSize = make([
        {
            add() {
                this.onHover(() => {
                    this.use(scale(1, 1));
                });
                this.onHoverEnd(() => {
                    this.use(scale(0.75, 0.75));
                });
                this.onClick(() => {
                    bulletMod++;
                    playerHp = 10 + (hpMod * 5)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkSize"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
        fixed(),
    ]);

    const perkAll = make([
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
                    speedMod++;
                    attackMod++;
                    pierceMod++;
                    defenseMod++;
                    sizeMod++;
                    playerHp = 10 + (hpMod * 5)
                    add(player);
                    destroyAll("menu");
                });
            },
        },
        sprite("perkAll"),
            scale(0.75, 0.75),
        pos(center().x, center().y + 75),
        anchor("center"),
        opacity(1),
            fadeIn(0.5),
        area({scale: 0.7}),
        layer("menues"),
        "menu",
        fixed(),
    ]);

    const perks = [perkHp, perkSpeed, perkDefense, perkAttack, perkPierce, perkSize, perkAll]

    console.log(perkTimer);

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
    } else if(60 < perkTimer <= 90) {
        let i = rand(1, 100)
        if(i <= 20) {
            let perk1 = Math.round(rand(0,6));
            add(perks[perk1]);
            perks[perk1].play("play");
        } else if(20 < i <= 70) {
            let perk1 = Math.round(rand(0,6));
            let perk2 = Math.round(rand(0,6));
            while(perk1 == perk2) {
                perk2 = Math.round(rand(0,6));
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
    } else {
        let i = rand(1, 100)
        if(i <= 50) {
            let perk1 = Math.round(rand(3,6));
            let perk2 = Math.round(rand(3,6));
            while(perk1 == perk2) {
                perk2 = Math.round(rand(3,6));
            };
            add(perks[perk1]);
            perks[perk1].use(pos(center().x - 100, center().y + 75))
            perks[perk1].play("play");
            add(perks[perk2]);
            perks[perk2].use(pos(center().x + 100, center().y + 75))
            perks[perk2].play("play");
        } else {
            let perk1 = Math.round(rand(3,6));
            let perk2 = Math.round(rand(3,6));
            let perk3 = Math.round(rand(3,6));
            while (perk1 == perk2) {
                perk2 = Math.round(rand(3,6));
            };
            while (perk3 == perk1 || perk2) {
                perk3 = Math.round(rand(3,6));
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
    player.opacity = 0.5
    wait(0.2, () => {
        player.opacity = 1;
      });
});

root.onHurt(() => {
    rootHealthbar.set(root.hp());
});

onKeyDown("a", () => {
    player.move(-(SPEED + (speedMod * 100)), 0);
    player.flipX = false;
    if(player.state !== "moving") {
        player.enterState("moving");
    } else return;
});

onKeyDown("d", () => {
    player.move((SPEED + (speedMod * 100)), 0);
    player.flipX = true;
    if(player.state !== "moving") {
        player.enterState("moving");
    } else return;
});

onKeyDown("w", () => {
    player.move(0, -(SPEED + (speedMod * 100)));
    if(player.state !== "moving") {
        player.enterState("moving");
    } else return;
});

onKeyDown("s", () => {
    player.move(0, (SPEED + (speedMod * 100)));
    if(player.state !== "moving") {
        player.enterState("moving");
    } else return;
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
            {
                add() {
                    this.onDeath(() => {
                        destroy(this)
                    });
                },
            },
            circle((10 + bulletMod)),
            pos(p),
            color(GREEN),
            "pea",
            area(),
            health(1 + pierceMod),
            move(peaShooter.angle,bulletSpeed)
        ]); 
};

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
                    } else if(this.pos.dist(player.pos) < 250) {
                        this.enterState("followPlayer");
                    } else {
                        const dir = root.pos.sub(this.pos).unit();
                        this.move(dir.scale(440));
                    };
                });

                this.onStateEnter("attackRoot", () => {
                    if(!root.exists() || !player.exists() || !this.exists()) return;

                    this.play("chomp");
                    wait(0.5, () => {
                        
                        root.hurt(1);
                        rootHp = rootHp - 1
                        wait(3, () => {
                            this.enterState("attackRoot");
                        });
                    });
                });

                this.onStateEnter("followPlayer", () => {
                    this.play("walk");
                });

                this.onStateUpdate("followPlayer", () => {
                    if(!root.exists() || !player.exists()) return;
                    
                    if(this.pos.dist(player.pos) > 300) {
                        this.enterState("move");
                    } else if(this.pos.dist(player.pos) < 25) {
                        this.enterState("attackPlayer");
                    } else {
                        const dir = player.pos.sub(this.pos).unit();
                        this.move(dir.scale(250))
                    };
                });

                this.onStateEnter("attackPlayer", () => {
                    if(!root.exists() || !player.exists() || !this.exists()) return;

                    this.play("chomp");
                    wait(0.5, () => {
                        playerHp = playerHp - (5 - (defenseMod * 0.5));
                        player.hurt((5 - (defenseMod * 0.5)));
                        wait(0.5, () => {
                            this.enterState("followPlayer");
                        });
                    });
                })

                onCollide("pea", id, (pea) => {
                    this.hurt(5 + (attackMod * 5));
                    this.fadeIn(0.2);
                    pea.hurt(1);
                });

                this.onDeath(() => {
                    destroy(this);
                    return;
                });
            },
        },
        sprite("ant"),
            scale(0.3, 0.3),
            opacity(1),
        pos(px, py),
        anchor("center"),
        area(),
        health(15),
        state("move", ["attackRoot", "followPlayer", "attackPlayer", "move"]),
        "ant",
        id,
    ]);
    antNum++
    antId = antNum.toString();
    return blackAnt;
};






    function choas() {
        loop(1, () => {
            if(!root.exists() || !player.exists()) return;

            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);

          });
          wait(3, () => {
             
          
          loop(5, () => {
            if(!root.exists() || !player.exists()) return;
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
        
          });
        })

        wait(10, () => {
            // after 1s 
          
          loop(20, () => {
            if(!root.exists() || !player.exists()) return;
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
            spawnBlackAnt(rand(100, width() - 100), rand(100, height() - 100), antId);
           
          });
        });
    }

    


      choas();
})



scene("lose", () => {
    add([
        text("THE ROOT HAS DIED"),
        pos(center()),
    ]);

    add([
        text("PRESS SPACE"),
        pos(width() / 2, height() / 2 + 50),
    ]);

    onKeyPress("space", () => go("menu"));
});

go("menu");
