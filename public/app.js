// Event Ticketing Application
let events = [];

// Helper function to get CSRF token
function getCSRFToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : "";
}

async function loadEvents() {
    try {
        const response = await fetch("/events.json", {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        events = await response.json();
        displayEvents();
    } catch (error) {
        console.error("Error loading events:", error);
        document.getElementById("events-container").innerHTML =
            '<div class="text-center py-10 text-xl col-span-full" style="color: #5F5E5A;">Error loading events. Please try again.</div>';
    }
}

function displayEvents() {
    const container = document.getElementById("events-container");

    if (events.length === 0) {
        container.innerHTML =
            '<div class="text-center py-10 text-xl col-span-full" style="color: #5F5E5A;">No upcoming events found.</div>';
        return;
    }

    container.innerHTML = events
        .map((evt) => {
            const date = new Date(evt.event_date);
            const availablePercentage =
                (evt.tickets_available / evt.capacity) * 100;
            const progressWidth = Math.max(
                0,
                Math.min(100, availablePercentage),
            );

            let availabilityClasses = "bg-available-bg text-available-text";
            let availabilityText = `${evt.tickets_available} tickets available`;

            if (evt.sold_out) {
                availabilityClasses =
                    "bg-sold-out-bg text-sold-out-text font-bold";
                availabilityText = "SOLD OUT";
            } else if (availablePercentage < 20) {
                availabilityClasses = "bg-low-bg text-low-text font-semibold";
                availabilityText = `Only ${evt.tickets_available} tickets left`;
            } else {
                availabilityClasses =
                    "bg-available-bg text-available-text font-semibold";
            }

            return `
            <div class="bg-white rounded-lg p-6 shadow-sm border-t-[3px] border-deep-purple transition-all" style="border-width: 0.5px; border-top-width: 3px; border-color: #D3D1C7; border-top-color: #534AB7;">
                <div class="text-lg font-medium text-text-primary mb-2">${evt.name}</div>
                <div class="text-sm text-text-secondary mb-4 leading-relaxed">${evt.description || "No description available"}</div>

                <div class="flex flex-col gap-2 mb-4">
                    <div class="flex">
                        <span class="text-xs text-text-secondary min-w-[80px]" style="font-size: 13px;">Venue</span>
                        <span class="text-sm text-text-primary">${evt.venue}</span>
                    </div>
                    <div class="flex">
                        <span class="text-xs text-text-secondary min-w-[80px]" style="font-size: 13px;">Date</span>
                        <span class="text-sm text-text-primary">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div class="flex">
                        <span class="text-xs text-text-secondary min-w-[80px]" style="font-size: 13px;">Capacity</span>
                        <span class="text-sm text-text-primary">${evt.capacity} people</span>
                    </div>
                </div>

                ${
                    !evt.sold_out
                        ? `
                    <div class="py-3 px-4 rounded-lg mb-2 text-center font-semibold ${availabilityClasses}">
                        ${availabilityText}
                    </div>
                    <div class="h-1 bg-card-border rounded-full overflow-hidden mb-4">
                        <div class="h-full bg-deep-purple transition-all" style="width: ${progressWidth}%"></div>
                    </div>
                    <div class="p-4 rounded-lg bg-warm-gray">
                        <form class="flex flex-col gap-3" onsubmit="bookTicket(event, ${evt.id})">
                            <div class="flex flex-col gap-1">
                                <label for="email-${evt.id}" class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Email address</label>
                                <input
                                    type="email"
                                    id="email-${evt.id}"
                                    required
                                    placeholder="your@email.com"
                                    class="px-3 py-2 border border-card-border rounded-lg text-text-primary focus:outline-none focus:border-deep-purple transition"
                                >
                            </div>
                            <div class="flex flex-col gap-1">
                                <label for="quantity-${evt.id}" class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Number of tickets</label>
                                <input
                                    type="number"
                                    id="quantity-${evt.id}"
                                    min="1"
                                    max="${evt.tickets_available}"
                                    required
                                    placeholder="1"
                                    class="px-3 py-2 border border-card-border rounded-lg text-text-primary focus:outline-none focus:border-deep-purple transition"
                                >
                            </div>
                            <button
                                type="submit"
                                class="text-white py-3 rounded-lg font-medium transition-all"
                                style="background-color: #534AB7; transform: scale(1);"
                                onmouseenter="this.style.backgroundColor='#3C3489'; this.style.transform='scale(1.01)'"
                                onmouseleave="this.style.backgroundColor='#534AB7'; this.style.transform='scale(1)'"
                            >
                                Book now
                            </button>
                            <div id="message-${evt.id}" class="hidden"></div>
                        </form>
                    </div>
                `
                        : `
                    <div class="py-3 px-4 rounded-lg mb-2 text-center text-sm font-bold ${availabilityClasses}">
                        ${availabilityText}
                    </div>
                    <div class="h-1 bg-card-border rounded-full overflow-hidden mb-4">
                        <div class="h-full bg-card-border" style="width: 0%"></div>
                    </div>
                `
                }
            </div>
        `;
        })
        .join("");
}

async function bookTicket(e, eventId) {
    e.preventDefault();

    const email = document.getElementById(`email-${eventId}`).value;
    const quantity = Number.parseInt(
        document.getElementById(`quantity-${eventId}`).value,
    );
    const messageEl = document.getElementById(`message-${eventId}`);
    const button = e.target.querySelector('button[type="submit"]');

    button.disabled = true;
    button.textContent = "Booking...";

    try {
        const response = await fetch(`/events/${eventId}/bookings.json`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": getCSRFToken(),
            },
            body: JSON.stringify({
                booking: { email, quantity },
            }),
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.className =
                "p-3 rounded-lg mt-2 text-sm text-center bg-available-bg text-available-text border border-available-text";
            messageEl.textContent = `Success! Your booking is: ${data.reference}`;
            messageEl.classList.remove("hidden");

            e.target.reset();
            setTimeout(() => loadEvents(), 6000);
        } else {
            throw new Error(data.error || "Booking failed");
        }
    } catch (error) {
        messageEl.className =
            "p-3 rounded-lg mt-2 text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
        messageEl.textContent = `Error: ${error.message}`;
        messageEl.classList.remove("hidden");
    } finally {
        button.disabled = false;
        button.textContent = "Book now";
    }
}

async function searchBooking() {
    const reference = document
        .getElementById("reference-input")
        .value.trim()
        .toUpperCase();
    const resultEl = document.getElementById("booking-result");
    const detailsEl = document.getElementById("booking-details");

    if (!reference) {
        resultEl.className =
            "p-3 rounded-lg text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
        resultEl.textContent = "Please enter a booking reference";
        resultEl.classList.remove("hidden");
        detailsEl.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(`/bookings/${reference}.json`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const booking = await response.json();
            const bookedDate = new Date(booking.booked_at);

            resultEl.className =
                "p-3 rounded-lg text-sm text-center bg-available-bg text-available-text border border-available-text";
            resultEl.textContent = "Booking found!";
            resultEl.classList.remove("hidden");

            detailsEl.innerHTML = `
                <div class="flex justify-between py-2 border-b" style="border-color: #D3D1C7;">
                    <span class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Reference</span>
                    <span class="text-sm text-text-primary">${booking.reference}</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color: #D3D1C7;">
                    <span class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Email</span>
                    <span class="text-sm text-text-primary">${booking.email}</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color: #D3D1C7;">
                    <span class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Quantity</span>
                    <span class="text-sm text-text-primary">${booking.quantity} ticket(s)</span>
                </div>
                <div class="flex justify-between py-2 border-b" style="border-color: #D3D1C7;">
                    <span class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Status</span>
                    <span class="text-sm font-semibold ${booking.status === "confirmed" ? "text-available-text" : "text-sold-out-text"}">${booking.status}</span>
                </div>
                <div class="flex justify-between py-2 ${booking.status === "confirmed" ? "border-b" : ""}" style="${booking.status === "confirmed" ? "border-color: #D3D1C7;" : ""}">
                    <span class="text-xs font-medium text-text-secondary" style="font-size: 13px;">Booked at</span>
                    <span class="text-sm text-text-primary">${bookedDate.toLocaleString()}</span>
                </div>
                ${
                    booking.status === "confirmed"
                        ? `
                    <div class="pt-4">
                        <button
                            onclick="cancelBooking('${booking.reference}')"
                            class="w-full py-2.5 rounded-lg font-medium transition-all border"
                            style="border-color: #DC2626; color: #DC2626; background-color: transparent;"
                            onmouseenter="this.style.backgroundColor='#DC2626'; this.style.color='white'"
                            onmouseleave="this.style.backgroundColor='transparent'; this.style.color='#DC2626'"
                        >
                            Cancel booking
                        </button>
                    </div>
                `
                        : ""
                }
            `;
            detailsEl.classList.remove("hidden");
        } else {
            resultEl.className =
                "p-3 rounded-lg text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
            resultEl.textContent =
                "Booking not found. Please check your reference number.";
            resultEl.classList.remove("hidden");
            detailsEl.classList.add("hidden");
        }
    } catch (error) {
        resultEl.className =
            "p-3 rounded-lg text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
        resultEl.textContent = "Error searching for booking. Please try again.";
        resultEl.classList.remove("hidden");
        detailsEl.classList.add("hidden");
    }
}

async function cancelBooking(reference) {
    if (
        !confirm(
            "Are you sure you want to cancel this booking? This action cannot be undone.",
        )
    ) {
        return;
    }

    const resultEl = document.getElementById("booking-result");
    const detailsEl = document.getElementById("booking-details");

    try {
        const response = await fetch(`/bookings/${reference}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": getCSRFToken(),
            },
        });

        const data = await response.json();

        if (response.ok) {
            resultEl.className =
                "p-3 rounded-lg text-sm text-center bg-available-bg text-available-text border border-available-text";
            resultEl.textContent = "Booking cancelled successfully!";
            resultEl.classList.remove("hidden");

            // Reload events to update availability
            setTimeout(() => loadEvents(), 1000);

            // Clear booking details after a short delay
            setTimeout(() => {
                detailsEl.classList.add("hidden");
                document.getElementById("reference-input").value = "";
            }, 2000);
        } else {
            throw new Error(data.error || "Cancellation failed");
        }
    } catch (error) {
        resultEl.className =
            "p-3 rounded-lg text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
        resultEl.textContent = `Error: ${error.message}`;
        resultEl.classList.remove("hidden");
    }
}

async function createEvent(e) {
    e.preventDefault();

    const name = document.getElementById("event-name").value;
    const description = document.getElementById("event-description").value;
    const venue = document.getElementById("event-venue").value;
    const capacity = Number.parseInt(document.getElementById("event-capacity").value);
    const eventDate = document.getElementById("event-date").value;
    const messageEl = document.getElementById("create-event-message");
    const button = e.target.querySelector('button[type="submit"]');

    button.disabled = true;
    button.textContent = "Creating...";

    try {
        const response = await fetch("/events.json", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": getCSRFToken(),
            },
            body: JSON.stringify({
                event: {
                    name,
                    description,
                    venue,
                    capacity,
                    event_date: eventDate,
                },
            }),
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.className =
                "p-3 rounded-lg mt-2 text-sm text-center bg-available-bg text-available-text border border-available-text";
            messageEl.textContent = `Success! Event "${data.name}" has been created.`;
            messageEl.classList.remove("hidden");

            e.target.reset();
            setTimeout(() => {
                loadEvents();
                messageEl.classList.add("hidden");
            }, 3000);
        } else {
            throw new Error(data.error || "Event creation failed");
        }
    } catch (error) {
        messageEl.className =
            "p-3 rounded-lg mt-2 text-sm text-center bg-sold-out-bg text-sold-out-text border border-sold-out-text";
        messageEl.textContent = `Error: ${error.message}`;
        messageEl.classList.remove("hidden");
    } finally {
        button.disabled = false;
        button.textContent = "Create event";
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    loadEvents();

    // Attach create event form handler
    const createEventForm = document.getElementById("create-event-form");
    if (createEventForm) {
        createEventForm.addEventListener("submit", createEvent);
    }
});
