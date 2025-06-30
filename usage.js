function getRemain(probeKey = '__probe__') {
    const maxKB = 20480;
    const step = 1;

    let low = 0;
    let high = maxKB;
    let best = 0;

    const makeValue = (kb) => 'x'.repeat((kb * 1024) / 2); // 每字元 2 bytes
    const keyBytes = probeKey.length * 2;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        try {
            localStorage.setItem(probeKey, makeValue(mid));
            best = mid;
            low = mid + step;
        } catch (e) {
            high = mid - step;
        }
    }

    localStorage.removeItem(probeKey);
    const totalBytes = best * 1024 + keyBytes;
    const totalKB = (totalBytes / 1024).toFixed();
    console.log(totalBytes)

    return totalKB;
}

// function getUsage() {
//     let totalBytes = 0;

//     function estimateUTF16Size(str) {
//         let bytes = 0;
//         for (let i = 0; i < str.length; i++) {
//             const code = str.charCodeAt(i);
//             bytes += code <= 0xffff ? 2 : 4; // surrogate pair 判斷
//         }
//         return bytes;
//     }

    
//     const usageDetial = []
//     for (const key in localStorage) {
//         if (localStorage.hasOwnProperty(key)) {
//             const value = localStorage.getItem(key) || '';
//             const keyBytes = estimateUTF16Size(key);
//             const valueBytes = estimateUTF16Size(value);
//             const entryBytes = keyBytes + valueBytes;
//             totalBytes += entryBytes;

//             usageDetial.push({
//                 key: key.slice(0, 10),
//                 usage: (entryBytes / 1024).toFixed()
//             })
//         }
//     }

//     const totalKB = (totalBytes / 1024).toFixed();
//     return { totalKB, usageDetial };
// }

function getUsage(key = 'estimate_records') {
    const raw = localStorage.getItem(key);
    if (!raw) return { totalKB: 0, usageDetail: [] };

    let records;
    try {
        records = JSON.parse(raw);
    } catch (e) {
        console.warn('❌ 無法解析 JSON：', e);
        return { totalKB: 0, usageDetail: [] };
    }

    function estimateUTF16Size(str) {
        let bytes = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            bytes += code <= 0xffff ? 2 : 4;
        }
        return bytes;
    }

    const usageDetail = [];
    let totalBytes = 0;

    records.forEach((item, index) => {
        const json = JSON.stringify(item);
        const bytes = estimateUTF16Size(json);
        totalBytes += bytes;
        usageDetail.push({
            index,
            usageKB: (bytes / 1024).toFixed(2),
            customerName: item.customerName
        });
    });

    const totalKB = (totalBytes / 1024).toFixed(2);
    return { totalKB, usageDetail };
}


const remain = getRemain();
const { totalKB, usageDetail } = getUsage();

// console.log(`📦 localStorage 總用量： ${totalKB} KB`)
// console.log(`\n📋 localStorage 使用明細：`)
// usageDetail.forEach( usageItem => {
//     console.log(`\n🔑 ${usageItem.customerName} = ${usageItem.usageKB} KB<br>`)
// });
// console.log(`\n\n剩餘容量： ${remain} KB`)

const usageBar = document.querySelector('#usage');
usageBar.setAttribute('max', Number(totalKB) + Number(remain));
usageBar.setAttribute('value', Number(totalKB));

const remainUsageSpan = document.querySelector('#remain_usage');
const currentUsageSpan = document.querySelector('#current_usage');
remainUsageSpan.textContent = `剩餘 ${Number((Number(remain)).toFixed()).toLocaleString('zh-TW')} kb`
currentUsageSpan.textContent = Number(totalKB) + ' kb'

const usage_percentage = document.querySelector('#usage_percentage');
usage_percentage.textContent = `目前用量: ${ ((Number(totalKB) / (Number(totalKB) + Number(remain)).toFixed() * 100).toFixed(2)) || 0}%`;

