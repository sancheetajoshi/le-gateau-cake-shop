

const cakeImages = {
  "Ferrero Rocher Cake": "images/ferrero rocher.png",
  "Dark Chocolate Fantasy": "images/dark chocolate.png",
  "Rasmalai Cake": "images/rasmalai.png",
  "Rainbow Pastel Cake": "images/rainbow.png",
  "Salted Caramel Noir": "images/salted caramel.png",
  "Strawberry Silk": "images/strawberry.png",
  "Vanilla Pearl": "images/vanilla.png",
  "Irish Coffee Cake": "images/irish coffee.png",
  "4 in 1 Baked Cheesecake": "images/cheesecake.png"
};

const trackingSteps = [
  { status: "Order Placed", description: "Your order has been received by Le Gateau." },
  { status: "Order Confirmed", description: "Your order has been confirmed by our atelier." },
  { status: "Baking", description: "Your cake is being freshly baked." },
  { status: "Decorating", description: "Our pastry team is decorating your cake." },
  { status: "Out for Delivery", description: "Your cake is on its way to you." },
  { status: "Delivered", description: "Your cake has been successfully delivered." }
];

function currentCustomerId() {
  return localStorage.getItem("customerId");
}

function showMessage(element, text, success = false) {
  if (!element) return;
  element.textContent = text;
  element.style.color = success ? "#52704f" : "#a13b32";
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function responseData(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server response was not JSON. Check app.js and the terminal.");
  }
}

function saveCustomer(customer) {
  localStorage.setItem("customerId", String(customer.id));
  localStorage.setItem("customerName", customer.full_name || "");
  localStorage.setItem("customerEmail", customer.email || "");
  localStorage.setItem("legateau_current_user", String(customer.id));
  localStorage.setItem("legateau_loggedin", "true");
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[char]));
}

/* MENU FILTERS */
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item =>
      item.classList.remove("active")
    );

    button.classList.add("active");
    const filter = button.dataset.filter || "all";

    document.querySelectorAll(".menu-cake").forEach(cake => {
      const category = cake.dataset.category || "";
      cake.style.display =
        filter === "all" || category.includes(filter) ? "" : "none";
    });
  });
});

/* REGISTER */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nameEl = document.getElementById("regName");
    const phoneEl = document.getElementById("regPhone");
    const emailEl = document.getElementById("regEmail");
    const passwordEl = document.getElementById("regPassword");
    const confirmEl = document.getElementById("regConfirmPassword");
    const msg = document.getElementById("registerMsg");

    if (!nameEl || !phoneEl || !emailEl || !passwordEl || !confirmEl) {
      showMessage(msg, "Registration fields do not match the IDs expected by script.js.");
      return;
    }

    const full_name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value;
    const confirmPassword = confirmEl.value;

    if (full_name.length < 2 || !/^[A-Za-z ]+$/.test(full_name)) {
      showMessage(msg, "Enter your full name using letters and spaces only.");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      showMessage(msg, "Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!validEmail(email)) {
      showMessage(msg, "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showMessage(msg, "Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage(msg, "Passwords do not match.");
      return;
    }

    showMessage(msg, "Creating your account...", true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, phone, email, password })
      });

      const data = await responseData(response);

      if (!response.ok || !data.success) {
        showMessage(msg, data.message || "Registration failed.");
        return;
      }

      if (!data.customer || !data.customer.id) {
        showMessage(msg, "Account response is missing customer details. Check /api/register in app.js.");
        return;
      }

      saveCustomer(data.customer);
      showMessage(msg, "Registration successful! Opening cake customisation...", true);

      setTimeout(() => {
        window.location.href = "customise.html";
      }, 1000);

    } catch (error) {
      console.error("Registration error:", error);
      showMessage(msg, error.message || "Cannot connect. Make sure node app.js is running.");
    }
  });
}

/* LOGIN */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const emailEl = document.getElementById("loginEmail");
    const passwordEl = document.getElementById("loginPassword");
    const msg = document.getElementById("loginMsg");

    if (!emailEl || !passwordEl) {
      showMessage(msg, "Login fields do not match the IDs expected by script.js.");
      return;
    }

    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value;

    if (!validEmail(email)) {
      showMessage(msg, "Please enter a valid email address.");
      return;
    }

    if (!password) {
      showMessage(msg, "Please enter your password.");
      return;
    }

    showMessage(msg, "Logging in...", true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await responseData(response);

      if (!response.ok || !data.success) {
        showMessage(msg, data.message || "Login failed.");
        return;
      }

      if (!data.customer || !data.customer.id) {
        showMessage(msg, "Login response is missing customer details. Check /api/login in app.js.");
        return;
      }

      saveCustomer(data.customer);
      showMessage(msg, "Login successful! Welcome back.", true);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      showMessage(msg, error.message || "Cannot connect. Make sure node app.js is running.");
    }
  });
}



/* CAKE CUSTOMISATION AND PRICE */

const orderForm = document.getElementById("orderForm");

if (orderForm) {
  const sizeEl = document.getElementById("size");
  const quantityEl = document.getElementById("quantity");
  const messageEl = document.getElementById("message");
  const flavourEl = document.getElementById("flavour");
  const frostingEl = document.getElementById("frosting");
  const toppingsEl = document.getElementById("toppings");
  const dateEl = document.getElementById("deliveryDate");
  const addressEl = document.getElementById("address");
  const instructionsEl = document.getElementById("instructions");

  // Get cake name from the URL, or use Ferrero Rocher Cake.
  const cakeEl = document.getElementById("cake");

  const cakeName =
    cakeEl?.value ||
    new URLSearchParams(window.location.search).get("cake") ||
    "Ferrero Rocher Cake";

  // Base prices of cakes available in the menu.
  const cakePrices = {
    "Ferrero Rocher Cake": 950,
    "Dark Chocolate Fantasy": 900,
    "Rasmalai Cake": 950,
    "Rainbow Pastel Cake": 890,
    "Salted Caramel Noir": 850,
    "Strawberry Silk": 750,
    "Vanilla Pearl": 650,
    "4 in 1 Baked Cheesecake": 999,
    "Irish Coffee": 890,
    "Irish Coffee Cake": 890
  };

  const basePrice = cakePrices[cakeName] ?? 950;

  // Require at least 48 hours' notice.
  if (dateEl) {
    const earliest = new Date();
    earliest.setHours(0, 0, 0, 0);
    earliest.setDate(earliest.getDate() + 2);

    dateEl.min = [
      earliest.getFullYear(),
      String(earliest.getMonth() + 1).padStart(2, "0"),
      String(earliest.getDate()).padStart(2, "0")
    ].join("-");
  }

  function priceOf(element) {
    if (!element) return 0;

    const option = element.selectedOptions?.[0];
    if (!option) return 0;

    const price = option.dataset.price !== undefined
      ? Number(option.dataset.price)
      : Number(element.value);

    return Number.isFinite(price) ? price : 0;
  }

  function updateSummary() {
    const quantity = Math.max(
      1,
      Math.min(20, Number(quantityEl?.value) || 1)
    );

    const total =
      (basePrice + priceOf(sizeEl) + priceOf(toppingsEl)) * quantity;

    const put = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    // These elements are optional because you removed the summary card.
    put("summaryCake", cakeName);
    put("summarySize", sizeEl?.selectedOptions[0]?.text || "");
    put("summaryFlavour", flavourEl?.value || "");
    put("summaryFrosting", frostingEl?.value || "");
    put("summaryQty", quantity);
    put("summaryToppings", toppingsEl?.selectedOptions[0]?.text || "None");
    put("total", "₹" + total.toLocaleString("en-IN"));
  }

  [
    sizeEl,
    quantityEl,
    messageEl,
    flavourEl,
    frostingEl,
    toppingsEl
  ].filter(Boolean).forEach(element => {
    element.addEventListener("input", updateSummary);
    element.addEventListener("change", updateSummary);
  });

  updateSummary();

  orderForm.addEventListener("submit", async event => {
    event.preventDefault();

    const customerId = currentCustomerId();

    if (!customerId) {
      alert("Please login before placing an order.");
      window.location.href = "login.html";
      return;
    }

    const quantity = Number(quantityEl?.value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      alert("Please select a quantity between 1 and 20.");
      quantityEl?.focus();
      return;
    }

    if (!dateEl?.value) {
      alert("Please select a delivery date.");
      dateEl?.focus();
      return;
    }

    const earliest = new Date();
    earliest.setHours(0, 0, 0, 0);
    earliest.setDate(earliest.getDate() + 2);

    if (new Date(dateEl.value + "T00:00:00") < earliest) {
      alert("Choose a delivery date at least 2 days from today.");
      dateEl.focus();
      return;
    }

    const address = addressEl?.value.trim() || "";

    if (address.length < 10) {
      alert("Please enter a complete delivery address.");
      addressEl?.focus();
      return;
    }

    const total =
      (basePrice + priceOf(sizeEl) + priceOf(toppingsEl)) * quantity;

    const order = {
      customer_id: Number(customerId),
      cake_name: cakeName,
      size: sizeEl?.selectedOptions[0]?.text || "",
      flavour: flavourEl?.value || "",
      frosting: frostingEl?.value || "",
toppings: toppingsEl?.value || "None",
      quantity: quantity,
      cake_message: messageEl?.value.trim() || "",
      delivery_date: dateEl.value,
      address: address,
      instructions: instructionsEl?.value.trim() || "",
      total: total
    };

    const submitButton = orderForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Placing Order...";
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      const data = await responseData(response);

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to place order.");
        return;
      }

      alert(
        "Your order has been placed successfully!" +
        (data.order?.order_number
          ? "\nOrder Number: " + data.order.order_number
          : "")
      );

      window.location.href = "orders.html";

    } catch (error) {
      console.error("Order error:", error);

      alert(
        "Unable to place your order. Please check that the server is running."
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Place Order";
      }
    }
  });
}


/* ORDER TRACKING */
const ordersContainer = document.getElementById("ordersContainer");

if (ordersContainer) {
  const customerId = currentCustomerId();

  if (!customerId) {
    ordersContainer.innerHTML =
      '<div class="tracking-card"><h2>Please login to view your orders.</h2><p>Your orders are private and can only be viewed by your account.</p><a href="login.html" class="btn">Login</a></div>';
  } else {
    fetch("/api/orders/customer/" + encodeURIComponent(customerId))
      .then(responseData)
      .then(data => {
        if (!data.success) {
          ordersContainer.innerHTML =
            `<div class="tracking-card"><h2>Unable to load orders.</h2><p>${safeText(data.message || "Please try again.")}</p></div>`;
          return;
        }

        const orders = data.orders || [];

        if (!orders.length) {
          ordersContainer.innerHTML =
            '<div class="tracking-card"><h2>No orders yet.</h2><p>Your placed orders will appear here.</p><a href="menu.html" class="btn">Browse Cakes</a></div>';
          return;
        }

        ordersContainer.innerHTML = "";

        orders.forEach(order => renderOrder(order, ordersContainer));
      })
      .catch(error => {
        console.error("Orders error:", error);
        ordersContainer.innerHTML =
          '<div class="tracking-card"><h2>Unable to connect to server.</h2><p>Make sure app.js is running and try again.</p></div>';
      });
  }
}

function renderOrder(order, container) {
  const statuses = trackingSteps.map(step => step.status);
  let status = order.status || "Order Placed";

  if (!statuses.includes(status)) status = "Order Placed";

  const current = statuses.indexOf(status);

  const timeline = trackingSteps.map((step, index) => {
    const cls = index < current
      ? "completed"
      : index === current ? "active" : "";

    return `<div class="tracking-step ${cls}">
      <div class="tracking-icon">${index <= current ? "✓" : ""}</div>
      ${index < trackingSteps.length - 1
        ? '<div class="tracking-line"></div>'
        : ""}
      <div class="tracking-content">
        <h3>${safeText(step.status)}</h3>
        <p>${safeText(step.description)}</p>
      </div>
    </div>`;
  }).join("");

  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleString("en-IN")
    : "Not available";

  const card = document.createElement("div");
  card.className = "tracking-card";

  card.innerHTML = `
    <div class="tracking-header">
      <div>
        <p class="order-number">ORDER ${safeText(order.order_number || order.id || "")}</p>
        <h2>${safeText(order.cake_name || order.cake || "Cake order")}</h2>
        <p>Placed on ${safeText(orderDate)}</p>
      </div>
      <div class="order-status">${safeText(status)}</div>
    </div>

    <div class="tracking-timeline">${timeline}</div>

    <<div class="order-details">
  <p><span>Size</span><strong>${safeText(order.size || "Not specified")}</strong></p>
  <p><span>Flavour</span><strong>${safeText(order.flavour || "Not specified")}</strong></p>
  <p><span>Frosting</span><strong>${safeText(order.frosting || "Not specified")}</strong></p>
  <p><span>Toppings</span><strong>${safeText(order.toppings || "None")}</strong></p>

      ${order.cake_message || order.message
        ? `<p><span>Cake Message</span><strong>${safeText(order.cake_message || order.message)}</strong></p>`
        : ""}

      <p><span>Delivery Date</span><strong>${safeText(order.delivery_date || order.deliveryDate || "")}</strong></p>
      <p><span>Address</span><strong>${safeText(order.address || "")}</strong></p>
      <p><span>Total</span><strong>₹${Number(order.total || 0).toLocaleString("en-IN")}</strong></p>
    </div>`;

  container.appendChild(card);
}

