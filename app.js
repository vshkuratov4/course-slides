/* Study slides — bubble field. Vanilla JS, no build step.
   State lives in the URL hash: #/ELEC → domain open, #/ELEC/ELEC-275 → course panel. */

(async function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const field = $('#field');

  /* ---------- data ---------- */
  let DATA;
  try { DATA = await (await fetch('data/courses.json', {cache:'no-cache'})).json(); }
  catch(e){
    field.innerHTML = '<p style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#8f897d;font-family:monospace">Could not load data/courses.json — refresh the page.</p>';
    return;
  }
  const repoUrl = `https://github.com/${DATA.owner}/${DATA.repo}`;
  $('#f-repo').href = repoUrl;
  $('#f-issue').href = repoUrl + '/issues/new';

  const domain = code => DATA.domains.find(d => d.code === code);
  const slug = c => c.replace(/\s+/g,'-');
  const course = (dcode, cslug) => (domain(dcode)?.courses || []).find(c => slug(c.code) === cslug);

  /* ---------- download counts (GitHub Release assets) ---------- */
  let COUNTS = null;
  async function loadCounts(){
    try {
      const cached = JSON.parse(sessionStorage.getItem('relCounts.v1') || 'null');
      if (cached && Date.now() - cached.t < 15*60*1000) { COUNTS = cached.m; return; }
    } catch(e){}
    try {
      const r = await fetch(`https://api.github.com/repos/${DATA.owner}/${DATA.repo}/releases?per_page=100`);
      if (!r.ok) return;                      // rate-limited or offline: just no counts
      const m = {};
      for (const rel of await r.json()) for (const a of rel.assets || []) {
        if (!m[a.name]) m[a.name] = {n:0, url:a.browser_download_url};
        m[a.name].n += a.download_count;
      }
      COUNTS = m;
      try { sessionStorage.setItem('relCounts.v1', JSON.stringify({t:Date.now(), m})); } catch(e){}
    } catch(e){}
  }

  /* ---------- signature line-art icons (one per domain) ---------- */
  const P = (cls,d,i) => `<path class="${cls}" pathLength="1" style="--d:${i}" d="${d}"/>`;
  const C = (cls,cx,cy,r,i) => `<circle class="${cls}" pathLength="1" style="--d:${i}" cx="${cx}" cy="${cy}" r="${r}"/>`;
  const R = (cls,x,y,w,h,rx,i) => `<rect class="${cls}" pathLength="1" style="--d:${i}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const svg = (cls, inner) => `<svg class="icon ${cls}" viewBox="0 0 96 96" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    MECH: svg('i-mech',
      `<g class="gA">${C('',36,50,15,0)}${P('','M36 32v-7M36 68v7M18 50h-7M54 50h7M25 39l-5-5M47 61l5 5M47 39l5-5M25 61l-5 5',1)}</g>` +
      `<g class="gB">${C('ac',66,44,10,2)}${P('','M66 31v-5M66 57v5M53 44h-5M79 44h5M59 37l-4-4M73 51l4 4M73 37l4-4M59 51l-4 4',3)}</g>`),
    ELEC: svg('i-elec',
      P('','M6 62h12l4-10 7 20 7-20 7 20 4-10h7',0) + C('',56,62,2,1) +
      P('ac','M58 62c4-15 9-15 13 0s9 15 13 0',2)),
    COMP: svg('i-comp',
      P('','M25 66 35 36',0) + P('','M41 35 55 54',1) + P('','M61 54 73 30',2) +
      P('','M62 61 76 63',3) + P('','M77 30 79 60',4) +
      C('',22,70,4,1) + C('',38,32,4,2) + C('',58,58,4,3) + C('ac',76,26,4,4) + C('',80,64,4,5)),
    SOEN: svg('i-soen',
      P('','M12 68h72',0) +
      P('ac','M30 68c10 0 9-20 19-20h8c10 0 9 20 19 20',1) +
      C('nd',20,68,3,2) + C('nd ac',48,48,3,3) + C('nd',76,68,3,4)),
    COEN: svg('i-coen',
      R('',36,36,24,24,3,0) + R('ac',45,45,6,6,1,1) +
      P('tr','M36 44H14M36 52H14M60 44h22M60 52h22M44 36V14M52 36V14M44 60v22M52 60v22',2)),
    CIVI: svg('i-civi',
      P('','M10 66h76',0) + P('','M10 66 22 48',1) +
      P('ac','M22 48 34 66 46 48 58 66 70 48',2) +
      P('','M74 48 86 66',3) + P('','M22 48h52',4)),
    AERO: svg('i-aero',
      P('','M22 52c12-9 30-11 50-6-16 9-36 11-50 6z',0) +
      P('fl ac','M6 40h20c10 0 18-3 26-4M6 52h14M6 64h20c12 0 22 3 30 3',1)),
    INDU: svg('i-indu',
      P('','M10 66h70',0) + P('','M74 60l8 6-8 6',1) +
      R('p p1',18,54,9,9,1,2) + R('p p2 ac',40,54,9,9,1,3) + R('p p3',62,54,9,9,1,4)),
    BLDG: svg('i-bldg',
      R('',20,22,56,52,0,0) + P('','M20 50h24M44 50v24M44 36h32',1) +
      P('ac','M58 50a9 9 0 0 1 9 9',2)),
    ENGR: svg('i-engr',
      P('','M48 20 33 74',0) + P('','M48 20 63 74',1) + C('',48,22,4,2) +
      P('ac','M28 68a29 29 0 0 0 40 0',3)),
    ENCS: svg('i-encs',
      P('','M26 70h44L26 26z',0) + P('','M36 58h18L36 38z',1) +
      P('ac','M16 80h64',2)),
  };

  /* ---------- build the field ---------- */
  // Home positions per domain (percent of viewport). New codes fall back to a slot list.
  const POS = {
    COMP:[12,28,1], SOEN:[30,15,1], COEN:[52,21,.92], ELEC:[72,15,1.18], MECH:[89,29,.95],
    INDU:[10,58,.9], AERO:[33,49,1.05], CIVI:[57,52,.95], BLDG:[81,57,1],
    ENGR:[25,80,.9], ENCS:[56,81,.88],
  };
  const spare = [[78,80,.9],[42,72,.9],[90,72,.9],[14,88,.9]];

  const els = {}, driftEls = {}, drifts = [];
  DATA.domains.forEach((d,i) => {
    const [x,y,s] = POS[d.code] || spare[i % spare.length];
    const n = (d.courses || []).length;
    const b = document.createElement('button');
    b.className = 'bubble' + (n ? '' : ' soon');
    b.dataset.code = d.code;
    b.style.cssText = `--x:${x}%;--y:${y}%;--s:${s};--acc:${d.accent};--acc-glow:${d.accent}26`;
    b.setAttribute('aria-label', `${d.code}, ${d.name}, ${n ? n + ' course' + (n>1?'s':'') : 'coming soon'}`);
    b.innerHTML = `<span class="drift">
        <span class="shell">${ICONS[d.code] || ICONS.ENGR}
          <span class="code">${d.code}</span>
          <span class="sub">${n ? n + (n>1 ? ' courses' : ' course') : 'soon'}</span>
          <span class="dname">${d.name}</span>
          <span class="dcount">${n ? n + (n>1 ? ' courses' : ' course') : 'notes coming soon'}</span>
        </span></span>`;
    field.appendChild(b);
    els[d.code] = b;
    const dr = b.querySelector('.drift');
    driftEls[d.code] = dr;
    drifts.push({code:d.code, el:dr, ph:i*1.7, amp:5+(i%4)*2.2, spd:.00011+(i%3)*.00004, depth:.5+((i*37)%50)/50});
  });

  /* ---------- slow drift + mouse parallax (transform only) ---------- */
  let mx=0, my=0, tx=0, ty=0;
  addEventListener('pointermove', e => {
    tx = e.clientX/innerWidth - .5; ty = e.clientY/innerHeight - .5;
  }, {passive:true});
  if (!RM) requestAnimationFrame(function tick(t){
    if (!document.hidden){
      mx += (tx-mx)*.04; my += (ty-my)*.04;
      for (const b of drifts){
        if (b.code === state[0] || b.el.classList.contains('settle')) continue;
        const x = Math.sin(t*b.spd + b.ph) * b.amp + mx*b.depth*26;
        const y = Math.cos(t*b.spd*.9 + b.ph*1.3) * b.amp*.8 + my*b.depth*18;
        b.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      }
    }
    requestAnimationFrame(tick);
  });

  /* ---------- open / close a domain ---------- */
  let state = [];   // [] | [domain] | [domain, courseSlug]
  let kids = [], fieldnote = null;

  const center = () => ({cx:innerWidth/2, cy:innerHeight*.44});

  function focusDomain(code){
    const el = els[code], r = el.getBoundingClientRect(), {cx,cy} = center();
    const target = Math.min(innerWidth*.52, innerHeight*.5, 430);
    const k = target / r.width;
    const dx = cx - (r.left + r.width/2), dy = cy - (r.top + r.height/2);
    el.style.setProperty('--k', k.toFixed(3));
    el.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${k.toFixed(3)})`;
    el.classList.add('focus');
    el.setAttribute('aria-expanded','true');
    const dr = driftEls[code];
    dr.classList.add('settle'); dr.style.transform = 'translate3d(0,0,0)';
    for (const c in els) if (c !== code) els[c].classList.add('sunk');
    return {cx, cy, target};
  }

  function unfocusDomain(code){
    const el = els[code]; if (!el) return;
    el.classList.remove('focus'); el.style.transform = '';
    el.setAttribute('aria-expanded','false');
    const dr = driftEls[code];
    setTimeout(() => dr.classList.remove('settle'), RM ? 0 : 900);
    for (const c in els) els[c].classList.remove('sunk');
  }

  function spawnKids(code){
    const d = domain(code), cs = d.courses || [], {cx,cy,target} = focusGeom;
    if (!cs.length){
      fieldnote = document.createElement('p');
      fieldnote.className = 'fieldnote';
      fieldnote.style.left = cx+'px';
      fieldnote.style.top = (cy + target/2 + 28)+'px';
      fieldnote.innerHTML = `Nothing here yet — <a href="${repoUrl}/issues/new?title=${encodeURIComponent('Course request: '+code)}" target="_blank" rel="noopener">request a ${code} course</a>`;
      field.appendChild(fieldnote);
      requestAnimationFrame(() => fieldnote.classList.add('in'));
      return;
    }
    const R0 = target/2 + 74;
    cs.forEach((c,i) => {
      const ang = (-25 + i*(360/cs.length)) * Math.PI/180;
      const sx = Math.cos(ang)*R0, sy = Math.sin(ang)*R0*.9;
      const kb = document.createElement('button');
      kb.className = 'kid';
      kb.dataset.slug = slug(c.code);
      kb.style.cssText = `left:${cx}px;top:${cy}px;--acc:${d.accent};--acc-glow:${d.accent}26`;
      kb.setAttribute('aria-label', `${c.code}, ${c.name}, ${c.notes.length} note${c.notes.length>1?'s':''}`);
      kb.innerHTML = `<span class="kshell"><span class="kcode">${c.code}</span>
        <span class="kmeta">${c.notes.length} note${c.notes.length>1?'s':''}</span></span>`;
      field.appendChild(kb);
      kids.push(kb);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        kb.classList.add('in');
        kb.style.transitionDelay = RM ? '0s' : (i*70)+'ms, '+(i*70)+'ms';
        kb.style.transform = `translate(calc(-50% + ${sx.toFixed(1)}px), calc(-50% + ${sy.toFixed(1)}px)) scale(1)`;
      }));
    });
  }

  function mergeKids(){
    for (const kb of kids){
      kb.classList.add('merge');
      kb.style.transitionDelay = '0s,0s';
      kb.style.transform = 'translate(-50%,-50%) scale(.1)';
      setTimeout(() => kb.remove(), RM ? 10 : 600);
    }
    kids = [];
    if (fieldnote){ fieldnote.remove(); fieldnote = null; }
  }

  /* ---------- reading panel ---------- */
  const panel = $('#panel'), veil = $('#veil');

  function renderPanel(dcode, c){
    const d = domain(dcode);
    const notes = c.notes.map(n => {
      const prev = 'previews/' + n.file.replace(/\.pdf$/i, '.png');
      const rel = COUNTS && COUNTS[n.file];
      const dl = rel ? rel.url : 'pdfs/' + encodeURIComponent(n.file);
      const report = `${repoUrl}/issues/new?title=${encodeURIComponent(`Mistake in ${c.code}: ${n.title}`)}&body=${encodeURIComponent(`Note: ${n.file}\nPage/slide:\n\nWhat is wrong:\n`)}`;
      return `<article class="note">
        <img class="prev" src="${prev}" alt="" loading="lazy" onerror="this.hidden=true">
        <h3>${n.title}</h3>
        <p class="desc">${n.description || ''}</p>
        <p class="meta">${n.date || ''}${rel ? ` &nbsp;·&nbsp; ${rel.n} download${rel.n===1?'':'s'}` : ''}</p>
        <div class="row">
          <a class="nbtn main" href="${dl}" style="--acc:${d.accent}">Download PDF</a>
          <a class="nbtn ghost" href="pdfs/${encodeURIComponent(n.file)}" target="_blank" rel="noopener">Read online</a>
          <a class="nrep" href="${report}" target="_blank" rel="noopener">report a mistake</a>
        </div>
      </article>`;
    }).join('');
    $('#panel-body').innerHTML = `
      <button class="pclose" aria-label="Close">close ✕</button>
      <p class="pkicker" style="--acc:${d.accent}">${c.code}</p>
      <h2 class="ptitle">${c.name}</h2>
      <p class="psub">${c.notes.length} note${c.notes.length>1?'s':''} · ${d.name}</p>
      ${notes}`;
    $('.pclose').addEventListener('click', () => { location.hash = '#/' + dcode; });
  }

  function openPanel(dcode, cslug){
    const c = course(dcode, cslug); if (!c) return;
    renderPanel(dcode, c);
    panel.hidden = false; veil.hidden = false;
    requestAnimationFrame(() => { panel.classList.add('show'); veil.classList.add('show'); });
    for (const kb of kids) kb.classList.toggle('active', kb.dataset.slug === cslug);
    panel.scrollTop = 0;
  }

  function closePanel(){
    if (panel.hidden) return;
    panel.classList.remove('show'); veil.classList.remove('show');
    for (const kb of kids) kb.classList.remove('active');
    setTimeout(() => { panel.hidden = true; veil.hidden = true; }, RM ? 10 : 500);
  }

  /* ---------- routing ---------- */
  let focusGeom = null;
  const parseHash = () => location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);

  function apply(next){
    if (next[0] && !domain(next[0])) next = [];
    if (next[1] && !course(next[0], next[1])) next = [next[0]];
    const cur = state;
    state = next;                             // set early: drift loop reads it
    if (cur[0] !== next[0]){
      if (cur[0]){ closePanel(); mergeKids(); unfocusDomain(cur[0]); }
      if (next[0]){
        focusGeom = focusDomain(next[0]);
        setTimeout(() => { if (state[0] === next[0]) spawnKids(next[0]); }, RM ? 0 : 480);
      }
    }
    if (next[1]) setTimeout(() => { if (state[1] === next[1]) openPanel(next[0], next[1]); },
                            cur[0] === next[0] ? 0 : (RM ? 0 : 700));
    else closePanel();
    $('#back').hidden = !next.length;
    $('#hint').classList.toggle('off', !!next.length);
  }

  addEventListener('hashchange', () => apply(parseHash()));

  field.addEventListener('click', e => {
    const kb = e.target.closest('.kid');
    if (kb){ location.hash = '#/' + state[0] + '/' + kb.dataset.slug; return; }
    const b = e.target.closest('.bubble');
    if (b && !b.classList.contains('focus')){ location.hash = '#/' + b.dataset.code; return; }
    if (!b && state.length) location.hash = state.length === 2 ? '#/' + state[0] : '#/';
  });
  $('#back').addEventListener('click', () => {
    location.hash = state.length === 2 ? '#/' + state[0] : '#/';
  });
  veil.addEventListener('click', () => { location.hash = '#/' + state[0]; });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.length)
      location.hash = state.length === 2 ? '#/' + state[0] : '#/';
  });

  /* ---------- go ---------- */
  await loadCounts();
  document.body.classList.add('noanim');
  apply(parseHash());
  setTimeout(() => document.body.classList.remove('noanim'), 80);
})();
