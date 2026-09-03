function initRadialFab(root) {
  const toggle = root.querySelector(".radial-fab-toggle");
  const itemsContainer = root.querySelector(".radial-fab-items");
  const items = itemsContainer
    ? Array.from(itemsContainer.querySelectorAll(".radial-fab-item"))
    : [];

  if (!toggle || !items.length) return;

  const radius = 92;
  const startAngle = 180;
  const endAngle = 270;
  const angleStep = items.length > 1 ? (endAngle - startAngle) / (items.length - 1) : 0;

  items.forEach((item, index) => {
    const angle = (startAngle + angleStep * index) * (Math.PI / 180);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    item.style.setProperty("--radial-x", `${x}px`);
    item.style.setProperty("--radial-y", `${y}px`);
    item.style.transitionDelay = `${index * 0.03}s`;
  });

  function close() {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = root.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });

  items.forEach((item) => item.addEventListener("click", close));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".radial-fab").forEach(initRadialFab);
});
