/* ---------------- Background scene ---------------- */
const bokehLayer = document.getElementById('bokeh-layer');
const bokehColors = ['rgba(120,170,255,0.32)','rgba(85,199,255,0.32)','rgba(255,255,255,0.28)','rgba(180,220,255,0.3)'];
for(let i=0;i<7;i++){
const b = document.createElement('div');
const size = 40 + Math.random()*90;
b.className = 'bokeh';
b.style.width = size+'px'; b.style.height = size+'px';
b.style.left = Math.random()*100+'%'; b.style.top = (10+Math.random()*70)+'%';
b.style.background = bokehColors[i % bokehColors.length];
b.style.animationDelay = (Math.random()*5)+'s';
b.style.animationDuration = (7+Math.random()*5)+'s';
bokehLayer.appendChild(b);
}

const snowLayer = document.getElementById('petal-layer');
for(let i=0;i<130;i++){
const s = document.createElement('div');
const size = 2 + Math.random()*4;
s.className = 'snowflake';
s.style.width = size+'px'; s.style.height = size+'px';
s.style.left = Math.random()*100+'%';
s.style.opacity = 0.35 + Math.random()*0.5;
s.style.animationDuration = (9+Math.random()*13)+'s';
s.style.animationDelay = (Math.random()*14)+'s';
snowLayer.appendChild(s);
}

const snowFgLayer = document.getElementById('snow-fg-layer');
for(let i=0;i<90;i++){
const s = document.createElement('div');
const size = 5 + Math.random()*8;
s.className = 'snowflake';
s.style.width = size+'px'; s.style.height = size+'px';
s.style.left = Math.random()*100+'%';
s.style.opacity = 0.6 + Math.random()*0.4;
s.style.animationDuration = (5+Math.random()*7)+'s';
s.style.animationDelay = (Math.random()*10)+'s';
snowFgLayer.appendChild(s);
}

/* ---------------- State ---------------- */
const BASE = 'https://linktrk.in/';

const FLAG_EMOJIS = ['🇺🇸','🇬🇧','🇮🇳','🇫🇷','🇩🇪','🇯🇵','🇧🇷','🇦🇺','🇨🇦','🇮🇹','🇪🇸','🇰🇷','🇲🇽','🇿🇦','🇦🇪','🇸🇬','🇳🇱','🇸🇪','🇨🇭','🇨🇳'];

function flagForCode(code){
let hash = 0;
for(let i=0;i<code.length;i++){ hash = (hash * 31 + code.charCodeAt(i)) % FLAG_EMOJIS.length; }
return FLAG_EMOJIS[Math.abs(hash) % FLAG_EMOJIS.length];
}

function truncateUrl(url, maxLen){
maxLen = maxLen || 100;
return url.length > maxLen ? url.slice(0, maxLen - 1) + '…' : url;
}

let links = [
{ code:'cb83pj', url:'https://example.com/vacation-deals', clicks:2541, createdAt: new Date('2026-07-18T16:27:00') },
{ code:'x91anp', url:'https://example.com/new-app', clicks:1892, createdAt: new Date('2026-07-18T14:14:00') },
{ code:'ebk204', url:'https://example.com/ebook', clicks:1203, createdAt: new Date('2026-07-17T11:48:00') }
];

let listingSort = 'newest';

/* ---------------- Helpers ---------------- */
function formatDateTime(d){
return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) +
' · ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}

function showToast(msg){
const toast = document.getElementById('toast');
toast.textContent = msg;
toast.classList.add('show');
setTimeout(()=> toast.classList.remove('show'), 2200);
}

function isValidUrl(value){
try{ new URL(value); return true; } catch(e){ return false; }
}

function randomCode(len=6){
const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
let out = '';
for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
return out;
}

function updateStats(){
const totalViews = links.reduce((sum, l) => sum + l.clicks, 0);
document.getElementById('stat-active').textContent = links.length.toLocaleString();
document.getElementById('stat-views').textContent = totalViews.toLocaleString();
}

/* ---------------- Portal dropdown menu ---------------- */
const portalMenu = document.getElementById('portal-menu');
let openMenuBtn = null;

function closePortalMenu(){
portalMenu.classList.remove('open');
portalMenu.innerHTML = '';
if(openMenuBtn) openMenuBtn.classList.remove('menu-active');
openMenuBtn = null;
sortBtn.classList.remove('open');
}

function openPortalMenu(btn, items){
// toggle off if same button clicked again
if(openMenuBtn === btn){ closePortalMenu(); return; }
closePortalMenu();
openMenuBtn = btn;
btn.classList.add('menu-active');
if(btn === sortBtn) sortBtn.classList.add('open');

portalMenu.innerHTML = '';
items.forEach(item => {
const el = document.createElement('button');
el.className = 'menu-item' + (item.danger ? ' delete-item' : '') + (item.selected ? ' selected' : '');
el.innerHTML = (item.icon || '') + '<span>' + item.label + '</span>' + (item.selected ? '<span class="check">' + ICONS.check + '</span>' : '');
el.addEventListener('click', (e) => {
e.stopPropagation();
closePortalMenu();
item.onClick();
});
portalMenu.appendChild(el);
});

// position near button, flip if it would overflow viewport
const rect = btn.getBoundingClientRect();
portalMenu.classList.add('open');
const menuRect = portalMenu.getBoundingClientRect();
let top = rect.bottom + 6;
let left = rect.right - menuRect.width;
if(left < 8) left = 8;
if(top + menuRect.height > window.innerHeight - 8){
top = rect.top - menuRect.height - 6;
}
portalMenu.style.top = top + 'px';
portalMenu.style.left = left + 'px';
}

document.addEventListener('click', (e) => {
if(!e.target.closest('.cell-menu') && !e.target.closest('.sort-btn') && !e.target.closest('.menu-dropdown')){
closePortalMenu();
}
});
window.addEventListener('resize', closePortalMenu);
window.addEventListener('scroll', closePortalMenu, true);

/* ---------------- Shared card builder (used by both pages) ---------------- */
function buildLinkCardHTML(link, idx){
const flag = flagForCode(link.code);
return `
<div class="row-icon"><span class="flag-emoji">${flag}</span></div>
<div class="cell-text">
<div class="short-code">${link.code}</div>
<span class="orig-url">${truncateUrl(link.url)}</span>
<div class="meta-row">
<span class="status-badge"><span class="pulse-dot"></span>ACTIVE</span>
<span class="meta-time">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
${formatDateTime(link.createdAt)}
</span>
</div>
</div>
<div class="clicks-block">
<span class="num">${link.clicks.toLocaleString()}</span>
<span class="lbl">Clicks</span>
</div>
<button class="cell-menu" data-code="${link.code}" title="More options">⋮</button>
`;
}

const ICONS = {
view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
visit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>',
trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"/></svg>',
check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
};

function deleteLink(code){
links = links.filter(l => l.code !== code);
renderHome();
renderListing();
showToast('Link deleted');
}

/* ---------------- Home page render ---------------- */
const tableBody = document.getElementById('table-body');
const footerCount = document.getElementById('footer-count');

function renderHome(){
tableBody.innerHTML = '';
const preview = links.slice(0, 3);
if(preview.length === 0){
tableBody.innerHTML = `<div class="empty-state">No links yet — create your first tracking link above.</div>`;
} else {
preview.forEach((link, idx) => {
const row = document.createElement('div');
row.className = 'link-card';
row.dataset.code = link.code;
row.innerHTML = buildLinkCardHTML(link, idx);
tableBody.appendChild(row);
});
}
footerCount.textContent = `${links.length} link${links.length === 1 ? '' : 's'} created`;
updateStats();
}

tableBody.addEventListener('click', (e) => {
const btn = e.target.closest('.cell-menu');
if(!btn) return;
e.stopPropagation();
const code = btn.dataset.code;
openPortalMenu(btn, [
{ label:'View Details', icon:ICONS.view, onClick:() => goListing({ highlight: code }) },
{ label:'Delete', icon:ICONS.trash, danger:true, onClick:() => deleteLink(code) }
]);
});

/* ---------------- Listing page render ---------------- */
const listingBody = document.getElementById('listing-body');
const allLinksChip = document.getElementById('all-links-chip');
const listingSearchInput = document.getElementById('listing-search-input');
const listingSearchClear = document.getElementById('listing-search-clear');

function getFilteredSortedLinks(){
let result = links.slice();
const term = listingSearchInput.value.trim().toLowerCase();
if(term){
result = result.filter(l => l.code.toLowerCase().includes(term) || l.url.toLowerCase().includes(term));
}
switch(listingSort){
case 'oldest': result.sort((a,b) => a.createdAt - b.createdAt); break;
case 'clicks-desc': result.sort((a,b) => b.clicks - a.clicks); break;
case 'clicks-asc': result.sort((a,b) => a.clicks - b.clicks); break;
default: result.sort((a,b) => b.createdAt - a.createdAt);
}
return result;
}

let pendingHighlight = null;

function renderListing(){
const filtered = getFilteredSortedLinks();
allLinksChip.textContent = `All Links · ${filtered.length}`;
listingSearchClear.classList.toggle('show', listingSearchInput.value.length > 0);

listingBody.innerHTML = '';
if(filtered.length === 0){
listingBody.innerHTML = `
<div class="listing-empty">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
No links match your search or filters.
</div>`;
return;
}

filtered.forEach((link, idx) => {
const card = document.createElement('div');
card.className = 'link-card';
card.dataset.code = link.code;
card.innerHTML = buildLinkCardHTML(link, idx);
listingBody.appendChild(card);
});

if(pendingHighlight){
const target = listingBody.querySelector(`.link-card[data-code="${pendingHighlight}"]`);
if(target){
target.classList.add('flash');
setTimeout(() => target.scrollIntoView({behavior:'smooth', block:'center'}), 50);
}
pendingHighlight = null;
}
}

listingBody.addEventListener('click', (e) => {
const btn = e.target.closest('.cell-menu');
if(!btn) return;
e.stopPropagation();
const code = btn.dataset.code;
const link = links.find(l => l.code === code);
if(!link) return;
openPortalMenu(btn, [
{ label:'Copy Link', icon:ICONS.copy, onClick:() => {
navigator.clipboard.writeText(BASE + link.code).then(() => showToast('Copied to clipboard!'));
} },
{ label:'Visit Link', icon:ICONS.visit, onClick:() => window.open(link.url, '_blank') },
{ label:'Delete', icon:ICONS.trash, danger:true, onClick:() => deleteLink(code) }
]);
});

listingSearchInput.addEventListener('input', renderListing);
listingSearchClear.addEventListener('click', () => {
listingSearchInput.value = '';
renderListing();
listingSearchInput.focus();
});

/* ---------------- Themed sort dropdown (matches app style, replaces native <select>) ---------------- */
const sortBtn = document.getElementById('sort-btn');
const sortBtnLabel = document.getElementById('sort-btn-label');
const SORT_OPTIONS = [
{ value:'newest', label:'Newest First' },
{ value:'oldest', label:'Oldest First' },
{ value:'clicks-desc', label:'Most Clicks' },
{ value:'clicks-asc', label:'Least Clicks' }
];

sortBtn.addEventListener('click', (e) => {
e.stopPropagation();
sortBtn.classList.add('open');
openPortalMenu(sortBtn, SORT_OPTIONS.map(opt => ({
label: opt.label,
selected: opt.value === listingSort,
onClick: () => {
listingSort = opt.value;
sortBtnLabel.textContent = opt.label;
renderListing();
}
})));
});

/* ---------------- Navigation ---------------- */
const pageHome = document.getElementById('page-home');
const pageListing = document.getElementById('page-listing');

function goHome(){
closePortalMenu();
pageListing.classList.add('page-hidden');
pageHome.classList.remove('page-hidden');
window.scrollTo({ top:0, behavior:'smooth' });
}

function goListing(opts){
opts = opts || {};
closePortalMenu();
if(typeof opts.search === 'string'){
listingSearchInput.value = opts.search;
}
pendingHighlight = opts.highlight || null;
renderListing();
pageHome.classList.add('page-hidden');
pageListing.classList.remove('page-hidden');
window.scrollTo({ top:0, behavior:'smooth' });
}

document.getElementById('view-all-btn').addEventListener('click', () => goListing());
document.getElementById('back-home-btn').addEventListener('click', goHome);
document.getElementById('brand-logo-home').addEventListener('click', goHome);
document.getElementById('brand-logo-listing').addEventListener('click', goHome);

/* ---------------- Home search bar behavior ---------------- */
const homeSearchInput = document.getElementById('home-search-input');
const homeSearchClear = document.getElementById('home-search-clear');
const homeSearchGo = document.getElementById('home-search-go');

homeSearchInput.addEventListener('input', () => {
homeSearchClear.classList.toggle('show', homeSearchInput.value.length > 0);
});
homeSearchInput.addEventListener('keydown', (e) => {
if(e.key === 'Enter' && homeSearchInput.value.trim()){
goListing({ search: homeSearchInput.value.trim() });
}
});
homeSearchGo.addEventListener('click', () => {
if(homeSearchInput.value.trim()) goListing({ search: homeSearchInput.value.trim() });
});
homeSearchClear.addEventListener('click', () => {
homeSearchInput.value = '';
homeSearchClear.classList.remove('show');
homeSearchInput.focus();
});

/* ---------------- Create link flow ---------------- */
const urlInput = document.getElementById('url-input');
const aliasInput = document.getElementById('alias-input');
const urlError = document.getElementById('url-error');
const createBtn = document.getElementById('create-btn');
const receiptEmpty = document.getElementById('receipt-empty');
const receiptContent = document.getElementById('receipt-content');
const genShort = document.getElementById('gen-short');
const genOrig = document.getElementById('gen-orig');
const genCode = document.getElementById('gen-code');
const genTime = document.getElementById('gen-time');

createBtn.addEventListener('click', () => {
const url = urlInput.value.trim();
const alias = aliasInput.value.trim();

if(!isValidUrl(url)){
urlError.classList.add('show');
return;
}
urlError.classList.remove('show');

const code = alias || randomCode();
const now = new Date();

links.unshift({ code, url, clicks:0, createdAt: now });
renderHome();
renderListing();

genShort.textContent = BASE + code;
genOrig.textContent = url;
genCode.textContent = code;
genTime.textContent = formatDateTime(now);

receiptEmpty.style.display = 'none';
receiptContent.style.display = 'block';

urlInput.value = '';
aliasInput.value = '';
showToast('Link created!');
});

function copyLink(){
const text = genShort.textContent;
if(!text) return;
navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
}
document.getElementById('copy-btn').addEventListener('click', copyLink);
document.getElementById('copy-icon-btn').addEventListener('click', copyLink);

document.getElementById('open-btn').addEventListener('click', () => {
const url = genOrig.textContent;
if(url) window.open(url, '_blank');
});

/* ---------------- Init ---------------- */
renderHome();
renderListing();
