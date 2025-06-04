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
    { nome: 'Jojo', classe: 'tecla_Jojo', audio: 'som_tecla_Jojo', key: 'r' },
    { nome: 'Qi', classe: 'tecla_Qi', audio: 'som_tecla_Qi', key: 't' },
    { nome: 'Ruby', classe: 'tecla_Ruby', audio: 'som_tecla_Ruby', key: 'y' },
    { nome: 'Sai', classe: 'tecla_Sai', audio: 'som_tecla_Sai', key: 'f' },
    { nome: 'Titan', classe: 'tecla_Titan', audio: 'som_tecla_Titan', key: 'g' },
    { nome: 'Nayn', classe: 'tecla_Nayn', audio: 'som_tecla_Nayn', key: 'h' }
];

// Variáveis globais
let allAudios = [];
let masterVolume = 1;
let masterPitch = 1;
let sequence = [];
let isRecordingSequence = false;
let playingSequence = false;
let metronomeInterval = null;
let bpm = 120;
let metronomeActive = false;
let mediaRecorder, recordedChunks = [];

// Configuração do jogo Simon Says
let simonGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    active: false,
    showingSequence: false
};

document.addEventListener('DOMContentLoaded', function() {
    // Carregar todos os elementos de áudio
    allAudios = document.querySelectorAll('audio');
    
    // Configurar todos os sistemas
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
    setupMasterControls();
    setupEffectsPanel();
    setupExportSystem();
    setupFavoritesSystem();
});

// Função para tocar o som
function tocaSom(audioId) {
    const audio = document.getElementById(audioId);
    if (audio) {
        try {
            audio.currentTime = 0;
            audio.volume = masterVolume;
            audio.playbackRate = masterPitch;
            
            // Garantir que o áudio começa a tocar
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Erro ao tocar áudio:', error);
                });
            }
            
            // Registrar na sequência se estiver gravando
            if (isRecordingSequence) {
                const lastTime = sequence.length > 0 ? sequence[sequence.length - 1].time : Date.now();
                sequence.push({
                    sound: audioId,
                    time: Date.now(),
                    delay: Date.now() - lastTime
                });
                updateSequenceDisplay();
            }
        } catch (err) {
            console.error('Erro ao manipular áudio:', err);
        }
    }
}

function setupTeclas() {
    teclas.forEach(tecla => {
        const botao = document.querySelector(`.${tecla.classe}`);
        if (botao) {
            botao.onclick = function() {
                tocaSom(tecla.audio);
                // Adiciona classe visual para animação
                botao.classList.add('ativa');
                setTimeout(() => {
                    botao.classList.remove('ativa');
                }, 150);
                
                // Verificar se está jogando Simon Says
                if (simonGame.active && !simonGame.showingSequence) {
                    handleSimonInput(tecla.nome);
                }
            };
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        
        // Evitar repetição enquanto a tecla estiver pressionada
        if (event.repeat) return;
        
        // Tecla P para parar todos os sons
        if (key === 'p') {
            allAudios.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            return;
        }
        
        // Encontrar a tecla correspondente
        const tecla = teclas.find(t => t.key === key);
        
        if (tecla) {
            // Encontrar o botão correspondente e adicionar classe visual para animação
            const botao = document.querySelector(`.${tecla.classe}`);
            if (botao) {
                botao.classList.add('ativa');
                
                // Tocar o som
                tocaSom(tecla.audio);
                
                // Verificar se está jogando Simon Says
                if (simonGame.active && !simonGame.showingSequence) {
                    handleSimonInput(tecla.nome);
                }
            }
        }
    });

    // Remover a classe visual quando a tecla for solta
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
        stopBtn.addEventListener('click', stopAllSounds);
    }
}

function stopAllSounds() {
    console.log('Parando todos os sons...');
    // Garantir que todos os elementos de áudio sejam pausados
    allAudios = document.querySelectorAll('audio'); // Atualizar referência
    allAudios.forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (err) {
            console.error('Erro ao parar áudio:', err);
        }
    });
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
        btn.textContent = '🔴 Gravar';
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
            bpm = parseInt(this.value);
            bpmDisplay.textContent = `${bpm} BPM`;
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
        btn.textContent = '⏹️ Parar Metrônomo';
    } else {
        stopMetronome();
        btn.style.background = '';
        btn.textContent = '🥁 Metrônomo';
    }
}

function startMetronome() {
    const interval = 60000 / bpm; // Converte BPM para milissegundos
    metronomeInterval = setInterval(() => {
        // Reproduzir som do metrônomo
        const metronomeSound = document.getElementById('metronome-sound');
        if (metronomeSound) {
            metronomeSound.currentTime = 0;
            metronomeSound.volume = masterVolume * 0.5;
            metronomeSound.play().catch(() => {
                // Fallback se o som do metrônomo falhar
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfBnKZ3/NydCME');
                audio.volume = masterVolume * 0.3;
                audio.play();
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
}

function startSimonGame() {
    resetSimonGame();
    simonGame.active = true;
    simonGame.level = 1;
    simonGame.sequence = [];
    simonGame.playerSequence = [];
    simonGame.showingSequence = false;
    
    // Adiciona o primeiro som à sequência
    addToSimonSequence();
    
    // Atualiza displays
    document.getElementById('simon-score').textContent = `Nível: ${simonGame.level}`;
    document.getElementById('simon-status').textContent = 'Preparando sequência...';
    
    // Inicia mostrando a sequência
    setTimeout(() => {
        showSimonSequence();
    }, 500);
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
    
    document.getElementById('simon-status').textContent = `Memorize a sequência... (${simonGame.sequence.length} sons)`;
    
    const showNext = () => {
        if (index >= simonGame.sequence.length) {
            simonGame.showingSequence = false;
            document.getElementById('simon-status').textContent = `Sua vez! Reproduza a sequência de ${simonGame.sequence.length} sons.`;
            return;
        }
        
        const soundName = simonGame.sequence[index];
        const tecla = teclas.find(t => t.nome === soundName);
        
        if (tecla) {
            const botao = document.querySelector(`.${tecla.classe}`);
            
            if (botao) {
                botao.classList.add('simon-highlight');
                tocaSom(tecla.audio);
                
                setTimeout(() => {
                    botao.classList.remove('simon-highlight');
                    index++;
                    setTimeout(showNext, 600); // Pausa entre sons
                }, 500); // Duração do highlight
            }
        }
    };
    
    // Pequena pausa antes de começar
    setTimeout(showNext, 1000);
}

function handleSimonInput(soundName) {
    if (!simonGame.active || simonGame.showingSequence) return;
    
    simonGame.playerSequence.push(soundName);
    
    const currentIndex = simonGame.playerSequence.length - 1;
    
    // Verifica se o som está correto
    if (simonGame.playerSequence[currentIndex] !== simonGame.sequence[currentIndex]) {
        document.getElementById('simon-status').textContent = `Game Over! Você completou ${simonGame.level - 1} níveis.`;
        simonGame.active = false;
        
        // Destacar a sequência correta por alguns segundos
        setTimeout(() => {
            document.getElementById('simon-status').textContent = 'Clique em "Iniciar Jogo" para tentar novamente';
        }, 3000);
        return;
    }
    
    // Se completou a sequência atual
    if (simonGame.playerSequence.length === simonGame.sequence.length) {
        document.getElementById('simon-status').textContent = `Nível ${simonGame.level} completo! Próximo nível...`;
        simonGame.level++;
        document.getElementById('simon-score').textContent = `Nível: ${simonGame.level}`;
        
        // Adiciona novo som à sequência
        addToSimonSequence();
        
        // Aguarda um pouco antes de mostrar a próxima sequência
        setTimeout(() => {
            showSimonSequence();
        }, 1500);
    } else {
        // Som correto, mas sequência ainda não completa
        document.getElementById('simon-status').textContent = `Correto! Continue a sequência... (${simonGame.playerSequence.length}/${simonGame.sequence.length})`;
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
    const masterVolumeDisplay = document.getElementById('master-volume-display');
    const masterPitchSlider = document.getElementById('master-pitch');
    const masterPitchDisplay = document.getElementById('master-pitch-display');
    
    if (masterVolumeSlider && masterVolumeDisplay) {
        masterVolumeSlider.addEventListener('input', function() {
            masterVolume = this.value / 100;
            masterVolumeDisplay.textContent = `${this.value}%`;
            // Aplica o volume master a todos os áudios imediatamente
            allAudios.forEach(audio => {
                audio.volume = masterVolume;
            });
        });
    }

    if (masterPitchSlider && masterPitchDisplay) {
        masterPitchSlider.addEventListener('input', function() {
            masterPitch = parseFloat(this.value);
            masterPitchDisplay.textContent = `${this.value}x`;
            // Aplica o pitch master a todos os áudios imediatamente
            allAudios.forEach(audio => {
                audio.playbackRate = masterPitch;
            });
        });
    }
}

// Sistema de efeitos de áudio (versão simplificada)
function setupEffectsPanel() {
    const reverbToggle = document.getElementById('reverb-effect');
    const reverbSlider = document.getElementById('reverb-amount');
    const delayToggle = document.getElementById('delay-effect');
    const delaySlider = document.getElementById('delay-amount');
    const distortionToggle = document.getElementById('distortion-effect');
    const distortionSlider = document.getElementById('distortion-amount');
    const presetButtons = document.querySelectorAll('[data-preset]');

    // Configurar presets
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const presetName = this.dataset.preset;
            
            // Aplicar configurações do preset
            if (presetName === 'clean') {
                // Limpo - todos os efeitos desligados
                reverbToggle.checked = false;
                delayToggle.checked = false;
                distortionToggle.checked = false;
            } else if (presetName === 'club') {
                // Club - reverb médio e delay curto
                reverbToggle.checked = true;
                reverbSlider.value = 40;
                delayToggle.checked = true;
                delaySlider.value = 20;
                distortionToggle.checked = false;
            } else if (presetName === 'ambient') {
                // Ambiente - reverb alto e delay médio
                reverbToggle.checked = true;
                reverbSlider.value = 70;
                delayToggle.checked = true;
                delaySlider.value = 50;
                distortionToggle.checked = false;
            } else if (presetName === 'rock') {
                // Rock - distorção média e reverb baixo
                distortionToggle.checked = true;
                distortionSlider.value = 60;
                reverbToggle.checked = true;
                reverbSlider.value = 30;
                delayToggle.checked = false;
            }
            
            // Atualizar exibição dos valores nos sliders
            updateEffectDisplays();
            
            // Remover classe active de todos os botões
            presetButtons.forEach(b => b.classList.remove('active'));
            // Adicionar classe active no botão clicado
            this.classList.add('active');
        });
    });
    
    // Inicializar eventos dos controles de efeitos
    setupEffectControls();
}

function updateEffectDisplays() {
    // Atualiza visualmente os controles após mudanças nos presets
    // Esta função seria chamada quando um preset é aplicado
    console.log('Efeitos atualizados');
}

function setupEffectControls() {
    // Conectar os controles de efeitos individuais
    const reverbToggle = document.getElementById('reverb-effect');
    const delayToggle = document.getElementById('delay-effect');
    const distortionToggle = document.getElementById('distortion-effect');
    
    // Eventos para ligar/desligar efeitos
    if (reverbToggle) {
        reverbToggle.addEventListener('change', function() {
            console.log('Reverb: ' + (this.checked ? 'ON' : 'OFF'));
        });
    }
    
    if (delayToggle) {
        delayToggle.addEventListener('change', function() {
            console.log('Delay: ' + (this.checked ? 'ON' : 'OFF'));
        });
    }
    
    if (distortionToggle) {
        distortionToggle.addEventListener('change', function() {
            console.log('Distortion: ' + (this.checked ? 'ON' : 'OFF'));
        });
    }
}

// Sistema de exportação de áudio
function setupExportSystem() {
    const exportBtn = document.getElementById('export-audio');
    const exportModal = document.getElementById('export-modal');
    const exportClose = document.querySelector('.export-close');
    const startExportBtn = document.getElementById('start-export');
    const recordExportBtn = document.getElementById('record-export');
    const exportStatus = document.getElementById('export-status');
    
    if (exportBtn && exportModal) {
        exportBtn.addEventListener('click', () => {
            exportModal.style.display = 'block';
        });
    }

    if (exportClose) {
        exportClose.addEventListener('click', () => {
            exportModal.style.display = 'none';
            stopExportRecording();
        });
    }
    
    if (startExportBtn) {
        startExportBtn.addEventListener('click', function() {
            // Pegar o nome do arquivo no momento do clique
            const filenameInput = document.getElementById('export-filename');
            const filename = filenameInput.value || 'soundpad_export';
            startExportRecording(filename);
        });
    }
    
    if (recordExportBtn) {
        recordExportBtn.addEventListener('click', function() {
            // Pegar o nome do arquivo no momento do clique
            const filenameInput = document.getElementById('export-filename');
            const filename = filenameInput.value || 'soundpad_recording';
            startExportRecording(filename);
        });
    }

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            exportModal.style.display = 'none';
            stopExportRecording();
        }
    });
}

// Variáveis para exportação
let mediaRecorderExport = null;
let recordedChunksExport = [];
let exportFilename = 'soundpad_export';

async function startExportRecording(filename) {
    exportFilename = filename;
    const exportStatus = document.getElementById('export-status');
    
    if (!exportStatus) return;
    
    exportStatus.style.display = 'block';
    exportStatus.textContent = '🎙️ Iniciando gravação...';

    try {
        // Solicitar acesso ao microfone
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        // Criar o gravador
        mediaRecorderExport = new MediaRecorder(stream);
        recordedChunksExport = [];

        // Configurar manipuladores de eventos
        mediaRecorderExport.addEventListener('dataavailable', (e) => {
            if (e.data.size > 0) {
                recordedChunksExport.push(e.data);
            }
        });

        mediaRecorderExport.addEventListener('stop', () => {
            // Criar blob de áudio
            const blob = new Blob(recordedChunksExport, { 
                type: 'audio/webm' 
            });
            
            // Download do arquivo
            downloadBlob(blob, `${exportFilename}.webm`);
            
            exportStatus.textContent = '✅ Gravação exportada com sucesso!';
            setTimeout(() => {
                exportStatus.style.display = 'none';
            }, 3000);
        });

        // Iniciar a gravação
        mediaRecorderExport.start();
        
        // Mostrar mensagem de gravação ativa
        exportStatus.textContent = '🔴 Gravando... Toque alguns sons!';
        
        // Adicionar botão para parar gravação
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹️ Parar Gravação e Exportar';
        stopBtn.className = 'export-btn';
        stopBtn.onclick = stopExportRecording;
        exportStatus.parentNode.appendChild(stopBtn);

    } catch (error) {
        exportStatus.textContent = '❌ Erro ao acessar microfone: ' + error.message;
        console.error('Erro na gravação:', error);
    }
}

function stopExportRecording() {
    if (mediaRecorderExport && mediaRecorderExport.state === 'recording') {
        mediaRecorderExport.stop();
        const stopButtons = document.querySelectorAll('.export-btn');
        stopButtons.forEach(btn => {
            if (btn.textContent.includes('Parar')) {
                btn.remove();
            }
        });
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== SISTEMA DE FAVORITOS =====
let favorites = new Set();
let favoritePresets = new Map();

function setupFavoritesSystem() {
    const favoritesBtn = document.getElementById('show-favorites');
    const favoritesModal = document.getElementById('favorites-modal');
    const favoritesClose = document.querySelector('.favorites-close');
    const savePresetBtn = document.getElementById('save-current-preset');
    
    // Carregar favoritos salvos
    loadFavorites();    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', () => {
            favoritesModal.style.display = 'block';
            updateFavoritesDisplay();
        });
    }

    if (favoritesClose) {
        favoritesClose.addEventListener('click', () => {
            favoritesModal.style.display = 'none';
        });
    }

    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', saveCurrentPreset);
    }

    // Adicionar botões de favorito aos sons
    addFavoriteButtons();

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === favoritesModal) {
            favoritesModal.style.display = 'none';
        }
    });
}

function addFavoriteButtons() {
    teclas.forEach(tecla => {
        const button = document.querySelector(`.${tecla.classe}`);
        if (button) {
            const favoriteBtn = document.createElement('span');
            favoriteBtn.className = 'favorite-heart';
            favoriteBtn.innerHTML = favorites.has(tecla.nome) ? '❤️' : '🤍';
            favoriteBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                cursor: pointer;
                font-size: 16px;
                z-index: 10;
            `;
            
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(tecla.nome, favoriteBtn);
            });
            
            button.style.position = 'relative';
            button.appendChild(favoriteBtn);
        }
    });
}

function toggleFavorite(soundName, heartElement) {
    if (favorites.has(soundName)) {
        favorites.delete(soundName);
        heartElement.innerHTML = '🤍';
    } else {
        favorites.add(soundName);
        heartElement.innerHTML = '❤️';
    }
    
    saveFavorites();
    updateFavoritesDisplay();
}

function saveCurrentPreset() {
    const presetNameInput = document.getElementById('new-preset-name');
    const presetName = presetNameInput.value.trim();
    
    if (!presetName) {
        alert('Digite um nome para o preset!');
        return;
    }
    
    const currentPreset = {
        reverb: {
            active: document.getElementById('reverb-effect').checked,
            amount: document.getElementById('reverb-amount').value
        },
        delay: {
            active: document.getElementById('delay-effect').checked,
            amount: document.getElementById('delay-amount').value
        },
        distortion: {
            active: document.getElementById('distortion-effect').checked,
            amount: document.getElementById('distortion-amount').value
        },
        masterVolume: document.getElementById('master-volume').value,
        masterPitch: document.getElementById('master-pitch').value
    };
    
    favoritePresets.set(presetName, currentPreset);
    presetNameInput.value = '';
    
    saveFavorites();
    updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
    const soundsList = document.getElementById('favorite-sounds-list');
    const presetsList = document.getElementById('favorite-presets-list');
    
    if (!soundsList || !presetsList) return;
    
    // Atualizar lista de sons favoritos
    soundsList.innerHTML = '';
    favorites.forEach(soundName => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <span>🎵 ${soundName}</span>
            <button onclick="removeFavoriteSound('${soundName}')">Remover</button>
        `;
        soundsList.appendChild(item);
    });
    
    if (favorites.size === 0) {
        soundsList.innerHTML = '<p>Nenhum som favorito ainda.</p>';
    }
    
    // Atualizar lista de presets favoritos
    presetsList.innerHTML = '';
    favoritePresets.forEach((preset, name) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <span>🎛️ ${name}</span>
            <div>
                <button onclick="loadPreset('${name}')">Carregar</button>
                <button onclick="removeFavoritePreset('${name}')">Remover</button>
            </div>
        `;
        presetsList.appendChild(item);
    });
    
    if (favoritePresets.size === 0) {
        presetsList.innerHTML = '<p>Nenhum preset salvo ainda.</p>';
    }
}

function saveFavorites() {
    const data = {
        sounds: Array.from(favorites),
        presets: Array.from(favoritePresets.entries())
    };
    localStorage.setItem('soundPadFavorites', JSON.stringify(data));
}

function loadFavorites() {
    const saved = localStorage.getItem('soundPadFavorites');
    if (saved) {        try {
            const data = JSON.parse(saved);
            favorites = new Set(data.sounds || []);
            favoritePresets = new Map(data.presets || []);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            favorites = new Set();
            favoritePresets = new Map();
        }
    } else {
        favorites = new Set();
        favoritePresets = new Map();
    }
}

// ===== FUNÇÕES GLOBAIS PARA USO NO HTML =====
window.removeFavoriteSound = function(soundName) {
    favorites.delete(soundName);
    saveFavorites();
    updateFavoritesDisplay();
    
    // Atualizar coração no botão
    const tecla = teclas.find(t => t.nome === soundName);
    if (tecla) {
        const button = document.querySelector(`.${tecla.classe}`);
        const heart = button?.querySelector('.favorite-heart');
        if (heart) {
            heart.innerHTML = '🤍';
        }
    }
};

window.removeFavoritePreset = function(presetName) {
    favoritePresets.delete(presetName);
    saveFavorites();
    updateFavoritesDisplay();
};

window.loadPreset = function(presetName) {
    const preset = favoritePresets.get(presetName);
    if (!preset) return;
    
    // Aplicar configurações de efeitos
    document.getElementById('reverb-effect').checked = preset.reverb.active;
    document.getElementById('reverb-amount').value = preset.reverb.amount;
    document.getElementById('delay-effect').checked = preset.delay.active;
    document.getElementById('delay-amount').value = preset.delay.amount;
    document.getElementById('distortion-effect').checked = preset.distortion.active;
    document.getElementById('distortion-amount').value = preset.distortion.amount;
    
    // Aplicar configurações master
    document.getElementById('master-volume').value = preset.masterVolume;
    document.getElementById('master-pitch').value = preset.masterPitch;
    
    // Atualizar displays
    document.getElementById('master-volume-display').textContent = preset.masterVolume + '%';
    document.getElementById('master-pitch-display').textContent = (preset.masterPitch / 100).toFixed(1) + 'x';
    
    // Aplicar mudanças nos efeitos
    if (audioContext) {
        activeEffects.clear();
        
        const reverbValue = preset.reverb.active ? (preset.reverb.amount / 100) * 0.3 : 0;
        reverbGain.gain.setValueAtTime(reverbValue, audioContext.currentTime);
        if (preset.reverb.active) activeEffects.add('reverb');
        
        const delayTime = preset.delay.active ? (preset.delay.amount / 100) * 0.8 + 0.1 : 0.3;
        delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
        if (preset.delay.active) activeEffects.add('delay');
        
        if (preset.distortion.active) {
            const intensity = preset.distortion.amount / 100;
            distortionNode.curve = createDistortionCurve(intensity * 50 + 10);
            activeEffects.add('distortion');
        }
    }
    
    // Atualizar volume e pitch master
    masterVolume = preset.masterVolume / 100;
    masterPitch = preset.masterPitch / 100;
};