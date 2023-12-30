class RevealingText {
  constructor(config) {
    this.element = config.element;//получение элемента
    this.text = config.text;//Сам текст
    this.speed = config.speed || 60;//Скорость печати

    this.timeout = null;
    this.isDone = false;
  }

  revealOneCharacter(list) {
    const next = list.splice(0,1)[0]; // У разделенного текста берется первый символ...
    next.span.classList.add("revealed");//и добавляется к нему класс revealed...

    if (list.length > 0) {
      this.timeout = setTimeout(() => {
        this.revealOneCharacter(list)//функция заного вызывает себя спустя какое то время(60 мс)
      }, next.delayAfter)
    } else {
      this.isDone = true;
    }
  }
  
  warpToDone() {//Если пользователь захочет закончить "эффект печатающей машинки", ему достаточно нажать Enter
    clearTimeout(this.timeout);
    this.isDone = true;
    this.element.querySelectorAll("span").forEach(s => {
      s.classList.add("revealed");
    })
  }

  init() {
    let characters = [];
    this.text.split("").forEach(character => {

      //Создание каждого span и добавление его в дерево DOM
      let span = document.createElement("span");
      span.textContent = character;
      this.element.appendChild(span);

      //Добавьте этот диапазон в наш массив внутреннего состояния
      characters.push({
        span,
        delayAfter: character === " " ? 0 : this.speed         
      })
    })

    this.revealOneCharacter(characters);

  }

}