let listLogs = null
window.addEventListener('click', unconfirmPixelDeletion);

function signOut() {
    window.location.replace(window.location.origin + "/signout");
}

function asLink(id) { return `${window.location.origin}/pixel.png?id=${id}`; }
function asImage(id) { return `<img src="${asLink(id)}" width="1" height="1">`; }

function requestLogs() {
    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            action: 'log_list'
        })
    })
        .then(r => r.json())
        .then(data => {
            listLogs = data;
            displayRequests();
        });
}
function displayRequests() {
    const container = document.getElementById('log-cont');
    container.innerHTML = '';

    if (Object.keys(listLogs).length === 0) {
        container.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center;"><p style="margin-bottom: 6px;">No pixels yet? Start by creating one by clicking the button below:</p><p style="margin-top: 0;"><button type="button" class="tool-btn" onclick="newPixel();" style="padding: 12px"><i class="fa fa-plus"></i> Create first pixel</button></p></div>';
    }

    for (const k in listLogs) {
        if (!Object.hasOwn(listLogs, k)) continue;

        const count = listLogs[k];

        const log = document.createElement('div');
        log.dataset.id = k;
        log.classList.add('log');
        log.innerHTML = `
            <div class="top">
                <i class="fa fa-book-bookmark logo-icon"></i>
                <span class="title">${k} </span>
                <div style="flex-grow: 1;"></div>
                <button type="button" onclick="copyID(event, '${k}', false)" class="tooltip tooltip-right tool-btn" tooltip-text="Copy link"><i class="fa fa-copy"></i></button>
                <button type="button" onclick="copyID(event, '${k}', true)" class="tooltip tooltip-right tool-btn" tooltip-text="Copy HTML image"><i class="fa fa-images"></i></button>
                <span class="requests">${count} requests</span>
                <i class="fa fa-caret-down dropdown-icon"></i>
            </div>
            <div class="content">
                <div class="data">Loading . . .</div>
            </div>
        `;

        const top = log.querySelector('.top');
        const content = log.querySelector('.content');
        top.addEventListener('click', () => logClick(log, content));

        container.appendChild(log);
    }
}
function logClick(log, content) {
    if (content.clientHeight > 0) { // Collapse
        content.style.height = "0px";
        content.style.minHeight = "0px";
    } else { // Open
        if (!log.dataset.loaded) {
            loadLog(log, content);
            return;
        }

        content.style.height = content.scrollHeight + "px";
        content.style.minHeight = content.scrollHeight + "px";
    }
}
function copyID(event, id, image) {
    event.stopPropagation();
    text = image ? asImage(id) : asLink(id);

    copyToClipboard(text);
}
function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}
function loadLog(log, content) {
    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            action: 'log_list',
            id: log.dataset.id
        })
    })
        .then(r => r.json())
        .then(data => {
            log.dataset.loaded = true;
            fillUpLog(data, content, log.dataset.id);
        })
        .catch(e => {
            console.error('Error while loading log!', e);
            log.dataset.loaded = false;
        });
}
function fillUpLog(data, content, id) {
    const dataHolder = content.querySelector('.data');
    dataHolder.innerHTML = '';

    if (data.length === 0)
        dataHolder.innerHTML = '<p style="width: 100%; text-align: center; color: var(--muted); font-size: 1rem;">No requests triggered yet</p>';
    else
        data.forEach(d => {
            const entry = document.createElement('div');
            entry.classList.add('entry');

            entry.innerHTML = `
            <span class="title"><i class="fa fa-bullseye-arrow"></i>${d.date}</span>
            <div class="data-list">
                <div class="data-row">
                    <span>IP: </span>
                    <span>${d.ip}</span>
                </div>
                <div class="data-row">
                    <span>User Agent: </span>
                    <span>${d.useragent}</span>
                </div>
                <div class="data-row">
                    <span>Path: </span>
                    <span>${d.path}</span>
                </div>
                <div class="data-row">
                    <span>Host: </span>
                    <span>${d.host}</span>
                </div>
            </div>
        `;

            dataHolder.appendChild(entry);
        });

    const deleteContainer = document.createElement('div');
    deleteContainer.innerHTML = `<button type="button" class="red-btn"><i class="fa fa-trash-can"></i> <span>Delete pixel</span></button>`;
    const deleteBtn = deleteContainer.querySelector('button');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (deleteBtn.dataset.clicked === 'true') {
            fetch('/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'delete',
                    id: id
                })
            })
                .then(r => {
                    if (!r.ok)
                        alert('Failed to delete pixel!');
                })
                .catch(e => {
                    console.error('Error whilst deleting pixel: ', e);
                });
            requestLogs();
        }
        else {
            deleteBtn.dataset.clicked = true;
            deleteBtn.querySelector('span').textContent = 'Click again to confirm'
        }
    });

    dataHolder.appendChild(deleteContainer);

    content.style.height = content.scrollHeight + "px";
    content.style.minHeight = content.scrollHeight + "px";
}
function unconfirmPixelDeletion() {
    const btn = document.getElementById('log-cont').querySelector('button[data-clicked]');

    if (!btn)
        return;

    btn.dataset.clicked = false;
    btn.querySelector('span').textContent = 'Delete pixel';
}

function newPixel() {
    const modal = document.getElementById('pixel-modal');

    if (modal) {
        document.getElementById('pixel-error').classList.add('hidden');
        document.getElementById('pixel-id').value = '';
        document.getElementById('pixel-href').textContent = '';
        document.getElementById('pixel-href-container').classList.add('hidden');
        document.getElementById('pixel-invalid-container').classList.add('hidden');
        document.getElementById('create-pixel-btn').disabled = true;
        modal.classList.remove('hidden');
    }
}
function updatePixelHref() {
    const field = document.getElementById('pixel-href');
    const id = document.getElementById('pixel-id').value.trim();
    const invalidCharacters = /[^0-9a-zA-Z]/.test(id);
    const valid = id.length > 0 && id.length <= 20 && !invalidCharacters;

    field.textContent = valid ? asLink(id) : '';
    document.getElementById('pixel-href-container').classList.toggle('hidden', !valid);
    document.getElementById('create-pixel-btn').disabled = !valid;
    document.getElementById('pixel-invalid-container').classList.toggle('hidden', !invalidCharacters);
}
function copyNewPixelID(image) {
    const id = document.getElementById('pixel-id').value.trim();

    if (id.length === 0)
        return;

    copyToClipboard(image ? asImage(id) : asLink(id));
}
function createPixel() {
    const pixelId = document.getElementById('pixel-id').value.trim();

    if (pixelId.length < 1)
        return;

    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            action: 'pixel',
            id: pixelId
        })
    })
        .then(async r => [r.ok, r.status, await r.text()])
        .then(t => {
            const [ok, code, text] = t;

            const textP = document.getElementById('pixel-error-text');
            const errorContainer = document.getElementById('pixel-error');
            errorContainer.classList.remove('hidden');

            if (!ok)
                textP.textContent = `${text} (${code})`;
            else {
                textP.textContent = 'Pixel successfully created!';
                requestLogs();
            }

            errorContainer.classList.toggle('error', !ok);
            errorContainer.classList.toggle('success', ok);
        })
        .catch(e => {
            console.error('Error whilist trying to create pixel: ', e);
            document.getElementById('pixel-error').classList.remove('hidden');
            document.getElementById('pixel-error-text').textContent = 'Unknown error happened!';
        });
}
function closePixelModal() {
    const modal = document.getElementById('pixel-modal');

    if (modal)
        modal.classList.add('hidden');
}