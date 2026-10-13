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
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;
  item.quantity += 1;
  renderCart();
}

function decreaseQuantity(productId) {
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
  const index = cart.findIndex(item => item.product.id === productId);
  if (index === -1) return;
  const removedName = cart[index].product.name;
  cart.splice(index, 1);
  renderCart();
  statusMessage.textContent = `${removedName} removed from cart.`;
}

function renderCart() {
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

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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

renderProducts();
renderCart();
