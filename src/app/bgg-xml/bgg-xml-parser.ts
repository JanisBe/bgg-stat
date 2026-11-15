import { XMLParser } from 'fast-xml-parser';
import {
  BggEntityLink,
  BggGameVersion,
  BggPlayerAgePoll,
  BggPlayerAgePollResult,
  BggPlayerCountPoll,
  BggPlayerCountPollResult,
  BggRawItem,
  BggRawLink,
  BggRawName,
  BggRawPoll,
  BggRawPollSummary,
  BggRawResponse,
  BggRawValueAttr,
  BggRawVersionItem,
  BggThingDetails,
} from './bgg-xml.models';

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll('&quot;', '"')
    .replaceAll("&gt;", '>')
    .replaceAll("&lt;", '<')
    .replaceAll("&amp;", '&');
}

function parseAttrValue(attr?: BggRawValueAttr | string | number): string {
  if (attr === undefined || attr === null) return '';
  if (typeof attr === 'object') {
    return attr['@_value'] !== undefined
      ? String(attr['@_value'])
      : attr['#text'] !== undefined
        ? String(attr['#text'])
        : '';
  }
  return String(attr);
}

function parseAttrNumber(attr?: BggRawValueAttr | string | number): number | undefined {
  const str = parseAttrValue(attr);
  if (!str) return undefined;
  const num = Number(str);
  return Number.isNaN(num) ? undefined : num;
}

function ensureArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

export function createBggXmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    isArray: (name) =>
      ['name', 'link', 'poll', 'poll-summary', 'results', 'result', 'item'].includes(name),
  });
}

function parsePlayerCountPoll(
  polls: BggRawPoll[],
  pollSummaries: BggRawPollSummary[]
): BggPlayerCountPoll | undefined {
  const poll = polls.find((p) => p['@_name'] === 'suggested_numplayers');
  if (!poll) return undefined;

  const totalVotes = parseAttrNumber(poll['@_totalvotes']) || 0;
  const rawResultsGroup = ensureArray(poll.results);

  const results: BggPlayerCountPollResult[] = [];

  for (const group of rawResultsGroup) {
    const numPlayers = group['@_numplayers'] || '';
    if (!numPlayers) continue;

    const rawResults = ensureArray(group.result);
    let best = 0;
    let recommended = 0;
    let notRecommended = 0;

    for (const res of rawResults) {
      const val = res['@_value'];
      const votes = parseAttrNumber(res['@_numvotes']) || 0;
      if (val === 'Best') best = votes;
      else if (val === 'Recommended') recommended = votes;
      else if (val === 'Not Recommended') notRecommended = votes;
    }

    const countTotal = best + recommended + notRecommended;
    results.push({
      numPlayers,
      best,
      recommended,
      notRecommended,
      totalVotes: countTotal,
      bestPercent: countTotal > 0 ? Math.round((best / countTotal) * 100) : 0,
      recommendedPercent: countTotal > 0 ? Math.round((recommended / countTotal) * 100) : 0,
      notRecommendedPercent: countTotal > 0 ? Math.round((notRecommended / countTotal) * 100) : 0,
    });
  }

  const summary = pollSummaries.find((s) => s['@_name'] === 'suggested_numplayers');
  let bestWith: string | undefined;
  let recommendedWith: string | undefined;

  if (summary) {
    const sumResults = ensureArray(summary.result);
    for (const sr of sumResults) {
      const name = sr['@_name'];
      const val = sr['@_value'];
      if (name === 'bestwith' && val) bestWith = val;
      if (name === 'recommmendedwith' && val) recommendedWith = val;
    }
  }

  return {
    totalVotes,
    bestWith,
    recommendedWith,
    results,
  };
}

function parsePlayerAgePoll(polls: BggRawPoll[]): BggPlayerAgePoll | undefined {
  const poll = polls.find((p) => p['@_name'] === 'suggested_playerage');
  if (!poll) return undefined;

  const totalVotes = parseAttrNumber(poll['@_totalvotes']) || 0;
  const rawResultsGroup = ensureArray(poll.results);

  const allResults: BggPlayerAgePollResult[] = [];
  let maxVotes = 0;
  let topAge: string | undefined;

  for (const group of rawResultsGroup) {
    const rawResults = ensureArray(group.result);
    for (const res of rawResults) {
      const age = res['@_value'] || '';
      const numVotes = parseAttrNumber(res['@_numvotes']) || 0;
      if (!age) continue;

      const percentage = totalVotes > 0 ? Math.round((numVotes / totalVotes) * 100) : 0;
      if (numVotes > 0) {
        allResults.push({
          age,
          numVotes,
          percentage,
        });
        if (numVotes > maxVotes) {
          maxVotes = numVotes;
          topAge = age;
        }
      }
    }
  }

  return {
    totalVotes,
    suggestedAge: topAge ? `${topAge}+` : undefined,
    results: allResults,
  };
}

export function parseBggThingXml(xmlString: string): BggThingDetails | null {
  if (!xmlString || typeof xmlString !== 'string') return null;

  try {
    const parser = createBggXmlParser();
    const parsed = parser.parse(xmlString) as BggRawResponse;

    const rawItems = ensureArray(parsed?.items?.item);
    if (rawItems.length === 0) return null;

    const item: BggRawItem = rawItems[0];
    const id = Number(item['@_id']);
    if (Number.isNaN(id)) return null;

    const names: BggRawName[] = ensureArray(item.name);
    const primaryNameObj = names.find((n) => n['@_type'] === 'primary');
    const primaryName = decodeHtmlEntities(
      primaryNameObj?.['@_value'] || names[0]?.['@_value'] || `Thing ${id}`
    );

    const alternateNames = names
      .filter((n) => n['@_type'] === 'alternate' && n['@_value'])
      .map((n) => decodeHtmlEntities(n['@_value'] as string));

    const links: BggRawLink[] = ensureArray(item.link);
    const getLinksByType = (type: string): string[] =>
      links
        .filter((l) => l['@_type'] === type && l['@_value'])
        .map((l) => decodeHtmlEntities(l['@_value']));

    const getEntityLinksByType = (type: string): BggEntityLink[] =>
      links
        .filter((l) => l['@_type'] === type && l['@_value'] && l['@_id'] !== undefined)
        .map((l) => ({
          id: Number(l['@_id']),
          name: decodeHtmlEntities(l['@_value']),
        }))
        .filter((item) => !Number.isNaN(item.id));

    const rawVersions: BggRawVersionItem[] = ensureArray(item.versions?.item);
    const versions: BggGameVersion[] = rawVersions.map((v) => {
      const vId = Number(v['@_id']);
      const vNames: BggRawName[] = ensureArray(v.name);
      const vPrimaryName =
        vNames.find((n) => n['@_type'] === 'primary')?.['@_value'] ||
        vNames[0]?.['@_value'] ||
        `Version ${vId}`;

      const vLinks: BggRawLink[] = ensureArray(v.link);
      const langLink = vLinks.find((l) => l['@_type'] === 'language');
      const pubLink = vLinks.find((l) => l['@_type'] === 'boardgamepublisher');

      const canonical = parseAttrValue(v.canonicalname);

      return {
        id: vId,
        name: decodeHtmlEntities(vPrimaryName),
        canonicalName: canonical ? decodeHtmlEntities(canonical) : undefined,
        language: langLink?.['@_value'] ? decodeHtmlEntities(langLink['@_value']) : undefined,
        publisher: pubLink?.['@_value'] ? decodeHtmlEntities(pubLink['@_value']) : undefined,
        yearPublished: parseAttrNumber(v.yearpublished),
        thumbnail: v.thumbnail,
        image: v.image,
      };
    });

    const description = decodeHtmlEntities(item.description || '').trim();

    const polls = ensureArray(item.poll);
    const pollSummaries = ensureArray(item['poll-summary']);

    const playerCountPoll = parsePlayerCountPoll(polls, pollSummaries);
    const playerAgePoll = parsePlayerAgePoll(polls);

    return {
      id,
      type: item['@_type'] || 'boardgame',
      primaryName,
      alternateNames,
      thumbnail: item.thumbnail,
      image: item.image,
      description,
      yearPublished: parseAttrNumber(item.yearpublished),
      minPlayers: parseAttrNumber(item.minplayers),
      maxPlayers: parseAttrNumber(item.maxplayers),
      playingTime: parseAttrNumber(item.playingtime),
      minPlayTime: parseAttrNumber(item.minplaytime),
      maxPlayTime: parseAttrNumber(item.maxplaytime),
      minAge: parseAttrNumber(item.minage),
      categories: getEntityLinksByType('boardgamecategory'),
      mechanics: getEntityLinksByType('boardgamemechanic'),
      families: getLinksByType('boardgamefamily'),
      designers: getEntityLinksByType('boardgamedesigner'),
      artists: getLinksByType('boardgameartist'),
      publishers: getLinksByType('boardgamepublisher'),
      versions,
      playerCountPoll,
      playerAgePoll,
    };
  } catch (err) {
    console.error('Error parsing BGG XML:', err);
    return null;
  }
}
