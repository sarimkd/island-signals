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
  WATER_STORY,
  WASTEWATER_STORY,
  renderHorizontalBarChart,
  renderNotebookDetail,
  showLayer,
  startDialogue,
  playGuideGesture
}) {
  let selectedStation = "ocean";
  let selectedMetric = "sst";
  let selectedRegion = "All";
  let selectedTerritory = "Fiji";
  let selectedNotebookPage = 0;
  let guidedNotebookItem = null;
  let missionComplete = false;
  let notebookZoom = 1.1;
  let pageTurnTimer = 0;
  let revealHoldStartedAt = 0;
  let revealHoldFrame = 0;
  const compactNotebook = window.matchMedia("(max-width: 900px)");

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
    selectedStation = "ocean";
    selectedMetric = "sst";
    updateProgress();
    openAtlas("ocean");
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
  
  function startRevealHold(startedAt = performance.now()) {
    if (revealHoldStartedAt || notebook.isUnlocked("conclusion") || !dom.atlas.classList.contains("is-visible")) return;
    revealHoldStartedAt = startedAt;
    dom.notebookRevealControl.classList.add("is-holding");
    revealHoldFrame = requestAnimationFrame(updateRevealHold);
  }
  
  function openAtlas(stationId = "ocean", options = {}) {
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
    if (stationChanged || options.guidedBy) selectedNotebookPage = Number.isInteger(options.page) ? options.page : 0;
    if (Number.isInteger(options.page)) selectedNotebookPage = THREE.MathUtils.clamp(options.page, 0, 2);
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
    dom.questCopy.textContent = missionComplete
      ? "investigation complete · read the freshwater conclusion"
      : visited.size === STATIONS.length ? "return to professor piko with the freshwater answer" : "trace pressure, supply, access and observation";
    [...dom.progressDots.children].forEach((dot) => dot.classList.toggle("is-visited", visited.has(dot.dataset.station)));
  }
  
  function renderAtlas() {
    const station = STATIONS.find((item) => item.id === selectedStation) || CONCLUSION;
    const lockSymbols = { ocean: "≈", rain: "☂", water: "◉", observations: "⌖", conclusion: "✦" };
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
          label: "the freshwater question",
          lead: "What must Pacific islands know to protect freshwater as the ocean warms and rises?",
          copy: "The surrounding ocean gives a shared warning. The freshwater picture is more fragile: rain differs, access is unequal and the formal observing network is uneven.",
          highlights: [["21 / 21", "ocean trends upward"], ["15 / 7", "rainfall directions"], ["48% to 100%", "safe-water access"]],
        },
        {
          label: "the evidence chain",
          lead: "Pressure. Supply. Access. Observation.",
          copy: "Ocean heat and sea level establish the shared pressure. Rainfall describes an uneven source. Drinking-water access reveals unequal starting conditions. Station counts show uneven formal observation.",
          highlights: [["21 / 21", "both ocean measures"], ["19", "water-access records"], ["18", "station records"]],
        },
        {
          label: "what the evidence supports",
          lead: "Freshwater security is only as strong as its weakest link.",
          copy: "Protection requires local rainfall evidence, safe and reliable services, storage and groundwater knowledge, and observations that continue long enough to warn people what is changing.",
          highlights: [["shared", "ocean pressure"], ["unequal", "safe-water access"], ["uneven", "formal observation"]],
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
        ocean: selectedMetric === "sst"
          ? "Every observed sea-surface-temperature bar points upward. Read the agreement first, but do not treat different trend sizes as a ranking of local impact."
          : "Every observed sea-level bar points upward. The values are millimetres per year and do not measure local exposure, flooding or damage.",
        rain: selectedMetric === "rain"
          ? "The bars sit on both sides of zero: 15 fitted trends point upward and seven point downward. This split is lost in a single regional average."
          : "Higher values mean wider annual swings around the long-run rainfall record. They do not mean that a territory is wetter overall.",
        water: selectedMetric === "safeWater"
          ? "This is a common 2020 comparison of the population using safely managed drinking-water services. It describes access, not a climate effect."
          : "This view shows nine territory reports from 2024 on domestic wastewater safely treated. It is a water-quality signal, not a complete Pacific ranking.",
        observations: "These are raw counts of WMO-compliant fixed land stations in 2026. The count does not account for territory size, island dispersion or whether a network is sufficient.",
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
      dom.stationExplanation.textContent = metric.detail === "map"
        ? "The selected territory is labelled on the Pacific-centred view. Use its value for comparison; the schematic island marks do not represent land area."
        : "Follow the selected territory across time, then return to the regional page to see whether its direction matches or differs from the wider pattern.";
      dom.leftPageHighlights.innerHTML = `<div><strong>${formatted}</strong><span>${metric.unit}</span></div><div><strong>${DATA.subregion[selectedTerritory]}</strong><span>subregion</span></div>`;
    }
  
    const terms = {
      safeWater: ["Safely managed drinking water", "Drinking water from an improved source that is accessible on premises, available when needed and free from priority contamination."],
      wastewater: ["Wastewater safely treated", "The share of reported domestic wastewater that is treated safely before it returns to the environment. Nine territory reports from 2024 are shown here."],
      stations: ["Compliant fixed land station", "A fixed land climate-observation station counted by the official indicator as complying with World Meteorological Organization standards."],
      rainVariability: ["Annual variability", "The standard deviation of annual rainfall anomalies. A higher value means the annual record swings more widely around its long-run reference."],
    };
    const [termName, termDefinition] = terms[selectedMetric] || ["Fitted trend", "The slope of a straight line fitted through the observations. It summarises average direction and rate over the stated period."];
    dom.termName.textContent = termName;
    dom.termDefinition.textContent = termDefinition;
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
      renderNotebookDetail({ dom, stationId: selectedStation, metric, selectedTerritory, territories: filteredTerritories(), data: DATA, climate: CLIMATE, waterStory: WATER_STORY, wastewaterStory: WASTEWATER_STORY, onSelect: selectTerritory });
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
      ? ["the answer", "the evidence chain", "the decisions"]
      : ["why this chapter matters", "regional evidence", "territory detail"];
    dom.notebookPageLabel.textContent = labels[selectedNotebookPage];
    dom.notebookPageNumbers.textContent = compactNotebook.matches
      ? `sheet ${1 + resolvedIndex * 3 + selectedNotebookPage}`
      : `pages ${firstPage} and ${firstPage + 1}`;
    dom.notebookPagePrev.disabled = selectedNotebookPage === 0;
    dom.notebookPageNext.disabled = selectedNotebookPage === 2 && !guidedNotebookItem;
    dom.notebookPagePrev.setAttribute("aria-label", compactNotebook.matches ? "Previous notebook sheet" : "Previous notebook spread");
    dom.notebookPageNext.setAttribute("aria-label", selectedNotebookPage === 2 && guidedNotebookItem
      ? "Continue conversation with field guide"
      : compactNotebook.matches ? "Forward one notebook sheet" : "Forward one notebook spread");
  }
  
  function renderEvidenceWriteup(station) {
    const highlights = station.evidence.highlights.map(([value, label]) => `<li><mark>${value}</mark><span>${label}</span></li>`).join("");
    const research = station.evidence.research
      ? `<aside class="research-note"><p><strong>${station.evidence.research.label}:</strong> ${station.evidence.research.text}</p><a href="${station.evidence.research.url}" target="_blank" rel="noreferrer">${station.evidence.research.citation} ↗</a></aside>`
      : "";
    dom.evidenceWriteup.innerHTML = `
      <p class="evidence-kicker">answer at a glance</p>
      <p class="evidence-question">${station.lead}</p>
      <p>${station.storyRole}</p>
      <ul class="evidence-highlights">${highlights}</ul>
      <p><strong>Why it matters:</strong> ${station.decision}</p>
      ${research}
      <p class="evidence-direction">compare every territory →</p>`;
    dom.chartNote.textContent = "";
  }
  
  function renderConclusion(page = 0) {
    const spreads = [
      `<p class="conclusion-kicker">the answer</p>
       <h3>Freshwater security has two gates</h3>
       <p>Across every observed territory, sea-surface temperature and sea level trend upward. The water surrounding the islands gives a shared warning, while the freshwater people depend on is far less uniform.</p>
       <p>Rainfall trends split 15 upward and seven downward. Safely managed drinking-water access ranges from 48.11% to 100% in the common 2020 comparison. The updated SPC series reports wastewater safely treated for nine territories in 2024, ranging from 7.29% to 79.06%.</p>
       <p>The first gate is safe water entering homes. The second is keeping used water from returning untreated to the environment. These indicators cover different years and different parts of the system, so they should be read together as a checklist, not combined into a score.</p>
       <p class="conclusion-callout">Freshwater security is not only about finding water. It is about protecting the whole water cycle.</p>
       <aside class="research-note"><p><strong>Related study:</strong> Research using 1951 to 2023 observations from Tarawa and Kiritimati found ocean warming without a significant long-term annual rainfall trend. ENSO variability remained strong, and severe drought remained a challenge.</p><a href="https://doi.org/10.3390/atmos15060666" target="_blank" rel="noreferrer">White, Falkland and Redfern (2024) ↗</a></aside>`,
      `<p class="conclusion-kicker">the evidence chain</p>
       <h3>The records point to a water safety chain</h3>
       <dl class="signal-ledger">
         <div><dt>around us</dt><dd><strong>21 of 21 ocean-temperature and sea-level trends point upward.</strong> The direction is shared across the observed territories.</dd></div>
         <div><dt>from the sky</dt><dd><strong>Rainfall splits 15 upward and 7 downward.</strong> Annual variability also differs.</dd></div>
         <div><dt>at home</dt><dd><strong>Safe-water access spans 48.11% to 100% across 19 territories in 2020.</strong> Three are below 70%.</dd></div>
         <div><dt>after use</dt><dd><strong>Wastewater treatment spans 7.29% to 79.06% across nine 2024 reports.</strong> Reporting coverage is limited and separate from the 2020 access comparison.</dd></div>
         <div><dt>through the instruments</dt><dd><strong>Compliant station counts span 0 to 8 across 18 territories in 2026.</strong> Five report one or fewer.</dd></div>
       </dl>
       <p>These are not interchangeable measures and they are not a single score. Together they define a practical watch: pressure at the coast, rainfall and storage, safe service at home, treatment after use, and observations that can show when conditions change.</p>`,
      `<p class="conclusion-kicker">the practical reading</p>
       <h3>Use the evidence as a water safety watch</h3>
       <p><strong>Protect the source:</strong> pair sea-level records with groundwater and saltwater-intrusion checks. <strong>Secure the supply:</strong> use territory-specific rainfall, drought and storage records when sizing reservoirs and preparing for dry periods.</p>
       <p><strong>Keep water safe at home:</strong> protect and extend services that make drinking water safe, close and available. <strong>Manage the outlet:</strong> treat wastewater before discharge, and publish the local result so the gap can be tracked.</p>
       <p><strong>Keep watch:</strong> maintain stations and local data systems so each territory can update this chain over time. This is a concrete response supported by the pattern in the records, while the analysis avoids attributing present service conditions to climate trends.</p>
       <aside class="research-note"><p><strong>Related study:</strong> Research in Fiji, Vanuatu and Solomon Islands found that sustained rural water safety planning must be adapted to local governance, community management and ways of sharing knowledge.</p><a href="https://doi.org/10.2166/wh.2024.144" target="_blank" rel="noreferrer">Souter et al. (2024) ↗</a></aside>
       <p class="conclusion-final">A shared ocean warning calls for a complete local water-safety plan.</p>`,
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
  compactNotebook.addEventListener?.("change", () => {
    if (dom.atlas.classList.contains("is-visible")) renderAtlas();
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

  function completeMission() {
    missionComplete = true;
    updateProgress();
  }
  updateNotebookZoom(0);

  return {
    open: openAtlas,
    close: closeAtlas,
    resetRevealHold,
    startRevealHold,
    updateProgress,
    isOpen: () => dom.atlas.classList.contains("is-visible"),
    getSelectedStation: () => selectedStation,
    completeMission,
  };
}
