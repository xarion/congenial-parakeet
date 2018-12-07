let app = null;


let allBrainSlices = [['brain_slices/1.png', "brain_slices/2.png", "brain_slices/3.png", "brain_slices/4.png"],
    ['brain_slices/5.png', "brain_slices/6.png", "brain_slices/7.png", "brain_slices/8.png"],
    ['brain_slices/9.png', "brain_slices/10.png", "brain_slices/11.png", "brain_slices/12.png"],
    ['brain_slices/13.png', "brain_slices/14.png", "brain_slices/15.png", "brain_slices/16.png"]];




$(document).ready(function () {
// window.addEventListener("load", function () {
    app = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: true,
        backgroundColor: 0x00FF00
    });
    document.body.appendChild(app.view);

    window.stage = app.stage;
    adaptRenderSize();
    window.addEventListener("resize", adaptRenderSize);

    let loader = PIXI.loader.add("horse_a", "HorseA.png").add("horse_b", "HorseB.png");
    for (let brainIdx = 0; brainIdx < allBrainSlices.length; brainIdx++) {
        for (let sliceIdx = 0; sliceIdx < allBrainSlices[brainIdx].length; sliceIdx++) {
            loader = loader.add(allBrainSlices[brainIdx][sliceIdx], allBrainSlices[brainIdx][sliceIdx])
        }
    }
    loader.load();

    window.players = [
        new Player(0, allBrainSlices),
        new Player(1, allBrainSlices)
    ];

    players[0].preloadBrainSlices();
    players[1].preloadBrainSlices();
    PIXI.loader.onComplete.add(drawCanvas);
});

function adaptRenderSize() {
    const realWidth = window.innerWidth;
    const realHeight = window.innerHeight;
    const referenceWidth = 1920;
    const aspectRatio = 16 / 9;

    app.renderer.resize(realWidth, realWidth / aspectRatio);

    const scale = realWidth / referenceWidth;
    const scaleM = new PIXI.Matrix().scale(scale, scale);
    app.stage.scale.x = scale;
    app.stage.scale.y = scale;
}

function drawCanvas() {

    $("#loading").hide();
    drawRaceComponentsContainer();
    drawHorses();
    drawRaceTrack();
    drawPlayerIdBox();
    drawSeparators();
    drawTimer();
    drawBrainSliders();

    defineGamepads();
}

function defineGamepads() {
    window.gamepad = new Gamepad();
    window.gamepadHorseArray = Array();

    gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
        // console.log('Connected', device);
        players[device.index].horse = window.horses.pop();
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
        let horse = players[e.gamepad.index].horse;
        horse.position.x += 1;
    });

    gamepad.bind(Gamepad.Event.TICK, function (gamepads) {
        for (let i = 0; i < gamepads.length; i += 1) {
            let _gamepad = gamepads[i];

            let horse = players[_gamepad.index].horse;
            horse.position.x += _gamepad.axes[6];
            players[_gamepad.index].changeSlice(_gamepad.axes[7]*0.1);
        }
    });

    gamepad.bind(Gamepad.Event.DISCONNECTED, function (device) {
        // console.log('Disconnected', device);
        let horse = players[device.index].horse;
        horses.push(horse);
        window.stage.removeChild(horse);
        players[device.index].horse = null;
    });

    console.log("Gamepad defined!");
    gamepad.init();
}

function drawHorses() {
    const horseATex = PIXI.utils.TextureCache["horse_a"];
    const horseBTex = PIXI.utils.TextureCache["horse_b"];

    const horseASprite = new PIXI.Sprite(horseATex);
    const horseBSprite = new PIXI.Sprite(horseBTex);

    console.log("all loaded!");

    window.horses = [horseASprite, horseBSprite];


    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;

    horseASprite.position.x = 40;
    horseASprite.position.y = 23;

    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;

    horseBSprite.position.x = -15;
    horseBSprite.position.y = 133;
}

function drawRaceComponentsContainer() {
    window.raceComponentsContainer = new PIXI.Container({
        width: 1100,
        height: 330
    });
    raceComponentsContainer.position.set(300, 50);
    window.stage.addChild(raceComponentsContainer);
}

function drawRaceTrack() {
    window.raceTrackContainer = new PIXI.Container({
        width: 900,
        height: 200
    });
    raceTrackContainer.position.x = 200;

    let raceTrackGround = new PIXI.Graphics();
    raceTrackGround.beginFill(0xff8000);
    raceTrackGround.drawPolygon([100, 0, 0, 200, 900, 200, 1000, 0]);
    raceTrackGround.position.set(30, 10);

    for (let i = 0; i < 10; i += 1) {
        raceTrackGround.lineStyle(5, 0xeeeeee).moveTo((i + 1) * 100, 0).lineTo(i * 100, 200);
    }

    raceTrackContainer.addChild(raceTrackGround, horses[0], horses[1]);
    raceComponentsContainer.addChild(raceTrackContainer);
}

function drawPlayerIdBox() {
    window.playerIdsContainer = new PIXI.Container({
        width: 200,
        height: 200
    });
    let p1Text = new PIXI.Text('P1', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    let p2Text = new PIXI.Text('P2', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    p1Text.position.set(120, 20);
    p2Text.position.set(70, 120);


    playerIdsContainer.addChild(p1Text, p2Text);
    raceComponentsContainer.addChild(playerIdsContainer);
}

function drawSeparators() {
    let raceTrackSeparator = new PIXI.Graphics();
    raceTrackSeparator.position.set(0, 110);
    raceTrackSeparator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(1200, 0);

    let boxSeparator = new PIXI.Graphics();
    boxSeparator.position.set(250, 0);
    boxSeparator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(-110, 220);
    raceComponentsContainer.addChild(raceTrackSeparator, boxSeparator)
}

function drawTimer() {
    window.timerText = new PIXI.Text('Time 0.00', {
        fontFamily: 'DisposableDroidBB',
        fontSize: 80,
        fill: 0x000000,
        align: 'left'
    });
    timerText.position.set(450, 250);
    raceComponentsContainer.addChild(timerText);
}

function drawBrainSliders() {
    let brainSlidersContainer = new PIXI.Container({
        width: 1920,
        height: 600,
    });
    brainSlidersContainer.position.set(0, 450);
    players[0].brainSliceContainer.position.set(350, 0);
    players[1].brainSliceContainer.position.set(1020, 0);
    players[0].preloadBrainSlices();
    players[1].preloadBrainSlices();
    players[0].moveToNextBrain();
    players[1].moveToNextBrain();
    brainSlidersContainer.addChild(players[0].brainSliceContainer, players[1].brainSliceContainer);
    window.stage.addChild(brainSlidersContainer)
}

function startTimer() {
    let startTime = new Date().getTime();
    window.timerTicker = PIXI.ticker.shared.add(function (deltaT) {
        let currentTime = new Date().getTime();
        let time = (currentTime - startTime) / 1000;
        window.timerText.text = "Time " + time.toFixed(2);
    });
}
