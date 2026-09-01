const API_URL = "https://winmore-backend.onrender.com";

const paymentForm = document.getElementById("paymentForm");
const buyButton = document.getElementById("buyButton");
const message = document.getElementById("message");

paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        message.textContent = "Please enter your email.";
        return;
    }

    buyButton.disabled = true;
    message.textContent = "Initializing payment...";

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

        message.textContent =
            error.message || "Something went wrong.";

        buyButton.disabled = false;
    }
});