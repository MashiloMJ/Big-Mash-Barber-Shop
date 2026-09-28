import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function BarberDashboard({ user, onLogout }) {

    // ================================
    // APPOINTMENTS
    // ================================

    const [appointments, setAppointments] = useState([]);

    const [appointmentsLoading, setAppointmentsLoading] = useState(true);

    const [appointmentsError, setAppointmentsError] = useState("");


    // ================================
    // AVAILABILITY
    // ================================

    const [availability, setAvailability] = useState([]);

    const [availabilityLoading, setAvailabilityLoading] = useState(true);

    const [availabilityError, setAvailabilityError] = useState("");

    const [selectedDate, setSelectedDate] = useState("2026-10-02");


    // ================================
    // LOAD APPOINTMENTS
    // ================================

    useEffect(() => {

        const loadAppointments = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/staff/appointments`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {

                    setAppointmentsError(
                        data.message ||
                        "Unable to load appointments."
                    );

                    setAppointmentsLoading(false);

                    return;
                }

                setAppointments(data);

            } catch (error) {

                console.error(error);

                setAppointmentsError(
                    "Unable to connect to the server."
                );

            }

            setAppointmentsLoading(false);

        };

        loadAppointments();

    }, []);


    // ================================
    // LOAD AVAILABILITY
    // ================================

    useEffect(() => {

        const loadAvailability = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/staff/availability`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {

                    setAvailabilityError(
                        data.message ||
                        "Unable to load availability."
                    );

                    setAvailabilityLoading(false);

                    return;
                }

                setAvailability(data);

            } catch (error) {

                console.error(error);

                setAvailabilityError(
                    "Unable to connect to the server."
                );

            }

            setAvailabilityLoading(false);

        };

        loadAvailability();

    }, []);


    // ================================
    // GET SLOTS FOR SELECTED DATE
    // ================================

    const selectedDaySlots = availability.filter(
        (slot) => slot.date === selectedDate
    );


    return (

        <div className="staff-dashboard">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <header className="dashboard-header">

                <div>

                    <h1>
                        Barber Dashboard
                    </h1>

                    <p>
                        Welcome, {user.name}
                    </p>

                </div>

                <button onClick={onLogout}>
                    Logout
                </button>

            </header>


            {/* ================================= */}
            {/* PROFILE */}
            {/* ================================= */}

            <section className="dashboard-card">

                <h2>
                    My Profile
                </h2>

                <p>
                    <strong>Name:</strong> {user.name}
                </p>

                <p>
                    <strong>Email:</strong> {user.email}
                </p>

                <p>
                    <strong>Role:</strong> Barber
                </p>

            </section>


            {/* ================================= */}
            {/* AVAILABILITY */}
            {/* ================================= */}

            <section className="dashboard-card">

                <h2>
                    My Availability
                </h2>

                <p className="dashboard-description">
                    View your available and booked time slots.
                </p>


                {availabilityLoading && (
                    <p>
                        Loading availability...
                    </p>
                )}


                {availabilityError && (
                    <p className="dashboard-error">
                        {availabilityError}
                    </p>
                )}


                {!availabilityLoading &&
                    !availabilityError && (

                        <>

                            {/* Date selector */}

                            <div className="availability-date">

                                <label>
                                    Select Date
                                </label>

                                <input
                                    type="date"
                                    value={selectedDate}
                                    min="2026-10-02"
                                    max="2026-10-31"
                                    onChange={(e) =>
                                        setSelectedDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* Slots */}

                            <div className="availability-slots">

                                {selectedDaySlots.length === 0 ? (

                                    <p>
                                        No availability for this date.
                                    </p>

                                ) : (

                                    selectedDaySlots.map((slot) => (

                                        <div
                                            key={slot.id}
                                            className={
                                                slot.status === "BOOKED"
                                                    ? "availability-slot booked"
                                                    : "availability-slot available"
                                            }
                                        >

                                            <span>
                                                {slot.time.substring(0, 5)}
                                            </span>

                                            <strong>
                                                {slot.status}
                                            </strong>

                                        </div>

                                    ))

                                )}

                            </div>

                        </>

                    )}

            </section>


{/* ================================= */}
{/* APPOINTMENTS */}
{/* ================================= */}

<section className="dashboard-card">

    <div className="appointments-heading">

        <div>
            <h2>My Appointments</h2>

            <p className="dashboard-description">
                View your upcoming customer bookings.
            </p>
        </div>

        <span className="appointment-count">
            {appointments.length} booking
            {appointments.length !== 1 ? "s" : ""}
        </span>

    </div>


    {/* Loading message */}

    {appointmentsLoading && (
        <p>
            Loading appointments...
        </p>
    )}


    {/* Error message */}

    {appointmentsError && (
        <p className="dashboard-error">
            {appointmentsError}
        </p>
    )}


    {/* No appointments */}

    {!appointmentsLoading &&
        !appointmentsError &&
        appointments.length === 0 && (

            <p className="empty-appointments">
                You currently have no appointments.
            </p>

        )}


    {/* Appointments table */}

    {!appointmentsLoading &&
        !appointmentsError &&
        appointments.length > 0 && (

            <div className="appointments-table">

                <table>

                    <thead>

                        <tr>

                            <th>Date</th>

                            <th>Time</th>

                            <th>Customer</th>

                            <th>Phone</th>

                            <th>Hairstyle</th>

                            <th>Price</th>

                            <th>Status</th>

                        </tr>

                    </thead>


                    <tbody>

                        {appointments.map((appointment) => (

                            <tr key={appointment.id}>

                                {/* Date */}

                                <td>
                                    {appointment.appointment_date}
                                </td>


                                {/* Time */}

                                <td>
                                    {appointment.appointment_time?.substring(
                                        0,
                                        5
                                    )}
                                </td>


                                {/* Customer */}

                                <td>
                                    <strong>
                                        {appointment.customer_name}
                                    </strong>
                                </td>


                                {/* Phone */}

                                <td>
                                    {appointment.customer_phone}
                                </td>


                                {/* Hairstyle */}

                                <td>
                                    {appointment.hairstyle || "Not specified"}
                                </td>


                                {/* Price */}

                                <td>
                                    {appointment.price !== null &&
                                    appointment.price !== undefined &&
                                    appointment.price !== "" ? (
                                        `R${Number(
                                            appointment.price
                                        ).toFixed(2)}`
                                    ) : (
                                        "—"
                                    )}
                                </td>


                                {/* Status */}

                                <td>

                                    <span
                                        className={`appointment-status ${
                                            appointment.status
                                                ?.toLowerCase()
                                        }`}
                                    >
                                        {appointment.status}
                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        )}

</section>



        </div>

    );
}

export default BarberDashboard;