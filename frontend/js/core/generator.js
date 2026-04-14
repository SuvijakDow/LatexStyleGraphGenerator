import { appState } from '../state.js';

export function generateCode() {
  const getVal = (id) => document.getElementById(id)?.value || "0";
  const getCheck = (id) => document.getElementById(id)?.checked || false;

  const w = parseFloat(getVal("figW")) || 800;
  const h = parseFloat(getVal("figH")) || 800;
  const wIn = w / 100;
  const hIn = h / 100;
  const xMin = parseFloat(getVal("xMin")),
    xMax = parseFloat(getVal("xMax"));
  let xStep = Math.abs(parseFloat(getVal("xStep")));
  if (!xStep) xStep = 1;
  const yMin = parseFloat(getVal("yMin")),
    yMax = parseFloat(getVal("yMax"));
  let yStep = Math.abs(parseFloat(getVal("yStep")));
  if (!yStep) yStep = 1;
  const tSize = getVal("tickSize") || "22",
    lSize = getVal("labelSize") || "24";
  const arrowW = getVal("arrowW") || "0.3",
    arrowH = getVal("arrowH") || "1.25";
  const isGrid = getCheck("showGrid"),
    isOrigin = getCheck("showOrigin"),
    isArrows = getCheck("showArrows"),
    isLabels = getCheck("showLabels"),
    isTicks = getCheck("showTicks");
  const isEqual = getCheck("equalAspect");
  const style =
    document.querySelector('input[name="axisStyle"]:checked')?.value ||
    "central";
  const dollar = "$";
  const arrowStyleStr = `-|>,head_width=${arrowW},head_length=${arrowH}`;

  let pyLines = [
    "import numpy as np",
    "import matplotlib",
    "matplotlib.use('Agg')",
    "import matplotlib.pyplot as plt",
    "import warnings",
    "warnings.filterwarnings('ignore')",
    "",
    "def arccsc(x): return np.arcsin(1/np.where(x==0, np.nan, x))",
    "def arcsec(x): return np.arccos(1/np.where(x==0, np.nan, x))",
    "def arccot(x): return np.pi/2 - np.arctan(x)",
    "def csc(x): return 1/np.where(np.sin(x)==0, np.nan, np.sin(x))",
    "def sec(x): return 1/np.where(np.cos(x)==0, np.nan, np.cos(x))",
    "def cot(x): return 1/np.where(np.tan(x)==0, np.nan, np.tan(x))",
    "class _LogBase:",
    "    def __getitem__(self, b): return lambda x: np.log(x)/np.log(b)",
    "logb = _LogBase()",
    "e = np.e",
    "",
    "plt.rcParams['mathtext.fontset'] = 'cm'",
    "plt.rcParams['font.family'] = 'serif'",
    "plt.rcParams['axes.formatter.use_mathtext'] = True",
    "",
    "fig, ax = plt.subplots(figsize=(" + wIn + ", " + hIn + "))",
    "x_pad, y_pad = " + xStep + ", " + yStep,
    "start_x, end_x = " + xMin + " - x_pad, " + xMax + " + x_pad",
    "start_y, end_y = " + yMin + " - y_pad, " + yMax + " + y_pad",
    "_x_base = np.linspace(start_x, end_x, 500)",
    "_y_base = np.linspace(start_y, end_y, 500)",
    "X_mesh, Y_mesh = np.meshgrid(_x_base, _y_base)",
    "",
  ];

  appState.functionsState.forEach((f, idx) => {
    if (f.visible === false) return;
    let curXMin = f.limitRange ? f.fnXMin : "start_x";
    let curXMax = f.limitRange ? f.fnXMax : "end_x";
    let curYMin = f.limitRange ? f.fnYMin : "start_y";
    let curYMax = f.limitRange ? f.fnYMax : "end_y";

    let currentZ = 100 - idx;

    let isExplicitY = false,
      isExplicitX = false,
      explicitExpr = "",
      lhs = "",
      rhs = "";
    let cStyle =
      f.style === "-" ? "solid" : f.style === "--" ? "dashed" : "dotted";

    if (f.eq.includes("=")) {
      let parts = f.eq.split("=");
      lhs = parts[0].trim();
      rhs = parts[1].trim();
      if (lhs === "y") {
        isExplicitY = true;
        explicitExpr = rhs;
      } else if (rhs === "y") {
        isExplicitY = true;
        explicitExpr = lhs;
      } else if (lhs === "x") {
        isExplicitX = true;
        explicitExpr = rhs;
      } else if (rhs === "x") {
        isExplicitX = true;
        explicitExpr = lhs;
      }
    } else {
      isExplicitY = true;
      explicitExpr = f.eq;
    }

    if (isExplicitY) {
      if (f.limitRange) {
        pyLines.push(`x = np.linspace(${curXMin}, ${curXMax}, 2000)`);
      } else {
        pyLines.push("x = np.linspace(start_x, end_x, 2000)");
      }
      pyLines.push(`y_val = ${explicitExpr}`);
      pyLines.push(
        `if np.isscalar(y_val): y_val = np.full_like(x, y_val, dtype=float)`,
      );
      pyLines.push(`y_val = np.asarray(y_val)`);

      pyLines.push(`_tol = np.abs(${curYMax} - (${curYMin})) * 0.15`);
      pyLines.push(`_dy = np.abs(np.diff(y_val))`);
      pyLines.push(`_dy_left = np.pad(_dy[:-1], (1, 0), mode='edge')`);
      pyLines.push(`_dy_right = np.pad(_dy[1:], (0, 1), mode='edge')`);
      pyLines.push(`_abs_tol = np.abs(${curYMax} - (${curYMin})) * 0.02`);
      pyLines.push(
        `_is_jump = (_dy > 4 * _dy_left) & (_dy > 4 * _dy_right) & (_dy > _abs_tol)`,
      );
      pyLines.push(`_mask = np.append((_dy > _tol) | _is_jump, False)`);
      pyLines.push(`y_val[_mask] = np.nan`);

      if (f.limitRange) {
        pyLines.push(
          `y_val = np.where((y_val >= ${curYMin}) & (y_val <= ${curYMax}), y_val, np.nan)`,
        );
      }
      pyLines.push(
        "ax.plot(x, y_val, color='" +
        f.color +
        "', lw=" +
        f.lw +
        ", ls='" +
        f.style +
        "', zorder=" +
        currentZ +
        ")",
      );
    } else if (isExplicitX) {
      if (f.limitRange) {
        pyLines.push(`y = np.linspace(${curYMin}, ${curYMax}, 2000)`);
      } else {
        pyLines.push("y = np.linspace(start_y, end_y, 2000)");
      }
      pyLines.push(`x_val = ${explicitExpr}`);
      pyLines.push(
        `if np.isscalar(x_val): x_val = np.full_like(y, x_val, dtype=float)`,
      );
      pyLines.push(`x_val = np.asarray(x_val)`);

      pyLines.push(`_tol = np.abs(${curXMax} - (${curXMin})) * 0.15`);
      pyLines.push(`_dy = np.abs(np.diff(x_val))`);
      pyLines.push(`_dy_left = np.pad(_dy[:-1], (1, 0), mode='edge')`);
      pyLines.push(`_dy_right = np.pad(_dy[1:], (0, 1), mode='edge')`);
      pyLines.push(`_abs_tol = np.abs(${curXMax} - (${curXMin})) * 0.02`);
      pyLines.push(
        `_is_jump = (_dy > 4 * _dy_left) & (_dy > 4 * _dy_right) & (_dy > _abs_tol)`,
      );
      pyLines.push(`_mask = np.append((_dy > _tol) | _is_jump, False)`);
      pyLines.push(`x_val[_mask] = np.nan`);

      if (f.limitRange) {
        pyLines.push(
          `x_val = np.where((x_val >= ${curXMin}) & (x_val <= ${curXMax}), x_val, np.nan)`,
        );
      }
      pyLines.push(
        "ax.plot(x_val, y, color='" +
        f.color +
        "', lw=" +
        f.lw +
        ", ls='" +
        f.style +
        "', zorder=" +
        currentZ +
        ")",
      );
    } else {
      if (f.limitRange) {
        pyLines.push(
          `_x_tmp_${idx} = np.linspace(${curXMin}, ${curXMax}, 500)`,
        );
        pyLines.push(
          `_y_tmp_${idx} = np.linspace(${curYMin}, ${curYMax}, 500)`,
        );
        pyLines.push(
          `X_mesh_tmp, Y_mesh_tmp = np.meshgrid(_x_tmp_${idx}, _y_tmp_${idx})`,
        );
        pyLines.push(`x, y = X_mesh_tmp, Y_mesh_tmp`);
      } else {
        pyLines.push("x, y = X_mesh, Y_mesh");
      }
      pyLines.push("Z = (" + lhs + ") - (" + rhs + ")");

      pyLines.push(`_z_tol = np.abs(${curYMax} - (${curYMin})) * 50`);
      pyLines.push(`Z = np.where(np.abs(Z) > _z_tol, np.nan, Z)`);

      pyLines.push("if np.nanmin(Z) <= 0 <= np.nanmax(Z):");
      pyLines.push(
        "    ax.contour(x, y, Z, levels=[0], colors=['" +
        f.color +
        "'], linewidths=[" +
        f.lw +
        "], linestyles=['" +
        cStyle +
        "'], zorder=" +
        currentZ +
        ")",
      );
    }

    if (f.showLatex) {
      let displayLatex = f.latexStr || "";
      if (displayLatex.trim() !== "") {
        displayLatex = displayLatex
          .replace(/\\mleft/g, "")
          .replace(/\\mright/g, "");
        displayLatex = displayLatex
          .replace(/\\left/g, "")
          .replace(/\\right/g, "");
        for (let k = 0; k < 5; k++) {
          displayLatex = displayLatex.replace(
            /\\frac\s*([0-9a-zA-Z])\s*([0-9a-zA-Z])/g,
            "\\frac{$1}{$2}",
          );
        }
        displayLatex = displayLatex.replace(/\\frac/g, "\\dfrac");
        pyLines.push(
          "ax.text(" +
          f.latexX +
          ", " +
          f.latexY +
          ", r'" +
          dollar +
          displayLatex +
          dollar +
          "', fontsize=" +
          f.latexSize +
          ", color='" +
          f.color +
          "', zorder=" +
          (currentZ + 100) +
          ")",
        );
      }
    }
  });

  appState.pointsState.forEach((pt, idx) => {
    if (pt.visible === false) return;
    const fc = pt.hollow ? "none" : pt.color;
    let currentZ = 200 - idx;
    pyLines.push(
      "ax.scatter(" +
      pt.x +
      ", " +
      pt.y +
      ", s=" +
      pt.size +
      ", marker='" +
      pt.marker +
      "', facecolors='" +
      fc +
      "', edgecolors='" +
      pt.edgeColor +
      "', linewidths=" +
      pt.edgeWidth +
      ", zorder=" +
      currentZ +
      ")",
    );
  });

  pyLines.push(
    "",
    "ax.set_xlim(start_x, end_x)",
    "ax.set_ylim(start_y, end_y)",
  );
  if (isEqual) pyLines.push("ax.set_aspect('equal')");

  pyLines.push(
    "x_start_tick = np.ceil(" + xMin + " / " + xStep + ") * " + xStep,
    "y_start_tick = np.ceil(" + yMin + " / " + yStep + ") * " + yStep,
    "xticks_vals = np.arange(x_start_tick, " +
    xMax +
    " + " +
    xStep / 2 +
    ", " +
    xStep +
    ")",
    "yticks_vals = np.arange(y_start_tick, " +
    yMax +
    " + " +
    yStep / 2 +
    ", " +
    yStep +
    ")",
    "ax.set_xticks(xticks_vals)",
    "ax.set_yticks(yticks_vals)",
    "ax.tick_params(axis='both', which='major', labelsize=" +
    tSize +
    (isTicks ? "" : ", length=0") +
    ")",
    "",
    "def fmt_tick_central(val):",
    "    val = np.round(val, 4)",
    "    if val == 0: return ''",
    "    return r'" + dollar + "{:g}" + dollar + "'.format(val)",
    "",
    "def fmt_tick_border(val):",
    "    val = np.round(val, 4)",
    "    return r'" + dollar + "{:g}" + dollar + "'.format(val)",
    "",
  );

  if (style === "central") {
    pyLines.push(
      "ax.spines['left'].set_position('zero')",
      "ax.spines['bottom'].set_position('zero')",
      "ax.spines['right'].set_visible(False)",
      "ax.spines['top'].set_visible(False)",
    );
    if (isTicks) {
      pyLines.push(
        "ax.set_xticklabels([fmt_tick_central(v) for v in xticks_vals])",
        "ax.set_yticklabels([fmt_tick_central(v) for v in yticks_vals])",
      );
    } else {
      pyLines.push("ax.set_xticklabels([])\nax.set_yticklabels([])");
    }
    if (isOrigin)
      pyLines.push(
        "ax.text(x_pad * 0.12, -y_pad * 0.12, r'" +
        dollar +
        "0" +
        dollar +
        "', fontsize=" +
        tSize +
        ", ha='left', va='top', zorder=300)",
      );
    if (isArrows) {
      pyLines.push(
        "ax.annotate('', xy=(end_x + x_pad*0.05, 0), xytext=(end_x + x_pad*0.049, 0), arrowprops=dict(arrowstyle='" +
        arrowStyleStr +
        "', facecolor='black', lw=1.5), annotation_clip=False, zorder=300)",
      );
      pyLines.push(
        "ax.annotate('', xy=(0, end_y + y_pad*0.05), xytext=(0, end_y + y_pad*0.049), arrowprops=dict(arrowstyle='" +
        arrowStyleStr +
        "', facecolor='black', lw=1.5), annotation_clip=False, zorder=300)",
      );
    }
    if (isLabels) {
      pyLines.push(
        "ax.text(end_x + x_pad*0.35, 0, r'" +
        dollar +
        "X" +
        dollar +
        "', fontsize=" +
        lSize +
        ", ha='left', va='center', clip_on=False)",
      );
      pyLines.push(
        "ax.text(0, end_y + y_pad*0.35, r'" +
        dollar +
        "Y" +
        dollar +
        "', fontsize=" +
        lSize +
        ", ha='center', va='bottom', clip_on=False)",
      );
    }
  } else if (style === "border") {
    pyLines.push(
      "ax.spines['left'].set_visible(True)",
      "ax.spines['bottom'].set_visible(True)",
      "ax.spines['left'].set_position(('outward', 0))",
      "ax.spines['bottom'].set_position(('outward', 0))",
      "ax.spines['left'].set_linewidth(1)",
      "ax.spines['bottom'].set_linewidth(1)",
      "ax.spines['right'].set_visible(False)",
      "ax.spines['top'].set_visible(False)",
    );
    if (isTicks) {
      pyLines.push(
        "ax.set_xticklabels([fmt_tick_border(v) for v in xticks_vals])",
        "ax.set_yticklabels([fmt_tick_border(v) for v in yticks_vals])",
      );
    } else {
      pyLines.push("ax.set_xticklabels([])\nax.set_yticklabels([])");
    }
    if (isArrows) {
      pyLines.push(
        "ax.annotate('', xy=(end_x, start_y), xytext=(end_x-x_pad*0.001, start_y), arrowprops=dict(arrowstyle='" +
        arrowStyleStr +
        "', facecolor='black', lw=1.5), annotation_clip=False, zorder=300)",
      );
      pyLines.push(
        "ax.annotate('', xy=(start_x, end_y), xytext=(start_x, end_y-y_pad*0.001), arrowprops=dict(arrowstyle='" +
        arrowStyleStr +
        "', facecolor='black', lw=1.5), annotation_clip=False, zorder=300)",
      );
    }
    if (isLabels) {
      pyLines.push(
        "ax.text(end_x + x_pad*0.25, start_y, r'" +
        dollar +
        "X" +
        dollar +
        "', fontsize=" +
        lSize +
        ", ha='left', va='center', clip_on=False)",
      );
      pyLines.push(
        "ax.text(start_x, end_y + y_pad*0.25, r'" +
        dollar +
        "Y" +
        dollar +
        "', fontsize=" +
        lSize +
        ", ha='center', va='bottom', clip_on=False)",
      );
    }
  } else {
    pyLines.push(
      "for s in ax.spines.values(): s.set_visible(False)\nax.tick_params(axis='both',which='both',bottom=False,left=False,labelbottom=False,labelleft=False)\nax.set_xticklabels([]); ax.set_yticklabels([])",
    );
  }

  pyLines.push(
    isGrid
      ? "ax.grid(True, color='#E8E8E8', zorder=1)\nax.set_axisbelow(True)"
      : "ax.grid(False)",
  );
  pyLines.push("plt.tight_layout()", "plt.show()");
  return pyLines.join("\n");
}
