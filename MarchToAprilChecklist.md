# Project Beta – Testing Checklist (Levels 1–12)

## Setup Page

- [ ] Use arrows to select levels 1–12; verify values never exceed 12.
- [ ] Type invalid values (0, 13, letters); confirm they are clamped or rejected safely.
- [ ] Select a starting item and confirm warning: “Taking a starting item costs 10 points from your final score.”
- [ ] Select **No Start Item** option (N/A/red slash); confirm no warning/penalty applied.

## Item Pickup Pop-up

- [ ] Pick up a normal item; pop-up appears under score for ~5 seconds.
- [ ] Click pop-up; inventory opens and the correct item slot is highlighted/armed.
- [ ] Pick up multiple items quickly; latest item’s text is shown.
- [ ] Pick up a stone; clicking pop-up opens the stone confirm modal instead of arming.

## Item Tooltip Modal

- [ ] Right-click an item in Inventory; factual description modal appears.
- [ ] Right-click an equipped item; modal shows correct data.
- [ ] Right-click jewelry (rings, etc.); modal shows correct data.
- [ ] Press Esc or click outside to close modal; game state behaves as intended (pause vs running).

## Inventory Tooltip Position

- [ ] Hover items in left column; tooltips appear to the right of the cursor.
- [ ] Hover items in middle columns; tooltips fully on-screen.
- [ ] Hover items in the rightmost column; tooltips appear to the **left** of the cursor and stay on-screen.

## Starting Item Scoring

- [ ] Run with a starting item; confirm score reflects −10 point penalty.
- [ ] Run with **No Start Item**; confirm no penalty is applied.
- [ ] Compare similar runs to verify behavior is consistent.

## Equipment Looting Modal

- [ ] Loot a ring; text correctly describes new vs old ring.
- [ ] Loot armor/helm/weapon; text is generic or uses appropriate type (no “ring” wording when not a ring).
- [ ] “Equip New” and “Keep Old” behave as expected with no regressions.
