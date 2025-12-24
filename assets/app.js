const BASE = location.pathname.includes("/post.html")
  ? ".."
  : ".";
const $ = (s) => document.querySelector(s);

/* ---------- utils ---------- */
async function fetchJSON(url){
  const r = await fetch(url, { cache: "no-store" });
  return r.json();
}
async function fetchText(url){
  const r = await fetch(url, { cache: "no-store" });
  return r.text();
}

/* ---------- index ---------- */
async function mountIndex(){
  $("#year").textContent = new Date().getFullYear();

  const posts = await fetchJSON("posts/posts.json");
  const container = $("#posts");
  const search = $("#search");

  function render(list){
    container.innerHTML = list.map(p => {
      const tags = (p.tags || [])
        .map(t => `<span class="tag">${t}</span>`).join("");

      return `
        <a class="post-link" href="post.html?slug=${p.slug}">
          <h2>${p.title}</h2>
          <p>${p.summary}</p>
          <div class="tags">${tags}</div>
        </a>
      `;
    }).join("");
  }

  render(posts);

  search.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    render(posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
    ));
  });

  $("#tab-posts").onclick = () => {
    $("#posts").classList.remove("hidden");
    $("#apps").classList.add("hidden");
    $("#tab-posts").classList.add("active");
    $("#tab-app").classList.remove("active");
  };

  $("#tab-app").onclick = () => {
    $("#posts").classList.add("hidden");
    $("#apps").classList.remove("hidden");
    $("#tab-app").classList.add("active");
    $("#tab-posts").classList.remove("active");
  };
}

/* ---------- post ---------- */
async function mountPost(){
  $("#year").textContent = new Date().getFullYear();

  const slug = new URLSearchParams(location.search).get("slug");
  const posts = await fetchJSON("posts/posts.json");
  const post = posts.find(p => p.slug === slug);

  $("#title").textContent = post.title;
  $("#content").innerHTML = await fetchText(`posts/${post.file}`);

  if (window.hljs) hljs.highlightAll();
}

/* ---------- boot ---------- */
if (location.pathname.endsWith("post.html")){
  mountPost();
} else {
  mountIndex();
}

