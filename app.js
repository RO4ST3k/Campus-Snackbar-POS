"use strict";

const products = [
  { id: 1, name: "Classic Burger", price: 55.00 },
  { id: 2, name: "Cheeseburger", price: 65.00 },
  { id: 3, name: "Ham Sandwich", price: 40.00 },
  { id: 4, name: "French Fries (Regular)", price: 45.00 },
  { id: 5, name: "Nachos", price: 50.00 },
  { id: 6, name: "Soda (Can)", price: 25.00 }
];

// Each cart entry holds a product and its quantity.
const cart = [];
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalAmount = document.getElementById("total-amount");
const statusMessage = document.getElementById("status-message");
const paymentForm = document.getElementById("payment-form");
const cashPayment = document.getElementById("cash-payment");
const paymentError = document.getElementById("payment-error");
const paymentSuccess = document.getElementById("payment-success");
const confirmPaymentButton = document.getElementById("confirm-payment");
const receipt = document.getElementById("receipt");
let paymentCompleted = false;
let transactionSequence = 0;

function getTotal() {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function clearPaymentError() {
  paymentError.textContent = "";
  paymentError.hidden = true;
  cashPayment.removeAttribute("aria-invalid");
}

function showPaymentError(message) {
  paymentError.textContent = message;
  paymentError.hidden = false;
  cashPayment.setAttribute("aria-invalid", "true");
  cashPayment.focus();
}

function confirmPayment(event) {
  event.preventDefault();
  if (paymentCompleted) return;
  clearPaymentError();
  const rawPayment = cashPayment.value.trim();
  const amountPaid = Number(rawPayment);

  // Number inputs can report malformed text as an empty value with badInput.
  if (cashPayment.validity.badInput || !Number.isFinite(amountPaid)) {
    showPaymentError("Cash payment must be a valid number.");
    return;
  }
  if (rawPayment === "") {
    showPaymentError("Please enter a cash payment.");
    return;
  }
  if (amountPaid < 0) {
    showPaymentError("Cash payment cannot be negative.");
    return;
  }
  // Work in centavos so change calculations do not accumulate rounding errors.
  const paidCentavos = Math.round(amountPaid * 100);
  if (!Number.isSafeInteger(paidCentavos) || cashPayment.validity.stepMismatch) {
    showPaymentError("Enter a valid cash amount with at most two decimal places.");
    return;
  }
  if (cart.length === 0) {
    showPaymentError("Add at least one product before confirming payment.");
    return;
  }
  const totalCentavos = Math.round(getTotal() * 100);
  if (paidCentavos < totalCentavos) {
    showPaymentError(`Insufficient payment. The total amount due is ${formatCurrency(totalCentavos / 100)}.`);
    return;
  }

  const change = (paidCentavos - totalCentavos) / 100;
  transactionSequence += 1;
  document.getElementById("receipt-reference").textContent = `CSB-${Date.now()}-${transactionSequence}`;
  document.getElementById("receipt-items").innerHTML = cart.map(({ product, quantity }) => `
    <div class="receipt-item">
      <span>${product.name} × ${quantity}</span>
      <strong>${formatCurrency(product.price * quantity)}</strong>
    </div>
  `).join("");
  document.getElementById("receipt-total").textContent = formatCurrency(totalCentavos / 100);
  document.getElementById("receipt-paid").textContent = formatCurrency(paidCentavos / 100);
  document.getElementById("receipt-change").textContent = formatCurrency(change);
  paymentSuccess.textContent = `Payment successful! Change: ${formatCurrency(change)}.`;
  paymentSuccess.hidden = false;
  receipt.hidden = false;
  paymentCompleted = true;
  cashPayment.disabled = true;
  confirmPaymentButton.disabled = true;
  // Keep the completed order and receipt consistent until a new transaction.
  document.querySelectorAll(".add-button, .quantity-button, .remove-button")
    .forEach(button => { button.disabled = true; });
  document.getElementById("new-transaction").focus();
}

function startNewTransaction() {
  cart.length = 0;
  paymentCompleted = false;
  cashPayment.value = "";
  cashPayment.disabled = false;
  confirmPaymentButton.disabled = false;
  clearPaymentError();
  paymentSuccess.textContent = "";
  paymentSuccess.hidden = true;
  receipt.hidden = true;
  document.getElementById("receipt-items").innerHTML = "";
  ["receipt-reference", "receipt-total", "receipt-paid", "receipt-change"]
    .forEach(id => { document.getElementById(id).textContent = ""; });
  statusMessage.textContent = "New transaction started.";
  renderProducts();
  renderCart();
  cashPayment.focus();
}

function formatCurrency(amount) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function renderProducts() {
  productList.innerHTML = products.map(product => `
    <article class="product-card">
      <h3>${product.name}</h3>
      <p class="price">${formatCurrency(product.price)}</p>
      <button class="add-button" type="button" data-id="${product.id}"
        aria-label="Add ${product.name} to cart">+ Add to Cart</button>
    </article>
  `).join("");
}

function addToCart(productId) {
  if (paymentCompleted) return;
  const product = products.find(product => product.id === productId);
  if (!product) return;
  const existingItem = cart.find(item => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  renderCart();
  statusMessage.textContent = `${product.name} added to cart.`;
}

function increaseQuantity(productId) {
  if (paymentCompleted) return;
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;
  item.quantity += 1;
  renderCart();
}

function decreaseQuantity(productId) {
  if (paymentCompleted) return;
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;
  if (item.quantity === 1) {
    removeFromCart(productId);
  } else {
    item.quantity -= 1;
    renderCart();
  }
}

function removeFromCart(productId) {
  if (paymentCompleted) return;
  const index = cart.findIndex(item => item.product.id === productId);
  if (index === -1) return;
  const removedName = cart[index].product.name;
  cart.splice(index, 1);
  renderCart();
  statusMessage.textContent = `${removedName} removed from cart.`;
}

function renderCart() {
  clearPaymentError();
  // Preserve keyboard focus when quantity controls are rebuilt.
  const focusedButton = cartItems.contains(document.activeElement)
    ? document.activeElement : null;
  const focusedId = focusedButton?.dataset.id;
  const focusedAction = focusedButton?.dataset.action;

  cartItems.innerHTML = cart.length === 0
    ? '<div class="empty-cart"><strong>Your cart is empty</strong>Add a product to start your order.</div>'
    : cart.map(({ product, quantity }) => `
      <article class="cart-item">
        <div class="item-details">
          <div>
            <h3>${product.name}</h3>
            <p class="unit-price">${formatCurrency(product.price)} each</p>
          </div>
          <strong class="subtotal" aria-label="Subtotal for ${product.name}">
            ${formatCurrency(product.price * quantity)}
          </strong>
        </div>
        <div class="item-controls">
          <div class="quantity-controls">
            <button type="button" class="quantity-button" data-action="decrease" data-id="${product.id}"
              aria-label="Decrease quantity of ${product.name}">−</button>
            <span class="quantity" aria-label="Quantity">${quantity}</span>
            <button type="button" class="quantity-button" data-action="increase" data-id="${product.id}"
              aria-label="Increase quantity of ${product.name}">+</button>
          </div>
          <button type="button" class="remove-button" data-action="remove" data-id="${product.id}"
            aria-label="Remove ${product.name} from cart">Remove</button>
        </div>
      </article>
    `).join("");

  const total = getTotal();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  totalAmount.textContent = formatCurrency(total);
  cartCount.textContent = `${count} ${count === 1 ? "item" : "items"} in your order`;

  if (focusedId && focusedAction) {
    const nextButton = cartItems.querySelector(`[data-id="${focusedId}"][data-action="${focusedAction}"]`)
      || cartItems.querySelector("button")
      || productList.querySelector(`[data-id="${focusedId}"]`);
    nextButton?.focus();
  }
}

productList.addEventListener("click", event => {
  const button = event.target.closest("button[data-id]");
  if (button) addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const productId = Number(button.dataset.id);
  switch (button.dataset.action) {
    case "increase": increaseQuantity(productId); break;
    case "decrease": decreaseQuantity(productId); break;
    case "remove": removeFromCart(productId); break;
  }
});

paymentForm.addEventListener("submit", confirmPayment);
cashPayment.addEventListener("input", clearPaymentError);
document.getElementById("new-transaction").addEventListener("click", startNewTransaction);

renderProducts();
renderCart();
