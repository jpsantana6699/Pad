const teclas = [
    { nome: 'Jack', classe: 'tecla_Jack', audio: 'som_tecla_Jack', key: 'q' },
    { nome: 'Tome', classe: 'tecla_Tome', audio: 'som_tecla_Tome', key: 'w' },
    { nome: 'Dom', classe: 'tecla_Dom', audio: 'som_tecla_Dom', key: 'e' },
    { nome: 'Oruan', classe: 'tecla_Oruan', audio: 'som_tecla_Oruan', key: 'a' },
    { nome: 'Chavin', classe: 'tecla_Chavin', audio: 'som_tecla_Chavin', key: 's' },
    { nome: 'Morango', classe: 'tecla_Morango', audio: 'som_tecla_Morango', key: 'd' },
    { nome: 'Cebolinha', classe: 'tecla_Cebolinha', audio: 'som_tecla_Cebolinha', key: 'z' },
    { nome: 'Tung', classe: 'tecla_Tung', audio: 'som_tecla_Tung', key: 'x' },
    { nome: 'Grosso', classe: 'tecla_Grosso', audio: 'som_tecla_Grosso', key: 'c' },
    { nome: 'Cavalo', classe: 'tecla_Cavalo', audio: 'som_tecla_Cavalo', key: 'r' },
    { nome: 'Otario', classe: 'tecla_Otario', audio: 'som_tecla_Otario', key: 't' },
    { nome: 'Uepa', classe: 'tecla_Uepa', audio: 'som_tecla_Uepa', key: 'y' },
    { nome: 'Ronaldinho', classe: 'tecla_Ronaldinho', audio: 'som_tecla_Ronaldinho', key: 'f' },
    { nome: 'Ovo', classe: 'tecla_Ovo', audio: 'som_tecla_Ovo', key: 'g' },
    { nome: 'Vinhetada', classe: 'tecla_Vinhetada', audio: 'som_tecla_Vinhetada', key: 'h' }
];

let mediaRecorder, recordedChunks = [], allAudios = [];
let loopMode = false, isRecordingSequence = false;
let sequence = [], playingSequence = false;
let metronomeInterval, bpm = 120, metronomeActive = false;
let masterVolume = 1, masterPitch = 1;

let simonGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    active: false,
    currentStep: 0,
    showingSequence: false
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAudios();
    setupTeclas();
    setupKeyboardShortcuts();
    setupThemeToggle();
    setupStopAllButton();
    setupRecording();
    setupSharing();
    setupSequencer();
    setupMetronome();
    setupFullscreen();
    setupThemeSelector();
    setupSimpleGames();
    setupIndividualControls();
    setupMasterControls();
});

function initializeAudios() {
    allAudios = document.querySelectorAll('audio');
}

function tocaSom(audioId) {
    const audio = document.querySelector(`#${audioId}`);
    if (audio) {
        audio.currentTime = 0;
        // Aplicar volume master e pitch global sempre
        audio.volume = masterVolume;
        audio.playbackRate = masterPitch;
        audio.play();
        
        if (isRecordingSequence) {
            const lastTime = sequence.length > 0 ? sequence[sequence.length - 1].time : Date.now();
            sequence.push({
                sound: audioId,
                time: Date.now(),
                delay: Date.now() - lastTime
            });
        }
    }
}

function setupTeclas() {
    teclas.forEach(tecla => {
        const botao = document.querySelector(`.${tecla.classe}`);
        if (botao) {
            botao.onclick = () => tocaSom(tecla.audio);
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        const tecla = teclas.find(t => t.key === key);
        
        if (tecla && !event.repeat) {
            const botao = document.querySelector(`.${tecla.classe}`);
            if (botao) {
                botao.classList.add('ativa');
                tocaSom(tecla.audio);
            }
        }
    });

    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        const tecla = teclas.find(t => t.key === key);
        
        if (tecla) {
            const botao = document.querySelector(`.${tecla.classe}`);
            if (botao) {
                botao.classList.remove('ativa');
            }
        }
    });
}

function setupIndividualControls() {
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const target = this.dataset.target;
            const audio = document.querySelector(`#som_tecla_${target}`);
            if (audio) {
                audio.volume = this.value / 100;
            }
        });
    });

    document.querySelectorAll('.pitch-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const target = this.dataset.target;
            const audio = document.querySelector(`#som_tecla_${target}`);
            if (audio) {
                audio.playbackRate = this.value;
            }
        });
    });
}

function setupStopAllButton() {
    const stopBtn = document.getElementById('stop-all');
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            allAudios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        });
    }
}

function setupThemeSelector() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('selectedTheme', theme);
        });
    });
    
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.body.classList.remove('theme-neon', 'theme-retro', 'theme-minimal', 'dark-theme');
    
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        });
    }
}

function setupRecording() {
    const recordBtn = document.getElementById('record-btn');
    const modal = document.getElementById('record-modal');
    const closeModal = document.querySelector('#record-modal .close');
    const startRecording = document.getElementById('start-recording');
    const stopRecording = document.getElementById('stop-recording');
    const saveRecording = document.getElementById('save-recording');

    if (recordBtn && modal) {
        recordBtn.addEventListener('click', () => modal.style.display = 'block');
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
    }
    if (startRecording) {
        startRecording.addEventListener('click', startRecord);
    }
    if (stopRecording) {
        stopRecording.addEventListener('click', stopRecord);
    }
    if (saveRecording) {
        saveRecording.addEventListener('click', saveRecord);
    }
}

async function startRecord() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = function(event) {
            recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(blob);
            const recordedAudio = document.getElementById('recorded-audio');
            if (recordedAudio) {
                recordedAudio.src = audioURL;
                recordedAudio.style.display = 'block';
            }
            
            const soundName = document.getElementById('sound-name');
            const saveBtn = document.getElementById('save-recording');
            if (soundName) soundName.style.display = 'block';
            if (saveBtn) saveBtn.style.display = 'block';
        };

        mediaRecorder.start();
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;
    } catch (error) {
        alert('Erro ao acessar microfone: ' + error.message);
    }
}

function stopRecord() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        document.getElementById('start-recording').disabled = false;
        document.getElementById('stop-recording').disabled = true;
    }
}

function saveRecord() {
    const soundName = document.getElementById('sound-name').value;
    if (!soundName) {
        alert('Por favor, digite um nome para o som');
        return;
    }

    alert('Som salvo com sucesso!');
    document.getElementById('record-modal').style.display = 'none';
}

function setupSharing() {
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'DJ JPZINNN - Meme Sound Pad',
                    text: 'Confira este sound pad de memes brasileiros!',
                    url: window.location.href
                });
            } else {
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    alert('Link copiado para a área de transferência!');
                });
            }
        });
    }
}

function setupSequencer() {
    const recordBtn = document.getElementById('seq-record');
    const playBtn = document.getElementById('seq-play');
    const clearBtn = document.getElementById('seq-clear');
    
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleSequenceRecording);
    }
    if (playBtn) {
        playBtn.addEventListener('click', playSequence);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSequence);
    }
}

function toggleSequenceRecording() {
    isRecordingSequence = !isRecordingSequence;
    const btn = document.getElementById('seq-record');
    
    if (isRecordingSequence) {
        sequence = [];
        btn.textContent = '⏹️ Parar Gravação';
        btn.style.background = 'red';
    } else {
        btn.textContent = '🔴 Gravar Sequência';
        btn.style.background = '';
        updateSequenceDisplay();
    }
}

function playSequence() {
    if (sequence.length === 0 || playingSequence) return;
    
    playingSequence = true;
    let index = 0;
    
    const playNext = () => {
        if (index >= sequence.length) {
            playingSequence = false;
            return;
        }
        
        const { sound, delay } = sequence[index];
        setTimeout(() => {
            tocaSom(sound);
            index++;
            playNext();
        }, delay || 500);
    };
    
    playNext();
}

function clearSequence() {
    sequence = [];
    updateSequenceDisplay();
}

function updateSequenceDisplay() {
    const display = document.getElementById('sequence-display');
    if (display) {
        display.textContent = `Sequência: ${sequence.length} sons gravados`;
    }
}

function setupMetronome() {
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const metronomeBtn = document.getElementById('metronome-toggle');
    
    if (bpmSlider && bpmDisplay) {
        bpmSlider.addEventListener('input', function() {
            bpm = this.value;
            bpmDisplay.textContent = bpm;
            if (metronomeActive) {
                stopMetronome();
                startMetronome();
            }
        });
    }

    if (metronomeBtn) {
        metronomeBtn.addEventListener('click', toggleMetronome);
    }
}

function toggleMetronome() {
    metronomeActive = !metronomeActive;
    const btn = document.getElementById('metronome-toggle');
    
    if (metronomeActive) {
        startMetronome();
        btn.style.background = 'green';
    } else {
        stopMetronome();
        btn.style.background = '';
    }
}

function startMetronome() {
    const interval = 60000 / bpm; // Converte BPM para milissegundos
    metronomeInterval = setInterval(() => {
        // Tenta usar um áudio mais simples primeiro
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = 800; // Frequência do click
            gain.gain.value = 0.1 * masterVolume;
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Fallback: usar um som de click HTML5
            const clickSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfBnKZ3/NydCMEo');
            clickSound.volume = masterVolume * 0.3;
            clickSound.playbackRate = masterPitch;
            clickSound.play().catch(() => {
                console.log('Metrônomo: fallback também falhou');
            });
        }
    }, interval);
}

function stopMetronome() {
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }
}

function setupFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function setupSimpleGames() {
    const simonBtn = document.getElementById('simon-btn');
    const challengesBtn = document.getElementById('challenges-btn');
    const simonModal = document.getElementById('simon-modal');
    const simonClose = document.querySelector('.simon-close');
    const simonStart = document.getElementById('simon-start');
    
    if (simonBtn && simonModal) {
        simonBtn.addEventListener('click', function() {
            simonModal.style.display = 'block';
        });
    }
    
    if (simonClose) {
        simonClose.addEventListener('click', function() {
            simonModal.style.display = 'none';
            resetSimonGame();
        });
    }
    
    if (simonStart) {
        simonStart.addEventListener('click', startSimonGame);
    }
    
    if (challengesBtn) {
        challengesBtn.addEventListener('click', function() {
            showChallenge();
        });
    }
    
    teclas.forEach(tecla => {
        const botao = document.querySelector(`.${tecla.classe}`);
        if (botao) {
            botao.addEventListener('click', () => {
                if (simonGame.active && !simonGame.showingSequence) {
                    handleSimonInput(tecla.nome);
                }
            });
        }
    });
}

function startSimonGame() {
    resetSimonGame();
    simonGame.active = true;
    simonGame.level = 1;
    simonGame.sequence = [];
    simonGame.playerSequence = [];
    
    addToSimonSequence();
    showSimonSequence();
    
    document.getElementById('simon-score').textContent = `Nível: ${simonGame.level}`;
    document.getElementById('simon-status').textContent = 'Memorize a sequência...';
}

function resetSimonGame() {
    simonGame.active = false;
    simonGame.showingSequence = false;
    simonGame.sequence = [];
    simonGame.playerSequence = [];
    simonGame.level = 1;
    simonGame.currentStep = 0;
}

function addToSimonSequence() {
    const randomIndex = Math.floor(Math.random() * teclas.length);
    simonGame.sequence.push(teclas[randomIndex].nome);
}

function showSimonSequence() {
    simonGame.showingSequence = true;
    simonGame.playerSequence = [];
    let index = 0;
    
    const showNext = () => {
        if (index >= simonGame.sequence.length) {
            simonGame.showingSequence = false;
            document.getElementById('simon-status').textContent = 'Sua vez! Reproduza a sequência.';
            return;
        }
        
        const soundName = simonGame.sequence[index];
        const tecla = teclas.find(t => t.nome === soundName);
        const botao = document.querySelector(`.${tecla.classe}`);
        
        botao.classList.add('simon-highlight');
        tocaSom(tecla.audio);
        
        setTimeout(() => {
            botao.classList.remove('simon-highlight');
            index++;
            setTimeout(showNext, 600);
        }, 400);
    };
    
    setTimeout(showNext, 1000);
}

function handleSimonInput(soundName) {
    simonGame.playerSequence.push(soundName);
    
    const currentIndex = simonGame.playerSequence.length - 1;
    if (simonGame.playerSequence[currentIndex] !== simonGame.sequence[currentIndex]) {
        document.getElementById('simon-status').textContent = `Game Over! Você chegou ao nível ${simonGame.level}`;
        simonGame.active = false;
        return;
    }
    
    if (simonGame.playerSequence.length === simonGame.sequence.length) {
        simonGame.level++;
        document.getElementById('simon-score').textContent = `Nível: ${simonGame.level}`;
        document.getElementById('simon-status').textContent = 'Parabéns! Próximo nível...';
        
        addToSimonSequence();
        
        setTimeout(() => {
            showSimonSequence();
        }, 1500);
    }
}

function showChallenge() {
    const challenges = [
        "Toque todos os botões em ordem alfabética!",
        "Crie uma sequência de 5 sons diferentes!",
        "Toque apenas os sons que começam com vogais!",
        "Faça um ritmo usando só 3 botões!",
        "Toque os botões da esquerda para direita!"
    ];
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    alert(`🎯 Desafio: ${randomChallenge}`);
}

function setupMasterControls() {
    const masterVolumeSlider = document.getElementById('master-volume');
    const masterPitchSlider = document.getElementById('master-pitch');
    
    if (masterVolumeSlider) {
        masterVolumeSlider.addEventListener('input', function() {
            masterVolume = this.value / 100;
            // Aplica o volume master a todos os áudios imediatamente
            allAudios.forEach(audio => {
                audio.volume = masterVolume;
            });
        });
    }

    if (masterPitchSlider) {
        masterPitchSlider.addEventListener('input', function() {
            masterPitch = parseFloat(this.value);
            // Aplica o pitch master a todos os áudios imediatamente
            allAudios.forEach(audio => {
                audio.playbackRate = masterPitch;
            });
        });
    }
}