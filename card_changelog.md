# Card Changelog

This document tracks changes to cards in MTG: Into The Matrix throughout development.

---

## 2025-12-28 — Initial Creation

Initial card file with 251 cards across all colors. Established core mechanics:
- Digital (shadow-like evasion mechanic)
- Jack-in/Eject (transform mechanics)
- Override (champion variant for Agents)
- Energy {E} resource system
- Gun Token (Equipment artifact)

---

## 2025-12-31 — Major Restructure

**Theme:** Complete restructure with new card codes, balance changes, and new cards

### Code System Overhaul
All card codes changed from 2-digit (C01, U60, R01) to 3-digit format (C001, U001, R001)

### New Cards Added
- **The Oracle, Path Calculator** {2}{U}{U} — Legendary Program Advisor with top-deck casting
- **See The Matrix** {2}{U}{U}{U} — Enchantment with flash-casting and modal counters
- **Thomas Anderson** {1}{U} — Legendary Human with Skulk, searches for legendary creatures
- **Sentinel Swarm** {3}{B} — Robot that creates flying Robot tokens
- **Death Harvest Protocol** {B}{B} — Drain enchantment
- **The Red Woman** {1}{R}{R} — Legendary indestructible Program forcing attacks
- **System Purge Virus** {3}{G}{G} — Modal destruction spell
- **Tunnel Path-Finder** {1}{G} — Scout with graveyard exile energy gain
- **Zion Archivist** {1}{G}{G} — Legendary graveyard manipulation
- **Agent White** {1}{W}{B} — Legendary Agent with Override and lord effect
- **Mouse, Software Prodigy** {1}{U}{R} — Legendary creature with Digital token creation
- **Weapon Cache** {2}{R} — Equipment animation enchantment
- **Escape Tactician** {1}{W}{W} — Legendary with flicker ability
- **Zion Mystic** {G} — Legendary mana dork with energy
- **Sentinel Scout** {2}{R} — Robot with digital damage
- **There is No Spoon** {1}{U}{U} — Counterspell with energy gain
- **Neo, Newly Awakened** {R/W} — Level-up style legendary
- **Agent Smith, System Virus** {3}{B}{B} — Legendary with creature theft

### Cards Removed
- Agent Smith, Firewall Guardian (White mythic Agent)
- Encryption Patch
- Rapid Learning (replaced)
- Furnace Stoker
- Zion Hotshot
- Furious Strike
- Terminate (reprint)
- Damping Matrix (reprint)

### Major Balance Changes
- **System Security**: {3}{W} → {4}{W}, added "Draw a card"
- **Automated Turret**: Uncommon → Rare, (0/4) → (4/4), added Vigilance and damage ability
- **Captain's Speech**: {1}{W} → {1}{W}{W}, +2/+2 instead of +1/+1 counters
- **Switch, Faithful Defender**: {W}{W} → {1}{W}{W}, now transforms
- **Weapon Drop**: Creates two Gun tokens instead of one
- **Blue Screen**: 1 stun counter → 2 stun counters
- **Rapid Learning**: {2}{U} → {U}, draws 1 card + {E}{E} instead of 2 cards
- **Heavy-Duty Construct**: (5/5) → (6/6)
- **The Nebuchadnezzar**: (3/5) → (4/5)
- **Deus Ex Machina**: Energy threshold 10 → 9

### Rarity Changes
- Automated Turret: Uncommon → Rare
- Code Runner: Uncommon → Rare
- System Override: Uncommon → Rare
- Hunter-Killer Sentinel: Uncommon → Rare
- Bio-Energy Conversion: Uncommon → Rare

### Type Updates
- Multiple Robot creatures properly typed as "Artifact Creature — Robot"
- Local Beat Cop: "Program" → "Program Agent"
- Data Courier: "Program" → "Program Scout"
- Deep-Web Miner: "Program" → "Program Worker"
- Disposable Informant: "Program" → "Program Assassin"
- The Trainman: "Program" → "Program Guide"
- The Keymaker: "Program" → "Program Rogue"

---

## 2025-12-31 — Minor Fixes

- **The Analyst**: Added Digital keyword
- **Thomas Anderson**: Added Digital, enhanced trigger with +1/+1 counter
- **Power Suit Fella** renamed to **APU Operator**

---

## 2026-01-01 — Major Revamp

**Theme:** Name changes, balance adjustments, flavor refinement

### Card Renames
- Zion Welder → **Youthful Welder**
- Perimeter Guard → **Prophesizing Elder** (with new ability)
- Zion Operator → **Daycare Manager**
- Perimeter Scout → **Uplink Guardian**
- Zion Peacekeeper → **Peace Advocate**
- Combat Specialist → **Avid Marksman**
- Weapons Expert → **Expert Sniper**
- Zion Gunner → **Zealous Protector** (completely redesigned)
- Hardline Hacker → **Manic Decrypter**
- Resistance Captain → **Reality Advocate**
- Neo, The One → **Neo, The Awakened**
- Electronic Parasite → **Electronic Tracking Bug**
- The Oracle, Path Calculator → **The Oracle, Destiny Planner**

### Balance Changes
- **Youthful Welder**: Vehicle buff +1/+1 → +2/+1
- **Prophesizing Elder**: Now scries 2 and gains 2 life
- **Uplink Guardian**: (2/1) → (1/3)
- **Deploy Sentinels**: Added "You get {E}{E}"
- **Overcharge**: +3/+0 → +3/+1
- **Neo, The Awakened**: Flying/trample threshold 4 → 5
- Awaken the One removed from set

---

## 2026-01-01 — Consistency Updates

- **Neo, Newly Awakened**: Level-up cost {R/W}{R/W}{R/W} → {R/W}{R/W} for second form

---

## 2026-01-01 — Trinity Tweaks

- **Trinity, Tactical Leader** back face renamed: "Trinity, Combat Driver" → "Trinity, Digital Savior"

---

## 2026-01-01 — Templating Update

**Theme:** Comprehensive templating cleanup for rules consistency

- All mechanics now use proper reminder text format
- "enters the battlefield" → "enters" throughout
- Keyword capitalization standardized
- **Zion Defender**: Added {1} to tap ability
- **Gun Token**: +1/+1 → +1/+0 (first strike remains)

---

## 2026-01-02 — New Cards Added

### New Commons
- **Operator Support** {W} — Instant: +2/+2 and {E}{E}
- **Zion Volunteer** {1}{W} — (3/1) Ward {1}, conditional lifegain
- **Forceful Disarmament** {1}{W} — Modal artifact/enchantment destruction
- **Glitch Trap** {1}{U} — Flash Aura with tap-down and shuffle
- **Link Monitor** {1}{U} — Mana producer and transformer
- **Slag Melt** {1}{R} — Artifact destruction with bonus damage
- **Machine Addict** {3}{R} — (4/3) Haste with temporary energy
- **Independent Trader** {1}{R} — Looting creature

### Other Changes
- **Data Courier**: Lost Flying keyword
- **Hardline Connection**: Now adds any color instead of {G} or {U}

---

## 2026-01-02 — Mifune Improvements

- **The Logos**: "scry 2" → "draw a card" on combat damage

---

## 2026-01-02 — File Reorganization

Added section headers and reorganized cards within each color by rarity.

- **Hull Breach Patch**: Removed

---

## 2026-01-05 — Updates and Cleanup

- **Daycare Manager**: Added Lifelink
- **Hovercraft Scout** replaced by **System Patcher** {3}{U} — (3/2) Digital, bounce with energy
- **Link Monitor**: Removed Digital keyword
- **Code Runner**: Added Digital keyword
- **Combat Module Download**: Added "can block creatures with digital"
- **Nebuchadnezzar's Ace**: Flying → +1/+1 lord effect
- **Glitch-Skin Weird**: Flying → Menace for energy
- **Liquefy**: Can now sacrifice artifact OR creature
- **The Architect**: Added "if it was cast" clause
- **The Nebuchadnezzar**: Now Legendary
- Removed: Glitch in the Matrix, Cain and Abel

---

## 2026-01-09 — Playability Tweaks

**Theme:** Cost reductions and stat adjustments for better gameplay

- **Keymaker's Guide**: Jack-in cost {1}{W} → {W}
- **Physics Override**: 4/4 → 3/3
- **See The Matrix**: Counter now has "unless they pay {3}"
- **Reinforcement Agent**: (4/4) → (4/3)
- **Magma-Code Brawler**: Menace → Haste
- **Panic Fire**: {3}{R} → {2}{R}
- **The Red Woman**: {1}{R}{R} → {2}{R}{R}, redesigned trigger
- **Ship Medic**: {E}{E} → {E} on enter
- **Zion Scrap-Hulk**: (3/5) → (3/4)
- **Heavy-Duty Construct**: (6/6) → (6/5)
- **Matrix Watcher**: (2/6) → (2/4)
- **Zion Heavy-Loader**: Pump cost {E} → {E}{E}
- **Agent Smith, Antivirus**: Added "once each turn" clause
- **Deus Ex Machina**: Energy gain {E}{E} → {E}{E}{E}

---

## 2026-01-12 — Fleshing Out Uncommons

### New Cards
- **Morpheus, Seeker of Potential** {4}{W} — Legendary (4/4) Digital tutor
- **Field Medic** {W} — DFC with lifegain synergy
- **Hoversuit Striker** {3}{W}{W} — (2/4) Flyer with artifact/equipment bonuses
- **Disposal Subroutine** {1}{W} — Exile with energy cost
- **Extraction Mission** {1}{W}{W} — Mass reanimation
- **Viral Overwrite** {3}{U}{U} — Moved from rare
- **Subroutine Analyst** {2}{U}{U} — Spell recursion
- **Copy and Paste** {3}{U} — Token copy with digital choice
- **Sudden Respawn** {4}{B} — Instant reanimation
- **Sentinel Charger** {3}{R} — (4/3) Haste with looting
- **Draconic Sentinel** {4}{R}{R} — (5/5) Flying Robot Dragon
- **Combat Simulation** {1}{G} — Fight spell with +1/+1 counter
- **Cain, Loyal Exile** {3}{B}{B} — Legendary Vampire Program

### Removed
- Extended Network
- Awakened Custodian
- Cross-Wiring
- Hardline Interceptor
- Electronic Tracking Bug
- Operator's Console
- Red Woman Code

### Changes
- **Zion Fuel-Runner** → **Biomatter Repurposer** (now Artifact Creature)
- **Agent Jones, Dodger**: {2}{U}{B} → {1}{U}{B}
- **Agent Grey**: {U}{B} → {1}{U}{B}
- **Black Market Surgeon** → **Cain, Loyal Exile** (complete redesign)
- **The Trainman**: {2}{B} → {3}{B}

---

## 2026-01-13 — Final Tweaks

- **The Keymaker**: Costs now {E} and {E}{E} instead of free and {E}{E}; protection → hexproof
- **Weapons Cache**: New ability "If you would create a Gun token, create an additional Gun token"
- **The Twins, Ghost Programs**: {1} phase out → {W}{B} exile and return
- **Persephone, Disillusioned Wife**: Pay cost {1} → {2}
- **Zion Scrap-Hulk** → **Zion Acid-Slinger** {1}{G} — (2/1) Reach, deathtouch (major redesign)
- **Combat Simulation**: Now puts +1/+1 counters on TWO creatures instead of fight
- **Zion Mystic**: {3},{T} → {2},{T} for energy gain
- **Sentinel Carcass** → **Sentinel Trap-Ship** — Now has Flash

---

## 2026-01-14 — Templating & Commons Cleanup

**Theme:** Standardizing ability text and common slot refinement

### Templating Changes
- Ability text now uses "this creature" instead of card names throughout for consistency
- Type syntax standardized (e.g., `Creature - Human` → `Creature — Human`)

### Card Changes
- **[C002] Crowd Simulation** → **Rebellious Crowd**: Now creates Human tokens instead of Citizen tokens with digital
- **[C004] Zion Neophyte**: Jack-in cost `{U}` → `{W}` (color fix), added "scry 1" on attack trigger
- **[C005] Zion Militia**: Removed from set
- **[C006] Stasis Field**: `{1}{W}` → `{2}{W}`, added `{E}{E}{E}` exile ability
- **[C009] Deja Vu**: Fixed energy text, added flavor text
- **[C014] Prophesizing Elder**: Lifegain 3 → 2, added Basic landcycling {2}
- **[U003] Defensive Formation**: `{1}{W}` → `{3}{W}`, activation cost `{1}{W}` → `{W}`
- **[U012] Disposal Subroutine**: `{1}{W}` → `{2}{W}`, additional cost `{3}` → `{2}`

### Cards Moved
- **Youthful Welder**: Common → Uncommon (now [U014])
- **Stand Together**: Added as new Uncommon [U015]

---

## 2026-01-15 — New Card Additions

### New Cards
- **[U051] Unplugged Operative** {1}{B} — (2/1) Deathtouch DFC Rogue
- **[C094] Adrenaline Upload** {R} — Instant: +2/+0, haste, {E}{E}
- **Abel, Chateau Bouncer** {2}{B} — (4/2) Digital Werewolf Program

### Balance Changes
- **Sentinel Swarm**: Tokens now 2/2 with menace (was 1/1 flying), removed sacrifice trigger
- **Information Leech**: Added power/toughness (was missing)

---

## 2026-01-20 — Mythic Rarity Reorganization

### Rarity Changes (Rare → Mythic)
- **Weapons Cache**: Now [M08]
- **Bio-Spark Behemoth**: Now [M10]
- **The Grand Equation**: Now [M14]

### New Mythics Added
- **[M09] Reclaim the Surface** {X}{X}{G} — Create X 4/4 Constructs
- **[M10] Bio-Spark Behemoth** {4}{G}{G} — (6/6) Energy generator with mana production

### Card Fixes
- **The Grand Equation**: Fixed typos ("you this saga" → "this saga", "creature with" → "creatures with")
- **Dozer**: Renamed and rebalanced

---

## 2026-01-22 — Neo & Energy Updates

### Major Changes
- **Neo, Humanity's Inspiration**: Added Prowess and Training for Humans
- **Neo, The One**: Added `{2}: Eject` ability (previously could not transform back)
- **Weapons Cache**: Changed to {2}{W}, now White instead of Red
- **Root Access**: Changed to {4}{G}{G}{U} (added Blue)

### Other Changes
- **Lineage Honorer**: Added Flash
- **Matrix Watcher**: Added Flash

---

## 2026-01-26 — Energy Cost Conversions

**Theme:** Converting Jack-in costs to Energy for key cards

### Cards Removed
- **[C094] Adrenaline Upload**: Removed (too similar to other combat tricks)
- **[U048] Systematic Overwrite**: Removed ("Punisher" mechanic problematic)

### Energy Cost Changes
- **[R003] Switch, Faithful Defender**: Jack-in `{W}` → `{E}`, Eject `{W}` → `{E}`
- **[U067] Adrenaline Junkie**: Jack-in `{1}{R}` → `{E}{E}`, trigger changed to "At the beginning of combat", Eject trigger now "At the beginning of your end step"

### Other Changes
- **Swarm Commander**: (2/2) → (3/2)
- **Reality Advocate**: Added "Whenever a human enters the battlefield under your control, you get {E}"
- **Club Hel**: Completely redesigned — now adds {W} or {B} for Program/lifegain spells, has lifegain → drain trigger

### Archetype Rename
- **WB: Lifesucking Exiles** → **WB: Lifedrain Syndicate**

---

## 2026-01-26 — Card Redesigns & Balance

**Theme:** Redesigning underperformers and further balance tuning

### Card Redesigns
- **[C093] Static-Charged Hacker**: Activated pump `{1}, Pay {E}: +2/+0` replaced with static ability "As long as you have three or more {E}, this creature gets +1/+0 and has first strike"
- **[U081] Nutrient Silo** (Plant Wall): Sacrifice ability changed from `{1}{B}: -2/-2` to `{2}: +2/+2`
- **[U086] Prime Construct** → **Nourishing Construct**: (7/7) trample → (5/6) vigilance, life gain now scales with energy count
- **[R151] Club Hel**: Redesigned again — now adds any-color mana for digital creature spells, gains `{4},{T}: +1/+1 pump` for digital creatures

### Balance Changes
- **[U066] Channeled Surge**: Energy gain {E}{E} → {E}{E}{E}, flashback reduced {3}{R}{R} → {2}{R}{R}
- **[U062] Surge Channeler**: Templating fix ("this creature deals 2 damage" instead of "deal 2 damage")
- **[U112] Tank, the Operator**: Hexproof removed from modal choice (now trample or reach only)
- **[R110] Morpheus, the Believer**: Energy gain at end step {E} → {E}{E}
- **[U118] Uploaded Vanguard** (back face Vanguard Avatar): Lost first strike, buff now applies to all attacking creatures (was digital only), eject cost {2} → {1}

### New Abilities
- **[R150] The Nexus**: Gained `{4}, {T}, sacrifice: look at top four for artifact/robot/program`
- **[U026] Fact or Fiction**: Added flavor text (red pill/blue pill quote)

---

## 2026-01-28 — Artifact Type Corrections

**Theme:** Fixing creature types to include "Artifact Creature" and Aura templating

### Type Fixes
- **[C045] Code Prowler**: "Creature — Construct Beast" → "Artifact Creature — Construct Beast"
- **[U080] Heavy-Duty Construct**: "Creature — Construct" → "Artifact Creature — Construct"
- **[M10] Bio-Spark Behemoth**: "Creature — Construct Beast" → "Artifact Creature — Construct Beast"
- **[U108] Scrap Repurposer**: "Creature — Robot Artificer" → "Artifact Creature — Robot Artificer"

### Templating Fixes
- Fixed "When this creature enters" to use proper card names on non-creature permanents: **Stasis Field**, **Take the Blue Pill**, **Take the Red Pill**, **Code Vision**
- **[R060] System Override**: Fixed "this creature" → "this spell" (it's a Sorcery)

---

## 2026-01-29 — Token Standardization & Card Clarifications

### Token Name Standardization
- All "Citizen creature token with digital" → "Program Citizen creature token with digital" (affected 3 cards)

### Card Changes
- **[C005] Awakened Rebel** (back face): Added `{2}{W}: Jack-in` ability
- **[C061] Disposable Informant**: Type changed from "Human Program Assassin" to "Program Assassin"
- **[U064] Akimbo Specialist**: Ability text reworded for clarity
- **[R100] Welcome to the Real World**: Saga chapter formatting standardized (dashes, wording)
- **[M14] The Grand Equation**: Chapter I text clarified — now explicitly says "each other creature is a copy of the second chosen creature"

---

## 2026-02-06 — Override → Champion, Vehicle Reduction & Major Reworks

**Theme:** Replacing Override with official Champion keyword, reducing Vehicle count, reworking several cards

### Mechanic Changes
- **Override renamed to Champion**: All 9 cards updated to use "Champion a creature with digital" wording
- Haste removed from base Champion definition; two specific cards (**Meter Reader**, **Reinforcement Agent**) now have haste as a separate conditional ability
- **UB archetype** renamed from "Agent control" to "Agent Control & Infiltration", expanded to mention saboteur abilities
- **GW archetype** updated from "Vigilance and Lifelink" to "Vigilance and affinity for humans"
- **RW archetype** updated from "Vehicle and Equipment deck" to "Guns" deck
- Card count updated: 253 → 251

### Card Redesigns
- **[C010] Fleet Mechanic** → **Council of Elders** {4}{W} (3/2): Completely new card with affinity for humans and cantrip
- **[U104] Agent Jones**: Major rework — lost Flash, Champion, and bounce-on-target; now a 3/2 with saboteur-doubling ability
- **[C100] Drone Pilot** → **Explosive Drone**: Lost Vehicle synergy, gained `{3}{R}, Sacrifice: deal 3 damage`
- **[C102] Sentinel Sweeper** → **Sentinel Breaker**: (2/3) flying → (4/3) trample, death trigger buffed to {E}{E}
- **[U063] Pilot's Instinct** → **Overclock**: Completely reworked — now modal (can't block / energy / destroy artifact)
- **[U117] Captain Mifune**: Reworked from Vehicle lord to Equipment-focused draw engine

### Card Balance Changes
- **[U046] Reinforcement Agent**: {1}{B} (4/3) → {2}{B} (5/4)
- **[U014] Youthful Welder**: Simplified — lost Vehicle pump, changed from 1/1 to 2/1
- **[R021] Code Runner**: Removed "{E}" from opponent's-turn cast trigger
- **[R028] Seraph, Guardian of the Oracle**: Trigger changed from "+1/+1 counter on target creature" to "draw a card"
- **[U052] Agent Brown, Enforcer**: "overrode" retained in Champion context (now checks "if it championed a creature" in committed version, "overrode" in transition)

### Cards Removed
- **[C151] APU Corps** — Vehicle (4/5) reach
- **[C153] Standard Issue Hovercraft** — Vehicle (4/4)
- **[U139] The Mjolnir, Hammer of Zion** — Legendary Vehicle (6/5)

### Creature Type Reordering
- All transform card back faces reordered from "Human [Class] Program" to "Human Program [Class]" (16 cards affected)
- **[R002] Automated Turret**: "Robot Wall" → "Construct Wall"

### Design Notes Added
- Added Jack-in/Eject design note explaining how transform mechanics enable Digital interaction for non-Digital colors

---

## Summary

### Major Themes Throughout Development
1. **Gun Token Nerf**: From +1/+1 to +1/+0
2. **Energy Balance**: Multiple energy costs adjusted
3. **Creature Stat Rebalancing**: Many P/T adjustments
4. **Digital Keyword Consistency**: Added to creatures that were missing it
5. **Jack-in Cost Reduction**: Several costs reduced for playability
6. **Artifact Type Addition**: Many Robots properly typed as Artifact Creature
7. **Transform Card Polish**: Many DFCs got improved back faces
8. **Mythic Cycle Expansion**: Added several new mythics across colors
9. **Override → Champion**: Mechanic renamed to use official MTG keyword
10. **Vehicle Reduction**: Three Vehicles removed, Vehicle-synergy cards reworked to Equipment/Gun focus
11. **Creature Type Standardization**: "Human Program [Class]" ordering on transform backs, Construct types fixed

---

## 2026-02-06 — Late Polish & Hunter-Killer Rework

### Card Redesigns
- **[R061] Hunter-Killer Sentinel**: Redesigned.
    - **Old**: 3/3 Flash Flying. Redirect spell on ETB. Sac upon Combat Damage -> 4 dmg board wipe. (Too convoluted/Strong)
    - **New**: 3/3 Flying Haste. Sacs at EOT. Death trigger: Deals 3 damage divided as you choose. (More "Unearth" style aggression)
- **[C133] Geothermal Scout** {1}{G}: Replaced **Bio-Surge**. New Energy Scout.
- **[C131] Zion Protégé** {1}{G}: Renamed from **Impressionable Youth**. Heroic growth + Reach.
- **[U080] Aether Weaver** {2}{G}: Replaced **Heavy-Duty Construct**. Shaman with power-matters energy gain.
- **[U025] Propaganda** → **Data Harvester** {2}{U}: Replaced defensive enchantment with proactive Saboteur creature.
    - **New**: 2/1 Flash Digital. ETB: Remove digital from target. On Hit: Draw a card.
