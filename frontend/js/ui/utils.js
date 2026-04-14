export function slideDown(element) {
  element.style.transition = "";
  element.style.display = "block";
  element.style.overflow = "hidden";
  element.style.maxHeight = "0px";
  element.style.opacity = "0";

  void element.offsetHeight; // Force reflow

  element.style.transition =
    "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  element.style.maxHeight = element.scrollHeight + "px";
  element.style.opacity = "1";

  // คืนค่า overflow เพื่อให้ Drop-up คีย์บอร์ดไม่โดนตัด
  setTimeout(() => {
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
  }, 300);
}

export function slideUp(element) {
  element.style.transition = "";
  element.style.maxHeight = element.scrollHeight + "px";
  element.style.overflow = "hidden";
  element.style.opacity = "1";

  void element.offsetHeight; // Force reflow

  element.style.transition =
    "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  element.style.maxHeight = "0px";
  element.style.opacity = "0";

  setTimeout(() => {
    element.style.display = "none";
    element.style.overflow = "visible";
  }, 300);
}

export function switchTab(tabId) {
  // Hide all contents
  ["eq", "pt", "set"].forEach((id) => {
    document.getElementById(`tab-content-${id}`).classList.add("hidden");
    const btn = document.getElementById(`tab-btn-${id}`);
    btn.classList.remove("tab-active");
    btn.classList.add("tab-inactive");
  });
  // Show selected
  document.getElementById(`tab-content-${tabId}`).classList.remove("hidden");
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  activeBtn.classList.remove("tab-inactive");
  activeBtn.classList.add("tab-active");
}

export function showCustomToast(msg, isWarning = false) {
  const t = document.getElementById("toast");
  const tm = document.getElementById("toastMsg");
  const ti = document.getElementById("toastIcon");
  if (!t || !tm || !ti) return;
  tm.textContent = msg;
  ti.className = isWarning
    ? "p-1 sm:p-1.5 rounded-full bg-orange-50 text-orange-500"
    : "p-1 sm:p-1.5 rounded-full bg-green-50 text-green-500";
  ti.innerHTML = isWarning
    ? `<i data-lucide="alert-triangle" class="w-4 h-4 sm:w-5 sm:h-5"></i>`
    : `<i data-lucide="check-circle" class="w-4 h-4 sm:w-5 sm:h-5"></i>`;
  if (window.lucide) lucide.createIcons();
  t.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => {
    t.classList.add("translate-y-20", "opacity-0");
  }, 5000);
}

function lockCheckbox(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.closest("div").classList.add("disabled-label");
  el.onclick = (e) => {
    e.preventDefault();
    showCustomToast(msg, true);
  };
}

export function handleVisibilityLocks() {
  const style =
    document.querySelector('input[name="axisStyle"]:checked')?.value ||
    "central";
  ["showArrows", "showLabels", "showOrigin", "showTicks"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.closest("div").classList.remove("disabled-label");
    el.onclick = null;
  });
  if (style === "border") {
    const ori = document.getElementById("showOrigin");
    if (ori) {
      ori.checked = true;
      lockCheckbox("showOrigin", "Border mode requires Origin visible.");
    }
  } else if (style === "none") {
    ["showArrows", "showLabels", "showOrigin", "showTicks"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.checked = false;
        lockCheckbox(id, "None mode hides elements.");
      }
    });
  }
}
