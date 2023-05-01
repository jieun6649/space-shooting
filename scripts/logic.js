//캔버스 세팅
let canvas;
let ctx;
//캔버스 만들어서 변수에 저장
canvas = document.createElement("canvas");
ctx = canvas.getContext("2d"); //ctx : 최종적으로 그려주는 역할
//캔버스 사이즈 정하기
canvas.width = 900; //가로
canvas.height = 1000; //높이

//만든 canvas를 html에 넣기
document.body.appendChild(canvas);

let backgroundImage, spaceshipImage, bulletImage, enemyImage, gameOverImage;
let gameOver = false; //true이면 게임이 끝남, false이면 게임이 안끝남
let score = 0;
//파워-업 아이템 속성 설정
let powerUpX = Math.floor(Math.random() * canvas.width);
let powerUpY = 0;
let powerUpSize = 20;
let powerUpSpeed = 2;
let powerUpActive = false;
let powerUpDuration = 5; // seconds

//우주선 좌표
let spaceshipX = canvas.width / 2 - 30;
let spaceshipY = canvas.height - 60;
let spaceshipPowerHistory = {};

//총알들을 저장하는 list
let bulletJson = {};

//총알의 좌표
function Bullet() {
  //나중에 function대신 class를 사용할 수 있다.
  this.x = 0; //Bullet의 함수에 속하는 친구 this
  this.y = 0;
  this.init = function () {
    //init -> 함수를 초기화
    this.x = spaceshipX + 20;
    this.y = spaceshipY;
    this.alive = true; //총알의 상태 true면 살아있는 총알 false면 죽은 총알
    this.id = String(Math.random());
    bulletJson[this.id] = this;
  };

  this.update = function () {
    this.y -= 20;
    if (this.y <= 0) {
      this.alive = false;
      delete bulletJson[this.id];
    }
  };

  this.checkHit = function () {
    for (let i = 0; i < enemyList.length; i++) {
      if (
        this.y <= enemyList[i].y &&
        this.x >= enemyList[i].x &&
        this.x <= enemyList[i].x + 40
      ) {
        //총알이 죽게됨, 적군의 우주선이 없어짐, 점수 획득
        score++;

        // 적군의 우저선을 격추시키면 아이템 드랍
        // 다음 조건문을 추가하는 것으로 아이템 드랍 확률 조정 가능
        // if (Math.random() < 0.1) { // 적군의 우주선을 격추시켰을 때, 10% 확률로 아이템 획득
        createItem(enemyList[i].x, enemyList[i].y);
        console.log("아이템 드랍!");

        this.alive = false; //죽은 총알
        enemyList.splice(i, 1); //i번째값 1개를 잘라내자
      }
    }
  };
}

function generateRandomValue(min, max) {
  //최대값과 최소값을 지켜주겠니~~
  let randomNum = Math.floor(Math.random() * (max - min + 1)) + min; // (0~1)까지의 랜덤한 숫자를 반환
  return randomNum;
}

let enemyList = [];
//적군 만들기
function Enemy() {
  this.x = 0;
  this.y = 0;
  this.init = function () {
    this.y = 0; //최상단에서부터 시작하기
    this.x = generateRandomValue(0, canvas.width - 64);
    //적군의 위치는 랜덤하게 떨어진다. x값은 canvas.width - 우주선의 넓이
    enemyList.push(this);
  };
  this.update = function () {
    this.y += 4; //적군의 속도 조절

    if (this.y >= canvas.height - 64) {
      gameOver = true;
      console.log("gameOver");
    }
  };
}

let itemJson = {};
//아이템 만들기
function Item() {
  this.x = 0;
  this.y = 0;
  this.init = function () {
    this.x = generateRandomValue(0, canvas.width - 48);
    this.y = 0;
    this.id = String(Math.random());
    itemJson[this.id] = this;
  };
  this.update = function () {
    this.y += 2; //아이템 속도 조절
    if (this.y >= canvas.height) {
      this.alive = false;
      delete itemJson[this.id];
    }
  };

  this.checkHit = function () {
    if (
      this.y >= spaceshipY &&
      this.x >= spaceshipX &&
      this.x <= spaceshipX + 40
    ) {
      //우주선의 파워가 1 증가함
      delete itemJson[this.id];
      this.alive = false;

      // 10초동안 파워업 시키기 위해서 지금부터 10초 후로 파워가 사라질 시간 지정
      spaceshipPowerHistory[this.id] = Math.round(Date.now() / 1000 + 10);
    }
  };
}

//필살기 바꾸기

function loadImage() {
  backgroundImage = new Image(); //배경화면 이미지
  backgroundImage.src = "./images/게임배경화면3.png";

  spaceshipImage = new Image();
  spaceshipImage.src = "./images/제트기.png";

  bulletImage = new Image();
  bulletImage.src = "./images/bulletImg.png";

  enemyImage = new Image();
  enemyImage.src = "./images/enemy2.png";

  itemImage = new Image();
  itemImage.src = "./images/power.png";

  gameOverImage = new Image();
  gameOverImage.src = "./images/gameover.png";

  powerUpImage = new Image();
  powerUpImage.src = "./images/twinBullet.png";
}

//클릭한 버튼을 저장할 공간을 만들것, 버튼을 떼는 순간 삭제하게 만들것
let keysDown = {};
function setKeyboardListener() {
  //키가 눌릴때
  document.addEventListener("keydown", function (event) {
    // 		console.log("무슨 키가 눌렸어?", event.keyCode)
    // 	    오른쪽키 => 39 .. 왼쪽 키 => 37 ..
    keysDown[event.keyCode] = true;
    console.log("키 다운 객체에 들어간 값은? ", keysDown);
  });

  document.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
    console.log("키 다운 객체에 들어간 값은? ", keysDown);

    //스페이스바 = 32
    if (event.keyCode == 32) {
      powerSize = Object.keys(spaceshipPowerHistory).length + 1;
      for (let i = 0; i < powerSize; i++) {
        createBullet(i * 20 - (powerSize - 1) * 10); //총알 생성
      }
    }
  });
}

// 총알 만들기
function createBullet(xDiff) {
  console.log("총알생성!");
  let b = new Bullet(); // 함수 Bullet을 한개 더 만든다.
  b.init();
  // 총알을 여러 개 발사하면 우주선을 중심으로 대칭을 이뤄야 하는데
  // 이를 위해서 우주선의 xDiff 만큼 옆에 만듭니다.
  b.x += xDiff;

  console.log("새로운 총알 리스트", bulletJson);
}

//적군 만들기
function createEnemy() {
  const interval = setInterval(function () {
    let e = new Enemy(); //적군을 하나 만들겠다.
    e.init();
  }, 1000);
  //setInterval(호출하고싶은 함수, 시간(밀리세컨즈 1s = 1000ms))//원하는 시간마다 원하는 함수를 호출
  //1초 -> 1000
}

// 주어진 x, y 좌표에 아이템 만들기
function createItem(x, y) {
  console.log("아이템 생성!");
  let item = new Item();
  item.init();
  item.x = x;
  item.y = y;
}

//값을 update시켜주는 부분
function update() {
  if (39 in keysDown) {
    spaceshipX += 7;
    //right
  }
  if (37 in keysDown) {
    spaceshipX -= 7;
    //left
  }

  //우주선의 좌표값이 무한대로 업데이트가 되는게 아닌! 경기장 안에서만 있게 하려면??
  //리미트를 정한다??
  //if문을써서 canvas의 너비와 높이안에서만 이동하도록 한다.??
  //x의 최솟값은 0 x의 최댓값은 1000
  if (spaceshipX <= 0) {
    spaceshipX = 0;
  }
  if (spaceshipX >= canvas.width - 60) {
    spaceshipX = canvas.width - 60;
  }

  //총알의 y좌표 업데이트하는 함수 호출
  for (let bulletID in bulletJson) {
    let bullet = bulletJson[bulletID];
    if (bullet.alive) {
      bullet.update();
      bullet.checkHit();
    }
  }

  //적군의 y좌표 업데이트하는 함수 호출
  for (let i = 0; i < enemyList.length; i++) {
    enemyList[i].update();
  }

  //아이템 y좌표 업데이트하는 함수 호출
  for (let itemID in itemJson) {
    let item = itemJson[itemID];
    item.update();
    item.checkHit();
  }
}

//이미지 보여주기
function render() {
  //배경화면 그려주기
  //drawImage(image, dx, dy, dWidth, dHeight)
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  //비행선 그려주기
  ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY);
  //score 그려주기
  ctx.fillText("Score: " + score, 20, 20); //score는 이미지가아니기때문에, ${score}는 저장된 변수값
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  //총알 그려주기
  for (let bulletID in bulletJson) {
    let bullet = bulletJson[bulletID];
    if (bullet.alive) {
      ctx.drawImage(bulletImage, bullet.x, bullet.y);
    }
  }
  //적군 그려주기
  for (let j = 0; j < enemyList.length; j++) {
    ctx.drawImage(enemyImage, enemyList[j].x, enemyList[j].y);
  }
  //아이템 그려주기
  for (let itemID in itemJson) {
    let item = itemJson[itemID];
    ctx.drawImage(itemImage, item.x, item.y);
  }

  for (let powerID in spaceshipPowerHistory) {
    let powerDeadline = spaceshipPowerHistory[powerID];
    if (Math.round(Date.now() / 1000) >= powerDeadline) {
      delete spaceshipPowerHistory[powerID];
    }
  }
}

function main() {
  if (!gameOver) {
    update(); //1.좌표값을 업데이트하고
    render(); //2.그려주고...          이 과정을 미친듯이 호출해야함..ㅎ
    console.log("animation calls main function");

    requestAnimationFrame(main);
  } else {
    ctx.drawImage(gameOverImage, 200, 200, 480, 380);
  }
}

//웹사이트 시작하면 아래 함수 호출
loadImage();
setKeyboardListener();
createEnemy();
main();
