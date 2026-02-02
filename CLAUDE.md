# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MustGo (꼭 가야할 곳) 웹 - Flutter 앱의 WebView에서 장소 상세 페이지를 서빙하는 정적 웹사이트입니다.

- **호스팅**: GitHub Pages
- **도메인**: mustgo.heg.wtf
- **기술 스택**: 순수 HTML/CSS/JavaScript (프레임워크 없음)

## Development Commands

```bash
# 로컬 서버 실행
npx serve .

# 페이지 접근
# http://localhost:3000/
# http://localhost:3000/places/seoul-001.html
# http://localhost:3000/places/seoul-001.html?theme=dark&hideHeader=true
```

## Architecture

### 디렉토리 구조

```
/
├── places/              # 장소 상세 페이지 (앱 WebView에서 로드)
│   └── {region}-{seq}.html   # 예: seoul-001.html, jeju-001.html
├── assets/
│   ├── css/style.css    # 공통 스타일 (다크모드 포함)
│   └── js/
│       ├── main.js      # 공통 기능
│       ├── bridge.js    # 앱-WebView 통신 인터페이스
│       └── adsense.js   # AdSense 초기화
├── index.html           # 랜딩 페이지
├── privacy.html         # 개인정보처리방침
├── terms.html           # 이용약관
└── CNAME                # 커스텀 도메인 설정
```

### 앱-WebView 통신

Flutter 앱과 WebView 간 통신은 `bridge.js`의 `MustGoBridge` 객체를 통해 이루어집니다:

- **앱 → WebView**: URL 파라미터 (`?theme=dark&hideHeader=true`) 또는 `window.applyTheme()` 호출
- **WebView → 앱**: `MustGoBridge.bookmark()`, `MustGoBridge.share()`, `MustGoBridge.back()` 등

### 다크모드

URL 파라미터가 시스템 설정보다 우선:
1. `?theme=dark` 또는 `?theme=light`
2. `prefers-color-scheme` 미디어 쿼리

### 장소 페이지 생성

장소 상세 페이지는 Supabase DB 데이터를 기반으로 Claude Agent가 HTML 파일을 생성하여 커밋합니다. 파일명 규칙: `places/{region_slug}-{3자리 시퀀스}.html`

## Conventions

조직 전체 규칙은 `/Users/ash84/workspace/heg/.claude/CLAUDE.md` 참조:
- Gitmoji 커밋 메시지 사용 (예: `✨ feat: 새 장소 페이지 추가`)
- 약어 사용 지양 (full text 사용)
- 특별한 지시 없으면 main 브랜치에 직접 커밋
