/**
 * MustGo - Main JavaScript
 * 공통 기능 및 초기화
 */

(function() {
  'use strict';

  /**
   * DOM Ready
   */
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  /**
   * URL 파라미터 파싱
   */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      theme: params.get('theme'),
      hideHeader: params.get('hideHeader') === 'true',
      source: params.get('source'),
      type: params.get('type')
    };
  }

  /**
   * 테마 적용
   */
  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /**
   * 헤더 숨김 처리 (WebView에서 사용)
   */
  function handleHeaderVisibility(hide) {
    const header = document.querySelector('.header');
    if (header && hide) {
      header.classList.add('hidden');
    }
  }

  /**
   * 앱 모드 처리 (type=MUSTGO-APP)
   * - 헤더 숨김 (뒤로, 공유 버튼)
   * - 푸터 숨김 (홈, 이용약관, 개인정보처리방침)
   * - 길찾기 버튼 숨김
   */
  function handleAppMode(isAppMode) {
    if (!isAppMode) return;

    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    const placeActions = document.querySelector('.place-actions');

    if (header) {
      header.classList.add('hidden');
    }
    if (footer) {
      footer.classList.add('hidden');
    }
    if (placeActions) {
      placeActions.classList.add('hidden');
    }
  }

  /**
   * 외부 링크 처리
   */
  function handleExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
      if (!link.hostname.includes('mustgo.heg.wtf')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  /**
   * 뒤로가기 버튼 처리
   */
  function handleBackButton() {
    const backButton = document.querySelector('.header-back');
    if (backButton) {
      backButton.addEventListener('click', function(event) {
        event.preventDefault();

        // WebView Bridge가 있으면 사용
        if (window.MustGoBridge && typeof window.MustGoBridge.back === 'function') {
          window.MustGoBridge.back();
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      });
    }
  }

  /**
   * 공유 버튼 처리
   */
  function handleShareButton() {
    const shareButton = document.querySelector('[data-action="share"]');
    if (shareButton) {
      shareButton.addEventListener('click', function(event) {
        event.preventDefault();

        const placeId = shareButton.dataset.placeId;
        const url = window.location.href;
        const title = document.title;

        // WebView Bridge 사용
        if (window.MustGoBridge && typeof window.MustGoBridge.share === 'function') {
          window.MustGoBridge.share(placeId, url, title);
          return;
        }

        // Web Share API 사용
        if (navigator.share) {
          navigator.share({
            title: title,
            url: url
          }).catch(function(error) {
            console.log('Share failed:', error);
          });
          return;
        }

        // 클립보드 복사 폴백
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function() {
            alert('링크가 복사되었습니다.');
          }).catch(function() {
            prompt('링크를 복사하세요:', url);
          });
        } else {
          prompt('링크를 복사하세요:', url);
        }
      });
    }
  }

  /**
   * 북마크 버튼 처리
   */
  function handleBookmarkButton() {
    const bookmarkButton = document.querySelector('[data-action="bookmark"]');
    if (bookmarkButton) {
      bookmarkButton.addEventListener('click', function(event) {
        event.preventDefault();

        const placeId = bookmarkButton.dataset.placeId;

        // WebView Bridge 사용
        if (window.MustGoBridge && typeof window.MustGoBridge.bookmark === 'function') {
          window.MustGoBridge.bookmark(placeId);
        } else {
          // 웹에서는 로그인 안내
          alert('앱에서 북마크 기능을 이용할 수 있습니다.');
        }
      });
    }
  }

  /**
   * 이미지 슬라이더 초기화
   */
  function initImageSlider() {
    const slider = document.querySelector('.place-slider');
    if (!slider) return;

    const track = slider.querySelector('.place-slider-track');
    const slides = slider.querySelectorAll('.place-slider-slide');
    const prevButton = slider.querySelector('.place-slider-nav.prev');
    const nextButton = slider.querySelector('.place-slider-nav.next');
    const counter = slider.querySelector('.place-slider-counter');
    const dotsContainer = slider.querySelector('.place-slider-dots');

    if (slides.length <= 1) {
      // 이미지가 1개면 네비게이션 숨김
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      if (counter) counter.style.display = 'none';
      if (dotsContainer) dotsContainer.style.display = 'none';
      return;
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlider() {
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      // 카운터 업데이트
      if (counter) {
        counter.textContent = (currentIndex + 1) + ' / ' + totalSlides;
      }

      // Dots 업데이트
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.place-slider-dot').forEach(function(dot, index) {
          dot.classList.toggle('active', index === currentIndex);
        });
      }

      // 버튼 상태 업데이트
      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex === totalSlides - 1;
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      updateSlider();
    }

    // 버튼 이벤트
    if (prevButton) {
      prevButton.addEventListener('click', function() {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function() {
        goToSlide(currentIndex + 1);
      });
    }

    // Dots 이벤트
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.place-slider-dot').forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          goToSlide(index);
        });
      });
    }

    // 터치 스와이프 지원
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', function(event) {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', function(event) {
      touchEndX = event.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    }, { passive: true });

    // 초기 상태
    updateSlider();
  }

  /**
   * 네이버 지도 초기화
   */
  function initNaverMap() {
    var mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    var lat = parseFloat(mapContainer.dataset.lat);
    var lng = parseFloat(mapContainer.dataset.lng);
    var name = mapContainer.dataset.name;

    if (isNaN(lat) || isNaN(lng)) return;

    // 네이버 지도 API 로드 확인
    if (typeof naver === 'undefined' || typeof naver.maps === 'undefined') {
      console.warn('Naver Maps SDK not loaded');
      return;
    }

    var position = new naver.maps.LatLng(lat, lng);

    var map = new naver.maps.Map(mapContainer, {
      center: position,
      zoom: 18,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false
    });

    // 마커 추가
    new naver.maps.Marker({
      position: position,
      map: map,
      title: name
    });
  }

  /**
   * 이미지 지연 로딩
   */
  function lazyLoadImages() {
    if ('loading' in HTMLImageElement.prototype) {
      // 브라우저 네이티브 지원
      document.querySelectorAll('img[data-src]').forEach(function(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      // Intersection Observer 폴백
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(function(img) {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * 초기화
   */
  function init() {
    const params = getUrlParams();

    // 테마 적용
    if (params.theme) {
      applyTheme(params.theme);
    }

    // 앱 모드 처리 (type=MUSTGO-APP)
    if (params.type === 'MUSTGO-APP') {
      handleAppMode(true);
    } else {
      // 기존 헤더 숨김 처리 (hideHeader 파라미터)
      handleHeaderVisibility(params.hideHeader);
    }

    // 이벤트 핸들러 설정
    handleExternalLinks();
    handleBackButton();
    handleShareButton();
    handleBookmarkButton();
    lazyLoadImages();
    initImageSlider();
    initNaverMap();
  }

  // 전역 함수로 노출 (앱에서 호출 가능)
  window.MustGo = {
    applyTheme: applyTheme,
    getUrlParams: getUrlParams
  };

  // DOM Ready 시 초기화
  ready(init);

})();
