export function createMusicController({ button }) {
  const audio = new Audio("assets/audio/calm-track-loop.ogg");
  audio.loop = true;
  audio.preload = "none";
  audio.volume = .28;
  let enabled = false;

  function updateButton() {
    button.textContent = enabled ? "♫" : "♪";
    button.setAttribute("aria-label", enabled ? "turn music off" : "turn music on");
    button.setAttribute("aria-pressed", String(enabled));
    button.classList.toggle("is-on", enabled);
  }

  async function toggle() {
    if (audio.paused) {
      try {
        await audio.play();
        enabled = true;
      } catch {
        enabled = false;
      }
    } else {
      audio.pause();
      enabled = false;
    }
    updateButton();
  }

  button.addEventListener("click", toggle);
  updateButton();

  return {
    toggle,
    stop() {
      audio.pause();
      enabled = false;
      updateButton();
    },
  };
}
