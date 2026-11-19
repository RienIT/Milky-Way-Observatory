import { LanguageCode } from './i18n';
import { MemoryNode } from './memory-types';
import { EXTRA_CELESTIAL_TRANSLATIONS } from './extra-translations';

export interface LocalizedNodeCopy {
  title: string;
  createdAt: string;
  summary: [string, string, string];
  content: string;
}

type TranslationRecord = Record<string, LocalizedNodeCopy>;

const EN_NODES: TranslationRecord = {
  'astro-ocean-01': {
    title: "Miller's Planet — Gargantuan Tidal Wave Ocean World",
    createdAt: 'Inner Orbit (1.01 Rs)',
    summary: [
      'Orbits near Gargantua’s event horizon under extreme gravitational time dilation: 1 hour equals 7 Earth years.',
      'Covered entirely by a shallow global ocean pulled into towering 1,200-meter tidal wave walls by black hole gravity.',
      'Warmed and illuminated entirely by Gargantua’s incandescent golden accretion disk rather than a normal star.',
    ],
    content:
      'Based on Nobel laureate Kip Thorne’s relativistic calculations: for a planet to experience 61,000× time dilation without being torn apart at the Roche limit, Gargantua must weigh 100 million Suns and spin near the speed of light (Kerr spin a* = 0.99999999999999).',
  },
  'astro-ocean-02': {
    title: 'Kepler-452b — Earth’s Closest Solar-Analog Cousin',
    createdAt: 'Cygnus (1,400 ly)',
    summary: [
      'Orbits inside the habitable zone of a G2-type star nearly identical in mass and temperature to our Sun.',
      'About 50% wider than Earth with 1.6–2× surface gravity, supporting a thick atmosphere and active plate tectonics.',
      'A 385-day orbit has kept liquid water oceans stable across 6 billion years of planetary evolution.',
    ],
    content:
      'Discovered by NASA’s Kepler Space Telescope in 2015 in the constellation Cygnus, Kepler-452b exemplifies a rocky super-Earth that has spent billions of years in temperate conditions capable of sustaining continents, river basins, and convective clouds.',
  },
  'astro-ocean-03': {
    title: 'TRAPPIST-1e — Rocky Gem in a 7-Planet System',
    createdAt: 'Aquarius (40 ly)',
    summary: [
      'One of seven Earth-sized worlds orbiting the ultra-cool red dwarf TRAPPIST-1 just 40 light-years away.',
      'Possesses an Earth-like iron core density capable of generating a protective planetary magnetosphere.',
      'Sits squarely in the Goldilocks zone where surface oceans can persist across its temperate terminator or globe.',
    ],
    content:
      'TRAPPIST-1 is a flagship target for the James Webb Space Telescope (JWST). Because the seven planets orbit so tightly together, standing on TRAPPIST-1e would reveal six neighboring worlds looming larger than the Full Moon in the sky.',
  },
  'astro-ocean-04': {
    title: 'K2-18b — JWST Hycean Global Ocean World',
    createdAt: 'Leo (124 ly)',
    summary: [
      'Classified as a "Hycean" world: a deep global liquid water ocean beneath a thick hydrogen-rich atmosphere.',
      'JWST transmission spectroscopy revealed clear signatures of methane (CH₄) and carbon dioxide (CO₂).',
      'Weighs 8.6 Earth masses inside the habitable zone of red dwarf K2-18 in Leo.',
    ],
    content:
      'James Webb Space Telescope spectra of K2-18b marked a milestone in exoplanet atmospheric science: abundant CH₄ and CO₂ paired with depleted ammonia matches chemical models of a massive ocean beneath the cloud deck.',
  },
  'astro-ocean-05': {
    title: 'Kepler-22b — First Confirmed Habitable-Zone Super-Earth',
    createdAt: 'Cygnus (635 ly)',
    summary: [
      'First exoplanet confirmed by NASA’s Kepler mission inside the habitable zone of a Sun-like star.',
      'At 2.4 Earth radii, astronomers model it as a deep global water world wrapped in bright cloud bands.',
      'Estimated average equilibrium temperature sits near 295 K (22°C) — akin to a mild spring day on Earth.',
    ],
    content:
      'Completing an orbit every 290 days around a star slightly dimmer than the Sun, Kepler-22b receives nearly identical net solar flux to Earth, making it an iconic archetype of oceanic super-Earths.',
  },
  'astro-ocean-06': {
    title: 'Kepler-186f — Crimson Earth Under Perpetual Sunset',
    createdAt: 'Cygnus (580 ly)',
    summary: [
      'First Earth-sized exoplanet (1.11 R⊕) discovered inside another star’s habitable zone.',
      'Orbits an M1 red dwarf, bathing its surface in perpetual warm amber twilight light.',
      'Any photosynthetic flora evolving here could develop deep crimson or violet pigments to harvest infrared light.',
    ],
    content:
      'Positioned near the outer edge of Kepler-186’s habitable zone 580 light-years away, Kepler-186f receives roughly one-third of Earth’s irradiance—sufficient for liquid oceans beneath a CO₂-rich warming atmosphere.',
  },
  'astro-gas-01': {
    title: 'J1407b — "Super-Saturn" with 37 Colossal Rings',
    createdAt: 'Centaurus (434 ly)',
    summary: [
      'Surrounded by a gargantuan 37-ring disk spanning 180 million km — 200× wider than Saturn’s rings.',
      'Distinct ring gaps point to an exomoon roughly the size of Earth or Mars sculpting the dust lanes.',
      'If swapped with Saturn in our Solar System, its rings would shine brighter and wider than the Full Moon.',
    ],
    content:
      'Detected via a dramatic 56-day stellar eclipse, J1407b’s vast circumplanetary ring system holds roughly an Earth’s mass of ice and dust—offering a live snapshot of moon formation around a young giant.',
  },
  'astro-gas-02': {
    title: 'Saturn — Jewel of the Solar System & Cassini Division',
    createdAt: 'Solar System (9.5 AU)',
    summary: [
      'Adorned by crystalline water-ice rings separated by the 4,800-km Cassini Division carved by moon Mimas.',
      'Features a permanent 29,000-km hexagonal jet-stream vortex spinning over its north pole.',
      'Average density (0.687 g/cm³) is lower than liquid water despite being 95 times Earth’s mass.',
    ],
    content:
      'NASA’s Cassini spacecraft spent 13 years exploring Saturn’s razor-thin yet expansive icy ringlets, shepherd moons, and deep golden ammonia cloud bands.',
  },
  'astro-gas-03': {
    title: 'Jupiter — King of Storms & The Great Red Spot',
    createdAt: 'Solar System (5.2 AU)',
    summary: [
      'More than twice as massive as all other Solar System planets combined, shielding inner worlds from comets.',
      'Home to the Great Red Spot, an anticyclonic super-storm larger than Earth raging for over 350 years.',
      'Crushing interior pressure compresses hydrogen into a glowing liquid metallic ocean powering a huge magnetosphere.',
    ],
    content:
      'Completing a full rotation in under 10 hours, Jupiter’s rapid spin stretches ammonia clouds into alternating cream zones and rust-brown belts streaked with cyclonic eddies.',
  },
  'astro-gas-04': {
    title: 'HD 189733b — Cobalt Blue World of Sideways Glass Rain',
    createdAt: 'Vulpecula (64.5 ly)',
    summary: [
      'Hubble measured its striking deep cobalt hue, caused not by oceans but by suspended silicate glass haze.',
      'Supersonic 8,700 km/h equatorial winds hurl molten silicate glass droplets sideways across the planet.',
      'A classic "Hot Jupiter" orbiting so close to its star that one year lasts just 2.2 Earth days.',
    ],
    content:
      'Despite looking deceptively like a serene blue marble from afar, HD 189733b’s 1,000°C atmosphere is among the most hostile weather environments ever observed.',
  },
  'astro-gas-05': {
    title: 'WASP-12b — Egg-Shaped Pitch-Black World Being Devoured',
    createdAt: 'Auriga (1,410 ly)',
    summary: [
      'Extreme stellar tidal forces stretch this gas giant into an egg shape while stripping away its atmosphere.',
      'Absorbs 94% of incident starlight, making its 2,600°C dayside darker than fresh charcoal.',
      'Expected to spiral completely into its host star within roughly 3 million years.',
    ],
    content:
      'WASP-12b orbits so tightly (1.09 days per year) that thermal dissociation breaks hydrogen molecules apart, leaving a scorching, non-reflective atmosphere siphoned onto the star.',
  },
  'astro-gas-06': {
    title: 'Kepler-90h — Outer Giant of the 8-Planet Exoplanet System',
    createdAt: 'Draco (2,840 ly)',
    summary: [
      'Largest gas giant in Kepler-90, the first exoplanet system confirmed to match our Solar System’s 8-planet count.',
      'Orbits at 1.01 AU inside a temperate zone where large icy exomoons could harbor liquid water.',
      'Entire 8-planet system is compressed inside an orbital footprint comparable to Earth’s distance from the Sun.',
    ],
    content:
      'Discovered alongside machine-learning transit analysis, the Kepler-90 architecture mirrors our Solar System with rocky inner worlds and giant outer gas planets.',
  },
  'astro-lava-01': {
    title: '55 Cancri e — Magma Ocean & Carbon-Rich Super-Earth',
    createdAt: 'Cancer (41 ly)',
    summary: [
      'Tidally locked super-Earth whose permanent dayside reaches 2,400°C, melting the crust into glowing lava seas.',
      'High carbon-to-oxygen ratio suggests intense mantle pressure could crystallize vast subterranean diamond layers.',
      'JWST thermal emissions indicate a secondary atmosphere outgassed directly from its magma ocean.',
    ],
    content:
      'Zipping around its star in just 17.7 hours, 55 Cancri e is one of the closest and most intensively studied rocky lava worlds in modern exoplanet astronomy.',
  },
  'astro-lava-02': {
    title: 'K2-141b — Supersonic Vaporized Rock-Rain World',
    createdAt: 'Aquarius (202 ly)',
    summary: [
      'Dayside temperatures near 3,000°C vaporize solid bedrock into a gaseous silicate and sodium atmosphere.',
      '5,000 km/h winds carry rock vapor to the -200°C nightside where it condenses into falling stone rain.',
      'A 100-km-deep global magma ocean recycles molten rock back toward the scorching dayside.',
    ],
    content:
      'K2-141b replaces Earth’s familiar water cycle with an apocalyptic silicate-rock hydrological cycle driven by extreme day-night temperature contrast.',
  },
  'astro-lava-03': {
    title: 'KELT-9b — Ultra-Hot Jupiter Hotter Than Most Stars',
    createdAt: 'Cygnus (670 ly)',
    summary: [
      'Dayside temperature reaches 4,600 K (4,300°C) — hotter than the surfaces of most red dwarf stars.',
      'Intense UV radiation tears hydrogen molecules apart and vaporizes iron and titanium into atmospheric gas.',
      'Leaves a glowing comet-like tail of escaping hydrogen gas as it orbits a blistering blue-white A-type star.',
    ],
    content:
      'KELT-9b holds the record as the hottest known exoplanet, blurring the physical boundary between giant planets and low-mass stars.',
  },
  'astro-lava-04': {
    title: 'Io — Most Volcanically Active World in the Solar System',
    createdAt: 'Jupiter System (5.2 AU)',
    summary: [
      'Home to over 400 active volcanoes blasting sulfur plumes up to 500 km into space.',
      'Constant gravitational flexing from Jupiter and neighboring moons Europa and Ganymede melts its interior.',
      'Surface is painted in vivid sulfur yellows, oranges, and glowing basaltic caldera lakes like Loki Patera.',
    ],
    content:
      'Io’s relentless tidal heating generates 100 times more volcanic output per square kilometer than Earth, constantly resurfacing the moon with fresh lava.',
  },
  'astro-lava-05': {
    title: 'PSR B1257+12 c — Zombie Planet Orbiting a Dead Pulsar',
    createdAt: 'Virgo (2,300 ly)',
    summary: [
      'First confirmed exoplanet in history (1992), orbiting a rapidly spinning neutron star remnant of a supernova.',
      'Bathed in lethal X-rays and relativistic particle winds sweeping across its dark crust every 6.2 milliseconds.',
      'Likely formed from fallback debris left behind after its parent star exploded.',
    ],
    content:
      'Named Poltergeist, PSR B1257+12 c proved that planets can survive or re-form even in the cataclysmic aftermath of a supernova explosion.',
  },
  'astro-lava-06': {
    title: 'CoRoT-7b — Scorched Core of an Evaporated Gas Giant',
    createdAt: 'Monoceros (520 ly)',
    summary: [
      'First rocky exoplanet with a measured density, orbiting 23× closer to its star than Mercury is to the Sun.',
      'Its star fills 360× more area in the sky than our Sun, boiling the dayside crust into molten lava.',
      'Astronomers suspect it is a "Chthonian planet" — the stripped rocky core of an ancient Neptune-sized world.',
    ],
    content:
      'CoRoT-7b opened the era of rocky exoplanet characterization, revealing how intense stellar radiation can strip entire gaseous envelopes away.',
  },
  'astro-ice-01': {
    title: "Mann's Planet — Frozen Ammonia Clouds Above a Barren Core",
    createdAt: 'Outer Gargantua Orbit',
    summary: [
      'An extreme cryogenic world locked in perpetual sub-zero storms with towering solid ice-cloud formations.',
      'Atmosphere consists of 80% nitrogen and dense toxic ammonia crystals unbreathable without life support.',
      'Low oblique sunlight from Gargantua’s distant accretion disk casts stark silver-blue shadows across its glaciers.',
    ],
    content:
      'Modeled as a high-eccentricity icy world orbiting far from Gargantua’s warm inner disk, Mann’s Planet illustrates how frozen atmospheres stratify into suspended crystalline shelves.',
  },
  'astro-ice-02': {
    title: 'Neptune — Deep Sapphire Ice Giant of Supersonic Winds',
    createdAt: 'Solar System (30 AU)',
    summary: [
      'Sustains the fastest planetary winds in the Solar System, roaring up to 2,100 km/h across frozen methane clouds.',
      'Methane absorbs red sunlight, giving Neptune its signature deep azure color streaked with high cirrus clouds.',
      'Radiates 2.6× more internal heat than it receives from the distant Sun, fueling giant dark storm vortices.',
    ],
    content:
      'First planet located purely through mathematical predictions of gravitational perturbations before ever being seen through a telescope in 1846.',
  },
  'astro-ice-03': {
    title: 'Uranus — Sideways-Rolling Ice Giant & Pale Cyan Rings',
    createdAt: 'Solar System (19.2 AU)',
    summary: [
      'Tilted at an astonishing 97.7° axial obliquity, effectively rolling sideways along its 84-year solar orbit.',
      'Encircled by 13 dark narrow rings and 28 moons, producing 42-year-long polar summers and winters.',
      'Holds the coldest planetary atmospheric temperature ever measured in the Solar System at -224°C.',
    ],
    content:
      'Likely knocked onto its side by a colossal protoplanetary collision early in Solar System history, Uranus’s tilted magnetic field wobbles dramatically with each rotation.',
  },
  'astro-ice-04': {
    title: 'Europa — Cracked Ice Shell Hiding a Global Saltwater Ocean',
    createdAt: 'Jupiter System (5.2 AU)',
    summary: [
      'Beneath a 15–25 km fractured water-ice crust lies a global saltwater ocean holding twice as much water as Earth.',
      'Tidal flexing from Jupiter may power seafloor hydrothermal vents—prime habitats for extraterrestrial microbial life.',
      'Reddish-brown lineae crisscrossing its surface are mineral salts and sulfates welling up from below.',
    ],
    content:
      'Targeted by NASA’s Europa Clipper mission, Europa stands as one of the most compelling astrobiology destinations in the entire Solar System.',
  },
  'astro-ice-05': {
    title: 'Titan — Golden Haze & Liquid Methane Seas',
    createdAt: 'Saturn System (9.5 AU)',
    summary: [
      'Only moon in the Solar System with a dense nitrogen atmosphere (1.45× Earth pressure) and active weather.',
      'Carved by rivers, rainstorms, and vast polar seas of liquid methane and ethane at -179°C.',
      'Water ice here is frozen as hard as granite rock, forming mountains and pebble-strewn riverbeds.',
    ],
    content:
      'ESA’s Huygens lander revealed an eerie alien landscape mirroring Earth’s hydrology using liquid hydrocarbons instead of water.',
  },
  'astro-ice-06': {
    title: 'OGLE-2005-BLG-390Lb — "Hoth" Frozen Super-Earth',
    createdAt: 'Scorpius (21,500 ly)',
    summary: [
      'One of the coldest and most distant rocky exoplanets ever detected via gravitational microlensing.',
      'Surface temperature plunges to -220°C, freezing nitrogen and methane into solid planetary glaciers.',
      'Located near the Milky Way’s galactic bulge, roughly 5.5 times Earth’s mass.',
    ],
    content:
      'Discovered when its host star briefly magnified a background star’s light via Einstein gravitational lensing, proving rocky worlds populate even the distant galactic core.',
  },
  'astro-bh-01': {
    title: 'Event Horizon & Black Hole Shadow (Schwarzschild Boundary)',
    createdAt: 'R = 2GM / c²',
    summary: [
      'The point of no return where spacetime curves so steeply that not even light can escape outward.',
      'Gravitational light capture magnifies the visible black shadow to ~2.6× the true Schwarzschild radius.',
      'Crossing a supermassive horizon feels momentarily calm locally, even as all future paths lead to the singularity.',
    ],
    content:
      'Predicted by Karl Schwarzschild in 1916 from Einstein’s field equations, the Event Horizon is not a solid wall but a causal boundary separating observable space from the black hole interior.',
  },
  'astro-bh-02': {
    title: 'Relativistic Accretion Disk & Doppler Beaming',
    createdAt: 'ISCO to 25 Rs',
    summary: [
      'Infalling gas forms a luminous spinning disk heated by friction and magnetic turbulence to 6,000 K and beyond.',
      'Relativistic Doppler beaming makes the side rotating toward you appear significantly brighter and hotter.',
      'Converts up to 42% of infalling rest mass into radiation—far more efficient than stellar nuclear fusion.',
    ],
    content:
      'In spinning Kerr black holes like Gargantua, the innermost stable circular orbit draws remarkably close to the horizon, creating a thick, glowing golden plasma torus.',
  },
  'astro-bh-03': {
    title: 'Einstein Gravitational Lensing & Twin Polar Arches',
    createdAt: 'General Relativity',
    summary: [
      'Extreme mass warps surrounding spacetime like a giant cosmic lens, bending light rays around the black hole.',
      'Reveals the hidden far side of the accretion disk simultaneously over the North Pole and under the South Pole.',
      'Produces secondary razor-thin photon rings made of light that looped around the black hole multiple times.',
    ],
    content:
      'Kip Thorne’s Double Negative Gravitational Renderer (DNGR) proved that gravitational lensing turns a flat equatorial disk into Gargantua’s iconic enveloping polar arches.',
  },
  'astro-bh-04': {
    title: 'Sagittarius A* — Supermassive Core of the Milky Way',
    createdAt: 'Sagittarius (26,670 ly)',
    summary: [
      'Weighs 4.3 million Suns packed inside a diameter smaller than Mercury’s orbit around the Sun.',
      'Directly imaged in 2022 by the Earth-sized Event Horizon Telescope radio interferometer.',
      'Star S2 whips past Sgr A* every 16 years at 7,650 km/s (2.5% the speed of light), confirming general relativity.',
    ],
    content:
      'Quiet compared to active quasars, Sagittarius A* periodically flares in infrared and X-ray wavelengths as clumps of magnetized gas swirl near its horizon.',
  },
  'astro-bh-05': {
    title: 'M87* (Powehi) — First Directly Imaged Black Hole Shadow',
    createdAt: 'Virgo (53.5M ly)',
    summary: [
      'Tipping the scales at 6.5 billion solar masses, its event horizon spans wider than three Solar Systems.',
      'Its glowing orange ring image (2019) provided humanity’s first direct visual proof of a black hole shadow.',
      'Twisted magnetic fields launch a collimated relativistic plasma jet stretching 5,000 light-years.',
    ],
    content:
      'Named Powehi in Hawaiian ("embellished dark source of unending creation"), M87*’s polarized EHT maps revealed spiraling magnetic fields throttling plasma into cosmic jets.',
  },
  'astro-bh-06': {
    title: "Edmunds' Planet — Arid Frontier Sanctuary Beyond Gargantua",
    createdAt: 'Outer Gargantua Orbit',
    summary: [
      'Orbits safely beyond extreme time dilation, maintaining breathable air and temperate desert plateaus.',
      'Receives warm golden illumination from Gargantua’s distant accretion disk and a companion neutron-star system.',
      'Represents a stable, non-tidally-locked habitable refuge in the outer gravitational basin of a supermassive core.',
    ],
    content:
      'Far from Miller’s lethal tidal waves and Mann’s frozen ammonia clouds, Edmunds’ Planet demonstrates how outer orbits around a calm supermassive black hole can host enduring biospheres.',
  },
};

const JA_NODES: TranslationRecord = {
  'astro-ocean-01': {
    title: 'ミラーの星 — 巨大津波が巡る時間遅延の海洋惑星',
    createdAt: '最内軌道 (1.01 Rs)',
    summary: [
      'ガルガンチュアの事象の地平面直近を公転し、1時間＝地球7年という極端な重力時間遅延が発生。',
      '地表全体を浅い海が覆い、ブラックホールの潮汐力で高さ1,200mの巨大波壁が立ち上がります。',
      '恒星ではなく、黄金色に輝くガルガンチュアの降着円盤から光と熱を直接受けています。',
    ],
    content:
      'ノーベル物理学賞受賞者キップ・ソーンの計算によれば、ロッシュ限界で破壊されずに61,000倍の時間遅延を実現するには、太陽1億倍の質量と光速限界に近い高速回転が必要です。',
  },
  'astro-ocean-02': {
    title: '系外惑星 ケプラー452b — 地球の「いとこ」と呼ばれる岩石惑星',
    createdAt: 'はくちょう座 (1,400光年)',
    summary: [
      '太陽とほぼ同じG2型恒星のハビタブルゾーン内を公転するスーパーアース。',
      '半径は地球の約1.5倍で重厚な大気と活発なプレートテクトニクスを持つと推定されます。',
      '公転周期385日で60億年にわたり液体の海を維持できる安定した環境です。',
    ],
    content:
      '2015年にNASAケプラー宇宙望遠鏡が発見。太陽に似た恒星の温暖域で数十億年進化してきた地球型惑星の代表例です。',
  },
  'astro-ocean-03': {
    title: 'TRAPPIST-1e — 7惑星系の中心に輝く地球規模の岩石惑星',
    createdAt: 'みずがめ座 (40光年)',
    summary: [
      '地球からわずか40光年先の超低温赤色矮星を巡る7つの地球サイズ惑星の一つ。',
      '地球に近い鉄コア密度を持ち、恒星風から大気を守る磁場を維持できる最有力候補です。',
      'ハビタブルゾーンのど真ん中に位置し、地表に液体の海が存在する可能性が最も高いとされます。',
    ],
    content:
      'ジェイムズ・ウェッブ宇宙望遠鏡の最優先観測対象。惑星同士が極めて近いため、地表からは隣り合う惑星が満月より大きく空に浮かんで見えます。',
  },
  'astro-ocean-04': {
    title: 'K2-18b — JWSTが捉えた水素大気と全地球海洋のハイセアン惑星',
    createdAt: 'しし座 (124光年)',
    summary: [
      '水素豊富な大気の下に深い全地球海洋が広がる「ハイセアン惑星」の代表格。',
      'JWSTの透過分光観測でメタン(CH₄)と二酸化炭素(CO₂)の明確な吸収線が検出されました。',
      '質量は地球の8.6倍で、しし座の赤色矮星K2-18のハビタブルゾーンを周回します。',
    ],
    content:
      'アンモニアが欠乏しメタンとCO₂が共存するスペクトルは、雲層の下に巨大な液体の水海洋が存在する化学モデルと強く一致します。',
  },
  'astro-ocean-05': {
    title: 'ケプラー22b — ハビタブルゾーンで初確認された海洋スーパーアース',
    createdAt: 'はくちょう座 (635光年)',
    summary: [
      '太陽型恒星のハビタブルゾーン内でケプラー計画が初めて確認した系外惑星。',
      '地球半径の2.4倍を持ち、底知れぬ深海が星全体を覆う「ウォーターワールド」とモデル化されています。',
      '平均表面温度は約22°Cと推定され、穏やかな春の地球に匹敵します。',
    ],
    content:
      '公転周期290日で太陽よりやや暗い恒星を巡り、地球とほぼ同等の放射エネルギーを受け取る象徴的な海洋惑星です。',
  },
  'astro-ocean-06': {
    title: 'ケプラー186f — 永遠の夕焼けに染まる地球サイズの系外惑星',
    createdAt: 'はくちょう座 (580光年)',
    summary: [
      'ハビタブルゾーン内で史上初めて発見された地球と同サイズ（半径1.11倍）の惑星。',
      '赤色矮星の光を受けるため、昼間の空は常に温かな夕暮れのような琥珀色に染まります。',
      'もし植物が存在すれば赤外線を吸収するため深紅や紫の葉へ進化する可能性があります。',
    ],
    content:
      'ハビタブルゾーン外縁に位置し、二酸化炭素を含む厚い大気による温室効果があれば数十億年にわたり液体の海を保てます。',
  },
  'astro-gas-01': {
    title: 'J1407b — 直径1.8億km・37層の超巨大リングを持つ「スーパー土星」',
    createdAt: 'ケンタウルス座 (434光年)',
    summary: [
      '土星の環の200倍もの幅を持つ37層以上の巨大な氷・塵リングに包まれています。',
      '環の明瞭な隙間は、地球や火星サイズの系外衛星が塵を掃き集めている証拠と考えられます。',
      'もし土星と入れ替えれば、地球の夜空で満月よりはるかに大きく明るく輝きます。',
    ],
    content:
      '56日間にも及ぶ複雑な恒星減光から発見された、若い巨大天体周囲の衛星形成現場を捉えた驚異のリング系です。',
  },
  'astro-gas-02': {
    title: '土星 (Saturn) — カッシーニの間隙と六角形極渦を持つ太陽系の宝石',
    createdAt: '太陽系 (9.5 AU)',
    summary: [
      'ほぼ純粋な水の氷でできた環が輝き、衛星ミマスの重力共鳴が幅4,800kmのカッシーニの間隙を刻みます。',
      '北極上空には差し渡し29,000kmの正六角形ジェット気流が永続的に回転しています。',
      '地球の95倍の質量ながら平均密度は0.687 g/cm³と水より軽いガス巨星です。',
    ],
    content:
      'NASA探査機カッシーニが13年間にわたり、薄く繊細な氷の環と羊飼い衛星群の力学を克明に記録しました。',
  },
  'astro-gas-03': {
    title: '木星 (Jupiter) — 大赤斑と太陽系最大の磁気圏を誇る王者',
    createdAt: '太陽系 (5.2 AU)',
    summary: [
      '太陽系の他の全惑星を合わせた2倍以上の質量を持ち、内惑星系を彗星衝突から守る盾となります。',
      '地球を丸ごと飲み込む巨大高気圧嵐「大赤斑」が350年以上吹き荒れています。',
      '深部の超高圧で金属化した液体水素が強力なダイナモ磁場を発生させています。',
    ],
    content:
      'わずか10時間未満という猛烈な自転がアンモニア雲をクリーム色と赤褐色の縞模様へ引き伸ばしています。',
  },
  'astro-gas-04': {
    title: 'HD 189733b — 時速8,700kmでガラスの雨が横殴りに降る青い地獄',
    createdAt: 'こぎつね座 (64.5光年)',
    summary: [
      'ハッブル望遠鏡が捉えた深いコバルトブルーは海ではなく、ケイ酸塩ガラス微粒子の散乱光です。',
      '時速8,700kmの超音速風が溶けたガラスの雨を水平に吹き飛ばしています。',
      '公転周期わずか2.2日の典型的なホット・ジュピターです。',
    ],
    content:
      '遠くからは穏やかな青い惑星に見えますが、気温1,000°Cを超える宇宙屈指の過酷な気象環境を持っています。',
  },
  'astro-gas-05': {
    title: 'WASP-12b — 主星に吸い込まれつつある漆黒の卵型ガス惑星',
    createdAt: 'ぎょしゃ座 (1,410光年)',
    summary: [
      '主星との強烈な潮汐力により球形を保てずラグビーボールのように引き伸ばされています。',
      '入射光の94%を吸収するため、2,600°Cの昼面は炭のように真っ黒です。',
      'あと約300万年で主星に完全に飲み込まれる運命にあります。',
    ],
    content:
      '公転周期1.09日という極近距離軌道のため水素分子が熱解離し、大気が絶えず恒星へと流出しています。',
  },
  'astro-gas-06': {
    title: 'ケプラー90h — 太陽系と同じ8惑星系の外縁を統べるガス巨星',
    createdAt: 'りゅう座 (2,840光年)',
    summary: [
      '太陽系以外で初めて8個の惑星が確認されたケプラー90系の最大ガス惑星。',
      '軌道半径1.01 AUの温暖域に位置し、もし大型衛星があれば液体の海を保持できます。',
      '8惑星すべてが地球の公転軌道より内側に凝縮された驚くべきコンパクト系です。',
    ],
    content:
      '機械学習によるトランジット解析も貢献したケプラー90系は、内側に岩石惑星、外側にガス惑星という太陽系に似た階層構造を示します。',
  },
  'astro-lava-01': {
    title: 'かに座55番星e — 2,400°Cのマグマ海とダイヤモンド地殻のスーパーアース',
    createdAt: 'かに座 (41光年)',
    summary: [
      '潮汐固定された昼面は2,400°Cに達し、地殻が溶け出した灼熱の溶岩海が広がります。',
      '炭素比率が極めて高く、マントル深部の超高圧で広大なダイヤモンド層が形成されている可能性があります。',
      'JWST観測によりマグマ海から揮発した二次大気の存在が強く示唆されています。',
    ],
    content:
      'わずか17.7時間で主星を一周する超短周期岩石惑星で、現代系外惑星科学で最も詳細に研究される溶岩世界の一つです。',
  },
  'astro-lava-02': {
    title: 'K2-141b — 岩石が蒸発して空から石の雨が降る極限惑星',
    createdAt: 'みずがめ座 (202光年)',
    summary: [
      '3,000°Cの昼面で岩盤そのものが気化し、ケイ酸塩とナトリウムの鉱物大気を形成。',
      '時速5,000kmの暴風が岩石蒸気を-200°Cの夜面へ運び、冷えて石の雨として降り注ぎます。',
      '深さ100kmのマグマ海が溶岩流となって再び昼面へ循環します。',
    ],
    content:
      '地球の水循環がそっくりそのまま「岩石の蒸発・降雨・マグマ還流」に置き換わった壮絶な極限世界です。',
  },
  'astro-lava-03': {
    title: 'KELT-9b — 多くの恒星より高温な4,600Kの超高温木星',
    createdAt: 'はくちょう座 (670光年)',
    summary: [
      '昼面温度は4,600K（4,300°C）に達し、大半の赤色矮星の表面温度を上回ります。',
      '強烈な紫外線により鉄やチタンさえ気体として大気中に漂っています。',
      '蒸発した水素ガスが彗星のような輝く尾を引いて宇宙空間へ流出しています。',
    ],
    content:
      '既知の系外惑星の中で最高温度を記録し、巨大惑星と低質量恒星の物理的境界を曖昧にする天体です。',
  },
  'astro-lava-04': {
    title: '衛星イオ (Io) — 400以上の活火山が噴き上がる太陽系最活発天体',
    createdAt: '木星系 (5.2 AU)',
    summary: [
      '400を超える活火山が硫黄プルームを高度500kmまで噴き上げています。',
      '木星と衛星エウロパ・ガニメデの潮汐共鳴が内部を絶えず揉みほぐし溶融させます。',
      '地表は鮮やかな硫黄の黄色・橙色と、ロキ・パテラのような巨大溶岩湖に彩られています。',
    ],
    content:
      '単位面積あたりの火山活動量は地球の100倍に達し、衝突クレーターが瞬く間に溶岩で塗り替えられます。',
  },
  'astro-lava-05': {
    title: 'PSR B1257+12 c — 超新星残骸パルサーを巡る「ゾンビ惑星」',
    createdAt: 'おとめ座 (2,300光年)',
    summary: [
      '1992年に史上初めて存在が確認された系外惑星で、高速回転する中性子星（パルサー）を周回。',
      '6.2ミリ秒ごとに強烈なX線と相対論的粒子風が地表を掃射します。',
      '超新星爆発後の残骸円盤から再形成されたと考えられています。',
    ],
    content:
      '「ポルターガイスト」の愛称を持ち、恒星の死の後にも惑星系が誕生し得ることを証明した歴史的天体です。',
  },
  'astro-lava-06': {
    title: 'CoRoT-7b — ガス外層を剥ぎ取られた灼熱の岩石コア惑星',
    createdAt: 'いっかくじゅう座 (520光年)',
    summary: [
      '密度が初めて測定された岩石系外惑星で、水星より23倍も主星に近い軌道を公転。',
      '空に浮かぶ主星は地球から見る太陽の360倍の面積を占め、昼面を溶岩へ変えます。',
      'かつての海王星型惑星が大気を蒸発させて残った「クトニアン惑星」と推測されます。',
    ],
    content:
      '恒星の強烈な放射によって巨大惑星が岩石核へと変貌する進化経路を実証した先駆的発見です。',
  },
  'astro-ice-01': {
    title: 'マンの星 — 凍りついたアンモニア氷雲が浮かぶ極寒世界',
    createdAt: 'ガルガンチュア外縁軌道',
    summary: [
      '氷点下の暴風が吹き荒れ、固体の氷雲が山脈のように凍りつく極低温惑星。',
      '大気は窒素80%と高濃度のアンモニア氷晶からなり、生命維持装置なしでは呼吸不能です。',
      '遠く離れたガルガンチュア降着円盤の淡い光が氷河に青銀色の影を落とします。',
    ],
    content:
      'ブラックホール外縁の楕円軌道を描く氷惑星モデルとして、極低温大気の成層化と氷晶雲構造を再現しています。',
  },
  'astro-ice-02': {
    title: '海王星 (Neptune) — 時速2,100kmの超音速風が吹く蒼き氷巨星',
    createdAt: '太陽系 (30 AU)',
    summary: [
      '時速2,100kmに達する太陽系最速の嵐が凍ったメタン雲を引き裂きます。',
      '大気中のメタンが赤色光を吸収し、深いサファイアブルーの輝きを生み出します。',
      '太陽から受ける熱の2.6倍もの内部熱を放出し、大暗斑などの巨大嵐を駆動します。',
    ],
    content:
      '望遠鏡で見つかる前に天王星軌道の摂動計算から数学的に予言・発見された史上初の惑星です。',
  },
  'astro-ice-03': {
    title: '天王星 (Uranus) — 自転軸97.7°の横倒し氷巨星と13本の環',
    createdAt: '太陽系 (19.2 AU)',
    summary: [
      '自転軸が97.7°も傾いており、84年の公転軌道を文字通り横転しながら進みます。',
      '13本の暗いリングと28個の衛星を従え、極地方では42年間続く昼と夜が交替します。',
      '太陽系惑星で最も低い-224°Cの大気温度が観測されています。',
    ],
    content:
      '太陽系初期の巨大天体衝突で横倒しになったと考えられ、中心から大きくずれた独特の磁場を持ちます。',
  },
  'astro-ice-04': {
    title: '衛星エウロパ (Europa) — 氷殻の下に地球の2倍の海を秘める木星衛星',
    createdAt: '木星系 (5.2 AU)',
    summary: [
      '厚さ15〜25kmの氷殻の下に、地球の全海洋の2倍もの水量を持つ塩水の海が広がります。',
      '木星の潮汐加熱が海底熱水噴出孔を駆動し、地球外微生物の有力な生息候補地とされます。',
      '表面を走る赤褐色の筋模様は地下海から湧き上がった塩類と硫酸塩の痕跡です。',
    ],
    content:
      'NASAのエウロパ・クリッパー探査機が目指す、太陽系屈指のアストロバイオロジー重要天体です。',
  },
  'astro-ice-05': {
    title: '衛星タイタン (Titan) — 黄金のもやと液体メタンの海が広がる衛星',
    createdAt: '土星系 (9.5 AU)',
    summary: [
      '太陽系の衛星で唯一、地球の1.45倍の気圧を持つ濃密な窒素大気と気象循環を備えます。',
      '-179°Cの極寒のもと、液体メタンとエタンが雨となって降り川や巨大な海を作ります。',
      '水の氷は花崗岩のように硬く凍りつき、山脈や河原の岩を形成しています。',
    ],
    content:
      'ESAのホイヘンス探査機が着陸し、水の代わりに炭化水素が循環するもう一つの地球のような景観を明らかにしました。',
  },
  'astro-ice-06': {
    title: 'OGLE-2005-BLG-390Lb — 重力マイクロレンズで発見された極寒星',
    createdAt: 'さそり座 (21,500光年)',
    summary: [
      '重力マイクロレンズ法で検出された最も遠く最も寒い岩石系外惑星の一つ。',
      '表面温度は-220°Cまで下がり、窒素やメタンさえ固体の氷河となって地表を覆います。',
      '銀河バルジ付近に位置し、地球の約5.5倍の質量を持ちます。',
    ],
    content:
      '背景の星が重力レンズで一瞬増光する現象から発見され、銀河中心付近にも岩石惑星が広く存在することを示しました。',
  },
  'astro-bh-01': {
    title: '事象の地平面とブラックホール・シャドウ（シュヴァルツシルト境界）',
    createdAt: 'R = 2GM / c²',
    summary: [
      '時空の曲率が極限に達し、光さえ二度と外へ脱出できない宇宙の一方通行境界。',
      '近傍光子の重力捕獲により、目に見える黒い影は真の事象の地平面の約2.6倍に広がります。',
      '超大質量ブラックホールの地平面は通過瞬間の潮汐力が弱く、気づかぬまま越えてしまいます。',
    ],
    content:
      '1916年にシュヴァルツシルトがアインシュタイン方程式の厳密解として導出した、観測可能な宇宙と内部特異点を隔てる因果律の境界です。',
  },
  'astro-bh-02': {
    title: '相対論的降着円盤とドップラー・ビーミング効果',
    createdAt: 'ISCO ～ 25 Rs',
    summary: [
      '落ち込むガスが摩擦と磁気乱流で6,000K以上に加熱され、厚みのある黄金のプラズマ円盤を形成。',
      '観測者側へ回転する片側は相対論的ドップラー増光により一段と明るく白熱して見えます。',
      '落下質量の最大42%を光エネルギーへ変換し、恒星の核融合を遥かに凌ぐ効率を誇ります。',
    ],
    content:
      'ガルガンチュアのような高速回転ブラックホールでは最内安定円軌道が極限まで近づき、壮大な立体ガス構造が輝きます。',
  },
  'astro-bh-03': {
    title: 'アインシュタイン重力レンズと厚い上下極アーチ',
    createdAt: '一般相対性理論',
    summary: [
      '超強重力が時空を巨大な光学レンズのように歪め、背後の光の進路を大きく曲げます。',
      '本来隠れている降着円盤の裏側が、ブラックホールの北極上と南極下に同時に浮かび上がります。',
      'ブラックホールを複数回周回した光が作る極めて細い二次光子リングも現れます。',
    ],
    content:
      'キップ・ソーンらの相対論レイトレーシング研究により、平坦な降着円盤が立体的に包み込む極アーチとして見える姿が可視化されました。',
  },
  'astro-bh-04': {
    title: 'いて座A* (Sagittarius A*) — 天の川銀河の中心核',
    createdAt: 'いて座 (26,670光年)',
    summary: [
      '太陽430万個分の質量が水星軌道より狭い領域に凝縮されています。',
      '2022年に地球規模の電波望遠鏡網EHTにより初めて直接撮影されました。',
      '恒星S2が16年周期で光速の2.5%の猛スピードですれ違い、一般相対論を精密実証しました。',
    ],
    content:
      '現在は比較的静穏ですが、磁化ガス塊が地平面付近を回るたびに赤外線やX線で突発的なフレアを放ちます。',
  },
  'astro-bh-05': {
    title: 'M87* (ポヴェヒ) — 人類史上初めて撮影されたブラックホール',
    createdAt: 'おとめ座 (5,350万光年)',
    summary: [
      '質量は太陽の65億倍に達し、事象の地平面は太陽系3個分以上の広さを誇ります。',
      '2019年に公開されたオレンジの光のリング画像でブラックホール影の実在を証明しました。',
      'ねじれた磁場が5,000光年にも及ぶ相対論的プラズマジェットを宇宙空間へ撃ち出します。',
    ],
    content:
      'ハワイ語で「飾られた果てしない創造の暗黒源」を意味するポヴェヒと名付けられ、偏光観測により磁場構造まで解明されています。',
  },
  'astro-bh-06': {
    title: 'エドマンズの星 — ガルガンチュア外縁に佇む乾燥大地の安息地',
    createdAt: 'ガルガンチュア外縁軌道',
    summary: [
      '極端な時間遅延を免れる安全距離を公転し、呼吸可能な大気と温暖な乾燥高原を備えます。',
      '遠くの降着円盤と伴星から柔らかな黄金の光を受け、安定した昼夜サイクルを維持。',
      '超大質量ブラックホール系の外縁にも長期居住可能な環境が成立し得ることを示します。',
    ],
    content:
      'ミラーの巨大津波やマンの氷嵐を離れた外縁重力圏に位置する、穏やかな生命圏モデル天体です。',
  },
};

const ZH_NODES: TranslationRecord = {
  'astro-ocean-01': {
    title: '米勒星球 (Miller’s Planet) — 巨浪滔天的时间膨胀海洋世界',
    createdAt: '最内轨道 (1.01 Rs)',
    summary: [
      '紧贴卡冈图雅事件视界运行，承受极端引力时间膨胀：这里1小时等于地球7年。',
      '全球覆盖浅海，在黑洞潮汐力拉扯下形成高达1,200米的巨型水墙海啸。',
      '光热完全来自金色炽热的黑洞吸积盘，而非普通恒星。',
    ],
    content:
      '根据诺贝尔物理学奖得主基普·索恩的计算：要产生61,000倍时间膨胀而不被洛希极限撕碎，卡冈图雅必须拥有1亿倍太阳质量且自旋接近光速极限。',
  },
  'astro-ocean-02': {
    title: '开普勒-452b (Kepler-452b) — 地球最亲近的“表兄”',
    createdAt: '天鹅座 (1,400光年)',
    summary: [
      '位于与太阳几乎相同的G2型恒星宜居带内，是一颗岩石超级地球。',
      '半径比地球大50%，表面重力约1.6–2倍，拥有厚重大气与活跃板块构造。',
      '385天的公转周期使其在60亿年演化中得以长期维持液态海洋。',
    ],
    content:
      '2015年由NASA开普勒望远镜发现，是在类太阳恒星宜居带内稳定演化数十亿年的经典超级地球范本。',
  },
  'astro-ocean-03': {
    title: 'TRAPPIST-1e — 七行星系统中的宜居岩石明珠',
    createdAt: '宝瓶座 (40光年)',
    summary: [
      '环绕40光年外超冷红矮星的7颗地球大小行星中最具宜居潜力的一颗。',
      '拥有与地球相近的致密铁核，足以产生抵御恒星风的全球磁场。',
      '恰处于宜居带正中，表面大范围维持液态水的概率极高。',
    ],
    content:
      '詹姆斯·韦伯望远镜重点观测目标。由于7颗行星轨道极为紧凑，站在其地表抬头可见相邻行星比地球上的满月还要大。',
  },
  'astro-ocean-04': {
    title: 'K2-18b — 韦伯望远镜观测的氢海 (Hycean) 海洋世界',
    createdAt: '狮子座 (124光年)',
    summary: [
      '属于“氢海行星”类别：富含氢气的大气层之下隐藏着全球液态水海洋。',
      'JWST透射光谱清晰检测到甲烷(CH₄)和二氧化碳(CO₂)分子特征。',
      '质量为地球8.6倍，位于狮子座红矮星K2-18的宜居带内。',
    ],
    content:
      '同时检测到CH₄与CO₂且缺乏氨气，与厚云层之下存在深邃液态海洋的化学模型高度吻合。',
  },
  'astro-ocean-05': {
    title: '开普勒-22b — 首个获确认的宜居带海洋超级地球',
    createdAt: '天鹅座 (635光年)',
    summary: [
      '开普勒任务首次确认位于类太阳恒星宜居带内的系外行星。',
      '半径为地球2.4倍，天文学家推测其为被无底深海包裹的水世界。',
      '估算平均表面温度约22°C，宛如地球温和的春日。',
    ],
    content:
      '每290天绕略暗于太阳的母星公转一周，净辐射通量与地球几乎持平，是海洋超级地球的标志性代表。',
  },
  'astro-ocean-06': {
    title: '开普勒-186f — 永恒黄昏下的赤红地球',
    createdAt: '天鹅座 (580光年)',
    summary: [
      '人类在恒星宜居带内发现的首颗与地球尺寸相当（1.11倍半径）的行星。',
      '环绕M1红矮星运行，白昼始终笼罩在温暖橙红的黄昏光线中。',
      '若演化出光合植物，叶片可能呈深红或暗紫色以高效吸收红外光。',
    ],
    content:
      '位于宜居带外缘，只要大气富含二氧化碳与氮气产生温室效应，就能长期维系液态海洋与岩石大陆。',
  },
  'astro-gas-01': {
    title: 'J1407b — 拥有37道超级光环的“超级土星”',
    createdAt: '半人马座 (434光年)',
    summary: [
      '环绕着宽达1.8亿公里的37层巨型环系，宽度是土星光环的200倍。',
      '环中清晰缝隙表明可能有一颗地球或火星大小的系外卫星正在清扫尘埃。',
      '若将它换到土星位置，其巨环在地球夜空中将比满月更大更亮。',
    ],
    content:
      '通过持续56天的剧烈恒星掩食现象被发现，其庞大尘冰环系总质量接近一个地球，宛如卫星诞生的实时现场。',
  },
  'astro-gas-02': {
    title: '土星 (Saturn) — 卡西尼环缝与北极六边形风暴',
    createdAt: '太阳系 (9.5 AU)',
    summary: [
      '由高纯度水冰构成壮丽光环，土卫一引力共振雕刻出宽4,800公里的卡西尼缝。',
      '北极上空存在直径29,000公里的永久性正六边形急流漩涡。',
      '质量是地球的95倍，但平均密度仅0.687 g/cm³，比液态水还轻。',
    ],
    content:
      'NASA卡西尼号探测器耗时13年近距离测绘了土星极薄冰环、牧羊犬卫星群及暖金色氨云带。',
  },
  'astro-gas-03': {
    title: '木星 (Jupiter) — 大红斑与太阳系行星之王',
    createdAt: '太阳系 (5.2 AU)',
    summary: [
      '质量超过太阳系其他所有行星总和的两倍，以强大引力守护内太阳系。',
      '南半球肆虐着比地球还大的反气旋超级风暴“大红斑”，已持续350余年。',
      '深处极端高压将氢压缩成液态金属海洋，驱动太阳系最强行星磁场。',
    ],
    content:
      '不到10小时的极速自转将氨冰云拉扯成乳白与红褐相间的壮观条纹风暴带。',
  },
  'astro-gas-04': {
    title: 'HD 189733b — 时速8700公里横向玻璃雨的钴蓝炼狱',
    createdAt: '狐狸座 (64.5光年)',
    summary: [
      '哈勃望远镜观测到的深钴蓝色并非海洋，而是大气中悬浮的硅酸盐玻璃颗粒。',
      '时速8,700公里的超音速狂风卷着熔融玻璃雨水平横扫全球。',
      '典型的“热木星”，公转一年仅需2.2个地球日。',
    ],
    content:
      '远看宛如静谧的蓝色宝石，实则是一颗超过1,000°C的致命高压气态风暴世界。',
  },
  'astro-gas-05': {
    title: 'WASP-12b — 正被母星吞噬的漆黑蛋形行星',
    createdAt: '御夫座 (1,410光年)',
    summary: [
      '极端潮汐力将这颗气态巨行星拉扯成橄榄球状并不断剥离其大气。',
      '吸收94%的入射星光，2,600°C的向阳面比新鲜沥青还要漆黑。',
      '预计将在约300万年内彻底坠入母星怀抱。',
    ],
    content:
      '公转周期仅1.09天，超高温令氢分子热解离，形成几乎不反光且高速流失的炽热大气。',
  },
  'astro-gas-06': {
    title: '开普勒-90h — 八行星系外系统的外围巨无霸',
    createdAt: '天龙座 (2,840光年)',
    summary: [
      '首个被证实拥有8颗行星（与太阳系数量相同）的开普勒-90系最大气态巨星。',
      '位于1.01 AU温和轨道，其潜在大型卫星上或能维持液态水。',
      '整个8行星家族紧凑排列在相当于地球轨道半径以内的空间中。',
    ],
    content:
      '开普勒-90系统呈现与太阳系相似的“内岩石、外气态”结构，是系外行星构型研究的里程碑。',
  },
  'astro-lava-01': {
    title: '巨蟹座55e (55 Cancri e) — 2400°C岩浆海与钻石地幔世界',
    createdAt: '巨蟹座 (41光年)',
    summary: [
      '被潮汐锁定的向阳面高达2,400°C，整个地壳熔融为炽热岩浆海洋。',
      '碳氧比极高，高压地幔中可能结晶出巨量天然钻石层。',
      'JWST热辐射观测发现其岩浆海持续蒸发出次生挥发大气。',
    ],
    content:
      '公转周期仅17.7小时，是距离地球最近、研究最深入的熔岩超级地球之一。',
  },
  'astro-lava-02': {
    title: 'K2-141b — 岩石汽化并降下超音速石雨的极端行星',
    createdAt: '宝瓶座 (202光年)',
    summary: [
      '3,000°C向阳面直接把固体岩石汽化成硅酸盐与钠蒸汽大气。',
      '时速5,000公里狂风将岩石蒸汽吹向-200°C夜面凝结成倾盆石雨。',
      '深达100公里的全球岩浆海再将熔岩循环输送回昼面。',
    ],
    content:
      '以“岩石蒸发—凝结石雨—岩浆回流”取代地球水循环的惊人地质世界。',
  },
  'astro-lava-03': {
    title: 'KELT-9b — 比多数恒星更炽热的4600K超热木星',
    createdAt: '天鹅座 (670光年)',
    summary: [
      '向阳面温度高达4,600 K（4,300°C），超过大多数红矮星表面温度。',
      '极端紫外辐射甚至将铁和钛原子汽化悬浮于大气之中。',
      '在炽热蓝白A型星炙烤下拖曳出彗星般的氢气逃逸长尾。',
    ],
    content:
      '保持已知最热系外行星纪录，模糊了巨型行星与低质量恒星之间的物理界限。',
  },
  'astro-lava-04': {
    title: '木卫一 (Io) — 拥有400座活火山的太阳系最狂暴天体',
    createdAt: '木星系统 (5.2 AU)',
    summary: [
      '分布着超过400座活火山，硫磺喷发柱可直冲500公里高空。',
      '木星与相邻卫星的潮汐共振不断揉捏其内部，引发剧烈熔融。',
      '地表涂满鲜艳的硫黄、橙红与洛基火山口般的炽热熔岩湖。',
    ],
    content:
      '单位面积火山活动强度是地球的100倍，熔岩不断重塑整个卫星表面。',
  },
  'astro-lava-05': {
    title: 'PSR B1257+12 c — 环绕脉冲星残骸的“僵尸行星”',
    createdAt: '室女座 (2,300光年)',
    summary: [
      '1992年人类史上首批确认的系外行星，环绕超新星遗留的高速中子星运转。',
      '每6.2毫秒遭受一次致命X射线与相对论粒子风的横扫。',
      '很可能由超新星爆发后回落的残骸盘二次凝聚而成。',
    ],
    content:
      '代号“骚灵”(Poltergeist)，证明即便在恒星毁灭性的超新星爆发之后，行星依然能够诞生。',
  },
  'astro-lava-06': {
    title: 'CoRoT-7b — 气态外衣被剥离殆尽的炽热岩石内核',
    createdAt: '麒麟座 (520光年)',
    summary: [
      '首颗测得密度的岩石系外行星，距母星比水星距太阳近23倍。',
      '母星在其天空中视面积为太阳的360倍，将昼面烤成翻腾熔岩。',
      '天文学家推测它是一颗失去气壳的“冥府行星”残核。',
    ],
    content:
      '开启了岩石系外行星定量探测时代，揭示强星风剥离巨行星大气的极端演化。',
  },
  'astro-ice-01': {
    title: '曼恩星球 (Mann’s Planet) — 冻结氨冰云笼罩的极寒世界',
    createdAt: '卡冈图雅外围轨道',
    summary: [
      '常年零下严寒风暴肆虐，固态冰云如山峰般冻结悬浮于高空。',
      '大气含80%氮气与致命高浓度氨冰晶，无维生装备无法呼吸。',
      '遥远黑洞吸积盘洒下的冷银辉光在冰川上投出凌厉长影。',
    ],
    content:
      '作为卡冈图雅外围大偏心率冰行星模型，展现了极寒大气的固态氨云分层奇观。',
  },
  'astro-ice-02': {
    title: '海王星 (Neptune) — 时速2100公里超音速风暴的蔚蓝冰巨星',
    createdAt: '太阳系 (30 AU)',
    summary: [
      '拥有太阳系最猛烈的行星狂风，最高风速达2,100 km/h。',
      '大气甲烷吸收红光，赋予海王星深邃的蓝宝石色调与高空冰卷云。',
      '内部释放热量为接收太阳热量的2.6倍，驱动大暗斑风暴。',
    ],
    content:
      '人类史上第一颗先通过数学引力摄动计算预言位置、随后再用望远镜找到的行星。',
  },
  'astro-ice-03': {
    title: '天王星 (Uranus) — 97.7°躺着公转的冰巨星与13道暗环',
    createdAt: '太阳系 (19.2 AU)',
    summary: [
      '自转轴倾斜高达97.7°，在84年公转轨道上几乎完全侧躺滚动。',
      '拥有13道纤细暗环与28颗卫星，两极经历长达42年的极昼与极夜。',
      '测得太阳系行星最低大气温度：-224°C。',
    ],
    content:
      '很可能在太阳系早期遭遇巨型原行星撞击而侧翻，其磁场偏离球心且随自转剧烈摆动。',
  },
  'astro-ice-04': {
    title: '木卫二 (Europa) — 裂纹冰壳下藏着两倍地球水量的咸水海',
    createdAt: '木星系统 (5.2 AU)',
    summary: [
      '15–25公里厚的水冰外壳下，包裹着水量达地球两倍的全球咸水海洋。',
      '木星潮汐加热或驱动海底热液喷口，成为地外生命头号候选地。',
      '纵横交错的红褐色条纹是地下海涌出的矿物盐与硫酸盐结晶。',
    ],
    content:
      'NASA“欧罗巴快船”探测器核心目标，太阳系最具天体生物学探索价值的世界之一。',
  },
  'astro-ice-05': {
    title: '土卫六 (Titan) — 金色浓雾与液态甲烷海洋世界',
    createdAt: '土星系统 (9.5 AU)',
    summary: [
      '太阳系唯一拥有浓密氮气大气（1.45倍地球气压）和完整天气循环的卫星。',
      '在-179°C下，液态甲烷与乙烷化作雨滴、河流和辽阔极地海洋。',
      '水冰在此坚硬如花岗岩，构成了山脉与河床鹅卵石。',
    ],
    content:
      '欧空局惠更斯号着陆器揭示了一个以液态碳氢化合物复刻地球水文地貌的奇异外星世界。',
  },
  'astro-ice-06': {
    title: 'OGLE-2005-BLG-390Lb — 引力微透镜发现的极寒超级地球',
    createdAt: '天蝎座 (21,500光年)',
    summary: [
      '通过引力微透镜技术发现的最遥远、最寒冷的岩石系外行星之一。',
      '表面温度低至-220°C，氮气与甲烷凝结为覆盖全球的固态冰原。',
      '位于银河系核球附近，质量约为地球的5.5倍。',
    ],
    content:
      '当母星借爱因斯坦引力透镜效应短暂放大背景星光时显露踪迹，证明银河深处同样遍布岩石行星。',
  },
  'astro-bh-01': {
    title: '事件视界与黑洞阴影 (史瓦西时空边界)',
    createdAt: 'R = 2GM / c²',
    summary: [
      '时空弯曲到连光线也无法逃逸的单向因果边界。',
      '光子引力捕获效应使肉眼可见的黑影半径扩大至真实史瓦西半径的约2.6倍。',
      '坠入超大质量黑洞视界瞬间局部潮汐力平缓，但所有未来路径皆指向中心奇点。',
    ],
    content:
      '1916年由卡尔·史瓦西自爱因斯坦场方程精确求解预言，是分隔可观测宇宙与黑洞内部的终极界线。',
  },
  'astro-bh-02': {
    title: '相对论立体吸积盘与多普勒聚束效应',
    createdAt: 'ISCO 至 25 Rs',
    summary: [
      '落入黑洞的气体经剧烈摩擦与磁湍流加热至6,000K以上，形成炽热立体等离子体盘。',
      '相对论多普勒聚束令朝向观测者旋转的一侧显著更亮更炽白。',
      '可将高达42%的静止质量转化为辐射能，效率远超恒星核聚变。',
    ],
    content:
      '在卡冈图雅等高速旋转克尔黑洞周围，最内稳定圆轨道极度贴近视界，造就磅礴发光的金色气体盘。',
  },
  'astro-bh-03': {
    title: '爱因斯坦引力透镜与厚重南北极双拱环',
    createdAt: '广义相对论',
    summary: [
      '超大质量将周围时空弯曲成巨型光学透镜，大幅偏折途经光线的轨迹。',
      '让原本被遮挡的吸积盘背面光芒同时从黑洞北极上方与南极下方绕出。',
      '绕黑洞多圈后逃逸的光子还会形成极其锐利的次级光子环。',
    ],
    content:
      '基普·索恩的相对论光线追踪模拟揭示：正是引力透镜将赤道圆盘幻化为环抱黑洞南北极的厚重双拱奇观。',
  },
  'astro-bh-04': {
    title: '人马座 A* (Sagittarius A*) — 银河系中心超大质量黑洞',
    createdAt: '人马座 (26,670光年)',
    summary: [
      '430万倍太阳质量高度压缩于比水星轨道还小的空间内。',
      '2022年由地球口径级事件视界望远镜(EHT)首次直接成像。',
      '恒星S2每16年以2.5%光速高速掠过，精准验证了广义相对论红移。',
    ],
    content:
      '相较活跃类星体颇为宁静，但磁化气体团每次靠近视界都会触发强烈的红外与X射线耀斑。',
  },
  'astro-bh-05': {
    title: 'M87* (Powehi) — 人类史上首张直接成像的黑洞阴影',
    createdAt: '室女座 (5,350万光年)',
    summary: [
      '质量高达65亿倍太阳质量，事件视界横跨三个太阳系以上。',
      '2019年公布的标志性橙红光环照片首次向人类直证了黑洞阴影的存在。',
      '螺旋磁场将等离子体加速成延伸5,000光年的相对论喷流。',
    ],
    content:
      '夏威夷语命名Powehi（无尽创造的深邃源泉），EHT偏振图进一步揭示了其视界边缘的强螺旋磁场。',
  },
  'astro-bh-06': {
    title: '埃德蒙兹星球 (Edmunds’ Planet) — 黑洞外围的宜居荒漠净土',
    createdAt: '卡冈图雅外围轨道',
    summary: [
      '运行于远离极端时间膨胀的安全外轨，拥有可呼吸大气与温和荒漠高原。',
      '沐浴在遥远黑洞吸积盘与伴星的柔和暖金光芒中。',
      '展现了超大质量黑洞外围引力盆地中稳定生态圈的可能性。',
    ],
    content:
      '远离米勒星球的致命巨浪与曼恩星球的氨冰风暴，是黑洞星系中最适合长期定居的宁静世界。',
  },
};

const KO_NODES: TranslationRecord = {
  'astro-ocean-01': {
    title: '밀러 행성 (Miller’s Planet) — 거대 해일과 시간 지연의 해양 세계',
    createdAt: '최내곽 궤도 (1.01 Rs)',
    summary: [
      '가르강튀아 사건의 지평선 직전을 공전해 1시간 = 지구 7년의 극심한 중력 시간 지연이 발생합니다.',
      '전 행성이 얕은 바다로 덮여 있으며 블랙홀 기조력이 높이 1,200m의 초대형 해일 벽을 세웁니다.',
      '일반 항성 대신 황금빛으로 타오르는 블랙홀 강착원반에서 빛과 열을 직접 공급받습니다.',
    ],
    content:
      '노벨 물리학상 수상자 킵 손의 계산에 따르면 로슈 한계에서 파괴되지 않고 61,000배 시간 지연을 구현하려면 태양 1억 배 질량과 광속 한계에 가까운 회전이 필수입니다.',
  },
  'astro-ocean-02': {
    title: '외계행성 케플러-452b — 지구의 가장 가까운 사촌',
    createdAt: '백조자리 (1,400광년)',
    summary: [
      '태양과 매우 흡사한 G2형 항성의 생명 거주 가능 영역을 공전하는 슈퍼지구입니다.',
      '지구보다 반지름이 50% 크며 두꺼운 대기와 활발한 판구조 활동을 지닌 것으로 추정됩니다.',
      '385일 공전 주기로 60억 년간 안정적인 액체 바다를 유지할 수 있었습니다.',
    ],
    content:
      '2015년 NASA 케플러 우주망원경이 발견한 대표적 온대 암석 슈퍼지구로, 대륙과 하천, 대류 구름층이 존재할 가능성이 높습니다.',
  },
  'astro-ocean-03': {
    title: 'TRAPPIST-1e — 7개 행성계 중심의 암석 보석',
    createdAt: '물병자리 (40광년)',
    summary: [
      '지구에서 불과 40광년 떨어진 초저온 적색왜성을 도는 7개 지구형 행성 중 하나입니다.',
      '지구와 유사한 철 핵 밀도를 지녀 항성풍을 막아낼 자기장 유지에 가장 유리합니다.',
      '골디락스 영역 정중앙에 위치해 지표 액체 바다 존재 가능성이 가장 높습니다.',
    ],
    content:
      '제임스 웹 우주망원경(JWST)의 핵심 관측 대상으로, 행성 간격이 매우 좁아 하늘에 이웃 행성들이 보름달보다 크게 떠 보입니다.',
  },
  'astro-ocean-04': {
    title: 'K2-18b — JWST가 포착한 하이시안(Hycean) 전지구 해양 행성',
    createdAt: '사자자리 (124광년)',
    summary: [
      '수소가 풍부한 두꺼운 대기 아래 거대한 액체 바다가 펼쳐진 하이시안 행성입니다.',
      'JWST 투과 분광 관측에서 메탄(CH₄)과 이산화탄소(CO₂) 신호가 뚜렷이 검출되었습니다.',
      '지구 질량의 8.6배로 사자자리 적색왜성 K2-18의 거주 가능 영역에 놓여 있습니다.',
    ],
    content:
      '암모니아가 결핍되고 메탄과 이산화탄소가 공존하는 화학 스펙트럼은 구름층 아래 깊은 액체 바다 모델과 정확히 일치합니다.',
  },
  'astro-ocean-05': {
    title: '케플러-22b — 거주 가능 영역 최초 확인 해양 슈퍼지구',
    createdAt: '백조자리 (635광년)',
    summary: [
      '태양형 항성의 생명 거주 가능 영역에서 케플러 미션이 최초로 확증한 외계행성입니다.',
      '지구 반지름의 2.4배로, 행성 전체를 끝없는 심해가 감싼 워터월드로 모델링됩니다.',
      '평균 표면 온도는 약 22°C로 온화한 지구의 봄날과 비슷합니다.',
    ],
    content:
      '290일 주기로 태양보다 약간 어두운 모항성을 공전하며 지구와 거의 같은 복사 에너지를 받습니다.',
  },
  'astro-ocean-06': {
    title: '케플러-186f — 영원한 노을빛 아래 붉은 지구',
    createdAt: '백조자리 (580광년)',
    summary: [
      '거주 가능 영역에서 사상 최초로 발견된 지구 크기(반지름 1.11배) 외계행성입니다.',
      '적색왜성의 빛을 받아 낮에도 언제나 따뜻한 황혼 같은 주황빛 하늘이 펼쳐집니다.',
      '광합성 식물이 진화했다면 적외선을 흡수하기 위해 붉거나 보랏빛 잎을 띨 수 있습니다.',
    ],
    content:
      '거주 가능 영역 외곽에 위치해 이산화탄소가 풍부한 대기의 온실 효과가 있다면 수십억 년간 바다를 유지할 수 있습니다.',
  },
  'astro-gas-01': {
    title: 'J1407b — 지름 1억 8천만 km, 37개 고리를 두른 슈퍼 토성',
    createdAt: '센타우루스자리 (434광년)',
    summary: [
      '토성 고리보다 200배 넓은 37겹의 초대형 얼음·먼지 고리계를 거느리고 있습니다.',
      '고리 사이의 선명한 간극은 지구·화성급 외계위성이 형성되고 있음을 시사합니다.',
      '태양계 토성 자리에 놓는다면 밤하늘에서 보름달보다 훨씬 크고 밝게 빛날 것입니다.',
    ],
    content:
      '56일간 이어진 극적인 별빛 식 현상으로 발견되었으며, 젊은 거대 행성 주변의 위성 탄생 과정을 생생히 보여줍니다.',
  },
  'astro-gas-02': {
    title: '토성 (Saturn) — 카시니 간극과 북극 육각형 폭풍의 보석',
    createdAt: '태양계 (9.5 AU)',
    summary: [
      '순수한 물얼음 고리가 빛나며 위성 미마스의 공명이 폭 4,800km의 카시니 간극을 새겼습니다.',
      '북극 상공에는 지름 29,000km의 정육각형 제트기류 소용돌이가 영구 회전합니다.',
      '지구 질량의 95배지만 평균 밀도는 0.687 g/cm³로 물보다 가볍습니다.',
    ],
    content:
      'NASA 카시니 탐사선이 13년간 토성의 얇고 정교한 얼음 고리와 양치기 위성들을 탐사했습니다.',
  },
  'astro-gas-03': {
    title: '목성 (Jupiter) — 대적점과 태양계 최강 자기장의 제왕',
    createdAt: '태양계 (5.2 AU)',
    summary: [
      '태양계 나머지 행성을 모두 합친 것보다 2배 이상 무거워 내행성을 혜성으로부터 보호합니다.',
      '지구보다 큰 고기압 폭풍 대적점이 350년 넘게 휘몰아치고 있습니다.',
      '깊은 내부의 초고압 액체 금속 수소가 강력한 자기권을 생성합니다.',
    ],
    content:
      '10시간도 안 되는 빠른 자전이 암모니아 구름을 크림색과 적갈색의 웅장한 줄무늬 띠로 빚어냅니다.',
  },
  'astro-gas-04': {
    title: 'HD 189733b — 시속 8,700km 유리 비가 쏟아지는 코발트빛 지옥',
    createdAt: '여우자리 (64.5광년)',
    summary: [
      '허블 망원경이 관측한 선명한 푸른빛은 바다가 아니라 대기 중 규산염 유리 입자 산란광입니다.',
      '시속 8,700km의 초음속 강풍이 녹은 유리 방울을 수평으로 날려 보냅니다.',
      '공전 주기가 불과 2.2일인 전형적인 뜨거운 목성입니다.',
    ],
    content:
      '멀리서는 평화로운 푸른 구슬처럼 보이지만 1,000°C를 웃도는 우주 최악의 기상 지옥입니다.',
  },
  'astro-gas-05': {
    title: 'WASP-12b — 모항성에 먹히고 있는 칠흑빛 달걀형 행성',
    createdAt: '마차부자리 (1,410광년)',
    summary: [
      '극심한 항성 기조력 때문에 럭비공 모양으로 길게 찌그러지며 대기를 빼앗기고 있습니다.',
      '입사 빛의 94%를 흡수해 2,600°C 낮 면이 숯보다 어둡게 보입니다.',
      '약 300만 년 뒤에는 모항성 속으로 완전히 추락할 운명입니다.',
    ],
    content:
      '1.09일 주기의 초근접 궤도에서 수소 분자가 열해리되어 반사율이 극도로 낮은 암흑 대기를 이룹니다.',
  },
  'astro-gas-06': {
    title: '케플러-90h — 태양계와 같은 8행성계 외곽 가스 거인',
    createdAt: '용자리 (2,840광년)',
    summary: [
      '태양계 외 최초로 8개 행성이 확인된 케플러-90 항성계의 최대 가스 행성입니다.',
      '1.01 AU 온대 궤도를 돌며 대형 위성이 있다면 액체 물을 품을 수 있습니다.',
      '8개 행성 전체가 지구 공전 궤도 안쪽에 촘촘히 배치된 압축형 행성계입니다.',
    ],
    content:
      '안쪽 암석 행성과 바깥쪽 가스 행성이라는 태양계 유사 구조를 보여준 획기적 발견입니다.',
  },
  'astro-lava-01': {
    title: '게자리 55 e (55 Cancri e) — 2,400°C 마그마 바다와 다이아몬드 지각',
    createdAt: '게자리 (41광년)',
    summary: [
      '조석 고정된 낮 면이 2,400°C에 달해 지각이 통째로 녹은 용암 바다를 이룹니다.',
      '탄소 비율이 극도로 높아 맨틀 고압층에 거대한 다이아몬드 지층이 존재할 가능성이 큽니다.',
      'JWST 열관측에서 마그마 바다에서 증발한 2차 대기 존재가 포착되었습니다.',
    ],
    content:
      '불과 17.7시간 만에 공전을 마치는 가장 가깝고 활발히 연구되는 용암 슈퍼지구입니다.',
  },
  'astro-lava-02': {
    title: 'K2-141b — 암석이 증발해 초음속 돌비가 내리는 극한 행성',
    createdAt: '물병자리 (202광년)',
    summary: [
      '3,000°C 낮 면에서 암반이 기화해 규산염과 나트륨 광물 대기를 만듭니다.',
      '시속 5,000km 폭풍이 암석 증기를 -200°C 밤 면으로 실어 날라 돌비로 내리게 합니다.',
      '깊이 100km 마그마 바다가 녹은 암석을 다시 낮 면으로 순환시킵니다.',
    ],
    content:
      '지구의 물 순환을 암석 증발·돌비·마그마 환류로 완벽히 치환한 극한 행성입니다.',
  },
  'astro-lava-03': {
    title: 'KELT-9b — 대다수 항성보다 뜨거운 4,600K 초고온 목성',
    createdAt: '백조자리 (670광년)',
    summary: [
      '낮 면 온도가 4,600 K(4,300°C)에 달해 대부분의 적색왜성 표면보다 뜨겁습니다.',
      '강렬한 자외선이 철과 티타늄마저 기체 원자로 대기 중에 띄워 놓습니다.',
      '청백색 A형 항성의 열기에 수소가 혜성 꼬리처럼 길게 증발해 나갑니다.',
    ],
    content:
      '알려진 외계행성 중 최고 온도 기록을 보유하며 행성과 저질량 항성의 경계를 넘나듭니다.',
  },
  'astro-lava-04': {
    title: '위성 이오 (Io) — 400개 활화산이 분출하는 태양계 최강 화산 세계',
    createdAt: '목성계 (5.2 AU)',
    summary: [
      '400개가 넘는 활화산이 유황 분출 기둥을 상공 500km까지 쏘아 올립니다.',
      '목성과 이웃 위성들의 조석 공명이 내부를 끊임없이 가열·용융시킵니다.',
      '표면은 선명한 유황 노란빛과 로키 파테라 같은 거대 용암 호수로 물들어 있습니다.',
    ],
    content:
      '단위 면적당 화산 활동이 지구의 100배에 달해 지표면이 끊임없이 새 용암으로 덮입니다.',
  },
  'astro-lava-05': {
    title: 'PSR B1257+12 c — 초신성 잔해 펄서를 도는 좀비 행성',
    createdAt: '처녀자리 (2,300광년)',
    summary: [
      '1992년 인류 최초로 확인된 외계행성으로, 고속 회전 중성자별(펄서)을 공전합니다.',
      '6.2밀리초마다 치명적인 X선과 상대론적 입자풍이 지표를 휩씁니다.',
      '초신성 폭발 후 남은 잔해 원반에서 재형성된 것으로 추정됩니다.',
    ],
    content:
      '폴터가이스트라는 별칭을 가지며 별의 죽음 이후에도 행성이 탄생할 수 있음을 입증했습니다.',
  },
  'astro-lava-06': {
    title: 'CoRoT-7b — 가스 외피가 증발해버린 작열 암석 핵 행성',
    createdAt: '외뿔소자리 (520광년)',
    summary: [
      '최초로 밀도가 측정된 암석 외계행성으로 수성보다 23배 가까이 항성을 돕니다.',
      '하늘의 모항성이 태양보다 360배 크게 보여 낮 면 지각을 용암으로 녹입니다.',
      '옛 해왕성급 행성이 대기를 잃고 남은 크토니안 행성 핵으로 추정됩니다.',
    ],
    content:
      '강렬한 항성 복사가 거대 행성의 대기를 벗겨내는 진화 과정을 보여준 선구적 발견입니다.',
  },
  'astro-ice-01': {
    title: '만 행성 (Mann’s Planet) — 얼어붙은 암모니아 얼음 구름의 극한 세계',
    createdAt: '가르강튀아 외곽 궤도',
    summary: [
      '영하의 폭풍이 끊이지 않으며 고체 얼음 구름이 산맥처럼 얼어붙은 극저온 세계입니다.',
      '질소 80%와 고농도 암모니아 결정으로 이루어진 호흡 불가능한 대기를 가집니다.',
      '멀리 떨어진 강착원반의 창백한 빛이 빙하 위에 날카로운 은청색 그림자를 드리웁니다.',
    ],
    content:
      '블랙홀 외곽 타원 궤도 얼음 행성 모델로 극저온 대기 성층화와 얼음 구름 지형을 구현했습니다.',
  },
  'astro-ice-02': {
    title: '해왕성 (Neptune) — 시속 2,100km 초음속 강풍의 푸른 얼음 거인',
    createdAt: '태양계 (30 AU)',
    summary: [
      '태양계 최고 속도인 시속 2,100km 강풍이 얼어붙은 메탄 구름을 가로지릅니다.',
      '대기 메탄이 붉은빛을 흡수해 깊은 사파이어빛 청색을 띱니다.',
      '태양으로부터 받는 열의 2.6배에 달하는 내부 열을 방출해 거대 암흑 폭풍을 일으킵니다.',
    ],
    content:
      '망원경 관측보다 앞서 천왕성 궤도의 중력 섭동 계산으로 수학적 예언 후 발견된 최초의 행성입니다.',
  },
  'astro-ice-03': {
    title: '천왕성 (Uranus) — 97.7° 옆으로 누워 도는 얼음 거인과 13개 고리',
    createdAt: '태양계 (19.2 AU)',
    summary: [
      '자전축이 97.7° 기울어져 84년 공전 궤도를 옆으로 구르듯 이동합니다.',
      '13개의 어두운 좁은 고리와 28개 위성을 거느리며 극지방 낮밤이 42년씩 이어집니다.',
      '태양계 행성 최저 대기 온도인 -224°C가 기록되었습니다.',
    ],
    content:
      '태양계 초기 거대 원시행성 충돌로 기울어진 것으로 추정되며 중심에서 어긋난 독특한 자기장을 가집니다.',
  },
  'astro-ice-04': {
    title: '위성 유로파 (Europa) — 얼음 지각 아래 지구 2배의 바다가 숨은 위성',
    createdAt: '목성계 (5.2 AU)',
    summary: [
      '두께 15~25km 균열 얼음층 아래 지구 전체 바닷물의 2배에 달하는 염수 바다가 펼쳐집니다.',
      '목성의 조석 가열이 해저 열수 분출구를 구동해 외계 생명체 최유력 후보지로 꼽힙니다.',
      '표면의 적갈색 선들은 지하 바다에서 솟아오른 염류와 황산염 흔적입니다.',
    ],
    content:
      'NASA 유로파 클리퍼 탐사선이 향하는 태양계 최고의 우주생물학 핵심 천체입니다.',
  },
  'astro-ice-05': {
    title: '위성 타이탄 (Titan) — 황금빛 연무와 액체 메탄 바다의 세계',
    createdAt: '토성계 (9.5 AU)',
    summary: [
      '태양계 위성 중 유일하게 지구 1.45배 기압의 짙은 질소 대기와 기상 순환을 가집니다.',
      '-179°C에서 액체 메탄과 에탄이 비로 내려 강과 광활한 극지 바다를 이룹니다.',
      '물얼음이 화강암처럼 단단히 얼어 산맥과 자갈을 형성합니다.',
    ],
    content:
      'ESA 하위헌스 착륙선이 탄화수소로 지구의 수문 지형을 재현한 신비로운 풍경을 촬영했습니다.',
  },
  'astro-ice-06': {
    title: 'OGLE-2005-BLG-390Lb — 중력 마이크로렌즈로 찾은 극저온 슈퍼지구',
    createdAt: '전갈자리 (21,500광년)',
    summary: [
      '중력 마이크로렌즈 기법으로 발견된 가장 멀고 추운 암석 외계행성 중 하나입니다.',
      '표면 온도가 -220°C까지 떨어져 질소와 메탄이 고체 빙하로 얼어붙어 있습니다.',
      '우리 은하 중심 팽대부 부근에 위치하며 지구 질량의 약 5.5배입니다.',
    ],
    content:
      '아인슈타인 중력렌즈로 배경 별빛이 증폭될 때 포착되어 은하 중심부에도 암석 행성이 널리 분포함을 증명했습니다.',
  },
  'astro-bh-01': {
    title: '사건의 지평선과 블랙홀 그림자 (슈바르츠실트 경계)',
    createdAt: 'R = 2GM / c²',
    summary: [
      '시공간 곡률이 극단에 달해 빛조차 탈출할 수 없는 일방통행 인과 경계입니다.',
      '중력 광자 포획 효과로 실제 슈바르츠실트 반지름보다 약 2.6배 큰 검은 그림자가 보입니다.',
      '초대질량 블랙홀 지평선을 넘는 순간은 국소적으로 평온하지만 모든 미래 경로는 특이점으로 향합니다.',
    ],
    content:
      '1916년 카를 슈바르츠실트가 아인슈타인 장방정식에서 유도한 관측 가능 우주와 블랙홀 내부의 경계입니다.',
  },
  'astro-bh-02': {
    title: '상대론적 입체 강착원반과 도플러 비밍 효과',
    createdAt: 'ISCO ~ 25 Rs',
    summary: [
      '유입 가스가 마찰과 자기 난류로 6,000K 이상 달궈져 두꺼운 황금 플라즈마 원반을 이룹니다.',
      '상대론적 도플러 비밍으로 관측자 쪽으로 회전하는 방향이 훨씬 더 밝고 뜨겁게 빛납니다.',
      '유입 질량의 최대 42%를 복사로 전환해 항성 핵융합을 압도하는 효율을 냅니다.',
    ],
    content:
      '가르강튀아 같은 고속 회전 커 블랙홀에서는 최내곽 안정 궤도가 지평선에 바짝 붙어 장엄한 입체 원반을 형성합니다.',
  },
  'astro-bh-03': {
    title: '아인슈타인 중력렌즈와 두꺼운 남·북극 쌍아치',
    createdAt: '일반상대성이론',
    summary: [
      '초대질량이 주변 시공간을 거대한 광학 렌즈처럼 휘어 빛의 경로를 크게 구부립니다.',
      '가려져 있어야 할 강착원반 뒷면이 블랙홀 북극 위와 남극 아래에 동시에 펼쳐집니다.',
      '블랙홀을 여러 바퀴 돈 광자들이 날카로운 2차 광자 고리를 새깁니다.',
    ],
    content:
      '킵 손의 상대론 광선추적 시뮬레이션은 평평한 원반이 중력렌즈에 의해 극지방을 감싸는 두꺼운 쌍아치로 보임을 증명했습니다.',
  },
  'astro-bh-04': {
    title: '궁수자리 A* (Sagittarius A*) — 우리 은하 중심 초대질량 블랙홀',
    createdAt: '궁수자리 (26,670광년)',
    summary: [
      '태양 430만 배 질량이 수성 공전 궤도보다 좁은 공간에 응축되어 있습니다.',
      '2022년 지구 규모 전파간섭계 EHT에 의해 사상 최초로 직접 촬영되었습니다.',
      '항성 S2가 16년마다 광속의 2.5% 속도로 스쳐 지나며 일반상대성이론을 정밀 검증했습니다.',
    ],
    content:
      '활동적 퀘이사보다 고요하지만 자화 가스 덩어리가 접근할 때마다 적외선·X선 플레어가 번쩍입니다.',
  },
  'astro-bh-05': {
    title: 'M87* (포웨히) — 인류 최초로 직접 촬영된 블랙홀 그림자',
    createdAt: '처녀자리 (5,350만 광년)',
    summary: [
      '질량이 태양의 65억 배에 달하며 사건의 지평선만 태양계 3개 이상 폭입니다.',
      '2019년 공개된 주황빛 고리 사진으로 블랙홀 그림자 존재를 시각적으로 확증했습니다.',
      '꼬인 자기장이 5,000광년 길이의 상대론적 플라즈마 제트를 우주로 분출합니다.',
    ],
    content:
      '하와이어로 포웨히(끝없는 창조의 장엄한 어둠)로 명명되었으며 편광 지도로 자기장 구조까지 규명되었습니다.',
  },
  'astro-bh-06': {
    title: '에드먼즈 행성 (Edmunds’ Planet) — 가르강튀아 외곽의 평온한 안식처',
    createdAt: '가르강튀아 외곽 궤도',
    summary: [
      '극심한 시간 지연을 벗어난 안전 외곽 궤도에서 호흡 가능한 대기와 온화한 사막 고원을 유지합니다.',
      '먼 강착원반과 동반성에서 쏟아지는 따뜻한 황금빛으로 안정적인 낮밤을 이룹니다.',
      '초대질량 블랙홀 외곽 중력권에도 장기 거주 가능한 생태계가 성립할 수 있음을 보여줍니다.',
    ],
    content:
      '밀러 행성의 해일과 만 행성의 얼음 폭풍을 벗어난, 블랙홀 행성계 최후의 평온한 거주 후보지입니다.',
  },
};

const NASA_REAL_PLANET_OVERRIDES: Record<
  Exclude<LanguageCode, 'vi'>,
  TranslationRecord
> = {
  en: {
    'astro-ocean-01': {
      title: 'Earth (Sol III) — The Blue Marble of the Solar System',
      createdAt: 'Solar System (1.00 AU)',
      summary: [
        'Third planet from the Sun on the Orion–Cygnus Spur of the Milky Way, diameter 12,742 km (1.00 R⊕), 71% covered by liquid water oceans.',
        'Active plate tectonics, protective magnetosphere, and 23.44° axial tilt sustain stable nitrogen–oxygen climate zones.',
        'Serves as NASA’s universal size reference (1.00 R⊕) for comparing planets from tiny Mercury (0.38 R⊕) to giant Jupiter (11.21 R⊕).',
      ],
      content:
        'Mapped by NASA Blue Marble and DSCOVR EPIC: Earth orbits Sagittarius A* at 26,670 light-years on the Orion–Cygnus Spur at 230 km/s. Zoom in closely to inspect oceans, continents, clouds, and real planetary scale differences across the Milky Way.',
    },
    'astro-lava-06': {
      title: 'Venus (Sol II) — Runaway Greenhouse & Sulfuric Acid Cloud Deck',
      createdAt: 'Solar System (0.72 AU)',
      summary: [
        'Nearly Earth’s twin in diameter (12,104 km, 0.95 R⊕), yet crushed under 92 atm of CO₂ at a scorching 464°C surface temperature.',
        'Shrouded in creamy-golden super-rotating sulfuric acid (H₂SO₄) cloud bands that circle the globe every four Earth days.',
        'Rotates backwards (retrograde 177.4° axial tilt), so the Sun rises in the west and sets in the east.',
      ],
      content:
        'NASA Magellan radar mapping and JAXA Akatsuki UV imagery revealed over 85,000 volcanic edifices and vast basaltic plains beneath Venus’s opaque sulfuric clouds.',
    },
    'astro-ice-01': {
      title: 'Mars (Sol IV) — The Red Planet, Olympus Mons & Valles Marineris',
      createdAt: 'Solar System (1.52 AU)',
      summary: [
        'Diameter 6,779 km (0.53 R⊕), defined by iron-oxide rusty regolith, Olympus Mons (21.9 km tall), and bright white polar CO₂/water ice caps.',
        'Scarred by Valles Marineris, a 4,000-km-long equatorial canyon system carved across ancient volcanic highlands.',
        'NASA Curiosity and Perseverance rovers confirmed ancient river deltas and habitable lakebeds inside Jezero Crater.',
      ],
      content:
        'With a 24h 37m day and 25.19° axial tilt, Mars is the prime focus of NASA’s planetary exploration across the Milky Way’s Solar System.',
    },
    'astro-bh-03': {
      title: 'Proxima Centauri b — Closest Known Exoplanet to Earth (4.24 ly)',
      createdAt: 'Alpha Centauri (4.24 ly)',
      summary: [
        'Orbits inside the habitable zone of Proxima Centauri, the nearest star to our Sun on the Orion–Cygnus Spur.',
        'Estimated diameter ~13,630 km (1.07 R⊕) with an 11.2-day orbital period around its M-dwarf host star.',
        'Primary target for next-generation interstellar imaging and biosignature spectroscopy just 4.24 light-years away.',
      ],
      content:
        'Discovered by ESO’s HARPS spectrograph in 2016, Proxima Centauri b receives 65% of Earth’s stellar irradiance and anchors humanity’s closest interstellar neighborhood.',
    },
    'astro-bh-06': {
      title: 'Mercury (Sol I) — Smallest & Innermost Planet of the Solar System',
      createdAt: 'Solar System (0.39 AU)',
      summary: [
        'Diameter just 4,879 km (0.38 R⊕) — smaller than Jupiter’s moon Ganymede — with an enormous iron core spanning 85% of its radius.',
        'Airless charcoal-silver surface covered in multi-scale impact craters including the 1,550-km Caloris Basin.',
        'Extreme thermal swings from 427°C to -173°C; its perihelion precession provided the first historic confirmation of Einstein’s General Relativity.',
      ],
      content:
        'Mapped in high resolution by NASA MESSENGER, Mercury even harbors water ice inside permanently shadowed polar craters. Zoom right down to its surface to compare its tiny scale against Jupiter and Saturn.',
    },
  },
  ja: {
    'astro-ocean-01': {
      title: '地球（Earth）— 太陽系の青い惑星と生命の揺りかご',
      createdAt: '太陽系（1.00 AU）',
      summary: [
        '天の川銀河オリオン腕に位置する太陽系第3惑星。直径12,742 km（1.00 R⊕）、表面の71%を液体の海が覆います。',
        '活発なプレートテクトニクス、強力な磁気圏、23.44°の地軸傾斜が安定した気候を維持しています。',
        'NASAが銀河系内の全惑星の大きさを比較する基準（1.00 R⊕）です。',
      ],
      content:
        'NASAブルーマーブル観測に基づく地球モデル。銀河中心いて座A*から26,670光年離れ、秒速230 kmで公転しています。',
    },
    'astro-lava-06': {
      title: '金星（Venus）— 暴走温室効果と濃密な硫酸の雲',
      createdAt: '太陽系（0.72 AU）',
      summary: [
        '直径12,104 km（0.95 R⊕）と地球とほぼ同サイズながら、92気圧のCO₂大気により地表温度は464°Cに達します。',
        '黄金色の硫酸（H₂SO₄）雲が4日間で惑星を一周するスーパーローテーション現象を起こしています。',
        '地軸傾斜177.4°の逆行自転をしており、太陽は西から昇り東へ沈みます。',
      ],
      content:
        'NASAマゼラン探査機とJAXAあかつきにより、厚い雲の下に85,000以上の火山と広大な溶岩平原が確認されています。',
    },
    'astro-ice-01': {
      title: '火星（Mars）— 赤い惑星・オリンポス山とマリネリス峡谷',
      createdAt: '太陽系（1.52 AU）',
      summary: [
        '直径6,779 km（0.53 R⊕）。酸化鉄の赤い大地、太陽系最大の火山オリンポス山（高さ21.9 km）、両極の氷冠が特徴です。',
        '赤道付近を全長4,000 kmにわたって走る巨大峡谷マリネリス峡谷が刻まれています。',
        'NASA探査車パーサヴィアランスがジェゼロ・クレーターで古代の河川三角州を確認しました。',
      ],
      content:
        '自転周期24時間37分、地軸傾斜25.19°と地球に似ており、NASAの惑星探査の最前線です。',
    },
    'astro-bh-03': {
      title: 'プロキシマ・ケンタウリb — 地球に最も近い系外惑星（4.24光年）',
      createdAt: 'ケンタウルス座α星系（4.24光年）',
      summary: [
        '太陽系に最も近い恒星プロキシマ・ケンタウリのハビタブルゾーンを公転する岩石系外惑星です。',
        '推定直径約13,630 km（1.07 R⊕）、公転周期はわずか11.2日です。',
        '4.24光年という近さから将来の恒星間探査の最有力目標となっています。',
      ],
      content:
        '2016年にESOのHARPS観測で発見され、オリオン腕のご近所にある最も身近な地球型系外惑星です。',
    },
    'astro-bh-06': {
      title: '水星（Mercury）— 太陽系最小・最内周のクレーター惑星',
      createdAt: '太陽系（0.39 AU）',
      summary: [
        '直径わずか4,879 km（0.38 R⊕）で太陽系最小。半径の85%を占める巨大な鉄核を持ちます。',
        '大気がほとんどなく、カロリス盆地（直径1,550 km）など無数の隕石クレーターに覆われています。',
        '昼は427°C、夜は-173°Cの極端な温度差。近日点移動はアインシュタイン一般相対性理論の初の実証となりました。',
      ],
      content:
        'NASAメッセンジャー探査機が全球を高精細マッピング。極限までズームインして木星との圧倒的なサイズ差を体感できます。',
    },
  },
  zh: {
    'astro-ocean-01': {
      title: '地球（Earth）— 太阳系蓝色星球与生命摇篮',
      createdAt: '太阳系（1.00 AU）',
      summary: [
        '位于银河系猎户臂的太阳系第三颗行星，直径 12,742 km（1.00 R⊕），71% 表面被液态海洋覆盖。',
        '活跃的板块构造、强磁场与 23.44° 自转倾角共同维持了稳定的氮氧大气和四季气候。',
        '作为 NASA 比较银河系所有行星尺寸的标准基准（1.00 R⊕）。',
      ],
      content:
        '基于 NASA 蓝色弹珠卫星观测：地球距银心人马座 A* 约 26,670 光年，以 230 km/s 绕银心公转。可无限放大近距离观察地表与各大行星的真实尺寸对比。',
    },
    'astro-lava-06': {
      title: '金星（Venus）— 失控温室效应与浓密硫酸云层',
      createdAt: '太阳系（0.72 AU）',
      summary: [
        '直径 12,104 km（0.95 R⊕）堪称地球孪生姐妹，但 92 倍大气压的二氧化碳造成 464°C 炙热地表。',
        '被奶油金色硫酸（H₂SO₄）云带包裹，高空超级自转云层每 4 天绕行星一周。',
        '轴倾角 177.4° 逆向自转，太阳从西边升起、东边落下。',
      ],
      content:
        'NASA 麦哲伦号雷达测绘揭示金星浓密云层之下分布着超过 85,000 座火山和广阔玄武岩平原。',
    },
    'astro-ice-01': {
      title: '火星（Mars）— 红色星球、奥林匹斯山与水手号峡谷',
      createdAt: '太阳系（1.52 AU）',
      summary: [
        '直径 6,779 km（0.53 R⊕），遍布氧化铁红土、太阳系最高火山奥林匹斯山（21.9 km）及白色两极冰冠。',
        '赤道横贯长逾 4,000 km、深达 7 km 的水手号大峡谷。',
        'NASA 毅力号与好奇号火星车已证实杰泽罗陨石坑曾存在远古河流三角洲与液态湖泊。',
      ],
      content:
        '火星自转周期 24 小时 37 分钟、倾角 25.19°，是 NASA 太阳系行星探索的核心目标。',
    },
    'astro-bh-03': {
      title: '比邻星 b（Proxima Centauri b）— 距离地球最近的系外行星（4.24 光年）',
      createdAt: '半人马座 α 星系（4.24 光年）',
      summary: [
        '绕距离太阳最近的恒星比邻星运行，位于其宜居带内部。',
        '估算直径约 13,630 km（1.07 R⊕），公转周期仅 11.2 天。',
        '凭借仅 4.24 光年的近距离，成为人类未来星际探测的首选系外世界。',
      ],
      content:
        '由欧洲南方天文台 HARPS 光谱仪于 2016 年发现，位于银河系猎户臂的太阳系近邻区域。',
    },
    'astro-bh-06': {
      title: '水星（Mercury）— 太阳系最小且最靠近太阳的岩石行星',
      createdAt: '太阳系（0.39 AU）',
      summary: [
        '直径仅 4,879 km（0.38 R⊕），拥有占行星半径 85% 的巨型铁核。',
        '几乎无大气层，灰银色岩面密布撞击坑与直径 1,550 km 的卡洛里斯盆地。',
        '昼夜温差高达 427°C 至 -173°C；水星近日点进动成为爱因斯坦广义相对论的首个观测铁证。',
      ],
      content:
        'NASA 信使号探测器完成了水星全球高分辨率测绘。放大至表面即可直观对比水星与木星、土星的巨大体型差距。',
    },
  },
  ko: {
    'astro-ocean-01': {
      title: '지구 (Earth) — 태양계의 푸른 행성과 생명의 요람',
      createdAt: '태양계 (1.00 AU)',
      summary: [
        '우리은하 오리온 팔에 위치한 태양계 세 번째 행성으로 지름 12,742 km(1.00 R⊕), 표면의 71%가 액체 바다입니다.',
        '활발한 판구조 운동과 강력한 자기장, 23.44° 자전축 기울기가 안정적인 질소-산소 대기를 지탱합니다.',
        'NASA가 은하 내 모든 행성의 크기를 비교하는 기준(1.00 R⊕)입니다.',
      ],
      content:
        'NASA 블루 마블 위성 관측 기반: 지구는 은하 중심 궁수자리 A*에서 26,670광년 떨어져 초속 230 km로 공전합니다.',
    },
    'astro-lava-06': {
      title: '금성 (Venus) — 폭주 온실효과와 짙은 황산 구름층',
      createdAt: '태양계 (0.72 AU)',
      summary: [
        '지름 12,104 km(0.95 R⊕)로 지구의 쌍둥이 크기지만 92기압 이산화탄소 대기로 표면 온도가 464°C에 달합니다.',
        '황금빛 황산(H₂SO₄) 구름대가 4일마다 행성 전체를 초고속으로 휘감고 돕니다.',
        '자전축이 177.4° 기울어진 역행 자전으로 태양이 서쪽에서 떠서 동쪽으로 집니다.',
      ],
      content:
        'NASA 마젤란 레이더 관측으로 두꺼운 황산 구름 아래 85,000개 이상의 화산과 용암 평원이 밝혀졌습니다.',
    },
    'astro-ice-01': {
      title: '화성 (Mars) — 붉은 행성, 올림푸스 산과 매리너리스 협곡',
      createdAt: '태양계 (1.52 AU)',
      summary: [
        '지름 6,779 km(0.53 R⊕)로 산화철 붉은 토양, 태양계 최고 화산 올림푸스 몬스(21.9 km), 양극 얼음 극관이 특징입니다.',
        '적도를 따라 길이 4,000 km에 이르는 거대한 매리너리스 협곡이 가로지릅니다.',
        'NASA 퍼서비어런스와 큐리오시티 로버가 예제로 분화구에서 고대 강 삼각주를 확인했습니다.',
      ],
      content:
        '24시간 37분의 하루와 25.19° 자전축 기울기를 가진 화성은 NASA 행성 탐사의 핵심 대상입니다.',
    },
    'astro-bh-03': {
      title: '프록시마 센타우리 b — 지구에서 가장 가까운 외계행성 (4.24광년)',
      createdAt: '알파 센타우리 계 (4.24광년)',
      summary: [
        '태양에서 가장 가까운 항성 프록시마 센타우리의 생명가능지대를 공전하는 암석 외계행성입니다.',
        '추정 지름 약 13,630 km(1.07 R⊕), 공전 주기는 11.2일입니다.',
        '불과 4.24광년 거리로 미래 성간 탐사의 1순위 목표 천체입니다.',
      ],
      content:
        '2016년 ESO HARPS 분광 관측으로 발견되었으며 오리온 팔의 가장 가까운 이웃 외계세계입니다.',
    },
    'astro-bh-06': {
      title: '수성 (Mercury) — 태양계에서 가장 작고 태양에 가까운 행성',
      createdAt: '태양계 (0.39 AU)',
      summary: [
        '지름이 불과 4,879 km(0.38 R⊕)로 태양계 최소 행성이며 반지름의 85%를 차지하는 거대한 철 핵을 지닙니다.',
        '대기가 거의 없어 칼로리스 분지(1,550 km)를 비롯한 수많은 운석 충돌구가 표면을 덮고 있습니다.',
        '낮 427°C, 밤 -173°C의 극심한 일교차와 근일점 세차운동은 일반상대성이론의 역사적 첫 증거였습니다.',
      ],
      content:
        'NASA 메신저 탐사선이 정밀 촬영한 수성입니다. 극한까지 확대해 목성·토성과의 극적인 크기 차이를 직접 비교해 보세요.',
    },
  },
};

const ALL_TRANSLATIONS: Record<Exclude<LanguageCode, 'vi'>, TranslationRecord> = {
  en: EN_NODES,
  ja: JA_NODES,
  zh: ZH_NODES,
  ko: KO_NODES,
};

/**
 * Returns a localized copy of a celestial node for the active UI language.
 * Custom AI-generated nodes retain their original user/AI language automatically.
 */
export function getLocalizedNode(
  node: MemoryNode,
  lang: LanguageCode
): MemoryNode {
  if (lang === 'vi') return node;
  const override =
    EXTRA_CELESTIAL_TRANSLATIONS[lang]?.[node.id] ||
    NASA_REAL_PLANET_OVERRIDES[lang]?.[node.id] ||
    ALL_TRANSLATIONS[lang]?.[node.id];
  if (!override) return node;
  return {
    ...node,
    title: override.title,
    createdAt: override.createdAt,
    summary: override.summary,
    content: override.content,
  };
}
