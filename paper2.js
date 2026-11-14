// Paper 2: o primeiro paper do dia. O Scaffold registra, um por dia, papers da linha de pesquisa
// (LLMs, e a linguagem como ferramenta de aprendizado, na linha de Vygotsky), implementados no
// núcleo, de modo que a implementação ensine.
//
// O paper: Kim, Jeon, Zhang & Yang (2026), "Experience-Handoff Reinforcement Learning for Recursive
// Self-Improvement", arXiv:2611.16409. O método do paper (ACE-RL) treina um só modelo em três papéis:
// o ator, que resolve a tarefa; o refletor, que tira lições de uma tentativa; e o curador, que edita
// um playbook entregue à próxima tentativa. A ideia central: uma nota vale o que ela causa num jogo
// novo (equações 6 e 7 do paper), e cada papel é comparado dentro do seu próprio grupo.
//
// Aqui tudo roda no navegador, com numpy. O LLM (no paper, Qwen3-0.6B no Mastermind) vira um modelo
// de dois números: a confiança do ator, `a`, e as preferências do refletor, `w`, entre três tipos de
// nota. O refletor e o curador viram um papel só. O jogo é o mesmo do paper, o Mastermind, em tamanho
// pequeno: 3 posições e 4 cores. O número reproduzido é a comparação da Tabela 2 (ACE-RL contra o
// GRPO só do ator, os dois avaliados com o playbook, em RSI@3), na forma, não no valor.

// Cada passo de código roda sozinho, então cada um traz o que precisa. Os blocos abaixo são somados.
const JOGO = `import numpy as np

# As cores: 0 = vermelho, 1 = azul, 2 = verde, 3 = amarelo.
# Uma senha tem 3 posições. Há 4 x 4 x 4 = 64 senhas, cada uma com um número de 0 a 63.
CORES = 4
SENHAS = [(a, b, c) for a in range(CORES) for b in range(CORES) for c in range(CORES)]
K = len(SENHAS)

def feedback(senha, palpite):
    pretos = sum(s == p for s, p in zip(senha, palpite))
    comuns = sum(min(senha.count(c), palpite.count(c)) for c in range(CORES))
    return pretos, comuns - pretos

# A resposta do jogo para cada par (senha, palpite), numa tabela 64 x 64.
# (pretos, brancos) vira um número só: 10 * pretos + brancos. Acertar tudo dá 30.
FB = np.array([[10 * feedback(s, p)[0] + feedback(s, p)[1] for p in SENHAS] for s in SENHAS])
GANHOU = 30

def consistentes(fatos):
    # As senhas que dariam exatamente essas respostas a esses palpites (a versão rápida, com numpy).
    ok = np.ones(K, bool)
    for g, f in fatos:
        ok &= FB[:, g] == f
    return np.flatnonzero(ok)
`

const ATOR = `
TURNOS = 3

def jogar(senha, playbook, a, rng):
    # Uma tentativa: até 3 palpites. Devolve (recompensa, historico, seguiu).
    p = 1 / (1 + np.exp(-a))
    historico, seguiu = [], []
    for _ in range(TURNOS):
        cand = consistentes(historico + playbook)
        s = rng.random() < p
        seguiu.append(s)
        if s and len(cand) > 0:
            g = rng.choice(cand)
        else:
            g = rng.integers(K)
        f = FB[senha, g]
        historico.append((g, f))
        if f == GANHOU:
            return 1.0, historico, seguiu
    return 0.0, historico, seguiu
`

const NOTA = `
# Os três tipos de nota que o refletor pode escrever depois de uma tentativa:
# 0 = lição: um palpite da tentativa e a resposta que ele recebeu (um fato verdadeiro)
# 1 = chute: um palpite qualquer com uma resposta inventada (quase sempre falso)
# 2 = vazia: não escreve nada
TIPOS = ['lição', 'chute', 'vazia']

def escrever_nota(tipo, historico, rng):
    if tipo == 0:
        return [historico[rng.integers(len(historico))]]
    if tipo == 1:
        return [(rng.integers(K), int(rng.choice([0, 1, 2, 10, 11, 20])))]
    return []

def vantagens(r):
    r = np.asarray(r, float)
    return (r - r.mean()) / (r.std() + 1e-6)

def softmax(w):
    e = np.exp(w - w.max())
    return e / e.sum()

def rsi(a, w, tentativas=3, n=300, semente=7):
    # RSI@k: a fração de senhas descobertas em até k tentativas, com as notas passando adiante.
    rng = np.random.default_rng(semente)
    acertos = 0
    for _ in range(n):
        senha = rng.integers(K)
        playbook = []
        for _ in range(tentativas):
            r, h, _ = jogar(senha, playbook, a, rng)
            if r == 1:
                acertos += 1
                break
            playbook = playbook + escrever_nota(rng.choice(3, p=softmax(w)), h, rng)
    return acertos / n
`

// O passo de treino. A linha do grupo do refletor é a que o passo de treino pede para escrever.
const treino = (linhaRefletor) => `
def grad_ator(seguiu, a):
    # Quanto mudar a para tornar mais provável o que o ator fez em cada palpite.
    p = 1 / (1 + np.exp(-a))
    return sum((1 - p) if s else -p for s in seguiu)

def passo_de_treino(a, w, rng, treinar_refletor):
    senha = rng.integers(K)
    # 1. O ator tenta 4 vezes, sem playbook.
    jogos = [jogar(senha, [], a, rng) for _ in range(4)]
    # 2. O refletor lê uma dessas tentativas e escreve 4 notas sobre ela.
    _, h, _ = jogos[rng.integers(4)]
    tipos = [rng.choice(3, p=softmax(w)) for _ in range(4)]
    # 3. Cada nota é testada: um jogo novo com ela no playbook.
    novos = [jogar(senha, escrever_nota(k, h, rng), a, rng) for k in tipos]
    # 4. O grupo do ator: os 8 jogos.
    A = vantagens([j[0] for j in jogos + novos])
    a = a + 0.05 * sum(Ai * grad_ator(j[2], a) for Ai, j in zip(A, jogos + novos)) / 8
    if treinar_refletor:
        # 5. O grupo do refletor: as 4 notas da mesma tentativa, cada uma pelo jogo que causou.
${linhaRefletor}
        w = w + 0.2 * sum(Ai * (np.eye(3)[k] - softmax(w)) for Ai, k in zip(Ar, tipos)) / 4
    return a, w

def treinar(passos, treinar_refletor, semente=0):
    rng = np.random.default_rng(semente)
    a, w = -1.0, np.array([0.0, 1.0, 1.0])   # começa fraco: segue pouco e escreve notas ruins
    curva = []
    for _ in range(passos):
        a, w = passo_de_treino(a, w, rng, treinar_refletor)
        curva.append(softmax(w)[0])
    return a, w, curva
`
const REFLETOR_CERTO = `        Ar = vantagens([j[0] for j in novos])`
const REFLETOR_VAZIO = `        Ar = np.zeros(4)   # troque: as vantagens das 4 notas, pelo resultado de cada jogo novo`
const TREINO = treino(REFLETOR_CERTO)

// Os dois treinos usados nos dois últimos passos.
const DOIS_TREINOS = `
a1, w1, curva1 = treinar(300, treinar_refletor=False)   # GRPO: só o ator aprende
a2, w2, curva2 = treinar(300, treinar_refletor=True)    # ACE-RL: o ator e o refletor aprendem
`

const ex = (id, titulo, porque, passo) => ({ id, titulo, porque, passos: [passo] })

export const PAPER_2 = {
  n: 11,
  titulo: 'Paper 2',
  paper: {
    titulo: 'Experience-Handoff Reinforcement Learning for Recursive Self-Improvement',
    autores: 'Kim et al.',
    ano: 2026,
    url: 'https://arxiv.org/abs/2611.16409',
  },
  aula: 'https://arxiv.org/abs/2611.16409',
  semFicha: true,
  intro: 'Um paper de sexta, 13/11/2026: um modelo que aprende a escrever notas para o seu eu futuro. Primeiro ler, do zero; depois implementar o núcleo, num jogo que roda no navegador.',
  partes: [
    {
      id: 'matematica',
      titulo: 'Ler o paper',
      modulos: [
        {
          titulo: 'A ideia',
          licoes: [
            {
              id: 'p2-problema',
              titulo: 'O que se perde num número',
              porque: 'Todo paper responde a uma falta. Antes de qualquer conta, vale saber o que este paper acha que está faltando no jeito de treinar modelos de linguagem hoje.',
              passos: [
                {
                  texto: `<p>Um <strong>agente</strong> é um modelo de linguagem que age: escreve um código, consulta uma ferramenta, tenta de novo. No fim, um programa confere se a tarefa foi resolvida e devolve um número, a <strong>recompensa</strong>: 1 se deu certo, 0 se não deu.</p>
<p>O <strong>aprendizado por reforço</strong> (RL, de <em>reinforcement learning</em>) usa esse número para mudar o modelo: o que levou a 1 fica mais provável, o que levou a 0 fica menos provável.</p>
<p>Só que a tentativa inteira vira um número só. As mensagens de erro, o que o agente descobriu sobre a tarefa, as regras que ele percebeu no caminho: tudo isso some.</p>`,
                  tarefa: 'Um agente tenta uma tarefa por 20 passos, recebe três mensagens de erro diferentes e falha. O que o RL comum aproveita dessa tentativa?',
                  opcoes: [
                    { t: 'As três mensagens de erro, uma por uma.', por: 'O RL comum não lê as mensagens. Ele só vê o número do fim.' },
                    { t: 'Só o número do fim: 0.', certa: true },
                    { t: 'Um resumo escrito pelo próprio agente.', por: 'Isso é o que o paper quer acrescentar. O RL comum não faz.' },
                  ],
                  erro: 'Pense no que chega até a conta que muda o modelo.',
                  dica: 'A recompensa é um número: 1 ou 0.',
                  solucao: 'Só a recompensa: 0. O resto da tentativa não chega ao treino.',
                  certo: 'É isso que o paper chama de compressão: uma tentativa rica vira um número.',
                },
                {
                  texto: `<p>Existe um outro jeito de passar a experiência adiante: por <strong>texto</strong>. Depois de uma tentativa, o próprio modelo escreve o que aprendeu, e esse texto entra na próxima tentativa.</p>
<p>O programa que organiza isso se chama <strong>harness</strong>. O paper usa um chamado ACE, com três papéis feitos pelo mesmo modelo:</p>
<ul><li>o <strong>ator</strong>, que tenta resolver a tarefa;</li><li>o <strong>refletor</strong>, que lê a tentativa e tira uma lição;</li><li>o <strong>curador</strong>, que edita um <strong>playbook</strong>, uma lista de dicas que a próxima tentativa recebe.</li></ul>
<p>O problema: nesse esquema o modelo nunca é treinado para escrever notas melhores. Ele escreve como já sabia.</p>`,
                  tarefa: 'O que o paper propõe juntar?',
                  opcoes: [
                    { t: 'Trocar o RL pelo harness.', por: 'O paper não abandona o RL: ele continua usando a recompensa para mudar o modelo.' },
                    { t: 'O treino pela recompensa e as notas escritas, treinando o modelo também a escrever notas que ajudem.', certa: true },
                    { t: 'Um modelo maior, que escreve notas melhores sem treino.', por: 'O paper treina modelos pequenos, como o Qwen3-0.6B. A ideia é treinar a escrita, não aumentar o modelo.' },
                  ],
                  erro: 'Cada jeito tem o que falta ao outro.',
                  dica: 'O RL muda o modelo, mas só passa um número. O harness passa texto, mas não treina.',
                  solucao: 'Juntar os dois: o RL treina o modelo a agir e também a escrever a experiência que o seu eu futuro vai herdar.',
                  certo: 'Os autores chamam isso de experience-handoff RL: RL com passagem de experiência.',
                },
              ],
            },
            {
              id: 'p2-jogo',
              titulo: 'O jogo da senha',
              porque: 'Um dos quatro testes do paper é o Mastermind, um jogo de adivinhar uma senha de cores. É o jogo que você vai implementar, então vale jogar uma rodada de cabeça.',
              passos: [
                {
                  texto: `<p>Alguém escolhe uma <strong>senha</strong> secreta: uma sequência de cores. Você dá um <strong>palpite</strong> e recebe uma resposta com dois números:</p>
<ul><li><strong>pretos</strong>: quantas cores estão certas e na posição certa;</li><li><strong>brancos</strong>: quantas cores estão na senha, mas em outra posição.</li></ul>
<p>Aqui as senhas têm 3 posições e 4 cores, que vamos chamar de números: 0 é vermelho, 1 é azul, 2 é verde e 3 é amarelo.</p>
<p>Exemplo: a senha é <code>(0, 1, 2)</code> e o palpite é <code>(0, 2, 3)</code>. O 0 está certo e no lugar certo: 1 preto. O 2 está na senha, mas em outro lugar: 1 branco. O 3 não está na senha.</p>`,
                  tarefa: 'A senha é <code>(0, 1, 1)</code> e o palpite é <code>(1, 0, 1)</code>. Quantos pretos e quantos brancos?',
                  campos: [{ rotulo: 'pretos =', resposta: 1 }, { rotulo: 'brancos =', resposta: 2 }],
                  erro: 'Primeiro compare posição por posição. Depois conte as cores que sobraram em comum.',
                  dica: 'Só a terceira posição bate (1 e 1). Sobram, na senha, 0 e 1; no palpite, 1 e 0.',
                  solucao: 'Pretos: a terceira posição, 1 = 1. Brancos: o 0 e o 1 que sobraram estão nos dois, em lugares trocados. Resposta: 1 preto e 2 brancos.',
                },
                {
                  texto: `<p>Cada posição pode ter qualquer uma das 4 cores, e a escolha de uma posição não depende das outras.</p>
<p>Por isso o número de senhas é 4 vezes 4 vezes 4.</p>`,
                  tarefa: 'Quantas senhas diferentes existem?',
                  campos: [{ rotulo: 'senhas =', resposta: 64 }],
                  erro: 'São 3 posições, com 4 escolhas em cada uma.',
                  dica: '4 · 4 · 4.',
                  solucao: '4 · 4 · 4 = 64 senhas.',
                  certo: 'Com 64 senhas e 3 palpites, chutar ao acaso quase nunca acerta. Usar a resposta de cada palpite muda tudo.',
                },
              ],
            },
            {
              id: 'p2-politica',
              titulo: 'Aprender com uma recompensa',
              porque: 'No lugar do modelo de linguagem, o jogo vai ter um modelo de um número só. É o mesmo princípio do RL num LLM, em tamanho que dá para ver inteiro.',
              passos: [
                {
                  texto: `<p>O nosso ator tem um número, <code>a</code>, a sua <strong>confiança</strong>. Em cada palpite, ele decide entre duas coisas:</p>
<ul><li><strong>seguir</strong>: escolher uma senha que combine com tudo o que ele já sabe;</li><li><strong>chutar</strong>: escolher uma senha qualquer.</li></ul>
<p>A chance de seguir é <code>p = 1 / (1 + e<sup>−a</sup>)</code>. Essa função, a <strong>sigmoide</strong>, transforma qualquer número numa probabilidade entre 0 e 1. Quando <code>a = 0</code>, <code>e<sup>0</sup> = 1</code>.</p>`,
                  tarefa: 'Com <code>a = 0</code>, qual é a chance de seguir?',
                  campos: [{ rotulo: 'p =', resposta: 0.5, tol: 0.001 }],
                  erro: 'Troque e elevado a 0 por 1 e faça a conta.',
                  dica: '<code>1 / (1 + 1)</code>.',
                  solucao: 'p = 1 / (1 + 1) = 0,5. Com a = 0, o ator segue em metade dos palpites.',
                },
                {
                  texto: `<p>Aprender, para esse ator, é mudar <code>a</code>. A regra do RL é simples: depois de um jogo, olhe o que o ator fez e o resultado.</p>
<p>Se o jogo deu certo, torne mais provável o que ele fez. Se deu errado, torne menos provável.</p>`,
                  tarefa: 'Num jogo, o ator seguiu nos três palpites e descobriu a senha. Para onde vai <code>a</code>?',
                  opcoes: [
                    { t: 'Sobe: seguir fica mais provável.', certa: true },
                    { t: 'Desce: seguir fica menos provável.', por: 'O jogo deu certo. O RL torna mais provável o que levou ao acerto.' },
                    { t: 'Não muda.', por: 'Um acerto é justamente o que muda o modelo.' },
                  ],
                  erro: 'O que levou ao acerto deve ficar mais provável.',
                  dica: 'p cresce quando a cresce.',
                  solucao: 'Sobe. Seguir levou ao acerto, então a cresce e seguir fica mais provável.',
                  certo: 'Num LLM é igual, só que com bilhões de números no lugar de um: cada palavra escrita numa tentativa que deu certo fica mais provável.',
                },
              ],
            },
            {
              id: 'p2-grupo',
              titulo: 'Comparar dentro do grupo',
              porque: 'O paper usa o GRPO, o jeito de treinar por RL mais usado hoje em LLMs. A peça do GRPO que importa aqui é uma conta curta: comparar cada tentativa com as outras do mesmo grupo.',
              passos: [
                {
                  texto: `<p>O GRPO faz o modelo tentar a mesma tarefa várias vezes. Esse conjunto de tentativas é o <strong>grupo</strong>.</p>
<p>Cada tentativa recebe uma <strong>vantagem</strong>: o quanto ela foi melhor que a média do grupo, dividido pelo desvio padrão (o tamanho típico da diferença para a média):</p>
<p style="font-size:1.1em"><code>A = (r − média) / desvio</code></p>
<p>Vantagem positiva: a tentativa foi melhor que as outras e fica mais provável. Negativa: fica menos provável.</p>`,
                  tarefa: 'Um grupo de 4 tentativas teve recompensas <code>1, 0, 0, 1</code>. A média é 0,5 e o desvio é 0,5. Qual é a vantagem de uma tentativa com 1? E de uma com 0?',
                  campos: [{ rotulo: 'A (recompensa 1) =', resposta: 1, tol: 0.01 }, { rotulo: 'A (recompensa 0) =', resposta: -1, tol: 0.01 }],
                  erro: 'Subtraia a média e divida pelo desvio.',
                  dica: '(1 − 0,5) / 0,5 e (0 − 0,5) / 0,5.',
                  solucao: '(1 − 0,5) / 0,5 = 1 e (0 − 0,5) / 0,5 = −1.',
                },
                {
                  texto: `<p>Agora um grupo em que todas as tentativas falharam: <code>0, 0, 0, 0</code>. A média é 0 e todas ficam exatamente na média.</p>`,
                  tarefa: 'O que o modelo aprende com esse grupo?',
                  opcoes: [
                    { t: 'Que tudo o que fez foi ruim, e muda bastante.', por: 'Todas as vantagens dão 0: nenhuma tentativa foi pior que as outras.' },
                    { t: 'Nada: todas as vantagens são 0.', certa: true },
                    { t: 'Que deve chutar mais.', por: 'Com vantagem 0, nada fica mais nem menos provável.' },
                  ],
                  erro: 'Calcule r − média para cada tentativa.',
                  dica: '0 − 0 = 0.',
                  solucao: 'Nada. Todas as vantagens são 0, então nada muda.',
                  certo: 'Um grupo que falhou inteiro não ensina nada ao GRPO. É aqui que uma boa nota ajuda: se uma tentativa com nota acerta, o grupo passa a ter o que comparar.',
                },
              ],
            },
            {
              id: 'p2-valor',
              titulo: 'Uma nota vale o que ela causa',
              porque: 'Este é o núcleo do paper. Todo o resto (os grupos, o treino) existe para usar esta ideia.',
              passos: [
                {
                  texto: `<p>Como saber se uma nota é boa? Ela pode parecer inteligente e não ajudar em nada, ou parecer simples e resolver o problema.</p>
<p>A resposta do paper: <strong>teste a nota</strong>. Entregue o playbook com a nota, <code>P′</code>, a uma tentativa nova do ator, <code>τ̃</code>, e leia o resultado. A equação (6) do paper:</p>
<p style="font-size:1.1em"><code>V(P′) = R(τ̃)</code></p>
<p>O valor do playbook é a recompensa do jogo novo que o recebeu.</p>`,
                  tarefa: 'Duas notas sobre a mesma tentativa. Com a nota A, o jogo novo acerta a senha. Com a nota B, o jogo novo falha. Quanto vale cada uma?',
                  campos: [{ rotulo: 'V(nota A) =', resposta: 1 }, { rotulo: 'V(nota B) =', resposta: 0 }],
                  erro: 'O valor é a recompensa do jogo que recebeu a nota.',
                  dica: 'Acertar vale 1, falhar vale 0.',
                  solucao: 'V(nota A) = 1 e V(nota B) = 0.',
                  certo: 'O valor não vem de alguém julgando o texto: vem do mundo, do verificador da tarefa. É o mesmo princípio que fez o RL com recompensa verificável funcionar.',
                },
                {
                  texto: `<p>No paper, o refletor escreve uma lição, e o curador transforma essa lição em edições do playbook. Uma lição pode gerar várias edições.</p>
<p>A equação (7) dá a recompensa de cada papel. O curador recebe o valor do playbook que editou. O refletor recebe a <strong>média</strong> dos valores dos playbooks que saíram da sua lição.</p>`,
                  tarefa: 'Uma lição gerou três edições, e os jogos novos deram <code>1, 0, 1</code>. Qual é a recompensa do refletor?',
                  campos: [{ rotulo: 'recompensa =', resposta: 0.667, tol: 0.01 }],
                  erro: 'É a média dos três valores.',
                  dica: '(1 + 0 + 1) / 3.',
                  solucao: '(1 + 0 + 1) / 3 ≈ 0,667.',
                  certo: 'No código, para ficar pequeno, o refletor e o curador vão ser um papel só: a nota já é a edição.',
                },
              ],
            },
            {
              id: 'p2-papeis',
              titulo: 'Cada papel no seu grupo',
              porque: 'A segunda peça do método diz contra quem cada saída é comparada. Parece um detalhe, mas é o que deixa o treino justo com as notas.',
              passos: [
                {
                  texto: `<p>Cada papel tem o seu grupo. As tentativas do ator são comparadas com outras tentativas da mesma tarefa. As notas são comparadas com <strong>outras notas sobre a mesma tentativa</strong>.</p>
<p>Imagine que a tentativa lida pelo refletor foi muito ruim, e mesmo assim ele escreveu uma ótima nota sobre ela: "o vermelho não está na senha".</p>`,
                  tarefa: 'Por que comparar a nota só com outras notas sobre a mesma tentativa?',
                  opcoes: [
                    { t: 'Para a nota não ser julgada pela sorte da tentativa que leu: uma tentativa que falhou ainda pode render uma nota boa.', certa: true },
                    { t: 'Para o treino ficar mais rápido.', por: 'O motivo não é a velocidade, e sim o que cada comparação mede.' },
                    { t: 'Para que todas as notas tenham a mesma recompensa.', por: 'É o contrário: a comparação separa as notas que ajudaram das que não ajudaram.' },
                  ],
                  erro: 'Pense no que seria comparado se a nota competisse com notas de tentativas diferentes.',
                  dica: 'Se as notas de tentativas diferentes competissem, uma nota sobre uma tentativa fácil levaria vantagem só por isso.',
                  solucao: 'Comparando só com notas da mesma tentativa, a vantagem mede a nota, e não a tentativa que ela leu.',
                  certo: 'Agora você conhece o núcleo inteiro: a nota vale o jogo que causa, e cada papel é comparado no seu grupo. Hora de implementar.',
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
          titulo: 'O jogo',
          licoes: [
            ex('p2-feedback', 'A resposta do jogo', 'O primeiro código é o mundo: o jogo e o verificador. No paper, cada tarefa vem com um programa que confere a resposta; aqui, esse programa é a função que responde a um palpite.', {
              texto: `<p>Uma senha e um palpite são <strong>tuplas</strong>: sequências de números entre parênteses, como <code>(0, 1, 1)</code>. A posição <code>i</code> se lê com <code>senha[i]</code>, contando do zero.</p>
<p>Os pretos já estão prontos: o código compara posição por posição.</p>
<p>Para os brancos, primeiro contamos as cores em comum, sem olhar a posição. Para cada cor, ela está em comum o menor número de vezes que aparece nos dois. <code>senha.count(cor)</code> diz quantas vezes a cor aparece na senha, e <code>min(x, y)</code> devolve o menor dos dois. Os brancos são as cores em comum menos os pretos.</p>`,
              tarefa: 'Troque o <code>0</code> da linha marcada pelo número de vezes que a cor está em comum: <code>min(senha.count(cor), palpite.count(cor))</code>.',
              inicio: `def feedback(senha, palpite):
    # pretos: as posições em que a cor é a mesma
    pretos = 0
    for i in range(3):
        if senha[i] == palpite[i]:
            pretos = pretos + 1
    # comuns: para cada cor, o menor número de vezes que ela aparece nos dois
    comuns = 0
    for cor in range(4):
        comuns = comuns + 0   # troque o 0
    brancos = comuns - pretos
    return pretos, brancos

print(feedback((0, 1, 2), (0, 2, 3)))   # devia dar (1, 1)
print(feedback((0, 1, 1), (1, 0, 1)))   # devia dar (1, 2)
`,
              dica: 'A linha fica <code>comuns = comuns + min(senha.count(cor), palpite.count(cor))</code>.',
              solucao: `def feedback(senha, palpite):
    # pretos: as posições em que a cor é a mesma
    pretos = 0
    for i in range(3):
        if senha[i] == palpite[i]:
            pretos = pretos + 1
    # comuns: para cada cor, o menor número de vezes que ela aparece nos dois
    comuns = 0
    for cor in range(4):
        comuns = comuns + min(senha.count(cor), palpite.count(cor))
    brancos = comuns - pretos
    return pretos, brancos

print(feedback((0, 1, 2), (0, 2, 3)))   # devia dar (1, 1)
print(feedback((0, 1, 1), (1, 0, 1)))   # devia dar (1, 2)
`,
              checagem: `
tem('feedback')
casos = [((0, 1, 2), (0, 2, 3), (1, 1)), ((0, 1, 1), (1, 0, 1), (1, 2)), ((0, 1, 2), (0, 1, 2), (3, 0)),
         ((0, 0, 0), (1, 1, 1), (0, 0)), ((0, 1, 2), (2, 0, 1), (0, 3)), ((3, 3, 1), (3, 1, 3), (1, 2))]
for s, p, esperado in casos:
    v = feedback(s, p)
    if v is None:
        falha('A função ainda não devolve nada. Falta o return.')
    if tuple(v) != esperado:
        falha('Para a senha ' + str(s) + ' e o palpite ' + str(p) + ', a resposta devia ser ' + str(esperado) + ', mas deu ' + str(tuple(v)) + '.')
`,
              certo: 'O verificador está pronto. Daqui em diante, o código guarda as respostas numa tabela, FB, para não refazer a conta a cada palpite.',
            }),
            ex('p2-consistentes', 'O que ainda pode ser a senha', 'Jogar bem o Mastermind é guardar o que cada resposta ensina. Uma nota no playbook vai funcionar do mesmo jeito: como mais um fato que corta senhas.', {
              texto: `<p>Daqui em diante, cada senha é chamada pelo seu número na lista <code>SENHAS</code>, de 0 a 63. A tabela <code>FB[s, g]</code> guarda a resposta à senha <code>s</code> para o palpite <code>g</code>, num número só: <code>10 · pretos + brancos</code>. Acertar tudo dá 30.</p>
<p>Um <strong>fato</strong> é um par <code>(g, f)</code>: "o palpite g recebeu a resposta f". Uma senha <code>i</code> ainda é possível se, para cada fato, ela daria a mesma resposta: <code>FB[i, g] == f</code>.</p>
<p>A função percorre as 64 senhas e corta as que contradizem algum fato.</p>`,
              tarefa: 'Troque o <code>False</code> da linha marcada pela condição que corta a senha <code>i</code>: ela daria uma resposta diferente de <code>f</code> ao palpite <code>g</code>.',
              inicio: JOGO + `
def consistentes_devagar(fatos):
    resposta = []
    for i in range(K):
        serve = True
        for g, f in fatos:
            if False:   # troque: a senha i daria outra resposta ao palpite g
                serve = False
        if serve:
            resposta.append(i)
    return resposta

g = SENHAS.index((0, 1, 1))          # o palpite (0, 1, 1)
senha = SENHAS.index((1, 0, 1))      # a senha, que o jogador não conhece
fatos = [(g, FB[senha, g])]
print("senhas possíveis no começo:", len(consistentes_devagar([])))
print("depois de um palpite:", len(consistentes_devagar(fatos)))
`,
              dica: 'A condição é <code>FB[i, g] != f</code> (<code>!=</code> quer dizer "diferente de").',
              solucao: JOGO + `
def consistentes_devagar(fatos):
    resposta = []
    for i in range(K):
        serve = True
        for g, f in fatos:
            if FB[i, g] != f:
                serve = False
        if serve:
            resposta.append(i)
    return resposta

g = SENHAS.index((0, 1, 1))          # o palpite (0, 1, 1)
senha = SENHAS.index((1, 0, 1))      # a senha, que o jogador não conhece
fatos = [(g, FB[senha, g])]
print("senhas possíveis no começo:", len(consistentes_devagar([])))
print("depois de um palpite:", len(consistentes_devagar(fatos)))
`,
              checagem: `
tem('consistentes_devagar')
r = np.random.default_rng(0)
if len(consistentes_devagar([])) != 64:
    falha('Sem nenhum fato, todas as 64 senhas deviam continuar possíveis.')
for _ in range(20):
    s = int(r.integers(K))
    fs = [(int(gg), FB[s, gg]) for gg in r.integers(K, size=2)]
    v = list(consistentes_devagar(fs))
    if s not in v:
        falha('A senha verdadeira foi cortada. Ela combina com todos os fatos e devia ficar.')
    if sorted(v) != list(consistentes(fs)):
        falha('Ficaram senhas que contradizem algum fato. A condição corta a senha quando FB[i, g] é diferente de f.')
`,
              certo: 'Um único palpite cortou a maioria das senhas. O código dos próximos passos usa a mesma função, escrita com numpy para ficar rápida: consistentes(fatos).',
            }),
          ],
        },
        {
          titulo: 'O ator',
          licoes: [
            ex('p2-jogar', 'Uma tentativa', 'O ator é o modelo que joga. No paper, é um LLM escrevendo palpites; aqui, é a confiança a decidindo entre seguir o que já se sabe e chutar.', {
              texto: `<p>A função <code>jogar(senha, playbook, a, rng)</code> faz uma tentativa de até 3 palpites. Em cada palpite:</p>
<ul><li><code>cand</code> são as senhas que combinam com o que o ator já sabe: as respostas desta tentativa e os fatos do playbook;</li><li><code>s</code> é a decisão de seguir, com chance <code>p</code>;</li><li>se segue, o palpite devia ser uma das senhas de <code>cand</code>; se não, um número qualquer de 0 a 63.</li></ul>
<p><code>rng</code> é o sorteador. <code>rng.integers(K)</code> sorteia um número de 0 a K − 1, e <code>rng.choice(lista)</code> sorteia um elemento da lista.</p>
<p>A função devolve três coisas: a recompensa, o histórico de fatos e a lista do que o ator decidiu em cada palpite.</p>`,
              tarefa: 'Na linha marcada, quando o ator segue, o palpite deve ser sorteado entre os candidatos. Troque <code>rng.integers(K)</code> por <code>rng.choice(cand)</code>.',
              inicio: JOGO + `
TURNOS = 3

def jogar(senha, playbook, a, rng):
    p = 1 / (1 + np.exp(-a))
    historico, seguiu = [], []
    for _ in range(TURNOS):
        cand = consistentes(historico + playbook)
        s = rng.random() < p
        seguiu.append(s)
        if s and len(cand) > 0:
            g = rng.integers(K)   # troque: um palpite sorteado entre os candidatos
        else:
            g = rng.integers(K)
        f = FB[senha, g]
        historico.append((g, f))
        if f == GANHOU:
            return 1.0, historico, seguiu
    return 0.0, historico, seguiu

def taxa(a, jogos=400):
    rng = np.random.default_rng(1)
    return np.mean([jogar(rng.integers(K), [], a, rng)[0] for _ in range(jogos)])

for a in [-5, 0, 5]:
    print(f"a = {a:2d}   acerta {taxa(a):.0%} das senhas")
`,
              dica: 'A linha fica <code>g = rng.choice(cand)</code>.',
              solucao: JOGO + `
TURNOS = 3

def jogar(senha, playbook, a, rng):
    p = 1 / (1 + np.exp(-a))
    historico, seguiu = [], []
    for _ in range(TURNOS):
        cand = consistentes(historico + playbook)
        s = rng.random() < p
        seguiu.append(s)
        if s and len(cand) > 0:
            g = rng.choice(cand)
        else:
            g = rng.integers(K)
        f = FB[senha, g]
        historico.append((g, f))
        if f == GANHOU:
            return 1.0, historico, seguiu
    return 0.0, historico, seguiu

def taxa(a, jogos=400):
    rng = np.random.default_rng(1)
    return np.mean([jogar(rng.integers(K), [], a, rng)[0] for _ in range(jogos)])

for a in [-5, 0, 5]:
    print(f"a = {a:2d}   acerta {taxa(a):.0%} das senhas")
`,
              checagem: `
tem('jogar')
alto, baixo = taxa(8), taxa(-8)
if alto < 0.35:
    falha('Com a confiança alta (a = 8), o ator devia acertar boa parte das senhas, e acertou ' + str(round(100 * alto)) + '%. Quando ele segue, o palpite tem de vir de cand.')
if baixo > 0.15:
    falha('Com a confiança baixa, o ator devia chutar quase sempre e acertar pouco.')
`,
              certo: 'Chutando, o ator quase nunca acerta em 3 palpites. Seguindo o que sabe, acerta perto de metade. Falta o resto, e é aí que uma nota da tentativa anterior pode ajudar.',
            }),
            ex('p2-vantagens', 'A vantagem em código', 'A conta do GRPO que você fez à mão, agora como função. Ela vai servir para os dois papéis: o ator e o refletor.', {
              texto: `<p>Com numpy, uma conta feita com uma lista vale para todos os elementos de uma vez. Se <code>r</code> é <code>np.array([1, 0, 0, 1])</code>, então <code>r.mean()</code> é a média, <code>r.std()</code> é o desvio padrão e <code>r - r.mean()</code> subtrai a média de cada elemento.</p>
<p>Somamos um número bem pequeno, <code>1e-6</code>, ao desvio. Assim um grupo todo igual, com desvio 0, não vira uma divisão por zero.</p>`,
              tarefa: 'Complete <code>vantagens(r)</code> com a conta <code>(r − média) / (desvio + 1e-6)</code>.',
              inicio: `import numpy as np

def vantagens(r):
    r = np.asarray(r, float)
    return r - r   # troque pela conta da vantagem

print(vantagens([1, 0, 0, 1]))   # devia dar perto de [ 1 -1 -1  1]
print(vantagens([0, 0, 0, 0]))   # devia dar [0 0 0 0]
print(vantagens([1, 1, 1, 0]))
`,
              dica: '<code>return (r - r.mean()) / (r.std() + 1e-6)</code>.',
              solucao: `import numpy as np

def vantagens(r):
    r = np.asarray(r, float)
    return (r - r.mean()) / (r.std() + 1e-6)

print(vantagens([1, 0, 0, 1]))   # devia dar perto de [ 1 -1 -1  1]
print(vantagens([0, 0, 0, 0]))   # devia dar [0 0 0 0]
print(vantagens([1, 1, 1, 0]))
`,
              checagem: `
tem('vantagens')
v = np.asarray(vantagens([1, 0, 0, 1]), float)
if not np.allclose(v, [1, -1, -1, 1], atol=1e-3):
    falha('Para [1, 0, 0, 1], as vantagens deviam ser perto de [1, -1, -1, 1].')
if not np.allclose(np.asarray(vantagens([0, 0, 0, 0]), float), 0):
    falha('Um grupo todo igual devia dar vantagem 0 para todos.')
if not np.allclose(np.asarray(vantagens([1, 1, 1, 0]), float), [0.57735, 0.57735, 0.57735, -1.73205], atol=1e-3):
    falha('Para [1, 1, 1, 0], confira se dividiu pelo desvio padrão.')
`,
              certo: 'No grupo [1, 1, 1, 0], a única falha recebe uma vantagem bem negativa: quando quase todos acertam, errar é o que mais chama atenção.',
            }),
          ],
        },
        {
          titulo: 'A nota',
          licoes: [
            ex('p2-valor-codigo', 'Testar a nota', 'Este é o núcleo do paper em código: a equação (6). Uma nota não é julgada pelo texto; ela é entregue a um jogo novo, e o resultado do jogo é o seu valor.', {
              texto: `<p>Depois de uma tentativa, o refletor escreve uma nota. Aqui ele tem três tipos para escolher:</p>
<ul><li><strong>lição</strong>: um palpite da tentativa e a resposta que ele recebeu, um fato verdadeiro;</li><li><strong>chute</strong>: um palpite qualquer com uma resposta inventada, quase sempre falso;</li><li><strong>vazia</strong>: não escreve nada.</li></ul>
<p>No paper, o refletor é um LLM e escreve texto livre. Os três tipos guardam o essencial: há notas que ajudam, notas que atrapalham e notas que não fazem diferença.</p>
<p>Uma nota é uma lista de fatos, então ela entra direto como playbook de uma tentativa nova: <code>jogar(senha, nota, a, rng)</code>.</p>`,
              tarefa: 'Complete <code>valor_da_nota</code>: o valor é a recompensa de um jogo novo com a nota no playbook, o primeiro dos três valores que <code>jogar</code> devolve.',
              inicio: JOGO + ATOR + NOTA + `
def valor_da_nota(senha, nota, a, rng):
    return 0.0   # troque: a recompensa de um jogo novo com a nota no playbook

rng = np.random.default_rng(3)
a = 2.0
medias = {}
for tipo in range(3):
    valores = []
    for _ in range(400):
        senha = rng.integers(K)
        _, historico, _ = jogar(senha, [], a, rng)        # a tentativa que o refletor lê
        nota = escrever_nota(tipo, historico, rng)
        valores.append(valor_da_nota(senha, nota, a, rng))
    medias[TIPOS[tipo]] = np.mean(valores)
    print(f"{TIPOS[tipo]:6s}  vale em média {medias[TIPOS[tipo]]:.2f}")
`,
              dica: '<code>return jogar(senha, nota, a, rng)[0]</code>.',
              solucao: JOGO + ATOR + NOTA + `
def valor_da_nota(senha, nota, a, rng):
    return jogar(senha, nota, a, rng)[0]

rng = np.random.default_rng(3)
a = 2.0
medias = {}
for tipo in range(3):
    valores = []
    for _ in range(400):
        senha = rng.integers(K)
        _, historico, _ = jogar(senha, [], a, rng)        # a tentativa que o refletor lê
        nota = escrever_nota(tipo, historico, rng)
        valores.append(valor_da_nota(senha, nota, a, rng))
    medias[TIPOS[tipo]] = np.mean(valores)
    print(f"{TIPOS[tipo]:6s}  vale em média {medias[TIPOS[tipo]]:.2f}")
`,
              checagem: `
tem('medias')
if medias['lição'] < 0.5:
    falha('A lição devia valer bem mais que 0. O valor é jogar(senha, nota, a, rng)[0].')
if not medias['lição'] > medias['vazia'] > medias['chute']:
    falha('Esperava a ordem: lição, depois vazia, depois chute.')
`,
              certo: 'O teste separou as notas sozinho: a lição quase dobra a chance de acertar, e o chute é pior do que não escrever nada, porque um fato falso corta a senha verdadeira.',
            }),
            ex('p2-rsi', 'Passar a experiência adiante', 'O paper mede o modelo com o RSI@k: a chance de resolver a tarefa em até k tentativas, com o playbook passando de uma tentativa para a outra. É a medida do auto-aperfeiçoamento.', {
              texto: `<p>O RSI@3 joga até 3 tentativas com a mesma senha. Depois de cada tentativa que falha, o refletor escreve uma nota, e a nota se junta ao playbook da próxima.</p>
<p>O refletor escolhe o tipo de nota com as preferências <code>w</code>, três números. A função <code>softmax(w)</code> os transforma em três probabilidades que somam 1; quanto maior o número, mais provável o tipo.</p>
<p>Duas listas se juntam com <code>+</code>: <code>[1, 2] + [3]</code> dá <code>[1, 2, 3]</code>.</p>`,
              tarefa: 'Na linha marcada, junte a nota nova ao playbook: <code>playbook = playbook + escrever_nota(tipo, h, rng)</code>.',
              inicio: JOGO + ATOR + NOTA + `
def rsi_3(a, w, n=300):
    rng = np.random.default_rng(7)
    acertos = 0
    for _ in range(n):
        senha = rng.integers(K)
        playbook = []
        for tentativa in range(3):
            r, h, _ = jogar(senha, playbook, a, rng)
            if r == 1:
                acertos += 1
                break
            tipo = rng.choice(3, p=softmax(w))
            playbook = playbook   # troque: junte a nota desta tentativa ao playbook
    return acertos / n

a = 0.0
so_licoes = np.array([9.0, 0.0, 0.0])   # o refletor quase sempre escreve lições
sem_notas = np.array([0.0, 0.0, 9.0])   # o refletor quase nunca escreve nada
com = rsi_3(a, so_licoes)
sem = rsi_3(a, sem_notas)
print(f"RSI@3 com lições: {com:.2f}")
print(f"RSI@3 sem notas:  {sem:.2f}")
`,
              dica: 'A linha fica <code>playbook = playbook + escrever_nota(tipo, h, rng)</code>.',
              solucao: JOGO + ATOR + NOTA + `
def rsi_3(a, w, n=300):
    rng = np.random.default_rng(7)
    acertos = 0
    for _ in range(n):
        senha = rng.integers(K)
        playbook = []
        for tentativa in range(3):
            r, h, _ = jogar(senha, playbook, a, rng)
            if r == 1:
                acertos += 1
                break
            tipo = rng.choice(3, p=softmax(w))
            playbook = playbook + escrever_nota(tipo, h, rng)
    return acertos / n

a = 0.0
so_licoes = np.array([9.0, 0.0, 0.0])   # o refletor quase sempre escreve lições
sem_notas = np.array([0.0, 0.0, 9.0])   # o refletor quase nunca escreve nada
com = rsi_3(a, so_licoes)
sem = rsi_3(a, sem_notas)
print(f"RSI@3 com lições: {com:.2f}")
print(f"RSI@3 sem notas:  {sem:.2f}")
`,
              checagem: `
tem('com')
tem('sem')
if not com > sem + 0.1:
    falha('Com lições, o RSI@3 devia ficar bem acima de sem notas. Confira se a nota entra no playbook.')
`,
              certo: 'Mesmo com um ator fraco, as lições fazem cada tentativa começar de onde a anterior parou. Até aqui, porém, w foi escolhido à mão. Falta o refletor aprender a escrever lições sozinho.',
            }),
          ],
        },
        {
          titulo: 'Treinar',
          licoes: [
            ex('p2-treino', 'O passo de treino do ACE-RL', 'Agora o método inteiro: o ator e o refletor aprendem juntos, cada um no seu grupo, a partir da recompensa do jogo e de nada mais. É o Algoritmo 1 do paper, em miniatura.', {
              texto: `<p>Leia <code>passo_de_treino</code> de cima para baixo; ele segue o Algoritmo 1 do paper:</p>
<ul><li>o ator tenta a senha 4 vezes;</li><li>o refletor lê uma dessas tentativas e escreve 4 notas sobre ela;</li><li>cada nota é testada num jogo novo (o passo anterior);</li><li>o grupo do ator são os 8 jogos, e o grupo do refletor são as 4 notas.</li></ul>
<p>As preferências do refletor mudam com <code>np.eye(3)[k] - softmax(w)</code>: isso aumenta o tipo <code>k</code> que foi escrito e diminui os outros. Multiplicado pela vantagem, o tipo de uma nota que ajudou fica mais provável.</p>
<p>O começo é fraco de propósito: <code>a = −1</code> (o ator segue pouco) e <code>w = [0, 1, 1]</code> (o refletor prefere chutes e notas vazias), como um modelo que nunca foi treinado para isso.</p>`,
              tarefa: 'Na linha marcada, calcule as vantagens das 4 notas: <code>Ar = vantagens([j[0] for j in novos])</code>. <code>novos</code> são os jogos novos, um por nota, e <code>j[0]</code> é a recompensa de cada um.',
              inicio: JOGO + ATOR + NOTA + treino(REFLETOR_VAZIO) + DOIS_TREINOS + `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.plot(curva1, label="GRPO: só o ator aprende")
plt.plot(curva2, label="ACE-RL: o refletor também")
plt.xlabel("passo de treino")
plt.ylabel("chance de escrever uma lição")
plt.ylim(0, 1)
plt.legend()
print(f"GRPO:   a = {a1:.2f}   chance de lição = {curva1[-1]:.2f}")
print(f"ACE-RL: a = {a2:.2f}   chance de lição = {curva2[-1]:.2f}")
`,
              dica: 'A linha fica <code>        Ar = vantagens([j[0] for j in novos])</code>, com os mesmos 8 espaços de recuo.',
              solucao: JOGO + ATOR + NOTA + TREINO + DOIS_TREINOS + `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.plot(curva1, label="GRPO: só o ator aprende")
plt.plot(curva2, label="ACE-RL: o refletor também")
plt.xlabel("passo de treino")
plt.ylabel("chance de escrever uma lição")
plt.ylim(0, 1)
plt.legend()
print(f"GRPO:   a = {a1:.2f}   chance de lição = {curva1[-1]:.2f}")
print(f"ACE-RL: a = {a2:.2f}   chance de lição = {curva2[-1]:.2f}")
`,
              checagem: `
tem('curva2')
if curva2[-1] < 0.8:
    falha('No ACE-RL, a chance de escrever uma lição devia passar de 0,8 no fim do treino. As vantagens das notas vêm das recompensas dos jogos novos.')
`,
              certo: 'Ninguém disse ao refletor que lições são boas. Ele descobriu sozinho, porque as notas foram julgadas pelo jogo que causaram. No GRPO, o refletor fica como começou.',
            }),
            ex('p2-numero', 'O número do paper', 'Reproduzir é refazer a comparação principal. A Tabela 2 do paper compara, no mesmo harness e com o mesmo custo de treino, o ACE-RL com o GRPO que só treina o ator.', {
              texto: `<p>No Mastermind com Qwen3-0.6B, a Tabela 2 do paper dá RSI@3 de 0,739 para o GRPO e 0,775 para o ACE-RL. Os dois são avaliados com o playbook, e no GRPO o refletor escreve como o modelo não treinado escreveria.</p>
<p>Aqui o jogo e o modelo são outros, então o número não vai ser o mesmo. O que se reproduz é a forma: treinar a escrita das notas melhora o RSI@3.</p>
<p>A função <code>rsi(a, w)</code> já está pronta: é a do passo anterior, para qualquer número de tentativas.</p>`,
              tarefa: 'Guarde em <code>rsi_grpo</code> o RSI@3 do modelo treinado com GRPO (<code>a1, w1</code>) e em <code>rsi_ace</code> o do ACE-RL (<code>a2, w2</code>).',
              inicio: JOGO + ATOR + NOTA + TREINO + DOIS_TREINOS + `
rsi_grpo = 0   # troque
rsi_ace = 0    # troque

print(f"RSI@3   GRPO: {rsi_grpo:.2f}   ACE-RL: {rsi_ace:.2f}")
`,
              dica: '<code>rsi_grpo = rsi(a1, w1)</code> e <code>rsi_ace = rsi(a2, w2)</code>.',
              solucao: JOGO + ATOR + NOTA + TREINO + DOIS_TREINOS + `
rsi_grpo = rsi(a1, w1)
rsi_ace = rsi(a2, w2)

print(f"RSI@3   GRPO: {rsi_grpo:.2f}   ACE-RL: {rsi_ace:.2f}")
`,
              checagem: `
tem('rsi_grpo')
tem('rsi_ace')
if rsi_grpo == 0 or rsi_ace == 0:
    falha('Calcule os dois com a função rsi.')
if not rsi_ace > rsi_grpo + 0.1:
    falha('O ACE-RL devia ficar acima do GRPO. Confira se usou a2, w2 para o ACE-RL.')
`,
              certo: 'A forma se reproduziu: com o mesmo ator e a mesma recompensa, aprender a escrever a experiência rende mais. A diferença aqui é maior que no paper porque, neste jogo, uma nota boa é um fato exato.',
            }),
            ex('p2-pergunta', 'Uma pergunta própria: a nota foi internalizada?', 'O paper sempre avalia com o playbook presente. Uma pergunta que ele não faz, e que é a de Vygotsky: a fala que guia de fora vira fala interna? Depois de treinar com notas, o ator joga melhor sem elas?', {
              texto: `<p>Para Vygotsky, uma criança primeiro é guiada pela fala de outra pessoa, depois fala sozinha em voz alta para se guiar (a fala privada), e por fim essa fala vira pensamento (a fala interna). A ajuda de fora acaba dentro.</p>
<p>O ACE-RL treina algo parecido com a fala privada: o modelo escreve para se guiar depois. A pergunta é se algo disso fica no próprio ator.</p>
<p>O teste: jogar <strong>uma</strong> tentativa só, sem playbook (<code>tentativas=1</code>), com o ator do GRPO e com o do ACE-RL. Se o ACE-RL internalizou as notas, o ator dele joga melhor sozinho.</p>`,
              tarefa: 'Guarde em <code>sozinho_grpo</code> e <code>sozinho_ace</code> a taxa de acerto com uma tentativa só: <code>rsi(a1, w1, tentativas=1)</code> e o mesmo para o ACE-RL.',
              inicio: JOGO + ATOR + NOTA + TREINO + DOIS_TREINOS + `
sozinho_grpo = 0   # troque
sozinho_ace = 0    # troque

print(f"Uma tentativa, sem playbook   GRPO: {sozinho_grpo:.2f}   ACE-RL: {sozinho_ace:.2f}")
print(f"Três tentativas, com notas    GRPO: {rsi(a1, w1):.2f}   ACE-RL: {rsi(a2, w2):.2f}")
`,
              dica: '<code>sozinho_grpo = rsi(a1, w1, tentativas=1)</code> e <code>sozinho_ace = rsi(a2, w2, tentativas=1)</code>.',
              solucao: JOGO + ATOR + NOTA + TREINO + DOIS_TREINOS + `
sozinho_grpo = rsi(a1, w1, tentativas=1)
sozinho_ace = rsi(a2, w2, tentativas=1)

print(f"Uma tentativa, sem playbook   GRPO: {sozinho_grpo:.2f}   ACE-RL: {sozinho_ace:.2f}")
print(f"Três tentativas, com notas    GRPO: {rsi(a1, w1):.2f}   ACE-RL: {rsi(a2, w2):.2f}")
`,
              checagem: `
tem('sozinho_grpo')
tem('sozinho_ace')
if sozinho_grpo == 0 or sozinho_ace == 0:
    falha('Calcule os dois com rsi(..., tentativas=1).')
if abs(sozinho_ace - rsi(a2, w2, tentativas=1)) > 1e-9:
    falha('Para o ACE-RL, use a2 e w2.')
`,
              certo: 'Sozinhos, os dois atores ficam perto (0,44 e 0,50), bem longe da diferença com as notas (0,75 e 1,00). A pequena vantagem do ACE-RL não é nota guardada: o ator dele tem a confiança um pouco maior, porque os jogos com nota acertam mais e deixam os grupos com mais o que comparar. As notas em si não passam para o ator, e nem poderiam: ele tem um número só, e as notas falam de senhas. Num LLM, ator e refletor são o mesmo modelo, com os mesmos pesos, e a pergunta fica aberta. Testar se as notas viram fala interna é um experimento que o paper não fez.',
            }),
          ],
        },
      ],
    },
  ],
}
