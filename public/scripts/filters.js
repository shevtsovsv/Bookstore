// Простой фильтр для каталога: слушаем изменения radio и показываем/скрываем карточки
(function(){
  // feature-detect :has (для информации) — если нет, добавим класс .no-has чтобы CSS показывал все
  try {
    var supportsHas = CSS && typeof CSS.supports === 'function' && CSS.supports('selector(:has(*))');
  } catch(e) {
    var supportsHas = false;
  }
  if(!supportsHas){
    document.documentElement.classList.add('no-has');
  }

  var genreRadios = document.querySelectorAll('input[name="genre"]');
  var priceRadios = document.querySelectorAll('input[name="price"]');
  var authorRadios = document.querySelectorAll('input[name="author"]');

  function getCheckedValue(radios){
    for(var i=0;i<radios.length;i++) if(radios[i].checked) return radios[i].value;
    return 'all';
  }

  
  function applyFilters(){
    var g = getCheckedValue(genreRadios);
    var p = getCheckedValue(priceRadios);
    var a = getCheckedValue(authorRadios);

    var cards = document.querySelectorAll('#books-container .book-card');
    cards.forEach(function(card){
      var ok = true;
      if(g !== 'all' && !card.classList.contains(g)) ok = false;
      if(p !== 'all'){
        if(p === 'low' && !card.classList.contains('price-low')) ok = false;
        if(p === 'high' && !card.classList.contains('price-high')) ok = false;
      }
      if(a !== 'all' && !card.classList.contains(a)) ok = false;
      card.style.setProperty('display', ok ? 'flex' : 'none', 'important');
    });
  }

  [genreRadios, priceRadios, authorRadios].forEach(function(group){
    group.forEach(function(r){ r.addEventListener('change', applyFilters); });
  });

  // initial
  document.addEventListener('DOMContentLoaded', applyFilters);
})();
