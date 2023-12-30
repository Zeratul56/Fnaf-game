class Overworld {
 constructor(config) {
   this.element = config.element; //������������ ���������
   this.canvas = this.element.querySelector(".game-canvas"); //��������� canvas � ������� ��������
   this.ctx = this.canvas.getContext("2d"); //��������� ��������� ��� ������ � canvas
   this.map = null;
 }

 gameLoopStepWork(delta) {
   //������� canvas
   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

   //��������� ������ �������� �����
   const cameraPerson = this.map.gameObjects.hero;

   //���������� ���� ��������
   Object.values(this.map.gameObjects).forEach(object => {
     object.update({
       delta,
       arrow: this.directionInput.direction,
       map: this.map,
     })
   })

   //��������� ������ ����� �����
   this.map.drawLowerImage(this.ctx, cameraPerson);

   //��������� ���� ������� ��������
   Object.values(this.map.gameObjects).sort((a,b) => {
     return a.y - b.y;
   }).forEach(object => {
     object.sprite.draw(this.ctx, cameraPerson);
   })

   //��������� ������� ����� �����
   this.map.drawUpperImage(this.ctx, cameraPerson);
 }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      // ��������� ���� �����
      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }

      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000; // ���������, ��� �� �� ������ �������������� (������) �����.

      // ������ ��� ������� ���
      requestAnimationFrame(stepFn)
    }

    // ������ ���
    requestAnimationFrame(stepFn)
 }

 bindActionInput() {
   new KeyPressListener("Enter", () => {
     //���� �� ����� (�������� ������) ������� � ������� ����� �����������������
     this.map.checkForActionCutscene()
   })
   new KeyPressListener("Escape", () => {
     if (!this.map.isCutscenePlaying) {
      this.map.startCutscene([//��� ������� �� Esc ����� ����������� ���� ����� � ��� ���� ����� �����������
        { type: "pause" }
      ])
     }
   })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //��������� ������� ������
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig, heroInitialState=null) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();

  if (heroInitialState) {
    const {hero} = this.map.gameObjects;
    hero.x = heroInitialState.x;
    hero.y = heroInitialState.y;
    hero.direction = heroInitialState.direction;
  }

  this.progress.mapId = mapConfig.id;
  this.progress.startingHeroX = this.map.gameObjects.hero.x;
  this.progress.startingHeroY = this.map.gameObjects.hero.y;
  this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;

 }

 async init() {

  const container = document.querySelector(".game-container");

  //�������� ������� ���������
  this.progress = new Progress();

  //����� ���������� ������
  this.titleScreen = new TitleScreen({
    progress: this.progress
  })
  //const useSaveFile = await this.titleScreen.init(container);
   const useSaveFile = false;

  //������������� �������� � �������� 
  let initialHeroState = null;
  if (useSaveFile) {
    this.progress.load();
    initialHeroState = {
      x: this.progress.startingHeroX,
      y: this.progress.startingHeroY,
      direction: this.progress.startingHeroDirection,
    }
  }

  //�������� HUD
  this.hud = new Hud();
  this.hud.init(container);

  //����� � ������ �����
  this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );

  //�������� ������������
  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  //������ ����
  this.startGameLoop();


  // this.map.startCutscene([
  //   { type: "battle", enemyId: "beth" }
  //   // { type: "changeMap", map: "DemoRoom"}
  //   // { type: "textMessage", text: "This is the very first message!"}
  // ])

 }
}