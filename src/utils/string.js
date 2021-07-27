export function parseTitleName(name) {
  let title = "";
  let author = "";
  let circle = "";
  let date = "";
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
    author = "Unknown author";
  }

  if (title.endsWith("}")) {
    date = title.substring(title.lastIndexOf("{") + 1, title.length - 1);
    title = title.substring(0, title.lastIndexOf("{")).trim();
  }

  return { title, author, circle, date };
}
