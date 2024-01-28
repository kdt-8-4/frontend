# React CI/CD 구축 과정

*※인스턴스는 비용 문제로 닫아둔 상태입니다.※*

**배포 과정** : commit & push → git action 실행 → 프로젝트 빌드 → 도커 이미지 생성 → 도커 허브 로그인 → 도커 이미지 퍼블리싱 → ec2 원격 접속 → shell 명령어로 docker 이미지 pull 후 run

자세한 사항을 설명하자면

1. EC2를 만들고 Putty로 열어서 도커 사용환경을 구축
2. 그 다음에 최상단에 깃액션 파일(.github/workflows/파일이름.yml)을 만들어주고, Dockerfile과 dockerignore를 만듦
3.  Node.js 위에서 실행시켜주기 위해 만드는 conf/conf.d/default.conf 파일과 필요한 시크릿 값들을 생성한 뒤 레포지토리에 push를 하면 자동으로 서버에 배포됨

- **EC2 인스턴스 제작 후 Docker 사용 환경 구축**

우분투 접속 후, 패키지 업데이트

```bash
sudo apt update
```

https 관련 패키지 설치

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

Docker Repository 접근 위한 gpg키 설정

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

Docker Repository 등록

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
```

패키지 업데이트

```bash
sudo apt update
```

Docker 설치 후, 설치확인

```bash
sudo apt install docker-ce
docker --version
```

- **레포지토리에 시크릿값 설정해주기**

환경 설정 파일과 workflows에서 가져오는 키값을 레포지토리에서 설정해주어야합니다.

 **- Docker의 아이디와 토큰 시크릿 값에 넣기**

로그인 후, 맨 위 오른쪽 계정 클릭 → Account Settings 클릭

왼쪽 목록 중 Security 클릭

New Access Token으로 Token 생성, 생성된 키값 복사, 따로 기록해두어야 합니다.(중요)

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/80df9d36-8c02-491a-84fb-86f8ae31f9a2/cb0a6930-268c-4077-b900-25e34c5ba09a/Untitled.png)

 **- EC2의 인증키 pem파일로 변경 후 시크릿 값에 넣기**

pem키를 저장할때 일단 ppk로 받아온 키를 Putty Zen에서 가져오고 

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/80df9d36-8c02-491a-84fb-86f8ae31f9a2/6f198519-96fe-4d70-ba7c-feccbd7e322d/Untitled.png)

이렇게 클릭하여 pem으로 저장한 후에 메모장으로 열어서 그 모두를 복붙해 시크릿 값으로 저장하면 됩니다.

 **- Nginx를 실행해주는 default.conf도 시크릿 값에 올려주기** 

아래에 작성해 놓았습니다.

- **CI/CD 구축 시작**
    
    파일 구조
    
    만들어야하는 폴더와 파일
    
    .gihub
    
    - workflows(폴더)
        - workflows_front
    - conf
        - conf.d
            - default.conf
    - .dockerignore
    - Dockerfile

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/80df9d36-8c02-491a-84fb-86f8ae31f9a2/077ea105-d098-47e4-8a66-5acb0c63528b/Untitled.png)

workflows_front 파일

```jsx
name: Node.js CI with Nginx   # 어떤 액션인지 알려주는 제목
on:
  push:
       
    branches: [ main ]
  pull_request:
        #action 파일은 레포지토리 디렉토리 최상단에만 위치해있어야하기 때문에 작업 수행할 path 지정
    branches: [ main ]     #예시엔 main으로 되어있지만, 각각 서비스에 해당하는 브랜치로 정의

permissions:
  contents: read

jobs:
  build:

    runs-on: ubuntu-latest
    
    steps:

      - uses: actions/checkout@v3
      - name: Setup Node.js environment
        uses: actions/setup-node@v2.5.2
        with:
          node-version: lts/Hydrogen

      - name: Cache node modules
          # 그걸 제공하는 Action도 있다.
        uses: actions/cache@v2.1.8
          # 해당 step을 대표하는 id를 설정할 수도 있다. 해당 값은 뒤의 step에서 사용한다.
        id: cache
        with:
          # node_modules라는 폴더를 검사하여
          path: node_modules
          # 아래 키값으로 cache가 돼있는지 확인한다.
          key: npm-packages-${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        if: steps.cache.outputs.cache-hit != 'true'
        run: npm install
  
      - name: Build
        run: npm run build

      - name : 도커 이미지 빌드
        run : docker build -t dongdung507/front_service .     #도커허브아이디/서비스명으로 정의

      - name : 도커 허브 로그인
        uses : docker/login-action@v2
        with :
          username : ${{ secrets.WEATHER_FRONT_DOCKER_ID }}      #레포지토리 시크릿 키값에 도커허브 아이디
          password : ${{ secrets.WEATHER_FRONT_DOCKER_TOKEN }}         #이전에 발급한 토큰값

      - name : 도커 퍼블리싱
        run : docker push dongdung507/front_service        #빌드한 이미지 도커허브에 push

      - name : ec2 접속 및 애플리케이션 실행
        uses : appleboy/ssh-action@v0.1.6
        with :
          host : ${{ secrets.EC2_HOST }}           #배포할 인스턴스 ip
          username : ubuntu                        #인스턴스 기본 username(ubuntu), 혹시 다른걸로 지정하셨으면 그걸로 쓰시면됩니다
          key : ${{ secrets.EC2_PEMKEY }}          #인스턴스 생성 시 발급받은 키페어(아래에 pem파일로 변환하는 방법 링크)
          port : 22
          script : |                                     #서버 셸스크립트 명령어 실행
            echo "${{ secrets.FOR_NGINX_DEFAULT_CONF }}" | base64 --decode > /home/ubuntu/conf/conf.d/default.conf
            sudo docker stop $(sudo docker ps -a -q)     #실행중인 컨테이너 중지
            sudo docker rm $(sudo docker ps -a -q)       # 삭제
            sudo docker pull dongdung507/front_service      # 도커허브에서 이미지 최신버전 가져오기
            sudo docker run -d -p 80:80 dongdung507/front_service     #이미지 사용해 컨테이너 실행(포트번호 주의)
```

Dockerfile

```jsx
FROM node:lts as build

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm run build

FROM nginx:stable-alpine

# nginx의 기본 설정을 삭제하고 앱에서 설정한 파일을 복사
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

# 위 스테이지에서 생성한 빌드 결과를 nginx의 샘플 앱이 사용하던 폴더로 이동
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

# nginx 실행
CMD [ "nginx", "-g", "daemon off;" ]
```

.dockerignore

```jsx
node_modules
build
.git
.gitignore
.github
README.md
*.pem
```

default.conf

```jsx
server {
    listen 80;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```
