// SUPER PLATANUS SHOWDOWN — Platanus Hack 26: Santiago
// Pelea de plataformas en un teatro: sube el % de daño del rival y sácalo de escena.

const W = 800;
const H = 600;
// Colores que se repiten, con nombre corto para que el juego pese menos (el minificador no los junta solo)
const $a = '#ffffff', $b = '#17171c', $c = '#ffe14a', $d = '#3a3a44', $e = '#e1ff00', $f = '#8a8f9a', $g = '#c9ccd2', $h = '#5f646e', $i = '#f4f4f4', $j = '#f7ffd8', $k = '#f4f0e0', $l = '#d5202a', $m = '#f2c14e', $n = '#6b4a1a', $o = '#ffd66b', $p = '#ff6ec7', $q = '#a87410', $r = '#e8c060', $s = '#76e04a', $t = '#b8c48d', $u = '#ffe9a8', $v = '#ff4d5a', $w = '#2a2f45', $x = '#6f8fb8', $y = '#6f7480', $z = '#9bff3a', $A = '#b8bcc6', $B = '#e0564a', $C = '#0a2f8a', $D = '#a01c2e', $E = '#d97757', $F = '#f08a3a', $G = '#0b0f03', $H = '#4a2c14', $I = '#1f8a4a', $J = '#4a9ad8', $K = '#fff3a0', $L = '#d9a520', $M = '#1a1030', $N = '#241a40', $O = '#6b4a2c', $P = '#11141f', $Q = '#c9c4f0', $R = '#f4f8ff', $S = '#57493c', $T = '#7fc23f', $U = '#2a5a9a', $V = '#c9dcee', $W = '#8a3a2a', $X = '#e0a020', $Y = '#1a1c26', $Z = '#2a2d3c', $0 = '#d6cfba', $1 = '#a00c44', $2 = '#d9963a', $3 = '#f4d9a0', $4 = '#3a2414', $5 = '#f2c79a', $6 = '#2f4daa', $7 = '#e8b98f', $8 = '#1c2f6e', $9 = '#f4c9b8';

// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'], P1_D: ['s'], P1_L: ['a'], P1_R: ['d'],
  P1_1: ['u'], P1_2: ['i'], P1_3: ['o'],
  P1_4: ['j'], P1_5: ['k'], P1_6: ['l'],
  P2_U: ['ArrowUp'], P2_D: ['ArrowDown'], P2_L: ['ArrowLeft'], P2_R: ['ArrowRight'],
  P2_1: ['r'], P2_2: ['t'], P2_3: ['y'],
  P2_4: ['f'], P2_5: ['g'], P2_6: ['h'],
  START1: ['Enter'], START2: ['2'],
};

const KEY_TO_ARCADE = {};
for (const [code, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) KEY_TO_ARCADE[key.length === 1 ? key.toLowerCase() : key] = code;
}
const held = Object.create(null);
let hit = Object.create(null);
window.addEventListener('keydown', (e) => {
  const code = KEY_TO_ARCADE[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (!code) return;
  if (!held[code]) hit[code] = true;
  held[code] = true;
});
window.addEventListener('keyup', (e) => {
  const code = KEY_TO_ARCADE[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (code) held[code] = false;
});
// Entrada de un jugador: palanca, botón 1 golpe, 2 especial, 3 (o arriba) salto, 4 escudo
// Qué botón (1 a 6) hace cada acción, por jugador. Se cambia en el menú CONTROLES; la palanca no se toca
const ACTS = [['atk', 'GOLPE'], ['spc', 'ESPECIAL'], ['jmp', 'SALTO'], ['sh', 'ESCUDO']];
let KM = [{ atk: 1, spc: 2, jmp: 3, sh: 4 }, { atk: 1, spc: 2, jmp: 3, sh: 4 }];
// Disposición PC (pc = 1), pensada para dos personas en un teclado: cada jugador usa el bloque de botones del otro,
// así J1 juega con WASD + F G H T y J2 con flechas + J K L I. No cambia CABINET_KEYS; por defecto va apagada (gabinete)
let pc = 0;
const preset = () => { KM = [0, 1].map(() => (pc ? { atk: 4, spc: 5, jmp: 2, sh: 6 } : { atk: 1, spc: 2, jmp: 3, sh: 4 })); };
// Nombre visible del control de una acción: el botón en el gabinete, la tecla en la disposición PC
const lab = (i, a) => (pc ? 'TECLA ' + CABINET_KEYS['P' + (2 - i) + '_' + KM[i][a]][0].toUpperCase() : 'BOTÓN ' + KM[i][a]);
const inp = (p) => { const k = 'P' + p + '_', b = 'P' + (pc ? 3 - p : p) + '_', m = KM[p - 1]; return { l: held[k + 'L'], r: held[k + 'R'], u: held[k + 'U'], d: held[k + 'D'], dh: hit[k + 'D'], atk: hit[b + m.atk], spc: hit[b + m.spc], jmp: hit[k + 'U'] || hit[b + m.jmp], sh: held[b + m.sh], shh: hit[b + m.sh], ah: held[b + m.atk] }; };
const any = (b) => hit['P1_' + b] || hit['P2_' + b];

function getStorage() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(key) { try { const raw = window.localStorage.getItem(key); return raw === null ? { found: false, value: null } : { found: true, value: JSON.parse(raw) }; } catch { return { found: false, value: null }; } },
    async set(key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };
}

// --- AJUSTES: velocidad, daño de golpes y vidas. Se cambian en el menú y se guardan solos ---
const TUNE0 = { vel: 1, dano: 1, vidas: 3, mus: 1 };
const TUNE_L = [['vel', 'VELOCIDAD', 0.05, 0.4, 2.5], ['dano', 'DAÑO DE GOLPES', 0.05, 0.4, 2.5], ['vidas', 'VIDAS', 1, 1, 5], ['mus', 'MÚSICA', 0.25, 0, 2]];
let TN = { ...TUNE0 };

// Logos de polera (dentro de un cuadro de 7x7; rectángulos x,y,ancho,alto): las flechas de Neat y el pajarito de Toku
const LOGO_N = [[1, 0, 5, 1], [1, 1, 1, 1], [5, 1, 1, 1], [0, 2, 3, 1], [1, 3, 1, 1], [5, 3, 1, 1], [4, 4, 3, 1], [1, 5, 1, 1], [5, 5, 1, 1], [1, 6, 5, 1]];
const LOGO_T = [[1, 1, 2, 2], [5, 1, 1, 1], [4, 2, 2, 1], [2, 3, 4, 1], [1, 4, 5, 1], [2, 5, 3, 1]]; // 5x5, centrado en el cuadro de 7x7
// --- Personajes: k 0 = plátano, 1 = persona con polera. sp velocidad, jp salto, wt peso, s especial ---
const CHARS = [
  { n: 'MR. PLATANUS', k: 0, suit: 1, sp: 2, jp: 5.2, wt: 1.05, s: 'gun', tip: 'PLÁTANO SOMNÍFERO' },
  { n: 'PLATANUS UNMASKED', k: 0, suit: 0, sp: 2.5, jp: 5.6, wt: 0.9, s: 'spin', tip: 'GIRO VELOZ' },
  { n: 'NEATER', k: 1, sh: '#4fc3f7', lg: '', ic: LOGO_N, hr: $4, sk: $5, sp: 2.25, jp: 5.3, wt: 1, s: 'bulb', tip: 'AMPOLLETA EXPLOSIVA' },
  { n: 'BUKER', k: 1, sh: $6, lg: 'b', hr: '#101018', sk: '#d9a577', sp: 2.05, jp: 5.1, wt: 1.12, s: 'heavy', tip: 'LIBRAZO DEMOLEDOR' },
  // Parodias: nombres inventados, no los reales
  { n: 'EL CEO DE CUERO', k: 1, sh: '#16161c', lg: '', hr: $g, sk: $7, gl: 1, jk: 1, sp: 2.1, jp: 5.2, wt: 1.05, s: 'gpu', tip: 'LANZA GPU' },
  { n: 'PIPE SATÉLITE', k: 1, sh: $8, lg: 'b', hr: $A, sk: $5, sp: 2.2, jp: 5.4, wt: 1, s: 'orb', tip: 'RUBY EN ÓRBITA' },
  // Tokus: su especial es colgarse de un pajarito y volar unos segundos; después tiene 5 s de espera
  { n: 'TOKUS', k: 1, sh: '#7a00b0', lg: '', ic: LOGO_T, hr: '#2a1a12', sk: $7, sp: 2.3, jp: 5.4, wt: 0.95, s: 'fly', tip: 'VUELA CON SU PAJARITO' },
  // Admin: silueta negra con borde y ojos blancos (nn). SUDO lanza una sombra a ras de piso con un efecto al azar
  { n: 'ADMIN', k: 1, nn: 1, sh: $b, lg: '', hr: $b, sk: $b, sp: 2.2, jp: 5.3, wt: 1, s: 'sudo', tip: 'SUDO' },
];
// --- Golpes: su/ac/re = cuadros de preparación/activo/recuperación; x,y,w,h = caja; d daño; kb+ks empuje; a ángulo ---
const ATK = {
  n: { su: 3, ac: 3, re: 8, x: 13, y: -16, w: 18, h: 12, d: 4, kb: 1.6, ks: 0.035, a: 30 },
  s: { su: 8, ac: 4, re: 14, x: 15, y: -15, w: 22, h: 14, d: 11, kb: 2.6, ks: 0.1, a: 38 },
  u: { su: 5, ac: 5, re: 11, x: 1, y: -34, w: 16, h: 14, d: 8, kb: 2.4, ks: 0.085, a: 88 },
  d: { su: 5, ac: 5, re: 12, x: 14, y: -4, w: 20, h: 8, d: 7, kb: 2.2, ks: 0.07, a: 62 },   // agachado: patada baja al frente
  da: { su: 6, ac: 8, re: 12, x: 8, y: 1, w: 14, h: 14, d: 9, kb: 2.2, ks: 0.08, a: -60 },  // en el aire: patada en diagonal hacia abajo
  us: { su: 3, ac: 10, re: 10, x: 0, y: -28, w: 18, h: 22, d: 7, kb: 2.2, ks: 0.07, a: 85 },
  spin: { su: 5, ac: 16, re: 12, x: 0, y: -14, w: 24, h: 24, d: 10, kb: 2.3, ks: 0.09, a: 45 },
  heavy: { su: 14, ac: 5, re: 18, x: 15, y: -16, w: 22, h: 22, d: 15, kb: 3.2, ks: 0.12, a: 42 },
  orb: { su: 6, ac: 20, re: 12, x: 0, y: -16, w: 38, h: 34, d: 9, kb: 2.3, ks: 0.085, a: 50 },
  gun: { su: 18, ac: 1, re: 14, pj: 1, cd: 60 }, // cd: cuadros de espera antes de poder usar de nuevo este especial (1 s)
  gpu: { su: 14, ac: 1, re: 16, pj: 2 },
  bulb: { su: 9, ac: 1, re: 14, pj: 3 },
  sudo: { su: 14, ac: 1, re: 16, pj: 5, cd: 180 },
  // Con un ítem en la mano: teclado (golpe largo y fuerte, como un bate) y pistola banana (disparo)
  kbd: { su: 7, ac: 5, re: 14, x: 19, y: -17, w: 28, h: 16, d: 13, kb: 4.6, ks: 0.165, a: 40 },
  shot: { su: 5, ac: 1, re: 9, pj: 4 },
  fly: {}, // el vuelo de Tokus no es un golpe: se maneja como estado aparte
};
// Proyectiles: 1 plátano (duerme), 2 GPU, 3 ampolleta (queda donde se deja y explota al rato), 4 bala de la pistola banana. v = velocidad
const PJ = [0, { v: 4, d: 8, kb: 1, ks: 0.035, a: 25 }, { v: 3.2, d: 12, kb: 2.4, ks: 0.09, a: 40 }, { v: 0, d: 13, kb: 4.2, ks: 0.11, a: 50 }, { v: 6, d: 5, kb: 1.4, ks: 0.045, a: 28 }, { v: 3.2 }];
// --- Escenarios: m = plataforma principal, p = plataformas colgantes (vx = se mueve entre x0 y x1) ---
const STAGES = [
  { n: 'EDIFICIO BUK', hz: 'PALOMAS', m: { x: 70, y: 226, w: 260, h: 74 }, p: [{ x: 92, y: 178, w: 56 }, { x: 252, y: 178, w: 56 }, { x: 172, y: 134, w: 56 }] },
  { n: 'TORRES DEL PAINE', hz: 'VIENTO', m: { x: 86, y: 232, w: 228, h: 68 }, p: [{ x: 58, y: 178, w: 50 }, { x: 292, y: 178, w: 50 }, { x: 160, y: 148, w: 70, vx: 0.5, x0: 110, x1: 220 }] },
  // Puerto: las plataformas son containers (ct) que la grúa baja al muelle (y 210), cuelga (160) o se lleva (-40)
  { n: 'PUERTO VALPARAÍSO', hz: 'GRÚA', m: { x: 60, y: 232, w: 280, h: 68 }, p: [{ x: 84, y: 210, w: 48, ct: 1, col: 0 }, { x: 176, y: -40, w: 48, ct: 1, col: 1 }, { x: 268, y: 160, w: 48, ct: 1, col: 2 }] },
  // Metro: se pelea en las vías; cada tanto pasa un tren que atropella a quien siga abajo.
  // El piso sigue más allá de la pantalla: no hay borde para caerse, solo se pierde saliendo por los lados
  { n: 'METRO DE SANTIAGO', hz: 'TREN', m: { x: -60, y: 238, w: 520, h: 62 }, p: [{ x: 66, y: 180, w: 58 }, { x: 276, y: 180, w: 58 }, { x: 160, y: 142, w: 80 }] },
  // Golden Gate: el puente sigue más allá de la pantalla; los autos (car) y cuatro travesaños de las torres son plataformas, y a veces se cae un tramo de calle
  { n: 'GOLDEN GATE', hz: 'DERRUMBES', m: { x: -60, y: 232, w: 520, h: 18 }, p: [{ x: 60, y: 219, w: 34, car: 1, col: 0, t: 200 }, { x: 180, y: 219, w: 34, car: 1, col: 1, t: 420 }, { x: 300, y: 219, w: 34, car: 1, col: 2, t: 90 }, { x: 88, y: 164, w: 44 }, { x: 268, y: 164, w: 44 }, { x: 88, y: 96, w: 44 }, { x: 268, y: 96, w: 44 }] },
];
// Estaciones del metro (nombre y color de su línea): en cada pelea toca una al azar y solo cambia el cartel
const STN = [['TOBALABA', $l], ['BAQUEDANO', $l], ['PLAZA DE ARMAS', $I], ['SAN JOAQUÍN', $I], ['LOS LEONES', $l], ['LA MONEDA', $l], ['ESTACIÓN CENTRAL', $l]];
const TRN = { d: 100, kb: 3.6, ks: 0.05, a: 36 }; // atropello: +100% y a volar
// Ascensores de Valparaíso: x,y de la estación de abajo y de la de arriba, y color del carro
const ASC = [[60, 184, 92, 114, $B], [204, 186, 244, 106, $m], [332, 186, 362, 128, '#3fa66a']];
// Olas de utilería por escenario: tres tiras y el color del fondo del agua
const WV = [0, ['#2ab0b4', '#49c6c8', '#86e0dc', '#1f9aa0'], ['#2a7fc0', $J, '#8fc4ee', '#1f6fb0']];
WV[4] = WV[2]; // la bahía de San Francisco usa los mismos azules que Valparaíso
const HW = 56; // ancho del tramo de calle que se cae en el Golden Gate
// Cáscara de plátano, mapa de pixeles: o contorno, y amarillo, l brillo, d sombra, t punta
const PEEL = ['............oo..........', '...........otto.........', '..........olyydo........', '.........olyyydo........', '.........olyyyddo.......', '....oooo.olyyyddo.oooo..', '...oyyydoolyyyddooyyydo.', '...odyyyylyyyydddyyyddo.', '.ooooddlyyyyyoddddddooo.', 'olllyyyyyyydo.oddyyyyydo', 'oyyyyyyyddoo...odddddddo', '.oooooooooo.....ooooooo.'];
// Ítems que se usan al tocarlos: 0 café (7 s más rápido), 1 energética (8 s más rápido y golpes más fuertes),
// 2 GPU (golpes más fuertes), 3 cáscara (resbalón), 4 Claude (invencible 10 s), 5 galleta (-30%), 6 hamburguesa (-60%).
// Ítems que se toman con el botón de golpe y se sueltan con el de escudo: 7 teclado, 8 BananaGun (8 tiros)
const ITEM_BAG = [0, 0, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8];
const SHOTS = 8;
// Golpe cargado: mantener el botón de golpe retiene el ataque hasta CHG cuadros; a carga completa pega y empuja CHGX veces más
const CHG = 45, CHGX = 1.25;
// Vuelo de Tokus: dura FLY cuadros y, al terminar por lo que sea, deja FCD cuadros de espera (5 s)
const FLY = 140, FCD = 300;
const PC = [$e, $p];

let c, AC, TX, LB, G, mode = 'title', clk = 0, acc = 0, two = 0, tsel = 0, cs = [0, 3], si = 0, hz = 1, cur = 0, tunS = 0, tunB = 'title', psel = 0, stn = 0, keepHit = 0, csel = [0, 0];

let OV = 0; // color forzado: dibuja la silueta de un luchador en un solo color
const R = (col, x, y, w, h) => { c.fillStyle = OV || col; c.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); };
const T = (s, x, y, col, sz, al) => { c.fillStyle = col; c.font = 'bold ' + (sz || 8) + 'px monospace'; c.textAlign = al || 'left'; c.textBaseline = 'top'; c.fillText(s, x, y); };
const TS = (s, x, y, col, sz, al) => { T(s, x + 1, y + 1, '#000000', sz, al); T(s, x, y, col, sz, al); };
const A = (a, fn) => { c.globalAlpha = a; fn(); c.globalAlpha = 1; };
// BananaGun: un plátano curvo con las puntas hacia arriba y un gatillo chico abajo
const bgun = (x, y) => {
  const g = [[-4, -3, 9, 3], [4, -5, 3, 3], [-6, -5, 3, 3]];
  g.forEach((r) => R($b, x + r[0] - 1, y + r[1] - 1, r[2] + 2, r[3] + 2)); R($b, x - 3, y, 4, 3);
  g.forEach((r) => R($c, x + r[0], y + r[1], r[2], r[3]));
  R($K, x - 3, y - 3, 7, 1); R($L, x - 4, y - 1, 9, 1); R($n, x + 6, y - 6, 1, 1); R($n, x - 6, y - 6, 1, 1); R($L, x - 2, y, 2, 2);
};
const disc = (col, cx, cy, r) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); R(col, cx - w, cy + dy, 2 * w, 1); } };
const save = () => getStorage().set('oc', { t: TN, hz }); // los controles no se guardan: siempre parte con la disposición del gabinete
function beep(f, d, ty, v, f2) {
  if (!AC || AC.state !== 'running') return; // con el audio suspendido (pestaña oculta) las notas se apilarían y sonarían juntas al volver
  try {
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = ty || 'square'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v || 0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(t + d);
  } catch {}
}

// --- Escenografía: cada fondo es un decorado de teatro (telones pintados, sol y nubes colgando de hilos) ---
function paintStage(i) {
  const main = c, m = STAGES[i].m; c = LB.getContext();
  const sky = (cols) => cols.forEach((col, k) => { const y = k * 44; R(col, 0, y, 400, k === cols.length - 1 ? 300 : 44); if (k) for (let x = k % 2; x < 400; x += 2) R(col, x, y - 1, 1, 1); });
  const cloud = (x, y, w, col, col2, str) => { R(str, x + w / 2, 0, 1, y); R(col, x + 5, y, w - 12, 3); R(col, x + 2, y + 3, w - 4, 4); R(col, x, y + 7, w, 4); R(col2, x, y + 10, w, 1); };
  if (i === 0) {
    // Santiago al atardecer: cordillera, Costanera, cerro San Cristóbal
    sky(['#24173f', '#4a2560', '#8a3a6c', '#c9566a', '#f08a5a', '#f8b86a']);
    R($M, 300, 0, 1, 137); disc('#f6c86a', 300, 150, 14); disc($u, 300, 150, 12);
    cloud(96, 58, 34, $9, '#c9909a', $M); cloud(196, 36, 28, $9, '#c9909a', $M);
    const hB = (x) => 50 + 26 * Math.abs(Math.sin(x / 41 + 1)) + 10 * Math.abs(Math.sin(x / 13));
    for (let x = 0; x < 400; x++) { const h = hB(x) | 0, lit = hB(x + 1) < hB(x); R(lit ? '#5a3a6c' : '#46305c', x, 196 - h, 1, 120); if (h > 64) R(lit ? '#ffd9c2' : '#d9a8a8', x, 196 - h, 1, (h - 60) / 2.2 + x % 3); else R('#7a5a8c', x, 196 - h, 1, 1); }
    for (let x = 340; x < 400; x++) { const h = 60 * Math.exp(-Math.pow((x - 378) / 22, 2)) | 0; R('#2f2a4a', x, 214 - h, 1, 100); R('#4a4470', x, 214 - h, 1, 1); }
    R('#f4f6ee', 377, 143, 3, 10); R('#f4f6ee', 376, 146, 5, 1); R('#1c1533', 388, 144, 1, 22);
    for (let x = 0, k = 0; x < 400; k++) {
      const w = 10 + (k * 7) % 9, h = 16 + (k * 13) % 40, t = 232 - h; R('#1c1533', x, t, w, 100); R('#2a2148', x, t, 1, 100); R('#3a2f5c', x, t, w, 1);
      for (let wy = t + 3; wy < 300; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) if ((wx * 7 + wy * 13) % 5 < 2) R($o, wx, wy, 1, 2);
      x += w + 1;
    }
    for (let y = 60; y < 300; y++) {
      const t = (y - 60) / 240, hw = 7 + 7 * Math.sin(Math.min(1, t / 0.75) * Math.PI / 2), x0 = 44 - hw, cw = hw * 1.1;
      if (y < 78) { R($N, x0, y, 2 * hw, 1); if (y % 3) R($o, x0 + 2, y, 2 * hw - 4, 1); continue; }
      R($N, x0, y, 2 * hw, 1); R('#3f3070', 44 - cw / 2, y, cw, 1); R('#8f7fd0', x0, y, 1, 1); if ((y * 7) % 5 < 2) R($o, x0 + 2 + (y * 13) % (2 * hw - 4 | 0), y, 1, 1);
    }
    R($N, 44, 54, 1, 6); R($v, 44, 53, 1, 2);
    // Tablas del escenario y edificio de Buk: la azotea es la plataforma principal
    R('#4a2f1c', 0, 286, 400, 14); R($O, 0, 286, 400, 1); for (let x = 8; x < 400; x += 22) R($4, x, 287, 1, 13);
    R('#1b2030', m.x, m.y, m.w, m.h); R('#262c44', m.x, m.y, 3, m.h); R($P, m.x + m.w - 3, m.y, 3, m.h);
    for (let y = m.y + 14; y < 300; y += 16) for (let x = m.x + 10; x < m.x + m.w - 16; x += 22) { R((x + y) % 3 ? $o : '#2a3152', x, y, 14, 9); R($P, x + 6, y, 1, 9); }
    R('#3a4266', m.x - 3, m.y, m.w + 6, 5); R('#6f7aa0', m.x - 3, m.y, m.w + 6, 1); R($P, m.x - 3, m.y + 5, m.w + 6, 1);
    R($6, 176, m.y + 9, 48, 14); R('#4f6fd0', 176, m.y + 9, 48, 1); T('buk', 200, m.y + 10, $a, 11, 'center');
  } else if (i === 1) {
    // Torres del Paine por capas, como un decorado: cielo, torres, nieve, cordillera oscura, lomas con vegetación y lago
    sky(['#0f4fd0', '#1b62dc', '#2f7ae8', '#4f97f2', '#7fb8f8', '#b4d8ff']);
    R($C, 50, 0, 1, 30); disc($o, 50, 42, 11); disc('#fff2b0', 50, 42, 9);
    cloud(94, 30, 44, $a, $Q, $C); cloud(300, 26, 50, $a, $Q, $C); cloud(232, 20, 26, $a, $Q, $C);
    for (let x = 0; x < 400; x++) R('#4a4688', x, 150 + 8 * Math.abs(Math.sin(x / 23)), 1, 100);
    // Cada torre es una silueta de puntos (x, y de la cumbre) unidos por rectas: bordes lisos, sin púas
    const lerp = (P, x) => { for (let k = 1; k < P.length; k++) if (x <= P[k][0]) { const a = P[k - 1], b = P[k]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } };
    [[[84, 172], [88, 128], [94, 104], [98, 84], [102, 76], [106, 80], [109, 86], [113, 74], [117, 70], [121, 78], [124, 100], [128, 126], [134, 150], [138, 172]],
      [[146, 172], [150, 120], [156, 84], [162, 60], [170, 46], [180, 38], [190, 34], [198, 36], [206, 44], [212, 60], [216, 90], [220, 130], [224, 172]],
      [[236, 172], [240, 126], [246, 94], [252, 72], [258, 64], [264, 68], [268, 76], [274, 66], [282, 62], [290, 72], [296, 96], [302, 130], [308, 172]],
      [[322, 172], [330, 120], [340, 92], [352, 80], [366, 74], [380, 78], [392, 86], [400, 90]]].forEach((P) => {
      const x0 = P[0][0], x1 = P[P.length - 1][0];
      for (let x = x0; x < x1; x++) {
        const top = (lerp(P, x) / 2 | 0) * 2, band = (x + x0 * 7) / 3 | 0, sh = (x - x0) / (x1 - x0) < 0.28;
        for (let y = top; y < 172; y = (y / 10 | 0) * 10 + 10) {
          const hs = (band * 37 + (y / 10 | 0) * 17 + x0) % 11, lit = !sh && hs % 5 !== 0, low = (y - top) / (172 - top) > 0.7;
          R(lit ? (low && hs % 3 === 0 ? '#b8739a' : ['#f6a84a', '#ee9336', '#f9bd6a', '#e07f2c'][hs % 4]) : hs % 2 ? '#6b5ca6' : '#5a4c94', x, y, 1, 10);
        }
        if (!sh) R('#ffe6b0', x, top, 1, 2);
      }
    });
    // Campo de nieve a los pies de las torres, con sombras azules y rocas que asoman
    for (let x = 0; x < 400; x++) { const gy = 164 + 5 * Math.sin(x / 31) + 2 * Math.sin(x / 9); R($a, x, gy, 1, 70); for (let y = (gy | 0) + 4; y < 214; y += 2) if (((x >> 1) * 3 + (y >> 1) * 2) % 17 < 4) R('#bcd4f8', x, y, 1, 2); }
    [[160, 180, 16], [214, 186, 20], [190, 174, 11], [244, 178, 12]].forEach(([x, y, w]) => { R('#e39a4a', x, y, w, 4); R('#f9bd6a', x + 2, y - 1, w - 5, 1); R('#6b5ca6', x + 1, y + 4, w - 1, 3); });
    for (let x = 0; x < 400; x++) {
      // Cordillera oscura de por medio: dos laderas que bajan hacia el centro y un cordón bajo, con vetas de nieve
      const sd = Math.min(x < 140 ? 100 + x * 0.72 : 999, x > 260 ? 100 + (399 - x) * 0.72 : 999, 203 + 5 * Math.sin(x / 27) + 2 * Math.sin(x / 6));
      R('#3f3d7a', x, sd, 1, 200); R('#55529a', x, sd, 1, 1);
      for (let y = (sd | 0) + 6; y < 222; y += 2) if ((((x < 200 ? x : -x) >> 1) * 2 + (y >> 1) * 2 + 440) % 22 < 3) R($R, x, y, 1, 2);
      const fy = 218 + 6 * Math.sin(x / 37) + 3 * Math.sin(x / 9); R('#e0a82a', x, fy, 1, 60); R('#f4c94a', x, fy, 1, 2); R('#c98f1f', x, fy + 18, 1, 60);
    }
    // Vegetación sobre las lomas doradas: matorrales, arbolitos y rocas en la orilla
    for (let x = 4; x < 400; x += 7) { const fy = 218 + 6 * Math.sin(x / 37) + 3 * Math.sin(x / 9), k = (x * 13) % 5; if (k < 3) { R('#2f6a3a', x, fy + 3 + k * 3, 5 + k, 3); R('#4a9a4a', x + 1, fy + 2 + k * 3, 3, 1); } else if (k === 4) { R('#5a4020', x + 2, fy - 1, 1, 3); R('#2f6a3a', x, fy - 6, 5, 5); R('#4a9a4a', x + 1, fy - 7, 3, 2); } }
    [[46, 256, 14, 8], [64, 259, 10, 6], [330, 257, 12, 7], [346, 260, 9, 5]].forEach(([x, y, w, h]) => { R('#5a4c94', x, y, w, h); R('#8a7fc0', x + 1, y, w - 3, 2); });
    R(WV[1][3], 0, 262, 400, 38);
    // Meseta de roca con pasto
    R('#6a5a4a', m.x, m.y, m.w, m.h); R($S, m.x + m.w - 4, m.y, 4, m.h); R('#7d6b58', m.x, m.y, 3, m.h);
    for (let y = m.y + 12; y < 300; y += 11) R($S, m.x + (y * 5) % 20, y, m.w - 30 - (y * 3) % 40, 1);
    R('#4f8a2a', m.x - 2, m.y, m.w + 4, 5); R($T, m.x - 2, m.y, m.w + 4, 2); for (let x = m.x; x < m.x + m.w; x += 7) R($T, x, m.y - 2 - x % 2, 1, 2);
  } else if (i === 2) {
    // Puerto de Valparaíso: cerros con casas de colores y ascensores, mar abierto con un barco lejano, grúa pórtico y muelle
    sky(['#3f8fd8', '#5fa6e4', '#84bdf0', '#aed4f8', '#d6eaff', '#f2f8ff']);
    R($U, 330, 0, 1, 40); disc($o, 330, 52, 12); disc('#fff2b0', 330, 52, 10);
    cloud(60, 40, 44, $a, $V, $U); cloud(190, 34, 32, $a, $V, $U);
    const hill = (x) => Math.min(142 - 52 * Math.exp(-Math.pow((x - 90) / 70, 2)), 148 - 64 * Math.exp(-Math.pow((x - 232) / 80, 2)), 152 - 46 * Math.exp(-Math.pow((x - 366) / 60, 2)));
    for (let x = 0; x < 400; x++) { const t = hill(x); R('#5f8a52', x, t, 1, 120); R('#7aa868', x, t, 1, 1); }
    for (let x = 2; x < 398; x += 9) for (let y = (hill(x + 3) | 0) + 3 + x % 4; y < 182; y += 9) {
      if ((x * 5 + y * 3) % 11 === 0) continue;
      const k = (x * 7 + y * 13) % 7; R([$B, $m, '#4fa3d1', '#7fc66a', '#e88ac0', $k, '#8a6fd0'][k], x, y, 7, 7); R(k % 2 ? $W : '#4a4a5a', x, y, 7, 1); R($w, x + 1 + k % 3, y + 3, 2, 2); R('rgba(0,0,0,.2)', x + 6, y + 1, 1, 6);
    }
    // Ascensores: riel inclinado con durmientes y una estación en cada extremo (los carros se dibujan en movimiento)
    ASC.forEach(([x0, y0, x1, y1]) => {
      for (let k = 0; k <= 48; k++) { const x = x0 + (x1 - x0) * k / 48, y = y0 + (y1 - y0) * k / 48; R('#5a5f6e', x - 3, y, 7, 3); R($g, x - 3, y, 1, 3); R($g, x + 3, y, 1, 3); if (k % 3 === 0) R($d, x - 3, y, 7, 1); }
      R($b, x0 - 9, y0 - 6, 18, 12); R($k, x0 - 8, y0 - 3, 16, 9); R($W, x0 - 9, y0 - 6, 18, 3); R($w, x0 - 2, y0, 4, 6);
      R($b, x1 - 10, y1 - 13, 20, 14); R($k, x1 - 9, y1 - 9, 18, 10); R($W, x1 - 10, y1 - 13, 20, 4); R($w, x1 - 6, y1 - 6, 4, 4); R($w, x1 + 2, y1 - 6, 4, 4);
    });
    // Costanera y mar abierto; el barco va lejos, chico y pálido para no confundirse con el muelle
    R('#c9b88a', 0, 186, 400, 4); R(WV[2][3], 0, 190, 400, 110); R($J, 0, 190, 400, 1); for (let x = 6; x < 400; x += 23) R($J, x + (x * 7) % 9, 196 + (x * 5) % 30, 7, 1);
    R($x, 104, 201, 60, 6); R($x, 164, 201, 3, 4); R($x, 167, 201, 2, 2); R('#9a6a7a', 104, 206, 63, 1);
    R('#e3e9f2', 108, 193, 12, 8); R($x, 110, 195, 8, 2); R('#b8727a', 111, 188, 4, 5); R('#9fb6d4', 124, 197, 36, 4); for (let x = 132; x < 160; x += 9) R($x, x, 197, 1, 4);
    A(0.5, () => { R($a, 113, 183, 4, 3); R($a, 117, 179, 5, 3); });
    [[300, 205, $B], [224, 214, $m]].forEach(([x, y, col]) => { R(col, x, y, 12, 3); R(col, x + 1, y + 3, 10, 1); R($k, x + 3, y - 3, 4, 3); });
    // Grúa pórtico: viga con riel arriba y dos patas
    [26, 368].forEach((x) => { R($X, x, 26, 6, 280); R($q, x + 5, 26, 1, 280); for (let y = 34; y < 300; y += 14) { R($q, x, y, 6, 1); R($q, x + 1 + (y / 14 & 1) * 3, y + 5, 2, 4); } });
    R($X, 0, 19, 400, 7); R($m, 0, 19, 400, 1); R($q, 0, 25, 400, 1); for (let x = 4; x < 400; x += 12) R($q, x, 21, 6, 2);
    // Muelle de hormigón con franja de seguridad
    R($y, m.x, m.y, m.w, m.h); R($h, m.x + m.w - 4, m.y, 4, m.h); for (let x = m.x + 14; x < m.x + m.w - 10; x += 34) { R($h, x, m.y + 9, 8, 60); R($b, x - 2, m.y + 16, 12, 8); R($d, x + 1, m.y + 18, 6, 4); }
    R($A, m.x - 3, m.y, m.w + 6, 5); R('#dfe2ea', m.x - 3, m.y, m.w + 6, 1); for (let x = m.x - 3; x < m.x + m.w + 3; x += 8) R((x - m.x + 3) / 8 & 1 ? $b : $m, x, m.y + 5, 8, 3);
  } else if (i === 3) {
    // Metro de Santiago: se pelea en las vías; atrás, el andén con azulejos, bancas y el cartel de la estación que tocó
    const nm = STN[stn][0], lc = STN[stn][1];
    R($Y, 0, 0, 400, 300); R($Z, 0, 18, 400, 26); for (let x = 10; x < 400; x += 38) R($Y, x, 18, 3, 26);
    R('#e8e2d0', 0, 44, 400, 150); for (let y = 52; y < 194; y += 9) R($0, 0, y, 400, 1); for (let x = 6; x < 400; x += 12) R($0, x, 44, 1, 150);
    R(lc, 0, 98, 400, 12); R('rgba(0,0,0,.25)', 0, 109, 400, 1); R('rgba(255,255,255,.25)', 0, 98, 400, 1);
    [84, 316].forEach((x) => { R($b, x - 50, 66, 100, 22); R(lc, x - 50, 66, 100, 3); T(nm, x, 73, $a, 9, 'center'); });
    // Plano de la red: cada línea con su color y un trazado parecido al real (x,y dentro de un cuadro de 52x36)
    R($b, 172, 52, 56, 40); R('#f7f5ee', 174, 54, 52, 36);
    [['#a8a8a8', 10.7, 6.4, 10.7, 9.2, 19, 9.2, 22, 10, 30.7, 10, 36.5, 9, 40.6, 6.8, 49.8, 3.9],
      ['#f5a0e0', 31, 11.3, 31, 17, 32.9, 20.9, 32.9, 31],
      ['#f08a00', 36.2, 10.5, 38.2, 11.9, 38.2, 16.8, 41.3, 21.5, 44, 24.6, 46.8, 28.3, 46.8, 30.1],
      ['#1e90d0', 40, 22.5, 37, 24.8, 20.3, 25.5, 14.3, 22.5, 9.6, 19.7],
      ['#c93aa0', 20, 18, 27.3, 16.9, 37, 16.9, 37, 10.5],
      ['#6b2a12', 19.1, 4.3, 24.6, 4.3, 28.7, 7.4, 28.7, 15.4, 43.4, 15.5],
      ['#1a1a8c', 37, 9.6, 40.6, 11.9, 41.4, 21.5, 40, 23.6, 41.4, 33.3],
      ['#00996b', 9.3, 23.2, 9.6, 19.6, 12.2, 11.3, 28.7, 11, 33, 12.3, 33.5, 16.9, 40, 23.5],
      ['#f5b400', 31, 4.7, 31, 9.8, 28.7, 10.5, 28.7, 30.8],
      ['#e2001a', 14.4, 11, 14.4, 13.3, 32.8, 12.3, 37, 9.6, 44.4, 8.7]].forEach((L) => {
      for (let k = 3; k < L.length; k += 2) { const x0 = L[k - 2], y0 = L[k - 1], n = Math.max(Math.abs(L[k] - x0), Math.abs(L[k + 1] - y0)) * 2 | 0; for (let j = 0; j <= n; j++) R(L[0], 174 + x0 + (L[k] - x0) * j / n, 54 + y0 + (L[k + 1] - y0) * j / n, 1, 1); }
    });
    R($I, 226, 120, 36, 11); T('SALIDA', 244, 121, $a, 7, 'center'); R($b, 142, 118, 16, 16); disc($k, 150, 126, 6); R($b, 150, 122, 1, 5); R($b, 150, 126, 4, 1);
    [20, 140, 260, 380].forEach((x) => { R('#b8b2a0', x - 6, 44, 12, 150); R($0, x - 6, 44, 2, 150); R('#8a8576', x + 4, 44, 2, 150); });
    [88, 312].forEach((x) => { R(lc, x - 18, 170, 36, 7); R('rgba(0,0,0,.25)', x - 18, 176, 36, 1); R($d, x - 18, 179, 36, 3); R($d, x - 15, 182, 2, 10); R($d, x + 13, 182, 2, 10); });
    // Andén con línea amarilla, y el foso de las vías con las bocas del túnel a los lados
    R('#9a9aa6', 0, 192, 400, 14); R($A, 0, 192, 400, 1); R($m, 0, 199, 400, 3); for (let x = 0; x < 400; x += 6) R('#c9a227', x, 199, 3, 3); R($h, 0, 206, 400, 4);
    R($Z, 0, 210, 400, 90); for (let x = 12; x < 400; x += 46) R($Y, x, 212, 20, 22);
    R('#0b0c12', 0, 196, 40, 104); R('#0b0c12', 360, 196, 40, 104); R($d, 38, 196, 2, 104); R($d, 360, 196, 2, 104);
    R($d, m.x, m.y, m.w, m.h); for (let x = m.x + 4; x < m.x + m.w - 6; x += 14) R('#5a4a3a', x, m.y + 3, 8, 5);
    R($g, m.x, m.y, m.w, 2); R($y, m.x, m.y + 2, m.w, 1); R($m, m.x, m.y + 12, m.w, 3); R($b, m.x, m.y + 15, m.w, 1);
    for (let y = m.y + 22; y < 300; y += 9) R($Z, m.x + (y * 7) % 30, y, m.w - 40 - (y * 5) % 50, 1);
  } else {
    // Golden Gate: bahía con niebla, cerros, la ciudad a lo lejos y el puente rojo con torres, cables y tirantes
    sky(['#3f8fd8', '#5fa6e4', '#84bdf0', '#aed4f8', '#d6eaff', '#f2f8ff']);
    R($U, 60, 0, 1, 34); disc($o, 60, 46, 12); disc('#fff2b0', 60, 46, 10);
    cloud(170, 34, 40, $a, $V, $U); cloud(318, 50, 50, $a, $V, $U);
    for (let x = 0; x < 400; x++) { const h = 50 * Math.exp(-Math.pow((x - 30) / 70, 2)) + 16 * Math.exp(-Math.pow((x - 380) / 40, 2)); R('#6f8a5a', x, 205 - h, 1, h); R('#8fae72', x, 205 - h, 1, 1); }
    [[262, 20, 8], [272, 30, 7], [281, 22, 9], [304, 34, 6], [312, 18, 10], [324, 26, 8], [334, 40, 5], [341, 22, 9]].forEach(([x, h, w]) => { R('#b8c8e0', x, 204 - h, w, h); R('#dfe8f4', x, 204 - h, 1, h); });
    for (let k = 0; k < 24; k++) R('#b8c8e0', 296 - k / 5, 156 + k * 2, k / 2.5 + 1, 2);
    A(0.5, () => R($a, 0, 180, 400, 14)); A(0.3, () => R($a, 0, 174, 400, 8));
    R(WV[4][3], 0, 204, 400, 96);
    [110, 290].forEach((x) => { R('#9aa0a8', x - 9, 250, 18, 50); R('#c0392b', x - 6, 18, 12, 232); R($B, x - 6, 18, 2, 232); R('#8a281e', x + 4, 18, 2, 232); for (let y = 28; y < 226; y += 34) R('#8a281e', x - 8, y, 16, 4); });
    // Cables: cada tramo cuelga hacia abajo y sube en punta hasta la torre
    for (let x = 0; x < 400; x++) { const cy = x < 110 ? 170 - 150 * Math.pow(x / 110, 2) : x > 290 ? 170 - 150 * Math.pow((400 - x) / 110, 2) : 150 - 130 * Math.pow((x - 200) / 90, 2); R('#c0392b', x, cy, 1, 2); if (x % 9 === 0) R('#a8323f', x, cy, 1, 226 - cy); }
    R('#8a281e', 0, m.y + 4, 400, 12); for (let x = 0; x < 400; x += 12) { R('#c0392b', x, m.y + 4, 1, 12); R('#c0392b', x + 3, m.y + 9, 6, 1); } R('#c0392b', 0, m.y + 15, 400, 2);
    R($d, 0, m.y, 400, 4); R($y, 0, m.y, 400, 1); for (let x = 4; x < 400; x += 20) R($m, x, m.y + 2, 8, 1);
    R('#c0392b', 0, m.y - 6, 400, 1); for (let x = 0; x < 400; x += 6) R('#c0392b', x, m.y - 6, 1, 6);
  }
  c = main; LB.refresh();
}
// Telón rojo: open 0 = cerrado, 1 = abierto. Siempre queda un borde a cada lado y la bambalina arriba
function curtains(open) {
  const w = 20 + (1 - open) * 182;
  for (let x = 0; x < w; x++) { const s = Math.sin(x * 0.55), col = s > 0.5 ? '#c42a3c' : s > -0.3 ? $D : '#74101e'; R(col, x, 0, 1, 300); R(col, 399 - x, 0, 1, 300); }
  R($r, w - 1, 0, 1, 300); R($r, 400 - w, 0, 1, 300);
  R('#74101e', 0, 0, 400, 10); R($r, 0, 10, 400, 1);
  for (let x = 0; x < 400; x += 16) { R($D, x, 11, 16, 3); R($D, x + 2, 14, 12, 2); R($D, x + 5, 16, 6, 1); R($r, x + 6, 17, 4, 1); }
}
// Borde del escenario con candilejas
function footlights() {
  R('#2a1a10', 0, 296, 400, 4); R($O, 0, 296, 400, 1);
  for (let x = 30; x < 400; x += 34) { A(0.1, () => R($u, x - 10, 282, 20, 12)); R($b, x - 4, 293, 8, 4); R($u, x - 3, 292, 6, 2); }
}

// --- Dibujo de un luchador: piezas rectangulares en coordenadas locales, mirando a la derecha ---
function dF(f, fl) {
  const ch = CHARS[f.c];
  if (f.st === 'dead' || (f.inv > 0 && (clk >> 2 & 1))) return;
  if (ch.nn && !fl) { OV = $a; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((o) => { c.save(); c.translate(o[0], o[1]); dF(f, 2); c.restore(); }); OV = 0; }
  const act = f.st === 'fly' ? 'u' : f.st === 'atk' && f.t > f.a.su && f.t <= f.a.su + f.a.ac ? f.an : f.st === 'atk' && f.a.pj ? f.an : 0;
  const air = !f.onG, sw = f.onG && Math.abs(f.vx) > 0.4 ? Math.sin(f.rn) * 2.5 : 0, K = $b, cr = f.cr || (f.st === 'atk' && f.an === 'd');
  c.save(); c.translate(f.x | 0, f.y | 0);
  if (f.st === 'stun' && !f.zz) { c.translate(0, -14); c.rotate(f.t * 0.35 * f.dir); c.translate(0, 14); }
  if (act === 'spin') { c.translate(0, -16); c.rotate(f.t * 0.9 * f.dir); c.translate(0, 16); }
  if (f.st === 'dodge') c.scale(1.2, 0.7);
  const chg = f.st === 'atk' && f.chg > 0 && f.t <= f.a.su ? f.chg / CHG : 0;
  if (chg) c.translate((clk & 1 ? 1 : -1) * chg, 0);
  c.scale(f.dir, 1);
  if (fl > 1) f = { ...f, pow: 0, cf: 0, en: 0, cla: 0 }; // en la pasada de borde no van los brillos
  if (f.pow > 0) A(0.25 + 0.15 * Math.sin(clk / 3), () => R($s, -11, -37, 22, 38));
  // Estela de velocidad del café o la energética
  if ((f.cf > 0 || f.en > 0) && Math.abs(f.vx) > 1) A(0.55, () => { for (let k = 0; k < 3; k++) R(f.en > 0 ? $z : $k, -12 - k * 5 - (clk + k * 3) % 4, -26 + k * 9, 7, 2); });
  if (f.cla > 0) A(0.3 + 0.2 * Math.sin(clk / 2), () => R($E, -12, -38, 24, 39));
  R('rgba(0,0,0,.3)', -6, 0, 12, 1);
  const arm = (sleeve, skin, hand) => {
    if (act === 'u' || act === 'us') { R(sleeve, 4, -22, 3, 4); R(skin, 5, -35, 2, 14); R(hand, 3, -39, 5, 5); }
    else if (act === 'gun') { R(sleeve, 4, -20, 3, 3); R(skin, 6, -20, 7, 2); R($f, 12, -23, 8, 3); R($h, 12, -20, 3, 4); }
    else if (act === 'heavy') { R(sleeve, 4, -20, 3, 3); R(skin, 6, -19, 6, 2); R('#7a1f2a', 10, -30, 11, 14); R('#a8323f', 10, -30, 2, 14); R($k, 20, -29, 2, 12); R($r, 13, -27, 6, 1); R($r, 13, -24, 4, 1); }
    else if (act && act !== 'd' && act !== 'da') { R(sleeve, 4, -20, 3, 3); R(skin, 6, -19, 9, 2); R(hand, 14, -21, 5, 5); }
    else { R(sleeve, 4, -20, 3, 3); R(skin, 5 + sw / 2, -17, 2, 6); R(hand, 4 + sw / 2, -12, 4, 3); }
  };
  // Lo que lleva en la mano: teclado (parado, o estirado al golpear) o pistola banana
  const inHand = () => {
    if (!f.hold) return;
    const ext = act === 'kbd' || act === 'shot', hx = ext ? 14 : 5 + sw / 2, hy = ext ? -21 : -13;
    if (f.hold === 2) bgun(hx + 5, hy + 1);
    else if (ext) { R(K, hx - 1, hy - 5, 20, 8); R($g, hx, hy - 4, 18, 6); for (let k = 0; k < 8; k++) { R($h, hx + 1 + k * 2, hy - 3, 1, 1); R($h, hx + 2 + k * 2, hy - 1, 1, 1); } }
    else { R(K, hx, hy - 11, 6, 14); R($g, hx + 1, hy - 10, 4, 12); for (let k = 0; k < 5; k++) R($h, hx + 2 + k % 2, hy - 9 + k * 2, 1, 1); }
  };
  if (ch.k === 0) {
    const shoe = ch.suit ? $d : $e, glove = ch.suit ? $d : $a, up = air ? 2 : 0;
    // Piernas: agachado (con patada baja al frente), patada en diagonal en el aire, o normales
    if (cr) { R(K, -4, -3, 2, 3); R(shoe, -5, -2, 5, 2); if (act === 'd') { R(K, 2, -4, 12, 2); R(shoe, 13, -6, 4, 5); } else { R(K, 2, -3, 2, 3); R(shoe, 1, -2, 5, 2); } c.translate(0, 4); }
    else if (act === 'da') { R(K, -4, -7, 2, 5); R(shoe, -5, -4, 5, 2); R(K, 2, -7, 3, 3); R(K, 4, -5, 3, 3); R(K, 6, -3, 3, 3); R(shoe, 7, -1, 6, 3); }
    else { R(K, -4 + sw, -7, 2, 7 - up); R(K, 2 - sw, -7, 2, 7 - up); R(shoe, -5 + sw, -2 - up, 5, 2); R(shoe, 1 - sw, -2 - up, 5, 2); }
    R(K, -7 - sw / 2, -18, 4, 2); R(glove, -9 - sw / 2, -19, 3, 4);
    for (let j = 0; j < 26; j++) {
      const s = Math.sin(j / 25 * Math.PI), cx = 3 * s - 1, hw = 1.2 + 4.3 * Math.pow(s, 0.55), y = -8 - j, suit = ch.suit && j > 1 && j < 14;
      R(suit ? '#1c1c24' : $c, cx - hw, y, 2 * hw, 1); R(suit ? '#0e0e14' : $L, cx - hw, y, 1.6, 1); if (!suit && j > 13) R($K, cx + hw - 2.4, y, 1, 1);
      if (suit && j > 6) R($a, cx + hw - 3.2, y, 2.4, 1);
    }
    R($n, -2, -35, 2, 3); R($n, -2, -8, 2, 1);
    if (ch.suit) { R('#e0303a', 5, -20, 1, 6); R(K, 0, -29, 8, 3); R(K, -3, -28, 3, 1); R($a, 5, -29, 1, 1); R(K, 3, -24, 3, 1); }
    else { R($a, 1, -30, 3, 4); R($a, 5, -30, 3, 4); R(K, 2, -28, 1, 2); R(K, 6, -28, 1, 2); R('#e0303a', 2, -24, 5, 2); R(K, 2, -25, 5, 1); }
    arm(K, K, glove); inHand();
  } else {
    const pn = ch.nn ? K : '#2b3350', sho = ch.nn ? K : $i;
    if (cr) { R(pn, -5, -5, 4, 5); R(sho, -5, -2, 5, 2); if (act === 'd') { R(pn, 1, -5, 13, 3); R(sho, 13, -7, 4, 5); } else { R(pn, 1, -5, 4, 5); R(sho, 1, -2, 5, 2); } c.translate(0, 5); }
    else if (act === 'da') { R(pn, -5, -9, 3, 6); R(sho, -5, -4, 4, 2); R(pn, 1, -9, 4, 4); R(pn, 3, -6, 4, 4); R(pn, 5, -3, 4, 3); R(sho, 7, -1, 6, 3); }
    else if (air) { R(pn, -5, -9, 3, 7); R(pn, 2, -10, 3, 7); R(sho, -4, -4, 4, 2); R(sho, 1, -5, 4, 2); }
    else { R(pn, -4 + sw, -9, 3, 9); R(pn, 1 - sw, -9, 3, 9); R(sho, -4 + sw, -2, 4, 2); R(sho, 1 - sw, -2, 4, 2); }
    R(ch.jk ? ch.sh : ch.sk, -7 - sw / 2, -17, 2, 6);
    R(ch.sh, -5, -20, 10, 11); if (!ch.nn) { R('rgba(0,0,0,.2)', -5, -20, 2, 11); R('rgba(255,255,255,.18)', 3, -20, 2, 11); }
    R(ch.sk, -4, -28, 8, 8); R(ch.hr, -4, -30, 8, 3); R(ch.hr, -5, -29, 2, 6); if (ch.nn) { R($a, -1, -26, 2, 2); R($a, 2, -26, 2, 2); } else { R(K, 2, -25, 1, 2); R('#b0705a', 2, -22, 2, 1); }
    if (ch.gl) { R(K, 0, -26, 5, 1); R(K, 1, -26, 3, 3); R('#bfe3ff', 2, -25, 1, 1); }
    if (ch.brd) { R(ch.hr, 0, -22, 4, 2); R(ch.hr, -1, -23, 1, 3); }
    if (ch.jk) { R($d, -1, -20, 2, 7); R('#e8e8ee', 1, -20, 1, 4); R($d, -5, -10, 10, 1); }
    arm(ch.sh, ch.jk ? ch.sh : ch.sk, ch.sk); inHand();
  }
  c.restore();
  if (fl > 1) return;
  const x = f.x | 0, y = f.y | 0;
  if (ch.lg && f.st !== 'stun' && f.st !== 'dodge' && act !== 'spin') T(ch.lg, x, y - 19 + (cr ? 5 : 0), $a, 7, 'center');
  // Logo de Neat al centro de la polera (7x7): barra de arriba con flecha que baja a la izquierda, barra de abajo con flecha que sube a la derecha
  if (ch.ic && f.st !== 'stun' && f.st !== 'dodge') ch.ic.forEach((r) => R($a, x - (f.dir > 0 ? 4 : 3) + r[0], y - 18 + (cr ? 5 : 0) + r[1], r[2], r[3]));
  if (act === 'orb') { const an = f.t * 0.5, sx = x + Math.cos(an) * 17, sy = y - 16 + Math.sin(an) * 14; R('#ff5c8a', sx - 2, sy - 4, 5, 1); R('#e0115f', sx - 4, sy - 3, 9, 3); R($1, sx - 3, sy, 7, 1); R($1, sx - 2, sy + 1, 5, 1); R($1, sx - 1, sy + 2, 3, 1); R($a, sx - 2, sy - 3, 2, 1); }
  if (f.st === 'sh') { const r = 8 + 10 * f.shp / 100 | 0; A(0.3, () => disc(PC[f.i], x, y - 15, r)); A(0.8, () => { for (let k = 0; k < 16; k++) R($a, x + Math.cos(k * 0.393) * r, y - 15 + Math.sin(k * 0.393) * r, 1, 1); }); }
  if (f.slow > 0) { R($i, x - 4, y - 36, 8, 3); R($i, x - 2, y - 33, 2, 3); R($i, x + 2, y - 33, 1, 2); }
  // El pajarito que lleva a Tokus: aletea y lo sostiene de la mano; parpadea cuando se le acaba el vuelo
  if (f.st === 'fly' && (f.t < FLY - 40 || clk >> 2 & 1)) {
    const bx = x + f.dir * 5, by = y - 47, w = clk >> 2 & 1, K = $b;
    R(K, bx - 7, by - 5, 14, 9); R(K, bx + f.dir * 6 - 3, by - 8, 7, 7); R(K, bx - 5, by - (w ? 11 : 1), 10, w ? 7 : 6);
    R($a, bx - 6, by - 4, 12, 7); R($a, bx + f.dir * 6 - 2, by - 7, 5, 5); R('#e3dcf2', bx - 4, by - (w ? 10 : 0), 8, w ? 6 : 4);
    R($F, bx + f.dir * 9 - (f.dir < 0 ? 2 : 0), by - 5, 3, 2); R(K, bx + f.dir * 7, by - 6, 1, 1); R($F, bx - 1, by + 3, 1, 3); R($F, bx + 1, by + 3, 1, 3);
  }
  if (f.hold === 2 && f.st !== 'dead') T('x' + f.am, x, y - 44, $c, 7, 'center');
  if (f.zz) TS('zZz', x, y - 46 - (clk >> 3 & 1), $a, 8, 'center');
  // Golpe cargando: el personaje titila con brillo, cada vez más rápido (se redibuja encima sumando luz)
  if (chg && !fl && !(clk >> (chg < 0.5 ? 3 : chg < 1 ? 2 : 1) & 1)) { c.globalCompositeOperation = 'lighter'; dF(f, 1); c.globalCompositeOperation = 'source-over'; }
}

// --- Lógica de pelea (60 pasos por segundo) ---
const say = (x, y, s, col) => G.fx.push({ x, y, s, col, t: 0, ty: 1 });
// No se le puede pegar: muerto, recién aparecido, con Claude, o en medio de una esquiva
// ¿Está x sobre el hoyo abierto del puente? (st 2 = abierto, 3 = en reparación)
const hole = (x) => si === 4 && G.br.st > 1 && x > G.br.x && x < G.br.x + HW;
const safe = (o) => o.st === 'dead' || o.inv > 0 || o.cla > 0 || (o.st === 'dodge' && o.t > 1 && o.t < 13);
function mk(i) {
  const m = G.st.m;
  return { i, c: cs[i], x: m.x + m.w * (i ? 0.7 : 0.3), y: m.y, vx: 0, vy: 0, dir: i ? -1 : 1, pct: 0, stk: TN.vidas, onG: 1, on: m, jumps: 2, st: 'idle', t: 0, inv: 0, pow: 0, cla: 0, slow: 0, shp: 100, dcd: 0, shd: 0, drop: 0, rn: 0, cpu: i === 1 && !two, cdn: 40, upU: 0, zz: 0, cf: 0, en: 0, hold: 0, am: 0, nsh: 0, fl: 0, fcd: 0 };
}
function newFight() {
  const s = STAGES[si];
  G = { f: 0, cd: 150, freeze: 0, shake: 0, pause: 0, pj: [], it: [], fx: [], hzo: [], hzT: 300, wind: 0, wd: 1, wT: 0, warn: 0, itT: 420, over: -1, ot: 0, crS: null, crN: 0, st: { m: { ...s.m, m: 1 }, p: s.p.map((p) => ({ ...p, ty: p.y })) } };
  G.plats = [G.st.m, ...G.st.p]; G.fs = [mk(0), mk(1)];
  G.tr = { st: 0, t: 0, d: 1, x: 0 }; G.br = { st: 0, t: 420, x: 0 }; stn = Math.random() * STN.length | 0;
  paintStage(si); mode = 'fight'; cur = 0;
}
function start(f, n) { f.st = 'atk'; f.t = 0; f.an = n; f.a = ATK[n]; f.hd = 0; f.chg = 0; if (n === 's' && f.onG) f.vx = f.dir * 1.6; beep(n === 'heavy' ? 140 : 260, 0.05, 'triangle', 0.03); }
function hurt(o, dir, a, src, stun) {
  const pw = (src.pow > 0 ? 1.3 : 1) * (src.en > 0 ? 1.2 : 1); o.pct += a.d * pw * TN.dano;
  const v = (a.kb + o.pct * a.ks) * pw / CHARS[o.c].wt, r = a.a * Math.PI / 180;
  o.vx = dir * Math.cos(r) * v; o.vy = -Math.sin(r) * v; if (o.onG && o.vy > 0) o.vy *= -0.6;
  o.onG = 0; o.on = null; o.st = 'stun'; o.t = 8 + v * 3.2 + (stun || 0) | 0; o.zz = stun ? 1 : 0;
  G.freeze = Math.min(8, 2 + a.d / 3 | 0); G.shake = Math.min(10, 2 + v);
  G.fx.push({ x: o.x, y: o.y - 16, t: 0, ty: 0, s: 4 + v });
  beep(180 - Math.min(120, v * 8), 0.12, 'sawtooth', 0.06, 60);
}
// Un golpe que llega: si el rival tiene el escudo arriba lo gasta y lo empuja un poco; si no, le pega
function strike(o, dir, a, src, stun) {
  if (o.st !== 'sh') return hurt(o, dir, a, src, stun);
  o.shp -= a.d * TN.dano * 2.2; o.vx = dir * 1.4; G.fx.push({ x: o.x - dir * 8, y: o.y - 16, t: 0, ty: 4 }); beep(900, 0.06, 'square', 0.04, 500);
}
function ko(f) {
  G.fx.push({ x: Math.max(0, Math.min(400, f.x)), y: Math.max(0, Math.min(300, f.y)), t: 0, ty: 2, col: PC[f.i] });
  f.st = 'dead'; f.t = 80; f.stk--; f.hold = f.cf = f.en = 0; G.shake = 12; G.freeze = 6; beep(600, 0.6, 'sawtooth', 0.07, 40);
  if (f.stk <= 0 && G.over < 0) { G.over = 1 - f.i; G.ot = 0; }
}
function ai(f, o) {
  const I = { ah: f.st === 'atk' && f.aic-- > 0 }, m = G.st.m, dx = o.x - f.x, dy = o.y - f.y, ad = Math.abs(dx), rnd = Math.random, sp = ATK[CHARS[f.c].s];
  f.cdn--;
  // Tokus volando: va hacia el centro del escenario, sube si está bajo el borde y baja a aterrizar cuando ya está encima
  if (f.st === 'fly') { const cx = m.x + m.w / 2; if (Math.abs(cx - f.x) > 20) I[f.x < cx ? 'r' : 'l'] = 1; if (f.y > m.y - 24) I.u = 1; else if (Math.abs(cx - f.x) < m.w / 2 - 12) I.d = 1; return I; }
  if (f.x < m.x - 2 || f.x > m.x + m.w + 2 || f.y > m.y + 2) {
    I[f.x < (hole(f.x) ? G.br.x + (f.y > m.y ? HW / 2 : f.x < G.br.x + HW / 2 ? -12 : HW + 12) : m.x + m.w / 2) ? 'r' : 'l'] = 1; // en el hoyo: sube por el centro y recién arriba sale hacia el borde
    if (f.vy > 0 || f.y > m.y) { if (f.jumps > 0 && f.cdn <= 0) { I.jmp = 1; f.cdn = 14; } else if (f.jumps <= 0 && CHARS[f.c].s === 'fly' && f.fcd <= 0) I.spc = 1; else if (f.jumps <= 0 && !f.upU) { I.u = 1; I.spc = 1; } }
    return I;
  }
  // Si viene el metro, se sube a la plataforma colgante más cercana y espera ahí
  if (si === 3 && hz && G.tr.st) {
    if (f.onG && f.on !== m) return I;
    const p = G.st.p.reduce((a, b) => Math.abs(b.x + b.w / 2 - f.x) < Math.abs(a.x + a.w / 2 - f.x) ? b : a), px = p.x + p.w / 2;
    if (Math.abs(px - f.x) > 8) I[px > f.x ? 'r' : 'l'] = 1;
    if (Math.abs(px - f.x) < 36 && f.cdn <= 0 && f.vy >= 0) { I.jmp = 1; f.cdn = 16; }
    return I;
  }
  if (si === 4 && G.br.st === 1 && f.on === m && f.x > G.br.x - 6 && f.x < G.br.x + HW + 6) { I[f.x < G.br.x + HW / 2 ? 'l' : 'r'] = 1; return I; } // se aparta del tramo que se va a caer
  if (o.st === 'dead') return I;
  // Ante un golpe que viene: a veces escudo, a veces esquiva hacia atrás
  if (f.shd === 0 && o.st === 'atk' && o.a.w && o.t <= o.a.su && ad < 34 && Math.abs(dy) < 24 && f.onG) f.shd = rnd() < 0.45 ? 14 : -24;
  if (f.shd > 0) { f.shd--; I.sh = 1; if (f.shd === 12 && rnd() < 0.3) I[dx > 0 ? 'l' : 'r'] = 1; return I; }
  if (f.shd < 0) f.shd++;
  if (ad > 20 || Math.sign(dx) !== f.dir) I[dx > 0 ? 'r' : 'l'] = 1;
  if (f.on === m && ((I.l && f.x < Math.max(m.x + 12, 24)) || (I.r && f.x > Math.min(m.x + m.w - 12, 376)))) I.l = I.r = 0; // no acercarse al borde ni a la salida
  if (si === 4 && G.br.st > 1 && f.on === m && ((I.r && f.x < G.br.x + 2 && f.x > G.br.x - 16) || (I.l && f.x > G.br.x + HW - 2 && f.x < G.br.x + HW + 16))) I.jmp = 1; // salta el hoyo del puente
  if (f.blk && f.onG && (I.l || I.r)) I.jmp = 1;
  if (f.cdn <= 0) {
    if (ad < 24 && Math.abs(dy) < 14) { if ((sp.w || sp.pj === 3) && rnd() < 0.25) I.spc = 1; else { I.atk = 1; f.aic = rnd() < 0.2 ? 30 : 0; } if (rnd() < 0.35) I.l = I.r = 0; else if (rnd() < 0.2) I.d = 1; f.cdn = 16 + rnd() * 26; }
    else if (ad < 16 && dy < -14 && dy > -44) { I.u = 1; I.atk = 1; f.cdn = 26; }
    else if (dy < -24 && rnd() < 0.06) { I.jmp = 1; f.cdn = 10; }
    else if (f.hold === 2 && ad > 40 && Math.abs(dy) < 16 && rnd() < 0.08) { I.atk = 1; I.l = I.r = 0; f.cdn = 24; }
    else if (sp.pj && sp.pj !== 3 && ad > 50 && Math.abs(dy) < 20 && rnd() < 0.03) { I.spc = 1; f.cdn = 50; }
  }
  return I;
}
function fighter(f, I) {
  const ch = CHARS[f.c], g = G, sp = ch.sp * TN.vel * (f.slow > 0 ? 0.45 : 1) * (f.en > 0 ? 1.4 : f.cf > 0 ? 1.25 : 1);
  if (f.st === 'dead') { if (--f.t <= 0 && f.stk > 0) Object.assign(f, { st: 'idle', x: si === 4 && G.br.st ? G.br.x + (f.i ? HW + 26 : -26) : 200 + (f.i ? 30 : -30), y: 70, vx: 0, vy: 0, pct: 0, inv: 120, jumps: 1, onG: 0, on: null, zz: 0, slow: 0, rt: 0, iv: 0, shp: 100 }); return; }
  if (f.cf > 0) f.cf--; if (f.en > 0) f.en--; if (!I.sh) f.nsh = 0;
  if (f.scd > 0) f.scd--; if (f.fcd > 0) f.fcd--; if (f.fl && f.st !== 'fly') { f.fl = 0; f.fcd = FCD; } // el vuelo terminó (se soltó, aterrizó o le pegaron): parte la espera
  if (f.inv > 0) f.inv--; if (f.pow > 0) f.pow--; if (f.cla > 0) f.cla--; if (f.slow > 0) f.slow--; if (f.dcd > 0) f.dcd--;
  if (f.st !== 'sh' && f.shp < 100) f.shp += 0.35;
  if (f.iv > 0) { f.iv--; [I.l, I.r] = [I.r, I.l]; }
  if (f.rt > 0) { f.rt--; I.l = I.r = I.jmp = 0; }
  const mv = (I.r ? 1 : 0) - (I.l ? 1 : 0);
  f.cr = f.st === 'atk' && f.an === 'd' ? 1 : 0; // agachado: caja de golpe más baja
  if (f.st === 'stun') { if (--f.t <= 0) { f.st = 'idle'; f.zz = 0; } f.vx *= f.onG ? 0.8 : 0.965; }
  else if (f.st === 'atk') {
    const a = f.a;
    // Al terminar la preparación, si el botón sigue apretado el golpe se queda cargando
    if (a.w && f.t === a.su && I.ah && f.chg < CHG) { if (++f.chg % 9 === 0) beep(260 + f.chg * 9, 0.04, 'square', 0.02); } else f.t++;
    if (f.onG && f.an !== 'spin') f.vx *= 0.75; else if (!f.onG) f.vx += (mv * sp - f.vx) * 0.04;
    if (f.an === 'spin' && f.t > a.su && f.t <= a.su + a.ac) f.vx = f.dir * 4.2;
    if (a.pj && f.t === a.su) { g.pj.push({ x: a.pj === 3 ? f.x : f.x + f.dir * 14, y: a.pj === 3 ? f.y : f.y - (a.pj > 4 ? 2 : 20), vx: f.dir * PJ[a.pj].v, vy: 0, o: f.i, ty: a.pj, l: a.pj === 3 ? 85 : 90 }); beep(a.pj === 1 ? 300 : 700, 0.1, 'square', 0.04, a.pj === 1 ? 150 : 1100); if (a.pj === 4 && --f.am <= 0) { f.hold = 0; say(f.x, f.y - 44, 'SIN BALAS', $t); } }
    if (f.t >= a.su + a.ac + a.re) f.st = 'idle';
  } else if (f.st === 'sh') {
    // Escudo: se gasta mientras se mantiene; con una dirección se convierte en esquiva
    f.vx *= 0.7; f.shp -= 0.9;
    if (f.shp <= 0) { f.shp = 35; f.st = 'stun'; f.t = 100; f.zz = 1; say(f.x, f.y - 44, '¡ESCUDO ROTO!', $v); beep(200, 0.4, 'sawtooth', 0.06, 60); }
    else if (mv && f.dcd <= 0) { f.st = 'dodge'; f.t = 0; f.dd = mv; f.dir = mv; f.dcd = 40; beep(500, 0.08, 'triangle', 0.03, 250); }
    else if (!I.sh || !f.onG) f.st = 'idle';
  } else if (f.st === 'fly') {
    // Tokus colgado del pajarito: sin gravedad, la palanca lo lleva en cualquier dirección. Especial lo suelta; golpe lo suelta pegando
    f.vx += (mv * 2.1 * TN.vel - f.vx) * 0.2; f.vy += (((I.d ? 1 : 0) - (I.u ? 1 : 0)) * 1.9 - f.vy) * 0.2; if (mv) f.dir = mv;
    if (f.onG || I.spc || ++f.t > FLY) f.st = 'idle';
    else if (I.atk) start(f, I.u ? 'u' : I.d ? 'da' : mv ? 's' : 'n');
  } else if (f.st === 'dodge') {
    f.vx = ++f.t <= 14 ? f.dd * 3.4 : f.vx * 0.6; if (f.t >= 22) f.st = 'idle';
  } else if (I.shh && f.hold) {
    // Con un ítem en la mano, el botón de escudo lo suelta: cae a la plataforma que haya debajo
    const py = Math.min(999, ...g.plats.filter((p) => f.x >= p.x && f.x <= p.x + p.w && p.y >= f.y - 1).map((p) => p.y));
    g.it.push({ x: f.x, y: f.y - 12, py, ty: f.hold + 6, on: 0, am: f.am }); f.hold = 0; f.nsh = 1; beep(300, 0.08, 'triangle', 0.03, 150);
  } else if (I.sh && f.onG && !f.nsh) { f.st = 'sh'; f.vx *= 0.5; }
  else {
    f.cr = f.onG && I.d ? 1 : 0;
    if (mv) { f.dir = mv; if (f.onG && !f.cr) f.rn += 0.4; }
    f.vx += ((f.cr ? 0 : mv * sp) - f.vx) * (f.onG ? 0.3 : 0.09);
    if (I.jmp && f.jumps > 0) { f.vy = -(f.onG ? ch.jp : ch.jp * 0.9) * (f.slow > 0 ? 0.85 : 1); f.jumps--; f.onG = 0; f.on = null; beep(420, 0.07, 'square', 0.025, 700); }
    // El botón de golpe toma un teclado o una pistola que esté al lado, si no hay nada en la mano
    const grab = I.atk && !f.hold && g.it.find((it) => it.on && it.ty > 6 && Math.abs(f.x - it.x) < 14 && Math.abs(f.y - it.y) < 14);
    if (grab) { f.hold = grab.ty - 6; f.am = grab.am || SHOTS; g.it.splice(g.it.indexOf(grab), 1); say(f.x, f.y - 44, f.hold === 1 ? '¡TECLADO!' : '¡BananaGun!', f.hold === 1 ? $a : $c); beep(600, 0.12, 'square', 0.04, 900); }
    else if (I.spc) { if (I.u) { if (!f.upU) { f.upU = 1; f.vy = -6.2; f.onG = 0; f.on = null; start(f, 'us'); } } else if (ch.s !== 'fly') { if (f.scd > 0) beep(110, 0.1); else { start(f, ch.s); f.scd = ATK[ch.s].cd; } } else if (f.fcd > 0) beep(110, 0.12); else { f.st = 'fly'; f.t = 0; f.fl = 1; f.onG = 0; f.on = null; f.vy = -1.6; beep(900, 0.25, 'sine', 0.05, 1500); } }
    else if (I.atk) start(f, I.u ? 'u' : I.d ? (f.onG ? 'd' : 'da') : f.hold === 1 ? 'kbd' : f.hold === 2 ? 'shot' : mv ? 's' : 'n');
  }
  if (I.dh && f.onG && f.on && !f.on.m && !f.on.ct && f.st === 'idle') { f.drop = 10; f.onG = 0; f.on = null; f.y += 1; }
  if (f.drop > 0) f.drop--;
  const py = f.y;
  if (!f.onG && f.st !== 'fly') { f.vy += (I.d && f.vy > 0 && f.st !== 'stun' ? 0.42 : 0.22); if (f.vy > 5.5) f.vy = 5.5; }
  f.x += f.vx + g.wind * (f.onG ? 0.35 : 0.8); if (!f.onG) f.y += f.vy;
  if (f.onG && f.on) { if (f.on.vx) f.x += f.on.vx; f.y = f.on.y; if (f.x < f.on.x - 3 || f.x > f.on.x + f.on.w + 3 || f.on.y < -20 || (f.on.m && hole(f.x))) { f.onG = 0; f.on = null; if (f.jumps > 1) f.jumps = 1; } }
  if (!f.onG && f.vy >= 0) for (const p of g.plats) if ((p.m ? !hole(f.x) : f.drop <= 0) && p.y > -20 && py <= p.y + 0.01 && f.y >= p.y && f.x >= p.x - 3 && f.x <= p.x + p.w + 3) { f.y = p.y; f.vy = 0; f.onG = 1; f.on = p; f.jumps = 2; f.upU = 0; break; }
  const m = g.st.m;
  // Dentro del hoyo del puente las paredes de la calle rota no se atraviesan: se cae derecho o se sale saltando
  if (si === 4 && g.br.st > 1 && f.y > m.y + 5 && f.y < m.y + 46) f.x = Math.max(g.br.x + 2, Math.min(g.br.x + HW - 2, f.x));
  if (si !== 4 && f.y > m.y + 5 && f.x > m.x && f.x < m.x + m.w) { f.x = f.x < m.x + m.w / 2 ? m.x : m.x + m.w; f.vx = 0; }
  // Los containers son cajas sólidas: de costado empujan hacia afuera y por abajo topan la cabeza
  f.blk = 0;
  for (const p of g.st.p) if (p.ct && f.on !== p && f.x > p.x && f.x < p.x + p.w && f.y > p.y + 5 && f.y - 28 < p.y + 22) {
    if (f.vy < 0 && f.y > p.y + 30) { f.vy = 1; f.y = p.y + 51; } else { f.x = f.x < p.x + p.w / 2 ? p.x : p.x + p.w; f.vx = 0; f.blk = 1; }
  }
  if (f.x < -50 || f.x > 450 || f.y > 360 || f.y < -110) ko(f);
}
// Peligros del escenario: palomas en la azotea, ráfagas de viento de 5 s en el Paine y la grúa del puerto
function hazards() {
  const g = G, rnd = Math.random;
  if (si === 0) {
    if (--g.hzT <= 0) { const d = rnd() < 0.5 ? 1 : -1; g.hzo.push({ x: d > 0 ? -12 : 412, y: 44 + rnd() * 40, vx: d * 1.1, dt: 30, sq: 0, p: 0 }); g.hzT = 360 + rnd() * 240; }
    const drops = []; // las cacas nuevas se agregan después de recorrer la lista, o se perderían
    g.hzo = g.hzo.filter((b) => {
      if (b.p) {
        const py = b.y; b.vy = Math.min(3.4, b.vy + 0.14); b.y += b.vy;
        for (const f of g.fs) if (!safe(f) && Math.abs(f.x - b.x) < 8 && b.y > f.y - 32 && b.y < f.y) { f.slow = 60; say(f.x, f.y - 46, '¡PUAJ!', $i); beep(250, 0.2, 'sine', 0.05, 90); return false; }
        for (const p of g.plats) if (py <= p.y && b.y >= p.y && b.x >= p.x && b.x <= p.x + p.w) { g.fx.push({ x: b.x, y: p.y, t: 0, ty: 5 }); return false; }
        return b.y < 310;
      }
      b.x += b.vx; if (b.sq > 0) b.sq--;
      // La paloma suelta caca cuando pasa justo encima de un jugador
      if (--b.dt <= 0 && g.fs.some((f) => f.st !== 'dead' && Math.abs(f.x - b.x) < 10 && f.y > b.y)) { drops.push({ x: b.x, y: b.y + 5, vy: 0.5, p: 1 }); b.dt = 70; b.sq = 16; beep(1200, 0.08, 'sine', 0.04, 600); }
      return b.x > -20 && b.x < 420;
    }).concat(drops);
  } else if (si === 2) {
    // Grúa: cada tanto elige un container y lo baja al muelle, lo deja colgando o se lo lleva
    const cn = g.st.p;
    cn.forEach((p) => { const d = p.ty - p.y; if (d) p.y += Math.sign(d) * Math.min(0.8, Math.abs(d)); });
    if (g.warn > 0) { if (--g.warn === 0) { g.crS.ty = g.crN; beep(160, 0.5, 'triangle', 0.04, 110); } }
    else if (--g.hzT <= 0 && cn.every((p) => p.y === p.ty)) { const p = cn[rnd() * 3 | 0], lv = [-40, 160, 210].filter((y) => y !== p.ty); g.crS = p; g.crN = lv[rnd() * 2 | 0]; g.warn = 60; g.hzT = 240 + rnd() * 200; beep(880, 0.1, 'square', 0.03); }
  } else if (si === 3) {
    // Metro: aviso de casi 2 s, luego el tren cruza las vías y atropella una vez a cada jugador que siga abajo
    const tr = g.tr, m = g.st.m;
    if (tr.st === 2) {
      tr.x += tr.d * 9;
      g.fs.forEach((f) => { if (!f.th && !safe(f) && f.y > m.y - 46 && f.y - 28 < m.y && f.x > tr.x && f.x < tr.x + 330) { f.th = 1; hurt(f, tr.d, TRN, { pow: 0 }); say(f.x, f.y - 50, '¡ATROPELLADO! +100%', $v); } });
      if (tr.x < -360 || tr.x > 430) { tr.st = 0; g.hzT = 600 + rnd() * 360; g.fs.forEach((f) => { f.th = 0; }); }
    } else if (tr.st === 1) { if (--tr.t <= 0) { tr.st = 2; tr.x = tr.d > 0 ? -340 : 410; beep(90, 1.3, 'sawtooth', 0.06, 140); } else if (tr.t % 25 === 0) beep(tr.t % 50 ? 660 : 520, 0.2, 'sine', 0.05); }
    else if (--g.hzT <= 0) { tr.st = 1; tr.t = 110; tr.d = rnd() < 0.5 ? 1 : -1; }
  } else if (si === 4) {
    // Golden Gate: los autos avanzan de a ratos. Ciclo del puente: espera, aviso, se cae un tramo, llegan los obreros y lo reparan
    const b = g.br;
    g.st.p.forEach((p) => { if (!p.car) return; if (p.x > 420) p.x = -50; if (b.st) p.vx = 0; else if (--p.t <= 0) { p.vx = p.vx ? 0 : 1; p.t = p.vx ? 70 + rnd() * 50 : 200 + rnd() * 300; } });
    if (--b.t > 0) return;
    b.st = (b.st + 1) % 4; b.t = [420 + rnd() * 300, 90, 400, 150][b.st];
    if (b.st === 1) { for (let k = 0; k < 20; k++) { b.x = 124 + rnd() * 102; if (!g.st.p.some((p) => p.car && p.x < b.x + HW + 4 && p.x + 38 > b.x)) break; } beep(700, 0.3, 'square', 0.04, 500); }
    if (b.st === 2) { g.shake = 8; beep(80, 0.6, 'sawtooth', 0.07, 40); }
  } else if (g.wT > 0) { if (--g.wT === 0) g.wind = 0; }
  else if (g.warn > 0) { if (--g.warn === 0) { g.wind = g.wd; g.wT = 300; g.hzT = 540 + rnd() * 360; beep(120, 1.2, 'sawtooth', 0.03, 200); } }
  else if (--g.hzT <= 0) { g.wd = rnd() < 0.5 ? 1 : -1; g.warn = 70; }
}
// Música: melodía (una letra por corchea, a = La3, - = sigue sonando) y la nota del bajo de cada compás
const MEL = 't-ptt-kou-puu-tpk-ork-u-r-umt-momoptt-kou-p-u-puk-kor-u-urm-t-k-m-t-tmpttu--u-i-kor-k-ouu-r-r-urp-t-t-w-w-u-u-put---trpom---t-o-', BAS = 'aaiikkfhaaiikkfhaaiikkffadiihhfh';
// Un estilo por pantalla sobre el mismo motivo: 0 menús (swing), 1-5 los mapas (funk, andino, vals, techno, motivo original).
// Cada uno: cuadros por corchea, onda y semitonos de la melodía, y el bajo [notas del compás, duración, onda, volumen]
let muS = 0, muT = 0, muK = -1;
function music() {
  const k = mode === 'fight' ? si + 1 : 0, n = (x) => 220 * 2 ** (x / 12), mb = (f, d, ty, v, f2) => beep(f, d, ty, v * TN.mus, f2);
  if (!TN.mus) return;
  if (k !== muK) { muK = k; muS = muT = 0; }
  if (--muT > 0) return;
  let s = muS, d = 1;
  if (k === 3 && (s & 3) === 3) s = (s + 1) % 128; // vals: cada compás pierde su última corchea
  muS = (s + 1) % 128;
  const q = s & 3, [fr, wv, oc] = [[15, 'triangle', 12], [12, 'sawtooth', 0], [18, 'triangle', 12], [15, 'square', 0], [10, 'square', -12], [14, 'square', 0]][k],
    B = [[[0, 7, 12, 10], 0.25, 'triangle', 0.06], [[0, 0, 12, 0], q ? 0.12 : 0.18, 'square', 0.03], [[0, 7, 12, 7], 0.5, 'triangle', 0.04], [[0, 7, 7], q ? 0.12 : 0.4, q ? 'square' : 'triangle', q ? 0.01 : 0.06], [[0, 12, 0, 12], 0.09, 'sawtooth', 0.03], [[0, 12, 0, 12], 0.2, 'triangle', 0.05]][k],
    m = MEL.charCodeAt(s) - 97, r = BAS.charCodeAt(s >> 2) - 109, kick = () => mb(150, 0.12, 'sine', 0.1, 40);
  muT = k ? fr : s & 1 ? 10 : 20; // swing: corchea larga y corta
  while (MEL[(s + d) % 128] === '-') d++;
  if (m >= 0) mb(n(m + oc), d * fr / 63, wv, wv > 't' ? 0.05 : 0.02);
  mb(n(r + B[0][q]), B[1], B[2], B[3]);
  if (k === 3 && q) mb(n(r + 12), 0.12, 'square', 0.01);
  if (k < 2) { if (!q) kick(); if (q === 2) mb(1800, 0.03, 'square', 0.015); }
  if (k === 4) s & 1 ? mb(2400, 0.02, 'square', 0.012) : kick();
}
function tick() {
  clk++; music();
  const st = hit.START1 || hit.START2, b1 = any('1'), ud = (any('D') ? 1 : 0) - (any('U') ? 1 : 0), lr = (any('R') ? 1 : 0) - (any('L') ? 1 : 0);
  cur += ((mode === 'title' || mode === 'end' ? 0 : 1) - cur) * 0.06;
  if (mode === 'title') {
    if (ud) { tsel = (tsel + ud + 4) % 4; beep(440, 0.05); }
    if (st || b1) { beep(520, 0.12, 'square', 0.04, 1040); if (tsel > 1) { mode = tsel === 2 ? 'tune' : 'ctl'; tunB = 'title'; } else { two = tsel; mode = 'sel'; } }
    return;
  }
  if (mode === 'ctl') {
    // Cada jugador mueve su propia columna: arriba/abajo elige la acción, izquierda/derecha le cambia el botón
    [0, 1].forEach((i) => {
      const k = 'P' + (i + 1) + '_', m = KM[i], d = (hit[k + 'D'] ? 1 : 0) - (hit[k + 'U'] ? 1 : 0), ch = (hit[k + 'R'] ? 1 : 0) - (hit[k + 'L'] ? 1 : 0);
      if (d) { csel[i] = (csel[i] + d + 4) % 4; beep(440, 0.05); }
      if (ch) { const a = ACTS[csel[i]][0], old = m[a], nw = (old - 1 + ch + 6) % 6 + 1, o = ACTS.find((x) => m[x[0]] === nw); if (o) m[o[0]] = old; m[a] = nw; beep(660, 0.04); } // si el botón ya estaba en uso, se intercambian
    });
    if (any('2')) { pc = 1 - pc; preset(); beep(330, 0.1); } // botón 2 alterna entre gabinete y PC, y carga sus botones por defecto
    if (st) { save(); mode = tunB; beep(520, 0.1); }
    return;
  }
  if (mode === 'tune') {
    const row = TUNE_L[tunS];
    if (ud) { tunS = (tunS + ud + TUNE_L.length) % TUNE_L.length; beep(440, 0.05); }
    if (lr) { TN[row[0]] = Math.max(row[3], Math.min(row[4], Math.round((TN[row[0]] + lr * row[2]) * 100) / 100)); beep(660, 0.04); }
    if (any('2')) { TN = { ...TUNE0 }; beep(330, 0.1); }
    if (st || b1) { save(); mode = tunB; beep(520, 0.1); }
    return;
  }
  if (mode === 'sel') {
    const n = CHARS.length, mvc = (i, d) => { cs[i] = (cs[i] + d + n) % n; beep(440, 0.05); };
    if (hit.P1_L) mvc(0, -1); if (hit.P1_R) mvc(0, 1);
    if (two) { if (hit.P2_L) mvc(1, -1); if (hit.P2_R) mvc(1, 1); } else { if (hit.P1_U) mvc(1, -1); if (hit.P1_D) mvc(1, 1); }
    if (any('2')) { si = (si + 1) % STAGES.length; paintStage(si); beep(330, 0.08); }
    if (any('3')) { hz = 1 - hz; save(); beep(330, 0.08); }
    if (st || b1) { newFight(); beep(520, 0.15, 'square', 0.04, 1040); }
    return;
  }
  if (mode === 'end') { if (++G.ot > 60 && (st || b1)) { mode = 'sel'; paintStage(si); } return; }
  const g = G;
  // Pausa: START la abre; adentro se elige continuar, perillas o volver al menú
  if (g.pause) {
    if (ud) { psel = (psel + ud + 4) % 4; beep(440, 0.05); }
    if (st || b1) { beep(520, 0.1); if (psel === 0) g.pause = 0; else if (psel < 3) { mode = psel === 1 ? 'tune' : 'ctl'; tunB = 'fight'; } else { mode = 'title'; paintStage(0); } }
    return;
  }
  if (st && g.over < 0 && g.cd <= 0) { g.pause = 1; psel = 0; beep(330, 0.1); return; }
  g.f++;
  if (g.cd > 0) { g.cd--; if (g.cd % 50 === 0) beep(g.cd ? 440 : 880, 0.15, 'square', 0.05); return; }
  if (g.freeze > 0) { g.freeze--; keepHit = 1; return; } // en la pausa del impacto no se pierden los botones recién apretados
  if (g.over >= 0 && ++g.ot > 150) { mode = 'end'; g.ot = 0; return; }
  g.st.p.forEach((p) => { if (p.vx) { p.x += p.vx; if (p.x < p.x0 || p.x > p.x1) p.vx *= -1; } });
  if (hz) hazards();
  g.fs.forEach((f, i) => fighter(f, f.cpu ? ai(f, g.fs[1 - i]) : inp(i + 1)));
  // Golpes cuerpo a cuerpo
  g.fs.forEach((f, i) => {
    const o = g.fs[1 - i], a = f.a;
    if (f.st !== 'atk' || !a.w || f.hd || f.t <= a.su || f.t > a.su + a.ac || safe(o)) return;
    const hx = f.x + f.dir * a.x - a.w / 2, hy = f.y + a.y - a.h / 2;
    if (hx < o.x + 6 && hx + a.w > o.x - 6 && hy < o.y && hy + a.h > o.y - (o.cr ? 18 : 28)) { const cm = 1 + (CHGX - 1) * f.chg / CHG; f.hd = 1; strike(o, Math.sign(o.x - f.x) || f.dir, cm > 1 ? { ...a, d: a.d * cm, kb: a.kb * cm } : a, f); }
  });
  // Proyectiles
  g.pj = g.pj.filter((p) => {
    const o = g.fs[1 - p.o], src = g.fs[p.o];
    if (p.ty === 3) {
      const py = p.y; p.vy += 0.2; p.x += p.vx; p.y += p.vy;
      if (p.vy > 0) for (const pl of g.plats) if (py <= pl.y && p.y >= pl.y && p.x >= pl.x && p.x <= pl.x + pl.w) { p.y = pl.y; p.vy = p.vy > 1 ? -p.vy * 0.45 : 0; p.vx *= 0.45; }
      if (--p.l > 0) return p.y < 330;
      g.fx.push({ x: p.x, y: p.y - 4, t: 0, ty: 3 }); g.shake = 6; beep(90, 0.35, 'sawtooth', 0.07, 40);
      if (!safe(o) && Math.hypot(o.x - p.x, o.y - 14 - p.y) < 30) strike(o, Math.sign(o.x - p.x) || 1, PJ[3], src);
      return false;
    }
    p.x += p.vx;
    if (!safe(o) && Math.abs(o.x - p.x) < 9 && p.y < o.y + 2 && p.y > o.y - (o.cr ? 19 : 30)) {
      if (p.ty < 5) strike(o, Math.sign(p.vx), PJ[p.ty], src, p.ty === 1 ? 34 : 0);
      else if (o.st === 'sh') beep(900, 0.06);
      // SUDO: al azar lo clava al piso (rt), le invierte la palanca (iv) o lo deja lento
      else { const k = Math.random() * 3 | 0; o[['rt', 'iv', 'slow'][k]] = k ? 240 : 100; o.pct += 6 * TN.dano; say(o.x, o.y - 44, ['¡ROOTEADO!', '¡CONTROLES INVERTIDOS!', '¡LENTO!'][k], $a); beep(160, 0.3, 'sawtooth', 0.06, 50); }
      return false;
    }
    return --p.l > 0 && p.x > -20 && p.x < 420;
  });
  // Ítems: caen del cielo sobre una plataforma fija
  if (--g.itT <= 0 && g.it.length < 2) { const ps = g.plats.filter((p) => !p.vx && !p.ct && !p.car), p = ps[Math.random() * ps.length | 0]; g.it.push({ x: Math.max(30, Math.min(370, p.x + 8 + Math.random() * (p.w - 16))), y: -10, py: p.y, ty: ITEM_BAG[Math.random() * ITEM_BAG.length | 0], on: 0 }); g.itT = 500 + Math.random() * 400; }
  g.it = g.it.filter((it) => {
    if (!it.on) { it.y += 2.2; if (it.y >= it.py) { it.y = it.py; it.on = 1; } return it.y < 330; }
    if (it.ty > 6) return true; // teclado y pistola no se usan al tocarlos: se toman con el botón de golpe
    for (const f of g.fs) {
      if (f.st === 'dead' || f.st === 'stun' || Math.abs(f.x - it.x) > 9 || Math.abs(f.y - it.y) > 12) continue;
      if (it.ty === 0) { f.cf = 420; say(f.x, f.y - 44, '¡CAFÉ!', $k); beep(500, 0.2, 'sine', 0.05, 1000); }
      else if (it.ty === 1) { f.en = 480; say(f.x, f.y - 44, '¡ENERGÍA!', $z); beep(400, 0.3, 'square', 0.05, 1400); }
      else if (it.ty > 4) { const q = it.ty === 6 ? 60 : 30; f.pct = Math.max(0, f.pct - q); say(f.x, f.y - 44, '-' + q + '%', '#7cff9a'); beep(500, 0.2, 'sine', 0.05, 1000); }
      else if (it.ty === 2) { f.pow = 480; say(f.x, f.y - 44, '¡GPU!', $s); beep(300, 0.3, 'square', 0.05, 1200); }
      else if (it.ty === 4) { f.cla = 600; say(f.x, f.y - 44, '¡INVENCIBLE!', $E); beep(400, 0.4, 'triangle', 0.06, 1600); }
      else { if (!f.onG || f.cla > 0) continue; f.st = 'stun'; f.t = 55; f.zz = 0; f.vx = f.dir * 2.6; f.pct += 6; say(f.x, f.y - 44, '¡RESBALÓN!', $c); beep(700, 0.3, 'sine', 0.05, 200); }
      return false;
    }
    return true;
  });
  g.fx = g.fx.filter((x) => ++x.t < [12, 50, 36, 18, 10, 90][x.ty]);
}

// --- Dibujo ---
function hud() {
  G.fs.forEach((f, i) => {
    const x = i ? 228 : 62, ch = CHARS[f.c], p = Math.min(1, f.pct / 150);
    R('rgba(0,0,0,.6)', x, 258, 110, 34); R(PC[i], x, 258, 110, 2);
    T((f.cpu ? 'CPU · ' : 'J' + (i + 1) + ' · ') + ch.n, x + 5, 262, PC[i], 7);
    TS((f.pct | 0) + '%', x + 5, 271, 'rgb(255,' + (255 - 200 * p | 0) + ',' + (255 - 230 * p | 0) + ')', 18);
    for (let k = 0; k < TN.vidas; k++) R(k < f.stk ? PC[i] : $d, x + 106 - (TN.vidas - k) * 8, 281, 6, 6);
    const lb = f.cla > 0 ? ['CLAUDE', $E] : f.pow > 0 ? ['GPU', $s] : f.en > 0 ? ['ENERGÍA', $s] : f.cf > 0 ? ['CAFÉ', $k] : f.st === 'fly' ? ['VOLANDO', '#e3dcf2'] : f.fcd > 0 ? ['PÁJARO ' + Math.ceil(f.fcd / 60) + 's', $f] : ['', ''];
    T(lb[0], x + 105, 271, lb[1], 7, 'right');
  });
}
function menu(opts, sel, y) { opts.forEach((s, i) => { if (i === sel) R($e, 110, y - 3 + i * 17, 180, 15); T(s, 200, y + i * 17, i === sel ? $G : $j, 10, 'center'); }); }
function drawItem(it) {
  const x = it.x | 0, y = it.y | 0, b = it.on ? (clk >> 4 & 1) : 0, K = $b;
  if (it.ty === 5) { disc(K, x, y - 6 - b, 6); disc('#c98a4a', x, y - 6 - b, 5); R('#e0a868', x - 3, y - 10 - b, 4, 1); R($H, x - 2, y - 8 - b, 2, 2); R($H, x + 2, y - 6 - b, 2, 2); R($H, x - 3, y - 4 - b, 2, 2); R($H, x + 1, y - 10 - b, 1, 1); }
  else if (it.ty === 6) { R(K, x - 8, y - 12 - b, 16, 12); R($2, x - 6, y - 12 - b, 12, 2); R($2, x - 7, y - 10 - b, 14, 2); R($3, x - 4, y - 11 - b, 1, 1); R($3, x, y - 12 - b, 1, 1); R($3, x + 3, y - 11 - b, 1, 1); R('#4f8a2a', x - 8, y - 8 - b, 16, 1); R($m, x - 7, y - 7 - b, 14, 1); R('#6b3a1a', x - 7, y - 6 - b, 14, 3); R($B, x - 7, y - 3 - b, 14, 1); R($2, x - 7, y - 2 - b, 14, 2); }
  else if (it.ty === 7) { R(K, x - 10, y - 7 - b, 20, 7); R($g, x - 9, y - 6 - b, 18, 5); for (let k = 0; k < 8; k++) { R($h, x - 8 + k * 2, y - 5 - b, 1, 1); R($h, x - 7 + k * 2, y - 3 - b, 1, 1); } R($h, x - 5, y - 2 - b, 9, 1); }
  else if (it.ty === 8) { bgun(x, y - 3 - b); if (it.on) TS('BananaGun', x, y - 19 - b, $c, 6, 'center'); }
  else if (it.ty === 0) { R(K, x - 4, y - 8 - b, 8, 8); R($a, x - 3, y - 7 - b, 5, 6); R($n, x - 3, y - 7 - b, 5, 2); R($a, x + 2, y - 5 - b, 2, 2); A(0.6, () => R($a, x - 1, y - 12 - b, 1, 3)); }
  else if (it.ty === 1) { R(K, x - 4, y - 14 - b, 8, 14); R('#2a2a34', x - 3, y - 13 - b, 6, 12); R($f, x - 3, y - 13 - b, 6, 1); R($z, x, y - 11 - b, 2, 3); R($z, x - 2, y - 8 - b, 4, 1); R($z, x - 1, y - 7 - b, 2, 4); }
  else if (it.ty === 2) { R(K, x - 7, y - 8 - b, 14, 7); R($s, x - 6, y - 7 - b, 12, 2); R($f, x - 5, y - 4 - b, 4, 3); R($f, x + 1, y - 4 - b, 4, 3); R($o, x - 5, y - 1 - b, 9, 1); }
  else if (it.ty === 4) { const o = $E, cy = y - 9 - b; R(o, x - 1, cy - 7, 2, 14); R(o, x - 7, cy - 1, 14, 2); for (let k = 2; k < 6; k++) { R(o, x - k - 1, cy - k, 2, 2); R(o, x + k - 1, cy - k, 2, 2); R(o, x - k - 1, cy + k - 1, 2, 2); R(o, x + k - 1, cy + k - 1, 2, 2); } R('#f4c9b0', x - 1, cy - 1, 2, 2); }
  else {
    const col = { o: '#2a2008', y: '#f4d53a', l: $K, d: '#c9a227', t: '#8a9a2a' };
    PEEL.forEach((r, j) => { for (let k = 0; k < 24; k++) if (r[k] !== '.') R(col[r[k]], x - 12 + k, y - 12 + j, 1, 1); });
  }
}
function draw() {
  c.drawImage(LB.canvas, 0, 0, 400, 300);
  if (mode === 'title') {
    curtains(cur); A(0.1, () => { disc($a, 200, 70, 90); disc($a, 200, 70, 60); });
    TS('SUPER PLATANUS', 200, 28, $e, 24, 'center'); T('SHOWDOWN', 201, 50, $p, 40, 'center'); TS('SHOWDOWN', 200, 48, $a, 40, 'center');
    R($a, 110, 90, 180, 1);
    T('PELEA DE PLATAFORMAS · PLATANUS HACK [26]', 200, 106, $j, 8, 'center');
    menu(['1 JUGADOR  vs  CPU', '2 JUGADORES', 'AJUSTES', 'CONTROLES'], tsel, 121);
    [['PALANCA', 'MOVERSE · SALTAR · AGACHARSE'], [lab(0, 'atk'), 'GOLPE'], [lab(0, 'spc'), 'ESPECIAL'], [lab(0, 'sh'), 'ESCUDO'], ['ÍTEMS', 'GOLPE TOMA · ESCUDO SUELTA'], ['START', 'PAUSA']].forEach((r, i) => { T(r[0], 104, 193 + i * 11, $e, 8, 'right'); T(r[1], 110, 193 + i * 11, $j, 8); });
    if (clk % 60 < 36) T('PRESIONA START', 200, 266, $p, 12, 'center');
    T('by bvasquezm', 24, 284, $j, 7);
    footlights(); return;
  }
  if (mode === 'ctl') {
    R('rgba(0,0,0,.8)', 0, 0, 400, 300);
    T('CONTROLES', 200, 20, $e, 20, 'center'); T('QUÉ BOTÓN HACE CADA ACCIÓN · LA PALANCA NO CAMBIA', 200, 46, $t, 7, 'center');
    [0, 1].forEach((i) => {
      const x = i ? 290 : 110; R('rgba(255,255,255,.06)', x - 80, 66, 160, 150); R(PC[i], x - 80, 66, 160, 2); T('JUGADOR ' + (i + 1), x, 74, PC[i], 10, 'center');
      ACTS.forEach((a, k) => { const y = 100 + k * 26, on = k === csel[i]; if (on) R(PC[i], x - 72, y - 4, 144, 20); T(a[1], x - 64, y + 1, on ? $G : $j, 9); T((on ? '◄ ' : '') + lab(i, a[0]) + (on ? ' ►' : ''), x + 64, y + 1, on ? $G : $j, 9, 'right'); });
    });
    T('DISPOSICIÓN: ' + (pc ? 'PC · J1 WASD + F G H T · J2 FLECHAS + J K L I' : 'GABINETE (ORIGINAL)'), 200, 222, $e, 8, 'center');
    T('BOTÓN 2 (TECLA I O T): CAMBIAR ENTRE GABINETE Y PC', 200, 234, $j, 8, 'center');
    T('CADA JUGADOR CON SU PALANCA: ↑↓ ELIGE · ←→ CAMBIA', 200, 248, $t, 7, 'center');
    T('START: VOLVER', 200, 268, $p, 10, 'center');
    return;
  }
  if (mode === 'tune') {
    R('rgba(0,0,0,.8)', 0, 0, 400, 300);
    T('AJUSTES', 200, 16, $e, 20, 'center'); T('1.00 ES EL VALOR ORIGINAL', 200, 42, $t, 7, 'center');
    TUNE_L.forEach((r, i) => {
      const y = 64 + i * 26, v = TN[r[0]], on = i === tunS;
      if (on) R('rgba(225,255,0,.12)', 40, y - 4, 320, 22);
      T(r[1], 50, y + 2, on ? $e : $j, 9); R($d, 190, y + 4, 120, 6); R(on ? $e : $f, 190, y + 4, 120 * (v - r[3]) / (r[4] - r[3]), 6);
      R($a, 190 + 120 * (TUNE0[r[0]] - r[3]) / (r[4] - r[3]), y + 2, 1, 10);
      T(r[0] === 'vidas' ? String(v) : v ? v.toFixed(2) : 'NO', 350, y + 2, on ? $e : $j, 9, 'right');
    });
    T('↑↓ ELIGE · ←→ AJUSTA · BOTÓN 2 RESTABLECE TODO', 200, 254, $j, 8, 'center');
    T('START O BOTÓN 1: GUARDAR Y VOLVER', 200, 270, $p, 10, 'center');
    return;
  }
  if (mode === 'sel') {
    R('rgba(0,0,0,.62)', 0, 0, 400, 300);
    T('ELIGE TU CRACK', 200, 24, $e, 18, 'center');
    [0, 1].forEach((i) => {
      const x = i ? 290 : 110, ch = CHARS[cs[i]];
      R('rgba(255,255,255,.06)', x - 70, 50, 140, 168); R(PC[i], x - 70, 50, 140, 2);
      T(i && !two ? 'CPU' : 'JUGADOR ' + (i + 1), x, 56, PC[i], 9, 'center');
      c.save(); c.translate(x, 172); c.scale(3, 3); dF({ c: cs[i], i, x: 0, y: 0, dir: i ? -1 : 1, st: 'idle', onG: 1, vx: 0, rn: 0, t: 0, inv: 0, pow: 0, cla: 0, slow: 0 }); c.restore();
      T('◄ ' + ch.n + ' ►', x, 182, $a, 9, 'center'); T(ch.tip, x, 196, $t, 8, 'center');
      T(i && !two ? 'J1: ↑↓ CAMBIA AL RIVAL' : '←→ CAMBIA', x, 207, $f, 6, 'center');
    });
    T('VS', 200, 110, $a, 22, 'center');
    T('ESCENARIO · BOTÓN 2 CAMBIA', 200, 215, $f, 6, 'center'); TS(STAGES[si].n, 200, 222, $e, 14, 'center');
    T('PELIGROS (' + STAGES[si].hz + '): ' + (hz ? 'SÍ' : 'NO') + '   (BOTÓN 3 CAMBIA)', 200, 241, hz ? $j : $f, 9, 'center');
    if (clk % 60 < 36) T('START O BOTÓN 1: ¡A ESCENA!', 200, 262, $p, 12, 'center');
    curtains(cur); footlights(); return;
  }
  const g = G;
  c.save();
  if (g.shake > 0) { c.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake); g.shake *= 0.85; if (g.shake < 0.5) g.shake = 0; }
  // Plataformas colgando de cuerdas, como utilería
  g.st.p.forEach((p) => {
    if (p.car) {
      // Auto: se puede pelear arriba del techo
      const col = [$m, $B, $i][p.col], x = p.x | 0, y = p.y;
      R($b, x - 1, y + 4, 36, 9); R($b, x + 6, y - 1, 21, 6); R(col, x, y + 5, 34, 7); R(col, x + 7, y, 19, 5); R('#bfe3ff', x + 9, y + 1, 7, 4); R('#bfe3ff', x + 18, y + 1, 6, 4);
      R($u, x + 32, y + 6, 2, 2); R('#e0303a', x, y + 6, 1, 2); R($b, x + 4, y + 9, 7, 5); R($b, x + 23, y + 9, 7, 5); R($f, x + 6, y + 11, 3, 2); R($f, x + 25, y + 11, 3, 2);
      return;
    }
    if (p.ct) {
      if (p.y < -24) return;
      const cx = p.x + p.w / 2, col = ['#c0392b', '#2f7fbf', $X][p.col], dk = ['#8a281e', '#1f5a8a', $q][p.col];
      R($b, cx, 26, 1, p.y - 26); R($d, cx - 7, 20, 14, 6); R($b, cx - 3, p.y - 4, 6, 4);
      R($b, p.x - 1, p.y - 1, p.w + 2, 24); R(col, p.x, p.y, p.w, 22); for (let x = p.x + 3; x < p.x + p.w - 2; x += 5) R(dk, x, p.y + 2, 1, 18);
      R('rgba(255,255,255,.3)', p.x, p.y, p.w, 1); R(dk, p.x, p.y + 20, p.w, 2); R($i, p.x + 16, p.y + 7, 16, 7); R(dk, p.x + 18, p.y + 9, 12, 1); R(dk, p.x + 18, p.y + 11, 8, 1);
      return;
    }
    const rope = si % 3 ? $O : $w; if (si !== 4) { R(rope, p.x + 4, 0, 1, p.y); R(rope, p.x + p.w - 5, 0, 1, p.y); }
    if (si === 0) { R('#39405a', p.x, p.y, p.w, 4); R('#8f9ac0', p.x, p.y, p.w, 1); for (let x = p.x + 3; x < p.x + p.w - 3; x += 6) R($e, x, p.y + 2, 3, 1); }
    else if (si === 3) {
      // Metro: el cartel colgante con el logo al centro y dos luminarias a los lados
      if (p.w > 60) {
        // Cartel colgante con el logo del metro: anillo rojo con tres rombos
        const cx = p.x + 20, cy = p.y + 14;
        R($b, p.x, p.y, p.w, 28); R($i, p.x + 1, p.y + 2, p.w - 2, 25); R($d, p.x, p.y, p.w, 2);
        for (let dy = -10; dy <= 10; dy++) { const w = Math.round(15 * Math.sqrt(1 - dy * dy / 100)), v = Math.abs(dy) > 8 ? 0 : Math.round(13 * Math.sqrt(1 - dy * dy / 64)); R($l, cx - w, cy + dy, 2 * w + 1, 1); if (v) R($i, cx - v, cy + dy, 2 * v + 1, 1); }
        for (let k = -1; k < 2; k++) for (let dy = -3; dy <= 3; dy++) R($l, cx + k * 7 - (3 - Math.abs(dy)), cy + dy, 2 * (3 - Math.abs(dy)) + 1, 1);
        T('METRO', p.x + 58, p.y + 10, $b, 9, 'center');
      }
      else { R($d, p.x, p.y, p.w, 4); R($y, p.x, p.y, p.w, 1); R($R, p.x + 3, p.y + 4, p.w - 6, 2); A(0.07, () => { for (let k = 0; k < 34; k++) R($R, p.x + 3 - k / 3, p.y + 6 + k, p.w - 6 + k * 2 / 3, 1); }); }
    }
    else if (si === 4) { R($b, p.x - 1, p.y - 1, p.w + 2, 7); R('#8a281e', p.x, p.y, p.w, 5); R($B, p.x, p.y, p.w, 1); for (let x = p.x + 3; x < p.x + p.w - 2; x += 6) R('#c0392b', x, p.y + 2, 2, 2); } // travesaño de la torre
    else if (p.vx) { R($a, p.x + 6, p.y - 3, p.w - 12, 3); R($a, p.x, p.y, p.w, 4); R($V, p.x + 3, p.y + 4, p.w - 6, 2); }
    else { R('#7d7468', p.x, p.y, p.w, 6); R($S, p.x + 3, p.y + 6, p.w - 6, 2); R($T, p.x, p.y, p.w, 2); }
  });
  // Golden Gate: grietas de aviso, el hoyo con el tramo cayendo, y los obreros que rellenan la calle desde los bordes
  if (si === 4 && g.br.st) {
    const b = g.br, my = g.st.m.y, x = b.x | 0;
    if (b.st === 1) { if (clk >> 2 & 1) { for (let k = 0; k < 6; k++) R($b, x + 3 + k * 9, my + k % 2 * 2, 2, 3 + k % 3); TS('¡SE CAE!', x + HW / 2, my - 24, $c, 8, 'center'); } }
    else {
      R(WV[4][3], x, my - 7, HW, 26); R($b, x - 1, my, 2, 17); R($b, x + HW - 1, my, 2, 17); R($f, x + 1, my + 7, 4, 1); R($f, x + HW - 5, my + 11, 4, 1);
      if (b.st === 2 && b.t > 370) { const d = (400 - b.t) * 3; R($d, x + 4, my + d, HW - 8, 4); R('#8a281e', x + 4, my + 4 + d, HW - 8, 10); }
      if (b.st === 3) {
        const w = HW / 2 * (1 - b.t / 150);
        [0, 1].forEach((k) => {
          const rx = k ? x + HW - w : x, wx = k ? x + HW + 3 : x - 8, h = clk >> 3 & 1;
          R($d, rx, my, w, 4); R('#8a281e', rx, my + 4, w, 12);
          R($m, wx - 1, my - 15, 7, 3); R($5, wx + 1, my - 12, 3, 3); R($F, wx, my - 9, 5, 6); R($a, wx, my - 7, 5, 1); R('#2b3350', wx, my - 3, 2, 3); R('#2b3350', wx + 3, my - 3, 2, 3);
          R($f, k ? wx - 4 : wx + 6, my - 10 + h * 4, 3, 2); R($n, k ? wx - 1 : wx + 5, my - 9 + h * 2, 1, 4);
        });
      }
    }
  }
  // Aviso de la grúa: marco amarillo que parpadea donde va a quedar (o de dónde se lleva) el container
  if (si === 2 && g.warn && (clk >> 2 & 1)) { const p = g.crS, up = g.crN < p.y, y = g.crN < -20 ? p.y : g.crN; R($c, p.x - 1, y - 1, p.w + 2, 2); R($c, p.x - 1, y + 21, p.w + 2, 2); R($c, p.x - 1, y, 2, 21); R($c, p.x + p.w - 1, y, 2, 21); TS(up ? '↑' : '↓', p.x + p.w / 2, y + 5, $c, 12, 'center'); }
  g.it.forEach(drawItem);
  // Focos seguidores: un cono de luz del color de cada jugador
  g.fs.forEach((f, i) => { if (f.st === 'dead') return; c.fillStyle = i ? 'rgba(255,110,199,.08)' : 'rgba(225,255,0,.08)'; c.beginPath(); c.moveTo(i ? 330 : 70, 0); c.lineTo(f.x - 14, f.y); c.lineTo(f.x + 14, f.y); c.fill(); });
  // Carros de los ascensores de Valparaíso, subiendo y bajando despacio
  if (si === 2) ASC.forEach(([x0, y0, x1, y1, col], k) => { const t = (Math.sin(clk / 260 + k * 2) + 1) / 2, x = x0 + (x1 - x0) * t | 0, y = y0 + (y1 - y0) * t | 0; R($b, x - 5, y - 8, 11, 10); R(col, x - 4, y - 7, 9, 8); R($k, x - 3, y - 6, 7, 3); R($b, x, y - 6, 1, 3); });
  // Metro: luz en la boca del túnel durante el aviso, y luego el tren de tres carros
  if (si === 3) {
    const tr = g.tr, my = g.st.m.y;
    if (tr.st === 1) A(0.25 + 0.2 * Math.sin(clk / 3), () => { R($u, tr.d > 0 ? 0 : 340, my - 44, 60, 44); });
    if (tr.st === 2) for (let k = 0; k < 3; k++) {
      const x = tr.x + k * 111 | 0, y = my - 46, lead = tr.d > 0 ? k === 2 : k === 0;
      R($b, x, y + 40, 108, 6); for (let w = 10; w < 100; w += 28) R($d, x + w, y + 41, 14, 5);
      R($g, x, y, 108, 4); R('#f0f2f6', x, y + 4, 108, 36); R($l, x, y + 26, 108, 5); R($8, x, y + 31, 108, 2);
      for (let w = 5; w < 100; w += 26) { R('#1b2a4a', x + w, y + 8, 20, 14); R('#7fb8f8', x + w + 1, y + 9, 18, 4); R($g, x + w + 22, y + 6, 1, 32); }
      if (lead) { const fx = tr.d > 0 ? x + 100 : x; R('#1b2a4a', fx, y + 7, 8, 16); R($c, fx + (tr.d > 0 ? 5 : 0), y + 30, 3, 5); A(0.3, () => R($u, tr.d > 0 ? x + 108 : x - 46, y + 18, 46, 24)); }
    }
  }
  g.hzo.forEach((b) => {
    if (b.p) { R($b, b.x - 2, b.y - 4, 5, 8); R($i, b.x - 1, b.y - 3, 3, 6); R($g, b.x, b.y + 1, 1, 2); return; }
    const x = b.x | 0, y = (b.y | 0) + (b.sq > 8 ? 2 : 0), d = Math.sign(b.vx), fl = b.sq > 0 ? 1 : clk >> 3 & 1;
    R($f, x - 5, y - 2, 10, 5); R($A, x - 4, y - 1, 6, 3); R($y, x - 2, y - (fl ? 6 : 0), 6, fl ? 4 : 3); R($f, x + d * 5 - 1, y - 4, 4, 4); R($F, x + d * 8, y - 2, 2, 1); R($b, x + d * 6, y - 3, 1, 1); R($y, x - d * 8, y - 1, 4, 2);
  });
  g.fs.forEach((f) => dF(f));
  g.pj.forEach((p) => {
    if (p.ty === 4) {
      // Bala de la BananaGun: un plátano que va girando
      A(0.35, () => R($c, p.x - 3 - p.vx * 1.5, p.y - 1, 6, 2));
      c.save(); c.translate(p.x | 0, p.y | 0); c.rotate(p.l * 0.7 * Math.sign(p.vx));
      R($b, -4, -1, 8, 4); R($b, -5, -3, 4, 5); R($b, 1, -3, 4, 5); R($c, -3, 0, 6, 2); R($c, -4, -2, 2, 3); R($c, 2, -2, 2, 3); R($n, -4, -3, 1, 1); R($n, 3, -3, 1, 1);
      c.restore();
    }
    else if (p.ty === 1) { R($c, p.x - 3, p.y, 6, 2); R($c, p.x - 4, p.y - 2, 2, 3); R($c, p.x + 2, p.y - 2, 2, 3); A(0.4, () => R($c, p.x - 3 - p.vx * 2, p.y, 6, 2)); }
    else if (p.ty > 4) { R($a, p.x - 8, p.y - 3, 16, 5); R($b, p.x - 7, p.y - 2, 14, 3); R($a, p.x + Math.sign(p.vx) * 3 - 1, p.y - 1, 2, 1); }
    else if (p.ty === 2) { R($b, p.x - 7, p.y - 4, 14, 8); R($s, p.x - 6, p.y - 3, 12, 2); R($f, p.x - 5, p.y, 4, 3); R($f, p.x + 1, p.y, 4, 3); }
    else { const hot = p.l < 40 && (p.l >> 2 & 1); R($b, p.x - 4, p.y - 10, 8, 8); R(hot ? $v : '#fff7c2', p.x - 3, p.y - 9, 6, 6); R($a, p.x - 2, p.y - 8, 2, 2); R($f, p.x - 2, p.y - 3, 4, 3); R($h, p.x - 2, p.y - 2, 4, 1); }
  });
  g.fx.forEach((x) => {
    if (x.ty === 1) A(Math.min(1, (50 - x.t) / 15), () => TS(x.s, x.x, x.y - x.t / 3, x.col, 9, 'center'));
    else if (x.ty === 0) { const r = x.t * x.s / 6 + 2; A(1 - x.t / 12, () => { for (let k = 0; k < 8; k++) R(k % 2 ? $a : $c, x.x + Math.cos(k * 0.785) * r - 1, x.y + Math.sin(k * 0.785) * r - 1, 3, 3); R($a, x.x - 3, x.y - 3, 6, 6); }); }
    else if (x.ty === 3) A(1 - x.t / 18, () => { disc('#ff8a3d', x.x, x.y, 6 + x.t * 1.4 | 0); disc($c, x.x, x.y, 3 + x.t | 0); if (x.t < 6) disc($a, x.x, x.y, 6); });
    else if (x.ty === 5) A(Math.min(1, (90 - x.t) / 20), () => { R($i, x.x - 5, x.y - 1, 11, 2); R($i, x.x - 3, x.y - 2, 6, 1); R($g, x.x - 2, x.y, 4, 1); });
    else if (x.ty === 4) A(1 - x.t / 10, () => { for (let k = 0; k < 6; k++) R('#bfe3ff', x.x + Math.cos(k) * (3 + x.t), x.y + Math.sin(k) * (3 + x.t), 2, 2); });
    else A(1 - x.t / 36, () => { const an = Math.atan2(150 - x.y, 200 - x.x); for (let k = -3; k < 4; k++) for (let d = 0; d < 9; d++) R(k % 2 ? $a : x.col, x.x + Math.cos(an + k * 0.16) * (d * 12 + x.t * 6), x.y + Math.sin(an + k * 0.16) * (d * 12 + x.t * 6), 5, 5); });
  });
  // Olas de utilería del lago: tres tiras que se deslizan a destiempo
  if (WV[si]) WV[si].slice(0, 3).forEach((col, k) => { const y = 264 + k * 10, off = Math.sin(clk / 34 + k * 2) * 7; for (let x = -24; x < 420; x += 16) { R(col, x + off, y + 2, 16, 12); R(col, x + off + 3, y, 10, 2); R(WV[si][k < 2 ? 3 : 1], x + off + 13, y + 2, 3, 2); } });
  c.restore();
  if (si === 3 && g.tr.st === 1 && (clk >> 3 & 1)) TS(g.tr.d > 0 ? '¡VIENE EL METRO! →' : '← ¡VIENE EL METRO!', 200, 26, $c, 11, 'center');
  if (si === 1 && (g.wind || g.warn)) {
    if (g.wind) for (let k = 0; k < 14; k++) A(0.5, () => R($a, ((k * 61 + clk * 7 * g.wind) % 460 + 460) % 460 - 30, 28 + k * 17, 16, 1));
    if (g.wind || clk >> 3 & 1) TS(g.wd > 0 ? 'VIENTO →' : '← VIENTO', 200, 26, $a, 11, 'center');
  }
  curtains(cur); footlights(); hud();
  if (g.cd > 0) TS(String(Math.ceil(g.cd / 50)), 200, 100, $a, 60, 'center');
  else if (g.f < 190 && g.over < 0) TS('¡YA!', 200, 100, $e, 60, 'center');
  if (g.over >= 0) {
    TS('¡K.O.!', 200, 60, $v, 54, 'center');
    if (mode === 'end') { const f = g.fs[g.over]; TS('GANA ' + (f.cpu ? 'LA CPU' : 'JUGADOR ' + (g.over + 1)), 200, 136, PC[g.over], 20, 'center'); T(CHARS[f.c].n, 200, 164, $a, 11, 'center'); if (g.ot > 60 && clk % 60 < 36) T('START: REVANCHA', 200, 200, $e, 12, 'center'); }
  }
  if (g.pause) { R('rgba(0,0,0,.7)', 0, 0, 400, 300); T('PAUSA', 200, 70, $e, 30, 'center'); menu(['CONTINUAR', 'AJUSTES', 'CONTROLES', 'VOLVER AL MENÚ'], psel, 126); T('↑↓ ELIGE · START O BOTÓN 1 CONFIRMA', 200, 210, $t, 8, 'center'); }
}

new Phaser.Game({
  type: Phaser.CANVAS, width: W, height: H, parent: 'game-root', backgroundColor: $G, pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create, update },
});

function create() {
  AC = this.sound && this.sound.context;
  const mk2 = (k) => { const t = this.textures.createCanvas(k, W, H), x = t.getContext(); x.imageSmoothingEnabled = false; x.setTransform(2, 0, 0, 2, 0, 0); return t; };
  TX = mk2('m'); LB = mk2('b'); c = TX.getContext();
  this.add.image(0, 0, 'm').setOrigin(0);
  paintStage(0);
  // Perillas y peligros guardados: se valida cada valor porque el formato puede haber cambiado
  getStorage().get('oc').then((r) => {
    const v = r && r.found && r.value; if (!v) return;
    if (v.t) TUNE_L.forEach((row) => { const x = v.t[row[0]]; if (typeof x === 'number' && x >= row[3] && x <= row[4]) TN[row[0]] = x; });
    if (v.hz === 0 || v.hz === 1) hz = v.hz;
  }).catch(() => {});
}

function update(time, delta) {
  acc += Math.min(delta, 60);
  while (acc >= 16.66) { acc -= 16.66; keepHit = 0; tick(); if (!keepHit) hit = Object.create(null); }
  draw(); TX.refresh();
}
