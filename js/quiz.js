/* ============================================================
   quiz.js — 测验模块
   quiz()：10 题选择，即时计分、反馈与解析
   （斐波那契教学页面 · 脚本封装 part 8）
   ============================================================ */

(function quiz() {
  const quizData = [
    { q: '斐波那契数列从哪两个数字开始？', opts: ['1 和 2', '0 和 1', '1 和 1', '2 和 3'], a: 1, expl: '标准斐波那契数列由 0 和 1 开始：0, 1, 1, 2, 3, 5…，之后的每一项都等于前两项之和。' },
    { q: '数列 0, 1, 1, 2, 3, 5, 8, 13… 的下一个数是？', opts: ['21', '20', '18', '34'], a: 0, expl: '13 之后的下一个数是前两项之和：8 + 13 = 21。' },
    { q: '黄金比例 φ 的数值约为？', opts: ['1.414', '2.718', '1.618', '3.14159'], a: 2, expl: '黄金比例 φ = (1 + √5) / 2 ≈ 1.618。1.414 是 √2，2.718 是自然常数 e，3.14159 是圆周率 π。' },
    { q: '向日葵种子螺旋的数量，通常不是下面哪一个？', opts: ['34', '55', '21', '7'], a: 3, expl: '向日葵的左旋 / 右旋数量通常是相邻的斐波那契数，如 21、34、55、89 等；7 不是斐波那契数。' },
    { q: '相邻两个斐波那契数之比，随着项数增加会趋近于？', opts: ['黄金比例', '圆周率', '自然常数 e', '√2'], a: 0, expl: '相邻斐波那契数之比 F(n+1)/F(n) 会收敛到黄金比例 φ ≈ 1.618，这正是它与黄金比例之间的深层联系。' },
    { q: '从第 1 项加到第 n 项之和（F₁+…+Fₙ）等于？', opts: ['Fₙ₊₁', 'Fₙ₊₂ − 1', 'Fₙ₊₁ − 1', 'Fₙ₊₂'], a: 1, expl: '这是一个著名性质：前 n 项和恰好等于第 n+2 项减 1，即 F₁+…+Fₙ = Fₙ₊₂ − 1。' },
    { q: '斐波那契数列中，下标是几的倍数时，该项为偶数？', opts: ['2 的倍数', '4 的倍数', '3 的倍数', '5 的倍数'], a: 2, expl: '当且仅当某项下标是 3 的倍数时该项才是偶数（如 F₃=2、F₆=8、F₉=34），其余均为奇数，即每三个数中恰有一个偶数。' },
    { q: '由斐波那契递推公式可得，F(5) 等于多少？', opts: ['3', '5', '8', '13'], a: 1, expl: 'F(0)=0、F(1)=1，依次递推：F₂=1、F₃=2、F₄=3、F₅=5。' },
    { q: '雄蜂（单倍体）的家谱，每一代的祖先数量依次是？', opts: ['按黄金比例递增', '正好是斐波那契数', '按 2 的幂增长', '总是奇数'], a: 1, expl: '雄蜂只有母系祖先，其家谱每一代祖先数正好遵循斐波那契数列：1, 1, 2, 3, 5, 8…' },
    { q: '片叶之间的夹角常接近哪个「黄金角」？', opts: ['90°', '137.5°', '120°', '180°'], a: 1, expl: '许多植物叶片之间的夹角接近 137.5°，即黄金角（360° × (1 − 1/φ)），能让叶子几乎互不遮挡地充分采光。' }
  ];
  let qIndex = 0, score = 0, answered = false;

  const quizQ = document.getElementById('quizQ');
  const quizOptions = document.getElementById('quizOptions');
  const quizExpl = document.getElementById('quizExpl');
  const quizScore = document.getElementById('quizScore');
  const quizNext = document.getElementById('quizNext');

  function loadQuestion() {
    answered = false;
    quizNext.disabled = true;
    quizExpl.hidden = true;
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
        // 展示本题解析
        quizExpl.hidden = false;
        quizExpl.innerHTML = '<span class="expl-label">📖 解析：</span>' + item.expl;
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
      quizExpl.hidden = true;
      quizNext.disabled = true;
      quizScore.textContent = '最终得分：' + score + ' / ' + quizData.length;
      return;
    }
    loadQuestion();
  });

  loadQuestion();
})();
