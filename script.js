// Harsh Mistry Portfolio Scripting

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Drawer Navigation
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const body = document.body;

    // Suppress ScrollSpy triggers during manual click-triggered smooth scrolls
    let isClickScrolling = false;
    let scrollTimeout;

    const toggleMenu = (forceClose = false) => {
        if (forceClose || menuBtn.classList.contains('active')) {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            body.classList.remove('menu-active');
        } else {
            menuBtn.classList.add('active');
            navLinks.classList.add('active');
            navOverlay.classList.add('active');
            body.classList.add('menu-active');
        }
    };

    menuBtn.addEventListener('click', () => toggleMenu());
    navOverlay.addEventListener('click', () => toggleMenu(true));

    // Close menu drawer when links are selected and update active states immediately
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const targetSec = link.getAttribute('data-sec');
            if (targetSec) {
                // Set the active class instantly on the clicked item and clear others
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    if (item.getAttribute('data-sec') === targetSec) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });

                // Temporarily block ScrollSpy while the smooth scroll transition is active
                isClickScrolling = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isClickScrolling = false;
                }, 1000);
            }
            toggleMenu(true);
        });
    });

    // 2. ScrollSpy Integration - Active state highlight on scroll via IntersectionObserver
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    const observerOptions = {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        // Skip scrollspy updates if we are currently mid-scroll from a navbar click
        if (isClickScrolling) return;

        // Fallback for top scroll zone
        if (window.scrollY < 50) {
            navItems.forEach(item => {
                if (item.getAttribute('data-sec') === 'home') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            return;
        }

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    if (item.getAttribute('data-sec') === currentSectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        spyObserver.observe(section);
    });

    // 3. GSAP & ScrollTrigger Animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // A. Float animation for Hero Profile Hexagon
        gsap.to(".hexagon-wrapper", {
            y: -15,
            duration: 3.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });

        // B. Hero Content entrance staggering on load
        gsap.from(".reveal-item", {
            y: 40,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out"
        });

        // C. Standard reveals on Scroll Trigger
        gsap.utils.toArray('.reveal-up').forEach(element => {
            gsap.from(element, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    toggleActions: "play none none none"
                }
            });
        });
    } else {
        // Fallback animation: Clean Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-up, .reveal-item').forEach(el => {
            el.classList.add('reveal-fallback');
            observer.observe(el);
        });
        
        // Trigger page load elements instantly in fallback
        setTimeout(() => {
            document.querySelectorAll('#home .reveal-item').forEach(el => {
                el.classList.add('visible');
            });
        }, 150);
    }

    // 4. Production Contact Form Submission (FormSubmit AJAX API integration)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const originalText = submitBtn.querySelector('span').textContent;
            
            // Visual transition to loading state
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Sending...';
            submitBtn.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
            
            // Capture form values
            const formData = {
                name: document.getElementById('formName').value,
                email: document.getElementById('formEmail').value,
                subject: document.getElementById('formSubject').value,
                message: document.getElementById('formMessage').value,
                _subject: "New Portfolio Message: " + document.getElementById('formSubject').value
            };

            // Send POST request to FormSubmit AJAX endpoint
            fetch('https://formsubmit.co/ajax/hkmistry125@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response error');
                }
                return response.json();
            })
            .then(data => {
                if (data.success === 'true' || data.success === true) {
                    // Update button UI to green success state
                    submitBtn.querySelector('span').textContent = 'Message Sent!';
                    submitBtn.querySelector('i').className = 'fa-regular fa-circle-check';
                    submitBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                    submitBtn.style.color = '#FFFFFF';
                    submitBtn.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
                    
                    // Transition to the success card after a short delay
                    setTimeout(() => {
                        const successCard = document.getElementById('contactSuccess');
                        if (successCard) {
                            contactForm.style.display = 'none';
                            successCard.style.display = 'flex';
                        }
                    }, 800);
                } else {
                    throw new Error('Submission flag returned false');
                }
            })
            .catch(error => {
                console.error('Submission failed:', error);
                // Update button UI to red error state
                submitBtn.querySelector('span').textContent = 'Error Sending';
                submitBtn.querySelector('i').className = 'fa-solid fa-circle-exclamation';
                submitBtn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                submitBtn.style.color = '#FFFFFF';
                submitBtn.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
            })
            .finally(() => {
                // Reset button to default state after 4 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.querySelector('span').textContent = originalText;
                    submitBtn.querySelector('i').className = 'fa-regular fa-paper-plane';
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.boxShadow = '';
                }, 4000);
            });
        });
    }

    // Reset Success Card to Form view and implement premium 3D tilt interaction
    const resetFormBtn = document.getElementById('resetFormBtn');
    const successCard = document.getElementById('contactSuccess');
    
    if (resetFormBtn && contactForm && successCard) {
        resetFormBtn.addEventListener('click', () => {
            // Restore default flat card style before hiding
            successCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            successCard.style.display = 'none';
            contactForm.style.display = 'flex';
            contactForm.reset();
        });

        // 3D Card Hover Tilt Effect
        successCard.addEventListener('mousemove', (e) => {
            const rect = successCard.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate relative to the card
            const y = e.clientY - rect.top;  // y coordinate relative to the card
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotational intensity (tilt angle cap of 10 degrees)
            const rotateX = -(y - centerY) / 12;
            const rotateY = (x - centerX) / 12;
            
            // Apply 3D matrix transform
            successCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Reset rotation state on mouse leave
        successCard.addEventListener('mouseleave', () => {
            successCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    }

    // 5. Custom Cursor Animation & Interaction Logic
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');

    if (cursorDot && cursorOutline) {
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) {
            cursorDot.style.display = 'none';
            cursorOutline.style.display = 'none';
        } else {
            document.documentElement.classList.add('custom-cursor-active');
            let mouseX = 0, mouseY = 0;
            let outlineX = 0, outlineY = 0;

            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
            });

            const renderCursor = () => {
                const lerpFactor = 0.12;
                outlineX += (mouseX - outlineX) * lerpFactor;
                outlineY += (mouseY - outlineY) * lerpFactor;
                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate3d(-50%, -50%, 0)`;
                requestAnimationFrame(renderCursor);
            };
            requestAnimationFrame(renderCursor);

            // Click morph trigger
            window.addEventListener('mousedown', () => {
                cursorOutline.style.width = '22px';
                cursorOutline.style.height = '22px';
                cursorOutline.style.backgroundColor = 'rgba(0, 229, 255, 0.15)';
            });

            window.addEventListener('mouseup', () => {
                cursorOutline.style.width = '';
                cursorOutline.style.height = '';
                cursorOutline.style.backgroundColor = '';
            });

            // Hover state logic for interactive nodes
            const attachHoverListeners = () => {
                // 1. Buttons & Action Links -> hover-button (scales to 42px, turns border white for high visibility)
                const buttonSelectors = '.btn-primary, .btn-secondary, .social-icon, .menu-btn, button, .project-link';
                document.querySelectorAll(buttonSelectors).forEach(element => {
                    element.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-button');
                        cursorOutline.classList.add('hover-button');
                    });
                    element.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-button');
                        cursorOutline.classList.remove('hover-button');
                    });
                });

                // 2. Standard Navigation & Text Links -> hover-link (contracts to 20px for high-precision cursor placement)
                const linkSelectors = '.logo, .nav-item, footer a, .contact-method-item a, .showcase-tag, .tech-card-chip';
                document.querySelectorAll(linkSelectors).forEach(element => {
                    element.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-link');
                        cursorOutline.classList.add('hover-link');
                    });
                    element.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-link');
                        cursorOutline.classList.remove('hover-link');
                    });
                });

                // 3. Project Cards -> hover-project (scales outline to 44px for balanced framing)
                document.querySelectorAll('.project-case-card').forEach(element => {
                    element.addEventListener('mouseenter', () => {
                        cursorOutline.classList.add('hover-project');
                    });
                    element.addEventListener('mouseleave', () => {
                        cursorOutline.classList.remove('hover-project');
                    });
                });

                // 4. Hide custom cursor elements on inputs and textareas to restore native insertion pointer visibility
                const hideSelectors = 'input, textarea';
                document.querySelectorAll(hideSelectors).forEach(element => {
                    element.addEventListener('mouseenter', () => {
                        cursorDot.style.opacity = '0';
                        cursorOutline.style.opacity = '0';
                    });
                    element.addEventListener('mouseleave', () => {
                        cursorDot.style.opacity = '';
                        cursorOutline.style.opacity = '';
                    });
                });

                // 5. Contrast Overrides (Images & Wrappers) -> hover-contrast (white border overlay, cyan dot)
                const contrastSelectors = 'img, .about-image-wrapper';
                document.querySelectorAll(contrastSelectors).forEach(element => {
                    element.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-contrast');
                        cursorOutline.classList.add('hover-contrast');
                    });
                    element.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-contrast');
                        cursorOutline.classList.remove('hover-contrast');
                    });
                });

                // 5. Personal section interest cards morph triggers
                const artCard = document.querySelector('.art-card');
                if (artCard) {
                    artCard.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-art');
                        cursorOutline.classList.add('hover-art');
                    });
                    artCard.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-art');
                        cursorOutline.classList.remove('hover-art');
                    });
                }

                const musicCard = document.querySelector('.music-card');
                if (musicCard) {
                    musicCard.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-music');
                        cursorOutline.classList.add('hover-music');
                    });
                    musicCard.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-music');
                        cursorOutline.classList.remove('hover-music');
                    });
                }

                const sportsCard = document.querySelector('.sports-card');
                if (sportsCard) {
                    sportsCard.addEventListener('mouseenter', () => {
                        cursorDot.classList.add('hover-sports');
                        cursorOutline.classList.add('hover-sports');
                    });
                    sportsCard.addEventListener('mouseleave', () => {
                        cursorDot.classList.remove('hover-sports');
                        cursorOutline.classList.remove('hover-sports');
                    });
                }
            };

            attachHoverListeners();
        }
    }
});
