// ============================================================
// BIG MASH BARBER SHOP
// CALENDAR EVENT HELPER
// ============================================================

// Creates and downloads an .ics calendar event.
//
// The date and time come directly from the customer's
// confirmed booking.

export function downloadCalendarEvent({
    appointmentDate,
    appointmentTime,
    barberName,
    hairstyle,
    price,
    customerName,
    customerEmail
}) {

    const shopName = "Big Mash Barber Shop";

    const location =
        "Shop 30B, Nelson Mandela Square, 5th Street, Sandton, Gauteng, 2031, South Africa";

    // --------------------------------------------------------
    // Check that the booking has a date and time
    // --------------------------------------------------------

    if (!appointmentDate || !appointmentTime) {

        alert(
            "The appointment date or time is missing."
        );

        return;
    }

    // --------------------------------------------------------
    // Convert values to strings
    // PostgreSQL may return Date/time values differently.
    // --------------------------------------------------------

    const dateString =
        String(appointmentDate).substring(0, 10);

    const timeString =
        String(appointmentTime).substring(0, 8);

    // --------------------------------------------------------
    // Extract hours and minutes
    // Example:
    // 15:00:00 -> 15 and 00
    // --------------------------------------------------------

    const timeParts =
        timeString.split(":");

    const hours =
        Number(timeParts[0]);

    const minutes =
        Number(timeParts[1]);

    // --------------------------------------------------------
    // Validate the values
    // --------------------------------------------------------

    if (
        !dateString ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {

        console.log(
            "Calendar date:",
            appointmentDate
        );

        console.log(
            "Calendar time:",
            appointmentTime
        );

        alert(
            "The appointment date or time is invalid."
        );

        return;
    }

    // --------------------------------------------------------
    // Create appointment start time
    // --------------------------------------------------------

    const startDate =
        new Date(
            `${dateString}T` +
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:00`
        );

    if (Number.isNaN(startDate.getTime())) {

        alert(
            "The appointment date is invalid."
        );

        return;
    }

    // --------------------------------------------------------
    // Big Mash appointments use 30-minute slots.
    // --------------------------------------------------------

    const endDate =
        new Date(
            startDate.getTime() +
            30 * 60 * 1000
        );

    // --------------------------------------------------------
    // Convert date to ICS format
    //
    // Example:
    // 2026-10-01 15:00
    //
    // becomes:
    // 20261001T150000
    // --------------------------------------------------------

    const formatCalendarDate = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        const seconds =
            String(
                date.getSeconds()
            ).padStart(2, "0");

        return (
            `${year}` +
            `${month}` +
            `${day}` +
            `T` +
            `${hours}` +
            `${minutes}` +
            `${seconds}`
        );
    };

    const start =
        formatCalendarDate(startDate);

    const end =
        formatCalendarDate(endDate);

    // --------------------------------------------------------
    // Escape special characters for ICS
    // --------------------------------------------------------

    const escapeICS = (value) => {

        return String(value || "")
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\r?\n/g, "\\n");
    };

    // --------------------------------------------------------
    // Create unique calendar event ID
    // --------------------------------------------------------

    const eventId =
        `big-mash-${Date.now()}@bigmash.co.za`;

    // --------------------------------------------------------
    // Calendar description
    // --------------------------------------------------------

    const description =
        `Big Mash Barber Shop appointment\n` +
        `Service: ${hairstyle || "Haircut"}\n` +
        `Barber: ${barberName || "Big Mash Barber"}\n` +
        `Price: R${price || 0}\n` +
        `Customer: ${customerName || "Customer"}\n` +
        `Email: ${customerEmail || "Not provided"}`;

    // --------------------------------------------------------
    // Build the calendar file
    // --------------------------------------------------------

    const calendarContent = [

        "BEGIN:VCALENDAR",

        "VERSION:2.0",

        "PRODID:-//Big Mash Barber Shop//Booking//EN",

        "CALSCALE:GREGORIAN",

        "METHOD:PUBLISH",

        "BEGIN:VEVENT",

        `UID:${eventId}`,

        `DTSTART:${start}`,

        `DTEND:${end}`,

        `SUMMARY:${escapeICS(
            `${shopName} - ${hairstyle || "Haircut"}`
        )}`,

        `DESCRIPTION:${escapeICS(
            description
        )}`,

        `LOCATION:${escapeICS(
            location
        )}`,

        "STATUS:CONFIRMED",

        "END:VEVENT",

        "END:VCALENDAR"

    ].join("\r\n");

    // --------------------------------------------------------
    // Create the .ics file
    // --------------------------------------------------------

    const blob =
        new Blob(
            [calendarContent],
            {
                type:
                    "text/calendar;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    // --------------------------------------------------------
    // Download calendar file
    // --------------------------------------------------------

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "big-mash-barber-appointment.ics";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}