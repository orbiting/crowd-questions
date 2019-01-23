### Develop

```bash
npm run dev:code
# run in seperate tab/window
npm run dev:server
open http://localhost:3000/
```

This assumes you have an «Articles» dir two levels above, e.g. `~/Code/erbschaft` and `~/Articles/article-erbschaft`.

### Deploy

```bash
npm run build
npm run deploy
```

### Clear CDN

Goto https://app.keycdn.com/zones/purgeurl/87880 and enter:

```
/s3/republik-assets/dynamic-components/erbschaft/index.js
```

If you change asset files be sure to purge those too.
