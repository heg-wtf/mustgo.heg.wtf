# 꼭 가야할 곳 (MustGo) - 웹

Flutter 앱의 WebView에서 장소 상세 페이지를 서빙하는 정적 웹사이트입니다.

## 기술 스택

- **호스팅**: GitHub Pages
- **도메인**: mustgo.heg.wtf
- **스타일**: 순수 CSS (CSS 변수 기반 다크모드)
- **스크립트**: Vanilla JavaScript
- **광고**: Google AdSense

## 시작하기

### 로컬 개발

```bash
# 로컬 서버 실행
npx serve .

# 브라우저에서 접근
# http://localhost:3000/
# http://localhost:3000/places/seoul-001.html
```

### URL 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `theme` | `dark` / `light` | 테마 설정 (시스템 설정보다 우선) |
| `hideHeader` | `true` | 헤더 숨김 (앱 WebView용) |

예시: `http://localhost:3000/places/seoul-001.html?theme=dark&hideHeader=true`

## 프로젝트 구조

```
/
├── places/                 # 장소 상세 페이지
│   └── {region}-{seq}.html # 예: seoul-001.html
├── assets/
│   ├── css/style.css       # 공통 스타일
│   └── js/
│       ├── main.js         # 공통 기능
│       ├── bridge.js       # 앱-WebView 통신
│       └── adsense.js      # AdSense
├── index.html              # 랜딩 페이지
├── privacy.html            # 개인정보처리방침
├── terms.html              # 이용약관
├── 404.html                # 에러 페이지
├── robots.txt
├── sitemap.xml
└── CNAME                   # 커스텀 도메인
```

## 배포

main 브랜치에 푸시하면 GitHub Pages에 자동 배포됩니다.

### DNS 설정 (Route53)

```
Name: mustgo
Type: CNAME
Value: heg-wtf.github.io
TTL: 300
```

## 관련 저장소

- **앱**: [github.com/heg-wtf/mustgo](https://github.com/heg-wtf/mustgo) (Flutter)

## 라이선스

Copyright © 2026 HEG (Hyper Engineering Group). All rights reserved.
