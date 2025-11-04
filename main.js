let particles = [];
let profileImage;
let isAnimating = false;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  
  // 設置圖片互動
  profileImage = document.getElementById('profileImage');
  setupImageInteraction();
}

function setupImageInteraction() {
  const wrapper = profileImage.parentElement;
  
  // 滑鼠移入效果
  wrapper.addEventListener('mouseenter', () => {
    isAnimating = true;
  });
  
  // 滑鼠移出效果
  wrapper.addEventListener('mouseleave', () => {
    isAnimating = false;
    profileImage.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  });
  
  // 滑鼠移動效果
  wrapper.addEventListener('mousemove', (e) => {
    if (!isAnimating) return;
    
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const xRotate = (y / rect.height) * 20;
    const yRotate = (x / rect.width) * -20;
    
    profileImage.style.transform = `
      rotateX(${xRotate}deg) 
      rotateY(${yRotate}deg)
      scale(1.05)
      translateZ(20px)
    `;
  });
  
  // 點擊效果
  wrapper.addEventListener('click', () => {
    profileImage.style.transform = 'rotateY(360deg) scale(1.1)';
    setTimeout(() => {
      if (isAnimating) {
        const rect = wrapper.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const xRotate = (y / rect.height) * 20;
        const yRotate = (x / rect.width) * -20;
        
        profileImage.style.transform = `
          rotateX(${xRotate}deg) 
          rotateY(${yRotate}deg)
          scale(1.05)
          translateZ(20px)
        `;
      } else {
        profileImage.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      }
    }, 1000);
  });
}

function draw() {
  background(27, 36, 48, 10);
  
  // 創建新的粒子
  if (random(1) < 0.1) {
    particles.push(new Particle());
  }
  
  // 更新和顯示所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(3, 8);
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
    this.life = 255;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
  }
  
  display() {
    noStroke();
    fill(255, 215, 0, this.life); // 金色粒子
    ellipse(this.x, this.y, this.size);
  }
  
  isDead() {
    return this.life <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}