class Overworld {
 constructor(config) {
   this.element = config.element; //Конфигурация элементов
   this.canvas = this.element.querySelector(".game-canvas"); //Получение canvas с главной страницы
   this.ctx = this.canvas.getContext("2d"); //Получение контекста для работы с canvas
   this.map = null;
 }

 gameLoopStepWork(delta) {
   //Очистка canvas
   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

   //Установка камеры главного героя
   const cameraPerson = this.map.gameObjects.hero;

   //Обновление всех объектов
   Object.values(this.map.gameObjects).forEach(object => {
     object.update({
       delta,
       arrow: this.directionInput.direction,
       map: this.map,
     })
   })

   //Рендеринг нижней части карты
   this.map.drawLowerImage(this.ctx, cameraPerson);

   //Рендеринг всех игровых объектов
   Object.values(this.map.gameObjects).sort((a,b) => {
     return a.y - b.y;
   }).forEach(object => {
     object.sprite.draw(this.ctx, cameraPerson);
   })

   //Рендеринг верхней части карты
   this.map.drawUpperImage(this.ctx, cameraPerson);
 }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      // Остановка если пауза
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
      previousMs = timestampMs - delta * 1000; // Убедитесь, что мы не теряем необработанное (дельта) время.

      // Делать как обычный тик
      requestAnimationFrame(stepFn)
    }

    // Первый тик
    requestAnimationFrame(stepFn)
 }

 bindActionInput() {
   new KeyPressListener("Enter", () => {
     //Есть ли рядом (напротив игрока) объекта с которым можно взаимодействовать
     this.map.checkForActionCutscene()
   })
   new KeyPressListener("Escape", () => {
     if (!this.map.isCutscenePlaying) {
      this.map.startCutscene([//При нажатии на Esc будет открываться меню паузы и вся игра будет остановлена
        { type: "pause" }
      ])
     }
   })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Изменение позиции игрока
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

  //Создание трекера прогресса
  this.progress = new Progress();

  //Показ титульного экрана
  this.titleScreen = new TitleScreen({
    progress: this.progress
  })
  //const useSaveFile = await this.titleScreen.init(container);
   const useSaveFile = false;

  //Потенциальное сохрание и загрузка 
  let initialHeroState = null;
  if (useSaveFile) {
    this.progress.load();
    initialHeroState = {
      x: this.progress.startingHeroX,
      y: this.progress.startingHeroY,
      direction: this.progress.startingHeroDirection,
    }
  }

  //Загрузка HUD
  this.hud = new Hud();
  this.hud.init(container);

  //Старт с первой карты
  this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );

  //Создание контроллеров
  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  //Начало игры
  this.startGameLoop();


  // this.map.startCutscene([
  //   { type: "battle", enemyId: "beth" }
  //   // { type: "changeMap", map: "DemoRoom"}
  //   // { type: "textMessage", text: "This is the very first message!"}
  // ])

 }
}