// 펌프 손잡이 위치
let pumpHandleY = 480;

// 손잡이를 잡고 있는지
let pumpDragging = false;

// 터치 위치와 손잡이 중심의 차이
let pumpGrabOffsetY = 0;

// 풍선에 들어간 공기: 0부터 1까지
let pumpAir = 0;

// 화면에 보이는 풍선 크기
let pumpBalloonScale = 1;

// 풍선이 터졌는지
let pumpBalloonPopped = false;

// 다시 생성될 시간
let pumpRespawnAt = 0;

// 레벨 2 초기 설정
function setupLevel2() {
  pumpHandleY = 480;
  pumpDragging = false;
  pumpGrabOffsetY = 0;

  pumpAir = 0;
  pumpBalloonScale = 1;
  pumpBalloonPopped = false;
  pumpRespawnAt = 0;
}

// 레벨 2 화면
function drawLevel2() {
  updatePumpBalloon();

  // level1.js에 만든 배경을 함께 사용
  drawStage();

  drawPumpHose();
  drawPump();
  drawPumpBalloon();
}

// 펌프와 풍선을 연결하는 호스
function drawPumpHose() {
  push();

  noFill();
  stroke("#35232a");
  strokeWeight(9);
  strokeCap(ROUND);

  beginShape();
  vertex(285, 790);

  bezierVertex(360, 875);
  bezierVertex(570, 870);
  bezierVertex(555, 620);

  endShape();

  pop();
}

// 펌프
function drawPump() {
  push();
  noStroke();

  // 아래 받침
  fill("#253b78");
  rect(250, 830, 160, 24, 10);

  // 손잡이를 따라 길이가 바뀌는 막대
  // 아래 끝은 y = 650에 고정
  fill("#dce4eb");

  rect(250, (pumpHandleY + 650) / 2, 14, 650 - pumpHandleY, 5);

  // 파란 펌프 몸통
  fill("#3098f5");
  rect(250, 735, 70, 170, 15);

  // 몸통의 반짝이는 부분
  fill("#86d4ff");
  rect(232, 735, 12, 135, 6);

  // 움직이는 노란 손잡이
  fill("#ffdf36");
  rect(250, pumpHandleY, 135, 28, 12);

  pop();
}

function drawPumpBalloon() {
  // 터졌으면 그리지 않음
  if (pumpBalloonPopped) return;

  push();

  // 호스 끝을 기준으로 확대
  translate(555, 620);
  scale(pumpBalloonScale);
  translate(0, -60);

  fill("#ff5278");
//   stroke("#ffffff");
//   strokeWeight(3);

  // 매듭: 아래 끝이 호스에 닿도록
  triangle(0, 53, -8, 60, 8, 60);

  // 풍선 몸통
  ellipse(0, 0, 85, 110);

  // 반짝이는 부분
  noStroke();
  fill("#ffffff");
  rotate(radians(30));
  ellipse(-30, -15, 16, 33);

  pop();
}

// 화면 좌표를 800 × 1000 기준 좌표로 변환
function getLevel2Point(screenX, screenY) {
  const offsetX = (width - DESIGN_WIDTH * sceneScale) / 2;

  const offsetY = (height - DESIGN_HEIGHT * sceneScale) / 2;

  return {
    x: (screenX - offsetX) / sceneScale,
    y: (screenY - offsetY) / sceneScale,
  };
}

// 손잡이 잡기
function startPumpDrag(screenX, screenY) {
  const point = getLevel2Point(screenX, screenY);

  // 손잡이보다 조금 넓은 영역을 터치할 수 있게
  if (abs(point.x - 250) <= 80 && abs(point.y - pumpHandleY) <= 30) {
    pumpDragging = true;

    // 잡는 순간 손잡이가 튀지 않도록
    pumpGrabOffsetY = point.y - pumpHandleY;
  }
}

// 손잡이 움직이기
function movePumpDrag(screenX, screenY) {
  if (!pumpDragging) return;

  const point = getLevel2Point(screenX, screenY);

  // 움직이기 전 위치
  const previousY = pumpHandleY;

  pumpHandleY = constrain(
    point.y - pumpGrabOffsetY, 
    480, 
    635);

  // 아래로 움직인 거리만 계산
  const pressedDistance = max(
    0, 
    pumpHandleY - previousY);

  if (!pumpBalloonPopped) {
    pumpAir = constrain(
        pumpAir + pressedDistance / 930, 0, 1);
  }
}

// 손잡이 놓기
function stopPumpDrag() {
  pumpDragging = false;
}

// 풍선 크기와 재생성 관리
function updatePumpBalloon() {
  // 터진 뒤 3초가 지나면 다시 생성
  if (pumpBalloonPopped) {
    if (millis() >= pumpRespawnAt) {
      pumpAir = 0;
      pumpBalloonScale = 1;
      pumpBalloonPopped = false;
    }

    return;
  }

  // 공기량에 따라 1배 → 2.4배
  const targetScale = lerp(1, 2.4, pumpAir);

  // 부드럽게 커지기
  const smoothing = 1 - Math.exp(-min(deltaTime, 50) / 100);

  pumpBalloonScale = lerp(pumpBalloonScale, targetScale, smoothing);

  // 충분히 커지면 삭제
  if (pumpAir >= 1 && pumpBalloonScale >= 2.38) {
    pumpBalloonPopped = true;
    pumpRespawnAt = millis() + 3000;
  }
}
