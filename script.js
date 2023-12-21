const synth = new Tone.Synth().toDestination();
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const keyboardMap = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5',
    'o': 'C#5',
    'l': 'D5',
    'p': 'D#5',
    ';': 'E5'
};

const latinNotes = {
    'a': 'C',
    'w': 'C# / Db',
    's': 'D',
    'e': 'D# / Eb',
    'd': 'E',
    'f': 'F',
    't': 'F# / Gb',
    'g': 'G',
    'y': 'G# / Ab',
    'h': 'A',
    'u': 'A# / Bb',
    'j': 'B',
    'k': 'C',
    'o': 'C# / Db',
    'l': 'D',
    'p': 'D# / Eb',
    ';': 'E'
};

let octaveShift = 0; // Initial octave shift
const oscillators = {};

function transposeNote(note, octaveShift) {
    const noteObj = Tone.Frequency(note);
    return noteObj.transpose(octaveShift * 12).toNote();
}

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const note = transposeNote(keyboardMap[key], octaveShift);

    if (note && !oscillators[key]) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'triangle'; // Adjust the waveform type as desired

        oscillator.frequency.setValueAtTime(Tone.Frequency(note).toFrequency(), audioContext.currentTime);

        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.0);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillators[key] = oscillator;

        const pressedKey = document.querySelector(`[data-key="${key}"]`);
        if (pressedKey) {
            pressedKey.classList.add('active');
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    const note = transposeNote(keyboardMap[key], octaveShift);

    if (note && oscillators[key]) {
        oscillators[key].stop(audioContext.currentTime + 0.1);
        delete oscillators[key];

        const releasedKey = document.querySelector(`[data-key="${key}"]`);
        if (releasedKey) {
            releasedKey.classList.remove('active');
        }
    }
});

function transposeOctave(shift) {
    octaveShift += shift;
    for (const key in oscillators) {
        const note = transposeNote(keyboardMap[key], octaveShift);
        oscillators[key].frequency.setValueAtTime(Tone.Frequency(note).toFrequency(), audioContext.currentTime);
    }
}

document.getElementById('transpose-up').addEventListener('click', () => {
    transposeOctave(1);
});

document.getElementById('transpose-down').addEventListener('click', () => {
    transposeOctave(-1);
});

let showKeys = true;
const keysCheckbox = document.querySelector('.keys-checkbox input');
keysCheckbox.addEventListener('change', showHideKeys);

function showHideKeys() {
    const pianoKeys = document.querySelectorAll('.piano-keys .key');

    if (showKeys) {
        pianoKeys.forEach((key, index) => {
            const note = Object.keys(keyboardMap)[index];
            key.dataset.key = note;
            key.querySelector('span').innerText = note.toUpperCase();
        });
    } else {
        pianoKeys.forEach((key, index) => {
            const note = Object.keys(latinNotes)[index];
            key.dataset.key = note;
            key.querySelector('span').innerText = latinNotes[note];
        });
    }
    showKeys = !showKeys;
}
