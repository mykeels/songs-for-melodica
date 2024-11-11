import fs from "fs";
import path from "path";

const styleHtml = `
<style>
    .tonic-solfa {
        font-weight: bold;
        position: relative;
        padding-bottom: 1em;
        margin-top: 0.5em;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 2em;
        letter-spacing: 0.2em;
    }
    .solfa {
      color: #FA0;
      font-size: 0.8em;
      vertical-align: bottom;
      margin-bottom: 1.2em;
      display: inline-block;
      margin-left: -0.6em;
      position: absolute;
      top: -0.9em;
    }
    .song {
      padding-top: 1em;
      padding-bottom: 1em;
    }
    .break {
      height: 2em;
      display: block;
    }
</style>

<div class="song">
`;

const songsDir = path.join(__dirname, "../songs");
const outputDir = path.join(__dirname, "../html");

const songFilePaths = fs.readdirSync(songsDir);

for (const songFilePath of songFilePaths) {
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
  const outputFilePath = path.join(outputDir, songFilePath.replace(".solfa", ".html").replace(".tonicsolfa", ".html"));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFilePath, html.join("\n"));
}

console.log("Done!");

function superimpose(line: string, tonicSolfa: string) {
  const result = [];
  line = line.trim();
  tonicSolfa = tonicSolfa.trim();
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    let solfa = getSolfa(i);
    
    result.push(char);
    if (solfa !== ' ') {
      result.push(`<sup class="solfa">${solfa}</sup>`);
    }
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
console.log(
  superimpose('Feliz Navidad', "s d'  t d' l")
);
