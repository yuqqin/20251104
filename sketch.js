// Quiz using CSV question bank (questions.csv)
// Features:
// - load CSV exported from Excel (header row)
// - pick 3 random questions
// - show options, allow clicking, show immediate feedback
// - after 3 questions show score and feedback message

let table;
let allQuestions = [];
let quiz = [];
let current = 0;
let score = 0;
let state = 'loading'; // 'loading', 'question', 'result'
let selected = -1;
let optionBoxes = [];
let feedbackText = '';
let nextTimer = 0;
let particles = [];

function preload() {
  // Load CSV from same folder. Header: id,question,optA,optB,optC,optD,answer,feedback
  table = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  createCanvas(900, 600);
  textFont('Noto Sans TC');
  if (!table) {
    console.error('questions.csv not found or failed to load');
    state = 'result';
    feedbackText = '找不到 questions.csv，請將題庫放在專案資料夾中。';
    return;
  }

  // parse table
  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    allQuestions.push({
      id: row.get('id'),
      question: row.get('question'),
      opts: [row.get('optA'), row.get('optB'), row.get('optC'), row.get('optD')],
      answer: row.get('answer'), // e.g. A/B/C/D
      feedback: row.get('feedback')
    });
  }

  startQuiz();
}

function startQuiz() {
  // pick 3 random unique questions
  quiz = [];
  let idxs = [];
  while (idxs.length < min(3, allQuestions.length)) {
    let i = floor(random(allQuestions.length));
    if (!idxs.includes(i)) idxs.push(i);
  }
  idxs.forEach(i => quiz.push(allQuestions[i]));
  current = 0;
  score = 0;
  selected = -1;
  feedbackText = '';
  state = quiz.length > 0 ? 'question' : 'result';
}

function draw() {
  background(30, 40, 60);

  // header
  noStroke();
  fill(255);
  textSize(28);
  textAlign(LEFT, CENTER);
  text('測驗練習（從 CSV 題庫亂數取 3 題）', 30, 40);
  textSize(16);
  fill(200);
  text(`題目 ${min(current+1, quiz.length)} / ${quiz.length}`, 30, 75);

  if (state === 'loading') {
    fill(200);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('載入題庫…', width/2, height/2);
    return;
  }

  if (state === 'question') {
    drawQuestion();
  } else if (state === 'result') {
    drawResult();
  }

  // particles for celebration
  for (let i = particles.length-1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].finished) particles.splice(i,1);
  }
}

function drawQuestion() {
  let q = quiz[current];
  if (!q) return;

  // question card
  push();
  fill(255);
  rectMode(CORNER);
  fill(18, 120, 200);
  noStroke();
  rect(30, 110, width - 60, 180, 12);
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text(q.question, 50, 130, width - 100, 160);
  pop();

  // options
  optionBoxes = [];
  let startY = 320;
  let boxH = 60;
  for (let i = 0; i < q.opts.length; i++) {
    let x = 50;
    let y = startY + i*(boxH + 12);
    let w = width - 100;
    let h = boxH;

    // hover
    let isHover = mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h;
    if (selected === -1) {
      fill(isHover ? color(255, 250, 220) : color(250));
      stroke(100);
    } else {
      // after selection, show correct/incorrect colors
      let letter = 'ABCD'[i];
      if (letter === q.answer) fill(120, 200, 120);
      else if (selected === i && letter !== q.answer) fill(240, 120, 120);
      else fill(245);
      stroke(120);
    }
    rect(x, y, w, h, 8);

    // option text
    noStroke();
    fill(30);
    textSize(18);
    textAlign(LEFT, CENTER);
    let label = 'ABCD'[i] + '. ' + q.opts[i];
    text(label, x + 18, y + h/2);

    optionBoxes.push({x, y, w, h});
  }

  // if answered show feedback
  if (selected !== -1) {
    push();
    textSize(16);
    fill(255);
    textAlign(LEFT);
    text('回饋：' + q.feedback, 50, startY + q.opts.length*(boxH+12) + 10, width-100);
    pop();
  }

  // 小說明與重新開始按鈕
  drawFooter();
}

function drawFooter() {
  // restart button
  let bx = width - 170;
  let by = 30;
  let bw = 140;
  let bh = 36;
  let hov = mouseX > bx && mouseX < bx+bw && mouseY > by && mouseY < by+bh;
  fill(hov ? color(255,200,80) : color(255,220,100));
  stroke(100);
  rect(bx, by, bw, bh, 8);
  noStroke();
  fill(30);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('重新測驗', bx + bw/2, by + bh/2);
}

function mousePressed() {
  if (state === 'question') {
    // check restart click
    let bx = width - 170;
    let by = 30;
    let bw = 140;
    let bh = 36;
    if (mouseX > bx && mouseX < bx+bw && mouseY > by && mouseY < by+bh) {
      startQuiz();
      return;
    }

    if (selected === -1) {
      for (let i = 0; i < optionBoxes.length; i++) {
        let b = optionBoxes[i];
        if (mouseX > b.x && mouseX < b.x+b.w && mouseY > b.y && mouseY < b.y+b.h) {
          selected = i;
          checkAnswer(i);
          break;
        }
      }
    } else {
      // if already selected, ignore clicks until next question
    }
  } else if (state === 'result') {
    // restart when clicking result area
    startQuiz();
  }
}

function checkAnswer(i) {
  let q = quiz[current];
  let chosen = 'ABCD'[i];
  if (chosen === q.answer) {
    score++;
    // spawn celebration particles
    for (let p = 0; p < 30; p++) particles.push(new Particle(width/2 + random(-100,100), random(180, 260)));
  }

  // prepare to move to next question after short delay
  nextTimer = millis() + 900;
  // set a small timeout to advance
  setTimeout(() => {
    current++;
    if (current >= quiz.length) {
      state = 'result';
    } else {
      selected = -1;
    }
  }, 900);
}

function drawResult() {
  background(20, 30, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text('測驗結果', width/2, 120);

  textSize(28);
  let percent = floor((score / max(1, quiz.length)) * 100);
  text(`${score} / ${quiz.length} 題，得分 ${percent}%`, width/2, 190);

  // feedback message
  textSize(20);
  let msg = '';
  if (percent >= 90) msg = '太棒了！你準備得很充足。';
  else if (percent >= 70) msg = '不錯！再多練習可以更穩定。';
  else if (percent >= 40) msg = '還有進步空間，多做幾次練習題。';
  else msg = '建議回頭複習基本觀念，再試一次。';
  text(msg, width/2, 240);

  // list per-question feedback
  push();
  textAlign(LEFT, TOP);
  textSize(16);
  let startY = 300;
  for (let i = 0; i < quiz.length; i++) {
    let q = quiz[i];
    let line = `${i+1}. ${q.question}  答案：${q.answer}  回饋：${q.feedback}`;
    text(line, 60, startY + i*40, width - 120, 200);
  }
  pop();

  // instruction to restart
  textSize(16);
  fill(220);
  text('點擊畫面任意處重新測驗', width/2, height - 40);
}

// Simple particle for celebration
class Particle {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3,3);
    this.vy = random(-6,-1);
    this.size = random(4,8);
    this.col = color(random(100,255), random(100,255), random(100,255));
    this.life = 120;
    this.finished = false;
  }
  update() {
    this.vy += 0.15;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.finished = true;
  }
  draw() {
    noStroke();
    fill(this.col);
    ellipse(this.x, this.y, this.size);
  }
}

function windowResized() {
  // keep a reasonable canvas size
  let w = min(windowWidth-40, 1000);
  let h = min(windowHeight-80, 700);
  resizeCanvas(w, h);
}

