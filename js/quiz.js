/* ============================================================
   quiz.js — 测验模块
   quiz()：10 题选择，即时计分、反馈、解析与交互动画
   （斐波那契教学页面 · 脚本封装 part 8）

   交互亮点：
   · 顶部渐变进度条 + 题号提示
   · 每题题目淡入、选项 A/B/C/D 逐个错落弹入（GSAP）
   · 选项悬停浮起光晕（CSS）
   · 作答后：选对弹跳 ✓ / 选错抖动 ✗ + 正确项高亮、未选项淡出
   · 解析框柔和滑入、得分数字弹跳
   · 全部完成后渐变标题 + 星级庆祝
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
  const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
  let qIndex = 0, score = 0, answered = false, hasGSAP = typeof gsap !== 'undefined';

  const quizBox = document.querySelector('.quiz-box');
  const quizQ = document.getElementById('quizQ');
  const quizOptions = document.getElementById('quizOptions');
  const quizExpl = document.getElementById('quizExpl');
  const quizScore = document.getElementById('quizScore');
  const quizNext = document.getElementById('quizNext');
  const progressFill = document.getElementById('quizProgressFill');
  const progressLabel = document.getElementById('quizProgressLabel');

  // 更新顶部进度条
  function updateProgress() {
    const total = quizData.length;
    const filled = qIndex / total * 100;
    progressFill.style.width = filled + '%';
    progressLabel.textContent = (qIndex >= total ? '完成' : (qIndex + 1) + ' / ' + total);
  }

  // 分数弹跳（重新触发动画）
  function bumpScore() {
    quizScore.classList.remove('bump');
    void quizScore.offsetWidth; // 强制 reflow 以重触发 animation
    quizScore.classList.add('bump');
  }

  function loadQuestion() {
    answered = false;
    quizNext.disabled = true;
    quizExpl.classList.remove('revealed');
    if (hasGSAP) gsap.set(quizExpl, { opacity: 0, y: 14 });
    quizExpl.style.display = 'none';

    const item = quizData[qIndex];
    // 题目 + 序号圆徽
    quizQ.innerHTML = '<span class="q-num">' + (qIndex + 1) + '</span><span class="q-text">' + item.q + '</span>';
    if (hasGSAP) {
      gsap.fromTo(quizQ, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }

    quizOptions.innerHTML = '';
    item.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.innerHTML = '<span class="opt-key">' + KEYS[i] + '</span><span class="opt-text">' + opt + '</span>';
      if (hasGSAP) gsap.set(btn, { opacity: 0, y: 22 });
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const all = quizOptions.querySelectorAll('.quiz-opt');
        const correct = all[item.a];

        if (i === item.a) {
          // 选对：正确项弹跳
          btn.classList.add('correct', 'pop-correct');
          score++;
        } else {
          // 选错：所选抖动 + 正确项高亮
          btn.classList.add('wrong', 'shake-wrong');
          correct.classList.add('correct', 'pop-correct');
        }
        all.forEach(b => b.disabled = true);

        // 未选项淡出
        if (hasGSAP) {
          const dims = Array.from(all).filter(b => !b.classList.contains('correct') && !b.classList.contains('wrong'));
          gsap.to(dims, { opacity: 0.4, duration: 0.35, ease: 'power2.out' });
        }

        // 展示解析（滑入）
        if (hasGSAP) {
          quizExpl.style.display = 'block';
          quizExpl.innerHTML = '<span class="expl-label">📖 解析</span>' + item.expl;
          gsap.fromTo(quizExpl, { opacity: 0, y: 14 }, {
            opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.15
          });
          quizExpl.classList.add('revealed');
        } else {
          quizExpl.hidden = false;
          quizExpl.innerHTML = '<span class="expl-label">📖 解析</span>' + item.expl;
        }

        quizScore.textContent = '得分：' + score + ' / ' + (qIndex + 1);
        bumpScore();
        quizNext.disabled = false;

        // 下一题按钮点亮动效
        if (hasGSAP) {
          gsap.fromTo(quizNext, { scale: 0.92 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        }
      });
      quizOptions.appendChild(btn);
    });

    // 选项错落入场动画
    if (hasGSAP) {
      const btns = quizOptions.querySelectorAll('.quiz-opt');
      gsap.to(btns, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.7)',
        delay: 0.2, onComplete() {
          // 释放 transform，让 CSS hover 位移生效
          btns.forEach(b => gsap.set(b, { clearProps: 'transform' }));
        }
      });
    }
  }

  quizNext.addEventListener('click', () => {
    qIndex++;
    if (qIndex >= quizData.length) {
      // ---- 完成庆祝 ----
      answered = true;
      quizQ.innerHTML = '';
      quizExpl.style.display = 'none';
      quizNext.disabled = true;

      const pct = Math.round(score / quizData.length * 100);
      let emoji, stars;
      if (pct === 100) { emoji = '🏆'; stars = '⭐⭐⭐⭐⭐'; }
      else if (pct >= 80) { emoji = '🌟'; stars = '⭐⭐⭐⭐'; }
      else if (pct >= 60) { emoji = '👏'; stars = '⭐⭐⭐'; }
      else { emoji = '💪'; stars = '⭐⭐'; }

      quizOptions.innerHTML =
        '<div class="quiz-done">' +
        '<span class="done-emoji">' + emoji + '</span>' +
        '<div class="done-title">' + score + ' / ' + quizData.length + ' · ' + pct + '%</div>' +
        '<div class="done-stars">' + stars + '</div>' +
        '<p style="color:var(--muted); margin-top:14px;">' + (pct === 100 ? '满分！你已完全掌握斐波那契的奥秘 🎉' : '测验完成！可点击下方按钮重新测验，或继续探索这个迷人的数列世界。') + '</p>' +
        '<button class="quiz-retry" id="quizRetry">↻ 重新测验</button>' +
        '</div>';
      if (hasGSAP) {
        gsap.fromTo('.quiz-done', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' });
      }
      updateProgress();
      quizScore.textContent = '最终得分：' + score + ' / ' + quizData.length;
      bumpScore();

      // 重新测验：重置进度并回退到个人页尾部入口（保持单页面 view，按钮触发重播）
      const retryBtn = document.getElementById('quizRetry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          qIndex = 0; score = 0;
          quizOptions.innerHTML = '';
          quizScore.textContent = '得分：0 / 0';
          updateProgress();
          loadQuestion();
        });
      }
      return;
    }
    updateProgress();
    loadQuestion();
  });

  // 初始化
  updateProgress();
  loadQuestion();
})();
