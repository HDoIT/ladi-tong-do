/* ============================================ */
/* KEMEI KM-2299 LANDING PAGE                   */
/* JavaScript — All interactions & Google Sheets */
/* ============================================ */

(function () {
    'use strict';

    /* ============================================ */
    /* CONFIG                                       */
    /* ============================================ */
    const CONFIG = {
        // ===== GOOGLE SHEETS =====
        // Thay URL này bằng Web App URL từ Google Apps Script
        // Hướng dẫn:
        // 1. Mở Google Sheet → Extensions → Apps Script
        // 2. Paste code sau:
        //    function doPost(e) {
        //      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        //      var data = JSON.parse(e.postData.contents);
        //      sheet.appendRow([
        //        new Date(),
        //        data.name,
        //        data.phone,
        //        data.address,
        //        data.package,
        //        data.total,
        //        data.note
        //      ]);
        //      return ContentService.createTextOutput(
        //        JSON.stringify({status: 'success'})
        //      ).setMimeType(ContentService.MimeType.JSON);
        //    }
        // 3. Deploy → New Deployment → Web App → Anyone → Deploy
        // 4. Copy URL vào đây
        googleSheetURL: 'https://script.google.com/macros/s/AKfycbyOVX-fVMdPR2VdF_-nq1b41h9AgPlQBDk3s_-oylK7dPWPjSBrVlH0dTBWVsKYp8o/exec',

        countdown: { hours: 2, minutes: 45, seconds: 30 },

        notifications: {
            interval: 18000, // 18s
            duration: 5000,  // 5s display
            names: [
                { name: 'Nguyễn V. Minh', city: 'Hà Nội' },
                { name: 'Trần T. Hương', city: 'TP.HCM' },
                { name: 'Lê Đức Anh', city: 'Đà Nẵng' },
                { name: 'Phạm H. Long', city: 'Bình Dương' },
                { name: 'Vũ Minh Tuấn', city: 'Hải Phòng' },
                { name: 'Đỗ Quang Huy', city: 'Cần Thơ' },
                { name: 'Bùi Thanh N.', city: 'Nghệ An' },
                { name: 'Hoàng V. Đức', city: 'Long An' },
                { name: 'Ngô Bảo Khánh', city: 'Quảng Ninh' },
                { name: 'Đặng H. Phú', city: 'Thanh Hóa' },
                { name: 'Trương M. Q.', city: 'Khánh Hòa' },
                { name: 'Phan T. Mai', city: 'Bắc Ninh' },
                { name: 'Lý Văn Sơn', city: 'Đồng Nai' },
                { name: 'Mai Đức Cường', city: 'Lâm Đồng' },
                { name: 'Đinh Thế V.', city: 'Thái Nguyên' }
            ],
            quantities: ['1 máy', '2 máy', '1 máy', '2 máy', '1 máy'],
            times: ['vừa xong', '1 phút trước', '2 phút trước', '3 phút trước', '5 phút trước']
        },

        pricing: {
            single: { original: 999000, sale: 599000, ship: 30000 },
            double: { original: 1998000, sale: 1099000, ship: 0 }
        }
    };

    /* ============================================ */
    /* INITIALIZE LUCIDE ICONS                      */
    /* ============================================ */
    function initIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            // Retry after load
            setTimeout(initIcons, 200);
        }
    }

    /* ============================================ */
    /* COUNTDOWN TIMER + FLIP CLOCK                 */
    /* ============================================ */
    class CountdownTimer {
        constructor() {
            this.endTime = this.getEndTime();
            // Simple text countdown groups (mini, form, final, bottom, popup)
            this.groups = [
                { h: 'cdMiniH', m: 'cdMiniM', s: 'cdMiniS' },
                { h: 'cdFormH', m: 'cdFormM', s: 'cdFormS' },
                { h: 'cdFinalH', m: 'cdFinalM', s: 'cdFinalS' },
                { h: 'cdBotH', m: 'cdBotM', s: 'cdBotS' },
                { h: 'cdPopH', m: 'cdPopM', s: 'cdPopS' }
            ];
            // Flip clock digit IDs
            this.flipIds = {
                h1: 'flipH1', h2: 'flipH2',
                m1: 'flipM1', m2: 'flipM2',
                s1: 'flipS1', s2: 'flipS2'
            };
            this.lastDigits = { h1: '', h2: '', m1: '', m2: '', s1: '', s2: '' };
            this.start();
        }

        getEndTime() {
            const key = 'kemei_cd_end';
            const stored = sessionStorage.getItem(key);
            if (stored && parseInt(stored) > Date.now()) return parseInt(stored);

            const end = Date.now() +
                CONFIG.countdown.hours * 3600000 +
                CONFIG.countdown.minutes * 60000 +
                CONFIG.countdown.seconds * 1000;
            sessionStorage.setItem(key, end.toString());
            return end;
        }

        start() {
            this.update();
            this.interval = setInterval(() => this.update(), 1000);
        }

        update() {
            let diff = Math.max(0, this.endTime - Date.now());
            const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
            diff %= 3600000;
            const m = String(Math.floor(diff / 60000)).padStart(2, '0');
            diff %= 60000;
            const s = String(Math.floor(diff / 1000)).padStart(2, '0');

            // Update simple text countdowns
            this.groups.forEach(g => {
                const hEl = document.getElementById(g.h);
                const mEl = document.getElementById(g.m);
                const sEl = document.getElementById(g.s);
                if (hEl) hEl.textContent = h;
                if (mEl) mEl.textContent = m;
                if (sEl) sEl.textContent = s;
            });

            // Update flip clock with animation
            const digits = {
                h1: h[0], h2: h[1],
                m1: m[0], m2: m[1],
                s1: s[0], s2: s[1]
            };

            Object.keys(digits).forEach(key => {
                if (digits[key] !== this.lastDigits[key]) {
                    this.flipDigit(this.flipIds[key], this.lastDigits[key], digits[key]);
                    this.lastDigits[key] = digits[key];
                }
            });

            if (h === '00' && m === '00' && s === '00') clearInterval(this.interval);
        }

        flipDigit(id, oldVal, newVal) {
            const card = document.getElementById(id);
            if (!card) return;
            const span = card.querySelector('span');
            if (!span) return;

            // Update number
            span.textContent = newVal;

            // Trigger bounce animation
            card.classList.remove('flipping');
            void card.offsetWidth;
            card.classList.add('flipping');

            // Remove class after animation
            setTimeout(() => card.classList.remove('flipping'), 400);
        }
    }

    /* ============================================ */
    /* SCROLL ANIMATIONS                            */
    /* ============================================ */
    class ScrollAnimations {
        constructor() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

            document.querySelectorAll('.anim-scroll').forEach(el => this.observer.observe(el));
        }
    }

    /* ============================================ */
    /* COUNTING NUMBERS                             */
    /* ============================================ */
    class CountingNumbers {
        constructor() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting && !e.target.dataset.counted) {
                        e.target.dataset.counted = 'true';
                        this.animate(e.target);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.count-up').forEach(el => this.observer.observe(el));
        }

        animate(el) {
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const start = performance.now();
            const ease = t => 1 - Math.pow(1 - t, 4);

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                el.textContent = Math.floor(target * ease(progress)).toLocaleString('vi-VN');
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target.toLocaleString('vi-VN');
            };

            requestAnimationFrame(step);
        }
    }

    /* ============================================ */
    /* STICKY HEADER + BOTTOM BAR                   */
    /* ============================================ */
    class StickyBars {
        constructor() {
            this.topBar = document.getElementById('topBar');
            this.stickyBottom = document.getElementById('stickyBottom');
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const y = window.scrollY;
                        this.topBar.classList.toggle('scrolled', y > 10);
                        this.stickyBottom.classList.toggle('visible', y > 500);
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    /* ============================================ */
    /* TOP PURCHASE NOTIFICATIONS                   */
    /* ============================================ */
    class TopNotifications {
        constructor() {
            this.el = document.getElementById('topNotification');
            this.nameEl = document.getElementById('notifName');
            this.cityEl = document.getElementById('notifCity');
            this.qtyEl = document.getElementById('notifQty');
            this.timeEl = document.getElementById('notifTime');
            this.avatarEl = document.getElementById('notifAvatar');
            this.avatars = [
                'images/nguoi1.jpeg', 'images/nguoi2.jpeg', 'images/nguoi3.jpeg',
                'images/nguoi4.jpeg', 'images/nguoi5.jpeg', 'images/nguoi6.jpeg',
                'images/nguoi7.jpeg', 'images/nguoi8.jpeg'
            ];
            this.idx = 0;
            this.showing = false;

            setTimeout(() => this.show(), 6000);
        }

        show() {
            if (this.showing) return;
            const { names, quantities, times } = CONFIG.notifications;
            const person = names[this.idx % names.length];

            this.nameEl.textContent = person.name;
            this.cityEl.textContent = person.city;
            this.qtyEl.textContent = quantities[this.idx % quantities.length];
            this.timeEl.textContent = times[this.idx % times.length];
            if (this.avatarEl) {
                this.avatarEl.src = this.avatars[this.idx % this.avatars.length];
            }

            this.el.classList.remove('hide');
            this.el.classList.add('show');
            this.showing = true;

            setTimeout(() => {
                this.el.classList.remove('show');
                this.el.classList.add('hide');
                this.showing = false;
                this.idx++;
                setTimeout(() => {
                    this.el.classList.remove('hide');
                    setTimeout(() => this.show(), CONFIG.notifications.interval);
                }, 400);
            }, CONFIG.notifications.duration);
        }
    }

    /* ============================================ */
    /* DYNAMIC STATS                                */
    /* ============================================ */
    class DynamicStats {
        constructor() {
            this.orderEl = document.getElementById('orderCount');
            this.orders = 47;

            setInterval(() => {
                this.orders += Math.floor(Math.random() * 3) + 1;
                if (this.orderEl) this.orderEl.textContent = this.orders;
            }, 45000);

            // Stock countdown
            this.stock = 23;
            this.stockEls = [document.getElementById('stockLeft1'), document.getElementById('stockLeft2')];
            setInterval(() => {
                if (this.stock > 5) {
                    this.stock--;
                    this.stockEls.forEach(el => { if (el) el.textContent = this.stock + ' máy'; });
                }
            }, 120000);
        }
    }

    /* ============================================ */
    /* ORDER FORM — GOOGLE SHEETS                   */
    /* ============================================ */
    class OrderForm {
        constructor() {
            this.form = document.getElementById('orderForm');
            this.pkg1 = document.getElementById('pkg1');
            this.pkg2 = document.getElementById('pkg2');

            if (this.pkg1) this.pkg1.addEventListener('change', () => this.updateSummary());
            if (this.pkg2) this.pkg2.addEventListener('change', () => this.updateSummary());
            this.updateSummary();
        }

        updateSummary() {
            const isDouble = this.pkg2 && this.pkg2.checked;
            const pkg = isDouble ? CONFIG.pricing.double : CONFIG.pricing.single;

            this.setText('summaryProduct', isDouble ? '2 x Kemei KM-2299' : '1 x Kemei KM-2299');
            this.setText('summaryOriginal', this.fmt(pkg.original));
            this.setText('summaryDiscount', '-' + this.fmt(pkg.original - pkg.sale));
            
            const shipEl = document.getElementById('summaryShip');
            if (shipEl) {
                shipEl.textContent = pkg.ship === 0 ? 'MIỄN PHÍ' : this.fmt(pkg.ship);
                shipEl.style.color = pkg.ship === 0 ? '#00C853' : '';
                shipEl.style.fontWeight = pkg.ship === 0 ? '700' : '';
            }

            this.setText('summaryTotal', this.fmt(pkg.sale + pkg.ship));
        }

        setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
        fmt(n) { return new Intl.NumberFormat('vi-VN').format(n) + 'đ'; }
    }

    /* ============================================ */
    /* FORM SUBMIT → GOOGLE SHEETS                  */
    /* ============================================ */
    window.handleOrderSubmit = function (event) {
        event.preventDefault();

        const form = event.target;
        const name = form.querySelector('[name="customerName"]').value.trim();
        const phone = form.querySelector('[name="customerPhone"]').value.trim();
        const address = form.querySelector('[name="customerAddress"]').value.trim();
        const noteEl = form.querySelector('[name="customerNote"]');
        const note = noteEl ? noteEl.value.trim() : '';
        const pkg = form.querySelector('input[name="package"]:checked') || form.querySelector('input[name="packageInline"]:checked');
        const pkgVal = pkg ? pkg.value : '1';

        // Validate
        if (!name || !phone || !address) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ''))) {
            showToast('Số điện thoại không hợp lệ!', 'error');
            return;
        }

        // Disable button
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
            btn.disabled = true;
            const mainText = btn.querySelector('.cta-btn__main');
            if (mainText) mainText.textContent = 'ĐANG GỬI...';
            btn.style.opacity = '0.7';
        }

        const pricing = pkgVal === '2' ? CONFIG.pricing.double : CONFIG.pricing.single;
        const total = pricing.sale + pricing.ship;

        const data = {
            name: name,
            phone: phone,
            address: address,
            package: pkgVal === '2' ? '2 Máy' : '1 Máy',
            total: new Intl.NumberFormat('vi-VN').format(total) + 'đ',
            note: note
        };

        // Send to Google Sheets
        fetch(CONFIG.googleSheetURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(() => showSuccess())
        .catch(() => showSuccess());

        function showSuccess() {
            form.style.display = 'none';
            const parent = form.parentElement;
            const successEl = parent.querySelector('.order-success');
            const urgencyEl = parent.querySelector('.popup-overlay__urgency, .order-urgency');
            if (urgencyEl) urgencyEl.style.display = 'none';
            if (successEl) successEl.style.display = 'block';

            // GA4 conversion tracking
            if (typeof gtag === 'function') {
                gtag('event', 'purchase', { currency: 'VND', value: total });
            }
        }
    };

    /* ============================================ */
    /* FAQ TOGGLE                                   */
    /* ============================================ */
    window.toggleFAQ = function (button) {
        const item = button.closest('.faq-item');
        const wasActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item.active').forEach(i => {
            if (i !== item) {
                i.classList.remove('active');
                i.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
            }
        });

        item.classList.toggle('active');
        button.setAttribute('aria-expanded', !wasActive);
    };

    /* ============================================ */
    /* PACKAGE SELECTION                            */
    /* ============================================ */
    window.selectPackage = function (count) {
        // Open popup and select the right package
        openOrderPopup();
        setTimeout(() => {
            const r = document.getElementById(count === 2 ? 'pkg2' : 'pkg1');
            if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
        }, 100);
    };

    /* ============================================ */
    /* ORDER POPUP — OPEN / CLOSE                   */
    /* ============================================ */
    window.openOrderPopup = function () {
        const popup = document.getElementById('orderPopup');
        if (!popup) return;
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Re-init icons inside popup
        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 50);
    };

    window.closeOrderPopup = function () {
        const popup = document.getElementById('orderPopup');
        if (!popup) return;
        popup.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOrderPopup();
    });

    /* ============================================ */
    /* FEEDBACK "XEM THÊM" BUTTON                   */
    /* ============================================ */
    class FeedbackMore {
        constructor() {
            const text = document.querySelector('.feedback-more__text');
            if (!text) return;

            text.style.cursor = 'pointer';
            text.addEventListener('click', () => {
                const hiddenCards = document.querySelectorAll('.feedback-card--hidden');
                hiddenCards.forEach(card => {
                    card.classList.add('show');
                });
            });
        }
    }

    /* ============================================ */
    /* TOAST NOTIFICATION                           */
    /* ============================================ */
    function showToast(msg, type) {
        const old = document.querySelector('.toast-msg');
        if (old) old.remove();

        const t = document.createElement('div');
        t.className = 'toast-msg';
        t.style.cssText = `
            position:fixed; top:56px; left:50%; transform:translateX(-50%);
            max-width:396px; width:calc(100% - 32px); z-index:10000;
            padding:12px 16px; border-radius:4px; font-size:13px; font-weight:600;
            text-align:center; animation:slideUp .3s ease-out;
            font-family:'Be Vietnam Pro',sans-serif;
            ${type === 'error'
                ? 'background:#FFEBEE;color:#C62828;border:1px solid #EF9A9A;'
                : 'background:#E8F5E9;color:#2E7D32;border:1px solid #A5D6A7;'
            }`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    /* ============================================ */
    /* SMOOTH SCROLL                                */
    /* ============================================ */
    class SmoothScroll {
        constructor() {
            document.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener('click', e => {
                    const id = link.getAttribute('href');
                    if (id === '#') return;
                    const el = document.querySelector(id);
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                });
            });
        }
    }

    /* ============================================ */
    /* RIPPLE EFFECT ON CTA BUTTONS                 */
    /* ============================================ */
    class RippleEffect {
        constructor() {
            document.querySelectorAll('.cta-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const r = document.createElement('span');
                    const rect = btn.getBoundingClientRect();
                    const sz = Math.max(rect.width, rect.height);
                    r.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px;background:rgba(255,255,255,.3);border-radius:50%;transform:scale(0);animation:ripple .6s ease-out;pointer-events:none;`;
                    btn.appendChild(r);
                    setTimeout(() => r.remove(), 600);
                });
            });
        }
    }

    /* ============================================ */
    /* SCROLL PROGRESS BAR                          */
    /* ============================================ */
    class ScrollProgress {
        constructor() {
            const bar = document.createElement('div');
            bar.style.cssText = 'position:fixed;top:48px;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:3px;z-index:1001;pointer-events:none;';

            this.fill = document.createElement('div');
            this.fill.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,#FF6B35,#FF1744);border-radius:0 3px 3px 0;transition:width .1s;';

            bar.appendChild(this.fill);
            document.body.appendChild(bar);

            window.addEventListener('scroll', () => {
                requestAnimationFrame(() => {
                    const p = Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100);
                    this.fill.style.width = p + '%';
                });
            }, { passive: true });
        }
    }

    /* ============================================ */
    /* INIT                                         */
    /* ============================================ */
    function init() {
        initIcons();

        new CountdownTimer();
        new ScrollAnimations();
        new CountingNumbers();
        new StickyBars();
        new SmoothScroll();
        new OrderForm();
        new TopNotifications();
        new DynamicStats();
        new FeedbackMore();
        new RippleEffect();
        new ScrollProgress();

        console.log('✂️ Kemei KM-2299 — Landing Page Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
