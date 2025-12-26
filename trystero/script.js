import { joinRoom } from 'https://esm.run/trystero'

// 設定房間 ID (為了避免與原本的聊天室衝突，建議換個 ID 或 Namespace)
const config = { appId: 'yunTechRPS_Game9999' }
const room = joinRoom(config, 'rpsRoom')

// 建立 action: move (傳送出拳動作)
const [sendMove, getMove] = room.makeAction('move')

// 變數
let myMove = null
let opponentMove = null
let opponentId = null
let isProcessing = false // 防止連點或重複處理

// DOM 元素
const statusEl = document.getElementById('status')
const gameArea = document.getElementById('game-area')
const historyEl = document.getElementById('history')
const btns = {
    rock: document.getElementById('btn-rock'),
    paper: document.getElementById('btn-paper'),
    scissors: document.getElementById('btn-scissors')
}

// 初始化按鈕事件
btns.rock.onclick = () => play('rock')
btns.paper.onclick = () => play('paper')
btns.scissors.onclick = () => play('scissors')

// ----------------------
// 連線事件處理
// ----------------------

room.onPeerJoin(peerId => {
    // 簡單實作：只允許與第一個加入的人玩
    if (!opponentId) {
        opponentId = peerId
        updateStatus('對手已加入！請出拳。')
        gameArea.style.display = 'block'
        resetRound()
        log(`對手 ${peerId} 加入遊戲`)
    }
})

room.onPeerLeave(peerId => {
    if (peerId === opponentId) {
        opponentId = null
        updateStatus('對手已離開，等待新對手...')
        gameArea.style.display = 'none'
        log(`對手 ${peerId} 離開遊戲`)
    }
})

// ----------------------
// 遊戲邏輯
// ----------------------

// 接收對手出拳
getMove((move, peerId) => {
    if (peerId !== opponentId) return

    opponentMove = move
    console.log('收到對手出拳')
    
    if (myMove) {
        // 如果我也出過拳了，直接結算
        revealResult()
    } else {
        // 對手先出拳，我還沒出
        updateStatus('對手已出拳，輪到你了！')
    }
})

// 我方出拳
function play(move) {
    if (myMove || !opponentId || isProcessing) return

    myMove = move
    sendMove(move) // 發送給對方
    
    // 視覺回饋：選中的亮起，其他的變暗
    updateButtonVisuals()

    if (opponentMove) {
        // 對手已經出過拳了，結算
        revealResult()
    } else {
        updateStatus('你已出拳，等待對手...')
    }
}

// 結算勝負
function revealResult() {
    isProcessing = true
    const result = calculateWinner(myMove, opponentMove)
    
    // 顯示結果
    const myIcon = getIcon(myMove)
    const oppIcon = getIcon(opponentMove)
    
    let msg = ''
    if (result === 'win') {
        msg = `🎉 你贏了！ (${myIcon} vs ${oppIcon})`
        statusEl.style.color = 'green'
    } else if (result === 'lose') {
        msg = `😭 你輸了... (${myIcon} vs ${oppIcon})`
        statusEl.style.color = 'red'
    } else {
        msg = `🤝 平手！ (${myIcon} vs ${oppIcon})`
        statusEl.style.color = 'orange'
    }
    
    statusEl.textContent = msg
    log(msg)

    // 3秒後重新開始
    setTimeout(() => {
        resetRound()
    }, 3000)
}

// 判斷邏輯
function calculateWinner(me, opp) {
    if (me === opp) return 'tie'
    if ((me === 'rock' && opp === 'scissors') ||
        (me === 'paper' && opp === 'rock') ||
        (me === 'scissors' && opp === 'paper')) {
        return 'win'
    }
    return 'lose'
}

// 重置局狀態
function resetRound() {
    myMove = null
    opponentMove = null
    isProcessing = false
    statusEl.style.color = '#333'
    
    if (opponentId) {
        updateStatus('新的一局！請出拳')
        enableButtons()
    } else {
        updateStatus('等待對手...')
    }
}

// ----------------------
// UI 輔助函式
// ----------------------

function updateStatus(text) {
    statusEl.textContent = text
}

function getIcon(move) {
    const map = { rock: '✊', paper: '🖐️', scissors: '✌️' }
    return map[move] || '?'
}

function updateButtonVisuals() {
    // 禁用所有按鈕，並標示選中的
    Object.keys(btns).forEach(k => {
        btns[k].disabled = true
        if (k !== myMove) {
            btns[k].style.opacity = '0.3'
        }
    })
}

function enableButtons() {
    Object.keys(btns).forEach(k => {
        btns[k].disabled = false
        btns[k].style.opacity = '1'
    })
}

function log(text) {
    const div = document.createElement('div')
    div.textContent = text
    historyEl.prepend(div)
}