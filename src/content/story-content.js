export function createStoryContent({ THREE, DATA, CLIMATE, linearSlope, signed }) {
  const territories = Object.keys(DATA.extra).sort((a, b) => a.localeCompare(b));
  const regions = ["All", "Melanesia", "Micronesia", "Polynesia"];
  const PLAYER_NAME = "Malia";
  
  const STATIONS = [
    {
      id: "land",
      short: "Land",
      title: "Land temperature",
      kicker: "Field station 1",
      label: "Land records",
      guide: "Dr. Afi Leka",
      role: "land climate researcher",
      color: "#d96b50",
      position: new THREE.Vector3(-17, 0, -8.2),
      npc: "guideLand",
      metrics: ["landTemp"],
      greeting: "I work with long records, not straight stories. Start with the fitted slope.",
      callout: "the long record is ready",
      lead: "The regional warming signal is unusually consistent.",
      explanation: "All 22 monitored territories have a positive fitted surface-temperature trend. This describes the average direction of the supplied record, not a rise in every individual year.",
      term: "Fitted trend",
      definition: "A straight line fitted through the observations. Its slope summarises the average direction and rate over the stated years.",
      evidence: {
        question: "Is warming isolated, or regional?",
        paragraphs: [
          "The fitted slope is positive in all 22 territory records. The estimates range from about +0.23°C to +0.44°C per century, so the important result is the agreement in direction, not a league table of small differences.",
          "These lines summarise records from 1850 to 2025. They do not say that every year was warmer than the one before it.",
        ],
        highlights: [["22 of 22", "positive fitted trends"], ["+0.23 to +0.44°C", "estimated change per century"], ["1850 to 2025", "period analysed"]],
      },
      followUp: [
        { speaker: PLAYER_NAME, text: "So the strongest finding is not which territory ranks first. It is that all 22 fitted trends point upward." },
        { speaker: "Dr. Afi Leka", text: "Exactly. Keep the rate and the caveat together: a fitted long-term trend is not a claim about every individual year." },
      ],
    },
    {
      id: "ocean",
      short: "Ocean",
      title: "Ocean conditions",
      kicker: "Field station 2",
      label: "Ocean records",
      guide: "Sela Vuki",
      role: "lagoon monitor",
      color: "#347f9e",
      position: new THREE.Vector3(15.5, 0, -21.5),
      npc: "guideOcean",
      metrics: ["sst", "seaLevel"],
      greeting: "I watch the lagoon, but today we need two regional records: surface heat and water level.",
      callout: "two ocean signals need comparing",
      lead: "The ocean carries two aligned physical signals.",
      explanation: "Every territory with observations has a positive sea-surface-temperature trend, and every monitored territory has a positive satellite-era sea-level trend. They use different units and remain separate measures.",
      term: "Anomaly",
      definition: "A departure from a reference average. An anomaly series shows relative change more clearly than absolute temperature or water height.",
      evidence: {
        question: "Do two ocean records tell the same directional story?",
        paragraphs: [
          "All 21 territories with sea-surface-temperature observations have positive fitted trends. The same 21 monitored waterlines also rise during the satellite-era sea-level record.",
          "The two directions are consistent across observed territories. They still remain separate evidence: one is temperature per century, the other is millimetres per year.",
        ],
        highlights: [["21 of 21", "sea surfaces warming"], ["21 of 21", "waterlines rising"], ["1993 to 2023", "sea-level period"]],
      },
      followUp: [
        { speaker: PLAYER_NAME, text: "Both ocean measures point in the same direction, but I should not combine their units into one score." },
        { speaker: "Sela Vuki", text: "Right. Their agreement strengthens the physical signal. Keeping them separate keeps the result honest." },
      ],
    },
    {
      id: "rain",
      short: "Rain",
      title: "Rainfall direction",
      kicker: "Field station 3",
      label: "Rain records",
      guide: "Officer Noa",
      role: "emergency coordinator",
      color: "#397fa5",
      position: new THREE.Vector3(-17, 0, 10.5),
      npc: "guideRain",
      metrics: ["rain"],
      greeting: "Emergency plans fail when they assume every island gets the same rainfall change.",
      callout: "rain refuses one regional answer",
      lead: "Rainfall is where the shared story breaks apart.",
      explanation: "Fifteen territories have an upward fitted rainfall-anomaly trend and seven have a downward trend. A regional climate response therefore still needs territory-specific planning.",
      term: "Rainfall anomaly",
      definition: "The difference from a reference average. Positive and negative values show wetter and drier departures, not total rainfall.",
      evidence: {
        question: "Does rainfall follow the regional warming pattern?",
        paragraphs: [
          "No single direction fits the supplied rainfall records. Fifteen territories have an upward fitted rainfall-anomaly trend and seven have a downward trend from 1979 to 2025.",
          "A regional average would hide that split. The useful finding is heterogeneity: rainfall planning must remain territory-specific even when heat and ocean signals agree regionally.",
        ],
        highlights: [["15", "upward rainfall trends"], ["7", "downward rainfall trends"], ["1979 to 2025", "period analysed"]],
      },
      followUp: [
        { speaker: PLAYER_NAME, text: "The warming signal is shared, but rainfall divides 15 upward and 7 downward." },
        { speaker: "Officer Noa", text: "That split is the planning result. Regional warming does not remove the need for local rainfall evidence." },
      ],
    },
    {
      id: "life",
      short: "Life",
      title: "Living shoreline",
      kicker: "Field station 4",
      label: "Living systems",
      guide: "Litia Katoa",
      role: "biodiversity officer",
      color: "#4f8b68",
      position: new THREE.Vector3(10, 0, 13),
      npc: "guideLife",
      metrics: ["redlist"],
      greeting: "My record asks a different question: how has the overall extinction-risk index moved since 1993?",
      callout: "this warning needs careful wording",
      lead: "The ecological warning is serious, but it is a separate result.",
      explanation: "Twenty of 22 territories end 2024 below their 1993 Red List Index value. This is a broad pattern in aggregate extinction risk and remains separate from the physical climate indicators.",
      term: "Red List Index",
      definition: "An index of change in aggregate extinction risk. Lower values mean greater overall risk. It is not a count of animals or species lost.",
      evidence: {
        question: "What does the biodiversity record add?",
        paragraphs: [
          "Twenty of 22 territories have a lower Red List Index endpoint in 2024 than in 1993. One is unchanged and one is higher. The broad direction is therefore a serious ecological warning.",
          "This is a separate indicator. Reading it beside the land, ocean and rainfall records gives the regional picture another dimension without merging unlike measures.",
        ],
        highlights: [["20 of 22", "lower endpoints"], ["1 unchanged", "American Samoa"], ["1 higher", "Niue"]],
      },
      followUp: [
        { speaker: PLAYER_NAME, text: "Most endpoints are lower. I will present that as a biodiversity pattern beside the climate patterns." },
        { speaker: "Litia Katoa", text: "Good. Keep the measures distinct, then explain why they deserve attention together." },
      ],
    },
  ];
  
  const CONCLUSION = {
    id: "conclusion",
    short: "Conclusion",
    title: "What the records say together",
    kicker: "Conclusion",
    lead: "Some signals align across the Pacific. Others remain local.",
    explanation: "Land temperature, sea-surface temperature and sea level share an upward direction. Rainfall splits between territories, while the Red List Index adds a separate regional pattern in biodiversity risk.",
  };
  
  const GUIDE_MALIA_LINES = {
    land: ["Let me see how widely that direction is shared.", "I want to compare the slopes, not just the warmest-looking year.", "I have the land pattern. Next I need to test it against the ocean record."],
    ocean: ["Show me whether both ocean measures point the same way.", "I will keep temperature and water level in their own units.", "The ocean pattern aligns. Rainfall is the next test."],
    rain: ["Let me count how many territories move in each direction.", "A single regional rainfall answer would hide that split.", "This is the local part of the story. Now I need the life chapter."],
    life: ["Show me how the index endpoints compare across territories.", "I will read this as its own regional pattern.", "Now I can place four distinct records beside one another."],
  };
  
  const ANIMAL_NOTE_CHAPTER = {
    beaver: "rain", bee: "land", bunny: "rain", cat: "land", caterpillar: "life", chick: "land",
    cow: "rain", crab: "ocean", deer: "land", dog: "conclusion", elephant: "rain", fish: "ocean",
    fox: "land", giraffe: "land", hog: "rain", koala: "life", lion: "land", monkey: "life",
    panda: "life", parrot: "rain", penguin: "ocean", pig: "rain", polar: "ocean", tiger: "land",
  };
  
  const TOWN_NOTE_CHAPTER = {
    "character-female-c": "life",
    "character-female-e": "rain",
    "character-female-f": "conclusion",
    "character-male-b": "ocean",
    "character-male-d": "life",
    "character-male-f": "rain",
  };
  
  const ANIMAL_PROFILES = {
    beaver: { name: "Biscuit", sound: "Chkk chkk", habit: "I inspect every bridge twice. Once for safety, once for snacks.", clue: "The lake edge leaves a new line after heavy rain.", punch: "I would file a report, but I ate the clipboard." },
    bee: { name: "Aunty Bzz", sound: "Bzzzz", habit: "I run the smallest air-traffic service in town.", clue: "Flowers open on their own schedule. Warmer days can shift the timetable.", punch: "Please rate your flight. Five flowers preferred." },
    bunny: { name: "Nibbles", sound: "Sniff sniff", habit: "I count clouds until a carrot interrupts me.", clue: "Some gardens need more watering now, but the rain record differs by island.", punch: "My climate model is mostly carrots. It has excellent crunch resolution." },
    cat: { name: "Mr. Miso", sound: "Meow meow", habit: "I supervise the village from whichever chair is warmest.", clue: "The sea breeze arrives warm. I have filed a complaint with the sun.", punch: "Meeting adjourned. I must sit on something important." },
    caterpillar: { name: "Captain Wiggle", sound: "Wiggle wiggle", habit: "I measure distance in leaves.", clue: "Plants notice heat and rain together, even when charts separate them.", punch: "My five-year plan is to become dramatically airborne." },
    chick: { name: "Peep", sound: "Peep peep", habit: "I wake up before the rooster and take full credit.", clue: "Hot afternoons send everyone looking for shade, including tiny experts.", punch: "I am not small. The island is unusually large." },
    cow: { name: "Mabel Moo", sound: "Moooo", habit: "I keep the grass short in one very specific patch.", clue: "Dry spells change where the greenest grazing survives.", punch: "My research is peer reviewed by three goats. We have no goats." },
    crab: { name: "Sir Sideways", sound: "Click click", habit: "Forward is a fad. Sideways has worked for millions of years.", clue: "A rising waterline makes the safe strip of beach narrower.", punch: "I tried walking straight once. Terrible branding." },
    deer: { name: "Fern", sound: "Huff", habit: "I know every quiet path and exactly which flowers are off limits.", clue: "Dense planting keeps the village cooler than bare ground.", punch: "If anyone asks, I was never near the hibiscus." },
    dog: { name: "Koa", sound: "Woof woof", habit: "I patrol the path. The path has not escaped yet.", clue: "People notice change locally before a regional average explains it.", punch: "I found a stick. The investigation is now extremely serious." },
    elephant: { name: "Motu", sound: "Prrrrooot", habit: "I remember every rainfall chart and most birthdays.", clue: "One wet year is not a trend. The long record shows the direction more clearly.", punch: "I never forget. Except why I walked over here." },
    fish: { name: "Bubbles", sound: "Blub blub", habit: "I live below the chart axis.", clue: "The sea can warm even when the surface still looks calm.", punch: "Water is not wet from in here. Please update your notes." },
    fox: { name: "Saffron", sound: "Yip", habit: "I know shortcuts that are legally just longcuts.", clue: "Hedges and trees slow hot wind and make useful pockets of shade.", punch: "That path was definitely always there." },
    giraffe: { name: "Telescope", sound: "Hmmmm", habit: "I provide free cloud inspections from the upper atmosphere.", clue: "A broad view shows the shared warming signal. Ground level shows local differences.", punch: "The forecast up here is mostly leaves." },
    hog: { name: "Truffle", sound: "Honk snort", habit: "I locate buried treasure. So far it is mostly roots.", clue: "Healthy soil holds water better during dry periods.", punch: "This was a scientific hole before anyone asks." },
    koala: { name: "Naps", sound: "Mrrrp", habit: "I study rest as a renewable resource.", clue: "Heat changes when animals feed, move and sleep.", punch: "I will finish this sentence after a brief eight-hour review." },
    lion: { name: "Sunny", sound: "Rrrr", habit: "I practice majestic poses near the fountain.", clue: "Shade is simple infrastructure when hotter days become common.", punch: "The mane is natural. The confidence is heavily rehearsed." },
    monkey: { name: "Mango", sound: "Ooh ah", habit: "I test fruit ripeness with rigorous sampling.", clue: "Useful trees make a village cooler while also providing food and materials.", punch: "One mango is data. Six mangoes are lunch." },
    panda: { name: "Pebble", sound: "Mmph", habit: "I bring calm to meetings by eating through them.", clue: "Biodiversity indicators describe risk across many species, not one mascot.", punch: "I support nuance, especially with snacks." },
    parrot: { name: "Radio", sound: "Climate bulletin! Climate bulletin!", habit: "I repeat only the most important rumours.", clue: "Warming is widespread. Rainfall is the part that refuses one regional answer.", punch: "This bulletin will repeat in three, two, three, two..." },
    penguin: { name: "Chilly Bin", sound: "Honk", habit: "I operate the village's least successful ice shop.", clue: "A warmer ocean affects places far beyond the warmest islands.", punch: "Today's special is room-temperature snow." },
    pig: { name: "Taro", sound: "Oink", habit: "I guard the garden by taste-testing it.", clue: "Taro patches and other gardens depend on local water conditions.", punch: "The missing lunch is an unresolved statistical anomaly." },
    polar: { name: "Snowcone", sound: "Huff huff", habit: "I booked a tropical holiday and committed to the outfit.", clue: "Climate connections cross enormous distances, even when experiences differ.", punch: "I asked for extra ice. The ocean said no." },
    tiger: { name: "Stripey", sound: "Rrrrow", habit: "I count trends. Stripes are still beyond my sample size.", clue: "A consistent direction across territories is stronger evidence than one isolated series.", punch: "My confidence interval is approximately this many paws wide." },
  };
  
  const ANIMAL_MALIA_LINES = {
    beaver: ["A bridge inspector with snack priorities. Sensible.", "What do you watch beside the bridge?", "That water mark belongs in my rain notes.", "Any advice that survived the clipboard?", "I will bring the next report on a less edible surface."],
    bee: ["Your flight schedule looks busier than the harbour.", "What changes your flower route?", "Flower timing gives me a small local observation to record.", "How does a passenger earn five flowers?", "I will leave a glowing review and keep my distance from the runway."],
    bunny: ["The carrot is clearly chairing this interview.", "What have you noticed in the gardens?", "Different rainfall directions mean different watering decisions.", "Does the carrot model have one final result?", "Crunch resolution sounds expensive, but memorable."],
    cat: ["Mr. Miso, your supervision appears mostly horizontal.", "What reaches the warmest chair first?", "I will compare that warm breeze with the temperature record.", "May I quote the chair supervisor?", "Meeting noted. Important object sitting may resume."],
    caterpillar: ["Leaves are an excellent unit for a very small surveyor.", "What do the plants around you respond to?", "Heat and rain belong in the same conversation, even when their charts stay separate.", "What comes after the leaf survey?", "Dramatically airborne is a strong career plan."],
    chick: ["Early, loud and taking credit. You will do well in meetings.", "Where do tiny experts go in the afternoon?", "Shade is a daily village need I can mark down.", "How large is your study area?", "Of course. The island needs to adjust its scale."],
    cow: ["That patch is impressively well managed, Mabel.", "Where does the best grass remain green?", "Grazing conditions give the rainfall discussion a practical edge.", "Did the goat reviewers approve?", "No goats, unanimous review. Convenient."],
    crab: ["Sideways certainly makes the entrance more distinctive.", "What do you watch along the beach?", "A narrowing dry strip makes the waterline trend easier to picture.", "Will you demonstrate the straight walk?", "Brand protected. Demonstration cancelled."],
    deer: ["I will respect the quiet path and ask no flower questions.", "Where does the village feel coolest?", "Dense planting is worth noting beside the heat record.", "Anything else from the forbidden-flower district?", "Your hibiscus alibi is now extremely suspicious."],
    dog: ["Excellent patrol work. The path remains captured.", "What do people notice before opening a chart?", "Local observations can tell me where to look more closely.", "Any breakthrough in the investigation?", "A stick changes everything. Proceed carefully."],
    elephant: ["Rainfall charts and birthdays is a formidable archive.", "Why do you keep the long record?", "One loud year should not speak for the full line.", "What was the final thing you remembered?", "We can return to it after you remember why you came."],
    fish: ["Below the axis is an unusual research address.", "What does a calm surface hide?", "Appearance and the measured temperature line can tell different stories.", "Any correction for my field notes?", "I have amended the philosophical status of wetness."],
    fox: ["A longcut with confidence is still a useful tour.", "Where do your shortcuts feel coolest?", "Hedges and trees give me a clear village design note.", "Was that path truly always there?", "I see. The map must have moved."],
    giraffe: ["Finally, an observation deck with no stairs.", "What changes when you look from high up?", "The regional view and the ground view answer different parts of our question.", "What is the forecast at leaf height?", "Mostly leaves is at least a confident forecast."],
    hog: ["Roots are treasure if lunch is the research question.", "What do you notice in the soil?", "Soil and water storage belong in my local planning notes.", "Is the latest hole peer reviewed?", "Scientific status accepted, pending cleanup."],
    koala: ["Renewable rest may be the village's best funded programme.", "When do you change your daily routine?", "Animal routines give the heat discussion a living detail.", "Can I have one final sentence?", "I will return after the eight-hour review window."],
    lion: ["The fountain has found its official portrait artist.", "Where does everyone gather on hot afternoons?", "Shade deserves a place in the town plan, not only in conversation.", "How much rehearsal does majesty require?", "The pose is convincing. The rehearsal remains classified."],
    monkey: ["Rigorous sampling seems to have removed most of the fruit.", "Which trees earn a place near the paths?", "Food, materials and shade make those trees useful in several ways.", "How many mangoes finish the survey?", "Six. A remarkably delicious sample size."],
    panda: ["Eating through meetings may improve their average length.", "What should I remember about the life chapter?", "One index summarises a broad pattern, not the fate of one mascot.", "Any final nuance before the next snack?", "Nuance recorded with appropriate crumbs."],
    parrot: ["Your bulletin has excellent volume and no off switch.", "What is the headline in one sentence?", "Shared warming and divided rainfall is the comparison I am following.", "Will this bulletin now conclude?", "Apparently the countdown is also on repeat."],
    penguin: ["A tropical ice shop is brave market positioning.", "What does the ocean record mean beyond this beach?", "The ocean pattern connects distant territories without making them identical.", "What is today's coldest item?", "Room-temperature snow explains the empty queue."],
    pig: ["Taste-testing is an ambitious definition of guarding.", "What do the garden beds need from the weather?", "Local water conditions turn rainfall direction into a practical question.", "Any progress on the missing lunch?", "I will mark the case unresolved and wipe the crumbs from the file."],
    polar: ["The outfit commits fully to the tropical holiday.", "What connects this island with faraway places?", "Distance does not erase the shared physical signals or the local differences.", "Did the extra ice ever arrive?", "Request denied by the ocean. Complaint noted."],
    tiger: ["Counting stripes may require a larger research grant.", "What makes a regional pattern persuasive?", "Agreement across many territory records matters more than one dramatic line.", "How wide is that confidence interval again?", "Approximately four paws. Very technical."],
  };
  
  const TOWN_PROFILES = {
    "character-female-c": { name: "Aunty Sina", role: "agroforestry steward", lines: [
      ["This blue dress is my meeting outfit. The soil still gets the final vote.", "Coconut, food trees and pandanus belong beside homes and paths, where people use them every day."],
      ["On hot afternoons, everyone chooses the shaded path.", "Layered planting offers shade, food and habitat in the same small space."],
      ["Your chart tells me where the temperature line points.", "My question is what a useful village response looks like on the ground."],
    ], responses: [
      "The garden is part of the climate plan, not scenery.",
      "So shade, food and habitat can be planned together.",
      "That is adaptation people use every day.",
    ], final: "Planting decisions are where the climate record enters daily life." },
    "character-female-e": { name: "Dr. Ana Vea", role: "community doctor", lines: [
      ["The white coat is clean. The clinic thermometer is less cooperative.", "On the hottest afternoons, outdoor workers arrive tired, dizzy and needing water."],
      ["Rainfall trends differ, but safe water matters everywhere.", "A wet month can bring contamination while a dry spell strains storage. Local planning has to know which problem it faces."],
      ["Clinic notes record daily experience.", "They show why a regional temperature direction matters differently from one household to the next."],
    ], responses: [
      "Heat becomes a health problem long before it becomes a headline.",
      "So the rainfall response has to match the local water risk.",
      "The regional line becomes clearer when I also understand daily conditions.",
    ], final: "Read the regional trend beside local health and water conditions." },
    "character-female-f": { name: "Lea Talanoa", role: "community reporter", lines: [
      ["A bright jacket helps people find the reporter they meant to avoid.", "My first question is always whether one unusual year is shouting over the full record."],
      ["A blank is not zero.", "It is an unanswered question, and an honest chart leaves it blank."],
      ["Write the clearest conclusion the numbers support.", "Then stop. Extra certainty only makes the sentence louder, not better."],
    ], responses: [
      "A reporter should distrust the loudest year.",
      "An honest gap is better than a false zero.",
      "A strong ending also needs restraint.",
    ], final: "If the data leaves a gap, leave the gap." },
    "character-male-b": { name: "Kele Vaka", role: "canoe builder", lines: [
      ["A canoe reads wind, current and weight at once.", "The climate story also needs several signals without pretending they are the same measure."],
      ["I mark the waterline on the posts every season.", "Even a small yearly rate matters when homes and roads sit close to the shore."],
      ["Good work survives rough water.", "Keep the interaction simple enough that the evidence stays visible."],
    ], responses: [
      "Different signals can point toward one larger problem.",
      "A few millimetres each year matter beside homes and roads.",
      "The design should never bury the evidence.",
    ], final: "Keep the signals separate, then explain what they mean together." },
    "character-male-d": { name: "Maxim Margin", role: "resort development executive", lines: [
      ["Wonderful news: the wet path is now a premium waterfront experience.", "The repair bill is an externality, which is finance for someone else's problem."],
      ["I have classified the beach vegetation as underperforming real estate.", "Once cleared, shareholders will enjoy an unobstructed view of the erosion."],
      ["Biodiversity is difficult to place on a quarterly dashboard.", "I proposed replacing every warning sign with a branded QR code. Marketing called it restoration."],
    ], responses: [
      "You mean the village pays while the resort keeps the view.",
      "That is erosion, Maxim, not a shareholder benefit.",
      "A QR code is not an ecological plan.",
    ], final: "Do look around, Malia. I am told the coastal trees have filed another objection." },
    "character-male-f": { name: "Timo Vai", role: "water systems caretaker", lines: [
      ["The fountain is the village meeting point and my loudest colleague.", "Shared spaces make information easier to exchange."],
      ["Water systems need maintenance before a crisis.", "Preparedness is less dramatic than repair, which is exactly the point."],
      ["If the fountain starts giving statistical advice, turn the blue valve.", "The red valve makes it invent one regional rainfall answer."],
    ], responses: [
      "So the fountain is infrastructure and a noticeboard.",
      "Maintenance before failure. That is the useful lesson.",
      "I am writing down blue valve.",
    ], final: "Check the water systems before the next crisis, not during it." },
  };
  
  const TOWN_CHARACTER_ASSETS = [
    "character-female-c",
    "character-female-e",
    "character-female-f",
    "character-male-b",
    "character-male-d",
    "character-male-f",
  ];
  
  function validateCharacterProfiles() {
    TOWN_CHARACTER_ASSETS.forEach((assetName) => {
      const profile = TOWN_PROFILES[assetName];
      if (!profile) throw new Error(`Missing town profile for ${assetName}`);
      if (!profile.name || !profile.role || !profile.final) throw new Error(`Incomplete town identity for ${assetName}`);
      if (profile.lines?.length !== 3 || profile.responses?.length !== 3) throw new Error(`Town dialogue for ${assetName} must contain three conversations and three player responses`);
      profile.lines.forEach((pair, index) => {
        if (!Array.isArray(pair) || pair.length !== 2 || pair.some((line) => !line)) throw new Error(`Invalid conversation ${index + 1} for ${assetName}`);
      });
    });
    STATIONS.forEach((station) => {
      if (!station.guide || !station.role || !station.greeting || !station.lead || !station.explanation) throw new Error(`Incomplete field guide profile for ${station.id}`);
    });
    const names = [
      ...TOWN_CHARACTER_ASSETS.map((assetName) => TOWN_PROFILES[assetName].name),
      ...STATIONS.map((station) => station.guide),
      PLAYER_NAME,
      "Professor Piko Puddlejump",
    ];
    if (new Set(names).size !== names.length) throw new Error("Character names must be unique");
  }
  
  const METRICS = {
    landTemp: {
      label: "Surface temperature",
      title: "All monitored territories are warming",
      subtitle: "Fitted surface-temperature trend, 1850 to 2025",
      unit: "°C per century",
      note: "A positive trend does not mean every year was warmer than the year before.",
      color: "#d96b50",
      value: (name) => DATA.extra[name]?.temp_trend_per_century,
      format: (value) => `${signed(value, 2)}°C`,
    },
    sst: {
      label: "Sea-surface temperature",
      title: "The sea surface is warming too",
      subtitle: "Fitted sea-surface-temperature trend, 1850 to 2025",
      unit: "°C per century",
      note: "Pitcairn has no observation in this file and is omitted rather than treated as zero.",
      color: "#d96b50",
      value: (name) => CLIMATE.sst_trend_per_century[name],
      format: (value) => `${signed(value, 2)}°C`,
    },
    seaLevel: {
      label: "Sea level",
      title: "Every monitored waterline is rising",
      subtitle: "Fitted satellite-era sea-level trend, 1993 to 2023",
      unit: "millimetres per year",
      note: "This is a measured rate in the supplied record, not a shoreline forecast.",
      color: "#347f9e",
      value: (name) => DATA.extra[name]?.sea_level_trend_mm_yr,
      format: (value) => `${signed(value, 1)} mm/yr`,
    },
    rain: {
      label: "Rainfall trend",
      title: "Rainfall moves in both directions",
      subtitle: "Fitted rainfall-anomaly trend, 1979 to 2025",
      unit: "anomaly points per year",
      note: "Blue shows an upward trend and ochre a downward trend. Neither colour is labelled as universally good or bad.",
      color: "#397fa5",
      negativeColor: "#c17b55",
      value: (name) => linearSlope(DATA.extra[name]?.rainfall_series || []),
      format: (value) => signed(value, 2),
    },
    redlist: {
      label: "Red List change",
      title: "Most territories end below where they began",
      subtitle: "Change in Red List Index, 1993 to 2024",
      unit: "index-point change",
      note: "This compares the 1993 and 2024 endpoints. The path between them may rise or fall from year to year.",
      color: "#4f8b68",
      negativeColor: "#d96b50",
      value: (name) => DATA.redlist_change[name],
      format: (value) => signed(value, 2),
    },
  };
  

  return { territories, regions, PLAYER_NAME, STATIONS, CONCLUSION, GUIDE_MALIA_LINES, ANIMAL_NOTE_CHAPTER, TOWN_NOTE_CHAPTER, ANIMAL_PROFILES, ANIMAL_MALIA_LINES, TOWN_PROFILES, TOWN_CHARACTER_ASSETS, validateCharacterProfiles, METRICS };
}
