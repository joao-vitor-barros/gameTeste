Quero que você desenvolva um jogo 2D de plataforma estilo Mario, feito inteiramente para rodar no navegador, usando HTML + CSS + JavaScript (Canvas) ou framework minimalista (como Phaser.js) se preferir.

🎮 OBJETIVO DO JOGO

O jogador controla um quadrado com movimentos WASD e pode atirar com a tecla P.
O tiro deve sair na direção que o “olho” do quadrado estiver olhando — para esquerda ou direita.

Inimigos vêm dos dois lados da tela, lentamente, e ao encostar no jogador:

causam 1 de dano

o jogador tem 3 vidas

📌 REQUISITOS DA FASE 1 — Criar a BASE do jogo

Implemente:

1. Controlador do jogador

Quadrado simples

Movimentação WASD (W = pulo)

Gravidade e colisão com chão

Direção do “olho”: esquerda/direita conforme última tecla pressionada

Tecla P para atirar:

projétil simples

viaja na direção do olho

2. Inimigos

Spawna inimigos lentos nas laterais da tela

Movem-se em direção ao jogador

Se encostarem no jogador → perde 1 vida

3. Sistema de vidas

Começa com 3 vidas

Mostrar na tela

4. Loop do jogo

Atualização de:

física

inimigos

tiros

colisões

Renderização no Canvas

5. Estrutura limpa

Código organizado

Funções separadas

Comentários explicando cada parte

📌 REQUISITOS DA FASE 2 — Polimento das mecânicas

Depois que a base estiver pronta, refine:

1. Feedback de dano

Quando o jogador levar dano:

personagem dá um mini salto para trás (knockback)

quadrado pisca em branco por ~0.3s (invencibilidade temporária)

som opcional (se quiser implementar)

2. Melhoria do disparo

cooldown

animação simples do tiro (espessura, cor, velocidade ajustada)

3. Melhoria dos inimigos

animação simples (mudança de cor, deslocamento suave)

spawn com intervalo ajustável

velocidade progressiva conforme o tempo

4. Refinar colisões

Colisão suave piso/jogador

Hitbox dos tiros otimizada

📌 ENTRADAS

Gere:

Um arquivo HTML

Um arquivo CSS simples

Um arquivo JS com todo o código do jogo

Organização clara e comentada

📌 SAÍDA ESPERADA

Primeiro produza a fase 1 completa.
Depois de pronta, produza a fase 2, aprimorando o mesmo código.
Não use frameworks pesados, apenas o necessário.