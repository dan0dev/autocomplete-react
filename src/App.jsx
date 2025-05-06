import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Felhasználónevek tömbje, amelyben keresést fogunk végrehajtani.
 * A komponensen kívül definiáljuk, hogy ne jöjjön létre újra minden rendereléskor.
 */
const usernames = [
  "daniel0113",
  "rebeka",
  "kriszta",
  "dani01",
  "admin@dan0.pw",
  "tesztuser",
  "tesztvagyok",
  "Krisztián01",
];

/**
 * UsernameSearch komponens
 *
 * Ez a komponens egy keresőmezőt biztosít, amellyel a felhasználók a
 * felhasználónevek listájában kereshetnek. A keresés mind debouncing,
 * mind throttling mechanizmusokkal optimalizált a teljesítmény érdekében.
 *
 * @returns {JSX.Element} - A felhasználónév-kereső komponens
 */
const UsernameSearch = () => {
  /**
   * A keresőmezőben lévő aktuális keresési kifejezés állapota.
   * Minden billentyűleütésnél frissül.
   */
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * A keresési találatok tömbjének állapota.
   * A szűrés eredményeit tárolja.
   */
  const [results, setResults] = useState([]);

  /**
   * Üzenet állapot, amely tájékoztatja a felhasználót, ha nincs találat,
   * vagy más információt közöl.
   */
  const [message, setMessage] = useState("");

  /**
   * Jelzi, hogy éppen folyamatban van-e keresés.
   * Használható betöltési indikátor megjelenítéséhez.
   */
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Referencia az utolsó throttling végrehajtás időbélyegének tárolására.
   * A useRef segítségével ez az érték megmarad a renderelések között.
   */
  const lastExecutionRef = useRef(0);

  /**
   * Tényleges keresési funkció, amely a felhasználónevek szűrését végzi.
   *
   * @param {string} term - A keresési kifejezés, amellyel szűrni kell a felhasználóneveket
   */
  const performSearch = (term) => {
    // Keresési állapot beállítása aktívra
    setIsSearching(true);

    // Ha a keresési kifejezés ÜRES vagy CSAK szóközöket tartalmaz
    if (!term.trim()) {
      setMessage("");
      setResults([]);
      setIsSearching(false); // Keresés befejezése
      return;
    }

    // Felhasználónevek szűrése - kisbetűs összehasonlítást használunk,
    // hogy a keresés ne legyen kis- és nagybetű érzékeny
    const foundUsernames = usernames.filter((username) => username.toLowerCase().startsWith(term.toLowerCase()));

    // Az eredmények feldolgozása
    if (foundUsernames.length > 0) {
      setResults(foundUsernames);
      setMessage("");
    } else {
      setMessage("Nem található egyező felhasználónév.");
      setResults([]);
    }

    // Keresési állapot visszaállítása
    setIsSearching(false);
  };

  /**
   * Debounce funkció a kereséshez.
   *
   * Ez a funkció késlelteti a keresést, amíg a felhasználó abba nem hagyja
   * a gépelést egy meghatározott időtartamra (300ms). Ez különösen hasznos
   * a felesleges keresések elkerülésére gyors gépelés közben.
   *
   * A useCallback hook biztosítja, hogy ez a függvény csak egyszer jöjjön létre,
   * és ne minden rendereléskor újra.
   */
  const debouncedSearch = useCallback(
    debounce((term) => {
      performSearch(term);
    }, 300), // 300ms késleltetés
    []
  );

  /**
   * Throttle funkció a kereséshez.
   *
   * Ez a funkció korlátozza a keresések gyakoriságát, biztosítva, hogy legfeljebb
   * egyszer fusson le egy meghatározott időintervallumon belül (800ms).
   * Ez hasznos a túlzott számú keresés elkerülésére gyors gépelés közben, miközben
   * némi visszajelzést ad a felhasználónak.
   */
  const throttledSearch = useCallback(
    throttle((term) => {
      performSearch(term);
    }, 800), // 800ms minimális időköz
    []
  );

  /**
   * Effect hook a keresés kezelésére.
   *
   * Ez a hook figyeli a searchTerm változásait, és mind a debounced,
   * mind a throttled keresési funkciókat alkalmazza a megfelelő időzítéssel.
   *
   * A debounced keresés minden változáskor beállításra kerül, de csak
   * a gépelés szünetelése után fut le.
   *
   * A throttled keresés csak akkor fut le, ha elegendő idő telt el az
   * utolsó futtatás óta, biztosítva a minimális visszajelzést gyors gépelés közben.
   */
  useEffect(() => {
    // Mindig beállítjuk a debounced keresést
    debouncedSearch(searchTerm);

    // Ha több idő telt el, mint a throttle időkorlát, vagy a keresési kifejezés üres,
    // azonnal futtatjuk a throttled keresést
    const now = Date.now();
    if (now - lastExecutionRef.current > 800 || !searchTerm.trim()) {
      throttledSearch(searchTerm);
      lastExecutionRef.current = now;
    }
  }, [searchTerm, debouncedSearch, throttledSearch]);

  // Komponens renderelése
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Keresés..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Betöltési indikátor, ha éppen keresés van folyamatban */}
        {isSearching && <span> Keresés...</span>}
      </div>

      {/* Üzenet megjelenítése, ha van */}
      {message && <p>{message}</p>}

      {/* Keresési eredmények listázása */}
      <div id="results">
        {results.map((username, index) => (
          <div key={index}>{username}</div>
        ))}
      </div>
    </div>
  );
};

/**
 * Debounce segédfüggvény
 *
 * Ez a függvény egy magasabb rendű függvényt hoz létre, amely késlelteti
 * a kapott függvény végrehajtását egy meghatározott ideig. Ha az így
 * létrehozott függvényt többször hívjuk a késleltetési időn belül,
 * csak az utolsó hívás fog ténylegesen végrehajtódni, a korábbiak
 * törlődnek.
 *
 * Tipikus felhasználási terület: keresőmezők, ahol nem akarjuk, hogy
 * minden billentyűleütésre lefusson a keresés, csak amikor a felhasználó
 * abbahagyta a gépelést.
 *
 * @param {Function} func - A függvény, amelyet debounce-olni kell
 * @param {number} delay - A késleltetés milliszekundumban
 * @returns {Function} - A debounce-olt függvény
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    // Előző timeout törlése, ha van
    clearTimeout(timeoutId);
    // Új timeout beállítása
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Throttle segédfüggvény
 *
 * Ez a függvény egy magasabb rendű függvényt hoz létre, amely korlátozza
 * a kapott függvény végrehajtási gyakoriságát. A létrehozott függvény
 * garantálja, hogy a kapott függvény legfeljebb egyszer kerüljön végrehajtásra
 * egy meghatározott időintervallumon belül.
 *
 * Tipikus felhasználási területek: scroll események, ablakméretezés,
 * vagy bármilyen gyakran előforduló esemény kezelése.
 *
 * @param {Function} func - A függvény, amelyet throttle-olni kell
 * @param {number} limit - A minimális időköz milliszekundumban a végrehajtások között
 * @returns {Function} - A throttle-olt függvény
 */
function throttle(func, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      // Csak akkor hajtjuk végre, ha nincs throttling aktív állapotban
      func.apply(this, args);
      inThrottle = true;
      // Throttling állapot visszaállítása a megadott idő után
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export default UsernameSearch;
