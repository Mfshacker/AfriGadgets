document.addEventListener("DOMContentLoaded", async function () {
  await window.productsReady;
  let latest = [...products];
  latest.sort((a, b) => {
    if (a.created_at && b.created_at) return new Date(b.created_at) - new Date(a.created_at);
    return Number(b.id) - Number(a.id);
  });
  renderProducts("newProducts", latest.slice(0, 8));
});
