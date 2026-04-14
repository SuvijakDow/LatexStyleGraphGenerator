import { appState, DEFAULTS, resetFunctionsState, resetPointsState } from './state.js';
import { initWorker, updateUI } from './core/engine.js';
import { renderFunctions, addFunction, removeFunction, moveFunction, toggleFunctionVisibility, duplicateFunction, updateFn, updateFnLive } from './ui/functionsPanel.js';
import { renderPoints, addPoint, removePoint, movePoint, togglePointVisibility, duplicatePoint, updatePoint, updatePointLive } from './ui/pointsPanel.js';
import { switchTab, showCustomToast, slideDown, slideUp } from './ui/utils.js';
import { onFocusMathField, hideKeyboard, insertMath, executeMathCmd, toggleFunctionsPanel } from './ui/keyboard.js';
import { generateCode } from './core/generator.js';

// Attach globally needed functions to window so inline HTML onclick="" still works
window.switchTab = switchTab;
window.resetSection = resetSection;
window.addFunction = addFunction;
window.removeFunction = removeFunction;
window.moveFunction = moveFunction;
window.toggleFunctionVisibility = toggleFunctionVisibility;
window.duplicateFunction = duplicateFunction;
window.updateFn = updateFn;
window.updateFnLive = updateFnLive;

window.addPoint = addPoint;
window.removePoint = removePoint;
window.movePoint = movePoint;
window.togglePointVisibility = togglePointVisibility;
window.duplicatePoint = duplicatePoint;
window.updatePoint = updatePoint;
window.updatePointLive = updatePointLive;

window.toggleSubPanel = toggleSubPanel;
window.updateUI = updateUI;

window.onFocusMathField = onFocusMathField;
window.hideKeyboard = hideKeyboard;
window.insertMath = insertMath;
window.executeMathCmd = executeMathCmd;
window.toggleFunctionsPanel = toggleFunctionsPanel;

export function toggleSubPanel(type, idx) {
  if (type === "func") {
    appState.functionsState[idx].isExpanded = !appState.functionsState[idx].isExpanded;
    const panel = document.getElementById(`sub-panel-func-${idx}`);
    const icon = document.getElementById(`icon-func-sub-${idx}`);
    const previewContainer = document.getElementById(
      `fn-preview-container-${idx}`,
    );
    const header = document.getElementById(`func-header-${idx}`);

    if (appState.functionsState[idx].isExpanded) {
      slideDown(panel);
      icon.classList.remove("-rotate-90");
      if (previewContainer) previewContainer.style.display = "none";
      if (header) {
        header.classList.remove("rounded-xl", "sm:rounded-2xl", "border-b-0");
        header.classList.add("rounded-t-xl", "sm:rounded-t-2xl", "border-b");
      }
    } else {
      slideUp(panel);
      icon.classList.add("-rotate-90");
      if (previewContainer) previewContainer.style.display = "flex";
      setTimeout(() => {
        if (header && !appState.functionsState[idx].isExpanded) {
          header.classList.remove(
            "rounded-t-xl",
            "sm:rounded-t-2xl",
            "border-b",
          );
          header.classList.add("rounded-xl", "sm:rounded-2xl", "border-b-0");
        }
      }, 300);
    }
  } else if (type === "point") {
    appState.pointsState[idx].isExpanded = !appState.pointsState[idx].isExpanded;
    const panel = document.getElementById(`sub-panel-point-${idx}`);
    const icon = document.getElementById(`icon-point-sub-${idx}`);
    const header = document.getElementById(`point-header-${idx}`);

    if (appState.pointsState[idx].isExpanded) {
      slideDown(panel);
      icon.classList.remove("-rotate-90");
      if (header) {
        header.classList.remove("rounded-xl", "sm:rounded-2xl", "border-b-0");
        header.classList.add("rounded-t-xl", "sm:rounded-t-2xl", "border-b");
      }
    } else {
      slideUp(panel);
      icon.classList.add("-rotate-90");
      setTimeout(() => {
        if (header && !appState.pointsState[idx].isExpanded) {
          header.classList.remove(
            "rounded-t-xl",
            "sm:rounded-t-2xl",
            "border-b",
          );
          header.classList.add("rounded-xl", "sm:rounded-2xl", "border-b-0");
        }
      }, 300);
    }
  }
}

export function resetSection(section) {
  if (section === "func") {
    resetFunctionsState();
    renderFunctions();
  } else if (section === "points") {
    resetPointsState();
    renderPoints();
  } else if (section === "style" || section === "visibility") {
    const central = document.querySelector(
      'input[name="axisStyle"][value="central"]',
    );
    if (central) central.checked = true;
    ["showGrid", "showArrows", "showLabels", "showOrigin", "showTicks"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.checked = DEFAULTS[id];
      },
    );
  } else if (section === "dim") {
    ["figW", "figH", "xMin", "xMax", "yMin", "yMax", "xStep", "yStep"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el)
          el.value = DEFAULTS[id === "figW" ? "w" : id === "figH" ? "h" : id];
      },
    );
    renderFunctions();
    renderPoints();
  } else if (section === "styling") {
    ["tickSize", "labelSize", "arrowW", "arrowH"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = DEFAULTS[id];
    });
    document.getElementById("equalAspect").checked = DEFAULTS.equalAspect;
  }
  updateUI();
}

async function initApp() {
  document.getElementById("resetAllBtn").onclick = () => {
    resetSection("func");
    resetSection("points");
    resetSection("style");
    resetSection("dim");
    resetSection("styling");
    showCustomToast("All settings reset successfully.");
  };

  [
    "figW",
    "figH",
    "xMin",
    "xMax",
    "yMin",
    "yMax",
    "xStep",
    "yStep",
    "tickSize",
    "labelSize",
    "arrowW",
    "arrowH",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.oninput = () => {
        if (id.includes("Min") || id.includes("Max")) {
          renderFunctions();
          renderPoints();
        }
        updateUI();
      };
  });

  [
    "showGrid",
    "showArrows",
    "showLabels",
    "showOrigin",
    "showTicks",
    "equalAspect",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.onchange = () => updateUI();
  });

  document
    .querySelectorAll('input[name="axisStyle"]')
    .forEach((r) => (r.onchange = () => updateUI()));
    
  document.getElementById("copyBtn").onclick = () => {
    const el = document.createElement("textarea");
    el.value = generateCode();
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showCustomToast("Code copied!");
  };

  const dl = async (fmt, mime, btn) => {
    if (!appState.pyodideWorker) return;
    const oT = btn.innerText;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i>`;
    try {
      const python = generateCode();
      const pyScript =
        "import io, base64\\nimport matplotlib\\nmatplotlib.use('Agg')\\nimport matplotlib.pyplot as plt\\nbuf = io.BytesIO()\\n" +
        python.replace("plt.show()", "") +
        "\\nplt.savefig(buf, format='" +
        fmt +
        "', bbox_inches='tight', dpi=300)\\nbuf.seek(0)\\nbase64.b64encode(buf.read()).decode('utf-8')";

      const b64 = await new Promise((resolve, reject) => {
        appState.exportResolve = resolve;
        appState.exportReject = reject;
        appState.pyodideWorker.postMessage({ type: "export", code: pyScript });
      });

      const a = document.createElement("a");
      a.href = `data:${mime};base64,${b64}`;
      a.download = `math_graph.${fmt}`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      btn.innerText = oT;
    }
  };
  
  document.getElementById("dlPngBtn").onclick = (e) =>
    dl("png", "image/png", e.target);
  document.getElementById("dlSvgBtn").onclick = (e) =>
    dl("svg", "image/svg+xml", e.target);
  document.getElementById("dlPdfBtn").onclick = (e) =>
    dl("pdf", "application/pdf", e.target);

  // Initialize Web Worker
  initWorker();
}

window.onload = initApp;
