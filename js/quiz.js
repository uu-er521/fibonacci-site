/* ============================================================
   quiz.js — 测验模块
   quiz()：5 题选择，即时计分与反馈
   （斐波那契教学页面 · 脚本封装 part 8）
   ============================================================ */

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
