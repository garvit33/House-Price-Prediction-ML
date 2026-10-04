
const form = document.getElementById("prediction-form");
const predictButton = document.getElementById("predict-button");

const priceElement = document.getElementById("predicted-price");
const messageElement = document.getElementById("result-message");

// FastAPI backend URL
const API_URL = "http://127.0.0.1:8000/predict";

// Format numbers as Indian Rupees
function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(price);
}

// Keep the input summary updated
function updateSummary(data) {
    document.getElementById("summary-area").textContent =
        `${Number(data.living_area).toLocaleString("en-IN")} sq ft`;

    document.getElementById("summary-grade").textContent = data.grade;
    document.getElementById("summary-bathrooms").textContent =
        data.num_of_bathrooms;
    document.getElementById("summary-bedrooms").textContent =
        data.num_of_bedrooms;
    document.getElementById("summary-floors").textContent =
        data.num_of_floors;
}

form.addEventListener("input", () => {
    const data = Object.fromEntries(new FormData(form).entries());
    updateSummary(data);
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Read values from the form
    const data = {
        living_area: Number(form.living_area.value),
        grade: Number(form.grade.value),
        num_of_bathrooms: Number(form.num_of_bathrooms.value),
        num_of_bedrooms: Number(form.num_of_bedrooms.value),
        num_of_floors: Number(form.num_of_floors.value)
    };

    updateSummary(data);

    predictButton.disabled = true;
    predictButton.textContent = "Predicting...";

    priceElement.textContent = "—";
    messageElement.className = "result-message";
    messageElement.textContent = "Your model is calculating the estimate...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail
                    ? JSON.stringify(result.detail)
                    : "The API could not process your request."
            );
        }

        const price = Number(result.predicted_price);

        if (!Number.isFinite(price)) {
            throw new Error("The API returned an invalid price.");
        }

        if (price <= 0) {
            priceElement.textContent = formatPrice(price);
            messageElement.className = "result-message warning";
            messageElement.textContent =
                "The model returned an unrealistic estimate. " +
                "Please treat this result as invalid while the model is being improved.";
        } else {
            priceElement.textContent = formatPrice(price);
            messageElement.textContent =
                "Prediction received successfully. This is an ML estimate, not a professional valuation.";
        }

    } catch (error) {
        
        console.error("Prediction error:", error);

        priceElement.textContent = "Unavailable";
        messageElement.className = "result-message error";
        messageElement.textContent =
            error instanceof TypeError
                ? "Cannot reach the API. Make sure FastAPI is running and CORS is configured."
                : error.message;

    } finally {
        predictButton.disabled = false;
        predictButton.innerHTML = "<span>✦</span> Predict Price";
    }
});
