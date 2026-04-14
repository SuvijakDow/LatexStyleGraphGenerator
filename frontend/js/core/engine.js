import { appState } from '../state.js';
import { generateCode } from './generator.js';
import { handleVisibilityLocks } from '../ui/utils.js';
import { renderFunctions } from '../ui/functionsPanel.js';
import { renderPoints } from '../ui/pointsPanel.js';

export const debouncedRunPreview = (() => {
  let t;
  return (delay = 800) => {
    if (!appState.pyodideWorker) return;
    clearTimeout(t);
    t = setTimeout(() => {
      const updatingSpinner = document.getElementById("updatingSpinner");
      if (updatingSpinner) updatingSpinner.classList.remove("hidden");
      
      const code = generateCode();
      const script =
        "import io, base64\nimport matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nplt.close('all')\n" +
        code.replace("plt.show()", "") +
        "\nbuf = io.BytesIO()\nplt.savefig(buf, format='png', bbox_inches='tight', dpi=120)\nbuf.seek(0)\nbase64.b64encode(buf.read()).decode('utf-8')";

      appState.pyodideWorker.postMessage({ type: "run", code: script });
    }, delay);
  };
})();

export async function exportChart(format = 'png') {
  if (!appState.pyodideWorker) throw new Error("Graph Engine not loaded");
  
  const code = generateCode();
  // For SVG/PDF, we don't need base64 if we manage raw bytes, but Pyodide runPython extension usually returns JS values.
  // We'll stick to base64 for simplicity across all formats.
  const script =
    "import io, base64\nimport matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nplt.close('all')\n" +
    code.replace("plt.show()", "") +
    `\nbuf = io.BytesIO()\nplt.savefig(buf, format='${format}', bbox_inches='tight', dpi=300)\nbuf.seek(0)\nbase64.b64encode(buf.read()).decode('utf-8')`;

  return new Promise((resolve, reject) => {
    appState.exportResolve = resolve;
    appState.exportReject = reject;
    appState.pyodideWorker.postMessage({ type: "export", code: script });
  });
}

export function updateUI(delay = 800) {
  handleVisibilityLocks();
  const code = generateCode();
  const codeOutput = document.getElementById("codeOutput");
  if (codeOutput) codeOutput.textContent = code;
  if (window.Prism && codeOutput) Prism.highlightElement(codeOutput);
  debouncedRunPreview(delay);
}

export function initWorker() {
  const workerCode = `
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
    let pyodide;
    async function init() {
      pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });
      await pyodide.loadPackage(["numpy", "matplotlib"]);
      
      await pyodide.runPythonAsync("import matplotlib\\nmatplotlib.use('Agg')");
      
      postMessage({ type: 'ready' });
    }
    init().catch(err => postMessage({ type: 'error', error: err.message }));

    onmessage = async (e) => {
      if (e.data.type === 'run' || e.data.type === 'export') {
        try {
          const imgStr = await pyodide.runPythonAsync(e.data.code);
          postMessage({ type: e.data.type === 'run' ? 'success' : 'export_success', image: imgStr });
        } catch (err) {
          postMessage({ type: e.data.type === 'run' ? 'run_error' : 'export_error', error: err.message });
        }
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  appState.pyodideWorker = new Worker(URL.createObjectURL(blob));

  appState.pyodideWorker.onmessage = (e) => {
    if (e.data.type === "ready") {
      const overlay = document.getElementById("loadingOverlay");
      if(overlay) {
          overlay.classList.add("opacity-0", "pointer-events-none");
          setTimeout(() => overlay.remove(), 500);
      }
      document.body.classList.remove("overflow-hidden");
      renderFunctions();
      renderPoints();
      updateUI();
    } else if (e.data.type === "success") {
      const graphPreview = document.getElementById("graphPreview");
      if (graphPreview) {
        graphPreview.src = "data:image/png;base64," + e.data.image;
        graphPreview.classList.remove("hidden");
      }
      document.getElementById("errorOverlay")?.classList.add("hidden");
      const updatingSpinner = document.getElementById("updatingSpinner");
      if (updatingSpinner) updatingSpinner.classList.add("hidden");
    } else if (e.data.type === "run_error") {
      console.error("Live Preview Error:", e.data.error);
      let errorHint = "Syntax Error";
      if (e.data.error) {
        const lines = e.data.error.trim().split("\n");
        errorHint = lines[lines.length - 1];
      }
      const et = document.getElementById("errorTextShort");
      if (et) et.textContent = errorHint;
      document.getElementById("errorOverlay")?.classList.remove("hidden");
      const graphPreview = document.getElementById("graphPreview");
      graphPreview?.classList.add("hidden");
      const updatingSpinner = document.getElementById("updatingSpinner");
      if (updatingSpinner) updatingSpinner.classList.add("hidden");
    } else if (e.data.type === "export_success") {
      if (appState.exportResolve) appState.exportResolve(e.data.image);
    } else if (e.data.type === "export_error") {
      if (appState.exportReject) appState.exportReject(e.data.error);
    } else if (e.data.type === "error") {
      console.error("Pyodide Worker Load Error:", e.data.error);
      const loadingOverlay = document.getElementById("loadingOverlay");
      if(loadingOverlay) {
        loadingOverlay.innerHTML =
            `<div class="flex flex-col items-center"><i data-lucide="alert-triangle" class="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-3 sm:mb-4"></i><span class="text-red-500 font-bold text-base sm:text-lg">Engine Load Failed</span><span class="text-slate-500 text-xs sm:text-sm mt-1.5 sm:mt-2 text-center">Please check your internet connection.<br>First load downloads ~30MB of data.</span><div class="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-100 text-red-800 text-[10px] sm:text-xs rounded-xl max-w-md w-full overflow-auto font-mono text-left shadow-sm">${e.data.error}</div></div>`;
      }
      if (window.lucide) lucide.createIcons();
    }
  };
}
