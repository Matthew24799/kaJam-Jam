import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay()


loadSprite("player","/assets/bean.png");

loadSprite("ghost", "/assets/ghosty.png");

loadSprite("fish","/assets/bobo.png");


let SPEED = 500;

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
    if (root.health < 45) {
        rootHp.use(color(RED));
    } 
  });

const player = add([
    sprite("player"),
    pos(center()),
    anchor("center"),
    "player",
]);

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

const enemy = add([
    sprite("ghost"),
    pos(50, 50),
    anchor("center"),
    state("move", ["attackRoot", "attackPlayer", "move"]),
]);

enemy.onStateUpdate("move", () => {
    if(!root.exists()) return;

    if(enemy.pos.dist(player.pos) < 200) {
        enemy.enterState("attackPlayer")
    }

    const dir = root.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(200));
});

enemy.onStateUpdate("attackPlayer", () => {
    if(!player.exists()) return;
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(200));
})