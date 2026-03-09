# Project-Beta

## Overview

Project Beta is a browser-based, single-player, turn-based game with procedurally generated levels.
Each run uses RNG to drive enemy movement, item drop rates, and level layout, and comes equip with browser storage for highscores, and custom modals.

## How to Download and Run the Game

### 1. Get the game files

You have two options:

#### Option A – Clone the repo (recommended)

1. Make sure you have Git installed.
2. In a terminal or command prompt, run:

```bash
   git clone <REPO_URL_HERE>
   cd <REPO_FOLDER_NAME>
```

#### Option B – Download as ZIP

Go to the GitHub repo page.

Click the green Code button → Download ZIP.

Extract the ZIP somewhere on your computer.

### 2. Run the game

Open the html folder in your file explorer

Double-click index.html

Your default browser should open and the game should load.

Note: If this does not work on a particular machine or browser, please let the developer know which OS and browser you're using.

Tested on: Comet/Perplexity browser and Google Chrome on recent versions of Windows.



### Project Structure (Folder Overview)

```text
.
├── style.css
├── background.png        # Actual png name different, current background asset
├── assets/               # Images, audio, and other game assets
├── html/                 # Contains index.html and other pages
└── js/                   # Game logic and supporting scripts
