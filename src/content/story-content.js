export function createStoryContent({ THREE, DATA, CLIMATE, WATER_STORY, WASTEWATER_STORY, linearSlope, signed }) {
  const territories = Object.keys(DATA.extra).sort((a, b) => a.localeCompare(b));
  const regions = ["All", "Melanesia", "Micronesia", "Polynesia"];
  const PLAYER_NAME = "Malia";
  
  const STATIONS = [
    {
      id: "ocean", short: "Around us", title: "The surrounding ocean", kicker: "Water record 1", label: "Ocean signal",
      guide: "Sela Vuki", role: "lagoon monitor", color: "#347f9e", position: new THREE.Vector3(15.5, 0, -21.5), npc: "guideOcean", metrics: ["sst", "seaLevel"],
      greeting: "Freshwater is scarce compared with the ocean around us. Begin by asking whether that surrounding pressure is shared.",
      callout: "start with the water around us", lead: "The surrounding ocean is the common pressure.",
      explanation: "All 21 observed sea-surface-temperature trends point upward. The same 21 monitored sea-level records also have positive fitted trends. The measures use different units and periods, so they remain separate.",
      storyRole: "Every observed territory faces the same upward direction in ocean heat and sea level. The records do not measure saltwater intrusion or local damage, but they establish the shared pressure surrounding island freshwater systems.",
      decision: "Freshwater planning cannot begin with rainfall alone. It must also recognise a warming and rising ocean around the islands.",
      term: "Anomaly", definition: "A departure from a reference average. An anomaly series shows relative change more clearly than absolute temperature or water height.",
      evidence: { question: "Is the ocean signal shared across the observed Pacific?", paragraphs: ["All 21 territories with sea-surface-temperature observations have positive fitted trends. The same 21 monitored sea-level records rise during the satellite-era record.", "The result is consistent in direction, not identical in rate or effect. Ocean temperature is measured per century and sea level in millimetres per year."], highlights: [["21 of 21", "sea surfaces warming"], ["21 of 21", "sea levels rising"], ["1993 to 2023", "sea-level period"]] },
      followUp: [{ speaker: PLAYER_NAME, text: "The surrounding ocean gives a shared warning. Now I need to examine the freshwater people actually depend on." }, { speaker: "Sela Vuki", text: "Start with rain. A common ocean does not guarantee a common freshwater supply." }],
    },
    {
      id: "rain", short: "From the sky", title: "Rainfall has no single direction", kicker: "Water record 2", label: "Rainfall record",
      guide: "Officer Noa", role: "emergency coordinator", color: "#397fa5", position: new THREE.Vector3(-17, 0, 10.5), npc: "guideRain", metrics: ["rain", "rainVariability"],
      greeting: "Many islands depend on rain to replenish freshwater. The record does not offer one Pacific direction.",
      callout: "rain tells twenty-two stories", lead: "The freshwater supply loses the certainty of the ocean signal.",
      explanation: "Fifteen fitted rainfall-anomaly trends point upward and seven point downward. The size of the annual swings also varies considerably between territories.",
      storyRole: "Rainfall differs in both long-term direction and annual variability. The source that replenishes many island freshwater systems therefore has to be read territory by territory.",
      decision: "Storage, drought preparation, drainage and agriculture cannot be planned from a Pacific average. The local rainfall record is essential.",
      term: "Rainfall anomaly", definition: "The difference from a reference average. Positive and negative values show wetter and drier departures, not total rainfall.",
      evidence: {
        question: "Does rain follow the shared ocean direction?",
        paragraphs: ["Fifteen territories have an upward fitted rainfall-anomaly trend and seven have a downward trend from 1979 to 2025.", "A regional average would hide both the split and the different annual swings. The rainfall series must remain visible territory by territory."],
        highlights: [["15", "upward rainfall trends"], ["7", "downward rainfall trends"], ["1979 to 2025", "period analysed"]],
        research: {
          label: "Peer-reviewed context",
          text: "A 2024 study of Tarawa and Kiritimati found significant ocean warming but no significant long-term annual rainfall trend from 1951 to 2023. ENSO variability remained strong, and severe drought was still a freshwater risk. This supports the need to read rainfall locally; it is not part of the challenge-dataset calculation above.",
          citation: "White, Falkland and Redfern (2024)",
          url: "https://doi.org/10.3390/atmos15060666",
        },
      },
      followUp: [{ speaker: PLAYER_NAME, text: "The ocean gives one warning, but rainfall gives twenty-two different freshwater records." }, { speaker: "Officer Noa", text: "And rainfall alone is not security. Find out how many people can use water that is safe and reliably available." }],
    },
    {
      id: "water", short: "Water chain", title: "Water security has two gates", kicker: "Water record 3", label: "Water security",
      guide: "Litia Katoa", role: "water services planner", color: "#3f8f86", position: new THREE.Vector3(10, 0, 13), npc: "guideLife", metrics: ["safeWater", "wastewater"],
      greeting: "An island can be surrounded by water while safe freshwater remains out of reach. This is where the human stakes become visible.",
      callout: "the starting line is unequal", lead: "The freshwater safety net is deeply unequal.",
      explanation: "In the common 2020 comparison, safely managed drinking-water access ranges from 48.11% to 100% across 19 territories. A current SPC SDG 6 measure reports wastewater safely treated for nine territories in 2024, ranging from 7.29% to 79.06%.",
      storyRole: "Water security has two checks: whether people can use safe water, and whether wastewater is treated after use. The challenge data compare drinking-water access in 2020, while the updated SPC reports show wastewater treatment in 2024. They are different years and different indicators, but together they show why access and water-quality management belong in the same conversation.",
      decision: "A practical water plan should protect sources, keep drinking-water services safe, and improve wastewater treatment where the local record shows a gap.",
      term: "Safely managed water", definition: "Drinking water from an improved source that is accessible on premises, available when needed and free from contamination.",
      evidence: { question: "What does water security require at both ends of the system?", paragraphs: ["The common 2020 comparison includes 19 territories. Safely managed drinking-water access ranges from 48.11% in Papua New Guinea to 100% in Nauru, with three territories below 70%.", "The updated SPC SDG 6 release adds nine 2024 territory reports on wastewater safely treated. Those values range from 7.29% in Papua New Guinea to 79.06% in American Samoa. The indicators measure different parts of the system and different years, so this is a water-system warning, not a causal comparison or complete Pacific ranking."], highlights: [["19", "territories with 2020 access values"], ["48.11% to 100%", "safe-water access range"], ["7.29% to 79.06%", "nine 2024 treatment reports"]] },
      followUp: [{ speaker: PLAYER_NAME, text: "The shared ocean warning reaches territories with very different freshwater safety nets." }, { speaker: "Litia Katoa", text: "Exactly. A percentage is not abstract when it describes whether water is safe, close and available when needed." }],
    },
    {
      id: "observations", short: "What we can see", title: "The observing network", kicker: "Water record 4", label: "Observation capacity",
      guide: "Dr. Afi Leka", role: "climate observations researcher", color: "#c17b55", position: new THREE.Vector3(-17, 0, -8.2), npc: "guideLand", metrics: ["stations"],
      greeting: "The most local part of the freshwater problem needs local observations. Count the fixed land stations that meet WMO standards.",
      callout: "some records have very few eyes", lead: "The places needing local answers are not observed equally.",
      explanation: "The 2026 indicator covers 18 territories and ranges from zero to eight WMO-compliant fixed land stations. Three report zero and five report one or fewer.",
      storyRole: "Rainfall needs local interpretation, yet five reporting territories have one compliant fixed land station or fewer. The count is not a complete measure of observation and does not judge whether a network is adequate.",
      decision: "The uneven count makes sustained observation, maintenance and data sharing part of freshwater preparedness, not a technical footnote.",
      term: "Compliant station", definition: "A fixed land climate-observation station counted by the official indicator as complying with World Meteorological Organization standards.",
      evidence: { question: "How even is the formal climate-observation network?", paragraphs: ["The 2026 comparison includes 18 territories. Fiji reports eight compliant fixed land stations, while Nauru, Niue and Pitcairn report zero. Palau and Tokelau report one each.", "Raw station counts do not account for territory size, island dispersion or observing needs. They describe the recorded network, not whether each network is sufficient."], highlights: [["18", "territories reported"], ["0 to 8", "station range"], ["5", "with one or fewer"]] },
      followUp: [{ speaker: PLAYER_NAME, text: "The most local part of the story depends on an observing network that is itself uneven." }, { speaker: "Dr. Afi Leka", text: "Do not call a network adequate from this count alone, but do not leave observation out of the conclusion." }],
    },
  ];

  const CONCLUSION = { id: "conclusion", short: "Conclusion", title: "Freshwater security has two gates", kicker: "Conclusion", lead: "Freshwater security is a chain, not a single number.", explanation: "A shared warming and rising ocean meets different rainfall records, unequal access to safely managed drinking water, limited wastewater-treatment reports and an uneven formal observing network." };

  const GUIDE_MALIA_LINES = {
    ocean: ["Let me compare ocean heat and sea level without combining their units.", "Both measures move upward across every observed territory.", "That is the shared pressure. Now I need to follow the freshwater."],
    rain: ["Let me compare direction and annual variability.", "A regional average would erase the differences freshwater planning depends on.", "Rain does not follow one Pacific path. I need to compare that supply with the water people can safely use."],
    water: ["Show me the common 2020 comparison first.", "The gap is not a technical detail. It describes who can use safe water.", "Safe water at home is one gate. Wastewater treatment after use is the other."],
    observations: ["Let me count the formal stations without calling the count a measure of adequacy.", "Five reporting territories have one compliant fixed land station or fewer.", "Now the warning is complete: shared ocean pressure, different rain, unequal access and uneven observation."],
  };

  const ANIMAL_NOTE_CHAPTER = {
    beaver: "rain", bee: "observations", bunny: "rain", cat: "water", caterpillar: "water", chick: "water",
    cow: "water", crab: "ocean", deer: "water", dog: "water", elephant: "rain", fish: "ocean",
    fox: "observations", giraffe: "observations", hog: "water", koala: "water", lion: "observations", monkey: "water",
    panda: "water", parrot: "rain", penguin: "ocean", pig: "water", polar: "ocean", tiger: "ocean",
  };

  const TOWN_NOTE_CHAPTER = {
    "character-female-c": "water", "character-female-e": "rain", "character-female-f": "conclusion",
    "character-male-b": "ocean", "character-male-d": "water", "character-male-f": "water",
  };
  
  const ANIMAL_PROFILES = {
    beaver: { name: "Biscuit", sound: "Chkk chkk", habit: "I inspect every bridge twice. Once for safety, once for snacks.", clue: "The lake edge leaves a new line after heavy rain.", punch: "I would file a report, but I ate the clipboard." },
    bee: { name: "Aunty Bzz", sound: "Bzzzz", habit: "I run the smallest flower patrol in town.", clue: "I can notice a dry flower bed, but a station keeps the long record people can compare.", punch: "Please rate your flight. Five flowers preferred." },
    bunny: { name: "Nibbles", sound: "Sniff sniff", habit: "I count clouds until a carrot interrupts me.", clue: "Some gardens need more watering now, but the rain record differs by island.", punch: "My rain notes are mostly carrot juice. Very hard to read." },
    cat: { name: "Mr. Miso", sound: "Meow meow", habit: "I supervise the village from whichever chair is warmest.", clue: "A full bowl is not the same as water that is safe and available whenever it is needed.", punch: "Meeting adjourned. I must sit on something important." },
    caterpillar: { name: "Captain Wiggle", sound: "Wiggle wiggle", habit: "I measure distance in leaves.", clue: "Leaves show dry conditions quickly, but soil and stored water decide how long plants cope.", punch: "My grand plan is to become dramatically airborne." },
    chick: { name: "Peep", sound: "Peep peep", habit: "I wake up before the rooster and take full credit.", clue: "Tiny animals also need clean water close by. Distance changes what access feels like.", punch: "I am not small. The island is unusually large." },
    cow: { name: "Mabel Moo", sound: "Moooo", habit: "I keep the grass short in one very specific patch.", clue: "Dry spells change where the greenest grazing survives.", punch: "My research is peer reviewed by three goats. We have no goats." },
    crab: { name: "Sir Sideways", sound: "Click click", habit: "Forward is a fad. Sideways has worked for millions of years.", clue: "A rising waterline makes the safe strip of beach narrower.", punch: "I tried walking straight once. Terrible branding." },
    deer: { name: "Fern", sound: "Huff", habit: "I know every quiet path and exactly which flowers are off limits.", clue: "Roots and ground cover slow runoff, giving rain more time to enter the soil.", punch: "If anyone asks, I was never near the hibiscus." },
    dog: { name: "Koa", sound: "Woof woof", habit: "I patrol the path. The path has not escaped yet.", clue: "A low rain tank or dry stream is noticed locally, even when a regional average looks ordinary.", punch: "I found a stick. The investigation is now extremely serious." },
    elephant: { name: "Motu", sound: "Prrrrooot", habit: "I remember every rainfall chart and most birthdays.", clue: "One wet year is not a trend. The long record shows the direction more clearly.", punch: "I never forget. Except why I walked over here." },
    fish: { name: "Bubbles", sound: "Blub blub", habit: "I live below the chart axis.", clue: "The sea can warm even when the surface still looks calm.", punch: "Water is not wet from in here. Please update your notes." },
    fox: { name: "Saffron", sound: "Yip", habit: "I know shortcuts that are legally just longcuts.", clue: "A station is useful only when someone maintains it and keeps its record going.", punch: "That path was definitely always there." },
    giraffe: { name: "Telescope", sound: "Hmmmm", habit: "I provide free cloud inspections from the upper atmosphere.", clue: "A broad view cannot replace measurements collected close to the ground.", punch: "The forecast up here is mostly leaves." },
    hog: { name: "Truffle", sound: "Honk snort", habit: "I locate buried treasure. So far it is mostly roots.", clue: "Healthy soil holds water better during dry periods.", punch: "This was a scientific hole before anyone asks." },
    koala: { name: "Naps", sound: "Mrrrp", habit: "I study rest as a renewable resource.", clue: "Water that exists but is not available when needed is not a reliable service.", punch: "I will finish this sentence after a brief eight-hour review." },
    lion: { name: "Sunny", sound: "Rrrr", habit: "I practice majestic poses near the fountain.", clue: "A low fountain is a village observation. A maintained station turns weather into a comparable record.", punch: "The mane is natural. The confidence is heavily rehearsed." },
    monkey: { name: "Mango", sound: "Ooh ah", habit: "I test fruit ripeness with rigorous sampling.", clue: "Food trees need freshwater, while their roots help rain enter and remain in the soil.", punch: "One mango is data. Six mangoes are lunch." },
    panda: { name: "Pebble", sound: "Mmph", habit: "I bring calm to meetings by eating through them.", clue: "Safe-water percentages describe people served, not how much water sits around an island.", punch: "I support nuance, especially with snacks." },
    parrot: { name: "Radio", sound: "Water bulletin! Water bulletin!", habit: "I repeat only the most important rumours.", clue: "The ocean shares a direction. Rainfall refuses one regional answer.", punch: "This bulletin will repeat in three, two, three, two..." },
    penguin: { name: "Chilly Bin", sound: "Honk", habit: "I operate the village's least successful ice shop.", clue: "A warmer ocean affects places far beyond the warmest islands.", punch: "Today's special is room-temperature snow." },
    pig: { name: "Taro", sound: "Oink", habit: "I guard the garden by taste-testing it.", clue: "Taro patches and other gardens depend on local water conditions.", punch: "The missing lunch remains a mystery. The crumbs are not helping." },
    polar: { name: "Snowcone", sound: "Huff huff", habit: "I booked a tropical holiday and committed to the outfit.", clue: "The ocean signal connects distant territories, while each island still depends on its own freshwater supply.", punch: "I asked for extra ice. The ocean said no." },
    tiger: { name: "Stripey", sound: "Rrrrow", habit: "I count trends. Stripes are still beyond my sample size.", clue: "Every observed ocean-temperature and sea-level trend points upward, even though the rates differ.", punch: "My paw-width estimate is not official, but it looks impressive." },
  };
  
  const ANIMAL_MALIA_LINES = {
    beaver: ["A bridge inspector with snack priorities. Sensible.", "What do you watch beside the bridge?", "That water mark belongs in my rain notes.", "Any advice that survived the clipboard?", "I will bring the report on a less edible surface."],
    bee: ["Your flight schedule looks busier than the harbour.", "What can your flower route tell us?", "A local observation is useful, but I still need a comparable record.", "How does a passenger earn five flowers?", "I will leave a glowing review and keep my distance from the runway."],
    bunny: ["The carrot is clearly chairing this interview.", "What have you noticed in the gardens?", "Different rainfall directions mean different watering decisions.", "Does the carrot model have one final result?", "Crunch resolution sounds expensive, but memorable."],
    cat: ["Mr. Miso, your supervision appears mostly horizontal.", "What makes a water bowl reliable?", "Safe, close and available are different from simply being surrounded by water.", "May I quote the chair supervisor?", "Meeting noted. Important object sitting may resume."],
    caterpillar: ["Leaves are an excellent unit for a very small surveyor.", "What do the plants reveal first?", "Rainfall, soil and stored water decide how long a garden can cope.", "What comes after the leaf survey?", "Dramatically airborne is a strong career plan."],
    chick: ["Early, loud and taking credit. You will do well in meetings.", "What does a tiny expert need nearby?", "Water access also depends on whether it is close and reliably available.", "How large is your study area?", "Of course. The island needs to adjust its scale."],
    cow: ["That patch is impressively well managed, Mabel.", "Where does the best grass remain green?", "Grazing conditions give the rainfall discussion a practical edge.", "Did the goat reviewers approve?", "No goats, unanimous review. Convenient."],
    crab: ["Sideways certainly makes the entrance more distinctive.", "What do you watch along the beach?", "A narrowing dry strip makes the waterline trend easier to picture.", "Will you demonstrate the straight walk?", "Brand protected. Demonstration cancelled."],
    deer: ["I will respect the quiet path and ask no flower questions.", "What happens to rain on the planted ground?", "Slower runoff and better infiltration belong in the freshwater notes.", "Anything else from the forbidden-flower district?", "Your hibiscus alibi is now extremely suspicious."],
    dog: ["Excellent patrol work. The path remains captured.", "What do people notice before opening a water chart?", "A low tank or dry stream can reveal a local water problem that a regional average hides.", "Any breakthrough in the investigation?", "A stick changes everything. Proceed carefully."],
    elephant: ["Rainfall charts and birthdays is a formidable archive.", "Why do you keep the long record?", "One loud year should not speak for the full line.", "What was the final thing you remembered?", "We can return to it after you remember why you came."],
    fish: ["Below the axis is an unusual research address.", "What does a calm surface hide?", "Appearance and the measured temperature line can tell different stories.", "Any correction for my field notes?", "I have amended the philosophical status of wetness."],
    fox: ["A longcut with confidence is still a useful tour.", "What keeps a weather record useful?", "Maintenance and continuity matter as much as placing the instrument.", "Was that path truly always there?", "I see. The map must have moved."],
    giraffe: ["Finally, an observation deck with no stairs.", "What is missing from the view up there?", "A broad view still needs measurements collected on the ground.", "What is the forecast at leaf height?", "Mostly leaves is at least a confident forecast."],
    hog: ["Roots are treasure if lunch is the research question.", "What do you notice in the soil?", "Soil and water storage belong in my local planning notes.", "Is the latest hole peer reviewed?", "Scientific status accepted, pending cleanup."],
    koala: ["Renewable rest may be the village's best funded programme.", "What makes a water service reliable?", "Available when needed is part of safely managed access, not an optional extra.", "Can I have one final sentence?", "I will return after the eight-hour review window."],
    lion: ["The fountain has found its official portrait artist.", "What can the fountain tell us?", "It can prompt a question, but a maintained station gives us a record we can compare.", "How much rehearsal does majesty require?", "The pose is convincing. The rehearsal remains classified."],
    monkey: ["Rigorous sampling seems to have removed most of the fruit.", "What do the food trees need most?", "Freshwater supports the harvest, and roots help keep rain in the ground.", "How many mangoes finish the survey?", "Six. A remarkably delicious sample size."],
    panda: ["Eating through meetings may improve their average length.", "What should I remember about the water percentage?", "It measures people with safely managed service, not the water surrounding an island.", "Any final nuance before another snack?", "Nuance recorded with appropriate crumbs."],
    parrot: ["Your bulletin has excellent volume and no off switch.", "What is the headline in one sentence?", "One ocean direction meets many different freshwater conditions.", "Will this bulletin now conclude?", "Apparently the countdown is also on repeat."],
    penguin: ["A tropical ice shop is brave market positioning.", "What does the ocean record mean beyond this beach?", "The ocean pattern connects distant territories without making them identical.", "What is today's coldest item?", "Room-temperature snow explains the empty queue."],
    pig: ["Taste-testing is an ambitious definition of guarding.", "What do the garden beds need from the weather?", "Local water conditions turn rainfall direction into a practical question.", "Any progress on the missing lunch?", "I will mark the case unresolved and wipe the crumbs from the file."],
    polar: ["The outfit commits fully to the tropical holiday.", "What connects this island with faraway places?", "The ocean signal is shared across distance, but freshwater supply still has to be understood island by island.", "Did the extra ice ever arrive?", "Request denied by the ocean. Complaint noted."],
    tiger: ["Counting stripes may require a larger research grant.", "What makes the ocean warning persuasive?", "Every observed ocean-temperature and sea-level trend points upward, even though the rates differ.", "How wide is that estimate again?", "Approximately four paws. Very official-looking."],
  };
  
  const TOWN_PROFILES = {
    "character-female-c": { name: "Aunty Sina", role: "agroforestry steward", lines: [
      ["This blue dress is my meeting outfit. The soil still gets the final vote.", "Coconut, food trees and pandanus belong beside homes and paths, where people use them every day."],
      ["Bare soil loses heavy rain quickly.", "Layered planting slows runoff and helps water enter the ground."],
      ["The rainfall chart tells me what changed.", "My question is how the village catches and holds water when it arrives."],
    ], responses: [
      "The garden is part of the climate plan, not scenery.",
      "So planting can support food and freshwater at the same time.",
      "Catching rain matters as much as counting it.",
    ], final: "Freshwater planning continues after the rain reaches the ground." },
    "character-female-e": { name: "Dr. Ana Vea", role: "community doctor", lines: [
      ["The white coat is clean. The clinic thermometer is less cooperative.", "On the hottest afternoons, outdoor workers arrive tired, dizzy and needing water."],
      ["Rainfall trends differ, but safe water matters everywhere.", "A wet month can bring contamination while a dry spell strains storage. Local planning has to know which problem it faces."],
      ["Clinic notes record daily experience.", "They show why a territory percentage can still hide the household that runs out first."],
    ], responses: [
      "Heat becomes a health problem long before it becomes a headline.",
      "So the rainfall response has to match the local water risk.",
      "The percentage needs household experience beside it.",
    ], final: "Read water access beside reliability, distance and health." },
    "character-female-f": { name: "Lea Talanoa", role: "community reporter", lines: [
      ["A bright jacket helps people find the reporter they meant to avoid.", "My first question is whether one unusual rainfall year is shouting over the full water record."],
      ["A blank water record is not zero.", "It is an unanswered question, and an honest chart leaves it blank."],
      ["Write the clearest freshwater conclusion the numbers support.", "The ocean warning is shared, but rain, access and observation have to stay local."],
    ], responses: [
      "One wet year should not speak for the rainfall record.",
      "An honest water-data gap is better than a false zero.",
      "The freshwater conclusion needs both the shared warning and local differences.",
    ], final: "If the data leaves a gap, leave the gap." },
    "character-male-b": { name: "Kele Vaka", role: "canoe builder", lines: [
      ["A canoe reads wind, current and weight at once.", "The freshwater investigation also needs several signals without pretending they are the same measure."],
      ["I mark the waterline on the posts every season.", "Even a small yearly rate matters when homes and roads sit close to the shore."],
      ["Good work survives rough water.", "Keep ocean pressure and freshwater conditions separate enough to read honestly."],
    ], responses: [
      "Different signals can point toward one larger problem.",
      "A few millimetres each year matter beside homes and roads.",
      "The ocean and freshwater records should support each other without being blended.",
    ], final: "Keep the signals separate, then explain what they mean together." },
    "character-male-d": { name: "Maxim Margin", role: "resort development executive", lines: [
      ["Wonderful news: the wet path is now a premium waterfront experience.", "The repair bill is an externality, which is finance for someone else's problem."],
      ["I have classified the beach vegetation as underperforming real estate.", "Once cleared, shareholders will enjoy an unobstructed view of the erosion."],
      ["Reliable water is difficult to place on a quarterly dashboard.", "I proposed counting the resort pool as community storage. Finance called it resilience."],
    ], responses: [
      "You mean the village pays while the resort keeps the view.",
      "That is erosion, Maxim, not a shareholder benefit.",
      "A private pool is not public freshwater security.",
    ], final: "Do look around, Malia. I am told the coastal trees have filed another objection." },
    "character-male-f": { name: "Timo Vai", role: "water systems caretaker", lines: [
      ["The fountain is the village meeting point and my loudest colleague.", "It also reminds everyone that a visible water feature is not proof of a reliable drinking-water service."],
      ["Water systems need maintenance before a crisis.", "Preparedness is less dramatic than repair, which is exactly the point."],
      ["If the fountain starts giving statistical advice, turn the blue valve.", "The red valve makes it invent one regional rainfall answer."],
    ], responses: [
      "So the fountain cannot stand in for reliable household water.",
      "Maintenance before failure. That is the useful lesson.",
      "I am writing down blue valve.",
    ], final: "Check the water systems before a crisis, not during it." },
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
    sst: {
      label: "Sea-surface temperature",
      title: "Every observed sea surface is warming",
      subtitle: "Fitted sea-surface-temperature trend, 1850 to 2025",
      unit: "°C per century",
      note: "Pitcairn has no observation in this file and is omitted rather than treated as zero.",
      color: "#d96b50",
      detail: "map",
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
      detail: "series",
      detailSubtitle: "Satellite-era sea-level anomaly",
      series: (name) => DATA.extra[name]?.sea_level_series,
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
      detail: "series",
      detailSubtitle: "Annual rainfall anomaly",
      series: (name) => DATA.extra[name]?.rainfall_series,
      value: (name) => linearSlope(DATA.extra[name]?.rainfall_series || []),
      format: (value) => signed(value, 2),
    },
    rainVariability: {
      label: "Annual variability",
      title: "Annual rainfall swings differ substantially",
      subtitle: "Standard deviation of annual rainfall anomalies, 1979 to 2025",
      unit: "anomaly points",
      note: "A larger value means wider year-to-year movement around the territory's average anomaly, not a wetter climate.",
      color: "#397fa5",
      detail: "series",
      detailSubtitle: "Annual rainfall anomaly",
      series: (name) => DATA.extra[name]?.rainfall_series,
      value: (name) => WATER_STORY.rainfall_variability[name],
      format: (value) => value.toFixed(1),
    },
    safeWater: {
      label: "Safely managed water",
      title: "The freshwater safety net is unequal",
      subtitle: "Population using safely managed drinking-water services, 2020",
      unit: "percent of population",
      note: "The common 2020 comparison avoids mixing latest values from different years.",
      color: "#3f8f86",
      detail: "series",
      detailSubtitle: "Population using safely managed drinking-water services",
      detailNote: "The line shows reported annual access. The chapter overview compares every territory represented in 2020.",
      series: (name) => WATER_STORY.safe_water_series[name],
      value: (name) => WATER_STORY.safe_water_2020[name],
      format: (value) => `${value.toFixed(1)}%`,
    },
    wastewater: {
      label: "Wastewater safely treated",
      title: "Water security also depends on what leaves the system",
      subtitle: "Proportion of domestic wastewater safely treated, reported 2024 values",
      unit: "percent of reported flow",
      note: "Nine territory reports are shown for 2024. Reporting coverage is limited, so this is a water-quality signal, not a complete Pacific ranking.",
      color: "#c17b55",
      detail: "map",
      detailSubtitle: "Reported domestic wastewater safely treated in 2024",
      detailNote: "Nine territory reports are available in this extract. Dot size shows the reported percentage, not territory size.",
      value: (name) => WASTEWATER_STORY.wastewater_2024[name],
      format: (value) => `${value.toFixed(1)}%`,
    },
    stations: {
      label: "Compliant fixed land stations",
      title: "The formal observing network is uneven",
      subtitle: "Fixed land climate-observation stations meeting WMO standards, 2026",
      unit: "stations",
      note: "Counts do not account for territory size, island dispersion or observing needs and should not be read as an adequacy score.",
      color: "#c17b55",
      detail: "series",
      detailSubtitle: "WMO-compliant fixed land climate-observation stations",
      detailNote: "The line shows the recorded station count over time. The chapter overview compares every reporting territory in 2026.",
      series: (name) => WATER_STORY.station_series[name],
      value: (name) => WATER_STORY.station_2026[name],
      format: (value) => `${Math.round(value)}`,
    },
  };
  

  return { territories, regions, PLAYER_NAME, STATIONS, CONCLUSION, GUIDE_MALIA_LINES, ANIMAL_NOTE_CHAPTER, TOWN_NOTE_CHAPTER, ANIMAL_PROFILES, ANIMAL_MALIA_LINES, TOWN_PROFILES, TOWN_CHARACTER_ASSETS, validateCharacterProfiles, METRICS };
}
