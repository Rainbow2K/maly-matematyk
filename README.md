# ∑ Mały Matematyk

### Mały model. Bezbłędne rachunki.

Wpisz zadanie z matematyki albo fizyki. Model AI mniejszy niż zdjęcie z telefonu zamienia je na równanie, a precyzyjny solver podaje wynik i sam go sprawdza. Wszystko działa w przeglądarce: offline, prywatnie i bez kosztów za API.

**[Otwórz aplikację](https://rainbow2k.github.io/maly-matematyk/)** · **[Benchmark](https://rainbow2k.github.io/maly-matematyk/bench.html)** · **[Prezentacja](https://rainbow2k.github.io/maly-matematyk/slides.html)**

Zadanie eliminacyjne Local AI (BEST Gdańsk), drużyna Proszek do Pieczenia.

| | |
|---|---|
| **od 135M parametrów** | tyle wystarczy, żeby rozwiązywać zadania z fizyki |
| **0 zł** | żadnego API, żadnej chmury |
| **0 bajtów** | danych wysłanych na serwer |

## Pomysł

Małe modele (100M–1.5B parametrów) całkiem nieźle *rozumieją* treść zadania, ale fatalnie *liczą*. Mylą się w mnożeniu, gubią pierwiastki, zmyślają wynik. Zamiast dokładać parametry, rozdzielamy pracę:

1. **LLM jako tłumacz.** Model dostaje zadanie (równanie albo zadanie tekstowe z fizyki) i ma oddać jedną linię: `EQ: <lewa strona> = <prawa strona>` z jedną niewiadomą `x`. Nic nie liczy. To zwykle 10–30 tokenów.
2. **Solver liczy.** Deterministyczny solver numeryczny (parser mathjs + przeszukiwanie siatki + bisekcja) znajduje wszystkie pierwiastki rzeczywiste i wybiera ten, o który pyta zadanie (np. dodatni czas).
3. **Weryfikacja i feedback.** Solver sprawdza wynik przez podstawienie (residuum). Jeśli równanie się nie parsuje, ma nieznane symbole albo nie ma rozwiązania, błąd wraca do modelu jako wiadomość i model poprawia równanie (maks. 2 poprawki, z samplingiem).

To ten sam kierunek, w którym idzie „AI dla matematyki i fizyki”: sieć proponuje kandydatów, a twarda matematyka ich sprawdza (np. *Discovery of Unstable Singularities*, Google DeepMind 2025, gdzie PINN-y znajdują kandydatów na osobliwości w równaniach płynów, a dowód komputerowy je weryfikuje). Tu w skali mikro: model 135M zamiast 1.5B.

Całość działa **lokalnie w przeglądarce**: transformers.js (ONNX Runtime Web), WebGPU albo WASM na CPU, kwantyzacja 4-bit. Bez serwera, bez API, bez wysyłania danych.

## Wyniki

Pomiar: Chrome, WebGPU, wagi 4-bit (q4f16), 34 zadania (12 równań, 22 zadania z fizyki), trafienie = błąd względny ≤ 1%. Surowe dane: [`results/wyniki_135M.csv`](results/wyniki_135M.csv).

**SmolLM2 135M**

| | Samo AI (chain-of-thought) | AI + solver |
|---|---|---|
| Równania | 1/12 (8%) | **4/12 (33%)** |
| Fizyka (zadania tekstowe) | 1/22 | 0/22 |
| Śr. tokenów na równanie | 252 | **27** |
| Mediana czasu na równanie | 25 s | **6 s** |

Na równaniach ten sam model 135M trafia 4× częściej, generuje 9× mniej tokenów i odpowiada 4× szybciej. Zadania tekstowe z fizyki są dla 135M za trudne do przetłumaczenia na równanie: model wpisuje wynik zamiast równania albo myli wielkości. Następny krok to te same pomiary dla SmolLM2 360M i Qwen2.5 0.5B (benchmark jest gotowy w `bench.html`).

## Jak uruchomić

Najprościej: otwórz https://rainbow2k.github.io/maly-matematyk/ w Chrome lub Edge (WebGPU). Model pobiera się raz i zostaje w cache przeglądarki.

Lokalnie:

```bash
git clone https://github.com/Rainbow2K/maly-matematyk
cd maly-matematyk
python3 -m http.server 8000   # potem http://localhost:8000
```

Testy solvera i agenta (Node, bez modelu):

```bash
npm install
node tests/test_solver.mjs   # wzorcowe równania: 34/34
node tests/test_agent.mjs    # pętla błąd → feedback → poprawka
```

## Struktura

| Plik | Co robi |
|---|---|
| `js/solver.js` | Ekstrakcja równania z odpowiedzi modelu, walidacja (tylko `x`, liczby i dozwolone funkcje), szukanie pierwiastków, wybór rozwiązania, residuum |
| `js/agent.js` | Dwie strategie: `solveDirect` (model liczy sam, chain-of-thought) i `solveWithSolver` (model tłumaczy, solver liczy, błędy wracają jako feedback) |
| `js/llm.js` | Ładowanie modeli przez transformers.js, WebGPU/WASM |
| `js/problems.js` | 34 zadania z odpowiedziami (12 równań, 22 z fizyki) + wzorcowe równania do testów |
| `index.html` | Demo: wpisz zadanie, zobacz równanie modelu, kroki solvera i wynik |
| `bench.html` | Benchmark: wszystkie modele × oba tryby, tabela + JSON |
| `results/` | Surowe wyniki benchmarku |

## Ograniczenia

- Zadania są po angielsku, bo modele tej wielkości słabo znają polski.
- Jedna niewiadoma. Układy równań i zadania wieloetapowe wymagałyby kilku równań (naturalne rozszerzenie: model oddaje układ, solver Newtona go rozwiązuje).
- Solver szuka pierwiastków rzeczywistych w zakresie |x| < 1e8.
- Zbiór 34 zadań jest mały. Liczby traktujemy jako porównanie trybów, nie jako ranking modeli.
