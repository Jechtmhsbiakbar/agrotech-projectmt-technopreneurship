// ========== LOAD TECHNICIAN LIST ==========
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("technicianGrid")) {
    renderTechnicians();
  }

  if (document.getElementById("bookingForm")) {
    bookingHandler();
  }

  // Load booking result page - cek dengan ID yang benar
  if (document.getElementById("latestBookingDetails") || document.getElementById("bookingHistoryList")) {
    loadBookingResult();
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

    // Dapatkan data teknisi lengkap
    const techData = technicians.find(t => t.name === tech);

    const bookingData = {
      name,
      phone,
      location,
      tech,
      techPhone: techData ? techData.phone : "-",
      techPrice: techData ? techData.price : "-",
      problem,
      time: new Date().toLocaleString(),
      isPaid: false
    };

    console.log("Saving booking data:", bookingData);

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(bookingData);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Simpan booking terakhir untuk halaman result
    localStorage.setItem("lastBooking", JSON.stringify(bookingData));

    console.log("Data saved to localStorage");
    console.log("lastBooking:", localStorage.getItem("lastBooking"));
    console.log("bookings:", localStorage.getItem("bookings"));

    // Tampilkan popup dengan tombol ke halaman result
    showSuccessPopup(bookingData);
    form.reset();
  });
}

// ================= LOAD BOOKING RESULT =================
function loadBookingResult() {
  console.log("loadBookingResult called");
  
  const lastBooking = JSON.parse(localStorage.getItem("lastBooking"));
  const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];

  console.log("lastBooking:", lastBooking);
  console.log("allBookings:", allBookings);

  // Show latest unpaid booking
  if (lastBooking && !lastBooking.isPaid) {
    console.log("Showing latest booking section");
    
    const latestSection = document.getElementById("latestBookingSection");
    if (latestSection) {
      latestSection.classList.remove("hidden");
    }
    
    const detailsDiv = document.getElementById("latestBookingDetails");
    if (detailsDiv) {
      detailsDiv.innerHTML = `
        <div class="info-row">
          <span class="label">👤 Nama Pemesan:</span>
          <span class="value">${lastBooking.name}</span>
        </div>
        <div class="info-row">
          <span class="label">📞 No. Telepon:</span>
          <span class="value">${lastBooking.phone}</span>
        </div>
        <div class="info-row">
          <span class="label">📍 Lokasi Lahan:</span>
          <span class="value">${lastBooking.location}</span>
        </div>
        <div class="info-row">
          <span class="label">👨‍🔧 Teknisi:</span>
          <span class="value">${lastBooking.tech}</span>
        </div>
        <div class="info-row">
          <span class="label">⚠️ Masalah:</span>
          <span class="value">${lastBooking.problem}</span>
        </div>
        <div class="info-row">
          <span class="label">🕐 Waktu Booking:</span>
          <span class="value">${lastBooking.time}</span>
        </div>
      `;

      // Set price
      const priceElement = document.getElementById("totalPrice");
      if (priceElement) {
        priceElement.textContent = lastBooking.techPrice;
      }

      // Set technician data for contact section
      const techNameElement = document.getElementById("techName");
      if (techNameElement) {
        techNameElement.textContent = lastBooking.tech;
      }
      
      const phoneLink = document.getElementById("techPhone");
      if (phoneLink) {
        phoneLink.textContent = lastBooking.techPhone;
        phoneLink.href = `tel:${lastBooking.techPhone}`;
      }
    }
  } else {
    console.log("No unpaid booking to show");
    const latestSection = document.getElementById("latestBookingSection");
    if (latestSection) {
      latestSection.classList.add("hidden");
    }
  }

  // Load booking history
  loadBookingHistory(allBookings);
}

// ================= LOAD BOOKING HISTORY =================
function loadBookingHistory(bookings) {
  console.log("loadBookingHistory called with:", bookings);
  
  const historyList = document.getElementById("bookingHistoryList");
  const noBookingsMsg = document.getElementById("noBookingsMessage");

  if (!historyList || !noBookingsMsg) {
    console.log("History elements not found");
    return;
  }

  if (!bookings || bookings.length === 0) {
    console.log("No bookings to display");
    historyList.innerHTML = "";
    noBookingsMsg.classList.remove("hidden");
    return;
  }

  console.log("Displaying", bookings.length, "bookings");
  noBookingsMsg.classList.add("hidden");
  historyList.innerHTML = "";

  // Sort bookings by time (newest first)
  const sortedBookings = [...bookings].reverse();

  sortedBookings.forEach((booking, index) => {
    const card = document.createElement("div");
    card.className = "history-card";
    
    const statusClass = booking.isPaid ? "paid" : "pending";
    const statusText = booking.isPaid ? "Sudah Dibayar" : "Menunggu Pembayaran";
    const statusIcon = booking.isPaid ? "✅" : "⏳";

    card.innerHTML = `
      <div class="history-card-header">
        <div class="booking-number">Booking #${bookings.length - index}</div>
        <span class="status-badge ${statusClass}">${statusIcon} ${statusText}</span>
      </div>
      
      <div class="history-card-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-icon">👤</span>
            <div class="info-content">
              <span class="info-label">Nama</span>
              <span class="info-value">${booking.name}</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-icon">👨‍🔧</span>
            <div class="info-content">
              <span class="info-label">Teknisi</span>
              <span class="info-value">${booking.tech}</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-icon">📍</span>
            <div class="info-content">
              <span class="info-label">Lokasi</span>
              <span class="info-value">${booking.location}</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-icon">💰</span>
            <div class="info-content">
              <span class="info-label">Biaya</span>
              <span class="info-value">${booking.techPrice}</span>
            </div>
          </div>
        </div>
        
        <div class="problem-section">
          <span class="problem-label">⚠️ Masalah:</span>
          <p class="problem-text">${booking.problem}</p>
        </div>
        
        <div class="time-section">
          <span class="time-icon">🕐</span>
          <span>${booking.time}</span>
        </div>
      </div>
      
      <div class="history-card-footer">
        <div class="tech-contact-mini">
          📞 ${booking.techPhone}
        </div>
        <div style="display: flex; gap: 10px;">
          ${!booking.isPaid ? `<button onclick="payHistoryBooking(${bookings.length - 1 - index})" class="btn-pay-small">💳 Bayar</button>` : ''}
          <button onclick="deleteBooking(${bookings.length - 1 - index})" class="btn-delete-small">🗑️ Hapus</button>
        </div>
      </div>
    `;

    historyList.appendChild(card);
  });
}

// ================= PAY HISTORY BOOKING =================
function payHistoryBooking(index) {
  if (!confirm("Apakah Anda yakin ingin melakukan pembayaran?")) {
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  
  if (index >= 0 && index < bookings.length) {
    bookings[index].isPaid = true;
    localStorage.setItem("bookings", JSON.stringify(bookings));
    
    // Update lastBooking jika yang dibayar adalah booking terakhir
    const lastBooking = JSON.parse(localStorage.getItem("lastBooking"));
    if (lastBooking && lastBooking.time === bookings[index].time) {
      lastBooking.isPaid = true;
      localStorage.setItem("lastBooking", JSON.stringify(lastBooking));
    }
    
    // Reload halaman untuk menampilkan perubahan
    location.reload();
  }
}

// ================= DELETE BOOKING =================
function deleteBooking(index) {
  if (!confirm("Apakah Anda yakin ingin menghapus booking ini?")) {
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  
  if (index >= 0 && index < bookings.length) {
    const deletedBooking = bookings[index];
    bookings.splice(index, 1);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    
    // Hapus lastBooking jika yang dihapus adalah booking terakhir
    const lastBooking = JSON.parse(localStorage.getItem("lastBooking"));
    if (lastBooking && lastBooking.time === deletedBooking.time) {
      localStorage.removeItem("lastBooking");
    }
    
    // Reload halaman
    location.reload();
  }
}

// ================= CLEAR ALL BOOKINGS =================
function clearAllBookings() {
  if (!confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat booking?")) {
    return;
  }

  localStorage.removeItem("bookings");
  localStorage.removeItem("lastBooking");
  
  // Reload halaman
  location.reload();
}

// ================= PROCESS PAYMENT (Latest Booking) =================
function processPayment() {
  if (!confirm("Apakah Anda yakin ingin melakukan pembayaran?")) {
    return;
  }

  const paymentSection = document.getElementById("paymentSection");
  const contactSection = document.getElementById("contactSection");

  // Show loading state
  const payButton = paymentSection.querySelector("button");
  payButton.textContent = "⏳ Processing...";
  payButton.disabled = true;

  // Simulate payment processing
  setTimeout(() => {
    // Update booking status
    const lastBooking = JSON.parse(localStorage.getItem("lastBooking"));
    lastBooking.isPaid = true;
    localStorage.setItem("lastBooking", JSON.stringify(lastBooking));

    // Update in bookings array
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const lastIndex = bookings.length - 1;
    if (lastIndex >= 0) {
      bookings[lastIndex].isPaid = true;
      localStorage.setItem("bookings", JSON.stringify(bookings));
    }

    // Hide payment, show contact
    paymentSection.classList.add("hidden");
    contactSection.classList.remove("hidden");

    // RELOAD BOOKING HISTORY untuk update status
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    loadBookingHistory(allBookings);

    // Update status badge di latest booking section
    const statusBadge = document.querySelector(".latest-card .status-badge");
    if (statusBadge) {
      statusBadge.className = "status-badge paid";
      statusBadge.textContent = "✅ Sudah Dibayar";
    }

    // Scroll to contact section
    contactSection.scrollIntoView({ behavior: "smooth" });
  }, 2000);
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
      <div class="popup-buttons">
        <a href="booking-result.html" class="btn-primary">Lihat Detail & Bayar</a>
        <button id="closePopup" class="btn-secondary">Close</button>
      </div>
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

  // 🔍 Ambil teknisi dari URL (jika ada)
  const params = new URLSearchParams(window.location.search);
  const selectedTech = params.get("technician");

  if (selectedTech) {
    techSelect.value = decodeURIComponent(selectedTech);
  }
});