# **프로젝트 기술 스택**

- **App_React**
	- Expo (React Native), React 18, TypeScript
	- NativeWind / TailwindCSS, React Navigation, React Query, Axios, Supabase
	- Reanimated, Moti, Expo FileSystem, Image Picker
	- 테스트: Vitest, MSW

- **Backend_Node**
	- Node.js, TypeScript, Express
	- MySQL (mysql2), Kysely, Multer, bcrypt, jsonwebtoken
	- Optional: Redis (ioredis)
	- 개발도구: ts-node-dev, Vitest, ESLint, Prettier

- **Frontend_Node**
	- React, Vite, React Router, Axios, Chart.js
	- DnD-kit (drag & drop), Vite dev server, ESLint

# Android 개발자(예: App_React만):

git clone --filter=blob:none --no-checkout <REPO_URL> myrepo
# **프로젝트 기술 스택 (상세)**

## App_React (모바일 앱 - Expo / React Native)
- 핵심 런타임/언어:
	- `expo` ~50.x
	- `react` 18.2.0
	- `react-native` 0.73.6
	- `typescript` ^5.x
- 주요 라이브러리 (버전):
	- `nativewind` ^4.2.1 (Tailwind 스타일링)
	- `@react-navigation/native` ^6.1.9, `@react-navigation/native-stack` ^6.9.17
	- `@tanstack/react-query` ^5.x
	- `axios` ^1.6.0
	- `@supabase/supabase-js` ^2.91.0
	- `react-native-reanimated` ~3.6.x, `moti` ^0.30.0
- 실행/개발 명령:
	- 개발: `cd App_React && npm run dev` (=`expo start`)
	- Android 실행: `npm run dev:android` (환경에 따라 `--localhost` 등 옵션 사용)
- 사용 예제 (React Query + Axios):
	```js
	import axios from 'axios';
	import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

	const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_BACKEND_URL });
	const queryClient = new QueryClient();
	// <QueryClientProvider client={queryClient}>로 앱을 감싸 사용
	```

## Backend_Node (서버 - Node.js + TypeScript)
- 핵심 런타임/언어:
	- Node.js (권장 LTS), `typescript` ^5.x, `express` ^4.18.2
- 주요 라이브러리 (버전):
	- `mysql2` ^3.3.1 (MySQL 드라이버)
	- `kysely` ^0.28.11 (타입 안전 SQL 빌더)
	- `jsonwebtoken` ^9.0.0
	- `bcrypt` ^5.1.0
	- `multer` 1.4.5-lts.1
	- Optional: `ioredis` ^5.3.2
- 개발/테스트 도구:
	- `ts-node-dev` (dev), `vitest` (테스트), `eslint`, `prettier`
- 실행/개발 명령:
	- 개발: `cd Backend_Node && npm run dev` (자동 리로드)
	- 빌드: `npm run build` → 실행: `npm start`
- 사용 예제 (mysql2 + Kysely):
	```ts
	import { Kysely, MysqlDialect } from 'kysely';
	import mysql from 'mysql2/promise';

	const pool = mysql.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
		port: Number(process.env.MYSQL_PORT || 3306),
	});

	const db = new Kysely({ dialect: new MysqlDialect({ pool }) });
	```

## Frontend_Node (관리자 웹 - React + Vite)
- 핵심 런타임/언어:
	- `react` ^18.x, `vite` ^5.x, `react-router-dom` ^7.x
- 주요 라이브러리 (버전):
	- `axios` ^1.13.1
	- `chart.js` ^4.4.0, `react-chartjs-2`
	- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (드래그 앤 드롭)
- 실행/개발 명령:
	- 개발: `cd Frontend_Node && npm run dev` (Vite 개발 서버)
- 사용 예제 (Axios 인스턴스):
	```js
	import axios from 'axios';
	const api = axios.create({ baseURL: import.meta.env.NodePath || 'http://localhost:3004' });
	export default api;
	```






# Android 개발자(예: App_React만):

git clone --filter=blob:none --no-checkout <REPO_URL> myrepo
cd myrepo
git sparse-checkout init --cone
git sparse-checkout set App_React
git checkout main


# 리얼 서버(예: Backend_Node와 Frontend_Node만):

git clone --filter=blob:none --no-checkout <REPO_URL> deploy-repo
cd deploy-repo
git sparse-checkout init --cone
git sparse-checkout set Backend_Node Frontend_Node
git checkout main


# 추가로 다른 폴더를 받고 싶을 때:

git sparse-checkout set App_React Backend_Node Frontend_Node


# Link
관리자 페이지 : http://localhost:5173/login
