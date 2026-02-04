# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MustGo (꼭 가야할 곳) 웹 - Flutter 앱의 WebView에서 장소 상세 페이지를 서빙하는 정적 웹사이트입니다.

- **호스팅**: GitHub Pages
- **도메인**: mustgo.heg.wtf
- **기술 스택**: 순수 HTML/CSS/JavaScript (프레임워크 없음)
- **지도**: Naver Maps SDK (ncpKeyId: 5sgg4izutv)

## Development Commands

```bash
# 로컬 서버 실행
npx serve .

# 페이지 접근
# http://localhost:3000/
# http://localhost:3000/places/{UUID}
# http://localhost:3000/places/{UUID}?type=MUSTGO-APP
```

## Architecture

### 디렉토리 구조

```
/
├── places/              # 장소 상세 페이지 (256개, UUID 기반)
│   └── {UUID}.html      # Supabase place ID 기반 파일명
├── assets/
│   ├── css/style.css    # 공통 스타일 (다크모드, 슬라이더 포함)
│   └── js/
│       ├── main.js      # 공통 기능 (슬라이더, 지도 초기화 등)
│       └── bridge.js    # 앱-WebView 통신 인터페이스
├── index.html           # 랜딩 페이지
├── privacy.html         # 개인정보처리방침
├── terms.html           # 이용약관
└── CNAME                # 커스텀 도메인 설정
```

### 앱-WebView 통신

Flutter 앱과 WebView 간 통신은 `bridge.js`의 `MustGoBridge` 객체를 통해 이루어집니다:

- **앱 → WebView**: URL 파라미터 (`?type=MUSTGO-APP`) 또는 `window.applyTheme()` 호출
- **WebView → 앱**: `MustGoBridge.bookmark()`, `MustGoBridge.share()`, `MustGoBridge.back()` 등

### 앱 모드 (type=MUSTGO-APP)

앱에서 WebView로 접근 시 `?type=MUSTGO-APP` 파라미터로 다음을 숨김:
- 헤더 (뒤로, 공유 버튼)
- 푸터 (홈, 이용약관, 개인정보처리방침)
- 길찾기 버튼

### 다크모드

URL 파라미터가 시스템 설정보다 우선:
1. `?theme=dark` 또는 `?theme=light`
2. `prefers-color-scheme` 미디어 쿼리

### 이미지 슬라이더

`main.js`의 `initImageSlider()` 함수가 터치 스와이프와 버튼 네비게이션 지원:
- 이미지 2개 이상 시 자동 활성화
- 터치 스와이프 지원 (50px 이상 드래그)
- 이전/다음 버튼, 카운터 표시

### 네이버 지도

각 장소 페이지에 네이버 지도 SDK 포함:
- 줌 레벨: 18
- 마커 자동 표시
- "네이버 지도에서 크게 보기" 링크 제공

### 장소 페이지 생성

장소 상세 페이지는 Supabase DB 데이터를 기반으로 Claude Agent가 HTML 파일을 생성하여 커밋합니다.
- 파일명: `places/{UUID}.html` (Supabase place ID 기반)
- 총 256개 장소 페이지

### 외부 링크 처리

각 항목별 개별 표시 (데이터 없으면 숨김):
- **홈페이지**: `homepage_url` 필드
- **인스타그램**: `instagram_url` 필드 (사용자명 추출 표시)
- **캐치테이블**: `reservation_url` 필드
- 네이버 지도 링크는 외부링크에서 제외 (지도 섹션에서만 표시)

## Conventions

조직 전체 규칙은 `/Users/ash84/workspace/heg/.claude/CLAUDE.md` 참조:
- Gitmoji 커밋 메시지 사용 (예: `✨ feat: 새 장소 페이지 추가`)
- 약어 사용 지양 (full text 사용)
- 특별한 지시 없으면 main 브랜치에 직접 커밋
