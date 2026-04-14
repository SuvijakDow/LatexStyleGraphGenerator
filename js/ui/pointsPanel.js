import { appState } from '../state.js';
import { updateUI } from '../core/engine.js';
import { slideDown, slideUp, switchTab } from './utils.js';

export function movePoint(idx, direction) {
  if (direction === -1 && idx > 0) {
    [appState.pointsState[idx], appState.pointsState[idx - 1]] = [
      appState.pointsState[idx - 1],
      appState.pointsState[idx],
    ];
  } else if (direction === 1 && idx < appState.pointsState.length - 1) {
    [appState.pointsState[idx], appState.pointsState[idx + 1]] = [
      appState.pointsState[idx + 1],
      appState.pointsState[idx],
    ];
  } else {
    return;
  }
  renderPoints();
  updateUI();
}

export function updatePoint(idx, key, val) {
  if (!appState.pointsState[idx]) return;
  appState.pointsState[idx][key] = val;

  if (key === "color") {
    const card = document.getElementById(`point-card-${idx}`);
    if (card && appState.pointsState[idx].visible !== false) {
      card.style.borderLeftColor = val;
    }
  }

  updateUI();
}

export function updatePointLive(idx, key, val, source) {
  if (!appState.pointsState[idx]) return;
  appState.pointsState[idx][key] = isNaN(val) ? 0 : val;
  if (source === "range") {
    const numEl = document.getElementById(`num-pt-${key}-${idx}`);
    if (numEl) numEl.value = appState.pointsState[idx][key];
  } else if (source === "num") {
    const rangeEl = document.getElementById(`range-pt-${key}-${idx}`);
    if (rangeEl) rangeEl.value = appState.pointsState[idx][key];
  }

  const coordLbl = document.getElementById(`lbl-pt-coord-${idx}`);
  if (coordLbl) {
    coordLbl.textContent = `(${appState.pointsState[idx].x}, ${appState.pointsState[idx].y})`;
  }

  updateUI();
}

export function removePoint(idx) {
  appState.pointsState.splice(idx, 1);
  renderPoints();
  updateUI();
}

export function togglePointVisibility(idx) {
  appState.pointsState[idx].visible = appState.pointsState[idx].visible === false ? true : false;
  renderPoints();
  updateUI();
}

export function duplicatePoint(idx) {
  const clone = JSON.parse(JSON.stringify(appState.pointsState[idx]));
  clone.isNew = true;
  appState.pointsState.splice(idx + 1, 0, clone);
  renderPoints();
  updateUI();
}

export function addPoint() {
  appState.pointsState.push({
    x: 0,
    y: 0,
    marker: "o",
    color: "#f97316",
    edgeColor: "#000000",
    size: 100,
    edgeWidth: 1.5,
    hollow: false,
    visible: true,
    isExpanded: true,
    isNew: true,
  });

  switchTab("pt");
  renderPoints();
  updateUI();
}

export function renderPoints() {
  const pointListContainer = document.getElementById("pointList");
  if (!pointListContainer) return;
  
  pointListContainer.innerHTML = "";
  const xMin = parseFloat(document.getElementById("xMin")?.value || "-5"),
    xMax = parseFloat(document.getElementById("xMax")?.value || "5");
  const yMin = parseFloat(document.getElementById("yMin")?.value || "-5"),
    yMax = parseFloat(document.getElementById("yMax")?.value || "5");

  appState.pointsState.forEach((pt, idx) => {
    const card = document.createElement("div");
    card.id = `point-card-${idx}`;
    card.className = `relative border border-slate-200 rounded-xl sm:rounded-2xl bg-white shadow-sm transition-opacity overflow-hidden ${pt.visible === false ? "opacity-50 grayscale-[30%]" : ""}`;
    card.style.borderLeft = `5px solid ${pt.visible === false ? "#cbd5e1" : pt.color}`;

    let innerHTML = `
                    <div id="point-header-${idx}" class="px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-50/70 border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors ${pt.isExpanded ? "rounded-t-xl sm:rounded-t-2xl border-b" : "rounded-xl sm:rounded-2xl border-b-0"}" onclick="window.toggleSubPanel('point', ${idx})">
                        <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <i id="icon-point-sub-${idx}" data-lucide="chevron-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${pt.isExpanded ? "" : "-rotate-90"}"></i>
                            <span class="text-xs sm:text-[13px] font-bold text-slate-700 uppercase tracking-widest flex-shrink-0">Point #${idx + 1}</span>
                            <span id="lbl-pt-coord-${idx}" class="text-[10px] sm:text-[11px] font-mono text-slate-500 bg-white px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200 shadow-sm ml-1.5 sm:ml-2">(${pt.x}, ${pt.y})</span>
                        </div>
                        <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                            <div class="flex items-center flex-shrink-0 border-r border-slate-200/60 pr-1 sm:pr-2 mr-1 sm:mr-1.5">
                                <button onclick="event.stopPropagation(); window.movePoint(${idx}, -1)" class="text-slate-400 hover:text-orange-600 p-1 sm:p-1.5 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400" title="Move Up" ${idx === 0 ? "disabled" : ""}><i data-lucide="arrow-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                                <button onclick="event.stopPropagation(); window.movePoint(${idx}, 1)" class="text-slate-400 hover:text-orange-600 p-1 sm:p-1.5 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400" title="Move Down" ${idx === appState.pointsState.length - 1 ? "disabled" : ""}><i data-lucide="arrow-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            </div>
                            <button onclick="event.stopPropagation(); window.togglePointVisibility(${idx})" class="text-slate-400 hover:text-slate-700 p-1 sm:p-1.5 rounded-md hover:bg-slate-200/50 transition-colors" title="Toggle Visibility"><i data-lucide="${pt.visible === false ? "eye-off" : "eye"}" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            <button onclick="event.stopPropagation(); window.duplicatePoint(${idx})" class="text-slate-400 hover:text-slate-700 p-1 sm:p-1.5 rounded-md hover:bg-slate-200/50 transition-colors" title="Duplicate"><i data-lucide="copy" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            <button onclick="event.stopPropagation(); window.removePoint(${idx})" class="text-red-400 hover:text-red-600 p-1 sm:p-1.5 rounded-md hover:bg-red-50 transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                        </div>
                    </div>`;

    innerHTML += `
                    <div id="sub-panel-point-${idx}" style="display: ${pt.isExpanded ? "block" : "none"};">
                        <div class="p-3 sm:p-4 space-y-4 sm:space-y-5">
                            <div class="grid grid-cols-2 gap-3 sm:gap-4">
                                <div><label class="block font-semibold text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Marker</label><select onchange="window.updatePoint(${idx}, 'marker', this.value)" class="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500"><option value="o" ${pt.marker === "o" ? "selected" : ""}>Circle</option><option value="s" ${pt.marker === "s" ? "selected" : ""}>Square</option><option value="D" ${pt.marker === "D" ? "selected" : ""}>Diamond</option><option value="x" ${pt.marker === "x" ? "selected" : ""}>Cross</option></select></div>
                                <div class="flex items-center gap-1.5 sm:gap-2 pt-5 sm:pt-6"><input type="checkbox" ${pt.hollow ? "checked" : ""} onchange="window.updatePoint(${idx}, 'hollow', this.checked)" class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"><span class="font-bold text-slate-700 text-[11px] sm:text-[13px] uppercase">Hollow Shape</span></div>
                            </div>
                            <div class="grid grid-cols-2 gap-3 sm:gap-4">
                                <div><label class="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Fill Color</label><input type="color" value="${pt.color}" oninput="window.updatePoint(${idx}, 'color', this.value)" class="w-full h-8 sm:h-9 cursor-pointer rounded-lg border border-slate-200 shadow-sm p-1 bg-white"></div>
                                <div><label class="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Edge Color</label><input type="color" value="${pt.edgeColor}" oninput="window.updatePoint(${idx}, 'edgeColor', this.value)" class="w-full h-8 sm:h-9 cursor-pointer rounded-lg border border-slate-200 shadow-sm p-1 bg-white"></div>
                            </div>
                            <div class="space-y-3 sm:space-y-4 bg-slate-50 p-3 sm:p-4 border border-slate-200/70 shadow-inner rounded-xl">
                                <div>
                                    <label class="block text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">X Position</label>
                                    <div class="flex items-center gap-2 sm:gap-3">
                                        <input type="range" id="range-pt-x-${idx}" min="${xMin}" max="${xMax}" step="0.01" value="${pt.x}" oninput="window.updatePointLive(${idx}, 'x', parseFloat(this.value), 'range')" class="flex-grow">
                                        <input type="number" id="num-pt-x-${idx}" step="0.01" value="${pt.x}" oninput="window.updatePointLive(${idx}, 'x', parseFloat(this.value), 'num')" class="w-16 sm:w-20 px-1.5 sm:px-2 py-1 border border-slate-300 rounded-md text-xs sm:text-sm text-center text-slate-800 outline-none focus:border-blue-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">Y Position</label>
                                    <div class="flex items-center gap-2 sm:gap-3">
                                        <input type="range" id="range-pt-y-${idx}" min="${yMin}" max="${yMax}" step="0.01" value="${pt.y}" oninput="window.updatePointLive(${idx}, 'y', parseFloat(this.value), 'range')" class="flex-grow">
                                        <input type="number" id="num-pt-y-${idx}" step="0.01" value="${pt.y}" oninput="window.updatePointLive(${idx}, 'y', parseFloat(this.value), 'num')" class="w-16 sm:w-20 px-1.5 sm:px-2 py-1 border border-slate-300 rounded-md text-xs sm:text-sm text-center text-slate-800 outline-none focus:border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;

    card.innerHTML = innerHTML;

    if (pt.isNew) {
      card.style.display = "none";
    }

    pointListContainer.appendChild(card);

    if (pt.isNew) {
      slideDown(card);
      pt.isNew = false;
    }
  });

  if (window.lucide) lucide.createIcons();
}
