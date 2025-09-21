/* ---------- GLOBAL STATE ---------- */
let countdownInterval = null;
let slideTimer = null;
let adminClickCount = 0;

/* ---------- UTILS ---------- */
function $id(id){ return document.getElementById(id); }
function safeText(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- CURRENT TIME & ADMIN LABEL ---------- */
function updateCurrentTime() {
  const el = $id('currentTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString();
  updateAdminLabel();
}

function updateAdminLabel() {
  const timeEl = $id('currentTime');
  if (!timeEl) return;
  const parent = timeEl.parentNode;
  const existing = $id('adminLabel');
  if (localStorage.getItem('adminMode') === 'true') {
    if (!existing) {
      const lab = document.createElement('div');
      lab.id = 'adminLabel';
      lab.textContent = 'ADMIN MODU AÇIK (Çıkış)';
      lab.style.color = 'red';
      lab.style.fontWeight = '700';
      lab.style.marginTop = '8px';
      lab.style.cursor = 'pointer';
      lab.onclick = adminLogout;
      parent.appendChild(lab);
    }
  } else {
    if (existing) existing.remove();
  }
}

/* ---------- ADMIN ---------- */
function adminClick() {
  adminClickCount++;
  if (adminClickCount >= 5) {
    adminClickCount = 0;
    const pw = prompt('Admin Modu şifresini girin:');
    if (pw === '1234') {
      localStorage.setItem('adminMode','true');
      alert('Admin Modu açıldı!');
      updateAdminLabel();
      loadBlogPosts();
    } else {
      alert('Yanlış şifre.');
    }
  }
}

function adminLogout() {
  localStorage.removeItem('adminMode');
  alert('Admin Modu kapatıldı.');
  updateAdminLabel();
  location.reload();
}

/* ---------- LICENSE COUNTDOWN & PROGRESS ---------- */
function calculateLicense() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

  const birthInput = $id('birthDate');
  const output = $id('output');
  const progressContainer = $id('progressContainer');
  const progressBar = $id('progressBar');

  if (!birthInput) return;
  const val = birthInput.value;
  if (!val) { alert('Lütfen doğum tarihinizi seçin.'); return; }

  const birthDate = new Date(val);
  const now = new Date();
  if (isNaN(birthDate.getTime()) || birthDate > now || birthDate.getFullYear() < 1900) {
    alert('Geçersiz tarih girdiniz!');
    return;
  }

  if (output) output.textContent = '';
  if (progressBar) progressBar.style.width = '0%';

  const legalDate = new Date(birthDate);
  legalDate.setFullYear(legalDate.getFullYear() + 18);

  if (now >= legalDate) {
    if (output) {
      output.textContent = 'Zaten ehliyetini alabilecek yaşta veya üzerindesiniz!';
      output.style.color = 'green';
    }
    if (progressContainer) {
      progressContainer.classList.remove('hidden');
      if (progressBar) progressBar.style.width = '100%';
    }
    setTimeout(()=> { window.location.href = 'tebrik.html'; }, 900);
    return;
  }

  if (progressContainer) progressContainer.classList.remove('hidden');

  function updateCountdown() {
    const now2 = new Date();
    let diff = legalDate - now2;
    if (diff <= 0) {
      if (output) {
        output.textContent = 'Tebrikler! Ehliyet alma zamanınız geldi!';
        output.style.color = 'green';
      }
      if (progressBar) progressBar.style.width = '100%';
      clearInterval(countdownInterval); countdownInterval = null;
      setTimeout(()=> { window.location.href = 'tebrik.html'; }, 900);
      return;
    }

    let totalSeconds = Math.floor(diff / 1000);
    const years = Math.floor(totalSeconds / (3600*24*365));
    totalSeconds -= years * 3600*24*365;
    const months = Math.floor(totalSeconds / (3600*24*30));
    totalSeconds -= months * 3600*24*30;
    const days = Math.floor(totalSeconds / (3600*24));
    totalSeconds -= days * 3600*24;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (output) {
      output.style.color = '#222';
      output.textContent = `Ehliyet alma zamanına kalan: ${years} yıl ${months} ay ${days} gün ${hours} saat ${minutes} dakika ${seconds} saniye`;
    }

    const totalMs = legalDate - birthDate;
    const passedMs = now2 - birthDate;
    let percent = Math.round((passedMs / totalMs) * 100);
    percent = Math.min(Math.max(percent,0),100);
    if (progressBar) progressBar.style.width = percent + '%';
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function clearDate() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  const birth = $id('birthDate');
  if (birth) birth.value = '';
  const output = $id('output');
  if (output) output.textContent = '';
  const progressContainer = $id('progressContainer');
  if (progressContainer) progressContainer.classList.add('hidden');
  const progressBar = $id('progressBar');
  if (progressBar) progressBar.style.width = '0%';
}

/* ---------- BLOG ---------- */
function saveBlog() {
  const authorEl = $id('blogAuthor');
  const msgEl = $id('blogMessage');
  if (!authorEl || !msgEl) return;
  const name = authorEl.value.trim();
  const msg = msgEl.value.trim();
  if (!name || !msg) { alert('Lütfen isim ve mesaj girin.'); return; }

  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  posts.push({ name: safeText(name), msg: safeText(msg), date: new Date().toLocaleString() });
  localStorage.setItem('blogPosts', JSON.stringify(posts));
  alert('Blog kaydınız eklendi!');
  window.location.href = 'index.html';
}

function loadBlogPosts() {
  const list = $id('blogList');
  if (!list) return;
  list.innerHTML = '';
  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  for (let i = posts.length-1; i>=0; i--){
    const p = posts[i];
    const wrap = document.createElement('div');
    wrap.className = 'blogPost';
    wrap.innerHTML = `<strong>${p.name}</strong> <span style="color:#888;font-size:12px">(${p.date})</span>
                      <div style="margin-top:6px;white-space:pre-wrap;">${p.msg}</div>`;
    if (localStorage.getItem('adminMode')==='true'){
      const del = document.createElement('button');
      del.className='deleteBtn';
      del.textContent='Sil';
      del.onclick=()=>{if(confirm('Bu yazıyı silmek istediğine emin misin?')){posts.splice(i,1);localStorage.setItem('blogPosts',JSON.stringify(posts));loadBlogPosts();}};
      wrap.appendChild(del);
    }
    list.appendChild(wrap);
  }
}

/* ---------- TEBRİK SLAYTLARI ---------- */
function initSlides() {
  const slides = document.querySelectorAll('.slide-card');
  if (!slides || slides.length===0) return;

  let current = 0;
  slides.forEach(s=>s.classList.remove('active'));
  slides[0].classList.add('active');

  function showSlide(index){
    slides.forEach(s=>s.classList.remove('active'));
    slides[index].classList.add('active');
  }

  // Otomatik 1 ve 2
  slideTimer = setTimeout(()=> showSlide(1), 5000); // Slayt 2
  setTimeout(()=> showSlide(2), 20000); // Slayt 3 Blog (manuel)
  setTimeout(()=> showSlide(3), 30000); // Slayt 4 Test (manuel)
}

/* ---------- BLOG SLIDE ---------- */
function saveBlogSlide(){
  const authorEl = $id('blogAuthorSlide');
  const msgEl = $id('blogMessageSlide');
  if (!authorEl || !msgEl) return;
  const name = authorEl.value.trim();
  const msg = msgEl.value.trim();
  if (!name || !msg) { alert('Lütfen isim ve mesaj girin.'); return; }
  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  posts.push({ name: safeText(name), msg: safeText(msg), date: new Date().toLocaleString() });
  localStorage.setItem('blogPosts', JSON.stringify(posts));
  window.location.href='index.html';
}

function blogYes(){
  window.location.href='blog.html';
}

function blogNo(){
  // Slayt 3'ten 4'e geç
  const slides=document.querySelectorAll('.slide-card');
  slides.forEach(s=>s.classList.remove('active'));
  slides[3].classList.add('active');
}

function testYes(){
  startMiniTest();
}

function testNo(){
  window.location.href='index.html';
}

/* ---------- MINI TEST ---------- */
function startMiniTest(){
  const questions=[
    {q:"Emniyet kemeri takmak zorunlu mu?",ok:"Evet"},
    {q:"Alkollü araç kullanmak yasal mı?",ok:"Hayır"},
    {q:"Kırmızı ışıkta durmak gerekir mi?",ok:"Evet"}
  ];
  let idx=0;

  const modal=document.createElement('div');
  modal.style.position='fixed';
  modal.style.left=0;
  modal.style.top=0;
  modal.style.right=0;
  modal.style.bottom=0;
  modal.style.background='rgba(0,0,0,0.5)';
  modal.style.display='flex';
  modal.style.alignItems='center';
  modal.style.justifyContent='center';
  modal.style.zIndex='9999';

  const box=document.createElement('div');
  box.style.background='#fff';
  box.style.padding='20px';
  box.style.borderRadius='12px';
  box.style.width='90%';
  box.style.maxWidth='520px';
  box.style.textAlign='center';

  modal.appendChild(box);
  document.body.appendChild(modal);

  function showQuestion(){
    box.innerHTML=`<h3>Mini Test (${idx+1}/${questions.length})</h3>
      <p style="font-weight:600">${questions[idx].q}</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;">
        <button class="primary" id="ansYes">Evet</button>
        <button class="secondary" id="ansNo">Hayır</button>
      </div>
      <div style="margin-top:10px;"><button onclick="document.body.removeChild(document.querySelector('div[style*=&quot;z-index: 9999&quot;]'))" class="secondary">Vazgeç</button></div>`;
    setTimeout(()=>{
      const yes=$id('ansYes'); const no=$id('ansNo');
      if(yes)yes.onclick=()=>checkAnswer('Evet');
      if(no)no.onclick=()=>checkAnswer('Hayır');
    },50);
  }

  window.checkAnswer=function(ans){
    const correct=questions[idx].ok;
    if(ans===correct){ idx++;
      if(idx>=questions.length){
        alert('Tebrikler! Mini testi başarıyla tamamladınız.');
        if(modal && modal.parentNode) modal.parentNode.removeChild(modal);
        window.location.href='tebrik.html';
        return;
      }
      showQuestion();
    } else { alert('Yanlış cevap. Tekrar dene.'); }
  };

  showQuestion();
}

/* ---------- DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  updateCurrentTime();
  setInterval(updateCurrentTime,1000);

  const timeEl=$id('currentTime');
  if(timeEl) timeEl.addEventListener('click',adminClick);

  if($id('blogList')) loadBlogPosts();
  if(document.querySelectorAll('.slide-card').length) initSlides();
});

