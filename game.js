// ============================================
// CONFIGURAÇÃO INICIAL
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const livesDisplay = document.getElementById('lives');

// Configuração do canvas
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Ajustar canvas para mobile (responsivo)
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight - 200; // Espaço para UI e controles
    
    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1); // Não aumentar além do tamanho original
    
    canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
}

// Ajustar canvas ao carregar e redimensionar
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});
resizeCanvas();

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let gameRunning = true;
let lastTime = 0;
let gameTime = 0;
let playerSprite = null;

// ============================================
// CLASSE JOGADOR
// ============================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -15;
        this.gravity = 0.8;
        this.onGround = false;
        this.direction = 1; // 1 = direita, -1 = esquerda
        this.lives = 3;
        
        // FASE 2: Sistema de invencibilidade
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.blinkTime = 0;
        this.knockbackX = 0;
        this.knockbackTime = 0;
    }

    update(keys) {
        // Aplicar gravidade
        if (!this.onGround) {
            this.velocityY += this.gravity;
        }

        // Movimentação horizontal
        this.velocityX = 0;
        if (keys['a'] || keys['A']) {
            this.velocityX = -this.speed;
            this.direction = -1; // Olhando para esquerda
        }
        if (keys['d'] || keys['D']) {
            this.velocityX = this.speed;
            this.direction = 1; // Olhando para direita
        }

        // Pulo (W)
        if ((keys['w'] || keys['W']) && this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
        }

        // FASE 2: Aplicar knockback (reduz gradualmente)
        if (this.knockbackTime > 0) {
            this.velocityX += this.knockbackX;
            // Reduzir o knockback gradualmente
            this.knockbackX *= 0.8;
            this.knockbackTime--;
            if (Math.abs(this.knockbackX) < 0.1) {
                this.knockbackX = 0;
                this.knockbackTime = 0;
            }
        }

        // Atualizar posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Colisão com chão
        const groundY = canvas.height - 100;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }

        // Limites laterais
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
            this.knockbackX = 0; // Resetar knockback se bater na parede
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.velocityX = 0;
            this.knockbackX = 0; // Resetar knockback se bater na parede
        }

        // Limite superior (evitar sair voando)
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }

        // FASE 2: Atualizar invencibilidade
        if (this.invulnerable) {
            this.invulnerableTime--;
            this.blinkTime++;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
                this.blinkTime = 0;
            }
        }
    }

    takeDamage() {
        if (!this.invulnerable) {
            this.lives--;
            this.invulnerable = true;
            this.invulnerableTime = 60; // ~1 segundo a 60fps
            this.blinkTime = 0;
            
            // FASE 2: Knockback (só se estiver no chão)
            this.knockbackX = -this.direction * 6; // Empurra para trás (reduzido)
            this.knockbackTime = 8; // Duração reduzida
            
            // Mini salto apenas se estiver no chão
            if (this.onGround) {
                this.velocityY = -4; // Mini salto menor
                this.onGround = false;
            }
            
            livesDisplay.textContent = this.lives;
            
            if (this.lives <= 0) {
                gameRunning = false;
                alert('Game Over!');
            }
        }
    }

    draw() {
        // Se a sprite ainda não carregou, desenhar um quadrado temporário
        if (!playerSprite || !playerSprite.complete) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // FASE 2: Piscar quando invulnerável
        const isBlinking = this.invulnerable && Math.floor(this.blinkTime / 5) % 2 === 0;
        
        // Aplicar efeito de piscar usando globalAlpha
        if (isBlinking) {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 1.0;
        }

        // Salvar o contexto para aplicar transformações
        ctx.save();

        // Espelhar a imagem se estiver olhando para esquerda
        if (this.direction === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(playerSprite, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(playerSprite, this.x, this.y, this.width, this.height);
        }

        // Restaurar o contexto
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ============================================
// CLASSE PROJÉTIL
// ============================================

class Projectile {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 4;
        this.speed = 12;
        this.direction = direction;
        this.active = true;
        
        // FASE 2: Animação do tiro
        this.life = 0;
    }

    update() {
        this.x += this.speed * this.direction;
        this.life++;
        
        // Remover se sair da tela
        if (this.x < 0 || this.x > canvas.width) {
            this.active = false;
        }
    }

    draw() {
        // FASE 2: Animação do tiro (espessura e cor variam)
        const alpha = Math.max(0.5, 1 - this.life / 100);
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Brilho do tiro
        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
        ctx.fillRect(this.x - 2, this.y - 1, this.width + 4, this.height + 2);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// ============================================
// CLASSE INIMIGO
// ============================================

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + (gameTime / 10000); // FASE 2: Velocidade progressiva
        this.active = true;
        
        // FASE 2: Animação
        this.animationOffset = Math.random() * Math.PI * 2;
        this.colorOffset = 0;
    }

    update(playerX) {
        // Mover em direção ao jogador
        if (this.x < playerX) {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }

        // FASE 2: Atualizar animação
        this.colorOffset += 0.1;
        
        // Remover se sair da tela
        if (this.x < -50 || this.x > canvas.width + 50) {
            this.active = false;
        }
    }

    draw() {
        // FASE 2: Animação de cor e movimento suave
        const groundY = canvas.height - 100;
        const bounce = Math.sin(this.colorOffset + this.animationOffset) * 2;
        
        ctx.fillStyle = `hsl(${Math.sin(this.colorOffset) * 30 + 0}, 70%, 50%)`;
        ctx.fillRect(this.x, this.y + bounce, this.width, this.height);
        
        // Olhos do inimigo
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 5, this.y + 8 + bounce, 6, 6);
        ctx.fillRect(this.x + 19, this.y + 8 + bounce, 6, 6);
    }

    getBounds() {
        const groundY = canvas.height - 100;
        const bounce = Math.sin(this.colorOffset + this.animationOffset) * 2;
        return {
            x: this.x,
            y: this.y + bounce,
            width: this.width,
            height: this.height
        };
    }
}

// ============================================
// SISTEMA DE COLISÃO
// ============================================

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ============================================
// GERENCIAMENTO DO JOGO
// ============================================

// Carregar sprite do jogador
playerSprite = new Image();
playerSprite.src = 'adventurer-idle-2-01.png';
playerSprite.onerror = function() {
    console.error('Erro ao carregar a sprite do jogador');
};

const player = new Player(canvas.width / 2, canvas.height - 200);
const projectiles = [];
const enemies = [];
const keys = {};

// FASE 2: Sistema de cooldown para tiro
let shootCooldown = 0;
const SHOOT_COOLDOWN_TIME = 15; // ~0.25s a 60fps

// FASE 2: Sistema de spawn de inimigos
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 120; // ~2s a 60fps

// ============================================
// CONTROLES MOBILE
// ============================================

// Funções para controles touch e mouse (globais para uso no HTML)
window.handleTouchStart = function(event, key) {
    event.preventDefault();
    keys[key] = true;
    
    // Disparo especial para botão P
    if (key === 'p' && shootCooldown <= 0) {
        const eyeX = player.direction === 1 
            ? player.x + player.width 
            : player.x;
        const eyeY = player.y + player.height / 2;
        
        projectiles.push(new Projectile(eyeX, eyeY, player.direction));
        shootCooldown = SHOOT_COOLDOWN_TIME;
    }
};

window.handleTouchEnd = function(event, key) {
    event.preventDefault();
    keys[key] = false;
};

window.handleMouseDown = function(event, key) {
    event.preventDefault();
    keys[key] = true;
    
    // Disparo especial para botão P
    if (key === 'p' && shootCooldown <= 0) {
        const eyeX = player.direction === 1 
            ? player.x + player.width 
            : player.x;
        const eyeY = player.y + player.height / 2;
        
        projectiles.push(new Projectile(eyeX, eyeY, player.direction));
        shootCooldown = SHOOT_COOLDOWN_TIME;
    }
};

window.handleMouseUp = function(event, key) {
    event.preventDefault();
    keys[key] = false;
};

// Prevenir comportamento padrão de touch no canvas
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
}, { passive: false });

// Event listeners para teclado (desktop)
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Disparo (P)
    if ((e.key === 'p' || e.key === 'P') && shootCooldown <= 0) {
        const eyeX = player.direction === 1 
            ? player.x + player.width 
            : player.x;
        const eyeY = player.y + player.height / 2;
        
        projectiles.push(new Projectile(eyeX, eyeY, player.direction));
        shootCooldown = SHOOT_COOLDOWN_TIME;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ============================================
// LOOP PRINCIPAL DO JOGO
// ============================================

function gameLoop(currentTime) {
    if (!gameRunning) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    gameTime += deltaTime;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar chão
    const groundY = canvas.height - 100;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Grama no chão
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, groundY, canvas.width, 10);

    // Atualizar cooldown do tiro
    if (shootCooldown > 0) {
        shootCooldown--;
    }

    // FASE 2: Spawn de inimigos com intervalo ajustável
    enemySpawnTimer++;
    if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
        enemySpawnTimer = 0;
        
        // Spawnar de ambos os lados aleatoriamente
        const side = Math.random() < 0.5 ? -30 : canvas.width + 30;
        const groundY = canvas.height - 100;
        enemies.push(new Enemy(side, groundY - 30));
    }

    // Atualizar jogador
    player.update(keys);
    player.draw();

    // Atualizar e desenhar projéteis
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update();
        
        if (proj.active) {
            proj.draw();
            
            // Colisão projétil vs inimigo
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (enemy.active && checkCollision(proj.getBounds(), enemy.getBounds())) {
                    enemy.active = false;
                    proj.active = false;
                    enemies.splice(j, 1);
                    break;
                }
            }
        } else {
            projectiles.splice(i, 1);
        }
    }

    // Atualizar e desenhar inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(player.x);
        
        if (enemy.active) {
            enemy.draw();
            
            // Colisão inimigo vs jogador
            if (checkCollision(enemy.getBounds(), player.getBounds())) {
                player.takeDamage();
                enemy.active = false;
                enemies.splice(i, 1);
            }
        } else {
            enemies.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
requestAnimationFrame(gameLoop);

