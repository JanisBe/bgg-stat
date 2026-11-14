import { parseBggThingXml } from './bgg-xml-parser';

describe('BggXmlParser', () => {
  const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
    <item type="boardgame" id="26997">
        <thumbnail>https://cf.geekdo-images.com/OvhsKPiEWV-GbSRkrxnBGQ__small/img/uH18cVLg1ODpzcjm9e5DKy5YTok=/fit-in/200x150/filters:strip_icc()/pic5281358.jpg</thumbnail>
        <image>https://cf.geekdo-images.com/OvhsKPiEWV-GbSRkrxnBGQ__original/img/w7uKFrdeT8ZQz8_lnHIbWn3M_28=/0x0/filters:format(jpeg)/pic5281358.jpg</image>
        <name type="primary" sortindex="1" value="1989: Dawn of Freedom" />
        <name type="alternate" sortindex="1" value="1989" />
        <name type="alternate" sortindex="1" value="1989: Autumn of Nations" />
        <name type="alternate" sortindex="1" value="1989: Jesień Narodów" />
        <name type="alternate" sortindex="1" value="1989: L&#039;AUBE de la LIBERTÉ" />
        <name type="alternate" sortindex="1" value="1989: L&#039;Aube la Liberté" />
        <name type="alternate" sortindex="1" value="1989: Úsvit svobody" />
        <description>"History punishes those who come too late." - Mikhail Gorbachev

1989: Dawn of Freedom is an exciting, fast paced game simulating the end of the Cold War in 1989.
</description>
        <yearpublished value="2012" />
        <minplayers value="2" />
        <maxplayers value="2" />
        <poll name="suggested_numplayers" title="User Suggested Number of Players" totalvotes="54">
            <results numplayers="1">
                <result value="Best" numvotes="0" />
                <result value="Recommended" numvotes="7" />
                <result value="Not Recommended" numvotes="35" />
            </results>
            <results numplayers="2">
                <result value="Best" numvotes="52" />
                <result value="Recommended" numvotes="0" />
                <result value="Not Recommended" numvotes="0" />
            </results>
            <results numplayers="2+">
                <result value="Best" numvotes="0" />
                <result value="Recommended" numvotes="5" />
                <result value="Not Recommended" numvotes="33" />
            </results>
        </poll>
        <poll-summary name="suggested_numplayers" title="User Suggested Number of Players">
            <result name="bestwith" value="Best with 2 players" />
            <result name="recommmendedwith" value="Recommended with 2 players" />
        </poll-summary>
        <playingtime value="150" />
        <minplaytime value="150" />
        <maxplaytime value="150" />
        <minage value="12" />
        <poll name="suggested_playerage" title="User Suggested Player Age" totalvotes="21">
            <results>
                <result value="2" numvotes="0" />
                <result value="3" numvotes="0" />
                <result value="4" numvotes="0" />
                <result value="5" numvotes="0" />
                <result value="6" numvotes="0" />
                <result value="8" numvotes="0" />
                <result value="10" numvotes="0" />
                <result value="12" numvotes="4" />
                <result value="14" numvotes="10" />
                <result value="16" numvotes="7" />
                <result value="18" numvotes="0" />
                <result value="21 and up" numvotes="0" />
            </results>
        </poll>
        <link type="boardgamecategory" id="1069" value="Modern Warfare" />
        <link type="boardgamecategory" id="1001" value="Political" />
        <link type="boardgamecategory" id="1019" value="Wargame" />
        <link type="boardgamemechanic" id="2080" value="Area Majority / Influence" />
        <link type="boardgamedesigner" id="3877" value="Jason Matthews" />
        <link type="boardgamepublisher" id="52" value="GMT Games" />
        <link type="boardgamepublisher" id="9074" value="Bard Centrum Gier" />
        <versions>
            <item type="boardgameversion" id="241984">
                <thumbnail>https://cf.geekdo-images.com/ehVCVQ8yOxda-0bmWJyQEQ__small/img/kXo-O4Me0ng3bHQrMraXJQNw9CU=/fit-in/200x150/filters:strip_icc()/pic2034055.jpg</thumbnail>
                <image>https://cf.geekdo-images.com/ehVCVQ8yOxda-0bmWJyQEQ__original/img/93y95rPbTJ5BOQqJpmlkFFsDAFw=/0x0/filters:format(jpeg)/pic2034055.jpg</image>
                <canonicalname value="1989: Úsvit svobody"></canonicalname>
                <link type="boardgameversion" id="26997" value="1989: Dawn of Freedom" inbound="true"/>
                <name type="primary" sortindex="1" value="Czech edition" />
                <link type="boardgamepublisher" id="7992" value="MINDOK" />
                <yearpublished value="2014" />
                <link type="language" id="2180" value="Czech" />
            </item>
            <item type="boardgameversion" id="209146">
                <thumbnail>https://cf.geekdo-images.com/UGtWHP2oSwFAXup9Tn_Irg__small/img/buECpEDIIwT3ItQ3-DMDc3gk9Nk=/fit-in/200x150/filters:strip_icc()/pic1660488.jpg</thumbnail>
                <image>https://cf.geekdo-images.com/UGtWHP2oSwFAXup9Tn_Irg__original/img/ZEEdxJ1tZ3zplt6rcEPB0NcWXB8=/0x0/filters:format(jpeg)/pic1660488.jpg</image>
                <canonicalname value="1989: Jesień Narodów"></canonicalname>
                <link type="boardgameversion" id="26997" value="1989: Dawn of Freedom" inbound="true"/>
                <name type="primary" sortindex="1" value="Polish edition" />
                <link type="boardgamepublisher" id="9074" value="Bard Centrum Gier" />
                <yearpublished value="2013" />
                <link type="language" id="2199" value="Polish" />
            </item>
        </versions>
    </item>
</items>`;

  it('should parse BGG XML into BggThingDetails including polls', () => {
    const result = parseBggThingXml(sampleXml);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.id).toBe(26997);
    expect(result.primaryName).toBe('1989: Dawn of Freedom');
    expect(result.yearPublished).toBe(2012);
    expect(result.minPlayers).toBe(2);
    expect(result.maxPlayers).toBe(2);
    expect(result.playingTime).toBe(150);
    expect(result.minAge).toBe(12);

    expect(result.alternateNames).toContain('1989: Jesień Narodów');
    expect(result.alternateNames).toContain("1989: L'AUBE de la LIBERTÉ");

    expect(result.categories).toEqual([
      { id: 1069, name: 'Modern Warfare' },
      { id: 1001, name: 'Political' },
      { id: 1019, name: 'Wargame' },
    ]);
    expect(result.mechanics).toEqual([{ id: 2080, name: 'Area Majority / Influence' }]);
    expect(result.designers).toEqual([{ id: 3877, name: 'Jason Matthews' }]);
    expect(result.publishers).toContain('GMT Games');
    expect(result.publishers).toContain('Bard Centrum Gier');

    // Player Count Poll assertions
    expect(result.playerCountPoll).toBeDefined();
    expect(result.playerCountPoll?.totalVotes).toBe(54);
    expect(result.playerCountPoll?.bestWith).toBe('Best with 2 players');
    expect(result.playerCountPoll?.results.length).toBe(3);

    const for2Players = result.playerCountPoll?.results.find((r) => r.numPlayers === '2');
    expect(for2Players).toBeDefined();
    expect(for2Players?.best).toBe(52);
    expect(for2Players?.bestPercent).toBe(100);

    // Player Age Poll assertions
    expect(result.playerAgePoll).toBeDefined();
    expect(result.playerAgePoll?.totalVotes).toBe(21);
    expect(result.playerAgePoll?.suggestedAge).toBe('14+');
    expect(result.playerAgePoll?.results.length).toBe(3); // 12, 14, 16 have votes > 0

    const age14 = result.playerAgePoll?.results.find((a) => a.age === '14');
    expect(age14?.numVotes).toBe(10);
    expect(age14?.percentage).toBe(48);
  });

  it('should return null for invalid or empty input', () => {
    expect(parseBggThingXml('')).toBeNull();
    expect(parseBggThingXml('<items></items>')).toBeNull();
  });
});
