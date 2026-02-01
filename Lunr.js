let index;
let records = [];

/* ---------- Load Index ---------- */

fetch("search-index.json")
  .then(res => res.json())
  .then(data => {
    records = data;

    index = lunr(function () {
      this.ref("id");

      this.field("text_norm", { boost: 10 });
      this.field("strongs", { boost: 20 });
      this.field("ref", { boost: 5 });
      this.field("section", { boost: 2 });

      data.forEach(doc => this.add(doc));
    });
  });

/* ---------- Search Handler ---------- */

document.getElementById("searchBox").addEventListener("input", e => {
  const query = e.target.value.trim();
  if (!query || !index) {
    document.getElementById("results").innerHTML = "";
    return;
  }

  const results = index.search(query);
  renderResults(results);
});

/* ---------- Render Results ---------- */

function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!results.length) {
    container.innerHTML = "<p>No results.</p>";
    return;
  }

  results.forEach(result => {
    const record = records.find(r => r.id === result.ref);

    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "0.5em 0";

    div.innerHTML = `
      <div><strong>${record.ref || record.section}</strong></div>
      <div dir="${record.languageTags.includes("he") ? "rtl" : "ltr"}">
        ${highlight(record.text)}
      </div>
      ${renderStrongs(record.strongs)}
    `;

    container.appendChild(div);
  });
}

/* ---------- Helpers ---------- */

function highlight(text) {
  const q = document.getElementById("searchBox").value;
  if (!q) return text;
  return text.replace(
    new RegExp(q, "gi"),
    match => `<mark>${match}</mark>`
  );
}

function renderStrongs(strongs) {
  if (!strongs || !strongs.length) return "";
  return `
    <div>
      ${strongs
        .filter(s => /^[HG]\d{4}$/.test(s))
        .map(s => `<span class="strongs" data-code="${s}">${s}</span>`)
        .join(" ")}
    </div>
  `;
}
