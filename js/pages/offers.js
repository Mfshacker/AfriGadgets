document.addEventListener("DOMContentLoaded", async function () {
  await window.productsReady;
  const picks = [...products].slice(0, 8);
  renderProducts("offersProducts", picks);
});
