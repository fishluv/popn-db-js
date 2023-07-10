# popn-db-js

Node client for [popn-dbs](https://github.com/fishluv/popn-dbs).

## Usage

```js
// import
import { Unilab } from "popn-db-js"
Unilab.sampleQueriedCharts({ count: 5, query: "ver=27,lv=45" })

// require
var PopnDb = require("popn-db-js")
PopnDb.Unilab.sampleQueriedCharts({ count: 5, query: "ver=27,lv=45" })

// output
[
  Chart {
    id: '1918ex',
    songId: '1918',
    songFolder: '26',
    difficulty: 'ex',
    level: 45,
    hasHolds: true,
    title: 'Everlasting Last',
    genre: 'Everlasting Last',
    titleSortChar: 'E',
    genreSortChar: 'E',
    bpm: '140',
    duration: null,
    notes: 1096,
    rating: null,
    sranLevel: '02a',
    songLabels: [],
    remyWikiUrl: 'https://remywiki.com/Everlasting_Last',
    songSlug: 'everlasting-last',
    hyrorreUrl: 'https://popn.wiki/%E9%9B%A3%E6%98%93%E5%BA%A6%E8%A1%A8/everlasting_last_ex'
  },
  ...
]
```
