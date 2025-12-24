/* =========================
   basic helpers
========================= */
const $ = (s) => document.querySelector(s);

/* =========================
   fetch utils
========================= */
async function fetchJSON(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("JSON load failed: " + url);
  return res.json();
}

async function fetchText(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTML load failed: " + url);
  return res.text();
}

/* =========================
   INDEX PAGE
========================= */
async function mountIndex(){
  // footer year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const postsContainer = $("#posts");
  if (!postsContainer) return;

  // posts.json (절대경로 — 중요)
  const posts = await fetchJSON("/posts/posts.json");

  function render(list){
    postsContainer.innerHTML = list.map(p => {
      const tags = (p.tags || [])
        .map(t => `<span class="tag">${t}</span>`)
        .join("");

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

  /* ---- search ---- */
  const searchInput = $("#search");
  if (searchInput){
    searchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase().trim();
      render(
        posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q))
        )
      );
    });
  }

  /* ---- tab switch ---- */
  const tabPosts = $("#tab-posts");
  const tabApp   = $("#tab-app");
  const apps     = $("#apps");

  if (tabPosts && tabApp && apps){
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
}

/* =========================
   POST PAGE
========================= */
async function mountPost(){
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug){
    $("#content").innerHTML = "<p>잘못된 접근입니다.</p>";
    return;
  }

  // posts.json (절대경로 — 중요)
  const posts = await fetchJSON("/posts/posts.json");
  const post = posts.find(p => p.slug === slug);

  if (!post){
    $("#content").innerHTML = "<p>글을 찾을 수 없습니다.</p>";
    return;
  }

  $("#title").textContent = post.title;

  // 본문 HTML 로드
  const html = await fetchText(`/posts/${post.file}`);
  $("#content").innerHTML = html;

  // code highlight
  if (window.hljs) hljs.highlightAll();
}

/* =========================
   BOOT
========================= */
if (location.pathname.endsWith("post.html")){
  mountPost().catch(err => {
    console.error(err);
    $("#content").innerHTML = "<p>포스트 로딩 실패</p>";
  });
} else {
  mountIndex().catch(err => {
    console.error(err);
  });
}
