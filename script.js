import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay({
    width: 1920,
    height: 1080,
    background: [74, 48, 82],
})


loadSprite("player","/assets/bean.png");

loadSprite("ant", "/assets/Ant.png");

loadSprite("fish","/assets/bobo.png");

loadSprite("peaShooter","/assets/gun.png");

let SPEED = 500;
let bulletSpeed = 1500;
let playerHp = 50;
let size = 90;

const root = add([
    sprite("fish"),
    pos(center()),
    scale(2),
    anchor("center"),
    "root",
    { health: 100,
    }
]);

const rootHp = add([
    text(root.health),
    pos(root.pos.x, root.pos.y - 70),
    color(GREEN),
]);

onUpdate(() => {
    if(playerHp <= 0) {
        destroy(player)
    }
    rootHp.text = root.health;
    if (root.health < 45) {
        rootHp.use(color(RED));
    } 
    if (root.health <= 0) {
        destroy(root);
        wait(1, () => {
            destroy(rootHp);
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
])

player.onHurt(() => {
    playerHealthbar.set(player.hp());
});


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
   spawnPea(player.pos);
})
    
let enemy = add([
    sprite("ant"),
        scale(0.25, 0.25),
    pos(50, rand(100)),
    anchor("center"),
    body(),
    area(),
    state("move", ["attackRoot", "attackPlayer", "move"]),
    "ant"
]);



enemy.onStateUpdate("move", () => {
    if(!root.exists()) return;

    if(enemy.pos.dist(root.pos) < 25) {
        enemy.enterState("attackRoot")
    }

    if(enemy.pos.dist(player.pos) < 200) {
        enemy.enterState("attackPlayer")
    }

    const dir = root.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(200));
});

enemy.onStateUpdate("attackPlayer", () => {
    if(!player.exists()) return;

    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(250));
})

enemy.onStateEnter("attackRoot", async () => {
    enemy.use(rotate(30));
    root.health = root.health - 2;
    await wait(1);
    enemy.use(rotate(0));
    await wait(2);
    enemy.enterState("attackRoot");
})

enemy.onStateEnter("attackPlayer", async () => {
    if(enemy.pos.dist(player.pos) < 200) {
    enemy.use(rotate(30));
    playerHp = playerHp - 10;
    player.hurt(10);
    await wait(1);
    enemy.use(rotate(0));
    await wait(2);
    enemy.enterState("attackPlayer");
    }
   else return enemy.enterState("move");
})




onCollide("pea", "ant", (pea) => {
    destroy(enemy)
    destroy(pea)
});

loop(1, () => { 
debug.log(playerHp)
})