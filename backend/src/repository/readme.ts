import fs from "fs";
import matter from "gray-matter";

export function getRepoReadme(repoDirPath: string) {
  const files = fs.readdirSync(repoDirPath);
  const readmeFileName = files.find(
    (fileName) => fileName.toLowerCase() === "readme.md"
  );

  if (!readmeFileName) {
    return "";
  }

  const mdString = fs
    .readFileSync(`${repoDirPath}/${readmeFileName}`)
    .toString();

  return matter(mdString).content;
}
