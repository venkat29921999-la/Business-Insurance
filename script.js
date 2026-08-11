/* ==========================================================================
   FOOTER NEWSLETTER VALIDATION + 404 REDIRECT
   ADDED ONLY — existing code above is unchanged
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const newsletter =
    document.querySelector('.footer-newsletter');

  if (!newsletter) {
    return;
  }

  const newsletterInput =
    newsletter.querySelector('input[type="email"]');

  const newsletterButton =
    newsletter.querySelector('button');

  if (!newsletterInput || !newsletterButton) {
    return;
  }

  newsletterInput.setAttribute('required', '');

  newsletterButton.addEventListener('click', () => {

    const email = newsletterInput.value.trim();

    newsletterInput.value = email;

    /* Use the browser's built-in email validation first. */
    if (!newsletterInput.checkValidity()) {
      newsletterInput.reportValidity();
      newsletterInput.focus();
      return;
    }

    /* Extra validation for a properly formed email address. */
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {
      newsletterInput.setCustomValidity(
        'Please enter a valid email address.'
      );

      newsletterInput.reportValidity();

      newsletterInput.setCustomValidity('');

      newsletterInput.focus();

      return;
    }

    /* Valid email → open 404.html */
    window.location.href = '404.html';
  });

  /* Clear validation when the user starts correcting the email. */
  newsletterInput.addEventListener('input', () => {
    newsletterInput.setCustomValidity('');
  });

});/* ==========================================================================
   STACKLY — script.js
   AOS + GSAP/ScrollTrigger + interactions
   Mobile-safe pricing animations
   Cinematic multi-image hero gallery (generalized for multiple heroes)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */

  const preloader = document.getElementById('preloader');

  window.addEventListener('load', () => {
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('is-hidden');
      }, 400);
    }
  });

  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('is-hidden');
    }
  }, 2500);


  /* ---------- Mobile pricing protection ---------- */

  const pricingCards = document.querySelectorAll('.pricing-grid .price-card');
  const mobilePricingMQ = window.matchMedia('(max-width: 900px)');

  function protectMobilePricing() {
    if (mobilePricingMQ.matches) {
      pricingCards.forEach(card => {
        card.removeAttribute('data-aos');
        card.removeAttribute('data-aos-delay');
        card.style.transform = 'none';
        card.style.opacity = '1';
      });
    } else {
      pricingCards.forEach(card => {
        card.style.removeProperty('transform');
        card.style.removeProperty('opacity');
      });
    }
  }

  protectMobilePricing();

  if (mobilePricingMQ.addEventListener) {
    mobilePricingMQ.addEventListener('change', protectMobilePricing);
  } else {
    mobilePricingMQ.addListener(protectMobilePricing);
  }


  /* ---------- AOS ---------- */

  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });

    setTimeout(() => {
      if (mobilePricingMQ.matches && window.AOS) {
        AOS.refreshHard();
      }
    }, 100);
  }


  /* ---------- Cinematic multi-image hero gallery (generalized) ----------
     Handles EVERY [data-hero-slider] element on the page — the homepage
     hero (#heroBgSlider) and the Coverage page hero both use this same
     function, each with its own independent state/timer.
  ------------------------------------------------------------------------ */

  const HERO_INTERVAL = 5500;

  function initHeroSlider(heroSlider) {

    const heroSlides = Array.from(heroSlider.querySelectorAll('.hero-bg-slide'));
    const heroDots = Array.from(heroSlider.querySelectorAll('.hero-scene-dot'));

    if (!heroSlides.length) return;

    let heroIndex = heroSlides.findIndex(s => s.classList.contains('is-active'));
    if (heroIndex === -1) heroIndex = 0;

    let heroTimer = null;
    let heroPaused = false;

    const setHeroScene = (index, restartTimer = true) => {
      heroIndex = (index + heroSlides.length) % heroSlides.length;

      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === heroIndex);
      });

      heroDots.forEach((dot, i) => {
        const active = i === heroIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });

      if (restartTimer) startHeroTimer();
    };

    const nextHeroScene = () => {
      if (!heroPaused) setHeroScene(heroIndex + 1);
    };

    const startHeroTimer = () => {
      clearInterval(heroTimer);
      heroTimer = setInterval(nextHeroScene, HERO_INTERVAL);
    };

    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setHeroScene(index, true);
      });
    });

    heroSlider.addEventListener('mouseenter', () => {
      heroPaused = true;
      clearInterval(heroTimer);
    });

    heroSlider.addEventListener('mouseleave', () => {
      heroPaused = false;
      startHeroTimer();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(heroTimer);
      } else if (!heroPaused) {
        startHeroTimer();
      }
    });

    setHeroScene(heroIndex, false);
    startHeroTimer();

    /* Subtle mouse parallax on desktop — only the active slide moves */
    if (
      window.matchMedia('(hover:hover)').matches &&
      window.matchMedia('(min-width:901px)').matches &&
      window.gsap
    ) {
      heroSlider.addEventListener('mousemove', e => {
        const rect = heroSlider.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const activeImage = heroSlider.querySelector('.hero-bg-slide.is-active img');
        if (!activeImage) return;

        gsap.to(activeImage, {
          x: x * 8,
          y: y * 6,
          duration: .8,
          ease: 'power3.out',
          overwrite: true
        });
      });

      heroSlider.addEventListener('mouseleave', () => {
        const activeImage = heroSlider.querySelector('.hero-bg-slide.is-active img');
        if (activeImage) {
          gsap.to(activeImage, {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power3.out'
          });
        }
      });
    }
  }

  document.querySelectorAll('[data-hero-slider]').forEach(initHeroSlider);


  /* ---------- GSAP ---------- */

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }


  /* ---------- Rich Hover Gate ---------- */

  const hoverMQ = window.matchMedia('(hover:hover)');
  const widthMQ = window.matchMedia('(min-width:901px)');

  let richHoverActive = hoverMQ.matches && widthMQ.matches;

  const teardownFns = [];

  function killAllRichHoverInlineStyles() {
    document
      .querySelectorAll(
        '.price-card, .bento-card, .industry-card, .btn-primary, .login-btn, .testi-arrow, .back-to-top, .dash-stage'
      )
      .forEach(el => {
        if (window.gsap) {
          gsap.set(el, { clearProps: 'transform' });
        }
      });

    const glow = document.getElementById('cursorGlow');
    if (glow) glow.classList.remove('is-active');
  }

  function evaluateRichHover() {
    const next = hoverMQ.matches && widthMQ.matches;
    if (next === richHoverActive) return;

    richHoverActive = next;

    if (!richHoverActive) {
      teardownFns.forEach(fn => fn());
      killAllRichHoverInlineStyles();
    } else {
      location.reload();
    }
  }

  if (hoverMQ.addEventListener) {
    hoverMQ.addEventListener('change', evaluateRichHover);
  } else {
    hoverMQ.addListener(evaluateRichHover);
  }

  if (widthMQ.addEventListener) {
    widthMQ.addEventListener('change', evaluateRichHover);
  } else {
    widthMQ.addListener(evaluateRichHover);
  }


  /* ---------- Cursor Glow ---------- */

  const heroSection = document.getElementById('home');
  const cursorGlow = document.getElementById('cursorGlow');

  if (richHoverActive && heroSection && cursorGlow && window.gsap) {
    const quickX = gsap.quickTo(cursorGlow, 'x', { duration: .5, ease: 'power3.out' });
    const quickY = gsap.quickTo(cursorGlow, 'y', { duration: .5, ease: 'power3.out' });

    heroSection.addEventListener('mousemove', e => {
      cursorGlow.classList.add('is-active');
      quickX(e.clientX);
      quickY(e.clientY);
    });

    heroSection.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('is-active');
    });
  }


  /* ---------- Magnetic Buttons ---------- */

  if (richHoverActive && window.gsap) {
    document
      .querySelectorAll('.btn-primary, .header-right .login-btn, .testi-arrow, .back-to-top')
      .forEach(btn => {
        const move = e => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(btn, {
            x: x * 0.28,
            y: y * 0.35,
            duration: .4,
            ease: 'power3.out'
          });
        };

        const leave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: .6,
            ease: 'elastic.out(1,0.4)'
          });
        };

        btn.addEventListener('mousemove', move);
        btn.addEventListener('mouseleave', leave);
      });
  }


  /* ---------- Card Tilt ---------- */

  if (richHoverActive && window.gsap) {
    document.querySelectorAll('.bento-card, .industry-card').forEach(card => {
      const move = e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: px * 8,
          rotateX: -py * 8,
          y: -8,
          duration: .5,
          ease: 'power2.out',
          transformPerspective: 900
        });
      };

      const leave = () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          duration: .7,
          ease: 'power3.out'
        });
      };

      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
    });


    /* ---------- Pricing Hover ---------- */

    document.querySelectorAll('.price-card').forEach(card => {
      const featured = card.classList.contains('price-card--featured');
      const baseScale = featured ? 1.04 : 1;

      const move = e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: px * 6,
          rotateX: -py * 6,
          y: -6,
          scale: baseScale,
          duration: .5,
          ease: 'power2.out',
          transformPerspective: 900
        });
      };

      const leave = () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          scale: baseScale,
          duration: .7,
          ease: 'power3.out'
        });
      };

      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
    });
  }


  /* ---------- Word Stagger Heading Reveal ---------- */

  document.querySelectorAll('.reveal-text').forEach(heading => {
    const lines = heading.innerHTML.split('<br>');

    heading.innerHTML = lines
      .map(line => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        return words
          .map(word => `<span class="reveal-word"><span class="reveal-word-inner">${word}</span></span>`)
          .join(' ');
      })
      .join('<br>');
  });

  if (window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.reveal-text').forEach(heading => {
      gsap.from(heading.querySelectorAll('.reveal-word-inner'), {
        yPercent: 115,
        duration: .9,
        ease: 'power4.out',
        stagger: .045,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          once: true
        }
      });
    });
  }


  /* ---------- Scroll Progress ---------- */

  const progressBar = document.getElementById('scrollProgress');

  const updateProgress = () => {
    if (!progressBar) return;

    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const scrolled = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;

    progressBar.style.width = scrolled + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();


  /* ---------- Scrollspy ---------- */

  const navLinks = document.querySelectorAll('.nav-link');

  const spySections = Array.from(navLinks)
    .map(link => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return null;
      return document.querySelector(href);
    })
    .filter(Boolean);

  if (spySections.length && window.IntersectionObserver) {
    const spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    spySections.forEach(section => spyObserver.observe(section));
  }


  /* ---------- Button Ripple ---------- */

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'btn-ripple';
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      this.appendChild(ripple);

      setTimeout(() => { ripple.remove(); }, 650);
    });
  });


  /* ---------- Bento + Industry Image Reveal ---------- */

  if (window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.bento-card img, .industry-card img').forEach(img => {
      const parent = img.closest('.bento-card, .industry-card');

      gsap.fromTo(
        img,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 92%',
            once: true
          }
        }
      );
    });
  }


  /* ---------- Pricing Idle Float ---------- */

  if (richHoverActive && window.gsap) {
    document.querySelectorAll('.price-card').forEach((card, i) => {
      const idleTween = gsap.to(card, {
        y: -8,
        duration: 2.4 + i * .3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * .25
      });

      card.addEventListener('mouseenter', () => {
        idleTween.pause();
      });

      card.addEventListener('mouseleave', () => {
        gsap.set(card, { y: 0 });
        idleTween.restart();
      });
    });
  }


  /* ---------- Flip Card Hint ---------- */

  if (window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.flip-card .flip-inner').forEach((inner, i) => {
      ScrollTrigger.create({
        trigger: inner,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap
            .timeline({ delay: .3 + i * .12 })
            .to(inner, { rotateY: 18, duration: .35, ease: 'power2.out' })
            .to(inner, {
              rotateY: 0,
              duration: .5,
              ease: 'elastic.out(1,0.5)',
              onComplete: () => {
                gsap.set(inner, { clearProps: 'transform' });
              }
            });
        }
      });
    });
  }


  /* ---------- Horizontal Promise Scroll ---------- */

  if (window.gsap && window.ScrollTrigger) {
    const promiseTrack = document.getElementById('promiseTrack');

    if (promiseTrack) {
      let promiseST;

      const setupPromiseScroll = () => {
        if (promiseST) promiseST.kill();

        if (window.innerWidth >= 900) {
          const scrollDistance = () => {
            return (
              promiseTrack.scrollWidth -
              promiseTrack.parentElement.clientWidth +
              64
            );
          };

          promiseST = gsap.to(promiseTrack, {
            x: () => -scrollDistance(),
            ease: 'none',
            scrollTrigger: {
              trigger: '#promisePin',
              start: 'top top',
              end: () => '+=' + scrollDistance(),
              scrub: .6,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          }).scrollTrigger;
        } else {
          gsap.set(promiseTrack, { x: 0, clearProps: 'transform' });
        }
      };

      setupPromiseScroll();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setupPromiseScroll, 250);
      });
    }
  }


  /* ---------- Header Scroll State ---------- */

  const header = document.getElementById('siteHeader');

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();


  /* ---------- Mobile Navigation ---------- */

  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active');

      const open = mainNav.classList.contains('is-open');
      const spans = navToggle.querySelectorAll('span');

      if (spans.length >= 3) {
        spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
        spans[1].style.opacity = open ? '0' : '1';
        spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');

        navToggle.querySelectorAll('span').forEach(span => {
          span.style.transform = '';
          span.style.opacity = '1';
        });
      });
    });
  }


  /* ---------- Hero Headline Word Flip ---------- */

  const flipWords = ['your risk', 'your trade', 'your fleet', 'your growth'];
  const heroFlip = document.getElementById('heroFlip');

  if (heroFlip && window.gsap) {
    let idx = 0;

    setInterval(() => {
      idx = (idx + 1) % flipWords.length;

      gsap.to(heroFlip, {
        yPercent: -110,
        opacity: 0,
        duration: .4,
        ease: 'power2.in',
        onComplete: () => {
          heroFlip.textContent = flipWords[idx];

          gsap.fromTo(
            heroFlip,
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: .45, ease: 'power2.out' }
          );
        }
      });
    }, 2600);
  }


  /* ---------- Floating Cards ---------- */

  if (window.gsap) {
    document.querySelectorAll('.float-card').forEach((card, i) => {
      gsap.to(card, {
        y: i % 2 === 0 ? -14 : 14,
        duration: 2.6 + i * .3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.2 + i * .15
      });
    });

    const bindBadge = document.querySelector('.bind-badge');
    if (bindBadge) {
      gsap.to(bindBadge, {
        rotate: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.4
      });
    }

    const dashStage = document.querySelector('.dash-stage');
    if (dashStage) {
      gsap.to(dashStage, {
        y: -10,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.2
      });
    }
  }


  /* ---------- Risk Gauge Animation ---------- */

  const gaugeFill = document.getElementById('gaugeFill');
  const gaugeNum = document.getElementById('gaugeNum');

  if (gaugeFill && gaugeNum && window.ScrollTrigger) {
    const CIRC = 427;
    const targetScore = 92;

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top 60%',
      once: true,
      onEnter: () => {
        const offset = CIRC - (CIRC * targetScore / 100);
        gaugeFill.style.strokeDashoffset = offset;

        if (window.gsap) {
          gsap.to({ val: 0 }, {
            val: targetScore,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              gaugeNum.textContent = Math.round(this.targets()[0].val);
            }
          });
        } else {
          gaugeNum.textContent = targetScore;
        }
      }
    });
  }


  /* ---------- Spotlight ---------- */

  if (richHoverActive) {
    document
      .querySelectorAll('.bento-card, .industry-card, .price-card, .testi-card, .timeline-card')
      .forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          card.style.setProperty('--mx', x + '%');
          card.style.setProperty('--my', y + '%');
        });
      });
  }


  /* ---------- Flip Card Tap Support ---------- */

  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped-tap');
    });
  });

  const flipTapStyle = document.createElement('style');
  flipTapStyle.textContent = `
    .flip-card.is-flipped-tap .flip-inner {
      transform: rotateY(180deg);
    }

    @media (max-width: 900px) {
      .pricing-grid .price-card,
      .pricing-grid .price-card--featured {
        transform: none !important;
        animation: none !important;
        opacity: 1 !important;
      }
    }
  `;
  document.head.appendChild(flipTapStyle);


  /* ---------- FAQ Accordion ---------- */

  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;

      const answer = item.querySelector('.faq-a');
      if (!answer) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-q').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherItem = other.closest('.faq-item');
          if (otherItem) {
            const otherAnswer = otherItem.querySelector('.faq-a');
            if (otherAnswer) otherAnswer.style.maxHeight = '0px';
          }
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    });
  });

  window.addEventListener('load', () => {
    const openBtn = document.querySelector('.faq-q[aria-expanded="true"]');
    if (openBtn) {
      const item = openBtn.closest('.faq-item');
      if (item) {
        const answer = item.querySelector('.faq-a');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }
  });


  /* ---------- Testimonials Horizontal Scroll ---------- */

  const scroller = document.getElementById('testiScroller');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (scroller && prevBtn && nextBtn) {
    const scrollAmount = () => {
      const card = scroller.querySelector('.testi-card');
      return card ? card.offsetWidth + 24 : 300;
    };

    prevBtn.addEventListener('click', () => {
      scroller.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      scroller.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }


  /* ---------- Timeline Scroll Fill ---------- */

  const timelineFill = document.getElementById('timelineFill');

  if (timelineFill && window.gsap && window.ScrollTrigger) {
    gsap.to(timelineFill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: .6
      }
    });
  }


  /* ---------- Section Reveal ---------- */

  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray('.bento-card, .industry-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: .8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%'
          },
          delay: (i % 3) * .05
        }
      );
    });
  }


  /* ---------- Counters ---------- */

  const counters = document.querySelectorAll('.stat-num');

  const animateCounter = el => {
    const end = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };

    if (window.gsap) {
      gsap.to(obj, {
        val: end,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent =
            prefix +
            obj.val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
            suffix;
        }
      });
    } else {
      el.textContent = prefix + end + suffix;
    }
  };

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '.stats-sticky',
      start: 'top 65%',
      once: true,
      onEnter: () => {
        counters.forEach(animateCounter);
      }
    });

    const dashFootStat = document.querySelector('.dash-footline strong[data-count]');

    if (dashFootStat) {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top 60%',
        once: true,
        onEnter: () => {
          animateCounter(dashFootStat);
        }
      });
    }
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(el => {
            el.textContent =
              (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
          });
          io.disconnect();
        }
      });
    }, { threshold: .4 });

    const statsSection = document.querySelector('.stats-sticky');
    if (statsSection) io.observe(statsSection);
  }


  /* ---------- Back To Top ---------- */

  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 700);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ---------- Contact Form ---------- */

  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      if (!submitButton) return;

      const btnText = submitButton.querySelector('span');
      if (!btnText) return;

      const original = btnText.textContent;

      btnText.textContent = 'Request Sent ✓';
      submitButton.style.background = '#175E43';

      setTimeout(() => {
        btnText.textContent = original;
        submitButton.style.background = '';
        contactForm.reset();
      }, 2600);
    });
  }


  /* ---------- Background Photo Parallax ---------- */

  if (window.gsap && window.ScrollTrigger) {
    /* The hero galleries have their own Ken Burns + mouse-parallax system,
       so hero images are intentionally NOT included here. */

    gsap.utils.toArray('.stats-bg-photo img, .contact-bg-photo img').forEach(img => {
      const section = img.closest('section');
      if (!section) return;

      gsap.to(img, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: .8
        }
      });
    });
  }


  /* ---------- Final Mobile Pricing Safety ---------- */

  function finalMobilePricingCheck() {
    if (window.innerWidth <= 900) {
      document.querySelectorAll('.pricing-grid .price-card').forEach(card => {
        card.style.setProperty('transform', 'none', 'important');
        card.style.setProperty('opacity', '1', 'important');
        card.style.setProperty('animation', 'none', 'important');
      });
    }
  }

  finalMobilePricingCheck();
  window.addEventListener('resize', finalMobilePricingCheck, { passive: true });

});

/* ==========================================================================
   COVERAGE PAGE — new interactions (coverage.html only)
   Fully self-contained, guarded by element existence checks.
   Nothing above this line was modified.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  if (window.gsap && window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Sticky subnav: active pill + sliding thumb + click-scroll ---------- */
  var subnav = document.getElementById('cvgSubnav');
  var subnavThumb = document.getElementById('cvgSubnavThumb');
  if (subnav && subnavThumb) {
    var subnavItems = Array.prototype.slice.call(subnav.querySelectorAll('.cvg-subnav-item'));

    function moveThumbTo(btn) {
      if (!btn) return;
      subnavThumb.style.width = btn.offsetWidth + 'px';
      subnavThumb.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
      subnavThumb.classList.add('is-ready');
    }

    function setActive(btn) {
      subnavItems.forEach(function (i) { i.classList.remove('is-active'); });
      btn.classList.add('is-active');
      moveThumbTo(btn);
    }

    subnavItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.getAttribute('data-target'));
        if (target) {
          var offset = 130;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    window.addEventListener('load', function () {
      var current = subnav.querySelector('.cvg-subnav-item.is-active') || subnavItems[0];
      moveThumbTo(current);
    });
    window.addEventListener('resize', function () {
      var current = subnav.querySelector('.cvg-subnav-item.is-active') || subnavItems[0];
      moveThumbTo(current);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var current = subnav.querySelector('.cvg-subnav-item.is-active') || subnavItems[0];
        moveThumbTo(current);
      });
    }

    var subnavTargets = subnavItems
      .map(function (btn) { return document.querySelector(btn.getAttribute('data-target')); })
      .filter(Boolean);

    if (subnavTargets.length && window.IntersectionObserver) {
      var subnavObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = '#' + entry.target.id;
            var match = subnavItems.filter(function (btn) { return btn.getAttribute('data-target') === id; })[0];
            if (match) setActive(match);
          }
        });
      }, { rootMargin: '-160px 0px -55% 0px', threshold: 0 });
      subnavTargets.forEach(function (t) { subnavObserver.observe(t); });
    }
  }

  /* ---------- Coverage lines: stacked cards depth-fade for cards underneath ---------- */
  var stackCards = document.querySelectorAll('.cvg-stack-card');
  if (stackCards.length && window.ScrollTrigger) {
    stackCards.forEach(function (card, idx) {
      var next = stackCards[idx + 1];
      if (!next) return;
      ScrollTrigger.create({
        trigger: next,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: function (self) {
          var scale = 1 - self.progress * 0.05;
          var opacity = 1 - self.progress * 0.35;
          card.style.transform = 'scale(' + scale + ')';
          card.style.opacity = opacity;
        }
      });
    });
  }

  /* ---------- Included / Excluded sliding toggle ---------- */
  var cvgToggle = document.querySelector('.cvg-toggle');
  var cvgToggleThumb = document.getElementById('cvgToggleThumb');
  if (cvgToggle && cvgToggleThumb) {
    var toggleBtns = cvgToggle.querySelectorAll('.cvg-toggle-btn');
    var compareLists = document.querySelectorAll('.cvg-compare-list');

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.getAttribute('data-panel');

        toggleBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        cvgToggleThumb.classList.toggle('is-right', panel === 'excluded');

        compareLists.forEach(function (list) {
          var show = list.getAttribute('data-panel') === panel;
          list.classList.toggle('is-visible', show);
          if (show) {
            list.querySelectorAll('li').forEach(function (li) {
              li.style.animation = 'none';
              void li.offsetWidth;
              li.style.animation = '';
            });
          }
        });
      });
    });
  }

  /* ---------- Limits calculator ---------- */
  var limitRange = document.getElementById('cvgLimitRange');
  var payrollRange = document.getElementById('cvgPayrollRange');
  var locationsRange = document.getElementById('cvgLocationsRange');
  var calcOutput = document.getElementById('cvgCalcOutput');
  var calcBarFill = document.getElementById('cvgCalcBarFill');
  var limitValue = document.getElementById('cvgLimitValue');
  var payrollValue = document.getElementById('cvgPayrollValue');
  var locationsValue = document.getElementById('cvgLocationsValue');

  function formatMoneyShort(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    return '$' + Math.round(n / 1000) + 'K';
  }

  function setRangeFill(input) {
    var min = parseFloat(input.min), max = parseFloat(input.max), val = parseFloat(input.value);
    var pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  function updateCalculator() {
    if (!limitRange || !payrollRange || !locationsRange || !calcOutput) return;
    var limit = parseFloat(limitRange.value);
    var payroll = parseFloat(payrollRange.value);
    var locations = parseFloat(locationsRange.value);

    var premium = 42 + (limit / 1000000) * 17 + (payroll / 100000) * 2.4 + (locations - 1) * 9;
    premium = Math.round(premium);

    var current = parseInt(calcOutput.textContent, 10) || 0;
    if (window.gsap) {
      gsap.to({ val: current }, {
        val: premium, duration: 0.5, ease: 'power2.out',
        onUpdate: function () { calcOutput.textContent = Math.round(this.targets()[0].val); }
      });
    } else {
      calcOutput.textContent = premium;
    }

    if (calcBarFill) {
      var maxPossible = 42 + 5 * 17 + 30 * 2.4 + 9 * 9;
      var barPct = Math.min(100, (premium / maxPossible) * 100);
      calcBarFill.style.width = barPct + '%';
    }
    if (limitValue) limitValue.textContent = formatMoneyShort(limit);
    if (payrollValue) payrollValue.textContent = formatMoneyShort(payroll);
    if (locationsValue) locationsValue.textContent = locations;

    setRangeFill(limitRange);
    setRangeFill(payrollRange);
    setRangeFill(locationsRange);
  }

  [limitRange, payrollRange, locationsRange].forEach(function (input) {
    if (input) input.addEventListener('input', updateCalculator);
  });
  if (limitRange) {
    updateCalculator();
  }

  /* ---------- Add-on chips: grid-rows expand ---------- */
  document.querySelectorAll('.cvg-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var wasOpen = chip.classList.contains('is-open');
      document.querySelectorAll('.cvg-chip.is-open').forEach(function (c) {
        if (c !== chip) c.classList.remove('is-open');
      });
      chip.classList.toggle('is-open', !wasOpen);
    });
  });

  /* ---------- Claims path: scroll-drawn line + lighting nodes ---------- */
  var claimsPath = document.getElementById('cvgClaimsPath');
  var claimsWrap = document.querySelector('.cvg-claims-wrap');
  var claimsSteps = document.querySelectorAll('.cvg-claims-step');
  if (claimsPath && claimsWrap && window.ScrollTrigger) {
    var totalLen = 960;
    ScrollTrigger.create({
      trigger: claimsWrap,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
      onUpdate: function (self) {
        var offset = totalLen - totalLen * self.progress;
        claimsPath.style.strokeDashoffset = offset;
        claimsSteps.forEach(function (step, i) {
          var threshold = (i + 0.5) / claimsSteps.length;
          step.classList.toggle('is-lit', self.progress >= threshold - 0.06);
        });
      }
    });
  } else if (claimsSteps.length && window.IntersectionObserver) {
    var claimsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-lit');
      });
    }, { threshold: 0.4 });
    claimsSteps.forEach(function (s) { claimsObserver.observe(s); });
  }

  /* ---------- Coverage FAQ accordion (grid-rows + icon crossfade) ---------- */
  document.querySelectorAll('.cvg-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.cvg-faq-q').forEach(function (other) {
        if (other !== btn) other.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

});

/* ==========================================================================
   INDUSTRIES PAGE — new interactions (industries.html only)
   Fully self-contained, guarded by element existence checks.
   Nothing above this line was modified.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  if (window.gsap && window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- 1. Hero: parallax chips tied to scroll depth ---------- */
  var indHero = document.getElementById('ind-hero');
  var indChips = document.querySelectorAll('#indHeroChips .ind-chip');
  if (indHero && indChips.length && window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: indHero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.4,
      onUpdate: function (self) {
        indChips.forEach(function (chip) {
          var depth = parseFloat(chip.getAttribute('data-depth')) || 0.5;
          var y = self.progress * 160 * depth;
          chip.style.transform = 'translateY(' + y + 'px)';
        });
      }
    });
  }

  /* ---------- 2. Explore by industry: tabs + blob frame swap ---------- */
  var indTabs = document.querySelectorAll('.ind-tab');
  var indBlob = document.getElementById('indBlob');
  var indBlobImg = document.getElementById('indBlobImg');
  var indExploreItems = document.querySelectorAll('.ind-explore-item');

  var industryImages = {
    retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=55&fm=webp',
    construction: 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=700&q=55&fm=webp',
    tech: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=55&fm=webp',
    healthcare: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=55&fm=webp',
    manufacturing: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=700&q=55&fm=webp',
    hospitality: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=55&fm=webp'
  };
  var blobShapes = [
    '62% 38% 55% 45% / 45% 55% 45% 55%',
    '38% 62% 42% 58% / 58% 42% 58% 42%',
    '55% 45% 68% 32% / 38% 62% 38% 62%',
    '48% 52% 35% 65% / 62% 40% 60% 38%',
    '65% 35% 50% 50% / 50% 50% 40% 60%',
    '40% 60% 60% 40% / 55% 45% 55% 45%'
  ];

  if (indTabs.length && indBlob && indBlobImg) {
    indTabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        var industry = tab.getAttribute('data-industry');
        if (tab.classList.contains('is-active')) return;

        indTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        indBlob.style.borderRadius = blobShapes[idx % blobShapes.length];
        indBlob.style.transform = 'rotate(' + ((idx % 2 === 0) ? '-3deg' : '3deg') + ')';

        indBlobImg.classList.remove('is-visible');
        setTimeout(function () {
          indBlobImg.src = industryImages[industry] || industryImages.retail;
          indBlobImg.classList.add('is-visible');
        }, 220);

        indExploreItems.forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-industry') === industry);
        });
      });
    });

    window.addEventListener('load', function () {
      indBlobImg.classList.add('is-visible');
    });
  }

  /* ---------- 3. Risk metrics: animated bar chart on scroll ---------- */
  var barRows = document.querySelectorAll('.ind-bar-row');
  if (barRows.length && window.IntersectionObserver) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var row = entry.target;
        var value = parseFloat(row.getAttribute('data-value')) || 0;
        var fill = row.querySelector('.ind-bar-fill');
        var num = row.querySelector('.ind-bar-num');
        if (fill) fill.style.width = value + '%';
        if (num && window.gsap) {
          gsap.to({ val: 0 }, {
            val: value, duration: 1.1, ease: 'power2.out',
            onUpdate: function () { num.textContent = Math.round(this.targets()[0].val) + '%'; }
          });
        } else if (num) {
          num.textContent = value + '%';
        }
        barObserver.unobserve(row);
      });
    }, { threshold: 0.4 });
    barRows.forEach(function (row) { barObserver.observe(row); });
  }

  /* ---------- 5. Client stories: vertical snap reel progress + dots ---------- */
  var reelTrack = document.getElementById('indReelTrack');
  var reelFill = document.getElementById('indReelFill');
  var reelDots = document.querySelectorAll('#indReelDots button');
  var reelCards = document.querySelectorAll('.ind-reel-card');
  if (reelTrack && reelFill) {
    function updateReel() {
      var max = reelTrack.scrollHeight - reelTrack.clientHeight;
      var pct = max > 0 ? (reelTrack.scrollTop / max) * 100 : 0;
      reelFill.style.height = pct + '%';

      if (reelCards.length && reelDots.length) {
        var idx = Math.round(reelTrack.scrollTop / reelTrack.clientHeight);
        reelDots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === idx); });
      }
    }
    reelTrack.addEventListener('scroll', updateReel, { passive: true });
    updateReel();

    reelDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
        reelTrack.scrollTo({ top: idx * reelTrack.clientHeight, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 6. Find your fit: quiz wizard ---------- */
  var quizTrack = document.getElementById('indQuizTrack');
  if (quizTrack) {
    var quizSteps = quizTrack.querySelectorAll('.ind-quiz-step');
    var quizProgressFill = document.getElementById('indQuizProgressFill');
    var quizAnswers = {};
    var quizIndex = 0;

    var resultTitle = document.getElementById('indQuizResultTitle');
    var resultText = document.getElementById('indQuizResultText');
    var restartBtn = document.getElementById('indQuizRestart');

    var industryProfiles = {
      retail: { title: 'Retail Starter Pack', text: 'Begin with General Liability and Commercial Property to cover your storefront, inventory and foot traffic.' },
      construction: { title: 'Construction Starter Pack', text: 'Begin with Workers\u2019 Compensation and Builder\u2019s Risk property coverage to match jobsite exposure.' },
      tech: { title: 'Technology Starter Pack', text: 'Begin with Professional Liability (Tech E&O) and Cyber & Data Breach coverage for your product and client data.' },
      other: { title: 'General Business Starter Pack', text: 'Begin with General Liability as your foundation policy \u2014 we\u2019ll tailor the rest from there.' }
    };

    function goToStep(index) {
      quizSteps.forEach(function (step) {
        step.classList.remove('is-active');
      });
      quizSteps[index].classList.add('is-active');
      quizIndex = index;
      if (quizProgressFill) {
        var pct = ((index + 1) / quizSteps.length) * 100;
        quizProgressFill.style.width = pct + '%';
      }
    }

    function computeResult() {
      var profile = industryProfiles[quizAnswers.business] || industryProfiles.other;
      var extras = [];
      if (quizAnswers.data === 'yes' && quizAnswers.business !== 'tech') {
        extras.push('Since you handle customer data regularly, layer on Cyber & Data Breach coverage as well.');
      }
      if (quizAnswers.setting === 'onsite' && quizAnswers.business !== 'construction') {
        extras.push('With a crew on-site, add Workers\u2019 Compensation to cover on-the-job injuries.');
      }
      if (quizAnswers.setting === 'road') {
        extras.push('With drivers on the road, add Commercial Auto & Fleet coverage.');
      }
      if (resultTitle) resultTitle.textContent = profile.title;
      if (resultText) resultText.textContent = profile.text + (extras.length ? ' ' + extras.join(' ') : '');
    }

    quizTrack.querySelectorAll('.ind-quiz-options button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = btn.getAttribute('data-q');
        var value = btn.getAttribute('data-value');
        quizAnswers[q] = value;

        var next = quizIndex + 1;
        if (next < quizSteps.length) {
          if (next === quizSteps.length - 1) computeResult();
          goToStep(next);
        }
      });
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        quizAnswers = {};
        goToStep(0);
      });
    }
  }

  /* ---------- 7. Specialist advisors: drag-to-scroll + velocity skew ---------- */
  var advisorScroller = document.getElementById('indAdvisorScroller');
  if (advisorScroller) {
    var isDown = false, startX = 0, startScroll = 0;

    advisorScroller.addEventListener('mousedown', function (e) {
      isDown = true;
      advisorScroller.classList.add('is-dragging');
      startX = e.pageX;
      startScroll = advisorScroller.scrollLeft;
    });
    window.addEventListener('mouseup', function () {
      isDown = false;
      advisorScroller.classList.remove('is-dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var delta = e.pageX - startX;
      advisorScroller.scrollLeft = startScroll - delta;
    });

    var lastScrollLeft = 0;
    var skewTicking = false;
    advisorScroller.addEventListener('scroll', function () {
      if (skewTicking) return;
      skewTicking = true;
      requestAnimationFrame(function () {
        var delta = advisorScroller.scrollLeft - lastScrollLeft;
        lastScrollLeft = advisorScroller.scrollLeft;
        var skew = Math.max(-6, Math.min(6, delta * 0.6));
        advisorScroller.style.transform = 'skewX(' + skew + 'deg)';
        clearTimeout(advisorScroller._skewReset);
        advisorScroller._skewReset = setTimeout(function () {
          advisorScroller.style.transform = 'skewX(0deg)';
        }, 120);
        skewTicking = false;
      });
    }, { passive: true });
  }

  /* ---------- 8. Industries FAQ: mask reveal accordion ---------- */
  document.querySelectorAll('.ind-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.ind-faq-item');
      var mask = item.querySelector('.ind-faq-mask');
      var inner = mask.querySelector('.ind-faq-a');
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.ind-faq-q').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var otherMask = other.closest('.ind-faq-item').querySelector('.ind-faq-mask');
          otherMask.style.height = '0px';
          otherMask.classList.remove('is-open');
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        mask.classList.add('is-open');
        mask.style.height = inner.scrollHeight + 'px';
      } else {
        mask.style.height = '0px';
        mask.classList.remove('is-open');
      }
    });
  });

  window.addEventListener('load', function () {
    var openBtn = document.querySelector('.ind-faq-q[aria-expanded="true"]');
    if (openBtn) {
      var mask = openBtn.closest('.ind-faq-item').querySelector('.ind-faq-mask');
      var inner = mask.querySelector('.ind-faq-a');
      mask.classList.add('is-open');
      mask.style.height = inner.scrollHeight + 'px';
    }
  });

});

/* ==========================================================================
   ABOUT PAGE — new interactions (about.html only)
   Fully self-contained, guarded by element existence checks.
   Nothing above this line was modified.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Origin reel: colorize on scroll into view ---------- */
  var reelFrames = document.querySelectorAll('.ab-reel-frame');
  if (reelFrames.length && window.IntersectionObserver) {
    var reelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-inview');
      });
    }, { threshold: 0.35 });
    reelFrames.forEach(function (f) { reelObserver.observe(f); });
  }

  /* ---------- Values: ripple flip-tile grid ---------- */
  var rippleGrid = document.getElementById('abRippleGrid');
  if (rippleGrid) {
    var rippleTiles = Array.prototype.slice.call(rippleGrid.querySelectorAll('.ab-ripple-tile'));

    rippleTiles.forEach(function (tile) {
      var row = parseInt(tile.getAttribute('data-row'), 10);
      var col = parseInt(tile.getAttribute('data-col'), 10);

      tile.addEventListener('mouseenter', function () {
        tile.classList.add('is-flipped');
        rippleTiles.forEach(function (other) {
          if (other === tile) return;
          var oRow = parseInt(other.getAttribute('data-row'), 10);
          var oCol = parseInt(other.getAttribute('data-col'), 10);
          var dist = Math.abs(oRow - row) + Math.abs(oCol - col);
          if (dist === 1) {
            other.querySelector('.ab-ripple-inner').style.transitionDelay = (dist * 0.06) + 's';
            other.classList.add('is-nudge');
          }
        });
      });

      tile.addEventListener('mouseleave', function () {
        tile.classList.remove('is-flipped');
        rippleTiles.forEach(function (other) {
          other.classList.remove('is-nudge');
          var inner = other.querySelector('.ab-ripple-inner');
          if (inner) inner.style.transitionDelay = '0s';
        });
      });
    });
  }

  /* ---------- Milestones: split-flap ledger ---------- */
  var flapYears = document.querySelectorAll('.ab-flap-year');
  if (flapYears.length) {
    flapYears.forEach(function (wrap) {
      var finalStr = wrap.getAttribute('data-final') || '----';
      var digits = finalStr.split('').map(function () {
        var d = document.createElement('span');
        d.className = 'ab-flap-digit';
        d.textContent = '0';
        wrap.appendChild(d);
        return d;
      });
      wrap._abFinal = finalStr;
      wrap._abDigits = digits;
      wrap._abDone = false;
    });

    var runFlap = function (wrap) {
      if (wrap._abDone) return;
      wrap._abDone = true;
      var finalStr = wrap._abFinal;
      var digits = wrap._abDigits;

      digits.forEach(function (digitEl, i) {
        var finalChar = finalStr[i];
        var ticks = 5 + i * 2;
        var count = 0;
        var iv = setInterval(function () {
          count++;
          digitEl.classList.remove('is-ticking');
          void digitEl.offsetWidth;
          digitEl.classList.add('is-ticking');
          if (count >= ticks) {
            clearInterval(iv);
            digitEl.textContent = finalChar;
          } else {
            digitEl.textContent = Math.floor(Math.random() * 10);
          }
        }, 90);
      });
    };

    if (window.IntersectionObserver) {
      var flapObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) runFlap(entry.target);
        });
      }, { threshold: 0.6 });
      flapYears.forEach(function (w) { flapObserver.observe(w); });
    } else {
      flapYears.forEach(runFlap);
    }
  }

  /* ---------- Leadership: rolodex fan carousel ---------- */
  var rolodexStack = document.getElementById('abRolodexStack');
  if (rolodexStack) {
    var rolodexCards = Array.prototype.slice.call(rolodexStack.querySelectorAll('.ab-rolodex-card'));
    var rolodexActive = 0;

    function updateRolodex() {
      var n = rolodexCards.length;
      rolodexCards.forEach(function (card, i) {
        var offset = i - rolodexActive;
        if (offset > n / 2) offset -= n;
        if (offset < -n / 2) offset += n;

        var abs = Math.abs(offset);
        card.style.transform = 'translateX(' + (offset * 40) + 'px) translateY(' + (abs * 12) + 'px) rotate(' + (offset * 9) + 'deg) scale(' + (1 - abs * 0.08) + ')';
        card.style.zIndex = String(50 - abs);
        card.style.opacity = abs > 3 ? '0' : '1';
        card.classList.toggle('is-active', offset === 0);
      });
    }
    updateRolodex();

    rolodexCards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        rolodexActive = i;
        updateRolodex();
      });
    });

    var rPrev = document.getElementById('abRolodexPrev');
    var rNext = document.getElementById('abRolodexNext');
    if (rPrev) rPrev.addEventListener('click', function () {
      rolodexActive = (rolodexActive - 1 + rolodexCards.length) % rolodexCards.length;
      updateRolodex();
    });
    if (rNext) rNext.addEventListener('click', function () {
      rolodexActive = (rolodexActive + 1) % rolodexCards.length;
      updateRolodex();
    });
  }

  /* ---------- Licensing: dot-assembled shield ---------- */
  var dotShield = document.getElementById('abDotShield');
  if (dotShield) {
    var cols = 11, rows = 13;
    var w = dotShield.clientWidth || 260, h = dotShield.clientHeight || 300;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var dot = document.createElement('span');
        dot.className = 'ab-dot';
        var left = (c / (cols - 1)) * 100;
        var top = (r / (rows - 1)) * 100;
        dot.style.left = left + '%';
        dot.style.top = top + '%';
        var randX = (Math.random() * 2 - 1) * 220;
        var randY = (Math.random() * 2 - 1) * 220;
        dot.style.setProperty('--sx', randX + 'px');
        dot.style.setProperty('--sy', randY + 'px');
        dot.style.transitionDelay = (Math.random() * 0.6) + 's';
        dotShield.appendChild(dot);
      }
    }

    if (window.IntersectionObserver) {
      var shieldObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            dotShield.querySelectorAll('.ab-dot').forEach(function (d) { d.classList.add('is-in'); });
            shieldObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });
      shieldObserver.observe(dotShield);
    } else {
      dotShield.querySelectorAll('.ab-dot').forEach(function (d) { d.classList.add('is-in'); });
    }
  }

  /* ---------- CTA: magnetic dot field ---------- */
  var ctaDotsWrap = document.getElementById('abCtaDots');
  if (ctaDotsWrap) {
    var ctaDots = [];
    var dCols = window.innerWidth < 640 ? 10 : 18;
    var dRows = window.innerWidth < 640 ? 7 : 10;

    for (var dy = 0; dy < dRows; dy++) {
      for (var dx = 0; dx < dCols; dx++) {
        var dEl = document.createElement('span');
        dEl.className = 'ab-cta-dot';
        var leftPct = (dx / (dCols - 1)) * 100;
        var topPct = (dy / (dRows - 1)) * 100;
        dEl.style.left = leftPct + '%';
        dEl.style.top = topPct + '%';
        ctaDotsWrap.appendChild(dEl);
        ctaDots.push({ el: dEl, baseLeftPct: leftPct, baseTopPct: topPct });
      }
    }

    var ctaSection = document.getElementById('ab-cta');
    var ctaMouse = null;
    var ctaTicking = false;

    function ctaRender() {
      ctaTicking = false;
      if (!ctaSection) return;
      var rect = ctaSection.getBoundingClientRect();

      ctaDots.forEach(function (d) {
        var dotX = rect.width * (d.baseLeftPct / 100);
        var dotY = rect.height * (d.baseTopPct / 100);

        if (ctaMouse) {
          var dx2 = dotX - ctaMouse.x;
          var dy2 = dotY - ctaMouse.y;
          var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          var radius = 130;
          if (dist < radius) {
            var force = (1 - dist / radius) * 22;
            var angle = Math.atan2(dy2, dx2);
            var tx = Math.cos(angle) * force;
            var ty = Math.sin(angle) * force;
            d.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + (1 + force / 22) + ')';
            return;
          }
        }
        d.el.style.transform = 'translate(0,0) scale(1)';
      });
    }

    if (ctaSection) {
      ctaSection.addEventListener('mousemove', function (e) {
        var rect = ctaSection.getBoundingClientRect();
        ctaMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (!ctaTicking) {
          ctaTicking = true;
          requestAnimationFrame(ctaRender);
        }
      });
      ctaSection.addEventListener('mouseleave', function () {
        ctaMouse = null;
        requestAnimationFrame(ctaRender);
      });
    }
  }

});


/* ==========================================================================
   FOOTER NEWSLETTER VALIDATION + 404 REDIRECT + CLEAR ON BACK
   ADD ONLY — EXISTING CODE REMAINS UNCHANGED
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  const newsletter =
    document.querySelector('.footer-newsletter');

  if (!newsletter) {
    return;
  }

  const newsletterInput =
    newsletter.querySelector('input[type="email"]');

  const newsletterButton =
    newsletter.querySelector('button');

  if (!newsletterInput || !newsletterButton) {
    return;
  }

  /* Prevent browser from remembering the entered email */
  newsletterInput.setAttribute('autocomplete', 'off');

  newsletterInput.setAttribute('required', '');

  /* -----------------------------------------------------------------------
     VALIDATE EMAIL
     ----------------------------------------------------------------------- */

  newsletterButton.addEventListener('click', function () {

    const email = newsletterInput.value.trim();

    newsletterInput.value = email;

    /* Empty / invalid email */
    if (!newsletterInput.checkValidity()) {
      newsletterInput.reportValidity();
      newsletterInput.focus();
      return;
    }

    /* Additional email validation */
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {

      newsletterInput.setCustomValidity(
        'Please enter a valid email address.'
      );

      newsletterInput.reportValidity();

      newsletterInput.setCustomValidity('');

      newsletterInput.focus();

      return;
    }

    /* Clear the email BEFORE leaving the page */
    newsletterInput.value = '';

    /* Go to 404.html */
    window.location.href = '404.html';
  });


  /* Clear validation message when typing again */
  newsletterInput.addEventListener('input', function () {
    newsletterInput.setCustomValidity('');
  });

});


/* ==========================================================================
   CLEAR NEWSLETTER EMAIL WHEN USER COMES BACK TO THE PAGE
   ========================================================================== */

window.addEventListener('pageshow', function () {

  const newsletterInput =
    document.querySelector(
      '.footer-newsletter input[type="email"]'
    );

  if (newsletterInput) {
    newsletterInput.value = '';
    newsletterInput.setCustomValidity('');
  }

});