const today = new Date();
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shiftDate = (date, amount) => {
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  shifted.setDate(shifted.getDate() + amount);
  return shifted;
};
const mondayOf = (date) => shiftDate(date, (date.getDay() + 6) % 7 * -1);
const makeId = () => window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/><path d="M2 10h20"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  meals: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M16 3v18M16 3c3 2 4 5 4 8h-4"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  reward: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  replay: '<path d="M3 10a9 9 0 1 1 2.5 8M3 4v6h6"/>',
  pencil: '<path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  'arrow-left': '<path d="m14 18-6-6 6-6M8 12h12"/>',
  'arrow-right': '<path d="m10 18 6-6-6-6M16 12H4"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  leaf: '<path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 8-8 8-16Z"/><path d="M4 21c2-5 5-8 11-11"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/>',
  heart: '<path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.8 1.3Z"/>',
};
const iconAliases = { '+': 'plus', '↗': 'arrow-up-right', '✎': 'pencil', '▶': 'play', '✳': 'leaf', '☾': 'moon', '♥': 'heart', '‹': 'arrow-left', '›': 'arrow-right', '×': 'close' };

function iconSvg(name, className = '') {
  const resolvedName = iconAliases[name] || name;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[resolvedName] || ''}</svg>`;
}

function renderStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = iconSvg(element.dataset.icon);
  });
}

const visualModules = { gsap: null };
let homeTaskFilter = 'all';
const activeMemberStorageKey = 'familyboard-active-member';
const legacyActiveMemberStorageKey = 'gatherday-active-member';

let state = null;
let householdName = '';
let stateRevision = 0;
let activeMemberId = sessionStorage.getItem(activeMemberStorageKey) || sessionStorage.getItem(legacyActiveMemberStorageKey) || '';
let saveQueue = Promise.resolve();
let saveEpoch = 0;
let pendingWrites = 0;
let pollingStarted = false;
let currentView = 'home';
let selectedDate = dateKey(today);
let calendarAnchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let activeListId = 'shopping';
let toastTimer;

const root = document.querySelector('#app-view');
const dialog = document.querySelector('#app-dialog');
const dialogBody = document.querySelector('#dialog-body');
const toastElement = document.querySelector('#toast');

function saveActiveMember() {
  sessionStorage.setItem(activeMemberStorageKey, activeMemberId);
  sessionStorage.removeItem(legacyActiveMemberStorageKey);
}

function clearActiveMember() {
  sessionStorage.removeItem(activeMemberStorageKey);
  sessionStorage.removeItem(legacyActiveMemberStorageKey);
}

async function requestApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'The request could not be completed.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function showAuth(configured, name = '', message = '') {
  document.querySelector('.app-shell').hidden = true;
  document.querySelector('.mobile-nav').hidden = true;
  document.querySelector('#auth-screen').hidden = false;
  document.querySelector('#setup-form').hidden = configured;
  document.querySelector('#login-form').hidden = !configured;
  document.querySelector('#auth-title').textContent = configured ? 'Welcome back' : 'Set up your household';
  document.querySelector('#auth-description').textContent = configured
    ? 'Enter your household passphrase to open the shared board.'
    : 'Create a shared board for the people who make your place home.';
  document.querySelector('#auth-household-name').textContent = name;
  document.querySelector('#auth-notice').textContent = message;
  window.FamilyboardArt.mount();
}

function showBoard(payload) {
  state = payload.state;
  stateRevision = payload.revision;
  householdName = payload.household_name;
  if (!state.members.some((member) => member.id === activeMemberId)) {
    activeMemberId = state.members[0]?.id || '';
  }
  saveActiveMember();
  document.querySelector('#auth-screen').hidden = true;
  document.querySelector('.app-shell').hidden = false;
  document.querySelector('.mobile-nav').hidden = false;
  render();
  setSyncStatus('Synced');
  if (!pollingStarted) {
    pollingStarted = true;
    window.setInterval(refreshBoard, 2500);
  }
}

function setSyncStatus(label, offline = false) {
  const syncLabel = document.querySelector('#sync-label');
  const syncDot = document.querySelector('#sync-dot');
  if (syncLabel) syncLabel.textContent = label;
  if (syncDot) syncDot.style.background = offline ? 'var(--coral)' : '';
}

async function bootstrapBoard() {
  try {
    const status = await requestApi('/api/status');
    if (!status.authenticated) {
      showAuth(status.configured, status.household_name);
      return;
    }
    try {
      showBoard(await requestApi('/api/state'));
    } catch (error) {
      if (error.status === 401) showAuth(status.configured, status.household_name);
      else showAuth(status.configured, status.household_name, error.message);
    }
  } catch (error) {
    showAuth(false, '', `Could not connect to the household server: ${error.message}`);
  }
}

async function refreshBoard() {
  if (!state || pendingWrites || dialog.open) return;
  try {
    const payload = await requestApi('/api/state');
    if (pendingWrites || payload.revision <= stateRevision) return;
    showBoard(payload);
  } catch (error) {
    if (error.status === 401) {
      state = null;
      showAuth(true, householdName, 'Your session expired. Enter the passphrase again.');
    } else {
      setSyncStatus('Reconnecting…', true);
    }
  }
}

function saveState() {
  const snapshot = JSON.parse(JSON.stringify(state));
  const requestEpoch = saveEpoch;
  pendingWrites += 1;
  setSyncStatus('Syncing…');
  const operation = saveQueue.then(async () => {
    try {
      if (requestEpoch !== saveEpoch) return;
      try {
        const payload = await requestApi('/api/state', {
          method: 'PUT',
          body: JSON.stringify({ state: snapshot, revision: stateRevision }),
        });
        if (requestEpoch === saveEpoch) stateRevision = payload.revision;
        setSyncStatus('Synced');
      } catch (error) {
        if (error.status === 409 && error.payload.state) {
          saveEpoch += 1;
          state = error.payload.state;
          stateRevision = error.payload.revision;
          householdName = error.payload.household_name;
          render();
          showToast('The board changed on another device. The latest version is loaded.');
          setSyncStatus('Synced');
        } else {
          setSyncStatus('Not synced', true);
          showToast(`Could not sync this change: ${error.message}`);
        }
      }
    } finally {
      pendingWrites = Math.max(0, pendingWrites - 1);
    }
  });
  saveQueue = operation.catch(() => {});
  return saveQueue;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function personFor(id) {
  return state.members.find((member) => member.id === id) ?? state.members[0];
}

function personAvatar(person, extraClass = '') {
  return `<span class="avatar avatar-${escapeHtml(person.tone)} ${extraClass}" title="${escapeHtml(person.name)}">${escapeHtml(person.initials)}</span>`;
}

function friendlyDate(date, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hours, minutes));
}

function showToast(message) {
  toastElement.textContent = message;
  clearTimeout(toastTimer);
  if (visualModules.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    toastElement.classList.remove('visible');
    visualModules.gsap.killTweensOf(toastElement);
    visualModules.gsap.set(toastElement, { autoAlpha: 0, y: 8 });
    visualModules.gsap.timeline()
      .to(toastElement, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power3.out' })
      .to(toastElement, { autoAlpha: 0, y: 8, duration: 0.18, ease: 'power2.in' }, '+=1.55')
      .set(toastElement, { clearProps: 'all' });
    return;
  }
  toastElement.classList.add('visible');
  toastTimer = setTimeout(() => toastElement.classList.remove('visible'), 2300);
}

function setView(view) {
  const allowed = ['home', 'calendar', 'chores', 'lists', 'meals', 'messages', 'rewards', 'people'];
  if (view === 'more') {
    toggleMoreMenu();
    return;
  }
  if (!allowed.includes(view)) return;
  closeMoreMenu(true);
  currentView = view;
  render();
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function toggleMoreMenu() {
  const menu = document.querySelector('#more-menu');
  if (!menu) return;
  if (menu.hidden) {
    menu.hidden = false;
    if (visualModules.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      visualModules.gsap.killTweensOf(menu);
      visualModules.gsap.fromTo(menu, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out', clearProps: 'transform,visibility' });
    }
  } else {
    closeMoreMenu(false);
  }
}

function closeMoreMenu(immediate = false) {
  const menu = document.querySelector('#more-menu');
  if (!menu || menu.hidden) return;
  const gsap = visualModules.gsap;
  if (!immediate && gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.killTweensOf(menu);
    gsap.to(menu, { autoAlpha: 0, y: 8, duration: 0.14, ease: 'power2.in', onComplete: () => { menu.hidden = true; gsap.set(menu, { clearProps: 'all' }); } });
  } else {
    menu.hidden = true;
    gsap?.set(menu, { clearProps: 'all' });
  }
}

function updateChrome() {
  const title = currentView[0].toUpperCase() + currentView.slice(1);
  document.querySelector('#topbar-section').textContent = title;
  document.querySelector('#topbar-date').textContent = friendlyDate(today, { weekday: 'short', month: 'short', day: 'numeric' });
  document.querySelector('#mobile-date').textContent = friendlyDate(today, { month: 'short', day: 'numeric' });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === currentView);
  });
  const todaysEvents = state.events.filter((event) => event.date === dateKey(today)).length;
  const remainingChores = state.tasks.filter((task) => task.date === dateKey(today) && !task.done).length;
  document.querySelector('#event-count').textContent = todaysEvents;
  document.querySelector('#chore-count').textContent = remainingChores;
  document.querySelector('#family-label').textContent = `${state.members.length} people at home`;
  document.querySelector('#sidebar-avatars').innerHTML = state.members.map((person) => personAvatar(person)).join('');
  document.querySelectorAll('.household-name').forEach((element) => { element.textContent = householdName; });
  const viewer = personFor(activeMemberId || state.members[0]?.id);
  const profileButton = document.querySelector('.profile-button');
  profileButton.querySelector('.avatar').className = `avatar avatar-${viewer.tone}`;
  profileButton.querySelector('.avatar').textContent = viewer.initials;
  profileButton.querySelector('.profile-name').textContent = viewer.name;
}

function loadVisualModules() {
  const GSAP_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js';
  import(GSAP_URL).catch(() => null).then((gsapModule) => {
    visualModules.gsap = gsapModule?.gsap || gsapModule?.default?.gsap || null;
    window.FamilyboardArt.setGSAP(visualModules.gsap);
  });
}

function pageHeading(_eyebrow, title, subtitle, action = '') {
  return `<header class="page-heading"><div><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action}</header>`;
}

function addButton(label, action, icon = '+', extra = '') {
  return `<button class="button button-primary ${extra}" type="button" data-action="${action}"><span class="button-icon" aria-hidden="true">${iconSvg(icon)}</span>${label}</button>`;
}

function todayEvents() {
  return state.events.filter((event) => event.date === dateKey(today)).sort((a, b) => a.time.localeCompare(b.time));
}

function renderEvents(events, emptyText = 'Nothing on the calendar yet.', showDate = false) {
  if (!events.length) return `<div class="empty-state">${emptyText}</div>`;
  return `<div class="event-list">${events.map((event) => `<div class="event-row"><time class="event-time">${formatTime(event.time)}${showDate ? `<small>${friendlyDate(dateFromKey(event.date), { month: 'short', day: 'numeric' })}</small>` : ''}</time><span class="event-marker ${escapeHtml(event.tone)}"></span><div class="event-copy"><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.person || 'Everyone')}</small></div></div>`).join('')}</div>`;
}

function renderTasks(tasks, limit = Infinity) {
  const shown = tasks.slice(0, limit);
  if (!shown.length) return '<div class="empty-state">All caught up. Enjoy the breathing room.</div>';
  return `<div class="task-list">${shown.map((task) => {
    const person = personFor(task.assignee);
    return `<div class="task-row ${task.done ? 'is-done' : ''}"><button class="check-button ${task.done ? 'checked' : ''}" type="button" data-action="toggle-task" data-id="${escapeHtml(task.id)}" aria-label="${task.done ? 'Mark incomplete' : 'Complete'} ${escapeHtml(task.title)}">${iconSvg('check')}</button><div class="task-copy"><strong>${escapeHtml(task.title)}</strong><small><i class="person-dot" style="background:var(--${escapeHtml(person.tone)})"></i>${escapeHtml(person.name)}</small></div><span class="task-reward">+${task.points} coins</span></div>`;
  }).join('')}</div>`;
}

function renderShoppingList(list, limit = Infinity) {
  const items = list.items.slice(0, limit);
  if (!items.length) return '<div class="empty-state">This list is clear. Add something when you need it.</div>';
  return `<div class="shopping-list">${items.map((item) => `<div class="shopping-item ${item.done ? 'done' : ''}"><button class="check-button ${item.done ? 'checked' : ''}" type="button" data-action="toggle-item" data-id="${escapeHtml(item.id)}" aria-label="${item.done ? 'Uncheck' : 'Check off'} ${escapeHtml(item.name)}">${iconSvg('check')}</button><span>${escapeHtml(item.name)}</span>${item.quantity ? `<small class="item-quantity">${escapeHtml(item.quantity)}</small>` : ''}<button class="meal-edit" type="button" data-action="delete-item" data-id="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}" title="Remove item">${iconSvg('trash')}</button></div>`).join('')}</div>`;
}

function quickAdd(listId) {
  return `<form class="inline-add" data-form="add-item" data-list="${escapeHtml(listId)}"><input name="name" aria-label="New list item" placeholder="Add something…" maxlength="70" required><button class="button button-secondary" type="submit">Add</button></form>`;
}

function rewardTotal() {
  return state.members.reduce((total, person) => total + person.coins, 0);
}

function renderHome() {
  const dayTasks = state.tasks.filter((task) => task.date === dateKey(today));
  const remainingTasks = dayTasks.filter((task) => !task.done);
  const visibleTasks = dayTasks.filter((task) => homeTaskFilter === 'done' ? task.done : !task.done && (homeTaskFilter !== 'mine' || task.assignee === activeMemberId));
  const shopping = state.lists.find((list) => list.id === 'shopping') ?? state.lists[0];
  const meal = state.meals.find((entry) => entry.date === dateKey(today));
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(mondayOf(dateFromKey(selectedDate)), index));
  const events = state.events.filter((event) => event.date === selectedDate).sort((first, second) => first.time.localeCompare(second.time));
  const goalRatio = state.goal.target > 0 ? Math.max(0, Math.min(1, state.goal.current / state.goal.target)) : 0;
  const goalPercent = Math.round(goalRatio * 100);
  const daySummary = `${friendlyDate(dateFromKey(selectedDate))} · ${events.length} ${events.length === 1 ? 'plan' : 'plans'}`;
  const week = days.map((date) => {
    const key = dateKey(date);
    const hasPlan = state.events.some((event) => event.date === key);
    return `<button class="home-day ${key === selectedDate ? 'selected' : ''}" type="button" data-action="home-day" data-date="${key}" aria-label="${friendlyDate(date)}" aria-pressed="${key === selectedDate}"><small>${friendlyDate(date, { weekday: 'short' })}</small><strong>${date.getDate()}</strong><i class="${hasPlan ? '' : 'empty'}"></i></button>`;
  }).join('');
  return `<div class="home-board"><div class="home-main">${pageHeading('', 'Today, together.', daySummary, addButton('Add plan', 'open-event', '+'))}
    <div class="home-week" aria-label="Household week">${week}</div>
    <div class="home-next"><strong>Next up</strong><span>${events[0] ? `${formatTime(events[0].time)} · ${escapeHtml(events[0].title)} · ${escapeHtml(events[0].person || 'Everyone')}` : 'A clear day. Make it your own.'}</span><button class="tiny-icon" data-view="calendar" aria-label="Open calendar">${iconSvg('arrow-right')}</button></div>
    <div class="home-features"><button class="home-feature teamwork" data-view="chores"><span class="feature-copy"><h2>Teamwork time</h2><small>${remainingTasks.length} little ${remainingTasks.length === 1 ? 'job' : 'jobs'}, shared together</small></span><span class="feature-arrow">${iconSvg('arrow-right')}</span>${window.FamilyboardArt.markup('chores')}</button><button class="home-feature supper" type="button" data-action="edit-meal" data-date="${dateKey(today)}"><span class="feature-copy"><h2>Dinner tonight</h2><small>${escapeHtml(meal?.name || 'Choose something delicious')}${meal?.cook ? ` · ${escapeHtml(meal.cook)}` : ''}</small></span><span class="feature-arrow">${iconSvg('arrow-right')}</span>${window.FamilyboardArt.markup('dinner')}</button></div>
    <section class="home-chores"><div class="home-section-heading"><div><h2>Small jobs, big help</h2><p class="panel-kicker">Due today</p></div><button class="panel-link" type="button" data-action="open-task">${iconSvg('plus')}Add chore</button></div><div class="home-filters" role="group" aria-label="Chore filter">${[['all', 'Everyone'], ['mine', 'My chores'], ['done', 'Completed']].map(([value, label]) => `<button type="button" data-action="home-filter" data-filter="${value}" aria-pressed="${homeTaskFilter === value}" class="${homeTaskFilter === value ? 'selected' : ''}">${label}</button>`).join('')}</div>${visibleTasks.length ? renderTasks(visibleTasks, 4) : `<div class="empty-state">${homeTaskFilter === 'done' ? 'No completed chores yet.' : homeTaskFilter === 'mine' ? 'Your chores are all done.' : 'All caught up. Enjoy the breathing room.'}</div>`}<div class="home-task-footer"><span>${dayTasks.filter((task) => task.done).length} done together today</span><button class="panel-link" data-view="chores">All chores ${iconSvg('arrow-right')}</button></div></section></div>
    <aside class="home-side"><section class="home-goal"><div class="home-goal-heading"><h2>${escapeHtml(state.goal.name)}</h2><p>A little closer to something together.</p></div>${window.FamilyboardArt.markup('picnic')}<div class="home-goal-data"><div class="goal-line"><span>${state.goal.current} / ${state.goal.target} coins</span><strong>${goalPercent}%</strong></div><div class="progress-track" role="progressbar" aria-label="Shared goal" aria-valuenow="${goalPercent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${goalPercent}%"></div></div><small>${Math.max(0, state.goal.target - state.goal.current)} coins to go</small></div></section>
    <section class="home-agenda"><div class="home-section-heading"><h2>${selectedDate === dateKey(today) ? 'Today’s plans' : friendlyDate(dateFromKey(selectedDate), { weekday: 'long' }) + ' plans'}</h2><button class="panel-link" data-action="open-event" aria-label="Add calendar plan">${iconSvg('plus')}</button></div>${renderEvents(events, 'Nothing planned for this day.')}</section>
    <button class="home-shopping" data-view="lists">${iconSvg('list')}<span><strong>Pick up on the way</strong><small>${shopping?.items.filter((item) => !item.done).length || 0} things on the shopping list</small></span>${iconSvg('arrow-right')}</button></aside></div>`;
}

function renderCalendar() {
  const weekStart = mondayOf(calendarAnchor);
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index));
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(calendarAnchor);
  const dayButtons = days.map((date) => {
    const key = dateKey(date);
    const count = state.events.filter((event) => event.date === key).length;
    return `<button class="day-button ${key === selectedDate ? 'selected' : ''}" type="button" data-action="select-day" data-date="${key}"><small>${friendlyDate(date, { weekday: 'short' })}</small><strong>${date.getDate()}</strong><i>${Array.from({ length: Math.min(count, 3) }, () => '<b></b>').join('')}</i></button>`;
  }).join('');
  const events = state.events.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  return `${pageHeading('MAKE SPACE FOR WHAT MATTERS', 'Family calendar', 'One view for all the plans, big and small.', addButton('Add event', 'open-event', '+'))}
    <div class="section-grid"><section class="panel wide-panel"><div class="panel-header"><div><h2 class="panel-title">Your week</h2><p class="panel-kicker">Tap a day to see what’s on</p></div><div class="calendar-toolbar"><button class="tiny-icon" data-action="week-back" type="button" aria-label="Previous week">${iconSvg('arrow-left')}</button><span class="month-label">${monthLabel}</span><button class="tiny-icon" data-action="week-forward" type="button" aria-label="Next week">${iconSvg('arrow-right')}</button></div></div><div class="week-strip">${dayButtons}</div><h3 class="calendar-day-title">${friendlyDate(dateFromKey(selectedDate))}</h3>${renderEvents(events, 'A clear day. Add a plan when something comes up.')}</section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Coming soon</h2><p class="panel-kicker">Next three days</p></div></div>${renderEvents(state.events.filter((event) => event.date > dateKey(today)).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 4), 'No upcoming plans yet.')}</section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Everyone’s colour</h2><p class="panel-kicker">Plans stay easy to scan</p></div></div><div class="task-list">${state.members.map((person) => `<div class="task-row">${personAvatar(person)}<div class="task-copy"><strong>${escapeHtml(person.name)}</strong><small>Household member</small></div><span class="person-dot" style="background:var(--${escapeHtml(person.tone)})"></span></div>`).join('')}</div></section></div>`;
}

function renderChores() {
  const tasks = state.tasks.filter((task) => task.date === dateKey(today)).sort((a, b) => Number(a.done) - Number(b.done));
  const completed = tasks.filter((task) => task.done).length;
  return `${pageHeading('SMALL WINS ADD UP', 'Chores & routines', 'Everyone pitches in. Every little win counts.', addButton('Add a chore', 'open-task', '+'))}
    <div class="section-grid"><section class="panel wide-panel"><div class="panel-header"><div><h2 class="panel-title">Due today</h2><p class="panel-kicker">${completed} of ${tasks.length} done · earn coins as you go</p></div><span class="coin-balance">${rewardTotal()} household coins</span></div>${renderTasks(tasks)}</section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Coming up tomorrow</h2><p class="panel-kicker">A peek at what’s next</p></div></div>${renderTasks(state.tasks.filter((task) => task.date === dateKey(shiftDate(today, 1))))}</section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Good work, everyone</h2><p class="panel-kicker">Your household’s coin jars</p></div></div><div class="mini-stats">${state.members.map((person) => `<div class="mini-stat"><strong>${person.coins} coins</strong><span>${escapeHtml(person.name)}</span></div>`).join('')}</div></section></div>`;
}

function renderLists() {
  const list = state.lists.find((entry) => entry.id === activeListId) ?? state.lists[0];
  const tabs = state.lists.map((entry) => `<button class="list-tab ${entry.id === list.id ? 'active' : ''}" type="button" data-action="select-list" data-id="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</button>`).join('');
  return `${pageHeading('KEEP IT ALL IN ONE PLACE', 'Household lists', 'Add it here, find it when you need it.', '<button class="button button-secondary" type="button" data-action="new-list"><span class="button-icon" aria-hidden="true">＋</span>New list</button>')}
    <div class="section-grid"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Your lists</h2><p class="panel-kicker">Shared with everyone at home</p></div></div><div class="list-tabs">${tabs}</div>${renderShoppingList(list)}${quickAdd(list.id)}</section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">A little list magic</h2><p class="panel-kicker">Keep your week running smoothly</p></div></div><div class="task-list"><div class="task-row"><span class="reward-symbol">${iconSvg('check')}</span><div class="task-copy"><strong>Tick as you shop</strong><small>Checked-off items stay visible until you clear them.</small></div></div><div class="task-row"><span class="reward-symbol">${iconSvg('clock')}</span><div class="task-copy"><strong>Use soon</strong><small>Keep leftovers and pantry bits from getting forgotten.</small></div></div><div class="task-row"><span class="reward-symbol">${iconSvg('plus')}</span><div class="task-copy"><strong>Make it yours</strong><small>Create a packing, school or weekend list.</small></div></div></div></section></div>`;
}

function renderMeals() {
  const week = Array.from({ length: 7 }, (_, index) => shiftDate(mondayOf(today), index));
  const mealRows = week.map((date) => {
    const key = dateKey(date);
    const entry = state.meals.find((meal) => meal.date === key);
    return `<div class="meal-day ${key === dateKey(today) ? 'today' : ''}"><time>${friendlyDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</time><div class="meal-name"><strong>${escapeHtml(entry?.name || 'No dinner planned')}</strong><small>${entry?.cook ? `Cooking: ${escapeHtml(entry.cook)}` : 'Tap to plan this meal'}</small></div><button class="meal-edit" type="button" data-action="edit-meal" data-date="${key}" aria-label="Edit dinner for ${friendlyDate(date, { weekday: 'long' })}" title="Edit dinner">${iconSvg('pencil')}</button></div>`;
  }).join('');
  return `${pageHeading('MAKE TONIGHT EASIER', 'Meals for the week', 'A simple plan, with room for real life.', addButton('Plan a meal', 'edit-meal', '+'))}
    <div class="section-grid"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Dinner plan</h2><p class="panel-kicker">Choose a day to add or change a meal</p></div></div><div class="meal-week">${mealRows}</div></section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Tonight’s ingredients</h2><p class="panel-kicker">Turn the plan into a shopping reminder</p></div></div><div class="panel-header" style="padding-top:0"><p class="panel-kicker" style="margin:0">Add ingredients as a group to your shopping list.</p></div><div class="meal-week"><div class="meal-day"><span class="meal-name"><strong>Cherry tomatoes</strong><small>Fresh produce</small></span><button class="button button-secondary" type="button" data-action="add-ingredient" data-name="Cherry tomatoes">Add</button></div><div class="meal-day"><span class="meal-name"><strong>Baby spinach</strong><small>Fresh produce</small></span><button class="button button-secondary" type="button" data-action="add-ingredient" data-name="Baby spinach">Add</button></div><div class="meal-day"><span class="meal-name"><strong>Parmesan</strong><small>Dairy</small></span><button class="button button-secondary" type="button" data-action="add-ingredient" data-name="Parmesan">Add</button></div></div></section></div>`;
}

function renderMessages() {
  const messages = [...state.messages].sort((a, b) => b.time - a.time);
  const content = messages.length ? `<div class="message-list">${messages.map((message) => `<article class="message-card ${message.urgent ? 'message-urgent' : ''}">${personAvatar(state.members.find((member) => member.name === message.from) ?? state.members[0])}<div><p>${escapeHtml(message.text)}</p><small>${escapeHtml(message.from)} · ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(message.time))}${message.urgent ? ' · Urgent' : ''}${message.seen ? ' · Seen' : ' · Not seen yet'}</small></div>${message.seen ? '' : `<button class="button button-text" type="button" data-action="mark-seen" data-id="${escapeHtml(message.id)}">Got it</button>`}</article>`).join('')}</div>` : '<div class="empty-state">No messages yet. Send a little note home.</div>';
  return `${pageHeading('A NOTE FOR YOUR PEOPLE', 'Messages home', 'A kind nudge travels further than a shout.', addButton('Send a message', 'open-message', '↗'))}
    <div class="section-grid"><section class="panel">${content}</section><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Ready when you are</h2><p class="panel-kicker">Send a quick note to the shared screen</p></div></div><div class="meal-week"><button class="meal-day" type="button" data-action="quick-message" data-message="Dinner is ready! Come join us."><span class="meal-name"><strong>Dinner is ready</strong><small>Bring everyone to the table</small></span>${iconSvg('arrow-up-right')}</button><button class="meal-day" type="button" data-action="quick-message" data-message="I’m on my way home."><span class="meal-name"><strong>On my way</strong><small>Let them know you’re coming</small></span>${iconSvg('arrow-up-right')}</button><button class="meal-day" type="button" data-action="quick-message" data-message="Can someone give me a hand, please?" data-urgent="true"><span class="meal-name"><strong>Need a hand</strong><small>Mark it urgent if it can’t wait</small></span>${iconSvg('arrow-up-right')}</button></div></section></div>`;
}

function renderRewards() {
  const cards = state.rewards.map((reward) => `<article class="reward-card"><span class="reward-symbol" aria-hidden="true">${iconSvg(reward.symbol || '✳')}</span><div><strong>${escapeHtml(reward.name)}</strong><small>${reward.cost} coins</small></div><button class="button button-secondary" type="button" data-action="redeem" data-id="${escapeHtml(reward.id)}" ${rewardTotal() < reward.cost ? 'disabled' : ''}>Use household coins</button></article>`).join('');
  return `${pageHeading('A LITTLE SOMETHING TO LOOK FORWARD TO', 'Rewards & coins', 'Small jobs can add up to something fun.', addButton('Add a treat', 'open-reward', '+'))}
    <div class="section-grid"><section class="panel wide-panel"><div class="panel-header"><div><h2 class="panel-title">The family treat shelf</h2><p class="panel-kicker">Choose a reward to spend household coins</p></div><span class="coin-balance">${rewardTotal()} available</span></div><div class="reward-grid">${cards || '<p class="empty-state">Add a treat your family will love.</p>'}</div></section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Coin jars</h2><p class="panel-kicker">Earned by showing up for each other</p></div></div><div class="task-list">${state.members.map((person) => `<div class="task-row">${personAvatar(person)}<div class="task-copy"><strong>${escapeHtml(person.name)}</strong><small>Ready for a little treat</small></div><span class="task-reward">${person.coins} coins</span></div>`).join('')}</div></section>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Saving together</h2><p class="panel-kicker">A shared goal grows with every chore</p></div></div><div class="goal-box"><div class="goal-line"><span>${escapeHtml(state.goal.name)}</span><strong>${state.goal.current}/${state.goal.target}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, state.goal.current / state.goal.target * 100)}%"></div></div></div></section></div>`;
}

function renderPeople() {
  const people = state.members.map((person) => `<div class="task-row">${personAvatar(person)}<div class="task-copy"><strong>${escapeHtml(person.name)}</strong><small>${person.coins} household coins</small></div><button class="button button-secondary" type="button" data-action="remove-person" data-id="${escapeHtml(person.id)}" aria-label="Remove ${escapeHtml(person.name)}">Remove</button></div>`).join('');
  return `${pageHeading('YOUR HOUSEHOLD', escapeHtml(householdName), 'Choose who appears on the shared board.', addButton('Add a person', 'open-person', '+'))}
    <div class="section-grid"><section class="panel wide-panel"><div class="panel-header"><div><h2 class="panel-title">People at home</h2><p class="panel-kicker">Everyone can use the household passphrase to access this board.</p></div></div><div class="task-list">${people}</div></section></div>`;
}

function render() {
  updateChrome();
  const templates = { home: renderHome, calendar: renderCalendar, chores: renderChores, lists: renderLists, meals: renderMeals, messages: renderMessages, rewards: renderRewards, people: renderPeople };
  root.innerHTML = templates[currentView]();
  return window.FamilyboardArt.mount();
}

function memberOptions(selected = activeMemberId || state.members[0]?.id) {
  return state.members.map((person) => `<option value="${escapeHtml(person.id)}" ${person.id === selected ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('');
}

function openDialog(title, subtitle, fields, formName, submitLabel) {
  dialogBody.innerHTML = `<div class="dialog-content"><p class="eyebrow">${escapeHtml(householdName)}</p><h2 id="dialog-title">${title}</h2><p>${subtitle}</p><form class="form-grid" data-form="${formName}">${fields}<div class="form-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Cancel</button><button class="button button-primary" type="submit">${submitLabel}</button></div></form></div>`;
  dialog.showModal();
  dialog.querySelector('input, textarea, select')?.focus();
}

function openEventDialog(date = selectedDate) {
  openDialog('Add a plan', 'Put it on the family calendar.', `<div class="form-field"><label for="event-title">What’s happening?</label><input id="event-title" name="title" placeholder="e.g. Soccer practice" maxlength="70" required></div><div class="form-row"><div class="form-field"><label for="event-date">Date</label><input id="event-date" name="date" type="date" value="${date}" required></div><div class="form-field"><label for="event-time">Time</label><input id="event-time" name="time" type="time" value="17:00" required></div></div><div class="form-field"><label for="event-person">Who’s involved?</label><select id="event-person" name="person"><option>Everyone</option>${state.members.map((person) => `<option>${escapeHtml(person.name)}</option>`).join('')}</select></div>`, 'add-event', 'Save plan');
}

function openTaskDialog() {
  openDialog('Add a chore', 'Every small contribution earns a few coins.', `<div class="form-field"><label for="task-title">Chore</label><input id="task-title" name="title" placeholder="e.g. Put the laundry away" maxlength="70" required></div><div class="form-row"><div class="form-field"><label for="task-person">For</label><select id="task-person" name="assignee">${memberOptions()}</select></div><div class="form-field"><label for="task-points">Coins</label><select id="task-points" name="points"><option value="1">1 coin</option><option value="2" selected>2 coins</option><option value="3">3 coins</option><option value="5">5 coins</option></select></div></div>`, 'add-task', 'Add chore');
}

function openMealDialog(date = selectedDate) {
  const existing = state.meals.find((meal) => meal.date === date);
  openDialog('Plan dinner', 'What sounds good around the table?', `<div class="form-field"><label for="meal-date">Day</label><input id="meal-date" name="date" type="date" value="${date}" required></div><div class="form-field"><label for="meal-name">Dinner</label><input id="meal-name" name="name" placeholder="e.g. Veggie tacos" value="${escapeHtml(existing?.name ?? '')}" maxlength="70" required></div><div class="form-field"><label for="meal-cook">Who’s cooking?</label><select id="meal-cook" name="cook"><option value="">We’ll decide later</option>${state.members.map((person) => `<option ${existing?.cook === person.name ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></div>`, 'save-meal', 'Save dinner');
}

function openMessageDialog(text = '', urgent = false) {
  openDialog('Send a note home', 'It will show on your household board.', `<div class="form-field"><label for="message-text">Your message</label><textarea id="message-text" name="text" placeholder="Dinner is ready! Come join us." maxlength="220" required>${escapeHtml(text)}</textarea></div><div class="form-field"><label for="message-from">From</label><select id="message-from" name="from">${memberOptions(activeMemberId)}</select></div><div class="form-field"><label for="message-urgent">Priority</label><select id="message-urgent" name="urgent"><option value="false" ${urgent ? '' : 'selected'}>Whenever they see it</option><option value="true" ${urgent ? 'selected' : ''}>Urgent · ask for acknowledgement</option></select></div>`, 'send-message', 'Send message');
}

function openRewardDialog() {
  openDialog('Add a family treat', 'Make a reward your household can save for.', `<div class="form-field"><label for="reward-name">Treat</label><input id="reward-name" name="name" placeholder="e.g. Choose Friday’s movie" maxlength="60" required></div><div class="form-row"><div class="form-field"><label for="reward-cost">Coin price</label><input id="reward-cost" name="cost" type="number" min="1" max="999" value="15" required></div><div class="form-field"><label for="reward-symbol">Symbol</label><select id="reward-symbol" name="symbol"><option value="leaf">Leaf</option><option value="play">Film</option><option value="moon">Moon</option><option value="heart">Heart</option></select></div></div>`, 'add-reward', 'Save treat');
}

function openPersonDialog() {
  openDialog('Add a person', 'Give everyone their own color and coin balance.', `<div class="form-field"><label for="person-name">Name</label><input id="person-name" name="name" placeholder="e.g. Alex" maxlength="32" required></div>`, 'add-person', 'Add person');
}

function addList() {
  const name = window.prompt('What is this list for?');
  if (!name?.trim()) return;
  const list = { id: makeId(), name: name.trim().slice(0, 28), items: [] };
  state.lists.push(list);
  activeListId = list.id;
  saveState();
  render();
  showToast('Your new list is ready.');
}

function toggleTask(id) {
  const task = state.tasks.find((entry) => entry.id === id);
  if (!task) return;
  const person = personFor(task.assignee);
  task.done = !task.done;
  person.coins = Math.max(0, person.coins + (task.done ? task.points : -task.points));
  if (task.done) state.goal.current = Math.min(state.goal.target, state.goal.current + task.points);
  else state.goal.current = Math.max(0, state.goal.current - task.points);
  const sourceRect = root.querySelector(`[data-action="toggle-task"][data-id="${CSS.escape(id)}"]`)?.closest('.task-row')?.getBoundingClientRect();
  saveState();
  const artworkReady = render();
  if (task.done) artworkReady.then(() => window.FamilyboardArt.celebrate(task.points, sourceRect));
  showToast(task.done ? `${person.name} earned ${task.points} coins.` : 'Chore moved back to the list.');
}

function toggleItem(id) {
  const item = state.lists.flatMap((list) => list.items).find((entry) => entry.id === id);
  if (!item) return;
  item.done = !item.done;
  saveState();
  render();
}

function handleClick(event) {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    setView(viewButton.dataset.view);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, date } = button.dataset;
  if (action === 'toggle-task') toggleTask(id);
  if (action === 'toggle-item') toggleItem(id);
  if (action === 'delete-item') {
    state.lists.forEach((list) => { list.items = list.items.filter((item) => item.id !== id); });
    saveState(); render(); showToast('Item removed.');
  }
  if (action === 'select-list') { activeListId = id; render(); }
  if (action === 'select-day') { selectedDate = date; render(); }
  if (action === 'home-day') { selectedDate = date; render(); }
  if (action === 'home-filter') { homeTaskFilter = button.dataset.filter; render(); }
  if (action === 'week-back' || action === 'week-forward') {
    calendarAnchor = shiftDate(calendarAnchor, action === 'week-back' ? -7 : 7);
    selectedDate = dateKey(mondayOf(calendarAnchor));
    render();
  }
  if (action === 'open-event') openEventDialog(dateKey(today));
  if (action === 'open-task') openTaskDialog();
  if (action === 'edit-meal') openMealDialog(date ?? selectedDate);
  if (action === 'open-message') openMessageDialog();
  if (action === 'open-reward') openRewardDialog();
  if (action === 'open-person') openPersonDialog();
  if (action === 'close-dialog') dialog.close();
  if (action === 'new-list') addList();
  if (action === 'logout') logout();
  if (action === 'add-ingredient') {
    const shopping = state.lists.find((list) => list.id === 'shopping') ?? state.lists[0];
    if (!shopping) return;
    if (!shopping.items.some((item) => item.name.toLowerCase() === button.dataset.name.toLowerCase())) {
      shopping.items.unshift({ id: makeId(), name: button.dataset.name, quantity: '', done: false });
      saveState(); render(); showToast(`${button.dataset.name} added to shopping.`);
    } else showToast('That ingredient is already on the list.');
  }
  if (action === 'mark-seen') {
    const message = state.messages.find((entry) => entry.id === id);
    if (message) { message.seen = true; saveState(); render(); showToast('Message acknowledged.'); }
  }
  if (action === 'quick-message') openMessageDialog(button.dataset.message, button.dataset.urgent === 'true');
  if (action === 'switch-person') {
    const currentIndex = state.members.findIndex((person) => person.id === activeMemberId);
    activeMemberId = state.members[(currentIndex + 1) % state.members.length].id;
    saveActiveMember();
    render(); showToast(`Now viewing as ${personFor(activeMemberId).name}.`);
  }
  if (action === 'remove-person') {
    if (state.members.length < 2) { showToast('A household needs at least one person.'); return; }
    const person = personFor(id);
    if (!window.confirm(`Remove ${person.name} from this household?`)) return;
    const replacement = state.members.find((member) => member.id !== id);
    state.tasks.forEach((task) => { if (task.assignee === id) task.assignee = replacement.id; });
    state.members = state.members.filter((member) => member.id !== id);
    if (activeMemberId === id) {
      activeMemberId = replacement.id;
      saveActiveMember();
    }
    saveState(); render(); showToast(`${person.name} was removed from the household.`);
  }
  if (action === 'redeem') {
    const reward = state.rewards.find((entry) => entry.id === id);
    if (!reward || rewardTotal() < reward.cost) return;
    let remaining = reward.cost;
    for (const person of [...state.members].sort((a, b) => b.coins - a.coins)) {
      const spent = Math.min(person.coins, remaining);
      person.coins -= spent;
      remaining -= spent;
      if (!remaining) break;
    }
    saveState(); render(); showToast(`${reward.name} is yours to enjoy.`);
  }
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const type = form.dataset.form;
  if (type === 'add-person') {
    const name = data.name.trim();
    if (state.members.some((person) => person.name.toLowerCase() === name.toLowerCase())) {
      showToast('That person is already on the board.');
      return;
    }
    const tones = ['maya', 'leo', 'june', 'oscar', 'coral', 'blue', 'green', 'yellow'];
    state.members.push({ id: makeId(), name, initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(), tone: tones[state.members.length % tones.length], coins: 0 });
    saveState(); dialog.close(); render(); showToast(`${name} joined the household board.`);
    return;
  }
  if (type === 'add-item') {
    const list = state.lists.find((entry) => entry.id === form.dataset.list);
    if (!list || !data.name.trim()) return;
    list.items.unshift({ id: makeId(), name: data.name.trim(), quantity: '', done: false });
    saveState(); render(); showToast('Added to your list.');
    return;
  }
  if (type === 'add-event') {
    state.events.push({ id: makeId(), title: data.title.trim(), date: data.date, time: data.time, person: data.person, tone: 'coral' });
    selectedDate = data.date;
    calendarAnchor = dateFromKey(data.date);
    saveState(); dialog.close(); setView('calendar'); showToast('Plan added to the family calendar.');
  }
  if (type === 'add-task') {
    state.tasks.push({ id: makeId(), title: data.title.trim(), assignee: data.assignee, date: dateKey(today), points: Number(data.points), done: false });
    saveState(); dialog.close(); render(); showToast('Chore added for today.');
  }
  if (type === 'save-meal') {
    const existing = state.meals.find((meal) => meal.date === data.date);
    if (existing) { existing.name = data.name.trim(); existing.cook = data.cook; }
    else state.meals.push({ date: data.date, name: data.name.trim(), cook: data.cook });
    selectedDate = data.date;
    saveState(); dialog.close(); render(); showToast('Dinner plan saved.');
  }
  if (type === 'send-message') {
    state.messages.push({ id: makeId(), text: data.text.trim(), from: personFor(data.from).name, time: Date.now(), urgent: data.urgent === 'true', seen: false });
    saveState(); dialog.close(); setView('messages'); showToast('Your note is on the household board.');
  }
  if (type === 'add-reward') {
    state.rewards.push({ id: makeId(), name: data.name.trim(), cost: Number(data.cost), symbol: data.symbol });
    saveState(); dialog.close(); render(); showToast('Treat added to the family shelf.');
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = Object.fromEntries(new FormData(form).entries());
  submitButton.disabled = true;
  document.querySelector('#auth-notice').textContent = '';
  try {
    if (form.id === 'setup-form') {
      const ownerName = formData.your_name.trim();
      const members = formData.members.split(',').map((name) => name.trim()).filter(Boolean);
      const ownerIndex = members.findIndex((name) => name.toLowerCase() === ownerName.toLowerCase());
      if (ownerIndex >= 0) members.splice(ownerIndex, 1);
      members.unshift(ownerName);
      await requestApi('/api/setup', {
        method: 'POST',
        body: JSON.stringify({ household_name: formData.household_name.trim(), passphrase: formData.passphrase, members }),
      });
      activeMemberId = '';
      clearActiveMember();
    } else {
      await requestApi('/api/login', { method: 'POST', body: JSON.stringify({ passphrase: formData.passphrase }) });
    }
    form.reset();
    await bootstrapBoard();
  } catch (error) {
    document.querySelector('#auth-notice').textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

async function logout() {
  if (!window.confirm('Sign out of this household on this device?')) return;
  try {
    await requestApi('/api/logout', { method: 'POST', body: '{}' });
  } catch (error) {
    showToast(`Could not sign out: ${error.message}`);
    return;
  }
  state = null;
  activeMemberId = '';
  clearActiveMember();
  const status = await requestApi('/api/status');
  showAuth(status.configured, status.household_name);
}

document.addEventListener('click', handleClick);
document.addEventListener('submit', handleSubmit);
document.querySelector('#setup-form').addEventListener('submit', handleAuthSubmit);
document.querySelector('#login-form').addEventListener('submit', handleAuthSubmit);
renderStaticIcons();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshBoard();
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

bootstrapBoard();
loadVisualModules();