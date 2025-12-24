const $ = (s) => document.querySelector(s);

/* ---------- utils ---------- */
async function fetchJSON(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("JSON load fail");
  return res.json();
}

async function fetchText(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTML load fail");
  return res.text();
}

/* ---------- index ---------- */
async function mountIndex(){
  $("#year").textContent = new Date().getFullYear();

  const posts = await fetchJSON("posts/posts.json");
  const container = $("#posts");

  container.innerHTML = posts.map(p => `
    <a class="post-link" href="post.html?slug=${p.slug}">
      <h2>${p.title}</h2>
      <p>${p.summary}</p>
    </a>
  `).join("");
}

/* ---------- post ---------- */
async function mountPost(){
  $("#year").textContent = new Date().getFullYear();

  const slug = new URLSearchParams(location.search).get("slug");
  const posts = await fetchJSON("posts/posts.json");
  const post = posts.find(p => p.slug === slug);

  if (!post){
    $("#content").innerHTML = "<p>글을 찾을 수 없음</p>";
    return;
  }

  $("#title").textContent = post.title;

  const html = await fetchText(`posts/${post.file}`);
  $("#content").innerHTML = html;

  enhanceCodeBlocks();
}

/* ---------- code ---------- */
function enhanceCodeBlocks(){
  if (window.hljs) hljs.highlightAll();

  document.querySelectorAll("pre code").forEach(code => {
    const pre = code.parentElement;
    if (pre.querySelector(".copy-btn")) return;

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";

    btn.onclick = async () => {
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = "Copy", 1000);
    };

    pre.appendChild(btn);
  });
}

/* ---------- boot ---------- */
if (location.pathname.endsWith("post.html")){
  mountPost();
} else {
  mountIndex();
}
