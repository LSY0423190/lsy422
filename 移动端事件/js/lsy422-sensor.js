// 作者：刘思媛 —— 任务四：摇一摇抽菜谱（devicemotion + 权限 + 降级）
(function () {
  var lsy422Icon = document.getElementById('lsy422ShakeIcon');
  var lsy422Meter = document.getElementById('lsy422Meter');
  var lsy422Value = document.getElementById('lsy422Value');
  var lsy422Result = document.getElementById('lsy422Result');
  var lsy422Status = document.getElementById('lsy422Status');
  var lsy422FallbackBtn = document.getElementById('lsy422FallbackBtn');
  var lsy422PermitBtn = document.getElementById('lsy422PermitBtn');

  var lsy422Threshold = 18;      // 合成加速度阈值（三轴绝对值之和）
  var lsy422Cooldown = 1500;     // 触发后的冷却时间，避免一次摇动重复抽奖
  var lsy422Cooling = false;     // 是否处于冷却期
  var lsy422HasData = false;     // 是否收到过传感器数据
  var lsy422LastDish = -1;       // 上一次抽到的菜，避免连续重复
  var lsy422Listening = false;   // 是否已经绑定 devicemotion 监听

  // 菜谱数据：名称、图标与一句介绍
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
    lsy422Icon.classList.remove('lsy422-shaking');
    void lsy422Icon.offsetWidth;
    lsy422Icon.classList.add('lsy422-shaking');
  }

  // 随机抽取一道菜并渲染到结果区，带弹出动画
  function lsy422DrawDish() {
    var lsy422Index = Math.floor(Math.random() * lsy422Dishes.length);
    if (lsy422Index === lsy422LastDish) {
      lsy422Index = (lsy422Index + 1) % lsy422Dishes.length;
    }
    lsy422LastDish = lsy422Index;

    var lsy422Item = lsy422Dishes[lsy422Index];
    lsy422Result.innerHTML =
      '<span class="lsy422-result-emoji">' + lsy422Item.emoji + '</span>' +
      '<h2 class="lsy422-result-name">' + lsy422Item.name + '</h2>' +
      '<p class="lsy422-result-text">' + lsy422Item.desc + '</p>';

    lsy422Result.classList.remove('lsy422-pop');
    void lsy422Result.offsetWidth;
    lsy422Result.classList.add('lsy422-pop');
    lsy422PlayIconAnim();
  }

  // 执行一次抽奖：进入冷却期，冷却结束前不再响应摇动
  function lsy422Trigger() {
    if (lsy422Cooling) return;
    lsy422Cooling = true;
    lsy422DrawDish();
    setTimeout(function () {
      lsy422Cooling = false;
    }, lsy422Cooldown);
  }

  // 处理 devicemotion：计算合成加速度，超过阈值即触发抽奖
  function lsy422HandleMotion(e) {
    var lsy422Acc = e.accelerationIncludingGravity;
    if (!lsy422Acc || (lsy422Acc.x === null && lsy422Acc.y === null && lsy422Acc.z === null)) return;

    lsy422HasData = true;
    lsy422Status.classList.remove('lsy422-warn');
    lsy422Status.textContent = '传感器已就绪，摇一摇试试';

    var lsy422Total = Math.abs(lsy422Acc.x || 0) + Math.abs(lsy422Acc.y || 0) + Math.abs(lsy422Acc.z || 0);
    lsy422Value.textContent = lsy422Total.toFixed(1);
    lsy422Meter.style.width = Math.min(100, (lsy422Total / lsy422Threshold) * 100) + '%';

    if (lsy422Total > lsy422Threshold) {
      lsy422Trigger();
    }
  }

  // 开始监听 devicemotion 事件（重复调用只绑定一次）
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

  // 4 秒内没有收到传感器数据时，提示设备不支持并亮出降级按钮
  function lsy422CheckSupported() {
    if (lsy422HasData) return;
    lsy422Status.classList.add('lsy422-warn');
    lsy422Status.textContent = '当前设备不支持，请用手机打开；也可以点「点我抽一次」手动抽奖。';
  }

  lsy422FallbackBtn.addEventListener('click', lsy422Trigger);
  lsy422PermitBtn.addEventListener('click', lsy422AskPermission);

  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS 需要先点击按钮授权，不能自动监听
    lsy422PermitBtn.hidden = false;
    lsy422Status.textContent = 'iOS 设备需要先点击「开启传感器权限」。';
  } else {
    lsy422ListenMotion();
  }

  setTimeout(lsy422CheckSupported, 4000);
})();
