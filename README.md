
```markdown
Campus Snack Bar POS
IT 415 Midterm Practical Examination

A simple Point of Sale system built using pure HTML, CSS, and vanilla JavaScript for a practical exam.

## Features

- Product list with six snack bar items
- Add products to the shopping cart
- Increase, decrease, and remove item quantities
- Automatic item subtotals and total amount
- Cash payment validation
- Automatic change calculation
- Digital receipt with a transaction reference number
- Start a new transaction and reset the order

## Products

| Product | Price |
|---------|------:|
| Classic Burger | ₱55.00 |
| Cheeseburger | ₱65.00 |
| Ham Sandwich | ₱40.00 |
| French Fries (Regular) | ₱45.00 |
| Nachos | ₱50.00 |
| Soda (Can) | ₱25.00 |

## Technologies Used

- HTML — page structure
- CSS — styling and responsive layout
- JavaScript — cart, payment, and receipt logic

## Project Files

- `index.html`
- `style.css`
- `app.js`

## How to Run

1. Download or clone this repository.
2. Open `index.html` in a web browser.
3. No installation or dependencies are required.

## How to Use

1. Click **Add to Cart** to select products.
2. Adjust quantities using **+** and **−**, or click **Remove**.
3. Enter the customer's cash payment.
4. Click **Confirm Payment** to display the change and receipt.
5. Click **Start New Transaction** to clear the order.

## Payment Validation

The system rejects blank, non-numeric, negative, and insufficient payments. Cash amounts must have at most two decimal places. Payment also requires at least one item in the cart.

## Limitations

This is a browser-based demonstration. It does not process real payments or save transaction history. Refreshing the page resets the current order.
```
