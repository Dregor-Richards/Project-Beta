// Glossary items and organization

const GLOSSARY_ITEMS_MAIN = [
  { id: 'player', title: 'YOU', iconClass: 'avatar1',
    description: 'You. Likely vital to keep safe, but who knows. Thrice may you be struck, before the floors turn crimson.' },
  { id: 'door', title: 'The Door', iconClass: 'door',
    description: 'Reach the door, once all foes have been slain, to delve deeper into these expansive dungeons.' },
  { id: 'skip', title: 'Altar Of Phelos', iconClass: 'skip-tile',
    description: 'Pray if you will, to this god of Time. He may stall the passage for a breath, but what good will it do you, if your foes march on all the same?'},
  { id: 'enemy_normal', title: 'Cloak-&-Dagger', iconClass: 'enemy',
    description: 'Nothing remains of this once-adventurer, but the blade they gripped beyond expiration, and a cloak that warmed them in life. If they can reach you, they will stab. STAY AWAY.'},
  { id: 'enemy_fast', title: 'Bat', iconClass: 'fast-enemy',
    description: 'A wild animal of the winged sort. Nothing too threatening, but it can move up to thrice that of most. And yes, it bites.'},
  { id: 'heart', title: 'Fresh Apple', iconClass: 'heart',
    description: 'A simple apple. It will rot before you even make it through the door, from the dark magic creeping through the air. But if you find yourself injured, it may ease your pain, for a time.'},
  { id: 'fire_wand', title: 'Fire Wand', iconClass: 'inventory-fire-wand',
    description: 'A simple twig of Cypress, capable of a single casting. Just point and shoot, so that the denizens of this sprawl shall know your fury.' },
  { id: 'ice_wand', title: 'Ice Wand', iconClass: 'inventory-ice-wand',
    description: 'Whatever wood this once was made of, has long since departed. Now only frost remains, and its lethality is minimal. But still, it may prove to slow your foes.' },
  { id: 'lightning_wand', title: 'Lightning Wand', iconClass: 'inventory-lightning-wand',
    description: 'Despite common sense, you will be aiming this one at yourself. It shall spark your heart, and add a spring to your step. For every stride you used to take, you may take another.' },
  { id: 'enemy_tracker', title: 'Hound', iconClass: 'tracker-enemy',
    description: 'Your only advantage against this feral beast, is its own laziness. While it waits, you can scheme... But when it chooses to move, it will outmatch your stride, and will forever close in.'},
  { id: 'closed_chest', title: 'Chest', iconClass: 'chest-closed',
    description: 'Whatever was left behind within this ornate container could be of great value... Just be wary, no one bothers to use two of these, when one will suffice.'},
  { id: 'enemy_mortar', title: 'Acolyte Of Voca', iconClass: 'mortar-enemy',
    description: 'Though incapable of hand-to-hand combat, this disciple wields a meager blessing from the god of Magic, and will rain fire from afar until silenced.'},
  { id: 'mortar_strike', title: 'Arcane Flames', iconClass: 'mortar-target-a',
    description: 'Before you try it, fire burns faster than your stride can carry you through the inferno. Avoid these blazes, and turn your blade upon the Acolytes to quell the scorch.'},
  { id: 'wyrd_stone', title: 'Wyrd Stone', iconClass: 'inventory-wyrd-stone',
    description: 'A physical manifestation of the tether between body and soul, corded into a necklace. Offer it up as a challenge, and your foes will be enthralled in frenzy. Strides will be tripled, but rewards will be doubled for slaying them.' },
  { id: 'heart_stone', title: 'Vytal Stone', iconClass: 'inventory-heart-stone',
  description: 'A copycat. Imperfect, designed to serve as storage for the essence of existence itself. Not something a half-wit scholar should have ever attempted, and the fact that the original owner does not possess it, tells all. If you dare to sacrifice it, and face mortal failure from every wound, you will be rewarded in triple.'},
  { id: 'hyllow_stone', title: 'Hyllow Stone', iconClass: 'inventory-hyllow-stone',
  description: 'I would recommend wrapping this one in thick cloth, and keeping it deep within your pack. The being trapped within this fragile stone and cord, would destroy you and everything else in this dungeon, if given the chance. To slay one of its kind, however, would be bountiful indeed...'},
  { id: 'lantern', title: 'Lantern', iconClass: 'lantern-tile',
    description: 'Light, in these darkening halls, will swiftly be a luxury. But these lanterns, discarded by those who came before, still burn with the Wisps locked within.'},
  { id: 'brazier', title: 'Brazier', iconClass: 'brazier-tile',
    description: 'This sacrifical basin will accept the life of a Wisp, such as those within the grasp of these discarded lanterns. Mayhap their light will burn even brighter, in death.'},
  { id: 'coin_pouch', title: 'Coin Pouch', iconClass: 'inventory-coin-pouch',
    description: 'This pouch forever feels empty. Once you open it, however, it will feast upon the life-force of those around you, rewarding you in kind, for half the value it extracts.'},
  { id: 'main_door_key', title: 'Main Door Key', iconClass: 'inventory-door-key',
    description: 'Though brittle, and made of some foreign clay, this key should suffice to open a single door, to the next layer of the dungeon. Usually such doors are held shut by the lifeforce of the denizens, leaving one to wonder how such a simple device opens the next chamber...'}
];

// Boss glossary
const GLOSSARY_ITEMS_BOSS = [
  { id: 'boss_1', title: 'Acolyte Of Voca', iconClass: 'boss-enemy1',
    description: 'Devoted to the God of Magic, this charalatan was loyal through life and into undeath, but still is unworthy of holding the title of Champion. Beware, their god has still gifted them token powers, to reflect their dark efforts to gain favour.' },
];

// Equipment glossary
const GLOSSARY_ITEMS_EQUIPMENT = [
  { id: 'equip1', title: 'Mining Helm', iconClass: 'equip-mining-helm',
    description: 'Coming Later'},
  { id: 'equip1', title: 'Plated Armor', iconClass: 'equip-plated-armor',
    description: 'FILL'},
  { id: 'equip1', title: 'Greaves Of Dodging', iconClass: 'equip-dodge-pants',
    description: 'FILL'},
  { id: 'equip1', title: 'Hammer Of Retaliation', iconClass: 'equip-retaliation-hammer',
    description: 'Coming Later'},
  { id: 'equip1', title: 'Book Of Wands', iconClass: 'equip-book-wands',
    description: 'FILL'},
  { id: 'equip1', title: 'Book Of Stones', iconClass: 'equip-book-stones',
    description: 'FILL'},
  { id: 'equip1', title: 'Ring Of Chests', iconClass: 'ring-chests',
    description: 'FILL'},
  { id: 'equip1', title: 'Ring Of Prisms', iconClass: 'ring-prisms',
    description: 'FILL'},
  { id: 'equip1', title: 'Ring Of Freshness', iconClass: 'ring-extra-fruit',
    description: 'Coming Later'},
  { id: 'equip1', title: 'Ring Of Fading', iconClass: 'ring-shadow-step',
    description: 'Coming Later'},
];

const GLOSSARY_TYPES = {
  MAIN: 'main',
  BOSS: 'boss',
  EQUIPMENT: 'equipment',
};

let currentGlossaryType = GLOSSARY_TYPES.MAIN;
// Page sizes per glossary
const GLOSSARY_PAGE_SIZE_MAIN = 5;
const GLOSSARY_PAGE_SIZE_BOSS = 3;
const GLOSSARY_PAGE_SIZE_EQUIPMENT = 5;
let glossaryPage = 0;

function getCurrentGlossaryConfig() {
  if (currentGlossaryType === GLOSSARY_TYPES.BOSS) {
    return {
      items: GLOSSARY_ITEMS_BOSS,
      pageSize: GLOSSARY_PAGE_SIZE_BOSS,
      label: 'The Devouted & The Dead',
    };
  }
  if (currentGlossaryType === GLOSSARY_TYPES.EQUIPMENT) {
    return {
      items: GLOSSARY_ITEMS_EQUIPMENT,
      pageSize: GLOSSARY_PAGE_SIZE_EQUIPMENT,
      label: 'Arms & Adornments',
    };
  }
  return {
    items: GLOSSARY_ITEMS_MAIN,
    pageSize: GLOSSARY_PAGE_SIZE_MAIN,
    label: 'Rabble & Trinkets',
  };
}

function renderGlossaryPage() {
  const grid = document.getElementById('glossary-grid');
  const indicator = document.getElementById('glossary-page-indicator');
  const typeLabelEl = document.getElementById('glossary-type-indicator'); // NEW (optional)
  if (!grid || !indicator) return;

  const { items, pageSize, label } = getCurrentGlossaryConfig();

  grid.innerHTML = '';

  const start = glossaryPage * pageSize;
  const end = Math.min(start + pageSize, items.length);
  const slice = items.slice(start, end);

  slice.forEach(item => {
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

  const totalPages = Math.ceil(items.length / pageSize) || 1;
  indicator.textContent = `Page ${glossaryPage + 1} of ${totalPages}`;

  if (typeLabelEl) {
    typeLabelEl.textContent = label; // e.g., “Basics” or “Bosses”
  }
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
