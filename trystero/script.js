import { joinRoom } from 'https://esm.run/trystero'

const config = { appId: 'yunTechChat' }
const room = joinRoom(config, 'chatRoom')

// 建立 action: chat
const [sendChat, getChat] = room.makeAction('chat')

// DOM 元素
const chatBox = document.getElementById('chat')
const input = document.getElementById('messageInput')
const sendBtn = document.getElementById('sendBtn')

// 工具函式：顯示訊息
function appendMessage(text, className='msg') {
    const div = document.createElement('div')
    div.textContent = text
    div.className = className
    chatBox.appendChild(div)
    chatBox.scrollTop = chatBox.scrollHeight
}

// 加入/離開提示
room.onPeerJoin(peerId => {
    appendMessage(`${peerId} 加入聊天室`, 'system')
})
room.onPeerLeave(peerId => {
    appendMessage(`${peerId} 離開聊天室`, 'system')
})

// 接收訊息
getChat((msg, peerId) => {
    appendMessage(`${peerId}: ${msg}`)
})

// 送出訊息
function sendMessage() {
    const text = input.value.trim()
    if (text) {
        appendMessage(`我: ${text}`)
        sendChat(text)
        input.value = ''
    }
}

sendBtn.addEventListener('click', sendMessage)
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage()
})