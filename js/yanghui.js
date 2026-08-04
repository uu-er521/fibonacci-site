/* ============================================================
   yanghui.js — 交互式杨辉三角 + 斜对角线和高亮
   yanghuiIntro()：悬停任意格子高亮所在对角线，显示对应斐波那契数
   （斐波那契教学页面 · 脚本封装 part 5）
   ============================================================ */

(function yanghuiIntro() {
  const ROWS = 8; // 杨辉三角行数
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
  */

  // 预存每个格子的 (r, k) 及其所在对角线编号 d = r + k
  const cells = {}; // key: r,k -> 格子元素
  const diagCells = {}; // d -> [ {cell, val} ]

  // 防抖：合并鼠标在行间缝隙快速来回触发的 enter/leave，避免高亮来回闪烁抽搐
  let debounceTimer = null;

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
      // 悬停交互：高亮整条对角线（加入 45ms 防抖，稳定切换）
      cell.addEventListener('mouseenter', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => highlightDiag(d), 45);
      });
      cell.addEventListener('mouseleave', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(clearHighlight, 45);
      });
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
