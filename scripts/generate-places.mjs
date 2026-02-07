import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 프로젝트 루트 경로
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'places');

// Supabase 설정
const SUPABASE_URL = 'https://eujrvwcdabtopxipqfwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anJ2d2NkYWJ0b3B4aXBxZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDY3OTcsImV4cCI6MjA1NjgyMjc5N30.vqpY-Z7zdSmx087421z6bl_K-1ECaqf2LRnv5AL2wV4';

// 카테고리별 기본 이미지
const DEFAULT_IMAGES = {
  'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  'dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'spot': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
  'bar': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
  'culinary_class_wars': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'best_baker': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
};

// 슬라이더 HTML 생성
function generateSliderHTML(images, placeName) {
  if (!images || images.length === 0) {
    return '';
  }

  const slidesHtml = images.map((img, index) => `
        <div class="place-slider-slide">
          <img src="${img}" alt="${placeName} 이미지 ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
        </div>`).join('');

  return `
      <section class="place-hero place-slider">
        <div class="place-slider-track">
${slidesHtml}
        </div>
        <button class="place-slider-nav prev" aria-label="이전 이미지">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="place-slider-nav next" aria-label="다음 이미지">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div class="place-slider-counter">1 / ${images.length}</div>
      </section>`;
}

// 단일 이미지 HTML 생성
function generateSingleImageHTML(imageUrl, placeName) {
  return `
      <section class="place-hero">
        <img
          src="${imageUrl}"
          alt="${placeName} 대표 이미지"
          class="place-hero-image"
          loading="eager"
        >
      </section>`;
}

// HTML 템플릿 생성
function generateHTML(place) {
  const placeId = place.id;
  const regionName = place.mustgo_regions?.name || '서울';
  const purposeName = place.mustgo_purposes?.name || '맛집';
  const purposeSlug = place.mustgo_purposes?.slug || 'restaurant';

  // 이미지 목록 수집
  let allImages = [];
  if (place.thumbnail_url) {
    allImages.push(place.thumbnail_url);
  }
  if (place.images && place.images.length > 0) {
    place.images.forEach(img => {
      if (!allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  // 이미지가 없으면 기본 이미지 사용
  if (allImages.length === 0) {
    allImages.push(DEFAULT_IMAGES[purposeSlug] || DEFAULT_IMAGES['restaurant']);
  }

  // 슬라이더 또는 단일 이미지 HTML
  const heroHtml = allImages.length > 1
    ? generateSliderHTML(allImages, place.name)
    : generateSingleImageHTML(allImages[0], place.name);

  // OG 이미지 (첫 번째 이미지)
  const ogImage = allImages[0];

  // 태그 처리
  const tags = place.tags || [];
  const tagsHtml = tags.map(tag => `<span class="tag">#${tag}</span>`).join('\n        ');

  // 설명 처리
  const description = place.description || `${regionName}에 위치한 꼭 가야할 ${purposeName}입니다.`;
  const shortDescription = description.substring(0, 100) + (description.length > 100 ? '...' : '');

  // 전화번호 처리
  const phoneHtml = place.phone ? `
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">전화</div>
            <div class="place-detail-value">
              <a href="tel:${place.phone}">${place.phone}</a>
            </div>
          </div>
        </div>` : '';

  // 영업시간 처리
  const hoursHtml = place.business_hours ? `
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">영업시간</div>
            <div class="place-detail-value">${place.business_hours}</div>
          </div>
        </div>` : '';

  // 홈페이지 링크 처리
  const homepageHtml = place.homepage_url ? `
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">홈페이지</div>
            <div class="place-detail-value">
              <a href="${place.homepage_url}" target="_blank" rel="noopener noreferrer">${place.homepage_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
            </div>
          </div>
        </div>` : '';

  // 인스타그램 링크 처리
  const instagramHtml = place.instagram_url ? `
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">인스타그램</div>
            <div class="place-detail-value">
              <a href="${place.instagram_url}" target="_blank" rel="noopener noreferrer">${place.instagram_url.match(/instagram\.com\/([^/?]+)/)?.[1] || '바로가기'}</a>
            </div>
          </div>
        </div>` : '';

  // 캐치테이블 링크 처리
  const catchTableHtml = place.reservation_url ? `
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">캐치테이블</div>
            <div class="place-detail-value">
              <a href="${place.reservation_url}" target="_blank" rel="noopener noreferrer">예약하기</a>
            </div>
          </div>
        </div>` : '';

  // 네이버 지도 검색어
  const mapSearchQuery = encodeURIComponent(place.name);
  // 네이버 지도 앱 URL Scheme
  const naverMapAppUrl = `nmap://route/car?dlat=${place.latitude}&dlng=${place.longitude}&dname=${encodeURIComponent(place.name)}&appname=mustgo.heg.wtf`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <title>${place.name} - 꼭 가야할 곳</title>
  <meta name="description" content="${shortDescription}">
  <meta name="keywords" content="${regionName} ${purposeName}, ${place.name}, ${tags.join(', ')}">

  <!-- Open Graph -->
  <meta property="og:type" content="place">
  <meta property="og:title" content="${place.name} - 꼭 가야할 곳">
  <meta property="og:description" content="${shortDescription}">
  <meta property="og:url" content="https://mustgo.heg.wtf/places/${placeId}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="꼭 가야할 곳">
  <meta property="og:locale" content="ko_KR">
  <meta property="place:location:latitude" content="${place.latitude}">
  <meta property="place:location:longitude" content="${place.longitude}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${place.name} - 꼭 가야할 곳">
  <meta name="twitter:description" content="${shortDescription}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico">

  <!-- Styles -->
  <link rel="stylesheet" href="/assets/css/style.css">

  <!-- Naver Maps SDK -->
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=5sgg4izutv"></script>

  <!-- Canonical -->
  <link rel="canonical" href="https://mustgo.heg.wtf/places/${placeId}">

  <!-- Schema.org LocalBusiness -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "${place.name}",
    "description": "${shortDescription}",
    "image": "${ogImage}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "${place.address}",
      "addressRegion": "${regionName}",
      "addressCountry": "KR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${place.latitude},
      "longitude": ${place.longitude}
    }${place.phone ? `,
    "telephone": "${place.phone}"` : ''}
  }
  </script>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <button class="header-back" aria-label="뒤로 가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>뒤로</span>
          </button>
          <div class="header-actions">
            <button class="button-icon" data-action="share" data-place-id="${placeId}" aria-label="공유하기">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <!-- Hero Image Slider -->
${heroHtml}

      <!-- Place Info -->
      <section class="place-info">
        <h1 class="place-name">${place.name}</h1>
        <div class="place-meta">
          <span class="place-category">${purposeName}</span>
          <span>${regionName}</span>
        </div>
        <p class="place-address">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${place.address}
        </p>
      </section>

      <!-- Description -->
      <section class="place-description">
        <h2 class="place-description-title">꼭 가야할 이유</h2>
        <p class="place-description-text">
          ${description.replace(/\n/g, '<br>')}
        </p>
      </section>

      <!-- Tags -->
      ${tags.length > 0 ? `<section class="place-tags">
        ${tagsHtml}
      </section>` : ''}

      <!-- Map -->
      <section class="place-map">
        <div class="place-map-container" id="map" data-lat="${place.latitude}" data-lng="${place.longitude}" data-name="${place.name}"></div>
        <a href="https://map.naver.com/v5/search/${mapSearchQuery}" target="_blank" rel="noopener noreferrer" class="place-map-link">
          네이버 지도에서 크게 보기
        </a>
      </section>

      <!-- Details -->
      <section class="place-details">
${hoursHtml}
${phoneHtml}
        <div class="place-detail-item">
          <svg class="place-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div class="place-detail-content">
            <div class="place-detail-label">주소</div>
            <div class="place-detail-value">${place.address}</div>
          </div>
        </div>
${homepageHtml}
${instagramHtml}
${catchTableHtml}
      </section>

      <!-- Actions -->
      <section class="place-actions">
        <a href="${naverMapAppUrl}" class="button button-primary button-block">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3,11 22,2 13,21 11,13 3,11"/>
          </svg>
          길찾기
        </a>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p class="footer-copyright">&copy; 2026 HEG</p>
        </div>
      </div>
    </footer>
  </div>

  <!-- Scripts -->
  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/bridge.js"></script>
</body>
</html>
`;
}

// published 상태가 아닌 기존 HTML 파일 정리
function removeUnpublishedFiles(publishedIds) {
  const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));
  let removed = 0;

  for (const file of existingFiles) {
    const id = file.replace('.html', '');
    if (!publishedIds.has(id)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`Removed ${removed} unpublished place files`);
  }
}

async function main() {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };

  // status=published 인 장소만 가져오기
  console.log('Fetching published places from Supabase...');
  const placesResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/mustgo_places?select=*,mustgo_regions(name,slug),mustgo_purposes(name,slug)&status=eq.published&order=created_at`,
    { headers }
  );
  const places = await placesResponse.json();

  console.log(`Found ${places.length} published places`);

  if (places.length === 0) {
    console.error('No published places found. Aborting.');
    process.exit(1);
  }

  // places 디렉토리 확인
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // HTML 파일 생성
  let generated = 0;
  const publishedIds = new Set();

  for (const place of places) {
    const filename = `${place.id}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const html = generateHTML(place);
    fs.writeFileSync(filepath, html, 'utf8');
    publishedIds.add(place.id);

    generated++;
    if (generated % 50 === 0) {
      console.log(`Generated ${generated} files...`);
    }
  }

  console.log(`\nGenerated ${generated} HTML files in ${OUTPUT_DIR}`);

  // unpublished 파일 정리
  removeUnpublishedFiles(publishedIds);

  // sitemap.xml 업데이트
  const TODAY = new Date().toISOString().split('T')[0];
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mustgo.heg.wtf/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mustgo.heg.wtf/privacy.html</loc>
    <lastmod>2026-02-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://mustgo.heg.wtf/terms.html</loc>
    <lastmod>2026-02-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  for (const id of publishedIds) {
    sitemapXml += `  <url>
    <loc>https://mustgo.heg.wtf/places/${id}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  sitemapXml += `</urlset>
`;

  fs.writeFileSync(path.join(PROJECT_ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Sitemap updated with ${publishedIds.size} places`);

  console.log('\nDone!');
}

main().catch(console.error);
