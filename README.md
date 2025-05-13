# UsernameSearch Komponens

Optimalizált React autocomplete komponens felhasználónevek kereséséhez, debouncing és throttling alkalmazásával (videó alapján készített).

## 🔍 Működési elv

(az ábra tartalmazhat kisebb hibákat, pontatlanságot)
![Autocomplete működési elv - részletes folyamatábra](https://i.imgur.com/n5ceT5z.png)

A komponens két teljesítmény-optimalizálási technikát alkalmaz:

- **Debouncing**: Késlelteti a keresést, amíg a felhasználó abba nem hagyja a gépelést (300ms szünet)
- **Throttling**: Korlátozza a keresések gyakoriságát intenzív gépelés esetén (max. 800ms-onként)


## ✅ TODO

- Server API szimulálása az adatok valós idejű lekéréséhez
- Hibakezelés hálózati kérések esetén


