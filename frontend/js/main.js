import { appState, DEFAULTS, resetFunctionsState, resetPointsState, markDirty, clearDirty } from './state.js';
import { initWorker, updateUI } from './core/engine.js';
import { renderFunctions, addFunction, removeFunction, moveFunction, toggleFunctionVisibility, duplicateFunction, updateFn, updateFnLive } from './ui/functionsPanel.js';
import { renderPoints, addPoint, removePoint, movePoint, togglePointVisibility, duplicatePoint, updatePoint, updatePointLive } from './ui/pointsPanel.js';
import { switchTab, showCustomToast, slideDown, slideUp } from './ui/utils.js';
import { onFocusMathField, hideKeyboard, insertMath, executeMathCmd, toggleFunctionsPanel } from './ui/keyboard.js';
import { generateCode } from './core/generator.js';
import { login, register, logout, getToken, getUser, loginWithGoogle, updateProfile } from './api/auth.js';
import { saveGraph, getMyGraphs, loadSharedGraph, updateGraph, deleteGraph } from './api/graph.js';

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
  document.addEventListener('input', markDirty);
  document.addEventListener('change', markDirty);
  document.getElementById('currentGraphNameDisplay').oninput = (e) => {
      appState.currentGraphTitle = e.target.value.trim() || "Untitled Graph";
      markDirty();
  };

  document.addEventListener('click', (e) => {
      if (e.target.closest('.kbd-btn') || e.target.closest('button[onclick*="addFunction"]') || e.target.closest('button[onclick*="addPoint"]') || e.target.closest('button[onclick*="remove"]')) {
          markDirty();
      }
  });

  window.addEventListener("beforeunload", (e) => {
      if (appState.isDirty) {
          e.preventDefault();
          e.returnValue = "You have unsaved changes. Leave anyway?";
          return e.returnValue;
      }
  });

  const performNewGraph = () => {
      appState.currentGraphId = null;
      appState.currentGraphTitle = "Untitled Graph";
      
      resetSection("func");
      resetSection("points");
      resetSection("style");
      resetSection("dim");
      resetSection("styling");
      
      clearDirty();
      showCustomToast("Started a new graph.");
      window.history.pushState({}, '', window.location.pathname);
  };

  document.getElementById("newGraphBtn").onclick = () => {
      if (appState.isDirty) {
          const m = document.getElementById('unsavedChangesModal');
          m.classList.remove('hidden');
          
          document.getElementById('unsavedCancelBtn').onclick = () => m.classList.add('hidden');
          document.getElementById('unsavedConfirmBtn').onclick = () => {
              m.classList.add('hidden');
              performNewGraph();
          };
          
          document.getElementById('unsavedSaveNewBtn').onclick = () => {
              m.classList.add('hidden');
              appState.pendingNewGraphAction = true;
              document.getElementById('saveShareBtn').click();
          };
      } else {
          performNewGraph();
      }
  };

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

  // App Init Logic
  appState.isRegistering = false;
  
  const updateAuthUI = () => {
      const user = getUser();
      const userDisplay = document.getElementById('userDisplay');
      const userNameText = document.getElementById('userNameText');
      const authBtnText = document.getElementById('authBtnText');
      
      if (user) {
          authBtnText.innerText = 'My Graphs';
          if (userDisplay && userNameText) {
              userDisplay.classList.remove('hidden');
              userDisplay.classList.add('flex');
              
              // Prefer Full Name, then Email Prefix, then Username
              const displayName = user.fullName || (user.username.includes('@') ? user.username.split('@')[0] : user.username);
              userNameText.innerText = displayName;

              // Handle Avatar/Initials
              const avatarImg = document.getElementById('userAvatarImg');
              const initialsSpan = document.getElementById('userInitials');
              const avatarContainer = document.getElementById('userAvatarContainer');

              if (user.profilePicture) {
                  avatarImg.src = user.profilePicture;
                  avatarImg.onload = () => {
                      avatarImg.classList.remove('hidden');
                      initialsSpan.classList.add('hidden');
                  };
                  avatarImg.onerror = () => {
                      avatarImg.classList.add('hidden');
                      initialsSpan.classList.remove('hidden');
                  };
              } else {
                  avatarImg.classList.add('hidden');
                  initialsSpan.classList.remove('hidden');
                  initialsSpan.innerText = displayName.charAt(0).toUpperCase();
                  
                  // Palette for initials
                  const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600', 'bg-amber-600', 'bg-teal-600'];
                  const colorIdx = Math.abs(displayName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % colors.length);
                  avatarContainer.className = `w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner ${colors[colorIdx]}`;
              }
          }
      } else {
          authBtnText.innerText = 'Login';
          if (userDisplay) {
              userDisplay.classList.add('hidden');
              userDisplay.classList.remove('flex');
          }
      }
  };

  updateAuthUI();

  // Helper to resize and compress image to Base64
  const resizeImage = (file, maxWidth = 300, maxHeight = 300) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > maxWidth) {
                          height *= maxWidth / width;
                          width = maxWidth;
                      }
                  } else {
                      if (height > maxHeight) {
                          width *= maxHeight / height;
                          height = maxHeight;
                      }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
              };
              img.onerror = reject;
          };
          reader.onerror = reject;
      });
  };

  let pendingAvatarBase64 = null;

  // Profile Modal Logic
  const profileFileInput = document.getElementById('profileFileInput');
  const modalAvatarImg = document.getElementById('modalAvatarImg');
  const modalInitials = document.getElementById('modalInitials');

  profileFileInput.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
          try {
              pendingAvatarBase64 = await resizeImage(e.target.files[0]);
              modalAvatarImg.src = pendingAvatarBase64;
              modalAvatarImg.classList.remove('hidden');
              modalInitials.classList.add('hidden');
          } catch (err) {
              showCustomToast("Error processing image", true);
          }
      }
  };

  document.getElementById('userDisplay').onclick = () => {
      const user = getUser();
      if (!user) return;
      
      const modal = document.getElementById('profileModal');
      document.getElementById('profileFullName').value = user.fullName || '';
      document.getElementById('profilePicture').value = user.profilePicture || '';
      document.getElementById('profileUsername').value = user.username;
      
      // Update preview in modal
      const displayName = user.fullName || user.username;
      if (user.profilePicture) {
          modalAvatarImg.src = user.profilePicture;
          modalAvatarImg.classList.remove('hidden');
          modalInitials.classList.add('hidden');
      } else {
          modalAvatarImg.classList.add('hidden');
          modalInitials.classList.remove('hidden');
          modalInitials.innerText = displayName.charAt(0).toUpperCase();
      }
      
      pendingAvatarBase64 = null;
      modal.classList.remove('hidden');
  };

  document.getElementById('profileForm').onsubmit = async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('profileFullName').value.trim();
      const urlPicture = document.getElementById('profilePicture').value.trim();
      
      // File upload takes precedence over URL
      const finalPicture = pendingAvatarBase64 || urlPicture;
      
      const btn = document.getElementById('profileSubmitBtn');
      const oT = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...`;
      
      try {
          // Pass null for username as it's no longer changeable
          await updateProfile(null, fullName, finalPicture);
          showCustomToast("Profile updated successfully! ✨");
          document.getElementById('profileModal').classList.add('hidden');
          updateAuthUI();
      } catch (error) {
          showCustomToast(error.message, true);
      } finally {
          btn.innerHTML = oT;
      }
  };

  // Copy Feedback Enhancement
  const originalCopyBtn = document.getElementById('copyShareBtn');
  if (originalCopyBtn) {
      originalCopyBtn.addEventListener('click', () => {
          showCustomToast("Link copied to clipboard! 📋");
      });
  }

  // Initialize Google Login (Requires Client ID)
  // THE USER MUST REPLACE "YOUR_CLIENT_ID_HERE" WITH THEIR ACTUAL GOOGLE CLIENT ID!
  window.handleGoogleResponse = async (response) => {
      try {
          await loginWithGoogle(response.credential);
          document.getElementById('authModal').classList.add('hidden');
          updateAuthUI();
          showCustomToast('Welcome back via Google!');
      } catch (error) {
          const errorDiv = document.getElementById('authError');
          errorDiv.innerText = error.message;
          errorDiv.classList.remove('hidden');
      }
  };

  if (window.google) {
      window.google.accounts.id.initialize({
          // TODO: Replace with your actual Google Client ID from Google Cloud Console
          client_id: "630547532865-rpg2302opf2vvqo00biuhlcofc9uftra.apps.googleusercontent.com",
          callback: window.handleGoogleResponse
      });
      window.google.accounts.id.renderButton(
          document.getElementById("googleSignInBtn"),
          { theme: "outline", size: "large", width: "100%" }
      );
  }

  document.getElementById('authBtn').onclick = () => {
      if (getUser()) {
          document.getElementById('myGraphsModal').classList.remove('hidden');
          loadMyGraphsList();
      } else {
          document.getElementById('authModal').classList.remove('hidden');
      }
  };

  document.getElementById('authToggleBtn').onclick = (e) => {
      e.preventDefault();
      appState.isRegistering = !appState.isRegistering;
      document.getElementById('authModalTitle').innerText = appState.isRegistering ? 'Register' : 'Login';
      document.getElementById('authToggleText').innerText = appState.isRegistering ? 'Already have an account?' : 'Need an account?';
      document.getElementById('authToggleBtn').innerText = appState.isRegistering ? 'Login' : 'Register';
  };

  document.getElementById('authForm').onsubmit = async (e) => {
      e.preventDefault();
      const u = document.getElementById('authUsername').value;
      const p = document.getElementById('authPassword').value;
      const errorDiv = document.getElementById('authError');
      const btn = document.getElementById('authSubmitBtn');
      errorDiv.classList.add('hidden');
      const origText = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing';
      try {
          if (appState.isRegistering) {
              await register(u, p);
          } else {
              await login(u, p);
          }
          document.getElementById('authModal').classList.add('hidden');
          updateAuthUI();
          showCustomToast('Welcome back!');
      } catch (error) {
          errorDiv.innerText = error.message;
          errorDiv.classList.remove('hidden');
      } finally {
          btn.innerHTML = origText;
      }
  };

  document.getElementById('logoutBtn').onclick = () => {
      logout();
      document.getElementById('myGraphsModal').classList.add('hidden');
      updateAuthUI();
      showCustomToast('Logged out');
  };

  window.renameSavedGraph = async (shortId, currentTitle) => {
      const modal = document.getElementById('renameGraphModal');
      const input = document.getElementById('renameGraphTitleInput');
      input.value = currentTitle;
      modal.classList.remove('hidden');
      setTimeout(() => input.select(), 100);
      
      document.getElementById('confirmRenameGraphBtn').onclick = async () => {
          const newTitle = input.value.trim();
          if (!newTitle || newTitle === currentTitle) {
              modal.classList.add('hidden');
              return;
          }
          
          const btn = document.getElementById('confirmRenameGraphBtn');
          const oT = btn.innerHTML;
          btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving`;
          try {
              await updateGraph(shortId, { title: newTitle });
              showCustomToast("Graph renamed successfully!");
              modal.classList.add('hidden');
              loadMyGraphsList();
              if (appState.currentGraphId === shortId) {
                  appState.currentGraphTitle = newTitle;
                  clearDirty();
              }
          } catch (error) {
              if (error.message === "DUPLICATE_TITLE") {
                  showCustomToast(`A graph named "${newTitle}" already exists.`, true);
              } else {
                  showCustomToast(error.message, true);
              }
          } finally {
              btn.innerHTML = oT;
          }
      };
  };

  window.deleteSavedGraph = async (shortId, title) => {
      const modal = document.getElementById('deleteGraphModal');
      document.getElementById('deleteGraphTitleDisplay').innerText = title || "Untitled Graph";
      modal.classList.remove('hidden');
      
      document.getElementById('deleteCancelBtn').onclick = () => {
          modal.classList.add('hidden');
      };
      
      document.getElementById('deleteConfirmBtn').onclick = async () => {
          const btn = document.getElementById('deleteConfirmBtn');
          const oT = btn.innerHTML;
          btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Deleting`;
          try {
              await deleteGraph(shortId);
              showCustomToast("Graph deleted successfully.");
              modal.classList.add('hidden');
              loadMyGraphsList();
              if (appState.currentGraphId === shortId) {
                  appState.currentGraphId = null;
                  appState.currentGraphTitle = "Untitled Graph";
                  appState.isDirty = false;
                  clearDirty();
                  document.getElementById('currentGraphNameDisplay').value = "Untitled Graph";
                  window.history.pushState({}, '', window.location.pathname);
              }
          } catch (error) {
              showCustomToast("Delete error: " + error.message, true);
          } finally {
              btn.innerHTML = oT;
          }
      };
  };

  window.copyGraphLink = (shortId) => {
      const shareUrl = window.location.origin + window.location.pathname + "?graph=" + shortId;
      const t = document.createElement("textarea");
      t.value = shareUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
      showCustomToast('Link copied directly!');
  };

  const loadMyGraphsList = async () => {
      const gList = document.getElementById('myGraphsList');
      gList.innerHTML = '<div class="text-center col-span-full py-10 text-slate-400 italic">Loading...</div>';
      try {
          const graphs = await getMyGraphs();
          if (graphs.length === 0) {
              gList.innerHTML = '<div class="text-center col-span-full py-8 text-slate-400">No graphs saved yet.</div>';
              return;
          }
          gList.innerHTML = graphs.map(g => `
            <div class="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex justify-between items-center" onclick="window.location.search='?graph=${g.shortId}'">
              <div class="flex-grow truncate">
                <h3 class="font-bold text-sm text-slate-800 mb-1 truncate">${g.title || 'Untitled Graph'}</h3>
                <p class="text-[10px] text-slate-400">ID: ${g.shortId}</p>
              </div>
              <div class="flex items-center gap-1.5 ml-2 shrink-0">
                <button onclick="event.stopPropagation(); window.renameSavedGraph('${g.shortId}', '${(g.title || '').replace(/'/g, "\\'")}')" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Rename Graph">
                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                </button>
                <button onclick="event.stopPropagation(); window.deleteSavedGraph('${g.shortId}', '${(g.title || '').replace(/'/g, "\\'")}')" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Graph">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                <button onclick="event.stopPropagation(); window.copyGraphLink('${g.shortId}')" class="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Copy Link">
                    <i data-lucide="link" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `).join('');
          if (window.lucide) window.lucide.createIcons();
      } catch (e) {
          gList.innerHTML = '<div class="text-center col-span-full py-8 text-red-400">Error loading graphs</div>';
      }
  };

  document.getElementById('saveShareBtn').onclick = async () => {
      const user = getUser();
      if (!user) {
          document.getElementById('authModal').classList.remove('hidden');
          showCustomToast("Please login first to save and share graphs!", true);
          return;
      }
      
      const input = document.getElementById('saveGraphTitleInput');
      const nameBox = document.getElementById('currentGraphNameDisplay');
      
      let defaultTitle = "My Graph";
      if (nameBox && nameBox.value && nameBox.value.trim() !== "") {
          defaultTitle = nameBox.value.trim();
      } else if (appState.currentGraphTitle) {
          defaultTitle = appState.currentGraphTitle;
      }
      
      input.value = defaultTitle;
      document.getElementById('saveGraphModal').classList.remove('hidden');
      setTimeout(() => input.select(), 100);
  };

  document.getElementById('confirmSaveGraphBtn').onclick = async () => {
      const title = document.getElementById('saveGraphTitleInput').value.trim();
      if(!title) return;
      document.getElementById('saveGraphModal').classList.add('hidden');

      const btn = document.getElementById('saveShareBtn');
      const oT = btn.innerHTML;
      
      const settings = {};
      ["figW", "figH", "xMin", "xMax", "yMin", "yMax", "xStep", "yStep", "tickSize", "labelSize", "arrowW", "arrowH"].forEach((id) => {
          settings[id] = document.getElementById(id).value;
      });
      settings.showGrid = document.getElementById('showGrid').checked;
      settings.showArrows = document.getElementById('showArrows').checked;
      settings.showLabels = document.getElementById('showLabels').checked;
      settings.showOrigin = document.getElementById('showOrigin').checked;
      settings.showTicks = document.getElementById('showTicks').checked;
      settings.equalAspect = document.getElementById('equalAspect').checked;
      const central = document.querySelector('input[name="axisStyle"]:checked');
      settings.axisStyle = central ? central.value : 'central';

      if (appState.currentGraphId) {
          const performUpdate = async (overwriteFlag) => {
              btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${overwriteFlag ? 'Overwriting' : 'Saving'}`;
              try {
                  await updateGraph(appState.currentGraphId, {
                      title: title,
                      functionsState: appState.functionsState,
                      pointsState: appState.pointsState,
                      settings: settings,
                      isPublic: true,
                      overwrite: overwriteFlag
                  });
                  
                  appState.currentGraphTitle = title;
                  clearDirty();
                  
                  document.getElementById('shareModal').classList.remove('hidden');
                  const shareUrl = window.location.origin + window.location.pathname + "?graph=" + appState.currentGraphId;
                  window.history.pushState({}, '', shareUrl);
                  document.getElementById('shareUrlInput').value = shareUrl;
                  showCustomToast("Graph updated successfully!");
                  
                  if (appState.pendingNewGraphAction) {
                      appState.pendingNewGraphAction = false;
                      setTimeout(performNewGraph, 500);
                  }
              } catch (err) {
                  if (err.message === "DUPLICATE_TITLE" && !overwriteFlag) {
                      btn.innerHTML = oT;
                      const modal = document.getElementById('overwriteModal');
                      document.getElementById('overwriteMsg').innerText = `A graph named "${title}" already exists. Do you want to overwrite it?`;
                      modal.classList.remove('hidden');
                      
                      document.getElementById('overwriteCancelBtn').onclick = () => {
                          modal.classList.add('hidden');
                      };
                      
                      document.getElementById('overwriteConfirmBtn').onclick = () => {
                          modal.classList.add('hidden');
                          performUpdate(true);
                      };
                  } else {
                      showCustomToast("Save Error: " + err.message, true);
                  }
              } finally {
                  if (!document.getElementById('overwriteModal').classList.contains('hidden')) {
                      // wait for modal interaction
                  } else {
                      btn.innerHTML = oT;
                  }
              }
          };
          await performUpdate(false);
      } else {
          const performSave = async (overwriteFlag) => {
              btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${overwriteFlag ? 'Overwriting' : 'Saving'}`;
              try {
                  const res = await saveGraph(title, appState.functionsState, appState.pointsState, settings, true, overwriteFlag);
                  
                  appState.currentGraphId = res.shortId;
                  appState.currentGraphTitle = res.title;
                  clearDirty();
                  
                  document.getElementById('shareModal').classList.remove('hidden');
                  const shareUrl = window.location.origin + window.location.pathname + "?graph=" + res.shortId;
                  window.history.pushState({}, '', shareUrl);
                  document.getElementById('shareUrlInput').value = shareUrl;
                  btn.innerHTML = oT;
                  if (appState.pendingNewGraphAction) {
                      appState.pendingNewGraphAction = false;
                      setTimeout(performNewGraph, 500);
                  }
              } catch (err) {
                  if (err.message === "DUPLICATE_TITLE" && !overwriteFlag) {
                      btn.innerHTML = oT;
                      const modal = document.getElementById('overwriteModal');
                      document.getElementById('overwriteMsg').innerText = `A graph named "${title}" already exists. Do you want to overwrite it?`;
                      modal.classList.remove('hidden');
                      
                      document.getElementById('overwriteCancelBtn').onclick = () => {
                          modal.classList.add('hidden');
                      };
                      
                      document.getElementById('overwriteConfirmBtn').onclick = () => {
                          modal.classList.add('hidden');
                          performSave(true);
                      };
                  } else {
                      showCustomToast(err.message, true);
                      btn.innerHTML = oT;
                  }
              }
          };

          await performSave(false);
      }
  };

  document.getElementById('copyShareBtn').onclick = () => {
      const t = document.getElementById('shareUrlInput');
      t.select();
      document.execCommand('copy');
      showCustomToast('Link copied!');
  };

  // CHECK URL FOR SHARED GRAPH
  const urlParams = new URLSearchParams(window.location.search);
  const graphId = urlParams.get('graph');
  if (graphId) {
      try {
          const g = await loadSharedGraph(graphId);
          appState.functionsState = g.functionsState || [];
          appState.pointsState = g.pointsState || [];
          
          if(g.settings) {
            ["figW", "figH", "xMin", "xMax", "yMin", "yMax", "xStep", "yStep", "tickSize", "labelSize", "arrowW", "arrowH"].forEach((id) => {
              if (g.settings[id]) {
                const el = document.getElementById(id);
                if (el) el.value = g.settings[id];
              }
            });
            ["showGrid", "showArrows", "showLabels", "showOrigin", "showTicks", "equalAspect"].forEach((id) => {
              if (g.settings[id] !== undefined) {
                const el = document.getElementById(id);
                if (el) el.checked = g.settings[id];
              }
            });
          if(g.settings.axisStyle) {
              const central = document.querySelector(`input[name="axisStyle"][value="${g.settings.axisStyle}"]`);
              if (central) central.checked = true;
            }
          }
          
          appState.currentGraphId = g.shortId;
          appState.currentGraphTitle = g.title || "Shared Graph";
          clearDirty();
          showCustomToast("Loaded shared graph '" + g.title + "'");
      } catch (e) {
          showCustomToast("Error loading shared graph.", true);
      }
  }

  // Initialize Web Worker
  initWorker();
  
  if (window.lucide) {
      window.lucide.createIcons();
  }
}

window.onload = initApp;
