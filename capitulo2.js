// Capítulo 2: prepara a aula 2, "Building makemore". A aula conta pares de letras numa lista de nomes,
// transforma as contagens em probabilidades, sorteia nomes novos e mede o modelo com a perda.
// Como no Capítulo 1, os exemplos são próprios: palavras curtas em português, não os nomes da aula.

export const CAPITULO_2 = {
  n: 2,
  titulo: 'Capítulo 2',
  aula: 'https://www.youtube.com/watch?v=PaCmpygFfXo',
  partes: [
    {
      id: 'matematica',
      titulo: 'Matemática',
      modulos: [
        {
          titulo: 'Contar e probabilidade',
          licoes: [
            {
              id: 'frequencia',
              titulo: 'Contar e dividir',
              porque: 'A aula começa contando: quantas vezes cada letra aparece depois de outra, numa lista enorme de nomes. Para virar um modelo, essas contagens viram probabilidades, e isso é só uma divisão.',
              passos: [
                {
                  texto: `<p>Em 20 dias, choveu em 5. A <strong>frequência</strong> da chuva é a contagem dividida pelo total: 5 de 20.</p>
<p>Escrita como número, essa fração diz a chance de chover num dia qualquer. Chamamos esse número de <strong>probabilidade</strong>. Ela vai de 0, que significa nunca, até 1, que significa sempre.</p>`,
                  tarefa: 'Qual é a probabilidade de chover, escrita como número decimal?',
                  campos: [{ rotulo: 'P(chuva) =', resposta: 0.25 }],
                  erro: 'Divida os dias de chuva pelo total de dias.',
                  dica: '5 ÷ 20.',
                  solucao: '5 ÷ 20 = 0,25',
                },
                {
                  texto: `<p>Agora com letras. Num texto em português, olhamos tudo o que veio logo depois da letra <code>q</code>. Contamos: <code>u</code> apareceu 48 vezes e <code>a</code> apareceu 2 vezes.</p>
<p>A probabilidade de cada letra vir depois do <code>q</code> é a contagem dela dividida pelo total.</p>`,
                  tarefa: 'Qual é o total, e qual é a probabilidade de vir <code>u</code> depois de <code>q</code>?',
                  campos: [{ rotulo: 'total =', resposta: 50 }, { rotulo: 'P(u depois de q) =', resposta: 0.96 }],
                  erro: 'Some as duas contagens para achar o total. Depois divida 48 por ele.',
                  dica: '48 + 2 = 50. Depois, 48 ÷ 50.',
                  solucao: 'total = 48 + 2 = 50\nP(u depois de q) = 48 ÷ 50 = 0,96',
                },
                {
                  texto: `<p>Uma probabilidade nunca é negativa e nunca passa de 1: não dá para algo acontecer mais do que sempre.</p>`,
                  tarefa: 'Qual destes números <strong>não</strong> pode ser uma probabilidade?',
                  opcoes: [
                    { t: '0', por: '0 pode: é a probabilidade de algo que nunca acontece.' },
                    { t: '0,5', por: '0,5 pode: é metade das vezes.' },
                    { t: '1', por: '1 pode: é a probabilidade de algo que sempre acontece.' },
                    { t: '1,2', certa: true },
                  ],
                  erro: 'Procure o número fora do intervalo de 0 a 1.',
                  dica: 'Só um deles é maior que 1.',
                  solucao: '1,2 não pode: passa de 1.',
                },
              ],
            },
            {
              id: 'distribuicao',
              titulo: 'Uma distribuição',
              porque: 'Na aula, cada letra tem uma linha de contagens: quantas vezes cada outra letra veio depois dela. Dividindo cada contagem pela soma da linha, a linha vira uma distribuição: probabilidades que somam 1.',
              passos: [
                {
                  texto: `<p>Olhamos o que veio depois da letra <code>a</code> em algumas palavras: <code>n</code> veio 6 vezes, <code>r</code> veio 3 vezes e <code>s</code> veio 1 vez.</p>
<p>Uma <strong>distribuição</strong> é a lista das probabilidades de todas as opções. Cada uma é a contagem dividida pelo total.</p>`,
                  tarefa: 'Calcule a probabilidade de cada letra vir depois de <code>a</code>.',
                  figura: { modo: 'barras', rotulos: ['n', 'r', 's'], contagens: [6, 3, 1], max: 10 },
                  campos: [{ rotulo: 'P(n) =', resposta: 0.6 }, { rotulo: 'P(r) =', resposta: 0.3 }, { rotulo: 'P(s) =', resposta: 0.1 }],
                  erro: 'O total é 6 + 3 + 1. Divida cada contagem por ele.',
                  dica: 'O total é 10. Então P(n) = 6 ÷ 10.',
                  solucao: 'total = 10\nP(n) = 0,6\nP(r) = 0,3\nP(s) = 0,1',
                },
                {
                  texto: `<p>Mexa nas contagens, nos controles da figura. As probabilidades mudam, mas a soma delas não muda.</p>
<p>Isso acontece porque cada probabilidade é um pedaço do mesmo total, e os pedaços juntos formam o total inteiro.</p>`,
                  tarefa: 'Com as contagens 2, 2 e 4, qual é a probabilidade de <code>s</code>? E quanto dá a soma das três probabilidades?',
                  figura: { modo: 'barras', rotulos: ['n', 'r', 's'], contagens: [2, 2, 4], max: 10, mexer: true },
                  campos: [{ rotulo: 'P(s) =', resposta: 0.5 }, { rotulo: 'soma =', resposta: 1 }],
                  erro: 'O total agora é 8. E a soma das probabilidades de uma distribuição é sempre a mesma.',
                  dica: 'P(s) = 4 ÷ 8. A soma é 0,25 + 0,25 + 0,5.',
                  solucao: 'P(s) = 4 ÷ 8 = 0,5\nsoma = 0,25 + 0,25 + 0,5 = 1',
                  certo: 'A soma de uma distribuição é sempre 1. Na aula, isso é conferido no código, linha por linha da tabela.',
                },
              ],
            },
            {
              id: 'sortear',
              titulo: 'Sortear de uma distribuição',
              porque: 'Para inventar nomes novos, o modelo da aula sorteia a próxima letra usando as probabilidades. Letra provável sai mais vezes, letra rara sai menos, mas também pode sair.',
              passos: [
                {
                  texto: `<p>Como sortear com probabilidades diferentes? Uma faixa de 0 a 1 é dividida em pedaços do tamanho de cada probabilidade: <code>n</code> fica com 0,6, <code>r</code> com 0,3 e <code>s</code> com 0,1.</p>
<p>O computador sorteia um número qualquer entre 0 e 1, todos com a mesma chance. A letra que sai é a do pedaço onde o número caiu. Mexa no controle para ver.</p>`,
                  tarefa: 'Se o número sorteado for 0,75, qual letra sai?',
                  figura: { modo: 'faixa', rotulos: ['n', 'r', 's'], probs: [0.6, 0.3, 0.1], inicial: 0.3 },
                  opcoes: [
                    { t: 'n', por: 'O pedaço de n vai de 0 até 0,6. O número 0,75 já passou dele.' },
                    { t: 'r', certa: true },
                    { t: 's', por: 'O pedaço de s começa em 0,9. O número 0,75 ainda não chegou lá.' },
                  ],
                  erro: 'Veja em qual pedaço da faixa o 0,75 cai.',
                  dica: 'n vai de 0 a 0,6. r vai de 0,6 a 0,9.',
                  solucao: 'r: o pedaço de r vai de 0,6 até 0,9, e 0,75 está entre eles.',
                },
                {
                  texto: `<p>O pedaço de cada letra tem o tamanho da probabilidade dela. Por isso, sorteando muitas vezes, cada letra sai numa proporção perto da sua probabilidade.</p>`,
                  tarefa: 'Em 1.000 sorteios, mais ou menos quantas vezes sai <code>s</code>?',
                  figura: { modo: 'faixa', rotulos: ['n', 'r', 's'], probs: [0.6, 0.3, 0.1], inicial: 0.95 },
                  campos: [{ rotulo: 'perto de', resposta: 100 }],
                  erro: 'Multiplique o número de sorteios pela probabilidade de s.',
                  dica: '1.000 × 0,1.',
                  solucao: '1.000 × 0,1 = 100 vezes, mais ou menos',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Medir um modelo',
          licoes: [
            {
              id: 'sequencia',
              titulo: 'A probabilidade de uma palavra',
              porque: 'Para medir se o modelo é bom, a aula calcula a probabilidade que ele dá a cada nome. Como o modelo escolhe uma letra de cada vez, a probabilidade do nome inteiro é uma multiplicação.',
              passos: [
                {
                  texto: `<p>Uma moeda dá cara com probabilidade 0,5. Jogando duas vezes, a chance de dar cara <strong>e</strong> cara é a multiplicação: metade da metade.</p>`,
                  tarefa: 'Qual é a probabilidade de dar cara nas duas jogadas?',
                  campos: [{ rotulo: 'P(cara e cara) =', resposta: 0.25 }],
                  erro: 'Multiplique as duas probabilidades.',
                  dica: '0,5 × 0,5.',
                  solucao: '0,5 × 0,5 = 0,25',
                },
                {
                  texto: `<p>Uma palavra é uma letra depois da outra. Para o modelo saber onde a palavra começa e termina, marcamos as pontas com um ponto: <code>ou</code> vira <code>.ou.</code>, e os pares são <code>.o</code>, <code>ou</code> e <code>u.</code>.</p>
<p>Um modelo diz: a palavra começa com <code>o</code> com probabilidade 0,2; depois de <code>o</code> vem <code>u</code> com 0,5; e depois de <code>u</code> a palavra termina com 0,4.</p>`,
                  tarefa: 'Qual é a probabilidade que esse modelo dá à palavra <code>ou</code>?',
                  campos: [{ rotulo: 'P(ou) =', resposta: 0.04 }],
                  erro: 'Multiplique as três probabilidades, uma para cada par.',
                  dica: '0,2 × 0,5 × 0,4.',
                  solucao: '0,2 × 0,5 = 0,1\n0,1 × 0,4 = 0,04',
                },
                {
                  texto: `<p>Agora uma palavra com 10 pares, em que cada par tem probabilidade 0,1. A probabilidade da palavra é 0,1 multiplicado por ele mesmo 10 vezes: 0,0000000001.</p>
<p>Com nomes de verdade e milhares deles, esses números ficam tão pequenos que o computador mal consegue guardá-los.</p>`,
                  tarefa: 'O que acontece com a probabilidade de uma palavra quando ela fica mais longa?',
                  opcoes: [
                    { t: 'Fica maior, porque há mais letras.', por: 'Cada par multiplica por um número menor que 1, e isso só diminui o resultado.' },
                    { t: 'Fica cada vez menor, porque cada letra multiplica por um número menor que 1.', certa: true },
                    { t: 'Não muda.', por: 'Cada par novo entra na multiplicação.' },
                  ],
                  erro: 'Pense no que acontece ao multiplicar por 0,1 de novo e de novo.',
                  dica: 'Multiplicar por um número entre 0 e 1 sempre diminui o resultado.',
                  solucao: 'Fica cada vez menor. É por isso que a aula troca a multiplicação por uma soma, usando o logaritmo.',
                },
              ],
            },
            {
              id: 'logaritmo',
              titulo: 'O logaritmo',
              porque: 'As probabilidades multiplicadas ficam minúsculas. A aula resolve isso com o logaritmo, que transforma multiplicação em soma e números minúsculos em números negativos de tamanho comum.',
              passos: [
                {
                  texto: `<p>O <strong>logaritmo</strong> responde: quantas vezes preciso multiplicar 10 por ele mesmo para chegar a este número?</p>
<p>100 é 10 × 10, então <code>log(100) = 2</code>. E 1 não precisa de nenhuma multiplicação, então <code>log(1) = 0</code>.</p>`,
                  tarefa: 'Quanto vale <code>log(1000)</code> e <code>log(10)</code>?',
                  campos: [{ rotulo: 'log(1000) =', resposta: 3 }, { rotulo: 'log(10) =', resposta: 1 }],
                  erro: 'Conte quantos 10 são multiplicados.',
                  dica: '1000 = 10 × 10 × 10.',
                  solucao: 'log(1000) = 3\nlog(10) = 1',
                },
                {
                  texto: `<p>A propriedade que interessa à aula: o logaritmo de uma multiplicação é a <strong>soma</strong> dos logaritmos.</p>
<p><code>log(100 × 1000) = log(100) + log(1000)</code></p>`,
                  tarefa: 'Quanto vale <code>log(100 × 1000)</code>?',
                  campos: [{ rotulo: 'log(100 × 1000) =', resposta: 5 }],
                  erro: 'Some os dois logaritmos.',
                  dica: '2 + 3.',
                  solucao: 'log(100) + log(1000) = 2 + 3 = 5\nE de fato, 100 × 1000 = 100.000, com cinco zeros.',
                },
                {
                  texto: `<p>E números entre 0 e 1? Para chegar a 0,1 é preciso <strong>dividir</strong> 1 por 10, então <code>log(0,1) = −1</code>. Para 0,01, dividir duas vezes.</p>
<p>O gráfico mostra o logaritmo. Na aula, o logaritmo usado é o natural, que conta multiplicações por 2,718 em vez de 10. O formato da curva e as regras são os mesmos.</p>`,
                  tarefa: 'Quanto vale <code>log(0,01)</code> e <code>log(0,001)</code>?',
                  figura: { modo: 'ponto', f: (x) => Math.log(x), x: [0, 4], y: [-4, 2], min: 0.05, max: 4, passo: 0.05, inicial: 1, nome: 'log natural de x' },
                  campos: [{ rotulo: 'log(0,01) =', resposta: -2 }, { rotulo: 'log(0,001) =', resposta: -3 }],
                  erro: 'Conte quantas vezes 1 foi dividido por 10.',
                  dica: '0,01 = 1 ÷ 10 ÷ 10.',
                  solucao: 'log(0,01) = −2\nlog(0,001) = −3',
                },
                {
                  texto: `<p>Mexa no controle e leve o ponto para perto de 0. Uma probabilidade fica sempre entre 0 e 1, na parte da curva abaixo do eixo.</p>`,
                  tarefa: 'Quando uma probabilidade vai de 1 até perto de 0, o que acontece com o logaritmo dela?',
                  figura: { modo: 'ponto', f: (x) => Math.log(x), x: [0, 4], y: [-4, 2], min: 0.05, max: 4, passo: 0.05, inicial: 0.5, nome: 'log natural de x' },
                  opcoes: [
                    { t: 'Vai de 0 até números cada vez mais negativos.', certa: true },
                    { t: 'Vai de 0 até 1.', por: 'Para números menores que 1, o logaritmo é negativo.' },
                    { t: 'Fica sempre igual.', por: 'Mexa no controle: a curva desce cada vez mais perto do 0.' },
                  ],
                  erro: 'Olhe a curva entre 0 e 1.',
                  dica: 'Em 1 o logaritmo vale 0. Siga a curva para a esquerda.',
                  solucao: 'Vai de 0 até números cada vez mais negativos, sem fim, quando a probabilidade chega perto de 0.',
                },
              ],
            },
            {
              id: 'perda',
              titulo: 'A perda',
              porque: 'A aula resume a qualidade do modelo num único número: a média de menos o logaritmo das probabilidades. Quanto menor, melhor. É esse número que a rede neural, no fim da aula, aprende a diminuir.',
              passos: [
                {
                  texto: `<p>Um bom modelo dá probabilidade alta para os pares que aparecem de verdade. Para medir isso, usamos <strong>menos o logaritmo</strong> da probabilidade. Assim, o número fica positivo e funciona como um erro: certeza total dá 0, e quanto menor a probabilidade, maior o erro.</p>
<p>Alguns valores do logaritmo natural: <code>log(1) = 0</code>, <code>log(0,5) = −0,69</code>, <code>log(0,25) = −1,39</code>, <code>log(0,1) = −2,30</code>.</p>`,
                  tarefa: 'Quanto vale o erro, <code>−log(p)</code>, para um par com probabilidade 0,5? E para um par com probabilidade 0,1?',
                  campos: [{ rotulo: '−log(0,5) =', resposta: 0.69 }, { rotulo: '−log(0,1) =', resposta: 2.3 }],
                  erro: 'Use os valores da tabela e troque o sinal.',
                  dica: 'log(0,5) = −0,69. Menos isso dá 0,69.',
                  solucao: '−log(0,5) = 0,69\n−log(0,1) = 2,30',
                },
                {
                  texto: `<p>Uma palavra tem vários pares. A <strong>perda</strong> do modelo é a <strong>média</strong> dos erros de todos os pares: some e divida pela quantidade.</p>
<p>Somar logaritmos é o mesmo que pegar o logaritmo da multiplicação. Por isso a média de <code>−log</code> mede a probabilidade da palavra inteira, sem os números minúsculos.</p>`,
                  tarefa: 'Uma palavra tem três pares, com probabilidades 0,5, 0,25 e 0,1. Qual é a perda média?',
                  campos: [{ rotulo: 'perda =', resposta: 1.46, tol: 0.006 }],
                  erro: 'Some os três erros (0,69, 1,39 e 2,30) e divida por 3.',
                  dica: '0,69 + 1,39 + 2,30 = 4,38. Depois, 4,38 ÷ 3.',
                  solucao: '0,69 + 1,39 + 2,30 = 4,38\n4,38 ÷ 3 = 1,46',
                },
                {
                  texto: `<p>A perda permite comparar modelos com um único número: quanto menor, melhor o modelo explica as palavras de verdade.</p>`,
                  tarefa: 'O modelo A tem perda 2,4 nas mesmas palavras. O modelo B tem perda 1,9. Qual é melhor?',
                  opcoes: [
                    { t: 'O modelo A.', por: 'Perda maior significa probabilidades menores para as palavras que existem.' },
                    { t: 'O modelo B.', certa: true },
                    { t: 'Não dá para saber.', por: 'Nas mesmas palavras, dá: a perda menor indica o modelo melhor.' },
                  ],
                  erro: 'A perda funciona como um erro.',
                  dica: 'Erro menor é melhor.',
                  solucao: 'O modelo B: a perda dele é menor.',
                },
                {
                  texto: `<p>Um problema: se um par nunca apareceu na contagem, a probabilidade dele é 0, e <code>−log(0)</code> é infinito. Basta uma palavra com esse par para a perda inteira virar infinito.</p>
<p>A solução da aula: <strong>suavizar</strong>, somando 1 a todas as contagens antes de dividir. Nenhum par fica com probabilidade 0.</p>`,
                  tarefa: 'Depois de <code>a</code>, as contagens são: <code>n</code> 9, <code>r</code> 5, <code>s</code> 2 e <code>z</code> 0. Somando 1 a todas, qual é a probabilidade de <code>z</code>?',
                  figura: { modo: 'barras', rotulos: ['n', 'r', 's', 'z'], contagens: [10, 6, 3, 1], max: 10 },
                  campos: [{ rotulo: 'P(z) =', resposta: 0.05 }],
                  erro: 'Depois de somar 1, as contagens são 10, 6, 3 e 1. Divida a de z pelo novo total.',
                  dica: 'O novo total é 20.',
                  solucao: 'contagens: 10, 6, 3 e 1\ntotal = 20\nP(z) = 1 ÷ 20 = 0,05',
                },
              ],
            },
          ],
        },
        { titulo: 'Vetores e matrizes', licoes: [], topicos: 'Vetor, one-hot, multiplicar um vetor por uma matriz' },
        { titulo: 'Da contagem à rede', licoes: [], topicos: 'A exponencial, softmax, a perda como função dos pesos' },
      ],
    },
    {
      id: 'programacao',
      titulo: 'Programação',
      modulos: [
        {
          titulo: 'Textos e contagens',
          licoes: [
            {
              id: 'textos',
              titulo: 'Texto, letra por letra',
              porque: 'O modelo da aula lê palavras uma letra de cada vez, olhando pares de letras vizinhas. Em Python, um texto se comporta quase como uma lista de letras.',
              passos: [
                {
                  texto: `<p>Um texto entre aspas também tem posições, como uma lista: <code>palavra[0]</code> é a primeira letra. E <code>palavra[-1]</code>, com o número negativo, conta do fim: é a última letra.</p>`,
                  tarefa: 'Mostre a primeira letra e depois a última letra de <code>palavra</code>, um <code>print</code> para cada.',
                  inicio: `palavra = "cavalo"\nprint(len(palavra))\n`,
                  dica: '<code>print(palavra[0])</code> e <code>print(palavra[-1])</code>.',
                  solucao: `palavra = "cavalo"\nprint(palavra[0])\nprint(palavra[-1])\n`,
                  checagem: `
if saida.split()[-2:] != ['c', 'o']:
    falha('Deviam aparecer c e, na linha de baixo, o.')
`,
                },
                {
                  texto: `<p>Um <strong>par</strong> é uma letra e a seguinte. Para a posição <code>i</code>, o par é <code>palavra[i]</code> e <code>palavra[i + 1]</code>.</p>
<p>Uma palavra de 3 letras tem 2 pares. Por isso o <code>range</code> vai até <code>len(palavra) - 1</code>: a última letra não tem seguinte.</p>`,
                  tarefa: 'Complete o <code>print</code> para mostrar cada par de <code>sol</code>: as duas letras, separadas por espaço.',
                  inicio: `palavra = "sol"\n\nfor i in range(len(palavra) - 1):\n    print(palavra[i])\n`,
                  dica: '<code>print(palavra[i], palavra[i + 1])</code>. O <code>print</code> com vírgula separa com espaço.',
                  solucao: `palavra = "sol"\n\nfor i in range(len(palavra) - 1):\n    print(palavra[i], palavra[i + 1])\n`,
                  checagem: `
if saida.strip().splitlines() != ['s o', 'o l']:
    falha('Deviam aparecer "s o" e, embaixo, "o l".')
`,
                },
                {
                  texto: `<p>O modelo também precisa saber como uma palavra começa e como termina. Na aula, as pontas são marcadas com um ponto: <code>"." + palavra + "."</code>.</p>
<p>O <code>+</code> entre textos junta os textos.</p>`,
                  tarefa: 'Crie <code>marcada</code>, a palavra com um ponto em cada ponta, e mostre os pares de <code>marcada</code>.',
                  inicio: `palavra = "mar"\nmarcada = palavra\n\nfor i in range(len(marcada) - 1):\n    print(marcada[i], marcada[i + 1])\n`,
                  dica: '<code>marcada = "." + palavra + "."</code>.',
                  solucao: `palavra = "mar"\nmarcada = "." + palavra + "."\n\nfor i in range(len(marcada) - 1):\n    print(marcada[i], marcada[i + 1])\n`,
                  checagem: `
tem('marcada')
if marcada != '.mar.':
    falha('marcada devia ser ".mar.".')
if saida.strip().splitlines() != ['. m', 'm a', 'a r', 'r .']:
    falha('Deviam aparecer os quatro pares: ". m", "m a", "a r" e "r .".')
`,
                  certo: 'Agora o primeiro par diz como a palavra começa, e o último diz que ela termina depois do r.',
                },
              ],
            },
            {
              id: 'dicionarios',
              titulo: 'Contar com um dicionário',
              porque: 'A primeira versão do modelo da aula é uma contagem: para cada par de letras, quantas vezes ele apareceu. Um dicionário guarda exatamente isso: para cada nome, um número.',
              passos: [
                {
                  texto: `<p>Um <strong>dicionário</strong> guarda pares de chave e valor, entre chaves: <code>{"a": 3}</code>. A chave serve para achar o valor: <code>estoque["a"]</code> dá 3.</p>
<p>Para guardar um valor novo, escrevemos a chave entre colchetes e usamos o <code>=</code>.</p>`,
                  tarefa: 'Guarde no dicionário a chave <code>"pera"</code> com valor 2, e mostre o dicionário.',
                  inicio: `estoque = {"maçã": 5, "uva": 1}\nprint(estoque["maçã"])\n`,
                  dica: 'Uma linha nova: <code>estoque["pera"] = 2</code>. Depois, <code>print(estoque)</code>.',
                  solucao: `estoque = {"maçã": 5, "uva": 1}\nestoque["pera"] = 2\nprint(estoque)\n`,
                  checagem: `
tem('estoque')
if estoque != {'maçã': 5, 'uva': 1, 'pera': 2}:
    falha('O dicionário devia ficar com maçã 5, uva 1 e pera 2.')
`,
                },
                {
                  texto: `<p>Para contar, cada letra nova começa em 0 e ganha mais 1 a cada vez que aparece. <code>contagem.get(letra, 0)</code> dá o valor guardado, ou 0 se a letra ainda não estiver lá.</p>`,
                  tarefa: 'Dentro do <code>for</code>, some 1 na contagem de cada letra de <code>banana</code>.',
                  inicio: `contagem = {}\n\nfor letra in "banana":\n    pass\n\nprint(contagem)\n`,
                  dica: 'Troque <code>pass</code> por <code>contagem[letra] = contagem.get(letra, 0) + 1</code>.',
                  solucao: `contagem = {}\n\nfor letra in "banana":\n    contagem[letra] = contagem.get(letra, 0) + 1\n\nprint(contagem)\n`,
                  checagem: `
tem('contagem')
if contagem != {'b': 1, 'a': 3, 'n': 2}:
    falha('A contagem devia dar b: 1, a: 3 e n: 2.')
`,
                },
                {
                  texto: `<p>Agora juntando tudo: para cada palavra, marcar as pontas e contar cada par. A chave do dicionário é o par, escrito como um texto de duas letras: <code>a + b</code>.</p>
<p>Repare no <code>for</code> dentro do outro <code>for</code>: para cada palavra, passamos por todos os pares dela.</p>`,
                  tarefa: 'Complete a linha que conta cada par.',
                  inicio: `palavras = ["ana", "ano"]\npares = {}\n\nfor palavra in palavras:\n    marcada = "." + palavra + "."\n    for i in range(len(marcada) - 1):\n        par = marcada[i] + marcada[i + 1]\n        # conte o par aqui\n\nprint(pares)\n`,
                  dica: 'Igual à contagem de letras: <code>pares[par] = pares.get(par, 0) + 1</code>, com o mesmo recuo do <code>par = ...</code>.',
                  solucao: `palavras = ["ana", "ano"]\npares = {}\n\nfor palavra in palavras:\n    marcada = "." + palavra + "."\n    for i in range(len(marcada) - 1):\n        par = marcada[i] + marcada[i + 1]\n        pares[par] = pares.get(par, 0) + 1\n\nprint(pares)\n`,
                  checagem: `
tem('pares')
if pares != {'.a': 2, 'an': 2, 'na': 1, 'a.': 1, 'no': 1, 'o.': 1}:
    falha('Os pares deviam ser: .a 2, an 2, na 1, a. 1, no 1, o. 1.')
`,
                  certo: 'Esse dicionário já é o modelo da primeira parte da aula, em miniatura: ele sabe, por exemplo, que toda palavra aqui começa com a.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Tabelas e sorteios',
          licoes: [
            {
              id: 'tabela',
              titulo: 'Uma tabela de contagens',
              porque: 'Na aula, as contagens vão para uma tabela: uma linha para cada letra, uma coluna para cada letra seguinte. Para achar a linha certa, cada letra ganha um número.',
              passos: [
                {
                  texto: `<p>Para usar uma tabela, cada letra precisa de um número: a posição dela. <code>enumerate</code> passa por uma lista dando a posição e o item ao mesmo tempo.</p>`,
                  tarefa: 'Dentro do <code>for</code>, guarde em <code>posicao</code> cada letra com a sua posição.',
                  inicio: `letras = [".", "a", "n", "o"]\nposicao = {}\n\nfor i, letra in enumerate(letras):\n    print(i, letra)\n\nprint(posicao)\n`,
                  dica: 'Dentro do <code>for</code>: <code>posicao[letra] = i</code>.',
                  solucao: `letras = [".", "a", "n", "o"]\nposicao = {}\n\nfor i, letra in enumerate(letras):\n    posicao[letra] = i\n\nprint(posicao)\n`,
                  checagem: `
tem('posicao')
if posicao != {'.': 0, 'a': 1, 'n': 2, 'o': 3}:
    falha('posicao devia ser {".": 0, "a": 1, "n": 2, "o": 3}.')
`,
                },
                {
                  texto: `<p>Uma tabela pode ser uma lista de listas: cada lista de dentro é uma linha. <code>tabela[1][2]</code> é a linha 1, coluna 2.</p>
<p>A linha é a letra de agora, e a coluna é a letra seguinte. Para contar o par <code>an</code>, somamos 1 em <code>tabela[posicao["a"]][posicao["n"]]</code>.</p>`,
                  tarefa: 'Complete a linha que soma 1 na tabela para cada par de <code>.ana.</code>.',
                  inicio: `posicao = {".": 0, "a": 1, "n": 2}\ntabela = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]\n\nmarcada = ".ana."\nfor i in range(len(marcada) - 1):\n    linha = posicao[marcada[i]]\n    coluna = posicao[marcada[i + 1]]\n    # some 1 na tabela aqui\n\nfor l in tabela:\n    print(l)\n`,
                  dica: '<code>tabela[linha][coluna] += 1</code>.',
                  solucao: `posicao = {".": 0, "a": 1, "n": 2}\ntabela = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]\n\nmarcada = ".ana."\nfor i in range(len(marcada) - 1):\n    linha = posicao[marcada[i]]\n    coluna = posicao[marcada[i + 1]]\n    tabela[linha][coluna] += 1\n\nfor l in tabela:\n    print(l)\n`,
                  checagem: `
tem('tabela')
if tabela != [[0, 1, 0], [1, 0, 1], [0, 1, 0]]:
    falha('A tabela devia ficar [[0, 1, 0], [1, 0, 1], [0, 1, 0]]. Use tabela[linha][coluna] += 1.')
`,
                  certo: 'Leia a linha do a: [1, 0, 1]. Depois de a, veio uma vez o ponto (o fim) e uma vez o n.',
                },
                {
                  texto: `<p>Para virar probabilidades, cada linha é dividida pela soma dela. <code>sum(linha)</code> soma os números de uma lista.</p>`,
                  tarefa: 'Complete o <code>for</code> para guardar em <code>probs</code> cada contagem da linha dividida pelo total.',
                  inicio: `linha = [6, 3, 1]\ntotal = sum(linha)\nprobs = []\n\nfor c in linha:\n    pass\n\nprint(probs)\n`,
                  dica: 'Troque <code>pass</code> por <code>probs.append(c / total)</code>.',
                  solucao: `linha = [6, 3, 1]\ntotal = sum(linha)\nprobs = []\n\nfor c in linha:\n    probs.append(c / total)\n\nprint(probs)\n`,
                  checagem: `
tem('probs')
if len(probs) != 3 or not all(perto(a, b) for a, b in zip(probs, [0.6, 0.3, 0.1])):
    falha('probs devia ser [0.6, 0.3, 0.1].')
`,
                },
              ],
            },
            {
              id: 'sorteio',
              titulo: 'Sortear em Python',
              porque: 'Para inventar palavras, a aula sorteia uma letra de cada vez com as probabilidades da tabela. E fixa a semente do sorteio, para que o resultado possa ser repetido.',
              passos: [
                {
                  texto: `<p><code>random.choices</code> sorteia de uma lista usando pesos: <code>weights</code> são as probabilidades, e <code>k</code> é quantos sorteios fazer.</p>
<p><code>lista.count(x)</code> conta quantas vezes <code>x</code> aparece numa lista.</p>`,
                  tarefa: 'Faça 1.000 sorteios em vez de 10 e guarde em <code>quantos_n</code> quantas vezes saiu <code>n</code>.',
                  inicio: `import random\n\nsorteios = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=10)\nprint(sorteios)\n`,
                  dica: 'Mude o <code>k</code> para 1000. Depois, <code>quantos_n = sorteios.count("n")</code>.',
                  solucao: `import random\n\nsorteios = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=1000)\nquantos_n = sorteios.count("n")\nprint(quantos_n)\n`,
                  checagem: `
tem('sorteios')
tem('quantos_n')
if len(sorteios) != 1000:
    falha('Deviam ser 1000 sorteios. Mude o k.')
if quantos_n != sorteios.count('n'):
    falha('quantos_n devia ser sorteios.count("n").')
`,
                  certo: 'Saiu n perto de 600 vezes, como a probabilidade 0,6 prevê. Execute de novo: o número muda um pouco a cada vez.',
                },
                {
                  texto: `<p>Cada execução sorteia diferente. Para repetir exatamente os mesmos sorteios, fixamos a <strong>semente</strong>: <code>random.seed(7)</code>. Com a mesma semente, a mesma sequência sai de novo.</p>
<p>A aula faz isso para que todo mundo veja os mesmos nomes inventados.</p>`,
                  tarefa: 'Coloque <code>random.seed(7)</code> antes de cada um dos dois sorteios, para as duas listas saírem iguais.',
                  inicio: `import random\n\nprimeira = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=8)\n\nsegunda = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=8)\n\nprint(primeira)\nprint(segunda)\nprint(primeira == segunda)\n`,
                  dica: 'Uma linha <code>random.seed(7)</code> antes de <code>primeira = ...</code>, e outra antes de <code>segunda = ...</code>.',
                  solucao: `import random\n\nrandom.seed(7)\nprimeira = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=8)\n\nrandom.seed(7)\nsegunda = random.choices(["n", "r", "s"], weights=[0.6, 0.3, 0.1], k=8)\n\nprint(primeira)\nprint(segunda)\nprint(primeira == segunda)\n`,
                  checagem: `
tem('primeira')
tem('segunda')
if primeira != segunda:
    falha('As duas listas ainda saíram diferentes. Fixe a semente antes de cada sorteio.')
import random as _r
_r.seed(7)
if primeira != _r.choices(['n', 'r', 's'], weights=[0.6, 0.3, 0.1], k=8):
    falha('Use a semente 7, com random.seed(7).')
`,
                },
                {
                  texto: `<p>Agora, inventar uma palavra. Começamos no ponto, sorteamos a próxima letra com as probabilidades da letra atual, e repetimos até sair o ponto de novo.</p>
<p><code>while</code> repete enquanto a condição for verdadeira. Aqui: enquanto a letra atual não for o ponto. O <code>!=</code> significa "diferente de".</p>`,
                  tarefa: 'Complete a linha do sorteio: escolha 1 letra de <code>letras</code> com os pesos <code>probs[atual]</code>.',
                  inicio: `import random\n\nletras = [".", "a", "n", "o"]\nprobs = {\n    ".": [0.0, 0.7, 0.1, 0.2],\n    "a": [0.4, 0.0, 0.5, 0.1],\n    "n": [0.0, 0.6, 0.0, 0.4],\n    "o": [0.7, 0.1, 0.2, 0.0],\n}\n\ndef inventar():\n    palavra = ""\n    atual = random.choices(letras, weights=probs["."])[0]\n    while atual != ".":\n        palavra = palavra + atual\n        atual = "."  # troque por um sorteio\n    return palavra\n\nrandom.seed(3)\nfor _ in range(5):\n    print(inventar())\n`,
                  dica: '<code>atual = random.choices(letras, weights=probs[atual])[0]</code>. O <code>[0]</code> pega o único item da lista sorteada.',
                  solucao: `import random\n\nletras = [".", "a", "n", "o"]\nprobs = {\n    ".": [0.0, 0.7, 0.1, 0.2],\n    "a": [0.4, 0.0, 0.5, 0.1],\n    "n": [0.0, 0.6, 0.0, 0.4],\n    "o": [0.7, 0.1, 0.2, 0.0],\n}\n\ndef inventar():\n    palavra = ""\n    atual = random.choices(letras, weights=probs["."])[0]\n    while atual != ".":\n        palavra = palavra + atual\n        atual = random.choices(letras, weights=probs[atual])[0]\n    return palavra\n\nrandom.seed(3)\nfor _ in range(5):\n    print(inventar())\n`,
                  checagem: `
tem('inventar')
import random as _r
_r.seed(11)
feitas = [inventar() for _ in range(40)]
if all(len(p) <= 1 for p in feitas):
    falha('As palavras estão saindo com uma letra só. Sorteie a próxima letra dentro do while.')
pode = {('.', 'a'), ('.', 'n'), ('.', 'o'), ('a', '.'), ('a', 'n'), ('a', 'o'), ('n', 'a'), ('n', 'o'), ('o', '.'), ('o', 'a'), ('o', 'n')}
for p in feitas:
    m = '.' + p + '.'
    for i in range(len(m) - 1):
        if (m[i], m[i + 1]) not in pode:
            falha('Saiu um par que tem probabilidade zero: ' + m[i] + m[i + 1] + '. Use os pesos da letra atual, probs[atual].')
`,
                  certo: 'Palavras inventadas por um modelo de pares de letras. Na aula, é a mesma ideia, com uma tabela de 27 letras contada em milhares de nomes.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Tabelas com NumPy',
          licoes: [
            {
              id: 'arrays',
              titulo: 'Tabelas de números',
              porque: 'A aula guarda a tabela de contagens num tensor do PyTorch. Aqui usamos o NumPy, que roda no navegador e tem quase os mesmos nomes. O que vale para um vale para o outro.',
              passos: [
                {
                  texto: `<p><code>np.zeros((3, 3))</code> cria uma tabela de 3 linhas e 3 colunas cheia de zeros. Uma posição é escrita com os dois números juntos: <code>N[1, 2]</code>.</p>
<p><code>N.shape</code> diz o formato: quantas linhas e quantas colunas. No PyTorch, a tabela seria criada com <code>torch.zeros((3, 3))</code>.</p>`,
                  tarefa: 'Crie <code>N</code> com 4 linhas e 4 colunas de zeros, e ponha 5 na linha 0, coluna 1.',
                  inicio: `import numpy as np\n\nN = np.zeros((3, 3))\nN[1, 2] = 7\nprint(N)\nprint(N.shape)\n`,
                  dica: '<code>N = np.zeros((4, 4))</code> e <code>N[0, 1] = 5</code>.',
                  solucao: `import numpy as np\n\nN = np.zeros((4, 4))\nN[0, 1] = 5\nprint(N)\nprint(N.shape)\n`,
                  checagem: `
tem('N')
if N.shape != (4, 4):
    falha('N devia ter 4 linhas e 4 colunas.')
if N[0, 1] != 5 or N.sum() != 5:
    falha('N devia ter 5 na linha 0, coluna 1, e zero no resto.')
`,
                },
                {
                  texto: `<p><code>N.sum()</code> soma a tabela inteira. Com <code>axis=1</code>, soma <strong>ao longo das colunas</strong>, e sobra um total por linha.</p>
<p>No PyTorch, o mesmo se escreve <code>N.sum(1)</code>.</p>`,
                  tarefa: 'Guarde em <code>somas</code> a soma de cada linha de <code>N</code>.',
                  inicio: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nprint(N.sum())\nsomas = None\nprint(somas)\n`,
                  dica: '<code>somas = N.sum(axis=1)</code>.',
                  solucao: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nprint(N.sum())\nsomas = N.sum(axis=1)\nprint(somas)\n`,
                  checagem: `
tem('somas')
if somas is None or list(somas) != [10, 8, 10, 10]:
    falha('somas devia ser [10, 8, 10, 10], um total por linha.')
`,
                },
              ],
            },
            {
              id: 'broadcasting',
              titulo: 'Dividir cada linha pela sua soma',
              porque: 'Na aula aparece um erro que não dá mensagem nenhuma: dividir pela soma do jeito errado divide as colunas em vez das linhas. Entender o formato das somas, e o broadcasting, evita esse erro.',
              passos: [
                {
                  texto: `<p>Quando dividimos uma tabela por uma lista menor, o NumPy <strong>estica</strong> a lista para ela caber na tabela. Isso se chama <strong>broadcasting</strong>, e a regra olha o formato.</p>
<p><code>N.sum(axis=1)</code> tem formato <code>(4,)</code>: uma lista solta. Com <code>keepdims=True</code>, o formato vira <code>(4, 1)</code>: uma coluna, com um total por linha.</p>`,
                  tarefa: 'Mostre o formato das duas somas: sem e com <code>keepdims=True</code>.',
                  inicio: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nprint(N.sum(axis=1))\n`,
                  dica: '<code>print(N.sum(axis=1).shape)</code> e <code>print(N.sum(axis=1, keepdims=True).shape)</code>.',
                  solucao: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nprint(N.sum(axis=1).shape)\nprint(N.sum(axis=1, keepdims=True).shape)\n`,
                  checagem: `
if '(4,)' not in saida or '(4, 1)' not in saida:
    falha('Deviam aparecer os dois formatos: (4,) e (4, 1).')
`,
                },
                {
                  texto: `<p>Uma lista solta, de formato <code>(4,)</code>, é esticada como se fosse uma <strong>linha</strong>: o primeiro total divide a primeira <strong>coluna</strong>, e assim por diante. O código roda sem erro, mas a conta sai errada.</p>
<p>A coluna de formato <code>(4, 1)</code> é esticada para o lado: cada total divide a <strong>sua</strong> linha. É o que queremos. No PyTorch, o mesmo se escreve <code>N.sum(1, keepdim=True)</code>.</p>`,
                  tarefa: 'Execute e veja que as linhas de <code>P</code> não somam 1. Conserte a divisão para cada linha somar 1.',
                  inicio: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nP = N / N.sum(axis=1)\nprint(P.sum(axis=1))\n`,
                  dica: 'Acrescente <code>keepdims=True</code> dentro do <code>sum</code> da divisão.',
                  solucao: `import numpy as np\n\nN = np.array([[0, 6, 3, 1],\n              [4, 0, 2, 2],\n              [1, 1, 0, 8],\n              [5, 0, 5, 0]])\n\nP = N / N.sum(axis=1, keepdims=True)\nprint(P.sum(axis=1))\n`,
                  checagem: `
import numpy as _np
tem('P')
if P.shape != (4, 4):
    falha('P devia continuar com 4 linhas e 4 colunas.')
if not _np.allclose(P.sum(axis=1), 1):
    falha('As linhas de P ainda não somam 1. Divida pela soma com keepdims=True.')
if not _np.allclose(P[0], [0, 0.6, 0.3, 0.1]):
    falha('A primeira linha devia ser [0, 0.6, 0.3, 0.1].')
`,
                  certo: 'Cada linha agora é uma distribuição. Na aula, esse é exatamente o cuidado na hora de normalizar a tabela de contagens.',
                },
              ],
            },
          ],
        },
        { titulo: 'PyTorch', licoes: [], topicos: 'Tensores, torch.multinomial, gerador com semente, requires_grad' },
      ],
    },
    {
      // Depois da aula 2: a pessoa já viu o modelo de pares de letras. Aqui ela olha mais para trás,
      // separa treino e teste e escolhe a suavização medindo, como se faz numa pesquisa de verdade.
      id: 'depois',
      titulo: 'Depois da aula',
      modulos: [
        {
          titulo: 'Exercícios da aula 2',
          licoes: [
            {
              id: 'trigramas',
              titulo: 'Olhar duas letras para trás',
              porque: 'O modelo da aula olha só uma letra para decidir a próxima. O primeiro exercício proposto por Karpathy é olhar duas. Aqui você conta os trios de letras e descobre o preço de olhar mais longe.',
              passos: [
                {
                  texto: `<p>Um <strong>trio</strong> são duas letras de contexto e a letra seguinte. Para a palavra começar com contexto, marcamos o início com dois pontos: <code>"ana"</code> vira <code>"..ana."</code>.</p>
<p>Um pedaço de um texto se pega com dois-pontos dentro dos colchetes: <code>marcada[i:i + 3]</code> são as 3 letras a partir da posição <code>i</code>.</p>`,
                  tarefa: 'Complete a linha que conta cada trio.',
                  inicio: `palavras = ["ana", "ano"]\ntrios = {}\n\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        # conte o trio aqui\n\nprint(trios)\n`,
                  dica: 'Igual à contagem de pares: <code>trios[trio] = trios.get(trio, 0) + 1</code>.',
                  solucao: `palavras = ["ana", "ano"]\ntrios = {}\n\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        trios[trio] = trios.get(trio, 0) + 1\n\nprint(trios)\n`,
                  checagem: `
tem('trios')
if trios != {'..a': 2, '.an': 2, 'ana': 1, 'na.': 1, 'ano': 1, 'no.': 1}:
    falha('Os trios deviam ser: ..a 2, .an 2, ana 1, na. 1, ano 1, no. 1.')
`,
                },
                {
                  texto: `<p>Com 27 símbolos (as 26 letras e o ponto), existem 27 × 27 = 729 contextos de duas letras. Quantos deles aparecem de verdade numa lista de 50 palavras?</p>
<p><code>.split()</code> corta um texto nos espaços e devolve uma lista. <code>set</code> guarda cada coisa uma vez só, sem repetir, e <code>.add</code> coloca um item nele.</p>`,
                  tarefa: 'Dentro do <code>for</code>, guarde em <code>contextos</code> as duas letras de contexto de cada trio. Depois mostre quantos contextos diferentes apareceram.',
                  inicio: `palavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\ncontextos = set()\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        pass\n\nprint(len(contextos), "de", 27 * 27)\n`,
                  dica: 'Troque <code>pass</code> por <code>contextos.add(marcada[i:i + 2])</code>.',
                  solucao: `palavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\ncontextos = set()\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        contextos.add(marcada[i:i + 2])\n\nprint(len(contextos), "de", 27 * 27)\n`,
                  checagem: `
tem('contextos')
if len(contextos) != 109:
    falha('Deviam ser 109 contextos diferentes. Guarde as duas letras de contexto: marcada[i:i + 2].')
`,
                  certo: 'Só 109 dos 729 contextos apareceram. Em mais de 85% deles, o modelo de trios não tem nenhuma contagem.',
                },
                {
                  texto: `<p>Com pares, cada contexto é uma letra só, e quase todas aparecem nos dados. Com trios, a maioria dos contextos nunca apareceu.</p>`,
                  tarefa: 'Com poucos dados, o que acontece quando o modelo olha mais letras para trás?',
                  opcoes: [
                    { t: 'Fica sempre melhor, porque usa mais informação.', por: 'Mais informação ajuda só quando há dados para estimar cada contexto. Aqui, a maioria nunca apareceu.' },
                    { t: 'Muitos contextos nunca aparecem, e o modelo depende mais da suavização ou de mais dados.', certa: true },
                    { t: 'Nada muda: pares e trios dão a mesma perda.', por: 'Os dois modelos dão probabilidades diferentes, e por isso perdas diferentes.' },
                  ],
                  erro: 'Pense nos 620 contextos sem nenhuma contagem.',
                  dica: 'Um contexto sem contagem tem probabilidade zero para tudo, até ser suavizado.',
                  solucao: 'Muitos contextos ficam sem contagem. Esse é o problema que as redes neurais das próximas aulas resolvem: elas compartilham o que aprendem entre contextos parecidos.',
                },
              ],
            },
            {
              id: 'treino-teste',
              titulo: 'Separar treino e teste',
              porque: 'Na aula, a perda é medida nas mesmas palavras que foram contadas. Karpathy propõe separar uma parte das palavras para testar o modelo. É a primeira regra de qualquer experimento em aprendizado de máquina.',
              passos: [
                {
                  texto: `<p>Um modelo de contagem conhece bem as palavras que contou. A pergunta que interessa é outra: ele funciona para palavras <strong>que nunca viu</strong>?</p>`,
                  tarefa: 'Por que medir a perda em palavras que ficaram de fora da contagem?',
                  opcoes: [
                    { t: 'Porque assim a perda fica menor.', por: 'Em palavras novas, a perda costuma ficar maior, não menor.' },
                    { t: 'Porque o modelo pode ter só decorado as palavras que contou. Palavras novas mostram se ele generaliza.', certa: true },
                    { t: 'Porque contar todas as palavras demora demais.', por: 'Contar é rápido. O motivo é medir de forma honesta.' },
                  ],
                  erro: 'Pense na diferença entre decorar e aprender.',
                  dica: 'Uma prova com as mesmas questões do exercício mede o quê?',
                  solucao: 'O teste com palavras novas mostra se o modelo generaliza, e não só se decorou.',
                },
                {
                  texto: `<p>Primeiro, embaralhar, para a separação não depender da ordem da lista. <code>random.shuffle</code> embaralha a lista no lugar, e a semente fixa o resultado.</p>
<p>Depois, cortar: <code>palavras[:40]</code> são as 40 primeiras, e <code>palavras[40:]</code> é o resto.</p>`,
                  tarefa: 'Separe as 40 primeiras palavras em <code>treino</code> e as outras em <code>teste</code>.',
                  inicio: `import random\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\nrandom.seed(1)\nrandom.shuffle(palavras)\n\ntreino = palavras\nteste = []\n\nprint(len(treino), len(teste))\nprint(teste)\n`,
                  dica: '<code>treino = palavras[:40]</code> e <code>teste = palavras[40:]</code>.',
                  solucao: `import random\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\nrandom.seed(1)\nrandom.shuffle(palavras)\n\ntreino = palavras[:40]\nteste = palavras[40:]\n\nprint(len(treino), len(teste))\nprint(teste)\n`,
                  checagem: `
tem('treino')
tem('teste')
if len(treino) != 40 or len(teste) != 10:
    falha('treino devia ter 40 palavras e teste, 10.')
if set(treino) & set(teste):
    falha('Uma palavra não pode estar no treino e no teste ao mesmo tempo.')
if teste != ['cama', 'melao', 'caneta', 'livro', 'escola', 'rato', 'mar', 'pato', 'batata', 'vaca']:
    falha('Use a semente 1 e corte depois de embaralhar.')
`,
                },
                {
                  texto: `<p>O código já traz duas funções. <code>contar(palavras, k)</code> monta a tabela de probabilidades dos pares, somando <code>k</code> a todas as contagens. <code>perda(P, palavras)</code> é a média de −log das probabilidades dos pares dessas palavras.</p>
<p>Execute com <code>k = 0</code>, sem suavizar: no treino a perda é um número comum, mas no teste dá <code>inf</code>, infinito. Alguma palavra do teste tem um par que nunca apareceu no treino.</p>`,
                  tarefa: 'Mude <code>k</code> para 1 e compare a perda no treino com a perda no teste.',
                  inicio: `import random\nimport numpy as np\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nk = 0\nP = contar(treino, k)\nperda_treino = perda(P, treino)\nperda_teste = perda(P, teste)\nprint("treino:", perda_treino)\nprint("teste:", perda_teste)\n`,
                  dica: 'Só uma linha muda: <code>k = 1</code>.',
                  solucao: `import random\nimport numpy as np\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nk = 1\nP = contar(treino, k)\nperda_treino = perda(P, treino)\nperda_teste = perda(P, teste)\nprint("treino:", perda_treino)\nprint("teste:", perda_teste)\n`,
                  checagem: `
import math
tem('perda_teste')
if not math.isfinite(perda_teste):
    falha('A perda no teste ainda é infinita. Suavize com k = 1.')
if k != 1:
    falha('Use k = 1 nesta etapa.')
if not perto(perda_teste, perda(contar(treino, 1), teste)):
    falha('Calcule perda_teste com as palavras do teste.')
`,
                  certo: 'Com k = 1, a perda no teste fica finita: perto de 2,49, contra 2,43 no treino. Agora, a perda no teste é a nota honesta do modelo.',
                },
              ],
            },
            {
              id: 'suavizacao',
              titulo: 'Escolher a suavização',
              porque: 'A aula soma 1 a todas as contagens, mas por que 1? Karpathy propõe medir qual suavização funciona melhor. Escolher um número assim, medindo, é o que se chama ajustar um hiperparâmetro.',
              passos: [
                {
                  texto: `<p>Vamos tentar vários valores de <code>k</code>, de 0,001 até 100, e medir a perda em palavras que ficaram de fora. O gráfico usa escala logarítmica no eixo de <code>k</code>.</p>
<p>Com <code>k</code> muito pequeno, pares nunca vistos ficam quase impossíveis. Com <code>k</code> muito grande, todas as letras ficam quase igualmente prováveis, e o modelo esquece o que contou.</p>`,
                  tarefa: 'Execute e olhe o gráfico. Depois, faça <code>melhor_k</code> ser o <code>k</code> com a menor perda.',
                  inicio: `import random\nimport numpy as np\nimport matplotlib.pyplot as plt\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nks = [0.001, 0.01, 0.1, 1, 10, 100]\nperdas = []\nfor k in ks:\n    perdas.append(perda(contar(treino, k), teste))\n\nplt.semilogx(ks, perdas, 'o-')\nplt.xlabel('k')\nplt.ylabel('perda nas palavras de fora')\n\nmelhor_k = None\nprint(melhor_k)\n`,
                  dica: 'Como no exercício do tamanho do passo: <code>ks[perdas.index(min(perdas))]</code>.',
                  solucao: `import random\nimport numpy as np\nimport matplotlib.pyplot as plt\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nks = [0.001, 0.01, 0.1, 1, 10, 100]\nperdas = []\nfor k in ks:\n    perdas.append(perda(contar(treino, k), teste))\n\nplt.semilogx(ks, perdas, 'o-')\nplt.xlabel('k')\nplt.ylabel('perda nas palavras de fora')\n\nmelhor_k = ks[perdas.index(min(perdas))]\nprint(melhor_k)\n`,
                  checagem: `
tem('melhor_k')
if melhor_k is None:
    falha('melhor_k ainda vale None. Escolha o k com a menor perda.')
if melhor_k != 0.1:
    falha('Esse não é o k com a menor perda. Olhe o ponto mais baixo do gráfico.')
`,
                  certo: 'O melhor k aqui é 0,1, menor que o 1 da aula. Com outra lista de palavras, o melhor k seria outro: por isso se mede em vez de chutar.',
                },
                {
                  texto: `<p>Um detalhe importante: o <code>k</code> foi escolhido olhando a perda nas palavras de fora. Então essas palavras ajudaram a construir o modelo, e a perda nelas deixou de ser uma nota honesta.</p>`,
                  tarefa: 'Como Karpathy sugere resolver isso?',
                  opcoes: [
                    { t: 'Não tem problema: é só usar a perda do teste mesmo.', por: 'Se o teste ajudou a escolher k, ele virou parte do treino.' },
                    { t: 'Separar três grupos: treino para contar, validação para escolher k, e teste só no fim, uma vez.', certa: true },
                    { t: 'Usar todas as palavras no treino e não testar.', por: 'Sem palavras de fora, não dá para saber se o modelo generaliza.' },
                  ],
                  erro: 'Pense em quantos grupos de palavras são necessários.',
                  dica: 'Um grupo para contar, um para escolher, um para a nota final.',
                  solucao: 'Treino, validação e teste. A validação escolhe k; o teste dá a nota final, sem ter participado de nenhuma escolha.',
                  certo: 'Na aula seguinte, Karpathy usa exatamente essa divisão em três, com 80%, 10% e 10% dos nomes.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
