window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    // 스크롤이 조금만 내려가도(예: 50px) 변화가 시작되도록 설정
    if (window.scrollY > 50) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
});

// 메인 슬라이더 기능
document.addEventListener('DOMContentLoaded', function() {
    // 플랫폼 메뉴 관련
    const btnPlatform = document.querySelector('.btn-platfrom');
    const platformMenu = document.querySelector('.platform-menu');

    btnPlatform.addEventListener('click', function(e) {
        e.stopPropagation(); // 부모로의 클릭 이벤트 전파 방지
        platformMenu.classList.toggle('active');
    });

    // 외부 클릭 시 메뉴 닫기
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
    
    // 메가 메뉴 동적 렌더링 관련
    let navData = null;
    const depth1Container = document.querySelector('.depth1 ul');
    const depth2Container = document.querySelector('.depth2 ul');
    const depth3Container = document.querySelector('.depth3 ul');

    // 1. JSON 데이터 가져오기
    fetch('navigation.json')
        .then(response => response.json())
        .then(data => {
            navData = data.navigation;
            renderDepth1();
        });

    // 2. 1열(대분류) 렌더링
    function renderDepth1() {
        depth1Container.innerHTML = '';
        navData.forEach((cat, index) => {
            const li = document.createElement('li');
            if(index === 0) li.classList.add('active'); // 초기 첫번째 활성화
            li.innerHTML = `<a href="#"><span>${cat.name}</span> <i class="fa-solid fa-chevron-right"></i></a>`;
            
            li.addEventListener('mouseenter', () => {
                document.querySelectorAll('.depth1 li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderDepth2(cat.subCategories);
            });
            depth1Container.appendChild(li);
        });
        // 초기 로드 시 첫 번째 카테고리의 2열 렌더링
        if(navData.length > 0) renderDepth2(navData[0].subCategories);
    }

    // 3. 2열(중분류) 렌더링
    function renderDepth2(subCats) {
        depth2Container.innerHTML = '';
        if(!subCats || subCats.length === 0) {
            depth3Container.innerHTML = '';
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
        // 초기 로드 또는 대분류 변경 시 첫 번째 중분류의 3열 렌더링
        renderDepth3(subCats[0].items);
    }

    // 4. 3열(소분류) 렌더링
    function renderDepth3(items) {
        depth3Container.innerHTML = '';
        if(!items || items.length === 0) return;

        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#">${item}</a>`;
            depth3Container.appendChild(li);
        });
    }
    
    let currentSlide = 0;
    let slideInterval;
    let isPaused = false;

    // 초기 설정
    totalText.textContent = 20; // 요청하신 대로 총 개수 20으로 고정

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        currentText.textContent = currentSlide + 1;
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

    btnNext.addEventListener('click', () => {
        nextSlide();
        if (!isPaused) { stopSlide(); startSlide(); }
    });

    btnPrev.addEventListener('click', () => {
        prevSlide();
        if (!isPaused) { stopSlide(); startSlide(); }
    });

    btnPause.addEventListener('click', () => {
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
