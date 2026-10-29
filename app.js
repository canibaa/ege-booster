(() => {
  "use strict";

  const STORAGE_KEY = "ege-booster-data-v1";
  const THEME_KEY = "ege-booster-theme-v1";
  const DAILY_GOAL = 5;
  const $ = (selector) => document.querySelector(selector);

  const seedTopics = [
    { id: "seed-nn", subject: "Русский язык", title: "Н и НН в причастиях", mastery: 42, errors: 0 },
    { id: "seed-systems", subject: "Информатика", title: "Системы счисления", mastery: 35, errors: 0 },
    { id: "seed-recursion", subject: "Информатика", title: "Рекурсия", mastery: 51, errors: 0 }
  ];

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function yesterdayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return localDateKey(date);
  }

  function freshData() {
    return {
      topics: seedTopics.map((topic) => ({ ...topic })),
      errors: [],
      completedToday: 0,
      lastActiveDate: "",
      streak: 0,
      quizHistory: [],
      answers: [],
      cardProgress: {}
    };
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return freshData();
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.topics) || !Array.isArray(parsed.errors)) return freshData();
      return {
        topics: parsed.topics,
        errors: parsed.errors,
        completedToday: Number(parsed.completedToday) || 0,
        lastActiveDate: parsed.lastActiveDate || "",
        streak: Number(parsed.streak) || 0,
        quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
        answers: Array.isArray(parsed.answers) ? parsed.answers : [],
        cardProgress: parsed.cardProgress && typeof parsed.cardProgress === "object" ? parsed.cardProgress : {}
      };
    } catch (error) {
      console.warn("Не удалось прочитать сохранённые данные:", error);
      return freshData();
    }
  }

  let data = loadData();
  let toastTimer;

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      showToast("Не получилось сохранить данные на устройстве.");
      console.error("Ошибка localStorage:", error);
    }
  }

  function updateDailyState() {
    const today = localDateKey();
    if (data.lastActiveDate !== today) {
      data.completedToday = 0;
      if (data.lastActiveDate === yesterdayKey()) {
        data.streak = Math.max(1, data.streak + 1);
      } else if (!data.lastActiveDate) {
        data.streak = 1;
      } else {
        data.streak = 1;
      }
      data.lastActiveDate = today;
      saveData();
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function getBoss() {
    if (!data.topics.length) return null;
    return [...data.topics].sort((a, b) => Number(a.mastery) - Number(b.mastery))[0];
  }

  function renderTopics() {
    const list = $("#topic-list");
    const suggestions = $("#topic-suggestions");
    const sorted = [...data.topics].sort((a, b) => Number(a.mastery) - Number(b.mastery));
    $("#topic-count").textContent = data.topics.length + (data.topics.length === 1 ? " тема" : data.topics.length >= 2 && data.topics.length <= 4 ? " темы" : " тем");

    if (!sorted.length) {
      list.innerHTML = '<div class="topic-card"><div class="topic-main"><h3>Пока нет тем</h3><div class="topic-meta">Добавь ошибку ниже, чтобы создать первую тему.</div></div></div>';
    } else {
      list.innerHTML = sorted.map((topic) => {
        const mastery = clamp(topic.mastery);
        const symbol = topic.subject === "Русский язык" ? "А" : topic.subject === "Математика" ? "∑" : "⌘";
        return `<article class="topic-card">
          <div class="topic-symbol" aria-hidden="true">${symbol}</div>
          <div class="topic-main">
            <h3>${escapeHtml(topic.title)}</h3>
            <div class="topic-meta"><span>${escapeHtml(topic.subject)}</span><span>·</span><span>${Number(topic.errors) || 0} ошибок</span></div>
            <div class="topic-mini-track" aria-label="Освоение темы ${mastery}%"><span style="width:${mastery}%"></span></div>
          </div>
          <span class="topic-percent">${mastery}%</span>
          <button class="delete-topic" type="button" data-delete-topic="${escapeHtml(topic.id)}" aria-label="Удалить тему ${escapeHtml(topic.title)}" title="Удалить тему">×</button>
        </article>`;
      }).join("");
    }

    suggestions.innerHTML = data.topics.map((topic) => `<option value="${escapeHtml(topic.title)}"></option>`).join("");
    renderBoss();
  }

  function clamp(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 0;
  }

  function renderBoss() {
    const boss = getBoss();
    if (!boss) {
      $("#boss-subject").textContent = "Добавь первую тему";
      $("#boss-topic").textContent = "Босс ещё не появился";
      $("#boss-percent").textContent = "—";
      $("#boss-progress-fill").style.width = "0%";
      $("#boss-level").textContent = "Ур. —";
      $("#boss-note").textContent = "Сохрани ошибку в форме ниже — она станет темой для повторения.";
      $("#fight-boss").disabled = true;
      $("#fight-boss").style.opacity = ".55";
      return;
    }
    const mastery = clamp(boss.mastery);
    $("#boss-subject").textContent = boss.subject;
    $("#boss-topic").textContent = boss.title;
    $("#boss-percent").textContent = mastery + "%";
    $("#boss-progress-fill").style.width = mastery + "%";
    $("#boss-level").textContent = "Ур. " + Math.max(1, Math.ceil((100 - mastery) / 20));
    $("#boss-note").textContent = mastery < 40
      ? "Эта тема требует внимания. Разбери одну ошибку и возвращайся к ней завтра."
      : "Повторяй тему и фиксируй ошибки — так освоение будет расти.";
    $("#fight-boss").disabled = false;
    $("#fight-boss").style.opacity = "1";
  }

  function renderDaily() {
    const completed = Math.min(DAILY_GOAL, Math.max(0, data.completedToday));
    $("#daily-progress-fill").style.width = (completed / DAILY_GOAL * 100) + "%";
    $("#daily-progress-text").textContent = completed + " из " + DAILY_GOAL;
    $("#streak-count").textContent = data.streak || 1;
    $("#complete-task").textContent = completed >= DAILY_GOAL ? "Цель на сегодня выполнена ✓" : "Отметить занятие ↗";
    $("#complete-task").disabled = completed >= DAILY_GOAL;
    $("#complete-task").style.opacity = completed >= DAILY_GOAL ? ".65" : "1";
  }

  function renderErrors() {
    const section = $("#recent-errors-section");
    const container = $("#recent-errors");
    if (!data.errors.length) {
      section.hidden = true;
      container.innerHTML = "";
      return;
    }
    section.hidden = false;
    container.innerHTML = [...data.errors].reverse().map((error) => {
      const details = [
        error.task ? "Задание №" + escapeHtml(error.task) : "",
        escapeHtml(error.reason || ""),
        error.comment ? escapeHtml(error.comment) : ""
      ].filter(Boolean).join(" · ");
      return `<article class="error-entry">
        <div class="error-entry-content">
          <strong>${escapeHtml(error.topic)} <span style="font-weight:500;color:var(--muted)">· ${escapeHtml(error.subject)}</span></strong>
          <p>${details || "Ошибка сохранена для повторения."}</p>
          <small>${escapeHtml(error.date || "")}</small>
        </div>
        <button class="delete-error" type="button" data-delete-error="${escapeHtml(error.id || "")}" aria-label="Убрать ошибку ${escapeHtml(error.topic)}">Убрать</button>
      </article>`;
    }).join("");
  }

  function renderAll() {
    renderTopics();
    renderDaily();
    renderErrors();
    renderProgress();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setTab(tabName) {
    document.querySelectorAll(".nav-item").forEach((button) => {
      const active = button.dataset.tab === tabName;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const active = panel.id === "panel-" + tabName;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    $("#theme-toggle").textContent = dark ? "☼" : "◐";
    $("#theme-toggle").setAttribute("aria-label", dark ? "Включить светлую тему" : "Включить тёмную тему");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = dark ? "#11131a" : "#f4f5f8";
  }

  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  $("#complete-task").addEventListener("click", () => {
    if (data.completedToday >= DAILY_GOAL) return;
    data.completedToday += 1;
    saveData();
    renderDaily();
    showToast(data.completedToday >= DAILY_GOAL ? "Отлично! Цель на сегодня выполнена." : "Занятие отмечено. Продолжай!");
  });

  $("#fight-boss").addEventListener("click", () => {
    const boss = getBoss();
    if (!boss) return;
    $("#error-subject").value = boss.subject;
    $("#error-topic").value = boss.title;
    $("#error-task").focus();
    $("#error-form").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Запиши ошибку по теме «" + boss.title + "» — начни с этого босса.");
  });

  $("#recent-errors").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-error]");
    if (!button) return;
    const errorIndex = data.errors.findIndex((item) => String(item.id || "") === button.dataset.deleteError);
    if (errorIndex < 0) return;
    const error = data.errors[errorIndex];
    if (!window.confirm("Убрать запись об ошибке «" + error.topic + "»?")) return;

    const linkedTopic = data.topics.find((topic) =>
      (error.topicId && topic.id === error.topicId) ||
      (!error.topicId && topic.subject === error.subject && topic.title.toLocaleLowerCase("ru") === String(error.topic).toLocaleLowerCase("ru"))
    );
    if (linkedTopic) {
      if (error.createdTopic && linkedTopic.errors <= 1) {
        data.topics = data.topics.filter((topic) => topic.id !== linkedTopic.id);
      } else {
        linkedTopic.mastery = Math.min(100, clamp(linkedTopic.mastery) + 5);
        linkedTopic.errors = Math.max(0, (Number(linkedTopic.errors) || 0) - 1);
      }
    }
    data.errors.splice(errorIndex, 1);
    saveData();
    renderAll();
    showToast("Запись убрана.");
  });

  $("#topic-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-topic]");
    if (!button) return;
    const topic = data.topics.find((item) => item.id === button.dataset.deleteTopic);
    if (!topic) return;
    if (!window.confirm("Удалить тему «" + topic.title + "»? Записи ошибок в журнале останутся.")) return;
    data.topics = data.topics.filter((item) => item.id !== topic.id);
    saveData();
    renderAll();
    showToast("Тема удалена.");
  });

  $("#error-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const subject = $("#error-subject").value;
    const title = $("#error-topic").value.trim();
    if (!title) {
      $("#error-topic").focus();
      return;
    }
    let existing = data.topics.find((topic) => topic.title.toLocaleLowerCase("ru") === title.toLocaleLowerCase("ru") && topic.subject === subject);
    let createdTopic = false;
    if (existing) {
      existing.mastery = Math.max(0, clamp(existing.mastery) - 5);
      existing.errors = (Number(existing.errors) || 0) + 1;
    } else {
      existing = {
        id: "topic-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
        subject,
        title,
        mastery: 45,
        errors: 1
      };
      data.topics.push(existing);
      createdTopic = true;
    }

    data.errors.push({
      id: "error-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      topicId: existing.id,
      createdTopic,
      subject,
      topic: title,
      task: $("#error-task").value.trim(),
      reason: $("#error-reason").value,
      comment: $("#error-comment").value.trim(),
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    });
    if (data.errors.length > 100) data.errors = data.errors.slice(-100);
    saveData();
    renderAll();
    $("#error-topic").value = "";
    $("#error-task").value = "";
    $("#error-comment").value = "";
    showToast("Ошибка сохранена. Прогресс темы обновлён.");
  });


  const questionBank = [
    {id:"i1",subject:"Информатика",topic:"Системы счисления",q:"Переведи 1011₂ в десятичную систему.",options:["9","11","13","10"],answer:1,explain:"1·8 + 0·4 + 1·2 + 1·1 = 11."},
    {id:"i2",subject:"Информатика",topic:"Системы счисления",q:"Как записать 13₁₀ в двоичной системе?",options:["1011","1101","1110","1001"],answer:1,explain:"13 = 8 + 4 + 1, поэтому запись — 1101₂."},
    {id:"i3",subject:"Информатика",topic:"Системы счисления",q:"Сколько цифр используется в восьмеричной системе?",options:["2","8","10","16"],answer:1,explain:"Цифры от 0 до 7 — всего восемь."},
    {id:"i4",subject:"Информатика",topic:"Python",q:"Что выведет print(7 // 2)?",options:["3.5","4","3","1"],answer:2,explain:"Оператор // выполняет деление с округлением вниз: результат 3."},
    {id:"i5",subject:"Информатика",topic:"Python",q:"Какой тип данных у значения True?",options:["str","bool","int","list"],answer:1,explain:"True и False — логические значения типа bool."},
    {id:"i6",subject:"Информатика",topic:"Логика",q:"Чему равно (True and False) or True?",options:["True","False","Ошибка","None"],answer:0,explain:"True and False даёт False; False or True даёт True."},
    {id:"i7",subject:"Информатика",topic:"Рекурсия",q:"Что обязательно нужно рекурсивной функции?",options:["Глобальная переменная","Базовый случай остановки","Цикл for","Файл"],answer:1,explain:"Базовый случай завершает рекурсивные вызовы."},
    {id:"i8",subject:"Информатика",topic:"Алгоритмы",q:"Сложность линейного поиска в худшем случае?",options:["O(1)","O(log n)","O(n)","O(n²)"],answer:2,explain:"В худшем случае проверяется каждый элемент — O(n)."},
    {id:"i9",subject:"Информатика",topic:"Файлы",q:"Какой режим open() используют для чтения файла?",options:["'w'","'r'","'a'","'x'"],answer:1,explain:"Режим 'r' открывает файл для чтения."},
    {id:"i10",subject:"Информатика",topic:"Алгоритмы",q:"Что делает оператор % в Python?",options:["Делит без остатка","Возвращает остаток от деления","Возводит в степень","Округляет"],answer:1,explain:"Например, 10 % 3 равно 1."},
    {id:"r1",subject:"Русский язык",topic:"Н и НН",q:"В каком слове пишется НН?",options:["крашеная стена","решённая задача","юный спортсмен","ветреный день"],answer:1,explain:"«Решённая» — полное страдательное причастие, пишется НН."},
    {id:"r2",subject:"Русский язык",topic:"Н и НН",q:"Выбери верное написание: «краше…ая стена» (нет приставки и зависимых слов).",options:["крашенная","крашеная","крашенно","крашённая"],answer:1,explain:"«Крашеная» — отглагольное прилагательное без приставки и зависимых слов, одна Н."},
    {id:"r3",subject:"Русский язык",topic:"Орфография",q:"В каком слове приставка ПРЕ- означает «очень»?",options:["пришить","приоткрыть","преинтересный","прибыть"],answer:2,explain:"Преинтересный = очень интересный."},
    {id:"r4",subject:"Русский язык",topic:"Пунктуация",q:"Где нужна запятая: «Когда стемнело мы вернулись домой»?",options:["После «Когда»","После «стемнело»","После «вернулись»","Не нужна"],answer:1,explain:"Придаточная часть отделяется запятой: Когда стемнело, мы вернулись домой."},
    {id:"r5",subject:"Русский язык",topic:"Грамматические нормы",q:"Выбери нормативный вариант.",options:["ихний дом","более лучше","пять килограммов","согласно приказа"],answer:2,explain:"Правильно «пять килограммов» и «согласно приказу»."},
    {id:"r6",subject:"Русский язык",topic:"Средства выразительности",q:"Перенос значения по сходству — это…",options:["Метонимия","Метафора","Эпитет","Гипербола"],answer:1,explain:"Метафора основана на сходстве: «золотые руки»."},
    {id:"r7",subject:"Русский язык",topic:"Типы речи",q:"Какой тип речи передаёт последовательность событий?",options:["Описание","Рассуждение","Повествование","Определение"],answer:2,explain:"Повествование отвечает на вопрос: что произошло?" },
    {id:"r8",subject:"Русский язык",topic:"Сложное предложение",q:"Какое предложение сложносочинённое?",options:["Когда пришёл дождь, мы ушли.","Солнце село, и стало прохладно.","Я знаю, что ты прав.","Уставший путник сел."],answer:1,explain:"Две основы соединены сочинительным союзом «и»."},
    {id:"r9",subject:"Русский язык",topic:"Лексика",q:"Что такое антонимы?",options:["Слова с противоположными значениями","Слова с одинаковым звучанием","Синонимы","Устойчивые сочетания"],answer:0,explain:"Например: высокий — низкий."},
    {id:"r10",subject:"Русский язык",topic:"Орфография",q:"В каком слове пишется приставка РАС-?",options:["ра..будить","ра..писать","ра..жечь","ра..дать"],answer:1,explain:"Перед глухим согласным П пишется приставка РАС-: расписать."},
    {id:"m1",subject:"Математика",topic:"Производная",q:"Найди производную f(x) = x³.",options:["x²","3x²","3x","x⁴/4"],answer:1,explain:"(xⁿ)' = n·xⁿ⁻¹, значит (x³)' = 3x²."},
    {id:"m2",subject:"Математика",topic:"Уравнения",q:"Реши: 3x − 7 = 11.",options:["4","6","−6","18"],answer:1,explain:"3x = 18, значит x = 6."},
    {id:"m3",subject:"Математика",topic:"Вероятность",q:"В коробке 3 красных и 2 синих шара. Вероятность достать красный?",options:["2/5","3/5","1/2","3/2"],answer:1,explain:"Три благоприятных исхода из пяти: 3/5."},
    {id:"m4",subject:"Математика",topic:"Геометрия",q:"Сумма углов треугольника равна…",options:["90°","180°","270°","360°"],answer:1,explain:"Сумма внутренних углов треугольника — 180°."},
    {id:"m5",subject:"Математика",topic:"Векторы",q:"a = (2; 3), b = (4; −1). Чему равно a + b?",options:["(6; 2)","(2; 4)","(8; −3)","(−2; 4)"],answer:0,explain:"Складываем координаты: (2+4; 3−1) = (6; 2)."},
    {id:"m6",subject:"Математика",topic:"Степени",q:"Упрости: a³ · a⁴.",options:["a¹²","a","a⁷","2a⁷"],answer:2,explain:"При умножении степеней с одним основанием показатели складываются."},
    {id:"m7",subject:"Математика",topic:"Логарифмы",q:"Чему равен log₂ 8?",options:["2","3","4","8"],answer:1,explain:"2³ = 8, поэтому log₂ 8 = 3."},
    {id:"m8",subject:"Математика",topic:"Тригонометрия",q:"Чему равно sin 30°?",options:["0","1/2","√2/2","1"],answer:1,explain:"sin 30° = 1/2."},
    {id:"m9",subject:"Математика",topic:"Неравенства",q:"Реши: 2x < 10.",options:["x < 5","x > 5","x < 10","x > 10"],answer:0,explain:"Делим на положительное число 2: x < 5."},
    {id:"m10",subject:"Математика",topic:"Функции",q:"График y = x² — это…",options:["Прямая","Гипербола","Парабола","Окружность"],answer:2,explain:"График квадратичной функции y = x² — парабола."}
  ];
  const flashcards = [
    {id:"fc1",subject:"Информатика",topic:"Системы счисления",front:"Как перевести двоичное число в десятичное?",back:"Умножить каждую цифру на соответствующую степень 2, начиная справа со степени 0, и сложить результаты."},
    {id:"fc2",subject:"Информатика",topic:"Python",front:"Чем отличаются / и // в Python?",back:"/ — обычное деление; // — деление с округлением вниз."},
    {id:"fc3",subject:"Информатика",topic:"Python",front:"Что такое список в Python?",back:"Изменяемая упорядоченная коллекция. Пример: [1, 2, 3]."},
    {id:"fc4",subject:"Информатика",topic:"Рекурсия",front:"Что такое рекурсия?",back:"Функция вызывает саму себя. Нужен базовый случай остановки."},
    {id:"fc5",subject:"Информатика",topic:"Сложность алгоритмов",front:"Что означает O(n)?",back:"Линейный рост числа операций относительно размера входных данных n."},
    {id:"fc6",subject:"Русский язык",topic:"Н и НН",front:"Как различать Н и НН в причастиях?",back:"В полных страдательных причастиях обычно НН. Учитывай приставки, зависимые слова, вид глагола и исключения."},
    {id:"fc7",subject:"Русский язык",topic:"Пунктуация",front:"Как отделяется придаточная часть?",back:"В сложноподчинённом предложении придаточная часть обычно отделяется запятой: Когда стемнело, мы ушли."},
    {id:"fc8",subject:"Русский язык",topic:"Лексика",front:"Что такое метафора?",back:"Перенос значения по сходству: например, «море огней»."},
    {id:"fc9",subject:"Математика",topic:"Производная",front:"Формула производной xⁿ?",back:"(xⁿ)' = n·xⁿ⁻¹. Например, (x⁴)' = 4x³."},
    {id:"fc10",subject:"Математика",topic:"Векторы",front:"Как сложить векторы по координатам?",back:"Сложить соответствующие координаты: (a₁; a₂)+(b₁; b₂)=(a₁+b₁; a₂+b₂)."},
    {id:"fc11",subject:"Математика",topic:"Вероятность",front:"Формула классической вероятности?",back:"P(A) = число благоприятных исходов / число всех равновозможных исходов."},
    {id:"fc12",subject:"Математика",topic:"Степени",front:"Что происходит с показателями при умножении aᵐ · aⁿ?",back:"Показатели складываются: aᵐ · aⁿ = aᵐ⁺ⁿ."},
    {id:"fc13",subject:"Математика",topic:"Логарифмы",front:"Что означает logₐ b = c?",back:"Это означает aᶜ = b при a > 0, a ≠ 1, b > 0."},
    {id:"fc14",subject:"Информатика",topic:"Логика",front:"Когда A and B истинно?",back:"Только когда оба выражения — A и B — истинны."},
    {id:"fc15",subject:"Русский язык",topic:"Типы речи",front:"Три основных типа речи?",back:"Повествование — события; описание — признаки; рассуждение — тезис, аргументы, вывод."},
    {id:"fc16",subject:"Информатика",topic:"Алгоритмы",front:"Что такое линейный поиск?",back:"Последовательная проверка элементов до нахождения нужного или до конца коллекции."}
  ];
  let activeQuiz = null, activeQuestionIndex = 0, activeQuizAnswers = [], currentCardId = null, cardOffset = 0;

  function shuffle(items) {
    const result = [...items];
    for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
    return result;
  }
  function renderQuizHistory() {
    const el=$("#quiz-history"); if (!el) return;
    const history=(data.quizHistory||[]).slice(0,5);
    el.innerHTML=history.length?history.map((item)=>'<article class="history-row"><div><strong>'+escapeHtml(item.subject||"Все предметы")+'</strong><small>'+escapeHtml(item.date||"")+' · '+item.total+' заданий</small></div><b>'+item.score+'/'+item.total+'</b></article>').join(""):'<div class="empty-state">Здесь появятся результаты первых тренировок.</div>';
  }
  function startQuiz() {
    const subject=$("#quiz-subject").value, countValue=$("#quiz-count").value;
    let available=questionBank.filter((q)=>subject==="all"||q.subject===subject);
    available=shuffle(available);
    const count=countValue==="all"?available.length:Math.min(Number(countValue),available.length);
    activeQuiz=available.slice(0,count); activeQuestionIndex=0; activeQuizAnswers=[];
    $("#quiz-summary").innerHTML='<span>Тренировка началась</span><strong>'+activeQuiz.length+' заданий · '+escapeHtml(subject==="all"?"Все предметы":subject)+'</strong>';
    $("#start-quiz").textContent="Начать заново ↻"; renderQuestion();
  }
  function renderQuestion() {
    const area=$("#quiz-area");
    if (!activeQuiz||!activeQuiz.length) { area.innerHTML='<div class="empty-state">Для этого фильтра пока нет заданий.</div>'; return; }
    if (activeQuestionIndex>=activeQuiz.length) { finishQuiz(); return; }
    const q=activeQuiz[activeQuestionIndex], answered=activeQuizAnswers[activeQuestionIndex], progress=activeQuestionIndex/activeQuiz.length*100;
    let options="";
    q.options.forEach((option,i)=>{
      let state="";
      if (answered) state=i===q.answer?" correct":(i===answered.choice&&!answered.correct?" incorrect":"");
      options+='<button type="button" class="answer-option'+state+'" data-answer="'+i+'" '+(answered?"disabled":"")+'><span class="option-letter">'+String.fromCharCode(65+i)+'</span><span>'+escapeHtml(option)+'</span>'+(answered&&i===q.answer?'<b>✓</b>':"")+'</button>';
    });
    let feedback=answered?'<div class="answer-feedback '+(answered.correct?"feedback-correct":"feedback-wrong")+'"><strong>'+(answered.correct?"Верно!":"Пока неверно")+'</strong><p>'+escapeHtml(q.explain)+'</p></div><button class="primary-button next-question" id="next-question" type="button">'+(activeQuestionIndex===activeQuiz.length-1?"Завершить тренировку":"Следующее задание")+" →</button>":'<p class="question-hint">Выбери один вариант ответа.</p>';
    area.innerHTML='<article class="question-card"><div class="question-top"><span class="question-subject">'+escapeHtml(q.subject)+'</span><span class="question-number">'+(activeQuestionIndex+1)+' / '+activeQuiz.length+'</span></div><div class="quiz-progress"><span style="width:'+progress+'%"></span></div><p class="question-topic">'+escapeHtml(q.topic)+'</p><h3>'+escapeHtml(q.q)+'</h3><div class="answer-options">'+options+'</div>'+feedback+'</article>';
  }
  function chooseAnswer(choice) {
    if (!activeQuiz||activeQuizAnswers[activeQuestionIndex]) return;
    const q=activeQuiz[activeQuestionIndex], correct=choice===q.answer;
    activeQuizAnswers[activeQuestionIndex]={choice,correct};
    data.answers.push({id:q.id,subject:q.subject,topic:q.topic,correct,date:localDateKey()});
    if (data.answers.length>1000) data.answers=data.answers.slice(-1000);
    let topic=data.topics.find((item)=>item.subject===q.subject&&item.title.toLocaleLowerCase("ru")===q.topic.toLocaleLowerCase("ru"));
    if (!topic) { topic={id:"practice-"+q.id,subject:q.subject,title:q.topic,mastery:correct?55:40,errors:correct?0:1}; data.topics.push(topic); }
    else { topic.mastery=clamp(topic.mastery+(correct?2:-3)); if (!correct) topic.errors=(Number(topic.errors)||0)+1; }
    if (!correct) {
      data.errors.push({id:"quiz-error-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6),topicId:topic.id,createdTopic:false,subject:q.subject,topic:q.topic,task:"",reason:"Ошибка в тренировке",comment:q.q+" Правильный ответ: "+q.options[q.answer],date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"})});
      if (data.errors.length>100) data.errors=data.errors.slice(-100);
    }
    saveData(); renderTopics(); renderErrors(); renderQuestion();
  }
  function finishQuiz() {
    const total=activeQuiz.length, score=activeQuizAnswers.filter((a)=>a&&a.correct).length;
    const subject=$("#quiz-subject").value==="all"?"Все предметы":$("#quiz-subject").value;
    data.quizHistory.unshift({date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"short"}),subject,total,score});
    data.quizHistory=data.quizHistory.slice(0,50); data.completedToday=Math.min(DAILY_GOAL,data.completedToday+1);
    saveData(); renderDaily(); renderTopics(); renderErrors(); renderProgress(); renderQuizHistory();
    $("#quiz-summary").innerHTML='<span>Тренировка завершена</span><strong>'+score+' из '+total+' · '+Math.round(score/Math.max(1,total)*100)+'% правильных</strong>';
    $("#quiz-area").innerHTML='<div class="result-card"><div class="result-mark">'+(score===total?"★":score/total>=.7?"✓":"↗")+'</div><p class="eyebrow">ТВОЙ РЕЗУЛЬТАТ</p><h3>'+score+' из '+total+'</h3><div class="result-track"><span style="width:'+(score/Math.max(1,total)*100)+'%"></span></div><p>'+(score===total?"Отлично. Все ответы правильные.":score/total>=.7?"Хороший результат. Разбери оставшиеся ошибки.":"Это точка отсчёта. Открой журнал ошибок и повтори сложные темы.")+'</p><button class="primary-button" id="review-mistakes" type="button">Повторить ошибки →</button></div>';
    activeQuiz=null; showToast("Результат сохранён в разделе «Прогресс».");
  }
  function renderProgress() {
    if (!$("#stat-answered")) return;
    const answers=data.answers||[], correct=answers.filter((a)=>a.correct).length;
    $("#stat-answered").textContent=answers.length;
    $("#stat-accuracy").textContent=answers.length?Math.round(correct/answers.length*100)+"%":"—";
    $("#stat-quizzes").textContent=(data.quizHistory||[]).length;
    $("#stat-cards").textContent=Object.values(data.cardProgress||{}).filter((p)=>p.known).length;
    $("#subject-stats").innerHTML=["Информатика","Русский язык","Математика"].map((subject)=>{
      const list=answers.filter((a)=>a.subject===subject), n=list.filter((a)=>a.correct).length, pct=list.length?Math.round(n/list.length*100):0;
      return '<article class="subject-stat"><div><strong>'+subject+'</strong><span>'+(list.length?n+" из "+list.length+" верно":"Пока нет ответов")+'</span></div><b>'+(list.length?pct+"%":"—")+'</b><div class="subject-track"><span style="width:'+pct+'%"></span></div></article>';
    }).join("");
    const topics=[...data.topics].sort((a,b)=>clamp(a.mastery)-clamp(b.mastery));
    $("#progress-topics").innerHTML=topics.length?topics.map((topic)=>'<article class="progress-topic"><div><strong>'+escapeHtml(topic.title)+'</strong><small>'+escapeHtml(topic.subject)+' · '+(Number(topic.errors)||0)+' ошибок</small></div><b>'+clamp(topic.mastery)+'%</b><div class="subject-track"><span style="width:'+clamp(topic.mastery)+'%"></span></div></article>').join(""):'<div class="empty-state">Пока нет тем для повторения.</div>';
  }
  function renderCard() {
    const wrap=$("#flashcard-wrap"); if (!wrap) return;
    const subject=$("#cards-subject").value, mode=$("#cards-mode").value;
    let cards=flashcards.filter((card)=>subject==="all"||card.subject===subject);
    if (mode==="new") cards=cards.filter((card)=>!data.cardProgress[card.id]||!data.cardProgress[card.id].seen);
    if (mode==="due") cards=cards.filter((card)=>!data.cardProgress[card.id]||!data.cardProgress[card.id].due||data.cardProgress[card.id].due<=localDateKey());
    if (mode==="all" && cards.length) { const offset=cardOffset%cards.length; cards=cards.slice(offset).concat(cards.slice(0,offset)); }
    if (!cards.length) {
      currentCardId=null; wrap.innerHTML='<div class="flashcard empty-card"><span class="soft-label">Колода пройдена</span><h3>'+(mode==="due"?"На сегодня всё!":"Карточек нет")+'</h3><p>'+(mode==="due"?'Можно выбрать режим «Все карточки».':"Выбери другой предмет или режим.")+'</p></div>';
      $("#flashcard-actions").hidden=true; updateCardCounter(); return;
    }
    const card=cards[0]; currentCardId=card.id;
    wrap.innerHTML='<article class="flashcard" id="active-flashcard"><div class="flashcard-top"><span>'+escapeHtml(card.subject)+'</span><span>'+escapeHtml(card.topic)+'</span></div><p class="eyebrow">'+(data.cardProgress[card.id]&&data.cardProgress[card.id].seen?"ПОВТОРЕНИЕ":"НОВАЯ КАРТОЧКА")+'</p><h3>'+escapeHtml(card.front)+'</h3><div class="flashcard-answer" id="flashcard-answer" hidden><div class="answer-divider"></div><p>'+escapeHtml(card.back)+'</p></div><div class="flashcard-bottom"><span>Нажми «Показать ответ»</span><span>'+cards.length+' в очереди</span></div></article>';
    $("#flashcard-actions").hidden=false; $("#reveal-card").hidden=false; $("#rating-actions").hidden=true; updateCardCounter();
  }
  function updateCardCounter() {
    const values=Object.values(data.cardProgress||{}), known=values.filter((p)=>p.known).length, seen=values.filter((p)=>p.seen).length;
    $("#card-counter").textContent="Изучено: "+seen+" · Знаю: "+known+" из "+flashcards.length;
  }
  function rateCard(known) {
    if (!currentCardId) return;
    const previous=data.cardProgress[currentCardId]||{}, days=known?Math.min(30,Math.max(1,(previous.interval||0)+1)):0, due=new Date();
    due.setDate(due.getDate()+days);
    data.cardProgress[currentCardId]={seen:true,known:known,interval:days,due:localDateKey(due)};
    if ($("#cards-mode").value==="all") cardOffset+=1;
    saveData(); renderProgress(); renderCard(); showToast(known?"Карточка отмечена как знакомая.":"Карточка вернётся в повторение.");
  }
  function exportData() {
    const blob=new Blob([JSON.stringify({app:"ege-booster",version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob), link=document.createElement("a");
    link.href=url; link.download="ege-booster-backup-"+localDateKey()+".json"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); showToast("Резервная копия подготовлена.");
  }
  async function importData(file) {
    try {
      const parsed=JSON.parse(await file.text()), imported=parsed&&parsed.data?parsed.data:parsed;
      if (!imported||!Array.isArray(imported.topics)||!Array.isArray(imported.errors)) throw new Error("Неверный формат");
      if (!window.confirm("Импорт заменит текущие темы, журнал и результаты данными из файла. Продолжить?")) return;
      data={topics:imported.topics,errors:imported.errors,completedToday:Number(imported.completedToday)||0,lastActiveDate:imported.lastActiveDate||"",streak:Number(imported.streak)||0,quizHistory:Array.isArray(imported.quizHistory)?imported.quizHistory:[],answers:Array.isArray(imported.answers)?imported.answers:[],cardProgress:imported.cardProgress&&typeof imported.cardProgress==="object"?imported.cardProgress:{}};
      saveData(); renderAll(); renderQuizHistory(); renderCard(); renderProgress(); showToast("Данные импортированы.");
    } catch(error) { showToast("Не удалось импортировать файл резервной копии."); }
    finally { $("#import-data").value=""; }
  }
  $("#start-quiz").addEventListener("click",startQuiz);
  $("#quiz-area").addEventListener("click",(event)=>{
    const answer=event.target.closest("[data-answer]");
    if(answer) chooseAnswer(Number(answer.dataset.answer));
    if(event.target.closest("#next-question")) { activeQuestionIndex+=1; renderQuestion(); }
    if(event.target.closest("#review-mistakes")) { setTab("weak"); $("#recent-errors-section").scrollIntoView({behavior:"smooth",block:"start"}); }
  });
  $("#cards-subject").addEventListener("change",renderCard);
  $("#cards-mode").addEventListener("change",renderCard);
  $("#reveal-card").addEventListener("click",()=>{
    $("#flashcard-answer").hidden=false; $("#reveal-card").hidden=true; $("#rating-actions").hidden=false;
    const hint=$("#active-flashcard .flashcard-bottom span"); if(hint) hint.textContent="Оцени, насколько хорошо вспомнил";
  });
  $("#rate-again").addEventListener("click",()=>rateCard(false));
  $("#rate-known").addEventListener("click",()=>rateCard(true));
  $("#export-data").addEventListener("click",exportData);
  $("#import-data").addEventListener("change",(event)=>{const file=event.target.files&&event.target.files[0];if(file)importData(file);});


  const savedTheme = localStorage.getItem(THEME_KEY);
  const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme);
  updateDailyState();
  renderAll();
  renderQuizHistory();
  renderCard();
  renderProgress();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .then(() => console.info("Офлайн-режим включён."))
        .catch((error) => console.warn("Не удалось включить офлайн-режим:", error));
    });
  }
})();