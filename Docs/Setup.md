# 우분투 서버 배포 가이드 (Backend_Node + Frontend_Node)

> **목표**: OS만 설치된 우분투 서버에서 백엔드/프론트엔드를 완전히 구동하고, 도메인(ydc1981.pe.kr)으로 접근 가능하게 설정합니다.

## 📋 사전 준비사항

- **서버**: Ubuntu 20.04 LTS 이상 (클린 설치 상태)
- **도메인**: `ydc1981.pe.kr` (DNS A 레코드 설정 완료)
  - `kioskfront.ydc1981.pe.kr` → 서버 IP (Frontend_Node)
  - `kioskapi.ydc1981.pe.kr` → 서버 IP (Backend_Node Kiosk - 포트 3004)
  - `api.ydc1981.pe.kr` → 서버 IP (Backend_Node 대체 도메인)
  - `travelapi.ydc1981.pe.kr` → 서버 IP (Backend_Node Travel - 포트 3005)
- **방화벽**: 80, 443, 3307(MySQL, 외부 접근용) 포트 오픈
- **접속**: SSH root 또는 sudo 권한이 있는 계정
- **다중 프로젝트**: Kiosk(3004)와 Travel(3005) 두 개의 백엔드가 동일 MySQL을 사용하며 독립 실행

---

## 1️⃣ SSH 키 기반 인증 설정 (보안 강화)

### 1.1 로컬 머신에서 SSH 키 생성

```bash
# 로컬 머신(맥/윈도우/리눅스)에서 실행
# ED25519 알고리즘 사용 (RSA보다 안전하고 빠름)
ssh-keygen -t ed25519 -C "ydc1981@gmail.com"

# 프롬프트에서:
# - 저장 위치: Enter (기본값 ~/.ssh/id_ed25519)
# - 패스프레이즈: 강력한 비밀번호 입력 (선택, 권장)

# 공개키 확인
cat ~/.ssh/id_ed25519.pub
# ssh-ed25519 AAAAC3... ydc1981@gmail.com 형태로 출력됨
```

### 1.2 서버에 공개키 등록

```bash
# 서버에 SSH 접속 (비밀번호 인증)
ssh root@<서버_IP>

# 또는 일반 사용자
ssh ubuntu@<서버_IP>

# authorized_keys 디렉터리 생성 (없다면)
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 공개키 추가 (로컬 머신의 공개키를 복사해서 붙여넣기)
vim ~/.ssh/authorized_keys
# 또는 echo 명령으로 추가:
# echo "ssh-ed25519 AAAAC3... ydc1981@gmail.com" >> ~/.ssh/authorized_keys

# 권한 설정
chmod 600 ~/.ssh/authorized_keys

# SSH 서비스 재시작
sudo systemctl restart sshd
```

**빠른 방법 (로컬 머신에서 자동 복사)**:

```bash
# 로컬 머신에서 실행 (ssh-copy-id 사용)
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@<서버_IP>
# 비밀번호 입력 후 자동으로 공개키가 등록됨
```

### 1.3 SSH 키 인증 테스트

```bash
# 로컬 머신에서 테스트 (비밀번호 없이 접속되어야 함)
ssh ubuntu@<서버_IP>
# 패스프레이즈만 입력하면 접속 (설정한 경우)
```

### 1.4 비밀번호 인증 비활성화 (보안 강화)

**⚠️ 주의**: SSH 키 인증이 정상 작동하는지 반드시 확인 후 진행하세요!

```bash
# 서버에서 SSH 설정 파일 편집
sudo vim /etc/ssh/sshd_config

# 아래 항목들을 찾아서 수정:
# PasswordAuthentication yes → no
# PubkeyAuthentication yes (이미 yes면 그대로)
# ChallengeResponseAuthentication no

# vim 검색: /PasswordAuthentication
# 수정 후 저장: :wq
```

```bash
# SSH 서비스 재시작
sudo systemctl restart sshd

# 새 터미널에서 접속 테스트 (기존 세션 유지한 채)
# 성공 확인 후 기존 세션 종료
```

---

## 2️⃣ 기본 시스템 설정 및 업데이트

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 유틸리티 설치
sudo apt install -y curl wget git vim build-essential ufw

# 방화벽 설정 (ufw)
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3307/tcp  # MySQL 외부 접속용 (보안 주의!)
sudo ufw enable
sudo ufw status
```

---

## 3️⃣ Node.js 설치 (LTS 버전)

```bash
# NodeSource LTS 저장소 추가 (Node.js 20.x LTS 권장)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js 설치
sudo apt install -y nodejs

# 버전 확인
node -v   # v20.x.x
npm -v    # 10.x.x

# 전역 npm 업데이트 (선택)
sudo npm install -g npm@latest
```

---

## 4️⃣ MySQL 8.0 설치 및 설정

### 4.1 MySQL 설치

```bash
# MySQL 서버 설치
sudo apt install -y mysql-server

# MySQL 서비스 시작 및 활성화
sudo systemctl start mysql
sudo systemctl enable mysql

# MySQL 보안 설정 (root 비밀번호 설정 등)
sudo mysql_secure_installation
# - root 비밀번호 설정: 강력한 비밀번호 입력 (예: YourStrongPassword123!)
# - 익명 사용자 제거: Yes
# - 원격 root 로그인 비활성화: Yes
# - test 데이터베이스 제거: Yes
# - 권한 테이블 리로드: Yes
```

### 4.2 데이터베이스 및 사용자 생성

```bash
# MySQL 접속 (root 비밀번호 입력)
sudo mysql -u root -p

# 아래 SQL 명령을 MySQL 프롬프트에서 실행
```

**MySQL 프롬프트에서:**

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS Kiosk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (로컬 및 외부 접속)
CREATE USER 'kioskApp'@'localhost' IDENTIFIED BY 'Djfudnsrj1!';
CREATE USER 'kioskApp'@'%' IDENTIFIED BY 'Djfudnsrj1!';

-- 권한 부여
GRANT ALL PRIVILEGES ON Kiosk_db.* TO 'kioskApp'@'localhost';
GRANT ALL PRIVILEGES ON Kiosk_db.* TO 'kioskApp'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

-- 확인 후 종료
SELECT user, host FROM mysql.user WHERE user='kioskApp';
EXIT;
```

### 4.3 MySQL 외부 접속 설정

```bash
# MySQL 설정 파일 편집
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

# 아래 라인을 찾아서 수정 (bind-address 변경)
# 기존: bind-address = 127.0.0.1
# 변경: bind-address = 0.0.0.0

# vim에서 수정 방법:
# 1. `/bind-address` 입력 후 Enter (검색)
# 2. `i` 키 (편집 모드)
# 3. 127.0.0.1 → 0.0.0.0 수정
# 4. Esc 키 후 `:wq` 입력 (저장 및 종료)
```

```bash
# MySQL 재시작
sudo systemctl restart mysql

# 외부 접속 테스트 (로컬 머신에서)
# mysql -h <서버_IP> -u kioskApp -p Kiosk_db
```

### 4.4 테이블 생성 (dev_db.sql 사용)

```bash
# 저장소 클론 후 SQL 파일 실행 (아래 4단계에서 클론 후)
# 일단 여기서는 명령만 준비
# cd /var/www/Kiosk
# sudo mysql -u kioskApp -p Kiosk_db < Docs/dev_db.sql
```

**📝 참고**: `dev_db.sql` 파일 첫 줄에 `CREATE DATABASE IF NOT EXISTS kiosk_db`가 있으므로, 데이터베이스 이름이 `kiosk_db`인지 `Kiosk_db`인지 확인 필요. 필요시 SQL 파일 내 `USE kiosk_db;` → `USE Kiosk_db;` 수정.

---

## 5️⃣ 소스 코드 클론 (GitHub)

```bash
# 웹 애플리케이션 디렉터리 생성
sudo mkdir -p /var/www
cd /var/www

# 저장소 클론 (sparse-checkout으로 필요한 폴더만)
sudo git clone --filter=blob:none --no-checkout https://github.com/dongchunYoo/Kiosk.git
cd Kiosk

# sparse-checkout 설정 (Backend_Node, Frontend_Node, Docs만)
sudo git sparse-checkout init --cone
sudo git sparse-checkout set Backend_Node Frontend_Node Docs
sudo git checkout main

# 소유권 변경 (현재 사용자로, 예: ubuntu)
sudo chown -R $USER:$USER /var/www/Kiosk

# 확인
ls -la
# Backend_Node/ Frontend_Node/ Docs/ 등이 보여야 함
```

---

## 6️⃣ 데이터베이스 테이블 생성

```bash
cd /var/www/Kiosk

# dev_db.sql 파일 확인 (데이터베이스 이름 체크)
head -n 5 Docs/dev_db.sql
# CREATE DATABASE IF NOT EXISTS `kiosk_db` ... 확인

# ⚠️ 중요: dev_db.sql의 데이터베이스 이름을 Kiosk_db로 통일
# .env에서 MYSQL_DATABASE=Kiosk_db를 사용하므로 SQL 파일도 동일하게 수정
sed -i.bak 's/kiosk_db/Kiosk_db/g' Docs/dev_db.sql

# SQL 실행 (비밀번호 입력: Djfudnsrj1!)
mysql -u kioskApp -p Kiosk_db < Docs/dev_db.sql

# 테이블 생성 확인
mysql -u kioskApp -p -e "USE Kiosk_db; SHOW TABLES;"
```

**📝 참고**: `sed` 명령으로 `dev_db.sql` 파일 내의 모든 `kiosk_db`를 `Kiosk_db`로 자동 변경합니다. 원본은 `.bak` 파일로 백업됩니다.

---

## 7️⃣ Backend_Node 설정 및 실행

### 7.1 의존성 설치

```bash
cd /var/www/Kiosk/Backend_Node

# package.json 확인
cat package.json | grep '"name"'

# npm 의존성 설치
npm install
```

### 7.2 환경변수 설정 (.env)

```bash
# .env.example 복사
cp .env.example .env

# .env 파일 편집
vim .env
```

**`.env` 파일 내용** (실제 서버 환경에 맞게 수정):

```dotenv
PORT=3004

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=kioskApp
MYSQL_PASSWORD=Djfudnsrj1!
MYSQL_DATABASE=Kiosk_db

JWT_SECRET=your_very_strong_jwt_secret_change_this_in_production

REDIS_PREFIX=Kiosk

# 프로덕션 환경에서는 반드시 false로 설정 (CORS 보안)
DEV_MODE=false
```

**⚠️ 보안 주의**: 
- `JWT_SECRET`은 강력한 랜덤 문자열로 변경하세요!
- `DEV_MODE=false`로 설정하여 CORS를 특정 도메인만 허용합니다.
  - `DEV_MODE=true`: 개발 환경용 (모든 도메인 허용)
  - `DEV_MODE=false`: 프로덕션 환경용 (kioskfront.ydc1981.pe.kr만 허용)

```bash
# 랜덤 시크릿 생성 예제
openssl rand -base64 32
# 출력된 값을 JWT_SECRET에 사용
```

### 7.3 TypeScript 빌드

```bash
# 빌드 (dist/ 폴더 생성)
npm run build

# dist 폴더 확인
ls -la dist/
```

### 7.4 PM2로 프로세스 관리 (백그라운드 실행)

```bash
# PM2 전역 설치
sudo npm install -g pm2

# PM2로 Backend 시작 (production 모드)
pm2 start dist/index.js --name kiosk-backend

# PM2 상태 확인
pm2 status
pm2 logs kiosk-backend

# 서버 재부팅 시 자동 시작 설정
pm2 startup systemd
# 출력된 명령어 복사해서 실행 (예: sudo env PATH=... pm2 startup ...)

pm2 save
```

**개발 모드로 실행하려면 (선택사항)**:

```bash
# ts-node-dev로 개발 모드 (자동 리로드)
pm2 start npm --name kiosk-backend-dev -- run dev
```

### 7.5 백엔드 동작 확인

```bash
# 로컬 접속 테스트
curl http://localhost:3004
# 또는 health check 엔드포인트가 있다면:
# curl http://localhost:3004/api/health
```

---

## 8️⃣ Frontend_Node 설정 및 빌드

### 8.1 의존성 설치

```bash
cd /var/www/Kiosk/Frontend_Node

# npm 의존성 설치
npm install
```

### 8.2 환경변수 설정 (.env)

```bash
# .env.example 복사
cp .env.example .env

# .env 파일 편집
vim .env
```

**`.env` 파일 내용** (프로덕션 도메인 사용):

```dotenv
NodePath=https://kioskapi.ydc1981.pe.kr
```

**📝 참고**: `vite.config.js`에서 `import.meta.env.NodePath`를 사용하므로, Nginx 리버스 프록시를 통해 백엔드에 접근합니다.

### 8.3 프로덕션 빌드

```bash
# Vite 빌드 (dist/ 폴더 생성)
npm run build

# dist 폴더 확인
ls -la dist/
# index.html, assets/ 폴더 등이 있어야 함
```

**⚠️ 주의**: 프론트엔드는 정적 파일이므로 Nginx로 서빙합니다 (PM2 불필요).

---

## 9️⃣ Nginx 설치 및 설정

### 9.1 Nginx 설치

```bash
# Nginx 설치
sudo apt install -y nginx

# Nginx 시작 및 활성화
sudo systemctl start nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx

# 브라우저에서 http://<서버_IP> 접속 → Nginx 기본 페이지 표시되어야 함
```

### 9.2 Nginx 설정 파일 생성

#### 9.2.1 Backend - Kiosk API (kioskapi.ydc1981.pe.kr) - 포트 3004

```bash
sudo vim /etc/nginx/sites-available/kioskapi
```

**`/etc/nginx/sites-available/kioskapi` 파일 내용**:

```nginx
server {
    listen 80;
    server_name kioskapi.ydc1981.pe.kr api.ydc1981.pe.kr;

    # HTTP → HTTPS 리다이렉트 (SSL 설정 후 활성화)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 9.2.2 Backend - Travel API (travelapi.ydc1981.pe.kr) - 포트 3005

```bash
sudo vim /etc/nginx/sites-available/travelapi
```

**`/etc/nginx/sites-available/travelapi` 파일 내용**:

```nginx
server {
    listen 80;
    server_name travelapi.ydc1981.pe.kr;

    # HTTP → HTTPS 리다이렉트 (SSL 설정 후 활성화)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 9.2.3 Frontend (kioskfront.ydc1981.pe.kr) - 정적 파일 서빙

```bash
sudo vim /etc/nginx/sites-available/kioskfront
```

**`/etc/nginx/sites-available/kioskfront` 파일 내용**:

```nginx
server {
    listen 80;
    server_name kioskfront.ydc1981.pe.kr;

    # HTTP → HTTPS 리다이렉트 (SSL 설정 후 활성화)
    # return 301 https://$host$request_uri;

    root /var/www/Kiosk/Frontend_Node/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 캐시 최적화 (선택사항)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 9.3 사이트 활성화 및 Nginx 재시작

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/kioskapi /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/travelapi /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/kioskfront /etc/nginx/sites-enabled/

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

**📝 참고**: Nginx는 `server_name`으로 도메인을 구분하고, 각 백엔드 포트(3004: Kiosk, 3005: Travel)로 프록시합니다. 프론트엔드는 빌드된 정적 파일을 직접 서빙합니다.

### 9.4 HTTP 접속 테스트

```bash
# 백엔드 테스트 (서버에서)
curl http://kioskapi.ydc1981.pe.kr

# 프론트엔드 테스트 (로컬 머신 브라우저에서)
# http://kioskfront.ydc1981.pe.kr
```

---

## 🔟 SSL 인증서 설정 (Let's Encrypt - HTTPS)

### 10.1 Certbot 설치

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 SSL 인증서 발급

```bash
# Kiosk 백엔드 도메인 인증서 발급
sudo certbot --nginx -d kioskapi.ydc1981.pe.kr -d api.ydc1981.pe.kr

# Travel 백엔드 도메인 인증서 발급
sudo certbot --nginx -d travelapi.ydc1981.pe.kr

# 프론트엔드 도메인 인증서 발급
sudo certbot --nginx -d kioskfront.ydc1981.pe.kr

# 프롬프트에서:
# - 이메일 입력 (알림용, 만료 알림 수신)
# - 약관 동의: Yes
# - HTTP → HTTPS 리다이렉트: 2 (Redirect) 선택 권장
```

**📝 중요**: Let's Encrypt 인증서는 **90일** 유효기간이 있으며, **자동 갱신**이 설정됩니다.

### 9.3 SSL 인증서 자동 갱신 설정

```bash
# Certbot 자동 갱신 타이머 확인 (systemd)
sudo systemctl status certbot.timer
# Active: active (waiting) 상태여야 함

# 타이머가 비활성화되어 있다면 활성화
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 수동 갱신 테스트 (실제로 갱신하지 않음, dry-run)
sudo certbot renew --dry-run

# 갱신 스케줄 확인
sudo systemctl list-timers | grep certbot
# 보통 하루 2회 자동 실행되며, 만료 30일 전부터 갱신 시도
```

**자동 갱신 동작 방식**:
- Certbot은 `systemd` 타이머로 하루 2회 자동 실행
- 인증서 만료 **30일 이내**일 때만 실제 갱신
- 갱신 성공 시 Nginx 자동 재로드
- 실패 시 이메일로 알림 (발급 시 입력한 이메일)

**수동 갱신 (필요시)**:
```bash
# 모든 인증서 강제 갱신
sudo certbot renew --force-renewal

# Nginx 재로드
sudo systemctl reload nginx
```

### 10.4 HTTPS 접속 확인

```bash
# 로컬 머신 브라우저에서:
# https://kioskfront.ydc1981.pe.kr
# https://kioskapi.ydc1981.pe.kr

# 서버에서 테스트:
curl https://kioskapi.ydc1981.pe.kr
```

---

## 1️⃣1️⃣ Redis 설치 (선택사항 - Backend에서 사용 시)

Backend_Node의 `package.json`에 `ioredis`가 `optionalDependencies`로 있으므로, 캠싱이 필요하면 Redis를 설치합니다.

```bash
# Redis 설치
sudo apt install -y redis-server

# Redis 설정 (systemd 모드)
sudo vim /etc/redis/redis.conf
# supervised no → supervised systemd 로 변경

# Redis 재시작
sudo systemctl restart redis
sudo systemctl enable redis

# Redis 상태 확인
redis-cli ping
# 응답: PONG
```

**Backend .env에 Redis 설정 추가** (선택):

```dotenv
# .env에 추가 (필요시)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PREFIX=Kiosk
```

---

## 1️⃣2️⃣ 최종 점검 및 서비스 상태 확인

### 12.1 서비스 상태 확인

```bash
# MySQL
sudo systemctl status mysql

# Nginx
sudo systemctl status nginx

# PM2 (Backend)
pm2 status
pm2 logs kiosk-backend --lines 50

# Redis (설치한 경우)
sudo systemctl status redis
```

### 12.2 포트 확인

```bash
# 포트 리스닝 확인
sudo netstat -tlnp | grep -E ':(80|443|3004|3005|3307|6379)'

# 예상 결과:
# 80, 443 → nginx
# 3004 → node (Backend Kiosk)
# 3005 → node (Backend Travel)
# 3307 → mysqld
# 6379 → redis-server (선택)
```

### 12.3 방화벽 확인

```bash
sudo ufw status verbose
# 80, 443, 3306 ALLOW 확인
```

### 12.4 브라우저 접속 테스트

1. **프론트엔드**: `https://kioskfront.ydc1981.pe.kr`
2. **백엔드 API**: `https://kioskapi.ydc1981.pe.kr` (또는 `/api/...` 엔드포인트)

---

## 1️⃣3️⃣ 문제 해결 (Troubleshooting)

### 13.1 502 Bad Gateway (Nginx)

```bash
# Backend가 실행 중인지 확인
pm2 status
curl http://localhost:3004

# Backend 로그 확인
pm2 logs kiosk-backend

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 13.2 MySQL 연결 실패

```bash
# MySQL 실행 확인
sudo systemctl status mysql

# Backend .env 파일 확인
cat /var/www/Kiosk/Backend_Node/.env

# MySQL 사용자 권한 재확인
mysql -u kioskApp -p -e "SHOW GRANTS FOR 'kioskApp'@'localhost';"
```

### 13.3 프론트엔드 빌드 파일 404

```bash
# dist 폴더 확인
ls -la /var/www/Kiosk/Frontend_Node/dist/

# Nginx 설정의 root 경로 확인
sudo nginx -T | grep -A 10 kioskfront

# 권한 확인
sudo chown -R www-data:www-data /var/www/Kiosk/Frontend_Node/dist
```

### 13.4 SSL 인증서 갱신 실패

```bash
# 수동 갱신 시도
sudo certbot renew --force-renewal

# 인증서 목록 확인
sudo certbot certificates
```

---

## 1️⃣4️⃣ 유지보수 및 업데이트

### 14.1 코드 업데이트 (Git Pull)

```bash
cd /var/www/Kiosk

# 최신 코드 가져오기
git pull origin main

# Backend 재빌드 및 재시작
cd Backend_Node
npm install
npm run build
pm2 restart kiosk-backend

# Frontend 재빌드
cd ../Frontend_Node
npm install
npm run build

# Nginx 재로드 (선택)
sudo systemctl reload nginx
```

### 14.2 로그 관리

```bash
# PM2 로그 확인
pm2 logs kiosk-backend --lines 100

# Nginx 접속 로그
sudo tail -f /var/log/nginx/access.log

# MySQL 로그
sudo tail -f /var/log/mysql/error.log
```

### 14.3 백업

```bash
# 데이터베이스 백업
mysqldump -u kioskApp -p Kiosk_db > ~/kiosk_backup_$(date +%F).sql

# 업로드 파일 백업 (있다면)
tar -czf ~/kiosk_uploads_$(date +%F).tar.gz /var/www/Kiosk/Backend_Node/uploads
```

---

## 1️⃣5️⃣ 보안 강화 (권장사항)

### 15.1 MySQL 외부 접속 제한

운영 환경에서는 MySQL을 외부에 노출하지 않는 것이 좋습니다.

```bash
# bind-address를 다시 127.0.0.1로 변경
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
# bind-address = 127.0.0.1

sudo systemctl restart mysql

# 방화벽에서 3307 포트 차단
sudo ufw delete allow 3307/tcp
```

### 15.2 SSH 보안

```bash
# SSH 포트 변경 (선택)
sudo vim /etc/ssh/sshd_config
# Port 2222 (또는 다른 포트)

sudo systemctl restart sshd
sudo ufw allow 2222/tcp
```

### 15.3 Fail2Ban 설치 (무차별 대입 공격 방지)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 1️⃣6️⃣ 놀친 부분 체크리스트

✅ **완료된 항목**:
- [x] Node.js 설치
- [x] MySQL 설치 및 외부 접속 설정
- [x] 데이터베이스 및 사용자 생성
- [x] 테이블 생성 (dev_db.sql)
- [x] 소스 코드 클론 (Git)
- [x] Backend_Node 빌드 및 실행 (PM2)
- [x] Frontend_Node 빌드
- [x] Nginx 리버스 프록시 설정
- [x] 도메인 연결 (kioskfront, kioskapi)
- [x] SSL 인증서 (Let's Encrypt)

❓ **추가 검토 필요**:
- [ ] **Java 설치**: 현재 프로젝트에서 Java를 사용하지 않는 것으로 보입니다. `package.json`에 Java 관련 의존성이 없으므로 설치 불필요.
- [x] **CORS 설정**: ✅ **완료됨** - `Backend_Node/src/server.ts`에 CORS 미들웨어가 추가되었습니다.
  - `DEV_MODE=false` (프로덕션): `https://kioskfront.ydc1981.pe.kr`만 허용
  - `DEV_MODE=true` (개발): 모든 도메인 허용
  - `cors` 패키지가 `package.json`에 추가되어 있으므로 `npm install` 시 자동 설치됨
- [ ] **환경변수 동기화**: Frontend의 `.env` 파일에서 `NodePath`가 `https://kioskapi.ydc1981.pe.kr`로 설정되었는지 확인.
- [ ] **업로드 디렉터리**: Backend에서 파일 업로드를 사용한다면, `uploads/` 폴더 권한 확인:
  ```bash
  mkdir -p /var/www/Kiosk/Backend_Node/uploads
  chmod 755 /var/www/Kiosk/Backend_Node/uploads
  ```
- [ ] **Nginx 파일 업로드 제한**: 큰 파일 업로드 시 Nginx 설정 조정:
  ```nginx
  client_max_body_size 100M;
  ```

---

## 1️⃣7️⃣ 최종 접속 확인

```bash
# 1. 프론트엔드 접속
echo "프론트엔드: https://kioskfront.ydc1981.pe.kr"

# 2. Kiosk 백엔드 API 접속
echo "Kiosk 백엔드: https://kioskapi.ydc1981.pe.kr"

# 3. Travel 백엔드 API 접속
echo "Travel 백엔드: https://travelapi.ydc1981.pe.kr"

# 4. 서버 상태 종합 점검
echo "=== 서비스 상태 ===" && \
sudo systemctl is-active mysql nginx && \
pm2 status && \
echo "=== 포트 리스닝 ===" && \
sudo netstat -tlnp | grep -E ':(80|443|3004|3005)'
```

**축하합니다! 🎉** 
모든 설정이 완료되었습니다. 브라우저에서 `https://kioskfront.ydc1981.pe.kr`에 접속하여 Kiosk 관리 페이지를 확인하세요.

---

## 📚 참고 자료

- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
- [PM2 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MySQL 8.0 공식 문서](https://dev.mysql.com/doc/refman/8.0/en/)

---

**작성일**: 2026-02-15  
**버전**: 1.0  
**작성자**: ydc1981
