var fill_colors = 'ef798a-f7a9a8-613f75-e5c3d1-988b8e'.split("-").map(a => "#" + a);
var line_colors = "064789-427aa1-ebf2fa-679436-a5be00".split("-").map(a => "#" + a);
var monster_colors = "ddf8e8-cdd5d1-b4a6ab-946e83-615055".split("-").map(a => "#" + a);

let points = [[-9,0],[-9,0],[-8,0.5],[-7,0.8],[-2.5,1],[-3,1.5],[0,2],[6.5,8],[8,8],[9,1.5],[9.5,1.5],[11,3.5],[12,3.5],[12.8,1],[10,1],[10,0.9],[11.5,0.5],[11.5,-0.5],[10,-0.9],[10,-1],[12.8,-1],[12,-3.5],[11,-3.5],[9.5,-1.5],[9,-1.5],[8,-8],[6.5,-8],[0,-2],[-3,-1.5],[-2.5,-1],[-7,-0.8],[-8,-0.5],[-8,-0.5],[-9,0],[-9,0]];

let bgMusic; // 背景音樂
let bombSound; // 炸彈音效

class Obj {
  constructor(args) {
    this.p = args.p || createVector(random(width), random(height));
    this.v = createVector(random(-1, 1), random(-1, 1));
    this.size = random(5, 10);
    this.color = random(fill_colors);
    this.stroke = random(line_colors);
    this.dead = false;
    this.hitCount = 0; // 記錄被擊中次數
  }

  draw() {
    if (this.dead) {
      this.respawn();
    }
    push();
    translate(this.p.x, this.p.y);
    scale(this.v.x < 0 ? 1 : -1, -1);
    fill(this.color);
    stroke(this.stroke);
    strokeWeight(4);
    beginShape();
    for (var k = 0; k < points.length; k = k + 1) {
      vertex(points[k][0] * this.size, points[k][1] * this.size);
    }
    endShape();
    pop();

    // 顯示被擊中次數
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.hitCount, this.p.x, this.p.y);
  }

  update() {
    this.p.add(this.v);

    if (this.p.x <= 0 || this.p.x >= width) {
      this.v.x = -this.v.x;
    }
    if (this.p.y <= 0 || this.p.y >= height) {
      this.v.y = -this.v.y;
    }
  }

  isBallInRange(x, y) {
    let d = dist(x, y, this.p.x, this.p.y);
    if (d < 4 * this.size) {
      return true;
    } else {
      return false;
    }
  }

  respawn() {
    this.p = createVector(random(width), random(height));
    this.v = createVector(random(-1, 1), random(-1, 1));
    this.size = random(5, 10);
    this.color = random(fill_colors);
    this.stroke = random(line_colors);
    this.dead = false;
    this.hitCount = 0;
  }
}


class Monster {
  constructor(args) {
    this.r = args.r || random(20, 50);
    this.p = args.p || createVector(random(width), random(height));
    this.v = args.v || createVector(random(-1, 1), random(-1, 1));
    this.color = args.color || random(monster_colors);
    this.mode = random(["happy", "bad"]);
    this.dead = false;
    this.timenum = 0;
    this.hitCount = 0;
    this.hitCountThreshold = 6;
    this.tentacleLength = 360;
    this.tentacleAngle = 0;
    this.tentacleSegments = 36; // 觸手分段數量
    this.tentacleSegmentLength = 30; // 觸手分段長度
    this.tentacleAngleOffset = random(TWO_PI); // 觸手角度偏移
  }
  
  draw() {
    if (this.dead) {
      return;
    }
    
    push();
    translate(this.p.x, this.p.y);
    fill(this.color);
    stroke(0);
    strokeWeight(2);
    ellipse(0, 0, this.r * 2, this.r * 2);
    
    if (this.mode === "happy") {
      fill(255);
      ellipse(-this.r * 0.25, -this.r * 0.3, this.r * 0.25, this.r * 0.25);
      ellipse(this.r * 0.25, -this.r * 0.3, this.r * 0.25, this.r * 0.25);
      arc(0, this.r * 0.4, this.r * 0.7, this.r * 0.4, 0, PI);
    } else if (this.mode === "bad") {
      fill(0,255,0);
      ellipse(-this.r * 0.25, -this.r * 0.3, this.r * 0.25, this.r * 0.25);
      ellipse(this.r * 0.25, -this.r * 0.3, this.r * 0.25, this.r * 0.25);
      fill(255);
      rectMode(CENTER);
      rect(0, 0, this.r * 1.2, this.r * 0.3);
    }
    
    stroke(0); // 黑色
    noFill();
    
    for (let i = 0; i < this.tentacleSegments; i++) {
      let angle = map(i, 0, this.tentacleSegments - 1, 0, PI); // 觸手彎曲角度
      
      let x1 = cos(this.tentacleAngleOffset + angle) * this.r * 0.8;
      let y1 = sin(this.tentacleAngleOffset + angle) * this.r * 0.8;
      
      let x2 = cos(this.tentacleAngleOffset + angle) * this.r * 0.8 + cos(this.tentacleAngleOffset + angle) * this.tentacleSegmentLength;
      let y2 = sin(this.tentacleAngleOffset + angle) * this.r * 0.8 + sin(this.tentacleAngleOffset + angle) * this.tentacleSegmentLength;
      
      let x3 = cos(this.tentacleAngleOffset + angle) * this.r * 0.8 + cos(this.tentacleAngleOffset + angle) * this.tentacleSegmentLength * 2;
      let y3 = sin(this.tentacleAngleOffset + angle) * this.r * 0.8 + sin(this.tentacleAngleOffset + angle) * this.tentacleSegmentLength * 2;
      
      curve(x1, y1, x1, y1, x2, y2, x3, y3);
    }

    // 更新觸手角度
    this.tentacleAngleOffset += 2;
    pop();
    
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(`Hit: ${this.hitCount}`, this.p.x, this.p.y + this.r);
  }
  
  update() {
    if (this.dead) {
      this.timenum++;
      if (this.timenum >= 100) {
        this.respawn();
      }
      return;
    }
    
    this.p.add(this.v);

    if (this.p.x <= 0 || this.p.x >= width) {
      this.v.x = -this.v.x;
    }
    if (this.p.y <= 0 || this.p.y >= height) {
      this.v.y = -this.v.y;
    }
    
    if (this.hitCount >= this.hitCountThreshold) {
      this.dead = true;
      score += 2;
    }
  }
  
  respawn() {
    this.r = random(20, 50);
    this.p = createVector(random(width), random(height));
    this.v = createVector(random(-1, 1), random(-1, 1));
    this.color = random(monster_colors);
    this.mode = random(["happy", "bad"]);
    this.dead = false;
    this.timenum = 0;
    this.hitCount = 0;
  }
  
  isBallInRange(x, y) {
    let d = dist(x, y, this.p.x, this.p.y);
    if (d < this.r) {
      return true;
    } else {
      return false;
    }
  }
}



class Bullet {
  constructor(x, y) {
    this.p = createVector(x, y);
    this.v = createVector(0, -10);
  }
  
  draw() {
    noStroke();
    fill(255);
    ellipse(this.p.x, this.p.y, 10, 10);
  }
  
  update() {
    this.p.add(this.v);
    
    if (this.p.y < 0) {
      bullets.splice(bullets.indexOf(this), 1);
    }
    
    for (let i = objs.length - 1; i >= 0; i--) {
      let obj = objs[i];
      if (!obj.dead && obj.isBallInRange(this.p.x, this.p.y)) {
          bullets.splice(bullets.indexOf(this), 1);
          obj.hitCount += 1; // 增加擊中次數計數
          if (obj.hitCount >= 16) {
            obj.dead = true;
        score += 5;
        break;
      }
    }
    
    for (let i = monsters.length - 1; i >= 0; i--) {
      let monster = monsters[i];
      if (!monster.dead && monster.isBallInRange(this.p.x, this.p.y)) {
        bullets.splice(bullets.indexOf(this), 1);
        monster.hitCount += 1; // 增加擊中次數計數
        if (monster.hitCount >= 3) {
          monster.dead = true;
          score += 1;
        }
        if (monster.hitCount >= 6) {
          monster.dead = true;
          score += 1;
          if (monster.color === "#ddf8e8" && monster.hitCount >= monster.hitCountThreshold) {
            monster.dead = true;
            score += 2; // 分數加兩分
          }
        }
        break;
      }
    }
  }
}
}

class CustomShape {
  constructor() {
    this.size = 10;
    this.halfSize = this.size * 2;
     this.rotation = 0;
  }

  draw() {
    push();
    translate(mouseX, mouseY);

      // 根據旋轉角度進行旋轉
      rotate(this.rotation);

    // 繪製灰色三角形
    fill(0);
    rectMode(CENTER);
    noStroke();
    triangle(0, -20, -this.halfSize, -this.halfSize, this.halfSize, -this.halfSize, -20, this.halfSize);

    // 繪製黑色長方形
    fill(0);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size * 7);

    fill(0);
    rectMode(CENTER);
    rect(0, this.size * 3.5, this.size, this.size * 7);
    pop();
  }
  updateRotation(angle) {
    this.rotation = angle;
  }

}




let score = 0;
let time = 0; // 新增時間計數變數
let timer; // 計時器
let bgMusicTime = 0; // 背景音樂時間計數
let objs = [];
let monsters = [];
let bullets = [];
let customShape;
let bulletAngle = 0;
let gameover = false;


function preload() {  // 加載音樂文件
  bgMusic = loadSound('REX  洗劫.mp3');
	bombSound = loadSound('Bomb Sound.mp3');
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < 5; i++) {
    objs.push(new Obj({}));
  }
  
  for (let i = 0; i < 10; i++) {
    monsters.push(new Monster({}));
  }
  


  timer = setInterval(() => {
    time++;  // 每秒增加時間計數
    bgMusicTime = (bgMusicTime + 1) % bgMusic.duration();
  }, 1000);

	bgMusic.play(); // 播放背景音樂
  // 背景音樂跟隨時間正確播放
  bgMusic.jump(bgMusicTime);

  customShape = new CustomShape(width / 2, height / 2);
  bulletAngle = 0;
}

function draw() {
  background(220);
  
  for (let i = 0; i < objs.length; i++) {
    let obj = objs[i];
    obj.draw();
    obj.update();
  }
  
  for (let i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    monster.draw();
    monster.update();
  }
  
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.draw();
    bullet.update();
  }

  for (let i = 0; i < customShape.length; i++) {
    let CustomShape = customShape[i];
    CustomShape.draw();
  }

   // 更新CustomShape的旋轉角度為子彈的角度
   customShape.updateRotation(bulletAngle);

   // 繪製CustomShape
   customShape.draw();

  fill(0);
  textSize(20);
  text("Score: " + score, 100, 30);
  text("Time: " + (100 - time), 100, 60); // 顯示倒數遊戲時間
	
	  // 繪製鼠標位置和子彈發射角度
  let mousePos = createVector(mouseX, mouseY);
  let playerPos = createVector(width / 2, height - 30);
  let angle = degrees(atan2(mousePos.y - playerPos.y, mousePos.x - playerPos.x));
  textAlign(CENTER);
  textSize(16);
  text("鼠標位置：" + mouseX + ", " + mouseY, width / 2, height - 80);
  text("子彈發射角度：" + angle.toFixed(2), width / 2, height - 50);


  if (score >= 80) {
			gameover = true;
			background(220)
			   textSize(40);
    textAlign(CENTER, CENTER);
      text("你真的好會射喔", width / 2, height / 2);
			text("分數: " + score, width / 2, height / 2 + 50);
    bgMusic.stop();	// 停止背景音樂播放
    return;
    }   
	if (time >= 100) { // 如果遊戲時間超過五分鐘，停止遊戲並顯示結果
		gameover = true;
    clearInterval(timer);
		background(220)
    textSize(40);
    textAlign(CENTER, CENTER);
      text("你這個爛砲兵", width / 2, height / 2);
			text("分數: " + score, width / 2, height / 2 + 50);
		bgMusic.stop();	// 停止背景音樂播放
    return;
    }
}



function mousePressed() {

  if (gameover) {
    return;
	} 
	if (mouseButton === LEFT) {
    let bullet = new Bullet(mouseX, mouseY);
    bullets.push(bullet);
    bombSound.play();// 播放炸彈音效
  } 
}

function keyPressed() {

  if (gameover) {
    return;
	} 

  if (keyCode === 32) {
    let bullet = new Bullet(mouseX, mouseY);
    bullets.push(bullet);
    bombSound.play();// 播放炸彈音效
  } 

  if (keyCode === UP_ARROW) {
    bulletAngle = -HALF_PI; // 90度，指向上方
  } else if (keyCode === DOWN_ARROW) {
    bulletAngle = HALF_PI; // -90度，指向下方
  } else if (keyCode === LEFT_ARROW) {
    bulletAngle = PI; // 180度，指向左方
  } else if (keyCode === RIGHT_ARROW) {
    bulletAngle = 0; // 0度，指向右方
  }
}

