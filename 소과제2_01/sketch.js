// 모든 레벨이 사용하는 기준 화면
const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 1000;

// 화면 배율
let sceneScale = 1;

// 처음 보여줄 레벨
let currentLevel = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1);
  rectMode(CENTER);
  ellipseMode(CENTER);
  angleMode(RADIANS);
  noStroke();

  setupLevel1();
  setupLevel2();
  setupLevel3();

  changeLevel(currentLevel);
}

function draw() {
  background("#1d0811");

  // 화면에 맞춰 같은 비율로 조절
  sceneScale = min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

  push();

  translate(
    (width - DESIGN_WIDTH * sceneScale) / 2,
    (height - DESIGN_HEIGHT * sceneScale) / 2,
  );

  scale(sceneScale);

  if (currentLevel === 1) {
    drawLevel1();
  } else if (currentLevel === 2) {
    drawLevel2();
  } else if (currentLevel === 3) {
    drawLevel3();
  }

  pop();
}

// 컴퓨터에서 클릭
function mousePressed() {
  if (currentLevel === 1) {
    selectBalloon(mouseX, mouseY);
  } else if (currentLevel === 2) {
    startPumpDrag(mouseX, mouseY);
  } else if (currentLevel === 3) {
    startWindDrag(mouseX, mouseY);
  }
}

// 컴퓨터에서 드래그
function mouseDragged() {
  if (currentLevel === 2) {
    movePumpDrag(mouseX, mouseY);
  } else if (currentLevel === 3) {
    moveWindDrag(mouseX, mouseY);
  }

  return false;
}

// 컴퓨터에서 놓기
function mouseReleased() {
  stopPumpDrag();
  stopWindDrag();
}

// 폰에서 터치
function touchStarted() {
  if (touches.length > 0) {
    const touchX = touches[0].x;
    const touchY = touches[0].y;

    if (currentLevel === 1) {
      selectBalloon(touchX, touchY);
    } else if (currentLevel === 2) {
      startPumpDrag(touchX, touchY);
    } else if (currentLevel === 3) {
      startWindDrag(touchX, touchY);
    }
  }

  return false;
}

// 폰에서 드래그
function touchMoved() {
  if (touches.length > 0) {
    const touchX = touches[0].x;
    const touchY = touches[0].y;

    if (currentLevel === 2) {
      movePumpDrag(touchX, touchY);
    } else if (currentLevel === 3) {
      moveWindDrag(touchX, touchY);
    }
  }

  return false;
}

// 폰에서 놓기
function touchEnded() {
  stopPumpDrag();
  stopWindDrag();

  return false;
}

// 화면 크기 변경
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 레벨 변경
function changeLevel(level) {
  stopPumpDrag();
  stopWindDrag();

  // 이전 레벨에서 만든 바람 초기화
  level3WindX = 0;
  level3WindY = 0;

  currentLevel = level;

  const buttons = document.querySelectorAll(".level-buttons button");

  buttons.forEach((button, index) => {
    const selected = index + 1 === level;

    button.classList.toggle("active", selected);

    button.setAttribute("aria-pressed", String(selected));
  });
}
