import {GridOptions} from "ag-grid-community";

export const tableConfig: TooltipName[] = [
  { "objectname": true },
  { "objectid": false, },
  { "rating": true },
  { "numplays": false },
  { "weight": false },
  { "own": false },
  { "fortrade": false },
  { "want": false },
  { "wanttobuy": false },
  { "wanttoplay": false },
  { "prevowned": false },
  { "preordered": false },
  { "wishlist": false },
  { "wishlistpriority": false },
  { "wishlistcomment": false },
  { "comment": true },
  { "conditiontext": false },
  { "haspartslist": false },
  { "wantpartslist": false },
  { "collid": false },
  { "baverage": true },
  { "average": true },
  { "avgweight": true },
  { "rank": true },
  { "numowned": false },
  { "objecttype": false },
  { "originalname": true },
  { "minplayers": true },
  { "maxplayers": true },
  { "playingtime": true },
  { "maxplaytime": true },
  { "minplaytime": true },
  { "yearpublished": true },
  { "bggrecplayers": true },
  { "bggbestplayers": true },
  { "bggrecagerange": true },
  { "bgglanguagedependence": false },
  { "publisherid": false },
  { "imageid": false },
  { "year": false },
  { "language": false },
  { "other": false },
  { "itemtype": true },
  { "barcode": false },
  { "pricepaid": false },
  { "pp_currency": false },
  { "currvalue": false },
  { "cv_currency": false },
  { "acquisitiondate": false },
  { "acquiredfrom": false },
  { "quantity": false },
  { "privatecomment": false },
  { "invlocation": false },
  { "invdate": false },
  { "version_publishers": false },
  { "version_languages": false },
  { "version_yearpublished": false },
  { "version_nickname": false }
]
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

export const desiredKeys = [
  'objectid',
  'originalname',
  'bggrecplayers',
  'baverage',
  'bggrecagerange',
  'playingtime'
];

function createPartialObject(data: TooltipName[], keys: string[]) {
  return keys
  .map(key => {
    const obj = data.find(item => item.hasOwnProperty(key));
    return obj ? { [key]: obj[key] } : undefined;
  })
  .filter(item => item !== undefined);
}
export function getValueForKey(data: TooltipName[], key: string) {
  const foundObject = data.find(item => item.hasOwnProperty(key));
  return foundObject ? foundObject[key] : undefined;
}

export const visibleRows: TooltipName[] = createPartialObject(tableConfig, desiredKeys);

export type TooltipName = {
  [key: string]: boolean;
};
