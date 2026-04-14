import { latexToPython } from './core/parser.js';

export const DEFAULTS = {
  w: 800,
  h: 800,
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  xStep: 1,
  yStep: 1,
  equalAspect: true,
  tickSize: 22,
  labelSize: 24,
  arrowW: 0.3,
  arrowH: 1.25,
  showGrid: true,
  showArrows: true,
  showLabels: true,
  showTicks: true,
  showOrigin: true,
  axisStyle: "central",
  latexStr: "\\left(x^2+y^2-2\\right)^3=8x^2y^3",
};

export const appState = {
  functionsState: [],
  pointsState: [],
  pyodideWorker: null,
  exportResolve: null,
  exportReject: null,
  currentGraphId: null,
  currentGraphTitle: "Untitled Graph",
  isDirty: false,
  activeMathFieldId: "fn-input-0" // Track currently focused math field
};

export const markDirty = () => {
    if (!appState.isDirty) {
        appState.isDirty = true;
        const di = document.getElementById('dirtyIndicator');
        if (di) di.style.opacity = '1';
    }
};

export const clearDirty = () => {
    appState.isDirty = false;
    const di = document.getElementById('dirtyIndicator');
    if (di) di.style.opacity = '0';
    const nd = document.getElementById('currentGraphNameDisplay');
    if (nd) nd.value = appState.currentGraphTitle;
};

export function resetFunctionsState() {
  appState.functionsState = [
    {
      latexStr: DEFAULTS.latexStr,
      eq: latexToPython(DEFAULTS.latexStr),
      color: "#e11d48",
      lw: 2.5,
      style: "-",
      showLatex: false,
      latexSize: 24,
      latexX: 0,
      latexY: 0,
      sliderXMin: -5,
      sliderXMax: 5,
      sliderYMin: -5,
      sliderYMax: 5,
      limitRange: false,
      fnXMin: -5,
      fnXMax: 5,
      fnYMin: -5,
      fnYMax: 5,
      visible: true,
      isExpanded: true,
    },
  ];
  appState.activeMathFieldId = "fn-input-0";
}

export function resetPointsState() {
  appState.pointsState = [];
}

// Initialize default state
resetFunctionsState();
