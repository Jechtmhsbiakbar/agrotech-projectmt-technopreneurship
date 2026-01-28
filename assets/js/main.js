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
      <button onclick="bookTechnician('${tech.name}')" class="btn-primary">Book Now</button>
    `;

    grid.appendChild(card);
  });
}

// Save technician selection
function bookTechnician(name) {
  const techName = encodeURIComponent(name);
  window.location.href = `booking.html?technician=${techName}`;
}

// ================= BOOKING HANDLER =================
function bookingHandler() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  // ⛔ cegah double listener
  if (form.dataset.listener === "true") return;
  form.dataset.listener = "true";

  // 🔥 AMBIL TEKNISI DARI URL
  const params = new URLSearchParams(window.location.search);
  const techFromUrl = params.get("technician");
  if (techFromUrl) {
    document.getElementById("techSelect").value =
      decodeURIComponent(techFromUrl);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const location = document.getElementById("userLocation").value.trim();
    const tech = document.getElementById("techSelect").value.trim();
    const problem = document.getElementById("problemDesc").value.trim();

    if (!name || !phone || !location || !tech || !problem) {
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

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
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
    window.location.href = "admin.html";
  } else if (role === "teknisi") {
    window.location.href = "teknisi.html";
  } else {
    alert("Logged in as User (Demo Mode)");
  }
}

// ================= SEARCH TECHNICIAN SYSTEM =================
function searchTechnicians() {
  const input = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const searchResults = document.getElementById("searchResults");
  const noResults = document.getElementById("noResults");
  const searchGrid = document.getElementById("searchGrid");

  if (!input) {
    searchResults.classList.add("hidden");
    noResults.classList.add("hidden");
    return;
  }

  // Pecah input user → buang kata tidak penting
  const keywords = input.split(/\s+/).filter((word) => word.length > 2);

  const results = [];

  technicians.forEach((tech) => {
    let matchCount = 0;

    const searchableText = `
      ${tech.name}
      ${tech.skill}
      ${tech.location}
    `.toLowerCase();

    keywords.forEach((key) => {
      // Match langsung
      if (searchableText.includes(key)) {
        matchCount++;
      }
    });

    // WAJIB ada minimal 1 keyword yang cocok
    if (matchCount > 0) {
      results.push({ tech, matchCount });
    }
  });

  // Urutkan berdasarkan jumlah kecocokan
  results.sort((a, b) => b.matchCount - a.matchCount);

  // Render hasil
  if (results.length === 0) {
    searchResults.classList.add("hidden");
    noResults.classList.remove("hidden");
    return;
  }

  searchGrid.innerHTML = "";
  results.forEach(({ tech }) => {
    const card = document.createElement("div");
    card.className = "technician-card";

    card.innerHTML = `
      <h3>${tech.name}</h3>
      <p><strong>Skill:</strong> ${tech.skill}</p>
      <p><strong>Location:</strong> ${tech.location}</p>
      <p><strong>Rating:</strong> ⭐ ${tech.rating}</p>
      <p><strong>Price:</strong> ${tech.price}</p>
      <button onclick="bookTechnician('${tech.name}')" class="btn-primary">Book Now</button>
    `;

    searchGrid.appendChild(card);
  });

  searchResults.classList.remove("hidden");
  noResults.classList.add("hidden");
  searchResults.scrollIntoView({ behavior: "smooth" });
}

// Search saat enter di keyboard
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchTechnicians();
      }
    });
  }
});

// Bagian teknisi.html
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("technicianJobs")) {
    loadTechnicianJobs();
  }
});

function loadTechnicianJobs() {
  const jobs = JSON.parse(localStorage.getItem("bookings")) || [];
  const container = document.getElementById("technicianJobs");

  if (jobs.length === 0) {
    container.innerHTML = "<p>No jobs yet.</p>";
    return;
  }

  jobs.forEach((job) => {
    const div = document.createElement("div");
    div.className = "job-card";
    div.innerHTML = `
      <h3>${job.name}</h3>
      <p>Tech: ${job.tech}</p>
      <p>Location: ${job.location}</p>
      <p>Problem: ${job.problem}</p>
      <p>Time: ${job.time}</p>
    `;
    container.appendChild(div);
  });
}

// LogOut
function logout() {
  localStorage.removeItem("userRole");
  window.location.href = "index.html";
}

// redirect nama teknisi ke booking.html
function bookTechnician(name) {
  const techName = encodeURIComponent(name);
  window.location.href = `booking.html?technician=${techName}`;
}

function renderSearchResults(data) {
  const grid = document.getElementById("searchGrid");
  grid.innerHTML = "";

  data.forEach((t) => {
    grid.innerHTML += `
      <div class="card">
        <h3>${t.name}</h3>
        <p>${t.skill}</p>
        <p>${t.location}</p>
        <button onclick="bookTechnician('${tech.name}')" class="btn-primary">Book Now</button>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const techSelect = document.getElementById("techSelect");
  if (!techSelect || typeof technicians === "undefined") return;

  // 🔥 CEGAH DOUBLE LOAD
  if (techSelect.dataset.loaded) return;
  techSelect.dataset.loaded = "true";

  // 🔥 RESET OPTION (INI KUNCI UTAMA)
  techSelect.innerHTML = '<option value="">-- Pilih Teknisi --</option>';

  technicians.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.name;
    option.textContent = `${t.name} (${t.location})`;
    techSelect.appendChild(option);
  });

  // 🔁 Ambil teknisi dari URL (jika ada)
  const params = new URLSearchParams(window.location.search);
  const selectedTech = params.get("technician");

  if (selectedTech) {
    techSelect.value = decodeURIComponent(selectedTech);
  }
});
