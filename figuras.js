// As figuras da parte de Matemática: gráficos em SVG que se mexem com um controle.
const W = 640, H = 340
const OURO = '#f5d78e', CURVA = '#eef2ff', EIXO = '#7f90ba', GRADE = '#1c2d60'

export const fmt = (n) => {
  const r = Math.round(n * 1000) / 1000
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',')
}

function escala(xr, yr) {
  const px = (x) => ((x - xr[0]) / (xr[1] - xr[0])) * W
  const py = (y) => H - ((y - yr[0]) / (yr[1] - yr[0])) * H
  return { px, py }
}

function base(xr, yr, f) {
  const { px, py } = escala(xr, yr)
  const p = []
  const passoX = xr[1] - xr[0] > 12 ? 2 : 1
  const passoY = yr[1] - yr[0] > 12 ? 2 : 1
  for (let x = Math.ceil(xr[0]); x <= xr[1]; x += passoX) {
    p.push(`<line x1="${px(x)}" x2="${px(x)}" y1="0" y2="${H}" stroke="${GRADE}"/>`)
    if (x !== 0 && x !== xr[0] && x !== xr[1] && yr[0] <= 0 && yr[1] >= 0) p.push(`<text x="${px(x)}" y="${py(0) + 18}" text-anchor="middle" class="fig__n">${x}</text>`)
  }
  for (let y = Math.ceil(yr[0]); y <= yr[1]; y += passoY) {
    p.push(`<line y1="${py(y)}" y2="${py(y)}" x1="0" x2="${W}" stroke="${GRADE}"/>`)
    if (y !== 0 && y !== yr[0] && y !== yr[1] && y - yr[0] > 0.5 && yr[1] - y > 0.5 && xr[0] <= 0 && xr[1] >= 0) p.push(`<text x="${px(0) - 8}" y="${py(y) + 4}" text-anchor="end" class="fig__n">${y}</text>`)
  }
  if (yr[0] <= 0 && yr[1] >= 0) p.push(`<line x1="0" x2="${W}" y1="${py(0)}" y2="${py(0)}" stroke="${EIXO}" stroke-width="1.5"/>`)
  if (xr[0] <= 0 && xr[1] >= 0) p.push(`<line y1="0" y2="${H}" x1="${px(0)}" x2="${px(0)}" stroke="${EIXO}" stroke-width="1.5"/>`)
  if (f) {
    const pts = []
    for (let i = 0; i <= 240; i++) {
      const x = xr[0] + ((xr[1] - xr[0]) * i) / 240
      pts.push(`${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`)
    }
    p.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${CURVA}" stroke-width="3"/>`)
  }
  return { p, px, py }
}


// O grafo da conta s = x·y, t = s + z, L = t·w (exercício depois da aula). Cada nó mostra o valor e o
// gradiente; os nós da pergunta aparecem com "?" em dourado.
const GRAFO = {
  valor: { x: 3, y: -2, z: 4, w: 5, s: -6, t: -2, L: -10 },
  pos: { x: [52, 70], y: [52, 180], s: [232, 125], z: [232, 262], t: [412, 193], w: [412, 300], L: [590, 246] },
  ops: [['×', 142, 125, ['x', 'y'], 's'], ['+', 322, 193, ['s', 'z'], 't'], ['×', 502, 246, ['t', 'w'], 'L']],
}
function desenharGrafo(s) {
  const { valor, pos, ops } = GRAFO
  const pergunta = (n) => s.perguntas.includes(n)
  const mostraValor = (n) => s.valores === true || (Array.isArray(s.valores) && s.valores.includes(n))
  const p = []
  const nw = 84, nh = 70
  for (const [sinal, ox, oy, de, para] of ops) {
    for (const d of de) p.push(`<path d="M${pos[d][0] + nw / 2} ${pos[d][1]} L${ox - 17} ${oy}" stroke="${EIXO}" stroke-width="1.5" fill="none"/>`)
    p.push(`<path d="M${ox + 17} ${oy} L${pos[para][0] - nw / 2} ${pos[para][1]}" stroke="${EIXO}" stroke-width="1.5" fill="none"/>`)
    p.push(`<circle cx="${ox}" cy="${oy}" r="17" fill="#24376c"/><text x="${ox}" y="${oy + 6}" text-anchor="middle" fill="${CURVA}" font-size="18" style="font-family:var(--mono)">${sinal}</text>`)
  }
  for (const [n, [cx, cy]] of Object.entries(pos)) {
    const q = pergunta(n)
    const v = mostraValor(n) ? fmt(valor[n]) : '?'
    const temG = n in s.grads
    const g = temG ? fmt(s.grads[n]) : (q && s.valores === true ? '?' : '')
    const borda = q ? OURO : '#24376c'
    p.push(`<rect x="${cx - nw / 2}" y="${cy - nh / 2}" width="${nw}" height="${nh}" rx="10" fill="#071131" stroke="${borda}" stroke-width="${q ? 2.5 : 1.5}"/>`)
    p.push(`<text x="${cx - nw / 2 + 10}" y="${cy - 14}" fill="${EIXO}" font-size="14" style="font-family:var(--mono)">${n}</text>`)
    p.push(`<text x="${cx + nw / 2 - 10}" y="${cy - 12}" text-anchor="end" fill="#fff" font-size="20" font-weight="500" style="font-family:var(--mono)">${v}</text>`)
    if (g !== '') p.push(`<text x="${cx - nw / 2 + 10}" y="${cy + 24}" fill="${OURO}" font-size="14" style="font-family:var(--mono)">grad ${g}</text>`)
  }
  return p.join('')
}

const ponto = (x, y, cor = OURO, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}" stroke="#071131" stroke-width="2.5"/>`

function controle(rotulo, min, max, passo, valor, aoMudar) {
  const l = document.createElement('label')
  l.className = 'fig__controle'
  const nome = document.createElement('span')
  nome.textContent = rotulo
  const i = document.createElement('input')
  Object.assign(i, { type: 'range', min, max, step: passo, value: valor })
  i.setAttribute('aria-label', rotulo)
  i.addEventListener('input', () => aoMudar(Number(i.value)))
  l.append(nome, i)
  return l
}

// ── Pesquisa: a capa de um paper, com o método num desenho que se percorre em etapas.
// O desenho é próprio (não é a figura do paper): segue o método do paper, etapa por etapa.
const DESENHOS = {
  // Latent feedback (Huang et al., 2026): each token's top-layer state enters the next token's input. Research is in English.
  feedback(etapa) {
    const C = { luz: OURO, caixa: '#24376c', txt: CURVA, apag: 0.3 }
    const t = (x, y, s, cor = C.txt, tam = 15, anc = 'middle', peso = 500) => `<text x="${x}" y="${y}" text-anchor="${anc}" fill="${cor}" font-size="${tam}" font-weight="${peso}" style="font-family:var(--sans)">${s}</text>`
    const xs = [130, 320, 510], letras = ['c', 'a', 't']
    const p = [`<defs><marker id="ponta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${EIXO}"/></marker><marker id="pontaL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.luz}"/></marker></defs>`]
    const fbOn = etapa >= 2 && etapa <= 3
    if (etapa === 3) {
      xs.forEach((x) => p.push(`<rect x="${x - 70}" y="96" width="140" height="${200}" rx="14" fill="none" stroke="#a9bdf5" stroke-dasharray="5 5" opacity=".7"/>`))
      p.push(t(320, 318, 'pass 1: no gradient, only to get the states h', '#a9bdf5', 13.5))
      p.push(t(320, 340, 'pass 2: with the states fed back, and the gradient', C.luz, 13.5))
    }
    xs.forEach((x, i) => {
      p.push(`<path d="M${x} 252 L${x} 214" stroke="${EIXO}" stroke-width="2" marker-end="url(#ponta)"/>`)
      p.push(`<path d="M${x} 136 L${x} 104" stroke="${EIXO}" stroke-width="2" marker-end="url(#ponta)"/>`)
      p.push(`<rect x="${x - 34}" y="252" width="68" height="34" rx="9" fill="${C.caixa}"/>${t(x, 275, letras[i], '#fff', 18, 'middle', 600)}`)
      p.push(`<rect x="${x - 56}" y="138" width="112" height="74" rx="12" fill="${C.caixa}"/>${t(x, 172, 'layers', '#fff', 15)}${t(x, 192, 'of the model', C.txt, 12, 'middle', 400)}`)
      const hl = etapa === 1 || fbOn
      p.push(`<circle cx="${x}" cy="84" r="20" fill="${hl ? C.luz : '#4f618f'}"/>${t(x, 90, 'h', hl ? '#071131' : '#fff', 17, 'middle', 600)}`)
      p.push(t(x, 40, 'predicts the next', C.txt, 12, 'middle', 400))
      p.push(`<path d="M${x} 62 L${x} 48" stroke="${EIXO}" stroke-width="1.5"/>`)
      if (i < 2) {
        const op = fbOn ? 1 : etapa === 0 ? 0 : 0.15
        p.push(`<path d="M${x + 20} 84 C ${x + 110} 84, ${x + 80} 268, ${xs[i + 1] - 38} 268" fill="none" stroke="${C.luz}" stroke-width="2.5" opacity="${op}" marker-end="url(#pontaL)"/>`)
        if (fbOn) p.push(t(x + 70, 238, 'W rms(h)', C.luz, 13, 'middle', 600))
      }
    })
    if (etapa === 0) p.push(t(320, 324, 'each token starts again from the bottom; the state h is thrown away', C.txt, 13.5))
    if (etapa === 1) p.push(t(320, 324, 'h: the last layer\'s state, the most processed summary', C.luz, 13.5))
    if (etapa === 2) p.push(t(320, 324, 'u = e + W rms(previous h): each token starts knowing what the last one concluded', C.luz, 13.5))
    if (etapa === 4) {
      p.length = 1
      const bar = (y, rot, partes) => {
        p.push(t(150, y + 19, rot, '#fff', 14, 'end'))
        let x = 165
        for (const [w, cor, txt] of partes) {
          p.push(`<rect x="${x}" y="${y}" width="${w}" height="28" rx="5" fill="${cor}"/>`)
          if (txt) p.push(t(x + w / 2, y + 19, txt, '#071131', 12.5, 'middle', 600))
          x += w + 4
        }
      }
      p.push(t(320, 50, 'the same compute, spent two ways', C.txt, 15))
      bar(90, 'Transformer', [[205, '#a9bdf5', 'epoch 1'], [205, '#a9bdf5', 'epoch 2']])
      bar(160, 'latent feedback', [[170, OURO, 'epoch 1'], [50, '#f0d0a0', 'extra'], [120, OURO, 'epoch 2 (part)'], [30, '#f0d0a0', '']])
      p.push(t(320, 240, 'more epochs: each repeat is worth less', '#a9bdf5', 13.5))
      p.push(t(320, 265, 'feedback: fewer epochs, more work per token', C.luz, 13.5))
      p.push(t(320, 310, 'on repeated data, feedback reaches the same loss with up to 48% less compute', '#fff', 13.5))
    }
    return p.join('')
  },
}

function capaDoPaper(el, s, leitura) {
  const caixa = document.createElement('div')
  caixa.className = 'pc'
  caixa.innerHTML = `<p class="pc__tag">${s.tag}</p><h3 class="pc__t">${s.titulo}</h3>
    <p class="pc__a">${s.autores} · <a href="${s.url}" target="_blank" rel="noopener">${s.abrir || 'abrir o paper'}</a></p>`
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 640 350')
  svg.setAttribute('class', 'pc__svg')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', s.rotulo)
  const etapas = document.createElement('div')
  etapas.className = 'pc__etapas'
  const fala = document.createElement('p')
  fala.className = 'pc__fala'
  fala.setAttribute('aria-live', 'polite')
  let e = 0
  const desenha = () => {
    svg.innerHTML = DESENHOS[s.desenho](e)
    fala.innerHTML = s.etapas[e][1]
    etapas.querySelectorAll('button').forEach((b, i) => b.classList.toggle('pc__etapa--atual', i === e))
  }
  s.etapas.forEach(([nome], i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'pc__etapa'
    b.textContent = `${i + 1}. ${nome}`
    b.onclick = () => { e = i; desenha() }
    etapas.append(b)
  })
  caixa.append(svg, etapas, fala)
  el.append(caixa)
  desenha()
}

// ── The worth of each repeated epoch: epoch k is worth e^(−(k−1)/R*) of a fresh one (Muennighoff et al., 2023). Research, in English.
function valorDasEpocas(el, s) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('class', 'fig__svg')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', 'Bars with the worth of each repeated epoch')
  const controles = document.createElement('div')
  controles.className = 'fig__controles'
  const leitura = document.createElement('p')
  leitura.className = 'fig__leitura'
  leitura.setAttribute('aria-live', 'polite')
  el.append(svg, controles, leitura)
  let r = s.rEstrela, n = s.epocas
  const txt = (x, y, t, cor, tam = 15) => `<text x="${x}" y="${y}" text-anchor="middle" fill="${cor}" font-size="${tam}" style="font-family:var(--mono)">${t}</text>`
  const desenha = () => {
    const p = [`<line x1="40" x2="${W - 30}" y1="280" y2="280" stroke="${EIXO}" stroke-width="1.5"/>`]
    const passo = (W - 80) / 8, larg = passo - 18
    let soma = 0
    for (let k = 1; k <= n; k++) {
      const v = Math.exp(-(k - 1) / r), h = v * 210, x = 40 + passo * (k - 1) + 9
      soma += v
      p.push(`<rect x="${x}" y="${280 - h}" width="${larg}" height="${h}" rx="6" fill="${k === 1 ? '#a9bdf5' : OURO}"/>`)
      p.push(txt(x + larg / 2, 270 - h, v.toFixed(3), '#fff'), txt(x + larg / 2, 304, `${k}`, CURVA, 14))
    }
    p.push(txt(W / 2, 334, 'epoch', EIXO, 13))
    svg.innerHTML = p.join('')
    leitura.textContent = `${n} ${n === 1 ? 'epoch is' : 'epochs are'} worth ${soma.toFixed(3)} fresh epochs in total.`
  }
  controles.append(controle('R*: how slowly the worth decays', 0.5, 10, 0.5, r, (v) => { r = v; desenha() }))
  controles.append(controle('Number of epochs', 1, 8, 1, n, (v) => { n = v; desenha() }))
  desenha()
}

// ── Research: uma figura do próprio paper, com uma animação por cima. Cada passo escurece o resto da figura,
// desenha o contorno da parte da vez e explica em texto. As marcas usam as coordenadas da imagem original.
function figuraDoPaper(el, s) {
  const caixa = document.createElement('div')
  caixa.className = 'pf'
  caixa.innerHTML = `<p class="pf__fonte">${s.fonte}</p>
    <div class="pf__img"><img src="${s.src}" alt="${s.alt}"><svg viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="none" aria-hidden="true"></svg></div>
    <p class="pf__t" aria-live="polite"></p>
    <div class="pf__ctl"><button type="button" class="pf__b" data-d="-1" aria-label="Previous">◀</button><span class="pf__n"></span><button type="button" class="pf__b" data-d="1" aria-label="Next">▶</button><button type="button" class="pf__play">Play</button></div>`
  el.append(caixa)
  const svg = caixa.querySelector('svg'), txt = caixa.querySelector('.pf__t'), n = caixa.querySelector('.pf__n'), play = caixa.querySelector('.pf__play')
  const id = 'pf' + Math.random().toString(36).slice(2, 8)
  let i = 0, relogio = null
  const desenha = () => {
    const passo = s.passos[i], marcas = passo.marcas || []
    const furos = marcas.map((m) => m.r ? `<circle cx="${m.x}" cy="${m.y}" r="${m.r + 6}" fill="#000"/>` : `<rect x="${m.x - 6}" y="${m.y - 6}" width="${m.w + 12}" height="${m.h + 12}" rx="10" fill="#000"/>`).join('')
    const contornos = marcas.map((m) => m.r ? `<circle class="pf__m" cx="${m.x}" cy="${m.y}" r="${m.r + 6}" pathLength="1"/>` : `<rect class="pf__m" x="${m.x - 6}" y="${m.y - 6}" width="${m.w + 12}" height="${m.h + 12}" rx="10" pathLength="1"/>`).join('')
    svg.innerHTML = marcas.length
      ? `<defs><mask id="${id}"><rect width="${s.w}" height="${s.h}" fill="#fff"/>${furos}</mask></defs><rect class="pf__sombra" width="${s.w}" height="${s.h}" mask="url(#${id})"/>${contornos}`
      : ''
    txt.innerHTML = passo.t
    n.textContent = `${i + 1} / ${s.passos.length}`
    caixa.querySelector('[data-d="-1"]').disabled = i === 0
    caixa.querySelector('[data-d="1"]').disabled = i === s.passos.length - 1
  }
  const parar = () => { clearInterval(relogio); relogio = null; play.textContent = 'Play' }
  caixa.querySelectorAll('.pf__b').forEach((b) => { b.onclick = () => { parar(); i = Math.max(0, Math.min(s.passos.length - 1, i + +b.dataset.d)); desenha() } })
  play.onclick = () => {
    if (relogio) { parar(); return }
    if (i === s.passos.length - 1) i = 0
    else i++
    desenha()
    play.textContent = 'Pause'
    relogio = setInterval(() => { if (i >= s.passos.length - 1) { parar(); return } i++; desenha() }, 4200)
  }
  desenha()
}

export function montarFigura(el, s) {
  el.textContent = ''
  if (!s) { el.hidden = true; return }
  el.hidden = false

  if (s.modo === 'paper') { capaDoPaper(el, s); return }
  if (s.modo === 'epocas') { valorDasEpocas(el, s); return }
  if (s.modo === 'paperfig') { figuraDoPaper(el, s); return }

  const leitura = document.createElement('p')
  leitura.className = 'fig__leitura'
  leitura.setAttribute('aria-live', 'polite')

  if (s.modo === 'grafo') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.setAttribute('class', 'fig__svg')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', 'Grafo da conta: s = x vezes y, t = s mais z, L = t vezes w')
    svg.innerHTML = desenharGrafo(s)
    leitura.textContent = s.valores === true ? 'Valor em branco, gradiente em dourado.' : 'Os valores de entrada já estão no grafo.'
    el.append(svg, leitura)
    return
  }

  if (s.modo === 'barras' || s.modo === 'faixa') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.setAttribute('class', 'fig__svg')
    svg.setAttribute('role', 'img')
    const controles = document.createElement('div')
    controles.className = 'fig__controles'
    el.append(svg, controles, leitura)
    const CORES = ['#a9bdf5', OURO, '#a8e3c5', '#f0a3a3', '#c8b6ff']
    const txt = (x, y, t, cor, tam = 16, anc = 'middle', peso = 400) => `<text x="${x}" y="${y}" text-anchor="${anc}" fill="${cor}" font-size="${tam}" font-weight="${peso}" style="font-family:var(--mono)">${t}</text>`

    if (s.modo === 'barras') {
      // Contagens que viram probabilidades: cada barra é uma contagem; embaixo, a fração do total.
      svg.setAttribute('aria-label', 'Barras com as contagens e as probabilidades de cada letra')
      const c = [...s.contagens]
      const desenha = () => {
        const total = c.reduce((a, b) => a + b, 0)
        const max = Math.max(s.max || 10, ...c)
        const n = c.length, larg = Math.min(110, (W - 120) / n - 30), passo = (W - 120) / n
        const p = [`<line x1="80" x2="${W - 40}" y1="250" y2="250" stroke="${EIXO}" stroke-width="1.5"/>`]
        c.forEach((v, i) => {
          const cx = 80 + passo * (i + 0.5), h = (v / max) * 190
          p.push(`<rect x="${cx - larg / 2}" y="${250 - h}" width="${larg}" height="${h}" rx="6" fill="${CORES[i % CORES.length]}"/>`)
          p.push(txt(cx, 240 - h, v, '#fff', 18, 'middle', 500))
          p.push(txt(cx, 278, s.rotulos[i], CURVA, 20, 'middle', 500))
          p.push(txt(cx, 312, total ? fmt(v / total) : '–', OURO, 16))
        })
        p.push(txt(64, 278, 'letra', EIXO, 13, 'end'), txt(64, 312, 'prob.', EIXO, 13, 'end'))
        svg.innerHTML = p.join('')
        leitura.textContent = total ? `Total ${total}. As probabilidades somam ${fmt(c.reduce((a, v) => a + v / total, 0))}.` : 'Todas as contagens são zero.'
      }
      if (s.mexer) s.rotulos.forEach((r, i) => controles.append(controle(`Contagem de ${r}`, 0, s.max || 10, 1, c[i], (v) => { c[i] = v; desenha() })))
      desenha()
    } else {
      // O sorteio: a faixa de 0 a 1 é dividida pelas probabilidades; o número sorteado cai num pedaço.
      svg.setAttribute('aria-label', 'Faixa de 0 a 1 dividida pelas probabilidades de cada letra')
      let u = s.inicial
      const desenha = () => {
        const x0 = 40, x1 = W - 40, px = (t) => x0 + (x1 - x0) * t
        const p = [], nomes = []
        let acc = 0, sai = s.rotulos[s.rotulos.length - 1]
        s.probs.forEach((pr, i) => {
          const a = acc, b = acc + pr
          if (u >= a && u < b) sai = s.rotulos[i]
          p.push(`<rect x="${px(a)}" y="120" width="${px(b) - px(a)}" height="80" fill="${CORES[i % CORES.length]}" opacity="${sai === s.rotulos[i] ? 1 : 0.45}" stroke="#071131" stroke-width="2"/>`)
          nomes.push([(px(a) + px(b)) / 2, s.rotulos[i]])
          p.push(txt(px(a), 228, fmt(a), EIXO, 13))
          acc = b
        })
        p.push(txt(px(1), 228, '1', EIXO, 13))
        p.push(`<path d="M${px(u)} 70 L${px(u)} 210" stroke="#fff" stroke-width="2.5"/><circle cx="${px(u)}" cy="66" r="7" fill="#fff"/>`)
        p.push(txt(px(u), 50, `sorteado: ${fmt(u)}`, '#fff', 15))
        for (const [x, r] of nomes) p.push(`<circle cx="${x}" cy="161" r="17" fill="#071131" opacity=".85"/>`, txt(x, 168, r, '#fff', 20, 'middle', 600))
        svg.innerHTML = p.join('')
        leitura.textContent = `O número ${fmt(u)} cai no pedaço de "${sai}": sai a letra ${sai}.`
      }
      controles.append(controle('Número sorteado, entre 0 e 1', 0, 0.99, 0.01, u, (v) => { u = v; desenha() }))
      desenha()
    }
    return
  }

  if (s.modo === 'maquina') {
    const caixa = document.createElement('div')
    caixa.className = 'fig__maquina'
    let x = s.inicial
    const desenha = () => {
      caixa.innerHTML = `<div class="fig__mq"><span>recebe</span><strong>${fmt(x)}</strong></div>
        <div class="fig__mq fig__mq--regra">${s.regra}</div>
        <div class="fig__mq fig__mq--sai"><span>resulta</span><strong>${fmt(s.f(x))}</strong></div>`
    }
    el.append(caixa, controle('Valor recebido', s.min, s.max, s.passo, x, (v) => { x = v; desenha() }))
    desenha()
    return
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('class', 'fig__svg')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', s.nome ? `Gráfico de ${s.nome}` : 'Plano com os eixos x e y')
  const controles = document.createElement('div')
  controles.className = 'fig__controles'
  el.append(svg, controles, leitura)

  if (s.modo === 'plano') {
    const e = { x: 0, y: 0 }
    const desenha = () => {
      const { p, px, py } = base(s.x, s.y)
      p.push(ponto(px(e.x), py(e.y)))
      svg.innerHTML = p.join('')
      leitura.textContent = `O ponto está em (${fmt(e.x)}, ${fmt(e.y)})`
    }
    controles.append(
      controle('x', s.x[0], s.x[1], 1, e.x, (v) => { e.x = v; desenha() }),
      controle('y', s.y[0], s.y[1], 1, e.y, (v) => { e.y = v; desenha() }),
    )
    desenha()
  } else if (s.modo === 'ponto') {
    let x = s.inicial
    const desenha = () => {
      const { p, px, py } = base(s.x, s.y, s.f)
      p.push(ponto(px(x), py(s.f(x))))
      svg.innerHTML = p.join('')
      leitura.textContent = `Recebe ${fmt(x)}, resulta ${fmt(s.f(x))}`
    }
    controles.append(controle('Valor recebido', s.min, s.max, s.passo, x, (v) => { x = v; desenha() }))
    desenha()
  } else if (s.modo === 'dois') {
    const e = { a: s.a, b: s.b }
    const desenha = () => {
      const { p, px, py } = base(s.x, s.y, s.f)
      const ya = s.f(e.a), yb = s.f(e.b)
      p.push(`<path d="M${px(e.a)} ${py(ya)} L${px(e.b)} ${py(ya)} L${px(e.b)} ${py(yb)}" fill="none" stroke="${OURO}" stroke-width="2.5" stroke-dasharray="7 6"/>`)
      p.push(ponto(px(e.a), py(ya)), ponto(px(e.b), py(yb)))
      svg.innerHTML = p.join('')
      leitura.textContent = e.a === e.b
        ? 'Escolha dois pontos diferentes.'
        : `De x = ${fmt(e.a)} até x = ${fmt(e.b)}: subiu ${fmt(yb - ya)}, andou ${fmt(e.b - e.a)}`
    }
    controles.append(
      controle('Primeiro ponto', s.x[0], s.x[1], 1, e.a, (v) => { e.a = v; desenha() }),
      controle('Segundo ponto', s.x[0], s.x[1], 1, e.b, (v) => { e.b = v; desenha() }),
    )
    desenha()
  } else if (s.modo === 'secante') {
    const HS = [1, 0.5, 0.25, 0.1, 0.01]
    let i = 0
    const desenha = () => {
      const { p, px, py } = base(s.x, s.y, s.f)
      const h = HS[i], y0 = s.f(s.x0), y1 = s.f(s.x0 + h), m = (y1 - y0) / h
      const xa = s.x[0], xb = s.x[1]
      p.push(`<line x1="${px(xa)}" y1="${py(y0 + m * (xa - s.x0))}" x2="${px(xb)}" y2="${py(y0 + m * (xb - s.x0))}" stroke="${OURO}" stroke-width="2.5"/>`)
      p.push(ponto(px(s.x0 + h), py(y1), '#a9bdf5', 6), ponto(px(s.x0), py(y0)))
      svg.innerHTML = p.join('')
      leitura.textContent = `h = ${fmt(h)}, inclinação do trecho = ${fmt(m)}`
    }
    controles.append(controle('Diminuir o h', 0, HS.length - 1, 1, 0, (v) => { i = v; desenha() }))
    desenha()
  } else if (s.modo === 'tangente') {
    let x = s.inicial
    const desenha = () => {
      const { p, px, py } = base(s.x, s.y, s.f)
      const y = s.f(x), m = s.df(x)
      const xa = s.x[0], xb = s.x[1]
      p.push(`<line x1="${px(xa)}" y1="${py(y + m * (xa - x))}" x2="${px(xb)}" y2="${py(y + m * (xb - x))}" stroke="${OURO}" stroke-width="2.5"/>`)
      p.push(ponto(px(x), py(y)))
      svg.innerHTML = p.join('')
      leitura.textContent = `Em x = ${fmt(x)}, a inclinação é ${fmt(m)}`
    }
    controles.append(controle('Ponto', s.min, s.max, s.passo, x, (v) => { x = v; desenha() }))
    desenha()
  }
}
