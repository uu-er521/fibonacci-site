/* ============================================================
   definition.js — 数列定义 · 数列生成器
   generator()：拖动滑杆逐项构建数列，展示相邻项之比逼近黄金比例
   （斐波那契教学页面 · 脚本封装 part 3 · 对应板块 #definition）
   ============================================================ */

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
