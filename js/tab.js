// 初始化指定容器内的 Tab 选项卡：为按钮绑定点击监听，实现选中切换，可在页面中复用于多组选项卡
function initTabs(containerSelector) {
  var container = document.querySelector(containerSelector);
  if (!container) return;

  var btns = container.querySelectorAll('.tab-btn');
  var panels = container.querySelectorAll('.tab-panel');

  btns.forEach(function (btn) {
    // 监听选项卡按钮点击事件：先清除所有选项卡的选中状态，再设置当前元素的选中状态
    btn.addEventListener('click', function () {
      // 清除所有按钮与面板的选中状态
      btns.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });

      // 设置当前按钮及其对应面板为选中状态
      btn.classList.add('active');
      var target = document.getElementById(btn.getAttribute('data-target'));
      if (target) target.classList.add('active');
    });
  });
}
