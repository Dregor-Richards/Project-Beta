# Project-Beta

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

Quick - You may try opening the html folder from your File Explorer, and double clicking the index.html file.
This should work in most cases, but the steps below are more reliable.

Open a terminal/command prompt in the extracted folder (or cd into it).

### Run a local web server

If you have Python 3 installed
From the project folder:

```bash
python -m http.server 8000
```
OR:

```bash
python3 -m http.server 8000
```
Then open your browser and visit:

http://localhost:8000/html/index.html

The game should load and run normally.

#### If you prefer Node.js
Install serve once:

```bash
npm install -g serve
```

Then, from the project folder:

```bash
serve .
```

It should print a local URL; open that in your browser and navigate to /html/index.html.



If anything doesn’t work (audio not playing, assets missing, etc.), make sure:

You are running through http://localhost:... and not opening the file directly.


All folders (assets, js, html etc.) are present as in the repo structure.


### Project Structure (Folder Overview)

.
├── style.css
├── background.png    # Not the actual name
├── assets/
├── html/        # contains index.html and other pages
├── js/

