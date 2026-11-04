// O Python do Scaffold: Pyodide num Web Worker, para um laço infinito não travar
// a página (a página encerra o worker depois de um tempo e abre outro).
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js')

const AJUDANTE = `
import base64, io, json, os, sys, traceback, warnings
os.environ['MPLBACKEND'] = 'AGG'
warnings.filterwarnings('ignore')

class Falha(Exception):
    pass

def _erro_do_aluno(e):
    # Só a última linha e o número da linha do código do aluno, sem o caminho interno.
    linha = None
    if isinstance(e, SyntaxError):
        linha = e.lineno
    else:
        for q in traceback.extract_tb(e.__traceback__):
            if q.filename == 'codigo':
                linha = q.lineno
    return {'tipo': type(e).__name__, 'msg': str(e), 'linha': linha}

def _rodar(codigo, checagem):
    res = {'saida': '', 'erro': None, 'falha': None, 'figura': None, 'ok': False}
    ns = {'__name__': '__main__'}
    buf = io.StringIO()
    velho = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buf
    try:
        if 'matplotlib.pyplot' in sys.modules:
            sys.modules['matplotlib.pyplot'].close('all')
        try:
            exec(compile(codigo, 'codigo', 'exec'), ns)
        except BaseException as e:
            res['erro'] = _erro_do_aluno(e)
        plt = sys.modules.get('matplotlib.pyplot')
        if plt is not None and plt.get_fignums():
            img = io.BytesIO()
            plt.gcf().savefig(img, format='png', dpi=130, bbox_inches='tight')
            res['figura'] = base64.b64encode(img.getvalue()).decode()
        if res['erro'] is None:
            def falha(msg):
                raise Falha(msg)
            def tem(nome):
                if nome not in ns:
                    falha('Ainda não encontrei "' + nome + '" no seu código. Confira o nome.')
            def perto(a, b, tol=1e-9):
                return abs(a - b) <= tol
            ambiente = dict(ns)
            ambiente.update(falha=falha, tem=tem, perto=perto, saida=buf.getvalue())
            try:
                exec(checagem, ambiente)
                res['ok'] = True
            except Falha as e:
                res['falha'] = str(e)
            except Exception as e:
                res['falha'] = 'Ao testar o seu código, deu um erro: ' + type(e).__name__ + ': ' + str(e)
    finally:
        sys.stdout, sys.stderr = velho
    res['saida'] = buf.getvalue()
    return json.dumps(res)
`

let py
const pronto = (async () => {
  py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' })
  py.runPython(AJUDANTE)
  postMessage({ tipo: 'pronto' })
})().catch((e) => postMessage({ tipo: 'falhou', msg: String(e) }))

onmessage = async ({ data }) => {
  await pronto
  const { id, codigo, checagem } = data
  try {
    postMessage({ tipo: 'carregando', id })
    await py.loadPackagesFromImports(codigo + '\n' + checagem)
    postMessage({ tipo: 'executando', id })
    const rodar = py.globals.get('_rodar')
    const json = rodar(codigo, checagem)
    rodar.destroy()
    postMessage({ tipo: 'resultado', id, res: JSON.parse(json) })
  } catch (e) {
    postMessage({ tipo: 'resultado', id, res: { saida: '', figura: null, ok: false, falha: null, erro: { tipo: 'Erro', msg: String(e), linha: null } } })
  }
}
