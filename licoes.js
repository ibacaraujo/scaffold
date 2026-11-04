// O conteúdo do Scaffold. Capítulo 1 = os pré-requisitos do vídeo do micrograd.
// Cada passo: texto, tarefa, código inicial, dica, solução e a checagem (Python).
// Na checagem há: tem('nome'), perto(a, b, tol), falha('mensagem'), saida (o que o print mostrou).
// O Scaffold ensina o que a aula ASSUME; quem constrói o micrograd é a aula.

export const VIDEO = 'VMj-3S1tku0'
export const linkVideo = (seg) => `https://www.youtube.com/watch?v=${VIDEO}&t=${seg}s`

export const CAPITULO = {
  titulo: 'Capítulo 1: o micrograd',
  aula: 'The spelled-out intro to neural networks and backpropagation: building micrograd',
  curso: 'Neural Networks: Zero to Hero',
}

export const BLOCOS = [
  {
    id: 'derivada',
    titulo: 'Antes da derivada',
    tempo: '00:08',
    licoes: [
      {
        id: 'funcao',
        titulo: 'O que é uma função',
        naAula: 'Em 00:08 Karpathy começa por uma função de uma entrada: dá um número a ela e olha o número que sai.',
        passos: [
          {
            texto: `<p>Você não precisa saber programar. Programar é escrever instruções para o computador; vamos aprender só as que a aula usa, uma de cada vez. À direita fica o editor: você escreve ali e clica em <strong>Rodar</strong>, e o resultado aparece embaixo.</p>
<p>Comecemos pela matemática. Uma função é uma regra: <strong>entra um número, sai um número.</strong></p>
<p>Pegue a regra <code>f(x) = 2x + 1</code>. Se entra 3, a conta é 2 × 3 + 1, e sai 7. Escrevemos <code>f(3) = 7</code>.</p>
<p>O Python faz a conta. Python é a linguagem em que a aula é escrita. Nela, a multiplicação se escreve com <code>*</code>, e <code>print(...)</code> mostra na tela o que está dentro dos parênteses.</p>`,
            tarefa: 'Quanto vale <code>f(4)</code>? Troque o 3 por 4 no código e clique em Rodar.',
            inicio: `print(2 * 3 + 1)\n`,
            dica: 'Só um número muda: <code>print(2 * 4 + 1)</code> é o que você quer ver funcionar.',
            solucao: `print(2 * 4 + 1)\n`,
            checagem: `
if saida.strip().splitlines()[-1:] != ['9']:
    falha('Era para aparecer 9. Confira se você trocou o 3 por 4.')
`,
          },
          {
            texto: `<p>A regra agora tem uma potência: <code>h(x) = x² + 1</code>. Em Python, potência se escreve com dois asteriscos: <code>x²</code> vira <code>x ** 2</code>.</p>
<p>Uma função dá <strong>uma só saída</strong> para cada entrada. Duas entradas diferentes podem dar a mesma saída; isso é permitido.</p>
<p>No código abaixo há uma linha começando com <code>#</code>. É um comentário: um recado para quem lê, que o Python ignora.</p>`,
            tarefa: 'Mostre <code>h(3)</code> e depois <code>h(-3)</code>, um <code>print</code> para cada. Use parênteses em volta do -3.',
            inicio: `print(3 ** 2 + 1)\n\n# escreva aqui o h(-3)\n`,
            dica: 'Sem parênteses, <code>-3 ** 2</code> dá -9: o Python faz a potência antes do sinal. Escreva <code>(-3) ** 2 + 1</code>.',
            solucao: `print(3 ** 2 + 1)\nprint((-3) ** 2 + 1)\n`,
            checagem: `
linhas = saida.strip().splitlines()
if linhas[-1:] == ['-8']:
    falha('Saiu -8: faltaram os parênteses. Sem eles, o Python faz a potência antes do sinal. Escreva (-3) ** 2 + 1.')
if linhas != ['10', '10']:
    falha('Eram para aparecer duas linhas, 10 e 10.')
`,
          },
        ],
      },
      {
        id: 'def',
        titulo: 'Função em Python',
        naAula: 'Em 00:08 ele escreve a função exatamente assim, com def e return, e a chama com um número decimal.',
        passos: [
          {
            texto: `<p>Até aqui, você reescreveu a conta a cada vez. Com <code>def</code>, você dá um nome à regra e a usa quantas vezes quiser.</p>
<p>O <code>x</code> entre parênteses é o nome da entrada. Três detalhes importam: os dois-pontos no fim da primeira linha, o recuo de 4 espaços na linha de baixo, e o <code>return</code>, que diz o que sai da função.</p>
<p>Para usar a função, escreva o nome com a entrada entre parênteses: <code>dobro(5)</code>. Isso se chama <em>chamar</em> a função.</p>`,
            tarefa: 'Abaixo de <code>dobro</code>, escreva a função <code>f(x)</code>, que devolve <code>2x + 1</code>, e mostre <code>f(4)</code>.',
            inicio: `def dobro(x):\n    return 2 * x\n\nprint(dobro(5))\n\n# escreva sua função f aqui\n`,
            dica: 'Copie a forma de <code>dobro</code>: mude o nome e o que vem depois do <code>return</code>. Depois, <code>print(f(4))</code>.',
            solucao: `def dobro(x):\n    return 2 * x\n\nprint(dobro(5))\n\ndef f(x):\n    return 2 * x + 1\n\nprint(f(4))\n`,
            checagem: `
tem('f')
if f(0) != 1 or f(4) != 9:
    falha('A função existe, mas não devolve 2x + 1. f(4) devia dar 9.')
if '9' not in saida.split():
    falha('A função está certa. Falta mostrar o resultado com print(f(4)).')
`,
          },
          {
            texto: `<p>Uma função pode ter uma regra maior. Vamos usar esta nas próximas lições:</p>
<p><code>g(x) = x² - 3x + 2</code></p>
<p>Em matemática, <code>3x</code> significa 3 vezes x. Em Python, a multiplicação precisa aparecer: <code>3 * x</code>.</p>`,
            tarefa: 'Escreva a função <code>g(x)</code> e mostre <code>g(5)</code>.',
            inicio: `# escreva g aqui\n`,
            dica: 'A linha do <code>return</code> fica: <code>return x ** 2 - 3 * x + 2</code>.',
            solucao: `def g(x):\n    return x ** 2 - 3 * x + 2\n\nprint(g(5))\n`,
            checagem: `
tem('g')
if g(5) != 12 or g(1) != 0:
    falha('g(5) devia dar 12 e g(1) devia dar 0. Confira a regra e os sinais.')
if '12' not in saida.split():
    falha('A função está certa. Falta mostrar g(5) com print.')
`,
          },
          {
            texto: `<p>A saída de uma função pode ser guardada numa <strong>variável</strong>: um nome para um valor. Aqui o <code>=</code> não pergunta se dois lados são iguais; ele manda guardar o valor da direita no nome da esquerda.</p>
<p>A entrada pode ser um número decimal, escrito com ponto: <code>2.5</code>.</p>`,
            tarefa: 'Guarde <code>g(2.5)</code> numa variável chamada <code>resultado</code> e mostre essa variável.',
            inicio: `def g(x):\n    return x ** 2 - 3 * x + 2\n\n# resultado = ...\n`,
            dica: '<code>resultado = g(2.5)</code> e, na linha de baixo, <code>print(resultado)</code>.',
            solucao: `def g(x):\n    return x ** 2 - 3 * x + 2\n\nresultado = g(2.5)\nprint(resultado)\n`,
            checagem: `
tem('resultado')
if not perto(resultado, 0.75):
    falha('resultado devia valer 0.75. Confira se você chamou g(2.5).')
if '0.75' not in saida.split():
    falha('O valor está certo. Falta mostrar com print(resultado).')
`,
          },
        ],
      },
      {
        id: 'grafico',
        titulo: 'O gráfico de uma função',
        naAula: 'Em 00:08 ele desenha a função com estas mesmas três linhas: np.arange, a função aplicada à lista e plt.plot.',
        passos: [
          {
            texto: `<p>Para ver uma função inteira, calculamos a saída de muitas entradas e marcamos os pontos. Primeiro, as entradas.</p>
<p><code>np.arange(início, fim, passo)</code> gera uma lista de números. O <strong>fim não entra</strong> na lista. </p>
<p>Uma biblioteca é um código pronto, escrito por outras pessoas. <code>numpy</code> é a biblioteca de contas com listas de números. A linha <code>import numpy as np</code> a traz para o seu código com o apelido <code>np</code>; por isso, escrevemos <code>np.arange</code>.</p>`,
            tarefa: 'Mude o código para os números irem de -4 até 4 (sem incluir o 4), de 0.5 em 0.5.',
            inicio: `import numpy as np\n\nxs = np.arange(-3, 3, 1)\nprint(xs)\n`,
            dica: 'Só a linha do <code>arange</code> muda: <code>np.arange(-4, 4, 0.5)</code>.',
            solucao: `import numpy as np\n\nxs = np.arange(-4, 4, 0.5)\nprint(xs)\n`,
            checagem: `
tem('xs')
if len(xs) != 16 or xs[0] != -4 or xs[-1] != 3.5:
    falha('A lista devia começar em -4, terminar em 3.5 e ter 16 números.')
`,
          },
          {
            texto: `<p>Agora as saídas. O numpy faz uma coisa muito útil: se você der a lista inteira à função, ela calcula <strong>cada número da lista</strong>, sem você precisar repetir nada.</p>`,
            tarefa: 'Crie <code>ys</code> com as saídas de <code>g</code> para toda a lista <code>xs</code>, e mostre <code>ys</code>.',
            inicio: `import numpy as np\n\ndef g(x):\n    return x ** 2 - 3 * x + 2\n\nxs = np.arange(-4, 4, 0.5)\n\n# ys = ...\n`,
            dica: 'Dê a lista à função, como se fosse um número: <code>ys = g(xs)</code>.',
            solucao: `import numpy as np\n\ndef g(x):\n    return x ** 2 - 3 * x + 2\n\nxs = np.arange(-4, 4, 0.5)\n\nys = g(xs)\nprint(ys)\n`,
            checagem: `
import numpy as _np
tem('ys')
if not _np.allclose(ys, xs ** 2 - 3 * xs + 2):
    falha('ys devia ter as saídas de g para cada número de xs.')
if not saida.strip():
    falha('ys está certo. Falta mostrar com print(ys).')
`,
          },
          {
            texto: `<p>Com as entradas e as saídas, falta desenhar. A biblioteca de gráficos se chama <code>matplotlib</code>, com o apelido <code>plt</code>, e <code>plt.plot(xs, ys)</code> marca os pontos e liga um ao outro.</p>
<p>Na primeira vez, a biblioteca de gráficos leva alguns segundos para carregar.</p>`,
            tarefa: 'Adicione a linha que desenha o gráfico. Depois olhe a curva: onde ela para de descer e começa a subir?',
            inicio: `import numpy as np\nimport matplotlib.pyplot as plt\n\ndef g(x):\n    return x ** 2 - 3 * x + 2\n\nxs = np.arange(-4, 4, 0.5)\nys = g(xs)\n\n# desenhe aqui\n`,
            dica: 'É uma linha só: <code>plt.plot(xs, ys)</code>.',
            solucao: `import numpy as np\nimport matplotlib.pyplot as plt\n\ndef g(x):\n    return x ** 2 - 3 * x + 2\n\nxs = np.arange(-4, 4, 0.5)\nys = g(xs)\n\nplt.plot(xs, ys)\n`,
            checagem: `
import matplotlib.pyplot as _plt
if not _plt.get_fignums() or not _plt.gca().get_lines():
    falha('Ainda não apareceu um gráfico. Falta a linha plt.plot(xs, ys).')
if len(_plt.gca().get_lines()[0].get_ydata()) != 16:
    falha('O gráfico devia ter os 16 pontos de xs e ys.')
`,
          },
        ],
      },
      {
        id: 'reta',
        titulo: 'A inclinação de uma reta',
        naAula: 'A partir de 00:08 ele fala o tempo todo em "slope". É esta inclinação: quanto a saída sobe para cada unidade que a entrada anda.',
        passos: [
          {
            texto: `<p>A inclinação responde: <strong>quando a entrada anda, quanto a saída sobe?</strong></p>
<p>Pegue dois pontos, <code>a</code> e <code>b</code>. A inclinação é o que subiu dividido pelo que andou:</p>
<p><code>(r(b) - r(a)) / (b - a)</code></p>`,
            tarefa: 'Calcule a inclinação da reta <code>r</code> entre 1 e 3 e guarde em <code>inclinacao</code>.',
            inicio: `def r(x):\n    return 2 * x + 1\n\na = 1\nb = 3\n\n# inclinacao = ...\nprint(inclinacao)\n`,
            dica: 'Escreva a fórmula do texto: <code>inclinacao = (r(b) - r(a)) / (b - a)</code>.',
            solucao: `def r(x):\n    return 2 * x + 1\n\na = 1\nb = 3\n\ninclinacao = (r(b) - r(a)) / (b - a)\nprint(inclinacao)\n`,
            checagem: `
tem('inclinacao')
if not perto(inclinacao, 2):
    falha('A inclinação devia dar 2: a saída subiu 4 enquanto a entrada andou 2.')
`,
          },
          {
            texto: `<p>Uma reta tem uma propriedade especial: não importa quais dois pontos você escolha.</p>`,
            tarefa: 'Troque os pontos para <code>a = -1</code> e <code>b = 5</code> e rode. O resultado mudou?',
            inicio: `def r(x):\n    return 2 * x + 1\n\na = 1\nb = 3\n\ninclinacao = (r(b) - r(a)) / (b - a)\nprint(inclinacao)\n`,
            dica: 'Mude só as linhas de <code>a</code> e <code>b</code>.',
            solucao: `def r(x):\n    return 2 * x + 1\n\na = -1\nb = 5\n\ninclinacao = (r(b) - r(a)) / (b - a)\nprint(inclinacao)\n`,
            checagem: `
tem('a'); tem('b'); tem('inclinacao')
if a != -1 or b != 5:
    falha('Troque os pontos para a = -1 e b = 5.')
if not perto(inclinacao, 2):
    falha('A inclinação devia continuar 2.')
`,
          },
          {
            texto: `<p>A inclinação também tem sinal. Positiva: a saída sobe quando a entrada anda. Negativa: a saída desce.</p>`,
            tarefa: 'Escreva a reta <code>s(x) = -3x + 4</code> e calcule a inclinação entre 0 e 2.',
            inicio: `# def s(x): ...\n\na = 0\nb = 2\n\n# inclinacao = ...\nprint(inclinacao)\n`,
            dica: 'A função é <code>return -3 * x + 4</code>. A fórmula é a mesma, trocando <code>r</code> por <code>s</code>.',
            solucao: `def s(x):\n    return -3 * x + 4\n\na = 0\nb = 2\n\ninclinacao = (s(b) - s(a)) / (b - a)\nprint(inclinacao)\n`,
            checagem: `
tem('s'); tem('inclinacao')
if s(0) != 4 or s(1) != 1:
    falha('A função s devia devolver -3x + 4.')
if not perto(inclinacao, -3):
    falha('A inclinação devia dar -3: negativa, porque a reta desce.')
`,
          },
        ],
      },
      {
        id: 'ponto',
        titulo: 'A inclinação num ponto',
        naAula: 'Em 00:08 ele faz esta mesma conta: escolhe um h pequeno, calcula (f(x + h) - f(x)) / h e vai diminuindo o h. Ele também mostra o que acontece quando o h fica pequeno demais.',
        passos: [
          {
            texto: `<p>Uma curva não tem uma inclinação só: em cada ponto ela é outra. Como medir num ponto?</p>
<p>Fique no ponto <code>x</code> e olhe um pouco à frente, em <code>x + h</code>. É a mesma fórmula de antes, com <code>a = x</code> e <code>b = x + h</code>. Como <code>b - a</code> dá <code>h</code>, ela fica:</p>
<p><code>(q(x + h) - q(x)) / h</code></p>`,
            tarefa: 'Para <code>q(x) = x²</code>, calcule essa conta com <code>x = 1</code> e <code>h = 1</code>, e guarde em <code>incl</code>.',
            inicio: `def q(x):\n    return x ** 2\n\nx = 1\nh = 1\n\n# incl = ...\nprint(incl)\n`,
            dica: '<code>incl = (q(x + h) - q(x)) / h</code>.',
            solucao: `def q(x):\n    return x ** 2\n\nx = 1\nh = 1\n\nincl = (q(x + h) - q(x)) / h\nprint(incl)\n`,
            checagem: `
tem('incl')
if not perto(incl, 3):
    falha('Com x = 1 e h = 1, devia dar 3: q(2) - q(1) = 3, dividido por 1.')
`,
          },
          {
            texto: `<p>Com <code>h = 1</code>, medimos a inclinação de um trecho grande da curva. Quanto menor o <code>h</code>, mais perto do ponto a medida fica.</p>
<p>Não dá para usar <code>h = 0</code>: ficaria 0 dividido por 0.</p>`,
            tarefa: 'Rode com <code>h = 0.1</code>, depois <code>0.01</code>, depois <code>0.001</code>. Para que número o resultado está indo?',
            inicio: `def q(x):\n    return x ** 2\n\nx = 1\nh = 1\n\nincl = (q(x + h) - q(x)) / h\nprint(incl)\n`,
            dica: 'Mude só a linha do <code>h</code> e rode de novo a cada troca. A checagem olha o último valor, <code>0.001</code>.',
            solucao: `def q(x):\n    return x ** 2\n\nx = 1\nh = 0.001\n\nincl = (q(x + h) - q(x)) / h\nprint(incl)\n`,
            checagem: `
tem('h'); tem('incl')
if h != 0.001:
    falha('Boa. Continue diminuindo até h = 0.001.')
if not perto(incl, 2.001, 1e-6):
    falha('Com h = 0.001 devia dar quase 2.001. Confira a fórmula.')
`,
          },
          {
            texto: `<p>O resultado se aproxima de 2: essa é a inclinação de <code>x²</code> em <code>x = 1</code>. Vamos transformar a conta numa função, para medir em qualquer ponto.</p>`,
            tarefa: 'Escreva <code>incl_em(x)</code>, que devolve a inclinação de <code>q</code> em <code>x</code> com <code>h = 0.001</code>. Mostre os valores em 3 e em -2.',
            inicio: `def q(x):\n    return x ** 2\n\ndef incl_em(x):\n    h = 0.001\n    # return ...\n\nprint(incl_em(3))\nprint(incl_em(-2))\n`,
            dica: 'Troque o comentário por <code>return (q(x + h) - q(x)) / h</code>, com o mesmo recuo do <code>h</code>.',
            solucao: `def q(x):\n    return x ** 2\n\ndef incl_em(x):\n    h = 0.001\n    return (q(x + h) - q(x)) / h\n\nprint(incl_em(3))\nprint(incl_em(-2))\n`,
            checagem: `
tem('incl_em')
if incl_em(3) is None:
    falha('A função ainda não devolve nada. Falta o return.')
if not perto(incl_em(3), 6, 0.01) or not perto(incl_em(-2), -4, 0.01):
    falha('Em 3 devia dar quase 6, e em -2 quase -4.')
`,
          },
        ],
      },
      {
        id: 'derivada',
        titulo: 'O que é a derivada',
        naAula: 'Em 00:08 ele mostra a definição da derivada e pergunta o que ela diz em cada ponto: positiva, negativa ou zero. É esta leitura que você acabou de fazer.',
        passos: [
          {
            texto: `<p>Você acabou de medir a inclinação de <code>q(x) = x²</code> em vários pontos: quase 2 em 1, quase 6 em 3, quase -4 em -2. Cada resultado é o dobro da entrada.</p>
<p>Esse padrão é a <strong>derivada</strong>: uma nova função, que diz a inclinação em cada ponto. Escrevemos <code>q'(x) = 2x</code>.</p>
<p>A definição é a sua conta, com o <code>h</code> cada vez mais perto de zero.</p>`,
            tarefa: 'Escreva <code>dq(x)</code>, a derivada de <code>q</code>, e compare com a medida em <code>x = 3</code>.',
            inicio: `def q(x):\n    return x ** 2\n\ndef incl_em(x):\n    h = 0.001\n    return (q(x + h) - q(x)) / h\n\n# def dq(x): ...\n\nprint(incl_em(3))\nprint(dq(3))\n`,
            dica: 'A regra está no texto: <code>return 2 * x</code>.',
            solucao: `def q(x):\n    return x ** 2\n\ndef incl_em(x):\n    h = 0.001\n    return (q(x + h) - q(x)) / h\n\ndef dq(x):\n    return 2 * x\n\nprint(incl_em(3))\nprint(dq(3))\n`,
            checagem: `
tem('dq')
if dq(3) != 6 or dq(-2) != -4:
    falha('dq devia devolver 2x: dq(3) = 6 e dq(-2) = -4.')
`,
          },
          {
            texto: `<p>O sinal da derivada conta o que a função está fazendo naquele ponto:</p>
<ul><li><strong>negativa:</strong> a função está descendo;</li><li><strong>zero:</strong> ela parou de descer ou de subir;</li><li><strong>positiva:</strong> ela está subindo.</li></ul>`,
            tarefa: 'Para <code>w(x) = x² - 4x</code>, meça a inclinação em 1, 2 e 3. Depois guarde em <code>parou</code> o valor de <code>x</code> onde ela é zero.',
            inicio: `def w(x):\n    return x ** 2 - 4 * x\n\ndef incl_em(x):\n    h = 0.001\n    return (w(x + h) - w(x)) / h\n\nprint(incl_em(1))\n# meça também em 2 e em 3\n\n# parou = ?\n`,
            dica: 'Rode e veja os três números: um negativo, um quase zero e um positivo. O <code>x</code> do quase zero é o <code>parou</code>.',
            solucao: `def w(x):\n    return x ** 2 - 4 * x\n\ndef incl_em(x):\n    h = 0.001\n    return (w(x + h) - w(x)) / h\n\nprint(incl_em(1))\nprint(incl_em(2))\nprint(incl_em(3))\n\nparou = 2\n`,
            checagem: `
if len(saida.strip().splitlines()) < 3:
    falha('Mostre as três medidas: em 1, em 2 e em 3.')
tem('parou')
if parou != 2:
    falha('Olhe as medidas: em qual x o resultado é quase zero?')
`,
          },
        ],
      },
      {
        id: 'regras',
        titulo: 'As regras da derivada',
        assistir: {
          inicio: 0,
          texto: 'Pronto: você tem o que esta parte assume. Agora assista do começo até 00:14:12.',
          detalhe: 'Até 00:08, ele mostra aonde a aula vai chegar; não precisa entender tudo. De 00:08:08 a 00:14:12, é a derivada: a função, o gráfico, o h pequeno e o sinal da inclinação. Você vai reconhecer cada passo.',
        },
        passos: [
          {
            texto: `<p>Não é preciso medir sempre. Quatro regras dão a derivada na mão:</p>
<ul><li><code>xⁿ</code> vira <code>n·xⁿ⁻¹</code>. Exemplo: <code>x²</code> vira <code>2x</code>.</li>
<li>Um número sozinho vira 0: ele não muda.</li>
<li>Um número multiplicando fica: <code>5x²</code> vira <code>5·2x = 10x</code>.</li>
<li>Numa soma, cada parte deriva separada.</li></ul>`,
            tarefa: 'Pela primeira regra, escreva <code>dp(x)</code>, a derivada de <code>p(x) = x³</code>. O código compara com a medida em <code>x = 2</code>.',
            inicio: `def p(x):\n    return x ** 3\n\ndef incl_em(x):\n    h = 0.001\n    return (p(x + h) - p(x)) / h\n\n# def dp(x): ...\n\nprint(incl_em(2))\nprint(dp(2))\n`,
            dica: 'Com n = 3: o 3 desce para a frente e a potência cai para 2. Fica <code>3 * x ** 2</code>.',
            solucao: `def p(x):\n    return x ** 3\n\ndef incl_em(x):\n    h = 0.001\n    return (p(x + h) - p(x)) / h\n\ndef dp(x):\n    return 3 * x ** 2\n\nprint(incl_em(2))\nprint(dp(2))\n`,
            checagem: `
tem('dp')
if dp(2) != 12 or dp(-1) != 3:
    falha('dp devia devolver 3x²: dp(2) = 12 e dp(-1) = 3.')
`,
          },
          {
            texto: `<p>Agora, todas as regras juntas, parte por parte.</p>`,
            tarefa: 'Escreva <code>dm(x)</code>, a derivada de <code>m(x) = 5x² - 3x + 7</code>, e compare com a medida em <code>x = 2</code>.',
            inicio: `def m(x):\n    return 5 * x ** 2 - 3 * x + 7\n\ndef incl_em(x):\n    h = 0.001\n    return (m(x + h) - m(x)) / h\n\n# def dm(x): ...\n\nprint(incl_em(2))\nprint(dm(2))\n`,
            dica: 'Parte por parte: <code>5x²</code> vira <code>10x</code>, <code>-3x</code> vira <code>-3</code>, e o <code>7</code> some.',
            solucao: `def m(x):\n    return 5 * x ** 2 - 3 * x + 7\n\ndef incl_em(x):\n    h = 0.001\n    return (m(x + h) - m(x)) / h\n\ndef dm(x):\n    return 10 * x - 3\n\nprint(incl_em(2))\nprint(dm(2))\n`,
            checagem: `
tem('dm')
if dm(0) != -3 or dm(1) != 7:
    falha('dm devia devolver 10x - 3: dm(0) = -3 e dm(1) = 7.')
`,
          },
        ],
      },
    ],
  },
  { id: 'varias', titulo: 'Antes das várias entradas', tempo: '00:14', licoes: [], topicos: 'Função de várias variáveis, derivada parcial' },
  { id: 'value', titulo: 'Antes do Value', tempo: '00:19', licoes: [], topicos: 'Classe e objeto, __init__, __repr__, __add__ e __mul__, tupla e set' },
  { id: 'backprop', titulo: 'Antes do backprop à mão', tempo: '00:32', licoes: [], topicos: 'A conta como grafo, regra da cadeia' },
  { id: 'neuronio', titulo: 'Antes do neurônio', tempo: '00:52', licoes: [], topicos: 'Soma ponderada, e^x, tanh e a sua derivada' },
  { id: 'backward', titulo: 'Antes do backward', tempo: '01:09', licoes: [], topicos: 'Função guardada em variável, closure, recursão, ordem topológica' },
  { id: 'rede', titulo: 'Antes da rede', tempo: '01:43', licoes: [], topicos: '__call__, list comprehension, zip, sum' },
  { id: 'treino', titulo: 'Antes do treino', tempo: '01:51', licoes: [], topicos: 'Erro e perda, erro quadrático, andar contra a inclinação' },
]
