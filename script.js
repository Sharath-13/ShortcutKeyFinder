async function loadShortcuts() {
  const response = await fetch("shortcuts.json");
  return await response.json();
}

let fuse;

loadShortcuts().then(shortcuts => {
  const data = Object.entries(shortcuts).map(([action, info]) => ({
    action: action.toLowerCase(),
    windows: info.windows,
    mac: info.mac,
    keywords: (info.keywords || []).map(k => k.toLowerCase())
  }));

  fuse = new Fuse(data, {
    keys: ["action", "keywords"],
    threshold: 0.4,
    ignoreLocation: true
  });
});

function normalizeQuery(query) {
  query = query.toLowerCase();

  // Remove filler words so sentences still work
  const fillerWords = [
    "what", "is", "the", "shortcut", "for", "how", "do", "i",
    "to", "in", "on", "of", "can", "you", "tell", "me"
  ];

  return query
    .split(" ")
    .filter(word => !fillerWords.includes(word))
    .join(" ");
}

function searchShortcut() {
  let query = document.getElementById("query").value;
  query = normalizeQuery(query);

  const results = fuse.search(query);

  const output = results.map(r =>
    `<p><b>${r.item.action.toUpperCase()}</b><br>Windows: ${r.item.windows}<br>Mac: ${r.item.mac}</p>`
  ).join("");

  document.getElementById("results").innerHTML = output || "<p>No shortcut found.</p>";
}

// Live search as you type
document.getElementById("query").addEventListener("input", searchShortcut);
