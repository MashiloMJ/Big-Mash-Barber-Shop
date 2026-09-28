import { useEffect, useState } from "react";

function AdminDashboard({ user, onLogout }) {

    // ==========================================
    // DASHBOARD DATA
    // ==========================================

    // Dashboard statistics
    const [statistics, setStatistics] = useState({
        totalBarbers: 0,
        totalAppointments: 0,
        totalAvailability: 0
    });

    // All barbers
    const [barbers, setBarbers] = useState([]);

    // All appointments
    const [appointments, setAppointments] = useState([]);

    // All availability slots
    const [availability, setAvailability] = useState([]);


    // ==========================================
    // BARBER FORM
    // ==========================================

    // Show or hide the barber form
    const [showBarberForm, setShowBarberForm] = useState(false);

    // Stores the barber being edited
    // null means we are adding a new barber
    const [editingBarber, setEditingBarber] = useState(null);

    // Barber name
    const [barberName, setBarberName] = useState("");

    // Barber specialty
    const [barberSpecialty, setBarberSpecialty] = useState("");

    // Form loading state
    const [barberFormLoading, setBarberFormLoading] = useState(false);

    // Form error
    const [barberFormError, setBarberFormError] = useState("");


    // ==========================================
    // DELETE STATE
    // ==========================================

    // Stores the barber currently being deleted
    const [deletingBarberId, setDeletingBarberId] = useState(null);

    // Delete error
    const [deleteError, setDeleteError] = useState("");


    // ==========================================
    // GENERAL DASHBOARD STATE
    // ==========================================

    // Main loading state
    const [loading, setLoading] = useState(true);

    // Main error
    const [error, setError] = useState("");


    // ==========================================
    // LOAD ADMIN DATA
    // ==========================================

    useEffect(() => {
        loadAdminData();
    }, []);


    const loadAdminData = async () => {

        try {

            setLoading(true);
            setError("");

            // Get logged-in user's JWT
            const token = localStorage.getItem("token");

            if (!token) {

                setError("You are not logged in.");

                return;
            }


            // ==========================================
            // DASHBOARD STATISTICS
            // ==========================================

            const dashboardResponse = await fetch(
                "http://localhost:5000/api/admin/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!dashboardResponse.ok) {

                throw new Error(
                    "Unable to load dashboard statistics."
                );
            }

            const dashboardData =
                await dashboardResponse.json();

            setStatistics(dashboardData.statistics);


            // ==========================================
            // BARBERS
            // ==========================================

            const barbersResponse = await fetch(
                "http://localhost:5000/api/admin/barbers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!barbersResponse.ok) {

                throw new Error(
                    "Unable to load barbers."
                );
            }

            const barbersData =
                await barbersResponse.json();

            setBarbers(barbersData);


            // ==========================================
            // APPOINTMENTS
            // ==========================================

            const appointmentsResponse = await fetch(
                "http://localhost:5000/api/admin/appointments",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!appointmentsResponse.ok) {

                throw new Error(
                    "Unable to load appointments."
                );
            }

            const appointmentsData =
                await appointmentsResponse.json();

            setAppointments(appointmentsData);


            // ==========================================
            // AVAILABILITY
            // ==========================================

            const availabilityResponse = await fetch(
                "http://localhost:5000/api/admin/availability",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!availabilityResponse.ok) {

                throw new Error(
                    "Unable to load availability."
                );
            }

            const availabilityData =
                await availabilityResponse.json();

            setAvailability(availabilityData);

        } catch (error) {

            console.error(error);

            setError(error.message);

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // OPEN ADD BARBER FORM
    // ==========================================

    const handleOpenAddForm = () => {

        // Make sure we are not editing
        setEditingBarber(null);

        // Clear old values
        setBarberName("");
        setBarberSpecialty("");

        // Clear errors
        setBarberFormError("");

        // Open form
        setShowBarberForm(true);
    };


    // ==========================================
    // OPEN EDIT BARBER FORM
    // ==========================================

    const handleOpenEditForm = (barber) => {

        // Store the barber being edited
        setEditingBarber(barber);

        // Put existing data into the form
        setBarberName(barber.name || "");

        setBarberSpecialty(
            barber.specialty || ""
        );

        // Clear previous errors
        setBarberFormError("");

        // Open form
        setShowBarberForm(true);
    };


    // ==========================================
    // CLOSE BARBER FORM
    // ==========================================

    const handleCancelBarberForm = () => {

        setShowBarberForm(false);

        setEditingBarber(null);

        setBarberName("");

        setBarberSpecialty("");

        setBarberFormError("");
    };


    // ==========================================
    // SAVE BARBER
    // ==========================================

    const handleSaveBarber = async () => {

        try {

            setBarberFormLoading(true);

            setBarberFormError("");


            // Validate name
            if (!barberName.trim()) {

                setBarberFormError(
                    "Barber name is required."
                );

                return;
            }


            // Get Super Admin JWT
            const token =
                localStorage.getItem("token");


            // ==========================================
            // DETERMINE REQUEST
            // ==========================================

            const isEditing =
                editingBarber !== null;


            const url = isEditing

                ? `http://localhost:5000/api/admin/barbers/${editingBarber.id}`

                : "http://localhost:5000/api/admin/barbers";


            const method =
                isEditing
                    ? "PUT"
                    : "POST";


            // ==========================================
            // SEND REQUEST
            // ==========================================

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        name: barberName.trim(),

                        specialty:
                            barberSpecialty.trim()

                    })
                }
            );


            const data =
                await response.json();


            // Check backend response
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to save barber."
                );
            }


            // Close form
            setShowBarberForm(false);

            // Clear form
            setEditingBarber(null);

            setBarberName("");

            setBarberSpecialty("");


            // Reload dashboard
            await loadAdminData();

        } catch (error) {

            console.error(error);

            setBarberFormError(
                error.message
            );

        } finally {

            setBarberFormLoading(false);

        }

    };


    // ==========================================
    // DELETE BARBER
    // ==========================================

    const handleDeleteBarber = async (barber) => {

        // Ask for confirmation
        const confirmed = window.confirm(
            `Are you sure you want to delete ${barber.name}?`
        );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingBarberId(barber.id);

            setDeleteError("");


            // Get Super Admin JWT
            const token =
                localStorage.getItem("token");


            // Send DELETE request
            const response = await fetch(
                `http://localhost:5000/api/admin/barbers/${barber.id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            // Check backend response
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete barber."
                );
            }


            // Reload dashboard
            await loadAdminData();

        } catch (error) {

            console.error(error);

            setDeleteError(
                error.message
            );

        } finally {

            setDeletingBarberId(null);

        }

    };


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (

            <div className="admin-dashboard">

                <div className="admin-loading">

                    Loading Super Admin Dashboard...

                </div>

            </div>

        );
    }


    // ==========================================
    // ERROR SCREEN
    // ==========================================

    if (error) {

        return (

            <div className="admin-dashboard">

                <div className="admin-error">

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="admin-refresh-button"
                        onClick={loadAdminData}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );
    }


    // ==========================================
    // MAIN ADMIN DASHBOARD
    // ==========================================

    return (

        <div className="admin-dashboard">

            <div className="admin-layout">


                {/* ==========================================
                    ADMIN SIDEBAR
                ========================================== */}

                <aside className="admin-sidebar">

                    <div className="admin-sidebar-brand">

                        <h2>
                            BIG <span>MASH</span>
                        </h2>

                        <p>
                            ADMIN PANEL
                        </p>

                    </div>


                    {/* Navigation */}

                    <nav className="admin-sidebar-nav">

                        <a href="#admin-dashboard">
                            Dashboard
                        </a>

                        <a href="#admin-barbers">
                            Barbers
                        </a>

                        <a href="#admin-appointments">
                            Appointments
                        </a>

                        <a href="#admin-availability">
                            Availability
                        </a>

                    </nav>


                    {/* Admin user */}

                    <div className="admin-sidebar-footer">

                        <p>
                            {user?.name || "Super Admin"}
                        </p>

                        <span>
                            SUPER ADMIN
                        </span>


                        <button
                            type="button"
                            className="admin-sidebar-logout"
                            onClick={onLogout}
                        >
                            Logout
                        </button>

                    </div>

                </aside>


                {/* ==========================================
                    MAIN CONTENT
                ========================================== */}

                <main className="admin-main-content">


                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div
                        id="admin-dashboard"
                        className="admin-header"
                    >

                        <div>

                            <p className="admin-label">
                                BIG MASH BARBER SHOP
                            </p>

                            <h1>
                                Super Admin Dashboard
                            </h1>

                            <p>
                                Manage and monitor the barber
                                shop system.
                            </p>

                        </div>


                        <div className="admin-header-actions">

                            <button
                                type="button"
                                className="admin-refresh-button"
                                onClick={loadAdminData}
                            >
                                Refresh Data
                            </button>


                            <button
                                type="button"
                                className="admin-logout-button"
                                onClick={onLogout}
                            >
                                Logout
                            </button>

                        </div>

                    </div>


                    {/* ==========================================
                        STATISTICS
                    ========================================== */}

                    <section className="admin-statistics">


                        <div className="admin-stat-card">

                            <span>
                                Total Barbers
                            </span>

                            <strong>
                                {statistics.totalBarbers}
                            </strong>

                        </div>


                        <div className="admin-stat-card">

                            <span>
                                Total Appointments
                            </span>

                            <strong>
                                {statistics.totalAppointments}
                            </strong>

                        </div>


                        <div className="admin-stat-card">

                            <span>
                                Available Slots
                            </span>

                            <strong>
                                {statistics.totalAvailability}
                            </strong>

                        </div>


                    </section>


                    {/* ==========================================
                        BARBERS
                    ========================================== */}

                    <section
                        id="admin-barbers"
                        className="admin-section"
                    >

                        <div className="admin-section-heading">

                            <div>

                                <h2>
                                    Barbers
                                </h2>

                                <p>
                                    Registered barbers in the
                                    system.
                                </p>

                            </div>


                            {/* Only the Admin Dashboard
                                can reach this UI because
                                StaffApp sends BARBER users
                                to BarberDashboard. */}

                            <button
                                type="button"
                                className="admin-add-button"
                                onClick={
                                    handleOpenAddForm
                                }
                            >
                                + Add Barber
                            </button>

                        </div>


                        {/* ==========================================
                            DELETE ERROR
                        ========================================== */}

                        {deleteError && (

                            <div className="admin-form-error">

                                {deleteError}

                            </div>

                        )}


                        {/* ==========================================
                            BARBER FORM
                        ========================================== */}

                        {showBarberForm && (

                            <div className="admin-barber-form">

                                <h3>

                                    {editingBarber
                                        ? "Edit Barber"
                                        : "Add New Barber"}

                                </h3>


                                {/* Barber name */}

                                <div className="admin-form-group">

                                    <label>
                                        Barber Name
                                    </label>

                                    <input
                                        type="text"
                                        value={barberName}
                                        onChange={(event) =>
                                            setBarberName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter barber name"
                                    />

                                </div>


                                {/* Specialty */}

                                <div className="admin-form-group">

                                    <label>
                                        Specialty
                                    </label>

                                    <input
                                        type="text"
                                        value={barberSpecialty}
                                        onChange={(event) =>
                                            setBarberSpecialty(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. Fade Specialist"
                                    />

                                </div>


                                {/* Form error */}

                                {barberFormError && (

                                    <p className="admin-form-error">
                                        {barberFormError}
                                    </p>

                                )}


                                {/* Form buttons */}

                                <div className="admin-form-actions">

                                    <button
                                        type="button"
                                        className="admin-save-button"
                                        onClick={
                                            handleSaveBarber
                                        }
                                        disabled={
                                            barberFormLoading
                                        }
                                    >

                                        {barberFormLoading

                                            ? "Saving..."

                                            : editingBarber
                                                ? "Save Changes"
                                                : "Save Barber"}

                                    </button>


                                    <button
                                        type="button"
                                        className="admin-cancel-button"
                                        onClick={
                                            handleCancelBarberForm
                                        }
                                        disabled={
                                            barberFormLoading
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        )}


                        {/* ==========================================
                            BARBER CARDS
                        ========================================== */}

                        <div className="admin-barber-grid">

                            {barbers.length > 0 ? (

                                barbers.map((barber) => (

                                    <div
                                        className="admin-barber-card"
                                        key={barber.id}
                                    >

                                        <div className="admin-barber-avatar">

                                            {barber.name
                                                ? barber.name.charAt(0)
                                                : "B"}

                                        </div>


                                        <div className="admin-barber-info">

                                            <h3>
                                                {barber.name}
                                            </h3>

                                            <p>
                                                {barber.specialty ||
                                                    "Barber"}
                                            </p>


                                            {/* Admin actions */}

                                            <div className="admin-barber-actions">

                                                <button
                                                    type="button"
                                                    className="admin-edit-button"
                                                    onClick={() =>
                                                        handleOpenEditForm(
                                                            barber
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    className="admin-delete-button"
                                                    onClick={() =>
                                                        handleDeleteBarber(
                                                            barber
                                                        )
                                                    }
                                                    disabled={
                                                        deletingBarberId ===
                                                        barber.id
                                                    }
                                                >

                                                    {deletingBarberId ===
                                                    barber.id

                                                        ? "Deleting..."

                                                        : "Delete"}

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))

                            ) : (

                                <p className="admin-empty-message">
                                    No barbers found.
                                </p>

                            )}

                        </div>

                    </section>


                    {/* ==========================================
                        APPOINTMENTS
                    ========================================== */}

                    <section
                        id="admin-appointments"
                        className="admin-section"
                    >

                        <div className="admin-section-heading">

                            <div>

                                <h2>
                                    Appointments
                                </h2>

                                <p>
                                    All customer appointments.
                                </p>

                            </div>

                        </div>


                        <div className="admin-table-container">

                            <table className="admin-table">

                                <thead>

                                    <tr>

                                        <th>Date</th>

                                        <th>Time</th>

                                        <th>Customer</th>

                                        <th>Barber</th>

                                        <th>Hairstyle</th>

                                        <th>Price</th>

                                        <th>Payment</th>

                                        <th>Status</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {appointments.length > 0 ? (

                                        appointments.map(
                                            (appointment) => (

                                                <tr
                                                    key={
                                                        appointment.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            appointment.appointment_date
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.appointment_time
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                appointment.customer_name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                appointment.customer_phone
                                                            }
                                                        </small>

                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.barber_name ||
                                                            "Unknown"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.hairstyle
                                                        }
                                                    </td>

                                                    <td>
                                                        R
                                                        {
                                                            appointment.price
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.payment_method
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            appointment.status
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="admin-empty-message"
                                            >
                                                No appointments found.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* ==========================================
                        AVAILABILITY
                    ========================================== */}

                    <section
                        id="admin-availability"
                        className="admin-section"
                    >

                        <div className="admin-section-heading">

                            <div>

                                <h2>
                                    Availability
                                </h2>

                                <p>
                                    Available barber time slots.
                                </p>

                            </div>

                        </div>


                        <div className="admin-availability-grid">

                            {availability.map((slot) => (

                                <div
                                    className="admin-availability-card"
                                    key={slot.id}
                                >

                                    <strong>
                                        {
                                            slot.barber_name ||
                                            "Unknown Barber"
                                        }
                                    </strong>

                                    <span>
                                        {slot.date}
                                    </span>

                                    <span>
                                        {slot.time}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </section>


                </main>

            </div>

        </div>
    );
}

export default AdminDashboard;