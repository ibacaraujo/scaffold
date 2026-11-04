import { BLOCOS, CAPITULO, linkVideo } from './licoes.js'

const $ = (s) => document.querySelector(s)
const LICOES = BLOCOS.flatMap((b) => b.licoes)
const CHAVE = 'scaffold_v1'
const LIMITE_MS = 10000

// ── Progresso: só neste aparelho. A página funciona mesmo sem armazenamento.
let salvo = { feito: {}, codigo: {} }
try { salvo = { ...salvo, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') } } catch {}
const guardar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(salvo)) } catch {} }

// ── Onde estamos: #funcao/0
let licao = LICOES[0], passoI = 0, erros = 0, rodando = false
const idDoPasso = (l, i) => `${l.id}.${i}`
const passo = () => licao.passos[passoI]

function lerHash() {
  const [id, i] = location.hash.slice(1).split('/')
  const l = LICOES.find((x) => x.id === id)
  if (l) { licao = l; passoI = Math.min(Math.max(Number(i) || 0, 0), l.passos.length - 1); return true }
  return false
}
function primeiroPorFazer() {
  for (const l of LICOES) for (let i = 0; i < l.passos.length; i++) if (!salvo.feito[idDoPasso(l, i)]) return [l, i]
  return [LICOES[0], 0]
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
    'Ctrl-Enter': () => rodar(), 'Cmd-Enter': () => rodar(),
  },
})
editor.on('change', () => {
  const id = idDoPasso(licao, passoI)
  if (editor.getValue() === passo().inicio) delete salvo.codigo[id]
  else salvo.codigo[id] = editor.getValue()
  guardar()
})

// ── O Python
let worker, python = 'carregando', vigia = null, idAtual = 0, pendente = null
function abrirPython() {
  python = 'carregando'
  worker = new Worker('worker.js')
  worker.onmessage = ({ data }) => {
    if (data.tipo === 'pronto') { python = 'pronto'; mostrarEstadoPython() }
    else if (data.tipo === 'falhou') { python = 'falhou'; mostrarEstadoPython() }
    else if (data.id !== idAtual) return
    else if (data.tipo === 'carregando') aviso(python === 'pronto' ? 'Rodando…' : 'Preparando o Python…')
    else if (data.tipo === 'executando') { vigia = setTimeout(estourou, LIMITE_MS); aviso('Rodando…') }
    else if (data.tipo === 'resultado') { clearTimeout(vigia); terminou(data.res) }
  }
  worker.onerror = () => { python = 'falhou'; mostrarEstadoPython() }
}
function mostrarEstadoPython() {
  const b = $('#rodar')
  if (python === 'falhou') { aviso('O Python não carregou. Confira a internet e recarregue a página.'); b.disabled = true; return }
  if (!rodando && python === 'pronto' && !$('#saida').textContent.trim()) aviso('')
}
function estourou() {
  worker.terminate()
  abrirPython()
  fimDeRodada()
  $('#saida').textContent = ''
  mostrarResultado('erro', 'O código rodou por mais de 10 segundos e foi parado. Algum laço pode não ter fim.')
}
const aviso = (t) => { $('#estado').textContent = t }

const AJUDA_ERRO = {
  SyntaxError: 'O Python não entendeu a escrita desta linha. Veja se falta um parêntese, os dois-pontos ou um sinal.',
  IndentationError: 'O recuo está errado. A linha dentro de uma função começa com 4 espaços.',
  TabError: 'O recuo está misturado. Use só espaços.',
  NameError: 'O Python não conhece este nome. Veja se foi escrito igual em todos os lugares e se foi criado antes de ser usado.',
  TypeError: 'A conta recebeu algo de um tipo que ela não aceita. Veja se a função tem um return.',
  ZeroDivisionError: 'Houve uma divisão por zero.',
  ModuleNotFoundError: 'Esta biblioteca não existe aqui. Confira o nome no import.',
}

function rodar() {
  if (rodando || python === 'falhou') return
  rodando = true
  $('#rodar').disabled = true
  $('#saida').textContent = ''
  $('#figura').hidden = true
  $('#resultado').hidden = true
  aviso(python === 'pronto' ? 'Rodando…' : 'Preparando o Python (só na primeira vez, leva alguns segundos)…')
  idAtual++
  worker.postMessage({ id: idAtual, codigo: editor.getValue(), checagem: passo().checagem })
}
function fimDeRodada() {
  rodando = false
  $('#rodar').disabled = false
  aviso('')
}
function terminou(r) {
  fimDeRodada()
  $('#saida').textContent = r.saida
  if (r.figura) { $('#figura').src = 'data:image/png;base64,' + r.figura; $('#figura').hidden = false }
  if (r.ok) {
    salvo.feito[idDoPasso(licao, passoI)] = true
    guardar()
    mostrarResultado('ok')
    desenharProgresso()
    return
  }
  erros++
  if (erros >= 2) $('#ver-solucao').hidden = false
  if (r.erro) {
    const onde = r.erro.linha ? `Linha ${r.erro.linha}. ` : ''
    const ajuda = AJUDA_ERRO[r.erro.tipo] || 'O código parou com um erro.'
    mostrarResultado('erro', `${onde}${ajuda}`, `${r.erro.tipo}: ${r.erro.msg}`)
  } else mostrarResultado('erro', r.falha)
}

// ── O resultado e o encaixe com a aula
function mostrarResultado(tipo, msg, tecnico) {
  const box = $('#resultado')
  box.hidden = false
  box.className = `resultado resultado--${tipo}`
  box.textContent = ''
  const add = (tag, txt, cls) => { const e = document.createElement(tag); if (txt) e.textContent = txt; if (cls) e.className = cls; box.append(e); return e }
  if (tipo === 'erro') {
    add('p', msg, 'resultado__t')
    if (tecnico) add('p', tecnico, 'resultado__tec')
  } else {
    const fimDaLicao = passoI === licao.passos.length - 1
    add('p', 'Certo.', 'resultado__t')
    if (fimDaLicao && licao.naAula) {
      const c = add('div', null, 'aula')
      c.innerHTML = '<p class="aula__t">Na aula do Karpathy</p>'
      const p = document.createElement('p'); p.textContent = licao.naAula; c.append(p)
    }
    if (fimDaLicao && licao.assistir) {
      const c = add('div', null, 'aula aula--assistir')
      c.innerHTML = '<p class="aula__t"></p><p class="aula__d"></p><a class="botao botao--claro" target="_blank" rel="noopener">Assistir no YouTube</a>'
      c.querySelector('.aula__t').textContent = licao.assistir.texto
      c.querySelector('.aula__d').textContent = licao.assistir.detalhe
      c.querySelector('a').href = linkVideo(licao.assistir.inicio)
    }
    const s = seguinte()
    if (s) {
      const b = add('button', fimDaLicao ? `Próxima lição: ${s[0].titulo}` : 'Próximo passo', 'botao')
      b.id = 'avancar'
      b.onclick = () => ir(...s)
      if (matchMedia('(max-width: 900px)').matches) box.scrollIntoView({ block: 'nearest', behavior: 'auto' })
    }
  }
}

// ── A tela de um passo
function desenharPasso() {
  const p = passo()
  erros = 0
  const iLicao = LICOES.indexOf(licao) + 1
  document.title = `${licao.titulo} · Scaffold`
  $('#licao-n').textContent = `Lição ${iLicao} de ${LICOES.length}`
  $('#licao-t').textContent = licao.titulo
  $('#texto').innerHTML = p.texto
  $('#tarefa').innerHTML = p.tarefa
  $('#passos').innerHTML = licao.passos.map((_, i) => `<a href="#${licao.id}/${i}" class="ponto${i === passoI ? ' ponto--atual' : ''}${salvo.feito[idDoPasso(licao, i)] ? ' ponto--feito' : ''}" aria-label="Passo ${i + 1}"></a>`).join('')
  $('#dica').hidden = true
  $('#dica').innerHTML = p.dica
  $('#solucao').hidden = true
  $('#solucao').textContent = p.solucao
  $('#ver-solucao').hidden = true
  $('#saida').textContent = ''
  $('#figura').hidden = true
  $('#resultado').hidden = true
  const ant = anterior()
  $('#voltar').hidden = !ant
  if (ant) $('#voltar').href = `#${ant[0].id}/${ant[1]}`
  editor.setValue(salvo.codigo[idDoPasso(licao, passoI)] ?? p.inicio)
  editor.clearHistory()
  $('.instrucao').scrollTop = 0
  window.scrollTo(0, 0)
  desenharProgresso()
  requestAnimationFrame(() => editor.refresh())
}

// ── A lista de lições
function desenharProgresso() {
  $('#trilha').innerHTML = BLOCOS.map((b) => `
    <section class="bloco${b.licoes.length ? '' : ' bloco--depois'}">
      <h3>${b.titulo} <span>${b.tempo}</span></h3>
      ${b.licoes.length ? `<ol>${b.licoes.map((l) => {
        const feitos = l.passos.filter((_, i) => salvo.feito[idDoPasso(l, i)]).length
        const tudo = feitos === l.passos.length
        return `<li><a href="#${l.id}/0" class="${l === licao ? 'atual' : ''}"><span class="marca${tudo ? ' marca--feita' : ''}" aria-hidden="true"></span>${l.titulo}${tudo ? '<span class="sr"> (feita)</span>' : ''}</a></li>`
      }).join('')}</ol>` : `<p>${b.topicos}. Em breve.</p>`}
    </section>`).join('')
}
const abrirLista = (sim) => { $('#lista').hidden = !sim; $('#fundo').hidden = !sim; if (sim) $('#lista-fechar').focus() }

// ── Começar
$('#capitulo').textContent = CAPITULO.titulo
$('#curso').textContent = CAPITULO.curso
$('#rodar').onclick = rodar
$('#recomecar').onclick = () => { editor.setValue(passo().inicio); $('#saida').textContent = ''; $('#figura').hidden = true; $('#resultado').hidden = true }
$('#ver-dica').onclick = () => { $('#dica').hidden = false }
$('#ver-solucao').onclick = () => { $('#solucao').hidden = false }
$('#abrir-lista').onclick = () => abrirLista(true)
$('#lista-fechar').onclick = () => abrirLista(false)
$('#fundo').onclick = () => abrirLista(false)
$('#lista').addEventListener('click', (e) => { if (e.target.closest('a')) abrirLista(false) })
addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirLista(false) })
addEventListener('hashchange', () => { if (lerHash()) desenharPasso() })

abrirPython()
if (!lerHash()) [licao, passoI] = primeiroPorFazer()
desenharPasso()
