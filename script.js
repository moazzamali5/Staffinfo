// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBznEzlZirP0pvdYapdJf0_YEJORmAq8Ls",
    authDomain: "hicaa-staffinfo.firebaseapp.com",
    databaseURL: "https://hicaa-staffinfo-default-rtdb.firebaseio.com",
    projectId: "hicaa-staffinfo",
    storageBucket: "hicaa-staffinfo.firebasestorage.app",
    messagingSenderId: "576458310276",
    appId: "1:576458310276:web:abdef92ccd65d4c878f8d1",
    measurementId: "G-Q277HZBJRM"
};

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { getDatabase, ref, push, onValue, query, orderByChild, set } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// DOM Elements
const feedbackForm = document.getElementById('feedbackForm');
const customerModal = document.getElementById('customerModal');
const adminModal = document.getElementById('adminModal');
const customerForm = document.getElementById('customerForm');
const adminForm = document.getElementById('adminForm');
const viewResponsesBtn = document.getElementById('viewResponses');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const thankYouModal = document.getElementById('thankYouModal');
const feedbackSection = document.getElementById('feedbackSection');
const responsesSection = document.getElementById('responsesSection');
const receiptInput = document.getElementById('receiptInput');
const receiptPreview = document.getElementById('receiptPreview');
const pastReviewsList = document.getElementById('pastReviewsList');
const commentUploadInput = document.getElementById('commentUploadInput');
const commentUploadPreview = document.getElementById('commentUploadPreview');
const submitBtn = document.querySelector('.submit-btn');

// Step-by-Step Form Handling
const receiptQuestion = document.getElementById('receiptQuestion');
const receiptUpload = document.getElementById('receiptUpload');
const lastPurchase = document.getElementById('lastPurchase');
const productRating = document.getElementById('productRating');
const environmentRating = document.getElementById('environmentRating');
const serviceRating = document.getElementById('serviceRating');
const overallExperience = document.getElementById('overallExperience');

// Form Sections Array
let formSections = [
    'receiptQuestion',
    'receiptUpload',
    'diningType',
    'drinks',
    'spending',
    'recommendations',
    'productRating',
    'environmentRating',
    'serviceRating',
    'overallExperience'
];

// Current section index
let currentSectionIndex = 0;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Make database available globally
window.database = database;
window.ref = ref;
window.push = push;
window.onValue = onValue;
window.query = query;
window.orderByChild = orderByChild;

// Ensure receipt upload section is visible
document.querySelector('.rating-section').classList.add('visible');

// Star Rating System
document.querySelectorAll('.stars').forEach(starContainer => {
    const stars = starContainer.querySelectorAll('i');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= currentRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            // Enable next button after rating
            updateNavigationButtons();
        });
    });

    starContainer.addEventListener('mouseout', () => {
        stars.forEach(s => {
            if (parseInt(s.dataset.rating) <= currentRating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

// Update the event listeners for navigation buttons
document.addEventListener('DOMContentLoaded', () => {
    // Handle receipt question selection
    document.querySelectorAll('input[name="hasReceipt"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const nextBtn = document.querySelector('#receiptQuestion .nav-btn.next');
            nextBtn.disabled = false;
            
            // Store the selection
            const hasReceipt = e.target.value === 'yes';
            
            // Update the form sections array based on selection
            if (hasReceipt) {
                formSections = [
                    'receiptQuestion',
                    'receiptUpload',
                    'diningType',
                    'drinks',
                    'spending',
                    'recommendations',
                    'productRating',
                    'environmentRating',
                    'serviceRating',
                    'overallExperience'
                ];
            } else {
                formSections = [
                    'receiptQuestion',
                    'lastPurchase',
                    'diningType',
                    'drinks',
                    'spending',
                    'recommendations',
                    'productRating',
                    'environmentRating',
                    'serviceRating',
                    'overallExperience'
                ];
            }
        });
    });

    // Add click event listeners to all navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('prev')) {
                navigateSection(-1);
            } else if (btn.classList.contains('next')) {
                navigateSection(1);
            }
        });
    });

    // Add input event listeners for text areas and inputs
    document.querySelectorAll('textarea, input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            updateNavigationButtons();
        });
    });

    // Add change event listeners for radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateNavigationButtons();
        });
    });

    // Initialize navigation buttons
    updateNavigationButtons();
});

// Handle receipt upload
receiptInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.match('image/(png|jpeg)')) {
            alert('Please upload a PNG or JPEG image file');
            receiptInput.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            receiptInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            receiptPreview.innerHTML = `<img src="${e.target.result}" alt="Receipt Preview">`;
            updateNavigationButtons();
        };
        reader.readAsDataURL(file);
    }
});

// Handle last purchase submission
document.querySelector('textarea[name="lastPurchaseDate"]').addEventListener('input', () => {
    updateNavigationButtons();
});

// Update the overall experience section event listeners
document.querySelector('#overallExperience .stars').addEventListener('click', () => {
    const overallStars = document.querySelector('#overallExperience .stars i.active');
    const overallComment = document.querySelector('#overallExperience textarea[name="overallComment"]').value.trim();
    const submitBtn = document.querySelector('#overallExperience .submit-btn');
    
    if (overallStars && overallComment) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
});

document.querySelector('#overallExperience textarea[name="overallComment"]').addEventListener('input', () => {
    const overallStars = document.querySelector('#overallExperience .stars i.active');
    const overallComment = document.querySelector('#overallExperience textarea[name="overallComment"]').value.trim();
    const submitBtn = document.querySelector('#overallExperience .submit-btn');
    
    if (overallStars && overallComment) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
});

// Branch Selection
const branchModal = document.getElementById('branchModal');
const branchForm = document.getElementById('branchForm');
let selectedBranch = '';

// Show branch selection modal on page load
document.addEventListener('DOMContentLoaded', () => {
    branchModal.style.display = 'flex';
});

// Handle branch selection
branchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const branchInput = branchForm.querySelector('input[name="branch"]:checked');
    if (branchInput) {
        selectedBranch = branchInput.value;
        branchModal.style.display = 'none';
        // Store the selected branch in localStorage
        localStorage.setItem('selectedBranch', selectedBranch);
    }
});

// Update the form submission logic
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get the selected branch
    selectedBranch = localStorage.getItem('selectedBranch');
    if (!selectedBranch) {
        alert('Please select a branch first');
        branchModal.style.display = 'flex';
        return;
    }

    // Only validate overall experience when actually submitting the form
    const overallComment = document.querySelector('textarea[name="overallComment"]').value.trim();
    const overallRating = document.querySelector('#overallExperience .stars i.active')?.dataset.rating || 0;
    
    if (!overallComment) {
        alert('Please provide your overall experience comment.');
        return;
    }
    
    if (!overallRating) {
        alert('Please rate your overall experience.');
        return;
    }

    // Show customer info modal
    customerModal.style.display = 'flex';
});

// Comment upload handling
commentUploadInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        // Validate files
        for (let file of files) {
            if (!file.type.match('image/(png|jpeg)')) {
                alert('Please upload only PNG or JPEG image files');
                commentUploadInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                commentUploadInput.value = '';
                return;
            }
        }

        // Create preview grid
        let previewHTML = '<div class="preview-grid">';
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewHTML += `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Comment Proof">
                        <button type="button" class="remove-preview" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                commentUploadPreview.innerHTML = previewHTML + '</div>';
            };
            reader.readAsDataURL(file);
        });
    }
});

// Handle preview removal
commentUploadPreview.addEventListener('click', (e) => {
    if (e.target.closest('.remove-preview')) {
        const index = parseInt(e.target.closest('.remove-preview').dataset.index);
        const dt = new DataTransfer();
        const { files } = commentUploadInput;
        
        for (let i = 0; i < files.length; i++) {
            if (i !== index) {
                dt.items.add(files[i]);
            }
        }
        
        commentUploadInput.files = dt.files;
        updatePreview();
    }
});

function updatePreview() {
    const files = commentUploadInput.files;
    if (files.length === 0) {
        commentUploadPreview.innerHTML = `
            <i class="fas fa-image"></i>
            <p>Upload proof of your comments (optional)</p>
        `;
        return;
    }

    let previewHTML = '<div class="preview-grid">';
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewHTML += `
                <div class="preview-item">
                    <img src="${e.target.result}" alt="Comment Proof">
                    <button type="button" class="remove-preview" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            commentUploadPreview.innerHTML = previewHTML + '</div>';
        };
        reader.readAsDataURL(file);
    });
}

// Update the form submission to handle multiple files
customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerName = customerForm.querySelector('input[type="text"]').value.trim();
    const customerPhone = customerForm.querySelector('input[type="tel"]').value.trim();
    
    if (!customerName || !customerPhone) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        // Show loading state
        const submitBtn = customerForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        // Get all form data
        const formData = {
            hasReceipt: document.querySelector('input[name="hasReceipt"]:checked').value,
            lastPurchaseDate: document.querySelector('textarea[name="lastPurchaseDate"]').value.trim(),
            diningType: document.querySelector('input[name="diningType"]:checked').value,
            drinksOrdered: document.querySelector('textarea[name="drinksOrdered"]').value.trim(),
            spendingPerPerson: parseFloat(document.querySelector('input[name="spendingPerPerson"]').value),
            recommendedDrinks: document.querySelector('textarea[name="recommendedDrinks"]').value.trim(),
            productRating: getRating('productRating'),
            productImprovement: document.querySelector('textarea[name="productImprovement"]').value.trim(),
            environmentRating: getRating('environmentRating'),
            environmentImprovement: document.querySelector('textarea[name="environmentImprovement"]').value.trim(),
            serviceRating: getRating('serviceRating'),
            serviceImprovement: document.querySelector('textarea[name="serviceImprovement"]').value.trim(),
            overallRating: getRating('overallExperience'),
            overallComment: document.querySelector('textarea[name="overallComment"]').value.trim(),
            customerName,
            customerPhone,
            branch: selectedBranch,
            timestamp: new Date().toISOString()
        };

        // Upload receipt image if exists
        let receiptUrl = '';
        if (receiptInput.files.length > 0) {
            const receiptFile = receiptInput.files[0];
            const receiptRef = storageRef(storage, `feedback/receipts/${Date.now()}_${receiptFile.name}`);
            await uploadBytes(receiptRef, receiptFile);
            receiptUrl = await getDownloadURL(receiptRef);
            formData.receiptUrl = receiptUrl;
        }

        // Upload comment proofs if exist
        let proofUrls = [];
        if (commentUploadInput.files.length > 0) {
            for (let file of commentUploadInput.files) {
                const proofRef = storageRef(storage, `feedback/proofs/${Date.now()}_${file.name}`);
                await uploadBytes(proofRef, file);
                const proofUrl = await getDownloadURL(proofRef);
                proofUrls.push(proofUrl);
            }
            formData.proofUrls = proofUrls;
        }

        // Save feedback data
        const feedbackRef = push(ref(database, 'feedback'));
        await set(feedbackRef, {
            ...formData,
            id: feedbackRef.key
        });

        // Close modals and show thank you
        customerModal.style.display = 'none';
        thankYouModal.style.display = 'flex';

        // Create confetti effect
        createConfetti();

        // Reset form after 3 seconds
        setTimeout(() => {
            feedbackForm.reset();
            closeThankYouModal();
            navigateSection(-currentSectionIndex); // Go back to first section
        }, 3000);

    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('There was an error submitting your feedback. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
    }
});

// Phone number input validation
const phoneInput = customerForm.querySelector('input[type="tel"]');
phoneInput.addEventListener('input', (e) => {
    // Remove any non-numeric characters except +
    let value = e.target.value;
    if (value.startsWith('+')) {
        // If starts with +, allow only one + and numbers
        value = '+' + value.slice(1).replace(/[^0-9]/g, '');
    } else {
        // If doesn't start with +, allow only numbers
        value = value.replace(/[^0-9]/g, '');
    }
    e.target.value = value;
});

// Admin Login
viewResponsesBtn.addEventListener('click', () => {
    adminModal.style.display = 'flex';
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = adminForm.querySelector('input[type="password"]').value;
    
    if (password === 'bananacheese') {
        adminModal.style.display = 'none';
        sessionStorage.setItem('adminAuthenticated', 'true');
        toggleSections('responses');
        loadFeedback();
    } else {
        alert('Incorrect password');
    }
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
    if (e.target === thankYouModal) {
        closeThankYouModal();
    }
});

// Section Toggle
window.toggleSections = function(section) {
    if (section === 'feedback') {
        feedbackSection.style.display = 'block';
        responsesSection.style.display = 'none';
        sessionStorage.removeItem('adminAuthenticated');
    } else {
        // Check if admin is authenticated
        if (sessionStorage.getItem('adminAuthenticated') === 'true') {
            feedbackSection.style.display = 'none';
            responsesSection.style.display = 'block';
            loadFeedback();
        } else {
            // If not authenticated, show admin login modal
            adminModal.style.display = 'flex';
        }
    }
};

// Thank You Modal Functions
function showThankYouModal() {
    thankYouModal.style.display = 'flex';
}

window.closeThankYouModal = function() {
    thankYouModal.style.display = 'none';
};

// Confetti Effect
function createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#FF69B4', '#87CEEB'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.opacity = Math.random();
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Helper Functions
function getRating(sectionId) {
    const activeStars = document.querySelector(`#${sectionId} .stars i.active`);
    if (!activeStars) return 0;
    
    // Get the last active star to determine the rating
    const stars = document.querySelectorAll(`#${sectionId} .stars i`);
    let rating = 0;
    
    stars.forEach(star => {
        if (star.classList.contains('active')) {
            rating = parseInt(star.dataset.rating);
        }
    });
    
    return rating;
}

function getCategoryIndex(category) {
    const categories = {
        'product': 0,
        'service': 1,
        'environment': 2
    };
    return categories[category];
}

function isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[0-9]+$/;
    return phoneRegex.test(phone);
}

// Firebase Integration
function saveToFirebase(data) {
    if (!window.database) {
        console.error('Firebase database not initialized');
        return;
    }
    
    const feedbackRef = ref(window.database, 'feedback');
    push(feedbackRef, data)
        .then(() => {
            console.log('Feedback saved successfully');
        })
        .catch((error) => {
            console.error('Error saving feedback:', error);
            alert('There was an error saving your feedback. Please try again.');
        });
}

// Load and Display Feedback
function loadFeedback() {
    const feedbackRef = ref(database, 'feedback');
    const feedbackQuery = query(feedbackRef, orderByChild('timestamp'));

    onValue(feedbackQuery, (snapshot) => {
        const feedbackList = document.getElementById('feedbackList');
        if (!feedbackList) return; // Exit if element doesn't exist

        feedbackList.innerHTML = '';
        const feedbacks = [];

        snapshot.forEach((childSnapshot) => {
            const feedback = childSnapshot.val();
            feedbacks.push(feedback);
        });

        // Sort by timestamp (newest first)
        feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        feedbacks.forEach(feedback => {
            const card = createFeedbackCard(feedback);
            feedbackList.appendChild(card);
        });
    });
}

function createStars(rating) {
    let stars = '';
    // Convert rating to number and ensure it's between 1 and 5
    const ratingValue = Math.min(Math.max(Number(rating), 1), 5);
    
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= ratingValue;
        stars += `<i class="fas fa-star ${isActive ? 'active' : ''}" style="color: ${isActive ? '#FFD700' : '#ddd'}"></i>`;
    }
    return stars;
}

function createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';

    const date = new Date(feedback.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    card.innerHTML = `
        <div class="feedback-header">
            <div class="customer-info">
                ${feedback.customerName} - ${feedback.customerPhone}
                <span class="branch-tag">${feedback.branch}</span>
            </div>
            <div class="timestamp">${formattedDate}</div>
        </div>
        ${feedback.receiptUrl ? `
            <div class="receipt-image-container">
                <img src="${feedback.receiptUrl}" alt="Receipt" class="receipt-image">
            </div>
        ` : ''}
        <div class="purchase-info">
            <strong>Last Purchase:</strong>
            <p>${feedback.lastPurchaseDate}</p>
        </div>
        <div class="visit-details">
            <div class="detail-item">
                <strong>Visit Type:</strong>
                <p>${feedback.diningType}</p>
            </div>
            <div class="detail-item">
                <strong>Drinks Ordered:</strong>
                <p>${feedback.drinksOrdered}</p>
            </div>
            <div class="detail-item">
                <strong>Spending per Person:</strong>
                <p>RM ${feedback.spendingPerPerson.toFixed(2)}</p>
            </div>
            <div class="detail-item">
                <strong>Recommended Drinks:</strong>
                <p>${feedback.recommendedDrinks}</p>
            </div>
        </div>
        <div class="rating-summary">
            <div class="rating-item">
                <span>Product:</span>
                ${createStars(feedback.productRating)}
            </div>
            <div class="rating-item">
                <span>Service:</span>
                ${createStars(feedback.serviceRating)}
            </div>
            <div class="rating-item">
                <span>Environment:</span>
                ${createStars(feedback.environmentRating)}
            </div>
            <div class="rating-item">
                <span>Overall:</span>
                ${createStars(feedback.overallRating)}
            </div>
        </div>
        <div class="improvements">
            ${feedback.productImprovement ? `
                <h3>Product Improvements:</h3>
                <p>${feedback.productImprovement}</p>
            ` : ''}
            ${feedback.serviceImprovement ? `
                <h3>Service Improvements:</h3>
                <p>${feedback.serviceImprovement}</p>
            ` : ''}
            ${feedback.environmentImprovement ? `
                <h3>Environment Improvements:</h3>
                <p>${feedback.environmentImprovement}</p>
            ` : ''}
        </div>
        <div class="overall-comment">
            <strong>Overall Comment:</strong>
            <p>${feedback.overallComment}</p>
            ${feedback.proofUrls && feedback.proofUrls.length > 0 ? `
                <div class="comment-proofs">
                    <strong>Comment Proofs:</strong>
                    <div class="proof-grid">
                        ${feedback.proofUrls.map(url => `
                            <div class="proof-item">
                                <img src="${url}" alt="Comment Proof">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

// Filter functionality
document.getElementById('ratingFilter').addEventListener('change', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('dateFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const ratingFilter = document.getElementById('ratingFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    const cards = document.querySelectorAll('.feedback-card');
    cards.forEach(card => {
        let show = true;

        if (ratingFilter) {
            const rating = parseInt(card.querySelector(`.rating-item:nth-child(${getCategoryIndex(categoryFilter) + 1}) .fa-star.active`).length);
            if (rating !== parseInt(ratingFilter)) show = false;
        }

        if (categoryFilter) {
            const categoryRating = card.querySelector(`.rating-item:nth-child(${getCategoryIndex(categoryFilter) + 1}) .fa-star.active`).length;
            if (categoryRating === 0) show = false;
        }

        if (dateFilter) {
            const timestamp = new Date(card.querySelector('.timestamp').textContent);
            const now = new Date();
            const diff = now - timestamp;

            switch(dateFilter) {
                case 'today':
                    if (diff > 24 * 60 * 60 * 1000) show = false;
                    break;
                case 'week':
                    if (diff > 7 * 24 * 60 * 60 * 1000) show = false;
                    break;
                case 'month':
                    if (diff > 30 * 24 * 60 * 60 * 1000) show = false;
                    break;
            }
        }

        card.style.display = show ? 'block' : 'none';
    });
}

// Update the navigateSection function
function navigateSection(direction) {
    const currentSection = document.getElementById(formSections[currentSectionIndex]);
    const nextSectionIndex = currentSectionIndex + direction;
    
    if (nextSectionIndex >= 0 && nextSectionIndex < formSections.length) {
        const nextSection = document.getElementById(formSections[nextSectionIndex]);
        
        // Add slide-out class to current section
        currentSection.classList.add('slide-out');
        
        // After animation, hide current section and show next section
        setTimeout(() => {
            currentSection.classList.remove('visible', 'slide-out');
            currentSection.classList.add('hidden');
            
            nextSection.classList.remove('hidden');
            nextSection.classList.add('visible');
            
            currentSectionIndex = nextSectionIndex;
            updateNavigationButtons();
        }, 800);
    }
}

// Update the validateCurrentSection function
function validateCurrentSection() {
    const currentSection = document.getElementById(formSections[currentSectionIndex]);
    
    switch(currentSection.id) {
        case 'receiptQuestion':
            return document.querySelector('input[name="hasReceipt"]:checked') !== null;
        case 'receiptUpload':
            return receiptInput.files.length > 0;
        case 'lastPurchase':
            return document.querySelector('textarea[name="lastPurchaseDate"]').value.trim() !== '';
        case 'diningType':
            return document.querySelector('input[name="diningType"]:checked') !== null;
        case 'drinks':
            const drinksOrdered = document.querySelector('textarea[name="drinksOrdered"]');
            return drinksOrdered && drinksOrdered.value.trim() !== '';
        case 'spending':
            const spending = document.querySelector('input[name="spendingPerPerson"]');
            return spending && spending.value !== '' && parseFloat(spending.value) > 0;
        case 'recommendations':
            const recommendedDrinks = document.querySelector('textarea[name="recommendedDrinks"]');
            return recommendedDrinks && recommendedDrinks.value.trim() !== '';
        case 'productRating':
        case 'environmentRating':
        case 'serviceRating':
            const stars = currentSection.querySelector('.stars i.active');
            return stars !== null;
        case 'overallExperience':
            const overallStars = currentSection.querySelector('.stars i.active');
            const overallComment = currentSection.querySelector('textarea[name="overallComment"]').value.trim();
            return overallStars !== null && overallComment !== '';
        default:
            return true;
    }
}

// Update the updateNavigationButtons function
function updateNavigationButtons() {
    const currentSection = document.getElementById(formSections[currentSectionIndex]);
    const prevBtn = currentSection.querySelector('.nav-btn.prev');
    const nextBtn = currentSection.querySelector('.nav-btn.next');
    
    // Update back button visibility
    if (prevBtn) {
        prevBtn.style.display = (currentSectionIndex === 0) ? 'none' : 'flex';
    }
    
    // Update next button state
    if (nextBtn) {
        const isLastSection = currentSectionIndex === formSections.length - 1;
        nextBtn.style.display = isLastSection ? 'none' : 'flex';
        
        // Enable/disable next button based on section validation
        if (!isLastSection) {
            nextBtn.disabled = !validateCurrentSection();
        }
    }
} 
