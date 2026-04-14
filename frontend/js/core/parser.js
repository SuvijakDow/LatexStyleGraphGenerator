export function latexToPython(latex) {
  if (!latex) return "0";

  let s = latex.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\\[,;:! ]/g, "");
  s = s.replace(/\s+/g, "");
  s = s.replace(/\\dfrac/g, "\\frac");
  s = s.replace(/\\sin\^\{?-1\}?/g, "\\arcsin");
  s = s.replace(/\\cos\^\{?-1\}?/g, "\\arccos");
  s = s.replace(/\\tan\^\{?-1\}?/g, "\\arctan");
  s = s.replace(/\\csc\^\{?-1\}?/g, "\\arccsc");
  s = s.replace(/\\sec\^\{?-1\}?/g, "\\arcsec");
  s = s.replace(/\\cot\^\{?-1\}?/g, "\\arccot");
  s = s.replace(/\\mleft/g, "").replace(/\\mright/g, "");
  s = s.replace(/\\left/g, "").replace(/\\right/g, "");
  s = s.replace(/\\lfloor/g, "np.floor(").replace(/\\rfloor/g, ")");
  s = s.replace(/\\lceil/g, "np.ceil(").replace(/\\rceil/g, ")");
  s = s.replace(/\\cdot/g, "*").replace(/\\times/g, "*");
  s = s.replace(/\\div/g, "/");

  function getArg(str, start) {
    if (start >= str.length) return { inner: "1", next: start };
    if (str[start] === "{") {
      let d = 1,
        k = start + 1;
      while (k < str.length && d > 0) {
        if (str[k] === "{") d++;
        else if (str[k] === "}") d--;
        k++;
      }
      return { inner: str.substring(start + 1, k - 1), next: k };
    } else {
      let next = start + 1;
      if (str[start] === "\\") {
        while (next < str.length && /[a-zA-Z]/.test(str[next])) next++;
      }
      return { inner: str.substring(start, next), next: next };
    }
  }

  let fracLimit = 0;
  while (s.includes("\\frac") && fracLimit < 50) {
    fracLimit++;
    let i = s.indexOf("\\frac");
    let num = getArg(s, i + 5);
    let den = getArg(s, num.next);
    s =
      s.substring(0, i) +
      "((" +
      num.inner +
      ")/(" +
      den.inner +
      "))" +
      s.substring(den.next);
  }

  let sqrtLimit = 0;
  while (s.includes("\\sqrt") && sqrtLimit < 50) {
    sqrtLimit++;
    let i = s.indexOf("\\sqrt");
    let k = i + 5;
    let root = "2";
    if (s[k] === "[") {
      let endIdx = s.indexOf("]", k);
      if (endIdx !== -1) {
        root = s.substring(k + 1, endIdx);
        k = endIdx + 1;
      }
    }
    let arg = getArg(s, k);
    if (root === "2") {
      s =
        s.substring(0, i) +
        "np.sqrt(" +
        arg.inner +
        ")" +
        s.substring(arg.next);
    } else {
      s =
        s.substring(0, i) +
        "((" +
        arg.inner +
        ")**(1/(" +
        root +
        ")))" +
        s.substring(arg.next);
    }
  }

  s = s.replace(/\\log_\{([^{}]+)\}/g, "logb[$1]");
  s = s.replace(/\\log_([a-zA-Z0-9])/g, "logb[$1]");
  s = s.replace(/\\log(?![a-zA-Z0-9_])/g, "np.log10");
  s = s.replace(/\\ln/g, "np.log");

  const map = {
    "\\\\sin": "np.sin",
    "\\\\cos": "np.cos",
    "\\\\tan": "np.tan",
    "\\\\csc": "csc",
    "\\\\sec": "sec",
    "\\\\cot": "cot",
    "\\\\arcsin": "np.arcsin",
    "\\\\arccos": "np.arccos",
    "\\\\arctan": "np.arctan",
    "\\\\arccsc": "arccsc",
    "\\\\arcsec": "arcsec",
    "\\\\arccot": "arccot",
    "\\\\exp": "np.exp",
    "\\\\pi": "np.pi",
    "\\\\min": "np.minimum",
    "\\\\max": "np.maximum",
    "\\\\operatorname\\{floor\\}": "np.floor",
    "\\\\operatorname\\{ceil\\}": "np.ceil",
    "\\\\floor": "np.floor",
    "\\\\ceil": "np.ceil",
  };
  for (let [key, val] of Object.entries(map)) {
    s = s.replace(new RegExp(key, "g"), val);
  }

  s = s.replace(
    /([xye0-9\)])(np\.|csc|sec|cot|arccsc|arcsec|arccot|logb)/g,
    "$1*$2",
  );

  let prevS;
  do {
    prevS = s;
    s = s.replace(
      /(np\.(?:sin|cos|tan|arcsin|arccos|arctan|log|log10|log2|exp|minimum|maximum|floor|ceil)|csc|sec|cot|arccsc|arcsec|arccot|logb\[[^\]]+\])(-?[a-zA-Z0-9_\.\^]+)/g,
      "$1($2)",
    );
  } while (s !== prevS);

  s = s.replace(/\^/g, "**");
  s = s.replace(/\|([^|]+)\|/g, "np.abs($1)");

  s = s.replace(
    /([xye0-9\)])(np\.|csc|sec|cot|arccsc|arcsec|arccot|logb)/g,
    "$1*$2",
  );

  s = s.replace(/([0-9])([a-zA-Z])/g, "$1*$2");
  s = s.replace(/([xye])([0-9])/g, "$1*$2");
  s = s.replace(/(x|y|e|np\.pi)(x|y|e|np\.pi)/g, "$1*$2");
  s = s.replace(/(x|y|e|np\.pi)(x|y|e|np\.pi)/g, "$1*$2");
  s = s.replace(/(x|y|e|np\.pi)(x|y|e|np\.pi)/g, "$1*$2");
  s = s.replace(/\)([a-zA-Z0-9])/g, ")*$1");
  s = s.replace(/([xye0-9\)]|np\.pi)\(/g, "$1*(");

  s = s.replace(/{/g, "(").replace(/}/g, ")");
  s = s.replace(/\\/g, "");
  s = s.replace(/\s+/g, "");

  if (s === "") return "0";
  return s;
}
