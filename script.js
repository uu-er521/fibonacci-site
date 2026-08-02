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
