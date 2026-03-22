window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 플랫폼 메뉴 토글
    const btnPlatform = document.querySelector('.btn-platfrom');
    const platformMenu = document.querySelector('.platform-menu');

    if (btnPlatform && platformMenu) {
        btnPlatform.addEventListener('click', function(e) {
            e.stopPropagation();
            platformMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!platformMenu.contains(e.target) && e.target !== btnPlatform) {
                platformMenu.classList.remove('active');
            }
        });
    }

    // 메가 메뉴 및 슬라이더 컨테이너
    const sliderContainer = document.querySelector('.slider-container');
    const currentText = document.querySelector('.slide-counter .current');
    const totalText = document.querySelector('.slide-counter .total');
    const btnPrev = document.querySelector('.btn-prev');
    const btnNext = document.querySelector('.btn-next');
    const btnPause = document.querySelector('.btn-pause');
    
    let slides = [];
    let currentSlide = 0;
    let slideInterval;
    let isPaused = false;

    // 1. 슬라이더 데이터 가져오기 및 렌더링
    fetch('slider.json')
        .then(response => response.json())
        .then(data => {
            renderSlides(data.sliders);
            if (totalText) totalText.textContent = data.sliders.length;
            startSlide();
        });

    function renderSlides(sliderData) {
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';
        sliderData.forEach((item, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
            
            let contentHtml = '';
            if (item.type === 'video') {
                contentHtml = `<video src="${item.file}" muted autoplay loop playsinline preload="auto" style="width:100%; height:100%; object-fit:cover;"></video>`;
            } else {
                slideDiv.style.backgroundImage = `url('${item.file}')`;
            }

            // 텍스트 레이아웃 적용 및 컬러 설정
            const titleHtml = item.title ? item.title.replace(/\n/g, '<br>') : '';
            const descHtml = item.content || '';
            const textColor = item.textColor || '#000'; // 기본값 검정

            contentHtml += `
                <div class="slide-text-wrap" style="color: ${textColor}">
                    <div class="slide-text-inner">
                        <div class="slide-title" style="color: ${textColor}">${titleHtml}</div>
                        <div class="slide-desc" style="color: ${textColor}">${descHtml}</div>
                    </div>
                </div>
            `;

            slideDiv.innerHTML = contentHtml;
            sliderContainer.appendChild(slideDiv);
        });
        slides = document.querySelectorAll('.slide');
        
        // 첫 번째 비디오가 있다면 명시적으로 다시 한번 재생 명령
        const firstVideo = slides[0]?.querySelector('video');
        if (firstVideo) {
            firstVideo.play().catch(() => {
                console.log("첫 비디오 자동재생 차단됨. 사용자 클릭 대기.");
            });
        }
    }

    function showSlide(n) {
        if(slides.length === 0) return;
        
        // 모든 비디오 일시정지 및 현재 슬라이드 활성화
        slides.forEach((slide, idx) => {
            const video = slide.querySelector('video');
            if (idx === (n + slides.length) % slides.length) {
                slide.classList.add('active');
                if (video) {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                }
            } else {
                slide.classList.remove('active');
                if (video) video.pause();
            }
        });

        currentSlide = (n + slides.length) % slides.length;
        if(currentText) currentText.textContent = currentSlide + 1;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlide() {
        if (!isPaused) {
            slideInterval = setInterval(nextSlide, 5000); // 5초로 변경
        }
    }

    function stopSlide() {
        clearInterval(slideInterval);
    }

    if(btnNext) btnNext.addEventListener('click', () => {
        nextSlide();
        if (!isPaused) { stopSlide(); startSlide(); }
    });

    if(btnPrev) btnPrev.addEventListener('click', () => {
        prevSlide();
        if (!isPaused) { stopSlide(); startSlide(); }
    });

    if(btnPause) btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        const icon = btnPause.querySelector('i');
        if (isPaused) {
            stopSlide();
            icon.classList.replace('fa-pause', 'fa-play');
        } else {
            startSlide();
            icon.classList.replace('fa-play', 'fa-pause');
        }
    });

    // 2. 카테고리/내비게이션 데이터 로드
    let navData = null;
    let rightContentData = null;
    const depth1Container = document.querySelector('.depth1 ul');
    const depth2Container = document.querySelector('.depth2 ul');
    const depth3Container = document.querySelector('.depth3 ul');
    const megaRightContainer = document.querySelector('.mega-right');

    fetch('navigation.json')
        .then(response => response.json())
        .then(data => {
            navData = data.navigation;
            rightContentData = data.rightContent;
            renderDepth1();
            renderRightContent();
        });

    function renderDepth1() {
        if(!depth1Container || !navData) return;
        depth1Container.innerHTML = '';
        navData.forEach((cat, index) => {
            const li = document.createElement('li');
            if(index === 0) li.classList.add('active');
            li.innerHTML = `<a href="#"><span>${cat.name}</span> <i class="fa-solid fa-chevron-right"></i></a>`;
            
            li.addEventListener('mouseenter', () => {
                document.querySelectorAll('.depth1 li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderDepth2(cat.subCategories);
            });
            depth1Container.appendChild(li);
        });
        if(navData.length > 0) renderDepth2(navData[0].subCategories);
    }

    function renderDepth2(subCats) {
        if(!depth2Container) return;
        depth2Container.innerHTML = '';
        if(!subCats || subCats.length === 0) {
            if(depth3Container) depth3Container.innerHTML = '';
            return;
        }

        subCats.forEach((sub, index) => {
            const li = document.createElement('li');
            if(index === 0) li.classList.add('active');
            li.innerHTML = `<a href="#"><span>${sub.name}</span> <i class="fa-solid fa-chevron-right"></i></a>`;
            
            li.addEventListener('mouseenter', () => {
                document.querySelectorAll('.depth2 li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderDepth3(sub.items);
            });
            depth2Container.appendChild(li);
        });
        renderDepth3(subCats[0].items);
    }

    function renderDepth3(items) {
        if(!depth3Container) return;
        depth3Container.innerHTML = '';
        if(!items || items.length === 0) return;

        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#">${item}</a>`;
            depth3Container.appendChild(li);
        });
    }

    function renderRightContent() {
        if(!rightContentData || !megaRightContainer) return;

        const { promotions, luxuryBeauty, shillaOnly } = rightContentData;

        megaRightContainer.innerHTML = `
            <div class="promo-grid">
                ${promotions.map(item => `
                    <a href="#" class="promo-item">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <p>${item.name}</p>
                    </a>
                `).join('')}
            </div>
            <div class="luxury-beauty">
                <h3>럭셔리 뷰티</h3>
                <div class="brand-circles">
                    ${luxuryBeauty.map((brand, idx) => `
                        <div class="brand-item">
                            <a href="#">
                                <img src="${brand.imageUrl}" class="circle ${idx === 0 ? 'bg-black' : ''}" alt="${brand.name}">
                            </a>
                            <p class="brand-name">${brand.name}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="shilla-only">
                <h3>신라Only <i class="fa-solid fa-chevron-right"></i></h3>
                <div class="tag-grid">
                    ${shillaOnly.map(tag => `<a href="#" class="tag">${tag}</a>`).join('')}
                </div>
            </div>
        `;
    }
    
    // 3. 브랜드 메뉴 관련 로직
    let brandData = null;
    let currentSort = 'kor'; 
    const brandListContainer = document.querySelector('.brand-list');
    const brandIndexContainer = document.querySelector('.brand-index-nav');
    const brandSearchInput = document.querySelector('.brand-search input');
    const sortButtons = document.querySelectorAll('.sort-btn');

    fetch('brand.json')
        .then(response => response.json())
        .then(data => {
            brandData = data.brands;
            renderBrands();
        });

    function renderBrands(filter = '') {
        if (!brandData || !brandListContainer) return;
        brandListContainer.innerHTML = '';
        brandIndexContainer.innerHTML = '';

        const allKeys = Object.keys(brandData);
        let targetKeys = [];

        if (currentSort === 'kor') {
            targetKeys = allKeys.filter(k => /[ㄱ-ㅎ가-힣]/.test(k) && k !== '기타').sort();
            if (allKeys.includes('기타')) targetKeys.push('기타');
        } else {
            targetKeys = allKeys.filter(k => /[A-Z]/.test(k)).sort();
            if (allKeys.includes('기타')) targetKeys.push('기타');
        }

        const choMap = {
            "가": "ㄱ", "나": "ㄴ", "다": "ㄷ", "라": "ㄹ", "마": "ㅁ", 
            "바": "ㅂ", "사": "ㅅ", "아": "ㅇ", "자": "ㅈ", "차": "ㅊ", 
            "카": "ㅋ", "타": "ㅌ", "파": "ㅍ", "하": "ㅎ", "기타": "기타"
        };

        targetKeys.forEach(key => {
            const brands = brandData[key].filter(b => b.toLowerCase().includes(filter.toLowerCase()));
            if (brands.length === 0) return;

            const indexBtn = document.createElement('button');
            indexBtn.textContent = choMap[key] || key;
            indexBtn.addEventListener('click', () => {
                const targetEl = document.getElementById(`brand-first-${key}`);
                if (targetEl) {
                    const container = document.querySelector('.brand-list-scroll');
                    container.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
                }
            });
            brandIndexContainer.appendChild(indexBtn);

            brands.forEach((name, idx) => {
                const li = document.createElement('li');
                if (idx === 0) li.id = `brand-first-${key}`;
                li.innerHTML = `<a href="#">${name}</a>`;
                brandListContainer.appendChild(li);
            });
        });
    }

    if (sortButtons) {
        sortButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sortButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSort = btn.dataset.sort;
                if (brandSearchInput) brandSearchInput.value = '';
                renderBrands();
            });
        });
    }

    if (brandSearchInput) {
        brandSearchInput.addEventListener('input', (e) => {
            renderBrands(e.target.value);
        });
    }

    // 4. 아이콘 슬라이더 관련 로직
    const iconsList = document.querySelector('.icons-list');
    const btnIconPrev = document.querySelector('#main-icons .btn-prev');
    const btnIconNext = document.querySelector('#main-icons .btn-next');
    let iconScrollPos = 0;

    fetch('main_icons.json')
        .then(response => response.json())
        .then(data => {
            renderIcons(data.main_icons);
        });

    function renderIcons(icons) {
        if (!iconsList) return;
        iconsList.innerHTML = icons.map(icon => `
            <li class="icon-item">
                <div class="icon-img">
                    <img src="${icon.file}" alt="${icon.title}">
                </div>
                <span>${icon.title}</span>
            </li>
        `).join('');
    }

    if (btnIconNext) {
        btnIconNext.addEventListener('click', () => {
            const maxScroll = iconsList.scrollWidth - 1280;
            iconScrollPos = Math.min(iconScrollPos + 300, maxScroll); // 300px씩 이동
            iconsList.style.transform = `translateX(-${iconScrollPos}px)`;
        });
    }

    if (btnIconPrev) {
        btnIconPrev.addEventListener('click', () => {
            iconScrollPos = Math.max(iconScrollPos - 300, 0);
            iconsList.style.transform = `translateX(-${iconScrollPos}px)`;
        });
    }

    // 5. 지금 많이 보는 상품 슬라이더
    const popularList = document.querySelector('.popular-list');
    const btnPopPrev = document.querySelector('#popular-products .btn-prev');
    const btnPopNext = document.querySelector('#popular-products .btn-next');
    let popScrollPos = 0;
    const itemWidth = 325; // 아이템 너비(305) + 간격(20)

    fetch('popular_products.json')
        .then(response => response.json())
        .then(data => {
            renderPopularProducts(data.products);
        });

    function renderPopularProducts(products) {
        if (!popularList) return;
        popularList.innerHTML = products.map(product => `
            <li class="popular-item">
                <div class="product-card">
                    <div class="product-img">
                        <img src="${product.img}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="product-info">
                        <p class="brand">${product.brand}</p>
                        <p class="name">${product.name}</p>
                        <p class="price">$${product.price_usd} <span>(${product.price_krw}원)</span></p>
                    </div>
                </div>
            </li>
        `).join('');
    }

    if (btnPopNext) {
        btnPopNext.addEventListener('click', () => {
            const maxScroll = popularList.scrollWidth - 1280;
            popScrollPos = Math.min(popScrollPos + itemWidth, maxScroll);
            popularList.style.transform = `translateX(-${popScrollPos}px)`;
        });
    }

    if (btnPopPrev) {
        btnPopPrev.addEventListener('click', () => {
            popScrollPos = Math.max(popScrollPos - itemWidth, 0);
            popularList.style.transform = `translateX(-${popScrollPos}px)`;
        });
    }
});