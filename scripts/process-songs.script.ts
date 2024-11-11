import fs from "fs";
import path from "path";

const styleHtml = `
<style>
    div,pre {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 2em;
        letter-spacing: 0.2em;
        padding: 0;
        margin: 0;
    }
    .tonic-solfa {
        font-weight: bold;
        color: #FA0;
    }
    .solfa {
        letter-spacing: -0.1em;
        width: 1em;
    }
    .space {
        display: inline-block;
    }
</style>
`;

const songsDir = path.join(__dirname, "../songs");
const outputDir = path.join(__dirname, "../html");

const songFilePaths = fs.readdirSync(songsDir);

for (const songFilePath of songFilePaths) {
  const songLines = fs.readFileSync(path.join(songsDir, songFilePath), "utf8").split("\n");
  const html: string[] = [styleHtml];
  for (const line of songLines) {
    if (line.startsWith(">")) {
      html.push(`<div class="tonic-solfa">\n${
          line.slice(1)
            .trim()
            .split(" ")
            .map(solfa => solfa === '' ? '' : `<span class="solfa">${
              `${solfa.slice(0, 1)}${solfa.length > 1 ? `<sup>${solfa.slice(1)}</sup>` : ''}`
            }</span>\n`)
            .join("<span class='space'>&nbsp;</span>")
        }</div>`);
    } else {
      html.push(`<div class="line">${
        line.trim().replaceAll(" ", "<span class='space'>&nbsp;</span>")
      }</div>`);
    }
  }
  const outputFilePath = path.join(outputDir, songFilePath.replace(".tonicsolfa", ".html"));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFilePath, html.join("\n"));
}

console.log("Done!");

function superimpose(line: string, tonicSolfa: string) {
  const result = [];
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    let solfa = getSolfa(i);
    
    result.push(char);
    if (solfa !== ' ') {
      result.push(`<sup class="solfa">${solfa}</sup>`);
    }
  }

  return result.join("");

  function getSolfa(i: number) {
    let solfa = tonicSolfa[i];
    if (solfa === ' ') {
      return solfa;
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
