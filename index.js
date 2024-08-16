const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const links = [...document.querySelectorAll('li')]

function lerp(start, end, t){
    return start * (1 - t) + end * t 
}

for(let i=0; i<links.length; i++){
    links[i].addEventListener('mouseover', () => {
        for(let j=0; j<links.length; j++){
            if(j !== i){ // 마우스 호버 안된 경우
                links[j].style.opacity = 0.2
                links[j].style.zIndex = 0
            }else{ // 마우스 호버된 경우
                links[j].style.opacity = 1
                links[j].style.zIndex = 3
            }
        }
    })
    links[i].addEventListener('mouseleave', () => {
        for(let j=0; j<links.length; j++){
            links[j].style.opacity = 1
        }
    })
    links[i].addEventListener('mouseenter', () => {
        imgIndex = i // 어떤 이미지를 보여줄지 선택함
        target = 1 // 이미지를 보여주기를 선택함
    })
    links[i].addEventListener('mouseleave', () => {
        target = 0 // 이미지를 숨기도록 선택함
    })
}

let imgIndex = 0
const images = [ // 이미지 소스
    'views/1.jpeg',
    'views/2.jpeg',
    'views/3.jpeg',
    'views/4.jpeg',
    'views/5.jpeg',
    'views/6.jpeg',
]

let imgArr = [] // 이미지 요소

// canvas mousemove variable
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX
    targetY = e.clientY
})

images.forEach((image, idx) => {
    let elImage = new Image(300) // 이미지 요소 생성
    elImage.src = image
    elImage.classList.add('project-image')
    console.log(elImage)
    document.body.appendChild(elImage)
    imgArr.push(elImage)
})

// draw images to the canvas

let percent = 0 // 이미지의 선명도
let target = 0 // 이미지 보이고 사라지는 플래그

function drawImage(idx){
    let {width, height} = imgArr[idx].getBoundingClientRect() // 이미지 요소의 크기 조회 (조회를 위해서는 이미지 요소가 도큐먼트에 존재해야 함)
    canvas.width = width * window.devicePixelRatio // 캔버스에 물리적인 픽셀을 적용함으로써 이미지를 더 선명하게 표현함 (맥북 레티나 디스플레이는 1보다 큰값이므로 이를 고려하기 위함)
    canvas.height = height * window.devicePixelRatio 
    canvas.style.width = `${width}px` // 스타일 적용을 위한 픽셀은 css 픽셀에 맞추기
    canvas.style.height = `${height}px`

    // pixelate image by diabling the smoothing (이미지 크기를 조정한 경우 픽셀이 선명하게 보이도록 함)
    ctx.webkitImageSmoothingEnabled = false 
    ctx.mozImageSmoothingEnabled = false 
    ctx.msSmoothingSmoothingEnabled = false 
    ctx.imageSmoothingEnabled = false 

    // 이미지가 초반에 빠르게 나타남
    if(target === 1){
        // 2 speeds to make the effect more gradual
        if(percent < 0.2){ // percent 가 0.2 보다 작을때는 1%씩 증가
            percent += .01
        }else if(percent < 1){ // percent 가 0.2와 1 사이일때는 10%씩 증가 (증가속도 더 빨라짐)
            percent += .1
        }
    // 이미지가 초반에 빠르게 사라짐    
    }else if(target === 0){ // percent 가 0.2와 1 사이일때는 30%씩 감소 (감소속도 더 빨라짐)
        if(percent > 0.2){
            percent -= .3 
        }else if(percent > 0){ // percent 가 0.2 보다 작을때는 1%씩 감소 
            percent -= .01
        }
    }

    let scaledWidth = width * percent // scaledWidth : 이미지의 몇 % 만큼 이미지를 축소할 것인지 결정
    let scaledHeight = height * percent 

    if(percent >= 1){ // 이미지가 완전히 브라우저 화면에 선명하게 나타난 시점
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio) // 캔버스의 좌표계를 DPR에 맞춰 확대/축소하기 (화면에 선명하게 보이도록 함)
        ctx.drawImage(imgArr[idx], 0, 0, width, height) // 캔버스에 선택된 원본 이미지를 그림
    }else{ // 이미지가 아직 완전히 브라우저 화면에 나타나지 않은 경우
        ctx.drawImage(imgArr[idx], 0, 0, scaledWidth, scaledHeight) // 캔버스에 선택된 이미지를 축소해서 그림 (해당 이미지는 사용자에게 보이지 않는 중간과정이므로 굳이 선명하게 보일 필요가 없음. 그래서 ctx.scale 을 적용하지 않음. 그리고 축소된 이미지는 선명하게 보이나 흐릿하게 보이나 비슷하므로 ctx.scale 적용하지 않음)
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio) // 캔버스의 좌표계를 DPR에 맞춰 확대/축소하기 (화면에 선명하게 보이도록 함)
        if(canvas.width !== 0 && canvas.height !== 0){
            ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height) // 캔버스에 축소된 이미지를 이미지 크기만큼 확대함. 이렇게 하면 이미지가 픽셀처럼 보임
        }
    }
}

function animate(){
    currentX = lerp(currentX, targetX, 0.05) // 캔버스가 부드럽게 이동하도록 함
    currentY = lerp(currentY, targetY, 0.05)
    // imgArr[imgIndex] : 현재 마우스로 선택한 이미지 요소
    let {width, height} = imgArr[imgIndex].getBoundingClientRect() // 선택한 이미지의 너비와 높이 조회
    canvas.style.transform = `translate3d(${currentX - (width / 2)}px, ${currentY - (height / 2)}px, 0)` // 마우스 포인트가 사진 중앙에 위치하도록 width / 2 와 height / 2 만큼 빼줌
    drawImage(imgIndex)
    window.requestAnimationFrame(animate)
}

animate()


