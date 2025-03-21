import {GridOptions} from "ag-grid-community";

export const tableConfig: TooltipName = {
  "objectname": {visible: true, translation: "Nazwa"},
  "average": {"visible": true, "type": "n", translation: "Średnia"},
  "avgweight": {"visible": true, "type": "n", translation: "Średnia waga"},
  "rank": {"visible": true, "type": "n", translation: "Miejsce"},
  "objecttype": {"visible": false, translation: "Typ"},
  "bggbestplayers": {"visible": true, translation: "Najlepiej dla (BGG)"},
  "rating": {"visible": true, "type": "n", translation: "Ocena"},
  "numplays": {"visible": false, "type": "n"},
  "weight": {"visible": false, "type": "n", translation: "Waga"},
  "own": {"visible": false, "type": "b"},
  "fortrade": {"visible": false, "type": "b"},
  "want": {"visible": false, "type": "b"},
  "wanttobuy": {"visible": false, "type": "b"},
  "wanttoplay": {"visible": false, "type": "b"},
  "prevowned": {"visible": false, "type": "b"},
  "preordered": {"visible": false, "type": "b"},
  "wishlist": {"visible": false, "type": "b"},
  "wishlistpriority": {"visible": false, "type": "n"},
  "wishlistcomment": {"visible": false},
  "comment": {"visible": true},
  "conditiontext": {"visible": false},
  "haspartslist": {"visible": false},
  "wantpartslist": {"visible": false},
  "collid": {"visible": false, "type": "n"},
  "baverage": {"visible": true, "type": "n", translation: "Średnia (BGG)"},
  "numowned": {"visible": false, "type": "n"},
  "originalname": {"visible": true, translation: "Nazwa oryginalna"},
  "minplayers": {"visible": true, "type": "n", translation: "Min graczy"},
  "maxplayers": {"visible": true, "type": "n", translation: "Max graczy"},
  "playingtime": {"visible": true, "type": "n", translation: "Czas gry"},
  "maxplaytime": {"visible": true, "type": "n", translation: "Maks czas gry"},
  "minplaytime": {"visible": true, "type": "n", translation: "Min czas gry"},
  "yearpublished": {"visible": true, "type": "n", translation: "Rok wydania"},
  "bggrecplayers": {"visible": true, translation: "Ilość graczy"},
  "bggrecagerange": {"visible": true, "type": "n", translation: "Wiek (BGG)"},
  "bgglanguagedependence": {"visible": false, translation: "Zależności jezykowe"},
  "publisherid": {"visible": false},
  "imageid": {"visible": false},
  "year": {"visible": false},
  "language": {"visible": false},
  "other": {"visible": false},
  "itemtype": {"visible": true, translation: "Typ"},
  "barcode": {"visible": false},
  "pricepaid": {"visible": false},
  "pp_currency": {"visible": false},
  "currvalue": {"visible": false},
  "cv_currency": {"visible": false},
  "acquisitiondate": {"visible": false},
  "acquiredfrom": {"visible": false},
  "quantity": {"visible": false},
  "privatecomment": {"visible": false},
  "invlocation": {"visible": false},
  "invdate": {"visible": false},
  "version_publishers": {"visible": false},
  "version_languages": {"visible": false},
  "version_yearpublished": {"visible": false, "type": "n"},
  "version_nickname": {"visible": false},
  "objectid": {"visible": true, "type": "n", translation: "BGG ID"},
}


export const gridOptions: GridOptions = {
  autoSizeStrategy: {
    type: 'fitGridWidth',
    defaultMinWidth: 100,
    columnLimits: [
      {
        colId: 'objectname',
        minWidth: 350
      }
    ]
  },
};

export type TooltipName = {
  [key: string]: {
    visible: boolean;
    type?: string;
    translation?: string
  };
};
