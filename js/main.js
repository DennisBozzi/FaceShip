// ----- Setup -----
var enemyLife = 50; // Vida do inimigo e Quantidade de rabiolas
var velocidade = 0.04; // Velocidade Rabiola

const video = document.getElementsByClassName('input_video')[0];
const out = document.getElementsByClassName('output')[0];
const outcontrolsElement = document.getElementsByClassName('control')[0];
const canvasCtx = out.getContext('2d');
const fpsControl = new FPS();

$(window).on('load', function () {
  setTimeout(loader, 3000)
});

function loader() {
  $('.divLoading').fadeOut(2000, function () { })
}

var velocidadeTiro = 10;
var x = window.innerWidth * 0.5 - 2;

function onResultsFace(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, out.width, out.height);
  canvasCtx.drawImage(
    results.image, 0, 0, out.width, out.height);
  if (results.detections.length > 0) {

    const nave = document.getElementById("nave");

    const noseLandmark = results.detections[0].landmarks[3];

    var pontoX = noseLandmark.x * jogo.width;

    x = pontoX;

    if (!enemyDead) {
      atirar(x)
    }
    tiroAcertou()
    tiroAcertou2()

    isEnemyDie()

    // TODO: rotina aleatória para o borboleto

    //Movimentação da nave, com conferencia de colisão com as paredes laterais
    if ((pontoX + nave.width / 2) <= window.innerWidth && (pontoX + nave.width / 2) >= 0 + nave.width) {
      nave.style.left = (pontoX - nave.width / 2) + "px";
    }

    drawLandmarks(canvasCtx, results.detections[0].landmarks, {
      color: 'red',
      radius: 2,
    });

  }
  canvasCtx.restore();
}

// ----- Enemy ------
var enemy = document.getElementById('enemy')
var enemyCoord = enemy.getBoundingClientRect()
var enemyX = enemyCoord.x;
var enemyY = enemyCoord.y;
var virado = false;
let enemyDead = false;

function isVirado() {
  if (virado == true) {
    enemy.style.transform = 'scaleX(-1)'
  } else {
    enemy.style.transform = 'scaleX(1)'
  }
}

function enemyMoveLeft() {
  virado = false;
  isVirado()
  enemyX = 10;
  enemy.style.left = enemyX + 'px';
  virado = true;
  setInterval(isVirado)

  // Defina targetX e targetY com as coordenadas atualizadas
  targetX = enemyX + enemy.offsetWidth / 2;
  targetY = enemyY + enemy.offsetHeight / 2;

  // Chame a função loop para atualizar as partículas
  loop();
}

function enemyMoveRight() {
  virado = true;
  isVirado()
  enemyX = window.innerWidth - enemy.width - 10;
  enemy.style.left = enemyX + 'px';
  virado = false;
  setInterval(isVirado, 500)

  // Defina targetX e targetY com as coordenadas atualizadas
  targetX = enemyX + enemy.offsetWidth / 2;
  targetY = enemyY + enemy.offsetHeight / 2;

  // Chame a função loop para atualizar as partículas
  loop();
}

function enemyMoveCenter() {
  virado = false; // O "enemy" não precisa estar virado para mover para o centro
  isVirado();

  // Defina o "enemy" no centro da tela
  enemyX = (window.innerWidth - enemy.offsetWidth) / 2;
  enemy.style.left = enemyX + 'px';

  // Defina targetX e targetY com as coordenadas atualizadas
  targetX = enemyX + enemy.offsetWidth / 2;
  targetY = enemyY + enemy.offsetHeight / 2;

  // Chame a função loop para atualizar as partículas
  loop();
}

function enemyAttack() {
  // Defina a posição de ataque (por exemplo, na parte inferior da tela)
  var attackY = jogo.height - enemy.offsetHeight;

  // Defina a posição vertical do "enemy" para o ataque
  enemy.style.top = attackY + 'px';

  // Defina a posição horizontal do "enemy" para o ataque
  var attackX = enemyX;  // Defina a posição horizontal para o ataque
  setTimeout(enemyBack, 1500);

  // Atualize as coordenadas de destino (targetX e targetY) com as coordenadas atualizadas
  targetX = attackX + enemy.offsetWidth / 2;
  targetY = attackY + enemy.offsetHeight / 2;

  // Execute a animação de ataque (se necessário)
  enemy.style.animationName = 'damage';

  // Chame a função loop para atualizar as partículas
  loop();
}

function enemyBack() {

  inimigoAcertou();

  atacou = false;

  isAllyDie(allyLife);

  // Defina a posição vertical do "enemy" de volta à posição original
  enemy.style.top = '2%';

  // Atualize as coordenadas de destino (targetX e targetY) com as coordenadas atualizadas
  targetX = enemyX + enemy.offsetWidth / 2;
  targetY = enemyY + enemy.offsetHeight / 2;

  loop();
}

function movimentosAleatorios() {
  return Math.floor(Math.random() * 4) + 1
}

var ataqueAnterior = 4;
var tipoAtaque;

function executarRotina() {

  tipoAtaque = movimentosAleatorios();

  if (tipoAtaque != ataqueAnterior) {

    ataqueAnterior = tipoAtaque;

    // Caso morra ele nao deixa ele se mover
    if (!enemyDead) {
      switch (tipoAtaque) {
        case 1:
          enemyMoveLeft()
          console.log('Esquerda')
          break;

        case 2:
          enemyMoveCenter()
          console.log('Centro')
          break;

        case 3:
          enemyMoveRight()
          console.log('Direita')
          break;

        case 4:
          enemyAttack()
          console.log('Ataque')
          break;

        default:
          break;
      }
    }

  } else {
    executarRotina()
    return
  }

  setTimeout(executarRotina, 2000)

}

setTimeout(executarRotina, 2500)

// ----- Colisão Enemy x Tiro ------ 
//Tiro 1

var tiro = document.getElementById('tiro');
var tiroCoordenada = tiro.getBoundingClientRect();

var tiroX = tiroCoordenada.x;
var tiroY = tiroCoordenada.y;

//Tiro 2
var tiro2 = document.getElementById('tiro2');
var tiroCoordenada2 = tiro2.getBoundingClientRect();

var tiro2X = tiroCoordenada2.x;
var tiro2Y = tiroCoordenada2.y;
var colisaoDetectada = false;
var colisaoDetectada2 = false;

var lifeBar = document.getElementById('lifeEnemy');

function tiroAcertou() {
  if (colisaoDetectada == true) {
    return false;
  }

  var enemy = document.getElementById('enemy');
  var enemyCoord = enemy.getBoundingClientRect();

  var shoot = document.getElementById('tiro');
  var shootCoord = shoot.getBoundingClientRect();

  var enemyStats = { x: enemyCoord.x, y: enemyCoord.y, width: enemy.width, height: enemy.height };
  var shootStats = { x: shootCoord.x, y: shootCoord.y, width: 20, height: 36 }

  if (shootStats.x < enemyStats.x + enemyStats.width &&
    shootStats.x + shootStats.width > enemyStats.x &&
    shootStats.y < enemyStats.y + enemyStats.height &&
    shootStats.y + shootStats.height > enemyStats.y) {

    colisaoDetectada = true;

    shoot.style.visibility = 'hidden';

    enemy.style.animation = 'damage 0.5s ease 2';

    enemyLife--;
    perdevida()

    const lifeWidth = (enemyLife / QUANTITY) * 100;

    // ----- enemy LIFE ------
    lifeBar.style.width = lifeWidth + '%';

    return true;
  } else {
    return false;
  }
}

function tiroAcertou2() {
  if (colisaoDetectada2 == true) {
    return false;
  }

  var enemy = document.getElementById('enemy');
  var enemyCoord = enemy.getBoundingClientRect();

  var shoot = document.getElementById('tiro2');
  var shootCoord = shoot.getBoundingClientRect();

  var enemyStats = { x: enemyCoord.x, y: enemyCoord.y, width: enemy.width, height: enemy.height };
  var shootStats = { x: shootCoord.x, y: shootCoord.y, width: 20, height: 36 }

  if (shootStats.x < enemyStats.x + enemyStats.width &&
    shootStats.x + shootStats.width > enemyStats.x &&
    shootStats.y < enemyStats.y + enemyStats.height &&
    shootStats.y + shootStats.height > enemyStats.y) {

    colisaoDetectada2 = true;

    shoot.style.visibility = 'hidden';
    enemy.style.animation = 'damage 0.5s ease 2';

    shootCoord.x = 3000;
    enemyLife--;
    perdevida()
    const lifeWidth = (enemyLife / QUANTITY) * 100;

    // ----- enemy LIFE ------
    lifeBar.style.width = lifeWidth + '%';

    console.log(enemyLife)
    return true;
  } else {
    return false;
  }
}

function isEnemyDie() {
  if (enemyLife <= 0 && !enemyDead) {

    enemyDead = true

    // Morte do Inimigo
    enemyExplosion();

    setTimeout(function () {
      //Mensagem de vitória
      mensagemVitoria();
    }, 1000
    )

    //Recarrega a tela
    setTimeout(function () {
      location.reload();
    }, 8000);
  }
}

function enemyExplosion() {
  const image = document.getElementById('enemy');
  image.src = 'images/undertaleExplosion.gif';
}

function mensagemVitoria() {
  const vitoria = document.getElementById('divVitoria');
  vitoria.style.display = 'flex';
}

// ----- Colisão Enemy x Ally -----
var allyLife = 3;
var atacou = false;

function inimigoAcertou() {

  if (atacou == true) {
    return false;
  }

  var enemy = document.getElementById('enemy');
  var enemyCoord = enemy.getBoundingClientRect();

  var ally = document.getElementById('nave');
  var allyCoord = ally.getBoundingClientRect();

  var enemyStats = { x: enemyCoord.x, y: enemyCoord.y, width: enemy.width, height: enemy.height };
  var allyStats = { x: allyCoord.x, y: allyCoord.y, width: ally.width, height: ally.height }

  if (allyStats.x < enemyStats.x + enemyStats.width &&
    allyStats.x + allyStats.width > enemyStats.x &&
    allyStats.y < enemyStats.y + enemyStats.height &&
    allyStats.y + allyStats.height > enemyStats.y) {

    atacou = true;

    allyLife--;
    console.log(allyLife)

    return true;
  } else {
    return false;
  }

}

function isAllyDie(life) {

  var heart1 = document.getElementById('heart1')
  var heart2 = document.getElementById('heart2')
  var heart3 = document.getElementById('heart3')
  const derrota = document.getElementById('divDerrota');


  switch (life) {
    case 0:
      heart1.style.filter = 'grayscale(1)'
      tiro.style.display = 'none'
      tiro2.style.display = 'none'
      derrota.style.display = 'flex';
      setTimeout(function () {
        location.reload();
      }, 8000);
      break;
    case 1:
      heart2.style.filter = 'grayscale(1)'
      break;
    case 2:
      heart3.style.filter = 'grayscale(1)'
      break;

    default:
      break;
  }
}

// ------ TIROS --------
var ativo = false;
var ativo2 = false;

function atirar(px) {
  if (!ativo) {
    ativo = true;
    var tiroY = tiroCoordenada.y;
    function moveTiro() {
      if (tiroY > -100) {
        tiroY -= 30;
        tiro.style.left = px + "px";
        tiro.style.top = tiroY + "px";
        setTimeout(moveTiro, velocidadeTiro);
        if (tiroY < window.innerHeight / 2 - 220) {
          atirar2(x)
        }
      } else {
        ativo = false;
        colisaoDetectada = false;
        tiro.style.visibility = 'visible'
        enemy.style.animation = '';
      }
    }
    moveTiro();
  }
}

function atirar2(px) {
  if (!ativo2) {
    ativo2 = true;
    var tiro2Y = tiroCoordenada2.y;
    function moveTiro() {
      if (tiro2Y > -100) {
        tiro2Y -= 30;
        tiro2.style.left = px + "px";
        tiro2.style.top = tiro2Y + "px";
        setTimeout(moveTiro, velocidadeTiro);
      } else {
        ativo2 = false;
        colisaoDetectada2 = false;
        tiro2.style.visibility = 'visible'
        enemy.style.animation = '';
      }
    }
    moveTiro();
  }
}

// ----- MediaPipe Sets -----
const faceDetection = new FaceDetection({

  locateFile: (file) => {
    return `js/mediapipe/${file}`;
  }


});

faceDetection.onResults(onResultsFace);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceDetection.send({ image: video });
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(outcontrolsElement, {
  selfieMode: true,
  minDetectionConfidence: 0.5,
  maxNumFaces: 1,
  minTrackingConfidence: 0.5,
})
  .add([
    new StaticText({ title: 'MediaPipe Face Detection' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on(options => {
    video.classList.toggle('selfie', options.selfieMode);
    faceDetection.setOptions(options);
  });

// ----- Rabiola -----
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var RADIUS = 70;

var RADIUS_SCALE = 1;
var RADIUS_SCALE_MIN = 1;
var RADIUS_SCALE_MAX = 1.5;

var QUANTITY = enemyLife;

var canvas;
var context;
var particles;

var targetX = enemy.x;
var targetY = enemy.y;

function init() {

  canvas = document.getElementById('jogo');

  if (canvas && canvas.getContext) {
    context = canvas.getContext('2d');

    createParticles();

    windowResizeHandler();

    setInterval(loop, 1000 / 60);
  }
}

function createParticles() {
  particles = [];

  for (var i = 0; i < QUANTITY; i++) {
    var particle = {
      size: 1,
      position: { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 },
      offset: { x: 0, y: 0 },
      shift: { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 },
      speed: velocidade + Math.random() * 0.04,
      targetSize: 1,
      fillColor: '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16),
      orbit: RADIUS * .5 + (RADIUS * .5 * Math.random())
    };

    particles.push(particle);
  }
}

function windowResizeHandler() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;

  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
}

function loop() {
  RADIUS_SCALE += (RADIUS_SCALE_MAX - RADIUS_SCALE) * (0.02);
  RADIUS_SCALE = Math.min(RADIUS_SCALE, RADIUS_SCALE_MAX);

  context.fillStyle = 'rgba(0,0,0,0.05)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  for (var i = 0, len = particles.length; i < len; i++) {
    var particle = particles[i];

    var lp = { x: particle.position.x, y: particle.position.y };

    particle.offset.x += particle.speed;
    particle.offset.y += particle.speed;

    particle.shift.x += (targetX - particle.shift.x) * (particle.speed);
    particle.shift.y += (targetY - particle.shift.y) * (particle.speed);

    particle.position.x = particle.shift.x + Math.cos(i + particle.offset.x) * (particle.orbit * RADIUS_SCALE);
    particle.position.y = particle.shift.y + Math.sin(i + particle.offset.y) * (particle.orbit * RADIUS_SCALE);

    particle.position.x = Math.max(Math.min(particle.position.x, SCREEN_WIDTH), 0);
    particle.position.y = Math.max(Math.min(particle.position.y, SCREEN_HEIGHT), 0);

    particle.size += (particle.targetSize - particle.size) * 0.05;

    if (Math.round(particle.size) == Math.round(particle.targetSize)) {
      particle.targetSize = 1 + Math.random() * 7;
    }

    context.beginPath();
    context.fillStyle = particle.fillColor;
    context.strokeStyle = particle.fillColor;
    context.lineWidth = particle.size;
    context.moveTo(lp.x, lp.y);
    context.lineTo(particle.position.x, particle.position.y);
    context.stroke();
    context.arc(particle.position.x, particle.position.y, particle.size / 2, 0, Math.PI * 2, true);
    context.fill();

  }
}

function perdevida() {
  particles.pop();
}

window.onload = init;