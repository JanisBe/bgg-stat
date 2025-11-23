import {GridOptions} from "ag-grid-community";

export const tableConfig: TooltipName = {
  "objectname": {visible: true, translationPl: "Nazwa", translationEn: "Name"},
  "average": {visible: true, "type": "n", translationPl: "Średnia",},
  "avgweight": {visible: true, "type": "n", translationPl: "Średnia waga", translationEn: "Average weight"},
  "rank": {visible: true, "type": "n", translationPl: "Miejsce"},
  "objecttype": {visible: false, translationPl: "Typ", translationEn: "Object type"},
  "bggbestplayers": {visible: true, translationPl: "Najlepiej dla (BGG)", translationEn: "Best for (BGG)"},
  "rating": {visible: true, "type": "n", translationPl: "Ocena"},
  "weight": {visible: false, "type": "n", translationPl: "Waga"},
  "baverage": {visible: true, "type": "n", translationPl: "Średnia (BGG)", translationEn: "Average (BGG)"},
  "originalname": {visible: true, translationPl: "Nazwa oryginalna", translationEn: "Original name"},
  "minplayers": {visible: true, "type": "n", translationPl: "Min graczy"},
  "maxplayers": {visible: true, "type": "n", translationPl: "Max graczy"},
  "playingtime": {visible: true, "type": "n", translationPl: "Czas gry"},
  "maxplaytime": {visible: true, "type": "n", translationPl: "Maks czas gry"},
  "minplaytime": {visible: true, "type": "n", translationPl: "Min czas gry"},
  "yearpublished": {visible: true, "type": "n", translationPl: "Rok wydania"},
  "bggrecplayers": {visible: true, translationPl: "Ilość graczy", translationEn: "Number of players"},
  "bggrecagerange": {visible: true, "type": "n", translationPl: "Wiek (BGG)", translationEn: "Age (BGG)"},
  "bgglanguagedependence": {visible: false, translationPl: "Zależności jezykowe", translationEn: "Language dependence"},
  "itemtype": {visible: true, translationPl: "Typ"},
  "objectid": {visible: true, "type": "n", translationPl: "BGG ID", translationEn: "BGG ID"},
  "comment": {visible: true, translationPl: "Komentarz"},
  "year": {visible: false},
  "numplays": {visible: false, "type": "n"},
  "own": {visible: false, "type": "b"},
  "fortrade": {visible: false, "type": "b"},
  "want": {visible: false, "type": "b"},
  "wanttobuy": {visible: false, "type": "b"},
  "wanttoplay": {visible: false, "type": "b"},
  "prevowned": {visible: false, "type": "b"},
  "preordered": {visible: false, "type": "b"},
  "wishlist": {visible: false, "type": "b"},
  "wishlistpriority": {visible: false, "type": "n"},
  "wishlistcomment": {visible: false},
  "conditiontext": {visible: false},
  "haspartslist": {visible: false},
  "wantpartslist": {visible: false},
  "collid": {visible: false, "type": "n"},
  "numowned": {visible: false, "type": "n"},
  "publisherid": {visible: false},
  "imageid": {visible: false},
  "language": {visible: false},
  "other": {visible: false},
  "barcode": {visible: false},
  "pricepaid": {visible: false},
  "pp_currency": {visible: false},
  "currvalue": {visible: false},
  "cv_currency": {visible: false},
  "acquisitiondate": {visible: false},
  "acquiredfrom": {visible: false},
  "quantity": {visible: false},
  "privatecomment": {visible: false},
  "invlocation": {visible: false},
  "invdate": {visible: false},
  "version_publishers": {visible: false},
  "version_languages": {visible: false},
  "version_yearpublished": {visible: false, "type": "n"},
  "version_nickname": {visible: false},
}


export const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true
  },
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
    translationPl?: string;
    translationEn?: string;
  };
};
