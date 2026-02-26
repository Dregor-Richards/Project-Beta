// Glossary items and organization

const GLOSSARY_ITEMS = [
  { id: 'player', title: 'YOU', iconClass: 'avatar',
    description: 'You. Likely vital to keep safe, but who knows. Thrice may you be struck, before the floors turn crimson.' },
  { id: 'door', title: 'The Door', iconClass: 'door',
    description: 'Reach the door, once all foes have been slain, to delve deeper into these expansive dungeons.' },
  { id: 'skip', title: 'Altar Of Phelos', iconClass: 'skip-tile',
    description: 'Pray if you will, to this god of Time. He may stall the passage for a breath, but what good will it do you, if your foes march on all the same?'},
  { id: 'enemy_normal', title: 'Cloak-&-Dagger', iconClass: 'enemy',
    description: 'Nothing remains of this once-adventurer, but the blade they gripped beyond expiration, and a cloak that warmed them in life. If they can reach you, they will stab. STAY AWAY.'},
  { id: 'enemy_fast', title: 'Bat', iconClass: 'fast-enemy',
    description: 'A wild animal of the winged sort. Nothing too threatening, but it can move up to thrice that of most. And yes, it bites.'},
  { id: 'enemy_tracker', title: 'Hound', iconClass: 'tracker-enemy',
    description: 'Your only advantage against this feral beast, is its own laziness. While it waits, you can scheme... But when it chooses to move, it will outmatch your stride, and will forever close in.'},
  { id: 'enemy_mortar', title: 'Acolyte Of Voca', iconClass: 'mortar-enemy',
    description: 'Though incapable of hand-to-hand combat, this disciple wields a meager blessing from the god of Magic, and will rain fire from afar until silenced.'},
  { id: 'mortar_strike', title: 'Arcane Flames', iconClass: 'mortar-target-a',
    description: 'Before you try it, fire burns faster than your stride can carry you through the inferno. Avoid these blazes, and turn your blade upon the Acolytes to quell the scorch.'},
  { id: 'heart', title: 'Fresh Apple', iconClass: 'heart',
    description: 'A simple apple. It will rot before you even make it through the door, from the dark magic creeping through the air. But if you find yourself injured, it may ease your pain, for a time.'},
  { id: 'fire_wand', title: 'Fire Wand', iconClass: 'inventory-fire-wand',
    description: 'A simple twig of Cypress, capable of a single casting. Just point and shoot, so that the denizens of this sprawl shall know your fury.' },
  { id: 'ice_wand', title: 'Ice Wand', iconClass: 'inventory-ice-wand',
    description: 'Whatever wood this once was made of, has long since departed. Now only frost remains, and its lethality is minimal. But still, it may prove to slow your foes, for a time.' },
  { id: 'lightning_wand', title: 'Lightning Wand', iconClass: 'inventory-lightning-wand',
    description: 'Despite common sense, you will be aiming this one at yourself. It shall spark your heart, and add a spring to your step. For every stride you used to take, you will find you can take another.' },
  { id: 'wyrd_stone', title: 'Wyrd Stone', iconClass: 'inventory-wyrd-stone',
    description: 'A physical manifestation of the tether between body and soul, corded into a necklace as though it was a second-hand trinket. Offer it up as a challenge, and you will find your foes enthralled in frenzy. Their strides will be tripled, but your rewards will be doubled for slaying them.' },
  { id: 'heart_stone', title: 'Vytal Stone', iconClass: 'inventory-heart-stone',
  description: 'A copycat. Imperfect, designed to serve as storage for the essence of existence itself. Not something a half-wit scholar should have ever attempted, and the fact that the original owner does not possess it, tells all. But, if you dare to sacrifice it, and face mortal failure from every wound, you will be rewarded in triple.'}
];

const GLOSSARY_PAGE_SIZE = 5;
let glossaryPage = 0;

function renderGlossaryPage() {
  const grid = document.getElementById('glossary-grid');
  const indicator = document.getElementById('glossary-page-indicator');
  if (!grid || !indicator) return;

  grid.innerHTML = '';

  const start = glossaryPage * GLOSSARY_PAGE_SIZE;
  const end = Math.min(start + GLOSSARY_PAGE_SIZE, GLOSSARY_ITEMS.length);
  const items = GLOSSARY_ITEMS.slice(start, end);

  items.forEach(item => {
    const iconCell = document.createElement('div');
    iconCell.className = 'glossary-icon-cell';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'glossary-icon-wrapper';

    const icon = document.createElement('div');
    icon.className = item.iconClass + ' glossary-icon-inner';

    iconWrapper.appendChild(icon);
    iconCell.appendChild(iconWrapper);

    const textCell = document.createElement('div');
    textCell.className = 'glossary-text-cell';

    const titleEl = document.createElement('div');
    titleEl.className = 'glossary-item-title';
    titleEl.textContent = item.title;

    const descEl = document.createElement('div');
    descEl.className = 'glossary-item-desc';
    descEl.textContent = item.description;

    textCell.appendChild(titleEl);
    textCell.appendChild(descEl);

    grid.appendChild(iconCell);
    grid.appendChild(textCell);
  });

  const totalPages = Math.ceil(GLOSSARY_ITEMS.length / GLOSSARY_PAGE_SIZE);
  indicator.textContent = `Page ${glossaryPage + 1} of ${totalPages}`;
}

function openGlossary() {
  const modal = document.getElementById('glossary-modal');
  if (!modal) return;
  glossaryPage = 0;
  renderGlossaryPage();
  modal.classList.remove('hidden');
}

function closeGlossary() {
  const modal = document.getElementById('glossary-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}
