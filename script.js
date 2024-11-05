import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

kaplay()


loadSprite("player","/assets/bean.png");
loadSprite("ghost", "/assets/ghosty.png");

let SPEED = 500;

const player = add([
    sprite("player"),
    pos(center()),
    anchor("center"),
    "player"
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
    state("move", ["idle", "attack", "move"]),
]);

enemy.onStateUpdate("move", () => {
    if(!player.exists()) return;
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(200));
});