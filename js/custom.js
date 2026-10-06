$(function () {
  // ----- cache elements -----
  const $accordion = $('#mainAccordion');
  const $items = $accordion.find('.accordion-item');

  // ----- helper: close a single item (with animation) -----
  function closeItem($item) {
    $item.removeClass('active')
         .find('.accordion-trigger')
         .attr('aria-expanded', 'false');
    $item.find('.accordion-panel').css('max-height', 0);
  }

  // ----- helper: open a single item (with animation) -----
  function openItem($item) {
    const $panel = $item.find('.accordion-panel');
    $item.addClass('active')
         .find('.accordion-trigger')
         .attr('aria-expanded', 'true');
    // set max-height to scrollHeight for smooth expansion
    $panel.css('max-height', $panel[0].scrollHeight + 'px');
  }

  // ----- event delegation: click on any trigger -----
  $accordion.on('click', '.accordion-trigger', function (e) {
    e.preventDefault();

    const $trigger = $(this);
    const $currentItem = $trigger.closest('.accordion-item');
    const isActive = $currentItem.hasClass('active');

    // if the clicked item is already open, close it
    if (isActive) {
      closeItem($currentItem);
      return;
    }

    // otherwise: close every open item, then open the clicked one
    $items.each(function () {
      const $item = $(this);
      if ($item.hasClass('active')) {
        closeItem($item);
      }
    });

    openItem($currentItem);
  });

  // ----- ensure all panels are closed on page load -----
  $items.each(function () {
    const $item = $(this);
    $item.removeClass('active');
    $item.find('.accordion-trigger').attr('aria-expanded', 'false');
    $item.find('.accordion-panel').css('max-height', 0);
  });

  // ----- handle window resize: recalc max-height of active panel -----
  let resizeTimer;
  $(window).on('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const $activeItem = $accordion.find('.accordion-item.active');
      if ($activeItem.length) {
        const $panel = $activeItem.find('.accordion-panel');
        // only adjust if panel exists and has content
        if ($panel.length && $panel[0].scrollHeight > 0) {
          $panel.css('max-height', $panel[0].scrollHeight + 'px');
        }
      }
    }, 100);
  });

  // optional: open first item by default (uncomment if desired)
  // if ($items.length) {
  //   openItem($items.first());
  // }
});
