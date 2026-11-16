(() => {
  "use strict";
  // Reuses the existing quiz engine and saved progress; no duplicate scoring.
  function init() {
    const daily = document.querySelector("#panel-daily");
    const start = document.querySelector("#start-quiz");
    const subject = document.querySelector("#quiz-subject");
    const level = document.querySelector("#quiz-level");
    const count = document.querySelector("#quiz-count");
    const trainingTab = document.querySelector("#nav-training");
    if (!daily || !start || !subject || !level || !count || !trainingTab || daily.querySelector(".focus-lab")) return;
    const section = document.createElement("section");
    section.className = "focus-lab";
    section.setAttribute("aria-label","Быстрая тренировка");
    section.innerHTML = '<span class="eyebrow">БЫСТРЫЙ СТАРТ</span><h3>5 задач. Одна тема за раз.</h3><p>Выбери предмет: начнётся короткая тренировка повышенной сложности. После каждой ошибки разберись с объяснением и повтори тему позже.</p><div class="focus-options"><button class="focus-choice" type="button" data-focus-subject="Русский язык">Русский</button><button class="focus-choice" type="button" data-focus-subject="Математика">Математика</button><button class="focus-choice" type="button" data-focus-subject="Информатика">Информатика</button></div><small class="focus-footnote">Используются задания существующего тренажёра. Результаты сохраняются как обычно.</small>';
    daily.querySelector(".page-intro")?.insertAdjacentElement("afterend",section);
    section.querySelectorAll("[data-focus-subject]").forEach(button => {
      button.addEventListener("click",() => {
        subject.value = button.dataset.focusSubject;
        level.value = "3";
        count.value = "5";
        [subject,level,count].forEach(el => el.dispatchEvent(new Event("change",{bubbles:true})));
        trainingTab.click();
        start.click();
      });
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
