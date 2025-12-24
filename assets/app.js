/* =========================
   helpers
========================= */
const $ = (s) => document.querySelector(s);
const ORIGIN = location.origin;

/* =========================
   fetch utils
========================= */
async function fetchJSON(path){
  const res = await fetch(`${ORIGIN}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error("JSON load failed: " + path);
  return res.json();
}

async function fetchText(path){
  const res = await fetch(`${ORIGIN}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error("HTML load failed: " + path);
  return res.text();
}

/* =========================
   INDEX
========================= */
async function mountIndex(){
  $("#year").textContent = new Date().getFullYear();

  const postsContainer = $("#posts");
  if (!postsContainer) return;

  const posts = await fetchJSON("/posts/posts.json");

  function render(list){
    postsContainer.innerHTML = list.map(p => `
      <a class="post-link" href="post.html?slug=${p.slug}">
        <h2>${p.title}</h2>
        <p>${p.summary}</p>
        <div class="tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      </a>
    `).join("");
  }

  render(posts);

  const search = $("#search");
  if (search){
    search.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      render(
        posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q))
        )
      );
    });
  }

  const tabPosts = $("#tab-posts");
  const tabApp = $("#tab-app");
  const apps = $("#apps");

  tabPosts.onclick = () => {
    postsContainer.classList.remove("hidden");
    apps.classList.add("hidden");
    tabPosts.classList.add("active");
    tabApp.classList.remove("active");
  };

  tabApp.onclick = () => {
    postsContainer.classList.add("hidden");
    apps.classList.remove("hidden");
    tabApp.classList.add("active");
    tabPosts.classList.remove("active");
  };
}

/* =========================
   POST
========================= */
async function mountPost(){
  $("#year").textContent = new Date().getFullYear();

  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug){
    $("#content").innerHTML = "<p>잘못된 접근</p>";
    return;
  }

  const posts = await fetchJSON("/posts/posts.json");
  const post = posts.find(p => p.slug === slug);

  if (!post){
    $("#content").innerHTML = "<p>글 없음</p>";
    return;
  }

  $("#title").textContent = post.title;
  $("#content").innerHTML = await fetchText(`/posts/${post.file}`);

  if (window.hljs) hljs.highlightAll();
}

/* =========================
   BOOT
========================= */
if (location.pathname.endsWith("post.html")){
  mountPost().catch(console.error);
} else {
  mountIndex().catch(console.error);
}

