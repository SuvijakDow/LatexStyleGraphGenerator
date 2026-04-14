import { appState } from '../state.js';
import { updateUI } from '../core/engine.js';
import { slideDown, slideUp } from './utils.js';
import { latexToPython } from '../core/parser.js';
import { switchTab } from './utils.js';

export function moveFunction(idx, direction) {
  if (direction === -1 && idx > 0) {
    [appState.functionsState[idx], appState.functionsState[idx - 1]] = [
      appState.functionsState[idx - 1],
      appState.functionsState[idx],
    ];
  } else if (direction === 1 && idx < appState.functionsState.length - 1) {
    [appState.functionsState[idx], appState.functionsState[idx + 1]] = [
      appState.functionsState[idx + 1],
      appState.functionsState[idx],
    ];
  } else {
    return;
  }
  appState.activeMathFieldId = `fn-input-${idx + direction}`;
  renderFunctions();
  updateUI();
  setTimeout(() => {
    try {
      document.getElementById(appState.activeMathFieldId)?.focus();
    } catch (e) {}
  }, 150);
}

export function toggleFunctionVisibility(idx) {
  appState.functionsState[idx].visible =
    appState.functionsState[idx].visible === false ? true : false;
  renderFunctions();
  updateUI();
}

export function duplicateFunction(idx) {
  const clone = JSON.parse(JSON.stringify(appState.functionsState[idx]));
  clone.isNew = true;
  appState.functionsState.splice(idx + 1, 0, clone);
  appState.activeMathFieldId = `fn-input-${idx + 1}`;
  renderFunctions();
  updateUI();
  setTimeout(() => {
    const mf = document.getElementById(appState.activeMathFieldId);
    if (mf)
      requestAnimationFrame(() => {
        try {
          mf.focus();
        } catch (e) {}
      });
  }, 150);
}

export function removeFunction(idx) {
  appState.functionsState.splice(idx, 1);
  if (appState.functionsState.length > 0) appState.activeMathFieldId = `fn-input-0`;
  renderFunctions();
  updateUI();
}

export function addFunction() {
  const xMin = parseFloat(document.getElementById("xMin")?.value || "-5"),
    xMax = parseFloat(document.getElementById("xMax")?.value || "5");
  const yMin = parseFloat(document.getElementById("yMin")?.value || "-5"),
    yMax = parseFloat(document.getElementById("yMax")?.value || "5");
  appState.functionsState.push({
    latexStr: "y=x",
    eq: "y=x",
    color: "#3b82f6",
    lw: 2.5,
    style: "-",
    showLatex: false,
    latexSize: 24,
    latexX: 0,
    latexY: 0,
    sliderXMin: xMin,
    sliderXMax: xMax,
    sliderYMin: yMin,
    sliderYMax: yMax,
    limitRange: false,
    fnXMin: xMin,
    fnXMax: xMax,
    fnYMin: yMin,
    fnYMax: yMax,
    visible: true,
    isExpanded: true,
    isNew: true,
  });
  appState.activeMathFieldId = `fn-input-${appState.functionsState.length - 1}`;
  switchTab("eq");
  renderFunctions();
  updateUI();
  setTimeout(() => {
    const mf = document.getElementById(appState.activeMathFieldId);
    if (mf)
      requestAnimationFrame(() => {
        try {
          mf.focus();
        } catch (e) {}
      });
  }, 150);
}

export function updateFn(idx, key, val, isTyping = false) {
  if (!appState.functionsState[idx]) return;
  if (key === "latexStr") {
    appState.functionsState[idx].latexStr = val;
    appState.functionsState[idx].eq = latexToPython(val);

    const preview = document.getElementById(`fn-preview-${idx}`);
    if (preview) preview.value = val;

    updateUI(isTyping ? 3000 : 800);
    return;
  }
  appState.functionsState[idx][key] = val;

  if (key === "color") {
    const card = document.getElementById(`func-card-${idx}`);
    if (card && appState.functionsState[idx].visible !== false) {
      card.style.borderLeftColor = val;
    }
  }

  if (key === "showLatex" || key === "limitRange") {
    renderFunctions();
    setTimeout(() => {
      const mf = document.getElementById(appState.activeMathFieldId);
      const kbd = document.getElementById("custom-keyboard");
      if (mf && kbd && !kbd.classList.contains("hidden")) {
        requestAnimationFrame(() => {
          try {
            mf.focus();
          } catch (e) {}
        });
      }
    }, 150);
  }
  updateUI();
}

export function updateFnLive(idx, key, val) {
  appState.functionsState[idx][key] = isNaN(val) ? 0 : val;
  const lbl = document.getElementById(`lbl-${key}-${idx}`);
  if (lbl) lbl.textContent = appState.functionsState[idx][key];
  updateUI();
}

export function renderFunctions() {
  const functionListContainer = document.getElementById("functionList");
  if (!functionListContainer) return;

  const kbd = document.getElementById("custom-keyboard");
  if (kbd) {
    document.body.appendChild(kbd);
    kbd.classList.add("hidden");
  }
  if (
    document.activeElement &&
    document.activeElement.tagName &&
    document.activeElement.tagName.toLowerCase() === "math-field"
  ) {
    try {
      document.activeElement.blur();
    } catch (e) {}
  }

  functionListContainer.innerHTML = "";
  appState.functionsState.forEach((fn, idx) => {
    const card = document.createElement("div");
    card.id = `func-card-${idx}`;
    card.className = `relative border border-slate-200 rounded-xl sm:rounded-2xl bg-white shadow-sm transition-all overflow-hidden ${fn.visible === false ? "opacity-50 grayscale-[30%]" : ""}`;
    card.style.borderLeft = `5px solid ${fn.visible === false ? "#cbd5e1" : fn.color}`;

    let innerHTML = `
                    <div id="func-header-${idx}" class="px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-50/70 border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors ${fn.isExpanded ? "rounded-t-xl sm:rounded-t-2xl border-b" : "rounded-xl sm:rounded-2xl border-b-0"}" onclick="window.toggleSubPanel('func', ${idx})">
                        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2 sm:mr-4">
                            <i id="icon-func-sub-${idx}" data-lucide="chevron-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${fn.isExpanded ? "" : "-rotate-90"}"></i>
                            <span class="text-xs sm:text-[13px] font-bold text-slate-700 uppercase tracking-widest flex-shrink-0">Eqn. #${idx + 1}</span>
                            
                            <div id="fn-preview-container-${idx}" class="border-l border-slate-200 pl-2.5 sm:pl-3 ml-1 sm:ml-2 flex-1 min-w-0 overflow-hidden flex items-center transition-opacity" style="${fn.isExpanded ? "display: none;" : "display: flex;"}">
                                <math-field read-only class="preview-math truncate max-w-full" id="fn-preview-${idx}">${fn.latexStr}</math-field>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                            <div class="flex items-center flex-shrink-0 border-r border-slate-200/60 pr-1 sm:pr-2 mr-1 sm:mr-1.5">
                                <button onclick="event.stopPropagation(); window.moveFunction(${idx}, -1)" class="text-slate-400 hover:text-blue-600 p-1 sm:p-1.5 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400" title="Move Up" ${idx === 0 ? "disabled" : ""}><i data-lucide="arrow-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                                <button onclick="event.stopPropagation(); window.moveFunction(${idx}, 1)" class="text-slate-400 hover:text-blue-600 p-1 sm:p-1.5 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400" title="Move Down" ${idx === appState.functionsState.length - 1 ? "disabled" : ""}><i data-lucide="arrow-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            </div>
                            <button onclick="event.stopPropagation(); window.toggleFunctionVisibility(${idx})" class="text-slate-400 hover:text-slate-700 p-1 sm:p-1.5 rounded-md hover:bg-slate-200/50 transition-colors" title="Toggle Visibility"><i data-lucide="${fn.visible === false ? "eye-off" : "eye"}" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            <button onclick="event.stopPropagation(); window.duplicateFunction(${idx})" class="text-slate-400 hover:text-slate-700 p-1 sm:p-1.5 rounded-md hover:bg-slate-200/50 transition-colors" title="Duplicate"><i data-lucide="copy" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>
                            ${appState.functionsState.length > 1 ? `<button onclick="event.stopPropagation(); window.removeFunction(${idx})" class="text-red-400 hover:text-red-600 p-1 sm:p-1.5 rounded-md hover:bg-red-50 transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i></button>` : ""}
                        </div>
                    </div>`;

    innerHTML += `
                    <div id="sub-panel-func-${idx}" style="display: ${fn.isExpanded ? "block" : "none"};">
                        <div class="p-3 sm:p-4 space-y-4 sm:space-y-5">
                            <math-field id="fn-input-${idx}" math-virtual-keyboard-policy="manual" onfocusin="window.onFocusMathField(${idx})" onfocusout="window.updateUI(200)" oninput="window.updateFn(${idx}, 'latexStr', this.value, true)">${fn.latexStr}</math-field>
                            <div id="kbd-container-${idx}" class="mt-1 w-full"></div>
                            
                            <div class="grid grid-cols-3 gap-3 sm:gap-4 pt-1">
                                <div><label class="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Color</label><input type="color" value="${fn.color}" oninput="window.updateFn(${idx}, 'color', this.value)" class="w-full h-8 sm:h-9 cursor-pointer rounded-lg border border-slate-200 shadow-sm p-1 bg-white"></div>
                                <div><label class="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Width</label><input type="number" step="0.5" value="${fn.lw}" oninput="window.updateFn(${idx}, 'lw', parseFloat(this.value))" class="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500"></div>
                                <div><label class="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Style</label><select onchange="window.updateFn(${idx}, 'style', this.value)" class="w-full px-1.5 sm:px-2 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500"><option value="-" ${fn.style === "-" ? "selected" : ""}>Solid</option><option value="--" ${fn.style === "--" ? "selected" : ""}>Dashed</option><option value=":" ${fn.style === ":" ? "selected" : ""}>Dotted</option></select></div>
                            </div>
                            <div class="pt-2 border-t border-slate-100">
                                <label class="flex items-center cursor-pointer mb-2 sm:mb-3 w-fit p-1 sm:p-1.5 -ml-1 sm:-ml-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                                    <input type="checkbox" ${fn.limitRange ? "checked" : ""} onchange="window.updateFn(${idx}, 'limitRange', this.checked)" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                    <span class="ml-2 text-xs sm:text-sm text-slate-700 font-semibold">Limit Domain / Range</span>
                                </label>
                                ${fn.limitRange
        ? `
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/70 shadow-inner mb-4 sm:mb-5">
                                    <div><label class="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">X Min / Max</label><div class="flex gap-1.5 sm:gap-2"><input type="number" step="0.1" value="${fn.fnXMin}" oninput="window.updateFnLive(${idx}, 'fnXMin', parseFloat(this.value))" class="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 border border-slate-200 rounded-md text-center outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm"><input type="number" step="0.1" value="${fn.fnXMax}" oninput="window.updateFnLive(${idx}, 'fnXMax', parseFloat(this.value))" class="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 border border-slate-200 rounded-md text-center outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm"></div></div>
                                    <div><label class="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">Y Min / Max</label><div class="flex gap-1.5 sm:gap-2"><input type="number" step="0.1" value="${fn.fnYMin}" oninput="window.updateFnLive(${idx}, 'fnYMin', parseFloat(this.value))" class="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 border border-slate-200 rounded-md text-center outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm"><input type="number" step="0.1" value="${fn.fnYMax}" oninput="window.updateFnLive(${idx}, 'fnYMax', parseFloat(this.value))" class="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 border border-slate-200 rounded-md text-center outline-none focus:border-blue-500 text-slate-800 text-xs sm:text-sm"></div></div>
                                </div>`
        : ""
      }
                                <label class="flex items-center cursor-pointer mb-2 sm:mb-3 w-fit p-1 sm:p-1.5 -ml-1 sm:-ml-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                                    <input type="checkbox" ${fn.showLatex ? "checked" : ""} onchange="window.updateFn(${idx}, 'showLatex', this.checked)" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                    <span class="ml-2 text-xs sm:text-sm text-slate-700 font-semibold">Show Equation Label</span>
                                </label>
                                ${fn.showLatex
        ? `
                                <div class="space-y-3 sm:space-y-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/70 shadow-inner">
                                    <div class="flex items-center gap-2 sm:gap-3"><label class="w-10 sm:w-14 font-bold text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">Size</label><input type="range" min="10" max="80" step="1" value="${fn.latexSize}" oninput="window.updateFnLive(${idx}, 'latexSize', parseFloat(this.value))" class="flex-grow"><span class="w-6 sm:w-8 text-right text-slate-600 font-mono text-[10px] sm:text-xs" id="lbl-latexSize-${idx}">${fn.latexSize}</span></div>
                                    <div class="flex items-center gap-2 sm:gap-3"><label class="w-10 sm:w-14 font-bold text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">X Pos</label><input type="range" min="${fn.sliderXMin}" max="${fn.sliderXMax}" step="0.1" value="${fn.latexX}" oninput="window.updateFnLive(${idx}, 'latexX', parseFloat(this.value))" class="flex-grow"><span class="w-6 sm:w-8 text-right text-slate-600 font-mono text-[10px] sm:text-xs" id="lbl-latexX-${idx}">${fn.latexX}</span></div>
                                    <div class="flex items-center gap-2 sm:gap-3"><label class="w-10 sm:w-14 font-bold text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">Y Pos</label><input type="range" min="${fn.sliderYMin}" max="${fn.sliderYMax}" step="0.1" value="${fn.latexY}" oninput="window.updateFnLive(${idx}, 'latexY', parseFloat(this.value))" class="flex-grow"><span class="w-6 sm:w-8 text-right text-slate-600 font-mono text-[10px] sm:text-xs" id="lbl-latexY-${idx}">${fn.latexY}</span></div>
                                </div>`
        : ""
      }
                            </div>
                        </div>
                    </div>`;

    card.innerHTML = innerHTML;

    if (fn.isNew) {
      card.style.display = "none";
    }

    functionListContainer.appendChild(card);

    if (fn.isNew) {
      slideDown(card);
      fn.isNew = false;
    }

    const mf = document.getElementById(`fn-input-${idx}`);
    if (mf) {
      customElements.whenDefined("math-field").then(() => {
        setTimeout(() => {
          try {
            if (mf.menuItems && Array.isArray(mf.menuItems)) {
              mf.menuItems = mf.menuItems.filter((item) => {
                const text = String(
                  item.id || item.label || item.command || "",
                ).toLowerCase();
                return (
                  text.includes("cut") ||
                  text.includes("copy") ||
                  text.includes("paste") ||
                  text.includes("select")
                );
              });
            }
          } catch (e) {}
        }, 50);
      });
    }
  });
  if (window.lucide) lucide.createIcons();
}
