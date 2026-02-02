# 기술적 유의사항

## JavaScript Bridge

### Flutter WebView 연동

Flutter 앱에서 WebView 설정 시 JavaScript Channel 등록 필요:

```dart
WebView(
  initialUrl: 'https://mustgo.heg.wtf/places/seoul-001?theme=dark&hideHeader=true',
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

## AdSense 설정

`adsense.js`에서 실제 값으로 교체 필요:

```javascript
var ADSENSE_CONFIG = {
  clientId: 'ca-pub-XXXXXXXXXXXXXXXX',  // 실제 클라이언트 ID
  slots: {
    placeDetail: 'XXXXXXXXXX'           // 실제 슬롯 ID
  }
};
```

## Schema.org 구조화 데이터

장소 페이지에 `LocalBusiness` 또는 `Restaurant` 타입 사용:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "장소명",
  "address": { ... },
  "geo": { "latitude": ..., "longitude": ... },
  "aggregateRating": { ... }
}
```

## 이미지 처리

- 외부 이미지 URL 사용 (Supabase Storage 또는 Unsplash)
- `loading="eager"` - 메인 이미지 (즉시 로드)
- `loading="lazy"` - 추가 이미지 (지연 로드)

## SEO

- 각 장소 페이지에 고유한 title, description 필수
- OG 태그 및 Twitter Card 메타 태그 포함
- sitemap.xml 수동 업데이트 필요 (새 페이지 추가 시)
