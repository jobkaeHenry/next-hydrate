# @jobkaehenry/next-hydrate

> Universal hydration utilities for Next.js App Router + React Query v5.

## 🌐 Language / 언어 선택

<details open>
<summary><strong>English</strong></summary>

### Table of contents

1. [Why this library exists](#1-why-this-library-exists)
2. [Installation](#2-installation)
3. [Getting started](#3-getting-started)
   - [3.1 Layout provider](#31-layout-provider)
   - [3.2 Server data prefetch](#32-server-data-prefetch)
   - [3.3 Client consumption](#33-client-consumption)
   - [3.4 Suspense and streaming tips](#34-suspense-and-streaming-tips)
4. [API reference](#4-api-reference)
5. [Patterns and recipes](#5-patterns-and-recipes)
6. [Testing and local development](#6-testing-and-local-development)
7. [FAQ](#7-faq)
8. [Troubleshooting checklist](#8-troubleshooting-checklist)
9. [Contributing](#9-contributing)
10. [License](#10-license)

### 1. Why this library exists

`@jobkaehenry/next-hydrate` keeps React Query caches in sync across every rendering strategy offered by the Next.js App Router (SSR, ISR, SSG, CSR). The goal is to ship a single abstraction that:

- detects the runtime automatically using `detectFetchMode()` so you can respond to router prefetches, ISR revalidations, or static builds without branching throughout your codebase,
- hydrates multiple React Query caches with sensible defaults and payload size guards, and
- exposes ergonomically thin wrappers (`getHydrationProps` + `withHydration`) that fit straight into idiomatic Next.js layouts and route segments.

Internally, the utilities prioritise performance by:

- using a short-lived `QueryClient` during server execution with `gcTime` tuned down to release memory quickly,
- deactivating the React Query logger while prefetching to avoid noisy console output on the server,
- throttling concurrent prefetch operations so that bursty fetch workloads do not overwhelm upstream services, and
- falling back to CSR whenever the dehydrated payload crosses the configured kilobyte threshold.

### 2. Installation

```bash
npm install @jobkaehenry/next-hydrate @tanstack/react-query @tanstack/react-query-devtools
```

> **Note**
> This package expects `next`, `react`, and `react-dom` to already exist in your project as peer dependencies. Install compatible versions if they are missing.

### 3. Getting started

#### 3.1 Layout provider

Declare the global `QueryProvider` once inside your root layout. It keeps a single `QueryClient` instance alive on the client and optionally mounts the React Query Devtools in development.

```tsx
// app/layout.tsx
import { QueryProvider } from '@jobkaehenry/next-hydrate';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

#### 3.2 Server data prefetch

When you render a server component, call `getHydrationProps` with a list of queries. Each query defines a cache key, an async fetcher, and optional overrides (e.g., disabling hydration, limiting infinite query pages, or skipping large payloads via `shouldDehydrate`).

```tsx
// app/posts/page.tsx
import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import PostsClient from './PostsClient';

export default async function PostsPage() {
  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['posts'],
        fetchFn: async () => {
          const res = await fetch(`${process.env.API_URL}/api/posts`, {
            next: { revalidate: 60, tags: ['posts'] }
          });
          if (!res.ok) throw new Error('Failed to fetch posts');
          return res.json();
        },
      },
      {
        key: ['tags'],
        fetchFn: async () => {
          const res = await fetch(`${process.env.API_URL}/api/tags`);
          if (!res.ok) throw new Error('Failed to fetch tags');
          return res.json();
        },
      },
    ],
  });

  return <PostsClient dehydratedState={hydration.dehydratedState} />;
}
```

`getHydrationProps` automatically skips work when the environment is CSR or when the request is a Next.js router prefetch (`next-router-prefetch` header). In ISR scenarios the optional `revalidate` value is forwarded so that your route segment can opt into incremental regeneration with a single flag.

#### 3.3 Client consumption

Wrap any client component that expects hydrated data with the `withHydration` higher-order component. Your hook code remains unchanged—React Query reuses the server-prefetched caches and behaves as if the queries had just resolved on the client.

```tsx
// app/posts/PostsClient.tsx
'use client';

import { withHydration } from '@jobkaehenry/next-hydrate';
import { usePostsQuery, useTagsQuery } from '@/lib/queries';

function PostsClientBase() {
  const { data: posts } = usePostsQuery();
  const { data: tags } = useTagsQuery();

  return (
    <>
      <h3>Tags</h3>
      {tags?.map((tag) => (
        <span key={tag.id}>{tag.name}</span>
      ))}
      <h3>Posts</h3>
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </>
  );
}

export default withHydration(PostsClientBase);
```

If you prefer composition over HOCs, import and use the `HydrateClient` component directly.

```tsx
// app/posts/PostsClient.tsx
'use client';

import { HydrateClient } from '@jobkaehenry/next-hydrate';
import PostsView from './PostsView';

export default function PostsClient({ dehydratedState }: { dehydratedState: unknown }) {
  return (
    <HydrateClient state={dehydratedState}>
      <PostsView />
    </HydrateClient>
  );
}
```

#### 3.4 Suspense and streaming tips

- Suspense is enabled by default via the shared `QueryClient` configuration, so you can wrap any component tree in `<Suspense fallback={...}>` without extra wiring.
- Infinite queries hydrate the specified number of pages (`pagesToHydrate`) on the server. Additional pages will be fetched lazily on the client when `fetchNextPage` is invoked.
- For streaming routes, call `getHydrationProps` before returning the initial chunk so the dehydrated payload is ready when `<Suspense>` boundaries resolve on the client.
- Combine with Next.js `route.ts` handlers or `generateStaticParams` to prebuild data while still letting React Query stay authoritative on the client.

### 4. API reference

#### `detectFetchMode()`

| Return value | Description |
| --- | --- |
| `"ssr"` | Default mode during server-side rendering. |
| `"isr"` | When the `x-next-revalidate` header is present. |
| `"static"` | During static export (build time) when `NEXT_PHASE === "phase-production-build"`. |
| `"csr"` | Inside the browser or when Next.js sets `next-router-prefetch` header. |

#### `getHydrationProps(options)`

- **`queries`**: Array of query descriptors.
  - `key`: Stable query key (tuple or array) used by React Query.
  - `fetchFn`: Async function returning the data.
  - `hydrate` (optional): Set to `false` to skip hydration but allow manual prefetching.
  - `pagesToHydrate` (optional): Limit for infinite queries; defaults to 1.
  - `shouldDehydrate` (optional): Receives the resolved data and returns a boolean to decide if it should be serialized.
- **`fetchMode`** (optional): Override auto-detection when you already know the mode.
- **`revalidate`** (optional): Forwarded only in ISR mode.
- **`concurrency`** (optional, default `6`): Controls how many fetches run in parallel.
- **`maxPayloadKB`** (optional, default `200`): If the dehydrated payload exceeds this size, `dehydratedState` becomes `null` to trigger CSR fallback.
- **`devLog`** (optional, default `process.env.NODE_ENV !== 'production'`): Logs `[hydrate]` diagnostics in development.

Returns an object containing:

- `dehydratedState`: Serializable hydration payload or `null` when CSR fallback is used.
- `revalidate`: Number of seconds for ISR responses. Undefined otherwise.

#### `HydrateClient`

Client component that reads `state` and wraps children in `HydrationBoundary` when the payload exists. Useful for manual composition.

#### `withHydration(Component)`

Higher-order component that injects `dehydratedState` and renders a `<HydrateClient>` wrapper automatically.

#### `QueryProvider`

Client provider exposing a singleton `QueryClient`. Mount it once inside the root layout. In non-production environments the React Query Devtools remain available (collapsed by default).

### 5. Patterns and recipes

- **Multiple route segments**: Share a single `QueryProvider` across layouts. Each route segment can independently call `getHydrationProps` without clobbering caches because React Query scopes cache keys per route tree.
- **Error boundaries**: When a server fetch rejects, React Query bubbles the error. Pair the client component with an error boundary or rely on Next.js `error.tsx` to gracefully handle failures.
- **Prefetch cancellation**: To opt out of hydration under specific conditions (e.g., feature flag off), return `hydrate: false` for that query or provide a `shouldDehydrate` that checks the returned payload size.
- **Infinite scrolling**: Prefetch a handful of pages (`pagesToHydrate: 2`) to minimise layout shifts, then rely on `fetchNextPage` for subsequent pages.
- **Streaming partial data**: Use `Promise.all` to fetch high-priority data eagerly, while low-priority queries can stay in the list with `hydrate: false` to avoid blocking the initial response.
- **Analytics**: With `devLog` enabled, the console prints mode, query count, payload size, and whether CSR fallback triggered. Pipe these logs to your observability platform during QA.

### 6. Testing and local development

1. Install dependencies with `npm install`.
2. Run unit tests once with `npm run test`.
3. Use `npm run dev:test` for watch mode while editing source files.
4. Build the package using `npm run build` (powered by `tsup`).

### 7. FAQ

<details>
<summary>Does this work with React Query v4?</summary>

The package targets v5 APIs. While many behaviours remain compatible with v4, full support is not guaranteed because option names and defaults differ.
</details>

<details>
<summary>Can I use custom fetchers instead of <code>makeJsonFetch</code>?</summary>

Absolutely. Any async function returning data works. `makeJsonFetch` simply reduces boilerplate for JSON endpoints while wiring Next.js caching hints.
</details>

<details>
<summary>How do I hydrate data for nested layouts?</summary>

Each layout or page can call `getHydrationProps`. Pass the resulting `dehydratedState` down via props to the nearest client component and wrap it with `withHydration` or `HydrateClient`.
</details>

### 8. Troubleshooting checklist

| Symptom | Possible cause | Suggested fix |
| --- | --- | --- |
| Hydration mismatch warnings | `dehydratedState` is `null` due to payload cap | Increase `maxPayloadKB` or refine `shouldDehydrate`. |
| Queries refetch on navigation | Ensure `staleTime` is configured as desired in your `QueryClient`. The default is `30s` on the client. |
| No data during ISR revalidation | Provide `revalidate` when calling `getHydrationProps` so Next.js keeps the cache warm. |
| Fetch runs twice in development | React strict mode intentionally double-invokes fetchers. This is expected behaviour. |

### 9. Contributing

1. Fork the repository and create a feature branch.
2. Install dependencies with `npm install`.
3. Run the test suite (`npm run test`).
4. Commit changes following conventional commits.
5. Submit a pull request describing the problem and solution. Screenshots or reproduction links are encouraged.

### 10. License

MIT License

</details>

<details>
<summary><strong>한국어 (Korean)</strong></summary>

### 목차

1. [라이브러리 개요](#1-라이브러리-개요)
2. [설치](#2-설치)
3. [빠른 시작](#3-빠른-시작)
   - [3.1 레이아웃 Provider 구성](#31-레이아웃-provider-구성)
   - [3.2 서버에서 데이터 Prefetch](#32-서버에서-데이터-prefetch)
   - [3.3 클라이언트에서 데이터 사용](#33-클라이언트에서-데이터-사용)
   - [3.4 Suspense 및 스트리밍 팁](#34-suspense-및-스트리밍-팁)
4. [API 레퍼런스](#4-api-레퍼런스)
5. [패턴과 레시피](#5-패턴과-레시피)
6. [테스트 & 로컬 개발](#6-테스트--로컬-개발)
7. [자주 묻는 질문](#7-자주-묻는-질문)
8. [트러블슈팅 체크리스트](#8-트러블슈팅-체크리스트)
9. [기여 가이드](#9-기여-가이드)
10. [라이선스](#10-라이선스)

### 1. 라이브러리 개요

`@jobkaehenry/next-hydrate`는 Next.js App Router가 제공하는 모든 렌더링 방식(SSR / ISR / SSG / CSR)에서 React Query 캐시를 일관성 있게 유지하기 위한 통합 유틸리티입니다. 핵심 목표는 다음과 같습니다.

- `detectFetchMode()`로 런타임을 자동 감지하여 라우터 prefetch, ISR 재검증, 정적 빌드 상황에서도 조건문을 최소화합니다.
- 여러 React Query 쿼리를 한 번에 prefetch하고 페이로드 용량을 측정해 안전하게 하이드레이션합니다.
- `getHydrationProps`와 `withHydration` 두 가지 API만으로 Next.js 레이아웃 및 라우트 세그먼트에 자연스럽게 녹아듭니다.

내부적으로는 다음과 같은 성능 최적화가 적용되어 있습니다.

- 서버 실행 시 단기 `QueryClient`를 생성하고 `gcTime`을 짧게 설정해 메모리를 빠르게 해제합니다.
- 서버 콘솔이 지저분해지는 것을 막기 위해 React Query logger를 비활성화합니다.
- 동시 prefetch 개수를 제한하여 백엔드 서비스에 무리가 가지 않도록 합니다.
- 직렬화된 페이로드가 임계치를 넘으면 자동으로 CSR 폴백을 수행합니다.

### 2. 설치

```bash
npm install @jobkaehenry/next-hydrate @tanstack/react-query @tanstack/react-query-devtools
```

> **참고**
> `next`, `react`, `react-dom`은 peer dependency입니다. 프로젝트에 존재하지 않는 경우 호환 버전을 함께 설치하세요.

### 3. 빠른 시작

#### 3.1 레이아웃 Provider 구성

루트 레이아웃에서 `QueryProvider`를 한 번만 선언하면 전역에서 동일한 `QueryClient`를 공유하며, 개발 환경에서는 React Query Devtools도 자동으로 마운트됩니다.

```tsx
// app/layout.tsx
import { QueryProvider } from '@jobkaehenry/next-hydrate';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

#### 3.2 서버에서 데이터 Prefetch

서버 컴포넌트에서는 `getHydrationProps`에 쿼리 목록을 전달해 데이터를 선행으로 가져옵니다. 각 항목은 캐시 키, 비동기 fetch 함수, 선택 옵션(`hydrate`, `pagesToHydrate`, `shouldDehydrate`)을 포함합니다.

```tsx
// app/posts/page.tsx
import { getHydrationProps } from '@jobkaehenry/next-hydrate';
import PostsClient from './PostsClient';

export default async function PostsPage() {
  const hydration = await getHydrationProps({
    queries: [
      {
        key: ['posts'],
        fetchFn: async () => {
          const res = await fetch(`${process.env.API_URL}/api/posts`, {
            next: { revalidate: 60, tags: ['posts'] }
          });
          if (!res.ok) throw new Error('Failed to fetch posts');
          return res.json();
        },
      },
      {
        key: ['tags'],
        fetchFn: async () => {
          const res = await fetch(`${process.env.API_URL}/api/tags`);
          if (!res.ok) throw new Error('Failed to fetch tags');
          return res.json();
        },
      },
    ],
  });

  return <PostsClient dehydratedState={hydration.dehydratedState} />;
}
```

`getHydrationProps`는 CSR 환경이나 Next.js 라우터 prefetch 요청(`next-router-prefetch` 헤더)일 경우 즉시 종료합니다. ISR 상황에서는 `revalidate` 값을 그대로 전달하므로 간단히 증분 정적 재생성을 켤 수 있습니다.

#### 3.3 클라이언트에서 데이터 사용

하이드레이션이 필요한 클라이언트 컴포넌트를 `withHydration` HOC로 감싸면 됩니다. 내부 React Query 훅 코드는 그대로 유지되며 서버에서 미리 받아둔 캐시를 즉시 재사용합니다.

```tsx
// app/posts/PostsClient.tsx
'use client';

import { withHydration } from '@jobkaehenry/next-hydrate';
import { usePostsQuery, useTagsQuery } from '@/lib/queries';

function PostsClientBase() {
  const { data: posts } = usePostsQuery();
  const { data: tags } = useTagsQuery();

  return (
    <>
      <h3>태그</h3>
      {tags?.map((tag) => (
        <span key={tag.id}>{tag.name}</span>
      ))}
      <h3>게시글</h3>
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </>
  );
}

export default withHydration(PostsClientBase);
```

HOC 대신 컴포지션을 선호한다면 `HydrateClient` 컴포넌트를 직접 사용해도 됩니다.

```tsx
// app/posts/PostsClient.tsx
'use client';

import { HydrateClient } from '@jobkaehenry/next-hydrate';
import PostsView from './PostsView';

export default function PostsClient({ dehydratedState }: { dehydratedState: unknown }) {
  return (
    <HydrateClient state={dehydratedState}>
      <PostsView />
    </HydrateClient>
  );
}
```

#### 3.4 Suspense 및 스트리밍 팁

- 기본 `QueryClient` 설정은 Suspense를 활성화하므로 `<Suspense fallback={...}>`만 추가하면 됩니다.
- Infinite Query는 `pagesToHydrate` 값만큼 서버에서 페이지를 직렬화합니다. 이후 페이지는 `fetchNextPage` 호출 시 클라이언트에서 가져옵니다.
- 스트리밍 라우트에서는 첫 청크를 반환하기 전에 `getHydrationProps`를 호출해 `<Suspense>` 경계가 열릴 때 직렬화된 데이터를 바로 사용할 수 있도록 합니다.
- `route.ts` 핸들러나 `generateStaticParams`와 조합하면 정적 빌드와 React Query 기반 하이드레이션을 동시에 활용할 수 있습니다.

### 4. API 레퍼런스

#### `detectFetchMode()`

| 반환 값 | 설명 |
| --- | --- |
| `"ssr"` | 기본 서버 사이드 렌더링 모드. |
| `"isr"` | `x-next-revalidate` 헤더가 포함된 ISR 상황. |
| `"static"` | `NEXT_PHASE === "phase-production-build"`인 정적 빌드 단계. |
| `"csr"` | 브라우저 환경 또는 `next-router-prefetch` 헤더가 있는 경우. |

#### `getHydrationProps(options)`

- **`queries`**: 쿼리 설명자 배열
  - `key`: React Query 캐시 키 (배열 형태 권장)
  - `fetchFn`: 데이터를 반환하는 비동기 함수
  - `hydrate` (선택): `false`로 설정하면 직렬화를 건너뛰면서도 prefetch는 수행합니다.
  - `pagesToHydrate` (선택): Infinite Query 서버 직렬화 페이지 수 (기본값 1)
  - `shouldDehydrate` (선택): 반환 데이터 기반으로 직렬화 여부를 결정하는 함수
- **`fetchMode`** (선택): 이미 모드를 알고 있는 경우 직접 지정
- **`revalidate`** (선택): ISR 모드에서만 응답 헤더에 전달
- **`concurrency`** (선택, 기본 6): 동시 실행할 fetch 개수 제한
- **`maxPayloadKB`** (선택, 기본 200): 직렬화된 페이로드가 이 값을 넘으면 `dehydratedState`를 `null`로 설정하여 CSR로 전환
- **`devLog`** (선택, 기본값은 비프로덕션 환경에서 `true`): 개발용 콘솔 로그 출력

반환 값:

- `dehydratedState`: 직렬화된 하이드레이션 데이터 혹은 CSR 폴백 시 `null`
- `revalidate`: ISR 응답을 위한 초 단위 재검증 시간 (해당 모드가 아닐 경우 `undefined`)

#### `HydrateClient`

`state`를 읽어 `HydrationBoundary`로 감싸는 클라이언트 컴포넌트입니다. 직접 컴포지션할 때 유용합니다.

#### `withHydration(Component)`

`dehydratedState`를 주입하고 자동으로 `<HydrateClient>`로 감싸는 HOC입니다.

#### `QueryProvider`

루트 레이아웃에 한 번만 마운트하는 클라이언트 Provider입니다. 개발 환경에서는 React Query Devtools가 함께 표시됩니다(기본은 접힘 상태).

### 5. 패턴과 레시피

- **여러 라우트 세그먼트**: 하나의 `QueryProvider`를 공유하면서 각 세그먼트에서 독립적으로 `getHydrationProps`를 호출해도 캐시 키가 겹치지 않습니다.
- **에러 경계 처리**: 서버 fetch가 실패하면 React Query가 오류를 전달합니다. 클라이언트 컴포넌트 주변에 error boundary를 배치하거나 Next.js `error.tsx`를 활용하세요.
- **조건부 Prefetch**: 특정 조건에서 하이드레이션을 건너뛰고 싶다면 `hydrate: false`를 설정하거나 `shouldDehydrate`에서 데이터를 검사해 결정할 수 있습니다.
- **Infinite Scroll**: 초기 두세 페이지만 `pagesToHydrate`로 직렬화하고 이후 페이지는 `fetchNextPage`로 로딩하면 레이아웃 흔들림을 줄일 수 있습니다.
- **스트리밍과 부분 데이터**: 우선순위가 높은 데이터는 `Promise.all`로 선행 실행하고, 우선순위가 낮은 쿼리는 `hydrate: false`로 설정해 초기 응답을 빠르게 전달합니다.
- **모니터링**: `devLog`가 활성화된 상태에서 `[hydrate]` 로그에는 모드, 쿼리 수, 페이로드 용량, CSR 폴백 여부가 표시됩니다. QA 환경에서 로깅 시스템으로 전송하면 상태를 파악하기 쉽습니다.

### 6. 테스트 & 로컬 개발

1. `npm install`
2. `npm run test`
3. 개발 중에는 `npm run dev:test`로 watch 모드 실행
4. `npm run build`로 패키지 번들(tsup 기반)

### 7. 자주 묻는 질문

<details>
<summary>React Query v4와 호환되나요?</summary>

본 패키지는 v5 API를 기준으로 제작되었습니다. 일부 기능은 v4에서도 동작할 수 있으나 옵션 명과 기본값이 다르므로 100% 호환을 보장하지 않습니다.
</details>

<details>
<summary><code>makeJsonFetch</code> 대신 직접 fetch 함수를 써도 되나요?</summary>

가능합니다. 비동기 데이터만 반환하면 됩니다. `makeJsonFetch`는 JSON API에서 Next.js 캐싱 옵션을 함께 전달하기 위한 헬퍼일 뿐입니다.
</details>

<details>
<summary>중첩 레이아웃에서도 하이드레이션이 가능할까요?</summary>

가능합니다. 각 레이아웃 또는 페이지에서 `getHydrationProps`를 호출하고, 반환된 `dehydratedState`를 가장 가까운 클라이언트 컴포넌트에 전달하면 됩니다. `withHydration` 또는 `HydrateClient`로 감싸면 React Query가 서버 캐시를 그대로 재사용합니다.
</details>

### 8. 트러블슈팅 체크리스트

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| Hydration 경고 발생 | 페이로드가 `maxPayloadKB`를 초과해 `dehydratedState`가 `null`이 됨 | `maxPayloadKB`를 늘리거나 `shouldDehydrate` 조건을 조정하세요. |
| 네비게이션 시 매번 refetch | 클라이언트 `QueryClient`의 `staleTime`이 짧음 | 레이아웃에서 커스텀 `QueryClient` 설정을 적용하세요. 기본값은 30초입니다. |
| ISR 재검증 시 데이터 없음 | `getHydrationProps` 호출 시 `revalidate` 값을 전달하지 않음 | ISR 페이지는 `revalidate` 옵션을 지정해 주세요. |
| 개발 모드에서 fetch 두 번 실행 | React Strict Mode의 의도된 동작 | 프로덕션 빌드에서는 한 번만 실행됩니다. |

### 9. 기여 가이드

1. 저장소를 포크하고 작업용 브랜치를 만듭니다.
2. `npm install`로 의존성을 설치합니다.
3. `npm run test`로 테스트를 통과시킵니다.
4. 변경 사항을 커밋하고 Pull Request를 작성합니다. 문제 원인과 해결 방법을 상세히 적어주세요.

### 10. 라이선스

MIT License

</details>
