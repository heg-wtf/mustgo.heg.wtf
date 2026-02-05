# 꼭 가야할 곳 (MustGo) - 웹

Flutter 앱의 WebView에서 장소 상세 페이지를 서빙하는 정적 웹사이트입니다.

## 기술 스택

- **호스팅**: GitHub Pages
- **도메인**: mustgo.heg.wtf
- **스타일**: 순수 CSS (CSS 변수 기반 다크모드)
- **스크립트**: Vanilla JavaScript
- **지도**: Naver Maps SDK

## 시작하기

### 로컬 개발

```bash
# 로컬 서버 실행
npx serve .

# 브라우저에서 접근
# http://localhost:3000/
# http://localhost:3000/places/{UUID}
```

### URL 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `theme` | `dark` / `light` | 테마 설정 (시스템 설정보다 우선) |
| `type` | `MUSTGO-APP` | 앱 모드 (헤더/푸터/길찾기 숨김) |

예시: `https://mustgo.heg.wtf/places/{UUID}?type=MUSTGO-APP`

## 프로젝트 구조

```
/
├── places/                 # 장소 상세 페이지 (256개)
│   └── {UUID}.html         # Supabase place ID 기반
├── assets/
│   ├── css/style.css       # 공통 스타일 (다크모드, 슬라이더)
│   └── js/
│       ├── main.js         # 공통 기능 (슬라이더, 지도 등)
│       └── bridge.js       # 앱-WebView 통신
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

Copyright © 2026 HEG. All rights reserved.
