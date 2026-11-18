# SHADOWS OF PRESSBURG — v0.6

Historická 3D akčná adventúra zasadená do Prešporka roku 1567.

## Čo obsahuje v0.6
- Lokálne generované GLB modely: hrázdené domy, Michalská brána, kostol sv. Martina, krčma, studňa, mestské hradby, trhové stánky, dlažba, stromy, sudy a voz.
- Modely prostredia sa generujú počas GitHub Actions a publikujú spolu s hrou; počas hrania sa nesťahujú z cudzieho asset CDN.
- Rigované postavy sa načítavajú ako samostatné GLB modely z Gobkit; pri nedostupnosti zostáva záložná postava.
- Mobilný render profil obmedzuje rozlíšenie a tiene, aby znížil záťaž iPhonu.
- Opravené filtrovanie vnorených miniatúrnych modelov a mierka záložných postáv.

## Spustenie
Hra je publikovaná cez GitHub Pages. Na načítanie Babylon.js a rigovaných postáv je potrebné internetové pripojenie.

## Ovládanie
- Mobil: ľavý joystick na pohyb, pravá strana obrazovky na otáčanie kamery, tlačidlá akcií.
- PC: WASD/šípky, myš, Space, E, F, Shift, C, Q, Escape.

## Stav projektu
Ide o výrazne rozšírený hrateľný prototyp. Nie je to hotová AAA hra: stále chýbajú profesionálne motion-capture animácie, plne ručne vytvorený otvorený svet, pokročilý combat systém, dabing a rozsiahly príbehový obsah.
