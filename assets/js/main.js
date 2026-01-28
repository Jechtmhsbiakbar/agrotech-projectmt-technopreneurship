// ========== LOAD TECHNICIAN LIST ==========
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("technicianGrid")) {
    renderTechnicians();
  }

  if (document.getElementById("bookingForm")) {
    bookingHandler();
  }

  loginModalHandler();
});

// ================= TECHNICIANS RENDER =================
function renderTechnicians() {
  const grid = document.getElementById("technicianGrid");
  grid.innerHTML = "";

  technicians.forEach((tech) => {
    const card = document.createElement("div");
    card.classList.add("technician-card");

    card.innerHTML = `
      <h3>${tech.name}</h3>
      <p><strong>Skill:</strong> ${tech.skill}</p>
      <p><strong>Location:</strong> ${tech.location}</p>
      <p><strong>Rating:</strong> ⭐ ${tech.rating}</p>
      <p><strong>Price:</strong> ${tech.price}</p>
      <button onclick="selectTechnician('${tech.name}')" class="btn-primary">Book Now</button>
    `;

    grid.appendChild(card);
  });
}

// Save technician selection
function selectTechnician(name) {
  localStorage.setItem("selectedTechnician", name);
  window.location.href = "layout/booking.html";
}

// ================= BOOKING HANDLER =================
function bookingHandler() {
  const form = document.getElementById("bookingForm");
  const selectedTech = localStorage.getItem("selectedTechnician");

  if (selectedTech) {
    document.getElementById("techSelect").value = selectedTech;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("userName").value;
    const phone = document.getElementById("userPhone").value;
    const location = document.getElementById("userLocation").value;
    const tech = document.getElementById("techSelect").value;
    const problem = document.getElementById("problemDesc").value;

    if (!name || !phone || !location || !problem) {
      alert("Please fill all required fields!");
      return;
    }

    const bookingData = {
      name,
      phone,
      location,
      tech,
      problem,
      time: new Date().toLocaleString(),
    };

    console.log("Booking Submitted:", bookingData);

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(bookingData);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    showSuccessPopup(bookingData);
    form.reset();
  });
}

// ================= SUCCESS POPUP =================
function showSuccessPopup(data) {
  const popup = document.createElement("div");
  popup.classList.add("popup-success");

  popup.innerHTML = `
    <div class="popup-box">
      <h2>✅ Booking Successful</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Technician:</strong> ${data.tech}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Problem:</strong> ${data.problem}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <button id="closePopup" class="btn-primary">Close</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("closePopup").addEventListener("click", () => {
    popup.remove();
  });
}

// ================= LOGIN MODAL SYSTEM =================
function loginModalHandler() {
  const modal = document.getElementById("loginModal");
  const openBtn = document.getElementById("openLoginModal");
  const closeBtn = document.getElementById("closeLoginModal");

  if (!modal || !openBtn) return;

  openBtn.addEventListener("click", () => {
    modal.classList.add("show");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });
}

// Role Login Redirect
function loginAs(role) {
  localStorage.setItem("loginRole", role);

  if (role === "admin") {
    window.location.href = "layout/admin.html";
  } else if (role === "technician") {
    window.location.href = "layout/technician.html";
  } else {
    alert("Logged in as User (Demo Mode)");
  }
}
