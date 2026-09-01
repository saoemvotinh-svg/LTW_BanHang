document.addEventListener("DOMContentLoaded", () => {
        // console.log("news.js đã chạy");
    //MOCK DATA
    const MockNews = [
        {
            id: 1,
            title: 'HOT!!!!!!! Siêu Sale Mùa Hè - Giảm Đến 50%',
            img: '../assets/images/sale1.jpg',
            summary: 'Chương trình ưu đãi mùa hè với nhiều sản phẩm thời trang dành cho bé được giảm đến 50%',
            content:
               `<p>Mùa hè này cửa hàng mang đến cho khách hàng chương trình ưu đãi đặc biệt.Nhiều sản phẩm thời trang dành cho bé được giảm đến 50%</p>
                <p>Chương trình này có thể giúp các bố mẹ có thể tiết kiệm chi phí khi mua đồ cho các bé. 
                   Ngoài ra các sản phẩm được khuyến mãi có nhiều kiểu dáng, kích thước khác nhau phù hợp với nhiều nhu cầu
                </p>
                <h3>Thời gian áp dụng: </h3>
                <p>Chương trình sẽ bắt đầu áp dụng khuyến mãi từ ngày 13/04/2026 đến hết ngày 15/08/2026.
                   Số lượng khuyến mãi có hạn nên khách hàng nhanh chóng lựa chọn, chốt đơn các sản phẩm ưng ý.
                </p>`,
            date: '13/04/2026 - 15/08/2026',
            tag: 'Khuyến Mãi'
        },
        {
            id: 2,
            title: 'Siêu Hot!!!! Ưu Đãi Cuối Tuần - Mua Nhiều Sản Phẩm Nhận Thêm Ưu Đãi',
            img: '../assets/images/sale2.jpg',
            summary: 'Chương trình ưu đãi áp dụng khi mua từ hai sản phẩm trở lên tại cửa hàng.',
            content: 
           `<p>Trong chương trình ưu đãi cuối tuần khách hàng sẽ nhận thêm nhiều ưu đãi hấp dẫn khi mua từ hai sản phẩm trở lên tại cửa hàng</p>
            <p>Chương trình được áp dụng cho nhiều sản phẩm thời trang trẻ em. 
                Đây là cơ hội để khách hàng mua được nhiều sản phẩm chất lượng cho bé với giá hời
            </p>
            <h3>Điều kiện áp dụng: </h3>
            <p>Chương trình chỉ áp dụng khi khách hàng mua từ hai sản phẩm trở lên trong cùng 1 đơn hàng.
               Khuyến mãi chỉ được áp dụng trong thời gian chương trình và có thể kết thúc khi số lượng ưu đãi đã hết
            </p>`,
            date: '16/08/2026',
            tag: 'Khuyến Mãi'
        },
                {
            id: 3,
            title: 'Flash Sale Giữa Tuần',
            img: '../assets/images/sale3.jpg',
            summary: 'Nhiều sản phẩm thời trang trẻ em được giảm giá cực sâu trong chương trình Flash Sale giữa tuần.',
            content: 
           `<p>Flash-Sale giữa tuần mang đến cho khách hàng trải nghiệm siêu hấp dẫn với nhiều sản phẩm trẻ được giảm siêu đậm</p>
            <p>Trong thời gian diễn ra chương trình, khách hàng có thể tìm thấy nhiều sản phẩm với mức giá ưu đãi hơn so với bình thường </p>
            <h3>Thời gian áp dụng: </h3>
            <p>Chương trình sẽ bắt đầu áp dụng khuyến mãi từ 0h00 ngày 18/08/2026 đến hết ngày 20/08/2026.
               Một số sản phẩm có giới hạn ưu đãi nên khách hàng nhanh chóng chốt đơn để không bỏ lỡ những ưu đãi hấp dẫn
            </p>`,
            date: '16/08/2026 - 20/08/2026',
            tag: 'Khuyến Mãi'
        },
                {
            id: 4,
            title: 'Cách chọn quần áo thoải mái, dễ mặcn phù hợp cho các bé',
            img: '../assets/images/news1.png',
            summary: 'Một số bí kíp đơn giản giúp bố mẹ lựa chọn quần áo thoải mái và phù hợp cho bé.',
            content: 
           `<p>Việc chọn quần áo thoải mái phù hợp sẽ giúp các bé cảm thấy thoải mái hơn trong quá trình vui chơi cũng như trong sinh hoạt hằng ngày</p>
            <p>Bố mẹ có thể tiết kiệm thời gian lựa chọn quần áo tốt, thoải mái phù hợp nhất cho bé thông qua bài viết này</p>
            <h3>Một số lưu ý khi lựa chọn quần áo cho bé: </h3>
            <p>Bố mẹ nên lựa chọn những quần áo có chất vải thoáng mát, mềm mại cho các bé, tránh những quần áo quá chật có thể ảnh hưởng đến khả năng vận động của các bé. 
               Và ưu tiên những sản phẩm dễ mặc, dễ giặt để giúp bố mẹ thuận tiện trong quá trình chăm sóc bé.
            </p>`,
            date: '22/08/2026',
            tag: 'Tin tức'
        },
                {
            id: 5,
            title: '5 Cách Bảo Quản Quần Áo Trẻ Em Luôn Bền Đẹp',
            img: '../assets/images/news2.png',
            summary: 'Một số cách đơn giản giúp bố mẹ bảo quản quần áo trẻ em luôn sạch đẹp và sử dụng được lâu hơn.',
            content: 
           `<p>Việc bảo quản quần áo đúng cách sẽ giúp quần áo luôn giữ được màu sắc như lúc mới mua và sử dụng được lâu hơn</p>
            <p>Bố mẹ nên phân loại quần áo trước khi giặt, lựa chọn cách giặt cũng ảnh hưởng chất liệu từng loại vải và tránh sử dụng nhiệu độ quá cao để ủi đồ</p>
            <h3>Một số lưu ý khi bảo quản quần áo cho bé: </h3>
            <p>Bố mẹ nên đọc kĩ hướng dẫn trên sản phẩm trước khi mang đi giặt, ưu tiên giặt quần áo mới riêng không giặt chung với quần áo cũ để tránh lem màu lúc mới mua về.
               Sau khi giặt nên phơi áo ở nơi thoáng mát tránh ánh nắng quá mạnh trong thời gian dài.
            </p>`,
            date: '25/08/2026',
            tag: 'Tin Tức'
        },
    ];
    console.log("MockNews:", MockNews);
    // RENDER NEWS
    const NewsContainer = document.getElementById('news_container');
    console.log("NewsContainer:", NewsContainer);
    function Rendernews(){
        if (!NewsContainer)
            return;
        console.log("Đang render danh sách tin tức");
        let html = '';
        MockNews.forEach((news) => {
            html += `
            <div class="news_card">
                <div class="news_img">
                    <img src="${news.img}" alt="${news.title}">
                </div>
                <div class="news_content">
                    <p class="news_type">${news.tag}</p>
                    <h2>${news.title}</h2>
                    <p class="news_date">${news.date}</p>
                    <p class="news_text">${news.summary}</p>
                    <a href="news_detail.html?id=${news.id}"
                       class="news_detail_button">
                       Xem Chi Tiết Tại website cửa hàng
                    </a>
                </div>
            </div>`;
        });
        NewsContainer.innerHTML = html;
        console.log("Đã render", MockNews.length, "bài viết");
    }
    const DetailCard = document.getElementById('detail_card');
    function RenderNewsDetail(){
        if (!DetailCard)
            return;
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id'));
        const news = MockNews.find((n) => n.id === id);
        if (news){
            DetailCard.innerHTML =`
                <h2>${news.title}</h2>
                <div class="detail_img">
                    <img src="${news.img}" alt="${news.title}">
                </div>
                <div class="detail_content">
                    <p class="news_type">${news.tag}</p>
                    <p class="news_date">${news.date}</p>
                    <p>${news.summary}</p>
                    ${news.content}
                </div>`;
        } else{
            DetailCard.innerHTML =
           `<div class="detail_content">
                <h2>Không tìm thấy bài viết</h2>
                <p>Bài viết bạn đang tìm không tồn tại.</p>
            </div>`;
        }
    }
    // console.log("Chuẩn bị gọi Rendernews");
    Rendernews();
    // console.log("Đã gọi Rendernews");
    RenderNewsDetail();
});