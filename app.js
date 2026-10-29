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
      streak: 0
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
        streak: Number(parsed.streak) || 0
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

  const savedTheme = localStorage.getItem(THEME_KEY);
  const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme);
  updateDailyState();
  renderAll();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .then(() => console.info("Офлайн-режим включён."))
        .catch((error) => console.warn("Не удалось включить офлайн-режим:", error));
    });
  }
})();