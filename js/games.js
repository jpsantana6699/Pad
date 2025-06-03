function addToSimonSequence() {
    const randomIndex = Math.floor(Math.random() * teclas.length);
    simonGame.sequence.push(teclas[randomIndex].nome);
}

function playSimonSequence() {
    let index = 0;
    const playNext = () => {
        if (index >= simonGame.sequence.length) {
            simonGame.playerSequence = [];
            document.getElementById('simon-status').textContent = 'Sua vez!';
            return;
        }
        
        const soundName = simonGame.sequence[index];
        const tecla = teclas.find(t => t.nome === soundName);
        
        const button = document.querySelector(`.${tecla.classe}`);
        button.classList.add('simon-highlight');
        
        tocaSom(tecla.audio);
        
        setTimeout(() => {
            button.classList.remove('simon-highlight');
            index++;
            setTimeout(playNext, 500);
        }, 500);
    };
    
    document.getElementById('simon-status').textContent = 'Memorize a sequência...';
    setTimeout(playNext, 1000);
}

function checkSimonInput(soundName) {
    if (!simonGame.active) return;
    
    simonGame.playerSequence.push(soundName);
    
    const currentIndex = simonGame.playerSequence.length - 1;
    if (simonGame.playerSequence[currentIndex] !== simonGame.sequence[currentIndex]) {
        document.getElementById('simon-status').textContent = 'Game Over! Tente novamente.';
        simonGame.active = false;
        return;
    }
    
    if (simonGame.playerSequence.length === simonGame.sequence.length) {
        simonGame.level++;
        document.getElementById('simon-score').textContent = `Nível: ${simonGame.level}`;
        
        addToSimonSequence();
        
        setTimeout(() => {
            playSimonSequence();
        }, 1000);
    }
}

const challenges = [
    {
        name: "Velocidade",
        description: "Toque 10 sons em 5 segundos",
        check: () => gameState.recentClicks >= 10,
        reward: "🏃 Speedster"
    },
    {
        name: "Diversidade",
        description: "Use todos os botões pelo menos uma vez",
        check: () => Object.keys(gameState.buttonClicks).length >= teclas.length,
        reward: "🌈 Explorer"
    }
];

function updateGameStats(audioId) {
    gameState.totalClicks++;
    
    const soundName = audioId.replace('som_tecla_', '');
    gameState.buttonClicks[soundName] = (gameState.buttonClicks[soundName] || 0) + 1;
    
    document.getElementById('total-clicks').textContent = `Total: ${gameState.totalClicks} clicks`;
    
    const button = document.querySelector(`[data-sound="${soundName}"]`);
    if (button) {
        const counter = button.querySelector('.click-counter');
        if (counter) {
            counter.textContent = gameState.buttonClicks[soundName];
        }
    }
    
    checkAchievements();
    
    localStorage.setItem('gameStats', JSON.stringify(gameState));
}

function loadGameStats() {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
        
        document.getElementById('total-clicks').textContent = `Total: ${gameState.totalClicks} clicks`;
        
        Object.keys(gameState.buttonClicks).forEach(soundName => {
            const button = document.querySelector(`[data-sound="${soundName}"]`);
            if (button) {
                const counter = button.querySelector('.click-counter');
                if (counter) {
                    counter.textContent = gameState.buttonClicks[soundName];
                }
            }
        });
    }
}

function showAchievement(name) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <h3>🏆 Conquista Desbloqueada!</h3>
        <p>${name}</p>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function loadAchievements() {
    const achievementsDiv = document.getElementById('achievements');
    gameState.achievements.forEach(id => {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-badge';
        achievement.textContent = '🏆';
        achievementsDiv.appendChild(achievement);
    });
}
