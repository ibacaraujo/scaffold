// Paper 1 da trilha de pesquisa: LeWorldModel (Maes, Le Lidec, Scieur, LeCun & Balestriero, 2026),
// arXiv:2603.19312. É a base e o código onde o experimento do paper do ICWM roda.
//
// O capítulo segue o método do Karpathy: achar o núcleo (prever o próximo embedding + SIGReg, de ponta a
// ponta, sem EMA nem stop-gradient), ler as equações, implementar o núcleo em NumPy no navegador (o teste
// de Epps–Pulley, o SIGReg, o colapso em números e o CEM) e reproduzir um número. O número não é o 96% do
// paper: é a célula 1 do plano, achar com quantos episódios a LeWM fica entre 35% e 55% no PushT. Esse
// treino roda numa GPU com o código da LeWM; aqui ficam a conta de poder estatístico, a regra de escolha e
// a configuração, conferidas com os números do paper.
//
// Números do paper usados aqui: λ = 0,1 e M = 1024 projeções (Seção 3); pontos do Epps–Pulley em
// [0,2; 4] (Apêndice A); CEM com 300 amostras, 30 elites, 30 iterações no PushT e horizonte 5 com frame
// skip 5 (Apêndice D); PushT com 20 000 episódios e 10 épocas (Apêndice E); 96% da LeWM (Tabela 1);
// dropout do preditor: 78% sem, 96% com p = 0,1 (Tabela 9).

const URL = 'https://arxiv.org/abs/2603.19312'
const trecho = (onde, texto) => `<p><a href="${URL}" target="_blank" rel="noopener">${onde}</a>: “${texto}”</p>`

// O teste de Epps–Pulley, como no Apêndice A, com a integral pela regra do trapézio.
const EPPS = `import numpy as np

t = np.linspace(0.2, 4, 17)      # os pontos da integral, como no Apêndice A
peso = np.exp(-t**2 / 2)         # w(t)
fi_normal = np.exp(-t**2 / 2)    # a função característica de N(0, 1)

def integral(f):
    return np.sum((f[1:] + f[:-1]) / 2 * np.diff(t))

def epps_pulley(h):
    fi = np.exp(1j * np.outer(t, h)).mean(axis=1)
    return integral(peso * np.abs(fi - fi_normal) ** 2)
`

const SIGREG = EPPS + `
def sigreg(Z, M=64, semente=0):
    r = np.random.default_rng(semente)
    U = r.normal(0, 1, (Z.shape[1], M))
    U = U / np.linalg.norm(U, axis=0)
    H = Z @ U
    return np.mean([epps_pulley(H[:, m]) for m in range(M)])
`

// Um mundo em que se sabe a resposta: o estado é um ponto no plano, a ação o desloca, e a câmera vê o
// estado por uma matriz fixa (8 "pixels").
const MUNDO = SIGREG + `
r = np.random.default_rng(1)
A = r.normal(0, 1, (2, 8))               # a "câmera": estado (2) -> pixels (8)
S = r.normal(0, 1, (256, 2))             # estados
acoes = r.normal(0, 0.3, (256, 2))
S_seguinte = S + acoes                   # a dinâmica de verdade
O, O_seguinte = S @ A, S_seguinte @ A    # o que o modelo vê

def enc_bom(o):
    return o @ np.linalg.pinv(A)         # recupera o estado
def pred_bom(z, a):
    return z + a

def enc_colapso(o):
    return np.zeros((len(o), 2))         # o mesmo vetor para tudo
def pred_colapso(z, a):
    return z                             # ignora a ação

def perda_pred(enc, pred):
    return np.mean((pred(enc(O), acoes) - enc(O_seguinte)) ** 2)

lam = 0.1
`

const CEM_BASE = `import numpy as np

# O mundo latente de brinquedo: z no plano, a ação desloca z (no máximo 1 por eixo).
def preditor(z, a):
    return z + np.clip(a, -1, 1)

def custo(z0, acoes, z_meta):
    # acoes: (N, H, 2). Desenrola o preditor H passos e mede a distância até a meta.
    z = np.repeat(z0[None], len(acoes), axis=0)
    for h in range(acoes.shape[1]):
        z = preditor(z, acoes[:, h])
    return np.sum((z - z_meta) ** 2, axis=1)
`

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

export const PAPER_1 = {
  n: 10,
  titulo: 'Paper 1',
  paper: {
    titulo: 'LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels',
    autores: 'Maes et al.',
    ano: 2026,
    url: URL,
  },
  aula: URL,
  // O que vem depois de implementar: a célula 1 do plano, que roda numa GPU.
  depois: {
    nota: 'O núcleo da LeWM está implementado e conferido. Agora vem a célula 1 do plano: a configuração do treino que roda numa GPU, com o código da LeWM.',
    botao: 'Ir para a célula 1',
    fim: 'A célula 1 está pronta para rodar. Quando o número sair, ele é a base de todas as condições do Paper 2.',
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
              id: 'lewm-nucleo',
              titulo: 'Achar o núcleo',
              porque: 'A LeWM é o world model onde o experimento do paper do ICWM roda. Antes de mexer nela, é preciso saber o que nela é novo e o que já existia.',
              passos: [
                {
                  texto: `<p>A LeWM tem um <strong>encoder</strong> (um ViT pequeno) que transforma cada imagem <code>o<sub>t</sub></code> num vetor <code>z<sub>t</sub></code>, e um <strong>preditor</strong> (um Transformer) que recebe <code>z<sub>t</sub></code> e a ação <code>a<sub>t</sub></code> e prevê o próximo vetor, <code>ẑ<sub>t+1</sub></code>.</p>
<p>Depois de treinada, ela planeja: procura as ações que levam o vetor previsto até o vetor da imagem da meta. Tudo isso, com 15 milhões de parâmetros, treinado numa GPU em poucas horas.</p>`,
                  tarefa: 'Encoder, preditor e planejamento já existiam em outros world models. Qual é o núcleo da LeWM?',
                  opcoes: [
                    { t: 'Uma arquitetura nova de Vision Transformer.', por: 'O encoder é um ViT-Tiny comum. O paper mostra até que um ResNet-18 funciona.' },
                    { t: 'O planejamento por CEM.', por: 'O CEM é um método antigo de otimização; o paper o usa como estava.' },
                    { t: 'Uma perda de dois termos, prever o próximo vetor e o SIGReg, que treina tudo junto a partir dos pixels, sem truques contra o colapso.', certa: true },
                    { t: 'O ambiente PushT.', por: 'O PushT é o lugar do experimento, usado por outros papers antes.' },
                  ],
                  erro: 'Procure o que o paper mudou no treino, não o que ele usou.',
                  dica: 'O título diz "Stable End-to-End": estável, de ponta a ponta.',
                  solucao: 'O núcleo é a perda: L = L_pred + λ · SIGReg(Z). Com ela, encoder e preditor treinam juntos dos pixels, sem EMA, sem stop-gradient e sem encoder pré-treinado.',
                  certo: 'O núcleo é uma equação de duas parcelas. O resto do paper mostra que ela basta.',
                  confira: trecho('Resumo', 'we introduce LeWorldModel (LeWM), the first JEPA that trains stably end-to-end from raw pixels using only two loss terms: a next-embedding prediction loss and a regularizer enforcing Gaussian-distributed latent embeddings.'),
                },
                {
                  texto: `<p>Quase todo paper é uma <strong>linha de base</strong> mais uma <strong>diferença</strong>.</p>
<p>A linha de base da LeWM é um JEPA, como o PLDM: encoder e preditor treinados com o erro quadrático entre <code>ẑ<sub>t+1</sub></code> e <code>z<sub>t+1</sub></code>. O PLDM precisa de uma perda de sete termos e seis hiperparâmetros para não colapsar.</p>`,
                  tarefa: 'Qual é a diferença que a LeWM aplica sobre essa linha de base?',
                  opcoes: [
                    { t: 'Congela o encoder, como o DINO-WM.', por: 'Congelar um encoder pré-treinado é o que a LeWM evita. Ela treina o encoder dos pixels.' },
                    { t: 'Troca os termos anticolapso por um só, o SIGReg, com um peso λ.', certa: true },
                    { t: 'Acrescenta um decodificador que reconstrói a imagem.', por: 'O paper testa isso e conclui que reconstruir não ajuda o planejamento.' },
                  ],
                  erro: 'A diferença está na perda, não na arquitetura.',
                  dica: 'Conte os hiperparâmetros: seis no PLDM, um na LeWM.',
                  solucao: 'Linha de base: um JEPA com perda de previsão. Diferença: um único regularizador, o SIGReg, no lugar dos seis hiperparâmetros anticolapso.',
                  certo: 'É essa diferença que você vai escrever em código: o SIGReg.',
                },
              ],
            },
            {
              id: 'lewm-colapso',
              titulo: 'O colapso',
              porque: 'O problema que a LeWM resolve tem nome: colapso. Entender por que ele acontece é entender por que o SIGReg está na perda.',
              passos: [
                {
                  texto: `<p>A perda de previsão é <code>L<sub>pred</sub> = ‖ẑ<sub>t+1</sub> − z<sub>t+1</sub>‖²</code>.</p>
<p>Quem escolhe os <code>z</code> é o próprio encoder. Imagine um encoder preguiçoso que devolve o mesmo vetor para qualquer imagem, por exemplo <code>z = (0, 0)</code>, e um preditor que devolve o <code>z</code> que recebeu.</p>`,
                  tarefa: 'Quanto vale L<sub>pred</sub> para esse par preguiçoso?',
                  campos: [{ rotulo: 'L_pred =', resposta: 0, tol: 1e-9 }],
                  erro: 'O preditor devolve (0, 0) e o alvo também é (0, 0). Qual é a distância?',
                  dica: 'ẑ = (0, 0) e z = (0, 0).',
                  solucao: 'ẑ_{t+1} = (0, 0) e z_{t+1} = (0, 0)\nL_pred = 0',
                  certo: 'Zero é a menor perda possível. Só com a perda de previsão, o treino premia o encoder que não vê nada.',
                },
                {
                  texto: `<p>Isso é o <strong>colapso</strong>: todas as imagens viram o mesmo vetor, a previsão fica perfeita e o modelo não serve para planejar.</p>
<p>Os JEPAs anteriores evitavam o colapso com truques, como uma cópia lenta do encoder (EMA) e o <em>stop-gradient</em>, ou congelando um encoder pré-treinado.</p>`,
                  tarefa: 'O que o SIGReg faz para impedir o colapso?',
                  opcoes: [
                    { t: 'Impede o gradiente de passar pelo encoder.', por: 'Isso é o stop-gradient, que a LeWM não usa.' },
                    { t: 'Aumenta o tamanho do vetor z.', por: 'Um vetor maior também pode colapsar: basta ser constante.' },
                    { t: 'Cobra uma perda quando os vetores de um lote não se parecem com amostras de uma normal padrão, N(0, I).', certa: true },
                  ],
                  erro: 'O SIGReg olha para a distribuição dos vetores de um lote inteiro.',
                  dica: 'O nome é Sketched Isotropic Gaussian Regularizer.',
                  solucao: 'O SIGReg compara a distribuição dos z do lote com uma normal isotrópica e cobra a diferença. Vetores todos iguais estão longe dela.',
                  certo: 'Vetores todos iguais estão o mais longe possível de uma normal. O colapso passa a custar caro.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'O SIGReg',
          licoes: [
            {
              id: 'lewm-direcoes',
              titulo: 'Uma direção de cada vez',
              porque: 'Testar se um vetor de 192 números é normal é difícil. O SIGReg reduz o problema a muitos testes de um número só.',
              passos: [
                {
                  texto: `<p>O SIGReg sorteia <code>M</code> direções <code>u</code> de comprimento 1 e projeta os vetores em cada uma: <code>h = Z u</code>. Cada projeção é um número por vetor.</p>
<p>O <strong>teorema de Cramér–Wold</strong> garante que, se todas as projeções forem normais padrão, a distribuição inteira é <code>N(0, I)</code>.</p>
<p>Se <code>z</code> tem duas coordenadas independentes, cada uma com variância 1, a variância de <code>h = u<sub>1</sub>z<sub>1</sub> + u<sub>2</sub>z<sub>2</sub></code> é <code>u<sub>1</sub>² + u<sub>2</sub>²</code>.</p>`,
                  tarefa: 'Qual é a variância de h para a direção u = (0,6; 0,8)?',
                  campos: [{ rotulo: 'variância =', resposta: 1, tol: 1e-6 }],
                  erro: 'Some os quadrados: 0,6² + 0,8².',
                  dica: '0,36 + 0,64.',
                  solucao: '0,6² + 0,8² = 0,36 + 0,64 = 1',
                  certo: 'Como u tem comprimento 1, a projeção de uma normal padrão é uma normal padrão. Por isso o alvo de cada teste é sempre N(0, 1).',
                },
              ],
            },
            {
              id: 'lewm-fc',
              titulo: 'O teste de Epps–Pulley',
              porque: 'Para cada direção, o SIGReg mede o quanto a projeção se afasta de N(0, 1). A régua é a função característica.',
              passos: [
                {
                  texto: `<p>A <strong>função característica</strong> de uma amostra <code>h<sub>1</sub>, …, h<sub>N</sub></code> é a média de <code>e<sup>i t h<sub>n</sub></sup></code>. Para a normal padrão, ela vale <code>φ<sub>0</sub>(t) = e<sup>−t²/2</sup></code>.</p>
<p>O teste de Epps–Pulley integra a diferença ao quadrado entre as duas, com um peso <code>w(t)</code>:</p>
<p><code>T = ∫ w(t) |φ<sub>N</sub>(t) − φ<sub>0</sub>(t)|² dt</code></p>`,
                  tarefa: 'Quanto vale φ<sub>0</sub>(1) = e<sup>−1/2</sup>, com três casas?',
                  campos: [{ rotulo: 'φ₀(1) =', resposta: 0.6065, tol: 0.002 }],
                  erro: 'Calcule e elevado a −0,5.',
                  dica: 'e ≈ 2,718. A raiz de e é cerca de 1,649, e 1 ÷ 1,649 ≈ …',
                  solucao: 'φ₀(1) = e^(−0,5) ≈ 0,607',
                  confira: trecho('Apêndice A', 'the empirical characteristic function (ECF) is defined as φ_N(t; h) = (1/N) Σ e^{i t h_n}'),
                },
                {
                  texto: `<p>No colapso, todas as projeções são 0. Então <code>e<sup>i t · 0</sup> = 1</code> para qualquer <code>t</code>, e <code>φ<sub>N</sub>(t) = 1</code>.</p>`,
                  tarefa: 'No ponto t = 1, quanto vale |φ<sub>N</sub>(1) − φ<sub>0</sub>(1)|² para um lote colapsado? Três casas.',
                  campos: [{ rotulo: '|φ_N − φ₀|² =', resposta: 0.1548, tol: 0.003 }],
                  erro: 'φ_N(1) = 1 e φ₀(1) ≈ 0,607. Subtraia e eleve ao quadrado.',
                  dica: '1 − 0,607 = 0,393.',
                  solucao: '(1 − 0,607)² = 0,393² ≈ 0,155',
                  certo: 'O teste vê o colapso como uma distância grande em todos os pontos t. Somando esses pontos com o peso w(t), sai um número que o gradiente consegue diminuir.',
                },
              ],
            },
            {
              id: 'lewm-lambda',
              titulo: 'Um hiperparâmetro só',
              porque: 'A perda completa tem um peso, λ. O paper argumenta que ter um peso só muda o custo de ajustar o modelo, e isso importa num experimento com muitas condições.',
              passos: [
                {
                  texto: `<p>A perda completa é <code>L = L<sub>pred</sub> + λ · SIGReg(Z)</code>, com <code>λ = 0,1</code> e <code>M = 1024</code> direções. O paper mostra que <code>M</code> quase não muda o resultado, então <code>λ</code> é o único número a ajustar.</p>
<p>Com um número só, dá para achá-lo por <strong>bissecção</strong>: cada treino corta pela metade o intervalo de candidatos. Com seis hiperparâmetros, testar 4 valores de cada um exige todas as combinações.</p>`,
                  tarefa: 'Quantos treinos a bissecção precisa para escolher entre 64 valores de λ? E quantas combinações têm 6 hiperparâmetros com 4 valores cada?',
                  campos: [
                    { rotulo: 'bissecção:', resposta: 6, tol: 1e-9 },
                    { rotulo: 'combinações:', resposta: 4096, tol: 1e-9 },
                  ],
                  erro: 'A bissecção faz log₂(64) treinos. As combinações são 4 × 4 × 4 × 4 × 4 × 4.',
                  dica: '2⁶ = 64, e 4⁶ = 4 096.',
                  solucao: 'log₂(64) = 6 treinos\n4⁶ = 4 096 combinações',
                  certo: 'Seis treinos contra milhares. No paper do ICWM, cada condição nova acrescenta termos à perda; começar de uma base com um hiperparâmetro só mantém o ajuste barato.',
                  confira: trecho('Seção 3', 'λ can be efficiently optimized using a simple bisection search with logarithmic complexity.'),
                },
              ],
            },
          ],
        },
        {
          titulo: 'Planejar',
          licoes: [
            {
              id: 'lewm-cem',
              titulo: 'CEM no espaço latente',
              porque: 'O world model só vale alguma coisa se planejar. A LeWM planeja procurando ações que levam o vetor previsto até o vetor da meta.',
              passos: [
                {
                  texto: `<p>Dadas a imagem atual e a imagem da meta, o encoder dá <code>z<sub>1</sub></code> e <code>z<sub>g</sub></code>. Para uma sequência de ações <code>a<sub>1</sub>, …, a<sub>H</sub></code>, o preditor desenrola <code>ẑ<sub>2</sub>, …, ẑ<sub>H</sub></code>, e o custo é <code>‖ẑ<sub>H</sub> − z<sub>g</sub>‖²</code>.</p>
<p>O <strong>CEM</strong> sorteia 300 sequências, fica com as 30 de menor custo (as elites), recalcula a média e o desvio a partir delas e repete. No PushT, são 30 iterações, com horizonte <code>H = 5</code>. Cada passo do horizonte vale 5 passos do ambiente (o frame skip).</p>`,
                  tarefa: 'Quantos passos do ambiente o horizonte cobre? E quantas vezes o preditor é chamado para fazer um plano (amostras × iterações × horizonte)?',
                  campos: [
                    { rotulo: 'passos do ambiente:', resposta: 25, tol: 1e-9 },
                    { rotulo: 'chamadas do preditor:', resposta: 45000, tol: 1e-9 },
                  ],
                  erro: 'Horizonte: 5 × 5. Chamadas: 300 × 30 × 5.',
                  dica: '300 × 30 = 9 000.',
                  solucao: '5 × 5 = 25 passos do ambiente\n300 × 30 × 5 = 45 000 chamadas',
                  certo: 'São 45 mil chamadas por plano. Por isso um preditor pequeno importa: a LeWM planeja em menos de 1 segundo, contra 47 s do DINO-WM.',
                  confira: trecho('Apêndice D', 'CEM samples 300 candidate action sequences and optimizes them for a maximum of 30 iterations in PushT'),
                },
                {
                  texto: `<p>Depois de planejar 5 ações, a LeWM executa só as primeiras, olha a imagem nova e planeja de novo. Isso se chama <strong>controle preditivo</strong> (MPC).</p>`,
                  tarefa: 'Por que não executar o plano inteiro de uma vez?',
                  opcoes: [
                    { t: 'Porque o CEM só consegue achar uma ação por vez.', por: 'O CEM otimiza a sequência inteira de H ações de uma vez.' },
                    { t: 'Porque o erro do preditor se acumula a cada passo desenrolado; replanejar a partir da imagem real corrige o rumo.', certa: true },
                    { t: 'Porque executar todas as ações é mais lento.', por: 'Replanejar é que custa mais. O ganho é a precisão, não a velocidade.' },
                  ],
                  erro: 'Pense no que acontece com uma previsão feita em cima de outra previsão.',
                  dica: 'ẑ₃ vem de ẑ₂, que já tinha erro.',
                  solucao: 'O preditor desenrola previsões em cima de previsões, e o erro cresce. Replanejar a partir da imagem real recomeça do estado certo.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'O número a reproduzir',
          licoes: [
            {
              id: 'lewm-numero',
              titulo: 'Por que não 96%',
              porque: 'Reproduzir um número é o quarto passo do método. Aqui, o número escolhido não é o melhor resultado do paper, e o motivo é o próprio experimento do ICWM.',
              passos: [
                {
                  texto: `<p>No PushT, a LeWM chega a 96% de sucesso, treinada 10 épocas em 20 000 episódios. Uma política aleatória faz 2%.</p>
<p>A célula 1 do plano é outra: achar com quantos episódios (1 000, 2 000 ou 4 000) a LeWM fica <strong>entre 35% e 55%</strong>.</p>
<p>No Language-Forcing (o Paper 2), o ganho da linguagem é de 3 pontos com 10% dos dados e de cerca de 10 pontos com 40% a 100%.</p>`,
                  tarefa: 'Por que calibrar a base entre 35% e 55%, e não usar os 96% do paper?',
                  opcoes: [
                    { t: 'Porque treinar com 20 000 episódios é proibido pelo benchmark.', por: 'Não é proibido. O motivo é medir um efeito, não economizar.' },
                    { t: 'Porque 35% a 55% é o resultado de uma política aleatória.', por: 'A política aleatória faz 2%.' },
                    { t: 'Porque com 96% sobram 4 pontos para melhorar, e com muito poucos dados a linguagem quase não ajuda. No meio, o efeito tem espaço para aparecer.', certa: true },
                  ],
                  erro: 'Pense em quanto espaço sobra acima de 96%, e no que a Tabela 3 do Language-Forcing mostra com poucos dados.',
                  dica: 'Um teto e um chão: os dois escondem o efeito.',
                  solucao: 'Perto do teto, não sobra espaço para melhorar; perto do chão, o andaime ainda não ajuda. A faixa de 35% a 55% fica onde o efeito pode aparecer.',
                  certo: 'É a zona de desenvolvimento proximal do Vygotsky, medida: o andaime ajuda quando o aprendiz já está perto de conseguir sozinho.',
                },
                {
                  texto: `<p>Cada avaliação usa 50 tarefas. Com taxa de sucesso <code>p</code>, o erro padrão da taxa medida é <code>√(p(1 − p) / n)</code>.</p>`,
                  tarefa: 'Com p = 0,4 e n = 50, quanto vale o erro padrão, em pontos percentuais? Uma casa.',
                  campos: [{ rotulo: 'erro padrão (pontos) =', resposta: 6.93, tol: 0.1 }],
                  erro: 'Calcule 0,4 × 0,6 ÷ 50, tire a raiz e multiplique por 100.',
                  dica: '0,24 ÷ 50 = 0,0048.',
                  solucao: '√(0,4 × 0,6 / 50) = √0,0048 ≈ 0,069\n≈ 6,9 pontos',
                  certo: 'Quase 7 pontos de incerteza numa medida só. Um ganho de 10 pontos, como o do Language-Forcing, fica perto do ruído; é por isso que o plano faz a conta de poder antes de rodar.',
                },
              ],
            },
            {
              id: 'lewm-dropout',
              titulo: 'Conferir a base',
              porque: 'Uma comparação só é justa se a base estiver certa. A ablação da própria LeWM mostra um detalhe que derruba o resultado se ficar de fora.',
              passos: [
                {
                  texto: `<p>A Tabela 9 do paper varia o dropout do preditor no PushT:</p>
<p><code>p = 0,0 → 78%</code> · <code>p = 0,1 → 96%</code> · <code>p = 0,2 → 85%</code> · <code>p = 0,5 → 67%</code></p>`,
                  tarefa: 'Quantos pontos a LeWM perde no PushT se o preditor ficar sem dropout?',
                  campos: [{ rotulo: 'pontos =', resposta: 18, tol: 0.01 }],
                  erro: 'Subtraia 78 de 96.',
                  dica: '96 − 78.',
                  solucao: '96 − 78 = 18 pontos',
                  certo: 'Dezoito pontos, mais que o ganho inteiro do Language-Forcing. Antes da célula 1, confira no código que o preditor tem dropout de 0,1.',
                  confira: trecho('Tabela 9', 'A small amount of dropout (p = 0.1) yields the best results.'),
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
          titulo: 'O SIGReg em código',
          licoes: [
            {
              id: 'lewm-ep-cod',
              titulo: 'O teste em NumPy',
              porque: 'O núcleo da LeWM cabe em poucas linhas. A primeira é o teste de Epps–Pulley, a régua de cada direção.',
              passos: [
                {
                  texto: `<p>Em NumPy, <code>1j</code> é a unidade imaginária. <code>np.outer(t, h)</code> monta a tabela de todos os produtos <code>t · h<sub>n</sub></code>: uma linha por ponto <code>t</code>, uma coluna por amostra.</p>
<p>A função característica é a média de <code>e<sup>i t h</sup></code> ao longo das amostras, para cada <code>t</code>.</p>`,
                  tarefa: 'Complete a linha de <code>fi</code>: a média de <code>np.exp(1j * np.outer(t, h))</code> ao longo das colunas (<code>axis=1</code>).',
                  inicio: `import numpy as np

t = np.linspace(0.2, 4, 17)      # os pontos da integral, como no Apêndice A
peso = np.exp(-t**2 / 2)         # w(t)
fi_normal = np.exp(-t**2 / 2)    # a função característica de N(0, 1)

def integral(f):
    return np.sum((f[1:] + f[:-1]) / 2 * np.diff(t))

def epps_pulley(h):
    fi = 0
    return integral(peso * np.abs(fi - fi_normal) ** 2)

r = np.random.default_rng(0)
print("normal:     ", round(epps_pulley(r.normal(0, 1, 512)), 4))
print("colapsada:  ", round(epps_pulley(np.zeros(512)), 4))
print("larga demais:", round(epps_pulley(r.normal(0, 3, 512)), 4))
`,
                  dica: '<code>fi = np.exp(1j * np.outer(t, h)).mean(axis=1)</code>',
                  solucao: EPPS + `
r = np.random.default_rng(0)
print("normal:     ", round(epps_pulley(r.normal(0, 1, 512)), 4))
print("colapsada:  ", round(epps_pulley(np.zeros(512)), 4))
print("larga demais:", round(epps_pulley(r.normal(0, 3, 512)), 4))
`,
                  checagem: `
tem('epps_pulley')
r = np.random.default_rng(5)
a = float(epps_pulley(r.normal(0, 1, 512)))
b = float(epps_pulley(np.zeros(512)))
if not a < 0.01:
    falha('Para uma amostra normal, o teste devia dar perto de 0. Confira a média ao longo de axis=1.')
if not perto(b, 0.2043, 0.005):
    falha('Para uma amostra colapsada, o teste devia dar cerca de 0,204.')
`,
                  certo: 'Perto de 0 para a normal, grande para a colapsada e também para a larga demais. O teste cobra os dois desvios.',
                },
              ],
            },
            {
              id: 'lewm-sigreg-cod',
              titulo: 'O SIGReg',
              porque: 'Com a régua de uma direção pronta, o SIGReg é sortear direções, projetar e tirar a média.',
              passos: [
                {
                  texto: `<p><code>Z</code> tem um vetor por linha. <code>U</code> tem uma direção por coluna, já normalizada. O produto <code>Z @ U</code> dá todas as projeções de uma vez: uma coluna por direção.</p>`,
                  tarefa: 'Complete <code>H</code>, a matriz das projeções.',
                  inicio: EPPS + `
def sigreg(Z, M=64, semente=0):
    r = np.random.default_rng(semente)
    U = r.normal(0, 1, (Z.shape[1], M))
    U = U / np.linalg.norm(U, axis=0)
    H = 0
    return np.mean([epps_pulley(H[:, m]) for m in range(M)])

r = np.random.default_rng(0)
print("normal:   ", round(sigreg(r.normal(0, 1, (256, 16))), 4))
print("colapsado:", round(sigreg(np.full((256, 16), 0.3)), 4))
print("uma reta: ", round(sigreg(np.outer(r.normal(0, 1, 256), np.ones(16)) / 4), 4))
`,
                  dica: '<code>H = Z @ U</code>',
                  solucao: SIGREG + `
r = np.random.default_rng(0)
print("normal:   ", round(sigreg(r.normal(0, 1, (256, 16))), 4))
print("colapsado:", round(sigreg(np.full((256, 16), 0.3)), 4))
print("uma reta: ", round(sigreg(np.outer(r.normal(0, 1, 256), np.ones(16)) / 4), 4))
`,
                  checagem: `
tem('sigreg')
r = np.random.default_rng(7)
a = float(sigreg(r.normal(0, 1, (256, 16))))
b = float(sigreg(np.full((256, 16), 0.3)))
c = float(sigreg(np.outer(r.normal(0, 1, 256), np.ones(16)) / 4))
if not a < 0.02:
    falha('Para vetores normais, o SIGReg devia dar perto de 0.')
if not (b > 0.1 and c > 0.05):
    falha('Para vetores colapsados ou numa reta só, o SIGReg devia dar bem mais que para os normais.')
`,
                  certo: 'O SIGReg pega também o colapso parcial: vetores que variam numa direção só. Nenhuma direção sorteada escapa por muito tempo.',
                },
              ],
            },
            {
              id: 'lewm-colapso-cod',
              titulo: 'O colapso em números',
              porque: 'Antes de confiar numa perda, vale vê-la decidir entre uma solução boa e uma ruim num mundo em que se sabe a resposta.',
              passos: [
                {
                  texto: `<p>O código monta um mundo pequeno: o estado é um ponto no plano, a ação o desloca e uma "câmera" fixa transforma o estado em 8 números.</p>
<p>Há dois pares de encoder e preditor. O bom recupera o estado e soma a ação. O colapsado devolve <code>(0, 0)</code> para tudo e ignora a ação.</p>`,
                  tarefa: 'Calcule a perda completa da LeWM para os dois: <code>total_bom</code> e <code>total_colapso</code>, com <code>perda_pred(...) + lam * sigreg(Z)</code>. Para o Z de cada um, use o encoder nas observações <code>O</code>.',
                  inicio: MUNDO + `
pred_b = perda_pred(enc_bom, pred_bom)
pred_c = perda_pred(enc_colapso, pred_colapso)
print("só a previsão:  bom", round(pred_b, 4), "  colapso", round(pred_c, 4))

total_bom = 0
total_colapso = 0
print("com o SIGReg:   bom", round(total_bom, 4), "  colapso", round(total_colapso, 4))
`,
                  dica: '<code>total_bom = pred_b + lam * sigreg(enc_bom(O))</code>, e o mesmo com <code>enc_colapso</code>.',
                  solucao: MUNDO + `
pred_b = perda_pred(enc_bom, pred_bom)
pred_c = perda_pred(enc_colapso, pred_colapso)
print("só a previsão:  bom", round(pred_b, 4), "  colapso", round(pred_c, 4))

total_bom = pred_b + lam * sigreg(enc_bom(O))
total_colapso = pred_c + lam * sigreg(enc_colapso(O))
print("com o SIGReg:   bom", round(total_bom, 4), "  colapso", round(total_colapso, 4))
`,
                  checagem: `
tem('total_bom'); tem('total_colapso')
if float(total_bom) == 0 and float(total_colapso) == 0:
    falha('Os totais ainda são 0. Some lam * sigreg(...) à perda de previsão.')
if not perto(float(total_colapso), 0.1 * 0.2043, 0.003):
    falha('O total do colapso devia dar cerca de 0,1 × 0,204. Use enc_colapso(O) no sigreg.')
if not float(total_bom) < float(total_colapso) / 3:
    falha('O total do encoder bom devia ficar bem abaixo do colapsado.')
`,
                  certo: 'Só com a previsão, os dois empatam em zero: a perda não sabe escolher. Com o SIGReg, o bom ganha com folga. É a frase do paper em números.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Planejar',
          licoes: [
            {
              id: 'lewm-cem-cod',
              titulo: 'O CEM',
              porque: 'O planejador é a outra metade da LeWM. O CEM é curto: sortear, escolher as elites, atualizar.',
              passos: [
                {
                  texto: `<p>O preditor de brinquedo já está pronto: <code>z</code> é um ponto no plano e a ação o desloca. A função <code>custo</code> desenrola H passos e mede a distância até a meta, para várias sequências de uma vez.</p>
<p>O CEM guarda uma média e um desvio para cada ação do plano. A cada iteração, sorteia 300 sequências, ordena pelo custo e fica com as 30 primeiras.</p>`,
                  tarefa: 'Complete as duas linhas do fim do laço: a <code>media</code> e o <code>desvio</code> das elites, ao longo das amostras (<code>axis=0</code>).',
                  inicio: CEM_BASE + `
def cem(z0, z_meta, H=5, N=300, K=30, iters=30, semente=0):
    r = np.random.default_rng(semente)
    media = np.zeros((H, 2))
    desvio = np.ones((H, 2))
    for _ in range(iters):
        acoes = media + desvio * r.normal(0, 1, (N, H, 2))
        c = custo(z0, acoes, z_meta)
        elite = acoes[np.argsort(c)[:K]]
        media = media
        desvio = desvio
    return media

z0, z_meta = np.array([0.0, 0.0]), np.array([3.0, -2.0])
plano = cem(z0, z_meta)
print("custo do plano:", custo(z0, plano[None], z_meta)[0])
print("custo de ações ao acaso:", custo(z0, np.random.default_rng(1).normal(0, 1, (1, 5, 2)), z_meta)[0])
`,
                  dica: '<code>media = elite.mean(axis=0)</code> e <code>desvio = elite.std(axis=0)</code>.',
                  solucao: CEM_BASE + `
def cem(z0, z_meta, H=5, N=300, K=30, iters=30, semente=0):
    r = np.random.default_rng(semente)
    media = np.zeros((H, 2))
    desvio = np.ones((H, 2))
    for _ in range(iters):
        acoes = media + desvio * r.normal(0, 1, (N, H, 2))
        c = custo(z0, acoes, z_meta)
        elite = acoes[np.argsort(c)[:K]]
        media = elite.mean(axis=0)
        desvio = elite.std(axis=0)
    return media

z0, z_meta = np.array([0.0, 0.0]), np.array([3.0, -2.0])
plano = cem(z0, z_meta)
print("custo do plano:", custo(z0, plano[None], z_meta)[0])
print("custo de ações ao acaso:", custo(z0, np.random.default_rng(1).normal(0, 1, (1, 5, 2)), z_meta)[0])
`,
                  checagem: `
tem('cem')
p = cem(np.array([0.0, 0.0]), np.array([-2.0, 4.0]), semente=3)
if np.allclose(p, 0):
    falha('O plano ainda é todo zero. Atualize a média com as elites.')
if not custo(np.array([0.0, 0.0]), p[None], np.array([-2.0, 4.0]))[0] < 0.01:
    falha('O plano devia levar z até a meta. Confira axis=0 na média e no desvio.')
`,
                  certo: 'Em 30 iterações o plano chega à meta. Na LeWM é o mesmo laço; só o preditor é um Transformer e o z tem 192 números.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Reproduzir',
          licoes: [
            {
              id: 'lewm-poder',
              titulo: 'Quantas tarefas bastam',
              porque: 'Um experimento que não consegue ver o efeito procurado é tempo de GPU perdido. A conta de poder diz isso antes de rodar.',
              passos: [
                {
                  texto: `<p>Para comparar duas taxas de sucesso medidas em <code>n</code> tarefas cada, a menor diferença que se detecta com 80% de poder, a 5% de significância, é aproximadamente</p>
<p><code>(z<sub>0,975</sub> + z<sub>0,8</sub>) · √(2 p (1 − p) / n)</code></p>
<p>com <code>z<sub>0,975</sub> ≈ 1,96</code> e <code>z<sub>0,8</sub> ≈ 0,84</code>.</p>`,
                  tarefa: 'Complete <code>diferenca_minima(p, n)</code> e guarde em <code>mde_100</code> o resultado para 100 tarefas.',
                  inicio: `import numpy as np

z_a, z_b = 1.96, 0.8416

def diferenca_minima(p, n):
    return 0

mde_50 = diferenca_minima(0.4, 50)
mde_100 = 0
print(f"50 tarefas:  {100 * mde_50:.1f} pontos")
print(f"100 tarefas: {100 * mde_100:.1f} pontos")
`,
                  dica: '<code>return (z_a + z_b) * np.sqrt(2 * p * (1 - p) / n)</code>, e <code>mde_100 = diferenca_minima(0.4, 100)</code>.',
                  solucao: `import numpy as np

z_a, z_b = 1.96, 0.8416

def diferenca_minima(p, n):
    return (z_a + z_b) * np.sqrt(2 * p * (1 - p) / n)

mde_50 = diferenca_minima(0.4, 50)
mde_100 = diferenca_minima(0.4, 100)
print(f"50 tarefas:  {100 * mde_50:.1f} pontos")
print(f"100 tarefas: {100 * mde_100:.1f} pontos")
`,
                  checagem: `
tem('diferenca_minima'); tem('mde_100')
if not perto(float(diferenca_minima(0.4, 50)), 0.2745, 0.002):
    falha('Para p = 0,4 e 50 tarefas, devia dar cerca de 0,274.')
if not perto(float(mde_100), 0.1941, 0.002):
    falha('mde_100 devia ser diferenca_minima(0.4, 100), cerca de 0,194.')
`,
                  certo: 'Com 50 tarefas, só uma diferença de uns 27 pontos aparece com segurança; com 100, uns 19. O ganho de 10 pontos do Language-Forcing pede mais tarefas, mais sementes ou comparações pareadas, nas mesmas tarefas.',
                },
              ],
            },
            {
              id: 'lewm-celula1',
              titulo: 'A regra da célula 1',
              porque: 'A célula 1 escolhe o tamanho dos dados de todo o resto do experimento. A regra de escolha fica escrita antes de o número sair, para o número não escolher a regra.',
              passos: [
                {
                  texto: `<p>A célula 1 treina a LeWM com 1 000, 2 000 e 4 000 episódios e mede a taxa de sucesso no PushT. A regra: usar o <strong>menor</strong> número de episódios cuja taxa fica entre 0,35 e 0,55. Se nenhum fica, a função devolve <code>None</code>, e o plano precisa de outra grade.</p>
<p>Os números do código são inventados, só para testar a função. Os de verdade saem da GPU.</p>`,
                  tarefa: 'Complete <code>escolher(resultados)</code>: devolva o menor número de episódios com taxa entre 0,35 e 0,55, ou <code>None</code>.',
                  inicio: `def escolher(resultados):
    # resultados: {episódios: taxa de sucesso}
    for episodios in sorted(resultados):
        pass
    return None

# Números inventados, só para testar a regra.
print(escolher({1000: 0.18, 2000: 0.41, 4000: 0.63}))   # devia dar 2000
print(escolher({1000: 0.12, 2000: 0.22, 4000: 0.31}))   # devia dar None
`,
                  dica: 'Dentro do <code>for</code>: <code>if 0.35 &lt;= resultados[episodios] &lt;= 0.55: return episodios</code>.',
                  solucao: `def escolher(resultados):
    # resultados: {episódios: taxa de sucesso}
    for episodios in sorted(resultados):
        if 0.35 <= resultados[episodios] <= 0.55:
            return episodios
    return None

# Números inventados, só para testar a regra.
print(escolher({1000: 0.18, 2000: 0.41, 4000: 0.63}))   # devia dar 2000
print(escolher({1000: 0.12, 2000: 0.22, 4000: 0.31}))   # devia dar None
`,
                  checagem: `
tem('escolher')
casos = [
    ({1000: 0.18, 2000: 0.41, 4000: 0.63}, 2000),
    ({1000: 0.12, 2000: 0.22, 4000: 0.31}, None),
    ({4000: 0.5, 1000: 0.36, 2000: 0.45}, 1000),
    ({1000: 0.56, 2000: 0.7, 4000: 0.9}, None),
    ({1000: 0.2, 2000: 0.55, 4000: 0.6}, 2000),
]
for res, esperado in casos:
    if escolher(res) != esperado:
        falha('Para ' + str(res) + ', a regra devia dar ' + str(esperado) + '.')
`,
                  certo: 'A regra está escrita e testada antes do dado. Na próxima parte ficam a configuração e o que fazer se nenhum tamanho cair na faixa.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'depois',
      titulo: 'A célula 1',
      exercicios: true,
      modulos: [
        {
          titulo: 'Antes de rodar na GPU',
          licoes: [
            ex('lewm-c1-config', 'A configuração', {
              texto: `<p>A célula 1 roda com o código da LeWM, numa GPU. Tudo o que não é o número de episódios fica igual ao paper, para a base ser a LeWM de verdade e não uma versão enfraquecida.</p>
<p>Preencha a configuração com os valores do paper que você leu neste capítulo. A checagem confere cada um.</p>`,
              tarefa: 'Troque cada <code>None</code> pelo valor do paper.',
              inicio: `config = {
    "episodios": [1000, 2000, 4000],
    "epocas": None,           # épocas de treino no PushT
    "lam": None,              # o peso do SIGReg
    "projecoes": None,        # M, o número de direções do SIGReg
    "dropout": None,          # o dropout do preditor
    "horizonte": None,        # H do CEM
    "amostras_cem": None,
    "elites_cem": None,
    "iteracoes_cem": None,    # no PushT
    "tarefas_avaliacao": 50,
    "sementes": 3,
}

for k, v in config.items():
    print(f"{k:18s} {v}")
`,
              dica: 'Épocas 10, λ 0,1, M 1024, dropout 0,1, horizonte 5, 300 amostras, 30 elites, 30 iterações.',
              solucao: `config = {
    "episodios": [1000, 2000, 4000],
    "epocas": 10,             # épocas de treino no PushT
    "lam": 0.1,               # o peso do SIGReg
    "projecoes": 1024,        # M, o número de direções do SIGReg
    "dropout": 0.1,           # o dropout do preditor
    "horizonte": 5,           # H do CEM
    "amostras_cem": 300,
    "elites_cem": 30,
    "iteracoes_cem": 30,      # no PushT
    "tarefas_avaliacao": 50,
    "sementes": 3,
}

for k, v in config.items():
    print(f"{k:18s} {v}")
`,
              checagem: `
tem('config')
esperado = {"epocas": 10, "lam": 0.1, "projecoes": 1024, "dropout": 0.1, "horizonte": 5,
            "amostras_cem": 300, "elites_cem": 30, "iteracoes_cem": 30}
for k, v in esperado.items():
    if config.get(k) is None:
        falha('Falta preencher "' + k + '".')
    if not perto(float(config[k]), v, 1e-9):
        falha('"' + k + '" não bate com o paper. Volte à lição em que ele aparece.')
`,
              certo: 'Com essa configuração, a única coisa que muda entre as rodadas é o número de episódios.',
            }),
            ex('lewm-c1-leitura', 'Combinar a leitura antes', {
              texto: `<p>O último passo antes de rodar é escrever o que cada resultado vai significar. Assim a leitura não se ajusta ao número depois que ele sai.</p>
<p>Escreva, numa linha cada, o que fazer nos três casos. O código imprime o registro em Markdown, pronto para o Caderno de Pesquisa.</p>`,
              tarefa: 'Preencha os três campos, trocando cada <code>"..."</code>.',
              inicio: `faixa = (0.35, 0.55)
se_cair_na_faixa = "..."      # o que vira a base de todas as condições
se_ficar_abaixo = "..."       # nenhum tamanho chega a 0,35
se_ficar_acima = "..."        # até 1 000 episódios já passa de 0,55

print("## Célula 1: leitura combinada antes de rodar")
print("- Faixa:", faixa)
print("- Na faixa:", se_cair_na_faixa)
print("- Abaixo:", se_ficar_abaixo)
print("- Acima:", se_ficar_acima)
`,
              dica: 'Por exemplo: abaixo, acrescentar 8 000 episódios à grade; acima, descer para 500 e 250.',
              solucao: `faixa = (0.35, 0.55)
se_cair_na_faixa = "o menor tamanho na faixa vira o tamanho de todas as condições, com 3 sementes"
se_ficar_abaixo = "acrescentar 8 000 episódios à grade e rodar de novo, antes de qualquer condição"
se_ficar_acima = "descer a grade para 500 e 250 episódios"

print("## Célula 1: leitura combinada antes de rodar")
print("- Faixa:", faixa)
print("- Na faixa:", se_cair_na_faixa)
print("- Abaixo:", se_ficar_abaixo)
print("- Acima:", se_ficar_acima)
`,
              checagem: `
tem('faixa')
if tuple(faixa) != (0.35, 0.55):
    falha('A faixa é a do plano: (0.35, 0.55).')
for nome in ['se_cair_na_faixa', 'se_ficar_abaixo', 'se_ficar_acima']:
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
