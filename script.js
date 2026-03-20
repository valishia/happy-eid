const size = 8;
const words = ['EID','MAAF','FITRI'];
let gridData = Array.from({length:size},()=>Array(size).fill(''));
let foundWords = [];
let isDragging = false;
let startCell = null;
let selectedCells = [];
let direction = null;

const directions = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];

const grid = document.getElementById('grid');
const canvas = document.getElementById('lineCanvas');
const ctx = canvas.getContext('2d');

/* ================= WORD GENERATOR ================= */
function placeWords(){
    words.forEach(word=>{
        let placed=false;
        while(!placed){
            let dir=directions[Math.floor(Math.random()*directions.length)];
            let row=Math.floor(Math.random()*size);
            let col=Math.floor(Math.random()*size);

            let canPlace=true;
            for(let i=0;i<word.length;i++){
                let r=row+dir[0]*i;
                let c=col+dir[1]*i;
                if(r<0||c<0||r>=size||c>=size||gridData[r][c]!==""){
                    canPlace=false; break;
                }
            }

            if(canPlace){
                for(let i=0;i<word.length;i++){
                    let r=row+dir[0]*i;
                    let c=col+dir[1]*i;
                    gridData[r][c]=word[i];
                }
                placed=true;
            }
        }
    });
}

function fillRandom(){
    const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){
            if(gridData[r][c]===''){
                gridData[r][c]=letters[Math.floor(Math.random()*letters.length)];
            }
        }
    }
}

/* ================= RENDER ================= */
function renderGrid(){
    grid.innerHTML='';
    gridData.forEach((row,r)=>{
        row.forEach((letter,c)=>{
            const div=document.createElement('div');
            div.classList.add('cell');
            div.textContent=letter;
            div.dataset.row=r;
            div.dataset.col=c;
            grid.appendChild(div);
        });
    });

    resizeCanvas();
}

function resizeCanvas(){
    const rect = grid.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
}

/* ================= POINTER EVENTS (🔥 FIX) ================= */

// START
grid.addEventListener('pointerdown', (e) => {
    if (!e.target.classList.contains('cell')) return;

    isDragging = true;
    startCell = e.target;
    selectedCells = [startCell];
    direction = null;

    // 🔥 WAJIB (INI YANG KURANG)
    grid.setPointerCapture(e.pointerId);
});

// MOVE
grid.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.classList.contains('cell')) {
        dragOver(el);
    }
});

// END
grid.addEventListener('pointerup', (e) => {
    if (!isDragging) return;

    isDragging = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    checkWord();

    // 🔥 RELEASE (WAJIB)
    grid.releasePointerCapture(e.pointerId);
});

// CANCEL (mobile safety)
grid.addEventListener('pointercancel', () => {
    isDragging = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
});

/* ================= DRAG LOGIC ================= */
function dragOver(cell){
    if(!isDragging) return;

    const r1=parseInt(startCell.dataset.row);
    const c1=parseInt(startCell.dataset.col);
    const r2=parseInt(cell.dataset.row);
    const c2=parseInt(cell.dataset.col);

    let dr=r2-r1;
    let dc=c2-c1;

    let stepR=Math.sign(dr);
    let stepC=Math.sign(dc);

    if(!direction){
        direction=[stepR,stepC];
    }

    if(stepR!==direction[0]||stepC!==direction[1]) return;

    selectedCells=[];

    let len=Math.max(Math.abs(dr),Math.abs(dc));

    for(let i=0;i<=len;i++){
        let r=r1+direction[0]*i;
        let c=c1+direction[1]*i;
        let el=document.querySelector(`[data-row='${r}'][data-col='${c}']`);
        if(el) selectedCells.push(el);
    }

    drawLine(startCell, selectedCells[selectedCells.length-1]);
}

/* ================= DRAW LINE ================= */
function drawLine(start,end){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const gridRect=grid.getBoundingClientRect();
    const sRect=start.getBoundingClientRect();
    const eRect=end.getBoundingClientRect();

    const x1=sRect.left-gridRect.left+sRect.width/2;
    const y1=sRect.top-gridRect.top+sRect.height/2;
    const x2=eRect.left-gridRect.left+eRect.width/2;
    const y2=eRect.top-gridRect.top+eRect.height/2;

    ctx.strokeStyle='#ff8c42';
    ctx.lineWidth=8;
    ctx.lineCap='round';

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

/* ================= CHECK ================= */
function checkWord(){
    let word=selectedCells.map(c=>c.textContent).join('');
    let reversed=word.split('').reverse().join('');

    if(words.includes(word)||words.includes(reversed)){
        selectedCells.forEach(c=>c.classList.add('found'));
        foundWords.push(word);

        if(foundWords.length===words.length){
            showLetterPage();
        }
    }

    selectedCells=[];
}

/* ================= LETTER ================= */
function showLetterPage(){
    document.getElementById('game').style.display='none';
    document.getElementById('letter').style.display='block';
    startTyping();
}

/* ================= MESSAGE ================= */
const message=`Selamat Hari Raya Idul Fitri 🌙✨

Mohon maaf lahir dan batin yaa 🤍
Kalau selama ini ada kata atau sikap yang kurang berkenan, aku minta maaf sebesar-besarnya 🥺

Terima kasih juga untuk semua kenangan, tawa, dan kebersamaan yang udah kita lewatin bareng 💛

Semoga pertemanan kita tetap hangat, penuh cerita, dan terus berlanjut ke depannya 🤍✨

Sincerely, Gya.`;

/* ================= TYPING ================= */
function startTyping(){
    let i=0;
    const el=document.getElementById('typing');

    function type(){
        if(i<message.length){
            el.innerHTML+=message.charAt(i);
            i++;
            setTimeout(type,40);
        }
    }

    type();
}

/* ================= INIT ================= */
placeWords();
fillRandom();
renderGrid();
window.addEventListener('resize', resizeCanvas);