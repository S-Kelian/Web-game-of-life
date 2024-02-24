let playerList = [];
const cellSize = 25;
const rows = 15;
const columns = 35;
let cpt = 0;
let gridGame = Array(rows + 2).fill().map(() => Array(columns + 2).fill(0));
let nbAlive = 0;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const bar = document.getElementById("progress");
let divAlive = document.getElementById('nbAlive');
const table = document.getElementById("leaderboard");
const tbody = document.getElementById("tbody");

class Player {
  constructor(name, score = 0) {
    this.name = name;
    this.score = score;
  }
  getName() {
    return this.name;
  }
  getScore() {
    return this.score;
  }
  play() {
    canvas.style.pointerEvents = "none";
    loop();
    cpt = 0;
    updateScore(this);
    updateJson();
  }
}

readJson();
render(true);

function readJson() {
  fetch('/players.json')
    .then(response => response.json())
    .then(data => {
      // create Player instances from the data and add them to the array
      for (const playerData of data) {
        console.log(typeof playerData);
        const player = JSON.parse(playerData);
        playerList.push(player);
      }
      playerList.sort((a, b) => b.score - a.score);
    });
}

async function updateJson() {
  const data = JSON.stringify(playerList);
  fetch('./players.json', {
    method: 'POST',
    body: data
  })
    .then(response => {
      if (response.ok) {
        console.log('Successfully updated JSON file');
      } else {
        console.error('Error updating JSON file');
      }
    });
}

function updateScore(player) {
  setTimeout(function() {
    canvas.style.pointerEvents = "auto";
    if (player.score < nbAlive) {
      player.score = nbAlive;
    }
    sort_playerList();
    updateLeaderboard();
  }, 11000)
}

function loop() {
  setTimeout(function() {
    next();
    render();
    cpt++;
    bar.style.width = (cpt * 100 / 20) + "%";
    if (cpt < 20) {
      loop();
    }
  }, 300)
}

function sort_playerList() {
  playerList.sort((a, b) => b.score - a.score);
}

function updateLeaderboard() {
  console.log(typeof playerList[0]);
  const topPlayer = playerList.slice(0, 10);
  console.log(topPlayer);
  tbody.innerHTML = "";
  for (let i = 0; i < topPlayer.length; i++) {
    let row = document.createElement("TR");
    if (i == 0) {
      row.setAttribute("id", "first");
    }
    if (i == 1) {
      row.setAttribute("id", "second");
    }
    if (i == 2) {
      row.setAttribute("id", "third");
    }
    let cell1 = document.createElement("TD");
    let cell2 = document.createElement("TD");
    let cell3 = document.createElement("TD");
    cell1.innerHTML = i + 1;
    cell2.innerHTML = topPlayer[i].getName();
    cell3.innerHTML = topPlayer[i].getScore();
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
}

function getPlayer(name) {
  for (let i = 0; i < playerList.length; i++) {
    if (playerList[i].getName() == name) {
      return playerList[i];
    }
  }
  let newPlayer = new Player(name);
  playerList.push(newPlayer);
  return newPlayer;
}

function render(updTable = false) {
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      if (gridGame[r][c] === 1) {
        ctx.fillStyle = "#D3D3D3";
      } else {
        ctx.fillStyle = "#444";
      }
      ctx.fillRect((c - 1) * cellSize, (r - 1) * cellSize, cellSize, cellSize);
      ctx.strokeRect((c - 1) * cellSize, (r - 1) * cellSize, cellSize, cellSize);
    }
  }
  nbAlive = count();
  let msg = `${nbAlive} CELLS ALIVE`;
  divAlive.innerText = msg;
  if (updTable) {
    sort_playerList();
    updateLeaderboard();
  }
}

canvas.addEventListener("click", function(event) {
  const rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  console.log(`x ${x}, y ${y}`);
  if (x > 10 && y > 10) {
    x -= 10;
    y -= 10;
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);
    gridGame[row + 1][col + 1] = gridGame[row + 1][col + 1] > 0 ? 0 : 1;
    render();
  }
});

function getState(tab, i, j) {
  s = tab[i - 1][j - 1] + tab[i - 1][j] + tab[i - 1][j + 1] + tab[i][j - 1] + tab[i][j + 1] + tab[i + 1][j - 1] + tab[i + 1][j] + tab[i + 1][j + 1];
  if (s == 2)
    return tab[i][j];
  else {
    if (s == 3)
      return 1;
    else
      return 0;
  }
}

function next() {
  let gridCopy = Array(rows + 2).fill().map(() => Array(columns + 2).fill(0));

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= columns; j++) {
      let etat = getState(gridGame, i, j);
      gridCopy[i][j] = etat;

    }
  }
  // tableau modifie etape n+1
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= columns; j++)
      gridGame[i][j] = gridCopy[i][j];
  }
}

function pressPlayButton() {
  const playerName = document.getElementById("pseudo").value;
  if (playerName != "") {
    let player = getPlayer(playerName);
    player.play();
  } else {
    alert("You must need to enter you pseudo !");
  }
}

function reset() {
  run = false;
  gridGame = Array(rows + 2).fill().map(() => Array(columns + 2).fill(0));
  render();
}

function count() {
  nb = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      if (gridGame[r][c] === 1) {
        nb++;
      }
    }
  }
  return nb;
}
