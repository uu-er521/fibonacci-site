/* ============================================================
   script.js — 斐波那契教学页面交互脚本
   （从原 index.html 内联 <script> 中拆出，便于维护）

   注意：为了在 file:// 协议下双击即可运行，这里全部使用
   普通 <script>（非 ES module），未使用 import/export。
   ============================================================ */

/* =====================================================================
   1. Hero 数列展示
   ===================================================================== */
(function heroSequence() {
  const heroSeq = document.getElementById('heroSeq');
  const heroFib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  heroFib.forEach((v, i) => {
    const c = document.createElement('div');
    c.className = 'seq-chip';
    c.textContent = v;
    c.style.animationDelay = (i * 0.15) + 's';
    heroSeq.appendChild(c);
  });
})();

/* =====================================================================
   2. 数列生成器
   ===================================================================== */
(function generator() {
  const countRange = document.getElementById('countRange');
  const countLabel = document.getElementById('countLabel');
  const seqDisplay = document.getElementById('seqDisplay');
  const curRatio = document.getElementById('curRatio');

  function fib(n) {
    const a = [0, 1];
    for (let i = 2; i < n; i++) a[i] = a[i - 1] + a[i - 2];
    return a;
  }

  function renderSeq() {
    const n = +countRange.value;
    countLabel.textContent = n + ' 项';
    const arr = fib(n);
    seqDisplay.innerHTML = '';
    arr.forEach((v, i) => {
      const box = document.createElement('div');
      box.className = 'term-box' + (i >= n - 2 ? ' gold' : '');
      box.textContent = v;
      box.style.animationDelay = (i * 0.07) + 's';
      seqDisplay.appendChild(box);
    });
    const ratio = arr[n - 1] / arr[n - 2];
    curRatio.textContent = 'φ ≈ ' + ratio.toFixed(6);
  }
  countRange.addEventListener('input', renderSeq);
  renderSeq();
})();

/* =====================================================================
   2.5 问题引入 · 交互式杨辉三角 + 斜对角线和高亮
   ===================================================================== */
(function yanghuiIntro() {
  const ROWS = 9; // 杨辉三角行数
  const container = document.getElementById('yanghuiTri');
  const note = document.getElementById('yanghuiNote');
  if (!container || !note) return;

  // 生成组合数表 C(r, k)，r 行 k 列（均从 0 开始）
  const tri = [];
  for (let r = 0; r < ROWS; r++) {
    tri[r] = [];
    for (let k = 0; k <= r; k++) {
      if (k === 0 || k === r) tri[r][k] = 1;
      else tri[r][k] = tri[r - 1][k - 1] + tri[r - 1][k];
    }
  }

  /*
    斜对角线和 = 斐波那契数列
    杨辉三角中，NE–SW 方向（r+k 恒定）的对角线，其和恰好为斐波那契数：
        r+k=0 → 1
        r+k=1 → 1
        r+k=2 → 1+1 = 2
        r+k=3 → 1+2 = 3
        r+k=4 → 1+3+1 = 5
        r+k=5 → 3+4+1 = 8 …
    悬停任意格子，会高亮它所在的整条对角线，并显示该条之和对应的斐波那契数。
  */
  const fibNums = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

  // 预存每个格子的 (r, k) 及其所在对角线编号 d = r + k
  const cells = {}; // key: r,k -> 格子元素
  // 记录每条对角线上有哪些格子，用于高亮整条对角线
  const diagCells = {}; // d -> [ {cell, val} ]

  // 渲染三角
  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'yh-row';
    for (let k = 0; k <= r; k++) {
      const d = r + k; // 对角线编号
      const cell = document.createElement('span');
      cell.className = 'yh-cell';
      cell.textContent = tri[r][k];
      cell.dataset.r = r;
      cell.dataset.k = k;
      // 悬停交互：高亮整条对角线
      cell.addEventListener('mouseenter', () => highlightDiag(d));
      cell.addEventListener('mouseleave', clearHighlight);
      rowEl.appendChild(cell);

      cells[r + ',' + k] = cell;
      if (!diagCells[d]) diagCells[d] = [];
      diagCells[d].push({ cell: cell, val: tri[r][k] });
    }
    container.appendChild(rowEl);
  }

  // 高亮某条对角线并更新数值
  function highlightDiag(d) {
    // 清除全部高亮
    Object.values(cells).forEach(c => c.classList.remove('fib'));
    // 高亮这条对角线上的所有格子
    const group = diagCells[d] || [];
    group.forEach(item => item.cell.classList.add('fib'));
    // 求和并显示对应斐波那契数
    const sum = group.reduce((acc, item) => acc + item.val, 0);
    note.innerHTML =
      '对角线 <b style="color:var(--teal)">r+k = ' + d + '</b> 的和 = ' +
      group.map(item => item.val).join(' + ') + ' = <span class="fib-nums">' + sum +
      '</span><br><span style="font-size:0.85rem;color:var(--muted);">悬停任意格子查看对应斜对角线和。</span>';
  }

  function clearHighlight() {
    // 恢复默认：不高亮任何对角线，恢复提示文案
    Object.values(cells).forEach(c => c.classList.remove('fib'));
    note.innerHTML =
      '杨辉三角的斜对角线和，正好是斐波那契数列。<span class="fib-nums">1, 1, 2, 3, 5, 8, 13, 21…</span>' +
      '<br><span style="font-size:0.85rem;color:var(--muted);">悬停任意格子，即可高亮它所在的那条斜对角线。</span>';
  }

  // 初始化显示说明
  clearHighlight();
})();

/* =====================================================================
   2.6 问题引入 · 兔子繁衍动效 + 数学家 accordion 折叠
   ===================================================================== */
(function introPhenomena() {
  /* ---- 兔子繁衍动效 ---- */
  const range = document.getElementById('rabbitRange');
  const monthLabel = document.getElementById('rabbitMonth');
  const countLabel = document.getElementById('rabbitCount');
  const track = document.getElementById('rabbitTrack');
  const seqBox = document.getElementById('rabbitSeq');
  if (range && monthLabel && countLabel && track && seqBox) {
    // 每月 (成兔, 幼兔)
    const months = [];
    let adult = 0, young = 1;
    for (let m = 1; m <= 12; m++) {
      months.push({ adult, young });
      const na = adult + young; // 幼兔长大为成兔
      const ny = adult;         // 成兔各产一对
      adult = na; young = ny;
    }
    const fibSeq = months.map(x => x.adult + x.young);

    function render(m) {
      const data = months[m - 1];
      monthLabel.textContent = '第 ' + m + ' 个月';
      const total = data.adult + data.young;
      countLabel.innerHTML = '兔子：<b style="color:var(--gold-1)">' + total + '</b> 对';

      track.innerHTML = '';
      // 成兔
      for (let i = 0; i < data.adult; i++) {
        const el = document.createElement('span');
        el.className = 'rabbit-pair adult';
        el.textContent = '🐇';
        track.appendChild(el);
      }
      // 幼兔
      for (let i = 0; i < data.young; i++) {
        const el = document.createElement('span');
        el.className = 'rabbit-pair';
        el.textContent = '🐇';
        track.appendChild(el);
      }

      // 底部序列 chips
      seqBox.innerHTML = '';
      fibSeq.forEach((v, i) => {
        const c = document.createElement('span');
        c.className = 'rabbit-seq-chip' + (i <= m - 1 ? ' active' : '');
        c.textContent = v;
        c.style.animationDelay = (i * 0.08) + 's';
        if (i <= m - 1) { c.style.animation = 'fadeSlide 0.4s ease both'; }
        seqBox.appendChild(c);
      });
    }
    range.value = 1;
    render(1);
    range.addEventListener('input', () => render(+range.value));
  }

  /* ---- 数学家 accordion 折叠 ---- */
  const accordion = document.getElementById('matAccordion');
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll('.mat-item'));

    items.forEach(item => {
      const head = item.querySelector('.mat-head');
      head.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // accordion：先全部关闭
        items.forEach(i => i.classList.remove('open', 'expand'));
        if (!isOpen) item.classList.add('open', 'expand');
      });
    });

    // 滚动入场：从左向右弹出
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          const m = e.target;
          m.classList.add('entered');
          m.style.transitionDelay = (items.indexOf(m) * 0.15) + 's';
          io.unobserve(m);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(item => io.observe(item));
  }
})();

/* =====================================================================
   3. 黄金螺旋拖拽拼图
   7 个正方形（边长 1,1,2,3,5,8,13），每个内部绘制一段 90° 弧，
   拖入正确位置后拼接成完整的黄金螺旋。
   ===================================================================== */
(function spiralPuzzle() {
  const GRID_W = 21;   // 棋盘宽（格）
  const GRID_H = 13;   // 棋盘高（格）

  // 自适应格子尺寸
  const cardEl = document.querySelector('.spiral-card');
  const availW = (cardEl ? cardEl.clientWidth : 520) - 24;
  const CELL = Math.max(16, Math.min(30, Math.floor(availW / GRID_W)));

  /*
    正方形布局（SVG 网格的左上角坐标，棋盘 21×13）。
    原点坐标由原始平面坐标系（各正方形左下角 + 圆心朝向）换算而来，
    y 向下为正，换算公式 y_svg = 13 − (左下角y + 边长)。
  */
  const PIE = [
    // size, x, y,  弧心偏移(ox,oy 相对正方形左上角, 0 或 s), 起止角
    { s: 1, x: 15, y: 3, ox: 0, oy: 1, a1: 270, a2: 360 }, // 边长1 左下角
    { s: 1, x: 15, y: 4, ox: 0, oy: 0, a1: 0,   a2: 90  }, // 边长1 左上角
    { s: 2, x: 13, y: 3, ox: 2, oy: 0, a1: 90,  a2: 180 }, // 边长2 右上角
    { s: 3, x: 13, y: 0, ox: 3, oy: 3, a1: 180, a2: 270 }, // 边长3 右下角
    { s: 5, x: 16, y: 0, ox: 0, oy: 5, a1: 270, a2: 360 }, // 边长5 左下角
    { s: 8, x: 13, y: 5, ox: 0, oy: 0, a1: 0,   a2: 90  }, // 边长8 左上角
    { s: 13,x: 0,  y: 0, ox: 13,oy: 0, a1: 90,  a2: 180 }  // 边长13 右上角
  ];

  const board = document.getElementById('puzzleBoard');
  const tray = document.getElementById('puzzleTray');
  const msg = document.getElementById('puzzleMsg');
  const reset = document.getElementById('puzzleReset');

  board.style.width = (GRID_W * CELL) + 'px';
  board.style.height = (GRID_H * CELL) + 'px';
  board.style.backgroundSize = CELL + 'px ' + CELL + 'px';

  let placed = 0;
  let dragEl = null;
  let dragOffset = { x: 0, y: 0 };
  let pieceGeom = {};
  let source = {};

  /* ---- 生成目标虚线框 ---- */
  function buildSlots() {
    board.querySelectorAll('.target-slot').forEach(s => s.remove());
    PIE.forEach(p => {
      const s = document.createElement('div');
      s.className = 'target-slot';
      s.style.left = (p.x * CELL) + 'px';
      s.style.top = (p.y * CELL) + 'px';
      s.style.width = (p.s * CELL) + 'px';
      s.style.height = (p.s * CELL) + 'px';
      s.dataset.size = p.s;
      s.dataset.x = p.x;
      s.dataset.y = p.y;
      board.appendChild(s);
    });
  }
  buildSlots();

  /* ---- 计算正方形内 90° 弧线路径 ---- */
  function arcPath(p) {
    const cx = p.ox * CELL, cy = p.oy * CELL, r = p.s * CELL;
    const rad = (deg) => {
      const t = deg * Math.PI / 180;
      return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
    };
    const st = rad(p.a1);
    const en = rad(p.a2);
    // sweep=1 在 y 向下坐标系中按角度增大方向绘制
    return `M ${st.x} ${st.y} A ${r} ${r} 0 0 1 ${en.x} ${en.y}`;
  }

  /* ---- 创建可拖拽方块（tray 托盘版 / shape 棋盘版） ---- */
  function makeShape(pi, mode) {
    const k = String(PIE.indexOf(pi));
    const el = document.createElement('div');
    el.className = mode === 'tray' ? 'tray-piece' : 'piece-shape';
    el.dataset.size = pi.s;
    el.dataset.pi = k;

    if (mode === 'shape') {
      el.style.width = (pi.s * CELL) + 'px';
      el.style.height = (pi.s * CELL) + 'px';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'arc-svg');
      svg.setAttribute('width', (pi.s * CELL) + 'px');
      svg.setAttribute('height', (pi.s * CELL) + 'px');
      svg.setAttribute('viewBox', `0 0 ${pi.s * CELL} ${pi.s * CELL}`);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', arcPath(pi));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#fbbf24');
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
      el.appendChild(svg);

      const lbl = document.createElement('div');
      lbl.className = 'size-label';
      lbl.textContent = pi.s;
      el.appendChild(lbl);

      el.style.left = '0px';
      el.style.top = '0px';
    } else {
      el.textContent = pi.s;
    }

    attachDrag(el, mode, pi);
    return el;
  }

  /* ---- 重建托盘 ---- */
  function rebuildTray() {
    tray.innerHTML = '';
    placed = 0;
    PIE.forEach(pi => { tray.appendChild(makeShape(pi, 'tray')); });
    pieceGeom = {};
    source = {};
    msg.innerHTML = '将下方托盘中的方块拖入上方对应位置，拼满 7 块即完成 ✨';
  }

  /* ---- 根据几何信息更新槽位填充状态 ---- */
  function refreshSlots() {
    board.querySelectorAll('.target-slot').forEach(slot => {
      const sx = +slot.dataset.x, sy = +slot.dataset.y, ss = +slot.dataset.size;
      let has = false;
      for (const k in pieceGeom) {
        const pi = PIE[+k];
        const gx = pieceGeom[k].x, gy = pieceGeom[k].y;
        if (gx <= sx + 0.01 && gx + pi.s >= sx + ss - 0.01 &&
            gy <= sy + 0.01 && gy + pi.s >= sy + ss - 0.01) {
          has = true;
        }
      }
      slot.classList.toggle('filled', has);
    });
  }

  /* ---- 高亮临近目标 ---- */
  function showTargets(show) {
    board.querySelectorAll('.piece-shape').forEach(p => {
      const pi = PIE[+p.dataset.pi];
      const g = pieceGeom[p.dataset.pi];
      const near = g && Math.abs(g.x - pi.x) < 0.55 && Math.abs(g.y - pi.y) < 0.55;
      p.classList.toggle('targets', !!show && !!near);
    });
  }

  /* ---- 成功放置的脉冲动画 ---- */
  function pingPlace() {
    const pul = document.createElement('div');
    pul.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;' +
      'pointer-events:none;border:2px solid rgba(45,212,191,0.6);border-radius:8px;' +
      'animation:placePing 0.6s ease-out;z-index:4';
    board.appendChild(pul);
    setTimeout(() => pul.remove(), 650);
  }

  /* ---- 进度提示 ---- */
  function updateMsg() {
    if (placed === PIE.length) {
      msg.innerHTML = '🎉 <span class="done">恭喜完成！</span> 7 段 90° 圆弧已连接成完整的黄金螺旋线';
      msg.style.transform = 'scale(1.05)';
      setTimeout(() => msg.style.transform = '', 200);
    } else {
      msg.innerHTML = `已拼好 <strong style="color:var(--gold-1)">${placed}</strong> / ${PIE.length} 块，继续加油！`;
    }
  }

  /* ---- 拖拽逻辑（Pointer Events，兼容鼠标/触屏） ---- */
  function attachDrag(el, mode, pi) {
    const k = String(PIE.indexOf(pi));

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (mode === 'shape' && el.classList.contains('placed')) return;
      e.preventDefault();

      if (mode === 'tray') {
        el.classList.add('used');
        const sh = makeShape(pi, 'shape');
        sh.classList.add('dragging');
        const bRect = board.getBoundingClientRect();
        const mRect = el.getBoundingClientRect();
        const px = mRect.left - bRect.left - (pi.s * CELL) / 2;
        const py = mRect.top - bRect.top - (pi.s * CELL) / 2;
        sh.style.left = px + 'px';
        sh.style.top = py + 'px';
        sh.dataset.cx = px / CELL;
        sh.dataset.cy = py / CELL;
        board.appendChild(sh);
        pieceGeom[k] = { x: px / CELL, y: py / CELL };
        source[k] = { fromTray: true, trayEl: el };
        dragEl = sh;
      } else {
        dragEl = el;
        el.classList.add('dragging');
        pieceGeom[k] = el;
      }

      const b2 = board.getBoundingClientRect();
      const rect = dragEl.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      dragEl.style.zIndex = '5';
      dragEl.setPointerCapture(e.pointerId);
      const nx = rect.left - b2.left;
      const ny = rect.top - b2.top;
      pieceGeom[k] = { x: nx / CELL, y: ny / CELL };
      showTargets(true);
    });

    const onMove = (e) => {
      if (!dragEl || dragEl !== el) return;
      const b = board.getBoundingClientRect();
      const nx = e.clientX - b.left - dragOffset.x;
      const ny = e.clientY - b.top - dragOffset.y;
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
      el.dataset.cx = nx / CELL;
      el.dataset.cy = ny / CELL;
      pieceGeom[k] = { x: nx / CELL, y: ny / CELL };
    };
    el.addEventListener('pointermove', onMove);

    const endDrag = (e) => {
      if (!dragEl || dragEl !== el) return;
      const nxE = +dragEl.dataset.cx, nyE = +dragEl.dataset.cy;
      const ok = Math.abs(nxE - pi.x) < 0.55 && Math.abs(nyE - pi.y) < 0.55;
      showTargets(false);
      if (ok) {
        dragEl.style.left = (pi.x * CELL) + 'px';
        dragEl.style.top = (pi.y * CELL) + 'px';
        dragEl.dataset.cx = pi.x;
        dragEl.dataset.cy = pi.y;
        pieceGeom[k] = { x: pi.x, y: pi.y };
        if (!dragEl.classList.contains('placed')) {
          dragEl.classList.add('placed');
          placed++;
          pingPlace();
        }
      } else {
        dragEl.remove();
        if (source[k] && source[k].trayEl) {
          source[k].trayEl.classList.remove('used');
        }
        delete pieceGeom[k];
      }
      refreshSlots();
      updateMsg();
      dragEl.classList.remove('dragging');
      dragEl.style.zIndex = '';
      dragEl = null;
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  /* ---- 重置 ---- */
  reset.addEventListener('click', () => {
    board.querySelectorAll('.piece-shape').forEach(p => p.remove());
    rebuildTray();
    refreshSlots();
  });

  /* ---- 初始化 + 注入动画 keyframes ---- */
  rebuildTray();
  refreshSlots();

  if (!document.querySelector('#placePingKey')) {
    const st = document.createElement('style');
    st.id = 'placePingKey';
    st.textContent = '@keyframes placePing{from{opacity:1;transform:scale(0.85)}to{opacity:0;transform:scale(1.15)}}';
    document.head.appendChild(st);
  }
})();

/* =====================================================================
   4. 滚动渐显
   ===================================================================== */
(function revealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => obs.observe(el));
})();

/* =====================================================================
   5. 测验
   ===================================================================== */
(function quiz() {
  const quizData = [
    { q: '斐波那契数列从哪两个数字开始？', opts: ['1 和 2', '0 和 1', '1 和 1', '2 和 3'], a: 1 },
    { q: '数列 0, 1, 1, 2, 3, 5, 8, 13… 的下一个数是？', opts: ['21', '20', '18', '34'], a: 0 },
    { q: '黄金比例 φ 的数值约为？', opts: ['1.414', '2.718', '1.618', '3.14159'], a: 2 },
    { q: '向日葵种子螺旋的数量，通常不是下面哪一个？', opts: ['34', '55', '21', '7'], a: 3 },
    { q: '相邻两个斐波那契数之比，随着项数增加会趋近于？', opts: ['黄金比例', '圆周率', '自然常数 e', '√2'], a: 0 }
  ];
  let qIndex = 0, score = 0, answered = false;

  const quizQ = document.getElementById('quizQ');
  const quizOptions = document.getElementById('quizOptions');
  const quizScore = document.getElementById('quizScore');
  const quizNext = document.getElementById('quizNext');

  function loadQuestion() {
    answered = false;
    quizNext.disabled = true;
    const item = quizData[qIndex];
    quizQ.textContent = (qIndex + 1) + '. ' + item.q;
    quizOptions.innerHTML = '';
    item.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const all = quizOptions.querySelectorAll('.quiz-opt');
        if (i === item.a) { btn.classList.add('correct'); score++; }
        else { btn.classList.add('wrong'); all[item.a].classList.add('correct'); }
        all.forEach(b => b.disabled = true);
        quizScore.textContent = '得分：' + score + ' / ' + (qIndex + 1);
        quizNext.disabled = false;
      });
      quizOptions.appendChild(btn);
    });
  }

  quizNext.addEventListener('click', () => {
    qIndex++;
    if (qIndex >= quizData.length) {
      quizQ.textContent = '🎉 测验完成！' + score + ' / ' + quizData.length;
      quizOptions.innerHTML = '<p style="color:var(--muted);">你已学完所有题目。往上翻刷新可以重来，或继续探索这个迷人的数列世界！</p>';
      quizNext.disabled = true;
      quizScore.textContent = '最终得分：' + score + ' / ' + quizData.length;
      return;
    }
    loadQuestion();
  });

  loadQuestion();
})();
