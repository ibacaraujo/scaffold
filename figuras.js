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

export function montarFigura(el, s) {
  el.textContent = ''
  if (!s) { el.hidden = true; return }
  el.hidden = false

  const leitura = document.createElement('p')
  leitura.className = 'fig__leitura'
  leitura.setAttribute('aria-live', 'polite')

  if (s.modo === 'maquina') {
    const caixa = document.createElement('div')
    caixa.className = 'fig__maquina'
    let x = s.inicial
    const desenha = () => {
      caixa.innerHTML = `<div class="fig__mq"><span>entra</span><strong>${fmt(x)}</strong></div>
        <div class="fig__mq fig__mq--regra">${s.regra}</div>
        <div class="fig__mq fig__mq--sai"><span>sai</span><strong>${fmt(s.f(x))}</strong></div>`
    }
    el.append(caixa, controle('Entrada', s.min, s.max, s.passo, x, (v) => { x = v; desenha() }))
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
      leitura.textContent = `Entrada x = ${fmt(x)}, altura = ${fmt(s.f(x))}`
    }
    controles.append(controle('Entrada', s.min, s.max, s.passo, x, (v) => { x = v; desenha() }))
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
