export function parseName(name) {
  let title = "";
  let author = "";
  let circle = "";
  if (name.startsWith("[")) {
    title = name.substring(name.indexOf("]") + 1).trim();
    const creator = name.substring(1, name.indexOf("]"));
    if (creator.endsWith(")")) {
      author = creator.substring(0, creator.indexOf("("));
      circle = creator.substring(
        creator.indexOf("(") + 1,
        creator.lastIndexOf(")"),
      );
    } else {
      author = creator;
    }
  } else {
    title = name;
    author = "Multiple authors";
  }

  return { title, author, circle };
}
