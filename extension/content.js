const main = (title) => {
  title = title.replace("Watch ", "");
  title = title.replace(" English Sub/Dub online Free on HiAnime.to", "");
  chrome.runtime.sendMessage({ title: title, url: document.URL });
};

var title = document.title;
if (
  title.includes("Watch") &&
  title.includes("English Sub/Dub online Free on HiAnime.to") &&
  document.URL.includes("hianime.to/watch")
)
  main(title);
