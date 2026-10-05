class Balloon {
  constructor(type) {
    this.type = type;

    // 삭제 및 재생성 상태
    this.death = false;
    this.respawnAt = 0;

    // 터지는 모션 상태
    this.popping = false;
    this.popStartedAt = 0;

    // 완성된 풍선 이미지
    this.layer = this.makeLayer();
  }

  // 풍선 전체를 하나의 이미지로 만들기
  makeLayer() {
    const g = createGraphics(
      DESIGN_WIDTH,
      DESIGN_HEIGHT
    );

    g.pixelDensity(1);
    g.angleMode(RADIANS);
    g.ellipseMode(CENTER);
    g.clear();

    if (this.type === "blue") {
      drawBalloons(g, true);
    } else if (this.type === "heart") {
      drawHeartBalloon(g, true);
    } else if (this.type === "dog") {
      drawDogBalloon(g, true);
    }

    return g;
  }

  // 바늘이 닿으면 모션 시작
  pop() {
    if (this.death || this.popping) return;

    this.popping = true;
    this.popStartedAt = millis();
  }

  // 모션과 재생성 상태 갱신
  update() {
    const now = millis();

    // 0.3초 동안 작아졌다가 커진 뒤 사라짐
    if (
      this.popping &&
      now >= this.popStartedAt + 300
    ) {
      this.popping = false;
      this.death = true;

      // 사라진 순간부터 3초 뒤 재생성
      this.respawnAt = now + 3000;

      // 삐에로는 0.5초 동안 놀란 표정
      clownSurprisedUntil = now + 500;
    }

    if (this.death && now >= this.respawnAt) {
      this.death = false;
    }
  }

  // 터치 위치 확인
  contains(x, y) {
    if (this.death || this.popping) return false;

    if (this.type === "blue") {
      return dist(x, y, 310, 225) < 60;
    }

    if (this.type === "heart") {
      return dist(x, y, 480, 160) < 75;
    }

    if (this.type === "dog") {
      return dist(x, y, 580, 380) < 100;
    }

    return false;
  }

  // 풍선 표시
  display() {
    // 삭제된 풍선은 그리지 않기
    if (this.death) return;

    let balloonScale = 1;

    // 터지는 모션: 100% → 85% → 120%
    if (this.popping) {
      const progress = constrain(
        (millis() - this.popStartedAt) / 300,
        0,
        1
      );

      if (progress < 0.4) {
        const t = progress / 0.4;
        const eased = t * t * (3 - 2 * t);

        balloonScale = lerp(1, 0.85, eased);
      } else {
        const t = (progress - 0.4) / 0.6;
        const eased = t * t * (3 - 2 * t);

        balloonScale = lerp(0.85, 1.2, eased);
      }
    }

    // 확대·축소 중심
    let centerX;
    let centerY;

    if (this.type === "blue") {
      centerX = 310;
      centerY = 225;
    } else if (this.type === "heart") {
      centerX = 480;
      centerY = 160;
    } else {
      centerX = 580;
      centerY = 380;
    }

    push();
    imageMode(CORNER);
    noTint();

    translate(centerX, centerY);
    scale(balloonScale);
    translate(-centerX, -centerY);

    image(this.layer, 0, 0);

    pop();
  }
}