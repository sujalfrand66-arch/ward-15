const WHATSAPP_NUMBER = "91XXXXXXXXXX";
const HELP_PHONE_NUMBER = "91XXXXXXXXXX";
const OFFICE_TEXT = "Ward 15 कार्यालय";

const categories = [
  {
    id: "water",
    icon: "💧",
    label: "पानी",
    heading: "पानी में क्या परेशानी है?",
    types: [
      ["💧", "पानी नहीं आ रहा"],
      ["🚱", "पानी गंदा आ रहा है"],
      ["💦", "पाइप से पानी बह रहा है"],
      ["📝", "दूसरी पानी की समस्या"]
    ]
  },
  {
    id: "light",
    icon: "💡",
    label: "बिजली / स्ट्रीट लाइट",
    heading: "बिजली या लाइट में क्या परेशानी है?",
    types: [
      ["💡", "लाइट बंद है"],
      ["💥", "लाइट / पोल टूट गया है"],
      ["⚡", "बिजली की समस्या"],
      ["📝", "दूसरी समस्या"]
    ]
  },
  {
    id: "road",
    icon: "🛣️",
    label: "सड़क",
    heading: "सड़क में क्या परेशानी है?",
    types: [
      ["🕳️", "सड़क में गड्ढा है"],
      ["🛣️", "सड़क खराब है"],
      ["📝", "दूसरी सड़क की समस्या"]
    ]
  },
  {
    id: "cleaning",
    icon: "🧹",
    label: "सफाई",
    heading: "सफाई में क्या परेशानी है?",
    types: [
      ["🗑️", "कचरा पड़ा है"],
      ["🧹", "सफाई नहीं हुई"],
      ["🐄", "गंदगी / आवारा पशु"],
      ["📝", "दूसरी समस्या"]
    ]
  },
  {
    id: "drain",
    icon: "🚰",
    label: "नाली / सीवर",
    heading: "नाली या सीवर में क्या परेशानी है?",
    types: [
      ["🚰", "नाली बंद है"],
      ["💧", "पानी जमा है"],
      ["🕳️", "सीवर की समस्या"],
      ["📝", "दूसरी समस्या"]
    ]
  },
  {
    id: "other",
    icon: "📝",
    label: "दूसरी समस्या",
    heading: "क्या परेशानी है?",
    types: [
      ["📝", "अपनी समस्या बताएं"]
    ]
  }
];

const state = {
  category: null,
  problemIcon: "",
  problemText: "",
  photoAdded: false,
  locationText: "",
  mapsLink: "",
  description: "",
  name: "",
  mobile: "",
  reference: ""
};

const screens = Array.from(document.querySelectorAll(".screen"));
const historyStack = ["homeScreen"];
const categoryGrid = document.querySelector("#categoryGrid");
const typeOptions = document.querySelector("#typeOptions");
const typeHeading = document.querySelector("#typeHeading");
const selectedProblem = document.querySelector("#selectedProblem");
const photoInput = document.querySelector("#photoInput");
const photoPreview = document.querySelector("#photoPreview");
const photoPreviewWrap = document.querySelector("#photoPreviewWrap");
const locationStatus = document.querySelector("#locationStatus");
const locationText = document.querySelector("#locationText");
const locationError = document.querySelector("#locationError");
const descriptionText = document.querySelector("#descriptionText");
const nameInput = document.querySelector("#nameInput");
const mobileInput = document.querySelector("#mobileInput");
const contactError = document.querySelector("#contactError");
const summaryCard = document.querySelector("#summaryCard");
const referenceNumber = document.querySelector("#referenceNumber");
const whatsappSend = document.querySelector("#whatsappSend");
const trackRef = document.querySelector("#trackRef");
const trackWhatsapp = document.querySelector("#trackWhatsapp");

function showScreen(id, keepHistory = true) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  document.querySelectorAll(".nav-item").forEach((item) => {
    const screen = item.dataset.screen;
    const isProblem = item.hasAttribute("data-start-problem");
    item.classList.toggle("active", screen === id || (isProblem && ["typeScreen", "photoScreen", "locationScreen", "descriptionScreen", "contactScreen", "finalScreen"].includes(id)));
  });

  if (keepHistory && historyStack[historyStack.length - 1] !== id) {
    historyStack.push(id);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  if (historyStack.length <= 1) {
    showScreen("homeScreen", false);
    return;
  }
  historyStack.pop();
  showScreen(historyStack[historyStack.length - 1], false);
}

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildCategories() {
  categoryGrid.innerHTML = categories.map((category) => `
    <button class="category-card" type="button" data-category="${category.id}">
      <span aria-hidden="true">${category.icon}</span>
      <strong>${category.label}</strong>
    </button>
  `).join("");
}

function openTypes(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return;

  state.category = category;
  typeHeading.textContent = category.heading;
  typeOptions.innerHTML = category.types.map(([icon, label]) => `
    <button class="type-card" type="button" data-icon="${icon}" data-problem="${label}">
      <span aria-hidden="true">${icon}</span>
      <strong>${label}</strong>
    </button>
  `).join("");
  showScreen("typeScreen");
}

function selectProblem(icon, label) {
  state.problemIcon = icon;
  state.problemText = label;
  selectedProblem.textContent = `${icon} ${label}`;
  showScreen("photoScreen");
}

function setLocationStatus(message, isError = false) {
  locationStatus.textContent = message;
  locationStatus.style.color = isError ? "var(--danger)" : "var(--green-dark)";
}

function useGps() {
  if (!navigator.geolocation) {
    setLocationStatus("GPS काम नहीं कर रहा। जगह का नाम लिखें।", true);
    locationText.focus();
    return;
  }

  setLocationStatus("जगह ढूंढ रहे हैं...");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      state.mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      state.locationText = "GPS से जगह मिली";
      locationText.value = "GPS से जगह मिली";
      setLocationStatus("✅ जगह मिल गई");
      locationError.textContent = "";
    },
    () => {
      setLocationStatus("GPS काम नहीं कर रहा। जगह का नाम लिखें।", true);
      locationText.focus();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

function validateLocation() {
  const typedLocation = locationText.value.trim();
  if (!typedLocation && !state.mapsLink) {
    locationError.textContent = "कृपया जगह बताएं।";
    locationText.focus();
    return false;
  }
  state.locationText = typedLocation || state.locationText;
  locationError.textContent = "";
  return true;
}

function validateContact() {
  state.name = nameInput.value.trim();
  state.mobile = mobileInput.value.replace(/\D/g, "");

  if (!state.name) {
    contactError.textContent = "कृपया अपना नाम लिखें।";
    nameInput.focus();
    return false;
  }

  if (!/^[6-9]\d{9}$/.test(state.mobile)) {
    contactError.textContent = "मोबाइल नंबर सही नहीं है।";
    mobileInput.focus();
    return false;
  }

  contactError.textContent = "";
  return true;
}

function makeReference() {
  const year = new Date().getFullYear();
  const number = Math.floor(10000 + Math.random() * 90000);
  return `WD15-${year}-${number}`;
}

function complaintMessage() {
  const photoLine = state.photoAdded
    ? "फोटो WhatsApp में अलग से भेजी जाएगी।"
    : "फोटो नहीं जोड़ी गई।";
  const mapLine = state.mapsLink || "GPS लिंक नहीं मिला।";
  const details = state.description || "अलग से कुछ नहीं लिखा।";

  return [
    "WARD 15 शिकायत",
    "",
    `शिकायत संख्या: ${state.reference}`,
    "",
    "समस्या:",
    `${state.problemIcon} ${state.problemText}`,
    "",
    "नाम:",
    state.name,
    "",
    "मोबाइल:",
    state.mobile,
    "",
    "जगह:",
    state.locationText,
    "",
    "समस्या की जानकारी:",
    details,
    "",
    "लोकेशन:",
    mapLine,
    "",
    "फोटो:",
    photoLine
  ].join("\n");
}

function renderFinal() {
  state.description = descriptionText.value.trim();
  state.reference = makeReference();
  referenceNumber.textContent = state.reference;

  summaryCard.innerHTML = `
    <div class="summary-line"><span>${state.problemIcon}</span><strong>${state.problemText}</strong></div>
    <div class="summary-line"><span>📍</span><strong>${state.locationText || "जगह लिखी गई"}</strong></div>
    <div class="summary-line"><span>📸</span><strong>${state.photoAdded ? "फोटो चुनी गई" : "फोटो नहीं जोड़ी"}</strong></div>
    <div class="summary-line"><span>👤</span><strong>${state.name}</strong></div>
  `;

  whatsappSend.href = whatsappUrl(complaintMessage());
  showScreen("finalScreen");
}

function resetComplaint() {
  state.category = null;
  state.problemIcon = "";
  state.problemText = "";
  state.photoAdded = false;
  state.locationText = "";
  state.mapsLink = "";
  state.description = "";
  state.name = "";
  state.mobile = "";
  state.reference = "";

  photoInput.value = "";
  photoPreview.removeAttribute("src");
  photoPreviewWrap.classList.add("hidden");
  locationText.value = "";
  descriptionText.value = "";
  nameInput.value = "";
  mobileInput.value = "";
  locationStatus.textContent = "";
  locationError.textContent = "";
  contactError.textContent = "";

  historyStack.length = 0;
  historyStack.push("homeScreen");
  showScreen("homeScreen", false);
}

function updateTrackLink() {
  const ref = trackRef.value.trim();
  const extraLine = ref ? `\nमेरी शिकायत संख्या: ${ref}` : "\nमेरे पास शिकायत संख्या नहीं है।";
  const message = `नमस्ते, मैंने Ward 15 में शिकायत भेजी है। कृपया मेरी शिकायत की जानकारी बताएं।${extraLine}`;
  trackWhatsapp.href = whatsappUrl(message);
}

function setupEvents() {
  categoryGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (button) openTypes(button.dataset.category);
  });

  typeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-problem]");
    if (button) selectProblem(button.dataset.icon, button.dataset.problem);
  });

  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.screen));
  });

  document.querySelectorAll("[data-start-problem]").forEach((button) => {
    button.addEventListener("click", () => showScreen("homeScreen"));
  });

  document.querySelectorAll(".back-button").forEach((button) => {
    button.addEventListener("click", goBack);
  });

  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    state.photoAdded = true;
    photoPreview.src = URL.createObjectURL(file);
    photoPreviewWrap.classList.remove("hidden");
  });

  document.querySelector("#photoNext").addEventListener("click", () => showScreen("locationScreen"));
  document.querySelector("#gpsButton").addEventListener("click", useGps);
  document.querySelector("#locationNext").addEventListener("click", () => {
    if (validateLocation()) showScreen("descriptionScreen");
  });
  document.querySelector("#descriptionNext").addEventListener("click", () => showScreen("contactScreen"));
  document.querySelector("#prepareComplaint").addEventListener("click", () => {
    if (validateContact()) renderFinal();
  });
  document.querySelector("#startAgain").addEventListener("click", resetComplaint);

  mobileInput.addEventListener("input", () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
  });

  trackRef.addEventListener("input", updateTrackLink);
}

function setupHelp() {
  document.querySelector("#callHelp").href = `tel:+${HELP_PHONE_NUMBER}`;
  document.querySelector("#chatHelp").href = whatsappUrl("नमस्ते, मुझे Ward 15 में मदद चाहिए।");
  document.querySelector("#officeText").textContent = OFFICE_TEXT;
  updateTrackLink();
}

buildCategories();
setupEvents();
setupHelp();
