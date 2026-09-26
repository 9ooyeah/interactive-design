const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const MatterBody = Matter.Body;
const Constraint = Matter.Constraint;
const Vector = Matter.Vector;

let engine;
let world;

// 물리 도형
let bar;
let bar2;
let bar2Constraint;
let yellowOval;
let redRoundedTriangle;
let blueDiamond;

// 연결줄
let anchorConstraint;
let yellowOvalConstraint;
let redRoundedTriangleConstraint;
let blueDiamondConstraint;

// 배경색
const BG = "#fffcf4";

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1);
  rectMode(CENTER);

  // Matter.js 엔진 만들기
  engine = Engine.create();
  world = engine.world;

  // 아래쪽으로 작용하는 중력
  engine.gravity.y = 1;
  engine.gravity.x = 0;
  engine.gravity.scale = 0.001;

  // 화면 밖으로 도형이 빠져나가지 않도록 벽 만들기
  let margin = 20;

  Composite.add(world, [
    Bodies.rectangle(width / 2, height - margin, width, margin, {
      isStatic: true,
    }),

    Bodies.rectangle(width / 2, margin, width, margin, {
      isStatic: true,
    }),

    Bodies.rectangle(margin, height / 2, margin, height, {
      isStatic: true,
    }),

    Bodies.rectangle(width - margin, height / 2, margin, height, {
      isStatic: true,
    }),
  ]);

  // 가운데 막대
  bar = Bodies.rectangle(width / 2, 250, 300, 10, {
    frictionAir: 0.03,
    fill: "#222222",
  });

  // 오른쪽 아래에 연결될 두 번째 막대
  bar2 = Bodies.rectangle(width / 2 + 150, 360, 220, 8, {
    frictionAir: 0.04,
    fill: "#222222",
  });

  // 왼쪽의 노란 타원
  yellowOval = Bodies.circle(width / 2 - 150, 550, 50, {
    density: 0.0022,
    restitution: 0.1,
    frictionAir: 0.02,
    fill: "#fdc648",
    strokeFill: "#222222",
    label: "yellowOval",
  });

  // 원을 세로로 긴 타원으로 변형
  MatterBody.scale(yellowOval, 0.8, 1.4);

  // 오른쪽의 빨간 둥근 삼각형
  redRoundedTriangle = Bodies.polygon(width / 2 + 260, 600, 3, 45, {
    chamfer: {
      radius: 15,
    },
    density: 0.0019,
    restitution: 0.3,
    frictionAir: 0.02,
    fill: "#cf493e",
    strokeFill: "#222222",
    label: "redRoundedTriangle",
  });

  // 두 번째 막대 왼쪽에 매달릴 파란 도형
  blueDiamond = Bodies.polygon(width / 2 + 90, 760, 4, 45, {
    chamfer: {
      radius: 10,
    },

    density: 0.003,
    restitution: 0.2,
    frictionAir: 0.03,
    fill: "#244a9b",
    strokeFill: "#222222",
    label: "blueDiamond",
  });

  // 가로는 좁고 세로는 긴 형태로 변형
  MatterBody.scale(blueDiamond, 0.75, 1.3);

  // 삼각형의 시작 각도
  MatterBody.setAngle(redRoundedTriangle, radians(15));

  // 천장의 고리와 막대 가운데를 연결
  anchorConstraint = Constraint.create({
    pointA: {
      x: width / 2,
      y: 120,
    },

    bodyB: bar,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 130,
    stiffness: 0.9,
  });

  // 첫 번째 막대 오른쪽과 두 번째 막대 가운데를 연결
  bar2Constraint = Constraint.create({
    bodyA: bar,

    pointA: {
      x: 150,
      y: 0,
    },

    bodyB: bar2,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 110,
    stiffness: 0.9,
  });

  // 막대 왼쪽과 노란 타원을 연결
  yellowOvalConstraint = Constraint.create({
    bodyA: bar,

    pointA: {
      x: -150,
      y: 0,
    },

    bodyB: yellowOval,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 300,
    stiffness: 0.9,
  });

  // 막대 오른쪽과 빨간 삼각형을 연결
  redRoundedTriangleConstraint = Constraint.create({
    bodyA: bar2,

    pointA: {
      x: 110,
      y: 0,
    },

    bodyB: redRoundedTriangle,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 240,
    stiffness: 0.9,
  });

  // 두 번째 막대 왼쪽과 파란 도형을 연결
  blueDiamondConstraint = Constraint.create({
    bodyA: bar2,

    pointA: {
      x: -60,
      y: 0,
    },

    bodyB: blueDiamond,

    pointB: {
      x: 0,
      y: 0,
    },

    length: 400,
    stiffness: 0.9,
  });

  // 만든 도형과 연결줄을 물리 세계에 추가
  Composite.add(world, [
    bar,
    bar2,
    yellowOval,
    redRoundedTriangle,
    blueDiamond,
    anchorConstraint,
    bar2Constraint,
    yellowOvalConstraint,
    redRoundedTriangleConstraint,
    blueDiamondConstraint,
  ]);
}

function draw() {
  // 시작 후 0.3초가 지나면 바람과 물리엔진 실행
  if (millis() >= 300) {
    let wind = sin(frameCount * 0.02) * 0.001;

    MatterBody.applyForce(yellowOval, yellowOval.position, { x: wind, y: 0 });

    MatterBody.applyForce(blueDiamond, blueDiamond.position, { x: wind * 0.8, y: 0 });

    MatterBody.applyForce(redRoundedTriangle, redRoundedTriangle.position, {
      x: wind * 1.2,
      y: 0,
    });

    Engine.update(engine);
  }

  background(BG);

  // 천장에 붙은 고정 장치
  fill("#222222");
  noStroke();
  rect(width / 2, 10, 80, 20, 16);

  // 천장과 고리를 연결하는 막대
  stroke("#222222");
  strokeWeight(4);
  line(width / 2, 20, width / 2, 120);

  // 줄이 걸린 작은 고리
  fill("#222222");
  noStroke();
  circle(width / 2, 120, 16);

  // 물리 연결줄 그리기
  drawConstraint(anchorConstraint);
  drawConstraint(bar2Constraint);
  drawConstraint(yellowOvalConstraint);
  drawConstraint(redRoundedTriangleConstraint);
  drawConstraint(blueDiamondConstraint);

  // 가운데 막대 그리기
  push();

  translate(bar.position.x, bar.position.y);
  rotate(bar.angle);

  rectMode(CENTER);
  fill(bar.fill);
  noStroke();

  rect(0, 0, 320, 10, 16);

  pop();

  // 두 번째 막대 그리기
  push();

  translate(bar2.position.x, bar2.position.y);
  rotate(bar2.angle);

  rectMode(CENTER);
  fill(bar2.fill);
  noStroke();

  rect(0, 0, 240, 8, 16);

  pop();

  // 노란 추상 도형 그리기
  push();

  translate(yellowOval.position.x, yellowOval.position.y);

  // 물리 회전값에 살짝 기울어진 각도 추가
  rotate(yellowOval.angle - radians(8));

  fill("#fdc648");
  stroke("#222222");
  strokeWeight(2);

  beginShape();

  // 위쪽 시작점
  vertex(-10, -78);

  // 오른쪽 위: 살짝 튀어나오게
  bezierVertex(16, -75);
  bezierVertex(35, -48);
  bezierVertex(38, -12);

  // 오른쪽 아래
  bezierVertex(42, 25);
  bezierVertex(24, 72);
  bezierVertex(0, 70);

  // 왼쪽 아래
  bezierVertex(-24, 72);
  bezierVertex(-40, 42);
  bezierVertex(-38, 8);

  // 왼쪽 위
  bezierVertex(-40, -30);
  bezierVertex(-30, -76);
  bezierVertex(-10, -78);

  endShape(CLOSE);

  pop();

  // 빨간 둥근 삼각형 그리기
  beginShape();

  fill(redRoundedTriangle.fill);
  stroke(redRoundedTriangle.strokeFill);
  strokeWeight(2);

  for (let i = 0; i < redRoundedTriangle.vertices.length; i++) {
    let x = redRoundedTriangle.vertices[i].x;
    let y = redRoundedTriangle.vertices[i].y;

    vertex(x, y);
  }

  endShape(CLOSE);

  // 찌그러진 파란 마름모 그리기
  push();

  translate(blueDiamond.position.x, blueDiamond.position.y);
  rotate(blueDiamond.angle + radians(6));
  scale(1.15);

  fill(blueDiamond.fill);
  stroke(blueDiamond.strokeFill);
  strokeWeight(2);

  beginShape();

  // 위쪽 꼭짓점
  vertex(-5, -55);

  // 오른쪽 위 변
  bezierVertex(10, -47);
  bezierVertex(27, -22);
  bezierVertex(32, -2);

  // 오른쪽 아래 변
  bezierVertex(25, 14);
  bezierVertex(12, 38);
  bezierVertex(-2, 52);

  // 왼쪽 아래 변
  bezierVertex(-15, 41);
  bezierVertex(-28, 22);
  bezierVertex(-35, 5);

  // 왼쪽 위 변
  bezierVertex(-30, -15);
  bezierVertex(-12, -43);
  bezierVertex(-5, -55);

  endShape(CLOSE);

  pop();
}

// Matter.js 연결줄을 화면에 그리는 함수
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
