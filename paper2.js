// Paper 2 da trilha de pesquisa: Language-Forcing (Li et al., 2026), arXiv:2610.23894. É o paper a
// superar, transplantado para dentro da LeWorldModel do Paper 1: a condição 3 do plano do paper do ICWM.
//
// O paper original roda num world-action model de humanoide (GigaWorld-Policy), não num JEPA. O
// transplante é nosso, e o capítulo diz isso. O método: achar o núcleo (descrições do que muda, alinhadas
// por cosseno às features futuras de uma camada do meio, e descartadas no teste), ler as ablações que dizem
// onde ele é forte (Tabelas 2 e 3, Figura 4), implementar o núcleo em NumPy e terminar na pergunta do
// paper do ICWM: e se o modelo usar a própria fala em vez de descartá-la?
//
// Números do paper usados aqui: equações (3) e (4); Tabela 2 (bloco 22 e λ = 1,0 com 79,17%; sem
// alinhamento, 68,39%); Tabela 3 (10%: 33,57 → 36,90; 40%: 45,65 → 56,79; 70%: 59,76 → 69,64; 100%:
// 68,39 → 79,17); Figura 4 (descrições pareadas valem 15,95 pontos a mais que as embaralhadas).

const URL = 'https://arxiv.org/abs/2610.23894'
const trecho = (onde, texto) => `<p><a href="${URL}" target="_blank" rel="noopener">${onde}</a>: “${texto}”</p>`

const PERDA = `import numpy as np

def perda_lf(e_chapeu, e):
    # e_chapeu, e: (B, d). Um vetor previsto e um vetor da descrição por amostra.
    cos = np.sum(e_chapeu * e, axis=1) / (np.linalg.norm(e_chapeu, axis=1) * np.linalg.norm(e, axis=1))
    return 1 - cos.mean()
`

const TABELA3 = `import numpy as np

dados = np.array([10, 40, 70, 100])           # % das demonstrações
sem_lf = np.array([33.57, 45.65, 59.76, 68.39])
com_lf = np.array([36.90, 56.79, 69.64, 79.17])
`

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

export const PAPER_2 = {
  n: 11,
  titulo: 'Paper 2',
  paper: {
    titulo: 'Language-Forcing: Advancing Humanoid Loco-Manipulation via Semantic Alignment of Whole-Body World Action Models',
    autores: 'Li et al.',
    ano: 2026,
    url: URL,
  },
  aula: URL,
  depois: {
    nota: 'O Language-Forcing está lido, implementado e transplantado no papel. Agora vem o plano do transplante: o que entra na LeWM, com que controles, e como ler as comparações.',
    botao: 'Ir para o plano do transplante',
    fim: 'O plano do transplante está escrito. Com o número da célula 1, ele roda na mesma LeWM, nos mesmos dados.',
  },
  partes: [
    {
      id: 'matematica',
      titulo: 'Ler o paper',
      modulos: [
        {
          titulo: 'O que é novo',
          licoes: [
            {
              id: 'lf-nucleo',
              titulo: 'Achar o núcleo',
              porque: 'O Language-Forcing é o paper que o do ICWM precisa superar. Para superá-lo, primeiro é preciso saber exatamente o que ele faz, e o que ele não faz.',
              passos: [
                {
                  texto: `<p>Um <strong>world-action model</strong> prevê, ao mesmo tempo, as ações do robô e as imagens futuras. O problema que o paper aponta: prever imagens dá o mesmo peso a tudo o que muda na cena, inclusive ao que não importa para a tarefa.</p>
<p>No treino, um modelo de visão e linguagem (VLM) congelado olha a imagem atual e uma imagem futura e escreve o que avançou na tarefa e o que deve vir a seguir. Um codificador de texto congelado (UMT5) transforma essa descrição num vetor <code>e</code>.</p>`,
                  tarefa: 'Qual é o núcleo do Language-Forcing?',
                  opcoes: [
                    { t: 'Um world-action model novo para humanoides.', por: 'O modelo é o GigaWorld-Policy, que já existia. O paper muda o treino dele.' },
                    { t: 'Uma perda que alinha, por cosseno, as features futuras de uma camada do meio ao vetor da descrição. Tudo isso fica de fora no teste.', certa: true },
                    { t: 'Um VLM que escreve o plano do robô durante a execução.', por: 'O VLM só roda no treino. No teste, nada de linguagem é gerado.' },
                    { t: 'Condicionar o modelo na instrução da tarefa.', por: 'A instrução já condicionava o modelo antes. E, como alvo, ela é a pior das três opções testadas.' },
                  ],
                  erro: 'Procure o que foi acrescentado ao treino, e o que acontece com isso no teste.',
                  dica: 'O resumo diz: "All auxiliary components are used only during training".',
                  solucao: 'O núcleo é a perda de alinhamento L_LF = 1 − média dos cossenos entre P(features futuras do bloco ℓ) e o vetor da descrição, somada à perda do modelo com peso λ. No teste, o projetor, o VLM e o UMT5 saem.',
                  certo: 'O núcleo é uma perda auxiliar. A linguagem molda as features no treino e depois é descartada.',
                  confira: trecho('Resumo', 'We encode these descriptions with a frozen text encoder and align their embeddings with intermediate, action-conditioned future-visual features, complementing the original visual and action prediction objectives. All auxiliary components are used only during training, introducing no additional inference overhead.'),
                },
                {
                  texto: `<p>Para o paper do ICWM, o Language-Forcing precisa rodar dentro da LeWM do Paper 1: mesmo PushT, mesmos dados, mesma avaliação. O código original não serve, porque roda num humanoide, com 8 GPUs, em outro benchmark.</p>`,
                  tarefa: 'No transplante, qual é a linha de base e qual é a diferença?',
                  opcoes: [
                    { t: 'Linha de base: o GigaWorld-Policy. Diferença: trocar o humanoide pelo PushT.', por: 'Aí a comparação deixaria de ser com a LeWM, e as outras condições do plano rodam na LeWM.' },
                    { t: 'Linha de base: a LeWM da célula 1. Diferença: um projetor e a perda de cosseno numa camada do meio do preditor, com a descrição do que mudou entre o_t e o_t+1 como alvo.', certa: true },
                    { t: 'Linha de base: a LeWM. Diferença: dar a descrição como entrada do preditor no teste.', por: 'Isso já não é o Language-Forcing: nele a linguagem só é alvo, e sai no teste. Usar a fala como entrada é a pergunta do paper do ICWM.' },
                  ],
                  erro: 'O transplante mantém tudo da LeWM e acrescenta só o que é do Language-Forcing.',
                  dica: 'O alvo de linguagem sai no teste.',
                  solucao: 'Linha de base: a LeWM. Diferença: projetor + perda de cosseno numa camada do meio do preditor; a descrição é só alvo e sai no teste.',
                  certo: 'O transplante é uma escolha nossa, e o paper do ICWM precisa dizer isso: a condição 3 é o Language-Forcing adaptado a um JEPA, não o original.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'A equação',
          licoes: [
            {
              id: 'lf-cos',
              titulo: 'A perda de cosseno',
              porque: 'A equação (3) é o núcleo inteiro. Com números pequenos, ela fica concreta.',
              passos: [
                {
                  texto: `<p>O cosseno entre dois vetores é o produto escalar dividido pelo produto dos comprimentos. Ele vale 1 quando os vetores apontam para o mesmo lado, seja qual for o tamanho deles.</p>
<p>A equação (3) é <code>L<sub>LF</sub> = 1 − (1/B) Σ<sub>b</sub> cos(ê<sub>b</sub>, e<sub>b</sub>)</code>.</p>`,
                  tarefa: 'Num lote de duas amostras, ê₁ = (1, 0) e e₁ = (0,6; 0,8); ê₂ = (3, 4) e e₂ = (6, 8). Quanto vale L<sub>LF</sub>?',
                  campos: [{ rotulo: 'L_LF =', resposta: 0.2, tol: 0.002 }],
                  erro: 'cos₁ = 0,6 (os dois têm comprimento 1). cos₂ = 1 (mesma direção). Tire a média e subtraia de 1.',
                  dica: 'A média dos cossenos é (0,6 + 1) / 2 = 0,8.',
                  solucao: 'cos₁ = 1 × 0,6 + 0 × 0,8 = 0,6\ncos₂ = 1 (mesma direção)\nL_LF = 1 − 0,8 = 0,2',
                  certo: 'O cosseno ignora o comprimento: só a direção do vetor previsto importa. A descrição puxa as features para uma direção, não para um tamanho.',
                },
                {
                  texto: `<p>A perda total do paper é <code>L = L<sub>WAM</sub> + λ<sub>LF</sub> · L<sub>LF</sub></code>, com <code>λ<sub>LF</sub> = 1</code>.</p>
<p>No transplante, ela vira <code>L = L<sub>pred</sub> + 0,1 · SIGReg + λ<sub>LF</sub> · L<sub>LF</sub></code>. Suponha, num passo do treino, <code>L<sub>pred</sub> = 0,05</code>, <code>SIGReg = 0,2</code> e <code>L<sub>LF</sub> = 0,3</code>.</p>`,
                  tarefa: 'Com λ<sub>LF</sub> = 1, quanto vale a perda total?',
                  campos: [{ rotulo: 'L =', resposta: 0.37, tol: 0.002 }],
                  erro: 'Some 0,05 + 0,1 × 0,2 + 1 × 0,3.',
                  dica: '0,1 × 0,2 = 0,02.',
                  solucao: '0,05 + 0,02 + 0,3 = 0,37',
                  certo: 'Nesse exemplo, a linguagem pesa mais que a previsão e o SIGReg juntos. O λ = 1 do paper foi escolhido para outra perda, de outro tamanho; no transplante, λ precisa ser varrido de novo.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'As ablações',
          licoes: [
            {
              id: 'lf-camada',
              titulo: 'A camada do meio',
              porque: 'As ablações dizem onde o método é forte. A primeira escolhe onde aplicar o alinhamento.',
              passos: [
                {
                  texto: `<p>A Tabela 2 (esquerda) aplica o alinhamento em cinco blocos diferentes, com <code>λ = 1</code>. Sem alinhamento, o modelo faz 68,39%.</p>
<p><code>bloco 1 → 73,99</code> · <code>8 → 74,23</code> · <code>15 → 75,48</code> · <code>22 → 79,17</code> · <code>29 → 74,46</code></p>`,
                  tarefa: 'Quantos pontos o bloco 22 ganha sobre o modelo sem alinhamento? E o bloco 29, o mais perto da saída?',
                  campos: [
                    { rotulo: 'bloco 22:', resposta: 10.78, tol: 0.02 },
                    { rotulo: 'bloco 29:', resposta: 6.07, tol: 0.02 },
                  ],
                  erro: 'Subtraia 68,39 de cada taxa.',
                  dica: '79,17 − 68,39 e 74,46 − 68,39.',
                  solucao: '79,17 − 68,39 = 10,78\n74,46 − 68,39 = 6,07',
                  certo: 'Todos os blocos ajudam, mas o melhor não é o último. O preditor da LeWM tem 6 camadas; no transplante, a varredura começa pelas do meio para o fim, não pela saída.',
                  confira: trecho('Seção 4.3', 'Moving alignment from block 22 to block 29 reduces performance, so a layer closer to the visual output is not necessarily a better choice for language supervision.'),
                },
              ],
            },
            {
              id: 'lf-peso',
              titulo: 'O peso tem um pico',
              porque: 'Mais linguagem não é sempre melhor. A segunda ablação mostra quanto peso dar a ela.',
              passos: [
                {
                  texto: `<p>A Tabela 2 (direita) varia o peso, com o alinhamento no bloco 22:</p>
<p><code>λ = 0 → 68,39</code> · <code>0,5 → 74,40</code> · <code>1,0 → 79,17</code> · <code>1,5 → 73,39</code> · <code>2,0 → 68,75</code></p>`,
                  tarefa: 'Com λ = 2, a quantos pontos o modelo fica do modelo sem alinhamento?',
                  campos: [{ rotulo: 'pontos =', resposta: 0.36, tol: 0.01 }],
                  erro: 'Subtraia 68,39 de 68,75.',
                  dica: '68,75 − 68,39.',
                  solucao: '68,75 − 68,39 = 0,36 ponto',
                  certo: 'Com peso demais, o ganho some: a linguagem passa a competir com a previsão em vez de ajudá-la. É um U invertido no peso, e um motivo a mais para varrer λ no transplante.',
                },
              ],
            },
            {
              id: 'lf-embaralhar',
              titulo: 'O controle embaralhado',
              porque: 'Um ganho com linguagem pode vir de qualquer coisa: mais parâmetros, mais gradiente, um texto sobre a tarefa em geral. O controle embaralhado separa o conteúdo do resto.',
              passos: [
                {
                  texto: `<p>Na Figura 4 (direita), as descrições são trocadas entre trajetórias <strong>da mesma tarefa</strong>. Cada amostra continua recebendo um texto sobre a tarefa certa, mas que descreve outro momento, de outra trajetória. O projetor, o peso e o treino ficam iguais.</p>
<p>As descrições pareadas fazem 15,95 pontos a mais que as embaralhadas.</p>`,
                  tarefa: 'O que esse controle mostra?',
                  opcoes: [
                    { t: 'Que o modelo é sensível à ordem das amostras no lote.', por: 'A troca é fixa, feita uma vez antes do treino. O que muda é qual texto vai com qual transição.' },
                    { t: 'Que descrições de outras tarefas ajudariam mais.', por: 'O controle troca só dentro da mesma tarefa. Outras tarefas nem entram.' },
                    { t: 'Que o ganho vem de a descrição corresponder à transição daquela amostra, e não de ter texto sobre a tarefa, nem do projetor a mais.', certa: true },
                  ],
                  erro: 'Compare o que é igual e o que é diferente entre as duas condições.',
                  dica: 'Igual: a tarefa do texto, o projetor, o peso. Diferente: o momento descrito.',
                  solucao: 'Tudo fica igual, menos a correspondência entre o texto e a transição. Os 15,95 pontos são o valor do conteúdo certo.',
                  certo: 'É o controle mais forte do paper, e o plano do ICWM o adota: um canal mudo controla os parâmetros; o embaralhado controla o conteúdo.',
                  confira: trecho('Seção 4.3', 'Matching each description to its original observations improves SR by 15.95 percentage points over shuffling.'),
                },
              ],
            },
            {
              id: 'lf-dados',
              titulo: 'Pouco dado, pouco ganho',
              porque: 'A Tabela 3 é a que mais pesa no desenho do paper do ICWM: ela diz em que quantidade de dados o efeito existe.',
              passos: [
                {
                  texto: `<p>A Tabela 3 treina com frações das demonstrações, sempre com 50 mil atualizações:</p>
<p><code>10%: 33,57 → 36,90</code> · <code>40%: 45,65 → 56,79</code> · <code>70%: 59,76 → 69,64</code> · <code>100%: 68,39 → 79,17</code></p>`,
                  tarefa: 'Qual é o ganho da linguagem com 10% dos dados? E com 40%?',
                  campos: [
                    { rotulo: '10%:', resposta: 3.33, tol: 0.02 },
                    { rotulo: '40%:', resposta: 11.14, tol: 0.02 },
                  ],
                  erro: 'Subtraia a coluna sem linguagem da coluna com linguagem.',
                  dica: '36,90 − 33,57 e 56,79 − 45,65.',
                  solucao: '36,90 − 33,57 = 3,33\n56,79 − 45,65 = 11,14',
                  certo: 'Com quase nenhum dado, a linguagem quase não ajuda; a partir de 40%, ajuda uns 10 pontos. É por isso que a célula 1 põe a LeWM entre 35% e 55%: é a faixa da base sem linguagem com 40% dos dados (45,65%), onde o ganho já é de 11 pontos.',
                },
                {
                  texto: `<p>O paper também diz que, com 70% dos dados e linguagem (69,64%), o modelo já passa o modelo com 100% dos dados e sem linguagem (68,39%).</p>`,
                  tarefa: 'Em termos de dados, quanto a linguagem economizou nessa comparação?',
                  opcoes: [
                    { t: '70% das demonstrações.', por: '70% é o que foi usado. A economia é o que deixou de ser preciso.' },
                    { t: '30% das demonstrações.', certa: true },
                    { t: '1,25 ponto de taxa de sucesso.', por: '1,25 ponto é a diferença de desempenho, não de dados.' },
                  ],
                  erro: 'Compare 70% com 100%.',
                  dica: '100% − 70%.',
                  solucao: 'O mesmo desempenho com 70% dos dados: 30% de economia.',
                  certo: 'Eficiência de amostra é o eixo principal do paper do ICWM. Rodar as condições nos três tamanhos da célula 1 dá a mesma curva para o transplante.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'A pergunta que ele não fez',
          licoes: [
            {
              id: 'lf-vazamento',
              titulo: 'O que a descrição não pode dizer',
              porque: 'Antes de perguntar se o modelo pode usar a própria fala, é preciso garantir que a fala não entrega a resposta.',
              passos: [
                {
                  texto: `<p>No Language-Forcing, o VLM vê a imagem futura e pode descrever o que quiser, porque a descrição só é alvo e sai no teste.</p>
<p>No paper do ICWM, a fala do próprio modelo fica no teste e é gerada a partir de <code>(z<sub>t</sub>, a<sub>t</sub>)</code>, sem a meta. Wang, Wei &amp; Ling (2026) mostram que, quando o texto que nomeia a resposta entra no preditor, ele copia a resposta em vez de aprender a dinâmica.</p>`,
                  tarefa: 'Qual destas frases pode entrar no banco de frases que ensina o modelo a falar?',
                  opcoes: [
                    { t: '"O bloco ficou mais perto do objetivo."', por: 'Essa frase depende da meta, que a fala não vê. Ou vira ruído no alvo, ou abre caminho para o vazamento.' },
                    { t: '"Faltam três empurrões para encaixar o T."', por: 'Também depende da meta, e ainda adianta o plano, que é trabalho do planejador.' },
                    { t: '"O bloco girou para a esquerda e deslizou um pouco para cima."', certa: true },
                  ],
                  erro: 'A fala vem de (z_t, a_t). Ela pode descrever o que mudou, não o quanto falta.',
                  dica: 'Procure a frase que se escreve sem saber onde fica a meta.',
                  solucao: 'Só a primeira descreve a transição sem a meta. As outras precisam saber onde o objetivo está.',
                  certo: 'A fala descreve a dinâmica; a meta fica no custo do planejador, como na LeWM. É a mesma separação do Grounding Spatial Relations.',
                },
              ],
            },
            {
              id: 'lf-condicoes',
              titulo: 'Descartar ou usar',
              porque: 'A pergunta própria do capítulo é a do paper do ICWM. Ela só vira experimento quando cada alternativa tem uma condição e uma comparação.',
              passos: [
                {
                  texto: `<p>As condições do plano que tocam a linguagem:</p>
<ul>
<li><strong>3</strong>: o Language-Forcing transplantado. A fala é do professor (o VLM), só alvo, e sai no teste.</li>
<li><strong>4</strong>: o modelo aprende a gerar a própria fala, mas não a consome (como no TacitVLA).</li>
<li><strong>5</strong>: o modelo consome a própria fala, que cai ao acaso no treino (como no ECoT-Lite).</li>
<li><strong>7</strong>: canal mudo. Os mesmos tokens a mais no preditor, sem conteúdo de linguagem.</li>
<li><strong>8</strong>: a nossa. O preditor consome a própria fala, que continua no teste (como no Coconut).</li>
</ul>`,
                  tarefa: 'Qual comparação separa "usar o conteúdo da fala" de "ter mais parâmetros e mais computação"?',
                  opcoes: [
                    { t: '8 contra 3.', por: 'Essa compara a nossa com o paper a superar. Ela diz se ganhamos, mas não por quê: a 8 também tem tokens a mais.' },
                    { t: '8 contra 7.', certa: true },
                    { t: '4 contra 3.', por: 'Nenhuma das duas consome a fala no teste.' },
                  ],
                  erro: 'Procure a condição que tem tudo da 8, menos o conteúdo.',
                  dica: 'O canal mudo tem os mesmos tokens, sem fala.',
                  solucao: '8 contra 7: os mesmos tokens no preditor, com e sem o conteúdo da fala.',
                  certo: 'Cada comparação responde uma pergunta só. A 8 contra 3 diz se superamos o paper; a 8 contra 7, se foi o conteúdo; a 8 contra 4 e 5, se foi consumir a fala no teste.',
                },
                {
                  texto: `<p>Para mostrar que o modelo da condição 8 <strong>usa</strong> a fala no teste, o plano faz uma supressão: troca os tokens de fala e mede a queda.</p>
<p>Zerar uma entrada que o modelo sempre viu derruba qualquer modelo, só porque a entrada nunca foi zero no treino.</p>`,
                  tarefa: 'Qual é o teste certo?',
                  opcoes: [
                    { t: 'Zerar os tokens na condição 8 e verificar que a taxa cai.', por: 'A queda pode vir só da mudança de distribuição. Sem comparar com o canal mudo, não prova nada.' },
                    { t: 'Retirar a condição 8 e comparar com a LeWM pura.', por: 'Isso mede o ganho da condição, não se ela usa a fala no teste.' },
                    { t: 'Trocar os tokens pelos de outra amostra, nas condições 8 e 7, e verificar que a queda na 8 é maior que na 7.', certa: true },
                  ],
                  erro: 'A prova é uma diferença entre duas quedas.',
                  dica: 'Tokens de outra amostra continuam parecidos com os do treino, mas não combinam com a cena.',
                  solucao: 'Trocar pelos tokens de outra amostra e comparar a queda da 8 com a queda da 7.',
                  certo: 'É o mesmo raciocínio do controle embaralhado do Language-Forcing, agora no teste: o que importa é o conteúdo que combina com a cena.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'programacao',
      titulo: 'Implementar',
      modulos: [
        {
          titulo: 'O núcleo em código',
          licoes: [
            {
              id: 'lf-perda-cod',
              titulo: 'A equação (3)',
              porque: 'O núcleo do Language-Forcing é uma função de duas linhas. Ela é a mesma no humanoide e na LeWM.',
              passos: [
                {
                  texto: `<p><code>e_chapeu</code> e <code>e</code> têm uma linha por amostra. O produto escalar de cada linha é <code>np.sum(e_chapeu * e, axis=1)</code>, e o comprimento de cada linha é <code>np.linalg.norm(x, axis=1)</code>.</p>`,
                  tarefa: 'Complete <code>cos</code>, o cosseno de cada amostra.',
                  inicio: `import numpy as np

def perda_lf(e_chapeu, e):
    # e_chapeu, e: (B, d). Um vetor previsto e um vetor da descrição por amostra.
    cos = 0
    return 1 - np.mean(cos)

e_chapeu = np.array([[1.0, 0.0], [3.0, 4.0]])
e = np.array([[0.6, 0.8], [6.0, 8.0]])
print("L_LF =", perda_lf(e_chapeu, e))   # devia dar 0,2, como na conta à mão
`,
                  dica: '<code>cos = np.sum(e_chapeu * e, axis=1) / (np.linalg.norm(e_chapeu, axis=1) * np.linalg.norm(e, axis=1))</code>',
                  solucao: PERDA + `
e_chapeu = np.array([[1.0, 0.0], [3.0, 4.0]])
e = np.array([[0.6, 0.8], [6.0, 8.0]])
print("L_LF =", perda_lf(e_chapeu, e))   # devia dar 0,2, como na conta à mão
`,
                  checagem: `
tem('perda_lf')
if not perto(float(perda_lf(np.array([[1.0, 0.0], [3.0, 4.0]]), np.array([[0.6, 0.8], [6.0, 8.0]]))), 0.2, 1e-6):
    falha('Para o exemplo da conta à mão, devia dar 0,2.')
r = np.random.default_rng(0)
x = r.normal(0, 1, (5, 7))
if not perto(float(perda_lf(x, 3 * x)), 0.0, 1e-9):
    falha('Vetores na mesma direção, de tamanhos diferentes, deviam dar perda 0. Divida pelos comprimentos.')
if not perto(float(perda_lf(x, -x)), 2.0, 1e-9):
    falha('Vetores opostos deviam dar perda 2.')
`,
                  certo: 'De 0 (mesma direção) a 2 (direções opostas). É a perda que o transplante soma à da LeWM.',
                },
              ],
            },
            {
              id: 'lf-projetor-cod',
              titulo: 'O projetor',
              porque: 'As features do preditor e o vetor do texto têm tamanhos diferentes. O projetor leva um ao espaço do outro, e só existe no treino.',
              passos: [
                {
                  texto: `<p>No paper, o projetor é <code>LayerNorm → Linear → GELU → Linear</code>, de 3 072 para 8 192 e depois para 4 096 números. No transplante, as features da LeWM têm 192 números; aqui o alvo tem 64, no lugar dos 4 096 do UMT5.</p>
<p>As funções <code>layernorm</code> e <code>gelu</code> já estão prontas.</p>`,
                  tarefa: 'Complete <code>projetor(F)</code> na ordem do paper: <code>layernorm</code>, <code>@ W1 + b1</code>, <code>gelu</code>, <code>@ W2 + b2</code>.',
                  inicio: `import numpy as np

def layernorm(x):
    return (x - x.mean(-1, keepdims=True)) / np.sqrt(x.var(-1, keepdims=True) + 1e-5)

def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))

r = np.random.default_rng(0)
W1, b1 = r.normal(0, 1 / np.sqrt(192), (192, 256)), np.zeros(256)
W2, b2 = r.normal(0, 1 / 16, (256, 64)), np.zeros(64)

def projetor(F):
    return F

F = r.normal(0, 1, (8, 192))     # 8 amostras, as features médias de uma camada do preditor
print("entrada:", F.shape, " saída:", projetor(F).shape)
`,
                  dica: '<code>return gelu(layernorm(F) @ W1 + b1) @ W2 + b2</code>',
                  solucao: `import numpy as np

def layernorm(x):
    return (x - x.mean(-1, keepdims=True)) / np.sqrt(x.var(-1, keepdims=True) + 1e-5)

def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))

r = np.random.default_rng(0)
W1, b1 = r.normal(0, 1 / np.sqrt(192), (192, 256)), np.zeros(256)
W2, b2 = r.normal(0, 1 / 16, (256, 64)), np.zeros(64)

def projetor(F):
    return gelu(layernorm(F) @ W1 + b1) @ W2 + b2

F = r.normal(0, 1, (8, 192))     # 8 amostras, as features médias de uma camada do preditor
print("entrada:", F.shape, " saída:", projetor(F).shape)
`,
                  checagem: `
tem('projetor')
x = np.random.default_rng(3).normal(2, 5, (4, 192))
y = projetor(x)
if y.shape != (4, 64):
    falha('A saída devia ter formato (4, 64): uma linha por amostra, 64 números.')
esperado = gelu(layernorm(x) @ W1 + b1) @ W2 + b2
if not np.allclose(y, esperado):
    falha('A ordem é layernorm, W1 + b1, gelu, W2 + b2.')
`,
                  certo: 'Do formato (B, 192) para (B, 64). No teste, o projetor sai junto com a perda: a LeWM do transplante planeja igual à da célula 1.',
                },
              ],
            },
            {
              id: 'lf-embaralhar-cod',
              titulo: 'O controle em código',
              porque: 'O controle embaralhado é o que separa o conteúdo do resto. Ele precisa trocar os textos sem nunca sair da tarefa, e sem deixar nenhuma amostra com o próprio texto.',
              passos: [
                {
                  texto: `<p><code>tarefa[i]</code> diz de que tarefa é a amostra <code>i</code>. A função devolve <code>perm</code>: a amostra <code>i</code> passa a usar a descrição da amostra <code>perm[i]</code>.</p>
<p>Um jeito simples: para cada tarefa, pegar os índices dela e girá-los uma posição com <code>np.roll</code>. Cada amostra recebe o texto da vizinha, da mesma tarefa.</p>`,
                  tarefa: 'Complete a linha dentro do <code>for</code>: <code>perm[idx] = np.roll(idx, 1)</code>.',
                  inicio: `import numpy as np

def embaralhar(tarefa):
    perm = np.arange(len(tarefa))
    for k in np.unique(tarefa):
        idx = np.where(tarefa == k)[0]
        pass
    return perm

tarefa = np.array([0, 0, 1, 1, 1, 2, 2, 0])
perm = embaralhar(tarefa)
print("perm:", perm)
print("mesma tarefa:", bool((tarefa[perm] == tarefa).all()))
print("nenhuma com o próprio texto:", bool((perm != np.arange(len(tarefa))).all()))
`,
                  dica: 'Troque o <code>pass</code> por <code>perm[idx] = np.roll(idx, 1)</code>.',
                  solucao: `import numpy as np

def embaralhar(tarefa):
    perm = np.arange(len(tarefa))
    for k in np.unique(tarefa):
        idx = np.where(tarefa == k)[0]
        perm[idx] = np.roll(idx, 1)
    return perm

tarefa = np.array([0, 0, 1, 1, 1, 2, 2, 0])
perm = embaralhar(tarefa)
print("perm:", perm)
print("mesma tarefa:", bool((tarefa[perm] == tarefa).all()))
print("nenhuma com o próprio texto:", bool((perm != np.arange(len(tarefa))).all()))
`,
                  checagem: `
tem('embaralhar')
t = np.random.default_rng(1).integers(0, 5, 60)
t = np.concatenate([t, np.arange(5), np.arange(5)])
p = np.asarray(embaralhar(t))
if sorted(p.tolist()) != list(range(len(t))):
    falha('perm devia usar cada descrição exatamente uma vez.')
if not (t[p] == t).all():
    falha('Toda amostra devia receber uma descrição da mesma tarefa.')
if not (p != np.arange(len(t))).all():
    falha('Nenhuma amostra devia ficar com a própria descrição.')
`,
                  certo: 'O paper sorteia a troca uma vez, com semente fixa, e a usa no treino inteiro. O mesmo vale para o transplante.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Reproduzir e perguntar',
          licoes: [
            {
              id: 'lf-tabela3-cod',
              titulo: 'A Tabela 3 em gráfico',
              porque: 'Refazer a tabela que sustenta o desenho do experimento, em gráfico, deixa a forma do efeito à vista.',
              passos: [
                {
                  texto: `<p>Os números da Tabela 3 já estão no código. O gráfico mostra as duas curvas e a faixa de 35% a 55% da célula 1.</p>`,
                  tarefa: 'Guarde em <code>ganhos</code> o ganho da linguagem em cada fração dos dados.',
                  inicio: TABELA3 + `ganhos = np.zeros(4)

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.axhspan(35, 55, color="#f5d78e", alpha=0.4, label="faixa da célula 1")
plt.plot(dados, sem_lf, "o-", label="sem linguagem")
plt.plot(dados, com_lf, "o-", label="com Language-Forcing")
plt.xlabel("% das demonstrações")
plt.ylabel("taxa de sucesso (%)")
plt.legend(loc="lower right")
for d, g in zip(dados, ganhos):
    print(f"{d:3d}%   ganho = {g:5.2f} pontos")
`,
                  dica: '<code>ganhos = com_lf - sem_lf</code>',
                  solucao: TABELA3 + `ganhos = com_lf - sem_lf

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.axhspan(35, 55, color="#f5d78e", alpha=0.4, label="faixa da célula 1")
plt.plot(dados, sem_lf, "o-", label="sem linguagem")
plt.plot(dados, com_lf, "o-", label="com Language-Forcing")
plt.xlabel("% das demonstrações")
plt.ylabel("taxa de sucesso (%)")
plt.legend(loc="lower right")
for d, g in zip(dados, ganhos):
    print(f"{d:3d}%   ganho = {g:5.2f} pontos")
`,
                  checagem: `
tem('ganhos')
if not np.allclose(ganhos, [3.33, 11.14, 9.88, 10.78], atol=0.01):
    falha('Os ganhos deviam ser com_lf - sem_lf: 3,33, 11,14, 9,88 e 10,78.')
`,
                  certo: 'O ganho salta entre 10% e 40% e depois fica perto de 10 pontos. A faixa da célula 1 corta as curvas justamente depois do salto.',
                },
              ],
            },
            {
              id: 'lf-holm-cod',
              titulo: 'Quatro comparações, uma correção',
              porque: 'A condição 8 é comparada com quatro outras. Com quatro testes, a chance de um acerto por acaso cresce; a correção de Holm a segura em 5%.',
              passos: [
                {
                  texto: `<p>O método de <strong>Holm</strong>: ordene os <code>m</code> valores-p do menor para o maior. O de posição <code>i</code> (começando em 0) precisa ser no máximo <code>α / (m − i)</code>. No primeiro que falha, pare: ele e todos os seguintes não são significativos.</p>
<p>Os valores-p do código são inventados, só para testar a função. Os de verdade saem dos testes pareados da 8 contra a 3, a 4, a 5 e a 7.</p>`,
                  tarefa: 'Complete o <code>if</code>: rejeite (marque <code>True</code>) enquanto <code>pvals[j] &lt;= alfa / (m - i)</code>; senão, pare com <code>break</code>.',
                  inicio: `import numpy as np

def holm(pvals, alfa=0.05):
    ordem = np.argsort(pvals)
    m = len(pvals)
    rejeita = [False] * m
    for i, j in enumerate(ordem):
        pass
    return rejeita

# Valores-p inventados, na ordem: 8 contra 3, 4, 5 e 7.
p = [0.02, 0.003, 0.04, 0.30]
print("sem correção:", [x <= 0.05 for x in p])
print("com Holm:    ", holm(p))
`,
                  dica: `Dentro do <code>for</code>:<br><code>if pvals[j] &lt;= alfa / (m - i): rejeita[j] = True</code><br><code>else: break</code>`,
                  solucao: `import numpy as np

def holm(pvals, alfa=0.05):
    ordem = np.argsort(pvals)
    m = len(pvals)
    rejeita = [False] * m
    for i, j in enumerate(ordem):
        if pvals[j] <= alfa / (m - i):
            rejeita[j] = True
        else:
            break
    return rejeita

# Valores-p inventados, na ordem: 8 contra 3, 4, 5 e 7.
p = [0.02, 0.003, 0.04, 0.30]
print("sem correção:", [x <= 0.05 for x in p])
print("com Holm:    ", holm(p))
`,
                  checagem: `
tem('holm')
casos = [
    ([0.02, 0.003, 0.04, 0.30], [False, True, False, False]),
    ([0.01, 0.012, 0.02, 0.04], [True, True, True, True]),
    ([0.2, 0.3, 0.4, 0.5], [False, False, False, False]),
    ([0.001, 0.5, 0.013, 0.02], [True, False, True, True]),
]
for pv, esperado in casos:
    if [bool(x) for x in holm(pv)] != esperado:
        falha('Para ' + str(pv) + ', Holm devia dar ' + str(esperado) + '.')
`,
                  certo: 'Sem correção, três de quatro "funcionam"; com Holm, só uma. A correção vai para o plano antes de rodar, junto com a leitura combinada.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'depois',
      titulo: 'O transplante',
      exercicios: true,
      modulos: [
        {
          titulo: 'O plano da condição 3',
          licoes: [
            ex('lf-plano-transplante', 'O que entra na LeWM', {
              texto: `<p>A condição 3 é a LeWM da célula 1 mais o Language-Forcing. O que vem do paper fica como no paper; o que não pode vir (a camada, o peso) é varrido.</p>
<p>Preencha o plano. A checagem confere o que vem do paper e o que as ablações mandam varrer.</p>`,
              tarefa: 'Troque cada <code>None</code>.',
              inicio: `plano = {
    "base": "LeWM da célula 1, mesmo número de episódios",
    "perda": None,              # o nome da perda: "cosseno" ou "mse"?
    "alvo_no_teste": None,      # a descrição fica no teste? True ou False
    "camadas_preditor": [2, 3, 4, 5],   # camadas do meio para o fim, entre as 6 do preditor
    "pesos_lf": None,           # a lista de λ a varrer, com mais de um valor
    "controle_embaralhado": None,  # roda o controle? True ou False
    "frase_pode_citar_meta": None, # True ou False
}

for k, v in plano.items():
    print(f"{k:22s} {v}")
`,
              dica: 'Perda de cosseno; a descrição sai no teste; varrer λ, por exemplo [0.1, 0.3, 1.0]; o controle embaralhado roda; a frase não cita a meta.',
              solucao: `plano = {
    "base": "LeWM da célula 1, mesmo número de episódios",
    "perda": "cosseno",
    "alvo_no_teste": False,
    "camadas_preditor": [2, 3, 4, 5],   # camadas do meio para o fim, entre as 6 do preditor
    "pesos_lf": [0.1, 0.3, 1.0],
    "controle_embaralhado": True,
    "frase_pode_citar_meta": False,
}

for k, v in plano.items():
    print(f"{k:22s} {v}")
`,
              checagem: `
tem('plano')
if plano.get('perda') != 'cosseno':
    falha('A perda do Language-Forcing é a de cosseno, a equação (3).')
if plano.get('alvo_no_teste') is not False:
    falha('No Language-Forcing, a descrição sai no teste.')
pl = plano.get('pesos_lf')
if not isinstance(pl, (list, tuple)) or len(pl) < 2:
    falha('O λ = 1 do paper foi escolhido para outra perda. Varra mais de um valor.')
if plano.get('controle_embaralhado') is not True:
    falha('O controle embaralhado é o que separa o conteúdo do resto. Ele roda.')
if plano.get('frase_pode_citar_meta') is not False:
    falha('A fala vem de (z_t, a_t), sem a meta. A frase não pode citá-la.')
`,
              certo: 'O transplante fica fiel ao paper onde dá, e varre onde não dá. É o que torna a condição 3 um adversário justo.',
            }),
            ex('lf-plano-leitura', 'A leitura combinada', {
              texto: `<p>Como na célula 1, a leitura vem antes do dado. Escreva o que cada resultado da comparação principal vai significar.</p>`,
              tarefa: 'Preencha os três campos, trocando cada <code>"..."</code>.',
              inicio: `comparacoes = ["8 x 3", "8 x 4", "8 x 5", "8 x 7"]
correcao = "..."            # o método de correção para as quatro comparações
se_8_vence_3_e_7 = "..."    # o que se conclui
se_8_empata_com_7 = "..."   # o que se conclui

print("## Condição 8: leitura combinada antes de rodar")
print("- Comparações:", ", ".join(comparacoes))
print("- Correção:", correcao)
print("- Se a 8 vence a 3 e a 7:", se_8_vence_3_e_7)
print("- Se a 8 empata com a 7:", se_8_empata_com_7)
`,
              dica: 'Correção: Holm. Se empata com o canal mudo, o ganho vem dos tokens a mais, não da fala.',
              solucao: `comparacoes = ["8 x 3", "8 x 4", "8 x 5", "8 x 7"]
correcao = "Holm, α = 0,05, testes pareados nas mesmas tarefas"
se_8_vence_3_e_7 = "usar a própria fala supera descartá-la, e o ganho vem do conteúdo, não dos tokens a mais"
se_8_empata_com_7 = "o ganho vem da capacidade a mais; a fala não é usada como conteúdo"

print("## Condição 8: leitura combinada antes de rodar")
print("- Comparações:", ", ".join(comparacoes))
print("- Correção:", correcao)
print("- Se a 8 vence a 3 e a 7:", se_8_vence_3_e_7)
print("- Se a 8 empata com a 7:", se_8_empata_com_7)
`,
              checagem: `
for nome in ['correcao', 'se_8_vence_3_e_7', 'se_8_empata_com_7']:
    tem(nome)
    v = eval(nome)
    if not isinstance(v, str) or v.strip() in ('', '...'):
        falha('Falta preencher "' + nome + '".')
`,
            }),
          ],
        },
      ],
    },
  ],
}
