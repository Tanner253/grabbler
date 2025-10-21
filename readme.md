Game Specification: The GrabblerOverviewThis is a simple, browser-based game built as a Next.js application and deployed to Vercel. The game features a cartoonish character called "The Grabbler" that relentlessly steals the player's money (represented as gold coins) by moving back and forth across the screen. The player starts with 50 coins, and the Grabbler's goal is to transfer all of them to its own pile. The player fights back by clicking on the Grabbler's pile to reclaim coins one at a time. If the player's coins reach zero, an annoying audio track plays until all coins are reclaimed. The game emphasizes a crypto/GameFi vibe, with shiny coin animations, particle effects for thefts and recoveries, and a playful yet frustrating tug-of-war mechanic. Keep everything minimalistic: no menus, levels, or complex UI—just the core loop on a single page that loads instantly and runs smoothly.The game renders in a full-screen canvas that spans 100% of the browser viewport width, but behaves like a classic Flash game by maintaining a fixed aspect ratio (e.g., 16:9) and centering itself if the window resizes, without distorting or breaking layout. Use Tailwind CSS for styling to ensure a clean, responsive design that's visually appealing on desktop and mobile. The total coin count across both piles is always 50, but during the Grabbler's transit after stealing, the displayed counts may temporarily sum to 49 until deposit.Visual Style and AssetsTheme: Crypto/GameFi-inspired—think shiny gold coins, subtle blockchain nods (e.g., glowing particles resembling crypto transactions), dark background with metallic accents for a "treasure vault" feel. Use smooth animations and particle effects to make thefts, deposits, and clicks feel dynamic and satisfying.
Background: A simple gradient or textured dark blue/purple vault-like background to evoke mystery and wealth.
Grabbler Character: Use the provided image (a hand-drawn, bearded figure in a coat, with a greedy expression, dropping coins). It has three states: facing left, facing right, and idle (for starting position). Animate its movement with a smooth horizontal slide (e.g., 2-3 seconds per trip across the screen), adding a slight bounce or waddle for personality. Include particle trails (gold sparkles) when it steals or deposits. Visually indicate it's "carrying" stolen money during transit (e.g., a small coin icon attached or sparkle effect).
Money Piles:Left side: Player's pile.
Right side: Grabbler's pile.
Three visual states per pile (switch based on current count for dynamic behavior):Full/overflowing pile of shiny gold coins if count >= 26.
Medium stack if 1 <= count <= 25.
Empty spot (e.g., with a sad dust cloud or faint outline) if count == 0.

Alternatively, for more dynamic visuals, render individual coins using Tailwind classes and icons/SVGs (e.g., stack or scatter based on exact count), but prioritize the three-state approach if simpler to implement.
Piles are fixed positions: player's at ~10% from left edge, Grabbler's at ~90% from right edge.
Add subtle glow or shimmer animations on piles.

Text Displays: Above each pile, show the coin count (e.g., "Your Gold: 50" on left, "Grabbler's Hoard: 0" on right) in a bold, metallic font. Update in real-time with fade-in animations for changes.
Animations and Particles:Theft (on touching player's pile): Gold particles explode or trail from the player's pile.
Deposit (on touching Grabbler's pile): Similar particles into the Grabbler's pile.
Click Recovery: A satisfying "pop" of particles when clicking the Grabbler's pile, with a coin visually flying back to the player's side.
Overall: Use CSS animations via Tailwind for smoothness; no heavy libraries unless needed for particles (e.g., simple confetti-style effects for gold sparkles).

Audio: One looping annoying track (e.g., greedy laughter or alarm) that plays only when player's coins hit zero and stops once all coins are reclaimed (player back to 50). Keep volume low and add a mute toggle if space allows, positioned discreetly (e.g., top corner icon).
Responsiveness: Game canvas scales to viewport width but locks aspect ratio, centering vertically/horizontally on resize without interrupting gameplay. Ensure no distortion or breakage on window resize—elements reposition fluidly.

Game ElementsCanvas: The main play area, taking full viewport width, with elements positioned relatively. Use HTML canvas or div-based layout for rendering.
Player's Pile: Fixed on left, non-clickable for interactions (only displays and animates).
Grabbler's Pile: Fixed on right, interactive—clickable image; each click reclaims 1 coin if Grabbler has >0 (increases player's count by 1, decreases Grabbler's by 1).
Grabbler Movement: Starts in screen center, facing left, in idle state briefly. Moves left to player's pile, "touches" it to steal (if player >0), flips to face right, moves right to Grabbler's pile, deposits, flips to face left, repeats. "Touch" means collision with pile edge. Speed: Consistent pace across screen width, adjustable for tension (e.g., faster as game progresses? Optional for simplicity).
Score Displays: Real-time text above piles, stored in browser local storage (key: "grabblerScore" with JSON object {player: number, grabbler: number}). On page load, check storage; if none or invalid, default to {player: 50, grabbler: 0}. Update and persist storage on every count change (steal, deposit, click). Handle incognito/no-storage by falling back to session memory without errors.
Win/Loss State: No true "end"—loop continues forever, even at player 0 (Grabbler keeps moving). But if player reaches 0, trigger audio loop until player clicks back to 50.

MechanicsStart: Page loads, load scores from local storage or default to player=50 (full pile), grabbler=0 (empty pile). Render piles based on states. Grabbler appears in center facing left, begins moving left after short delay (e.g., 1 second).
Grabbler Loop:Move left to player's pile.
On touch: If player >0, player count -1, update displays/piles/states/particles, visually show carry (sparkle/coin).
Flip to face right, move to Grabbler's pile (bouncing off "bounds" means reversing at pile edges, no actual bounce physics needed—just direction flip).
On touch: Grabbler count +1, update displays/piles/states/particles, remove carry visual.
Flip to face left, repeat.
If player ==0 during a steal attempt, no effect (no -1), but continue movement.
If player hits 0 at any point, start audio loop.

Player Interaction: Click Grabbler's pile to reclaim 1 coin (if grabbler >0: grabbler -1, player +1, update displays/piles/states/particles). Clicks ignored if grabbler ==0. If audio is playing, it stops only when player reaches 50.
Edge Cases:During transit: Stolen coin is "held" (player already -1, grabbler not yet +1), so counts sum to 49 temporarily.
Grabbler can't steal if player ==0 (movement continues, but skip subtraction).
Clicks during transit reclaim from Grabbler's current pile count (not affecting in-transit coin).
Local storage: Persist immediately on changes; handle parse errors by resetting to defaults.
Performance: Ensure smooth 60fps movement/animations; no lag on resize or during loops.
Mobile: Taps work as clicks; ensure touch-friendly pile sizes.

Reset: No dedicated button—page refresh uses local storage if available, or defaults. Clearing storage externally resets.

Development NotesFramework: Next.js for the app structure—single page (/pages/index.js or app router equivalent). All logic client-side (no server needed).
Styling: Tailwind CSS for all layouts, colors, and animations. Use utility classes for responsiveness, effects, and positioning.
Image Integration: Embed or reference the provided Grabbler image directly in code (assume it's uploaded or base64 if needed for Vercel).
Deployment: Vercel—ensure fast loads, static export if possible for performance.
Simplicity Priority: Implement core movement and clicks first; add animations/particles/audio last. Test on multiple devices/browsers for Flash-like consistency and no bugs in resizing or storage. Total features: Just the described elements—no extras like high scores, sharing, or multiplayer. Keep code clean and minimal to match "simple is better" ethos.

