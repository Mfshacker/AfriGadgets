document.addEventListener("DOMContentLoaded", async function () {
  await window.productsReady;

  const offerProducts = products.filter((product) => {
    const regular = Number(product.original_price);
    const sale = Number(product.price);
    return product.is_on_offer === true && Number.isFinite(regular) && Number.isFinite(sale) && regular > sale;
  });

  renderProducts("offersProducts", offerProducts);
});
