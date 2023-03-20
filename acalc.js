let laws = {}
const config = {
    'defaultLawBook': 'Allg.'
}

async function init() {
    let calculatorWindow = document.querySelector('.acalc__wrapper')
    await fetch('./rules.json')
        .then(response => {
            return response.json();
        })
        .then(data => laws = data);
    loadNavigation(calculatorWindow)
    loadContent(calculatorWindow)
    initializeInfo(calculatorWindow)
    unselectButtonListener(calculatorWindow)
    clickRowListener(calculatorWindow)
    copyTextToClipboardListener(calculatorWindow)
    onSearchClick(calculatorWindow)
    onNavItemClick(calculatorWindow)
    infoParamsListener(calculatorWindow)
}

function clickRowListener(calculatorWindow) {
    calculatorWindow.querySelectorAll('.table__row').forEach(function (el) {
        el.addEventListener('click', function () {
            el.classList.toggle('active')
            updateInfos(calculatorWindow)
        })
    })
}

function updateInfos(calculatorWindow) {
    let penalty = getPenaltyAndParagraphs(calculatorWindow)
    let commandType = calculatorWindow.querySelector('.acalc__infos .top_row select').value
    let playerId = calculatorWindow.querySelector('.acalc__infos .top_row #id').value
    let penaltyLength = calculatorWindow.querySelector('.acalc__infos .top_row #length').value

    if(commandType === 'warn'){
        calculatorWindow.querySelector('.acalc__infos .bottom_row .command_text').innerText = `/${commandType} ${playerId} ${penalty['text']}`
        calculatorWindow.querySelector('.acalc__infos .top_row #length').classList.add('hidden')
    }else{
        calculatorWindow.querySelector('.acalc__infos .bottom_row .command_text').innerText = `/${commandType} ${playerId} ${penaltyLength} ${penalty['text']}`
        calculatorWindow.querySelector('.acalc__infos .top_row #length').classList.remove('hidden')
    }

    if(!commandType){
        calculatorWindow.querySelector('.acalc__infos .bottom_row .command_text').innerText = ''
    }

    //TODO: Only show available Options for penalty, currently bugged

    // calculatorWindow.querySelectorAll('.acalc__infos .top_row select option.selectable').forEach(function (el){
    //     el.classList.add('hidden')
    // })
    //
    // if(penalty['possiblePenalties']['mute']) calculatorWindow.querySelector('.acalc__infos .top_row select option.mute').classList.remove('hidden');
    // if(penalty['possiblePenalties']['ajail']) calculatorWindow.querySelector('.acalc__infos .top_row select option.ajail').classList.remove('hidden');
    // if(penalty['possiblePenalties']['ban']) calculatorWindow.querySelector('.acalc__infos .top_row select option.ban').classList.remove('hidden');
    // if(penalty['possiblePenalties']['hardban']) calculatorWindow.querySelector('.acalc__infos .top_row select option.hardban').classList.remove('hidden');
    // if(penalty['possiblePenalties']['warn']) calculatorWindow.querySelector('.acalc__infos .top_row select option.warn').classList.remove('hidden');
}

function getPenaltyAndParagraphs(calculatorWindow) {
    let lawBook = calculatorWindow.querySelectorAll('.acalc__table__content')
    let text = ''
    let possiblePenalties = {
        'mute': false,
        'ajail': false,
        'ban': false,
        'hardban': false,
        'warn': false
    }

    lawBook.forEach(function (el) {
        let checkedEntries = el.querySelectorAll('.table__row.active')

        if (checkedEntries.length > 0) {
            text += el.getAttribute('id') + ' '
        }

        checkedEntries.forEach(function (el) {
            text += el.querySelector('.paragraph').innerHTML.trim() + ' '

            if(el.querySelector('.mute').innerText) possiblePenalties['mute'] = true;
            if(el.querySelector('.ajail').innerText) possiblePenalties['ajail'] = true;
            if(el.querySelector('.ban').innerText) possiblePenalties['ban'] = true;
            if(el.querySelector('.hardban').innerText) possiblePenalties['hardban'] = true;
            if(el.querySelector('.warn').innerText) possiblePenalties['warn'] = true;
        })
    })

    return {
        'text': text,
        'possiblePenalties': possiblePenalties
    }
}

function initializeInfo(calculatorWindow) {
}

function unselectButtonListener(calculatorWindow) {
    calculatorWindow.querySelector('.acalc__unselect').addEventListener('click', function () {
        calculatorWindow.querySelectorAll('.table__row.active').forEach(function (el) {
            el.classList.toggle('active')
        })

        calculatorWindow.querySelector('.acalc__infos .top_row select')[0].selected = true
        calculatorWindow.querySelector('.acalc__infos .top_row #id').value = ''
        calculatorWindow.querySelector('.acalc__infos .top_row #length').value = ''
        updateInfos(calculatorWindow)
    })
}

function copyTextToClipboardListener(calculatorWindow) {
    let isBusy = false
    calculatorWindow.querySelector('.acalc__infos .bottom_row .command_text').addEventListener('click', function () {
        if (!isBusy) {
            isBusy = true
            navigator.clipboard.writeText(this.innerText)
            let notification = calculatorWindow.querySelector('.acalc__copy__notification')
            notification.style.top = '-20px'
            setTimeout(function () {
                notification.style.top = '-80px'
                isBusy = false
            }, 1500)
        }
    })
}

function onSearchClick(calculatorWindow) {
    calculatorWindow.querySelector('.acalc__searchbar input[type="text"]').addEventListener('input', function () {
        getSearchResults(calculatorWindow)
    })
}

function getSearchResults(calculatorWindow) {
    let entries = calculatorWindow.querySelectorAll('.table__row') || []

    entries.forEach(function (entry) {
        let searchTerm = calculatorWindow.querySelector('.acalc__searchbar input[type="text"]').value.toLowerCase()
        entry.classList.remove('hidden')
        if (entry.querySelector('.table__item.paragraph').innerHTML.toLowerCase().includes(searchTerm, -2) || entry.querySelector('.table__item.text').innerHTML.toLowerCase().includes(searchTerm, -2)) return;

        entry.classList.toggle('hidden')
    })
}

function loadNavigation(calculatorWindow) {
    Object.keys(laws).forEach(function (name) {
        calculatorWindow.querySelector('.acalc__table__nav').innerHTML += `<div class="nav__item">${name}</div>`
    })
}

function loadContent(calculatorWindow) {
    Object.keys(laws).forEach(function (key) {
        let bookMarkup = `<div class="acalc__table__content hidden" id="${key.replace('.','').replace(' ','')}">`
        laws[key]['paragraphs'].forEach(function (data) {
            bookMarkup += `
            <div class="table__row" ${data['hovertext']===''?'':'title = "'+data['hovertext']+'"'}>
                <div class="table__item paragraph">
                    ${data['paragraph']}
                </div>
                <div class="table__item text">
                    ${data['text']}
                </div>
                <div class="table__item mute ${data['mute']!==''?'':'noValue'}">
                    ${data['mute']!==''?data['mute']:''}
                </div>
                <div class="table__item ajail ${data['ajail']!==''?'':'noValue'}${data['ajail']!=='Bis Namensänderung'?'':'noValue'}">
                    ${data['ajail']!==''?data['ajail']:''}
                </div>
                <div class="table__item ban ${data['ban']!==''?'':'noValue'}">
                    ${data['ban']!==''?data['ban']:''}
                </div>
                <div class="table__item hardban">
                    ${data['hardban']!==''?'&#10003;':''}
                </div>
                <div class="table__item warn">
                    ${data['warn']!==''?'&#10003;':''}
                </div>
                <div class="table__item sonstiges">
                    ${data['sonstiges']}
                </div>
            </div>`
        })
        bookMarkup += `</div>`
        calculatorWindow.querySelector('.acalc__table').innerHTML += bookMarkup;
    })
}

function onNavItemClick(calculatorWindow) {
    let defaultLawBook = calculatorWindow.querySelector(`.acalc__table__content#${config.defaultLawBook.replace('.','').replace(' ','')}`)
    let navbar = calculatorWindow.querySelector('.acalc__table__nav')
    defaultLawBook.classList.toggle('hidden')

    navbar.querySelectorAll('.nav__item').forEach(function (navItem) {
        if (navItem.innerHTML !== config.defaultLawBook) return
        navItem.classList.toggle('active')
    })

    calculatorWindow.querySelectorAll('.acalc__table__nav .nav__item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let activeItem = navbar.querySelector('.active')
            calculatorWindow.querySelector(`.acalc__table__content#${activeItem.innerText.replace('.','').replace(' ','')}`).classList.toggle('hidden')
            activeItem.classList.toggle('active')
            e.target.classList.toggle('active')
            calculatorWindow.querySelector(`.acalc__table__content#${e.target.innerText.replace('.','').replace(' ','')}`).classList.toggle('hidden')
        })
    })

}

function infoParamsListener(calculatorWindow){
    calculatorWindow.querySelector('.acalc__infos .top_row select').addEventListener('change', () => updateInfos(calculatorWindow))
    calculatorWindow.querySelector('.acalc__infos .top_row #id').addEventListener('change', () => updateInfos(calculatorWindow))
    calculatorWindow.querySelector('.acalc__infos .top_row #length').addEventListener('change', () => updateInfos(calculatorWindow))
}