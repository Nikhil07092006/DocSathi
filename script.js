class DoctorSearch {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.selectedDoctor = null;
        this.init();
    }

    async init() {
        try {
            await this.loadDoctors();
            this.setupEventListeners();
            this.displayAllDoctors(); // Keep hidden initially
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async loadDoctors() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/Nikhil07092006/DocSathi/main/doctors.json");
            if (!response.ok) throw new Error("Failed to load doctors");
            const data = await response.json();
            this.doctors = data.doctors;
            this.filteredDoctors = [...this.doctors];
        } catch (error) {
            console.error("Error loading doctors:", error);
        }
    }

    setupEventListeners() {
        const searchBtn = document.getElementById("searchBtn");
        const doctorNameInput = document.getElementById("doctorName");

        searchBtn.addEventListener("click", () => this.performSearch());

        doctorNameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.performSearch();
            }
        });

        this.setupModalListeners();
    }

    performSearch() {
        const specialization = document.getElementById("specialization").value.toLowerCase();
        const city = document.getElementById("city").value.toLowerCase();
        const doctorName = document.getElementById("doctorName").value.toLowerCase();

        this.filteredDoctors = this.doctors.filter((doctor) => {
            return (
                (!specialization || doctor.specialization.toLowerCase() === specialization) &&
                (!city || doctor.city.toLowerCase() === city) &&
                (!doctorName || doctor.name.toLowerCase().includes(doctorName))
            );
        });

        this.displayResults();
        this.showResultsSection();
        document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
    }

    displayResults() {
        const container = document.getElementById("doctorResults");
        const countLabel = document.getElementById("resultsCount");

        countLabel.textContent = `${this.filteredDoctors.length} doctors found`;

        if (this.filteredDoctors.length === 0) {
            container.innerHTML = `<div class="no-results"><h3>No doctors found</h3><p>Try changing search filters.</p></div>`;
            return;
        }

        container.innerHTML = this.filteredDoctors.map((d) => this.createDoctorCard(d)).join("");
    }

    displayAllDoctors() {
        this.filteredDoctors = [];
        this.displayResults();
    }

    showResultsSection() {
        document.getElementById("resultsSection").style.display = "block";
    }

    createDoctorCard(doctor) {
        const initials = doctor.name.split(" ").map(n => n[0]).join("");
        return `
        <div class="doctor-card">
            <div class="doctor-header">
                <div class="doctor-avatar">${initials}</div>
                <div class="doctor-info">
                    <h4>${doctor.name}</h4>
                    <span class="doctor-specialization">${this.formatSpecialization(doctor.specialization)}</span>
                </div>
            </div>
            <div class="doctor-details">
                <p><strong>Experience:</strong> ${doctor.experience}</p>
                <p><strong>Hospital:</strong> ${doctor.hospital}</p>
                <p><strong>City:</strong> ${this.formatCity(doctor.city)}</p>
                <p><strong>Phone:</strong> ${doctor.phone}</p>
                <p><strong>Email:</strong> ${doctor.email}</p>
            </div>
            <button class="contact-btn" onclick="doctorSearch.openAppointmentModal(${doctor.id})">Book Appointment</button>
        </div>`;
    }

    formatSpecialization(spec) {
        const specs = {
            cardiologist: "Cardiologist",
            dermatologist: "Dermatologist",
            pediatrician: "Pediatrician",
            neurologist: "Neurologist",
            orthopedic: "Orthopedic Surgeon",
            gynecologist: "Gynecologist",
            psychiatrist: "Psychiatrist",
            general: "General Physician"
        };
        return specs[spec] || spec;
    }

    formatCity(city) {
        return city.charAt(0).toUpperCase() + city.slice(1);
    }

    openAppointmentModal(doctorId) {
        const doctor = this.doctors.find((d) => d.id === doctorId);
        if (!doctor) return;
        this.selectedDoctor = doctor;

        document.getElementById("selectedDoctor").innerHTML = `
            <h3>${doctor.name}</h3>
            <p><strong>Specialization:</strong> ${this.formatSpecialization(doctor.specialization)}</p>
            <p><strong>Hospital:</strong> ${doctor.hospital}</p>
            <p><strong>City:</strong> ${this.formatCity(doctor.city)}</p>
            <p><strong>Experience:</strong> ${doctor.experience}</p>`;

        document.getElementById("appointmentModal").style.display = "block";
    }

    setupModalListeners() {
        const modal = document.getElementById("appointmentModal");
        const successModal = document.getElementById("successModal");

        document.querySelector(".close").onclick = () => {
            modal.style.display = "none";
            this.resetForm();
        };

        document.getElementById("cancelAppointment").onclick = () => {
            modal.style.display = "none";
            this.resetForm();
        };

        document.getElementById("closeSuccess").onclick = () => {
            successModal.style.display = "none";
        };

        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                this.resetForm();
            }
            if (e.target === successModal) {
                successModal.style.display = "none";
            }
        };

        document.getElementById("appointmentForm").onsubmit = (e) => {
            e.preventDefault();
            this.submitAppointment();
        };

        const today = new Date().toISOString().split("T")[0];
        document.getElementById("appointmentDate").min = today;
    }

    resetForm() {
        document.getElementById("appointmentForm").reset();
        this.selectedDoctor = null;
    }

    submitAppointment() {
        const formData = {
            doctor: this.selectedDoctor,
            patient: {
                name: document.getElementById("patientName").value,
                age: document.getElementById("patientAge").value,
                gender: document.getElementById("patientGender").value,
                phone: document.getElementById("patientPhone").value,
                email: document.getElementById("patientEmail").value,
            },
            appointment: {
                date: document.getElementById("appointmentDate").value,
                time: document.getElementById("appointmentTime").value,
            },
            medicalHistory: document.getElementById("medicalHistory").value,
        };

        document.getElementById("appointmentModal").style.display = "none";
        this.showSuccessModal(formData);
        this.resetForm();
    }

    showSuccessModal(formData) {
        const modal = document.getElementById("successModal");
        const details = document.getElementById("appointmentDetails");

        const date = new Date(formData.appointment.date).toLocaleDateString("en-IN");
        const time = this.formatTime(formData.appointment.time);

        details.innerHTML = `
            <h4>Appointment Details:</h4>
            <p><strong>Doctor:</strong> ${formData.doctor.name}</p>
            <p><strong>Specialization:</strong> ${this.formatSpecialization(formData.doctor.specialization)}</p>
            <p><strong>Hospital:</strong> ${formData.doctor.hospital}</p>
            <p><strong>Patient:</strong> ${formData.patient.name}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Contact:</strong> ${formData.patient.phone}</p>
            <br><p><em>This is a demo booking confirmation.</em></p>`;
        
        modal.style.display = "block";
    }

    formatTime(time) {
        const [h, m] = time.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hr12 = hour % 12 || 12;
        return `${hr12}:${m} ${ampm}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.doctorSearch = new DoctorSearch();

    // Section toggle logic
    const homeLink = document.querySelector('a[href="#homeSection"]');
    const aboutLink = document.querySelector('a[href="#aboutSection"]');
    const contactLink = document.querySelector('a[href="#contactSection"]');
    const searchLink = document.querySelector('a[href="#searchSection"]');

    const homeSection = document.getElementById("homeSection");
    const searchSection = document.getElementById("searchSection");
    const aboutSection = document.getElementById("aboutSection");
    const contactSection = document.getElementById("contactSection");
    const resultsSection = document.getElementById("resultsSection");

    // Hide all toggleable sections initiall
    aboutSection.style.display = "none";
    contactSection.style.display = "none";
    resultsSection.style.display = "none";

    function hideAllSections() {
        aboutSection.style.display = "none";
        contactSection.style.display = "none";
        resultsSection.style.display = "none";
    }

    homeLink.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllSections();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    searchLink.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllSections();
        searchSection.scrollIntoView({ behavior: "smooth" });
    });

    aboutLink.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllSections();
        aboutSection.style.display = "block";
        aboutSection.scrollIntoView({ behavior: "smooth" });
    });

    contactLink.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllSections();
        contactSection.style.display = "block";
        contactSection.scrollIntoView({ behavior: "smooth" });
    });
});

