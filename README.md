# UsernameSearch Komponens

Optimalizált React autocomplete komponens felhasználónevek kereséséhez, debouncing és throttling alkalmazásával.

## 📝 Jellemzők

- Valós idejű keresés debouncing (300ms) és throttling (800ms) segítségével
- Könnyedén testreszabható keresési logika
- Felhasználóbarát visszajelzések és állapotkezelés

## 🔍 Működési elv

![Autocomplete működési elv - részletes folyamatábra](https://i.imgur.com/n5ceT5z.png)

A komponens két teljesítmény-optimalizálási technikát alkalmaz:

- **Debouncing**: Késlelteti a keresést, amíg a felhasználó abba nem hagyja a gépelést (300ms szünet)
- **Throttling**: Korlátozza a keresések gyakoriságát intenzív gépelés esetén (max. 800ms-onként)

## 💻 Használat

```jsx
import React from 'react';
import UsernameSearch from './UsernameSearch';

function App() {
  return (
    <div className="App">
      <h1>Felhasználónév Kereső</h1>
      <UsernameSearch />
    </div>
  );
}
```

## ✅ TODO

- Server API szimulálása az adatok valós idejű lekéréséhez
- Hibakezelés hálózati kérések esetén


