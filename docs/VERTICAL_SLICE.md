# AV Tech RPG: First Vertical Slice

## Goal

Test whether a funny, approachable 2D workplace RPG about commercial AV work is
fun before adding technical depth.

The player is a new technician at a badly managed trunkslammer company in the
greater Philadelphia area. They begin with a screwdriver and gradually acquire
tools, experience, and better opportunities.

This is not an AV simulator. Industry details provide structure and flavor while
the actual choices remain readable to players outside the trade.

## First Day: Two Quick Carts

Leadership assigns the new technician to build two mobile video conferencing
carts at a client site. The supervisor is supposed to stay and provide training.
Shortly after unloading, the supervisor apologizes: management also scheduled
them for meetings at another site.

The job becomes a small escalation:

1. Walk through the messy shop and find the staged equipment.
2. Load cart parts and the player's screwdriver into the van.
3. Pick the client site on a simplified regional map.
4. Handle one travel, parking, or building-access complication.
5. Unload equipment and begin assembling the carts with the supervisor.
6. Continue alone after the supervisor is pulled away.
7. Receive interruptions from dispatch, sales, or the client.
8. Choose whether to work neatly, rush, ask for clarification, or improvise.
9. Finish late, receive an unfair management note, and return to the shop.

The supervisor is not the villain. They are also affected by the company's poor
planning. The humor comes from a simple task becoming harder for recognizable
reasons.

## Technician Selection

Begin with a short technician-selection screen before the player enters the
shop. The finished game can offer a small roster of specific characters with
different starting attributes, backgrounds, and tradeoffs.

For the first prototype, include one clearly labeled placeholder technician.
Keep the implementation data-driven so additional characters can be added later
without changing the movement or job systems.

Possible future differences:

- More energy but less craftsmanship
- Better confidence but higher starting burnout
- Strong client reputation but poor management reputation
- A useful starter item such as a tool bag or coffee

Avoid a full character creator until the core loop is proven.

## Player Attributes

Keep the initial set small:

- **Energy:** Short-term capacity during the current shift.
- **Burnout:** Persistent wear from overtime, bad situations, and missed rest.
- **Craftsmanship:** Ability to finish work neatly and avoid callbacks.
- **Confidence:** Ability to improvise and eventually push back on bad plans.
- **Reputation:** Separate impressions held by clients, coworkers, and
  management.

These scores should create story choices, not constant arithmetic. Low energy
makes shortcuts tempting. Management may punish a careful job for exceeding an
unrealistic estimate even when the client is satisfied.

## Career Loop

The walkable shop replaces a generic home menu:

`Shop -> load van -> travel -> job site -> result -> shop`

Later companies should have visibly different shops, processes, and cultures.
Better employers can provide staged materials and credible plans while still
creating new kinds of pressure.

Progression should use practical upgrades:

- Tool bag
- Drill and bits
- Utility cart
- Labeler
- Cable tester
- Laptop
- Compact ladder
- Better van storage
- Food, coffee, and rest planning

Each upgrade should remove friction or open choices instead of acting as a
percentage bonus.

## Movement and Carrying

The player directly walks a top-down 2D character around the shop and job site.
Keep this deliberately small for the first prototype:

- Use keyboard movement with a simple walk speed.
- Let the player carry one equipment item at a time.
- Show the carried item as an icon or short label above the character.
- Use one interaction button near shelves, the van, and installation points.
- Make the shop, parking spot, entrance, and install room compact enough that
  trips take seconds rather than minutes.
- Do not simulate weight, stamina drain per step, doors, elevators, traffic
  driving, or detailed inventory grids yet.

The first job should require only a few manual unloading trips. That is enough
to establish why a utility cart will matter later without making the tutorial
tedious. Once the player earns a cart, it can increase carrying capacity and
visibly reduce repetition.

## Regional Travel Layer

Use recognizable real place names on a simplified greater Philadelphia map.
Locations should not receive broad "good neighborhood" or "bad neighborhood"
labels. Build challenges from objective job-site traits instead:

- Travel time and current congestion
- Parking availability and cost
- Distance from the van to the work area
- Loading-zone limits
- Street closures and special events
- Building access, security desks, and loading-dock reservations
- Toll crossings
- Weather and time of day

This keeps the regional humor specific without flattening real communities into
stereotypes. A difficult assignment can happen in an expensive office tower, on
a residential block, at a suburban campus, or at a secure industrial site for
different reasons.

### Initial Map Nodes

Use a small first map and add destinations gradually:

- **Shop:** A fictional trunkslammer warehouse in Broomall, near West Chester
  Pike and the Blue Route interchange. The location makes many regional
  dispatches look deceptively reasonable before traffic, tolls, parking, and
  access conditions are considered.
- **Center City:** Expensive meters, garages, short loading windows, congestion,
  and a longer carry from the van.
- **South Philadelphia:** Residential parking pressure, block closures, and
  sports-complex event traffic.
- **University City:** Institutional check-in, active loading areas, and parking
  enforcement.
- **The Navy Yard:** A campus arrival with a security-booth check-in and another
  set of directions after the player reaches the gate.
- **Conshohocken:** A suburban commercial hub where the office may be easy to
  reach but the correct garage, entrance, or suite still costs time.
- **King of Prussia:** Office-park and retail traffic with easier parking but
  longer drives and spread-out buildings.
- **Cherry Hill:** A South Jersey assignment that adds a Delaware River bridge
  crossing and the possibility that dispatch forgot to account for tolls.

### Early Travel Events

- The Center City smart loading-zone clock starts as soon as the van arrives.
- A residential block is closed for a permitted street event. Park farther away.
- A South Philadelphia job overlaps with sports-complex traffic.
- The Navy Yard security booth redirects the player to a different building.
- A Conshohocken parking garage has public spaces only in a specific area.
- Dispatch schedules a Cherry Hill service call after a Pennsylvania job and
  forgets the return toll.
- A verified traffic incident on a major route makes the player choose between
  arriving late or taking a slower alternate route.

The first vertical slice needs only one travel event. Keep the broader list as a
content backlog.

### Starting Shop: Broomall

The first company's walkable shop is a small, disorganized warehouse unit in
Broomall. Use a fictional street address while keeping the real regional
geography recognizable.

Nearby route choices create future events:

- West Chester Pike toward Havertown, Upper Darby, and Philadelphia
- The Blue Route toward I-95, Conshohocken, and King of Prussia
- Surface roads toward Main Line assignments

The first tutorial does not need a route-selection simulation. Show the shop and
destination on the map, then apply one readable travel or parking complication.
The two-cart client site should be a fictional office with a real regional place
name.

### Tutorial Destination: Center City East

Place the first two-cart job at a fictional office in **Center City East**,
loosely inspired by the 8th and Market corridor. Use recognizable regional
geography without reproducing an exact client address, building name, or floor
plan.

The first trip from Broomall introduces the game's logistics in a controlled
way:

1. Dispatch describes the assignment as a simple two-cart build.
2. The travel transition shows the trip from Broomall toward Center City.
3. The player parks in a fictional nearby garage.
4. The player meets the supervisor at the parked van.
5. The supervisor explains that curb unloading was not arranged.
6. The player manually carries a small number of items from the garage to the
   client entrance.

Keep the parking complication readable rather than punishing. The tutorial only
needs to establish that management did not budget for unloading time and that a
utility cart would eventually matter.

### Travel Choices After the Tutorial

Script the first drive and garage parking sequence. Later dispatches can offer
short travel decisions before arrival:

- Take a predictable route or risk a faster route with congestion.
- Pay for a garage or search for cheaper street parking.
- Use a loading zone with a time limit or accept a longer carry.
- Cross into New Jersey now or reorder the day's jobs to avoid an unnecessary
  return toll.
- Ask dispatch to reserve a loading dock or trust that access will work out.

Keep these as quick planning choices and event cards. Do not build manual
driving controls for the first prototype.

## Vehicles

Treat vehicles as visible progression, not background decoration. The first
company assigns the player a fixed starter van with a few obvious drawbacks.
Later employers, purchases, and upgrades can change the available vehicles.

Keep the initial vehicle stats readable:

- **Cargo capacity:** How much equipment and how many tools fit before another
  trip to the shop is required.
- **Organization:** How quickly the player can find and load gear.
- **Reliability:** Chance of maintenance delays or inconvenient warning lights.
- **Fuel economy:** Ongoing travel cost.
- **Clearance:** Whether the vehicle fits in a garage or requires another
  parking plan.
- **Comfort:** How much long drives, heat, and overtime add to fatigue.

Possible later traits:

- Working or broken air conditioning
- Backup camera
- Shelving and bins
- Roof rack
- Lift gate
- Toll transponder
- Company branding condition

For the first prototype, use one fixed trunkslammer van. Display a compact
vehicle card and let cargo capacity affect loading. Do not implement maintenance,
fuel, clearance checks, or manual driving yet. Store those values in the vehicle
data so later travel scenes can use them.

Example starter vehicle:

> **Company Van #3**  
> Cargo: Limited | Organization: Poor | Reliability: Questionable  
> Comfort: The passenger window mostly closes.

## Tools and Employer Equipment

Personal tools belong permanently to the player. This is the main equipment
progression: the technician gradually builds a reliable kit because early
employers cannot be trusted to provide one.

Separate that from employer-provided equipment:

- **Personal tools:** Screwdriver, tool bag, drill, bits, cutters, labeler,
  tester, laptop, and other upgrades the player owns and can carry between jobs
  and employers.
- **Company loaners:** Shared ladders, carts, specialty testers, lifts, and
  occasional power tools. Their availability and condition depend on the
  employer.
- **Job materials:** Displays, cart parts, mounts, cables, and other install
  equipment staged for a specific assignment. These can be missing, wrong, or
  poorly organized.

Bad companies may offer a battered shared tool with a drawback:

> **Shop Loaner Drill**  
> Battery: 18% | Charger: Reportedly in another van

Better employers can provide dependable shared equipment and properly staged
materials. Personal tools still matter because they improve consistency and let
the player handle more jobs confidently.

For the first prototype, the player owns one screwdriver. Show one unusable or
unhelpful shop loaner as environmental storytelling, but do not build the full
tool economy yet.

### Tool Acquisition

Give the player several ways to build a personal kit:

- **Buy tools:** Spend wages at a store, supply house, or online shop between
  shifts.
- **Level rewards:** Unlock a useful tool choice at selected experience
  milestones.
- **Coworker hand-me-downs:** Receive older but functional tools after helping
  another technician or building a relationship.
- **Employer issue:** Better companies may provide dependable standard tools or
  a tool allowance.
- **Job rewards:** Occasionally keep an approved spare, receive a client thank
  you, or earn a company recognition reward.
- **Used deals:** Buy cheaper equipment with a visible drawback or uncertain
  condition.

Avoid giving a mandatory tool automatically at every level. Some milestones
should unlock choices:

> **You survived your first week. Pick one:**  
> Tool bag | Basic drill | Folding hand truck

That creates different early play styles. A tool bag improves organization, a
drill speeds assembly, and a hand truck reduces carry trips.

For the first prototype, show the screwdriver as owned and award one post-job
upgrade choice after the two-cart tutorial. Only implement the selected tool's
summary card initially; its full gameplay effect can be added with the next job.

## Money Pressure

Keep finances light and job-focused. The game should create meaningful spending
choices without becoming a personal-budget simulator.

Use:

- **Wages:** Earn money from shifts, overtime, and occasional bonuses.
- **Tool purchases:** Make personal-kit upgrades the main early money sink.
- **Meals and coffee:** Spend a small amount to recover energy or soften a long
  day.
- **Parking, tolls, and fuel:** Show the real cost of poor dispatch planning.
- **Reimbursement friction:** Bad companies may require receipts, delay
  repayment, or question an expense they caused.
- **Unpaid rest:** Taking time off can reduce burnout but gives up earning
  opportunities.

Do not add rent, utilities, debt, or detailed household bills to the first
version. Those systems would shift the tone toward survival management and away
from workplace comedy. Personal-life pressure can be reconsidered later if the
career loop needs more weight.

For the first prototype, show wages, parking cost, overtime, and one management
note about the parking receipt on the end-of-day result screen. The player's
post-job tool choice remains a milestone reward rather than a purchase.

### Design Rationale

Successful upgrade-driven games often make money satisfying by feeding it back
into better equipment and expanded options. A heavier end-of-day bill system can
work when economic pressure is the central narrative, but that is not the first
goal here. AV Tech RPG should begin with visible career progression and
recognizable employer dysfunction.

## Job Families

- **Install:** Assemble, mount, pull, connect, and clean up.
- **Service:** Diagnose failures with limited history and client pressure.
- **Commissioning:** Test someone else's work and inherit unfinished problems.
- **Site survey:** Discover constraints before a quote is finalized.
- **Training and handoff:** Explain systems and handle last-minute questions.
- **Warehouse run:** Recover parts that were not checked before dispatch.

## Grounded Event Library

Public industry discussions consistently describe situations that can become
short, fictionalized events:

- Downtown jobs where the van is parked far from the install.
- Loading docks and deliveries that require scheduling.
- Missing equipment, drawings, cables, labels, or site readiness.
- Work performed out of order even though it will need to be redone.
- Commissioning scheduled before installation is actually complete.
- Underestimated labor that becomes overtime for field staff.
- Jobs scheduled back to back so one delay affects the rest of the day.
- New technicians expected to carry basic tools while learning which tools
  actually save time.

Avoid copying personal stories, usernames, employers, or specific job details.
The game should combine common patterns into fictional situations.

## Source Notes

- [AVIXA: The Power of a Well-Crafted Statement of Work in AV Projects](https://www.avixa.org/pro-av-trends/articles/statement-of-work)
- [AVIXA Xchange: Common AV Project Mistakes and How to Avoid Them](https://xchange.avixa.org/posts/common-av-mistakes-we-still-see-on-project-sites-how-to-avoid-them)
- [r/CommercialAV: How Do You Quote Labor for Larger AV Projects?](https://www.reddit.com/r/CommercialAV/comments/1hvbs7a)
- [r/CommercialAV: Unfinished / Poor Quality Installs](https://www.reddit.com/r/CommercialAV/comments/ta9nhn)
- [r/CommercialAV: What Is Up With All the Design, Product, and Construction Flaws?](https://www.reddit.com/r/CommercialAV/comments/1jnhn3r)
- [r/CommercialAV: Question on Managing and Administration](https://www.reddit.com/r/CommercialAV/comments/1alumdl)
- [r/CommercialAV: Starting AV Technician Tool Discussion](https://www.reddit.com/r/CommercialAV/comments/1iuc4fv)
- [Philadelphia Parking Authority: Smart Loading Zones](https://philapark.org/2025/03/smart-loading-zones/)
- [Philadelphia Parking Authority: Residential Parking Permits](https://philapark.org/residential-parking-permit/)
- [City of Philadelphia: Street Closures](https://www.phila.gov/departments/department-of-streets/roadways/street-closures/)
- [Navy Yard: Visit](https://navyyard.org/visit/)
- [Borough of Conshohocken: Parking](https://www.conshohockenpa.gov/living-visiting/parking/)
- [Delaware River Port Authority: Toll Schedule](https://www.drpa.org/travel/toll-schedule.html)
- [511PA: About the Official Travel Information Service](https://www.511pa.com/about/about)
- [PennDOT: Route 3 and I-476 Interchange Improvement Project](https://www.pa.gov/agencies/penndot/projects-near-you/district-6-projects/route-3-west-chester-pike-and-i-476-intersection-improvement-project)
- [Marple Township Official Website](https://www.marpletwp.com/)

## Prototype Boundary

Build only:

- One placeholder technician-selection screen
- One small walkable shop
- One van-loading interaction
- One simplified regional map
- One travel or parking event
- One job site
- Keyboard walking, one interaction button, and one carried-item slot
- Two cart assemblies
- One supervisor departure
- A handful of interruption cards
- One end-of-day result

Do not build detailed signal-flow simulation, driving simulation, multiple
employers, a full tool economy, physics-based carrying, or complex character
animation until this loop is playable.
