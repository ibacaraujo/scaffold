// O conteúdo do Scaffold. Duas partes independentes: Matemática (sem código) e Programação.
// O Scaffold prepara a pessoa para compreender os conceitos da aula. Não usa o que está no vídeo:
// os exemplos e exercícios são próprios. Cada lição abre com `porque`: um contexto curto do que
// Karpathy vai discutir, só para a pessoa entender por que aquela lição existe.
//
// Passo de matemática: texto, tarefa, figura?, campos [{rotulo, resposta}] OU opcoes [{t, certa, por}],
//                      erro, dica, solucao, certo?
// Passo de programação: texto, tarefa, inicio, dica, solucao, checagem (Python, com tem, perto, falha, saida).

export const CAPITULO = {
  titulo: 'Capítulo 1',
  aula: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
  curso: 'https://karpathy.ai/zero-to-hero.html',
}

export const PARTES = [
  {
    id: 'matematica',
    titulo: 'Matemática',
    modulos: [
      {
        titulo: 'Variáveis e contas',
        licoes: [
          {
            id: 'letras',
            titulo: 'O que é uma variável',
            porque: 'Karpathy mostra que uma rede neural é, no fundo, uma expressão matemática grande, cheia de letras que guardam números. Quando a rede aprende, esses números mudam.',
            passos: [
              {
                texto: `<p>Em matemática, uma letra pode guardar o lugar de um número. Chamamos essa letra de <strong>variável</strong>, porque o número pode variar.</p>
<p>Na expressão <code>x + 2</code>, o <code>x</code> é um lugar vazio. Se <code>x</code> vale 5, trocamos a letra pelo número: <code>5 + 2 = 7</code>.</p>`,
                tarefa: 'Se <code>x</code> vale 8, quanto dá <code>x + 2</code>?',
                campos: [{ rotulo: 'x + 2 =', resposta: 10 }],
                erro: 'Troque o x por 8 e faça a soma.',
                dica: 'Escreva 8 no lugar do x: <code>8 + 2</code>.',
                solucao: '8 + 2 = 10',
              },
              {
                texto: `<p>Quando um número aparece colado a uma letra, é uma multiplicação: <code>3x</code> significa 3 vezes x.</p>
<p>Duas letras coladas também: <code>ab</code> significa a vezes b.</p>`,
                tarefa: 'Calcule com <code>x = 4</code>, <code>a = 2</code> e <code>b = 5</code>.',
                campos: [{ rotulo: '3x =', resposta: 12 }, { rotulo: 'ab =', resposta: 10 }, { rotulo: 'ab + 1 =', resposta: 11 }],
                erro: 'Algum resultado não bate. Lembre: número ou letra colados significam multiplicação.',
                dica: '<code>3x</code> é 3 vezes 4. <code>ab</code> é 2 vezes 5.',
                solucao: '3 · 4 = 12\n2 · 5 = 10\n10 + 1 = 11',
              },
            ],
          },
          {
            id: 'ordem',
            titulo: 'A ordem das contas',
            porque: 'Essa expressão grande é feita de muitas contas encadeadas. Para seguir a aula, é preciso saber qual conta acontece antes de qual.',
            passos: [
              {
                texto: `<p>Numa expressão com várias contas, a ordem importa. Multiplicação vem antes de soma. Parênteses vêm antes de tudo.</p>
<p>Por isso, <code>2 + 3 · 4</code> não dá o mesmo que <code>(2 + 3) · 4</code>.</p>`,
                tarefa: 'Calcule as duas expressões.',
                campos: [{ rotulo: '2 + 3 · 4 =', resposta: 14 }, { rotulo: '(2 + 3) · 4 =', resposta: 20 }],
                erro: 'Na primeira, multiplique antes. Na segunda, resolva primeiro os parênteses.',
                dica: 'Na primeira, 3 · 4 dá 12, e depois vem a soma. Na segunda, 2 + 3 dá 5, e depois vem a multiplicação.',
                solucao: '2 + 12 = 14\n5 · 4 = 20',
              },
              {
                texto: `<p>Uma potência é uma multiplicação repetida. <code>x²</code> significa x vezes x, e <code>x³</code> significa x vezes x vezes x.</p>
<p>A potência vem antes da multiplicação e da soma.</p>`,
                tarefa: 'Calcule com <code>x = 3</code>.',
                campos: [{ rotulo: 'x² =', resposta: 9 }, { rotulo: 'x³ =', resposta: 27 }, { rotulo: 'x² + 1 =', resposta: 10 }],
                erro: 'Algum resultado não bate. x² não é 2 vezes x: é x vezes x.',
                dica: '<code>3²</code> é 3 · 3. <code>3³</code> é 3 · 3 · 3.',
                solucao: '3 · 3 = 9\n3 · 3 · 3 = 27\n9 + 1 = 10',
              },
              {
                texto: `<p>Com números negativos, há uma regra para guardar: <strong>negativo vezes negativo dá positivo.</strong></p>
<p>Então <code>(-2)² = (-2) · (-2) = 4</code>. Já negativo vezes positivo dá negativo: <code>(-2) · 3 = -6</code>.</p>`,
                tarefa: 'Calcule com <code>x = -3</code>.',
                campos: [{ rotulo: 'x² =', resposta: 9 }, { rotulo: '2x =', resposta: -6 }, { rotulo: 'x² + 2x =', resposta: 3 }],
                erro: 'Algum resultado não bate. Confira os sinais.',
                dica: '<code>(-3) · (-3)</code> é positivo. <code>2 · (-3)</code> é negativo.',
                solucao: '(-3) · (-3) = 9\n2 · (-3) = -6\n9 + (-6) = 3',
              },
            ],
          },
        ],
      },
      {
        titulo: 'Funções',
        licoes: [
          {
            id: 'funcao',
            titulo: 'O que é uma função',
            porque: 'A aula começa por uma função, e tudo parte dela: uma rede neural também é uma função. Ela recebe dados e dá um resultado.',
            passos: [
              {
                texto: `<p>Uma função é uma regra: <strong>recebe um valor de entrada e dá um resultado no final.</strong> Por exemplo: recebe 1, resulta 3.</p>
<p>Damos um nome à regra, normalmente <code>f</code>. Escrevemos <code>f(x) = 2x + 1</code>, e lemos "f de x é igual a 2x mais 1".</p>
<p>Mexa no controle à direita e veja o resultado para cada valor que a função recebe.</p>`,
                tarefa: 'Quanto vale a função nestas entradas?',
                figura: { modo: 'maquina', regra: 'f(x) = 2x + 1', f: (x) => 2 * x + 1, min: -5, max: 5, passo: 1, inicial: 3 },
                campos: [{ rotulo: 'f(4) =', resposta: 9 }, { rotulo: 'f(0) =', resposta: 1 }],
                erro: 'Troque o x pelo número entre parênteses e faça a conta.',
                dica: '<code>f(4)</code> significa: coloque 4 no lugar do x. Fica <code>2 · 4 + 1</code>.',
                solucao: 'f(4) = 2 · 4 + 1 = 9\nf(0) = 2 · 0 + 1 = 1',
              },
              {
                texto: `<p>A regra só precisa cumprir uma condição: para cada valor recebido, <strong>um único resultado</strong>. Se o mesmo valor pudesse dar dois resultados, não saberíamos qual usar.</p>
<p>Dois valores diferentes darem o mesmo resultado é permitido: <code>2²</code> e <code>(-2)²</code> dão 4.</p>`,
                tarefa: 'Qual destas tabelas <strong>não</strong> pode ser uma função?',
                opcoes: [
                  { t: 'Recebe 1, resulta 5. Recebe 2, resulta 5. Recebe 3, resulta 5.', por: 'Esta pode: cada valor recebido tem um só resultado. Todos darem 5 não é problema.' },
                  { t: 'Recebe 1, resulta 5. Recebe 1, resulta 7. Recebe 2, resulta 9.', certa: true },
                  { t: 'Recebe 1, resulta 2. Recebe 2, resulta 4. Recebe 3, resulta 6.', por: 'Esta pode: cada valor recebido tem um só resultado.' },
                ],
                erro: 'Procure um valor recebido que apareça com dois resultados diferentes.',
                dica: 'Olhe se algum valor recebido aparece duas vezes.',
                solucao: 'A segunda: ao receber 1, ela tem dois resultados, 5 e 7.',
                certo: 'Ao receber 1, ela tem dois resultados, então não é função.',
              },
            ],
          },
          {
            id: 'plano',
            titulo: 'O plano e o gráfico',
            porque: 'Logo no início, Karpathy desenha uma função para conversar sobre ela olhando a curva. Saber ler esse desenho torna a conversa visual.',
            passos: [
              {
                texto: `<p>Para desenhar uma função, usamos duas retas numeradas: a horizontal é o eixo <code>x</code>, e a vertical é o eixo <code>y</code>. Elas se cruzam no ponto <code>(0, 0)</code>.</p>
<p>Um par como <code>(3, 1)</code> é um endereço: primeiro o <code>x</code>, para os lados; depois o <code>y</code>, para cima ou para baixo.</p>`,
                tarefa: 'Mova o ponto e responda: saindo do cruzamento, como se chega em <code>(3, 1)</code>?',
                figura: { modo: 'plano', x: [-5, 5], y: [-4, 4] },
                opcoes: [
                  { t: '3 para a direita e 1 para cima', certa: true },
                  { t: '1 para a direita e 3 para cima', por: 'Essa ordem leva a (1, 3). O primeiro número é o x.' },
                  { t: '3 para a esquerda e 1 para baixo', por: 'Essa direção leva a (-3, -1). Números positivos vão para a direita e para cima.' },
                ],
                erro: 'Primeiro número para os lados, segundo para cima ou para baixo.',
                dica: 'Use os controles: deixe o x em 3 e o y em 1.',
                solucao: '3 para a direita e 1 para cima.',
              },
              {
                texto: `<p>O <strong>gráfico</strong> de uma função é o desenho de todos os pontos <code>(x, f(x))</code>: o valor recebido para os lados, o resultado para cima.</p>
<p>À direita está <code>f(x) = x²</code>. Mude o valor recebido e acompanhe o ponto sobre a curva.</p>`,
                tarefa: 'Leia no gráfico.',
                figura: { modo: 'ponto', f: (x) => x * x, x: [-3, 3], y: [-1, 9], min: -3, max: 3, passo: 0.5, inicial: 1, nome: 'x²' },
                campos: [{ rotulo: 'Em x = 2, a altura da curva é', resposta: 4 }, { rotulo: 'A curva é mais baixa em x =', resposta: 0 }],
                erro: 'Mova o controle até o valor pedido e leia a altura. A parte mais baixa é onde a curva para de descer.',
                dica: 'A altura em x = 2 é <code>2²</code>. Procure onde a curva toca a parte de baixo.',
                solucao: 'Em x = 2, a altura é 4.\nA curva é mais baixa em x = 0.',
              },
            ],
          },
        ],
      },
      {
        titulo: 'A inclinação',
        licoes: [
          {
            id: 'reta',
            titulo: 'A inclinação de uma reta',
            porque: 'A pergunta que atravessa a aula é esta: se eu mudar um pouco o valor recebido, quanto muda o resultado? A inclinação é a resposta para essa pergunta.',
            passos: [
              {
                texto: `<p>A inclinação responde: <strong>quando andamos para a direita, quanto subimos?</strong></p>
<p>Escolha dois pontos da reta e divida o que subiu pelo que andou:</p>
<p><code>inclinação = subiu ÷ andou</code></p>
<p>Na reta ao lado, teste vários pares de pontos.</p>`,
                tarefa: 'Na reta <code>f(x) = 2x + 1</code>, de <code>x = 1</code> até <code>x = 3</code>:',
                figura: { modo: 'dois', f: (x) => 2 * x + 1, x: [-3, 4], y: [-5, 9], a: 1, b: 3, nome: '2x + 1' },
                campos: [{ rotulo: 'Subiu', resposta: 4 }, { rotulo: 'Andou', resposta: 2 }, { rotulo: 'Inclinação =', resposta: 2 }],
                erro: 'Calcule f(3) e f(1). A diferença entre elas é quanto subiu.',
                dica: '<code>f(3) = 7</code> e <code>f(1) = 3</code>. Andou de 1 até 3.',
                solucao: 'Subiu: 7 - 3 = 4\nAndou: 3 - 1 = 2\nInclinação: 4 ÷ 2 = 2',
                certo: 'Mude os pontos no controle: numa reta, a inclinação é sempre a mesma.',
              },
              {
                texto: `<p>A inclinação tem sinal. Positiva: a reta sobe da esquerda para a direita. Negativa: ela desce. Zero: ela é plana.</p>`,
                tarefa: 'Na reta <code>f(x) = -3x + 4</code>, qual é a inclinação?',
                figura: { modo: 'dois', f: (x) => -3 * x + 4, x: [-2, 4], y: [-8, 10], a: 0, b: 2, nome: '-3x + 4' },
                campos: [{ rotulo: 'Inclinação =', resposta: -3 }],
                erro: 'Quando a reta desce, o "subiu" é negativo.',
                dica: 'De x = 0 até x = 2, o resultado vai de 4 até -2.',
                solucao: 'Subiu: -2 - 4 = -6\nAndou: 2\nInclinação: -6 ÷ 2 = -3',
              },
            ],
          },
          {
            id: 'curva',
            titulo: 'A inclinação de uma curva',
            porque: 'As funções da aula não são retas: são curvas. Karpathy mede a inclinação delas dando um passo bem pequeno, e é essa ideia que construímos aqui.',
            passos: [
              {
                texto: `<p>Uma curva muda de inclinação a cada ponto. Como medir em um ponto só?</p>
<p>Fique no ponto <code>x</code> e olhe um pouco à frente. Chame esse "pouco" de <code>h</code>. Andamos <code>h</code>, e a inclinação do trecho é:</p>
<p><code>(f(x + h) - f(x)) ÷ h</code></p>`,
                tarefa: 'Em <code>f(x) = x²</code>, com <code>x = 1</code> e <code>h = 1</code>, qual é a inclinação do trecho?',
                figura: { modo: 'secante', f: (x) => x * x, x: [-1, 3], y: [-1, 9], x0: 1, nome: 'x²' },
                campos: [{ rotulo: 'Inclinação do trecho =', resposta: 3 }],
                erro: 'Calcule f(2) e f(1), subtraia e divida por 1.',
                dica: '<code>f(1 + 1)</code> é <code>f(2) = 4</code>, e <code>f(1) = 1</code>.',
                solucao: '(f(2) - f(1)) ÷ 1 = (4 - 1) ÷ 1 = 3',
              },
              {
                texto: `<p>Com <code>h</code> menor, o trecho fica mais curto e a medida fica mais fiel ao ponto.</p>
<p>Diminua o <code>h</code> no controle e olhe a linha dourada e o valor. Não podemos usar <code>h = 0</code>, porque não existe divisão por zero. Mas podemos chegar tão perto quanto quisermos.</p>`,
                tarefa: 'Conforme o <code>h</code> diminui, de qual número a inclinação se aproxima?',
                figura: { modo: 'secante', f: (x) => x * x, x: [-1, 3], y: [-1, 9], x0: 1, nome: 'x²' },
                campos: [{ rotulo: 'Ela se aproxima de', resposta: 2 }],
                erro: 'Leve o h até o menor valor e veja o número que aparece.',
                dica: 'Com <code>h = 0,01</code>, a medida é 2,01.',
                solucao: 'Ela se aproxima de 2: 3, depois 2,5, 2,25, 2,1 e 2,01.',
                certo: 'Esse número é a inclinação da curva exatamente em x = 1.',
              },
            ],
          },
          {
            id: 'derivada',
            titulo: 'O que é a derivada',
            porque: 'A derivada é o centro da aula. Treinar uma rede é usar derivadas para descobrir em que direção ajustar cada número, e o programa que Karpathy constrói existe para calculá-las.',
            passos: [
              {
                texto: `<p>Fazendo essa medida em vários pontos de <code>f(x) = x²</code>, aparece um padrão. Mova o ponto à direita e leia a inclinação.</p>
<p>A <strong>derivada</strong> é a função que dá a inclinação em cada ponto. Ela se escreve <code>f'(x)</code>, e lemos "f linha de x".</p>`,
                tarefa: 'Leia as inclinações. Depois diga qual seria a inclinação em <code>x = 5</code>, seguindo o padrão.',
                figura: { modo: 'tangente', f: (x) => x * x, df: (x) => 2 * x, x: [-3, 3], y: [-3, 9], min: -3, max: 3, passo: 0.5, inicial: 1, nome: 'x²' },
                campos: [{ rotulo: "f'(1) =", resposta: 2 }, { rotulo: "f'(2) =", resposta: 4 }, { rotulo: "f'(5) =", resposta: 10 }],
                erro: 'A inclinação em cada ponto tem uma relação simples com o x.',
                dica: 'A inclinação é sempre o dobro do x.',
                solucao: "f'(x) = 2x\nf'(1) = 2, f'(2) = 4, f'(5) = 10",
                certo: "Para f(x) = x², a derivada é f'(x) = 2x.",
              },
              {
                texto: `<p>O sinal da derivada conta o que a função está fazendo:</p>
<ul><li><strong>negativa:</strong> está descendo;</li><li><strong>zero:</strong> parou de descer ou de subir;</li><li><strong>positiva:</strong> está subindo.</li></ul>`,
                tarefa: 'Em <code>f(x) = x² - 4x</code>, em que <code>x</code> a função para de descer?',
                figura: { modo: 'tangente', f: (x) => x * x - 4 * x, df: (x) => 2 * x - 4, x: [-1, 5], y: [-5, 6], min: -1, max: 5, passo: 0.5, inicial: 0, nome: 'x² - 4x' },
                campos: [{ rotulo: 'x =', resposta: 2 }],
                erro: 'Mova o ponto até a linha dourada ficar plana.',
                dica: 'Procure onde a inclinação mostrada é 0.',
                solucao: 'Em x = 2, a inclinação é 0.',
                certo: 'Quando a derivada vale zero, a linha fica plana: é o ponto mais baixo desta curva.',
              },
            ],
          },
          {
            id: 'regras',
            titulo: 'As regras da derivada',
            porque: 'Uma rede neural é grande demais para derivar de uma vez. Na aula, cada conta pequena tem uma derivada conhecida, e o programa combina todas elas. Estas regras mostram de onde vêm essas derivadas pequenas.',
            passos: [
              {
                texto: `<p>Não é preciso medir sempre. Existe uma regra para as potências: o expoente desce para a frente, e a potência diminui um.</p>
<p><code>xⁿ</code> vira <code>n · xⁿ⁻¹</code>. Assim, <code>x²</code> vira <code>2x</code>, como você viu.</p>`,
                tarefa: 'Aplique a regra em <code>f(x) = x³</code>.',
                campos: [{ rotulo: "f'(x) = □ · x². O número no □ é", resposta: 3 }, { rotulo: "f'(2) =", resposta: 12 }],
                erro: 'O expoente 3 desce para a frente, e a potência cai para 2.',
                dica: "Fica <code>f'(x) = 3x²</code>. Agora troque o x por 2.",
                solucao: "f'(x) = 3x²\nf'(2) = 3 · 2² = 3 · 4 = 12",
              },
              {
                texto: `<p>Mais três regras, e pronto:</p>
<ul><li>Um número sozinho tem derivada 0, porque ele não muda.</li><li>Um número multiplicando fica: <code>5x²</code> vira <code>5 · 2x = 10x</code>.</li><li>Numa soma, cada parte deriva separada.</li></ul>`,
                tarefa: 'Derive <code>f(x) = 5x² - 3x + 7</code>, parte por parte.',
                campos: [{ rotulo: 'A derivada de 7 é', resposta: 0 }, { rotulo: 'A derivada de -3x é', resposta: -3 }, { rotulo: "f'(2) =", resposta: 17 }],
                erro: "Parte por parte: 5x² vira 10x, -3x vira -3, e o 7 some. Depois, troque o x por 2.",
                dica: "<code>f'(x) = 10x - 3</code>.",
                solucao: "f'(x) = 10x - 3\nf'(2) = 20 - 3 = 17",
              },
            ],
          },
        ],
      },
      { titulo: 'Várias entradas', licoes: [], topicos: 'Funções com mais de uma entrada, derivada parcial' },
      { titulo: 'A regra da cadeia', licoes: [], topicos: 'Uma função dentro da outra, a conta desenhada como grafo' },
      { titulo: 'Funções novas', licoes: [], topicos: 'Soma ponderada, a exponencial, a tangente hiperbólica' },
      { titulo: 'O erro', licoes: [], topicos: 'Medir um erro, erro quadrático, andar contra a inclinação' },
    ],
  },
  {
    id: 'programacao',
    titulo: 'Programação',
    modulos: [
      {
        titulo: 'Primeiros passos',
        licoes: [
          {
            id: 'programa',
            titulo: 'O que é um programa',
            porque: 'A aula inteira acontece em código: Karpathy escreve em Python e executa na hora, enquanto explica. Quem lê o código acompanha o raciocínio dele.',
            passos: [
              {
                texto: `<p>Um programa é uma lista de instruções para o computador. Vamos escrever em <strong>Python</strong>, uma linguagem de programação.</p>
<p>À direita fica o editor. Você escreve ali e clica em <strong>Executar</strong>, e o resultado aparece embaixo.</p>
<p><code>print(...)</code> manda mostrar na tela o que está entre os parênteses. Um texto vai entre aspas.</p>`,
                tarefa: 'Mude o texto para <code>Estou aprendendo Python</code> e clique em Executar.',
                inicio: `print("Olá, mundo")\n`,
                dica: 'Apague só o que está entre as aspas e escreva o novo texto.',
                solucao: `print("Estou aprendendo Python")\n`,
                checagem: `
if 'Estou aprendendo Python' not in saida:
    falha('Era para aparecer exatamente: Estou aprendendo Python')
`,
              },
              {
                texto: `<p>O computador segue as instruções em ordem, de cima para baixo, uma de cada vez.</p>`,
                tarefa: 'Troque a ordem das linhas para aparecer primeiro <code>Primeiro</code> e depois <code>Segundo</code>.',
                inicio: `print("Segundo")\nprint("Primeiro")\n`,
                dica: 'A linha de cima é executada antes.',
                solucao: `print("Primeiro")\nprint("Segundo")\n`,
                checagem: `
if saida.strip().splitlines() != ['Primeiro', 'Segundo']:
    falha('Devia aparecer Primeiro na primeira linha e Segundo na segunda.')
`,
              },
              {
                texto: `<p>Uma linha que começa com <code>#</code> é um <strong>comentário</strong>: um recado para quem lê. O computador ignora essa linha.</p>`,
                tarefa: 'Apague o <code>#</code> da primeira linha, para ela também ser executada.',
                inicio: `# print("Agora eu apareço")\nprint("Eu já aparecia")\n`,
                dica: 'A primeira linha precisa começar direto em <code>print</code>.',
                solucao: `print("Agora eu apareço")\nprint("Eu já aparecia")\n`,
                checagem: `
if len(saida.strip().splitlines()) != 2:
    falha('Deviam aparecer duas linhas.')
`,
              },
            ],
          },
          {
            id: 'contas',
            titulo: 'Contas',
            porque: 'Tudo o que uma rede neural faz são contas. Na aula, elas aparecem escritas em Python, e é preciso reconhecer cada sinal.',
            passos: [
              {
                texto: `<p>O computador faz contas. A soma e a subtração são como no papel. A multiplicação é <code>*</code>, e a divisão é <code>/</code>.</p>
<p>Número não leva aspas.</p>`,
                tarefa: 'Três livros custam 25 reais cada um. Mostre o preço total.',
                inicio: `print(2 + 3)\n`,
                dica: 'Troque a conta por uma multiplicação de 3 por 25.',
                solucao: `print(3 * 25)\n`,
                checagem: `
if saida.strip().splitlines()[-1:] != ['75']:
    falha('Devia aparecer 75.')
`,
              },
              {
                texto: `<p>A potência se escreve com dois asteriscos: <code>2 ** 3</code> é 2 × 2 × 2.</p>`,
                tarefa: 'Mostre 2 elevado a 10.',
                inicio: `print(2 ** 3)\n`,
                dica: 'Só um número muda.',
                solucao: `print(2 ** 10)\n`,
                checagem: `
if saida.strip().splitlines()[-1:] != ['1024']:
    falha('Devia aparecer 1024.')
`,
              },
              {
                texto: `<p>Nos programas, o número decimal se escreve com ponto, não com vírgula: <code>2.5</code>.</p>`,
                tarefa: 'Mostre o resultado de 9 dividido por 4.',
                inicio: `print(10 / 4)\n`,
                dica: 'Troque os dois números da conta.',
                solucao: `print(9 / 4)\n`,
                checagem: `
if saida.strip().splitlines()[-1:] != ['2.25']:
    falha('Devia aparecer 2.25.')
`,
              },
            ],
          },
          {
            id: 'variaveis',
            titulo: 'Variáveis',
            porque: 'Karpathy guarda cada valor com um nome e depois muda esses valores para ver o que acontece com o resultado. Quase todo o código da aula usa essa ideia.',
            passos: [
              {
                texto: `<p>Uma <strong>variável</strong> é um nome para um valor. Em <code>preco = 25</code>, o <code>=</code> não pergunta se os lados são iguais: ele manda guardar 25 no nome <code>preco</code>.</p>
<p>Depois, basta usar o nome. Nomes de variáveis não levam aspas nem acento.</p>`,
                tarefa: 'Crie <code>quantidade</code> com o valor 3 e <code>total</code> com o preço vezes a quantidade. Mostre <code>total</code>.',
                inicio: `preco = 25\nprint(preco)\n`,
                dica: 'Duas linhas novas: <code>quantidade = 3</code> e <code>total = preco * quantidade</code>. Depois, <code>print(total)</code>.',
                solucao: `preco = 25\nquantidade = 3\ntotal = preco * quantidade\nprint(total)\n`,
                checagem: `
tem('quantidade'); tem('total')
if total != 75:
    falha('total devia valer 75.')
if '75' not in saida.split():
    falha('O valor está certo. Falta mostrar com print(total).')
`,
              },
              {
                texto: `<p>Uma variável pode mudar. Na linha <code>pontos = pontos + 5</code>, o computador primeiro calcula a direita, com o valor atual, e depois guarda o resultado no mesmo nome.</p>`,
                tarefa: 'Antes do <code>print</code>, adicione uma linha que dobra o valor de <code>pontos</code>.',
                inicio: `pontos = 10\npontos = pontos + 5\nprint(pontos)\n`,
                dica: 'Use a mesma forma: <code>pontos = pontos * 2</code>.',
                solucao: `pontos = 10\npontos = pontos + 5\npontos = pontos * 2\nprint(pontos)\n`,
                checagem: `
tem('pontos')
if pontos != 30:
    falha('pontos devia terminar valendo 30.')
`,
              },
            ],
          },
        ],
      },
      {
        titulo: 'Funções',
        licoes: [
          {
            id: 'def',
            titulo: 'Escrever uma função',
            porque: 'A função que aparece na matemática também se escreve em código, e a aula faz isso logo no começo. Depois, a rede inteira é organizada em pedaços com nome.',
            passos: [
              {
                texto: `<p>Quando uma conta se repete, damos um nome a ela com <code>def</code>. Assim nasce uma função: ela recebe um valor e dá um resultado.</p>
<p>Repare nos dois-pontos no fim da primeira linha, no recuo de 4 espaços na linha de baixo, e no <code>return</code>, que diz qual é o resultado.</p>
<p>Para usar a função, escrevemos o nome e o valor entre parênteses: <code>dobro(5)</code>. Isso se chama <strong>chamar</strong> a função.</p>`,
                tarefa: 'Abaixo de <code>dobro</code>, escreva a função <code>triplo</code> e mostre <code>triplo(4)</code>.',
                inicio: `def dobro(numero):\n    return numero * 2\n\nprint(dobro(5))\n`,
                dica: 'Copie a forma de <code>dobro</code>, mudando o nome e a conta. Depois, <code>print(triplo(4))</code>.',
                solucao: `def dobro(numero):\n    return numero * 2\n\nprint(dobro(5))\n\ndef triplo(numero):\n    return numero * 3\n\nprint(triplo(4))\n`,
                checagem: `
tem('triplo')
if triplo(4) != 12 or triplo(0) != 0:
    falha('triplo(4) devia dar 12.')
if '12' not in saida.split():
    falha('A função está certa. Falta mostrar com print(triplo(4)).')
`,
              },
              {
                texto: `<p>Uma função pode ter várias entradas, separadas por vírgula.</p>`,
                tarefa: 'Escreva <code>total(preco, quantidade)</code>, que devolve o preço vezes a quantidade. Mostre <code>total(25, 3)</code>.',
                inicio: `# escreva a função aqui\n`,
                dica: 'A primeira linha é <code>def total(preco, quantidade):</code>. Na de baixo, com recuo, vem o <code>return</code>.',
                solucao: `def total(preco, quantidade):\n    return preco * quantidade\n\nprint(total(25, 3))\n`,
                checagem: `
tem('total')
if total(25, 3) != 75 or total(2, 0) != 0:
    falha('total(25, 3) devia dar 75.')
if '75' not in saida.split():
    falha('A função está certa. Falta mostrar com print(total(25, 3)).')
`,
              },
              {
                texto: `<p>Mostrar e devolver são coisas diferentes. <code>print</code> só mostra na tela. <code>return</code> entrega o valor para quem chamou.</p>
<p>Execute o código como está: <code>resultado</code> fica com <code>None</code>, que em Python significa "nada", porque a função não devolveu nada.</p>`,
                tarefa: 'Conserte a função para <code>resultado</code> valer 5.',
                inicio: `def soma(a, b):\n    print(a + b)\n\nresultado = soma(2, 3)\nprint(resultado)\n`,
                dica: 'Dentro da função, troque <code>print(a + b)</code> por <code>return a + b</code>.',
                solucao: `def soma(a, b):\n    return a + b\n\nresultado = soma(2, 3)\nprint(resultado)\n`,
                checagem: `
tem('resultado')
if resultado != 5:
    falha('resultado devia valer 5. A função precisa devolver o valor com return.')
`,
              },
            ],
          },
        ],
      },
      {
        titulo: 'Coleções e repetição',
        licoes: [
          {
            id: 'listas',
            titulo: 'Listas',
            porque: 'Uma rede neural tem muitos números e muitas peças. Na aula, eles ficam guardados juntos em listas.',
            passos: [
              {
                texto: `<p>Uma <strong>lista</strong> guarda vários valores em ordem, entre colchetes. <code>len(...)</code> diz quantos itens ela tem.</p>`,
                tarefa: 'Crie uma lista <code>temperaturas</code> com 20, 25, 30 e 22, e mostre o tamanho dela.',
                inicio: `notas = [7, 8, 10]\nprint(len(notas))\n`,
                dica: '<code>temperaturas = [20, 25, 30, 22]</code> e depois <code>print(len(temperaturas))</code>.',
                solucao: `temperaturas = [20, 25, 30, 22]\nprint(len(temperaturas))\n`,
                checagem: `
tem('temperaturas')
if list(temperaturas) != [20, 25, 30, 22]:
    falha('A lista devia ter 20, 25, 30 e 22, nessa ordem.')
if saida.strip().splitlines()[-1:] != ['4']:
    falha('A lista está certa. Falta mostrar o tamanho com print(len(temperaturas)).')
`,
              },
              {
                texto: `<p>Cada item tem uma posição, e a contagem <strong>começa do zero</strong>. O primeiro item é <code>cores[0]</code>, o segundo é <code>cores[1]</code>.</p>`,
                tarefa: 'Mostre o primeiro item da lista e depois o último, um <code>print</code> para cada.',
                inicio: `cores = ["azul", "verde", "branco"]\nprint(cores[1])\n`,
                dica: 'A lista tem 3 itens, então as posições são 0, 1 e 2.',
                solucao: `cores = ["azul", "verde", "branco"]\nprint(cores[0])\nprint(cores[2])\n`,
                checagem: `
if saida.strip().splitlines() != ['azul', 'branco']:
    falha('Deviam aparecer azul e, na linha de baixo, branco.')
`,
              },
              {
                texto: `<p><code>append</code> coloca um novo item no fim da lista. Escrevemos o nome da lista, um ponto e a ação: <code>notas.append(10)</code>.</p>`,
                tarefa: 'Adicione 10 ao fim da lista, antes do <code>print</code>.',
                inicio: `notas = [7, 8]\nprint(notas)\n`,
                dica: 'Uma linha nova, entre as duas: <code>notas.append(10)</code>.',
                solucao: `notas = [7, 8]\nnotas.append(10)\nprint(notas)\n`,
                checagem: `
tem('notas')
if notas != [7, 8, 10]:
    falha('A lista devia terminar como [7, 8, 10].')
`,
              },
            ],
          },
          {
            id: 'repetir',
            titulo: 'Repetir com for',
            porque: 'Treinar uma rede é repetir: calcular o erro, ajustar os números e começar de novo. Na aula, essa repetição é escrita com for.',
            passos: [
              {
                texto: `<p><code>for</code> repete um bloco de código para cada item de uma lista. A cada volta, o nome <code>nota</code> vale o item da vez.</p>
<p>O que se repete é o que está com recuo.</p>`,
                tarefa: 'Mude o código para mostrar o dobro de cada nota.',
                inicio: `notas = [7, 8, 10]\n\nfor nota in notas:\n    print(nota)\n`,
                dica: 'Só a linha com recuo muda: <code>print(nota * 2)</code>.',
                solucao: `notas = [7, 8, 10]\n\nfor nota in notas:\n    print(nota * 2)\n`,
                checagem: `
if saida.strip().splitlines() != ['14', '16', '20']:
    falha('Deviam aparecer 14, 16 e 20, um em cada linha.')
`,
              },
              {
                texto: `<p>Um uso muito comum: começar uma variável em zero e, a cada volta, acrescentar algo a ela.</p>`,
                tarefa: 'Dentro do <code>for</code>, some cada nota em <code>total</code>. O <code>print</code> sem recuo fica fora da repetição.',
                inicio: `notas = [7, 8, 10]\ntotal = 0\n\nfor nota in notas:\n    pass\n\nprint(total)\n`,
                dica: 'Troque <code>pass</code>, que significa "não faça nada", por <code>total = total + nota</code>.',
                solucao: `notas = [7, 8, 10]\ntotal = 0\n\nfor nota in notas:\n    total = total + nota\n\nprint(total)\n`,
                checagem: `
tem('total')
if total != 25:
    falha('total devia terminar valendo 25.')
`,
              },
              {
                texto: `<p><code>range(3)</code> gera os números 0, 1 e 2. Serve para repetir algo um certo número de vezes. Ele começa no zero e não inclui o número final.</p>`,
                tarefa: 'Mude o código para mostrar os números de 0 até 9.',
                inicio: `for i in range(3):\n    print(i)\n`,
                dica: 'Como o número final não entra, use <code>range(10)</code>.',
                solucao: `for i in range(10):\n    print(i)\n`,
                checagem: `
if saida.strip().splitlines() != [str(i) for i in range(10)]:
    falha('Deviam aparecer os números de 0 até 9, um em cada linha.')
`,
              },
            ],
          },
        ],
      },
      { titulo: 'Decidir', licoes: [], topicos: 'if e else, verdadeiro e falso' },
      { titulo: 'Objetos', licoes: [], topicos: 'Classes, __init__, __repr__, objetos que sabem somar' },
      { titulo: 'Mais coleções', licoes: [], topicos: 'Tupla, set, zip, sum, list comprehension' },
      { titulo: 'Funções avançadas', licoes: [], topicos: 'Função guardada em variável, closure, recursão' },
    ],
  },
]
