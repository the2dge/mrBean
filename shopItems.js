document.addEventListener("DOMContentLoaded", () => {
  // Ensure shopItemsData is available from data.js
  const container = document.querySelector(".shopItems");

  // Split the data into two categories: 
  // first 4 items (平裝) and next 4 items (精裝)
  const packItems = shopItemsData.slice(0, 4);
  const cannedItems = shopItemsData.slice(4, 8);

  // Global basket object to track quantities for each item (by id)
  window.basket = {};

  // Helper to safely get the current quantity for an item
  const getQuantity = (id) => window.basket[id] || 0;

  // Create HTML for a single item including the price and the buttons row
  const createItemHTML = (item) => `
    <li>
      <div class="fh5co-food-desc">
        <figure>
          <img src="${item.img}" class="img-responsive" alt="Image for ${item.name}">
        </figure>
        <div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>
      </div>
      <div class="fh5co-food-pricing">
        <div class="price">$${item.price}</div>
        <!-- Row with buttons for adding/removing items -->
        <div class="buttons">
          <i onclick="decrement('${item.id}')" class="fa-solid fa-circle-minus"></i>
          <div id="quantity-${item.id}" class="quantity">
            ${getQuantity(item.id)}
          </div>
          <i onclick="increment('${item.id}')" class="fa-solid fa-circle-plus"></i>
        </div>
      </div>
    </li>
  `;

  // Build HTML for the two sections
  const packHTML = `
    <div class="col-md-6">
      <div class="fh5co-food-menu to-animate-2">
        <h2 class="fh5co-drinks">大分享包</h2>
        <ul>
          ${packItems.map(createItemHTML).join("")}
        </ul>
      </div>
    </div>
  `;

  const cannedHTML = `
    <div class="col-md-6">
      <div class="fh5co-food-menu to-animate-2">
        <h2 class="fh5co-dishes">精美罐裝</h2>
        <ul>
          ${cannedItems.map(createItemHTML).join("")}
        </ul>
      </div>
    </div>
  `;

  // Insert the generated HTML into the container element
  container.innerHTML = packHTML + cannedHTML;

// Event delegation: Listen for clicks within the cartTab's listCart container
  const listCart = document.querySelector('.listCart');
  listCart.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-tab-plus')) {
      const id = e.target.dataset.id;
      increment(id);
    } else if (e.target.classList.contains('cart-tab-minus')) {
      const id = e.target.dataset.id;
      decrement(id);
    }
  });

});
  const cartEl = document.querySelector(".cart");
  const cartTabEl = document.querySelector(".cartTab");
  const closeBtn = cartTabEl.querySelector(".close");

  // When the cart is clicked, show the cart tab
  cartEl.addEventListener("click", () => {
    cartTabEl.classList.add("active");
    console.log("Cart tab activated", cartTabEl);
  });

  // When the close button inside the cart tab is clicked, hide the cart tab
  closeBtn.addEventListener("click", () => {
    cartTabEl.classList.remove("active");
    console.log("Cart tab closed", cartTabEl);
  });


// Global functions for cart operations

function increment(id) {
  if (!window.basket[id]) {
    window.basket[id] = 0;
  }
  window.basket[id]++;
  updateQuantity(id);
  updateCartAmount();
  updateCartTab();
}

function decrement(id) {
  if (!window.basket[id]) {
    window.basket[id] = 0;
  }
  if (window.basket[id] > 0) {
    window.basket[id]--;
    updateQuantity(id);
    updateCartAmount();
    updateCartTab();
  }
}

// Update the quantity display for a given item
function updateQuantity(id) {
  const qtyElem = document.getElementById(`quantity-${id}`);
  if (qtyElem) {
    qtyElem.innerText = window.basket[id];
  }
}

// Update the global cart amount display
function updateCartAmount() {
  const cartAmountElem = document.getElementById("cartAmount");
  if (!cartAmountElem) return;
  let totalItems = 0;
  for (const key in window.basket) {
    totalItems += window.basket[key];
  }
  cartAmountElem.innerText = totalItems;
}

// Update the cartTab with the selected items, their subtotals, and a Grand Total
function updateCartTab() {
  const listCart = document.querySelector(".listCart");
  if (!listCart) return;
  let html = "";
  let grandTotal = 0;
  
  // Iterate over the basket items and display only those with quantity > 0
  for (const key in window.basket) {
    if (window.basket[key] > 0) {
      // Find the corresponding item in shopItemsData
      const item = shopItemsData.find((product) => product.id === key);
      if (item) {
        const quantity = window.basket[key];
        const subtotal = item.price * quantity;
        grandTotal += subtotal;
        html += `
          <div class="cart-item">
            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-quantity">
                <i class="fa-solid fa-circle-minus cart-tab-minus" data-id="${item.id}"></i>
                <span class="cart-tab-quantity">${quantity}</span>
                <i class="fa-solid fa-circle-plus cart-tab-plus" data-id="${item.id}"></i>
              </div>
            </div>
            <div class="cart-item-subtotal">$${subtotal}</div>
          </div>
        `;
      }
    }
  }
  
  // Append the grand total line
  html += `
    <div class="cart-total">
      總金額: $${grandTotal}
    </div>
  `;
  
  listCart.innerHTML = html;
}
let toCheckout = async () => {
  // Convert the basket object into an array of order items.
  // Only include products with quantity greater than 0.
  let dataToSave = Object.entries(window.basket)
    .filter(([id, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      // Find the matching product in shopItemsData
      let product = shopItemsData.find(item => item.id === id) || {};
      return {
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: quantity * product.price
      };
    });
  
  // If there are no items, alert the user and exit.
  if (dataToSave.length === 0) {
    alert("請先加入商品再進行結帳！");
    return;
  }
  
  // Generate an order ID based on the current date and seconds since midnight.
  let now = new Date();
  
  // Base year for encoding (adjust as needed)
  let startYear = 2024; 
  let yearOffset = now.getFullYear() - startYear;
  let totalMonths = yearOffset * 12 + now.getMonth(); // Total months since January 2024
  
  // Encode the month into a two-letter code (AA, AB, AC, etc.)
  let monthCode = String.fromCharCode(65 + Math.floor(totalMonths / 26)) + 
                  String.fromCharCode(65 + (totalMonths % 26));
  
  // Day of the month (2 digits)
  let dayCode = String(now.getDate()).padStart(2, '0');
  
  // Seconds since start of day (5 digits)
  let secondsSinceStartOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let secondsCode = String(secondsSinceStartOfDay).padStart(5, '0');
  
  let orderId = `${monthCode}${dayCode}${secondsCode}`;
  
  // Prepare the payload for the webhook
  let payload = JSON.stringify({
    orders: dataToSave,
    timestamp: now.toISOString(),
    orderId: orderId
  });
  
  try {
    // Post the payload to the Google Sheet via your webhook URL.
    const response = await fetch("https://script.google.com/macros/s/AKfycbxo2PQvT5_UghjtIz3q7MTUy2JRBQ0W-kPzAUk8ciqyUxUBH7kNeVrMzqfSlCB3vcqe/exec", {
      method: "POST",
      mode: "no-cors", // Use no-cors mode for Google Apps Script webhook
      headers: {
        "Content-Type": "text/plain"
      },
      body: payload
    });
    
    // Because of no-cors mode, we cannot read the response.
    alert("訂單送出成功！");
    
    // Redirect to an order confirmation page, passing the orderId as a parameter.
    window.location.href = `https://the2dge.github.io/clothshop/order/?MerchantTradeNo=${orderId}`;
    
  } catch (error) {
    console.error("Checkout error:", error);
    alert("訂單送出失敗，請稍後再試！");
  }
};