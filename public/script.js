// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '0.5rem 2rem';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.padding = '1rem 2rem';
        navbar.style.boxShadow = 'none';
    }
});

const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.querySelector('i').className = 'fa-solid fa-sun'; // Sun icon for dark theme
} else {
    body.setAttribute('data-theme', 'light');
    themeToggle.querySelector('i').className = 'fa-solid fa-moon'; // Moon icon for light theme
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        body.setAttribute('data-theme', 'light');
        themeToggle.querySelector('i').className = 'fa-solid fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('i').className = 'fa-solid fa-sun';
        localStorage.setItem('theme', 'dark');
    }
});

// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close the mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
        // Close mobile menu if open
        navLinks.classList.remove('active');
    });
});

// Project filters
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    });
});

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('[data-aos]');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('aos-animate');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', () => {
    animateOnScroll();
    // Show all projects initially
    projectCards.forEach(card => card.classList.add('active'));
});

// Form submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Parallax effect for hero section
document.addEventListener('mousemove', (e) => {
    const moveX = (e.pageX * -1 / 100);
    const moveY = (e.pageY * - 1 / 100);
    document.querySelector('.hero-content').style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Glitch effect timing
setInterval(() => {
    const glitch = document.querySelector('.glitch');
    glitch.style.animation = 'none';
    void glitch.offsetHeight;
    glitch.style.animation = null;
}, 5000);

// Review cards hover effect
const reviewCards = document.querySelectorAll('.review-card');
reviewCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Initialize all project cards as active
document.addEventListener("DOMContentLoaded", function () {
    let scrollTopBtn = document.createElement("button");
    scrollTopBtn.id = "scrollTopBtn";
    scrollTopBtn.innerHTML = "⬆";
    document.body.appendChild(scrollTopBtn);

    window.onscroll = function () {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    };

    scrollTopBtn.onclick = function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
});


// Fetch and display reviews
const fetchReviews = async () => {
    try {
        const response = await fetch('http://localhost:5500/api/reviews');
        const reviews = await response.json();
        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = reviews
            .map(
                (review) => `
                <div class="review-card">
                    <h4>${review.name}</h4>
                    <div class="stars">
                        ${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}
                    </div>
                    <p>${review.text}</p>
                </div>
            `
            )
            .join('');
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
};

// Add a new review
const postReview = async () => {
    const name = document.getElementById('reviewerName').value;
    const stars = document.getElementById('reviewStars').value;
    const text = document.getElementById('reviewText').value;

    if (!name || !stars || !text) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, stars, text }),
        });

        if (response.ok) {
            fetchReviews(); // Refresh the reviews list
            document.getElementById('reviewerName').value = '';
            document.getElementById('reviewStars').value = '5';
            document.getElementById('reviewText').value = '';
        }
    } catch (error) {
        console.error('Error posting review:', error);
    }
};


// Attach event listeners
document.getElementById('postReview').addEventListener('click', postReview);

// Fetch reviews on page load
document.addEventListener('DOMContentLoaded', fetchReviews);
