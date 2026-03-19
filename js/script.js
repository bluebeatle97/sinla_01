window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btnPlatform = document.querySelector('.btn-platfrom');
    const platformMenu = document.querySelector('.platform-menu');

    btnPlatform.addEventListener('click', function(e) {
        e.stopPropagation();
        platformMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!platformMenu.contains(e.target) && e.target !== btnPlatform) {
            platformMenu.classList.remove('active');
        }
    });

    const slides = document.querySelectorAll('.slide');
    const currentText = document.querySelector('.slide-counter .current');
    const totalText = document.querySelector('.slide-counter .total');
    const btnPrev = document.querySelector('.btn-prev');
    const btnNext = document.querySelector('.btn-next');
    const btnPause = document.querySelector('.btn-pause');
    
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
        if(!depth1Container) return;
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
                        <a href="#">
                            <img src="${brand.imageUrl}" class="circle ${idx === 0 ? 'bg-black' : ''}" alt="${brand.name}">
                        </a>
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
    
    let currentSlide = 0;
    let slideInterval;
    let isPaused = false;

    totalText.textContent = 20;

    function showSlide(n) {
        if(slides.length === 0) return;
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
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
            slideInterval = setInterval(nextSlide, 5000);
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

    startSlide();
});