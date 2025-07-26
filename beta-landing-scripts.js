// Semantest BETA Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Use case tabs
    const useCaseTabs = document.querySelectorAll('.use-case-tab');
    const useCaseContents = document.querySelectorAll('.use-case-content');
    
    useCaseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            useCaseTabs.forEach(t => t.classList.remove('active'));
            useCaseContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Install button tracking and Chrome Web Store redirect
    const installButtons = document.querySelectorAll('.install-btn');
    
    installButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Track the click
            const trackingId = this.getAttribute('data-track') || 'install-click';
            
            // Google Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'install',
                    'event_label': trackingId,
                    'value': 1
                });
            }

            // Custom analytics tracking
            if (typeof analytics !== 'undefined') {
                analytics.track('Install Button Clicked', {
                    location: trackingId,
                    timestamp: new Date().toISOString()
                });
            }

            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="btn-icon">⏳</span>Opening Chrome Web Store...';
            this.disabled = true;

            // Reset button after delay
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 3000);
            
            // Redirect to Chrome Web Store
            // Note: Replace with actual Chrome Web Store URL when available
            const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/semantest-beta/[EXTENSION_ID]';
            window.open(chromeStoreUrl, '_blank');
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Newsletter signup (if newsletter form exists)
    const newsletterForm = document.querySelector('#newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!email) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Subscribing...';
            submitButton.disabled = true;

            // Track newsletter signup
            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_signup', {
                    'event_category': 'engagement',
                    'event_label': 'beta_landing'
                });
            }

            // Simulate API call (replace with actual endpoint)
            setTimeout(() => {
                submitButton.innerHTML = '✅ Subscribed!';
                showNotification('Thanks for subscribing! You\'ll receive BETA updates.', 'success');
                
                // Reset form
                setTimeout(() => {
                    this.reset();
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 3000);
            }, 2000);
        });
    }

    // Feature hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Testimonial cycling (optional auto-rotation)
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;

    function cycleTestimonials() {
        // Add subtle highlight to testimonials in sequence
        testimonialCards.forEach((card, index) => {
            card.classList.remove('highlighted');
            if (index === currentTestimonial) {
                card.classList.add('highlighted');
            }
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    }

    // Start testimonial cycling after 3 seconds, then every 5 seconds
    setTimeout(() => {
        cycleTestimonials();
        setInterval(cycleTestimonials, 5000);
    }, 3000);

    // Loading states for external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Track external link clicks
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'external_link',
                    'event_label': this.href
                });
            }
        });
    });

    // Scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
    });

    // Performance monitoring
    function trackPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'page_performance', {
                            'event_category': 'performance',
                            'load_time': Math.round(perfData.loadEventEnd - perfData.fetchStart),
                            'dom_ready': Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)
                        });
                    }
                }, 1000);
            });
        }
    }

    trackPerformance();

    // Error tracking
    window.addEventListener('error', function(e) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': e.message,
                'fatal': false
            });
        }
    });

    // Keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        // Escape key closes FAQ items
        if (e.key === 'Escape') {
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    // Dynamic stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/[^\d]/g, ''));
            if (target > 0) {
                let current = 0;
                const increment = target / 60; // Animate over ~1 second at 60fps
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Format number based on original format
                    const originalText = stat.textContent;
                    if (originalText.includes('K')) {
                        stat.textContent = Math.floor(current / 1000) + 'K+';
                    } else if (originalText.includes('%')) {
                        stat.textContent = Math.floor(current) + '%';
                    } else if (originalText.includes('★')) {
                        stat.textContent = (current / 10).toFixed(1) + '★';
                    } else if (originalText.includes('x')) {
                        stat.textContent = Math.floor(current) + 'x';
                    } else {
                        stat.textContent = Math.floor(current).toLocaleString() + '+';
                    }
                }, 16);
            }
        });
    }

    // Trigger stats animation when stats section comes into view
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Browser compatibility check
    function checkBrowserCompatibility() {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isEdge = /Edg/.test(navigator.userAgent);
        const isBrave = navigator.brave && navigator.brave.isBrave;
        const isOpera = /OPR/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isFirefox) {
            showBrowserNotification('Firefox support coming Q2 2025! For now, please use Chrome, Edge, Brave, or Opera.');
        } else if (isSafari) {
            showBrowserNotification('Safari support is planned! For now, please use Chrome, Edge, Brave, or Opera.');
        }
    }

    function showBrowserNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'browser-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--warning-color), #F97316);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 300px;
            z-index: 10000;
            font-size: 14px;
            line-height: 1.4;
            animation: slideInUp 0.3s ease-out;
        `;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            position: absolute;
            top: 8px;
            right: 12px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.onclick = () => notification.remove();
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }

    checkBrowserCompatibility();
});

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--error-color)',
        warning: 'var(--warning-color)',
        info: 'var(--secondary-color)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 320px;
        font-size: 14px;
        line-height: 1.4;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .header.scrolled {
        background-color: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .testimonial-card.highlighted {
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
        border-color: var(--primary-color);
    }
    
    .feature-card {
        transition: all 0.3s ease-out;
    }
`;
document.head.appendChild(style);