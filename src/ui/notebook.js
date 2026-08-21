import { createNotebookDoodle } from "./doodles.js";

const CHAPTERS = ["land", "ocean", "rain", "life", "conclusion"];
const NOTE_PAPERS = ["#fff0a8", "#d9eef0", "#f8d9d0", "#e1edd0", "#f4e1bd", "#e5dcf2"];
const NOTE_TILTS = [-1.7, .9, -.45, 1.35, -.85, .35];

function stableNumber(value) {
  return [...String(value)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

export function createFieldNotebook({ root }) {
  const unlocked = new Set();
  const observations = new Map();
  const tabs = root.querySelector("#station-tabs");
  const notes = root.querySelector("#notebook-observations");
  const noteCount = root.querySelector("#notebook-note-count");
  let activeChapter = "land";

  function isUnlocked(id) {
    return unlocked.has(id);
  }

  function unlockChapter(id) {
    if (CHAPTERS.includes(id)) unlocked.add(id);
    if (["land", "ocean", "rain", "life"].every((chapter) => unlocked.has(chapter))) unlocked.add("conclusion");
    renderStatus();
  }

  function setChapter(id) {
    activeChapter = CHAPTERS.includes(id) ? id : "land";
    renderNotes();
  }

  function addObservation(entry) {
    if (!entry?.id || !entry.chapter || observations.has(entry.id)) return false;
    observations.set(entry.id, { ...entry, styleSeed: stableNumber(entry.id) });
    renderNotes();
    return true;
  }

  function renderStatus() {
    tabs?.querySelectorAll("[data-chapter]").forEach((tab) => {
      const id = tab.dataset.chapter;
      const collected = unlocked.has(id);
      tab.classList.toggle("is-locked", !collected);
      tab.setAttribute("aria-disabled", String(!collected));
      tab.setAttribute("aria-label", `${tab.textContent.trim()}, ${collected ? "collected" : "locked"}`);
    });
  }

  function renderNotes() {
    if (!notes) return;
    const visible = [...observations.values()].filter((entry) => entry.chapter === activeChapter);
    noteCount.textContent = `${visible.length} ${visible.length === 1 ? "note" : "notes"} for this chapter`;
    if (!visible.length) {
      notes.innerHTML = `<p class="notebook-empty">No village observation has been recorded for this chapter yet. A note appears only after someone actually shares a relevant detail.</p>`;
      return;
    }
    notes.replaceChildren(...visible.map((entry) => {
      const styleIndex = entry.styleSeed % NOTE_PAPERS.length;
      const article = document.createElement("article");
      article.className = "margin-note";
      article.style.setProperty("--note-paper", NOTE_PAPERS[styleIndex]);
      article.style.setProperty("--note-tilt", `${NOTE_TILTS[styleIndex]}deg`);
      article.style.setProperty("--tape-tilt", `${(entry.styleSeed % 9) - 4}deg`);
      const heading = document.createElement("strong");
      heading.textContent = entry.name;
      const role = document.createElement("small");
      role.textContent = entry.role;
      const copy = document.createElement("p");
      copy.textContent = entry.text;
      article.append(createNotebookDoodle(entry.kind, entry.styleSeed % 997), heading, role, copy);
      return article;
    }));
  }

  renderNotes();
  return {
    unlockChapter,
    addObservation,
    setChapter,
    isUnlocked,
    renderStatus,
    get observationCount() { return observations.size; },
  };
}
