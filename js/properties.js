/* ============================================================
   properties.js — 性质 · 黑板全屏画廊
   formulaGallery()：点击 6 条性质卡进入全屏黑板，左右翻页查看
   详细推导（结论 → 分步 → 为什么重要），背景统一为黑板图片。
   （斐波那契教学页面 · 脚本封装 part 9 · 对应板块 #properties）
   注意：结构沿用 natureFullscreen 的容器模式，视觉独立为黑板。
   ============================================================ */

(function formulaGallery() {
  const cards = Array.from(document.querySelectorAll('.fo-card'));
  const overlay = document.getElementById('foOverlay');
  if (!cards.length || !overlay) return;

  const title = document.getElementById('foTitle');
  const claim = document.getElementById('foClaim');
  const steps = document.getElementById('foSteps');
  const why = document.getElementById('foWhy');
  const dots = document.getElementById('foDots');
  const prev = document.getElementById('foPrev');
  const next = document.getElementById('foNext');
  const close = document.getElementById('foClose');
  const kicker = document.getElementById('foKicker');
  const state = document.getElementById('foState');

  // ---- 6 条性质的详细推导数据 ----
  const DATA = [
    {
      kicker: 'Parity · 奇偶规律',
      title: '奇偶规律',
      claim: '当且仅当 n 是 3 的倍数时，Fₙ 为偶数；其余各项均为奇数。',
      steps: [
        { body: '把每项都对 2 取模，考察递推在「奇偶世界」里如何行走。递推公式变成：',
          ml: 'Fₙ ≡ Fₙ₋₁ + Fₙ₋₂  (mod 2)',
          add: '' },
        { body: '从初值出发依次列出模 2 的序列：',
          ml: 'F₀, F₁, F₂, F₃, F₄, F₅, …',
          add: '0, 1, 1, 0, 1, 1, 0, 1, 1, …' },
        { body: '于是「0 偶、1 奇」交替，得到一个固定重复的周期：',
          ml: '0, 1, 1  |  0, 1, 1  |  0, 1, 1  |  …',
          add: '周期长 3，每个周期的首位都是偶数。' },
        { body: '数学归纳可严格化：若某位是偶（0），则下两位由 0+1=1、1+1≡0 推得仍为 1、0，故「偶、奇、奇」三段不断重演。',
          ml: '',
          add: '因为每次从「偶」出发，后两位必为「奇、奇」，再返回「偶」，往复循环。' },
        { body: '结论即：偶数恰好落在下标为 3 的倍数处，其余都是奇数。',
          ml: 'n ≡ 0 (mod 3)  ⇔  Fₙ 为偶数',
          add: '' }
      ],
      why: '这是斐波那契整除性最直观的入口——它能立刻回答「第 n 项是不是偶数」，也为后面「F₃=2、F₃k 均可被 2 整除」等更深的整除链埋下伏笔。'
    },
    {
      kicker: 'Summation · 前 n 项和',
      title: '前 n 项的和',
      claim: 'F₁ + F₂ + … + Fₙ = Fₙ₊₂ − 1',
      steps: [
        { body: '从递推公式做一个简单的代数变形：把 Fₖ₊₂ = Fₖ₊₁ + Fₖ 移项，得到',
          ml: 'Fₖ = Fₖ₊₂ − Fₖ₊₁',
          add: '这告诉我们：每一项都可以写成「它后面两项之差」。' },
        { body: '把 k = 1, 2, …, n 逐一代入并竖着写出来：',
          ml: 'F₁ = F₃ − F₂\nF₂ = F₄ − F₃\nF₃ = F₅ − F₄\n⋮\nFₙ = Fₙ₊₂ − Fₙ₊₁',
          add: '' },
        { body: '把所有式子左右两边分别相加。右边的 F₂ 与 F₃ 相消、F₃ 与 F₄ 相消……层层抵掉，只剩下头和尾。',
          ml: '',
          add: '这种「首尾相消」叫做裂项求和（telescoping）。' },
        { body: '右边最终只剩 Fₙ₊₂ − F₂。又因 F₂ = 1，把 1 移到左边即得：',
          ml: 'F₁ + F₂ + … + Fₙ = Fₙ₊₂ − 1',
          add: '' }
      ],
      why: '它把「一个个累加」的 O(n) 运算压缩成一步取值，是数列求和的经典范式；也是后面推导奇、偶项和的必备钥匙。'
    },
    {
      kicker: 'Summation · 奇数项和',
      title: '奇数下标项之和',
      claim: 'F₁ + F₃ + F₅ + … + F₂ₙ₋₁ = F₂ₙ',
      steps: [
        { body: '记 S₂ₙ 为前 2n 项的总和，Oₙ 为其中奇数下标项之和、Eₙ 为偶数下标项之和。显然',
          ml: 'S₂ₙ = Oₙ + Eₙ',
          add: '' },
        { body: '借助性质「前 m 项和 = Fₘ₊₂ − 1」对 m = 2n 使用：',
          ml: 'S₂ₙ = F₂ₙ₊₂ − 1',
          add: '' },
        { body: '再观察偶、奇下标项在数值上的关系：Eₙ = S₂ₙ₋₁ − Oₙ₋₁，且相邻两项之差会不断「错位抵消」。更直接地，可用递推把偶项逐项折成奇项：',
          ml: 'Oₙ = F₂ₙ,  Eₙ = F₂ₙ₊₁ − 1',
          add: '' },
        { body: '代入 S₂ₙ = Oₙ + Eₙ 验证：',
          ml: 'F₂ₙ + (F₂ₙ₊₁ − 1) = F₂ₙ₊₂ − 1',
          add: '由 F₂ₙ₊₂ = F₂ₙ₊₁ + F₂ₙ 正好恒等，于是奇数项和确为 F₂ₙ。' }
      ],
      why: '它揭示了奇、偶下标在数列中的对称结构，常用于数学竞赛求和，也与黄金比例的连分数展开息息相关。'
    },
    {
      kicker: 'Summation · 偶数项和',
      title: '偶数下标项之和',
      claim: 'F₂ + F₄ + F₆ + … + F₂ₙ = F₂ₙ₊₁ − 1',
      steps: [
        { body: '和前一条同理，把前 2n 项总和拆成奇、偶两部分：',
          ml: 'S₂ₙ = Oₙ + Eₙ,  Eₙ = S₂ₙ − Oₙ',
          add: '' },
        { body: '代入已知的两条：前 m 项和 S₂ₙ = F₂ₙ₊₂ − 1，以及奇数项和 Oₙ = F₂ₙ：',
          ml: 'Eₙ = (F₂ₙ₊₂ − 1) − F₂ₙ',
          add: '' },
        { body: '由递推 F₂ₙ₊₂ = F₂ₙ₊₁ + F₂ₙ 化简：',
          ml: 'Eₙ = F₂ₙ₊₁ + F₂ₙ − 1 − F₂ₙ = F₂ₙ₊₁ − 1',
          add: '中间的 F₂ₙ 恰好抵销。' },
        { body: '最终得到',
          ml: 'F₂ + F₄ + … + F₂ₙ = F₂ₙ₊₁ − 1',
          add: '' }
      ],
      why: '与前一条「奇数项和」合起来，构成一套完整的奇偶求和公式；它们一起让任意一段下标之和都可由少数几项直接读出。'
    },
    {
      kicker: 'Coprimality · 相邻项互质',
      title: '相邻项互质',
      claim: '任意两个相邻的斐波那契数，gcd(Fₙ, Fₙ₊₁) = 1',
      steps: [
        { body: '回忆欧几里得算法：对正整数 a ≥ b，有 gcd(a, b) = gcd(b, a mod b)。',
          ml: 'gcd(a, b) = gcd(b, a mod b)',
          add: '' },
        { body: '把 a = Fₙ₊₁, b = Fₙ 代入。因为 Fₙ₊₁ = Fₙ + Fₙ₋₁，所以 Fₙ₊₁ mod Fₙ = Fₙ₋₁，于是',
          ml: 'gcd(Fₙ₊₁, Fₙ) = gcd(Fₙ, Fₙ₋₁)',
          add: '相邻两项的公约数，被「倒退」成更小的相邻一对。' },
        { body: '不断重复，下标逐步回退：',
          ml: 'gcd(Fₙ₊₁, Fₙ) = gcd(Fₙ, Fₙ₋₁) = … = gcd(F₂, F₁)',
          add: '' },
        { body: '而 F₂ = 1、F₁ = 1，gcd(1, 1) = 1，链条由此封口：',
          ml: 'gcd(Fₙ₊₁, Fₙ) = 1',
          add: '任意相邻两项永远互质。' }
      ],
      why: '它是斐波那契数论性质的地基——相邻互质让很多整除、辗转相除的推论得以成立，也直接解释了为什么分子分母取相邻项时分数已不可再约。'
    },
    {
      kicker: 'Geometry · 平方和求和',
      title: '平方和求和',
      claim: 'F₁² + F₂² + … + Fₙ² = Fₙ · Fₙ₊₁',
      steps: [
        { body: '关键恒等式来自递推：把 Fₖ₊₁ = Fₖ + Fₖ₋₁ 两边同乘 Fₖ，移项得',
          ml: 'Fₖ² = Fₖ·Fₖ₊₁ − Fₖ₋₁·Fₖ',
          add: '' },
        { body: '对 k = 1, 2, …, n 逐项列出并相加。右边第一项是 Fₖ₋₁Fₖ，第二项来自下一步的 FₖFₖ₊₁，前后恰好相消：',
          ml: 'F₁² = F₁F₂ − F₀F₁\nF₂² = F₂F₃ − F₁F₂\n⋮\nFₙ² = FₙFₙ₊₁ − Fₙ₋₁Fₙ',
          add: '' },
        { body: '裂项后，中间的乘积项全部抵消，只剩最后一项：',
          ml: '',
          add: '（取 F₀ = 0，则首项中的 F₀F₁ = 0）' },
        { body: '得到',
          ml: 'F₁² + F₂² + … + Fₙ² = Fₙ₊₁Fₙ',
          add: '' },
        { body: '这恰好也是「边长取 1、1、2、3、5……」的正方形拼成一个边长 Fₙ×Fₙ₊₁ 长方形时的面积等式——几何与代数在此殊途同归。',
          ml: '',
          add: '' }
      ],
      why: '平方和公式既是一道优雅恒等式，也有直观的几何背景（黄金矩形拼图），是把「求和」转化成「矩形面积」的绝佳示范。'
    }
  ];

  let cur = 0;

  // 卡片点击打开，index 对应数据索引（card 的 data-fo 已设）
  cards.forEach(card => {
    card.addEventListener('click', () => open(+card.dataset.fo));
  });

  function setPanorama(i, dir) {
    const d = DATA[i];
    if (!d) return;
    kicker.textContent = d.kicker;
    title.textContent = d.title;
    state.textContent = '性质 ' + (i + 1) + ' / ' + DATA.length;
    claim.textContent = '📌  ' + d.claim;

    steps.innerHTML = '';
    d.steps.forEach((s, idx) => {
      const step = document.createElement('div');
      step.className = 'fo-step';
      const box = document.createElement('div');
      box.className = 'snum';
      box.textContent = idx + 1;
      const bodyBox = document.createElement('div');
      bodyBox.className = 'sbody';
      const p = document.createElement('p');
      p.textContent = s.body;
      bodyBox.appendChild(p);
      if (s.ml) {
        const f = document.createElement('div');
        f.className = 'formula';
        f.innerHTML = s.ml.replace(/\n/g, '<br>');
        f.style.whiteSpace = 'nowrap';
        bodyBox.appendChild(f);
      }
      if (s.add) {
        const a = document.createElement('div');
        a.className = 'ml';
        a.textContent = s.add;
        bodyBox.appendChild(a);
      }
      step.appendChild(box);
      step.appendChild(bodyBox);
      steps.appendChild(step);
    });

    why.innerHTML = '<span class="wico">🧠</span>';
    const wp = document.createElement('p');
    wp.textContent = d.why;
    why.appendChild(wp);

    dots.innerHTML = '';
    DATA.forEach((_, k) => {
      const dot = document.createElement('span');
      dot.className = 'fo-dot' + (k === i ? ' active' : '');
      dots.appendChild(dot);
    });

    const c = document.getElementById('foContent');
    c.classList.remove('anim-left', 'anim-right');
    void c.offsetWidth;
    c.classList.add(dir === -1 ? 'anim-right' : 'anim-left');
  }

  function open(i) {
    cur = (i + DATA.length) % DATA.length;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    setPanorama(cur, 1);
  }

  function go(dir) {
    cur = (cur + dir + DATA.length) % DATA.length;
    setPanorama(cur, dir);
  }

  function closeIt() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  close.addEventListener('click', closeIt);
  overlay.addEventListener('click', e => { if (e.target === overlay || e.target.classList.contains('fo-bg')) closeIt(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('show')) return;
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Escape') closeIt();
  });
})();
