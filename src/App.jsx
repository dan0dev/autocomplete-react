import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Felhasználónevek tömbje, amelyben keresést fogunk végrehajtani.
 * A komponensen kívül --> ne jöjjön létre újra minden rendereléskor.
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
  "tesztfelhasználó",
  "lacika2000",
  "zsombibombi0",
  "newuser1",
  "newuser2",
  "newuser3",
];

/**
 * Debounce segédfüggvény
 *
 * Ez a függvény egy magasabb rendű függvényt hoz létre, amely késlelteti
 * a kapott függvény végrehajtását egy meghatározott ideig. Ha az így
 * létrehozott függvényt többször hívjuk a késleltetési időn belül,
 * csak az utolsó hívás fog ténylegesen végrehajtódni, a korábbiak
 * törlődnek.
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

const UsernameSearch = () => {
  // A keresőmezőben lévő aktuális keresési kifejezés állapota
  const [searchTerm, setSearchTerm] = useState("");

  // Eredmény
  const [results, setResults] = useState([]);

  // Üzenet
  const [message, setMessage] = useState("");

  // WIP - keresés folyamatban
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
  const performSearch = useCallback((term) => {
    // Keresési állapot beállítása aktív
    setIsSearching(true);

    // Ha a keresési kifejezés ÜRES vagy CSAK szóközöket tartalmaz
    if (!term.trim()) {
      setMessage("");
      setResults([]);
      setIsSearching(false); // Keresés befejezése
      return;
    }

    // Felhasználónevek szűrése - kisbetűs összehasonlítás
    const foundUsernames = usernames.filter((username) => username.toLowerCase().startsWith(term.toLowerCase()));

    // Az eredmények feldolgozása
    if (foundUsernames.length > 0) {
      // Eredmények megjelenítése
      setResults(foundUsernames);
      // Üzenet nem szükséges - akár előző message törlése
      setMessage("");
    } else {
      setMessage("Nem található egyező felhasználónév.");
      setResults([]);
    }

    // Keresési állapot visszaállítása
    setIsSearching(false);
  }, []);

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
    (term) => {
      let handler = debounce((searchTerm) => {
        performSearch(searchTerm);
      }, 300);
      handler(term);
    },
    [performSearch]
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
    (term) => {
      let handler = throttle((searchTerm) => {
        performSearch(searchTerm);
      }, 800);
      handler(term);
    },
    [performSearch]
  );

  /**
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

export default UsernameSearch;
