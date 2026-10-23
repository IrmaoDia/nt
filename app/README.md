# Calculadora Ceia Sem Erro

Aplicativo web que acompanha o ebook **Ceia Sem Erro**. A compradora monta a mesa com qualquer cardápio, ajusta qualquer receita para o número de pessoas, anota os preços do mercado dela e vê o custo total da ceia.

- 100% estático: não tem servidor, login nem banco de dados.
- O que a usuária digita fica salvo só no aparelho dela.
- Pode ser instalado na tela inicial do celular e funciona sem internet depois do primeiro acesso.
- Não aparece no Google (`noindex`), porque o link é só para compradoras.

Feito com Vite, React, TypeScript e Tailwind CSS. Os testes usam Vitest.

## Como o app funciona

O app tem 4 abas embaixo: **Mesa | Ajustar Receita | Custo | Forno**.

- **Mesa:** ela informa quantas pessoas vão à ceia e monta a mesa com pratos de qualquer **tipo** (carne com osso, arroz, sobremesa…). A quantidade depende do tipo, não da receita. Há um atalho para usar um dos 3 cardápios prontos do guia.
- **Ajustar Receita:** ela cola ou digita qualquer receita, e o app recalcula para o número de pessoas que ela quiser. As receitas podem ser salvas e mandadas para a lista de compras.
- **Custo:** junta os pratos da Mesa, os ingredientes das receitas e os itens que ela adicionar. Ela anota os preços e vê o total da ceia e o custo por pessoa.
- **Forno:** temperatura e tempo por peso da carne.

---

## 1. Como rodar no computador

É preciso ter o [Node.js](https://nodejs.org) 18 ou mais novo instalado.

```bash
npm install        # só na primeira vez
npm run dev        # abre em http://localhost:5173
```

| Comando | Para que serve |
| --- | --- |
| `npm test` | Roda os testes (Mesa, interpretador de receitas, lista de compras e dados) |
| `npm run build` | Gera a versão de publicação na pasta `dist/` |
| `npm run preview` | Abre a versão de publicação, com o modo offline ligado, em http://localhost:4173 |
| `npm run gerar:json` | Atualiza `docs/consumo-por-pessoa.json` depois de mudar os dados |

Para ver como fica no celular, abra no Chrome, aperte **F12** e depois **Ctrl+Shift+M**, e escolha uma largura de 375 px.

---

## 2. Como editar o consumo por pessoa (`src/data/tiposDePrato.ts`)

Cada **tipo de prato** diz quanto uma pessoa adulta consome. O arquivo tem um comentário explicando cada campo. Exemplo:

```ts
{
  id: 'carne-com-osso',        // código interno: não mude depois de publicar
  nome: 'Carne com osso',      // como aparece no app
  icone: '🍖',
  grupo: 'Carnes',             // usado na regra de divisão (abaixo)
  categoria: 'Carnes',         // seção da lista de compras
  porPessoa: 400,              // 400 g de carne crua por pessoa
  unidade: 'g',                // 'g', 'ml', 'porcao' ou 'unidade'
  exibicao: 'crua',            // palavra depois da quantidade: "3,5 kg crua"
  arredondamento: 100,         // arredonda para cima de 100 em 100 g
  exemplos: 'pernil, costela, frango inteiro, chester, peru',
},
```

Exemplos de mudanças:

- **Mudar quanto cada pessoa come:** troque o número de `porPessoa`. Use ponto como separador decimal (`0.125`, e não `0,125`).
- **Mudar a embalagem:** em `embalagem`, `tamanho` fica na mesma unidade do tipo. Por exemplo, pacote de 1 kg = `tamanho: 1000`.
- **Contar só adultos** (bebida alcoólica): `soAdultos: true`.
- **Novo tipo de prato:** copie um bloco, troque o `id` por um código novo e ajuste os valores. Ele aparece sozinho no seletor da Mesa.

### Regra de divisão

Quem tem pernil **e** chester na mesa não come 400 g de cada: come um pouco de cada um. Por isso, quando há mais de um prato do mesmo **grupo** (Carnes, Acompanhamentos, Saladas, Sobremesas ou Bebidas):

1. o consumo do grupo aumenta 15% para cada prato a mais;
2. esse total é dividido entre os pratos, na proporção do `porPessoa` de cada tipo.

Na prática, cada prato fica com `porPessoa × (1 + 0,15 × (pratos no grupo − 1)) ÷ pratos no grupo`. Exemplo: pernil + chester = 400 × 1,15 ÷ 2 = **230 g de cada** por pessoa.

O valor de 15% fica em `AUMENTO_POR_PRATO_EXTRA`, no mesmo arquivo. Para tirar um tipo da divisão, mude o `grupo` dele.

### Outras regras

- Crianças de até 10 anos contam como meia porção.
- Apetite da turma: Leve ×0,85, Normal ×1 e Bem servido ×1,2.

## 3. Outros arquivos de dados

- **`src/data/cardapios.ts`:** os 3 cardápios prontos do guia. Cada prato tem um tipo e uma receita-base para 10 pessoas, escrita como num caderno ("2 dentes de alho", "sal a gosto"). Essa receita aparece já recalculada quando a usuária toca em "Ajustar a receita deste prato".
- **`src/data/trocas.ts`:** os textos do card "Trocas que economizam".
- **`src/data/forno.ts`:** a tabela de forno, com os mesmos tempos do ebook.

Depois de editar qualquer um deles, rode:

```bash
npm run gerar:json   # atualiza docs/consumo-por-pessoa.json
npm test             # confere se está tudo certo
```

O teste avisa se um prato do guia apontar para um tipo que não existe, se alguma linha de receita não for entendida ou se o JSON estiver desatualizado.

## 4. O que o "Ajustar Receita" entende

Uma linha por ingrediente, em português:

- **Números:** `2`, `2,5`, `1/2`, `½`, `1 1/2`, `1 e 1/2`, `1 e meia`, `meia`, `uma`, `2 a 3` (usa o maior) e `1 dúzia`.
- **Unidades:** `kg`, `quilo`, `g`, `gramas`, `ml`, `l`, `litro`, `xícara`, `xíc.`, `xícara (chá)`, `colher de sopa`, `colher (sopa)`, `c.s.`, `colher de chá`, `c.c.`, `unidade`, `dente`, `lata`, `caixinha`, `pacote`, `sachê` e `pitada`.
- **Sem quantidade:** linhas como `sal a gosto` ou `azeite para regar`.
- **Partes de um ingrediente:** linhas como `Suco de 2 limões`.

Linhas que terminam em ":" (como "Massa:") são ignoradas, e a leitura para no "Modo de preparo".

Ao recalcular:

- Xícaras e colheres viram frações de cozinha (¼, ⅓, ½, ⅔, ¾).
- Ovos e unidades são arredondados para cima.
- Gramas e mililitros ficam em múltiplos de 10; abaixo de 10 g ou 10 ml, de 1 em 1.
- Acima de 1000 g, aparece em kg.
- "A gosto" e "pitada" não mudam.

---

## 5. Como publicar na Vercel

### Opção A: pelo site, sem usar o terminal

1. Crie uma conta grátis em [vercel.com](https://vercel.com) (pode entrar com o GitHub).
2. Envie esta pasta `app` para um repositório no GitHub.
3. Na Vercel, clique em **Add New… → Project**, escolha o repositório e clique em **Import**.
4. Se o repositório tiver outras pastas, em **Root Directory** escolha `app`.
5. Confira e clique em **Deploy**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Em cerca de 1 minuto você recebe o link. Esse é o link que vai na área de membros da Hotmart.

Depois disso, cada alteração enviada ao GitHub publica uma versão nova automaticamente.

### Opção B: pelo terminal

```bash
npm install -g vercel
vercel           # na primeira vez, faz login e cria o projeto
vercel --prod    # publica
```

O `vercel.json` já configura o `noindex`, o `sw.js` sem cache (para o modo offline se atualizar) e o cache longo dos arquivos com nome versionado.

### Depois de publicar

- Abra o link no celular e use **Adicionar à tela inicial** (no Chrome, fica no menu ⋮; no iPhone, no botão de compartilhar do Safari).
- Para conferir o modo offline: abra o app uma vez, ative o modo avião e abra de novo.

---

## Estrutura

```
src/data/tiposDePrato.ts   ← consumo por pessoa de cada tipo de prato
src/data/cardapios.ts      ← cardápios prontos do guia (atalhos da Mesa)
src/data/trocas.ts         ← card "Trocas que economizam"
src/data/forno.ts          ← tabela de forno
src/lib/mesa.ts            ← cálculo da Mesa e regra de divisão
src/lib/receita.ts         ← interpretador de ingredientes e recálculo
src/lib/custo.ts           ← lista de compras, soma de itens e custo
src/lib/*.test.ts          ← testes
src/telas/                 ← abas Mesa, Ajustar Receita, Custo e Forno
docs/consumo-por-pessoa.json ← os mesmos dados, para escrever o ebook
pwa/sw-modelo.js           ← modo offline (o build gera o dist/sw.js)
```
