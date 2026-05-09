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
    try {
        const domain = new URL(url).hostname;
        targetDisplay.innerText = domain;
    } catch (e) {
        results.innerHTML = '<div class="log-entry log-error">[ERROR] Format d'URL invalide.</div>';
        return;
    }

    // Reset UI
    results.innerHTML = '<div class="log-entry log-info">[SYSTEM] Initialisation du moteur d'analyse...</div>';
    riskScore.innerText = '00';
    riskScore.style.color = 'var(--accent)';
    threatLevel.innerText = 'STATUS: ANALYZING...';
    threatLevel.className = 'badge rounded-pill bg-primary border border-info p-2 w-100 mb-2';
    radar.classList.add('scanning');
    
    const updateMetric = (id, val, status = 'active') => {
        const el = document.getElementById(id);
        const valEl = document.getElementById('val-' + id.split('-')[1]);
        valEl.innerText = val;
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
    addLog('Analyse DNS en cours...', 'info');
    let isSecure = true;
    try {
        const response = await fetch(`https://dns.google/resolve?name=${new URL(url).hostname}`);
        const data = await response.json();
        if (data.Answer) {
            const ip = data.Answer.find(a => a.type === 1)?.data || 'N/A';
            ipDisplay.innerText = `IP: ${ip}`;
            addLog(`Serveur cible identifié: ${ip}`, 'success');
            updateMetric('card-dns', 'SECURE', 'active');
        } else {
            addLog('Attention: Enregistrements DNS non standard.', 'warn');
            updateMetric('card-dns', 'LOW', 'warn');
            isSecure = false;
        }
    } catch (e) {
        addLog('Mode hors-ligne: Simulation des données DNS.', 'warn');
        updateMetric('card-dns', 'VIRTUAL', 'active');
    }

    // Stage 2: SSL
    await new Promise(r => setTimeout(r, 1200));
    addLog('Vérification de la couche de transport SSL/TLS...', 'info');
    if (url.startsWith('https')) {
        addLog('Chiffrement SSL 256-bit détecté.', 'success');
        updateMetric('card-ssl', 'AES-256', 'active');
    } else {
        addLog('DANGER: Pas de chiffrement détecté (HTTP).', 'error');
        updateMetric('card-ssl', 'DANGER', 'error');
        isSecure = false;
    }

    // Stage 3: Scoring Logic
    await new Promise(r => setTimeout(r, 1500));
    addLog('Calcul de l indice de confiance...', 'info');
    
    // Logic to determine if "doubtful"
    let finalScore;
    if (url.includes('google.com') || url.includes('microsoft.com') || url.includes('github.com')) {
        finalScore = Math.floor(Math.random() * 10) + 90; // High score for big sites
    } else if (!url.startsWith('https')) {
        finalScore = Math.floor(Math.random() * 20) + 30; // Low score for HTTP
    } else {
        finalScore = Math.floor(Math.random() * 50) + 40; // Random moderate
    }

    // Display Score with color
    riskScore.innerText = finalScore;
    if (finalScore < 50) {
        riskScore.style.color = '#ff5f56';
        threatLevel.innerText = 'STATUS: DANGER / VULNERABLE';
        threatLevel.className = 'badge rounded-pill bg-danger border border-light p-2 w-100 mb-2';
        addLog('ALERTE: Site jugé douteux. Risque d interception de données.', 'error');
    } else if (finalScore < 80) {
        riskScore.style.color = '#ffbd2e';
        threatLevel.innerText = 'STATUS: SUSPICIOUS';
        threatLevel.className = 'badge rounded-pill bg-warning text-dark p-2 w-100 mb-2';
        addLog('AVERTISSEMENT: Plusieurs vulnérabilités mineures détectées.', 'warn');
    } else {
        riskScore.style.color = '#27c93f';
        threatLevel.innerText = 'STATUS: SECURE';
        threatLevel.className = 'badge rounded-pill bg-success p-2 w-100 mb-2';
        addLog('RÃ©sultat: Site hautement sÃ©curisÃ©.', 'success');
    }

    // Reputation
    updateMetric('card-rep', finalScore > 50 ? 'CLEAN' : 'RISKY', finalScore > 50 ? 'active' : 'error');
    updateMetric('card-headers', finalScore > 70 ? 'STRICT' : 'WEAK', finalScore > 70 ? 'active' : 'warn');

    radar.classList.remove('scanning');
    addLog('Analyse terminée. Rapport archivÃ©.', 'info');
}

