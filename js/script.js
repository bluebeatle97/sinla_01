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
                const productsWithIdx = data.products.map((p, i) => ({...p, originalIdx: i}));
                const shuffledProducts = productsWithIdx.sort(() => 0.5 - Math.random());
                const products = shuffledProducts.slice(0, 10);
                
                moduleList.innerHTML = products.map(product => {
                    const discount = parseInt(product.price_discount);
                    const originalUsd = parseFloat(product.price_usd);
                    const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
                    const finalKrw = Math.floor(finalUsd * exchangeRate);

                    return `
                        <li class="module-item">
                            <div class="module-card">
                                <a href="index2.html?idx=${product.originalIdx}" class="module-link">
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

    // 6. 5단 프로덕트 섹션 설정 함수
    function setupModule5(sectionId, filterFn, customSortFn = null) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const list = section.querySelector('.module-list-5');
        const btnPrev = section.querySelector('.btn-prev');
        const btnNext = section.querySelector('.btn-next');
        let scrollPos = 0;
        const itemWidth = 260;

        fetch('products.json')
            .then(r => r.json())
            .then(data => {
                const productsWithIdx = data.products.map((p, i) => ({...p, originalIdx: i}));
                let filtered = productsWithIdx.filter(filterFn);
                if (customSortFn) {
                    filtered = customSortFn(filtered);
                } else {
                    filtered = filtered.sort(() => 0.5 - Math.random());
                }
                renderModuleProducts5(list, filtered);
            });

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const max = list.scrollWidth - 1280;
                scrollPos = Math.min(scrollPos + itemWidth, Math.max(0, max));
                list.style.transform = `translateX(-${scrollPos}px)`;
            });
        }
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                scrollPos = Math.max(scrollPos - itemWidth, 0);
                list.style.transform = `translateX(-${scrollPos}px)`;
            });
        }
    }

    function renderModuleProducts5(container, products) {
        container.innerHTML = products.map(product => {
            const discount = parseInt(product.price_discount);
            const originalUsd = parseFloat(product.price_usd);
            const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
            const finalKrw = Math.floor(finalUsd * 1496.00);

            return `
                <li class="module-item-5">
                    <div class="module-card-5">
                        <a href="index2.html?idx=${product.originalIdx}" class="module-link">
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
                                    <span class="score">${product.review_scour || '0.0'}</span>
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

    // 5단 슬라이더 초기화
    setupModule5('module-products-5', p => p.item === "싱글몰트위스키");
    setupModule5('module-products-5-1', p => ['스킨케어', '메이크업', '향수/바디/헤어'].includes(p.category));
    setupModule5('module-products-5-2', p => ['가방/신발/잡화', '시계/쥬얼리', '의류/아이웨어'].includes(p.category));
    setupModule5('module-products-5-3', p => p.category === "디지털/리빙");
    setupModule5('module-products-5-4', p => p.category === "식품");
    
    // 추가 섹션 5: 리뷰 많은 순 (내림차순 정렬)
    setupModule5('module-products-5-5', () => true, (products) => {
        return products.sort((a, b) => parseInt(b.review_count || 0) - parseInt(a.review_count || 0)).slice(0, 15);
    });

    // 추가 섹션 6: 립 & 치크 (서브 카테고리 필터링)
    setupModule5('module-products-5-6', p => p.sub_category === "립&치크");

    // 7. 브랜드 행사 슬라이더
    const eventList = document.querySelector('.brand-event-list');
    const btnEventPrev = document.querySelector('#mid-banner .btn-prev');
    const btnEventNext = document.querySelector('#mid-banner .btn-next');
    let eventScrollPos = 0;
    const eventItemWidth = 260; 

    if (eventList) {
        fetch('brand_event.json')
            .then(response => response.json())
            .then(data => {
                eventList.innerHTML = data.brand_event.map(event => `
                    <li class="brand-event-item">
                        <div class="brand-event-card">
                            <div class="img-box">
                                <img src="${event.file}" alt="${event.title}">
                                <div class="badge-gift">증정</div>
                            </div>
                            <div class="info-box">
                                <p class="title">${event.title}</p>
                                <p class="desc">${event.content}</p>
                            </div>
                        </div>
                    </li>
                `).join('');
            });
    }

    if (btnEventNext) {
        btnEventNext.addEventListener('click', () => {
            const maxScrollEvent = eventList.scrollWidth - 1280;
            eventScrollPos = Math.min(eventScrollPos + eventItemWidth, maxScrollEvent);
            eventList.style.transform = `translateX(-${eventScrollPos}px)`;
        });
    }
    if (btnEventPrev) {
        btnEventPrev.addEventListener('click', () => {
            eventScrollPos = Math.max(eventScrollPos - eventItemWidth, 0);
            eventList.style.transform = `translateX(-${eventScrollPos}px)`;
        });
    }

    // 8. 쇼핑 혜택 탭 및 슬라이더
    const benefitList = document.querySelector('.benefit-list');
    const tabButtons = document.querySelectorAll('.benefit-tab-box .btn-tab');
    let benefitData = [];
    let currentBenefitType = 'shopping';
    let benefitScrollPos = 0;
    let benefitInterval;

    if (benefitList) {
        fetch('shpping_benefit.json')
            .then(response => response.json())
            .then(data => {
                benefitData = data.brand_event;
                renderBenefits('shopping');
                startBenefitAutoSlide();
            });
    }

    function renderBenefits(type) {
        if (!benefitList) return;
        let filtered = (type === 'shopping') ? benefitData.slice(0, 2) : benefitData.slice(2, 8);
        benefitList.innerHTML = filtered.map(item => `
            <li class="benefit-item">
                <div class="benefit-card">
                    <div class="img-box"><img src="${item.file}" alt="${item.title}"></div>
                    <div class="info-box"><p class="title">${item.title}</p><p class="desc">${item.content}</p></div>
                </div>
            </li>
        `).join('');
        benefitScrollPos = 0;
        benefitList.style.transform = `translateX(0)`;
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBenefits(btn.dataset.type);
            clearInterval(benefitInterval);
            startBenefitAutoSlide();
        });
    });

    function startBenefitAutoSlide() {
        benefitInterval = setInterval(() => {
            const items = document.querySelectorAll('.benefit-item');
            if (items.length <= 1) return;
            const itemWidth = 433;
            const maxScroll = benefitList.scrollWidth - 1280;
            benefitScrollPos = (benefitScrollPos >= maxScroll) ? 0 : benefitScrollPos + itemWidth;
            benefitList.style.transform = `translateX(-${benefitScrollPos}px)`;
        }, 5000);
    }

    // 9. 오늘의 특가 & 핫세일 로직
    const specialTabBtns = document.querySelectorAll('.btn-special-tab');
    const specialProductList = document.querySelector('.special-product-list');
    const hotsaleProductList = document.querySelector('.hotsale-product-list');
    const categoryBtnWrapper = document.querySelector('.category-btn-wrapper');
    const specialBg = document.querySelector('.special-content-bg');
    let allProducts = [];

    const setupSlider = (containerSelector, prevSelector, nextSelector) => {
        const list = document.querySelector(containerSelector);
        const btnPrev = document.querySelector(prevSelector);
        const btnNext = document.querySelector(nextSelector);
        if (!list) return () => {};

        list.dataset.pos = 0;
        const updateTransform = () => { list.style.transform = `translateX(-${list.dataset.pos}px)`; };

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const max = list.scrollWidth - 1280;
                let currentPos = parseInt(list.dataset.pos);
                list.dataset.pos = Math.min(currentPos + 325, Math.max(0, max));
                updateTransform();
            });
        }
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                let currentPos = parseInt(list.dataset.pos);
                list.dataset.pos = Math.max(currentPos - 325, 0);
                updateTransform();
            });
        }
        return () => { list.dataset.pos = 0; updateTransform(); };
    };

    const resetSpecial = setupSlider('.special-product-list', '#tab-special .btn-prev', '#tab-special .btn-next');
    const resetHotSale = setupSlider('.hotsale-product-list', '#tab-hotsale .btn-prev', '#tab-hotsale .btn-next');

    specialTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            specialTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            
            if (btn.dataset.tab === 'special') {
                specialBg.style.minHeight = '672px';
                resetSpecial();
            } else {
                specialBg.style.minHeight = '740px';
                resetHotSale();
            }
        });
    });

    fetch('products.json').then(r => r.json()).then(data => {
        allProducts = data.products.map((p, i) => ({...p, originalIdx: i}));
        const sorted = [...allProducts].sort((a, b) => parseInt(b.price_discount) - parseInt(a.price_discount));
        renderProductList(specialProductList, sorted.slice(0, 12));
        initHotSale();
    });

    function initHotSale() {
        if (!categoryBtnWrapper) return;
        const categories = ['추천', ...new Set(allProducts.map(p => p.category))];
        categoryBtnWrapper.innerHTML = categories.map((cat, idx) => `<button type="button" class="btn-category ${idx === 0 ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join('');
        renderHotSale('추천');
        categoryBtnWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-category')) {
                document.querySelectorAll('.btn-category').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderHotSale(e.target.dataset.category);
            }
        });
    }

    function renderHotSale(category) {
        let filtered = (category === '추천') ? [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 12) : allProducts.filter(p => p.category === category);
        renderProductList(hotsaleProductList, filtered);
        if (resetHotSale) resetHotSale();
    }

    function renderProductList(container, products) {
        container.innerHTML = products.map(product => {
            const discount = parseInt(product.price_discount);
            const originalUsd = parseFloat(product.price_usd);
            const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
            const finalKrw = Math.floor(finalUsd * 1496.00);
            return `<li class="module-item"><div class="module-card"><a href="index2.html?idx=${product.originalIdx}" class="module-link"><div class="img-box"><img src="${product.img}" alt="${product.name}"><div class="img-overlay"><div class="overlay-btns"><button type="button" class="btn-wish"><i class="fa-regular fa-heart"></i></button><button type="button" class="btn-view"><i class="fa-regular fa-credit-card"></i></button><button type="button" class="btn-cart"><i class="fa-solid fa-cart-shopping"></i></button></div></div></div><div class="info-box"><p class="brand">${product.brand}</p><p class="name">${product.name}</p><div class="price-top"><span class="discount">${discount}%</span><span class="original-price">$${originalUsd.toLocaleString()}</span></div><div class="price-bottom"><span class="final-usd">$${finalUsd.toLocaleString()}</span><span class="final-krw">${finalKrw.toLocaleString()}원</span></div></div></a></div></li>`;
        }).join('');
    }

    function startTimer() {
        const timerEl = document.querySelector('.countdown');
        if (!timerEl) return;
        setInterval(() => {
            const now = new Date();
            timerEl.textContent = `${String(23 - now.getHours()).padStart(2, '0')}:${String(59 - now.getMinutes()).padStart(2, '0')}:${String(59 - now.getSeconds()).padStart(2, '0')}`;
        }, 1000);
    }
    startTimer();

    // 10. 신라 Only 섹션 로직
    const shillaTabBtns = document.querySelectorAll('.btn-shilla-tab');
    const shillaProductList = document.querySelector('.shilla-product-list');
    const shillaBrandList = document.querySelector('.shilla-brand-list');
    let shillaBrandData = [];

    // 탭 전환
    shillaTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            shillaTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.shilla-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`shilla-tab-${btn.dataset.tab}`).classList.add('active');
            
            if (btn.dataset.tab === 'product') resetShillaProduct(); else resetShillaBrand();
        });
    });

    // 신라 Only 상품 데이터 로드 (이름에 [신라단독] 포함)
    fetch('products.json').then(r => r.json()).then(data => {
        const productsWithIdx = data.products.map((p, i) => ({...p, originalIdx: i}));
        const shillaOnlyProducts = productsWithIdx.filter(p => p.name.includes('[신라단독]'));
        renderShillaProducts(shillaOnlyProducts);
    });

    // 신라 Only 브랜드 데이터 로드
    fetch('shinlla_only_brand.json').then(r => r.json()).then(data => {
        shillaBrandData = data.shilla_only_brand;
        renderShillaBrands(shillaBrandData);
    });

    function renderShillaProducts(products) {
        if (!shillaProductList) return;
        shillaProductList.innerHTML = products.map(product => {
            const discount = parseInt(product.price_discount);
            const originalUsd = parseFloat(product.price_usd);
            const finalUsd = Math.floor(originalUsd * (1 - discount / 100));
            const finalKrw = Math.floor(finalUsd * 1496.00);
            return `
                <li class="shilla-product-item">
                    <div class="shilla-product-card">
                        <a href="index2.html?idx=${product.originalIdx}" class="module-link">
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
                    </div>
                </li>`;
        }).join('');
    }

    function renderShillaBrands(brands) {
        if (!shillaBrandList) return;
        shillaBrandList.innerHTML = brands.map(brand => `
            <li class="shilla-brand-item">
                <div class="shilla-brand-card">
                    <div class="img-box">
                        <img src="${brand.file}" alt="${brand.content}">
                    </div>
                    <div class="info-box">
                        <p class="title">${brand.title}</p>
                        <p class="desc">${brand.content}</p>
                    </div>
                </div>
            </li>`).join('');
    }

    // 신라 Only 슬라이더 설정
    const setupShillaSlider = (containerSelector, prevSelector, nextSelector, itemWidth) => {
        const list = document.querySelector(containerSelector);
        const btnPrev = document.querySelector(prevSelector);
        const btnNext = document.querySelector(nextSelector);
        if (!list) return () => {};

        list.dataset.pos = 0;
        const updateTransform = () => { list.style.transform = `translateX(-${list.dataset.pos}px)`; };

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const max = list.scrollWidth - 1280;
                let currentPos = parseInt(list.dataset.pos);
                list.dataset.pos = Math.min(currentPos + itemWidth, Math.max(0, max));
                updateTransform();
            });
        }
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                let currentPos = parseInt(list.dataset.pos);
                list.dataset.pos = Math.max(currentPos - itemWidth, 0);
                updateTransform();
            });
        }
        return () => { list.dataset.pos = 0; updateTransform(); };
    };

    const resetShillaProduct = setupShillaSlider('.shilla-product-list', '#shilla-tab-product .btn-prev', '#shilla-tab-product .btn-next', 325);
    const resetShillaBrand = setupShillaSlider('.shilla-brand-list', '#shilla-tab-brand .btn-prev', '#shilla-tab-brand .btn-next', 433);

    // 11. 확장형 검색창 및 인기검색어 로직
    const searchBox = document.querySelector('.search-box');
    const searchInput = searchBox.querySelector('input');
    const btnClearSearch = document.querySelector('.btn-clear-search');
    const btnCloseSearch = document.querySelector('.btn-close-search');
    const popularRankList = document.querySelector('.popular-rank-list');

    // 인기검색어 데이터 (임시)
    const popularSearches = [
        "젠틀몬스터", "탬버린즈", "조말론", "에스티로더", "롱샴",
        "구찌", "프라다", "디올", "입생로랑", "샤넬"
    ];

    function openSearch() {
        searchBox.classList.add('expanded');
        renderPopularSearches();
    }

    function closeSearch() {
        searchBox.classList.remove('expanded');
        searchInput.value = '';
    }

    function renderPopularSearches() {
        if (!popularRankList) return;
        popularRankList.innerHTML = popularSearches.map((text, idx) => `
            <li>
                <span class="rank-num">${idx + 1}</span>
                <span class="rank-text">${text}</span>
            </li>
        `).join('');
    }

    searchInput.addEventListener('focus', openSearch);
    
    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = '';
            searchInput.focus();
        });
    }

    if (btnCloseSearch) {
        btnCloseSearch.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSearch();
        });
    }

    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            closeSearch();
        }
    });

    // 12. 상품 상세 페이지 (index2.html) 데이터 동적 렌더링
    const productDetailSection = document.getElementById('product-detail');
    if (productDetailSection) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                // URL 파라미터에서 상품 인덱스(idx)를 가져옵니다. 없으면 기본값 0 (첫 번째 상품)
                const urlParams = new URLSearchParams(window.location.search);
                const idx = urlParams.get('idx') || 0;
                const product = data.products[idx];

                if (!product) return; // 상품이 없으면 종료

                const categoryPath = document.querySelector('.category-path');
                const productImg = document.querySelector('.product-image-box img');
                const brandName = document.querySelector('.info-inner .brand-name');
                const productTitle = document.querySelector('.info-inner .product-title');
                const discountRate = document.querySelector('.info-inner .discount-rate');
                const finalPrice = document.querySelector('.info-inner .final-price');
                const wonPrice = document.querySelector('.info-inner .won-price');
                const totalPrice = document.querySelector('.total-price-box .total-price');
                const reviewScore = document.querySelector('.info-inner .review-area .score');
                const reviewCount = document.querySelector('.info-inner .review-area .count');
                const originalPriceArea = document.querySelector('.info-inner .original-price-area');
                const originalUsdEl = document.querySelector('.info-inner .original-usd');
                const originalKrwEl = document.querySelector('.info-inner .original-krw');

                const exchangeRate = 1496.00; // 환율
                const discount = parseInt(product.price_discount);
                const originalUsd = parseFloat(product.price_usd);
                const originalKrw = Math.floor(originalUsd * exchangeRate);
                const calcFinalUsd = Math.floor(originalUsd * (1 - discount / 100));
                const calcFinalKrw = Math.floor(calcFinalUsd * exchangeRate);

                // 데이터 바인딩
                if (categoryPath) categoryPath.innerHTML = `홈 &gt; ${product.category} &gt; ${product.sub_category}`;
                if (productImg) {
                    productImg.src = product.img;
                    productImg.alt = product.name;
                }
                if (brandName) brandName.textContent = product.brand;
                if (productTitle) productTitle.textContent = product.name;
                
                if (reviewScore) reviewScore.textContent = product.review_scour || '0';
                if (reviewCount) reviewCount.textContent = `${product.review_count || '0'}건`;
                
                if (discount > 0) {
                    if (discountRate) {
                        discountRate.textContent = `${discount}%`;
                        discountRate.style.display = 'inline-block';
                    }
                    if (originalPriceArea) originalPriceArea.style.display = 'block';
                    if (originalUsdEl) originalUsdEl.textContent = `$${originalUsd.toLocaleString()}`;
                    if (originalKrwEl) originalKrwEl.textContent = `(${originalKrw.toLocaleString()}원)`;
                } else {
                    if (discountRate) discountRate.style.display = 'none';
                    if (originalPriceArea) originalPriceArea.style.display = 'none';
                }
                
                if (finalPrice) finalPrice.textContent = `$${calcFinalUsd.toLocaleString()}`;
                if (wonPrice) wonPrice.textContent = `(${calcFinalKrw.toLocaleString()}원)`;
                if (totalPrice) totalPrice.textContent = `$${calcFinalUsd.toLocaleString()}`;

                // 수량 증감에 따른 총 금액 계산 로직
                const btnMinus = document.querySelector('.btn-minus');
                const btnPlus = document.querySelector('.btn-plus');
                const qtyInput = document.querySelector('.qty-input');
                
                if (btnMinus && btnPlus && qtyInput && totalPrice) {
                    btnMinus.addEventListener('click', () => {
                        let qty = parseInt(qtyInput.value);
                        if (qty > 1) {
                            qtyInput.value = qty - 1;
                            totalPrice.textContent = `$${(calcFinalUsd * (qty - 1)).toLocaleString()}`;
                        }
                    });
                    btnPlus.addEventListener('click', () => {
                        let qty = parseInt(qtyInput.value);
                        qtyInput.value = qty + 1;
                        totalPrice.textContent = `$${(calcFinalUsd * (qty + 1)).toLocaleString()}`;
                    });
                }
            })
            .catch(error => console.error("상품 데이터를 불러오는 중 에러 발생:", error));
    }
});