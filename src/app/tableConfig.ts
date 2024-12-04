import {GridOptions} from "ag-grid-community";

export const tableConfig: TooltipName = {
  "objectname": {"visible": true },
  "objectid": {"visible": false, "type": "n"},
  "rating": {"visible": true, "type": "n"},
  "numplays": {"visible": false, "type": "n"},
  "weight": {"visible": false, "type": "n"},
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
  "baverage": {"visible": true, "type": "n"},
  "average": {"visible": true, "type": "n"},
  "avgweight": {"visible": true, "type": "n"},
  "rank": {"visible": true, "type": "n"},
  "numowned": {"visible": false, "type": "n"},
  "objecttype": {"visible": false},
  "originalname": {"visible": true},
  "minplayers": {"visible": true, "type": "n"},
  "maxplayers": {"visible": true, "type": "n"},
  "playingtime": {"visible": true, "type": "n"},
  "maxplaytime": {"visible": true, "type": "n"},
  "minplaytime": {"visible": true, "type": "n"},
  "yearpublished": {"visible": true, "type": "n"},
  "bggrecplayers": {"visible": true},
  "bggbestplayers": {"visible": true},
  "bggrecagerange": {"visible": true, "type": "n"},
  "bgglanguagedependence": {"visible": false},
  "publisherid": {"visible": false},
  "imageid": {"visible": false},
  "year": {"visible": false},
  "language": {"visible": false},
  "other": {"visible": false},
  "itemtype": {"visible": true},
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
  "version_nickname": {"visible": false}
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

// export const desiredKeys = [
//   'objectid',
//   'originalname',
//   'bggrecplayers',
//   'baverage',
//   'bggrecagerange',
//   'playingtime'
// ];
//
// function createPartialObject(data: TooltipName[], keys: string[]) {
//   return keys
//   .map(key => {
//     const obj = data.find(item => item.hasOwnProperty(key));
//     return obj ? {[key]: obj[key]} : undefined;
//   })
//   .filter(item => item !== undefined);
// }
//
// export function getValueForKey(data: TooltipName[], key: string) {
//   const foundObject = data.find(item => item.hasOwnProperty(key));
//   return foundObject ? foundObject[key] : undefined;
// }
//
// export const visibleRows: TooltipName[] = createPartialObject(tableConfig, desiredKeys);

export type TooltipName = {
  [key: string]: {
    visible: boolean;
    type?: string;
  };
};
