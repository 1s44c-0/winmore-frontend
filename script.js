// ============================================
// API CONFIGURATION
// ============================================

const API_URL = "https://winmore-backend.onrender.com";

// ============================================
// PRODUCT PAGE: PAYMENT MODAL + CHECKOUT
// (elements only exist on index.html)
// ============================================

const paymentModal = document.getElementById("payment-modal");
const paymentForm = document.getElementById("paymentForm");
const buyButton = document.getElementById("buyButton");
const message = document.getElementById("message");
const modalClose = document.getElementById("modal-close");

const ctaButtons = [
    document.getElementById("header-cta"),
    document.getElementById("cta-hero"),
    document.getElementById("cta-final")
].filter(Boolean);

function openPaymentModal() {
    if (!paymentModal) return;
    paymentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
}

function closePaymentModal() {
    if (!paymentModal) return;
    paymentModal.classList.remove("active");
    document.body.style.overflow = "auto";
    resetPaymentForm();
}

function resetPaymentForm() {
    if (paymentForm) {
        paymentForm.reset();
    }
    if (message) {
        message.textContent = "";
        message.className = "message";
    }
    if (buyButton) {
        buyButton.disabled = false;
    }
}

function showMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.className = `message ${type}`;
}

if (paymentModal) {
    // CTA buttons open the payment modal
    ctaButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openPaymentModal();
        });
    });

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
}

// Payment form submission (existing logic — preserved)
if (paymentForm) {
    paymentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email) {
            showMessage("Please enter your email.", "error");
            return;
        }

        if (buyButton) buyButton.disabled = true;
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

            if (buyButton) buyButton.disabled = false;
        }
    });
}

// ============================================
// SUCCESS PAGE: VERIFY PAYMENT + DOWNLOAD
// (elements only exist on success.html)
// ============================================

const statusText = document.getElementById("status");
const downloadButton = document.getElementById("downloadButton");

if (statusText && downloadButton) {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    let downloadUrl = null;

    async function verifyPayment() {
        if (!reference) {
            statusText.textContent = "Payment reference is missing.";
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/payment/status/${reference}/`
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                statusText.textContent =
                    data.message || "Payment could not be verified.";
                return;
            }

            if (data.payment_status === "paid") {
                statusText.textContent = "Your payment has been confirmed.";
                downloadUrl = data.download_url;
                downloadButton.style.display = "inline-flex";
            } else {
                statusText.textContent = "Your payment is still being processed.";
            }

        } catch (error) {
            console.error(error);
            statusText.textContent = "Unable to verify payment. Please try again.";
        }
    }

    downloadButton.addEventListener("click", async function () {
        if (!downloadUrl) return;

        downloadButton.disabled = true;
        downloadButton.textContent = "Preparing download...";

        try {
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                let errorMessage = "Download unavailable.";

                try {
                    const data = await response.json();
                    errorMessage = data.message || errorMessage;
                } catch (error) {
                    // Response was not JSON
                }

                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "Win-More-on-Bets.pdf";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            downloadButton.textContent = "Download Completed";

        } catch (error) {
            console.error(error);
            alert(error.message);

            downloadButton.disabled = false;
            downloadButton.textContent = "Download Your Book";
        }
    });

    verifyPayment();
}
