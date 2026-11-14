export interface BggRawValueAttr {
  '@_value'?: string | number;
  '#text'?: string;
}

export interface BggRawName {
  '@_type'?: 'primary' | 'alternate' | string;
  '@_sortindex'?: string | number;
  '@_value'?: string;
}

export interface BggRawLink {
  '@_type': string;
  '@_id': string | number;
  '@_value': string;
  '@_inbound'?: string | boolean;
}

export interface BggRawPollResult {
  '@_value'?: string;
  '@_numvotes'?: string | number;
  '@_level'?: string | number;
  '@_name'?: string;
}

export interface BggRawPollResults {
  '@_numplayers'?: string;
  result?: BggRawPollResult | BggRawPollResult[];
}

export interface BggRawPoll {
  '@_name': string;
  '@_title'?: string;
  '@_totalvotes'?: string | number;
  results?: BggRawPollResults | BggRawPollResults[];
}

export interface BggRawPollSummary {
  '@_name': string;
  '@_title'?: string;
  result?: BggRawPollResult | BggRawPollResult[];
}

export interface BggRawVersionItem {
  '@_type': string;
  '@_id': string | number;
  thumbnail?: string;
  image?: string;
  canonicalname?: BggRawValueAttr | string;
  name?: BggRawName | BggRawName[];
  link?: BggRawLink | BggRawLink[];
  yearpublished?: BggRawValueAttr;
  productcode?: BggRawValueAttr;
  width?: BggRawValueAttr;
  length?: BggRawValueAttr;
  depth?: BggRawValueAttr;
  weight?: BggRawValueAttr;
}

export interface BggRawItem {
  '@_type': string;
  '@_id': string | number;
  thumbnail?: string;
  image?: string;
  name?: BggRawName | BggRawName[];
  description?: string;
  yearpublished?: BggRawValueAttr;
  minplayers?: BggRawValueAttr;
  maxplayers?: BggRawValueAttr;
  playingtime?: BggRawValueAttr;
  minplaytime?: BggRawValueAttr;
  maxplaytime?: BggRawValueAttr;
  minage?: BggRawValueAttr;
  poll?: BggRawPoll | BggRawPoll[];
  'poll-summary'?: BggRawPollSummary | BggRawPollSummary[];
  link?: BggRawLink | BggRawLink[];
  versions?: {
    item?: BggRawVersionItem | BggRawVersionItem[];
  };
}

export interface BggRawResponse {
  items?: {
    item?: BggRawItem | BggRawItem[];
  };
}

export interface BggPlayerCountPollResult {
  numPlayers: string; // e.g. "1", "2", "2+"
  best: number;
  recommended: number;
  notRecommended: number;
  totalVotes: number;
  bestPercent: number;
  recommendedPercent: number;
  notRecommendedPercent: number;
}

export interface BggPlayerCountPoll {
  totalVotes: number;
  bestWith?: string; // e.g. "Best with 2 players"
  recommendedWith?: string;
  results: BggPlayerCountPollResult[];
}

export interface BggPlayerAgePollResult {
  age: string; // e.g. "12", "14", "16"
  numVotes: number;
  percentage: number;
}

export interface BggPlayerAgePoll {
  totalVotes: number;
  suggestedAge?: string; // e.g. "14+"
  results: BggPlayerAgePollResult[];
}

export interface BggGameVersion {
  id: number;
  name: string;
  canonicalName?: string;
  language?: string;
  publisher?: string;
  yearPublished?: number;
  thumbnail?: string;
  image?: string;
}

export interface BggEntityLink {
  id: number;
  name: string;
}

export interface BggThingDetails {
  id: number;
  type: string;
  primaryName: string;
  alternateNames: string[];
  thumbnail?: string;
  image?: string;
  description?: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  minAge?: number;
  categories: BggEntityLink[];
  mechanics: BggEntityLink[];
  families: string[];
  designers: BggEntityLink[];
  artists: string[];
  publishers: string[];
  versions?: BggGameVersion[];
  playerCountPoll?: BggPlayerCountPoll;
  playerAgePoll?: BggPlayerAgePoll;
}
