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

    // 1. 메가 슬라이더 데이터 렌더링
    fetch('slider.json')
        .then(response => response.json())
        .then(data => {
            if (data.sliders) {
                renderSlides(data.sliders);
                if (totalText) totalText.textContent = data.sliders.length;
                startSlide();
            }
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

            const titleHtml = item.title ? item.title.replace(/\n/g, '<br>') : '';
            const descHtml = item.content || '';
            const textColor = item.textColor || '#000';

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
    }

    function showSlide(n) {
        if(slides.length === 0) return;
        slides.forEach((slide, idx) => {
            if (idx === (n + slides.length) % slides.length) {
                slide.classList.add('active');
                const video = slide.querySelector('video');
                if (video) { video.currentTime = 0; video.play().catch(() => {}); }
            } else {
                slide.classList.remove('active');
                const video = slide.querySelector('video');
                if (video) video.pause();
            }
        });
        currentSlide = (n + slides.length) % slides.length;
        if(currentText) currentText.textContent = currentSlide + 1;
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }
    function startSlide() { if (!isPaused) { slideInterval = setInterval(nextSlide, 5000); } }
    function stopSlide() { clearInterval(slideInterval); }

    if(btnNext) btnNext.addEventListener('click', () => { nextSlide(); if (!isPaused) { stopSlide(); startSlide(); } });
    if(btnPrev) btnPrev.addEventListener('click', () => { prevSlide(); if (!isPaused) { stopSlide(); startSlide(); } });

    if(btnPause) btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        const icon = btnPause.querySelector('i');
        if (isPaused) { stopSlide(); icon.classList.replace('fa-pause', 'fa-play'); }
        else { startSlide(); icon.classList.replace('fa-play', 'fa-pause'); }
    });

    // 2. 내비게이션(카테고리 메가메뉴) 데이터 로드 및 렌더링
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
        if(!subCats || subCats.length === 0) { if(depth3Container) depth3Container.innerHTML = ''; return; }
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
            <div class="promo-grid">${promotions.map(item => `<a href="#" class="promo-item"><img src="${item.imageUrl}" alt="${item.name}"><p>${item.name}</p></a>`).join('')}</div>
            <div class="luxury-beauty"><h3>럭셔리 뷰티</h3><div class="brand-circles">${luxuryBeauty.map((brand, idx) => `<div class="brand-item"><a href="#"><img src="${brand.imageUrl}" class="circle ${idx === 0 ? 'bg-black' : ''}" alt="${brand.name}"></a><p class="brand-name">${brand.name}</p></div>`).join('')}</div></div>
            <div class="shilla-only"><h3>신라Only <i class="fa-solid fa-chevron-right"></i></h3><div class="tag-grid">${shillaOnly.map(tag => `<a href="#" class="tag">${tag}</a>`).join('')}</div></div>
        `;
    }

    // 3. 브랜드 메뉴 데이터 로드 및 렌더링
    let brandData = null;
    let currentSort = 'kor'; 
    const brandListContainer = document.querySelector('.brand-list');
    const brandIndexContainer = document.querySelector('.brand-index-nav');
    const brandSearchInput = document.querySelector('.brand-search input');
    const sortButtons = document.querySelectorAll('.sort-btn');

    if (brandListContainer) {
        fetch('brand.json').then(r => r.json()).then(data => { 
            brandData = data.brands; 
            renderBrands(); 
        });
    }

    function renderBrands(filter = '') {
        if (!brandData || !brandListContainer) return;
        brandListContainer.innerHTML = ''; brandIndexContainer.innerHTML = '';
        const allKeys = Object.keys(brandData);
        let targetKeys = (currentSort === 'kor') ? allKeys.filter(k => /[ㄱ-ㅎ가-힣]/.test(k) && k !== '기타').sort() : allKeys.filter(k => /[A-Z]/.test(k)).sort();
        if (allKeys.includes('기타')) targetKeys.push('기타');
        const choMap = { "가": "ㄱ", "나": "ㄴ", "다": "ㄷ", "라": "ㄹ", "마": "ㅁ", "바": "ㅂ", "사": "ㅅ", "아": "ㅇ", "자": "ㅈ", "차": "ㅊ", "카": "ㅋ", "타": "ㅌ", "파": "ㅍ", "하": "ㅎ", "기타": "기타" };
        
        targetKeys.forEach(key => {
            const brands = brandData[key].filter(b => b.toLowerCase().includes(filter.toLowerCase()));
            if (brands.length === 0) return;
            const indexBtn = document.createElement('button');
            indexBtn.textContent = choMap[key] || key;
            indexBtn.addEventListener('click', () => {
                const targetEl = document.getElementById(`brand-first-${key}`);
                if (targetEl) document.querySelector('.brand-list-scroll').scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
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

    if (sortButtons) { sortButtons.forEach(btn => { btn.addEventListener('click', () => { sortButtons.forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentSort = btn.dataset.sort; if (brandSearchInput) brandSearchInput.value = ''; renderBrands(); }); }); }
    if (brandSearchInput) { brandSearchInput.addEventListener('input', (e) => { renderBrands(e.target.value); }); }

    // 4. 메인 아이콘 슬라이더
    const iconsList = document.querySelector('.icons-list');
    if (iconsList) {
        fetch('main_icons.json').then(r => r.json()).then(data => {
            iconsList.innerHTML = data.main_icons.map(icon => `
                <li class="icon-item">
                    <div class="icon-img"><img src="${icon.file}" alt="${icon.title}"></div>
                    <span>${icon.title}</span>
                </li>
            `).join('');
        });
    }

    // 5. 4단 프로덕트 추천 상품 (모듈형 슬라이더)
    const moduleList = document.querySelector('.module-list');
    const btnModPrev = document.querySelector('#module-products .btn-prev');
    const btnModNext = document.querySelector('#module-products .btn-next');
    const exchangeRate = 1496.00;

    if (moduleList) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                // 전체 상품 랜덤 셔플 후 최대 10개로 제한
                const shuffledProducts = data.products.sort(() => 0.5 - Math.random());
                const products = shuffledProducts.slice(0, 10);
                
                moduleList.innerHTML = products.map(product => {
                    const discount = parseInt(product.price_discount);
                    const originalUsd = parseFloat(product.price_usd);
                    const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
                    const finalKrw = Math.floor(finalUsd * exchangeRate);

                    return `
                        <li class="module-item">
                            <div class="module-card">
                                <a href="index2.html" class="module-link">
                                    <div class="img-box">
                                        <img src="${product.img}" alt="${product.name}">
                                        <div class="img-overlay">
                                            <div class="overlay-btns">
                                                <button type="button" class="btn-wish"><i class="fa-regular fa-heart"></i></button>
                                                <button type="button" class="btn-view"><i class="fa-regular fa-credit-card"></i></button>
                                                <button type="button" class="btn-cart"><i class="fa-solid fa-cart-shopping"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="info-box">
                                        <p class="brand">${product.brand}</p>
                                        <p class="name">${product.name}</p>
                                        <div class="price-top">
                                            <span class="discount">${discount}%</span>
                                            <span class="original-price">$${originalUsd.toLocaleString()}</span>
                                        </div>
                                        <div class="price-bottom">
                                            <span class="final-usd">$${finalUsd.toLocaleString()}</span>
                                            <span class="final-krw">${finalKrw.toLocaleString()}원</span>
                                        </div>
                                    </div>
                                </a>
                                <div class="review-box">
                                    <div class="review-row">
                                        <span class="star"><i class="fa-solid fa-star"></i></span>
                                        <span class="score">${product.review_scour}</span>
                                        <span class="divider"></span>
                                        <span class="count">${product.review_count}건</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `;
                }).join('');
            });
    }

    let modScrollPos = 0;
    if (btnModNext) {
        btnModNext.addEventListener('click', () => {
            const maxScroll = moduleList.scrollWidth - 1280;
            modScrollPos = Math.min(modScrollPos + 325, maxScroll);
            moduleList.style.transform = `translateX(-${modScrollPos}px)`;
        });
    }
    if (btnModPrev) {
        btnModPrev.addEventListener('click', () => {
            modScrollPos = Math.max(modScrollPos - 325, 0);
            moduleList.style.transform = `translateX(-${modScrollPos}px)`;
        });
    }

    // 6. 5단 프로덕트 인기 카테고리 상품 (모듈형 슬라이더)
    const moduleList5 = document.querySelector('.module-list-5');
    const btnModPrev5 = document.querySelector('#module-products-5 .btn-prev');
    const btnModNext5 = document.querySelector('#module-products-5 .btn-next');
    let modScrollPos5 = 0;
    const modItemWidth5 = 260; // 카드(240) + 간격(20)

    if (moduleList5) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                // '싱글몰트위스키' 아이템 전체 필터링 후 랜덤 셔플
                const whiskyProducts = data.products.filter(p => p.item === "싱글몰트위스키");
                const shuffledWhisky = whiskyProducts.sort(() => 0.5 - Math.random());
                const products5 = shuffledWhisky;
                
                renderModuleProducts5(products5);
            });
    }

    function renderModuleProducts5(products) {
        if (!moduleList5) return;
        moduleList5.innerHTML = products.map(product => {
            const discount = parseInt(product.price_discount);
            const originalUsd = parseFloat(product.price_usd);
            const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
            const finalKrw = Math.floor(finalUsd * 1496.00);

            return `
                <li class="module-item-5">
                    <div class="module-card-5">
                        <a href="index2.html" class="module-link">
                            <div class="img-box">
                                <img src="${product.img}" alt="${product.name}">
                                <div class="img-overlay">
                                    <div class="overlay-btns">
                                        <button type="button" class="btn-wish"><i class="fa-regular fa-heart"></i></button>
                                        <button type="button" class="btn-view"><i class="fa-regular fa-credit-card"></i></button>
                                        <button type="button" class="btn-cart"><i class="fa-solid fa-cart-shopping"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="info-box">
                                <p class="brand">${product.brand}</p>
                                <p class="name">${product.name}</p>
                                <div class="price-top">
                                    <span class="discount">${discount}%</span>
                                    <span class="final-usd">$${finalUsd.toLocaleString()}</span>
                                </div>
                                <div class="price-bottom">
                                    <span class="final-krw">${finalKrw.toLocaleString()}원</span>
                                </div>
                                <div class="review-row">
                                    <i class="fa-solid fa-star star"></i>
                                    <span class="score">${product.review_score || '0.0'}</span>
                                    <div class="divider"></div>
                                    <span class="count">(${product.review_count || '0'})</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </li>
            `;
        }).join('');
    }

    if (btnModNext5) {
        btnModNext5.addEventListener('click', () => {
            const maxScroll5 = moduleList5.scrollWidth - 1280;
            modScrollPos5 = Math.min(modScrollPos5 + modItemWidth5, maxScroll5);
            moduleList5.style.transform = `translateX(-${modScrollPos5}px)`;
        });
    }
    if (btnModPrev5) {
        btnModPrev5.addEventListener('click', () => {
            modScrollPos5 = Math.max(modScrollPos5 - modItemWidth5, 0);
            moduleList5.style.transform = `translateX(-${modScrollPos5}px)`;
        });
    }
});