/* Effets visuels légers : progression de lecture, machine à écrire, particules du hero,
   lueur du curseur et inclinaison 3D des cartes. Tout est coupé si l'utilisateur
   préfère réduire les animations ; les effets souris ne tournent que sur ordinateur. */
(function () {
    'use strict';

    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* --- Barre de progression de lecture --- */
    var bar = document.getElementById('scroll-progress');
    var ticking = false;
    function updateBar() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();

    if (calm) return;

    /* --- Machine à écrire sur le titre du hero --- */
    var typed = document.getElementById('typed');
    if (typed) {
        var words = typed.getAttribute('data-words').split('|');
        var w = 0;
        var pos = words[0].length;
        var deleting = false;
        typed.classList.add('typed');
        function tick() {
            var word = words[w];
            if (!deleting) {
                pos++;
                if (pos > word.length) { deleting = true; return setTimeout(tick, 2200); }
            } else {
                pos--;
                if (pos === 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
            }
            typed.textContent = words[w].slice(0, pos);
            setTimeout(tick, deleting ? 28 : 55);
        }
        setTimeout(function () { deleting = true; tick(); }, 3200);
    }

    if (!finePointer || window.innerWidth < 900) return;

    /* --- Particules reliées dans le hero --- */
    var canvas = document.getElementById('hero-canvas');
    var hero = document.getElementById('accueil');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var dots = [];
        var W = 0;
        var H = 0;
        var running = false;
        var mouse = { x: -999, y: -999 };
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        function size() {
            W = hero.offsetWidth;
            H = hero.offsetHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var n = Math.round(Math.min(70, W * H / 22000));
            dots = [];
            for (var i = 0; i < n; i++) {
                dots.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
            }
        }
        function frame() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < dots.length; i++) {
                var a = dots[i];
                a.x += a.vx; a.y += a.vy;
                if (a.x < 0 || a.x > W) a.vx *= -1;
                if (a.y < 0 || a.y > H) a.vy *= -1;
                for (var j = i + 1; j < dots.length; j++) {
                    var b = dots[j];
                    var dx = a.x - b.x, dy = a.y - b.y;
                    var d2 = dx * dx + dy * dy;
                    if (d2 < 15000) {
                        ctx.strokeStyle = 'rgba(167, 139, 250,' + (1 - d2 / 15000) * .35 + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
                var mx = a.x - mouse.x, my = a.y - mouse.y;
                var m2 = mx * mx + my * my;
                if (m2 < 30000) {
                    ctx.strokeStyle = 'rgba(63, 169, 255,' + (1 - m2 / 30000) * .5 + ')';
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
                ctx.fillStyle = 'rgba(200, 185, 255, .75)';
                ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, 6.283); ctx.fill();
            }
            requestAnimationFrame(frame);
        }
        size();
        window.addEventListener('resize', size);
        hero.addEventListener('mousemove', function (e) {
            var r = hero.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        });
        hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
        // Ne calcule que lorsque le hero est visible
        new IntersectionObserver(function (en) {
            var vis = en[0].isIntersecting;
            if (vis && !running) { running = true; requestAnimationFrame(frame); }
            if (!vis) running = false;
        }).observe(hero);
    }

    /* --- Lueur qui suit la souris --- */
    var glow = document.getElementById('cursor-glow');
    var gx = 0, gy = 0, tx = 0, ty = 0, glowing = false;
    function follow() {
        gx += (tx - gx) * .15; gy += (ty - gy) * .15;
        glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
        if (Math.abs(tx - gx) > .5 || Math.abs(ty - gy) > .5) requestAnimationFrame(follow);
        else glowing = false;
    }
    window.addEventListener('mousemove', function (e) {
        tx = e.clientX; ty = e.clientY;
        glow.classList.add('on');
        if (!glowing) { glowing = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

    /* --- Inclinaison 3D des cartes projet --- */
    document.querySelectorAll('.project').forEach(function (card) {
        card.classList.add('tilt');
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - .5;
            var py = (e.clientY - r.top) / r.height - .5;
            card.style.transform = 'perspective(900px) rotateX(' + (-py * 5) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-4px)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
})();
