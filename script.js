// ============================================
// API CONFIGURATION
// ============================================

const API_URL = "https://winmore-backend.onrender.com";

// ============================================
// DOM ELEMENTS
// ============================================

const paymentModal = document.getElementById("payment-modal");
const paymentForm = document.getElementById("paymentForm");
const buyButton = document.getElementById("buyButton");
const message = document.getElementById("message");
const modalClose = document.getElementById("modal-close");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

const ctaButtons = [
    document.getElementById("header-cta"),
    document.getElementById("cta-hero"),
    document.getElementById("cta-final")
];

// ============================================
// LIGHTBOX FUNCTIONALITY
// ============================================

const galleryItems = document.querySelectorAll(".gallery-item");
let currentImageIndex = 0;
let galleryImages = [];

function initializeGallery() {
    galleryImages = Array.from(galleryItems).map((item) => ({
        src: item.querySelector("img").src,
        alt: item.querySelector("img").alt
    }));

    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => openLightbox(index));
    });
}

function openLightbox(index) {
    currentImageIndex = index;
    lightboxImage.src = galleryImages[index].src;
    lightboxImage.alt = galleryImages[index].alt;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImage.src = galleryImages[currentImageIndex].src;
    lightboxImage.alt = galleryImages[currentImageIndex].alt;
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    lightboxImage.src = galleryImages[currentImageIndex].src;
    lightboxImage.alt = galleryImages[currentImageIndex].alt;
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
    lightboxPrev.addEventListener("click", showPrevImage);
}

if (lightboxNext) {
    lightboxNext.addEventListener("click", showNextImage);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
    }
    if (lightbox.classList.contains("active")) {
        if (e.key === "ArrowLeft") showPrevImage();
        if (e.key === "ArrowRight") showNextImage();
    }
});

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// ============================================
// PAYMENT MODAL FUNCTIONS
// ============================================

function openPaymentModal() {
    paymentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    document.getElementById("email").focus();
}

function closePaymentModal() {
    paymentModal.classList.remove("active");
    document.body.style.overflow = "auto";
    resetPaymentForm();
}

// CTA buttons open payment modal
ctaButtons.forEach((btn) => {
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openPaymentModal();
        });
    }
});

// Close modal button
if (modalClose) {
    modalClose.addEventListener("click", closePaymentModal);
}

// Close modal on background click
paymentModal.addEventListener("click", (e) => {
    if (e.target === paymentModal) {
        closePaymentModal();
    }
});

// Close modal on ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && paymentModal.classList.contains("active")) {
        closePaymentModal();
    }
});

// ============================================
// PAYMENT FORM (EXISTING LOGIC - PRESERVED)
// ============================================

function resetPaymentForm() {
    if (paymentForm) {
        paymentForm.reset();
    }
    message.textContent = "";
    message.className = "message";
    if (buyButton) {
        buyButton.disabled = false;
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        showMessage("Please enter your email.", "error");
        return;
    }

    buyButton.disabled = true;
    showMessage("Initializing payment...", "");

    try {
        const response = await fetch(
            `${API_URL}/api/payment/initialize/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(
                data.message || "Payment initialization failed."
            );
        }

        // Redirect customer to Paystack
        window.location.href = data.authorization_url;

    } catch (error) {
        console.error(error);

        showMessage(
            error.message || "Something went wrong. Please try again.",
            "error"
        );

        buyButton.disabled = false;
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    initializeGallery();
});
