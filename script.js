// ================= STATE MANAGEMENT ARCHITECTURE =================
let linksDatabase = JSON.parse(localStorage.getItem('links_db')) || [];
let activeContextLinkId = null; 
let databaseSortDirection = 'desc'; // 'desc' | 'asc'
let databaseFilterMode = 'all';     // 'all' | 'popular'

// Flag Emojis Array for dynamic aesthetic generation
const structuralFlags = ['🌐', '⚡', '🛸', '💎', '🚀', '🔥', '🎨', '🧠', '🌌', '🍀'];

// ================= DOM SELECTORS HUB =================
const DOM = {
    // Views
    pageHome: document.getElementById('page-home'),
    pageListing: document.getElementById('page-listing'),
    
    // Header Indicators
    statActive: document.getElementById('stat-active'),
    statViews: document.getElementById('stat-views'),
    
    // Forms
    urlInput: document.getElementById('url-input'),
    aliasInput: document.getElementById('alias-input'),
    urlError: document.getElementById('url-error'),
    createBtn: document.getElementById('create-btn'),
    
    // Receipt Panel
    receiptEmpty: document.getElementById('receipt-empty'),
    receiptContent: document.getElementById('receipt-content'),
    genShort: document.getElementById('gen-short'),
    genOrig: document.getElementById('gen-orig'),
    genCode: document.getElementById('gen-code'),
    genTime: document.getElementById('gen-time'),
    copyIconBtn: document.getElementById('copy-icon-btn'),
    resetReceiptBtn: document.getElementById('reset-receipt-btn'),
    visitGenBtn: document.getElementById('visit-gen-btn'),
    
    // Search Inputs
    homeSearchInput: document.getElementById('home-search-input'),
    homeSearchClear: document.getElementById('home-search-clear'),
    homeSearchGo: document.getElementById('home-search-go'),
    dbSearchInput: document.getElementById('db-search-input'),
    dbSearchClear: document.getElementById('db-search-clear'),
    
    // Lists & Database Elements
    historyListTarget: document.getElementById('history-list-target'),
    dbListTarget: document.getElementById('db-list-target'),
    indexCountBadge: document.getElementById('index-count-badge'),
    viewAllLinksBtn: document.getElementById('view-all-links-btn'),
    backToHomeBtn: document.getElementById('back-to-home-btn'),
    dbSortToggleBtn: document.getElementById('db-sort-toggle-btn'),
    filterChipsContainer: document.getElementById('filter-chips-container'),
    
    // Global Layers
    actionsContextMenu: document.getElementById('actions-context-menu'),
    globalToastNotifier: document.getElementById('global-toast-notifier'),
    
    // Dynamic Scene Layers
    snowFgLayer: document.getElementById('snow-fg-layer'),
    bokehLayer: document.getElementById('bokeh-layer')
};

// ================= INITIALIZATION CORE =================
document.addEventListener('DOMContentLoaded', () => {
    initAmbientEffects();
    updateDashboardMetrics();
    renderHomeHistoryList();
    setupEventHandlers();
});

// ================= AMBIENT GRAPHICS GENERATOR =================
function initAmbientEffects() {
    // Generate Snowflakes
    for (let i = 0; i < 35; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.width = flake.style.height = `${Math.random() * 5 + 3}px`;
        flake.style.animationDelay = `${Math.random() * 8}s`;
        flake.style.animationDuration = `${Math.random() * 12 + 8}s`;
        DOM.snowFgLayer.appendChild(flake);
    }

    // Generate Background Bokeh Orbs
    for (let i = 0; i < 8; i++) {
        const orb = document.createElement('div');
        orb.className = 'bokeh';
        orb.style.left = `${Math.random() * 90}%`;
        orb.style.top = `${Math.random() * 80 + 10}%`;
        const size = Math.random() * 60 + 40;
        orb.style.width = orb.style.height = `${size}px`;
        orb.style.background = `rgba(47, 216, 255, ${Math.random() * 0.08 + 0.04})`;
        orb.style.animationDelay = `${Math.random() * 5}s`;
        DOM.bokehLayer.appendChild(orb);
    }
}

// ================= ANALYTICS & REPOSITORY PERSISTENCE =================
function saveDatabase() {
    localStorage.setItem('links_db', JSON.stringify(linksDatabase));
    updateDashboardMetrics();
}

function updateDashboardMetrics() {
    DOM.statActive.textContent = linksDatabase.length;
    const totalClicks = linksDatabase.reduce((acc, curr) => acc + curr.clicks, 0);
    DOM.statViews.textContent = totalClicks;
}

// ================= UTILITIES & CONTROLS =================
function showToast(message) {
    DOM.globalToastNotifier.textContent = message;
    DOM.globalToastNotifier.classList.add('show');
    setTimeout(() => DOM.globalToastNotifier.classList.remove('show'), 2500);
}

function validateUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

function generateShortcode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ================= DATA TRANSFORMATION RENDERERS =================
function createLinkCardElement(link) {
    const card = document.createElement('div');
    card.className = 'link-card';
    card.dataset.id = link.id;
    
    const formattedTime = new Date(link.timestamp).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    card.innerHTML = `
        <div class="row-icon">
            <span class="flag-emoji">${link.emoji || '🌐'}</span>
        </div>
        <div class="cell-text">
            <div class="short-code">/${link.shortCode}</div>
            <span class="orig-url" title="${link.originalUrl}">${link.originalUrl}</span>
            <div class="meta-row">
                <div class="meta-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ${formattedTime}
                </div>
            </div>
        </div>
        <div class="clicks-block">
            <span class="num">${link.clicks}</span>
            <span class="lbl">Clicks</span>
        </div>
        <button class="cell-menu" title="Actions">•••</button>
    `;

    // Internal context trigger handler
    card.querySelector('.cell-menu').addEventListener('click', (e) => {
        e.stopPropagation();
        openContextMenu(e, link.id);
    });

    return card;
}

function renderHomeHistoryList(searchQuery = '') {
    DOM.historyListTarget.innerHTML = '';
    
    let filtered = [...linksDatabase];
    if (searchQuery) {
        filtered = filtered.filter(l => 
            l.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Home view restricted to top 4 latest records
    const recentSubset = filtered.sort((a,b) => b.timestamp - a.timestamp).slice(0, 4);

    if (recentSubset.length === 0) {
        DOM.historyListTarget.innerHTML = `<div class="empty-state">${searchQuery ? 'No match found.' : 'No links tracked yet.'}</div>`;
        return;
    }

    recentSubset.forEach(link => {
        DOM.historyListTarget.appendChild(createLinkCardElement(link));
    });
}

function renderDatabaseView() {
    DOM.dbListTarget.innerHTML = '';
    
    let result = [...linksDatabase];
    
    // Apply search query filtering
    const searchVal = DOM.dbSearchInput.value.trim().toLowerCase();
    if (searchVal) {
        result = result.filter(l => 
            l.shortCode.toLowerCase().includes(searchVal) ||
            l.originalUrl.toLowerCase().includes(searchVal)
        );
    }

    // Apply categorical filters
    if (databaseFilterMode === 'popular') {
        result = result.filter(l => l.clicks > 10);
    }

    // Apply sorting logic routines
    if (databaseSortDirection === 'desc') {
        result.sort((a,b) => b.timestamp - a.timestamp);
        DOM.dbSortToggleBtn.querySelector('span').textContent = "Sorted By: Newest";
    } else {
        result.sort((a,b) => a.timestamp - b.timestamp);
        DOM.dbSortToggleBtn.querySelector('span').textContent = "Sorted By: Oldest";
    }

    DOM.indexCountBadge.textContent = `${result.length} record${result.length !== 1 ? 's' : ''} listed`;

    if (result.length === 0) {
        DOM.dbListTarget.innerHTML = `
            <div class="listing-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                No repository connections matches found.
            </div>`;
        return;
    }

    result.forEach(link => {
        DOM.dbListTarget.appendChild(createLinkCardElement(link));
    });
}

// ================= CONTEXT MENU MANAGEMENT =================
function openContextMenu(e, id) {
    activeContextLinkId = id;
    
    // Reset structural state selectors activation marks
    document.querySelectorAll('.cell-menu').forEach(m => m.classList.remove('menu-active'));
    e.target.classList.add('menu-active');

    DOM.actionsContextMenu.classList.add('open');
    
    // Advanced dimensional placement positioning logic
    const menuWidth = 180;
    const menuHeight = 160;
    let targetLeft = e.clientX + window.scrollX;
    let targetTop = e.clientY + window.scrollY;

    if (targetLeft + menuWidth > window.innerWidth) {
        targetLeft = window.innerWidth - menuWidth - 15;
    }
    if (targetTop + menuHeight > window.innerHeight) {
        targetTop = window.innerHeight - menuHeight - 15;
    }

    DOM.actionsContextMenu.style.left = `${targetLeft}px`;
    DOM.actionsContextMenu.style.top = `${targetTop}px`;
}

function closeContextMenu() {
    DOM.actionsContextMenu.classList.remove('open');
    document.querySelectorAll('.cell-menu').forEach(m => m.classList.remove('menu-active'));
    activeContextLinkId = null;
}

// ================= CONTROLLER INTERACTION ACTIONS =================
function handleCreateLink() {
    let targetUrl = DOM.urlInput.value.trim();
    let alias = DOM.aliasInput.value.trim().replace(/[^a-zA-Z0-9-_]/g, '');

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && targetUrl.length > 0) {
        targetUrl = 'https://' + targetUrl;
    }

    if (!validateUrl(targetUrl)) {
        DOM.urlError.classList.add('show');
        return;
    } else {
        DOM.urlError.classList.remove('show');
    }

    let code = alias || generateShortcode();
    
    // Structural duplication protection collision check
    const collisionExists = linksDatabase.some(l => l.shortCode.toLowerCase() === code.toLowerCase());
    if (collisionExists && alias) {
        showToast("Shortcode custom alias already taken!");
        return;
    } else if (collisionExists) {
        code = code + generateShortcode(2);
    }

    const newEntry = {
        id: 'lnk_' + Date.now() + Math.random().toString(36).substr(2, 4),
        originalUrl: targetUrl,
        shortCode: code,
        clicks: 0,
        timestamp: Date.now(),
        emoji: structuralFlags[Math.floor(Math.random() * structuralFlags.length)]
    };

    linksDatabase.unshift(newEntry);
    saveDatabase();

    // Render receipt elements view state
    DOM.genShort.textContent = `${window.location.origin}/${newEntry.shortCode}`;
    DOM.genOrig.textContent = newEntry.originalUrl;
    DOM.genCode.textContent = newEntry.shortCode;
    DOM.genTime.textContent = new Date(newEntry.timestamp).toLocaleString();
    
    DOM.receiptEmpty.style.display = 'none';
    DOM.receiptContent.style.display = 'block';

    // Clear operational inputs fields
    DOM.urlInput.value = '';
    DOM.aliasInput.value = '';
    
    renderHomeHistoryList();
    showToast("Link shortcode tracked successfully.");
    
    // Highlight the row entry effect if visible
    setTimeout(() => {
        const matchingCard = DOM.historyListTarget.querySelector(`[data-id="${newEntry.id}"]`);
        if (matchingCard) matchingCard.classList.add('flash');
    }, 100);
}

// ================= COMPONENT EVENT REGISTRATION =================
function setupEventHandlers() {
    // Structural creation event triggers
    DOM.createBtn.addEventListener('click', handleCreateLink);
    DOM.urlInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleCreateLink(); });

    // Receipt Action Control Elements handlers
    DOM.copyIconBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(DOM.genShort.textContent);
        showToast("Copied to clipboard!");
    });
    DOM.resetReceiptBtn.addEventListener('click', () => {
        DOM.receiptContent.style.display = 'none';
        DOM.receiptEmpty.style.display = 'block';
    });
    DOM.visitGenBtn.addEventListener('click', () => {
        const target = DOM.genOrig.textContent;
        window.open(target, '_blank', 'noopener,noreferrer');
    });

    // Home Section Search engine elements behaviors
    DOM.homeSearchInput.addEventListener('input', () => {
        const val = DOM.homeSearchInput.value;
        DOM.homeSearchClear.classList.toggle('show', val.length > 0);
        renderHomeHistoryList(val);
    });
    DOM.homeSearchClear.addEventListener('click', () => {
        DOM.homeSearchInput.value = '';
        DOM.homeSearchClear.classList.remove('show');
        renderHomeHistoryList();
    });

    // Global UI Views Navigation routing transitions
    DOM.viewAllLinksBtn.addEventListener('click', () => {
        DOM.pageHome.classList.add('page-hidden');
        DOM.pageListing.classList.remove('page-hidden');
        renderDatabaseView();
    });
    DOM.backToHomeBtn.addEventListener('click', () => {
        DOM.pageListing.classList.add('page-hidden');
        DOM.pageHome.classList.remove('page-hidden');
        renderHomeHistoryList();
    });

    // Repository Listing database management interactions logic
    DOM.dbSearchInput.addEventListener('input', () => {
        DOM.dbSearchClear.classList.toggle('show', DOM.dbSearchInput.value.length > 0);
        renderDatabaseView();
    });
    DOM.dbSearchClear.addEventListener('click', () => {
        DOM.dbSearchInput.value = '';
        DOM.dbSearchClear.classList.remove('show');
        renderDatabaseView();
    });

    // Sort modification triggers
    DOM.dbSortToggleBtn.addEventListener('click', () => {
        databaseSortDirection = (databaseSortDirection === 'desc') ? 'asc' : 'desc';
        DOM.dbSortToggleBtn.classList.toggle('open', databaseSortDirection === 'asc');
        renderDatabaseView();
    });

    // Filter processing selections
    DOM.filterChipsContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-chip')) return;
        DOM.filterChipsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        databaseFilterMode = e.target.dataset.filter;
        renderDatabaseView();
    });

    // Context Actions Event Router Execution handlers
    DOM.ctxCopyBtn.addEventListener('click', () => {
        const item = linksDatabase.find(l => l.id === activeContextLinkId);
        if (item) {
            navigator.clipboard.writeText(`${window.location.origin}/${item.shortCode}`);
            showToast("Copied shortcode endpoint!");
        }
        closeContextMenu();
    });

    DOM.ctxVisitBtn.addEventListener('click', () => {
        const item = linksDatabase.find(l => l.id === activeContextLinkId);
        if (item) {
            window.open(item.originalUrl, '_blank', 'noopener,noreferrer');
        }
        closeContextMenu();
    });

    DOM.ctxSimulateClick.addEventListener('click', () => {
        const item = linksDatabase.find(l => l.id === activeContextLinkId);
        if (item) {
            item.clicks++;
            saveDatabase();
            renderHomeHistoryList();
            renderDatabaseView();
            showToast("Simulated target landing impression (+1)");
        }
        closeContextMenu();
    });

    DOM.ctxDeleteBtn.addEventListener('click', () => {
        linksDatabase = linksDatabase.filter(l => l.id !== activeContextLinkId);
        saveDatabase();
        renderHomeHistoryList();
        renderDatabaseView();
        showToast("Record scrubbed from index.");
        closeContextMenu();
    });

    // Outer-perimeter viewport window event dismissals rules
    window.addEventListener('click', () => closeContextMenu());
    window.addEventListener('scroll', () => { if(activeContextLinkId) closeContextMenu(); });
}
