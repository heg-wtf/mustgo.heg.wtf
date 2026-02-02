/**
 * MustGo - Google AdSense
 * AdSense 광고 초기화 및 관리
 */

(function() {
  'use strict';

  // AdSense 설정 (실제 값으로 교체 필요)
  var ADSENSE_CONFIG = {
    clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // 실제 클라이언트 ID로 교체
    slots: {
      placeDetail: 'XXXXXXXXXX' // 장소 상세 페이지 광고 단위 ID
    }
  };

  /**
   * AdSense 스크립트 로드
   */
  function loadAdSenseScript() {
    // 이미 로드되었는지 확인
    if (window.adsbygoogle) {
      return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CONFIG.clientId;
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = resolve;
      script.onerror = function() {
        console.warn('[AdSense] Failed to load AdSense script');
        reject(new Error('AdSense script load failed'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 광고 단위 초기화
   */
  function initAdUnit(container) {
    if (!container) return;

    // 이미 초기화되었는지 확인
    if (container.dataset.adInitialized === 'true') {
      return;
    }

    // AdSense 광고 요소 생성
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADSENSE_CONFIG.clientId);
    ins.setAttribute('data-ad-slot', ADSENSE_CONFIG.slots.placeDetail);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    // 플레이스홀더 제거하고 광고 삽입
    var placeholder = container.querySelector('.adsense-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    container.appendChild(ins);

    // 광고 푸시
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      container.dataset.adInitialized = 'true';
    } catch (error) {
      console.warn('[AdSense] Failed to push ad:', error);
    }
  }

  /**
   * 모든 광고 컨테이너 초기화
   */
  function initAllAds() {
    var containers = document.querySelectorAll('.adsense-container');
    containers.forEach(initAdUnit);
  }

  /**
   * 광고 차단기 감지
   */
  function detectAdBlocker() {
    return new Promise(function(resolve) {
      var testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(testAd);

      setTimeout(function() {
        var isBlocked = testAd.offsetHeight === 0;
        testAd.remove();
        resolve(isBlocked);
      }, 100);
    });
  }

  /**
   * 광고 로드 실패 시 대체 콘텐츠 표시
   */
  function showFallback(container) {
    if (!container) return;

    container.innerHTML = '';
    var fallback = document.createElement('div');
    fallback.className = 'adsense-fallback';
    fallback.style.cssText = 'padding: 20px; text-align: center; color: #868E96; font-size: 12px;';
    fallback.textContent = '광고를 불러올 수 없습니다.';
    container.appendChild(fallback);
  }

  /**
   * 초기화
   */
  function init() {
    // AdSense 클라이언트 ID가 설정되지 않았으면 스킵
    if (ADSENSE_CONFIG.clientId === 'ca-pub-XXXXXXXXXXXXXXXX') {
      console.log('[AdSense] Client ID not configured. Ads disabled.');
      return;
    }

    // 광고 차단기 감지
    detectAdBlocker().then(function(isBlocked) {
      if (isBlocked) {
        console.log('[AdSense] Ad blocker detected');
        // 광고 차단 시 대체 콘텐츠 또는 조용히 처리
        return;
      }

      // AdSense 스크립트 로드 후 광고 초기화
      loadAdSenseScript()
        .then(initAllAds)
        .catch(function(error) {
          console.warn('[AdSense] Initialization failed:', error);
          // 실패 시 모든 광고 컨테이너에 폴백 표시
          document.querySelectorAll('.adsense-container').forEach(showFallback);
        });
    });
  }

  // 전역 함수로 노출
  window.MustGoAds = {
    init: init,
    initAdUnit: initAdUnit,
    detectAdBlocker: detectAdBlocker
  };

  // DOM Ready 시 초기화
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
