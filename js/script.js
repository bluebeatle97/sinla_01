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

            // 슬라이더 2열 내용(content) 복구
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
            const video = slide.querySelector('video');
            if (idx === (n + slides.length) % slides.length) {
                slide.classList.add('active');
                if (video) { video.currentTime = 0; video.play().catch(() => {}); }
            } else {
                slide.classList.remove('active');
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

    // 2. 메인 아이콘 슬라이더
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

    // 3. 4단 프로덕트 추천 상품 (모듈형 슬라이더)
    const moduleList = document.querySelector('.module-list');
    const btnModPrev = document.querySelector('#module-products .btn-prev');
    const btnModNext = document.querySelector('#module-products .btn-next');
    const exchangeRate = 1496.00;

    if (moduleList) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                const products = data.products.slice(0, 10);
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
});