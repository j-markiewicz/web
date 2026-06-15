# ADRy

## Ogólna Architektura Projektu

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | Rozdzielenie na serwer z API, frontend webowy, i bazę danych                                          |
| Kontekst     | Projekt polega na ściąganiu, przetwarzaniu, i wyświetlaniu danych dostępnych z publicznych źródeł (n.p. ZTP Kraków) i powinien być łatwy do użycia |
| Alternatywy  | Sam frontend, który implementuje wszystkie z w.w. funkcji; aplikacja desktopowa/mobilna (nie-webowa)  |
| Uzasadnienie | Implementacja samego frontendu webowego (bez serwera) jest wykluczona ze względów technicznych (wiele serwerów źródłowych nie ma skonfigurowanego CORS/CORB, przez co strona w przeglądarce nie może pobrać danych źródłowych) i wydajnościowych (jeśli z projektu będzie korzystać wiele użytkowników, to serwery z danymi źródłowymi mogą zostać przytłoczone zbyt dużą ilością zapytań, a każdy użytkownik musiałby osobno w przeglądarce przetworzyć dane do formy nadającej się do wyświetlenia). Strona internetowa została wybrana ponieważ (w porównaniu do aplikacji desktopowej/mobilnej) jest łatwiejsza do użycia (nie wymaga instalacji) i obsługuje bardzo wiele platform (wszystkie z nowoczesną przeglądarką). Baza danych jest potrzebna do przechowywania danych użytkownika. |
| Trade-offy   | Decyzja, aby frontend był webowy ogranicza wybór technologii do jego implementacji. Serwer i baza danych wymagają hostowania. |

## Technologia Frontendu

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | Preact + Typescript jako framework dla strony                                                         |
| Kontekst     | Strona zawiera mapę i panel boczny z powtórzonymi wielokrotnie komponentami (n.p. przystanek, linia)  |
| Alternatywy  | Inny framework (React, Vue, lithtml, itp.), "czysty" HTML + CSS, lub renderowanie na serwerze         |
| Uzasadnienie | Strona zawiera wiele powtarzanych komponentów, które byłyby nieco trudniejsze do zaimplementowania bez biblioteki/frameworku. Renderowanie na serwerze duplikowałoby funkcjonalność API (lub bez osobnego API, nie ~~spełniałoby wymagań projektu~~ umożliwiałoby łatwego użycia danych przez innych potencjalnych konsumentów) i znacznie utrudniałoby uaktualnienia mapy w czasie rzeczywistym. Preact został wybrany zamiast innych frameworków, ponieważ (w porównaniu do React) jest mniejszy, co przyśpieszy ładowanie strony, a bardziej zaawansowane funkcje których nie ma nie są potrzebne w implementacji. Typescript (w porównaniu do JS) umożliwi wykrywanie wielu błędów przed deployem. |
| Trade-offy   | W porównaniu do "czystego" HTML + CSS i renderowania na serwerze, wymaganie działającego i nowoczesnego JS w przeglądarce użytkownika. |

## Technologia Serwera

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | NodeJS + Typescript                                                                                   |
| Kontekst     | Serwer musi wspierać asynchroniczne pobieranie danych, przetwarzanie GTFS/GTFS-RT, API HTTP           |
| Alternatywy  | Inny język, inny runtime/framework                                                                    |
| Uzasadnienie | NodeJS spełniają wszystkie wymagania (asynchroniczny serwer, workery do przetwarzania danych w tle, ...). Typescript (w porównaniu do JS) umożliwi wykrywanie wielu błędów przed deployem i (w porównaniu do innych języków) pozwala na współdzielenie typów między front- i backendem. Dla JS/TS istnieje wiele użytecznych bibliotek, m.in. dla przetwarzania GTFS-RT (protobuf). |
| Trade-offy   | TS/JS jako języki interpretowane/JIT-kompilowane z GC mogą być mniej wydajne niż kompilowane języki (n.p. Go), a zwłaszcza takie, które dodatkowo nie mają GC (n.p. Rust). |

## Architektura Serwera

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | Serwer implementowany jako kilka komunikujących między sobą moduły                                    |
| Kontekst     | Dla implementacji serwera jest kilka możliwych architektur, i jedną z nich należy wybrać              |
| Alternatywy  | Monolit, mikroserwisy z komunikacją przez sieć, komunikacja przez zewnętrzne serwisy                  |
| Uzasadnienie | Architektura monolitowa w porównaniu do mikroserwisowej pozwala na wydajne i wygodne użycie wbudowanych funkcjonalności języka (n.p. Workery, async/await, ...) do komunikacji między komponentami bez potrzeby przesyłania dużej ilości danych przez sieć. Rozdzielenie serwera na moduły jest wygodne z perspektywy implementacji i dla wybranej funkcjonalności (którą łatwo podzielić na warstwy *pobierz dane* -> *przetwórz* -> *udostępnij*) jest oczywistym wyborem. |
| Trade-offy   | Małe teoretyczne spowolnienie w porównaniu do ściślej powiązanej architektury; możliwe późniejsze problemy w utrzymaniu kodu, skalowaniu do bardzo dużej ilości użytkowników, i możliwość, że crash/deadlock w jednym komponencie wpłynie na całą resztę serwera w porównaniu do mikroserwisów. |

## Mapa na Stronie

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | Mapa Leaflet na stronie                                                                               |
| Kontekst     | Większość interfejsu użytkownika zajmuje mapa, która pokazuje większość informacji.                   |
| Alternatywy  | Google/Apple/Bing Maps, Mapbox, CesiumJS                                                              |
| Uzasadnienie | W porównaniu do Google/Apple/Bing Maps i Mapbox, Leaflet jest całkowicie darmowy, nie polega na pewnym zewnętrznym serwisie, i jest łatwy do dostosowania do różnych potrzeb (w.w. mapy głównie są dostosowane do potrzeb nawigacji). CesiumJS skupia się głównie na niepotrzebnych dla tego projektu funkcjonalnościach (m.in. mapy 3D). Istnieje wiele serwisów (darmowych, płatnych, i samo-hostowanych), które obsługują format mapy kompatybilny z Leaflet. |
| Trade-offy   | Leaflet wspiera (bez dodatkowych pluginów) tylko mapy rastrowe, które mogą być mniej wydajne niż wektorowe. Metoda renderowania, z której korzysta Leaflet, nie jest najbarziej wydajną na nowoczesnych przeglądarkach. |

## Baza Danych

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | PostgreSQL jako baza danych dla konfiguracji/użytkowników                                             |
| Kontekst     | Serwer musi przechowywać konfigurację źródeł i dane kont użytkowników                                 |
| Alternatywy  | Inne bazy relacyjne (n.p. MariaDB), bazy NoSQL (n.p. MongoDB)                                         |
| Uzasadnienie | Bazy SQL są dobrze wspierane, i dane, które projekt musi w nich zapisać dobrze pasują do baz relacyjnych. Postgres wyróżnia się m.in. wysoką wydajnością i byciem open source. |
| Trade-offy   | W bazach relacyjnych zmiany schematu wymagają większego wysiłku niż w (większości) dokumentowych - tu napisanie i wykonanie migrate'u. |

## Caching

| Pole         | Treść                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Decyzja      | Caching danych w pamięci serwera                                                                      |
| Kontekst     | Serwer pobiera i przetwarza dane na zapytanie użytkownika. Aby nie duplikować niepotrzebnie pracy i przyśpieszyć działanie serwera, caching powinien być zastosowany. |
| Alternatywy  | Brak cachingu, użycie zewnętrznego serwisu do cachingu (n.p. Redis/Valkey, memcached)                 |
| Uzasadnienie | Caching w pamięci serwera jest najprostszym i najszybszym rozwiązaniem.                               |
| Trade-offy   | Zwiększone zużycie pamięci serwera, problemy w skalowaniu do wielu różnych źródeł danych. Brak możliwości współdzielenia cache'u jeśli jest więcej niż jeden serwer. |
