import { LEVELS } from './levelsData';

export function generateSingleFileHtml(): string {
  const levelsJson = JSON.stringify(LEVELS);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Line Craft: Cute Linear Graph Quest</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      background-color: #FAF7F2;
      color: #292524;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 16px;
    }
    header {
      max-width: 1200px;
      margin: 0 auto 16px auto;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 12px 20px;
      border-radius: 20px;
      border: 1px solid #E7E5E4;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: #FFE4E6;
      color: #E11D48;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    h1 {
      font-size: 18px;
      font-weight: 800;
      color: #1C1917;
    }
    .subtitle {
      font-size: 11px;
      color: #78716C;
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-secondary {
      background: #F5F5F4;
      color: #44403C;
      border-color: #E7E5E4;
    }
    .btn-secondary:hover {
      background: #E7E5E4;
    }
    .btn-primary {
      background: #10B981;
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background: #059669;
    }
    .btn-danger {
      background: #F43F5E;
      color: #FFFFFF;
    }

    main {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      flex: 1;
    }
    @media (min-width: 900px) {
      main {
        grid-template-columns: 1fr 1fr;
      }
    }

    .canvas-panel {
      background: #FFFFFF;
      padding: 20px;
      border-radius: 24px;
      border: 1px solid #E7E5E4;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      max-width: 520px;
      aspect-ratio: 1 / 1;
    }
    canvas {
      width: 100%;
      height: 100%;
      border-radius: 18px;
      background: #FCFAF6;
      border: 1px solid #E7E5E4;
      cursor: crosshair;
    }
    .coord-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(28, 25, 23, 0.85);
      color: #FBBF24;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-family: monospace;
      pointer-events: none;
    }

    .control-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card {
      background: #FFFFFF;
      padding: 18px;
      border-radius: 20px;
      border: 1px solid #E7E5E4;
    }
    .level-info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .level-title {
      font-size: 18px;
      font-weight: 800;
      color: #1C1917;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hint-box {
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      color: #92400E;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12px;
      margin-top: 10px;
      line-height: 1.5;
    }

    .line-tabs {
      display: flex;
      gap: 8px;
      background: #F5F5F4;
      padding: 6px;
      border-radius: 16px;
    }
    .tab-btn {
      flex: 1;
      padding: 8px;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      background: transparent;
      color: #57534E;
      transition: all 0.15s;
    }
    .tab-btn.active {
      background: #FFFFFF;
      color: #1C1917;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .equation-display {
      background: #FFF1F2;
      border: 1px solid #FECDD3;
      padding: 14px;
      border-radius: 16px;
      margin: 12px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .eq-math {
      font-family: monospace;
      font-size: 17px;
      font-weight: 800;
    }
    .eq-domain {
      font-family: monospace;
      font-size: 12px;
      background: #FFFFFF;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid #E7E5E4;
    }

    .slider-row {
      margin-bottom: 14px;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .slider-val {
      font-family: monospace;
      background: #F5F5F4;
      padding: 2px 6px;
      border-radius: 6px;
    }
    input[type=range] {
      width: 100%;
      cursor: pointer;
      accent-color: #E11D48;
    }

    .accuracy-bar {
      height: 8px;
      background: #E7E5E4;
      border-radius: 99px;
      overflow: hidden;
      margin-top: 6px;
    }
    .accuracy-fill {
      height: 100%;
      background: #10B981;
      width: 0%;
      transition: width 0.2s;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(28, 25, 23, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 99;
    }
    .modal-card {
      background: #FAF7F2;
      border-radius: 24px;
      max-width: 440px;
      width: 100%;
      padding: 24px;
      border: 2px solid #FDE68A;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>

  <header>
    <div class="logo">
      <div class="logo-badge">📐</div>
      <div>
        <h1>Line Craft: Cute Linear Graph Quest</h1>
        <div class="subtitle">Đồ thị hàm số tuyến tính y = ax + b (x ∈ [x_min, x_max])</div>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn btn-secondary" id="btn-sound">🔊 Bật âm thanh</button>
      <button class="btn btn-secondary" id="btn-level-list">📑 Màn 1/15</button>
      <button class="btn btn-secondary" id="btn-reset">🔄 Làm lại</button>
    </div>
  </header>

  <main>
    <!-- Left Column: Graph Studio -->
    <div class="canvas-panel">
      <div class="canvas-container">
        <canvas id="graph-canvas" width="600" height="600"></canvas>
        <div class="coord-badge" id="coord-tooltip">x: 0.0, y: 0.0</div>
      </div>
      <div style="font-size: 11px; color: #78716C; margin-top: 10px;">
        Lưới tọa độ -10 đến 10 • Nét đứt xám là hình mẫu cần ghép
      </div>
    </div>

    <!-- Right Column: Control Station -->
    <div class="control-panel">
      <div class="card">
        <div class="level-info-header">
          <div>
            <div id="level-phase-tag" style="font-size: 10px; font-weight: 700; color: #E11D48; text-transform: uppercase;">Giai đoạn 1</div>
            <div class="level-title" id="level-title">Màn 1: Chữ V nhỏ nhắn 🐣</div>
          </div>
          <button class="btn btn-secondary" id="btn-hint-toggle" style="font-size: 11px;">💡 Gợi ý</button>
        </div>
        <p id="level-desc" style="font-size: 12px; color: #57534E; line-height: 1.4;">
          Điều chỉnh 2 cánh của chữ V sao cho khớp với nét đứt mờ.
        </p>
        <div class="hint-box" id="level-hint" style="display: none;"></div>

        <!-- Total match percentage bar -->
        <div style="margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
            <span>Tiến độ khớp:</span>
            <span id="total-accuracy-text">0%</span>
          </div>
          <div class="accuracy-bar">
            <div class="accuracy-fill" id="total-accuracy-bar"></div>
          </div>
        </div>
      </div>

      <!-- Line Tab Selectors -->
      <div class="line-tabs" id="line-tabs-container"></div>

      <!-- Equation Card -->
      <div class="card" id="control-card">
        <div class="equation-display">
          <div class="eq-math" id="eq-formula">y = 1.0x + 0.0</div>
          <div class="eq-domain" id="eq-domain">x ∈ [0, 4]</div>
        </div>

        <!-- Slider A (Slope) -->
        <div class="slider-row">
          <div class="slider-header">
            <span>Hệ số góc (a / Slope)</span>
            <span class="slider-val" id="val-a">a = 1.0</span>
          </div>
          <input type="range" id="slider-a" min="-5" max="5" step="0.1" value="1">
        </div>

        <!-- Slider B (Intercept) -->
        <div class="slider-row">
          <div class="slider-header">
            <span>Tung độ gốc (b / Y-intercept)</span>
            <span class="slider-val" id="val-b">b = 0.0</span>
          </div>
          <input type="range" id="slider-b" min="-10" max="10" step="0.5" value="0">
        </div>

        <!-- Slider Domain Min -->
        <div class="slider-row">
          <div class="slider-header">
            <span>Điểm đầu miền x (x_min)</span>
            <span class="slider-val" id="val-xmin">-4.0</span>
          </div>
          <input type="range" id="slider-xmin" min="-10" max="10" step="0.5" value="-4">
        </div>

        <!-- Slider Domain Max -->
        <div class="slider-row">
          <div class="slider-header">
            <span>Điểm cuối miền x (x_max)</span>
            <span class="slider-val" id="val-xmax">0.0</span>
          </div>
          <input type="range" id="slider-xmax" min="-10" max="10" step="0.5" value="0">
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn btn-primary" id="btn-check" style="flex: 1; justify-content: center; padding: 12px;">
            ✨ Kiểm tra khớp &gt; 95%
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- Victory Modal -->
  <div class="modal-overlay" id="victory-modal">
    <div class="modal-card">
      <div style="font-size: 50px; margin-bottom: 10px;">🎉</div>
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 6px;">Hoàn Thành Xuất Sắc!</h2>
      <p style="font-size: 13px; color: #57534E; margin-bottom: 16px;">
        Bạn đã khớp tất cả các đoạn thẳng với sai số &lt; 5%!
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="btn btn-primary" id="btn-next-level" style="padding: 12px 20px;">
          Màn tiếp theo ➡️
        </button>
        <button class="btn btn-secondary" id="btn-close-victory" style="padding: 12px 16px;">
          Xem lại
        </button>
      </div>
    </div>
  </div>

  <script>
    // 15 Level Data from Prompt
    const LEVELS = ${levelsJson};

    let currentLevelIndex = 0;
    let activeLineIndex = 0;
    let playerLines = [];
    let isMuted = false;
    let audioCtx = null;

    const colors = ['#E11D48', '#0D9488', '#D97706'];

    // Web Audio Synthesizer
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playTick() {
      if (isMuted) return;
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } catch(e) {}
    }

    function playVictory() {
      if (isMuted) return;
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const time = now + idx * 0.1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.31);
        });
      } catch(e) {}
    }

    // Canvas Logic
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');

    function mathToPixel(mx, my, w, h) {
      const pad = 36;
      const gw = w - pad * 2;
      const gh = h - pad * 2;
      const px = pad + ((mx + 10) / 20) * gw;
      const py = pad + ((10 - my) / 20) * gh;
      return { px, py };
    }

    function drawGraph() {
      const w = canvas.width;
      const h = canvas.height;
      const pad = 36;

      ctx.fillStyle = '#FCFAF6';
      ctx.fillRect(0, 0, w, h);

      // Minor grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#F1ECE3';
      ctx.beginPath();
      for (let i = -10; i <= 10; i++) {
        if (i % 2 !== 0) {
          const { px } = mathToPixel(i, 0, w, h);
          const { py } = mathToPixel(0, i, w, h);
          ctx.moveTo(px, pad); ctx.lineTo(px, h - pad);
          ctx.moveTo(pad, py); ctx.lineTo(w - pad, py);
        }
      }
      ctx.stroke();

      // Major grid
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#DDD5C7';
      ctx.beginPath();
      for (let i = -10; i <= 10; i += 2) {
        if (i !== 0) {
          const { px } = mathToPixel(i, 0, w, h);
          const { py } = mathToPixel(0, i, w, h);
          ctx.moveTo(px, pad); ctx.lineTo(px, h - pad);
          ctx.moveTo(pad, py); ctx.lineTo(w - pad, py);
        }
      }
      ctx.stroke();

      // Axes
      const origin = mathToPixel(0, 0, w, h);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#44403C';
      ctx.beginPath();
      ctx.moveTo(pad - 10, origin.py); ctx.lineTo(w - pad + 10, origin.py);
      ctx.moveTo(origin.px, h - pad + 10); ctx.lineTo(origin.px, pad - 10);
      ctx.stroke();

      // Axis labels & Numbers
      ctx.font = '600 11px monospace';
      ctx.fillStyle = '#78716C';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i += 2) {
        if (i !== 0) {
          const { px } = mathToPixel(i, 0, w, h);
          ctx.fillText(i, px, origin.py + 16);
          const { py } = mathToPixel(0, i, w, h);
          ctx.fillText(i, origin.px - 14, py + 4);
        }
      }

      const level = LEVELS[currentLevelIndex];

      // Draw Target Lines (Dashed Gray)
      level.targetLines.forEach(tgt => {
        const y1 = tgt.a * tgt.xMin + tgt.b;
        const y2 = tgt.a * tgt.xMax + tgt.b;
        const p1 = mathToPixel(tgt.xMin, y1, w, h);
        const p2 = mathToPixel(tgt.xMax, y2, w, h);

        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#A8A29E';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
        ctx.restore();
      });

      // Draw Player Lines
      playerLines.forEach((pl, idx) => {
        const y1 = pl.a * pl.xMin + pl.b;
        const y2 = pl.a * pl.xMax + pl.b;
        const p1 = mathToPixel(pl.xMin, y1, w, h);
        const p2 = mathToPixel(pl.xMax, y2, w, h);

        ctx.save();
        ctx.lineWidth = idx === activeLineIndex ? 5 : 4;
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        [p1, p2].forEach(p => {
          ctx.beginPath();
          ctx.arc(p.px, p.py, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = colors[idx % colors.length];
          ctx.lineWidth = 2.5;
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    // Accuracy Calculation
    function calcAccuracy(player, target) {
      const errA = Math.abs(player.a - target.a);
      const errB = Math.abs(player.b - target.b);
      const errX1 = Math.abs(player.xMin - target.xMin);
      const errX2 = Math.abs(player.xMax - target.xMax);

      const normA = Math.min(1, errA / 3);
      const normB = Math.min(1, errB / 4);
      const normX1 = Math.min(1, errX1 / 3);
      const normX2 = Math.min(1, errX2 / 3);

      const raw = normA * 0.35 + normB * 0.3 + normX1 * 0.175 + normX2 * 0.175;
      let acc = Math.round((1 - raw) * 100);
      if (errA <= 0.05 && errB <= 0.15 && errX1 <= 0.25 && errX2 <= 0.25) acc = 100;
      return Math.max(0, Math.min(100, acc));
    }

    function updateUI() {
      const level = LEVELS[currentLevelIndex];
      document.getElementById('level-phase-tag').innerText = level.phaseName;
      document.getElementById('level-title').innerText = 'Màn ' + level.id + ': ' + level.title + ' ' + level.emoji;
      document.getElementById('level-desc').innerText = level.description;
      document.getElementById('level-hint').innerText = level.hint;
      document.getElementById('btn-level-list').innerText = '📑 Màn ' + level.id + '/15';

      // Build tabs
      const tabsCont = document.getElementById('line-tabs-container');
      tabsCont.innerHTML = '';
      let totalAcc = 0;
      let allMatched = true;

      level.targetLines.forEach((tgt, idx) => {
        const btn = document.createElement('button');
        const acc = calcAccuracy(playerLines[idx], tgt);
        totalAcc += acc;
        if (acc < 95) allMatched = false;

        btn.className = 'tab-btn' + (idx === activeLineIndex ? ' active' : '');
        btn.innerText = 'Đoạn ' + (idx + 1) + ' (' + acc + '%)';
        btn.onclick = () => {
          activeLineIndex = idx;
          updateUI();
          syncSliders();
          drawGraph();
        };
        tabsCont.appendChild(btn);
      });

      const avgAcc = Math.round(totalAcc / level.targetLines.length);
      document.getElementById('total-accuracy-text').innerText = avgAcc + '%';
      document.getElementById('total-accuracy-bar').style.width = avgAcc + '%';

      // Update Formula Text
      const cur = playerLines[activeLineIndex];
      let eqStr = 'y = ' + cur.a + 'x';
      if (cur.b > 0) eqStr += ' + ' + cur.b;
      else if (cur.b < 0) eqStr += ' - ' + Math.abs(cur.b);
      document.getElementById('eq-formula').innerText = eqStr;
      document.getElementById('eq-domain').innerText = 'x ∈ [' + cur.xMin + ', ' + cur.xMax + ']';

      // Check Victory
      if (allMatched) {
        document.getElementById('victory-modal').style.display = 'flex';
        playVictory();
      }
    }

    function syncSliders() {
      const cur = playerLines[activeLineIndex];
      document.getElementById('slider-a').value = cur.a;
      document.getElementById('val-a').innerText = 'a = ' + cur.a;

      document.getElementById('slider-b').value = cur.b;
      document.getElementById('val-b').innerText = 'b = ' + cur.b;

      document.getElementById('slider-xmin').value = cur.xMin;
      document.getElementById('val-xmin').innerText = cur.xMin;

      document.getElementById('slider-xmax').value = cur.xMax;
      document.getElementById('val-xmax').innerText = cur.xMax;
    }

    function loadLevel(idx) {
      currentLevelIndex = idx;
      activeLineIndex = 0;
      const lvl = LEVELS[currentLevelIndex];
      playerLines = JSON.parse(JSON.stringify(lvl.initialLines));
      updateUI();
      syncSliders();
      drawGraph();
    }

    // Slider Listeners
    ['a', 'b', 'xmin', 'xmax'].forEach(param => {
      document.getElementById('slider-' + param).addEventListener('input', (e) => {
        playTick();
        const val = parseFloat(e.target.value);
        if (param === 'a') playerLines[activeLineIndex].a = Math.round(val * 10) / 10;
        if (param === 'b') playerLines[activeLineIndex].b = Math.round(val * 10) / 10;
        if (param === 'xmin') playerLines[activeLineIndex].xMin = Math.min(val, playerLines[activeLineIndex].xMax - 0.5);
        if (param === 'xmax') playerLines[activeLineIndex].xMax = Math.max(val, playerLines[activeLineIndex].xMin + 0.5);
        updateUI();
        syncSliders();
        drawGraph();
      });
    });

    // Buttons
    document.getElementById('btn-hint-toggle').onclick = () => {
      const h = document.getElementById('level-hint');
      h.style.display = h.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('btn-reset').onclick = () => {
      loadLevel(currentLevelIndex);
    };
    document.getElementById('btn-sound').onclick = () => {
      isMuted = !isMuted;
      document.getElementById('btn-sound').innerText = isMuted ? '🔇 Đã tắt âm' : '🔊 Bật âm thanh';
    };
    document.getElementById('btn-next-level').onclick = () => {
      document.getElementById('victory-modal').style.display = 'none';
      if (currentLevelIndex < LEVELS.length - 1) {
        loadLevel(currentLevelIndex + 1);
      }
    };
    document.getElementById('btn-close-victory').onclick = () => {
      document.getElementById('victory-modal').style.display = 'none';
    };

    // Canvas Hover
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const pad = 36;
      const gw = rect.width - pad * 2;
      const gh = rect.height - pad * 2;
      const mx = ((px - pad) / gw) * 20 - 10;
      const my = 10 - ((py - pad) / gh) * 20;
      document.getElementById('coord-tooltip').innerText = 'x: ' + mx.toFixed(1) + ', y: ' + my.toFixed(1);
    });

    // Init
    loadLevel(0);
  </script>
</body>
</html>`;
}
