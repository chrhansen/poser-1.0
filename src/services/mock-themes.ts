import type { ThemeScores } from "@/lib/types";

/** Mock theme scores for res_1 (skiRank 80, limiter: edging) */
export const mockThemeScores_res1: ThemeScores = {
  wentWell: "Steering stayed strong through most turns, helping you keep good direction control.",
  heldBackScore: "Edging lowered your overall score most, especially in right turns.",
  nextFocus: "Build edge angle earlier through turn initiation.",
  nextFocusDetail: "This should help you feel more stable and create cleaner pressure earlier in the turn.",
  keyMoments: [
    { id: "km_1", type: "weakest", label: "Weakest turn", description: "Late edge build on this right turn.", turnId: "turn_3", frame: 120 },
    { id: "km_2", type: "best", label: "Best turn", description: "Cleaner stance and earlier edging.", turnId: "turn_5", frame: 210 },
    { id: "km_3", type: "representative", label: "Most representative", description: "This turn shows your typical pattern.", turnId: "turn_2", frame: 80 },
  ],
  balance: {
    key: "balance",
    name: "Balance",
    score: 76,
    summary: "A bit back at transition.",
    nextFocus: "Focus on centering your weight over the middle of your foot at turn transitions.",
    submetrics: [
      {
        id: "bal_foreaft", name: "Fore-aft Balance", score: 74,
        interpretation: "Slightly back at transitions",
        whatItIs: "How well you stay centered front-to-back over your skis throughout each turn.",
        whyItMatters: "Good fore-aft balance lets you engage the ski tip early and maintain consistent pressure.",
        whatYoursLookedLike: "You tend to sit back slightly during transitions, recovering by mid-turn.",
        whatToTry: "Focus on pressing your shins into your boots during the transition phase.",
      },
      {
        id: "bal_center", name: "Center Over Feet", score: 78,
        interpretation: "Generally centered through the turn",
        whatItIs: "How well your center of mass stays stacked over the center of your feet.",
        whyItMatters: "Staying centered allows quicker reactions and smoother turn initiation.",
        whatYoursLookedLike: "Good overall, with minor rearward drift at turn start.",
        whatToTry: "Imagine pressing the ball of your foot into the ski during initiation.",
      },
      {
        id: "bal_transition", name: "Transition Stability", score: 75,
        interpretation: "Some instability between turns",
        whatItIs: "How stable and controlled your body is during the transition from one turn to the next.",
        whyItMatters: "Smooth transitions set up better early edge engagement in the new turn.",
        whatYoursLookedLike: "A slight pause and backward lean at the transition point in several turns.",
        whatToTry: "Think about moving your hips forward and downhill during the release.",
      },
    ],
  },
  pressure: {
    key: "pressure",
    name: "Pressure",
    score: 79,
    summary: "Pressure builds slightly late.",
    nextFocus: "Work on building pressure earlier in the turn arc.",
    submetrics: [
      {
        id: "prs_early", name: "Early Pressure", score: 75,
        interpretation: "Pressure arrives late in the arc",
        whatItIs: "How quickly you build ski-to-snow pressure after turn initiation.",
        whyItMatters: "Early pressure creates a stronger, more controlled turn shape.",
        whatYoursLookedLike: "Pressure builds noticeably in the second half of your turns.",
        whatToTry: "Focus on flexing and extending earlier — feel the ski bend sooner.",
      },
      {
        id: "prs_outside", name: "Outside Ski Pressure", score: 82,
        interpretation: "Good weight on the outside ski",
        whatItIs: "How much of your weight is transferred to the outside (downhill) ski during the turn.",
        whyItMatters: "Loading the outside ski creates grip and a clean carve.",
        whatYoursLookedLike: "Solid outside ski pressure in most turns, with a few where weight stayed too even.",
        whatToTry: "Commit more aggressively to the outside ski, especially in steeper sections.",
      },
      {
        id: "prs_build", name: "Pressure Build", score: 80,
        interpretation: "Progressive buildup, mostly smooth",
        whatItIs: "How smoothly and progressively pressure increases through the turn.",
        whyItMatters: "A smooth ramp of pressure prevents skidding and creates a rounder turn.",
        whatYoursLookedLike: "Generally smooth, with a few abrupt pressure spikes mid-turn.",
        whatToTry: "Think about gradually increasing your edge angle rather than jamming it on.",
      },
    ],
  },
  edging: {
    key: "edging",
    name: "Edging",
    score: 71,
    summary: "Main limiter in this run.",
    nextFocus: "Start tipping earlier at turn initiation.",
    submetrics: [
      {
        id: "edg_early", name: "Early Edging", score: 68,
        interpretation: "Edge engagement starts late",
        whatItIs: "How quickly you establish edge angle after releasing the previous turn.",
        whyItMatters: "Earlier edge engagement creates a cleaner arc and better grip early in the turn.",
        whatYoursLookedLike: "Edge angle builds noticeably late, especially in right turns.",
        whatToTry: "Focus on tipping your feet and ankles toward the new turn as soon as you release.",
      },
      {
        id: "edg_match", name: "Edge Match", score: 73,
        interpretation: "Some asymmetry between skis at apex",
        whatItIs: "How similar your left and right ski edging looked near the apex of each turn.",
        whyItMatters: "Better edge match usually creates cleaner, more stable turns.",
        whatYoursLookedLike: "Good overall, but a few right turns lost symmetry near apex.",
        whatToTry: "Build edge angle a little earlier and aim to keep both skis tipping together through shaping.",
      },
      {
        id: "edg_peak", name: "Peak Edge Angle", score: 72,
        interpretation: "Moderate peak angles",
        whatItIs: "The maximum edge angle achieved near the apex of each turn.",
        whyItMatters: "Higher peak edge angles allow tighter, more precise turns at speed.",
        whatYoursLookedLike: "Peak angles are moderate — room to develop more angulation.",
        whatToTry: "Work on hip angulation to drive the skis to higher edge angles at the apex.",
      },
    ],
  },
  steering: {
    key: "steering",
    name: "Steering",
    score: 84,
    summary: "Strong overall direction control.",
    nextFocus: "Maintain counter through the full arc for even cleaner turns.",
    submetrics: [
      {
        id: "str_counter", name: "Counter", score: 85,
        interpretation: "Good counter-rotation through turns",
        whatItIs: "How well your upper body faces downhill while your lower body steers the skis.",
        whyItMatters: "Good counter creates a strong platform and readies you for the next turn.",
        whatYoursLookedLike: "Consistent counter through most turns. Slight loss near transition in a couple of turns.",
        whatToTry: "Focus on keeping your hands and chest facing the fall line through the full turn.",
      },
      {
        id: "str_rhythm", name: "Turn Rhythm", score: 83,
        interpretation: "Consistent turn tempo",
        whatItIs: "How even and consistent your turn duration is across the run.",
        whyItMatters: "Rhythmic turns show good control and create a smooth, flowing run.",
        whatYoursLookedLike: "Generally rhythmic with one or two turns that were slightly longer.",
        whatToTry: "Use a mental count or breathing pattern to keep your turns evenly timed.",
      },
      {
        id: "str_symmetry", name: "Steering Symmetry", score: 84,
        interpretation: "Left and right turns look similar",
        whatItIs: "How symmetric your left and right turns look in terms of shape, timing, and steering angle.",
        whyItMatters: "Good symmetry means you're equally skilled in both directions.",
        whatYoursLookedLike: "Strong symmetry overall. Right turns show slightly less steering precision.",
        whatToTry: "Drill your weaker side by doing linked turns biased toward right turns.",
      },
    ],
  },
};

/** Mock theme scores for res_5 (skiRank 65, limiter: balance) */
export const mockThemeScores_res5: ThemeScores = {
  wentWell: "Steering showed good consistency, with clean direction changes in most turns.",
  heldBackScore: "Balance was the biggest factor — fore-aft positioning cost you consistency.",
  nextFocus: "Work on staying centered over your feet, especially at the start of each turn.",
  keyMoments: [
    { id: "km_4", type: "weakest", label: "Weakest turn", description: "Lost balance rearward through the whole turn.", turnId: "turn_4", frame: 160 },
    { id: "km_5", type: "best", label: "Best turn", description: "Good centering and smooth arc.", turnId: "turn_6", frame: 280 },
    { id: "km_6", type: "representative", label: "Most representative", description: "Typical pattern of late recovery.", turnId: "turn_3", frame: 120 },
  ],
  balance: {
    key: "balance", name: "Balance", score: 58,
    summary: "Balance was your biggest limiter.",
    nextFocus: "Focus on ankle flex and shin pressure at every transition.",
    submetrics: [
      { id: "bal_foreaft", name: "Fore-aft Balance", score: 55, interpretation: "Consistently back", whatItIs: "How well you stay centered front-to-back.", whyItMatters: "Good fore-aft balance enables early ski engagement.", whatYoursLookedLike: "You were in the back seat for most turns.", whatToTry: "Drive your shins into your boot tongues." },
      { id: "bal_center", name: "Center Over Feet", score: 60, interpretation: "Moderate centering", whatItIs: "Center of mass over feet.", whyItMatters: "Better centering means better reactions.", whatYoursLookedLike: "Slightly rear-biased throughout.", whatToTry: "Focus on feeling the ball of your foot on the ski." },
      { id: "bal_transition", name: "Transition Stability", score: 59, interpretation: "Unstable transitions", whatItIs: "Body stability between turns.", whyItMatters: "Smooth transitions enable better next turns.", whatYoursLookedLike: "Wobble at each transition.", whatToTry: "Move hips forward and downhill at the release." },
    ],
  },
  pressure: {
    key: "pressure", name: "Pressure", score: 67,
    summary: "Pressure management was uneven.",
    nextFocus: "Build pressure more progressively through the turn.",
    submetrics: [
      { id: "prs_early", name: "Early Pressure", score: 63, interpretation: "Late pressure", whatItIs: "How quickly pressure builds after initiation.", whyItMatters: "Early pressure creates better turn shape.", whatYoursLookedLike: "Pressure arrived late.", whatToTry: "Flex and extend earlier in the turn." },
      { id: "prs_outside", name: "Outside Ski Pressure", score: 70, interpretation: "Decent outside ski loading", whatItIs: "Weight on the outside ski.", whyItMatters: "Outside ski pressure creates grip.", whatYoursLookedLike: "Mostly good, some turns too even.", whatToTry: "Commit to the outside ski." },
      { id: "prs_build", name: "Pressure Build", score: 68, interpretation: "Somewhat abrupt", whatItIs: "Smoothness of pressure buildup.", whyItMatters: "Smooth pressure prevents skidding.", whatYoursLookedLike: "Several abrupt spikes.", whatToTry: "Gradually increase edge angle." },
    ],
  },
  edging: {
    key: "edging", name: "Edging", score: 66,
    summary: "Edge angles were moderate.",
    nextFocus: "Work on earlier and higher edge angles.",
    submetrics: [
      { id: "edg_early", name: "Early Edging", score: 62, interpretation: "Late edge engagement", whatItIs: "Speed of edge angle establishment.", whyItMatters: "Earlier edges mean cleaner arcs.", whatYoursLookedLike: "Late to get on edge.", whatToTry: "Tip feet early at transition." },
      { id: "edg_match", name: "Edge Match", score: 68, interpretation: "Some mismatch", whatItIs: "Similarity of left/right edging.", whyItMatters: "Matched edges create stability.", whatYoursLookedLike: "Noticeable left-right differences.", whatToTry: "Keep both skis tipping together." },
      { id: "edg_peak", name: "Peak Edge Angle", score: 68, interpretation: "Room to grow", whatItIs: "Maximum edge angle at apex.", whyItMatters: "Higher angles allow tighter turns.", whatYoursLookedLike: "Moderate angles.", whatToTry: "Work on hip angulation." },
    ],
  },
  steering: {
    key: "steering", name: "Steering", score: 70,
    summary: "Steering was decent but inconsistent.",
    nextFocus: "Maintain counter through the full arc.",
    submetrics: [
      { id: "str_counter", name: "Counter", score: 71, interpretation: "Moderate counter", whatItIs: "Upper body facing downhill while lower body steers.", whyItMatters: "Good counter readies you for the next turn.", whatYoursLookedLike: "Counter dropped mid-turn in several turns.", whatToTry: "Keep hands and chest toward fall line." },
      { id: "str_rhythm", name: "Turn Rhythm", score: 69, interpretation: "Variable rhythm", whatItIs: "Consistency of turn duration.", whyItMatters: "Rhythmic turns show control.", whatYoursLookedLike: "Uneven turn durations.", whatToTry: "Use a breathing pattern to time turns." },
      { id: "str_symmetry", name: "Steering Symmetry", score: 70, interpretation: "Some left-right difference", whatItIs: "How symmetric left and right turns are.", whyItMatters: "Symmetry means equal skill in both directions.", whatYoursLookedLike: "Right turns slightly weaker.", whatToTry: "Drill linked turns biased to the right." },
    ],
  },
};
