const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const MatterBody = Matter.Body;
const Constraint = Matter.Constraint;

let engine;
let world;
// 랜덤 바람
let currentWind = 0;
let targetWind = 0;
let nextWindChange = 2000;
let gustStartTime = 0;
let gustDuration = 2000;
let gustActive = false;
let spreadFlip = 1;
let spreadPower = 1;

// 천장 아래의 중심 연결점
let topHub;
let middleHub;
let rightHub;
let leftLowerHub;
// 도형
let pinkCircleShape;
let pinkDropShape;
let largeOliveShape;
let yeonduDrop;
let greenLeaf;
let pinkDrop;
let yellowOval;
let lighpinkHourglass;
let smallPeanutShape;
// 연결줄
let ceilingConstraint;
let middleConstraint;
let yellowConstraint;
let brownConstraint;
let largeBrownConstraint;
let rightHubConstraint;
let yeonduDropConstraint;
let greenLeafConstraint;
let pinkDropConstraint;
let yellowOvalConstraint;
let lighpinkHourglassConstraint;
let leftLowerHubConstraint;
let smallBrownConstraint;

const MOBILE_SCALE = 0.8;

const BG = "#fff9fe";

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1);
  rectMode(CENTER);

  // Matter.js 물리엔진 만들기
  engine = Engine.create();
  world = engine.world;

  // 중력 설정
  engine.gravity.x = 0;
  engine.gravity.y = 0.8;
  engine.gravity.scale = 0.001;

  // 연결줄 계산을 조금 더 안정적으로
  engine.constraintIterations = 4;
  engine.positionIterations = 8;
  engine.velocityIterations = 6;

  // 천장 아래의 작은 중심점
  topHub = Bodies.circle(width / 2, 100, 4, {
    density: 0.002,
    frictionAir: 0.1,
    collisionFilter: {
      mask: 0,
    },
    fill: "#222222",
    label: "topHub",
  });

  // 아래쪽 중심점
  middleHub = Bodies.circle(width / 2, 280, 4, {
    density: 0.002,
    frictionAir: 0.1,
    collisionFilter: {
      mask: 0,
    },
    fill: "#222222",
    label: "middleHub",
  });

  // 오른쪽 아래에서 다시 갈라지는 세 번째 연결점
  rightHub = Bodies.circle(width / 2 + 130, 370, 4, {
    density: 0.002,
    frictionAir: 0.1,
    collisionFilter: {
      mask: 0,
    },
    fill: "#222222",
    label: "rightHub",
  });

  // 파란 도형과 작은 갈색 도형이 갈라지는 연결점
  leftLowerHub = Bodies.circle(width / 2 - 80, 500, 4, {
    density: 0.002,
    frictionAir: 0.1,
    collisionFilter: {
      mask: 0,
    },
    fill: "#222222",
    label: "leftLowerHub",
  });

  // 핑크 원 도형
  pinkCircleShape = Bodies.circle(width / 2 - 100, 170, 18, {
    density: 0.002,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#D44394",
    strokeFill: "#222222",
    label: "pinkCircleShape",
  });

  // 핫핑크 타원 도형
  pinkDropShape = Bodies.circle(width / 2 + 180, 160, 22, {
    density: 0.002,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#D71A63",
    strokeFill: "#222222",
    label: "pinkDropShape",
  });
  MatterBody.scale(pinkDropShape, 0.65, 1.4);
  MatterBody.setAngle(pinkDropShape, radians(20));

  // 올리브 타원 도형
  largeOliveShape = Bodies.circle(width / 2 - 170, 340, 42, {
    density: 0.0025,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#86851C",
    strokeFill: "#222222",
    label: "largeOliveShape",
  });

  // 진한 연두 타원 도형
  yeonduDrop = Bodies.circle(width / 2 + 190, 520, 24, {
    density: 0.002,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#A9B41C",
    strokeFill: "#222222",
    label: "yeonduDrop",
  });
  // 물리 도형을 세로로 길게 변형
  MatterBody.scale(yeonduDrop, 0.65, 1.5);
  MatterBody.setAngle(yeonduDrop, radians(5));

  // 연두 긴 타원 도형
  greenLeaf = Bodies.circle(width / 2 + 20, 500, 30, {
    density: 0.0023,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#BCCA5A",
    strokeFill: "#111111",
    label: "greenLeaf",
  });
  MatterBody.scale(greenLeaf, 0.55, 1.65);
  MatterBody.setAngle(greenLeaf, radians(-8));

  // 핑크 타원 도형
  pinkDrop = Bodies.circle(width / 2 - 120, 620, 22, {
    density: 0.002,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#D26E89",
    strokeFill: "#202b73",
    label: "pinkDrop",
  });
  MatterBody.scale(pinkDrop, 0.65, 1.55);
  MatterBody.setAngle(pinkDrop, radians(8));

  // 연노랑 타원 도형
  yellowOval = Bodies.circle(width / 2 + 95, 610, 28, {
    density: 0.0022,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#E4D5A6",
    strokeFill: "#333333",
    label: "yellowOval",
  });
  MatterBody.scale(yellowOval, 0.65, 1.35);
  MatterBody.setAngle(yellowOval, radians(-12));

  // 연핑크 모래시계 도형
  lighpinkHourglass = Bodies.rectangle(width / 2 + 40, 800, 56, 90, {
    density: 0.0025,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#D4ABBD",
    strokeFill: "#111111",
    label: "lighpinkHourglass",
  });
  MatterBody.setAngle(lighpinkHourglass, radians(4));

  // 땅콩 도형
  smallPeanutShape = Bodies.circle(width / 2 - 230, 680, 25, {
    density: 0.002,
    restitution: 0.1,
    frictionAir: 0.05,
    fill: "#DEDCD6",
    strokeFill: "#3c2016",
    label: "smallPeanutShape",
  });
  MatterBody.scale(smallPeanutShape, 0.65, 1.45);
  MatterBody.setAngle(smallPeanutShape, radians(8));

  // 천장과 중심점 연결
  ceilingConstraint = Constraint.create({
    pointA: {
      x: width / 2,
      y: 20,
    },

    bodyB: topHub,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 80,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 위쪽 중심점과 아래쪽 중심점을 연결
  middleConstraint = Constraint.create({
    bodyA: topHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: middleHub,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 180,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 아래쪽 중심점과 오른쪽 연결점 연결
  rightHubConstraint = Constraint.create({
    bodyA: middleHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: rightHub,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 160,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 위쪽 중심점과 노란 도형 연결
  yellowConstraint = Constraint.create({
    bodyA: topHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: pinkCircleShape,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 120,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 위쪽 중심점과 갈색 도형 연결
  brownConstraint = Constraint.create({
    bodyA: topHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: pinkDropShape,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 190,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 아래쪽 중심점과 큰 갈색 도형 연결
  largeBrownConstraint = Constraint.create({
    bodyA: middleHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: largeOliveShape,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 150,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 오른쪽 연결점과 빨간 도형 연결
  yeonduDropConstraint = Constraint.create({
    bodyA: rightHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: yeonduDrop,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 160,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 아래쪽 중심점과 검은 도형 연결
  greenLeafConstraint = Constraint.create({
    bodyA: middleHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: greenLeaf,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 220,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 아래쪽 중심점과 파란 도형 연결
  pinkDropConstraint = Constraint.create({
    bodyA: leftLowerHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: pinkDrop,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 140,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 왼쪽 아래 연결점과 작은 갈색 도형 연결
  smallBrownConstraint = Constraint.create({
    bodyA: leftLowerHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: smallPeanutShape,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 245,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 오른쪽 연결점과 회색 타원 연결
  yellowOvalConstraint = Constraint.create({
    bodyA: rightHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: yellowOval,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 245,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 회색 타원과 검은 모래시계 연결
  lighpinkHourglassConstraint = Constraint.create({
    bodyA: yellowOval,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: lighpinkHourglass,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 190,
    stiffness: 0.25,
    damping: 0.3,
  });

  // middleHub와 왼쪽 아래 연결점 연결
  leftLowerHubConstraint = Constraint.create({
    bodyA: middleHub,

    pointA: {
      x: 0,
      y: 0,
    },

    bodyB: leftLowerHub,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 235,
    stiffness: 0.25,
    damping: 0.3,
  });

  // 물리 세계에 추가
  Composite.add(world, [
    topHub,
    middleHub,
    rightHub,
    leftLowerHub,

    pinkCircleShape,
    pinkDropShape,
    largeOliveShape,
    yeonduDrop,
    greenLeaf,
    pinkDrop,
    yellowOval,
    lighpinkHourglass,
    smallPeanutShape,

    ceilingConstraint,
    middleConstraint,
    yellowConstraint,
    brownConstraint,
    largeBrownConstraint,
    rightHubConstraint,
    yeonduDropConstraint,
    greenLeafConstraint,
    pinkDropConstraint,
    yellowOvalConstraint,
    lighpinkHourglassConstraint,
    leftLowerHubConstraint,
    smallBrownConstraint,
  ]);
}

function draw() {
  background(BG);
  // 0.5초 동안 정지한 뒤 물리엔진 실행
  if (millis() >= 500) {
    const time = (millis() - 500) * 0.001;
    const now = millis();

    // 계속 좌우로 왕복하는 바람
    const mainWind = sin(time * 0.45) * 0.28;

    // 움직임이 너무 규칙적으로 보이지 않도록 작은 바람 추가
    const detailWind = sin(time * 1.7 + 1.2) * 0.06;

    currentWind = mainWind + detailWind;

    // 현재 바람 방향에 따라 펼쳐지는 방향 변경
    //spreadFlip = currentWind >= 0 ? 1 : -1;

    // 펼쳐지는 강도도 계속 조금씩 변화
    spreadPower = 0.9 + sin(time * 0.8) * 0.2;

    const gustAmount = map(abs(currentWind), 0, 0.34, 0.3, 1, true);

    // 바람이 없을 때는 중력을 강하게 해서 축 처짐
    // 바람이 강할 때만 중력을 조금 약하게 함
    engine.gravity.y = lerp(0.8, 0.7, gustAmount);

    // 전체에 적용되는 좌우 돌풍
    engine.gravity.x = currentWind;

    const spreadBodies = [
      // 위쪽 가지
      { body: pinkCircleShape, direction: -1.1 },
      { body: pinkDropShape, direction: 1.1 },
      { body: largeOliveShape, direction: -1.2, power: 1.8 },
      { body: greenLeaf, direction: 0.5, power: 1.2 },
      { body: leftLowerHub, direction: -0.9 },
      { body: pinkDrop, direction: 1.3, power: 1.0 },
      { body: smallPeanutShape, direction: -1.5, power: 1.2 },
      { body: rightHub, direction: 0.9 },
      { body: yeonduDrop, direction: 1.1, power: 1.4 },
      { body: yellowOval, direction: -0.9, power: 1.4 },
      { body: lighpinkHourglass, direction: 0.8, power: 1.3 },
    ];

    for (let i = 0; i < spreadBodies.length; i++) {
      const item = spreadBodies[i];

      // 바람이 불 때만 펼쳐지는 힘
      const restingSpread = 0.08;

      const spreadForce =
        (0.0003 + sin(time * 1.1 + i * 0.6) * 0.00006) *
        (restingSpread + gustAmount * 0.92);

      // 도형 중심보다 아래쪽에 바람을 적용해서 회전시킴
      const forcePoint = {
        x: item.body.position.x,
        y: item.body.position.y + 6,
      };

      MatterBody.applyForce(item.body, forcePoint, {
        x:
          item.direction *
          spreadForce *
          spreadPower *
          (item.power || 1) *
          item.body.mass,
        y: -0.000001 * gustAmount * item.body.mass,
      });
      // 바람이 없어도 천천히 회전하는 힘
      const idleSpin = sin(time * 0.8 + i * 1.7) * 0.0000025 * item.body.mass;

      // 도형 위쪽을 오른쪽으로 밀기
      MatterBody.applyForce(
        item.body,
        {
          x: item.body.position.x,
          y: item.body.position.y - 25,
        },
        {
          x: idleSpin,
          y: 0,
        },
      );

      // 도형 아래쪽을 왼쪽으로 밀기
      MatterBody.applyForce(
        item.body,
        {
          x: item.body.position.x,
          y: item.body.position.y + 25,
        },
        {
          x: -idleSpin,
          y: 0,
        },
      );
    }

    const physicsDelta = min(deltaTime, 16.67);

    Engine.update(engine, physicsDelta);
  }

  // 천장 고정점을 기준으로 모빌 전체를 80% 축소
  push();

  translate(width / 2, 20);
  scale(MOBILE_SCALE);
  translate(-width / 2, -20);

  // 천장 고정점
  fill("#222222");
  noStroke();
  circle(width / 2, 20, 9);

  // 천장과 중심점을 연결하는 줄
  drawConstraint(ceilingConstraint);
  drawConstraint(middleConstraint);
  drawConstraint(rightHubConstraint);
  drawConstraint(yellowConstraint);
  drawConstraint(brownConstraint);
  drawConstraint(largeBrownConstraint);
  drawConstraint(yeonduDropConstraint);
  drawConstraint(greenLeafConstraint);
  drawConstraint(pinkDropConstraint);
  drawConstraint(yellowOvalConstraint);
  drawConstraint(lighpinkHourglassConstraint);
  drawConstraint(leftLowerHubConstraint);
  drawConstraint(smallBrownConstraint);

  // 중심 연결점
  fill(topHub.fill);
  noStroke();
  circle(topHub.position.x, topHub.position.y, 8);
  // 아래쪽 중심점
  circle(middleHub.position.x, middleHub.position.y, 8);
  // 오른쪽 아래 연결점
  fill("#222222");
  noStroke();
  circle(rightHub.position.x, rightHub.position.y, 8);
  // 왼쪽 아래 연결점
  fill("#222222");
  noStroke();
  circle(leftLowerHub.position.x, leftLowerHub.position.y, 8);

  // 노란 도형
  fill(pinkCircleShape.fill);
  stroke(pinkCircleShape.strokeFill);
  strokeWeight(2);
  circle(pinkCircleShape.position.x, pinkCircleShape.position.y, 36);
  // 갈색 도형
  push();
  translate(pinkDropShape.position.x, pinkDropShape.position.y);
  rotate(pinkDropShape.angle);
  fill(pinkDropShape.fill);
  stroke(pinkDropShape.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 28, 62);
  pop();
  // 큰 갈색 도형
  push();
  translate(largeOliveShape.position.x, largeOliveShape.position.y);
  rotate(largeOliveShape.angle);
  fill(largeOliveShape.fill);
  stroke(largeOliveShape.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 76, 96);
  pop();
  // 빨간 물방울 도형
  push();
  translate(yeonduDrop.position.x, yeonduDrop.position.y);
  rotate(yeonduDrop.angle);
  fill(yeonduDrop.fill);
  stroke(yeonduDrop.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 32, 72);
  pop();
  // 검은 잎 도형
  push();
  translate(greenLeaf.position.x, greenLeaf.position.y);
  rotate(greenLeaf.angle);
  fill(greenLeaf.fill);
  stroke(greenLeaf.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 34, 100);
  pop();
  // 파란 물방울 도형
  push();
  translate(pinkDrop.position.x, pinkDrop.position.y);
  rotate(pinkDrop.angle);
  fill(pinkDrop.fill);
  stroke(pinkDrop.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 28, 68);
  pop();
  // 회색 타원
  push();
  translate(yellowOval.position.x, yellowOval.position.y);
  rotate(yellowOval.angle);
  fill(yellowOval.fill);
  stroke(yellowOval.strokeFill);
  strokeWeight(2);
  ellipse(0, 0, 36, 76);
  pop();
  // 검은 모래시계 도형
  push();
  translate(lighpinkHourglass.position.x, lighpinkHourglass.position.y);
  rotate(lighpinkHourglass.angle);
  fill(lighpinkHourglass.fill);
  stroke(lighpinkHourglass.strokeFill);
  strokeWeight(2);
  beginShape();
  // 왼쪽 위
  vertex(-28, -45);
  // 오른쪽 위
  vertex(28, -45);
  // 가운데 오른쪽
  vertex(8, 0);
  // 오른쪽 아래
  vertex(26, 45);
  // 왼쪽 아래
  vertex(-26, 45);
  // 가운데 왼쪽
  vertex(-8, 0);
  endShape(CLOSE);
  pop();
  // 작은 갈색 조롱박 도형
  push();
  translate(smallPeanutShape.position.x, smallPeanutShape.position.y);
  rotate(smallPeanutShape.angle);
  fill(smallPeanutShape.fill);
  stroke(smallPeanutShape.strokeFill);
  strokeWeight(2);
  beginShape();
  // 시작점
  vertex(0, -42);
  // 오른쪽 위 곡선
  bezierVertex(18, -35);
  bezierVertex(17, -15);
  bezierVertex(7, -5);
  // 오른쪽 아래 곡선
  bezierVertex(21, 10);
  bezierVertex(20, 34);
  bezierVertex(0, 43);
  // 왼쪽 아래 곡선
  bezierVertex(-20, 34);
  bezierVertex(-21, 10);
  bezierVertex(-7, -5);
  // 왼쪽 위 곡선
  bezierVertex(-17, -15);
  bezierVertex(-18, -35);
  bezierVertex(0, -42);
  endShape(CLOSE);
  pop();
  //pop();
}

// Matter.js 연결줄 그리기
function drawConstraint(constraint) {
  let pointA;
  let pointB;

  if (constraint.bodyA) {
    pointA = {
      x: constraint.bodyA.position.x + constraint.pointA.x,
      y: constraint.bodyA.position.y + constraint.pointA.y,
    };
  } else {
    pointA = constraint.pointA;
  }

  if (constraint.bodyB) {
    pointB = {
      x: constraint.bodyB.position.x + constraint.pointB.x,
      y: constraint.bodyB.position.y + constraint.pointB.y,
    };
  } else {
    pointB = constraint.pointB;
  }

  stroke("#222222");
  strokeWeight(2);
  line(pointA.x, pointA.y, pointB.x, pointB.y);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
