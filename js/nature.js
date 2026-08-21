/* ============================================================
   nature.js — 自然展厅：点击卡片进入全屏沉浸阅读
   natureFullscreen()：内嵌完整文案，file:// 下可直接运行
   （斐波那契教学页面 · 脚本封装 part 7）
   ============================================================ */

(function natureFullscreen() {
  const cards = Array.from(document.querySelectorAll('.nature-card'));
  const overlay = document.getElementById('fsOverlay');
  if (!cards.length || !overlay) return;
  const bg = document.getElementById('fsBg');
  const emoji = document.getElementById('fsEmoji');
  const title = document.getElementById('fsTitle');
  const body = document.getElementById('fsBody');
  const dots = document.getElementById('fsDots');
  const prev = document.getElementById('fsPrev');
  const next = document.getElementById('fsNext');
  const closeBtn = document.getElementById('fsClose');

  const NATURE = [
    {
      img: 'image/向日葵图片.jpg',
      emoji: '🌻',
      title: '向日葵',
      body: '向日葵的种子并非随机散落，而是沿着一对相反方向的对数螺旋精准排布。当你细数这些螺旋：一圈有 34 条、一圈有 55 条，更多时甚至达到 89、144——它们竟全是斐波那契数，而且总是相邻的两个。这种排布让每一粒种子都尽量拥有等大而均匀的空间，把阳光与养分的利用率推向极致。于是，数学的秩序悄悄藏进了每一株仰望太阳的花里。'
    },
    {
      img: 'image/鹦鹉螺图片.jpg',
      emoji: '🐚',
      title: '鹦鹉螺',
      body: '鹦鹉螺在生长中不断向旧壳前方添加新的腔室，每长大一节，壳体便按一个固定的比例放大：从任意两个相邻腔室的尺寸比，都能读出约 1.618 的黄金比例。日久天长，一圈一圈向外扩张，便勾勒出那条标志性的对数螺旋。既坚固耐压，又节省材料，是大自然在亿万年间打磨出的优雅范例，也是人类认识"自然界的斐波那契"的第一课。'
    },
    {
      img: 'image/菠萝图片.jpg',
      emoji: '🌲',
      title: '松果 & 菠萝',
      body: '拿起一枚松果或一只菠萝，顺着鳞片的走向数：一侧常是 5 条螺旋，另一侧则反向着 8 条——又一对相邻的斐波那契数。鳞片以这种方式相互咬合、紧密排列，既在有限空间里装下尽可能多的籽，又让每片都露在光照与通风之中。不同物种演化出如此相似的"数学方案"，似乎在提醒我们：最优的排列，往往殊途同归。'
    },
    {
      img: 'image/植物叶片图片.jpg',
      emoji: '🌿',
      title: '叶片生长',
      body: '许多植物的叶片并不杂乱丛生，而是沿茎干螺旋上升，每两片叶之间约错开 137.5°——这正是被称为"黄金角"的角度，恰为圆周按黄金比例分割的较小那份。叶片依次错落，使上方叶片几乎不会遮挡下方叶片，每一片都能公平地分享阳光。这看似随意的生长，其实是一场被数学写好的布局。'
    },
    {
      img: 'image/蜜蜂图片.jpg',
      emoji: '🐝',
      title: '蜜蜂的家族树',
      body: '蜜蜂家族绵延着一条惊人的规律：雄蜂由未受精的卵发育而成，只有母亲，没有父亲；而它的母亲、祖母皆按此延伸开来。回溯某一代雄蜂的祖先数量：1、1、2、3、5、8……竟严格踏着斐波那契数列的节拍。生命的繁衍图谱，在一圈看不见的关系中，悄然重复着那条最古老数列的旋律。'
    },
    {
      img: 'image/银河图片.jpg',
      emoji: '🌌',
      title: '银河旋臂',
      body: '把目光从枝头的叶片、海中的螺壳抬向夜空，旋臂星系同样在作画。它们的旋臂轨迹，常能以一种对数螺旋（黄金螺旋的姊妹）近似描述——银盘上密集的星体与尘埃，沿着这条曲线缓缓旋转、聚散。天体物理学家发现，这些螺旋并非刻意为之，更像引力、角动量与自组织共同谱成的宇宙级编舞。从一朵花到一整条银河，那串数字从未远离。'
    }
  ];

  let cur = 0;

  // 卡片点击打开全屏，index 对应数组顺序
  cards.forEach((card, i) => {
    card.setAttribute('data-index', i);
    card.addEventListener('click', () => open(i));
  });

  function setBody(i, dir) {
    const d = NATURE[i];
    if (!d) return;
    bg.style.backgroundImage = "url('" + d.img + "')";
    emoji.textContent = d.emoji;
    emoji.style.backgroundImage = "url('" + d.img + "')";
    title.textContent = d.title;
    body.textContent = d.body;

    // 指示点
    dots.innerHTML = '';
    NATURE.forEach((_, k) => {
      const dot = document.createElement('span');
      dot.className = 'fs-dot' + (k === i ? ' active' : '');
      dots.appendChild(dot);
    });

    // 滑入动画
    const c = document.getElementById('fsContent');
    c.classList.remove('anim-left', 'anim-right');
    void c.offsetWidth; // 强制重绘以重启动画
    c.classList.add(dir === -1 ? 'anim-right' : 'anim-left');
  }

  function open(i) {
    cur = (i + NATURE.length) % NATURE.length;
    document.body.style.overflow = 'hidden'; // 锁定背景滚动
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    setBody(cur, 1);
  }

  function go(dir) {
    cur = (cur + dir + NATURE.length) % NATURE.length;
    setBody(cur, dir);
  }

  function close() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.classList.contains('fs-bg')) close(); });

  // 键盘导航：← → 切换，Esc 关闭
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('show')) return;
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Escape') close();
  });

  // ---- 自然页入场：六个 emoji 卡先在界面中心浮现，再散开到各自网格位并放大成框 ----
  // 仅在自然屏被激活（viewactive）后首次播放；避免单屏模式下隐藏屏被提前触发。
  const grid = document.querySelector('.nature-grid');
  let natureIntroDone = false;

  function runNatureIntro() {
    if (natureIntroDone || !grid || cards.length === 0) return;
    // 若 GSAP 未加载，退化为直接显示（兜底）
    if (typeof gsap === 'undefined') {
      cards.forEach(c => { c.style.opacity = '1'; });
      return;
    }
    natureIntroDone = true;

    const gRect = grid.getBoundingClientRect();
    const cx = gRect.left + gRect.width / 2;
    const cy = gRect.top + gRect.height / 2;

    // ① 先把六张卡"聚拢到网格中心"，只显示缩略 emoji（缩小 + 透明→浮现）
    gsap.set(cards, {
      x: (i, el) => -(el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2 - cx),
      y: (i, el) => -(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 - cy),
      scale: 0.32,
      opacity: 0,
      transformOrigin: 'center center'
    });
    // ② 再平滑散开到各自原位，同时由缩略放大成完整卡片框
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(cards, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.95,
        stagger: 0.09
      })
      .set(cards, { clearProps: 'transform' }); // 结束后清除，恢复 hover 位移
  }

  window.addEventListener('viewactive', (ev) => {
    if (ev.detail === 'nature') runNatureIntro();
  });
  // 若初始化时当前屏正是自然（如导航直跳），立即播放
  if (grid && grid.closest('.view').classList.contains('active')) runNatureIntro();
})();
