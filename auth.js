/* ==========================================================================
   STACKLY — Auth & Dashboard logic
   No alert()/confirm() anywhere — all feedback goes through the toast UI.
   Session is stored in localStorage as JSON: { name, email, role }
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Toast (replaces alert) ---------------- */
  function ensureToastStack() {
    var stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showToast(message, type) {
    type = type || 'info';
    var icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    var stack = ensureToastStack();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    stack.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('is-leaving');
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  }
  window.CWToast = showToast;

  /* ---------------- Password visibility toggle ---------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.toggle-pwd');
    if (!btn) return;
    var wrap = btn.closest('.auth-field-input-wrap');
    if (!wrap) return;
    var input = wrap.querySelector('input');
    if (!input) return;
    var icon = btn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
    } else {
      input.type = 'password';
      if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
    }
  });

  /* ---------------- Role segmented toggle ---------------- */
  document.querySelectorAll('.role-toggle-track').forEach(function (track) {
    var opts = track.querySelectorAll('.role-opt');
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var input = opt.querySelector('input');
        if (!input) return;
        opts.forEach(function (o) { o.classList.remove('is-active'); });
        opt.classList.add('is-active');
        input.checked = true;
        track.setAttribute('data-active', input.value);
      });
    });
  });

  /* ---------------- Field validation helpers ---------------- */
  function markInvalid(field, message) {
    field.classList.add('is-invalid');
    var err = field.querySelector('.auth-field-error');
    if (err && message) err.querySelector('span') && (err.querySelector('span').textContent = message);
    field.addEventListener('animationend', function handler() {
      field.style.animation = '';
      field.removeEventListener('animationend', handler);
    });
  }
  function clearInvalid(field) { field.classList.remove('is-invalid'); }

  function getRole(form) {
    var checked = form.querySelector('.role-opt input:checked');
    return checked ? checked.value : 'user';
  }

  /* ---------------- Session helpers ---------------- */
  var SESSION_KEY = 'cw_session';
  function saveSession(data) { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }
  window.CWSession = { save: saveSession, get: getSession, clear: clearSession };

  /* ---------------- LOGIN FORM ---------------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailField = document.getElementById('loginEmailField');
      var pwdField = document.getElementById('loginPwdField');
      var emailInput = document.getElementById('loginEmail');
      var pwdInput = document.getElementById('loginPwd');
      var valid = true;

      if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
        markInvalid(emailField, 'Enter a valid email address');
        valid = false;
      } else clearInvalid(emailField);

      if (!pwdInput.value || pwdInput.value.length < 4) {
        markInvalid(pwdField, 'Password must be at least 4 characters');
        valid = false;
      } else clearInvalid(pwdField);

      if (!valid) {
        showToast('Please fix the highlighted fields', 'error');
        return;
      }

      var role = getRole(loginForm);
      var submitBtn = loginForm.querySelector('.auth-submit');
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(function () {
        var namePart = emailInput.value.split('@')[0];
        var niceName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        saveSession({ name: niceName, email: emailInput.value.trim(), role: role });

        showToast('Welcome back, ' + niceName + '!', 'success');

        setTimeout(function () {
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        }, 500);
      }, 900);
    });
  }

  /* ---------------- SIGNUP FORM ---------------- */
  var signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameField = document.getElementById('signupNameField');
      var emailField = document.getElementById('signupEmailField');
      var pwdField = document.getElementById('signupPwdField');
      var confirmField = document.getElementById('signupConfirmField');

      var nameInput = document.getElementById('signupName');
      var emailInput = document.getElementById('signupEmail');
      var pwdInput = document.getElementById('signupPwd');
      var confirmInput = document.getElementById('signupConfirm');

      var valid = true;

      if (!nameInput.value.trim()) { markInvalid(nameField, 'Enter your full name'); valid = false; }
      else clearInvalid(nameField);

      if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
        markInvalid(emailField, 'Enter a valid email address'); valid = false;
      } else clearInvalid(emailField);

      if (!pwdInput.value || pwdInput.value.length < 6) {
        markInvalid(pwdField, 'Password must be at least 6 characters'); valid = false;
      } else clearInvalid(pwdField);

      if (!confirmInput.value || confirmInput.value !== pwdInput.value) {
        markInvalid(confirmField, 'Passwords do not match'); valid = false;
      } else clearInvalid(confirmField);

      if (!valid) {
        showToast('Please fix the highlighted fields', 'error');
        return;
      }

      var submitBtn = signupForm.querySelector('.auth-submit');
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(function () {
        showToast('Account created! Redirecting to login…', 'success');
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 900);
      }, 900);
    });
  }

  /* ---------------- DASHBOARD SHELL (both admin & user) ---------------- */
  var dashShell = document.querySelector('.dash-shell');
  if (dashShell) {
    var expectedRole = dashShell.getAttribute('data-role');
    var session = getSession();

    if (!session || !session.role) {
      window.location.href = 'login.html';
      return;
    }
    if (session.role !== expectedRole) {
      window.location.href = session.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
      return;
    }

    /* populate user info */
    document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = session.name; });
    document.querySelectorAll('[data-user-email]').forEach(function (el) { el.textContent = session.email; });
    document.querySelectorAll('[data-user-role]').forEach(function (el) { el.textContent = session.role; });
    document.querySelectorAll('[data-user-initial]').forEach(function (el) {
      el.textContent = (session.name || session.email || '?').charAt(0).toUpperCase();
    });

    /* sidebar mobile toggle */
    var hamburger = document.getElementById('dashHamburger');
    var sidebar = document.getElementById('dashSidebar');
    var overlay = document.getElementById('dashOverlay');
    function closeSidebar() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      hamburger.classList.remove('is-active');
    }
    function toggleSidebar() {
      var open = sidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-visible', open);
      hamburger.classList.toggle('is-active', open);
    }
    if (hamburger && sidebar && overlay) {
      hamburger.addEventListener('click', toggleSidebar);
      overlay.addEventListener('click', closeSidebar);
      sidebar.querySelectorAll('.dash-nav-link').forEach(function (l) {
        l.addEventListener('click', closeSidebar);
      });
    }

    /* logout */
    document.querySelectorAll('.dash-logout-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        clearSession();
        window.location.href = 'login.html';
      });
    });

    /* ---------------- View switching (nav links) ---------------- */
    var navLinks = document.querySelectorAll('.dash-nav-link[data-view]');
    var views = document.querySelectorAll('.dash-view');
    var topTitle = document.querySelector('[data-topbar-title]');

    function animateViewCharts(view) {
      /* progress bars */
      view.querySelectorAll('.dash-progress-fill[data-value]').forEach(function (el) {
        var v = el.getAttribute('data-value');
        el.style.width = '0%';
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.width = v + '%'; }); });
      });
      /* donut charts */
      view.querySelectorAll('.dash-donut[data-pct]').forEach(function (el) {
        var v = el.getAttribute('data-pct');
        el.style.setProperty('--pct', 0);
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.setProperty('--pct', v); }); });
      });
      /* bar charts */
      view.querySelectorAll('.dash-bar-col[data-height]').forEach(function (col, i) {
        var h = col.getAttribute('data-height');
        var bar = col.querySelector('.dash-bar');
        if (!bar) return;
        bar.style.height = '0%';
        col.classList.remove('is-grown');
        setTimeout(function () {
          bar.style.height = h + '%';
          setTimeout(function () { col.classList.add('is-grown'); }, 550);
        }, 80 + i * 70);
      });
      /* leaderboard bars */
      view.querySelectorAll('.dash-leader-bar-fill[data-value]').forEach(function (el, i) {
        var v = el.getAttribute('data-value');
        el.style.width = '0%';
        setTimeout(function () { el.style.width = v + '%'; }, 100 + i * 90);
      });
    }

    function showView(id) {
      views.forEach(function (v) {
        v.classList.toggle('is-active', v.getAttribute('data-view-id') === id);
      });
      navLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('data-view') === id);
      });
      var activeLink = Array.prototype.find.call(navLinks, function (l) { return l.getAttribute('data-view') === id; });
      if (topTitle && activeLink) {
        var labelEl = activeLink.querySelector('.dash-nav-label-text');
        topTitle.textContent = labelEl ? labelEl.textContent : activeLink.textContent.trim();
      }
      var activeView = document.querySelector('.dash-view[data-view-id="' + id + '"]');
      if (activeView) {
        animateViewCharts(activeView);
        document.querySelector('.dash-content') && document.querySelector('.dash-content').scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showView(link.getAttribute('data-view'));
      });
    });

    /* in-content shortcut links, e.g. "Recent Inquiries -> Open Inquiries" */
    document.querySelectorAll('.dash-link-more[data-view]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showView(link.getAttribute('data-view'));
      });
    });

    /* activate whichever view is marked active by default (or first) */
    var initialView = document.querySelector('.dash-view.is-active') || views[0];
    if (initialView) animateViewCharts(initialView);

    /* star rating widget */
    document.querySelectorAll('.dash-rating').forEach(function (rating) {
      var stars = rating.querySelectorAll('i');
      stars.forEach(function (star, idx) {
        star.addEventListener('click', function () {
          stars.forEach(function (s, i) { s.classList.toggle('is-active', i <= idx); });
          showToast('Thanks for rating us ' + (idx + 1) + ' stars!', 'success');
        });
      });
    });

    /* generic simple tab-filter (used by Documents categories, etc.) */
    document.querySelectorAll('.dash-simple-tabs').forEach(function (group) {
      var target = document.querySelector(group.getAttribute('data-target'));
      if (!target) return;
      var tabs = group.querySelectorAll('.dash-tab');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');
          var filter = tab.getAttribute('data-filter');
          target.querySelectorAll('[data-category]').forEach(function (item) {
            item.style.display = (filter === 'all' || item.getAttribute('data-category') === filter) ? '' : 'none';
          });
        });
      });
    });

    /* settings / generic forms inside dashboard — no page reload, just a toast */
    document.querySelectorAll('.dash-view form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showToast('Changes saved successfully', 'success');
      });
    });

    /* count-up stat numbers */
    document.querySelectorAll('.dash-stat-num[data-count]').forEach(function (el, i) {
      var end = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var start = 0;
      var duration = 1200;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = start + (end - start) * eased;
        el.textContent = prefix + Math.round(val).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 150 + i * 100);
    });

    /* ---------------- Dynamic mail / message section ---------------- */
    var mailListEl = document.getElementById('dashMailList');
    var mailDetailEl = document.getElementById('dashMailDetail');

    if (mailListEl && mailDetailEl && window.CW_MAIL_DATA) {
      var mailData = window.CW_MAIL_DATA.slice();
      var activeFilter = 'all';
      var selectedId = null;

      function initials(name) {
        return name.split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2).toUpperCase();
      }

      function renderList() {
        var filtered = mailData.filter(function (m) {
          if (activeFilter === 'unread') return m.unread;
          if (activeFilter === 'flagged') return m.flagged;
          return true;
        });

        mailListEl.innerHTML = '';

        if (!filtered.length) {
          mailListEl.innerHTML = '<div class="dash-mail-empty"><i class="fa-solid fa-inbox" style="font-size:1.8rem;display:block;margin-bottom:10px;color:var(--line);"></i>Nothing here yet.</div>';
          return;
        }

        filtered.forEach(function (m, idx) {
          var item = document.createElement('div');
          item.className = 'dash-mail-item' + (m.unread ? ' is-unread' : '') + (m.id === selectedId ? ' is-selected' : '');
          item.style.animationDelay = (idx * 0.05) + 's';
          item.setAttribute('data-id', m.id);
          item.innerHTML =
            '<div class="dash-mail-avatar">' + initials(m.sender) + '</div>' +
            '<div class="dash-mail-info">' +
              '<div class="dash-mail-top"><span class="dash-mail-sender">' + m.sender + '</span><span class="dash-mail-time">' + m.time + '</span></div>' +
              '<div class="dash-mail-subject">' + m.subject + '</div>' +
              '<div class="dash-mail-preview">' + m.preview + '</div>' +
              (m.tag ? '<span class="dash-mail-tag">' + m.tag + '</span>' : '') +
            '</div>';
          item.addEventListener('click', function () { selectMail(m.id); });
          mailListEl.appendChild(item);
        });
      }

      function renderDetail() {
        var m = mailData.find(function (x) { return x.id === selectedId; });
        if (!m) {
          mailDetailEl.innerHTML =
            '<div class="dash-mail-detail-empty"><i class="fa-solid fa-envelope-open-text"></i><p>Select a message to read it here.</p></div>';
          mailDetailEl.classList.remove('is-open');
          return;
        }
        mailDetailEl.innerHTML =
          '<button class="dash-mail-close"><i class="fa-solid fa-arrow-left"></i> Back to inbox</button>' +
          '<div class="dash-mail-detail-head">' +
            '<div>' +
              '<h3>' + m.subject + '</h3>' +
              '<div class="dash-mail-detail-meta"><strong>' + m.sender + '</strong>&nbsp;·&nbsp;' + m.time + (m.tag ? '&nbsp;·&nbsp;<span class="dash-mail-tag">' + m.tag + '</span>' : '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="dash-mail-detail-body">' + m.body + '</div>' +
          '<div class="dash-mail-detail-actions">' +
'<button class="btn btn-primary dash-mail-reply" onclick="window.location.href=\'../404.html\'"><span>Reply</span><i class="fa-solid fa-reply"></i></button>'
'<button class="btn btn-ghost dash-mail-archive" onclick="window.location.href=\'404.html\'"><span>Archive</span></button>'
          '</div>';
        mailDetailEl.classList.add('is-open');

        var closeBtn = mailDetailEl.querySelector('.dash-mail-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { mailDetailEl.classList.remove('is-open'); });

        var replyBtn = mailDetailEl.querySelector('.dash-mail-reply');
        if (replyBtn) replyBtn.addEventListener('click', function () { showToast('Reply drafted to ' + m.sender, 'success'); });

        var archiveBtn = mailDetailEl.querySelector('.dash-mail-archive');
        if (archiveBtn) archiveBtn.addEventListener('click', function () {
          mailData = mailData.filter(function (x) { return x.id !== m.id; });
          selectedId = null;
          renderList();
          renderDetail();
          showToast('Message archived', 'info');
        });
      }

      function selectMail(id) {
        selectedId = id;
        var m = mailData.find(function (x) { return x.id === id; });
        if (m) m.unread = false;
        updateUnreadBadge();
        renderList();
        renderDetail();
      }

      function updateUnreadBadge() {
        var count = mailData.filter(function (m) { return m.unread; }).length;
        document.querySelectorAll('[data-mail-unread-count]').forEach(function (el) {
          el.textContent = count;
          el.style.display = count ? '' : 'none';
        });
      }

      document.querySelectorAll('#dashMailTabs .dash-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          document.querySelectorAll('#dashMailTabs .dash-tab').forEach(function (t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');
          activeFilter = tab.getAttribute('data-filter');
          renderList();
        });
      });

      renderList();
      renderDetail();
      updateUnreadBadge();
    }
  }
})();