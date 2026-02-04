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
   */
  function handleAppMode(isAppMode) {
    if (!isAppMode) return;

    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');

    if (header) {
      header.classList.add('hidden');
    }
    if (footer) {
      footer.classList.add('hidden');
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
  }

  // 전역 함수로 노출 (앱에서 호출 가능)
  window.MustGo = {
    applyTheme: applyTheme,
    getUrlParams: getUrlParams
  };

  // DOM Ready 시 초기화
  ready(init);

})();
