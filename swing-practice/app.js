// ===== Configuration =====
const PATTERNS = {
    '8-count': {
        name: '8 Count',
        // Each beat's timing: 'rock' = 1 full beat, 'triple' = 2/3 beat (3 steps in 2 beats)
        beats: [
            { id: '1', label: '1', type: 'rock' },
            { id: '2', label: '2', type: 'rock' },
            { id: '3', label: '3', type: 'triple' },
            { id: 'a1', label: '&', type: 'triple' },
            { id: '4', label: '4', type: 'triple' },
            { id: '5', label: '5', type: 'rock' },
            { id: '6', label: '6', type: 'rock' },
            { id: '7', label: '7', type: 'triple' },
            { id: 'a2', label: '&', type: 'triple' },
            { id: '8', label: '8', type: 'triple' }
        ],
        groups: [
            { beats: ['1', '2'], type: 'rock', label: 'Rock Step' },
            { beats: ['3', 'a1', '4'], type: 'triple', label: 'Triple' },
            { beats: ['5', '6'], type: 'rock', label: 'Rock Step' },
            { beats: ['7', 'a2', '8'], type: 'triple', label: 'Triple' }
        ],
        stepLabels: {
            '1': 'Rock', '2': 'Step',
            '3': 'Tri-', 'a1': '-ple-', '4': '-Step',
            '5': 'Rock', '6': 'Step',
            '7': 'Tri-', 'a2': '-ple-', '8': '-Step'
        },
        countInStart: 7 // Start at index 7 (beat "7") for count-in
    },
    '6-count': {
        name: '6 Count',
        beats: [
            { id: '1', label: '1', type: 'rock' },
            { id: '2', label: '2', type: 'rock' },
            { id: '3', label: '3', type: 'triple' },
            { id: 'a1', label: '&', type: 'triple' },
            { id: '4', label: '4', type: 'triple' },
            { id: '5', label: '5', type: 'triple' },
            { id: 'a2', label: '&', type: 'triple' },
            { id: '6', label: '6', type: 'triple' }
        ],
        groups: [
            { beats: ['1', '2'], type: 'rock', label: 'Rock Step' },
            { beats: ['3', 'a1', '4'], type: 'triple', label: 'Triple' },
            { beats: ['5', 'a2', '6'], type: 'triple', label: 'Triple' }
        ],
        stepLabels: {
            '1': 'Rock', '2': 'Step',
            '3': 'Tri-', 'a1': '-ple-', '4': '-Step',
            '5': 'Tri-', 'a2': '-ple-', '6': '-Step'
        },
        countInStart: 5 // Start at index 5 (beat "5") for count-in
    }
};

const CONFIG = {
    bpmPresets: [80, 120, 160, 200],
    swingPresets: [50, 60, 67, 75]
};

// ===== State =====
const state = {
    pattern: '8-count',
    isRunning: false,
    currentBeatIndex: -1,
    bpm: 120,
    swingRatio: 50,
    soundEnabled: true,
    countInEnabled: false,
    timeoutId: null,
    audioContext: null
};

// ===== DOM Elements =====
const dom = {
    beatContainer: null,
    currentCount: null,
    stepLabel: null,
    bpmValue: null,
    bpmSlider: null,
    bpmPresets: null,
    swingValue: null,
    swingDesc: null,
    swingSlider: null,
    swingPresets: null,
    btnStart: null,
    soundToggle: null,
    countInToggle: null,
    patternBtns: null,
    timelineCursor: null,
    timelineMarkers: null,
    beats: [],
    timelineLabels: []
};

// ===== Helpers =====
function getPattern() {
    return PATTERNS[state.pattern];
}

// ===== Initialization =====
function init() {
    dom.beatContainer = document.getElementById('beatContainer');
    dom.currentCount = document.getElementById('currentCount');
    dom.stepLabel = document.getElementById('stepLabel');
    dom.bpmValue = document.getElementById('bpmValue');
    dom.bpmSlider = document.getElementById('bpmSlider');
    dom.bpmPresets = document.getElementById('bpmPresets');
    dom.swingValue = document.getElementById('swingValue');
    dom.swingDesc = document.getElementById('swingDesc');
    dom.swingSlider = document.getElementById('swingSlider');
    dom.swingPresets = document.getElementById('swingPresets');
    dom.btnStart = document.getElementById('btnStart');
    dom.soundToggle = document.getElementById('soundToggle');
    dom.countInToggle = document.getElementById('countInToggle');
    dom.patternBtns = document.querySelectorAll('.pattern-btn');
    dom.timelineCursor = document.getElementById('timelineCursor');
    dom.timelineMarkers = document.getElementById('timelineMarkers');

    createBeats();
    drawTimeline();
    createPresets();
    bindEvents();
    updatePatternButtons();
}

function createBeats() {
    dom.beatContainer.innerHTML = '';
    dom.beats = [];

    const pattern = getPattern();

    pattern.groups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = `beat-group beat-group--${group.type}`;

        group.beats.forEach(beatId => {
            const beatConfig = pattern.beats.find(b => b.id === beatId);
            const beat = document.createElement('div');
            beat.className = `beat beat--${beatConfig.type}`;
            if (beatConfig.label === '&') beat.classList.add('beat--and');
            beat.dataset.beat = beatId;
            beat.textContent = beatConfig.label;
            groupEl.appendChild(beat);
            dom.beats.push(beat);
        });

        dom.beatContainer.appendChild(groupEl);
    });
}

function drawTimeline() {
    if (!dom.timelineMarkers) return;

    dom.timelineMarkers.innerHTML = '';

    // Clear labels ref, not needed anymore
    // dom.timelineLabels = []; but dom structure still has it defined

    const pattern = getPattern();

    // Calculate total duration using getInterval to be precise
    let totalMs = 0;
    pattern.beats.forEach(b => totalMs += getInterval(b));

    let currentMs = 0;

    pattern.beats.forEach((beat, index) => {
        const startPct = (currentMs / totalMs) * 100;
        const duration = getInterval(beat);
        currentMs += duration;

        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = `${startPct}%`;
        if (beat.id === '1' || beat.id === '5') marker.classList.add('strong');
        dom.timelineMarkers.appendChild(marker);

        // CSS handles centering now
    });

    const endMarker = document.createElement('div');
    endMarker.className = 'timeline-marker';
    endMarker.style.left = '100%';
    dom.timelineMarkers.appendChild(endMarker);
}

function createPresets() {
    CONFIG.bpmPresets.forEach(bpm => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = bpm;
        btn.onclick = () => setBpm(bpm);
        dom.bpmPresets.appendChild(btn);
    });

    CONFIG.swingPresets.forEach(swing => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn preset-btn--swing';
        btn.textContent = swing + '%';
        btn.onclick = () => setSwing(swing);
        dom.swingPresets.appendChild(btn);
    });
}

function bindEvents() {
    dom.btnStart.onclick = togglePlay;
    dom.bpmSlider.oninput = (e) => setBpm(+e.target.value);
    dom.swingSlider.oninput = (e) => setSwing(+e.target.value);
    dom.soundToggle.onchange = (e) => state.soundEnabled = e.target.checked;
    dom.countInToggle.onchange = (e) => state.countInEnabled = e.target.checked;

    dom.patternBtns.forEach(btn => {
        btn.onclick = () => setPattern(btn.dataset.pattern);
    });

    document.onkeydown = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
    };
}

function updatePatternButtons() {
    dom.patternBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pattern === state.pattern);
    });
}

// ===== Audio =====
function initAudio() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playClick(isAccent, isAnd = false) {
    if (!state.soundEnabled || !state.audioContext) return;
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    osc.connect(gain);
    gain.connect(state.audioContext.destination);
    osc.frequency.value = isAccent ? 1000 : (isAnd ? 600 : 800);
    osc.type = 'sine';
    const volume = isAccent ? 0.3 : (isAnd ? 0.12 : 0.18);
    gain.gain.setValueAtTime(volume, state.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioContext.currentTime + 0.08);
    osc.start();
    osc.stop(state.audioContext.currentTime + 0.08);
}

// ===== Playback =====
function togglePlay() {
    state.isRunning ? stop() : start();
}

function start() {
    initAudio();
    state.isRunning = true;
    dom.btnStart.textContent = 'Stop';
    dom.btnStart.classList.add('running');

    const pattern = getPattern();

    // Start from beginning or count-in
    state.currentBeatIndex = state.countInEnabled ? pattern.countInStart : -1;

    // Reset cursor visually
    dom.timelineCursor.style.transition = 'none';
    dom.timelineCursor.style.left = state.countInEnabled ? getBeatPosition(state.currentBeatIndex + 1) : '0%';

    // Initialize timing
    state.nextExpectedTime = performance.now();
    tick();
}

function stop() {
    state.isRunning = false;
    dom.btnStart.textContent = 'Start';
    dom.btnStart.classList.remove('running');
    clearTimeout(state.timeoutId);
    state.currentBeatIndex = -1;

    // Reset visuals
    dom.beats.forEach(b => b.classList.remove('active'));

    dom.timelineCursor.style.transition = 'all 0.3s ease';
    dom.timelineCursor.style.left = '0%';

    dom.currentCount.textContent = '-';
    dom.currentCount.classList.remove('running');
    dom.stepLabel.textContent = 'Ready to swing!';
}

function tick() {
    if (!state.isRunning) return;

    const pattern = getPattern();
    state.currentBeatIndex = (state.currentBeatIndex + 1) % pattern.beats.length;
    const beat = pattern.beats[state.currentBeatIndex];

    updateDisplay(beat);

    const isAccent = beat.id === '1' || beat.id === '5';
    const isAnd = beat.label === '&';
    playClick(isAccent, isAnd);

    const interval = getInterval(beat);

    // Calculate drift
    const now = performance.now();
    state.nextExpectedTime += interval;
    const drift = now - (state.nextExpectedTime - interval);

    let wait = interval - drift;
    if (wait < 0) wait = 0;

    animateCursor(state.currentBeatIndex, interval);

    state.timeoutId = setTimeout(tick, wait);
}

function getBeatPosition(index) {
    const pattern = getPattern();
    let totalMs = 0;
    pattern.beats.forEach(b => totalMs += getInterval(b));

    let currentMs = 0;
    for (let i = 0; i < index; i++) {
        currentMs += getInterval(pattern.beats[i]);
    }

    return (currentMs / totalMs) * 100 + '%';
}

function animateCursor(index, duration) {
    const pattern = getPattern();

    // 1. Force Snap to Current Beat Start
    dom.timelineCursor.style.transition = 'none';
    dom.timelineCursor.style.left = getBeatPosition(index);

    void dom.timelineCursor.offsetWidth;

    // 2. Animate to Next Beat Start
    const nextIndex = index + 1;
    let targetPos;

    if (nextIndex >= pattern.beats.length) {
        targetPos = '100%';
    } else {
        targetPos = getBeatPosition(nextIndex);
    }

    dom.timelineCursor.style.transition = `left ${duration}ms linear`;
    dom.timelineCursor.style.left = targetPos;
}

function updateDisplay(beat) {
    const pattern = getPattern();

    dom.beats.forEach(b => b.classList.toggle('active', b.dataset.beat === beat.id));

    dom.currentCount.textContent = beat.label;
    dom.currentCount.classList.remove('running');
    void dom.currentCount.offsetWidth;
    dom.currentCount.classList.add('running');

    dom.stepLabel.textContent = pattern.stepLabels[beat.id];
}

function getInterval(beat) {
    const beatMs = 60000 / state.bpm;

    if (beat.type === 'rock') {
        // Rock Step: Always 1.0 beat (Straight)
        return beatMs;
    } else if (beat.type === 'triple') {
        const fullTripleDuration = beatMs * 2; // 2 beats for "3 & 4"
        const thirdDuration = fullTripleDuration / 3; // Even triplet duration (base)

        // Beat "4" or "8" (The Step) is the anchor, approx 1/3 of the time
        // We ensure "4" is consistent with even triplets
        // Check IDs '4', '6', '8' which are End-of-Triple steps
        if (beat.id === '4' || beat.id === '6' || beat.id === '8') {
            return thirdDuration;
        }

        // Now distribute the remaining 2/3 time between "Tri" and "Ple" (&)
        const remainingDuration = fullTripleDuration - thirdDuration;

        const ratio = state.swingRatio / 100;

        const longPart = remainingDuration * ratio; // "3"
        const shortPart = remainingDuration - longPart; // "&"

        if (beat.label === '&') {
            return shortPart;
        } else {
            return longPart;
        }
    }
    return beatMs;
}

// ===== Setters =====
function setBpm(val) {
    state.bpm = val;
    dom.bpmValue.textContent = val;
    dom.bpmSlider.value = val;
}

function setSwing(val) {
    state.swingRatio = val;
    dom.swingValue.textContent = val + '%';
    dom.swingSlider.value = val;
    const desc = val <= 50 ? 'Even Triplet' : val <= 60 ? 'Light Swing' : val <= 68 ? 'Triplet Swing' : 'Heavy Swing';
    dom.swingDesc.textContent = desc;

    // Redraw timeline when swing changes
    drawTimeline();
}

function setPattern(patternId) {
    if (state.isRunning) stop();
    state.pattern = patternId;
    createBeats();
    drawTimeline();
    updatePatternButtons();
}

// ===== Start =====
document.addEventListener('DOMContentLoaded', init);
