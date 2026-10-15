(function () {
    'use strict';

    /* --- Anciennes URL /pages/xxx.html (via 404.html) vers les ancres --- */
    var LEGACY = { home: 'accueil', about: 'parcours', services: 'competences', projects: 'projets', proofs: 'certifications', lab: 'cyber' };
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get('redirect');
    if (redirect) {
        var m = redirect.match(/\/pages\/([a-z]+)\.html/);
        var anchor = m && LEGACY[m[1]] ? '#' + LEGACY[m[1]] : '';
        history.replaceState(null, '', window.location.pathname);
        if (anchor) {
            window.location.replace(anchor);
            window.addEventListener('load', function () {
                setTimeout(function () {
                    var t = document.querySelector(anchor);
                    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'instant' });
                }, 50);
            });
        }
    }

    /* --- Menu mobile (tiroir) --- */
    var toggle = document.getElementById('nav-toggle');
    var drawer = document.getElementById('drawer');
    function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    toggle.addEventListener('click', function () {
        setMenu(!document.body.classList.contains('menu-open'));
    });
    drawer.addEventListener('click', function (e) {
        // Fermeture au clic sur un lien ou sur le fond assombri
        if (e.target.closest('a') || e.target.hasAttribute('data-close')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) setMenu(false);
    });

    /* --- Barre de lecture --- */
    var bar = document.getElementById('scroll-progress');
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
            ticking = false;
        });
    }, { passive: true });

    /* --- Lien actif (barre d'ordinateur + tiroir) --- */
    var navLinks = document.querySelectorAll('#main-nav a[href^="#"], #drawer .drawer-link');

    if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

        /* Apparition douce des blocs */
        var reveal = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('in');
                    reveal.unobserve(en.target);
                }
            });
        }, { rootMargin: '0px 0px -6% 0px' });
        document.documentElement.classList.add('js-reveal');
        document.querySelectorAll('.reveal').forEach(function (el) {
            // Décalage en cascade entre éléments voisins d'une même grille
            var i = Array.prototype.indexOf.call(el.parentNode.children, el);
            el.style.setProperty('--d', Math.min(i, 5) * 0.07 + 's');
            reveal.observe(el);
        });

        /* Compteurs animés des chiffres clés */
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var counters = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                counters.unobserve(en.target);
                if (calm) return;
                var el = en.target;
                var end = +el.getAttribute('data-count');
                var pre = el.getAttribute('data-prefix') || '';
                var suf = el.getAttribute('data-suffix') || '';
                var t0 = null;
                var dur = end > 10 ? 1400 : 900;
                function step(t) {
                    if (!t0) t0 = t;
                    var p = Math.min((t - t0) / dur, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = pre + Math.round(eased * end) + suf;
                    if (p < 1) requestAnimationFrame(step);
                }
                el.textContent = pre + '0' + suf;
                requestAnimationFrame(step);
                // Filet de sécurité si requestAnimationFrame est suspendu (onglet en arrière-plan)
                setTimeout(function () { el.textContent = pre + end + suf; }, dur + 400);
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('[data-count]').forEach(function (el) { counters.observe(el); });
    }

    /* --- Onglets Certifications / Badges / Distinctions --- */
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    function selectTab(tab, focus) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { selectTab(tab); });
        tab.addEventListener('keydown', function (e) {
            var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (d) selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
        });
    });
    if (tabs.length) selectTab(tabs[0]);

    /* --- Visionneuse : agrandissement + navigation précédent / suivant --- */
    var viewer = document.getElementById('viewer');
    var vImg = document.getElementById('viewer-img');
    var vTitle = document.getElementById('viewer-title');
    var vCount = document.getElementById('viewer-count');
    var list = [];
    var index = 0;

    function show(i) {
        index = (i + list.length) % list.length;
        var el = list[index];
        vImg.classList.remove('swap');
        void vImg.offsetWidth; // relance l'animation
        vImg.classList.add('swap');
        vImg.src = el.getAttribute('data-zoom');
        vImg.alt = el.getAttribute('data-title') || '';
        vTitle.textContent = el.getAttribute('data-title') || '';
        vCount.textContent = list.length > 1 ? (index + 1) + ' / ' + list.length : '';
        viewer.classList.toggle('single', list.length < 2);
    }

    document.addEventListener('click', function (e) {
        var z = e.target.closest('[data-zoom]');
        if (!z) return;
        var gallery = z.closest('[data-gallery]');
        list = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('[data-zoom]')) : [z];
        show(list.indexOf(z));
        if (typeof viewer.showModal === 'function') viewer.showModal();
        else window.open(z.getAttribute('data-zoom'), '_blank');
    });

    viewer.querySelector('.prev').addEventListener('click', function () { show(index - 1); });
    viewer.querySelector('.next').addEventListener('click', function () { show(index + 1); });
    viewer.querySelector('.viewer-close').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('click', function (e) {
        // Tap sur le fond (hors image et boutons) : fermeture
        if (e.target === viewer || e.target.classList.contains('viewer-stage')) viewer.close();
    });
    viewer.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
    });
    viewer.addEventListener('close', function () { vImg.src = 'data:,'; });

    /* Balayage sur mobile */
    var startX = null;
    var startY = null;
    viewer.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
        if (startX === null || list.length < 2) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
        startX = null;
    });

    document.getElementById('year').textContent = new Date().getFullYear();
})();
