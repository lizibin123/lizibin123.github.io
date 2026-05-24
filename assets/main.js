// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Navbar background on scroll
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 60) {
    nav.style.background = 'rgba(10,10,15,0.95)';
    nav.style.backdropFilter = 'blur(20px)';
  } else {
    nav.style.background = 'rgba(10,10,15,0.85)';
  }
  lastScroll = currentScroll;
});

// Reusable fade-in animation — fires every time element enters viewport
const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Fade in
      const delay = Math.random() * 150;
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, delay);
    } else {
      // Scrolled out of view — reset so it can fade in again
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(24px)';
    }
  });
}, observerOptions);

// Apply to all animated elements
function initScrollAnimations() {
  const selectors = [
    '.section', '.portfolio-card', '.note-item',
    '.about-card', '.contact-item', '.contact-cta-card',
    '.hero-title', '.hero-desc', '.hero-actions', '.hero-stats',
    '.skill-tags', '.about-text p',
    '.notes-list .note-item', '.contact-form',
    '.notes-page .page-header', '.notes-page .note-item'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      // Only set initial state and observe if not already observed
      if (!el.dataset.observed) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        el.dataset.observed = 'true';
        observer.observe(el);
      }
    });
  });
}

initScrollAnimations();

// Smooth scroll with adjustable duration and easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - 60;
      const startPos = window.pageYOffset;
      const distance = targetPos - startPos;
      const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 400), 900);
      let startTime = null;

      function easeInOutCubic(t) {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function scrollAnimation(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(0, startPos + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(scrollAnimation);
        }
      }

      requestAnimationFrame(scrollAnimation);
    }
  });
});

// ===== Contact form submission =====
const form = document.getElementById('contactForm');
const successEl = document.getElementById('formSuccess');
const submitBtn = form?.querySelector('.form-submit');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const contact = document.getElementById('formContact').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !message) return;

    // 禁用按钮，防止重复提交
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    // 方案一：尝试提交到本地服务
    try {
      const response = await fetch('http://localhost:3456/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message })
      });

      if (response.ok) {
        showSuccess();
        form.reset();
        return;
      }
    } catch (e) {
      // 本地服务未启动，走 fallback
      console.log('本地服务未运行，走邮件备选方案');
    }

    // 方案二：邮件备选（本地服务没启动时）
    const mailBody = `需求来自: ${name}\n联系方式: ${contact || '未提供'}\n\n需求描述:\n${message}`;
    window.location.href = `mailto:lizibin123123@outlook.com?subject=${encodeURIComponent('📩 永乐工作室 · 新需求')}&body=${encodeURIComponent(mailBody)}`;

    // 同时保存到 localStorage
    saveToLocal({ name, contact, message });

    showSuccess();
    form.reset();
  });
}

function showSuccess() {
  form.style.display = 'none';
  successEl.classList.add('show');
  submitBtn.disabled = false;
  submitBtn.textContent = '提交需求 →';
}

function saveToLocal(data) {
  let submissions = [];
  try {
    const raw = localStorage.getItem('yl_submissions');
    if (raw) submissions = JSON.parse(raw);
  } catch (e) {}
  submissions.push({ ...data, submittedAt: new Date().toISOString() });
  localStorage.setItem('yl_submissions', JSON.stringify(submissions));
}
