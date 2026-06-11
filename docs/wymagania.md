# Wymaganie Projektowe

## Cel projektu

Celem projektu jest zaprojektowanie i zbudowanie aplikacji internetowej, w której każda decyzja architektoniczna jest świadoma i uzasadniona. Projekt realizujecie w dowolnej technologii, ale musicie potrafić uzasadnić wybór w kontekście waszego projektu.

- "Bo się tak robi" lub "bo to popularne" nie jest uzasadnieniem.
- "Bo nasz frontend i backend są w TypeScript, w jednym monorepo, i tRPC daje nam end-to-end type safety bez code generation" - to jest uzasadnienie.

## Temat aplikacji

Temat jest dowolny, ale aplikacja musi spełniać minimalne wymagania złożoności (patrz sekcja 3). Przykładowe tematy:

- System zarządzania zadaniami / kanban (jak Plane, Linear)
- Platforma e-learningowa z kursami i postępem studenta
- Aplikacja budżetowa / finanse osobiste z dashboard’em
- System rezerwacji (pokoje, sprzęt, sale - z kalendarzem)
- Platforma do zarządzania wydarzeniami i biletami
- Agregator danych z API zewnętrznych (pogoda, giełda, sport) z cachem
- Mini e-commerce z koszykiem, checkout, symulacją płatności

Jeśli nie macie pomysłu - przyjdźcie na konsultacje.

## Wymagania minimalne

Każda aplikacja musi zawierać poniższe elementy. Brak któregokolwiek oznacza niezaliczenie projektu.

| ID | Wymaganie | Opis |
| -- | --------- | ---- |
| R1 | Backend API | Wystawione API (REST, GraphQL, gRPC lub tRPC) z minimum 3 zasobami/typami powiązanymi relacjami. |
| R2 | Baza danych | Persystentna baza danych (relacyjna lub dokumentowa) z przemyślanym schematem. Migracje zarządzane narzędziem (Alembic, Django migrations, Prisma, Drizzle, itp.). |
| R3 | Frontend | Interfejs użytkownika komunikujący się z API. Może być SPA (React, Vue, Svelte), SSR (Next.js), lub nawet HTMX - ale musi istnieć. |
| R4 | Autentykacja | Mechanizm logowania (JWT, sesje, OAuth - dowolny). Minimum: rozróżnienie zalogowany/niezalogowany, ochrona wybranych endpointów. |
| R5 | Konteneryzacja | docker-compose.yml uruchamiający całą aplikację jedną komendą. Wszystkie serwisy (API, baza, cache jeśli jest, frontend jeśli wymaga buildu) muszą się podnieść. |
| R6 | Repozytorium | Publiczne (jak Wam to nie przeszkadza w innym wypadku dostępy dla innych) repo na GitHub/GitLab z historią commitów (nie jeden commit na koniec). README z instrukcją uruchomienia i opisem architektury. |

## Elementy dodatkowe (punktowane)

Każdy element musi być faktycznie użyty i uzasadniony - samo dodanie Redisa bez wyjaśnienia, co cachujecie i dlaczego, nie daje punktów.

| Element | Opis |
| ------- | ---- |
| Cache | Redis/Valkey/Memcached z wyjaśnieniem strategii (co cachujecie, TTL, invalidacja). |
| Task queue | Celery, Bull, Dramatiq - z przykładem zadania asynchronicznego (e-mail, raport, cleanup). |
| Testy | Testy (jednostkowe/integracyjne). Wskazać pokrycie testami. |
| CI/CD | GitHub Actions / GitLab CI / Jenkins |
| Observability | Logowanie strukturalne, health-check endpoint, lub distributed tracing (Jaeger, OpenTelemetry). |
| Walidacja danych | Schema validation na wejściu API (Pydantic, Zod, Joi, class-validator). |
| Dokumentacja API | Swagger/OpenAPI, GraphQL Playground, lub Postman collection. |
| Seed data | Skrypt lub komenda wypełniająca bazę przykładowymi danymi do demo. |
| OLAP / Analytics | Osobna warstwa analityczna (dashboard z agregacjami, materialized views, DuckDB, ClickHouse). |
| Multi-tenancy | Separacja danych per organizacja / workspace. |

## Architecture Decision Record (ADR) - obowiązkowy

Kluczowym elementem projektu jest dokument ADR (Architecture Decision Record). To tabela (lub zbiór krótkich dokumentów), w której opisujecie każdą istotną decyzję architektoniczną. ADR jest obowiązkowy i jest oceniany oddzielnie.
Każdy wpis ADR powinien zawierać:

- Decyzja - co wybraliście (np. "PostgreSQL jako baza danych")
- Kontekst - jaki problem rozwiązujecie
- Alternatywy - co rozważaliście
- Uzasadnienie - dlaczego ten wybór, a nie inny, w kontekście waszego projektu
- Trade-offy - czego się wyrzekliście, jakie są konsekwencje Minimalna liczba wpisów ADR: 5.

Przykład wpisu ADR:

| Pole | Treść |
| ---- | ---- |
| Decyzja | GraphQL (Apollo Server) jako warstwa API |
| Kontekst | Frontend (React) potrzebuje różnych zestawów pól na różnych widokach: lista produktów (nazwa, cena, miniaturka) vs szczegóły (pełny opis, warianty, stock). REST wymuszałby albo over-fetching, albo dedykowane endpointy per widok. |
| Alternatywy | REST + OpenAPI (prostsze cachowanie HTTP, większy ekosystem), tRPC (lepsza DX w TS, ale zamykamy się na TypeScript) |
| Uzasadnienie | Mamy 4 widoki z różnymi potrzebami danych. GraphQL eliminuje N+1 po stronie klienta i daje typesafe codegen. Schema jest kontraktem między front/back. |
| Trade-offy | Tracimy natywne HTTP caching (POST /graphql). Musimy zaimplementować DataLoadery, żeby uniknąć N+1 po stronie serwera. Krzywa uczenia dla członków zespołu. |

## Forma pracy

- Projekty realizujemy jednoosobowo.
- Widoczne commity w repozytorium.

## Prezentacja końcowa

Każdy osoba prezentuje projekt w 10-11 minut. Struktura:

- 1 min: Co robi aplikacja (demo lub screenshot).
- 7 min: Architektura + ADR - najważniejsze decyzje i ich uzasadnienie.
- 2–3 min: Q&A - prowadzący i inni studenci pytają o architekturę.

Prezentacja nie musi być w PowerPoint, forma dowolna. Liczy się treść, nie forma.

## Kryteria oceniania

Ocena składa się z trzech komponentów. Kluczowe: spójność architektoniczna jest ważniejsza niż liczba funkcji. Mała, dobrze zaprojektowana aplikacja z przemyślanym ADR dostanie lepszą ocenę niż duża aplikacja z losowymi wyborami technologicznymi.

| Komponent | Waga | Co oceniam |
| --------- | ---- | ---------- |
| Implementacja | 40% | Czy aplikacja działa? Czy docker-compose podnosi cały stack? Historia commitów. Spełnienie wymagań R1–R6.
| Architektura i ADR | 40% | Czy decyzje są świadome i spójne? Czy ADR zawiera min. 5 wpisów? Czy tradeoffy są zidentyfikowane? Czy architektura pasuje do skali projektu? (To pytanie może mieć negatywną odpowiedź w przypadku celowo przeskalowaliście projekt, żeby się nauczyć czegoś nowego a było to wykonalne w czasie).
| Prezentacja i Q&A | 20% | Czy potraficie obronić swoje decyzje? Czy rozumiecie, co zbudowaliście? Czy odpowiadacie konkretnie?

Skala ocen:

| Ocena | Kryteria |
| ----- | -------- |
| 5.0 (bdb) | Wszystkie R1–R6. ADR z 6+ wpisami, głęboki i spójny. 3+ elementy dodatkowe z uzasadnieniem. Prezentacja pewna, odpowiedzi konkretne. |
| 4.5 (db+) | Wszystkie R1–R6. ADR solidny (5+ wpisów). 2+ elementy dodatkowe. Dobra prezentacja. |
| 4.0 (db) | Wszystkie R1–R6. ADR z 5 wpisami. 1 element dodatkowy. Prezentacja poprawna. |
| 3.5 (dst+) | Wszystkie R1–R6. ADR z 5 wpisami, ale powierzchowny (brak trade-offów, ogólnikowe uzasadnienia). |
| 3.0 (dst) | Wymagania R1–R6 z drobnymi brakami (np. brak migracji, słaby README). ADR minimalny. |
| 2.0 (ndst) | Brak któregokolwiek z R1–R6. Brak ADR. Aplikacja nie uruchamia się z docker-compose. Brak commitów jednego z członków. |
