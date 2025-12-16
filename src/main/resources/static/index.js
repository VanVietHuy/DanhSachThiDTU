const btnSwitchMode = document.getElementById('btnSwitchMode');
const iconMode = document.getElementById('iconMode');
const htmlTag = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

if (btnSwitchMode) {
  btnSwitchMode.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  htmlTag.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  if (iconMode && btnSwitchMode) {
    if (theme === 'dark') {
      iconMode.className = 'bi bi-sun-fill';
      btnSwitchMode.classList.replace('btn-outline-secondary', 'btn-outline-light');
    } else {
      iconMode.className = 'bi bi-moon-stars-fill';
      btnSwitchMode.classList.replace('btn-outline-light', 'btn-outline-secondary');
    }
  }
}

const ITEMS_PER_PAGE = 10;
let allData = [];
let filteredData = [];
let currentPage = 1;

const API_URL = '/api/lich-thi';
function parseDate(timeStr) {
  if (!timeStr) return new Date(0);
  try {
    let cleanStr = timeStr.replace(/[()]/g, '').trim();
    let [time, date] = cleanStr.split(' ');

    let [hour, minute] = time.split(':');       
    let [day, month, year] = date.split('/');   
    return new Date(year, month - 1, day, hour, minute);
  } catch (e) { return new Date(0); }
}

function xoaDauTV(str) {
  if (!str) return "";
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function (e) {
    const keyword = xoaDauTV(e.target.value.trim());

    if (keyword === "") {
      filteredData = allData;
    } else {
      filteredData = allData.filter(item => {
        const tenMon = item.tenMon ? xoaDauTV(item.tenMon) : "";
        const thoiGian = item.thoiGian ? xoaDauTV(item.thoiGian) : "";
        return tenMon.includes(keyword) || thoiGian.includes(keyword);
      });
    }
    renderPage(1);
  });
}

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('d-none');

    const listDiv = document.getElementById('danh-sach');
    if (listDiv) listDiv.classList.remove('d-none');
    allData = data.sort((a, b) => parseDate(b.thoiGian) - parseDate(a.thoiGian));
    filteredData = allData;

    if (allData.length === 0) {
      if (listDiv) listDiv.innerHTML = `<div class="alert alert-warning text-center">Không tìm thấy lịch thi nào!</div>`;
    } else {
      renderPage(1);
    }
  })
  .catch(err => {
    console.error(err);
    const loading = document.getElementById('loading');
    if (loading) loading.innerHTML = `<div class="alert alert-danger text-center">Lỗi kết nối Server!</div>`;
  });

function renderPage(page) {
  currentPage = page;
  const container = document.getElementById('danh-sach');
  if (!container) return;

  container.innerHTML = "";

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredData.slice(start, end);

  if (filteredData.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-5">
            <i class="bi bi-search fs-1 d-block mb-2"></i>
            Không tìm thấy môn nào trùng khớp!
        </div>`;
    renderPagination();
    return;
  }

  pageItems.forEach(mon => {
    const card = document.createElement('div');
    card.className = 'card mb-3 shadow-sm border-0 card-hover';
    const timeHtml = mon.thoiGian ?
      `<span class="badge bg-body-secondary text-body border time-badge">
                <i class="bi bi-clock me-1"></i>${mon.thoiGian}
      </span>` : '';

    card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center p-3">
                <div class="text-truncate me-2">
                    <a href="${mon.link}" target="_blank" class="text-decoration-none fw-bold text-body stretched-link text-truncate d-block">
                        ${mon.tenMon}
                    </a>
                </div>
                <div class="flex-shrink-0">${timeHtml}</div>
            </div>`;
    container.appendChild(card);
  });
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const ul = document.getElementById('pagination-controls');
  if (!ul) return;

  ul.innerHTML = "";
  if (totalPages <= 1) return;

  ul.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="renderPage(${currentPage - 1})">&laquo;</a>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      ul.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link ${i === currentPage ? 'bg-danger border-danger' : 'text-danger'}" href="#" onclick="renderPage(${i})">${i}</a>
            </li>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      ul.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  ul.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                      <a class="page-link" href="#" onclick="renderPage(${currentPage + 1})">&raquo;</a>
                  </li>`;
}