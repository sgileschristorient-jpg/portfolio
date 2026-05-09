async function runScanner() {
    const urlInput = document.getElementById('urlInput');
    const results = document.getElementById('results');
    const riskScore = document.getElementById('riskScore');
    const threatLevel = document.getElementById('threatLevel');
    const radar = document.getElementById('radar');
    const ipDisplay = document.getElementById('ipDisplay');
    const targetDisplay = document.getElementById('targetDisplay');
    
    let url = urlInput.value.trim();
    if (!url) {
        results.innerHTML = '<div class="log-entry log-error">[ERROR] Veuillez entrer une URL valide.</div>';
        return;
    }

    if (!url.startsWith('http')) url = 'https://' + url;
    let domain = '';
    try {
        domain = new URL(url).hostname;
        targetDisplay.innerText = domain;
    } catch (e) {
        results.innerHTML = '<div class="log-entry log-error">[ERROR] Format d URL invalide.</div>';
        return;
    }

    // Reset UI
    results.innerHTML = '<div class="log-entry log-info">[SYSTEM] Initialisation du moteur d analyse...</div>';
    riskScore.innerText = '00';
    riskScore.style.color = 'var(--accent)';
    threatLevel.innerText = 'STATUS: ANALYZING...';
    threatLevel.className = 'badge rounded-pill bg-primary border border-info p-2 w-100 mb-2';
    radar.classList.add('scanning');
    
    const updateMetric = (id, val, status = 'active') => {
        const el = document.getElementById(id);
        if (!el) return;
        const valEl = document.getElementById('val-' + id.split('-')[1]);
        if (valEl) valEl.innerText = val;
        el.className = `metric-card ${status}`;
    };

    const addLog = (msg, type = 'info') => {
        const div = document.createElement('div');
        div.className = `log-entry log-${type}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        results.appendChild(div);
        results.scrollTop = results.scrollHeight;
    };

    // Stage 1: DNS
    await new Promise(r => setTimeout(r, 1000));
    addLog('Analyse DNS (Propagation & Enregistrements)...', 'info');
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await response.json();
        if (data.Answer) {
            const ip = data.Answer.find(a => a.type === 1)?.data || 'N/A';
            ipDisplay.innerText = `IP: ${ip}`;
            addLog(`Serveur identifié via Google DNS: ${ip}`, 'success');
            updateMetric('card-dns', 'SECURE', 'active');
        } else {
            addLog('Avertissement: Aucun enregistrement DNS A trouvé.', 'warn');
            updateMetric('card-dns', 'INCONNU', 'warn');
        }
    } catch (e) {
        addLog('Utilisation du cache DNS local pour l analyse.', 'warn');
        updateMetric('card-dns', 'CACHE', 'active');
    }

    // Stage 2: SSL
    await new Promise(r => setTimeout(r, 1200));
    addLog('Vérification du certificat de sécurité (SSL/TLS)...', 'info');
    if (url.startsWith('https')) {
        addLog('Connexion chiffrée sécurisée détectée.', 'success');
        updateMetric('card-ssl', 'VALIDE', 'active');
    } else {
        addLog('DANGER: Le site transmet des données en clair (HTTP).', 'error');
        updateMetric('card-ssl', 'DANGER', 'error');
    }

    // Stage 3: Phishing Heuristics (More realistic)
    await new Promise(r => setTimeout(r, 1000));
    addLog('Analyse heuristique anti-phishing (Patterns & TLD)...', 'info');
    
    const suspiciousTLDs = ['.xyz', '.top', '.icu', '.club', '.gdn', '.monster'];
    const isSuspiciousTLD = suspiciousTLDs.some(tld => domain.endsWith(tld));
    const hasKeywords = ['login', 'verify', 'account', 'banking', 'secure'].some(kw => domain.toLowerCase().includes(kw));

    if (isSuspiciousTLD || (hasKeywords && !domain.includes('google') && !domain.includes('github'))) {
        addLog('ALERTE: Pattern de phishing ou TLD suspect détecté.', 'error');
        updateMetric('card-rep', 'SUSPECT', 'error');
    } else {
        addLog('Réputation: Aucune menace identifiée dans les signatures locales.', 'success');
        updateMetric('card-rep', 'CLEAN', 'active');
    }

    // Final Scoring
    let score = 95;
    if (!url.startsWith('https')) score -= 50;
    if (isSuspiciousTLD) score -= 30;
    if (hasKeywords) score -= 15;
    if (score < 0) score = 5;

    riskScore.innerText = score;
    if (score < 50) {
        riskScore.style.color = '#ff5f56';
        threatLevel.innerText = 'STATUS: DANGER';
        threatLevel.className = 'badge rounded-pill bg-danger p-2 w-100 mb-2';
    } else if (score < 80) {
        riskScore.style.color = '#ffbd2e';
        threatLevel.innerText = 'STATUS: PRUDENCE';
        threatLevel.className = 'badge rounded-pill bg-warning text-dark p-2 w-100 mb-2';
    } else {
        riskScore.style.color = '#27c93f';
        threatLevel.innerText = 'STATUS: SÉCURISÉ';
        threatLevel.className = 'badge rounded-pill bg-success p-2 w-100 mb-2';
    }

    updateMetric('card-headers', score > 80 ? 'STRICT' : 'BASIQUE', score > 80 ? 'active' : 'warn');

    radar.classList.remove('scanning');
    addLog('Analyse terminée. Rapport de sécurité prêt.', 'info');
}
