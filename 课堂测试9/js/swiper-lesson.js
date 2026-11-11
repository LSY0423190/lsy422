// 作者：刘思媛
// 功能：大国重器光影展 —— Swiper 轮播课堂任务的实例初始化与效果切换

// 保存各演示区的 Swiper 实例，变量统一以 lsy 开头便于识别
var lsyMinimalSwiper = null;
var lsyPagerSwiper = null;
var lsyAutoSwiper = null;
var lsyEffectSwiper = null;
var lsyGallerySwiper = null;
// 当前演示四正在使用的切换效果
var lsyCurrentEffect = 'slide';
// 演示四幻灯片的原始 HTML 结构，切换效果时用于还原，避免循环克隆残留
var lsyEffectSlidesMarkup = '';
// creative 电影墙的卡片倾斜角度，由页面滑块实时调整
var lsyCreativeRotate = 26;

// 初始化演示一：最小可用轮播，不配置任何参数，也能拖动和触摸滑动
function lsyInitMinimalSwiper() {
  lsyMinimalSwiper = new Swiper('#lsySw1', {});
}

// 初始化演示二：圆点分页器可点击 + 前后箭头导航 + 无缝循环
function lsyInitPagerSwiper() {
  lsyPagerSwiper = new Swiper('#lsySw2', {
    loop: true,
    speed: 600,
    pagination: { el: '#lsyPag2', clickable: true },
    navigation: { nextEl: '#lsyNext2', prevEl: '#lsyPrev2' }
  });
}

// 初始化演示三：每 2.6 秒自动翻页，且用户手动拖动后自动播放不停止
function lsyInitAutoSwiper() {
  lsyAutoSwiper = new Swiper('#lsySw3', {
    loop: true,
    autoplay: {
      delay: 2600,
      disableOnInteraction: false
    },
    speed: 700,
    pagination: { el: '#lsyPag3', clickable: true }
  });
}

// 根据效果名称返回对应的 Swiper 效果参数（含任务二新增的 creative 电影墙）
function lsyGetEffectOptions(lsyEffect) {
  var lsyOptions = { effect: lsyEffect };

  if (lsyEffect === 'cube') {
    lsyOptions.cubeEffect = { shadow: true, slideShadows: true };
  } else if (lsyEffect === 'coverflow') {
    lsyOptions.coverflowEffect = {
      rotate: 28,
      stretch: 0,
      depth: 160,
      modifier: 1,
      slideShadows: true
    };
  } else if (lsyEffect === 'flip') {
    lsyOptions.flipEffect = { slideShadows: true, limitRotation: true };
  } else if (lsyEffect === 'cards') {
    lsyOptions.cardsEffect = {
      perSlideOffset: 8,
      perSlideRotate: 3,
      rotate: true,
      slideShadows: true
    };
  } else if (lsyEffect === 'creative') {
    // 电影墙：上一张缩小左移带角度退场，下一张放大右移反向倾斜进场
    lsyOptions.creativeEffect = {
      prev: {
        translate: ['-38%', 0, -240],
        rotate: [0, lsyCreativeRotate, 0],
        scale: 0.72,
        opacity: 0.55
      },
      next: {
        translate: ['42%', 0, -240],
        rotate: [0, -Math.round(lsyCreativeRotate * 0.7), 0],
        scale: 0.86,
        opacity: 0.55
      }
    };
  }

  return lsyOptions;
}

// 重建演示四的轮播实例并应用指定切换效果（Swiper 不支持直接热改 effect）
function lsyRenderEffectSwiper(lsyEffect) {
  var lsyWrapper = document.querySelector('#lsySw4 .swiper-wrapper');
  var lsyStartIndex = lsyEffectSwiper ? lsyEffectSwiper.realIndex : 0;

  if (lsyEffectSwiper) {
    lsyEffectSwiper.destroy(true, true);
    // 还原原始幻灯片结构，清除循环模式生成的克隆节点
    lsyWrapper.innerHTML = lsyEffectSlidesMarkup;
  }

  lsyEffectSwiper = new Swiper('#lsySw4', Object.assign({
    loop: true,
    speed: 800,
    autoplay: {
      delay: 3200,
      disableOnInteraction: false
    },
    pagination: { el: '#lsyPag4', clickable: true },
    navigation: { nextEl: '#lsyNext4', prevEl: '#lsyPrev4' }
  }, lsyGetEffectOptions(lsyEffect), { initialSlide: lsyStartIndex }));

  lsyCurrentEffect = lsyEffect;
  lsySyncEffectButtons();
}

// 同步七个效果按钮的选中状态（先清除全部，再选中当前效果）
function lsySyncEffectButtons() {
  var lsyButtons = document.querySelectorAll('.lsy-effect-btn');

  lsyButtons.forEach(function (lsyButton) {
    lsyButton.classList.remove('lsy-effect-btn--active');
  });

  lsyButtons.forEach(function (lsyButton) {
    if (lsyButton.dataset.effect === lsyCurrentEffect) {
      lsyButton.classList.add('lsy-effect-btn--active');
    }
  });
}

// 为演示四的七个效果按钮绑定点击切换事件
function lsyBindEffectButtons() {
  var lsyButtons = document.querySelectorAll('.lsy-effect-btn');

  lsyButtons.forEach(function (lsyButton) {
    lsyButton.addEventListener('click', function () {
      if (lsyButton.dataset.effect === lsyCurrentEffect) {
        return;
      }
      lsyRenderEffectSwiper(lsyButton.dataset.effect);
    });
  });
}

// 绑定 creative 角度滑块：拖动时实时改写 prev / next 的旋转角度，供答辩现场演示
function lsyBindCreativeTune() {
  var lsyRange = document.getElementById('lsyRotateRange');
  var lsyValue = document.getElementById('lsyRotateVal');

  if (!lsyRange) {
    return;
  }

  lsyRange.addEventListener('input', function () {
    lsyCreativeRotate = Number(lsyRange.value);
    lsyValue.textContent = lsyCreativeRotate;

    if (lsyCurrentEffect === 'creative' && lsyEffectSwiper) {
      lsyEffectSwiper.params.creativeEffect.prev.rotate[1] = lsyCreativeRotate;
      lsyEffectSwiper.params.creativeEffect.next.rotate[1] = -Math.round(lsyCreativeRotate * 0.7);
      lsyEffectSwiper.update();
      lsyEffectSwiper.slideTo(lsyEffectSwiper.activeIndex, 0);
    }
  });
}

// 初始化展品墙：六件展品 + 分页导航 + 键盘左右键切换（课堂未讲的超纲能力）
function lsyInitGallerySwiper() {
  lsyGallerySwiper = new Swiper('#lsyGallerySw', {
    loop: true,
    speed: 700,
    slidesPerView: 1.15,
    spaceBetween: 18,
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    pagination: { el: '#lsyGalleryPag', clickable: true },
    navigation: { nextEl: '#lsyGalleryNext', prevEl: '#lsyGalleryPrev' },
    breakpoints: {
      880: { slidesPerView: 2.15, spaceBetween: 24 }
    }
  });

  lsyBindGalleryFocus();
}

// 点击展品墙时让轮播容器获得焦点，保证方向键可以控制轮播而不是滚动页面
function lsyBindGalleryFocus() {
  var lsyGalleryEl = document.getElementById('lsyGallerySw');

  lsyGalleryEl.addEventListener('click', function () {
    lsyGalleryEl.focus();
  });
}

// 页面加载完成后统一初始化所有轮播演示
document.addEventListener('DOMContentLoaded', function () {
  // 先记录演示四的原始结构，后续切换效果时用它还原
  lsyEffectSlidesMarkup = document.querySelector('#lsySw4 .swiper-wrapper').innerHTML;

  lsyInitMinimalSwiper();
  lsyInitPagerSwiper();
  lsyInitAutoSwiper();
  lsyRenderEffectSwiper('slide');
  lsyBindEffectButtons();
  lsyBindCreativeTune();
  lsyInitGallerySwiper();
});
