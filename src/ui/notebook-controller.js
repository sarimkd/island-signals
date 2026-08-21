export function createNotebookController({
  THREE,
  dom,
  STATIONS,
  CONCLUSION,
  notebook,
  visited,
  regions,
  METRICS,
  territories,
  DATA,
  CLIMATE,
  renderHorizontalBarChart,
  renderNotebookDetail,
  showLayer,
  startDialogue
}) {
  let selectedStation = "land";
  let selectedMetric = "landTemp";
  let selectedRegion = "All";
  let selectedTerritory = "Fiji";
  let selectedNotebookPage = 0;
  let guidedNotebookItem = null;
  let notebookZoom = 1.1;
  let pageTurnTimer = 0;
  let revealHoldStartedAt = 0;
  let revealHoldFrame = 0;

  function resetRevealHold() {
    cancelAnimationFrame(revealHoldFrame);
    revealHoldFrame = 0;
    revealHoldStartedAt = 0;
    dom.notebookRevealControl.classList.remove("is-holding");
    dom.notebookRevealControl.style.setProperty("--hold-progress", 0);
  }
  
  function revealFullNotebook() {
    resetRevealHold();
    STATIONS.forEach((station) => {
      visited.add(station.id);
      notebook.unlockChapter(station.id);
    });
    selectedNotebookPage = 0;
    selectedRegion = "All";
    selectedStation = "land";
    selectedMetric = "landTemp";
    updateProgress();
    openAtlas("land");
  }
  
  function updateRevealHold(time) {
    if (!revealHoldStartedAt) return;
    const progress = THREE.MathUtils.clamp((time - revealHoldStartedAt) / 5000, 0, 1);
    dom.notebookRevealControl.style.setProperty("--hold-progress", progress.toFixed(3));
    if (progress >= 1) {
      revealFullNotebook();
      return;
    }
    revealHoldFrame = requestAnimationFrame(updateRevealHold);
  }
  
  function startRevealHold() {
    if (revealHoldStartedAt || notebook.isUnlocked("conclusion") || !dom.atlas.classList.contains("is-visible")) return;
    revealHoldStartedAt = performance.now();
    dom.notebookRevealControl.classList.add("is-holding");
    revealHoldFrame = requestAnimationFrame(updateRevealHold);
  }
  
  function openAtlas(stationId = "land", options = {}) {
    const stationChanged = selectedStation !== stationId;
    const chapterChanged = dom.atlas.classList.contains("is-visible") && stationChanged;
    if (chapterChanged && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.clearTimeout(pageTurnTimer);
      dom.notebookCard.classList.remove("is-page-turning");
      void dom.notebookCard.offsetWidth;
      dom.notebookCard.classList.add("is-page-turning");
      pageTurnTimer = window.setTimeout(() => dom.notebookCard.classList.remove("is-page-turning"), 740);
    }
    selectedStation = stationId;
    guidedNotebookItem = options.guidedBy || null;
    if (stationChanged || options.guidedBy) selectedNotebookPage = 0;
    if (chapterChanged) {
      const spread = dom.notebookCard.querySelector(".atlas-layout");
      if (spread) spread.scrollTop = 0;
    }
    const station = STATIONS.find((item) => item.id === stationId);
    if (station && options.unlock) {
      selectedMetric = station.metrics[0];
      visited.add(station.id);
      notebook.unlockChapter(station.id);
      updateProgress();
      playGuideGesture(station.id);
    } else if (station) {
      selectedMetric = station.metrics[0];
    }
    dom.termDefinition.hidden = true;
    showLayer(dom.welcome, false);
    showLayer(dom.help, false);
    showLayer(dom.credits, false);
    showLayer(dom.atlas, true);
    dom.atlas.style.setProperty("--chapter-ink", station?.color || "#2f7768");
    renderAtlas();
  }
  
  function closeAtlas() {
    resetRevealHold();
    showLayer(dom.atlas, false);
    dom.tooltip.hidden = true;
    guidedNotebookItem = null;
  }
  
  function updateProgress() {
    dom.progressCount.textContent = `${visited.size} of 4 records`;
    dom.questCopy.textContent = visited.size === STATIONS.length ? "return to professor piko" : "find the four field guides";
    [...dom.progressDots.children].forEach((dot) => dot.classList.toggle("is-visited", visited.has(dot.dataset.station)));
  }
  
  function renderAtlas() {
    const station = STATIONS.find((item) => item.id === selectedStation) || CONCLUSION;
    const lockSymbols = { land: "☀", ocean: "≈", rain: "☂", life: "❧", conclusion: "✦" };
    renderStationTabs();
    notebook.setChapter(station.id);
    const collected = notebook.isUnlocked(station.id);
    dom.atlasKicker.textContent = station.guide
      ? `${collected ? "collected" : "locked"} · ${station.guide}`
      : `${collected ? "completed" : "locked"} conclusion`;
    dom.atlasTitle.textContent = station.title;
    dom.notebookRevealControl.hidden = notebook.isUnlocked("conclusion");
    dom.notebookLock.dataset.chapter = station.id;
    dom.lockDoodleSymbol.textContent = lockSymbols[station.id];
    dom.notebookCard.classList.toggle("is-locked-chapter", !collected);
    dom.notebookLock.hidden = collected;
    if (!collected) {
      dom.notebookLockTitle.textContent = station.guide ? `find ${station.guide.toLowerCase()}` : "collect all four records";
      dom.notebookLockCopy.textContent = station.guide
        ? `Talk to the ${station.role} in the village to open this chapter.`
        : "The conclusion opens after all four field guides have shared their records.";
      return;
    }
    const isConclusion = station.id === "conclusion";
    dom.notebookPageNav.hidden = false;
    dom.termButton.hidden = isConclusion;
    dom.filterRow.hidden = isConclusion || selectedNotebookPage === 0;
    dom.territoryBlock.hidden = isConclusion || selectedNotebookPage === 0;
    dom.chartHead.hidden = isConclusion || selectedNotebookPage === 0;
    dom.chartFrame.hidden = isConclusion || selectedNotebookPage === 0;
    dom.evidenceWriteup.hidden = isConclusion || selectedNotebookPage !== 0;
    dom.conclusion.hidden = !isConclusion;
  
    if (isConclusion) {
      renderPageNavigation(station);
      renderLeftPage(station);
      renderConclusion(selectedNotebookPage);
      return;
    }
  
    renderPageNavigation(station);
  
    dom.metricFilterWrap.hidden = station.metrics.length < 2;
    const availableTerritories = filteredTerritories();
    if (!availableTerritories.includes(selectedTerritory)) selectedTerritory = availableTerritories[0];
    renderRegionTabs();
    renderMetricTabs(station);
    renderTerritoryTabs();
    renderLeftPage(station);
    if (selectedNotebookPage === 0) renderEvidenceWriteup(station);
    else renderChart();
  }
  
  function renderStationTabs() {
    const items = [...STATIONS, CONCLUSION];
    dom.stationTabs.replaceChildren(...items.map((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `station-tab${selectedStation === station.id ? " is-active" : ""}`;
      button.dataset.chapter = station.id;
      const open = notebook.isUnlocked(station.id);
      button.innerHTML = `<span class="station-tab-index">${open ? (station.id === "conclusion" ? "✓" : index + 1) : "⌁"}</span><span><strong>${station.short}</strong><small>${station.title}</small></span><span class="station-tab-check">${open ? "●" : ""}</span>`;
      button.addEventListener("click", () => openAtlas(station.id));
      return button;
    }));
    notebook.renderStatus();
  }
  
  function renderRegionTabs() {
    dom.regionTabs.replaceChildren(...regions.map((region) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-pill${selectedRegion === region ? " is-active" : ""}`;
      button.textContent = region;
      button.addEventListener("click", () => {
        selectedRegion = region;
        const filtered = filteredTerritories();
        if (!filtered.includes(selectedTerritory)) selectedTerritory = filtered[0];
        renderAtlas();
      });
      return button;
    }));
  }
  
  function renderMetricTabs(station) {
    dom.metricTabs.replaceChildren(...station.metrics.map((metricId) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `filter-pill${selectedMetric === metricId ? " is-active" : ""}`;
      button.textContent = METRICS[metricId].label;
      button.addEventListener("click", () => {
        selectedMetric = metricId;
        const available = filteredTerritories();
        if (!available.includes(selectedTerritory)) selectedTerritory = available[0];
        renderAtlas();
      });
      return button;
    }));
  }
  
  function renderTerritoryTabs() {
    const available = filteredTerritories();
    dom.territoryTabs.replaceChildren(...available.map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `territory-tab${selectedTerritory === name ? " is-active" : ""}`;
      button.textContent = name;
      button.title = name;
      button.addEventListener("click", () => {
        selectedTerritory = name;
        renderAtlas();
      });
      return button;
    }));
    requestAnimationFrame(() => {
      dom.territoryTabs.querySelector(".is-active")?.scrollIntoView({ block: "nearest", inline: "center" });
      updateTerritoryScrollButtons();
    });
  }
  
  function updateTerritoryScrollButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = dom.territoryTabs;
    dom.territoryPrev.disabled = scrollLeft <= 2;
    dom.territoryNext.disabled = scrollLeft + clientWidth >= scrollWidth - 2;
  }
  
  function filteredTerritories() {
    const metric = METRICS[selectedMetric];
    return territories.filter((name) => {
      const inRegion = selectedRegion === "All" || DATA.subregion[name] === selectedRegion;
      return inRegion && Number.isFinite(metric?.value(name));
    });
  }
  
  function renderLeftPage(station) {
    dom.villageNotes.hidden = selectedNotebookPage !== 0;
    dom.leftPageHighlights.replaceChildren();
  
    if (station.id === "conclusion") {
      const conclusionLeftPages = [
        {
          label: "the main question",
          lead: "What is shared across the Pacific, and what remains local?",
          copy: "The answer comes from comparing directions without blending the measures. Land and ocean align across observed territories. Rainfall divides. Biodiversity risk adds a separate broad pattern.",
          highlights: [["shared", "land and ocean direction"], ["local", "rainfall direction"], ["separate", "biodiversity-risk pattern"]],
        },
        {
          label: "how the answer was built",
          lead: "Agreement, disagreement and a separate warning",
          copy: "The four chapters play different roles. The first two establish regional agreement, rainfall tests where that agreement ends, and the life chapter widens the final picture without combining scales.",
          highlights: [["22 / 22", "land upward"], ["21 / 21", "both ocean measures upward"], ["15 / 7", "rainfall split"]],
        },
        {
          label: "what the comparison means",
          lead: "Coordinate the shared work. Design the local work.",
          copy: "Regional monitoring can follow the common physical direction. Territory planning still needs its own rainfall, exposure, infrastructure and ecological detail.",
          highlights: [["one region", "shared monitoring"], ["many places", "different water decisions"], ["four records", "kept visible"]],
        },
      ];
      const page = conclusionLeftPages[selectedNotebookPage];
      dom.leftPageLabel.textContent = page.label;
      dom.stationLead.textContent = page.lead;
      dom.stationExplanation.textContent = page.copy;
      dom.leftPageHighlights.innerHTML = page.highlights.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
      return;
    }
  
    const metric = METRICS[selectedMetric];
    if (selectedNotebookPage === 0) {
      dom.leftPageLabel.textContent = "the chapter question";
      dom.stationLead.textContent = station.evidence.question;
      dom.stationExplanation.textContent = station.evidence.paragraphs.join(" ");
      dom.leftPageHighlights.innerHTML = station.evidence.highlights.slice(0, 2).map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
      dom.termName.textContent = station.term;
      dom.termDefinition.textContent = station.definition;
      return;
    }
  
    if (selectedNotebookPage === 1) {
      const regionalGuides = {
        land: "Every bar sits to the right of zero. Read that shared direction first; the differences in bar length show the range of fitted rates.",
        ocean: selectedMetric === "sst"
          ? "Every observed sea-surface-temperature bar points upward. Compare the spread of rates while keeping the shared direction in view."
          : "Every observed sea-level bar points upward. The bars show millimetres per year, so read them separately from ocean temperature.",
        rain: "The bars occupy both sides of zero. Blue marks upward fitted trends and ochre marks downward fitted trends. The split is the central result.",
        life: "Values below zero mark a lower 2024 endpoint than in 1993. Read the direction and count first, then compare the size of each endpoint change.",
      };
      const rows = filteredTerritories();
      dom.leftPageLabel.textContent = "how to read the regional page";
      dom.stationLead.textContent = metric.title;
      dom.stationExplanation.textContent = `${regionalGuides[station.id]} The current view includes ${rows.length} ${rows.length === 1 ? "territory" : "territories"}.`;
      dom.leftPageHighlights.innerHTML = `<div><strong>${rows.length}</strong><span>territories shown</span></div><div><strong>${selectedRegion}</strong><span>current regional view</span></div>`;
    } else {
      const value = metric.value(selectedTerritory);
      const formatted = Number.isFinite(value) ? metric.format(value) : "not shown";
      dom.leftPageLabel.textContent = "how to read one territory";
      dom.stationLead.textContent = `${selectedTerritory}: ${metric.label}`;
      dom.stationExplanation.textContent = station.id === "land"
        ? "The selected territory is labelled on the Pacific-centred view. Use its value for comparison; the schematic island marks do not represent land area."
        : "Follow the selected territory across time, then return to the regional page to see whether its direction matches or differs from the wider pattern.";
      dom.leftPageHighlights.innerHTML = `<div><strong>${formatted}</strong><span>${metric.unit}</span></div><div><strong>${DATA.subregion[selectedTerritory]}</strong><span>subregion</span></div>`;
    }
  
    dom.termName.textContent = selectedMetric === "redlist" ? "Endpoint change" : "Fitted trend";
    dom.termDefinition.textContent = selectedMetric === "redlist"
      ? "The 2024 Red List Index value minus the 1993 value. A negative result means the later endpoint is lower."
      : "The slope of a straight line fitted through the observations. It summarises average direction and rate over the stated period.";
  }
  
  function renderChart() {
    const metric = METRICS[selectedMetric];
    const rows = filteredTerritories()
      .map((name) => ({ name, value: metric.value(name) }))
      .filter((row) => Number.isFinite(row.value))
      .sort((a, b) => b.value - a.value);
  
    const selectTerritory = (name) => {
      selectedTerritory = name;
      renderAtlas();
    };
    if (selectedNotebookPage === 1) {
      renderHorizontalBarChart({ dom, metric, rows, selectedTerritory, onSelect: selectTerritory });
    } else {
      renderNotebookDetail({ dom, stationId: selectedStation, metric, selectedTerritory, territories: filteredTerritories(), data: DATA, climate: CLIMATE, onSelect: selectTerritory });
    }
  }
  
  function animatePageTurn() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearTimeout(pageTurnTimer);
    dom.notebookCard.classList.remove("is-page-turning");
    void dom.notebookCard.offsetWidth;
    dom.notebookCard.classList.add("is-page-turning");
    pageTurnTimer = window.setTimeout(() => dom.notebookCard.classList.remove("is-page-turning"), 740);
  }
  
  function renderPageNavigation(station) {
    const chapterIndex = STATIONS.findIndex((item) => item.id === station.id);
    const resolvedIndex = chapterIndex < 0 ? STATIONS.length : chapterIndex;
    const firstPage = 2 + resolvedIndex * 6 + selectedNotebookPage * 2;
    const labels = station.id === "conclusion"
      ? ["the answer", "evidence together", "what follows"]
      : ["field briefing", "regional evidence", "island record"];
    dom.notebookPageLabel.textContent = labels[selectedNotebookPage];
    dom.notebookPageNumbers.textContent = `pages ${firstPage} and ${firstPage + 1}`;
    dom.notebookPagePrev.disabled = selectedNotebookPage === 0;
    dom.notebookPageNext.disabled = selectedNotebookPage === 2 && !guidedNotebookItem;
    dom.notebookPageNext.setAttribute("aria-label", selectedNotebookPage === 2 && guidedNotebookItem ? "Continue conversation with field guide" : "Next notebook spread");
  }
  
  function renderEvidenceWriteup(station) {
    const highlights = station.evidence.highlights.map(([value, label]) => `<li><mark>${value}</mark><span>${label}</span></li>`).join("");
    dom.evidenceWriteup.innerHTML = `
      <p class="evidence-kicker">answer at a glance</p>
      <p class="evidence-question">${station.lead}</p>
      <p>The chapter begins with these three reference points. Turn the page to see the full regional comparison, then inspect one territory more closely.</p>
      <ul class="evidence-highlights">${highlights}</ul>
      <p class="evidence-direction">regional pattern next →</p>`;
    dom.chartNote.textContent = "";
  }
  
  function renderConclusion(page = 0) {
    const spreads = [
      `<p class="conclusion-kicker">the answer</p>
       <h3>A shared physical direction, not one uniform island story</h3>
       <p>The main question was simple: which changes are shared across Pacific territories, and which need local answers?</p>
       <p>Land temperature provides the clearest shared direction, with 22 of 22 fitted trends pointing upward. The ocean agrees: all 21 observed sea-surface-temperature trends and all 21 sea-level trends also point upward.</p>
       <p>Rainfall breaks that uniformity. Fifteen trends point upward and seven point downward. The Red List Index adds another broad but separate pattern, with 20 of 22 territories ending lower in 2024 than in 1993.</p>
       <blockquote>The Pacific picture is connected, but it is not interchangeable.</blockquote>`,
      `<p class="conclusion-kicker">the comparison</p>
       <h3>Four records answer different parts of the question</h3>
       <dl class="signal-ledger">
         <div><dt>Land</dt><dd><strong>22 of 22 upward.</strong> This is the strongest region-wide agreement in the notebook.</dd></div>
         <div><dt>Ocean</dt><dd><strong>21 of 21 upward in both measures.</strong> Sea heat and sea level align in direction while keeping different units and periods.</dd></div>
         <div><dt>Rain</dt><dd><strong>15 up, 7 down.</strong> The split is the result. A single Pacific rainfall direction would erase it.</dd></div>
         <div><dt>Life</dt><dd><strong>20 of 22 lower.</strong> The endpoint comparison shows a widespread pattern in biodiversity risk beside the physical records.</dd></div>
       </dl>
       <p>These measures should meet in the conclusion, not in one combined score. Their directions can be compared without pretending their scales mean the same thing.</p>`,
      `<p class="conclusion-kicker">the decision</p>
       <h3>Coordinate the shared work. Design the local work.</h3>
       <p>The region-wide land and ocean directions support shared monitoring, common heat-preparedness knowledge and coordinated coastal planning.</p>
       <p>Rainfall requires territory-level decisions. An upward trend and a downward trend lead planners toward different water, drainage and storage questions.</p>
       <p>Biodiversity risk deserves its own continuing record beside climate monitoring, with the same territory detail rather than one regional average.</p>
       <p>The next useful step is to connect each territory's trends with local exposure, infrastructure and ecological monitoring while keeping the original measures visible.</p>
       <p class="conclusion-final">The answer is not one Pacific average. It is one shared direction with many local decisions.</p>`,
    ];
    dom.conclusion.innerHTML = `<article class="conclusion-spread">${spreads[page]}</article>`;
    dom.chartNote.textContent = page === 1 ? "Measures are compared by direction and interpretation, not added together." : "";
  }

  dom.notebookPagePrev.addEventListener("click", () => {
    if (selectedNotebookPage === 0) return;
    selectedNotebookPage -= 1;
    animatePageTurn();
    renderAtlas();
  });
  dom.notebookPageNext.addEventListener("click", () => {
    if (selectedNotebookPage === 2) {
      if (!guidedNotebookItem) return;
      const item = guidedNotebookItem;
      const station = item.station;
      closeAtlas();
      window.setTimeout(() => startDialogue(item, station.followUp, false, () => {}), 180);
      return;
    }
    selectedNotebookPage += 1;
    animatePageTurn();
    renderAtlas();
  });
  function updateNotebookZoom(delta) {
    notebookZoom = THREE.MathUtils.clamp(Math.round((notebookZoom + delta) * 10) / 10, .9, 1.3);
    dom.notebookCard.style.setProperty("--notebook-zoom", notebookZoom);
    dom.notebookZoomLabel.value = `${Math.round(notebookZoom * 100)}%`;
    dom.notebookZoomOut.disabled = notebookZoom <= .9;
    dom.notebookZoomIn.disabled = notebookZoom >= 1.3;
  }
  dom.notebookZoomOut.addEventListener("click", () => updateNotebookZoom(-.1));
  dom.notebookZoomIn.addEventListener("click", () => updateNotebookZoom(.1));
  document.querySelector("#atlas-close").addEventListener("click", closeAtlas);
  document.querySelector("#notebook-lock-close").addEventListener("click", closeAtlas);
  dom.termButton.addEventListener("click", () => { dom.termDefinition.hidden = !dom.termDefinition.hidden; });
  dom.territoryPrev.addEventListener("click", () => dom.territoryTabs.scrollBy({ left: -Math.max(220, dom.territoryTabs.clientWidth * .72), behavior: "smooth" }));
  dom.territoryNext.addEventListener("click", () => dom.territoryTabs.scrollBy({ left: Math.max(220, dom.territoryTabs.clientWidth * .72), behavior: "smooth" }));
  dom.territoryTabs.addEventListener("scroll", updateTerritoryScrollButtons, { passive: true });
  updateNotebookZoom(0);

  return {
    open: openAtlas,
    close: closeAtlas,
    resetRevealHold,
    startRevealHold,
    updateProgress,
    isOpen: () => dom.atlas.classList.contains("is-visible"),
    getSelectedStation: () => selectedStation,
  };
}
