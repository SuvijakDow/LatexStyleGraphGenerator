import { appState } from '../state.js';
import { renderFunctions } from './functionsPanel.js';

export function onFocusMathField(idx) {
  appState.activeMathFieldId = `fn-input-${idx}`;
  const kbd = document.getElementById("custom-keyboard");
  const container = document.getElementById(`kbd-container-${idx}`);
  if (kbd && container) {
    container.appendChild(kbd);
    requestAnimationFrame(() => {
      kbd.classList.remove("hidden");

      const funcView = document.getElementById("kbd-func-view");
      const toggleBtn = document.getElementById("kbd-toggle-btn");
      if (funcView && !funcView.classList.contains("pointer-events-none")) {
        funcView.classList.add("opacity-0", "pointer-events-none");
        document
          .getElementById("kbd-main-view")
          .classList.remove("opacity-0", "pointer-events-none");
        toggleBtn.textContent = "FUNC";
        toggleBtn.classList.remove("!bg-blue-600", "!text-white");
      }
    });
  }
  if (!appState.functionsState[idx].isExpanded) {
    appState.functionsState[idx].isExpanded = true;
    renderFunctions();
    setTimeout(() => {
      try {
        document.getElementById(appState.activeMathFieldId)?.focus();
      } catch (e) {}
    }, 100);
  }
}

export function hideKeyboard() {
  const kbd = document.getElementById("custom-keyboard");
  if (kbd) kbd.classList.add("hidden");
  const mf = document.getElementById(appState.activeMathFieldId);
  if (mf) {
    try {
      mf.blur();
    } catch (e) {}
  }
}

export function insertMath(latexCommand) {
  const mf = document.getElementById(appState.activeMathFieldId);
  if (mf && mf.tagName === "MATH-FIELD") {
    mf.insert(latexCommand);
    requestAnimationFrame(() => {
      try {
        mf.focus();
      } catch (e) {}
    });
  }
}

export function executeMathCmd(cmd) {
  const mf = document.getElementById(appState.activeMathFieldId);
  if (mf && mf.tagName === "MATH-FIELD") {
    mf.executeCommand(cmd);
    requestAnimationFrame(() => {
      try {
        mf.focus();
      } catch (e) {}
    });
  }
}

export function toggleFunctionsPanel() {
  const mainView = document.getElementById("kbd-main-view");
  const funcView = document.getElementById("kbd-func-view");
  const toggleBtn = document.getElementById("kbd-toggle-btn");

  if (funcView.classList.contains("pointer-events-none")) {
    funcView.classList.remove("opacity-0", "pointer-events-none");
    mainView.classList.add("opacity-0", "pointer-events-none");
    toggleBtn.textContent = "1 2 3";
    toggleBtn.classList.add("!bg-blue-600", "!text-white");
  } else {
    funcView.classList.add("opacity-0", "pointer-events-none");
    mainView.classList.remove("opacity-0", "pointer-events-none");
    toggleBtn.textContent = "FUNC";
    toggleBtn.classList.remove("!bg-blue-600", "!text-white");
  }
}

document.addEventListener("mousedown", (e) => {
  const kbd = document.getElementById("custom-keyboard");
  if (kbd && !kbd.classList.contains("hidden")) {
    const isKeyboardClick = kbd.contains(e.target);
    const isMathFieldClick = e.target.closest("math-field");
    if (!isKeyboardClick && !isMathFieldClick) {
      hideKeyboard();
    }
  }
});
