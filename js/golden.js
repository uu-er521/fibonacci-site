/* ============================================================
   golden.js — 黄金螺旋拖拽拼图
   spiralPuzzle()：Pointer Events 实现跨鼠标/触屏拖拽
   7 个正方形（边长 1,1,2,3,5,8,13），拼接成黄金螺旋
   （斐波那契教学页面 · 脚本封装 part 6）
   ============================================================ */

(function spiralPuzzle() {
  const GRID_W = 21;   // 棋盘宽（格）
  const GRID_H = 13;   // 棋盘高（格）

  // 自适应格子尺寸
  const cardEl = document.querySelector('.spiral-card');
  // 内容区宽度 = clientWidth − 左右内边距(24×2) − 8px 余量，避免移动端棋盘溢出被裁剪
  const availW = (cardEl ? cardEl.clientWidth - 48 : 520) - 8;
  const CELL = Math.max(11, Math.min(30, Math.floor(availW / GRID_W)));

  // 触屏设备（手机/平板）：小方块拖拽不友好，改用「点选托盘 → 点选棋盘」放置
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  let selected = null; // 触屏模式当前选中的托盘块

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
    if (selected) { selected.trayEl.classList.remove('selected'); selected = null; }
    PIE.forEach(pi => { tray.appendChild(makeShape(pi, 'tray')); });
    pieceGeom = {};
    source = {};
    msg.innerHTML = isTouch
      ? '📱 触屏模式：先点一下托盘中的方块，再点棋盘上对应的虚线框放下它；拼满 7 块即完成 ✨'
      : '将下方托盘中的方块拖入上方对应位置，拼满 7 块即完成 ✨';
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

  /* ---- 触屏点选：选中托盘方块 ---- */
  function selectPiece(pi, trayEl) {
    if (trayEl.classList.contains('used')) return;
    if (selected) {
      if (selected.trayEl === trayEl) { selected.trayEl.classList.remove('selected'); selected = null; return; }
      selected.trayEl.classList.remove('selected');
    }
    selected = { pi, trayEl, k: String(PIE.indexOf(pi)) };
    trayEl.classList.add('selected');
    msg.innerHTML = '已选中边长 <strong style="color:var(--gold-1)">' + pi.s +
      '</strong> 的方块，点棋盘上对应的虚线框放下它（放错会自动退回）';
  }

  /* ---- 拖拽逻辑（Pointer Events，兼容鼠标/触屏） ---- */
  function attachDrag(el, mode, pi) {
    const k = String(PIE.indexOf(pi));

    // 触屏设备：托盘块改为点选（点选 → 点棋盘放置），拖拽在小屏幕上不好操作
    if (mode === 'tray' && isTouch) {
      el.addEventListener('click', () => selectPiece(pi, el));
      return;
    }

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

  /* ---- 触屏模式：点选棋盘虚线框放置 ---- */
  if (isTouch) {
    board.addEventListener('click', (e) => {
      if (!selected) return;
      const slot = e.target.closest('.target-slot');
      if (!slot) return;
      const pi = selected.pi;
      const ok = +slot.dataset.size === pi.s && +slot.dataset.x === pi.x && +slot.dataset.y === pi.y;
      if (ok) {
        const k = selected.k;
        const sh = makeShape(pi, 'shape');
        sh.style.left = (pi.x * CELL) + 'px';
        sh.style.top = (pi.y * CELL) + 'px';
        sh.dataset.cx = pi.x; sh.dataset.cy = pi.y;
        sh.classList.add('placed');
        board.appendChild(sh);
        pieceGeom[k] = { x: pi.x, y: pi.y };
        placed++;
        pingPlace();
        selected.trayEl.classList.add('used');
        selected.trayEl.classList.remove('selected');
        selected = null;
        refreshSlots();
        updateMsg();
      } else {
        const t = selected.trayEl;
        t.classList.remove('selected');
        t.classList.add('shake');
        setTimeout(() => t.classList.remove('shake'), 450);
        selected = null;
        msg.innerHTML = '这个位置不对哦，再想想 👀';
      }
    });
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
