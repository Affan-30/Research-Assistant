// document.addEventListener('DOMContentLoaded', () => {

//     // 🔹 Load saved notes when extension opens
//     chrome.storage.local.get(['researchNotes'], (result) => {
//         if (result.researchNotes) {
//             document.getElementById('notes').value = result.researchNotes;
//         }
//     });

//     document.getElementById('SummarizeBtn')
//         .addEventListener('click', summarizeText);

//     document.getElementById('saveNotesBtn')
//         .addEventListener('click', saveNotes);
// });


// // 🔹 Save notes to local storage
// function saveNotes() {
//     const notes = document.getElementById('notes').value;

//     chrome.storage.local.set({ researchNotes: notes }, () => {
//         alert("Notes Saved Successfully!");
//     });
// }


// let isProcessing = false;

// async function summarizeText() {
//     if (isProcessing) return;
//  const btn = document.getElementById('SummarizeBtn');
//     btn.disabled = true;
//     btn.textContent = 'Processing...';
//     isProcessing = true;
//     try {

//  const [tab] = await chrome.tabs.query({
//             active: true,
//             currentWindow: true
//         });

//         const [{ result }] = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => window.getSelection().toString()
//         });

//         if (!result) {
//             showResult('Please select some text first');
//             return;
//         }

//         const response = await fetch(
//             'http://localhost:8080/api/research/process',
//             {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     content: result,
//                     operation: 'summarize'
//                 })
//             }
//         );

//         if (!response.ok) {
//             throw new Error(`API Error: ${response.status}`);
//         }

//         const text = await response.text();
//         showResult(text.replace(/\n/g, '<br>'));


//     } catch (error) {
//         showResult('Error: ' + error.message);
//     }finally {
//         isProcessing = false;
//         btn.disabled = false;
//          btn.textContent = 'Summarize';
//     }
// }


// // 🔹 Summarize selected text



// // 🔹 Display result
// function showResult(content) {
//     document.getElementById('results').innerHTML = `
//         <div class="result-item">
//             <div class="result-content">${content}</div>
//         </div>`;
// }

console.log('sidepanel.js loaded');

document.addEventListener('DOMContentLoaded', () => {

    const summarizeBtn = document.getElementById('summarizeBtn');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const notes = document.getElementById('notes');

    if (!summarizeBtn || !saveNotesBtn || !notes) {
        console.error('Required DOM elements missing');
        return;
    }

    chrome.storage.local.get(['researchNotes'], (result) => {
        if (result.researchNotes) {
            notes.value = result.researchNotes;
        }
    });

    
    summarizeBtn.addEventListener('click', summarizeText);
    saveNotesBtn.addEventListener('click', saveNotes);
});

async function summarizeText() {
    const btn = document.getElementById('summarizeBtn');
    btn.disabled = true;
    btn.textContent = 'Summarizing...';

    try {
        const [tab] = await chrome.tabs.query({ active:true, currentWindow: true});
        const [{ result }] = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => window.getSelection().toString()
        });

        if (!result) {
            showResult('Please select some text first');
            return;
        }

        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: 'summarize'})
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g,'<br>'));

    } catch (error) {
        showResult('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Summarize';
    }
}


async function saveNotes() {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ 'researchNotes': notes}, function() {
        alert('Notes saved successfully');
    });
}


function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
}