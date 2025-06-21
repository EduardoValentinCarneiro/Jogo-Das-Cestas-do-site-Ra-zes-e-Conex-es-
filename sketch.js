let estado = "inicio";
let tempoCesta = 15 * 60;
let tempoAtual = 0;
let cestas = [];
let frutas = [];
let cestaAtual = 0;
let vidas = 3;
let pontuacao = 0;
let imagensCesta = [];
let imagensFruta = [];
let imagensFrutaPodre = [];
let velocidade = 10;

// Tamanhos configuráveis
let tamanhoCesta = 110;
let tamanhoFruta = 80;
let tamanhoFrutaPodre = 80;

// Sons
let somPonto, somErro, somVitoria, somFundo, somDerrota, somTroca;

// Estrelas
let estrelas = 0;

// Cor de fundo do jogo
let corFundoJogo;

function preload() {
  // Cestas
  imagensCesta[0] = loadImage("img/cesta_maça.png");
  imagensCesta[1] = loadImage("img/cesta_banana.png");
  imagensCesta[2] = loadImage("img/cesta_milho.png");
  imagensCesta[3] = loadImage("img/cesta_melancia.png");

  // Frutas certas
  imagensFruta[0] = loadImage("img/fruta_maça.png");
  imagensFruta[1] = loadImage("img/fruta_banana.png");
  imagensFruta[2] = loadImage("img/milho.png");
  imagensFruta[3] = loadImage("img/fruta_melancia.png");

  // Frutas podres
  imagensFrutaPodre[0] = loadImage("img/maça_podre.png");
  imagensFrutaPodre[1] = loadImage("img/banana_podre.png");
  imagensFrutaPodre[2] = loadImage("img/milho_podre.png");
  imagensFrutaPodre[3] = loadImage("img/melancia_podre.png");

  // Sons
  somPonto = loadSound("som/colect.mp3");
  somErro = loadSound("som/falha1.mp3");
  somVitoria = loadSound("som/vitoria.mp3");
  somFundo = loadSound("som/Dream in Pixels.mp3");
  somDerrota = loadSound("som/derrota.mp3");
  somTroca = loadSound("som/troca.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 4; i++) {
    cestas.push({
      x: width / 2,
      y: height - 100,
      img: imagensCesta[i]
    });
  }

  corFundoJogo = color(50, 128, 30);

  if (somFundo && !somFundo.isPlaying()) {
    somFundo.setVolume(0.5);
    somFundo.loop();
  }
}

function draw() {
  if (estado === "jogando") {
    background(corFundoJogo);
  } else {
    background(0);
  }

  if (estado === "inicio") {
    telaInicio();
  } else if (estado === "instrucoes") {
    telaInstrucoes();
  } else if (estado === "jogando") {
    jogar();
  } else if (estado === "fim") {
    telaDerrota();
  } else if (estado === "vitoria") {
    telaVitoria();
  }
}

function telaInicio() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Aperte espaço para iniciar o jogo", width / 2, height / 2);
}

function telaInstrucoes() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("INSTRUÇÕES", width / 2, height / 2 - 140);
  textSize(20);
  text("→ Use as setas ← e → do teclado para mover a cesta", width / 2, height / 2 - 80);
  text("→ Colete as frutas que combinam com sua cesta", width / 2, height / 2 - 40);
  text("→ Evite pegar frutas podres (você perde uma vida)", width / 2, height / 2);
  text("→ Você tem 3 vidas para completar o jogo!", width / 2, height / 2 + 40);
  text("Aperte ESPAÇO para começar!", width / 2, height / 2 + 100);
}

function jogar() {
  tempoAtual++;

  let cesta = cestas[cestaAtual];
  let frutaAtual = imagensFruta[cestaAtual];
  let podreAtual = imagensFrutaPodre[cestaAtual];

  if (keyIsDown(LEFT_ARROW)) cesta.x -= velocidade;
  if (keyIsDown(RIGHT_ARROW)) cesta.x += velocidade;

  cesta.x = constrain(cesta.x, 50, width - 50);
  image(cesta.img, cesta.x - tamanhoCesta / 2, cesta.y, tamanhoCesta, tamanhoCesta);

  if (frameCount % 30 === 0) {
    frutas.push({
      x: random(50, width - 50),
      y: -20,
      podre: random() < 0.25
    });
  }

  for (let i = frutas.length - 1; i >= 0; i--) {
    let f = frutas[i];
    f.y += 5;

    let img = f.podre ? podreAtual : frutaAtual;
    let tamanho = f.podre ? tamanhoFrutaPodre : tamanhoFruta;

    image(img, f.x, f.y, tamanho, tamanho);

    // Hitbox com redução só no lado direito (20px a menos de largura)
    if (colide(cesta.x - tamanhoCesta / 2, cesta.y, tamanhoCesta - 60, tamanhoCesta, f.x, f.y, tamanho)) {
      if (f.podre) {
        vidas--;
        if (somErro) somErro.play();
        if (vidas <= 0) {
          estado = "fim";
          if (somDerrota) somDerrota.play();
          if (somFundo && somFundo.isPlaying()) somFundo.stop();
        }
      } else {
        pontuacao++;
        if (somPonto) somPonto.play();
      }
      frutas.splice(i, 1);
    } else if (f.y > height) {
      frutas.splice(i, 1);
    }
  }

  fill(255);
  textSize(18);
  textAlign(LEFT);
  text("Vidas: " + vidas, 10, 20);
  text("Pontuação: " + pontuacao, 10, 40);
  text("Cesta: " + (cestaAtual + 1), 10, 60);
  text("Tempo restante: " + Math.ceil((tempoCesta - tempoAtual) / 60) + "s", 10, 80);

  if (tempoAtual >= tempoCesta) {
    tempoAtual = 0;
    cestaAtual++;
    frutas = [];

    if (somTroca) somTroca.play();

    if (cestaAtual >= 4) {
      if (vidas > 0) {
        estado = "vitoria";
        if (somVitoria) somVitoria.play();
        if (somFundo && somFundo.isPlaying()) somFundo.stop();
        definirEstrelas();
      } else {
        estado = "fim";
        if (somDerrota) somDerrota.play();
        if (somFundo && somFundo.isPlaying()) somFundo.stop();
      }
    }
  }
}

function keyPressed() {
  if (estado === "inicio" && key === " ") {
    estado = "instrucoes";
  } else if (estado === "instrucoes" && key === " ") {
    iniciarJogo();
  }
}

function iniciarJogo() {
  estado = "jogando";
  tempoAtual = 0;
  cestaAtual = 0;
  vidas = 3;
  pontuacao = 0;
  frutas = [];

  if (somFundo && !somFundo.isPlaying()) somFundo.loop();
}

function telaDerrota() {
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Você perdeu todas as vidas!", width / 2, height / 2 - 30);
  text("Pontuação: " + pontuacao, width / 2, height / 2 + 10);
}

function telaVitoria() {
  background(0, 100, 0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("Parabéns! Você venceu!", width / 2, height / 2 - 80);
  textSize(24);
  text("Pontuação: " + pontuacao, width / 2, height / 2 - 40);
  text("Estrelas conquistadas:", width / 2, height / 2);

  for (let i = 0; i < estrelas; i++) {
    fill(255, 215, 0);
    star(width / 2 - 60 + i * 60, height / 2 + 60, 20, 40, 5);
  }
}

function definirEstrelas() {
  if (pontuacao >= 50) estrelas = 3;
  else if (pontuacao >= 30) estrelas = 2;
  else estrelas = 1;
}

function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function colide(rx, ry, rw, rh, cx, cy, d) {
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);
  let dx = cx - closestX;
  let dy = cy - closestY;
  return dx * dx + dy * dy < (d / 2) * (d / 2);
}
