(() => {
  const files = { logo: 'familyboard-icon.svg', chores: 'artwork-chores.svg', dinner: 'artwork-dinner.svg', picnic: 'artwork-picnic.svg' };
  const sources = new Map();
  const records = new Map();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let gsap = null;
  let enabled = sessionStorage.getItem('familyboard-motion-paused') !== 'true';

  function markup(name, extraClass = '') {
    return `<span class="svg-artwork ${extraClass}" data-artwork="${name}" aria-hidden="true"><img src="/${files[name]}" alt=""></span>`;
  }

  function allowed(record) {
    return enabled && !preference.matches && !document.hidden && !document.querySelector('dialog[open]') && record.visible;
  }

  function clearRecord(record) {
    record.context?.revert();
    record.loops.forEach((loop) => gsap?.killTweensOf(loop));
    record.context = null;
    record.loops = [];
  }

  function build(record) {
    if (!gsap || record.context || preference.matches) return;
    const svg = record.svg;
    const part = (name) => svg.querySelector(`[data-part="${name}"]`);
    record.context = gsap.context(() => {
      const loop = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } });
      record.loops.push(loop);
      const sway = (target, values, origin, duration) => {
        if (!target) return;
        loop.to(target, { ...values, svgOrigin: origin, duration }, 0)
          .to(target, { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, duration }, duration);
      };
      if (record.name === 'chores') {
        sway(part('left-arm'), { rotation: -3.5 }, '211 83', 2.4);
        sway(part('right-arm'), { rotation: 3.5 }, '254 85', 2.4);
        sway(part('clothes'), { scaleX: 0.94, y: -1.5 }, '182 138', 2.4);
        sway(part('head'), { rotation: 1.3 }, '234 75', 2.4);
        sway(part('leaves'), { rotation: -2.5 }, '318 167', 2.4);
      }
      if (record.name === 'dinner') {
        loop.to(part('arm'), { rotation: 2.5, svgOrigin: '146 91', duration: 1.4 }, 0)
          .to(part('arm'), { rotation: -2.5, duration: 2.8 }, 1.4)
          .to(part('arm'), { rotation: 0, duration: 1.4 }, 4.2);
        loop.to(part('food'), { x: 1.5, y: -1.2, duration: 1.4 }, 0)
          .to(part('food'), { x: -1.5, y: -0.5, duration: 2.8 }, 1.4)
          .to(part('food'), { x: 0, y: 0, duration: 1.4 }, 4.2);
        sway(part('head'), { rotation: -1 }, '115 73', 2.8);
        ['steam-one', 'steam-two'].forEach((name, index) => {
          const steam = gsap.timeline({ paused: true, repeat: -1 });
          steam.fromTo(part(name), { y: 4, autoAlpha: 0 }, { y: 0, autoAlpha: 0.85, duration: 0.7, ease: 'sine.out' })
            .to(part(name), { y: -16, autoAlpha: 0, duration: 2.1, ease: 'sine.in' });
          steam.progress(index * 0.5);
          record.loops.push(steam);
        });
      }
      if (record.name === 'picnic') {
        sway(part('left-arm'), { rotation: -5 }, '109 124', 3.6);
        sway(part('right-arm'), { rotation: 4 }, '230 130', 3.6);
        sway(part('child-head'), { y: -1.5 }, '169 135', 3.6);
        sway(part('left-head'), { rotation: 1 }, '93 112', 3.6);
        sway(part('right-head'), { rotation: -1 }, '253 113', 3.6);
        sway(part('leaves'), { rotation: -2.5 }, '307 109', 3.6);
        sway(part('birds'), { x: 3, y: -1 }, '50 54', 3.6);
      }
      if (record.name === 'logo') {
        sway(part('roof'), { y: -1.5, rotation: -0.6 }, '32 28', 3.2);
        loop.to(svg.querySelectorAll('[data-part="window"]'), { y: -0.8, scale: 0.94, transformOrigin: '50% 50%', duration: 1.6, stagger: 0.12 }, 0.6)
          .to(svg.querySelectorAll('[data-part="window"]'), { y: 0, scale: 1, duration: 1.6, stagger: 0.12 }, 2.8);
        sway(part('door'), { scaleX: 0.94 }, '35 54', 3.2);
      } else {
        const eyes = svg.querySelectorAll('[data-part="eye"]');
        loop.to(eyes, { scaleY: 0.12, transformOrigin: '50% 50%', duration: 0.12 }, 2.7)
          .to(eyes, { scaleY: 1, duration: 0.18 }, 2.82);
      }
    }, svg);
  }

  function sync() {
    for (const [svg, record] of records) {
      if (!svg.isConnected) {
        observer.unobserve(svg);
        clearRecord(record);
        records.delete(svg);
        continue;
      }
      if (preference.matches) clearRecord(record);
      else if (gsap) build(record);
      record.loops.forEach((loop) => allowed(record) ? loop.resume() : loop.pause());
    }
    document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
      const label = preference.matches ? 'Reduced motion enabled' : enabled ? 'Pause artwork' : 'Resume artwork';
      button.title = label;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(!enabled || preference.matches));
      button.disabled = !gsap || preference.matches;
      button.querySelector('[data-pause]')?.toggleAttribute('hidden', !enabled);
      button.querySelector('[data-play]')?.toggleAttribute('hidden', enabled);
    });
    document.querySelectorAll('[data-motion-replay]').forEach((button) => { button.disabled = !gsap || !enabled || preference.matches; });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const record = records.get(entry.target);
      if (record) record.visible = entry.isIntersecting;
    });
    sync();
  }, { threshold: 0.1 });

  async function mount(scope = document) {
    sync();
    await Promise.all([...scope.querySelectorAll('[data-artwork]')].map(async (wrapper) => {
      if (wrapper.dataset.artworkMounted) return;
      const name = wrapper.dataset.artwork;
      if (!files[name]) return;
      wrapper.dataset.artworkMounted = 'loading';
      try {
        if (!sources.has(name)) sources.set(name, fetch(`/${files[name]}`).then((response) => {
          if (!response.ok) throw new Error('Artwork unavailable');
          return response.text();
        }));
        const source = await sources.get(name);
        if (!wrapper.isConnected) return;
        const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
        if (parsed.querySelector('parsererror')) throw new Error('Invalid SVG');
        const svg = document.importNode(parsed.documentElement, true);
        svg.setAttribute('class', 'artwork-svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.dataset.scene = name;
        wrapper.replaceChildren(svg);
        wrapper.dataset.artworkMounted = 'true';
        const record = { name, svg, loops: [], context: null, visible: false };
        records.set(svg, record);
        observer.observe(svg);
        const host = wrapper.closest('button, a') || wrapper;
        const speed = (value) => {
          if (!gsap || !allowed(record)) return;
          record.loops.forEach((loop) => gsap.to(loop, { timeScale: value, duration: 0.7, ease: 'sine.inOut', overwrite: true }));
        };
        host.addEventListener('pointerenter', () => speed(1.3));
        host.addEventListener('pointerleave', () => speed(1));
        host.addEventListener('focusin', () => speed(1.3));
        host.addEventListener('focusout', () => speed(1));
      } catch {
        sources.delete(name);
        delete wrapper.dataset.artworkMounted;
      }
    }));
    sync();
  }

  function celebrate(points, sourceRect) {
    if (!gsap || !enabled || preference.matches) return;
    document.querySelectorAll('[data-scene="picnic"], [data-scene="logo"]').forEach((svg) => {
      const record = records.get(svg);
      if (!record || !allowed(record)) return;
      record.loops.forEach((loop) => gsap.timeline().to(loop, { timeScale: 1.5, duration: 0.45, ease: 'sine.inOut' }).to(loop, { timeScale: 1, duration: 1, ease: 'sine.inOut' }));
    });
    if (!sourceRect) return;
    const target = document.querySelector('.home-goal .goal-line')?.getBoundingClientRect();
    const inFrame = target && target.top > 0 && target.bottom < innerHeight - 70;
    const coin = document.createElement('span');
    coin.className = 'earned-coin';
    coin.setAttribute('aria-hidden', 'true');
    coin.textContent = `+${points}`;
    coin.style.left = `${sourceRect.right - 32}px`;
    coin.style.top = `${sourceRect.top}px`;
    document.body.append(coin);
    gsap.timeline({ onComplete: () => coin.remove() })
      .to(coin, { x: inFrame ? target.left - sourceRect.right + 32 : 0, y: inFrame ? target.top - sourceRect.top : -40, scale: inFrame ? 0.65 : 1, duration: 0.8, ease: 'power2.inOut' })
      .to(coin, { autoAlpha: 0, scale: 0.3, duration: 0.2 }, '-=0.15');
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-motion-toggle]')) {
      enabled = !enabled;
      sessionStorage.setItem('familyboard-motion-paused', String(!enabled));
      sync();
    }
    if (event.target.closest('[data-motion-replay]') && enabled && !preference.matches) {
      records.forEach((record) => { if (allowed(record)) record.loops.forEach((loop) => loop.restart()); });
    }
  });
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('close', sync, true);
  document.addEventListener('DOMContentLoaded', () => {
    mount();
    const dialog = document.querySelector('dialog');
    if (dialog) new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
  window.FamilyboardArt = { markup, mount, celebrate, setGSAP: (module) => { gsap = module; sync(); }, inspect: () => ({ assets: records.size, loops: [...records.values()].reduce((total, record) => total + record.loops.length, 0), playing: [...records.values()].filter((record) => record.loops.some((loop) => !loop.paused())).length, enabled, reduced: preference.matches }) };
})();