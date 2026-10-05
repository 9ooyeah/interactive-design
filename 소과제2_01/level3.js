// 물리엔진과 풍선
let level3Engine;
let collisionBalloons = [];

// 실제 바람
let level3WindX = 0;
let level3WindY = 0;

// 드래그 상태
let windDragging = false;
let previousWindPoint = null;
let previousWindTime = 0;

// 바람 방향과 기본 세기
let windDirectionX = 0;
let windDirectionY = 0;
let windBaseStrength = 0;

// 누르는 동안 바람 강화
let windChargeStartedAt = 0;
let windHasDirection = false;

// 바람 선
let windStreaks = [];
let lastWindStreakAt = 0;
let windVisualPoint = { x: 400, y: 450 };

// 다음 라운드 시작 시간
let level3RestartAt = 0;

// 바람 조절
const WIND_MAX_STRENGTH = 0.00035;
const WIND_CHARGE_SECONDS = 2.5;

// 풍선 크기 조절
const BALLOON_MIN_RADIUS = 30;
const BALLOON_MAX_RADIUS = 45;

// 초기 설정 / 새 라운드 시작
function setupLevel3() {
  // 이전 물리엔진 정리
  if (level3Engine) {
    Matter.Events.off(level3Engine);
    Matter.Composite.clear(level3Engine.world, false);
    Matter.Engine.clear(level3Engine);
  }

  level3RestartAt = 0;

  windDragging = false;
  previousWindPoint = null;
  previousWindTime = 0;

  level3WindX = 0;
  level3WindY = 0;

  windDirectionX = 0;
  windDirectionY = 0;
  windBaseStrength = 0;
  windHasDirection = false;
  windChargeStartedAt = 0;

  windStreaks = [];
  lastWindStreakAt = 0;

  level3Engine = Matter.Engine.create();

  level3Engine.gravity.x = 0;
  level3Engine.gravity.y = 0;

  // 보이지 않는 벽
  const walls = [
    Matter.Bodies.rectangle(400, 120, 800, 20, {
      isStatic: true,
    }),

    Matter.Bodies.rectangle(400, 800, 800, 20, {
      isStatic: true,
    }),

    Matter.Bodies.rectangle(10, 460, 20, 680, {
      isStatic: true,
    }),

    Matter.Bodies.rectangle(790, 460, 20, 680, {
      isStatic: true,
    }),
  ];

  Matter.Composite.add(level3Engine.world, walls);

  // 전부 짝을 맞출 수 있도록 짝수 개 생성
  const balloonCount = random([12, 14, 16, 18, 20]);

  // 색 종류 3~5개
  const colorCount = floor(random(3, 6));

  const availableColors = shuffle([
    "pink",
    "blue",
    "yellow",
    "purple",
    "orange",
  ]);

  const selectedColors = availableColors.slice(0, colorCount);

  // 같은 색을 두 개씩 추가
  const colors = [];

  for (let pair = 0; pair < balloonCount / 2; pair++) {
    const colorName =
      pair < colorCount ? selectedColors[pair] : random(selectedColors);

    colors.push(colorName, colorName);
  }

  // 겹치지 않는 랜덤 위치 찾기
  let positions = [];

  for (let layoutAttempt = 0; layoutAttempt < 40; layoutAttempt++) {
    const candidates = [];

    for (let i = 0; i < balloonCount; i++) {
      let found = false;

      for (let attempt = 0; attempt < 500; attempt++) {
        const x = random(90, 710);
        const y = random(190, 720);

        const hasSpace = candidates.every(
          (position) => dist(x, y, position.x, position.y) > 115,
        );

        if (hasSpace) {
          candidates.push({ x, y });
          found = true;
          break;
        }
      }

      if (!found) break;
    }

    if (candidates.length === balloonCount) {
      positions = candidates;
      break;
    }
  }

  // 빈자리를 못 찾았을 때 사용할 안전한 배치
  if (positions.length !== balloonCount) {
    const slots = [];

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 4; column++) {
        slots.push({
          x: 110 + column * 190 + random(-25, 25),
          y: 200 + row * 125 + random(-4, 4),
        });
      }
    }

    positions = shuffle(slots).slice(0, balloonCount);
  }

  const shuffledColors = shuffle(colors);

  collisionBalloons = positions.map(
    (position, index) =>
      new CollisionBalloon(position.x, position.y, shuffledColors[index]),
  );

  // 처음의 약한 움직임
  for (const balloon of collisionBalloons) {
    Matter.Body.setVelocity(balloon.body, {
      x: random(-0.6, 0.6),
      y: random(-0.6, 0.6),
    });
  }

  Matter.Events.on(level3Engine, "collisionStart", checkWindBalloonCollision);
}

// 레벨 3 화면
function drawLevel3() {
  const time = millis() * 0.001;
  const frameMilliseconds = min(deltaTime, 50);

  // 드래그 후 계속 누르면 바람 강화
  if (windDragging && windHasDirection) {
    const heldSeconds = (millis() - windChargeStartedAt) / 1000;

    const charge = constrain(heldSeconds / WIND_CHARGE_SECONDS, 0, 1);

    const strength = lerp(windBaseStrength, WIND_MAX_STRENGTH, charge);

    const targetX = windDirectionX * strength;
    const targetY = windDirectionY * strength;

    const smoothing = 1 - Math.exp(-frameMilliseconds / 100);

    level3WindX = lerp(level3WindX, targetX, smoothing);

    level3WindY = lerp(level3WindY, targetY, smoothing);

    // 손을 멈춰도 바람 선은 계속 생성
    if (millis() - lastWindStreakAt >= 40) {
      createWindStreaks(charge);
      lastWindStreakAt = millis();
    }
  } else {
    // 손을 떼면 바람 약해짐
    const decay = Math.exp(-frameMilliseconds / 350);

    level3WindX *= decay;
    level3WindY *= decay;
  }

  // 평소 공기 흐름 + 드래그 바람
  for (const balloon of collisionBalloons) {
    if (balloon.death) continue;

    const body = balloon.body;

    const windX =
      sin(time * 0.7 + balloon.windPhase) * 0.000008 +
      level3WindX * balloon.windResponse;

    const windY =
      cos(time * 0.55 + balloon.windPhase) * 0.00001 +
      level3WindY * balloon.windResponse;

    Matter.Body.applyForce(body, body.position, {
      x: body.mass * windX,
      y: body.mass * windY,
    });
  }

  Matter.Engine.update(level3Engine, min(deltaTime, 1000 / 30));

  // 터진 풍선 삭제
  for (let i = collisionBalloons.length - 1; i >= 0; i--) {
    const balloon = collisionBalloons[i];

    if (balloon.death) {
      Matter.Composite.remove(level3Engine.world, balloon.body);

      collisionBalloons.splice(i, 1);
    }
  }

  // 모두 터뜨리면 5초 뒤 재시작
  if (collisionBalloons.length === 0) {
    if (level3RestartAt === 0) {
      level3RestartAt = millis() + 5000;

      stopWindDrag();

      level3WindX = 0;
      level3WindY = 0;
      windStreaks = [];
    }

    if (millis() >= level3RestartAt) {
      setupLevel3();
    }
  }

  drawSkyBackground();
  drawWindStreaks();

  for (const balloon of collisionBalloons) {
    balloon.display();
  }

  drawLevel3Guide();
}

// 풍선 클래스
class CollisionBalloon {
  constructor(x, y, colorName) {
    this.colorName = colorName;
    this.death = false;

    // 랜덤 크기
    this.r = random(BALLOON_MIN_RADIUS, BALLOON_MAX_RADIUS);

    this.balloonHeight = this.r * 2.4;

    // 바람 반응 차이
    this.windResponse = random(0.7, 1.4);
    this.windPhase = random(TWO_PI);

    const colors = {
      pink: "#ff5278",
      blue: "#30a9f5",
      yellow: "#ffdf36",
      purple: "#a878f5",
      orange: "#ff943e",
    };

    this.fillColor = colors[colorName];

    this.body = Matter.Bodies.circle(x, y, this.r, {
      restitution: 0.9,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.015,
      density: 0.001,
    });

    // 충돌 범위도 길쭉하게
    Matter.Body.scale(this.body, 1, this.balloonHeight / (this.r * 2));

    Matter.Composite.add(level3Engine.world, this.body);
  }

  display() {
    if (this.death) return;

    const position = this.body.position;
    const bottomY = this.balloonHeight / 2;

    push();

    translate(position.x, position.y);
    rotate(this.body.angle);

    fill(this.fillColor);
    stroke("#ffffff");
    strokeWeight(3);

    // 매듭
    triangle(
      0,
      bottomY - 3,
      -this.r * 0.15,
      bottomY + this.r * 0.2,
      this.r * 0.15,
      bottomY + this.r * 0.2,
    );

    // 몸통
    ellipse(0, 0, this.r * 2, this.balloonHeight);

    // 반사광
    push();

    translate(-this.r * 0.36, -this.balloonHeight * 0.23);

    rotate(radians(25));

    noStroke();
    fill("#ffffff");

    ellipse(0, 0, this.r * 0.3, this.r * 0.5);

    pop();
    pop();
  }
}

// 같은 색 충돌 확인
function checkWindBalloonCollision(event) {
  for (const pair of event.pairs) {
    const balloonA = collisionBalloons.find(
      (balloon) => balloon.body === pair.bodyA,
    );

    const balloonB = collisionBalloons.find(
      (balloon) => balloon.body === pair.bodyB,
    );

    // 벽과의 충돌 제외
    if (!balloonA || !balloonB) continue;

    if (balloonA.death || balloonB.death) continue;

    // 다른 색이면 튕기기만 함
    if (balloonA.colorName !== balloonB.colorName) {
      continue;
    }

    balloonA.death = true;
    balloonB.death = true;
  }
}

// 하늘 배경
function drawSkyBackground() {
  push();
  noStroke();

  const gradient = drawingContext.createLinearGradient(0, 0, 0, DESIGN_HEIGHT);

  gradient.addColorStop(0, "#68b9f0");
  gradient.addColorStop(1, "#d5efff");

  drawingContext.save();
  drawingContext.fillStyle = gradient;

  drawingContext.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  drawingContext.restore();

  const time = millis() * 0.001;

  drawSkyCloud(150 + sin(time * 0.2) * 25, 200 + sin(time * 0.3) * 8, 1.1);

  drawSkyCloud(
    580 + sin(time * 0.16 + 1) * 30,
    340 + sin(time * 0.25 + 1) * 10,
    1.5,
  );

  drawSkyCloud(
    230 + sin(time * 0.23 + 2) * 35,
    590 + sin(time * 0.35 + 2) * 8,
    0.9,
  );

  drawSkyCloud(
    590 + sin(time * 0.18 + 3) * 30,
    790 + sin(time * 0.3 + 3) * 10,
    1.25,
  );

  pop();
}

// 구름
function drawSkyCloud(x, y, cloudScale) {
  push();

  translate(x, y);
  scale(cloudScale);

  noStroke();
  fill("#ffffff");

  ellipse(0, 12, 180, 55);
  circle(-55, 0, 65);
  circle(-12, -22, 90);
  circle(40, -8, 75);

  pop();
}

// 바람 선 생성
function createWindStreaks(charge) {
  const count = charge > 0.5 ? 5 : 3;

  for (let i = 0; i < count; i++) {
    windStreaks.push({
      x: windVisualPoint.x + random(-110, 110),
      y: windVisualPoint.y + random(-110, 110),

      directionX: windDirectionX,
      directionY: windDirectionY,

      speed: random(650, 950) * (1 + charge * 0.6),
      length: random(35, 75) * (1 + charge * 0.5),

      createdAt: millis(),
      lifetime: random(350, 550),
    });
  }

  if (windStreaks.length > 150) {
    windStreaks.splice(0, windStreaks.length - 150);
  }
}

// 바람 선 그리기
function drawWindStreaks() {
  const now = millis();
  const seconds = min(deltaTime, 50) / 1000;

  push();

  noFill();
  strokeWeight(3);
  strokeCap(ROUND);

  drawingContext.save();
  drawingContext.beginPath();

  drawingContext.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  drawingContext.clip();

  for (let i = windStreaks.length - 1; i >= 0; i--) {
    const streak = windStreaks[i];

    const progress = (now - streak.createdAt) / streak.lifetime;

    if (progress >= 1) {
      windStreaks.splice(i, 1);
      continue;
    }

    streak.x += streak.directionX * streak.speed * seconds;

    streak.y += streak.directionY * streak.speed * seconds;

    stroke(255, 255, 255, 210 * (1 - progress));

    line(
      streak.x,
      streak.y,
      streak.x - streak.directionX * streak.length,
      streak.y - streak.directionY * streak.length,
    );
  }

  drawingContext.restore();
  pop();
}

// 안내와 카운트다운
function drawLevel3Guide() {
  push();

  noStroke();
  fill("#24577a");
  textAlign(CENTER, CENTER);

  textSize(17);
  text("같은 색 풍선끼리 닿으면 POP!", 400, 95);

  // 완료 후 카운트다운
  if (collisionBalloons.length === 0 && level3RestartAt > 0) {
    const remaining = constrain(
      ceil((level3RestartAt - millis()) / 1000),
      1,
      5,
    );

    textSize(28);
    text("모두 터뜨렸어!", 400, 380);

    textSize(90);
    text(remaining, 400, 480);

    textSize(18);
    text("잠시 후 다시 시작해요", 400, 560);
  } else {
    textSize(21);
    text("화면을 쓸어 바람 방향을 정해봐!", 400, 855);

    textSize(16);
    text("그대로 누르고 있으면 바람이 더 강해져요", 400, 890);

    // 바람 세기 표시
    if (windDragging && windHasDirection) {
      const strength = Math.hypot(level3WindX, level3WindY);

      const amount = constrain(strength / WIND_MAX_STRENGTH, 0, 1);

      rectMode(CORNER);

      fill("#ffffff");
      rect(280, 925, 240, 10, 5);

      fill("#24577a");
      rect(280, 925, 240 * amount, 10, 5);
    }
  }

  pop();
}

// 화면 좌표 → 기준 좌표
function getLevel3Point(screenX, screenY) {
  const offsetX = (width - DESIGN_WIDTH * sceneScale) / 2;

  const offsetY = (height - DESIGN_HEIGHT * sceneScale) / 2;

  return {
    x: (screenX - offsetX) / sceneScale,
    y: (screenY - offsetY) / sceneScale,
  };
}

// 누르면 드래그 시작
function startWindDrag(screenX, screenY) {
  // 카운트다운 중에는 조작하지 않음
  if (level3RestartAt > 0) return;
  if (windDragging) return;

  const point = getLevel3Point(screenX, screenY);

  if (point.x < 20 || point.x > 780 || point.y < 130 || point.y > 790) {
    return;
  }

  windDragging = true;
  windHasDirection = false;
  windBaseStrength = 0;

  previousWindPoint = point;
  previousWindTime = millis();

  windVisualPoint = {
    x: point.x,
    y: point.y,
  };
}

// 드래그 방향으로 바람 생성
function moveWindDrag(screenX, screenY) {
  if (!windDragging || !previousWindPoint) return;

  const point = getLevel3Point(screenX, screenY);
  const now = millis();

  const dx = point.x - previousWindPoint.x;
  const dy = point.y - previousWindPoint.y;
  const distance = Math.hypot(dx, dy);

  // 작은 손 떨림 제외
  if (distance < 2) return;

  const elapsed = max(now - previousWindTime, 1);

  const speed = (distance / elapsed) * 1000;

  windDirectionX = dx / distance;
  windDirectionY = dy / distance;

  windBaseStrength = constrain(speed * 0.00000014, 0.000035, 0.0002);

  if (!windHasDirection) {
    windChargeStartedAt = now;
    windHasDirection = true;
  }

  windVisualPoint = {
    x: point.x,
    y: point.y,
  };

  previousWindPoint = point;
  previousWindTime = now;
}

// 손을 떼면 바람 강화 종료
function stopWindDrag() {
  windDragging = false;
  windHasDirection = false;
  previousWindPoint = null;
}
