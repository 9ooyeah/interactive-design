// 레벨 1 풍선 배열
let balloons = [];

// 손의 현재 위치
let handX = 720;
let handY = 490;

// 손의 목표 위치
let handTargetX = 720;
let handTargetY = 490;

// 손 상태
let handState = "idle"; // idle, moving, returning
let selectedBalloon = null;

// 놀란 표정이 끝날 시간
let clownSurprisedUntil = 0;

// 레벨 1 준비
function setupLevel1() {
  balloons = [
    new Balloon("blue"),
    new Balloon("heart"),
    new Balloon("dog"),
  ];
}

// 레벨 1 화면
function drawLevel1() {
  updateNeedleHand();

  for (const balloon of balloons) {
    balloon.update();
  }

  drawStage();
  drawBalloonStrings();
  drawClown();

  for (const balloon of balloons) {
    balloon.display();
  }

  drawNeedleHand();
}

// 배경 무대
function drawStage() {
  // 뒤쪽 벽
  fill("#9c193f");
  rect(DESIGN_WIDTH / 2, 400, DESIGN_WIDTH, 800);

  // 밝은 부분
  fill("#aa2348");
  ellipse(360, 355, 600, 600);

  // 바닥
  fill("#d8ae78");
  rect(DESIGN_WIDTH / 2, 900, DESIGN_WIDTH, 300);

  // 벽과 바닥 사이
  fill("#573027");
  rect(DESIGN_WIDTH / 2, 730, DESIGN_WIDTH, 40);

  // 오른쪽 벽
  fill("#72102d");

  beginShape();
  vertex(720, 0);
  vertex(800, 0);
  vertex(800, 820);
  vertex(720, 750);
  endShape(CLOSE);
}

// 삐에로
function drawClown() {
  push();
  noStroke();

  // 다리
  fill("#3098f5");
  rect(205, 815, 44, 100, 12);
  rect(270, 815, 44, 100, 12);

  // 다리 줄무늬
  fill("#b9e9ff");
  rect(205, 810, 44, 10);
  rect(205, 835, 44, 10);
  rect(270, 810, 44, 10);
  rect(270, 835, 44, 10);

  // 신발 밑창
  fill("#9d2426");
  ellipse(190, 873, 105, 30);
  ellipse(285, 873, 105, 30);

  // 빨간 신발
  fill("#ef4136");
  ellipse(190, 860, 105, 48);
  ellipse(285, 860, 105, 48);

  // 왼쪽 팔
  fill("#ffdc36");

  beginShape();
  vertex(175, 590);

  // 어깨 → 팔꿈치
  bezierVertex(145, 595);
  bezierVertex(120, 630);
  bezierVertex(110, 665);

  // 팔꿈치 → 아래쪽
  bezierVertex(105, 680);
  bezierVertex(110, 700);
  bezierVertex(125, 720);

  // 손 쪽 곡선
  bezierVertex(165, 770);
  bezierVertex(170, 700);
  bezierVertex(155, 720);

  // 팔 안쪽 → 어깨
  bezierVertex(135, 680);
  bezierVertex(150, 645);
  bezierVertex(185, 630);

  vertex(175, 590);
  endShape(CLOSE);

  // 오른쪽 팔
  fill("#ffdc36");

  beginShape();
  vertex(285, 585);

  // 안쪽: 어깨 → 팔꿈치
  bezierVertex(310, 585);
  bezierVertex(340, 615);
  bezierVertex(360, 610);

  // 안쪽: 팔꿈치 → 손목
  bezierVertex(375, 606);
  bezierVertex(370, 585);
  bezierVertex(370, 570);

  // 소매 끝
  vertex(410, 570);

  // 바깥쪽: 손목 → 팔꿈치
  bezierVertex(418, 610);
  bezierVertex(410, 655);
  bezierVertex(370, 665);

  // 바깥쪽: 팔꿈치 → 몸통
  bezierVertex(335, 673);
  bezierVertex(305, 645);
  bezierVertex(285, 640);

  endShape(CLOSE);

  // 몸통
  fill("#ffdf36");
  ellipse(235, 670, 190, 240);

  // 단추
  fill("#ef4136");
  circle(235, 640, 28);
  circle(238, 685, 28);
  circle(241, 730, 28);

  // 왼쪽 머리카락
  fill("#ff991c");
  circle(100, 475, 65);
  circle(80, 510, 85);
  circle(105, 545, 70);

  // 오른쪽 머리카락
  circle(285, 435, 65);
  circle(320, 455, 85);
  circle(310, 495, 75);

  // 얼굴
  fill("#ffedcf");
  ellipse(205, 500, 170, 170);

  // 눈과 입
  push();

  noFill();
  stroke("#171710");
  strokeWeight(5);
  strokeCap(ROUND);

  const surprised = millis() < clownSurprisedUntil;

  // 왼쪽 눈
  push();
  translate(170, 495);
  rotate(radians(-15));

  if (surprised) {
    ellipse(0, 0, 17, 23);
  } else {
    arc(0, 0, 24, 25, PI, TWO_PI);
  }

  pop();

  // 오른쪽 눈
  push();
  translate(235, 478);
  rotate(radians(-15));

  if (surprised) {
    ellipse(0, 0, 17, 23);
  } else {
    arc(0, 0, 24, 25, PI, TWO_PI);
  }

  pop();

  // 입
  push();

  if (surprised) {
    translate(214, 530);
    rotate(radians(-15));
    ellipse(0, 0,18, 26);
  } else {
    translate(208, 508);
    rotate(radians(-15));
    arc(0, 0, 60, 50, 0.15, PI - 0.15);
  }

  pop();

  pop();

  // 빨간 코
  fill("#ef4136");
  circle(205, 503, 35);

  // 코 반사광
  fill("#fffbfc");
  circle(200, 500, 10);

  // 고깔모자
  fill("#3098f5");

  beginShape();
  vertex(170, 335);
  vertex(130, 460);
  vertex(250, 425);
  endShape(CLOSE);

  // 위쪽 줄무늬
  fill("#ffe13b");

  beginShape();
  vertex(162, 362);
  vertex(182, 349);
  vertex(197, 366);
  vertex(155, 386);
  endShape(CLOSE);

  // 가운데 줄무늬
  beginShape();
  vertex(147, 407);
  vertex(208, 378);
  vertex(224, 396);
  vertex(138, 434);
  endShape(CLOSE);

  // 아래쪽 줄무늬
  beginShape();
  vertex(135, 453);
  vertex(236, 410);
  vertex(254, 429);

  bezierVertex(225, 448);
  bezierVertex(165, 470);
  bezierVertex(130, 460);

  endShape(CLOSE);

  // 모자 방울
  fill("#ef4136");
  circle(166, 335, 48);

  // 목 장식
  fill("#fff5df");
  circle(170, 580, 45);
  circle(205, 595, 45);
  circle(245, 587, 45);
  circle(275, 565, 45);

  // 풍선 실을 잡는 손
  fill("#ffedcf");
  circle(390, 570, 52);

  pop();
}

// 풍선 실
function drawBalloonStrings() {
  push();

  noFill();
  stroke("#f5eadb");
  strokeWeight(3);

  for (const balloon of balloons) {
    // 삭제된 풍선의 실도 숨기기
    if (balloon.death) continue;

    if (balloon.type === "blue") {
      beginShape();
      vertex(380, 570);

      bezierVertex(440, 450);
      bezierVertex(322, 385);
      bezierVertex(322, 290);

      endShape();
    } else if (balloon.type === "heart") {
      beginShape();
      vertex(385, 570);

      bezierVertex(440, 440);
      bezierVertex(480, 320);
      bezierVertex(480, 225);

      endShape();
    } else if (balloon.type === "dog") {
      beginShape();
      vertex(390, 570);

      bezierVertex(420, 530);
      bezierVertex(480, 480);
      bezierVertex(500, 440);

      endShape();
    }
  }

  pop();
}

// 파란 풍선
function drawBalloons(g, showOutline) {
  g.push();

  g.translate(310, 225);
  g.rotate(radians(-10));

  g.fill("#30a9f5");

  if (showOutline) {
    g.stroke("#ffffff");
  } else {
    g.noStroke();
  }

  g.strokeWeight(3);

  // 매듭
  g.triangle(0, 60, -7, 74, 7, 74);

  // 몸통
  g.ellipse(0, 0, 100, 125);

  // 반사광
  g.noStroke();
  g.fill("#ffffff");
  g.rotate(radians(30));
  g.ellipse(-30, -15, 17, 28);

  g.pop();
}

// 하트 풍선
function drawHeartBalloon(g, showOutline) {
  g.push();

  g.translate(480, 160);
  g.fill("#ff5278");

  if (showOutline) {
    g.stroke("#ffffff");
  } else {
    g.noStroke();
  }

  g.strokeWeight(3);

  // 매듭
  g.triangle(0, 65, -8, 79, 8, 79);

  // 몸통
  g.beginShape();
  g.vertex(0, -30);

  // 오른쪽 위
  g.bezierVertex(35, -85);
  g.bezierVertex(100, -40);
  g.bezierVertex(70, 15);

  // 오른쪽 → 아래
  g.bezierVertex(55, 45);
  g.bezierVertex(20, 60);
  g.bezierVertex(0, 68);

  // 아래 → 왼쪽
  g.bezierVertex(-20, 60);
  g.bezierVertex(-55, 45);
  g.bezierVertex(-70, 15);

  // 왼쪽 위
  g.bezierVertex(-100, -40);
  g.bezierVertex(-35, -85);
  g.bezierVertex(0, -30);

  g.endShape(CLOSE);

  // 반사광
  g.noStroke();
  g.fill("#ffffff");
  g.circle(-47, 5, 10);
  g.rotate(radians(30));
  g.ellipse(-50, 0, 22, 28);

  g.pop();
}

// 강아지 풍선
function drawDogBalloon(g, showOutline) {
  g.push();

  g.translate(580, 380);
  g.rotate(radians(20));
  g.scale(0.8);

  g.fill("#ff6e07");

  if (showOutline) {
    g.stroke("#ffffff");
  } else {
    g.noStroke();
  }

  g.strokeWeight(3);

  // 꼬리 막대
  g.push();

  if (showOutline) {
    g.stroke("#ffffff");
    g.strokeWeight(17);
    g.line(50, -8, 88, -77);
  }

  g.stroke("#ff6e07");
  g.strokeWeight(11);
  g.line(50, -8, 88, -77);

  g.pop();

  // 뒤쪽 귀
  g.push();
  g.translate(-90, -98);
  g.rotate(radians(0));
  g.ellipse(0, 0, 44, 105);
  g.pop();

  // 뒤쪽 앞다리
  g.push();
  g.translate(-48, 64);
  g.rotate(radians(24));
  g.ellipse(0, 0, 49, 111);
  g.pop();

  // 뒤쪽 뒷다리
  g.push();
  g.translate(56, 52);
  g.rotate(radians(-28));
  g.ellipse(0, 0, 48, 104);
  g.pop();

  // 목
  g.push();
  g.translate(-65, -45);
  g.rotate(radians(-25));
  g.ellipse(0, 10, 20, 100);
  g.pop();

  // 몸통
  g.ellipse(0, 0, 119, 61);

  // 앞쪽 앞다리
  g.push();
  g.translate(-36, 68);
  g.rotate(radians(24));

  g.ellipse(0, 0, 53, 115);

  // 앞다리 반사광
  g.noFill();
  g.stroke("#fffde9");
  g.strokeWeight(6);

  g.beginShape();
  g.vertex(-10, -38);
  g.bezierVertex(-17, -32);
  g.bezierVertex(-17, -15);
  g.bezierVertex(-14, -5);
  g.endShape();

  g.pop();

  // 앞쪽 뒷다리
  g.push();
  g.translate(66, 55);
  g.rotate(radians(-28));

  g.ellipse(0, 0, 53, 109);

  // 뒷다리 반사광
  g.noFill();
  g.stroke("#fffde9");
  g.strokeWeight(6);

  g.beginShape();
  g.vertex(-10, -37);
  g.bezierVertex(-19, -28);
  g.bezierVertex(-19, -10);
  g.bezierVertex(-15, 0);
  g.endShape();

  g.pop();

  // 앞쪽 귀
  g.push();
  g.translate(-60, -110);
  g.rotate(radians(18));

  g.ellipse(0, 0, 55, 111);

  // 귀 반사광
  g.noFill();
  g.stroke("#fffde9");
  g.strokeWeight(6);

  g.beginShape();
  g.vertex(-8, -39);
  g.bezierVertex(-14, -35);
  g.bezierVertex(-16, -24);
  g.bezierVertex(-14, -12);
  g.endShape();

  g.pop();

  // 主둥이 끝 매듭
  g.triangle(-153, -73, -155, -59, -135, -61);

  // 주둥이
  g.push();
  g.translate(-125, -59);
  g.rotate(radians(10));

  g.ellipse(0, 0, 85, 60);

  // 주둥이 반사광
  g.fill("#ffffff");
  g.noStroke();
  g.rotate(radians(-45));
  g.ellipse(-10, -20, 22, 16);

  g.pop();

  // 꼬리 끝
  g.push();
  g.translate(95, -88);
  g.rotate(radians(30));

  g.ellipse(0, 0, 42, 48);

  // 꼬리 반사광
  g.fill("#ffffff");
  g.noStroke();
  g.circle(-10, 0, 13);

  g.pop();

  g.pop();
}

// 바늘 손과 늘어나는 팔
function drawNeedleHand() {
  push();
  noStroke();

  // 벽 쪽 끝은 고정, 손 쪽 끝은 이동
  fill("#3478df");

  beginShape();
  vertex(handX - 35, handY - 12);
  vertex(800, 538);
  vertex(800, 610);
  vertex(handX - 55, handY + 18);
  endShape(CLOSE);

  // 손과 바늘
  translate(handX, handY);

  fill("#ffcca0");
  circle(-50, 0, 60);

  fill("#cbd0d3");

  beginShape();
  vertex(-58, -3);
  vertex(-120, -12);
  vertex(-125, -10);
  vertex(-61, 4);
  endShape(CLOSE);

  pop();

  // 팔 끝을 벽으로 가리기
  push();
  noStroke();
  fill("#72102d");
  rect(760, 375, 80, 750);
  pop();
}

// 풍선 선택
function selectBalloon(screenX, screenY) {
  if (handState !== "idle") return;

  // 화면 좌표 → 기준 그림 좌표
  const offsetX =
    (width - DESIGN_WIDTH * sceneScale) / 2;

  const offsetY =
    (height - DESIGN_HEIGHT * sceneScale) / 2;

  const x = (screenX - offsetX) / sceneScale;
  const y = (screenY - offsetY) / sceneScale;

  for (let i = balloons.length - 1; i >= 0; i--) {
    if (balloons[i].contains(x, y)) {
      selectedBalloon = balloons[i];

      let balloonX;
      let balloonY;

      if (selectedBalloon.type === "blue") {
        balloonX = 310;
        balloonY = 225;
      } else if (selectedBalloon.type === "heart") {
        balloonX = 480;
        balloonY = 160;
      } else {
        balloonX = 580;
        balloonY = 380;
      }

      // 바늘 끝을 풍선 중심에 맞추기
      handTargetX = balloonX + 125;
      handTargetY = balloonY + 10;

      handState = "moving";
      break;
    }
  }
}

// 손 이동
function updateNeedleHand() {
  if (handState === "idle") return;

  const dx = handTargetX - handX;
  const dy = handTargetY - handY;
  const distance = Math.hypot(dx, dy);

  // 초당 이동 거리
  const step = (650 * min(deltaTime, 50)) / 1000;

  if (distance <= step) {
    handX = handTargetX;
    handY = handTargetY;

    if (handState === "moving") {
      selectedBalloon.pop();
      selectedBalloon = null;

      // 원래 위치로 복귀
      handTargetX = 720;
      handTargetY = 490;
      handState = "returning";
    } else {
      handState = "idle";
    }
  } else {
    handX += (dx / distance) * step;
    handY += (dy / distance) * step;
  }
}