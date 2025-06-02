function tocaSomJack() {
  document.querySelector('#som_tecla_Jack').play()
}

document.querySelector('.tecla_Jack').onclick = tocaSomJack;

function tocaSomtome() {
  document.querySelector('#som_tecla_Tome').play()
}

document.querySelector('.tecla_Tome').onclick = tocaSomtome;

function tocaSomDom() {
  document.querySelector('#som_tecla_Dom').play()
}

document.querySelector('.tecla_Dom').onclick = tocaSomDom;

function tocaSomOruan() {
  document.querySelector('#som_tecla_Oruan').play()
}

document.querySelector('.tecla_Oruan').onclick = tocaSomOruan;

function tocaSomChavin() {
  document.querySelector('#som_tecla_Chavin').play()
}

document.querySelector('.tecla_Chavin').onclick = tocaSomChavin;

function tocaSomMorango() {
  document.querySelector('#som_tecla_Morango').play()
}

document.querySelector('.tecla_Morango').onclick = tocaSomMorango;

function tocaSomCebolinha() {
  document.querySelector('#som_tecla_Cebolinha').play()
}

document.querySelector('.tecla_Cebolinha').onclick = tocaSomCebolinha;

function tocaSomTung() {
  document.querySelector('#som_tecla_Tung').play()
}

document.querySelector('.tecla_Tung').onclick = tocaSomTung;


function tocaSomGrosso() {
  document.querySelector('#som_tecla_Grosso').play()
}

document.querySelector('.tecla_Grosso').onclick = tocaSomGrosso;

// Variáveis globais para gravação
let mediaRecorder;
let recordedChunks = [];
let allAudios = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeAudios();
    setupKeyboardShortcuts();
    setupThemeToggle();
    setupStopAllButton();
    setupRecording();
    setupSharing();
});

function initializeAudios() {
    allAudios = document.querySelectorAll('audio');
}

// Atalhos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        const button = document.querySelector(`[data-key="${key}"]`);
        
        if (button && !event.repeat) {
            button.classList.add('ativa');
            button.click();
        }
    });

    document.addEventListener('keyup', function(event) {
        const key = event.key.toLowerCase();
        const button = document.querySelector(`[data-key="${key}"]`);
        
        if (button) {
            button.classList.remove('ativa');
        }
    });
}

// Parar todos os sons
function setupStopAllButton() {
    document.getElementById('stop-all').addEventListener('click', function() {
        allAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    });
}

// Toggle tema escuro/claro
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Sistema de gravação
function setupRecording() {
    const recordBtn = document.getElementById('record-btn');
    const modal = document.getElementById('record-modal');
    const closeModal = document.querySelector('.close');
    const startRecording = document.getElementById('start-recording');
    const stopRecording = document.getElementById('stop-recording');
    const saveRecording = document.getElementById('save-recording');

    recordBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    startRecording.addEventListener('click', startRecord);
    stopRecording.addEventListener('click', stopRecord);
    saveRecording.addEventListener('click', saveRecord);
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
            document.getElementById('recorded-audio').src = audioURL;
            document.getElementById('recorded-audio').style.display = 'block';
            document.getElementById('sound-name').style.display = 'block';
            document.getElementById('save-recording').style.display = 'block';
        };

        mediaRecorder.start();
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;
    } catch (error) {
        alert('Erro ao acessar microfone: ' + error.message);
    }
}

function stopRecord() {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
}

function saveRecord() {
    const soundName = document.getElementById('sound-name').value;
    if (!soundName) {
        alert('Por favor, digite um nome para o som');
        return;
    }

    const recordedAudio = document.getElementById('recorded-audio');
    const blob = new Blob(recordedChunks, { type: 'audio/wav' });
    
    // Salvar no localStorage para demonstração
    const reader = new FileReader();
    reader.onload = function() {
        const customSounds = JSON.parse(localStorage.getItem('customSounds') || '{}');
        customSounds[soundName] = reader.result;
        localStorage.setItem('customSounds', JSON.stringify(customSounds));
        alert('Som salvo com sucesso!');
        document.getElementById('record-modal').style.display = 'none';
    };
    reader.readAsDataURL(blob);
}

// Sistema de compartilhamento
function setupSharing() {
    document.getElementById('share-btn').addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'DJ JPZINNN - Meme Sound Pad',
                text: 'Confira este sound pad de memes brasileiros!',
                url: window.location.href
            });
        } else {
            // Fallback para navegadores sem Web Share API
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copiado para a área de transferência!');
            });
        }
    });
}

// Melhorar as funções existentes
function playSound(elementId) {
    const audio = document.querySelector(elementId);
    audio.currentTime = 0;
    audio.play();
}

// Atualizar todas as funções para usar o novo sistema
function tocaSomJack() { playSound('#som_tecla_Jack'); }
function tocaSomTome() { playSound('#som_tecla_Tome'); }
function tocaSomDom() { playSound('#som_tecla_Dom'); }
function tocaSomOruan() { playSound('#som_tecla_Oruan'); }
function tocaSomChavin() { playSound('#som_tecla_Chavin'); }
function tocaSomMorango() { playSound('#som_tecla_Morango'); }
function tocaSomCebolinha() { playSound('#som_tecla_Cebolinha'); }
function tocaSomTung() { playSound('#som_tecla_Tung'); }
function tocaSomGrosso() { playSound('#som_tecla_Grosso'); }

// Manter compatibilidade com onclick
document.querySelector('.tecla_Jack').onclick = tocaSomJack;
document.querySelector('.tecla_Tome').onclick = tocaSomTome;
document.querySelector('.tecla_Dom').onclick = tocaSomDom;
document.querySelector('.tecla_Oruan').onclick = tocaSomOruan;
document.querySelector('.tecla_Chavin').onclick = tocaSomChavin;
document.querySelector('.tecla_Morango').onclick = tocaSomMorango;
document.querySelector('.tecla_Cebolinha').onclick = tocaSomCebolinha;
document.querySelector('.tecla_Tung').onclick = tocaSomTung;
document.querySelector('.tecla_Grosso').onclick = tocaSomGrosso;