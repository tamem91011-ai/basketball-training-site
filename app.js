const toTop = document.getElementById('toTop');
if (toTop) {
  const toggleTop = () => {
    if (window.scrollY > 300) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  window.addEventListener('scroll', toggleTop);
  toggleTop();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function pageKey() {
  const name = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  return `bhub_progress_${name.replace(".html","")}`;
}

function readProgress(total) {
  try {
    const raw = localStorage.getItem(pageKey());
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.filter(n => Number.isInteger(n) && n >= 0 && n < total));
  } catch {
    return new Set();
  }
}

function writeProgress(set) {
  localStorage.setItem(pageKey(), JSON.stringify(Array.from(set).sort((a,b)=>a-b)));
}

function updateProgressFor(container) {
  const btns = $$(".complete-btn", container);
  const total = btns.length || 1;
  const doneCount = btns.filter(b => b.classList.contains("done")).length;
  const pct = Math.round((doneCount / total) * 100);

  const tracker = $(".progress-tracker", container);
  if (tracker) {
    const bar = $(".progress-bar span", tracker);
    const text = $(".progress-text strong", tracker);
    if (bar)  bar.style.width = pct + "%";
    if (text) text.textContent = pct + "%";
  }
}

function initPersistentProgress() {
  const program = $(".program");
  if (!program) return;

  const btns = $$(".complete-btn", program);
  btns.forEach((btn, i) => btn.dataset.index = String(i));

  const saved = readProgress(btns.length);
  btns.forEach((btn, i) => {
    if (saved.has(i)) btn.classList.add("done");
  });
  updateProgressFor(program);

  program.addEventListener("click", (e) => {
    const btn = e.target.closest(".complete-btn");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    const set = readProgress(btns.length);

    btn.classList.toggle("done");
    if (btn.classList.contains("done")) set.add(idx);
    else set.delete(idx);

    writeProgress(set);
    updateProgressFor(program);
  });
}

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;
  const msg = $("#formMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    if (!name || !isEmail || !message) {
      if (msg) { msg.textContent = "Please complete all fields with a valid email."; msg.style.color = "#ff6464"; }
      return;
    }
    if (msg) { msg.textContent = "Thanks! Your message was recorded (demo)."; msg.style.color = "#3ddc97"; }
    form.reset();
  });
}


function initCueToggle() {
  const program = $(".program");
  if (!program) return;

  const cues = $$("details", program);
  if (cues.length === 0) return;

  
  const toolbar = document.createElement("div");
  toolbar.className = "pill-row"; 
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "pill";
  toggleBtn.textContent = "Expand all coaching cues";

  function updateLabel() {
    const anyClosed = cues.some(d => !d.open);
    toggleBtn.textContent = anyClosed ? "Expand all coaching cues" : "Collapse all coaching cues";
  }

  toggleBtn.addEventListener("click", () => {
    const anyClosed = cues.some(d => !d.open);
    cues.forEach(d => { d.open = anyClosed; });
    updateLabel();
  });

  updateLabel();

  const tracker = $(".progress-tracker", program);
  if (tracker && tracker.parentNode) {
    tracker.parentNode.insertBefore(toolbar, tracker.nextSibling);
  } else {
    program.insertBefore(toolbar, program.firstChild);
  }
  toolbar.appendChild(toggleBtn);
}

document.addEventListener("DOMContentLoaded", () => {
  initPersistentProgress();
  initContactForm();
  initCueToggle();   
});


