var dashboardData = {
  stats: [
    { value: 120, label: 'Sản phẩm' },
    { value: 35, label: 'Đơn hàng mới' },
    { value: 58, label: 'Khách hàng' },
    { value: 12, label: 'Danh mục' }
  ],
  orders: [
    { id: '#DH001', customer: 'Nguyen Van A', total: '450.000 đ', status: 'Đã giao', statusClass: 'done' },
    { id: '#DH002', customer: 'Tran Thi B', total: '220.000 đ', status: 'Đang xử lý', statusClass: 'wait' },
    { id: '#DH003', customer: 'Le Van C', total: '680.000 đ', status: 'Đang xử lý', statusClass: 'wait' }
  ]
};

var productsData = [
  {
    id: 'SP01',
    itemId: '50457440771',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-82602-mm19admx2l1c46',
    name: 'Quần áo trẻ em mới Phù hợp với trẻ sơ sinh Áo thun in đầy đủ với nhiều mẫu khác nhau + Quần short Denim 2 Cái / bộ',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Qu%E1%BA%A7n-%C3%A1o-tr%E1%BA%BB-em-m%E1%BB%9Bi-Ph%C3%B9-h%E1%BB%A3p-v%E1%BB%9Bi-tr%E1%BA%BB-s%C6%A1-sinh-%C3%81o-thun-in-%C4%91%E1%BA%A7y-%C4%91%E1%BB%A7-v%E1%BB%9Bi-nhi%E1%BB%81u-m%E1%BA%ABu-kh%C3%A1c-nhau-Qu%E1%BA%A7n-short-Denim-2-C%C3%A1i-b%E1%BB%99-Th%E1%BB%9Di-trang-m%C3%B9a-h%C3%A8-Qu%E1%BA%A7n-%C3%A1o-b%C3%A9-trai-b%C3%A9-g%C3%A1i-Tr%E1%BA%BB-em-B%E1%BB%99-%C4%91%E1%BB%93-th%E1%BB%83-thao-Cotton-th%C3%B4ng-th%C6%B0%E1%BB%9Dng-i.290718654.50457440771'
  },
  {
    id: 'SP02',
    itemId: '42727428428',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-81zth-mikzgui6jgg220',
    name: 'Quần Áo Trẻ Em Mới Sọc Áo Thun Quần Short 2 Cái / bộ Thời Trang Mùa Hè Bé Trai Bé Gái',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Qu%E1%BA%A7n-%C3%81o-Tr%E1%BA%BB-Em-M%E1%BB%9Bi-S%E1%BB%8Dc-%C3%81o-Thun-Qu%E1%BA%A7n-Short-2-C%C3%A1i-b%E1%BB%99-Th%E1%BB%9Di-Trang-M%C3%B9a-H%C3%A8-B%C3%A9-Trai-B%C3%A9-G%C3%A1i-Qu%E1%BA%A7n-%C3%81o-Tr%E1%BA%BB-Em-Cotton-Casual-Tracksuits-i.290718654.42727428428'
  },
  {
    id: 'SP03',
    itemId: '57659459073',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-820nr-mnguasu7zapt48',
    name: 'Trẻ Em Bé Trai Bộ Quần Áo Mùa Hè Sơ Sinh Trẻ Em Áo Thun Sọc Có Khăn Choàng Chữ Hoạt Hình + Quần Short 2 Chiếc',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Tr%E1%BA%BB-Em-B%C3%A9-Trai-B%E1%BB%99-Qu%E1%BA%A7n-%C3%81o-M%C3%B9a-H%C3%A8-S%C6%A1-Sinh-Tr%E1%BA%BB-Em-%C3%81o-Thun-S%E1%BB%8Dc-C%C3%B3-Kh%C4%83n-Cho%C3%A0ng-Ch%E1%BB%AF-Ho%E1%BA%A1t-H%C3%ACnh-Qu%E1%BA%A7n-Short-2-Chi%E1%BA%BFc-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Tr%E1%BA%BB-Em-Trang-Ph%E1%BB%A5c-Th%E1%BB%9Di-Trang-Qu%E1%BA%A7n-%C3%81o-i.290718654.57659459073'
  },
  {
    id: 'SP04',
    itemId: '49660280243',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-820o1-mnwomoe47shtdd',
    name: 'Mới Bé Trai Bộ Quần Áo Mùa Hè Trẻ Em Trẻ Sơ Sinh Thêu Chó Áo Polo + Quần Short 2 Bộ Đồ Tập Đi',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/M%E1%BB%9Bi-B%C3%A9-Trai-B%E1%BB%99-Qu%E1%BA%A7n-%C3%81o-M%C3%B9a-H%C3%A8-Tr%E1%BA%BB-Em-Tr%E1%BA%BB-S%C6%A1-Sinh-Th%C3%AAu-Ch%C3%B3-%C3%81o-Polo-Qu%E1%BA%A7n-Short-2-B%E1%BB%99-%C4%90%E1%BB%93-T%E1%BA%ADp-%C4%90i-Qu%E1%BA%A7n-%C3%81o-Trang-Ph%E1%BB%A5c-0-5Y-%C3%81o-B%C3%A9-Trai-Trang-Ph%E1%BB%A5c-Tr%E1%BA%BB-Em-i.290718654.49660280243'
  },
  {
    id: 'SP05',
    itemId: '51509589584',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-820om-mnkv7bjl8op07a',
    name: 'Trẻ Em Mới Thời Trang Mùa Hè Cho Bé Trai Quần Áo Phù Hợp Với Trẻ Sơ Sinh Áo Sơ Mi Sọc + Quần Short Trắng',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Tr%E1%BA%BB-Em-M%E1%BB%9Bi-Th%E1%BB%9Di-Trang-M%C3%B9a-H%C3%A8-Cho-B%C3%A9-Trai-Qu%E1%BA%A7n-%C3%81o-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Tr%E1%BA%BB-S%C6%A1-Sinh-%C3%81o-S%C6%A1-Mi-S%E1%BB%8Dc-Qu%E1%BA%A7n-Short-Tr%E1%BA%AFng-2-C%C3%A1i-b%E1%BB%99-B%C3%A9-G%C3%A1i-T%E1%BA%ADp-%C4%90i-Trang-Ph%E1%BB%A5c-Th%C6%B0%E1%BB%9Dng-Ng%C3%A0y-B%E1%BB%99-%C4%90%E1%BB%93-Th%E1%BB%83-Thao-Tr%E1%BA%BB-Em-i.290718654.51509589584'
  },
  {
    id: 'SP06',
    itemId: '47856743698',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-8262q-mleo8clhs8oy0d',
    name: 'Quần Áo Tiệc Sinh Nhật Tập Đi Bộ Quần Áo Bé Trai Áo Sơ Mi Mùa Hè + Quần Short Phù Hợp Với Trẻ Em',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Qu%E1%BA%A7n-%C3%81o-Ti%E1%BB%87c-Sinh-Nh%E1%BA%ADt-T%E1%BA%ADp-%C4%90i-B%E1%BB%99-Qu%E1%BA%A7n-%C3%81o-B%C3%A9-Trai-%C3%81o-S%C6%A1-Mi-M%C3%B9a-H%C3%A8-Qu%E1%BA%A7n-Short-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Tr%E1%BA%BB-Em-Tay-Ng%E1%BA%AFn-Trang-Ph%E1%BB%A5c-%C4%90i-H%E1%BB%8Dc-i.290718654.47856743698'
  },
  {
    id: 'SP07',
    itemId: '29376750662',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-7rcfc-m6gau3ci1vxu8f',
    name: 'Trẻ Em Mùa Hè Mới Thời Trang Bé Trai Bộ Quần Áo Tập Đi Cotton Chữ Vịt Áo Thun Vịt Denim Búp Bê Túi Lớn',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Tr%E1%BA%BB-Em-M%C3%B9a-H%C3%A8-M%E1%BB%9Bi-Th%E1%BB%9Di-Trang-B%C3%A9-Trai-B%E1%BB%99-Qu%E1%BA%A7n-%C3%81o-T%E1%BA%ADp-%C4%90i-Cotton-Ch%E1%BB%AF-V%E1%BB%8Bt-%C3%81o-Thun-V%E1%BB%8Bt-Denim-B%C3%BAp-B%C3%AA-T%C3%BAi-L%E1%BB%9Bn-D%C3%A2y-%C4%90eo-Qu%E1%BA%A7n-2-C%C3%A1i-b%E1%BB%99-Trang-Ph%E1%BB%A5c-Tr%E1%BA%BB-Em-Trang-Ph%E1%BB%A5c-Trang-Ph%E1%BB%A5c-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Th%C6%B0%E1%BB%9Dng-Ng%C3%A0y-i.290718654.29376750662'
  },
  {
    id: 'SP08',
    itemId: '27081802502',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-7renl-m849fiu5rrgg60',
    name: 'Bé Trai Quần Áo Mùa Hè Hàn Quốc Trẻ Em Bé Trai Thoáng Khí Túi Thường Ngày Áo Thun Tay Ngắn + Quần Short',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/B%C3%A9-Trai-Qu%E1%BA%A7n-%C3%81o-M%C3%B9a-H%C3%A8-H%C3%A0n-Qu%E1%BB%91c-Tr%E1%BA%BB-Em-B%C3%A9-Trai-Tho%C3%A1ng-Kh%C3%AD-T%C3%BAi-Th%C6%B0%E1%BB%9Dng-Ng%C3%A0y-%C3%81o-Thun-Tay-Ng%E1%BA%AFn-Qu%E1%BA%A7n-Short-B%E1%BB%99-Hai-M%E1%BA%A3nh-Trang-Ph%E1%BB%A5c-i.290718654.27081802502'
  },
  {
    id: 'SP09',
    itemId: '49907479908',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-825zs-mm1r915xkqgxf5',
    name: 'Mới Tập Đi Mùa Hè Bé Trai/Bé Gái Quần Áo Hoạt Hình Dễ Thương Khủng Long Áo Thun + Quần Short 2 Cái / bộ',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/M%E1%BB%9Bi-T%E1%BA%ADp-%C4%90i-M%C3%B9a-H%C3%A8-B%C3%A9-Trai-B%C3%A9-G%C3%A1i-Qu%E1%BA%A7n-%C3%81o-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Tr%E1%BA%BB-Em-Ho%E1%BA%A1t-H%C3%ACnh-D%E1%BB%85-Th%C6%B0%C6%A1ng-Kh%E1%BB%A7ng-Long-%C3%81o-Thun-Qu%E1%BA%A7n-Short-2-C%C3%A1i-b%E1%BB%99-Tr%E1%BA%BB-S%C6%A1-Sinh-Qu%E1%BA%A7n-%C3%81o-Th%E1%BB%9Di-Trang-Tr%E1%BA%BB-Em-B%E1%BB%99-%C4%90%E1%BB%93-Th%E1%BB%83-Thao-i.290718654.49907479908'
  },
  {
    id: 'SP10',
    itemId: '28582330295',
    image: 'https://down-vn.img.susercontent.com/file/sg-11134201-7req7-m89yet98p4u8fe',
    name: 'Trẻ Em Mùa Hè Mới Thường Ngày Giải Trí Đi Học Mặc Quần Áo Bé Trai Giả Hai Áo Thun Có Gấu Buộc Quần Short',
    category: 'Shopee - oopsmile8.vn',
    price: 'Chưa tách được giá từ HTML',
    qty: '-',
    sourceUrl: 'https://shopee.vn/Tr%E1%BA%BB-Em-M%C3%B9a-H%C3%A8-M%E1%BB%9Bi-Th%C6%B0%E1%BB%9Dng-Ng%C3%A0y-Gi%E1%BA%A3i-Tr%C3%AD-%C4%90i-H%E1%BB%8Dc-M%E1%BA%B7c-Qu%E1%BA%A7n-%C3%81o-Ph%C3%B9-H%E1%BB%A3p-V%E1%BB%9Bi-Tr%E1%BA%BB-Em-B%C3%A9-Trai-Gi%E1%BA%A3-Hai-%C3%81o-Thun-C%C3%B3-G%E1%BA%A5u-Bu%E1%BB%99c-Qu%E1%BA%A7n-Short-2-C%C3%A1i-b%E1%BB%99-Tr%E1%BA%BB-S%C6%A1-Sinh-T%E1%BA%ADp-%C4%90i-Trang-Ph%E1%BB%A5c-Qu%E1%BA%A7n-%C3%81o-1-5-Tu%E1%BB%95i-i.290718654.28582330295'
  }
];

function loadIncludes() {
  var includeBlocks = document.querySelectorAll('[data-include]');

  includeBlocks.forEach(function (block) {
    var filePath = block.getAttribute('data-include');

    if (!filePath) {
      return;
    }

    fetch(filePath)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Khong the tai file include: ' + filePath);
        }
        return response.text();
      })
      .then(function (html) {
        block.innerHTML = html;
      })
      .catch(function (error) {
        console.error(error);
      });
  });
}

function renderDashboardStats() {
  var container = document.getElementById('statsGrid');

  if (!container) {
    return;
  }

  container.innerHTML = dashboardData.stats.map(function (item) {
    return '<article class="stat-card"><h3>' + item.value + '</h3><p>' + item.label + '</p></article>';
  }).join('');
}

function renderOrderTable() {
  var tbody = document.getElementById('orderTableBody');

  if (!tbody) {
    return;
  }

  tbody.innerHTML = dashboardData.orders.map(function (item) {
    return '<tr>' +
      '<td>' + item.id + '</td>' +
      '<td>' + item.customer + '</td>' +
      '<td>' + item.total + '</td>' +
      '<td><span class="status ' + item.statusClass + '">' + item.status + '</span></td>' +
      '</tr>';
  }).join('');
}

function renderProductTable() {
  var tbody = document.getElementById('productTableBody');

  if (!tbody) {
    return;
  }

  tbody.innerHTML = productsData.map(function (item) {
    return '<tr>' +
      '<td>' + item.id + '</td>' +
      '<td><img class="thumb" src="' + item.image + '" alt="' + item.name + '"></td>' +
      '<td>' + item.name + '</td>' +
      '<td>' + item.price + '</td>' +
      '<td>' + item.qty + '</td>' +
      '<td><a class="btn btn-edit" href="admin-form.html">Sửa</a><button class="btn btn-delete" type="button">Xóa</button></td>' +
      '</tr>';
  }).join('');
}

function bindImageUploadToggle() {
  var radios = document.querySelectorAll('input[name="uploadType"]');
  var linkInput = document.getElementById('productImageLink');
  var fileInput = document.getElementById('productImageFile');
  var uploadHint = document.getElementById('uploadHint');

  if (!radios.length || !linkInput || !fileInput) return;

  radios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.value === 'link') {
        linkInput.style.display = 'block';
        fileInput.style.display = 'none';
        if (uploadHint) uploadHint.style.display = 'none';
      } else {
        linkInput.style.display = 'none';
        fileInput.style.display = 'block';
        if (uploadHint) uploadHint.style.display = 'block';
      }
    });
  });
}

function bindFormSubmit() {
  var form = document.getElementById('productForm');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    alert('Dữ liệu sản phẩm đã được lưu thành công!');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadIncludes();
  renderDashboardStats();
  renderOrderTable();
  renderProductTable();
  bindImageUploadToggle();
  bindFormSubmit();
});
