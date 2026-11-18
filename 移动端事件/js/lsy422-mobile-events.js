// 作者：刘思媛 —— 移动端触摸交互四关整合页（选项卡 / 事件探针 / 滑动卡片 / 图片查看器 / 摇一摇）
(function () {

  /* ===================== 一、选项卡切换 ===================== */

  var lsy422TabBtns = document.querySelectorAll('.lsy422-tab');
  var lsy422Panels = document.querySelectorAll('.lsy422-panel');

  // 切换选项卡：先清空全部选中状态，再激活当前按钮与对应面板
  function lsy422ActivateTab(lsy422Btn) {
    lsy422TabBtns.forEach(function (lsy422Item) {
      lsy422Item.classList.remove('lsy422-on');
    });
    lsy422Panels.forEach(function (lsy422Item) {
      lsy422Item.classList.remove('lsy422-on');
    });

    lsy422Btn.classList.add('lsy422-on');
    var lsy422Panel = document.getElementById(lsy422Btn.getAttribute('data-panel'));
    if (lsy422Panel) lsy422Panel.classList.add('lsy422-on');
  }

  // 为每个选项卡按钮绑定点击切换事件
  lsy422TabBtns.forEach(function (lsy422Btn) {
    lsy422Btn.addEventListener('click', function () {
      lsy422ActivateTab(lsy422Btn);
    });
  });

  /* ===================== 二、任务一：事件探针 ===================== */

  var lsy422Pad = document.getElementById('lsy422Pad');
  var lsy422Log = document.getElementById('lsy422Log');
  var lsy422ClearBtn = document.getElementById('lsy422ClearBtn');
  var lsy422CountStart = document.getElementById('lsy422CountStart');
  var lsy422CountMove = document.getElementById('lsy422CountMove');
  var lsy422CountEnd = document.getElementById('lsy422CountEnd');
  var lsy422CountCancel = document.getElementById('lsy422CountCancel');
  var lsy422CountClick = document.getElementById('lsy422CountClick');
  var lsy422Sequence = 0;   // 日志序号，用来观察事件先后顺序

  // 向日志区追加一条事件记录，并自动滚动到最新一条
  function lsy422WriteLog(lsy422Name, lsy422Event) {
    var lsy422Touch = lsy422Event.changedTouches && lsy422Event.changedTouches[0];
    var lsy422Point = lsy422Touch
      ? ' (' + Math.round(lsy422Touch.clientX) + ', ' + Math.round(lsy422Touch.clientY) + ')'
      : '';
    var lsy422Fingers = lsy422Event.touches ? lsy422Event.touches.length : 0;

    lsy422Sequence += 1;

    var lsy422Tip = lsy422Log.querySelector('.lsy422-log-tip');
    if (lsy422Tip) lsy422Tip.remove();

    var lsy422Line = document.createElement('p');
    lsy422Line.className = 'lsy422-log-line';
    lsy422Line.textContent = '#' + lsy422Sequence + ' ' + lsy422Name + ' · ' + lsy422Fingers + ' 指' + lsy422Point;
    lsy422Log.appendChild(lsy422Line);

    // 日志最多保留 60 条，避免长时间拖动把页面撑爆
    while (lsy422Log.children.length > 60) {
      lsy422Log.removeChild(lsy422Log.firstElementChild);
    }
    lsy422Log.scrollTop = lsy422Log.scrollHeight;
  }

  // 清空探针日志与各项计数，方便重新观察
  function lsy422ResetProbe() {
    lsy422Sequence = 0;
    lsy422CountStart.textContent = '0';
    lsy422CountMove.textContent = '0';
    lsy422CountEnd.textContent = '0';
    lsy422CountCancel.textContent = '0';
    lsy422CountClick.textContent = '0';
    lsy422Log.innerHTML = '<p class="lsy422-log-tip">等待你的第一次触摸……</p>';
    lsy422Pad.classList.remove('lsy422-active');
  }

  // 探针：手指按下，记录 touchstart
  function lsy422PadStart(e) {
    lsy422Pad.classList.add('lsy422-active');
    lsy422CountStart.textContent = Number(lsy422CountStart.textContent) + 1;
    lsy422WriteLog('touchstart', e);
  }

  // 探针：手指移动，记录 touchmove（一次拖动会连续触发很多次）
  function lsy422PadMove(e) {
    lsy422CountMove.textContent = Number(lsy422CountMove.textContent) + 1;
    lsy422WriteLog('touchmove', e);
  }

  // 探针：手指抬起，记录 touchend（之后浏览器还会补发一次 click）
  function lsy422PadEnd(e) {
    lsy422CountEnd.textContent = Number(lsy422CountEnd.textContent) + 1;
    lsy422WriteLog('touchend', e);
  }

  // 探针：触摸被电话、通知等打断时记录 touchcancel
  function lsy422PadCancel(e) {
    lsy422CountCancel.textContent = Number(lsy422CountCancel.textContent) + 1;
    lsy422WriteLog('touchcancel', e);
  }

  // 探针：记录 click，用来观察它出现在 touchend 之后
  function lsy422PadClick(e) {
    lsy422Pad.classList.remove('lsy422-active');
    lsy422CountClick.textContent = Number(lsy422CountClick.textContent) + 1;
    lsy422WriteLog('click', e);
  }

  lsy422Pad.addEventListener('touchstart', lsy422PadStart, { passive: true });
  lsy422Pad.addEventListener('touchmove', lsy422PadMove, { passive: true });
  lsy422Pad.addEventListener('touchend', lsy422PadEnd, { passive: true });
  lsy422Pad.addEventListener('touchcancel', lsy422PadCancel, { passive: true });
  lsy422Pad.addEventListener('click', lsy422PadClick);
  lsy422ClearBtn.addEventListener('click', lsy422ResetProbe);

  /* ===================== 三、任务二：滑动卡片 ===================== */

  var lsy422Viewport = document.getElementById('lsy422Viewport');
  var lsy422Track = document.getElementById('lsy422Track');
  var lsy422Dots = document.getElementById('lsy422Dots');
  var lsy422Counter = document.getElementById('lsy422Counter');
  var lsy422Toast = document.getElementById('lsy422Toast');

  var lsy422Total = 4;          // 卡片总数
  var lsy422Index = 0;          // 当前第几张（从 0 开始）
  var lsy422StartX = 0;         // 按下时的横坐标
  var lsy422StartY = 0;         // 按下时的纵坐标
  var lsy422Locked = false;     // 冷却锁，防止快速连滑一次跳两张
  var lsy422ToastTimer = null;  // 边界提示定时器

  // 根据卡片总数生成底部圆点
  function lsy422BuildDots() {
    var lsy422Html = '';
    for (var lsy422I = 0; lsy422I < lsy422Total; lsy422I++) {
      lsy422Html += '<span class="lsy422-dot"></span>';
    }
    lsy422Dots.innerHTML = lsy422Html;
  }

  // 按当前索引更新卡片位置、页码与圆点状态
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

  // 在屏幕下方弹出提示文字，1.4 秒后自动消失
  function lsy422ShowToast(lsy422Text) {
    lsy422Toast.textContent = lsy422Text;
    lsy422Toast.classList.add('lsy422-show');
    clearTimeout(lsy422ToastTimer);
    lsy422ToastTimer = setTimeout(function () {
      lsy422Toast.classList.remove('lsy422-show');
    }, 1400);
  }

  // 切换到指定卡片，越界时只提示不移动
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

  // 卡片区手指按下：记录起点，供抬手时计算位移
  function lsy422CardStart(e) {
    if (lsy422Locked) return;
    if (e.touches.length !== 1) return;
    lsy422StartX = e.touches[0].clientX;
    lsy422StartY = e.touches[0].clientY;
  }

  // 卡片区手指抬起：横向位移超过 40px 才翻卡，纵向为主则不翻
  function lsy422CardEnd(e) {
    if (lsy422Locked) return;
    if (e.changedTouches.length !== 1) return;

    var lsy422Touch = e.changedTouches[0];
    var lsy422Dx = lsy422Touch.clientX - lsy422StartX;
    var lsy422Dy = lsy422Touch.clientY - lsy422StartY;

    if (Math.abs(lsy422Dx) < 40 || Math.abs(lsy422Dx) < Math.abs(lsy422Dy)) return;

    lsy422Locked = true;
    setTimeout(function () {
      lsy422Locked = false;
    }, 300);

    lsy422GoTo(lsy422Dx < 0 ? lsy422Index + 1 : lsy422Index - 1);
  }

  // 触摸被打断时解除锁定，避免手势卡死
  function lsy422CardCancel() {
    lsy422Locked = false;
  }

  lsy422BuildDots();
  lsy422Render();
  lsy422Viewport.addEventListener('touchstart', lsy422CardStart, { passive: true });
  lsy422Viewport.addEventListener('touchend', lsy422CardEnd, { passive: true });
  lsy422Viewport.addEventListener('touchcancel', lsy422CardCancel, { passive: true });

  /* ===================== 四、任务三：图片查看器 ===================== */

  var lsy422Stage = document.getElementById('lsy422Stage');
  var lsy422Img = document.getElementById('lsy422Img');
  var lsy422ScaleText = document.getElementById('lsy422ScaleText');
  var lsy422ResetBtn = document.getElementById('lsy422ResetBtn');

  var lsy422MinScale = 1;
  var lsy422MaxScale = 4;
  var lsy422Scale = 1;
  var lsy422Tx = 0;
  var lsy422Ty = 0;

  var lsy422Mode = '';         // pinch 双指 / drag 单指
  var lsy422StartDist = 0;
  var lsy422StartScale = 1;
  var lsy422StartTx = 0;
  var lsy422StartTy = 0;
  var lsy422FocalX = 0;
  var lsy422FocalY = 0;
  var lsy422DragX = 0;
  var lsy422DragY = 0;
  var lsy422Moved = false;
  var lsy422TapTime = 0;
  var lsy422TapX = 0;
  var lsy422TapY = 0;
  var lsy422AnimTimer = null;

  // 计算两根手指之间的直线距离
  function lsy422Distance(lsy422T1, lsy422T2) {
    return Math.hypot(lsy422T2.clientX - lsy422T1.clientX, lsy422T2.clientY - lsy422T1.clientY);
  }

  // 把当前缩放与位移写到图片上，并刷新倍数文字
  function lsy422Apply(lsy422Animate) {
    lsy422Img.classList.remove('lsy422-anim');
    if (lsy422Animate) {
      void lsy422Img.offsetWidth;
      lsy422Img.classList.add('lsy422-anim');
      clearTimeout(lsy422AnimTimer);
      lsy422AnimTimer = setTimeout(function () {
        lsy422Img.classList.remove('lsy422-anim');
      }, 260);
    }
    lsy422Img.style.transform = 'translate(' + lsy422Tx + 'px,' + lsy422Ty + 'px) scale(' + lsy422Scale + ')';
    lsy422ScaleText.textContent = lsy422Scale.toFixed(2) + 'x';
  }

  // 把位移限制在图片边界内，避免拖出空白
  function lsy422ClampDelta() {
    var lsy422Rect = lsy422Stage.getBoundingClientRect();
    var lsy422MinTx = lsy422Rect.width * (1 - lsy422Scale);
    var lsy422MinTy = lsy422Rect.height * (1 - lsy422Scale);

    if (lsy422Tx > 0) lsy422Tx = 0;
    if (lsy422Tx < lsy422MinTx) lsy422Tx = lsy422MinTx;
    if (lsy422Ty > 0) lsy422Ty = 0;
    if (lsy422Ty < lsy422MinTy) lsy422Ty = lsy422MinTy;
  }

  // 以指定屏幕点为基准缩放到目标倍数，保证该点下方内容不动
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

  // 查看器手指按下：双指记录间距与中点，单指记录拖动起点
  function lsy422ZoomStart(e) {
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

  // 查看器手指移动：双指按间距比例缩放，单指且已放大时拖动
  function lsy422ZoomMove(e) {
    if (lsy422Mode === 'pinch' && e.touches.length >= 2) {
      var lsy422Dist = lsy422Distance(e.touches[0], e.touches[1]);
      var lsy422Next = lsy422StartScale * (lsy422Dist / (lsy422StartDist || lsy422Dist));

      lsy422Scale = Math.min(lsy422MaxScale, Math.max(lsy422MinScale, lsy422Next));
      // 按初始中点反推位移，避免逐帧累加造成图片漂移
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

  // 查看器手指抬起：收尾边界、双指转单指，并判断是否双击
  function lsy422ZoomEnd(e) {
    if (lsy422Mode === 'pinch') {
      lsy422ClampDelta();
      lsy422Apply(false);

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

  // 查看器触摸被打断时结束手势
  function lsy422ZoomCancel() {
    lsy422Mode = '';
    lsy422ClampDelta();
    lsy422Apply(false);
  }

  // 窗口尺寸或横竖屏变化时保留缩放倍数，只重新限制位移
  function lsy422ZoomResize() {
    if (lsy422Stage.offsetWidth === 0) return;  // 面板隐藏时跳过，避免状态被清零
    lsy422ClampDelta();
    lsy422Apply(false);
  }

  // 点击还原：回到 1x 并居中
  function lsy422ZoomReset() {
    lsy422Scale = 1;
    lsy422Tx = 0;
    lsy422Ty = 0;
    lsy422Apply(true);
  }

  lsy422Stage.addEventListener('touchstart', lsy422ZoomStart, { passive: true });
  lsy422Stage.addEventListener('touchmove', lsy422ZoomMove, { passive: false });
  lsy422Stage.addEventListener('touchend', lsy422ZoomEnd, { passive: true });
  lsy422Stage.addEventListener('touchcancel', lsy422ZoomCancel, { passive: true });
  lsy422ResetBtn.addEventListener('click', lsy422ZoomReset);
  window.addEventListener('resize', lsy422ZoomResize);
  window.addEventListener('orientationchange', lsy422ZoomResize);

  /* ===================== 五、任务四：摇一摇抽菜谱 ===================== */

  var lsy422ShakeIcon = document.getElementById('lsy422ShakeIcon');
  var lsy422Meter = document.getElementById('lsy422Meter');
  var lsy422Value = document.getElementById('lsy422Value');
  var lsy422Result = document.getElementById('lsy422Result');
  var lsy422Status = document.getElementById('lsy422Status');
  var lsy422FallbackBtn = document.getElementById('lsy422FallbackBtn');
  var lsy422PermitBtn = document.getElementById('lsy422PermitBtn');

  var lsy422Threshold = 18;    // 合成加速度阈值（三轴绝对值之和）
  var lsy422Cooldown = 1500;   // 触发后的冷却时间
  var lsy422Cooling = false;
  var lsy422HasData = false;
  var lsy422LastDish = -1;
  var lsy422Listening = false;

  // 菜谱数据：图标、名称与一句介绍
  var lsy422Dishes = [
    { emoji: '🍜', name: '兰州牛肉面', desc: '一清二白三红四绿五黄，汤清面劲。' },
    { emoji: '🥟', name: '猪肉玉米饺', desc: '薄皮大馅，蘸上醋和蒜泥最香。' },
    { emoji: '🍲', name: '番茄牛腩煲', desc: '小火慢炖两小时，汤汁拌饭一绝。' },
    { emoji: '🍚', name: '扬州炒饭', desc: '粒粒分明，虾仁火腿青豆一样不少。' },
    { emoji: '🌶️', name: '麻婆豆腐', desc: '麻辣鲜香，配白饭能吃两碗。' },
    { emoji: '🍗', name: '可乐鸡翅', desc: '甜咸挂汁，新手也很难失手。' },
    { emoji: '🥬', name: '蒜蓉西兰花', desc: '大火快炒，脆嫩清爽解腻。' },
    { emoji: '🐟', name: '清蒸鲈鱼', desc: '姜丝葱段一蒸，鲜味全在汤里。' }
  ];

  // 让手机图标抖动一下，提示已经触发抽奖
  function lsy422PlayIconAnim() {
    lsy422ShakeIcon.classList.remove('lsy422-shaking');
    void lsy422ShakeIcon.offsetWidth;
    lsy422ShakeIcon.classList.add('lsy422-shaking');
  }

  // 随机抽一道菜并渲染到结果区，带弹出动画
  function lsy422DrawDish() {
    var lsy422Pick = Math.floor(Math.random() * lsy422Dishes.length);
    if (lsy422Pick === lsy422LastDish) {
      lsy422Pick = (lsy422Pick + 1) % lsy422Dishes.length;
    }
    lsy422LastDish = lsy422Pick;

    var lsy422Item = lsy422Dishes[lsy422Pick];
    lsy422Result.innerHTML =
      '<span class="lsy422-result-emoji">' + lsy422Item.emoji + '</span>' +
      '<h2 class="lsy422-result-name">' + lsy422Item.name + '</h2>' +
      '<p class="lsy422-result-text">' + lsy422Item.desc + '</p>';

    lsy422Result.classList.remove('lsy422-pop');
    void lsy422Result.offsetWidth;
    lsy422Result.classList.add('lsy422-pop');
    lsy422PlayIconAnim();
  }

  // 执行一次抽奖，冷却期内不再重复响应
  function lsy422Trigger() {
    if (lsy422Cooling) return;
    lsy422Cooling = true;
    lsy422DrawDish();
    setTimeout(function () {
      lsy422Cooling = false;
    }, lsy422Cooldown);
  }

  // 处理 devicemotion：合成加速度超过阈值即触发抽奖
  function lsy422HandleMotion(e) {
    var lsy422Acc = e.accelerationIncludingGravity;
    if (!lsy422Acc || (lsy422Acc.x === null && lsy422Acc.y === null && lsy422Acc.z === null)) return;

    lsy422HasData = true;
    lsy422Status.classList.remove('lsy422-warn');
    lsy422Status.textContent = '传感器已就绪，摇一摇试试';

    var lsy422Sum = Math.abs(lsy422Acc.x || 0) + Math.abs(lsy422Acc.y || 0) + Math.abs(lsy422Acc.z || 0);
    lsy422Value.textContent = lsy422Sum.toFixed(1);
    lsy422Meter.style.width = Math.min(100, (lsy422Sum / lsy422Threshold) * 100) + '%';

    if (lsy422Sum > lsy422Threshold) {
      lsy422Trigger();
    }
  }

  // 绑定 devicemotion 监听（重复调用只绑定一次）
  function lsy422ListenMotion() {
    if (lsy422Listening) return;
    lsy422Listening = true;
    window.addEventListener('devicemotion', lsy422HandleMotion);
  }

  // iOS 13+ 需要用户点击后申请传感器权限
  function lsy422AskPermission() {
    if (typeof DeviceMotionEvent === 'undefined' ||
        typeof DeviceMotionEvent.requestPermission !== 'function') {
      lsy422ListenMotion();
      return;
    }

    DeviceMotionEvent.requestPermission().then(function (lsy422State) {
      if (lsy422State === 'granted') {
        lsy422PermitBtn.hidden = true;
        lsy422Status.classList.remove('lsy422-warn');
        lsy422Status.textContent = '权限已开启，摇一摇试试';
        lsy422ListenMotion();
      } else {
        lsy422Status.classList.add('lsy422-warn');
        lsy422Status.textContent = '未获得传感器权限，可以点「点我抽一次」手动抽奖。';
      }
    }).catch(function () {
      lsy422Status.classList.add('lsy422-warn');
      lsy422Status.textContent = '当前设备不支持，请用手机打开；也可以点「点我抽一次」。';
    });
  }

  // 4 秒内没有传感器数据时提示不支持，并亮出手动抽奖按钮
  function lsy422CheckSupported() {
    if (lsy422HasData) return;
    lsy422Status.classList.add('lsy422-warn');
    lsy422Status.textContent = '当前设备不支持，请用手机打开；也可以点「点我抽一次」手动抽奖。';
  }

  lsy422FallbackBtn.addEventListener('click', lsy422Trigger);
  lsy422PermitBtn.addEventListener('click', lsy422AskPermission);

  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    lsy422PermitBtn.hidden = false;
    lsy422Status.textContent = 'iOS 设备需要先点击「开启传感器权限」。';
  } else {
    lsy422ListenMotion();
  }

  setTimeout(lsy422CheckSupported, 4000);

})();
