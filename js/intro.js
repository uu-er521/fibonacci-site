/* ============================================================
   intro.js — 问题引入：兔子繁衍动效 + 数学家 accordion
   introPhenomena()
   （斐波那契教学页面 · 脚本封装 part 4）
   ============================================================ */

(function introPhenomena() {
  /* ---- 兔子繁衍动效 ---- */
  const range = document.getElementById('rabbitRange');
  const monthLabel = document.getElementById('rabbitMonth');
  const countLabel = document.getElementById('rabbitCount');
  const track = document.getElementById('rabbitTrack');
  const seqBox = document.getElementById('rabbitSeq');
  if (range && monthLabel && countLabel && track && seqBox) {
    // 每月 (成兔, 幼兔)，展示 1–11 个月
    const months = [];
    let adult = 0, young = 1;
    for (let m = 1; m <= 11; m++) {
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
      const mk = (cl) => {
        const el = document.createElement('span');
        el.className = 'rabbit-pair' + cl;
        el.textContent = '🐇';
        return el;
      };
      // 成兔
      for (let i = 0; i < data.adult; i++) track.appendChild(mk(' adult'));
      // 幼兔
      for (let i = 0; i < data.young; i++) track.appendChild(mk(''));

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
