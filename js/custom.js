(function () {
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var slider = $('slider'), track = $('track'), slides = Array.prototype.slice.call(track.children);
  var total = slides.length, idx = 0, per = 3, timer = null, paused = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var pad = function (n) { return String(n).padStart(2, '0'); };
  $('tot').textContent = pad(total);

  function perView() { return Math.min(total, parseInt(getComputedStyle(root).getPropertyValue('--per'), 10) || 3); }

  function render(announce) {
    per = perView();
    var max = total - per;
    idx = Math.max(0, Math.min(idx, max));
    track.style.transform = 'translateX(' + (-idx * 100 / per) + '%)';
    slides.forEach(function (s, i) {
      var vis = i >= idx && i < idx + per;
      if (vis) s.removeAttribute('inert'); else s.setAttribute('inert', '');
      s.setAttribute('aria-hidden', vis ? 'false' : 'true');
    });
    $('line').style.setProperty('--p', Math.min(1, (idx + per) / total));
    var cur = $('cur'), next = pad(idx + 1);
    if (cur.textContent !== next) {
      cur.textContent = next;
      if (!reduce.matches) { cur.classList.remove('tick'); void cur.offsetWidth; cur.classList.add('tick'); }
    }
    $('prev').disabled = idx === 0;
    $('next').disabled = idx === max;
    if (announce) $('live').textContent = 'Testimonial ' + (idx + 1) + ' of ' + total;
  }

  function go(i, announce) { idx = i; render(announce); }
  function step(d, announce) {
    var max = total - per;
    go(d > 0 && idx >= max ? 0 : d < 0 && idx <= 0 ? max : idx + d, announce);
  }

  $('prev').addEventListener('click', function () { go(idx - 1, true); });
  $('next').addEventListener('click', function () { go(idx + 1, true); });
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, true); }
  });

  /* Touch / pointer swipe */
  var sx = null;
  var vp = slider.querySelector('.viewport');
  vp.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  vp.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
  });
  vp.addEventListener('pointercancel', function () { sx = null; });

  /* Auto-advance: 5s, pauses on hover/focus, off for reduced motion */
  function start() {
    stop();
    if (reduce.matches || paused) return;
    timer = setInterval(function () { step(1, false); }, 5000);
  }
  function stop() { clearInterval(timer); timer = null; }
  slider.addEventListener('mouseenter', function () { paused = true; stop(); });
  slider.addEventListener('mouseleave', function () { paused = false; start(); });
  slider.addEventListener('focusin', function () { paused = true; stop(); });
  slider.addEventListener('focusout', function () { paused = false; start(); });
  reduce.addEventListener('change', start);

  /* Re-layout when breakpoint or viewport changes */
  window.addEventListener('resize', function () { render(false); });
  ['(max-width: 639px)', '(max-width: 1024px)'].forEach(function (q) { matchMedia(q).addEventListener('change', function () { render(false); }); });

  /* Theme */
  var tbtn = $('theme');
  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    tbtn.setAttribute('aria-pressed', dark);
    tbtn.textContent = dark ? 'Light mode' : 'Dark mode';
  }
  tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null; try { saved = localStorage.getItem('theme'); } catch (x) {}
    if (!saved) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); syncTheme(); }
  });

  /* Style switcher */
  var styles = [['editorial', 'Editorial'], ['modern', 'Modern'], ['technical', 'Technical']];
  var sbtn = $('style');
  function syncStyle() {
    var cur = root.getAttribute('data-style') || 'editorial';
    var i = styles.findIndex(function (s) { return s[0] === cur; });
    if (i < 0) i = 0;
    sbtn.textContent = styles[i][1];
    sbtn.setAttribute('aria-label', 'Type style: ' + styles[i][1] + '. Activate to change.');
  }
  sbtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-style') || 'editorial';
    var i = styles.findIndex(function (s) { return s[0] === cur; });
    var n = styles[(i + 1) % styles.length][0];
    root.setAttribute('data-style', n);
    try { localStorage.setItem('style', n); } catch (e) {}
    syncStyle();
  });

  syncTheme(); syncStyle(); render(false); start();
})();
