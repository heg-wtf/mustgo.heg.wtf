/**
 * MustGo - App-WebView Bridge
 * Flutter 앱과 WebView 간 통신을 위한 브릿지
 */

(function() {
  'use strict';

  /**
   * MustGoBridge 객체
   * Flutter WebView의 JavaScript Channel과 통신
   */
  window.MustGoBridge = {
    /**
     * 북마크 추가/제거 요청
     * @param {string} placeId - 장소 ID
     */
    bookmark: function(placeId) {
      this._postMessage('bookmark', { placeId: placeId });
    },

    /**
     * 공유하기 요청
     * @param {string} placeId - 장소 ID
     * @param {string} url - 공유할 URL
     * @param {string} title - 공유 제목
     */
    share: function(placeId, url, title) {
      this._postMessage('share', {
        placeId: placeId,
        url: url || window.location.href,
        title: title || document.title
      });
    },

    /**
     * 뒤로가기 요청
     */
    back: function() {
      this._postMessage('back', {});
    },

    /**
     * 외부 링크 열기 요청
     * @param {string} url - 열 URL
     */
    openExternal: function(url) {
      this._postMessage('openExternal', { url: url });
    },

    /**
     * 길찾기 요청
     * @param {number} latitude - 위도
     * @param {number} longitude - 경도
     * @param {string} name - 장소명
     */
    navigate: function(latitude, longitude, name) {
      this._postMessage('navigate', {
        latitude: latitude,
        longitude: longitude,
        name: name
      });
    },

    /**
     * 전화걸기 요청
     * @param {string} phone - 전화번호
     */
    call: function(phone) {
      this._postMessage('call', { phone: phone });
    },

    /**
     * 페이지 로드 완료 알림
     * @param {string} placeId - 장소 ID (선택)
     */
    pageLoaded: function(placeId) {
      this._postMessage('pageLoaded', {
        placeId: placeId,
        url: window.location.href,
        title: document.title
      });
    },

    /**
     * 에러 발생 알림
     * @param {string} code - 에러 코드
     * @param {string} message - 에러 메시지
     */
    error: function(code, message) {
      this._postMessage('error', {
        code: code,
        message: message
      });
    },

    /**
     * 메시지 전송 (내부 함수)
     * Flutter WebView의 JavaScript Channel로 메시지 전송
     * @param {string} action - 액션 타입
     * @param {object} data - 전송할 데이터
     * @private
     */
    _postMessage: function(action, data) {
      var message = JSON.stringify({
        action: action,
        data: data,
        timestamp: Date.now()
      });

      // Flutter WebView JavaScript Channel
      if (window.MustGoChannel && typeof window.MustGoChannel.postMessage === 'function') {
        window.MustGoChannel.postMessage(message);
        return;
      }

      // Android WebView (JavaScriptInterface)
      if (window.MustGoAndroid && typeof window.MustGoAndroid.postMessage === 'function') {
        window.MustGoAndroid.postMessage(message);
        return;
      }

      // iOS WKWebView
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MustGo) {
        window.webkit.messageHandlers.MustGo.postMessage(message);
        return;
      }

      // 개발 모드: 콘솔에 로그
      console.log('[MustGoBridge]', action, data);
    }
  };

  /**
   * 앱에서 호출할 수 있는 함수들
   */

  /**
   * 테마 변경 (앱 → WebView)
   * @param {string} theme - 'dark' | 'light' | 'system'
   */
  window.applyTheme = function(theme) {
    if (window.MustGo && typeof window.MustGo.applyTheme === 'function') {
      window.MustGo.applyTheme(theme);
    } else if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  /**
   * 북마크 상태 업데이트 (앱 → WebView)
   * @param {string} placeId - 장소 ID
   * @param {boolean} isBookmarked - 북마크 여부
   */
  window.updateBookmarkState = function(placeId, isBookmarked) {
    var button = document.querySelector('[data-action="bookmark"][data-place-id="' + placeId + '"]');
    if (button) {
      if (isBookmarked) {
        button.classList.add('bookmarked');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.classList.remove('bookmarked');
        button.setAttribute('aria-pressed', 'false');
      }
    }
  };

  /**
   * 사용자 로그인 상태 업데이트 (앱 → WebView)
   * @param {boolean} isLoggedIn - 로그인 여부
   * @param {object} user - 사용자 정보 (선택)
   */
  window.updateLoginState = function(isLoggedIn, user) {
    document.body.setAttribute('data-logged-in', isLoggedIn ? 'true' : 'false');

    // 북마크 버튼 등 로그인 필요 요소 상태 업데이트
    var loginRequiredElements = document.querySelectorAll('[data-requires-login]');
    loginRequiredElements.forEach(function(element) {
      if (isLoggedIn) {
        element.classList.remove('disabled');
        element.removeAttribute('disabled');
      } else {
        element.classList.add('disabled');
        element.setAttribute('disabled', 'true');
      }
    });
  };

  /**
   * 스크롤 위치 복원 (앱 → WebView)
   * @param {number} position - 스크롤 Y 위치
   */
  window.restoreScrollPosition = function(position) {
    window.scrollTo(0, position);
  };

  /**
   * 현재 스크롤 위치 반환 (앱에서 호출)
   * @returns {number} 현재 스크롤 Y 위치
   */
  window.getScrollPosition = function() {
    return window.scrollY || window.pageYOffset || 0;
  };

  /**
   * 페이지 로드 완료 시 앱에 알림
   */
  document.addEventListener('DOMContentLoaded', function() {
    // place 페이지인 경우 placeId 추출
    var placeId = null;
    var pathMatch = window.location.pathname.match(/\/places\/([^\/]+)/);
    if (pathMatch) {
      placeId = pathMatch[1].replace('.html', '');
    }

    window.MustGoBridge.pageLoaded(placeId);
  });

  /**
   * 에러 핸들링
   */
  window.addEventListener('error', function(event) {
    window.MustGoBridge.error('JS_ERROR', event.message);
  });

})();
