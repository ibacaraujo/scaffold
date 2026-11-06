import { CAPITULOS } from './licoes.js'
import { montarFigura } from './figuras.js'
import { TRILHA, CURSO } from './trilha.js'
import { PESQUISA } from './pesquisa.js'

const $ = (s) => document.querySelector(s)
const licoesDa = (parte) => parte.modulos.flatMap((m) => m.licoes)
// Cada capítulo tem as partes de antes da aula (Matemática e Programação) e, às vezes, a de depois.
const partesAntes = (c) => c.partes.filter((p) => p.id !== 'depois')
const parteDepois = (c) => c.partes.find((p) => p.id === 'depois')
const licoesAntes = (c) => partesAntes(c).flatMap(licoesDa)
const licoesDepois = (c) => (parteDepois(c) ? licoesDa(parteDepois(c)) : [])
const LICOES = CAPITULOS.flatMap((c) => c.partes.flatMap(licoesDa))
const parteDe = (l) => CAPITULOS.flatMap((c) => c.partes).find((p) => licoesDa(p).includes(l))
const capDe = (l) => CAPITULOS.find((c) => c.partes.some((p) => licoesDa(p).includes(l)))
const capN = (n) => CAPITULOS.find((c) => c.n === n)
const CHAVE = 'scaffold_v2'
const LIMITE_MS = 10000

// ── Progresso: só neste aparelho. A página funciona mesmo sem armazenamento.
let salvo = { feito: {}, codigo: {}, aulas: {} }
try { salvo = { ...salvo, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') } } catch {}
const guardar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(salvo)) } catch {} }

// ── Onde estamos: #funcao/0
let licao = LICOES[0], passoI = 0, erros = 0, rodando = false
const idDoPasso = (l, i) => `${l.id}.${i}`
const passo = () => licao.passos[passoI]
const ehCodigo = (p) => p.inicio !== undefined

// Telas fora da lição: #inicio e #trilha. Sem nada no endereço, abre o início.
let tela = 'inicio'
function lerHash() {
  const h = location.hash.slice(1)
  if (h === '' || h === 'inicio' || h === 'trilha' || h === 'pesquisa') { tela = h || 'inicio'; return true }
  tela = 'licao'
  const [id, i] = h.split('/')
  const l = LICOES.find((x) => x.id === id)
  if (l) { licao = l; passoI = Math.min(Math.max(Number(i) || 0, 0), l.passos.length - 1); return true }
  return false
}
function primeiroPorFazer(lista = LICOES) {
  for (const l of lista) for (let i = 0; i < l.passos.length; i++) if (!salvo.feito[idDoPasso(l, i)]) return [l, i]
  return [lista[0], 0]
}
const ir = (l, i) => { location.hash = `${l.id}/${i}` }
function seguinte() {
  if (passoI + 1 < licao.passos.length) return [licao, passoI + 1]
  const n = LICOES[LICOES.indexOf(licao) + 1]
  return n ? [n, 0] : null
}
function anterior() {
  if (passoI > 0) return [licao, passoI - 1]
  const n = LICOES[LICOES.indexOf(licao) - 1]
  return n ? [n, n.passos.length - 1] : null
}

// ── O editor
const editor = CodeMirror($('#editor'), {
  mode: 'python', theme: 'noite', lineNumbers: true, indentUnit: 4, tabSize: 4, viewportMargin: Infinity,
  extraKeys: {
    Tab: (cm) => cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('    '),
    'Ctrl-Enter': () => executar(), 'Cmd-Enter': () => executar(),
  },
})
let carregandoPasso = false
editor.on('change', () => {
  if (carregandoPasso || !ehCodigo(passo())) return
  const id = idDoPasso(licao, passoI)
  if (editor.getValue() === passo().inicio) delete salvo.codigo[id]
  else salvo.codigo[id] = editor.getValue()
  guardar()
})

// ── O Python: só abre quando a pessoa chega a um passo de programação.
let worker = null, python = 'fechado', vigia = null, idAtual = 0
function abrirPython() {
  python = 'carregando'
  worker = new Worker('worker.js')
  worker.onmessage = ({ data }) => {
    if (data.tipo === 'pronto') { python = 'pronto'; mostrarEstadoPython() }
    else if (data.tipo === 'falhou') { python = 'falhou'; mostrarEstadoPython() }
    else if (data.id !== idAtual) return
    else if (data.tipo === 'executando') { vigia = setTimeout(estourou, LIMITE_MS); aviso('Executando…') }
    else if (data.tipo === 'resultado') { clearTimeout(vigia); terminou(data.res) }
  }
  worker.onerror = () => { python = 'falhou'; mostrarEstadoPython() }
}
function mostrarEstadoPython() {
  if (python === 'falhou') { aviso('O Python não carregou. Confira a internet e recarregue a página.'); $('#rodar').disabled = true; return }
  if (!rodando && python === 'pronto') aviso('')
}
function estourou() {
  worker.terminate()
  abrirPython()
  fimDeRodada()
  $('#saida').textContent = ''
  mostrarResultado($('#resultado'), 'erro', 'O código ficou executando por mais de 10 segundos e foi parado. Alguma repetição pode não ter fim.')
}
const aviso = (t) => { $('#estado').textContent = t }

const AJUDA_ERRO = {
  SyntaxError: 'O Python não entendeu a escrita desta linha. Veja se falta um parêntese, os dois-pontos, as aspas ou um sinal.',
  IndentationError: 'O recuo está errado. A linha dentro de uma função ou de um for começa com 4 espaços.',
  TabError: 'O recuo está misturado. Use só espaços.',
  NameError: 'O Python não conhece este nome. Veja se foi escrito igual em todos os lugares, se foi criado antes de ser usado, e se um texto ficou sem aspas.',
  TypeError: 'A conta recebeu algo de um tipo que ela não aceita. Veja se a função tem um return.',
  ZeroDivisionError: 'Houve uma divisão por zero.',
  IndexError: 'A lista não tem essa posição. Lembre que a contagem começa do zero.',
  ModuleNotFoundError: 'Esta biblioteca não existe aqui. Confira o nome no import.',
}

function executar() {
  if (rodando || python === 'falhou' || !ehCodigo(passo())) return
  if (!worker) abrirPython()
  rodando = true
  $('#rodar').disabled = true
  $('#saida').textContent = ''
  $('#figura').hidden = true
  $('#resultado').hidden = true
  aviso(python === 'pronto' ? 'Executando…' : 'Preparando o Python (só na primeira vez, leva alguns segundos)…')
  idAtual++
  worker.postMessage({ id: idAtual, codigo: editor.getValue(), checagem: passo().checagem })
}
function fimDeRodada() {
  rodando = false
  $('#rodar').disabled = false
  aviso('')
}
function marcarFeito() {
  salvo.feito[idDoPasso(licao, passoI)] = true
  guardar()
  desenharPontos()
  desenharLista()
}
function errou() {
  erros++
  if (erros >= 2) $('#ver-solucao').hidden = false
}
function terminou(r) {
  fimDeRodada()
  $('#saida').textContent = r.saida
  if (r.figura) { $('#figura').src = 'data:image/png;base64,' + r.figura; $('#figura').hidden = false }
  if (r.ok) {
    marcarFeito()
    mostrarResultado($('#resultado'), 'ok')
    return
  }
  errou()
  if (r.erro) {
    const onde = r.erro.linha ? `Linha ${r.erro.linha}. ` : ''
    const ajuda = AJUDA_ERRO[r.erro.tipo] || 'O código parou com um erro.'
    mostrarResultado($('#resultado'), 'erro', `${onde}${ajuda}`, `${r.erro.tipo}: ${r.erro.msg}`)
  } else mostrarResultado($('#resultado'), 'erro', r.falha)
}

// ── A matemática: campos para preencher ou opções para escolher
const lerNumero = (t) => Number(t.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'))
function montarExercicio(p) {
  const cx = $('#respostas')
  cx.textContent = ''
  $('#resultado-mat').hidden = true
  if (p.opcoes) {
    p.opcoes.forEach((o) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'opcao'
      b.textContent = o.t
      b.onclick = () => {
        if (o.certa) {
          cx.querySelectorAll('.opcao').forEach((x) => { x.disabled = true })
          b.classList.add('opcao--certa')
          marcarFeito()
          mostrarResultado($('#resultado-mat'), 'ok')
        } else {
          b.classList.add('opcao--errada')
          errou()
          mostrarResultado($('#resultado-mat'), 'erro', o.por || p.erro)
        }
      }
      cx.append(b)
    })
    return
  }
  const f = document.createElement('form')
  f.className = 'campos'
  f.noValidate = true
  p.campos.forEach((c, i) => {
    const l = document.createElement('label')
    l.className = 'campo'
    const s = document.createElement('span')
    s.textContent = c.rotulo
    const inp = document.createElement('input')
    Object.assign(inp, { type: 'text', inputMode: 'text', autocomplete: 'off' })
    inp.dataset.i = i
    l.append(s, inp)
    f.append(l)
  })
  const b = document.createElement('button')
  b.className = 'botao botao--verificar'
  b.id = 'verificar'
  b.textContent = 'Verificar'
  f.append(b)
  f.onsubmit = (e) => {
    e.preventDefault()
    const inputs = [...f.querySelectorAll('input')]
    let vazio = false, certo = true
    inputs.forEach((inp, i) => {
      const t = inp.value.trim()
      if (!t) vazio = true
      const ok = t && Math.abs(lerNumero(t) - p.campos[i].resposta) < (p.campos[i].tol ?? 1e-6)
      if (!ok) certo = false
      inp.classList.toggle('campo--errado', !!t && !ok)
      inp.classList.toggle('campo--certo', !!ok)
    })
    if (vazio && !certo) { mostrarResultado($('#resultado-mat'), 'erro', inputs.length > 1 ? 'Preencha todos os campos.' : 'Escreva a sua resposta.'); return }
    if (certo) { marcarFeito(); mostrarResultado($('#resultado-mat'), 'ok'); return }
    errou()
    mostrarResultado($('#resultado-mat'), 'erro', p.erro)
  }
  cx.append(f)
}

// ── O resultado
function mostrarResultado(box, tipo, msg, tecnico) {
  box.hidden = false
  box.className = `resultado resultado--${tipo}`
  box.textContent = ''
  const add = (tag, txt, cls) => { const e = document.createElement(tag); if (txt) e.textContent = txt; if (cls) e.className = cls; box.append(e); return e }
  if (tipo === 'erro') {
    add('p', msg, 'resultado__t')
    if (tecnico) add('p', tecnico, 'resultado__tec')
    return
  }
  const fimDaLicao = passoI === licao.passos.length - 1
  add('p', 'Certo.', 'resultado__t')
  if (passo().certo) add('p', passo().certo, 'resultado__nota')
  const s = seguinte()
  const cap = capDe(licao), noDepois = parteDe(licao).id === 'depois'
  const capSeg = s && capDe(s[0])
  const botao = (texto, aoClicar) => { const b = add('button', texto, 'botao'); b.id = 'avancar'; b.type = 'button'; b.onclick = aoClicar; return b }
  const vaiParaDepois = s && !noDepois && parteDe(s[0]).id === 'depois'
  const fimDoCapitulo = !noDepois && fimDaLicao && (!s || capSeg !== cap)
  if (vaiParaDepois || fimDoCapitulo) {
    // Entre o capítulo e o que vem depois fica a aula: a pessoa assiste antes de seguir.
    const n = add('p', '', 'resultado__nota')
    const depois = vaiParaDepois ? 'Depois de assistir, siga para os exercícios.' : s ? `Depois de assistir, siga para o Capítulo ${capSeg.n}.` : 'O próximo capítulo ainda está sendo preparado.'
    n.innerHTML = `Você chegou ao fim do Capítulo ${cap.n}. Agora é a vez da <a href="${cap.aula}" target="_blank" rel="noopener">aula ${cap.n} do Karpathy</a>. ${depois}`
    if (s) botao(vaiParaDepois ? 'Já assisti: ir para os exercícios' : `Já assisti: ir para o Capítulo ${capSeg.n}`, () => { salvo.aulas[cap.n] = true; guardar(); ir(...s) })
  } else if (noDepois && fimDaLicao && (!s || capSeg !== cap)) {
    add('p', 'Você terminou os exercícios. Que tal uma pergunta de pesquisa?', 'resultado__nota')
    if (s) botao(`Ir para o Capítulo ${capSeg.n}`, () => ir(...s))
    if (PESQUISA[cap.n]) { const b = add('a', 'Ver as perguntas de pesquisa', s ? 'botao botao--linha' : 'botao'); b.href = '#pesquisa'; b.style.marginLeft = s ? '10px' : '' }
  } else if (s) {
    const b = add('button', fimDaLicao ? `Próxima lição: ${s[0].titulo}` : 'Próximo passo', 'botao')
    b.id = 'avancar'
    b.type = 'button'
    b.onclick = () => ir(...s)
  }
  if (matchMedia('(max-width: 900px)').matches) box.scrollIntoView({ block: 'nearest' })
}

// ── A tela de um passo
function desenharPontos() {
  $('#passos').innerHTML = licao.passos.map((_, i) => `<a href="#${licao.id}/${i}" class="ponto${i === passoI ? ' ponto--atual' : ''}${salvo.feito[idDoPasso(licao, i)] ? ' ponto--feito' : ''}" aria-label="Passo ${i + 1} de ${licao.passos.length}"></a>`).join('')
}
function desenharPasso() {
  const p = passo()
  const parte = parteDe(licao)
  erros = 0
  document.title = `${licao.titulo} · Scaffold`
  const cap = capDe(licao)
  $('#capitulo').textContent = cap.titulo
  document.querySelectorAll('.aba').forEach((a) => {
    a.classList.toggle('aba--atual', a.dataset.parte === parte.id)
    a.hidden = !cap.partes.some((p) => p.id === a.dataset.parte)
  })
  const nDaParte = licoesDa(parte).indexOf(licao) + 1
  $('#licao-n').textContent = `${parte.titulo}, lição ${nDaParte} de ${licoesDa(parte).length}`
  $('#licao-t').textContent = licao.titulo
  // O contexto da aula abre a lição: aparece só no primeiro passo.
  $('#porque').hidden = passoI !== 0
  $('#porque-t').textContent = licao.porque
  $('#texto').innerHTML = p.texto
  desenharPontos()
  $('#dica').hidden = true
  $('#dica').innerHTML = p.dica
  $('#solucao').hidden = true
  $('#solucao').textContent = p.solucao
  $('#ver-solucao').hidden = true
  const ant = anterior(), seg = seguinte()
  $('#voltar').hidden = !ant
  if (ant) $('#voltar').href = `#${ant[0].id}/${ant[1]}`
  $('#pular').hidden = !seg
  if (seg) $('#pular').href = `#${seg[0].id}/${seg[1]}`

  const codigo = ehCodigo(p)
  $('#pratica-codigo').hidden = !codigo
  $('#pratica-mat').hidden = codigo
  $('#tarefa-box').hidden = !codigo
  if (codigo) {
    $('#tarefa').innerHTML = p.tarefa
    $('#saida').textContent = ''
    $('#figura').hidden = true
    $('#resultado').hidden = true
    carregandoPasso = true
    editor.setValue(salvo.codigo[idDoPasso(licao, passoI)] ?? p.inicio)
    editor.clearHistory()
    carregandoPasso = false
    if (!worker) abrirPython()
    requestAnimationFrame(() => editor.refresh())
  } else {
    $('#tarefa-mat').innerHTML = p.tarefa
    $('#mat-in').classList.toggle('mat__in--fig', !!p.figura)
    montarFigura($('#fig'), p.figura)
    montarExercicio(p)
    $('#pratica-mat').scrollTop = 0
  }
  $('.instrucao').scrollTop = 0
  window.scrollTo(0, 0)
  desenharLista()
}

// ── A lista de lições
let capDaLista = null
function desenharLista(cap = capDaLista || capDe(licao)) {
  $('#lista-titulo').textContent = cap.titulo
  $('#link-aula').href = cap.aula
  $('#link-aula').textContent = `aula ${cap.n}`
  $('#lista-licoes').innerHTML = cap.partes.map((parte) => `
    <section class="parte">
      <h3 class="parte__t">${parte.titulo}</h3>
      ${parte.modulos.map((m) => `
        <div class="bloco${m.licoes.length ? '' : ' bloco--depois'}">
          <h4>${m.titulo}</h4>
          ${m.licoes.length ? `<ol>${m.licoes.map((l) => {
            const tudo = l.passos.every((_, i) => salvo.feito[idDoPasso(l, i)])
            return `<li><a href="#${l.id}/0" class="${l === licao ? 'atual' : ''}"><span class="marca${tudo ? ' marca--feita' : ''}" aria-hidden="true"></span>${l.titulo}${tudo ? '<span class="sr"> (feita)</span>' : ''}</a></li>`
          }).join('')}</ol>` : `<p>${m.topicos}. Em breve.</p>`}
        </div>`).join('')}
    </section>`).join('')
}
const abrirLista = (sim, n) => {
  capDaLista = n ? capN(n) : null
  if (sim) desenharLista()
  $('#lista').hidden = !sim; $('#fundo').hidden = !sim
  if (sim) $('#lista-fechar').focus()
}

// ── Início e trilha
const contar = (lista) => {
  let feitos = 0, total = 0
  lista.forEach((l) => l.passos.forEach((_, i) => { total++; if (salvo.feito[idDoPasso(l, i)]) feitos++ }))
  return { feitos, total }
}
const algumFeito = () => Object.keys(salvo.feito).length > 0
const feito = (lista) => { const c = contar(lista); return c.feitos === c.total }
function onde() {
  // Capítulo por capítulo: primeiro as lições de antes da aula; com elas feitas, os exercícios de depois
  // (se o próximo capítulo ainda não começou); com tudo feito, o começo do curso.
  const alvo = (cap, [l, i], tipo) => ({ cap, l, i, tipo, href: `#${l.id}/${i}`, comecou: algumFeito() })
  for (const [k, c] of CAPITULOS.entries()) {
    const prox = CAPITULOS[k + 1]
    if (!feito(licoesAntes(c))) return alvo(c, primeiroPorFazer(licoesAntes(c)), 'cap')
    if (licoesDepois(c).length && !feito(licoesDepois(c)) && !(prox && contar(licoesAntes(prox)).feitos)) return alvo(c, primeiroPorFazer(licoesDepois(c)), 'depois')
  }
  return alvo(CAPITULOS[0], [LICOES[0], 0], 'fim')
}
const barrinha = (c) => `<div class="barrinha"><span class="barrinha__t"><i style="width:${c.total ? Math.round(100 * c.feitos / c.total) : 0}%"></i></span>${c.feitos} de ${c.total} passos</div>`
function cartaoCapitulo(cap) {
  if (!cap.pronto) return `
    <article class="cap">
      <p class="cap__n">Capítulo ${cap.n}</p>
      <h3 class="cap__t">${cap.titulo}</h3>
      <dl class="cap__partes">
        <div><dt>Matemática</dt><dd>${cap.matematica}</dd></div>
        <div><dt>Programação</dt><dd>${cap.programacao}</dd></div>
      </dl>
      <div class="cap__acoes"><span class="selo">Em breve</span></div>
    </article>`
  const c = capN(cap.n), ant = licoesAntes(c), [lc, ic] = primeiroPorFazer(ant)
  return `
    <article class="cap">
      <p class="cap__n">Capítulo ${cap.n}</p>
      <h3 class="cap__t">${cap.titulo}</h3>
      <dl class="cap__partes">
        ${partesAntes(c).map((p) => `<div><dt>${p.titulo}</dt><dd>${p.modulos.map((m) => m.titulo).join(', ')}</dd>${barrinha(contar(licoesDa(p)))}</div>`).join('')}
      </dl>
      <div class="cap__acoes">
        ${feito(ant) ? '<span class="selo selo--ok">Capítulo feito</span>' : `<a class="botao" href="#${lc.id}/${ic}">${contar(ant).feitos ? 'Continuar' : 'Começar'}</a>`}
        <button class="link" type="button" data-abrir-lista="${cap.n}">Ver as lições</button>
      </div>
    </article>`
}
function cartaoAula(cap, comCheck = true) {
  const a = cap.aula
  return `
    <article class="aula">
      <p class="cap__n">Aula ${cap.n} do Karpathy</p>
      <h3 class="cap__t">${a.titulo}</h3>
      <p class="aula__sub">${a.subtitulo}</p>
      <p class="aula__p">${a.constroi}</p>
      <div class="aula__acoes">
        <a class="aula__ver" href="${a.url}" target="_blank" rel="noopener"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M0 0l12 7-12 7z" fill="currentColor"/></svg>Assistir no YouTube</a>
        <span class="aula__dur">${a.duracao}</span>
        ${comCheck ? `<label class="aula__vi"><input type="checkbox" data-aula="${cap.n}"${salvo.aulas[cap.n] ? ' checked' : ''}>Já assisti</label>` : ''}
      </div>
    </article>`
}
function cartaoDepois(cap) {
  const dep = licoesDepois(capN(cap.n)), depoisFeito = feito(dep)
  const pq = PESQUISA[cap.n]
  const [l, i] = primeiroPorFazer(dep)
  return `
    <article class="depois">
      <p class="cap__n">Depois da aula ${cap.n}</p>
      <h3 class="cap__t">Exercícios e perguntas de pesquisa</h3>
      <div class="depois__par">
        <div class="depois__lado">
          <h4>Exercícios</h4>
          <p>${dep.map((x) => x.titulo).join(', ')}.</p>
          ${barrinha(contar(dep))}
          <a class="botao" href="#${l.id}/${i}">${depoisFeito ? 'Rever' : contar(dep).feitos ? 'Continuar' : 'Fazer os exercícios'}</a>
        </div>
        <div class="depois__lado">
          <h4>Para pesquisar</h4>
          <p>${pq.perguntas.length} perguntas que ainda são estudadas, cada uma com um experimento que cabe no seu código e papers para começar.</p>
          <a class="botao botao--linha" href="#pesquisa">Ver as perguntas</a>
        </div>
      </div>
    </article>`
}
function desenharTrilha() {
  const capFeito = (cap) => cap.pronto && feito(licoesAntes(capN(cap.n)))
  const depFeito = (cap) => feito(licoesDepois(capN(cap.n)))
  $('#linha').innerHTML = TRILHA.map((cap) => {
    const estado = cap.pronto ? ' linha__item--pronto' : ' linha__item--breve'
    return `
      <li class="linha__item linha__item--cap${estado}${capFeito(cap) ? ' linha__item--feito' : ''}">
        <span class="linha__no" aria-hidden="true">${capFeito(cap) ? '✓' : cap.n}</span>${cartaoCapitulo(cap)}
      </li>
      <li class="linha__item linha__item--aula${estado}${salvo.aulas[cap.n] ? ' linha__item--feito' : ''}">
        <span class="linha__no" aria-hidden="true">${salvo.aulas[cap.n] ? '✓' : '<svg width="12" height="14" viewBox="0 0 12 14"><path d="M1 0l11 7-11 7z" fill="currentColor"/></svg>'}</span>${cartaoAula(cap)}
      </li>${cap.pronto && PESQUISA[cap.n] && licoesDepois(capN(cap.n)).length ? `
      <li class="linha__item linha__item--depois${depFeito(cap) ? ' linha__item--feito' : ''}">
        <span class="linha__no" aria-hidden="true">${depFeito(cap) ? '✓' : '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 13l2.5-.5L13 5l-2-2-7.5 7.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'}</span>${cartaoDepois(cap)}
      </li>` : ''}`
  }).join('')
}
function desenharPesquisa() {
  const pq = PESQUISA[1]
  $('#pesquisa-intro').textContent = pq.intro
  $('#pesquisa-aula').textContent = `Depois da aula 1 · ${pq.aula}`
  $('#perguntas').innerHTML = pq.perguntas.map((q, n) => `
    <li class="pergunta${q.projeto ? ' pergunta--projeto' : ''}">
      <div class="pergunta__topo"><span class="pergunta__n">${n + 1}</span><span class="selo">${q.selo}</span>${q.projeto ? '<span class="selo selo--ouro">Projeto sugerido</span>' : ''}</div>
      <h2 class="pergunta__t">${q.titulo}</h2>
      <p class="pergunta__q">${q.pergunta}</p>
      <dl class="pergunta__dl">
        <div><dt>O que a aula mostrou</dt><dd>${q.daAula}</dd></div>
        <div><dt>O que se sabe</dt><dd>${q.contexto}</dd></div>
        <div class="pergunta__exp"><dt>Experimento no seu código</dt><dd>${q.experimento}</dd></div>
      </dl>
      <div class="pergunta__ler">
        <h3>Para começar a ler</h3>
        <ul>${q.papers.map((p) => `<li><a href="https://www.alphaxiv.org/abs/${p.id}" target="_blank" rel="noopener">${p.t}</a> <span>${p.ano} · arXiv ${p.id}</span></li>`).join('')}</ul>
      </div>
    </li>`).join('')
}
function desenharInicio() {
  const o = onde()
  const texto = !o.comecou ? 'Começar pelo Capítulo 1' : o.tipo === 'cap' ? `Continuar o Capítulo ${o.cap.n}` : o.tipo === 'depois' ? `Exercícios depois da aula ${o.cap.n}` : 'Rever o Capítulo 1'
  $('#capa-seguir').textContent = texto
  $('#capa-seguir').href = o.href
  $('#capa-onde').hidden = !o.comecou || o.tipo === 'fim'
  $('#capa-onde').textContent = `Você parou em: Capítulo ${o.cap.n}, ${parteDe(o.l).titulo}, ${o.l.titulo}.`
  const t = TRILHA.find((x) => x.n === o.cap.n)
  $('#agora').innerHTML = cartaoCapitulo(t) + cartaoAula(t, false) + (licoesDepois(o.cap).length && PESQUISA[t.n] ? `<div class="agora__largo">${cartaoDepois(t)}</div>` : '')
}
function desenharTela() {
  const fora = tela !== 'licao'
  $('.app').classList.toggle('app--fora', fora)
  $('#tela-inicio').hidden = tela !== 'inicio'
  $('#tela-trilha').hidden = tela !== 'trilha'
  $('#tela-pesquisa').hidden = tela !== 'pesquisa'
  $('#tela-licao').hidden = fora
  $('#link-trilha').classList.toggle('topo__trilha--atual', tela === 'trilha' || tela === 'pesquisa')
  const o = onde()
  $('#topo-seguir').textContent = o.comecou ? 'Continuar' : 'Começar'
  $('#topo-seguir').href = o.href
  abrirLista(false)
  if (tela === 'inicio') { document.title = 'Scaffold'; desenharInicio() }
  else if (tela === 'trilha') { document.title = 'A trilha · Scaffold'; desenharTrilha() }
  else if (tela === 'pesquisa') { document.title = 'Para pesquisar · Scaffold'; desenharPesquisa() }
  else { desenharPasso(); return }
  desenharLista()
  window.scrollTo(0, 0)
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-abrir-lista]'); if (b) abrirLista(true, Number(b.dataset.abrirLista) || null) })

// ── Começar
$('#capa-curso').href = CURSO
$('#link-curso').href = CURSO
document.querySelectorAll('.aba').forEach((a) => {
  a.onclick = (e) => {
    e.preventDefault()
    const parte = capDe(licao).partes.find((p) => p.id === a.dataset.parte)
    ir(...primeiroPorFazer(licoesDa(parte)))
  }
})
$('#rodar').onclick = executar
$('#recomecar').onclick = () => { editor.setValue(passo().inicio); $('#saida').textContent = ''; $('#figura').hidden = true; $('#resultado').hidden = true }
$('#ver-dica').onclick = () => { $('#dica').hidden = false }
$('#ver-solucao').onclick = () => { $('#solucao').hidden = false }
$('#abrir-lista').onclick = () => abrirLista(true)
$('#lista-fechar').onclick = () => abrirLista(false)
$('#fundo').onclick = () => abrirLista(false)
$('#lista').addEventListener('click', (e) => { if (e.target.closest('#lista-licoes a, .lista__nav a')) abrirLista(false) })
addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirLista(false) })
addEventListener('hashchange', () => { if (lerHash()) desenharTela() })
$('#linha').addEventListener('change', (e) => {
  const n = e.target.dataset.aula
  if (!n) return
  if (e.target.checked) salvo.aulas[n] = true
  else delete salvo.aulas[n]
  guardar()
  desenharTrilha()
})

if (!lerHash()) { tela = 'licao'; [licao, passoI] = primeiroPorFazer() }
desenharTela()
