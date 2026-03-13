function checkDevice() {
    const blocker = document.getElementById('mobile-blocker');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;

    // Show blocker if it's a mobile device OR if the screen is too narrow
    if (isMobile || window.innerWidth < 800 || isPortrait) {
        blocker.style.display = 'flex';
    } else {
        blocker.style.display = 'none';
    }
}

// Check on load and when the window is resized
window.addEventListener('load', checkDevice);
window.addEventListener('resize', checkDevice);

// ─── SVG DIAGRAM BUILDERS (called inline during HTML parse via template literal) ─
function buildCriticalMassSVG() {
    const S = 44,
        pad = 4,
        cols = 5,
        rows = 4;
    const W = cols * S + pad * 2,
        H = rows * S + pad * 2;
    const mass = (r, c) => {
        const e = (r === 0 || r === rows - 1 ? 1 : 0) + (c === 0 || c === cols - 1 ? 1 : 0);
        return 4 - e;
    };
    const colors = {
        2: '#ff6644',
        3: '#ffcc00',
        4: '#00ff41'
    };
    let cells = '';
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const m = mass(r, c),
                x = pad + c * S,
                y = pad + r * S,
                col = colors[m];
            cells += `<rect x="${x+1}" y="${y+1}" width="${S-2}" height="${S-2}" fill="${col}18" stroke="${col}" stroke-width="1" rx="2"/>`;
            cells += `<text x="${x+S/2}" y="${y+S/2+5}" text-anchor="middle" fill="${col}" font-size="14" font-family="Orbitron,monospace" font-weight="700">${m}</text>`;
        }
    const legend = [
        ['#ff6644', 'Corner = 2'],
        ['#ffcc00', 'Edge = 3'],
        ['#00ff41', 'Centre = 4']
    ];
    let leg = '';
    const itemW = Math.floor(W / 3);
    legend.forEach(([c, t], i) => {
        const lx = pad + i * itemW;
        const ly = H + 14;
        leg += `<rect x="${lx}" y="${ly}" width="10" height="10" fill="${c}" rx="1"/>`;
        leg += `<text x="${lx+14}" y="${ly+9}" fill="${c}cc" font-size="9" font-family="Share Tech Mono,monospace">${t}</text>`;
    });
    return `<svg width="${W}" height="${H+30}" viewBox="0 0 ${W} ${H+30}" xmlns="http://www.w3.org/2000/svg">${cells}${leg}</svg>`;
}

function buildExplosionSVG() {
    const S = 44,
        pad = 4,
        cols = 3,
        rows = 3,
        W = cols * S + pad * 2,
        H = rows * S + pad * 2;
    // Before: centre has 4 orbs (about to explode), shown in red
    // After: centre cleared, 4 neighbours get 1 orb each
    const centerColor = '#ff2222',
        neighborColor = '#ff2222';
    let before = '',
        after = '';
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const x = pad + c * S,
                y = pad + r * S;
            const isMid = (r === 1 && c === 1),
                isNeighbor = (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 0 && c === 1) || (r === 2 && c === 1);
            const stroke = isMid ? '#ff4444' : '#00ff4144';
            const fill = isMid ? '#ff222222' : '#00ff4108';
            before += `<rect x="${x+1}" y="${y+1}" width="${S-2}" height="${S-2}" fill="${fill}" stroke="${stroke}" stroke-width="1" rx="2"/>`;
            if (isMid) {
                // 4 dots representing 4 orbs
                [
                    [.3, .3],
                    [.7, .3],
                    [.3, .7],
                    [.7, .7]
                ].forEach(([dx, dy]) => {
                    before += `<circle cx="${x+S*dx}" cy="${y+S*dy}" r="5" fill="${centerColor}" filter="url(#glow)"/>`;
                });
                before += `<text x="${x+S/2}" y="${y+S+8}" text-anchor="middle" fill="#ff444488" font-size="8" font-family="Share Tech Mono,monospace">BOOM!</text>`;
            }
        }
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const x = pad + c * S,
                y = pad + r * S;
            const isMid = (r === 1 && c === 1),
                isNeighbor = (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 0 && c === 1) || (r === 2 && c === 1);
            const stroke = isNeighbor ? '#ff4444' : '#00ff4144';
            after += `<rect x="${x+1}" y="${y+1}" width="${S-2}" height="${S-2}" fill="${isNeighbor?'#ff222218':'#00ff4108'}" stroke="${stroke}" stroke-width="1" rx="2"/>`;
            if (isNeighbor) {
                after += `<circle cx="${x+S/2}" cy="${y+S/2}" r="7" fill="${neighborColor}" filter="url(#glow)"/>`;
            }
        }
    const bw = cols * S + pad * 2,
        totalW = bw * 2 + 28;
    return `<svg width="${totalW}" height="${H+24}" viewBox="0 0 ${totalW} ${H+24}" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <g transform="translate(0,0)">${before}</g>
  <text x="${bw+14}" y="${H/2+4}" text-anchor="middle" fill="#00ff4166" font-size="18" font-family="Orbitron,monospace">→</text>
  <g transform="translate(${bw+28},0)">${after}</g>
  <text x="${bw/2}" y="${H+18}" text-anchor="middle" fill="#ffffff44" font-size="9" font-family="Share Tech Mono,monospace">BEFORE</text>
  <text x="${bw+28+bw/2}" y="${H+18}" text-anchor="middle" fill="#ffffff44" font-size="9" font-family="Share Tech Mono,monospace">AFTER</text>
  </svg>`;
}

// ─── AUDIO FLAGS ──────────────────────────────────────────────────────────────
let sfxEnabled = true;
let musicEnabled = true;
const ROWS = 6,
    COLS = 9;
const PLAYER_COLORS = [{
        name: 'Red',
        hex: '#ff2222'
    },
    {
        name: 'Green',
        hex: '#00ff41'
    },
    {
        name: 'Blue',
        hex: '#2288ff'
    },
    {
        name: 'Yellow',
        hex: '#ffdd00'
    },
    {
        name: 'Magenta',
        hex: '#ff22cc'
    },
    {
        name: 'Cyan',
        hex: '#00ffee'
    },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
let players = [];
let board = []; // board[r][c] = { owner: playerIdx or -1, count: number }
let currentPlayer = 0;
let gameActive = false;
let animating = false;
let turnCounts = []; // how many turns each player has had
let eliminated = [];

// Undo state
let undoBoard = null;
let undoPlayer = null;
let undoTurnCounts = null;
let undoEliminated = null;
let undoUsed = false;

function saveUndoState() {
    undoBoard = board.map(row => row.map(cell => ({
        ...cell
    })));
    undoPlayer = currentPlayer;
    undoTurnCounts = [...turnCounts];
    undoEliminated = [...eliminated];
    undoUsed = false;
    updateUndoBtn();
}

function updateUndoBtn() {
    const btn = document.getElementById('btn-undo');
    if (!btn) return;
    const canUndo = undoBoard !== null && !undoUsed;
    btn.classList.toggle('disabled', !canUndo);
}

// ─── PERSISTENT PLAYER NAMES & CONFIG ────────────────────────────────────────
// One name slot per color (always 6 entries)
let storedNames = PLAYER_COLORS.map(c => c.name);

function loadConfig() {
    try {
        const saved = localStorage.getItem('cr_config');
        if (saved) {
            const cfg = JSON.parse(saved);
            if (cfg.count) selectedCount = cfg.count;
            if (cfg.names && Array.isArray(cfg.names)) {
                cfg.names.forEach((n, i) => {
                    if (i < 6 && n) storedNames[i] = n;
                });
            }
            if (cfg.sfx !== undefined) sfxEnabled = cfg.sfx;
            if (cfg.music !== undefined) musicEnabled = cfg.music;
        }
    } catch (e) {}
    // Mark active count button
    document.querySelectorAll('.count-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.n) === selectedCount);
    });
    // Apply loaded audio states to buttons immediately
    const btnSfx = document.getElementById('btn-sfx');
    const btnMusic = document.getElementById('btn-music');
    if (btnSfx) {
        btnSfx.classList.toggle('muted', !sfxEnabled);
        btnSfx.dataset.tip = sfxEnabled ? 'SOUND FX' : 'SFX OFF';
    }
    if (btnMusic) {
        btnMusic.classList.toggle('muted', !musicEnabled);
        btnMusic.dataset.tip = musicEnabled ? 'MUSIC' : 'MUSIC OFF';
    }
}

function saveConfig() {
    try {
        // Capture current input values into storedNames
        for (let i = 0; i < 6; i++) {
            const el = document.getElementById(`pname-${i}`);
            if (el) storedNames[i] = el.value.trim() || PLAYER_COLORS[i].name;
        }
        localStorage.setItem('cr_config', JSON.stringify({
            count: selectedCount,
            names: storedNames,
            sfx: sfxEnabled,
            music: musicEnabled
        }));
    } catch (e) {}
}

// ─── BEGIN SCREEN SETUP ───────────────────────────────────────────────────────
let selectedCount = 4;

loadConfig();

document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Save current names before switching
        for (let i = 0; i < 6; i++) {
            const el = document.getElementById(`pname-${i}`);
            if (el) storedNames[i] = el.value.trim() || PLAYER_COLORS[i].name;
        }
        selectedCount = parseInt(btn.dataset.n);
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPlayersList();
        saveConfig();
    });
});

function renderPlayersList() {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    for (let i = 0; i < selectedCount; i++) {
        const c = PLAYER_COLORS[i];
        const row = document.createElement('div');
        row.className = 'player-row';
        row.style.animationDelay = `${i * 35}ms`;
        row.innerHTML = `
      <span class="player-label">P${i+1}</span>
      <div class="color-swatch" style="background:${c.hex}; color:${c.hex}"></div>
      <input class="name-input" type="text" value="${storedNames[i]}" maxlength="12" placeholder="Player ${i+1}" id="pname-${i}">
    `;
        list.appendChild(row);
        // Save name on change
        const input = row.querySelector('input');
        input.addEventListener('input', () => {
            storedNames[i] = input.value;
            saveConfig();
        });
    }
    // Reposition after DOM has settled
    requestAnimationFrame(() => requestAnimationFrame(updateSetupPosition));
}

// ─── DYNAMIC SETUP PANEL POSITIONING ─────────────────────────────────────────
// Positions the Mission Config panel + button so they sit comfortably below
// the fixed title, centred in the remaining vertical space.
function updateSetupPosition() {
    const panel = document.getElementById('setup-panel');
    const btn = document.getElementById('start-btn');
    if (!panel || !btn) return;

    const vh = window.innerHeight;
    const titleBottom = 80; // px — clear the fixed title + subtitle
    const gap = 32; // gap between panel and button (matches flex gap)
    const panelH = panel.offsetHeight;
    const btnH = btn.offsetHeight;
    const totalH = panelH + gap + btnH;
    const available = vh - titleBottom;

    // Centre the block in the available space, with a slight upward bias (×0.45)
    // so it doesn't feel too close to the bottom on short viewports.
    const idealTop = titleBottom + Math.max(16, (available - totalH) * 0.45);
    panel.style.marginTop = Math.round(idealTop) + 'px';
}
renderPlayersList();
window.addEventListener('resize', updateSetupPosition);

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('begin-screen').classList.remove('hidden');
    renderPlayersList();
});

// ─── START GAME ───────────────────────────────────────────────────────────────
function startGame() {
    players = [];
    for (let i = 0; i < selectedCount; i++) {
        const nameEl = document.getElementById(`pname-${i}`);
        players.push({
            name: nameEl ? nameEl.value.trim() || `Player ${i+1}` : `Player ${i+1}`,
            color: PLAYER_COLORS[i].hex,
        });
    }

    // Init board
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = {
                owner: -1,
                count: 0
            };
        }
    }

    currentPlayer = 0;
    turnCounts = new Array(players.length).fill(0);
    eliminated = new Array(players.length).fill(false);
    gameActive = true;
    animating = false;

    undoBoard = null;
    undoPlayer = null;
    undoTurnCounts = null;
    undoEliminated = null;
    undoUsed = false;
    updateUndoBtn();

    saveConfig();

    document.getElementById('begin-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    renderHUD();
    renderBoard();
    updateBoardColor();
    SFX.startGame();
    playMusic();
    if (window.updateParticleColor) updateParticleColor(players[currentPlayer].color);
}

// ─── CRITICAL MASS ────────────────────────────────────────────────────────────
function criticalMass(r, c) {
    const isTop = r === 0,
        isBot = r === ROWS - 1;
    const isLeft = c === 0,
        isRight = c === COLS - 1;
    const edges = (isTop || isBot ? 1 : 0) + (isLeft || isRight ? 1 : 0);
    return 4 - edges; // corner=2, edge=3, middle=4
}

function neighbors(r, c) {
    const ns = [];
    if (r > 0) ns.push([r - 1, c]);
    if (r < ROWS - 1) ns.push([r + 1, c]);
    if (c > 0) ns.push([r, c - 1]);
    if (c < COLS - 1) ns.push([r, c + 1]);
    return ns;
}

// ─── BOARD RENDER ─────────────────────────────────────────────────────────────
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => handleClick(r, c));
            cell.addEventListener('mouseenter', () => cell.classList.add('hovered'));
            cell.addEventListener('mouseleave', () => cell.classList.remove('hovered'));
            boardEl.appendChild(cell);
            updateCell(r, c);
        }
    }
}

function getCellEl(r, c) {
    return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function updateCell(r, c) {
    const cell = getCellEl(r, c);
    if (!cell) return;
    const data = board[r][c];
    cell.innerHTML = '';

    if (data.count === 0) return;

    const hex = data.owner >= 0 ? players[data.owner].color : '#ffffff';
    const cm = criticalMass(r, c);
    const unstable = data.count >= cm - 1;

    const container = document.createElement('div');
    container.className = `orbs-container`;

    // Sizing: orbs should nearly touch when clustered
    // 1 orb → 30px, 2 orbs → 25px (orbit r=11 → centre gap 22, orb diam 25 → slight overlap ✓)
    // 3 orbs → 22px (orbit r=13, adjacent gap = 13*√3≈22.5, diam 22 → just touching ✓)
    const sizes = [0, 30, 25, 22];
    const size = sizes[data.count] || 20;

    // Orbital periods (stable / unstable)
    // Corner (cm=2) with 1 orb = one before critical mass → spin significantly faster
    const isCornerUnstable = (cm === 2 && data.count === 1);
    const unstablePeriods = isCornerUnstable ? [0.45, 0.85, 1.05] : [2.0, 0.85, 1.05];
    const periods = unstable ? unstablePeriods : [7, 3.2, 4.2];
    const period = periods[data.count - 1];

    // Phase offset per orb: distribute evenly around the full circle
    for (let i = 0; i < data.count; i++) {
        const orb = document.createElement('div');
        orb.className = 'orb';
        orb.style.width = size + 'px';
        orb.style.height = size + 'px';

        // ── True 3D sphere via radial-gradient (softer highlights) ──
        const highlight = lighten(hex, 0.70);
        const dark = darken(hex, 0.30);
        const vdark = darken(hex, 0.50);

        orb.style.background = `radial-gradient(circle at 36% 30%,
      ${highlight}           0%,
      ${hex}                 40%,
      ${dark}                80%,
      ${vdark}               100%`;

        // Subtle outer glow + gentle drop shadow
        const g = unstable ? 14 : 7;
        const ga = unstable ? 'aa' : '66';
        const s = Math.round(size * 0.14);
        orb.style.boxShadow = [
            `0 0 ${g}px ${hex}${ga}`,
            `0 ${s}px ${s*2}px rgba(0,0,0,0.40)`,
            `inset -${Math.round(size*.10)}px -${Math.round(size*.10)}px ${Math.round(size*.18)}px rgba(0,0,0,0.22)`,
            `inset ${Math.round(size*.05)}px  ${Math.round(size*.05)}px  ${Math.round(size*.09)}px  rgba(255,255,255,0.08)`
        ].join(', ');

        // Orbit animation — negative delay gives correct starting phase
        const delay = -(period * i / data.count);
        orb.style.animation = `orbit${data.count} ${period}s ${delay.toFixed(3)}s linear infinite`;

        container.appendChild(orb);
    }

    cell.appendChild(container);
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
function lighten(hex, amt) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.round(r + (255 - r) * amt));
    g = Math.min(255, Math.round(g + (255 - g) * amt));
    b = Math.min(255, Math.round(b + (255 - b) * amt));
    return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.round(r * (1 - amt)));
    g = Math.max(0, Math.round(g * (1 - amt)));
    b = Math.max(0, Math.round(b * (1 - amt)));
    return `rgb(${r},${g},${b})`;
}

// (orbit keyframes are defined in CSS)

// ─── HUD ──────────────────────────────────────────────────────────────────────
function renderHUD() {
    const hud = document.getElementById('players-hud');
    hud.innerHTML = '';
    players.forEach((p, i) => {
        const chip = document.createElement('div');
        chip.className = 'player-chip' + (i === currentPlayer ? ' active' : '') + (eliminated[i] ? ' eliminated' : '');
        chip.id = `chip-${i}`;
        chip.innerHTML = `<div class="chip-dot" style="background:${p.color}"></div><span>${p.name}</span>`;
        hud.appendChild(chip);
    });

    const dot = document.getElementById('turn-dot');
    const name = document.getElementById('turn-name');
    dot.style.background = players[currentPlayer].color;
    dot.style.color = players[currentPlayer].color;
    name.textContent = players[currentPlayer].name;
    name.style.color = players[currentPlayer].color;
}

// ─── COLOR ANIMATION HELPERS ──────────────────────────────────────────────────
function hexToRgb(hex) {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
    ];
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
let _gridColorRaf = null;
let _currentGridColor = '#00ff41';

function animateGridColor(toHex, duration) {
    const fromRgb = hexToRgb(_currentGridColor);
    const toRgb = hexToRgb(toHex);
    const start = performance.now();
    if (_gridColorRaf) cancelAnimationFrame(_gridColorRaf);

    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
        const r = fromRgb[0] + ease * (toRgb[0] - fromRgb[0]);
        const g = fromRgb[1] + ease * (toRgb[1] - fromRgb[1]);
        const b = fromRgb[2] + ease * (toRgb[2] - fromRgb[2]);
        const hex = rgbToHex(r, g, b);
        document.documentElement.style.setProperty('--grid-color', hex);
        if (t < 1) {
            _gridColorRaf = requestAnimationFrame(step);
        } else {
            _currentGridColor = toHex;
            _gridColorRaf = null;
        }
    }
    requestAnimationFrame(step);
}

function updateBoardColor() {
    const color = players[currentPlayer].color;
    const board = document.getElementById('board');
    board.style.borderColor = color;
    board.style.boxShadow = `0 0 40px ${color}44, inset 0 0 40px rgba(0,0,0,0.8)`;

    // Animate cell borders via inline style (CSS transition handles it)
    document.querySelectorAll('.cell').forEach(c => {
        c.style.borderColor = color + '88';
    });

    // Animate --grid-color (used by hover overlays) to match the 400ms border transition
    animateGridColor(color, 400);
}

// ─── CLICK HANDLER ────────────────────────────────────────────────────────────
function handleClick(r, c) {
    if (!gameActive || animating) return;
    const data = board[r][c];

    // Check valid placement
    if (data.owner !== -1 && data.owner !== currentPlayer) {
        const cell = getCellEl(r, c);
        cell.classList.add('invalid-click');
        setTimeout(() => cell.classList.remove('invalid-click'), 300);
        SFX.invalid();
        return;
    }

    // Save undo state before the move
    saveUndoState();

    // Place atom
    SFX.placeOrb();
    placeAtom(r, c, currentPlayer);
}

// ─── PLACE & EXPLODE ──────────────────────────────────────────────────────────
async function placeAtom(r, c, playerIdx) {
    animating = true;
    board[r][c].owner = playerIdx;
    board[r][c].count++;
    updateCell(r, c);

    await processExplosions(playerIdx);

    // Check victory
    if (!checkVictory()) {
        advanceTurn();
    }

    animating = false;
    updateUndoBtn();
}

async function processExplosions(playerIdx) {
    let hasExplosion = true;
    // Safety cap: a legitimate chain can never need more steps than this.
    const maxIter = ROWS * COLS * 4;
    let iter = 0;
    while (hasExplosion && iter++ < maxIter) {
        hasExplosion = false;
        const toExplode = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].count >= criticalMass(r, c) && board[r][c].owner !== -1) {
                    toExplode.push([r, c]);
                }
            }
        }

        if (toExplode.length === 0) break;
        hasExplosion = true;

        // First wave = full explosion, subsequent = chain pop
        if (toExplode.length === 1) SFX.explode(1);
        else SFX.explode(Math.min(toExplode.length * 0.5, 2));

        // Explode all simultaneously
        const explodePromises = toExplode.map(([r, c]) => explodeCell(r, c, playerIdx));
        await Promise.all(explodePromises);
        await delay(60);

        // If a player has already won mid-chain, stop immediately.
        if (checkVictory()) break;
    }
}

async function explodeCell(r, c, playerIdx) {
    const cm = criticalMass(r, c);
    if (board[r][c].count < cm) return;

    // Flash
    const cellEl = getCellEl(r, c);
    cellEl.classList.add('exploding');
    setTimeout(() => cellEl.classList.remove('exploding'), 400);

    board[r][c].count -= cm;
    if (board[r][c].count === 0) board[r][c].owner = -1;

    const ns = neighbors(r, c);
    for (const [nr, nc] of ns) {
        board[nr][nc].owner = playerIdx;
        board[nr][nc].count++;
    }

    // Update visuals
    updateCell(r, c);
    for (const [nr, nc] of ns) updateCell(nr, nc);

    await delay(170);
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── TURN MANAGEMENT ─────────────────────────────────────────────────────────
function advanceTurn() {
    turnCounts[currentPlayer]++;

    // Check eliminations — collect all newly eliminated, show messages sequentially
    const allHadTurn = turnCounts.every(t => t > 0);
    if (allHadTurn) {
        const newlyEliminated = [];
        for (let i = 0; i < players.length; i++) {
            if (!eliminated[i] && !playerHasAtoms(i)) {
                eliminated[i] = true;
                newlyEliminated.push(i);
            }
        }
        // Show notifications one after another, 2s apart
        newlyEliminated.forEach((idx, n) => {
            setTimeout(() => {
                showNotif(`${players[idx].name} eliminated!`, players[idx].color);
                SFX.eliminated();
            }, n * 2200);
        });
    }

    // Find next non-eliminated player
    let next = (currentPlayer + 1) % players.length;
    let loops = 0;
    while (eliminated[next] && loops < players.length) {
        next = (next + 1) % players.length;
        loops++;
    }
    currentPlayer = next;
    renderHUD();
    updateBoardColor();
    SFX.nextTurn();
    if (window.updateParticleColor) updateParticleColor(players[currentPlayer].color);
}

function playerHasAtoms(idx) {
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
            if (board[r][c].owner === idx) return true;
    return false;
}

// ─── VICTORY ─────────────────────────────────────────────────────────────────
function checkVictory() {
    // Already handled (e.g. detected mid-chain) — don't show winner twice.
    if (!gameActive) return true;
    // Count active players with atoms (after first turn)
    const allHadTurn = turnCounts.every(t => t > 0);
    if (!allHadTurn) return false;

    const activePlayers = players.filter((_, i) => !eliminated[i] && playerHasAtoms(i));
    if (activePlayers.length <= 1 && activePlayers.length > 0) {
        const winIdx = players.findIndex((_, i) => !eliminated[i] && playerHasAtoms(i));
        showWinner(winIdx);
        return true;
    }
    return false;
}

function showWinner(idx) {
    gameActive = false;

    const p = players[idx];

    const winName = document.getElementById('win-name');
    winName.textContent = p.name;
    winName.style.color = p.color;

    // Style PLAY AGAIN button to match winner color
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.style.borderColor = p.color;
    restartBtn.style.color = p.color;
    restartBtn.style.setProperty('--btn-fill', p.color);
    // Inject a scoped override for the fill pseudo-element
    let btnStyle = document.getElementById('restart-btn-style');
    if (!btnStyle) {
        btnStyle = document.createElement('style');
        btnStyle.id = 'restart-btn-style';
        document.head.appendChild(btnStyle);
    }
    btnStyle.textContent = `#restart-btn::before { background: ${p.color}; } #restart-btn:hover { color: #000 !important; box-shadow: 0 0 30px ${p.color}66; }`;

    const cel = document.getElementById('orb-celebration');
    cel.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const orb = document.createElement('div');
        orb.className = 'cel-orb';
        orb.style.background = `radial-gradient(circle at 35% 30%, ${lighten(p.color, 0.5)}, ${p.color}, ${darken(p.color, 0.4)})`;
        orb.style.boxShadow = `0 0 10px ${p.color}99`;
        orb.style.animationDelay = (i * 0.2) + 's';
        cel.appendChild(orb);
    }

    // Let the board linger visibly for a beat, then swap screens.
    setTimeout(() => {
        // Hide game screen instantly (no opacity transition) so it can't flash
        // through when the end-screen fades in.
        const gs = document.getElementById('game-screen');
        gs.style.transition = 'opacity 0s';
        gs.classList.add('hidden');
        requestAnimationFrame(() => {
            gs.style.transition = '';
        });

        document.getElementById('end-screen').classList.remove('hidden');
        SFX.win();
    }, 400);
}


// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
const SFX = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new(window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function osc(type, freq, gain, start, dur, ac) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g);
        g.connect(ac.destination);
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(gain, start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.start(start);
        o.stop(start + dur + 0.05);
        return {
            o,
            g
        };
    }

    function noise(gain, start, dur, ac, filterFreq) {
        const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buf;
        const filt = ac.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = filterFreq || 800;
        filt.Q.value = 0.8;
        const g = ac.createGain();
        src.connect(filt);
        filt.connect(g);
        g.connect(ac.destination);
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        src.start(start);
        src.stop(start + dur + 0.05);
    }

    return {
        // ── Game start: ascending synth arpeggio
        startGame() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            const notes = [261, 329, 392, 523, 659, 784, 1047];
            notes.forEach((f, i) => {
                osc('sine', f, 0.18, t + i * 0.07, 0.25, ac);
                osc('square', f * 2, 0.03, t + i * 0.07, 0.2, ac);
            });
        },

        // ── Place orb: soft crystalline click
        placeOrb(playerColor) {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            osc('sine', 880, 0.22, t, 0.18, ac);
            osc('sine', 1320, 0.10, t, 0.12, ac);
            noise(0.06, t, 0.06, ac, 2200);
        },

        // ── Explode: crackle + low thud
        explode(intensity = 1) {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            noise(0.5 * intensity, t, 0.22, ac, 300);
            noise(0.3 * intensity, t, 0.18, ac, 1200);
            osc('sawtooth', 80, 0.3 * intensity, t, 0.18, ac);
            osc('square', 55, 0.2 * intensity, t + 0.02, 0.14, ac);
        },

        // ── Chain reaction extra pop
        chainPop() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            noise(0.25, t, 0.12, ac, 600);
            osc('sine', 440, 0.12, t, 0.10, ac);
        },

        // ── Invalid cell shake: harsh buzz
        invalid() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            osc('sawtooth', 110, 0.28, t, 0.08, ac);
            osc('sawtooth', 110, 0.20, t + 0.09, 0.07, ac);
            osc('sawtooth', 100, 0.15, t + 0.17, 0.06, ac);
        },

        // ── Turn advance: subtle swoosh tick
        nextTurn() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            osc('sine', 660, 0.12, t, 0.10, ac);
            osc('sine', 880, 0.07, t + 0.05, 0.08, ac);
        },

        // ── Player eliminated: descending tone
        eliminated() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            [440, 330, 220, 165].forEach((f, i) => {
                osc('sine', f, 0.18, t + i * 0.12, 0.18, ac);
            });
            noise(0.1, t, 0.45, ac, 200);
        },

        // ── Win game: triumphant fanfare
        win() {
            if (!sfxEnabled) return;
            const ac = getCtx();
            const t = ac.currentTime;
            // Chord stabs
            [
                [523, 659, 784],
                [587, 740, 880],
                [659, 830, 988],
                [784, 988, 1175]
            ].forEach((chord, i) => {
                chord.forEach(f => {
                    osc('sine', f, 0.14, t + i * 0.18, 0.35, ac);
                    osc('square', f * 2, 0.03, t + i * 0.18, 0.30, ac);
                });
            });
            // Final long tone
            osc('sine', 1047, 0.2, t + 0.74, 0.9, ac);
            osc('sine', 1319, 0.1, t + 0.74, 0.9, ac);
            noise(0.1, t + 0.74, 0.4, ac, 1500);
        }
    };
})();

const clickSfx = document.getElementById('click-sfx');
clickSfx.volume = 0.5;

function playClickSound() {
    if (!sfxEnabled) return;

    const sfx = clickSfx.cloneNode();
    sfx.volume = clickSfx.volume;
    sfx.play().catch(() => {});
}

// Attach to all buttons except "Initiate"
document.querySelectorAll('button').forEach(btn => {
    if (btn.id !== 'start-btn') {
        btn.addEventListener('click', playClickSound);
    }
});

function showNotif(msg, color) {
    const n = document.getElementById('notif');
    n.textContent = msg;
    n.style.color = color || '#fff';
    n.style.borderColor = color || '#ffffff44';
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
}

// ─── HTML5 BACKGROUND MUSIC ───────────────────────────────────────────────────
const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.2;

function playMusic() {
    if (!musicEnabled) return;
    bgMusic.play().catch(() => {}); // ignore autoplay policy errors
}

function stopMusic() {
    bgMusic.pause();
}


// ─── CONTROL BUTTON WIRING ────────────────────────────────────────────────────
(function() {
    const btnSfx = document.getElementById('btn-sfx');
    const btnMusic = document.getElementById('btn-music');
    const btnRules = document.getElementById('btn-rules');

    btnSfx.addEventListener('click', () => {
        sfxEnabled = !sfxEnabled;
        btnSfx.classList.toggle('muted', !sfxEnabled);
        btnSfx.dataset.tip = sfxEnabled ? 'SOUND FX' : 'SFX OFF';
        saveConfig();
    });

    btnMusic.addEventListener('click', () => {
        musicEnabled = !musicEnabled;
        btnMusic.classList.toggle('muted', !musicEnabled);
        btnMusic.dataset.tip = musicEnabled ? 'MUSIC' : 'MUSIC OFF';
        if (musicEnabled) {
            bgMusic.play().catch(() => {});
        } else {
            stopMusic();
        }
        saveConfig();
    });

    btnRules.addEventListener('click', () => {
        document.getElementById('rules-modal').classList.add('open');
    });
    document.getElementById('rules-close').addEventListener('click', () => {
        document.getElementById('rules-modal').classList.remove('open');
    });
    document.getElementById('rules-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('rules-modal'))
            document.getElementById('rules-modal').classList.remove('open');
    });

    // ── Undo button ──
    document.getElementById('btn-undo').addEventListener('click', () => {
        if (!undoBoard || undoUsed || animating) return;
        board = undoBoard.map(row => row.map(cell => ({
            ...cell
        })));
        currentPlayer = undoPlayer;
        turnCounts = [...undoTurnCounts];
        eliminated = [...undoEliminated];
        undoUsed = true;
        renderBoard();
        renderHUD();
        updateBoardColor();
        if (window.updateParticleColor) updateParticleColor(players[currentPlayer].color);
        updateUndoBtn();
        showNotif('MOVE UNDONE', '#ffaa00');
    });

    // ── Restart (back to home) button ──
    function goHome() {
        gameActive = false;
        const gs = document.getElementById('game-screen');
        gs.style.transition = 'opacity 0s';
        gs.classList.add('hidden');
        requestAnimationFrame(() => {
            gs.style.transition = '';
        });
        document.getElementById('end-screen').classList.add('hidden');
        document.getElementById('begin-screen').classList.remove('hidden');
        renderPlayersList();
    }

    document.getElementById('btn-game-restart').addEventListener('click', () => {
        // If no move has been made yet (undoBoard is null), skip the confirm modal
        if (undoBoard === null) {
            goHome();
            return;
        }
        document.getElementById('restart-confirm-modal').classList.add('open');
    });
    document.getElementById('confirm-cancel').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('open');
    });
    document.getElementById('restart-confirm-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('restart-confirm-modal'))
            document.getElementById('restart-confirm-modal').classList.remove('open');
    });
    document.getElementById('confirm-ok').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('open');
        goHome();
    });

    // ── Fullscreen button ──
    const btnFs = document.getElementById('btn-fullscreen');
    const fsExpand = document.getElementById('fs-icon-expand');
    const fsCompress = document.getElementById('fs-icon-compress');

    function updateFsIcon() {
        const isFs = !!document.fullscreenElement;
        fsExpand.style.display = isFs ? 'none' : '';
        fsCompress.style.display = isFs ? '' : 'none';
    }
    document.addEventListener('fullscreenchange', updateFsIcon);
    btnFs.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // Inject SVG diagrams
    const massDiag = document.getElementById('diagram-mass');
    massDiag.insertAdjacentHTML('afterbegin', buildCriticalMassSVG());
    const explodeDiag = document.getElementById('diagram-explode');
    explodeDiag.insertAdjacentHTML('afterbegin', buildExplosionSVG());
})();



// ─── PARTICLES SYSTEM ─────────────────────────────────────────────────────────
(function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const COUNT = 70;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function hexToRgbArr(hex) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16)
        ];
    }

    // Current target color as [r,g,b]
    let targetRgb = [0, 255, 65];
    let currentRgb = [0, 255, 65];

    // Call this whenever the active player changes
    window.updateParticleColor = function(hex) {
        targetRgb = hexToRgbArr(hex);
    };

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    class Particle {
        constructor(respawn) {
            this.reset(respawn);
        }
        reset(respawn) {
            this.x = Math.random() * W;
            this.y = respawn ? H + 10 : Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = -(0.2 + Math.random() * 0.65);
            this.r = 1.4 + Math.random() * 3.2;
            this.alpha = 0.18 + Math.random() * 0.42;
            this.twinkle = Math.random() * Math.PI * 2;
            this.twinkleSpeed = 0.012 + Math.random() * 0.03;
            this.drift = (Math.random() - 0.5) * 0.007;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx += this.drift;
            this.twinkle += this.twinkleSpeed;
            if (this.y < -10 || this.x < -20 || this.x > W + 20) this.reset(true);
        }
        draw(rgb) {
            const a = this.alpha * (0.55 + 0.45 * Math.sin(this.twinkle));
            const [r, g, b] = rgb;
            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fill();
            // Inner bright core
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
            ctx.fill();
            // Wide soft glow
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
            grd.addColorStop(0, `rgba(${r},${g},${b},${a*0.5})`);
            grd.addColorStop(0.4, `rgba(${r},${g},${b},${a*0.15})`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle(false));

    function loop() {
        ctx.clearRect(0, 0, W, H);
        // Smoothly interpolate color
        currentRgb[0] = lerp(currentRgb[0], targetRgb[0], 0.025);
        currentRgb[1] = lerp(currentRgb[1], targetRgb[1], 0.025);
        currentRgb[2] = lerp(currentRgb[2], targetRgb[2], 0.025);
        const rgb = currentRgb.map(Math.round);
        particles.forEach(p => {
            p.update();
            p.draw(rgb);
        });
        requestAnimationFrame(loop);
    }
    loop();
})();