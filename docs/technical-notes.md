# 기술적 유의사항

## JavaScript Bridge

### Flutter WebView 연동

Flutter 앱에서 WebView 설정 시 JavaScript Channel 등록 필요:

```dart
WebView(
  initialUrl: 'https://mustgo.heg.wtf/places/${place.id}?type=MUSTGO-APP',
  javascriptMode: JavascriptMode.unrestricted,
  javascriptChannels: {
    JavascriptChannel(
      name: 'MustGoChannel',
      onMessageReceived: (message) {
        final data = jsonDecode(message.message);
        // action, data 처리
      },
    ),
  },
)
```

### 개발 모드

Bridge 채널이 없으면 `console.log`로 출력되어 브라우저에서 디버깅 가능.

## CSS 변수

주요 CSS 변수 (`style.css`):

| 변수 | 용도 |
|------|------|
| `--color-primary` | 브랜드 색상 (#FF6B35) |
| `--bg-primary` | 배경색 |
| `--text-primary` | 텍스트 색상 |
| `--border-radius` | 기본 모서리 둥글기 (12px) |
| `--spacing-md` | 기본 간격 (16px) |

## 네이버 지도 SDK

### 설정

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=5sgg4izutv"></script>
```

**주의**: 파라미터 이름은 `ncpKeyId` (기존 `ncpClientId`에서 변경됨)

### 초기화

`main.js`의 `initNaverMap()`:
- 지도 컨테이너의 `data-lat`, `data-lng`, `data-name` 속성 사용
- 줌 레벨: 18
- 모든 컨트롤 비활성화

## 이미지 슬라이더

### main.js - initImageSlider()

- 이미지 1개: 네비게이션 숨김
- 터치 스와이프: 50px 이상 드래그 시 슬라이드 전환
- CSS Transform 사용 (`translateX`)

### 주요 요소

```
.place-slider           - 슬라이더 컨테이너
.place-slider-track     - 슬라이드 트랙 (transform 적용)
.place-slider-slide     - 개별 슬라이드
.place-slider-nav       - 이전/다음 버튼
.place-slider-counter   - 카운터 (1 / 3)
```

## Schema.org 구조화 데이터

장소 페이지에 `LocalBusiness` 타입 사용:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "장소명",
  "address": { ... },
  "geo": { "latitude": ..., "longitude": ... },
  "telephone": "..."
}
```

## 이미지 처리

- 외부 이미지 URL 사용 (네이버 pstatic.net)
- `loading="eager"` - 첫 번째 이미지 (즉시 로드)
- `loading="lazy"` - 나머지 이미지 (지연 로드)

## SEO

- 각 장소 페이지에 고유한 title, description
- OG 태그 및 Twitter Card 메타 태그 포함
- sitemap.xml 자동 업데이트 (HTML 생성 스크립트)
- Canonical URL 포함

## 외부 링크 처리

각 항목별 개별 표시:

| 필드 | 레이블 | 아이콘 | 표시 값 |
|------|--------|--------|---------|
| `homepage_url` | 홈페이지 | 지구본 | 도메인만 표시 |
| `instagram_url` | 인스타그램 | 인스타 | 사용자명 추출 |
| `reservation_url` | 캐치테이블 | 캘린더 | "예약하기" |

- 네이버 지도 링크는 외부링크에서 제외
- 데이터 없는 항목은 자동 숨김

## 길찾기 (네이버 지도 앱 URL Scheme)

길찾기 버튼은 `nmap://` URL Scheme을 사용하여 네이버 지도 앱으로 연동:

```
nmap://route/car?dlat={위도}&dlng={경도}&dname={장소명}&appname=mustgo.heg.wtf
```

- 출발지(`slat`, `slng`) 미지정 시 현재 위치 자동 사용
- 앱 미설치 시 앱스토어/플레이스토어로 이동
- 참고: [네이버 클라우드 URL Scheme 가이드](https://guide.ncloud-docs.com/docs/maps-url-scheme)

## 앱 모드 (type=MUSTGO-APP)

`main.js`의 `handleAppMode()`:

```javascript
if (params.type === 'MUSTGO-APP') {
  header.classList.add('hidden');    // 헤더 숨김
  footer.classList.add('hidden');    // 푸터 숨김
  placeActions.classList.add('hidden'); // 길찾기 숨김
}
```
