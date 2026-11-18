// 作者：刘思媛 —— 任务二：左右滑动切换美食卡片
(function () {
  var lsy422Track = document.getElementById('lsy422Track');
  var lsy422Viewport = document.getElementById('lsy422Viewport');
  var lsy422Dots = document.getElementById('lsy422Dots');
  var lsy422Counter = document.getElementById('lsy422Counter');
  var lsy422Toast = document.getElementById('lsy422Toast');

  var lsy422Total = 4;          // 卡片总数
  var lsy422Index = 0;          // 当前显示第几张（从 0 开始）
  var lsy422StartX = 0;         // 手指按下时的横坐标
  var lsy422StartY = 0;         // 手指按下时的纵坐标
  var lsy422Locked = false;     // 冷却锁：防止快速连滑一次跳两张
  var lsy422ToastTimer = null;  // 边界提示的定时器

  // 根据卡片总数生成底部圆点指示器
  function lsy422BuildDots() {
    var lsy422Html = '';
    for (var lsy422I = 0; lsy422I < lsy422Total; lsy422I++) {
      lsy422Html += '<span class="lsy422-dot"></span>';
    }
    lsy422Dots.innerHTML = lsy422Html;
  }

  // 按当前索引更新卡片位置、页码文字与圆点状态
  function lsy422Render() {
    lsy422Track.style.transform = 'translateX(' + (-lsy422Index * 25) + '%)';
    lsy422Counter.textContent = lsy422Index + 1;

    var lsy422List = lsy422Dots.children;
    for (var lsy422I = 0; lsy422I < lsy422List.length; lsy422I++) {
      if (lsy422I === lsy422Index) {
        lsy422List[lsy422I].classList.add('lsy422-on');
      } else {
        lsy422List[lsy422I].classList.remove('lsy422-on');
      }
    }
  }

  // 在屏幕下方弹出一条提示文字，1.4 秒后自动消失
  function lsy422ShowToast(lsy422Text) {
    lsy422Toast.textContent = lsy422Text;
    lsy422Toast.classList.add('lsy422-show');
    clearTimeout(lsy422ToastTimer);
    lsy422ToastTimer = setTimeout(function () {
      lsy422Toast.classList.remove('lsy422-show');
    }, 1400);
  }

  // 切换到指定索引的卡片：越界时不移动，只给出提示
  function lsy422GoTo(lsy422Target) {
    if (lsy422Target < 0) {
      lsy422ShowToast('已经是第一张了');
      return;
    }
    if (lsy422Target > lsy422Total - 1) {
      lsy422ShowToast('已经是最后一张了');
      return;
    }
    lsy422Index = lsy422Target;
    lsy422Render();
  }

  // 手指按下：记录起点坐标，用于抬手时计算位移
  function lsy422OnTouchStart(e) {
    if (lsy422Locked) return;
    if (e.touches.length !== 1) return;  // 多指操作不参与翻卡
    lsy422StartX = e.touches[0].clientX;
    lsy422StartY = e.touches[0].clientY;
  }

  // 手指抬起：用 changedTouches 算位移，超过阈值才判定为滑动
  function lsy422OnTouchEnd(e) {
    if (lsy422Locked) return;
    if (e.changedTouches.length !== 1) return;

    var lsy422T = e.changedTouches[0];
    var lsy422Dx = lsy422T.clientX - lsy422StartX;
    var lsy422Dy = lsy422T.clientY - lsy422StartY;

    // 位移不足阈值，或纵向位移更大（用户其实是在上下滚动页面）时不翻卡
    if (Math.abs(lsy422Dx) < 40 || Math.abs(lsy422Dx) < Math.abs(lsy422Dy)) return;

    // 进入 300ms 冷却，快速连滑也不会一次跳两张
    lsy422Locked = true;
    setTimeout(function () {
      lsy422Locked = false;
    }, 300);

    lsy422GoTo(lsy422Dx < 0 ? lsy422Index + 1 : lsy422Index - 1);
  }

  // 触摸被系统打断（来电、通知）时清掉锁定状态，避免手势卡死
  function lsy422OnTouchCancel() {
    lsy422Locked = false;
  }

  lsy422BuildDots();
  lsy422Render();

  lsy422Viewport.addEventListener('touchstart', lsy422OnTouchStart, { passive: true });
  lsy422Viewport.addEventListener('touchend', lsy422OnTouchEnd, { passive: true });
  lsy422Viewport.addEventListener('touchcancel', lsy422OnTouchCancel, { passive: true });
})();
