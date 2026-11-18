// 作者：刘思媛 —— 任务三：图片查看器（双指缩放 / 双击放大 / 单指拖动）
(function () {
  var lsy422Stage = document.getElementById('lsy422Stage');
  var lsy422Img = document.getElementById('lsy422Img');
  var lsy422ScaleText = document.getElementById('lsy422ScaleText');
  var lsy422ResetBtn = document.getElementById('lsy422ResetBtn');

  var lsy422MinScale = 1;       // 最小缩放倍数
  var lsy422MaxScale = 4;       // 最大缩放倍数
  var lsy422Scale = 1;          // 当前缩放倍数
  var lsy422Tx = 0;             // 当前横向位移
  var lsy422Ty = 0;             // 当前纵向位移

  var lsy422Mode = '';          // 本次手势类型：pinch 双指 / drag 单指
  var lsy422StartDist = 0;      // 双指按下时的初始间距
  var lsy422StartScale = 1;     // 双指按下时的初始缩放倍数
  var lsy422StartTx = 0;        // 手势开始时的横向位移
  var lsy422StartTy = 0;        // 手势开始时的纵向位移
  var lsy422FocalX = 0;         // 两指中点在容器内的横坐标
  var lsy422FocalY = 0;         // 两指中点在容器内的纵坐标
  var lsy422DragX = 0;          // 单指拖动的起始横坐标
  var lsy422DragY = 0;          // 单指拖动的起始纵坐标
  var lsy422Moved = false;      // 本次触摸是否移动过，用来区分轻点与拖动
  var lsy422TapTime = 0;        // 上一次轻点的时间戳
  var lsy422TapX = 0;           // 上一次轻点的横坐标
  var lsy422TapY = 0;           // 上一次轻点的纵坐标
  var lsy422AnimTimer = null;   // 过渡动画结束后移除动画类的定时器

  // 计算两根手指之间的直线距离
  function lsy422Distance(lsy422T1, lsy422T2) {
    return Math.hypot(lsy422T2.clientX - lsy422T1.clientX, lsy422T2.clientY - lsy422T1.clientY);
  }

  // 把当前缩放与位移写到图片上，并刷新倍数文字
  function lsy422Apply(lsy422Animate) {
    lsy422Img.classList.remove('lsy422-anim');
    if (lsy422Animate) {
      void lsy422Img.offsetWidth;  // 强制回流，保证过渡动画从当前状态开始
      lsy422Img.classList.add('lsy422-anim');
      clearTimeout(lsy422AnimTimer);
      lsy422AnimTimer = setTimeout(function () {
        lsy422Img.classList.remove('lsy422-anim');
      }, 260);
    }
    lsy422Img.style.transform = 'translate(' + lsy422Tx + 'px,' + lsy422Ty + 'px) scale(' + lsy422Scale + ')';
    lsy422ScaleText.textContent = lsy422Scale.toFixed(2) + 'x';
  }

  // 把位移限制在图片边界内，防止拖出空白
  function lsy422ClampDelta() {
    var lsy422Rect = lsy422Stage.getBoundingClientRect();
    var lsy422MinTx = lsy422Rect.width * (1 - lsy422Scale);
    var lsy422MinTy = lsy422Rect.height * (1 - lsy422Scale);

    if (lsy422Tx > 0) lsy422Tx = 0;
    if (lsy422Tx < lsy422MinTx) lsy422Tx = lsy422MinTx;
    if (lsy422Ty > 0) lsy422Ty = 0;
    if (lsy422Ty < lsy422MinTy) lsy422Ty = lsy422MinTy;
  }

  // 以指定的屏幕点为基准缩放到目标倍数，保证该点下方的内容不动
  function lsy422ZoomAt(lsy422ClientX, lsy422ClientY, lsy422NextScale, lsy422Animate) {
    var lsy422Rect = lsy422Stage.getBoundingClientRect();
    var lsy422Fx = lsy422ClientX - lsy422Rect.left;
    var lsy422Fy = lsy422ClientY - lsy422Rect.top;
    var lsy422Next = Math.min(lsy422MaxScale, Math.max(lsy422MinScale, lsy422NextScale));

    lsy422Tx = lsy422Fx - (lsy422Fx - lsy422Tx) * (lsy422Next / lsy422Scale);
    lsy422Ty = lsy422Fy - (lsy422Fy - lsy422Ty) * (lsy422Next / lsy422Scale);
    lsy422Scale = lsy422Next;

    lsy422ClampDelta();
    lsy422Apply(lsy422Animate);
  }

  // 手指按下：双指记录初始间距与中点，单指记录拖动起点
  function lsy422OnTouchStart(e) {
    lsy422Img.classList.remove('lsy422-anim');
    lsy422Moved = false;

    var lsy422Rect = lsy422Stage.getBoundingClientRect();

    if (e.touches.length >= 2) {
      lsy422Mode = 'pinch';
      lsy422StartDist = lsy422Distance(e.touches[0], e.touches[1]);
      lsy422StartScale = lsy422Scale;
      lsy422StartTx = lsy422Tx;
      lsy422StartTy = lsy422Ty;
      lsy422FocalX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - lsy422Rect.left;
      lsy422FocalY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - lsy422Rect.top;
    } else if (e.touches.length === 1) {
      lsy422Mode = 'drag';
      lsy422DragX = e.touches[0].clientX;
      lsy422DragY = e.touches[0].clientY;
      lsy422StartTx = lsy422Tx;
      lsy422StartTy = lsy422Ty;
    }
  }

  // 手指移动：双指按间距比例缩放，单指且已放大时拖动图片
  function lsy422OnTouchMove(e) {
    if (lsy422Mode === 'pinch' && e.touches.length >= 2) {
      var lsy422Dist = lsy422Distance(e.touches[0], e.touches[1]);
      var lsy422Next = lsy422StartScale * (lsy422Dist / (lsy422StartDist || lsy422Dist));

      lsy422Scale = Math.min(lsy422MaxScale, Math.max(lsy422MinScale, lsy422Next));
      // 按初始中点反推位移，避免逐帧累加导致图片漂移
      lsy422Tx = lsy422FocalX - (lsy422FocalX - lsy422StartTx) * (lsy422Scale / lsy422StartScale);
      lsy422Ty = lsy422FocalY - (lsy422FocalY - lsy422StartTy) * (lsy422Scale / lsy422StartScale);

      lsy422ClampDelta();
      lsy422Apply(false);
      e.preventDefault();
      return;
    }

    if (e.touches.length !== 1) return;

    var lsy422Dx = e.touches[0].clientX - lsy422DragX;
    var lsy422Dy = e.touches[0].clientY - lsy422DragY;

    if (Math.abs(lsy422Dx) + Math.abs(lsy422Dy) > 6) lsy422Moved = true;
    if (lsy422Mode !== 'drag' || lsy422Scale <= 1) return;

    lsy422Tx = lsy422StartTx + lsy422Dx;
    lsy422Ty = lsy422StartTy + lsy422Dy;
    lsy422ClampDelta();
    lsy422Apply(false);
    e.preventDefault();
  }

  // 手指抬起：收尾边界、处理双指转单指，并判断是否触发双击
  function lsy422OnTouchEnd(e) {
    if (lsy422Mode === 'pinch') {
      lsy422ClampDelta();
      lsy422Apply(false);

      // 松开一根手指后，剩下的那根可以继续拖动查看
      if (e.touches.length === 1 && lsy422Scale > 1) {
        lsy422Mode = 'drag';
        lsy422DragX = e.touches[0].clientX;
        lsy422DragY = e.touches[0].clientY;
        lsy422StartTx = lsy422Tx;
        lsy422StartTy = lsy422Ty;
      } else {
        lsy422Mode = '';
      }
      return;
    }

    lsy422Mode = '';
    if (e.changedTouches.length !== 1 || lsy422Moved) return;

    var lsy422Now = Date.now();
    var lsy422X = e.changedTouches[0].clientX;
    var lsy422Y = e.changedTouches[0].clientY;

    // 两次轻点间隔小于 300ms 且位置接近，判定为双击
    if (lsy422Now - lsy422TapTime < 300 &&
        Math.abs(lsy422X - lsy422TapX) < 30 &&
        Math.abs(lsy422Y - lsy422TapY) < 30) {
      lsy422TapTime = 0;
      if (lsy422Scale > 1.05) {
        lsy422Scale = 1;
        lsy422Tx = 0;
        lsy422Ty = 0;
        lsy422Apply(true);
      } else {
        lsy422ZoomAt(lsy422X, lsy422Y, 2, true);
      }
      return;
    }

    lsy422TapTime = lsy422Now;
    lsy422TapX = lsy422X;
    lsy422TapY = lsy422Y;
  }

  // 触摸被系统打断时结束手势，避免状态卡住
  function lsy422OnTouchCancel() {
    lsy422Mode = '';
    lsy422ClampDelta();
    lsy422Apply(false);
  }

  // 窗口尺寸或横竖屏变化时，保留缩放倍数，只把位移重新限制在边界内
  function lsy422OnResize() {
    lsy422ClampDelta();
    lsy422Apply(false);
  }

  // 点击还原按钮：回到 1x 并居中显示
  function lsy422OnReset() {
    lsy422Scale = 1;
    lsy422Tx = 0;
    lsy422Ty = 0;
    lsy422Apply(true);
  }

  lsy422Stage.addEventListener('touchstart', lsy422OnTouchStart, { passive: true });
  lsy422Stage.addEventListener('touchmove', lsy422OnTouchMove, { passive: false });
  lsy422Stage.addEventListener('touchend', lsy422OnTouchEnd, { passive: true });
  lsy422Stage.addEventListener('touchcancel', lsy422OnTouchCancel, { passive: true });
  lsy422ResetBtn.addEventListener('click', lsy422OnReset);
  window.addEventListener('resize', lsy422OnResize);
  window.addEventListener('orientationchange', lsy422OnResize);
})();
