import {joinRoom} from 'https://esm.run/trystero'

const config = { appId: 'yunTechChat' }
const room = joinRoom(config, 'cursorRoom')

// 存放其他 peer 的游標 div
const cursors = {}

// 建立一個訊息元素
function appendMessage(text) {
    const p = document.createElement('p')
    p.textContent = text
    document.body.appendChild(p)
}

// 當有人加入
room.onPeerJoin(peerId => {
    appendMessage(`${peerId} 加入!`)
    // 建立一個紅色游標代表這個 peer
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'

    const div = document.createElement('div')
    div.className = 'cursor'

    const label = document.createElement('span')
    label.textContent = peerId

    wrapper.appendChild(div)
    wrapper.appendChild(label)
    document.body.appendChild(wrapper)

    cursors[peerId] = wrapper
})

// 當有人離開
room.onPeerLeave(peerId => {
    appendMessage(`${peerId} 離開!`)
    if (cursors[peerId]) {
        cursors[peerId].remove()
        delete cursors[peerId]
    }
})

// 建立 mouseMove action
const [sendMove, getMove] = room.makeAction('mouseMove')

// 建立一個 div 代表自己
const myWrapper = document.createElement('div')
myWrapper.style.position = 'absolute'

const myCursor = document.createElement('div')
myCursor.className = 'cursor me'

const myLabel = document.createElement('span')
myLabel.textContent = 'Me'

myWrapper.appendChild(myCursor)
myWrapper.appendChild(myLabel)
document.body.appendChild(myWrapper)

// 追蹤自己的滑鼠並廣播座標
window.addEventListener('mousemove', e => {
    myWrapper.style.left = e.clientX + 'px'
    myWrapper.style.top = e.clientY + 'px'
    sendMove([e.clientX, e.clientY])
})

// 接收其他 peer 的座標並更新對應 div
getMove(([x, y], peerId) => {
    const wrapper = cursors[peerId]
    if (wrapper) {
        wrapper.style.left = x + 'px'
        wrapper.style.top = y + 'px'
    }
})
