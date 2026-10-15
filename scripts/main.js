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
        // Changement d'ancre seul : pas de rechargement, le navigateur défile vers la section
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

    /* --- Menu mobile --- */
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');
    function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    }
    toggle.addEventListener('click', function () {
        setMenu(!document.body.classList.contains('menu-open'));
    });
    nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });

    /* --- En-tête : ombre au défilement + lien actif --- */
    var header = document.querySelector('.site-header');
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });

    if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === en.target.id); });
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
        }, { rootMargin: '0px 0px -8% 0px' });
        document.documentElement.classList.add('js-reveal');
        document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
    }

    /* --- Visionneuse d'images (certificats, badges, photo) --- */
    var viewer = document.getElementById('viewer');
    var vImg = document.getElementById('viewer-img');
    var vTitle = document.getElementById('viewer-title');

    function openViewer(src, title) {
        vImg.src = src;
        vImg.alt = title;
        vTitle.textContent = title;
        if (typeof viewer.showModal === 'function') viewer.showModal();
        else window.open(src, '_blank');
    }
    document.addEventListener('click', function (e) {
        var z = e.target.closest('[data-zoom]');
        if (z) openViewer(z.getAttribute('data-zoom'), z.getAttribute('data-title') || '');
    });
    viewer.addEventListener('click', function (e) {
        if (e.target === viewer || e.target.closest('.viewer-close')) viewer.close();
    });
    viewer.addEventListener('close', function () { vImg.src = 'data:,'; });

    document.getElementById('year').textContent = new Date().getFullYear();
})();
