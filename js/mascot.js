import { Mascot, createElement, createRoot } from "./vendor/page-mascot.js";

const layer = document.querySelector("[data-fox-mascot]");
const fox = layer.querySelector(".mascot-fox");
const toggle = document.querySelector("[data-mascot-toggle]");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const preferenceKey = "lop-hoc-ai.fox-paused";
const directions = new URL("../assets/mascots/fox-directions.webp", import.meta.url).href;
const reactions = new URL("../assets/mascots/fox-reactions.webp", import.meta.url).href;
const movementInterval = 5000;
const glideDuration = 3000;
const safeMargin = 10;
const protectedContent = [
  ".slide.active .slide-inner",
  ".hero-content", ".progress-card", ".section-heading", ".course-card",
  ".practice", ".extra-exercises", ".site-footer", ".mascot-toggle-floating"
].join(", ");

let paused = false;
let timer;
let glide;

try {
  paused = localStorage.getItem(preferenceKey) === "1";
} catch {
  // Pause remains available for the current page.
}

function movementBounds() {
  const { clientWidth, clientHeight } = document.documentElement;
  const header = document.querySelector(".topbar, .site-header");
  const navigation = document.querySelector(".slide-nav");
  const top = Math.max(0, header.getBoundingClientRect().bottom);
  const bottom = navigation?.getBoundingClientRect().top ?? clientHeight;
  const minY = Math.min(top + safeMargin, clientHeight - fox.offsetHeight);

  return {
    left: safeMargin,
    right: Math.max(safeMargin, clientWidth - fox.offsetWidth - safeMargin),
    top: minY,
    bottom: Math.max(minY, bottom - fox.offsetHeight - safeMargin),
  };
}

function contentRectangles() {
  return [...document.querySelectorAll(protectedContent)]
    .map((element) => element.getBoundingClientRect())
    .filter((box) => box.width && box.height);
}

function routeTouchesContent(start, end, boxes) {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x) + fox.offsetWidth;
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y) + fox.offsetHeight;
  return boxes.some((box) =>
    left < box.right && right > box.left && top < box.bottom && bottom > box.top
  );
}

function placeFox(point, boxes) {
  fox.style.transform = `translate(${point.x}px, ${point.y}px)`;
  updateClearance(boxes);
}

function updateClearance(boxes = contentRectangles()) {
  const { left: x, top: y } = fox.getBoundingClientRect();
  const overlaps = routeTouchesContent({ x, y }, { x, y }, boxes);
  if (!glide) fox.style.opacity = overlaps ? "0.32" : "1";
  fox.toggleAttribute("data-interactive", !overlaps && glide?.playState !== "running");
}

function chooseDestination(start, bounds, boxes) {
  const stops = [0, 0.25, 0.5, 0.75, 1];
  const distant = stops.flatMap((x) => stops.map((y) => ({
    x: bounds.left + (bounds.right - bounds.left) * x,
    y: bounds.top + (bounds.bottom - bounds.top) * y,
  }))).filter((point) => Math.hypot(point.x - start.x, point.y - start.y) > 55);
  const clear = distant.filter((point) => !routeTouchesContent(point, point, boxes));
  const clearRoutes = clear.filter((point) => !routeTouchesContent(start, point, boxes));
  // Favor clear paths while still allowing the fox to cross to the other side.
  const candidates = clear.length ? [...clear, ...clearRoutes] : distant;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function moveFox() {
  const bounds = movementBounds();
  const boxes = contentRectangles();
  const rect = fox.getBoundingClientRect();
  const start = { x: rect.left, y: rect.top };
  const end = chooseDestination(start, bounds, boxes);
  if (!end) return;

  const from = { transform: fox.style.transform, opacity: fox.style.opacity };
  const to = {
    transform: `translate(${end.x}px, ${end.y}px)`,
    opacity: routeTouchesContent(end, end, boxes) ? 0.32 : 1,
  };
  fox.style.transform = to.transform;
  fox.style.opacity = to.opacity;
  fox.removeAttribute("data-interactive");
  const opacity = routeTouchesContent(start, end, boxes) ? 0.32 : 1;
  glide = fox.animate([
    from,
    { opacity, offset: 0.12 },
    { opacity, offset: 0.88 },
    to,
  ], { duration: glideDuration, easing: "cubic-bezier(.35,0,.25,1)" });
  glide.onfinish = () => {
    glide = undefined;
    placeFox(end, contentRectangles());
  };
}

function updateMotion() {
  const label = paused ? "Cho cáo di chuyển" : "Tạm dừng cáo";
  toggle.hidden = motionPreference.matches;
  toggle.textContent = paused ? "▶" : "Ⅱ";
  toggle.setAttribute("aria-label", label);
  toggle.title = label;

  clearInterval(timer);
  if (motionPreference.matches) {
    glide?.cancel();
    glide = undefined;
    updateClearance();
    return;
  }
  if (paused || document.hidden || fox.querySelector(":focus-visible")) {
    glide?.pause();
    updateClearance();
    return;
  }
  glide?.play();
  updateClearance();
  timer = setInterval(moveFox, movementInterval);
}

function resetPosition() {
  glide?.cancel();
  glide = undefined;
  const bounds = movementBounds();
  const boxes = contentRectangles();
  const corner = { x: bounds.right, y: bounds.bottom };
  const start = routeTouchesContent(corner, corner, boxes)
    ? chooseDestination(corner, bounds, boxes) ?? corner
    : corner;
  placeFox(start, boxes);
}

toggle.addEventListener("click", () => {
  paused = !paused;
  try {
    localStorage.setItem(preferenceKey, paused ? "1" : "0");
  } catch {
    // The current page keeps the selected state.
  }
  updateMotion();
});

fox.addEventListener("focusin", updateMotion);
fox.addEventListener("focusout", () => queueMicrotask(updateMotion));
motionPreference.addEventListener("change", updateMotion);
document.addEventListener("visibilitychange", updateMotion);
window.addEventListener("resize", resetPosition);
document.addEventListener("scroll", () => updateClearance(), { capture: true, passive: true });

const deck = document.querySelector("#deck");
if (deck) {
  const slideObserver = new MutationObserver(() => updateClearance());
  slideObserver.observe(deck, { subtree: true, attributes: true, attributeFilter: ["class"] });
}

createRoot(fox).render(createElement(Mascot, {
  directions,
  reactions,
  size: 86,
  label: "fox",
  className: "fox-character",
}));
layer.hidden = false;
resetPosition();
updateMotion();
