// Permite abrir o acervo extraído diretamente no computador.
if (location.protocol === "file:") {
  for (const link of document.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (href.startsWith("/") && !href.startsWith("//")) {
      link.setAttribute("href", "https://landerrio.com.br" + href);
    } else if (!href.startsWith("#") && !href.includes(":") && href.endsWith("/")) {
      link.setAttribute("href", href + "index.html");
    }
  }
}
