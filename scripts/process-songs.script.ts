import fs from "fs";
import path from "path";

const styleHtml = `
<style>
    html {
      font-size: 18px;
      display: flex;
      justify-content: center;
    }

    @media (max-width: 768px) {
      html {
        font-size: 12px;
      }
    }

    .tonic-solfa {
        font-weight: bold;
        position: relative;
        padding-bottom: 1rem;
        margin-top: 0.5rem;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 1.5rem;
        letter-spacing: 0.2rem;
        text-wrap: nowrap;
    }
    .solfa {
      color: #FA0;
      font-size: 1.2rem;
      vertical-align: bottom;
      margin-bottom: 1.2rem;
      display: inline-block;
      margin-left: -0.6rem;
      position: absolute;
      top: -0.9em;
    }
    .song {
      padding-top: 1rem;
      padding-bottom: 1rem;
      width: 70dvh;
    }
    .break {
      height: 2rem;
      display: block;
    }
</style>

<div class="song">
`;

const songsDir = path.join(__dirname, "../songs");
const outputDir = path.join(__dirname, "../html");

const songFilePaths = fs.readdirSync(songsDir);
const indexHtml = [
  `
  <style>
    h1 {
      text-align: center;
    }
    div {
      text-align: center;
      padding: 1em;
      font-size: 1.5em;
    }
  </style>
  <h1>Songs for Melodica</h1>
  `
];

for (const songFilePath of songFilePaths.sort()) {
  const songFileName = songFilePath.replace(".solfa", ".html").replace(".tonicsolfa", ".html");
  const songName = songFileName.replace(/-/g, " ").replace(".html", "");
  indexHtml.push(`
    <div>
    <a href="${songFileName}">${songName}</a>
    </div>`);
  const songLines = fs.readFileSync(path.join(songsDir, songFilePath), "utf8").split("\n");
  const html: string[] = [styleHtml];
  let songLine = '';
  let tonicSolfa = '';
  for (const line of songLines) {
    if (line.startsWith(">")) {
      tonicSolfa = line.slice(1);
    } else if (line.trim()) {
      songLine = line;
      html.push(superimpose(songLine, tonicSolfa));
    } else {
      html.push(line + "<div class='break'><hr></div>");
    }
  }
  html.push("</div>");
  const outputFilePath = path.join(outputDir, songFileName);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFilePath, html.join("\n"));

}


fs.writeFileSync(path.join(outputDir, "index.html"), indexHtml.join("\n"));

console.log("Done!");

function superimpose(line: string, tonicSolfa: string) {
  const result = [];
  line = line.trim();
  tonicSolfa = tonicSolfa.trim();
  let skipSolfaTimes = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    let solfa = skipSolfaTimes > 0 ? ' ' : getSolfa(i);
    skipSolfaTimes = solfa.length;
    
    result.push(char);
    if (solfa !== ' ') {
      result.push(`<sup class="solfa">${solfa}</sup>`);
    }
    skipSolfaTimes = Math.max(skipSolfaTimes - 1, 0);
  }

  return `<div class="tonic-solfa">${result.join("")}</div>`;

  function getSolfa(i: number) {
    let solfa = tonicSolfa[i];
    if (solfa === ' ') {
      return solfa;
    } else if (solfa === "'") {
      return ' ';
    }
    while (tonicSolfa[i + 1] && tonicSolfa[i + 1] !== ' ') {
      solfa += tonicSolfa[i + 1];
      i++;
    }
    return solfa || ' ';
  }
}
