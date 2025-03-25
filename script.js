import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBznEzlZirP0pvdYapdJf0_YEJORmAq8Ls",
    authDomain: "hicaa-staffinfo.firebaseapp.com",
    projectId: "hicaa-staffinfo",
    storageBucket: "hicaa-staffinfo.firebasestorage.app",
    messagingSenderId: "576458310276",
    appId: "1:576458310276:web:a449a0e9fc4db2a178f8d1",
    measurementId: "G-4YS2N2QQLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const staffForm = document.getElementById('staffForm');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const responsesBtn = document.getElementById('responsesBtn');
const staffFormLink = document.getElementById('staffFormLink');
const adminModal = document.getElementById('adminModal');
const loginBtn = document.getElementById('loginBtn');
const adminPassword = document.getElementById('adminPassword');
const responsesPage = document.getElementById('responsesPage');
const responsesList = document.getElementById('responsesList');
const mainContent = document.querySelector('.main-content');
const successMessage = document.getElementById('successMessage');
const closeSuccessBtn = document.querySelector('.close-success');
const searchInput = document.getElementById('searchInput');

// Admin password (in a real application, this should be handled server-side)
const ADMIN_PASSWORD = "bananacheese";

// Mobile sidebar toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Success message functions
function showSuccessMessage() {
    successMessage.style.display = 'flex';
}

function hideSuccessMessage() {
    successMessage.style.display = 'none';
}

closeSuccessBtn.addEventListener('click', hideSuccessMessage);

// Navigation functions
function showStaffForm() {
    mainContent.style.display = 'block';
    responsesPage.classList.add('hidden');
    staffFormLink.classList.add('active');
    responsesBtn.classList.remove('active');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

function showResponses() {
    mainContent.style.display = 'none';
    responsesPage.classList.remove('hidden');
    staffFormLink.classList.remove('active');
    responsesBtn.classList.add('active');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
    
    // Load responses data
    const staffRef = ref(database, 'staff');
    onValue(staffRef, (snapshot) => {
        const data = snapshot.val();
        displayResponses(data);
    });
}

// Navigation event listeners
staffFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    showStaffForm();
});

responsesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminModal.style.display = 'flex';
});

// Form submission
staffForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        birthDate: document.getElementById('birthDate').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        fatherName: document.getElementById('fatherName').value,
        fatherPhone: document.getElementById('fatherPhone').value,
        icPassport: document.getElementById('icPassport').value,
        jobTitle: document.getElementById('jobTitle').value,
        submissionDate: new Date().toISOString()
    };

    try {
        const staffRef = ref(database, 'staff');
        await push(staffRef, formData);
        showSuccessMessage();
        staffForm.reset();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form. Please try again.');
    }
});

// Admin login
loginBtn.addEventListener('click', () => {
    if (adminPassword.value === ADMIN_PASSWORD) {
        adminModal.style.display = 'none';
        showResponses();
    } else {
        alert('Incorrect password!');
    }
});

// Function to display responses with search
function displayResponses(data) {
    responsesList.innerHTML = '';
    
    if (data) {
        const searchTerm = searchInput.value.toLowerCase();
        Object.entries(data).forEach(([key, value]) => {
            if (value.firstName.toLowerCase().includes(searchTerm)) {
                const responseCard = document.createElement('div');
                responseCard.className = 'response-card';
                responseCard.innerHTML = `
                    <h3>${value.firstName} ${value.lastName}</h3>
                    <p><strong>Blood Group:</strong> ${value.bloodGroup}</p>
                    <p><strong>Birth Date:</strong> ${new Date(value.birthDate).toLocaleDateString()}</p>
                    <p><strong>Phone Number:</strong> ${value.phoneNumber}</p>
                    <p><strong>Father's Name:</strong> ${value.fatherName}</p>
                    <p><strong>Father's Phone:</strong> ${value.fatherPhone}</p>
                    <p><strong>IC/Passport:</strong> ${value.icPassport}</p>
                    <p><strong>Job Title:</strong> ${value.jobTitle}</p>
                    <p><strong>Submitted:</strong> ${new Date(value.submissionDate).toLocaleString()}</p>
                `;
                responsesList.appendChild(responseCard);
            }
        });
    } else {
        responsesList.innerHTML = '<p>No responses yet.</p>';
    }
}

// Search functionality
searchInput.addEventListener('input', () => {
    const staffRef = ref(database, 'staff');
    onValue(staffRef, (snapshot) => {
        const data = snapshot.val();
        displayResponses(data);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
    if (e.target === successMessage) {
        hideSuccessMessage();
    }
}); 