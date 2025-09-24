let score = 0;
let gameRunning = true;
let appleInterval;
let gameSpeed = 2000; // 사과 생성 간격 (밀리초)

const basket = document.getElementById('basket');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// 바구니 위치를 부드럽게 업데이트하는 함수
let targetBasketPosition = window.innerWidth / 2; // 바구니 목표 위치
let currentBasketPosition = targetBasketPosition; // 현재 바구니 위치

function updateBasketPosition() {
    if (gameRunning) {
        // 목표 위치로 부드럽게 이동 (선형 보간)
        const speed = 0.3; // 이동 속도 (0~1, 높을수록 빠름)
        currentBasketPosition += (targetBasketPosition - currentBasketPosition) * speed;
        
        const basketRect = basket.getBoundingClientRect();
        const basketWidth = basketRect.width;
        const maxPosition = window.innerWidth - basketWidth;
        const constrainedPosition = Math.max(0, Math.min(currentBasketPosition, maxPosition));
        
        basket.style.left = constrainedPosition + 'px';
    }
    requestAnimationFrame(updateBasketPosition);
}

// 바구니 위치 업데이트 시작
updateBasketPosition();

// 마우스 움직임에 따라 바구니 목표 위치 변경
document.addEventListener('mousemove', (e) => {
    if (gameRunning) {
        targetBasketPosition = e.clientX;
    }
});

// 사과 생성 함수
function createApple() {
    if (!gameRunning) return;

    const apple = document.createElement('div');
    apple.className = 'apple';
    
    // 랜덤한 x 위치에서 사과 생성
    const randomX = Math.random() * (window.innerWidth - 30);
    apple.style.left = randomX + 'px';
    apple.style.top = '-50px';
    
    // 사과에 고유 ID 부여
    apple.id = 'apple_' + Date.now();
    
    document.querySelector('.game-container').appendChild(apple);
    
    // 사과를 아래로 떨어뜨리기
    let appleTop = -50;
    const fallSpeed = 2; // 떨어지는 속도
    
    const fallApple = () => {
        if (!gameRunning) {
            apple.remove();
            return;
        }
        
        appleTop += fallSpeed;
        apple.style.top = appleTop + 'px';
        
        const appleRect = apple.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();
        
        // 사과가 바닥에 닿았는지 확인
        if (appleTop >= window.innerHeight - 150) {
            // 디버깅 정보 출력
            console.log('사과 위치:', appleRect.left, appleRect.top, appleRect.right, appleRect.bottom);
            console.log('바구니 위치:', basketRect.left, basketRect.top, basketRect.right, basketRect.bottom);
            
            // 바구니와 충돌했는지 확인 (거리 기반 충돌 검사)
            const basketCenterX = basketRect.left + basketRect.width / 2;
            const basketCenterY = basketRect.top + basketRect.height / 2;
            const appleCenterX = appleRect.left + appleRect.width / 2;
            const appleCenterY = appleRect.top + appleRect.height / 2;
            
            const distanceX = Math.abs(basketCenterX - appleCenterX);
            const distanceY = Math.abs(basketCenterY - appleCenterY);
            const maxDistance = 60; // 충돌 범위 (픽셀)
            
            const isCollision = distanceX < maxDistance && distanceY < maxDistance;
            
            console.log('바구니 중심:', basketCenterX, basketCenterY);
            console.log('사과 중심:', appleCenterX, appleCenterY);
            console.log('거리 X:', distanceX, '거리 Y:', distanceY, '충돌:', isCollision);
            
            if (isCollision) {
                // 사과를 잡았을 때
                console.log('사과를 받았습니다! 점수:', score + 10);
                score += 10;
                scoreElement.textContent = score;
                apple.remove();
                
                // 점수에 따라 게임 속도 증가
                if (score > 0 && score % 50 === 0) {
                    clearInterval(appleInterval);
                    gameSpeed = Math.max(800, gameSpeed - 100);
                    appleInterval = setInterval(createApple, gameSpeed);
                }
                return; // 사과를 받았으면 함수 종료
            } else {
                // 사과를 놓쳤을 때
                console.log('사과를 놓쳤습니다!');
                gameOver();
                return; // 게임 오버되면 함수 종료
            }
        } else {
            // 계속 떨어뜨리기
            requestAnimationFrame(fallApple);
        }
    };
    
    // 사과 떨어뜨리기 시작
    requestAnimationFrame(fallApple);
}

// 게임 오버 함수
function gameOver() {
    gameRunning = false;
    clearInterval(appleInterval);
    
    // 모든 사과 제거
    document.querySelectorAll('.apple').forEach(apple => apple.remove());
    
    // 게임 오버 화면 표시
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 게임 재시작 함수
function restartGame() {
    score = 0;
    gameRunning = true;
    gameSpeed = 2000;
    
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    
    // 모든 사과 제거
    document.querySelectorAll('.apple').forEach(apple => apple.remove());
    
    // 사과 생성 재시작
    appleInterval = setInterval(createApple, gameSpeed);
}

// 게임 시작
appleInterval = setInterval(createApple, gameSpeed);

// 터치 이벤트 지원 (모바일)
document.addEventListener('touchmove', (e) => {
    if (gameRunning && e.touches.length > 0) {
        e.preventDefault(); // 스크롤 방지
        const touch = e.touches[0];
        targetBasketPosition = touch.clientX;
    }
});
