const introKontener = document.getElementById('intro-kontener');
const visszaGomb = document.getElementById('vissza-ikon');
const menuLinkIds = [
    'idopontfoglalas-link',
    'referenciak-link',
    'csapatunk-link',
    'kapcsolat-link'
];
const cooldownMs = 10;

const appContent = document.getElementById('app-content');
let appNavigationHistory = [];
let selectedBarberId = null;

let currentPhotoGallery = [];
let currentPhotoIndex = 0;
let selectedCalendarDate = null;
let selectedTimeSlot = "10:00"; // Alapértelmezett/Placeholder időpont

let introAnimacioTimeoutId = null;
let visszaGombAnimacioTimeoutId = null;
let globalisKattintasTiltasTimeoutId = null;

function vezereltKattintasTiltas(tiltasIdejeMs) {
    if (globalisKattintasTiltasTimeoutId) {
        clearTimeout(globalisKattintasTiltasTimeoutId);
    }
    document.body.classList.add('kattintas-tiltva');
    globalisKattintasTiltasTimeoutId = setTimeout(function() {
        document.body.classList.remove('kattintas-tiltva');
        globalisKattintasTiltasTimeoutId = null;
    }, tiltasIdejeMs);
}

const sectionsContent = {
    idopontfoglalas: `
        <section>
            <h2><span>SZOLGÁLTATÁSOK</span></h2>
            <ul>
                <li><a href="#" data-service="hajvagas">HAJVÁGÁS</a></li>
                <li><a href="#" data-service="apa_fia">APA-FIA HAJVÁGÁS</a></li>
                <li><a href="#" data-service="diak">DIÁK HAJVÁGÁS</a></li>
                <li><a href="#" data-service="szakalligazitas">SZAKÁLLIGAZÍTÁS</a></li>
            </ul>
        </section>
    `,
    // A referenciak menüpont tartalmát referenciak.js fogja betölteni
    csapatunk: `
        <section>
            <h2><span>CSAPATUNK</span></h2>
            <p>Ismerd meg borbélyainkat hamarosan...</p>
             <p class="back-to-services-link-container" style="text-align:center; margin-top:20px;"><a href="#" class="vissza-link-belul" data-action="go-to-main-menu">Vissza a főmenühöz</a></p>
        </section>
    `,
    kapcsolat: `
        <section>
            <h2><span>KAPCSOLAT</span></h2>
            <p>Elérhetőségeink hamarosan...</p>
             <p class="back-to-services-link-container" style="text-align:center; margin-top:20px;"><a href="#" class="vissza-link-belul" data-action="go-to-main-menu">Vissza a főmenühöz</a></p>
        </section>
    `,
    szolgaltatas_hajvagas: `
        <section class="service-detail-view">
            <h2 class="service-detail-title"><span>HAJVÁGÁS</span></h2>
            <div class="service-content-block">
                <h3 class="service-subtitle">BASIC CUT</h3>
                <p class="service-info">IDŐ: <span class="info-value">60 PERC</span></p>
                <p class="service-info">ÁR: <span class="info-value">5000 FT</span></p>
                <p class="service-info-label">MESTEREK:</p>
                <div class="barber-selectors"></div>
                <a href="#" class="btn btn-book-now" data-action="proceed_to_barber_profile_hajvagas">IDŐPONTOT FOGLALOK!</a>
            </div>
        </section>
    `,
    szolgaltatas_apa_fia: `
        <section class="service-detail-view">
            <h2 class="service-detail-title"><span>APA-FIA HAJVÁGÁS</span></h2>
            <div class="service-content-block">
                <h3 class="service-subtitle">KÖZÖS ÉLMÉNY</h3>
                <p class="service-info">IDŐ: <span class="info-value">90 PERC</span></p>
                <p class="service-info">ÁR: <span class="info-value">12000 FT</span></p>
                <p class="service-info-label">MESTEREK:</p>
                <div class="barber-selectors"></div>
                <a href="#" class="btn btn-book-now" data-action="proceed_to_barber_profile_apa_fia">IDŐPONTOT FOGLALOK!</a>
            </div>
        </section>
    `,
    szolgaltatas_diak: `<section class="service-detail-view"><h2 class="service-detail-title"><span>DIÁK HAJVÁGÁS</span></h2><div class="service-content-block"><p>Részletek hamarosan...</p> <div class="barber-selectors"></div>  <a href="#" class="btn btn-book-now" data-action="proceed_to_barber_profile_diak">IDŐPONTOT FOGLALOK!</a></div></section>`,
    szolgaltatas_szakalligazitas: `<section class="service-detail-view"><h2 class="service-detail-title"><span>SZAKÁLLIGAZÍTÁS</span></h2><div class="service-content-block"><p>Részletek hamarosan...</p> <div class="barber-selectors"></div> <a href="#" class="btn btn-book-now" data-action="proceed_to_barber_profile_szakalligazitas">IDŐPONTOT FOGLALOK!</a></div></section>`,
    photo_viewer_section: '',
    calendar_page_section: '',
    loading_view_section: `
        <section class="loading-view">
            <dotlottie-player 
                src="animations/loadingscreen/animations/0e146700-8bdb-4609-a323-f2ac55c44bab.json" 
                background="transparent" 
                speed="1" 
                style="width: 200px; height: 200px; margin-bottom: 120px;" 
                loop 
                autoplay>
            </dotlottie-player>
        </section>
    `,
    success_view_section: '', // Ezt a generateSuccessMessageHTML tölti fel
};

function renderBarbers(containerElement) {
    if (!containerElement) { console.error("renderBarbers: Konténer nem található!"); return 0; }
    if (typeof barberSetup === 'undefined' || !barberSetup.barbers) {
        console.error("renderBarbers: 'barberSetup' vagy 'barberSetup.barbers' nem elérhető. Ellenőrizd a config_barbers.js-t!");
        containerElement.innerHTML = '<p>Hiba a borbélyok betöltésekor.</p>'; return 0;
    }
    const barbersToRender = barberSetup.barbers.slice(0, barberSetup.profilesToDisplay);
    let barberCirclesHTML = '';
    barbersToRender.forEach(barber => {
        const style = barber.imgSrc ? `background-image: url('${barber.imgSrc}');` : '';
        const content = barber.imgSrc ? '' : (barber.text || '');
        barberCirclesHTML += `<div class="barber-circle" data-barber-id="${barber.id}" style="${style}">${content}</div>`;
    });
    containerElement.innerHTML = barberCirclesHTML;
    return barbersToRender.length;
}

function updateBarberSelectionVisuals(scrollContainer) {
    if (!scrollContainer) {
        scrollContainer = appContent.querySelector('.barber-selectors');
        if (!scrollContainer) return;
    }
    const allCircles = scrollContainer.querySelectorAll('.barber-circle');
    allCircles.forEach(circle => {
        if (circle.dataset.barberId === selectedBarberId) {
            circle.classList.add('selected');
        } else {
            circle.classList.remove('selected');
        }
    });
}

function updateBookingButtonState() {
    const serviceBookingButton = appContent.querySelector('.service-detail-view .btn-book-now');
    const profileBookingButton = appContent.querySelector('.barber-profile-view .btn-book-now-profile');
    const calendarBookingButton = appContent.querySelector('.calendar-view-page .btn-confirm-booking');
    const successOkButton = appContent.querySelector('.success-view .btn-confirm-booking');

    if (serviceBookingButton) {
        if (selectedBarberId) {
            serviceBookingButton.classList.remove('disabled');
        } else {
            serviceBookingButton.classList.add('disabled');
        }
    }
    if (profileBookingButton) {
        profileBookingButton.classList.remove('disabled');
    }
    if (calendarBookingButton) {
        if (selectedCalendarDate && selectedTimeSlot ) {
            calendarBookingButton.classList.remove('disabled');
        } else {
            calendarBookingButton.classList.add('disabled');
        }
    }
    if (successOkButton) {
        successOkButton.classList.remove('disabled');
    }
}

function generateBarberProfileHTML(barberId) {
    if (typeof barberSetup === 'undefined' || !barberSetup.barbers) { return "<section><h2>Hiba</h2><p>Borbély adatok nem érhetők el.</p></section>"; }
    const barberData = barberSetup.barbers.find(b => b.id === barberId);
    if (!barberData) { return "<section><h2>Hiba</h2><p>A keresett borbély profilja nem található.</p></section>"; }
    let refThumbnailsHTML = '';
    const maxThumbnails = 3;
    if (barberData.referencePhotos && barberData.referencePhotos.length > 0) {
        for (let i = 0; i < Math.min(barberData.referencePhotos.length, maxThumbnails); i++) {
            refThumbnailsHTML += `<div class="ref-thumbnail" style="background-image: url('${barberData.referencePhotos[i]}');" data-barber-id="${barberId}" data-photo-index="${i}"></div>`;
        }
    } else { refThumbnailsHTML = '<p style="text-align:center; font-size: 0.9em; color: #777;">Nincsenek referenciafotók feltöltve.</p>'; }
    const profilePicStyle = barberData.imgSrc ? `background-image: url('${barberData.imgSrc}');` : '';
    return `
        <section class="barber-profile-view">
            <div class="barber-profile-header"><div class="barber-profile-pic-large" style="${profilePicStyle}"></div></div>
            <div class="barber-profile-card">
                <h2>Üdv!</h2>
                <h3>${barberData.name || 'Ismeretlen Mester'} vagyok.</h3>
                <p class="barber-bio">${barberData.bio || "Erről a borbélyról még nincs részletes bemutatkozás."}</p>
                <h4 class="references-title">Referenciák:</h4>
                <div class="reference-thumbnails-container">${refThumbnailsHTML}</div>
            </div>
            <a href="#" class="btn btn-book-now-profile" data-action="show_calendar_for_barber_${barberId}">IDŐPONTOT FOGLALOK!</a>
        </section>
    `;
}

function generatePhotoViewerHTML(imageSrc) {
    if (!imageSrc) { return `<section class="photo-viewer-active"><p>Hiba: Kép nem található.</p></section>`; }
    return `<section class="photo-viewer-active"><div class="photo-nav-wrapper" style="cursor: pointer;"><img src="${imageSrc}" alt="Referenciafotó kinagyítva"></div></section>`;
}

function generateCalendarPageHTML(barberId, serviceContextName) {
    if (typeof barberSetup === 'undefined' || !barberSetup.barbers) { return "<section><h2>Hiba</h2><p>Konfigurációs hiba.</p></section>"; }
    const barberData = barberSetup.barbers.find(b => b.id === barberId);
    const barberDisplayName = barberData ? barberData.name : 'Ismeretlen mester';
    const serviceDisplayName = serviceContextName ? serviceContextName.replace(/_/g, ' ').toUpperCase() : 'IDŐPONTFOGLALÁS';
    let daysHTML = '';
    const todayForCalendar = new Date();
    const currentMonthName = todayForCalendar.toLocaleString('hu-HU', { month: 'long' }).toUpperCase();
    for (let i = 1; i <= 30; i++) {
        daysHTML += `<div class="day-cell" data-day="${i}">${i}</div>`;
    }
    return `
        <section class="calendar-view-page">
            <div class="calendar-card">
                <div class="calendar-header"><div class="month-display">${currentMonthName}</div></div>
                <div class="days-grid">${daysHTML}</div>
                <div class="time-selector">
                    <button class="time-arrow prev-time" aria-label="Előző időpont">&lt;</button>
                    <div class="selected-time">${selectedTimeSlot || '--:--'}</div>
                    <button class="time-arrow next-time" aria-label="Következő időpont">&gt;</button>
                </div>
                <button class="btn btn-confirm-booking" data-action="confirm_booking_${barberId}_${serviceContextName}">FOGLALÁS!</button>
            </div>
        </section>
    `;
}

function generateSuccessMessageHTML(details) {
    return `
        <section class="success-view">
            <div class="success-card">
                <dotlottie-player
                src="animations/checkbox.json"
                 background="transparent"
                 speed="1"
                 style="width: 70px; height: 70px; margin: 0 auto 20px auto;" autoplay
                 loop="false">
                 </dotlottie-player>
                <p><strong>IDŐPONT:</strong> ${details.year || new Date().getFullYear()}. ${details.month || 'N/A'} ${details.day || 'XX.'}, ${details.time || 'XX:XX'}</p>
                <p><strong>SZOLGÁLTATÁS:</strong> ${details.serviceNameDisplay || 'Ismeretlen szolgáltatás'}</p>
                <p><strong>MESTER:</strong> ${details.barberName || 'Ismeretlen mester'}</p>
                <p><strong>IDŐ:</strong> ${details.duration || 'N/A'}</p>
                <p><strong>ÁR:</strong> ${details.price || 'N/A'}</p>
                <p class="thank-you-message">KÖSZÖNJÜK HOGY MINKET VÁLASZTOTT!</p>
                <button class="btn btn-confirm-booking" data-action="booking_confirmed_go_to_services">RENDBEN!</button>
            </div>
        </section>
    `;
}

function displaySection(sectionName) {
    let contentToDisplay = '';
    if (sectionsContent[sectionName]) {
        contentToDisplay = sectionsContent[sectionName];
    } else {
        contentToDisplay = `<section><h2>Hiba</h2><p>A "${sectionName}" tartalom nem jeleníthető meg.</p></section>`;
        console.error("HIBA: Tartalom nem található ehhez a kulcshoz:", sectionName);
    }

    if (sectionName.startsWith('calendar_page_for_')) {
        selectedCalendarDate = null;
        selectedTimeSlot = "--:--";
    } else if (sectionName.startsWith('szolgaltatas_') || sectionName.startsWith('barber_profile_for_')) {
         selectedCalendarDate = null;
         selectedTimeSlot = null;
    }

    if (visszaGomb) {
        if (sectionName === 'loading_view_section') {
            visszaGomb.style.visibility = 'hidden';
            visszaGomb.style.pointerEvents = 'none';
        } else {
            visszaGomb.style.visibility = 'visible';
            visszaGomb.style.pointerEvents = 'auto';
        }
    }

    appContent.innerHTML = contentToDisplay;
    appContent.classList.add('visible');

    const barberSelectorsDiv = appContent.querySelector('.barber-selectors');
    if (barberSelectorsDiv) {
        setTimeout(() => {
            const renderedBarberCount = renderBarbers(barberSelectorsDiv);
            attachDynamicLinkListeners();
            if (typeof VISIBLE_BARBER_CIRCLES_DESIGN !== 'undefined' && renderedBarberCount > VISIBLE_BARBER_CIRCLES_DESIGN) {
                initInfiniteScroll('.barber-selectors');
            } else if (barberSelectorsDiv) {
                barberSelectorsDiv.style.justifyContent = 'center';
                barberSelectorsDiv.style.overflowX = 'hidden';
                const oldClones = barberSelectorsDiv.querySelectorAll('.clone');
                oldClones.forEach(clone => clone.remove());
                updateBarberSelectionVisuals(barberSelectorsDiv);
            }
            updateBookingButtonState();
        }, 0);
    } else {
        attachDynamicLinkListeners();
        const anyBookingButton = appContent.querySelector('.btn-book-now, .btn-book-now-profile, .btn-confirm-booking');
        if(anyBookingButton){
            updateBookingButtonState();
        }
    }
}

function hideAppContent() {
    appContent.classList.remove('visible');
    return new Promise(resolve => {
        setTimeout(() => {
            appContent.innerHTML = '';
            resolve();
        }, 500);
    });
}

function handleDaySelection(event) {
    const clickedDayCell = event.currentTarget;
    const dayNumber = clickedDayCell.dataset.day;
    const allDayCells = appContent.querySelectorAll('.calendar-view-page .days-grid .day-cell');
    allDayCells.forEach(cell => { cell.classList.remove('selected-day'); });
    if (selectedCalendarDate === dayNumber && clickedDayCell.classList.contains('selected-day')) {
        selectedCalendarDate = null;
    } else {
        clickedDayCell.classList.add('selected-day');
        selectedCalendarDate = dayNumber;
    }
    updateBookingButtonState();
}

function handleBarberSelection(event) {
    const clickedCircle = event.currentTarget;
    const barberId = clickedCircle.dataset.barberId;
    if (selectedBarberId === barberId) {
        selectedBarberId = null;
    } else {
        selectedBarberId = barberId;
    }
    updateBarberSelectionVisuals(clickedCircle.closest('.barber-selectors'));
    updateBookingButtonState();
}

function handleThumbnailClick(event) {
    const thumbnail = event.currentTarget;
    const barberId = thumbnail.dataset.barberId;
    const photoIndex = parseInt(thumbnail.dataset.photoIndex);
    if (typeof barberSetup === 'undefined' || !barberSetup.barbers) { return; }
    const barberData = barberSetup.barbers.find(b => b.id === barberId);
    if (!barberData || !barberData.referencePhotos || barberData.referencePhotos.length === 0) { return; }
    currentPhotoGallery = barberData.referencePhotos;
    currentPhotoIndex = photoIndex;
    const photoViewerHTML = generatePhotoViewerHTML(currentPhotoGallery[currentPhotoIndex]);
    const photoViewerSectionKey = 'photo_viewer_section';
    sectionsContent[photoViewerSectionKey] = photoViewerHTML;
    if (appNavigationHistory[appNavigationHistory.length - 1] !== photoViewerSectionKey) {
        appNavigationHistory.push(photoViewerSectionKey);
    }
    hideAppContent().then(() => { displaySection(photoViewerSectionKey); });
}

function handlePhotoNavigation(event) {
    if (!currentPhotoGallery || currentPhotoGallery.length === 0) return;
    const wrapper = event.currentTarget;
    const clickX = event.clientX - wrapper.getBoundingClientRect().left;
    let newIndex = currentPhotoIndex;
    if (clickX < wrapper.offsetWidth / 2) {
        newIndex--; if (newIndex < 0) { newIndex = currentPhotoGallery.length - 1; }
    } else {
        newIndex++; if (newIndex >= currentPhotoGallery.length) { newIndex = 0; }
    }
    if (newIndex !== currentPhotoIndex) {
        currentPhotoIndex = newIndex;
        const nextImageSrc = currentPhotoGallery[currentPhotoIndex];
        const photoViewerHTML = generatePhotoViewerHTML(nextImageSrc);
        const photoViewerSectionKey = 'photo_viewer_section';
        sectionsContent[photoViewerSectionKey] = photoViewerHTML;
        appContent.classList.remove('visible');
        setTimeout(() => {
            appContent.innerHTML = photoViewerHTML;
            appContent.classList.add('visible');
            attachDynamicLinkListeners();
        }, 50);
    }
}

function handleServiceOrInternalNav(event) {
    const targetLink = event.currentTarget;
    const serviceName = targetLink.dataset.service;
    const sectionTarget = targetLink.dataset.sectionTarget;
    const action = targetLink.dataset.action;

    if (serviceName || sectionTarget || action) { event.preventDefault(); }
    else { return; }

    if (action && action.startsWith('proceed_to_barber_profile_')) {
        if (!selectedBarberId) { return; }
        const serviceNameFromAction = action.replace('proceed_to_barber_profile_', '');
        const barberProfileHTML = generateBarberProfileHTML(selectedBarberId);
        const barberProfileSectionKey = `barber_profile_for_${selectedBarberId}_context_${serviceNameFromAction}`;
        sectionsContent[barberProfileSectionKey] = barberProfileHTML;
        if (appNavigationHistory.length === 0 || appNavigationHistory[appNavigationHistory.length - 1] !== barberProfileSectionKey) {
            appNavigationHistory.push(barberProfileSectionKey);
        }
        hideAppContent().then(() => { displaySection(barberProfileSectionKey); });

    } else if (action && action.startsWith('show_calendar_for_barber_')) {
        const barberIdForCalendar = action.replace('show_calendar_for_barber_', '');
        let serviceContextForCalendar = 'altalanos';
        if (appNavigationHistory.length > 0) {
            const currentPageKey = appNavigationHistory[appNavigationHistory.length - 1];
            if (currentPageKey && currentPageKey.startsWith(`barber_profile_for_${barberIdForCalendar}_context_`)) {
                serviceContextForCalendar = currentPageKey.replace(`barber_profile_for_${barberIdForCalendar}_context_`, '');
            }
        }
        const calendarPageHTML = generateCalendarPageHTML(barberIdForCalendar, serviceContextForCalendar);
        const calendarSectionKey = `calendar_page_for_${barberIdForCalendar}_service_${serviceContextForCalendar}`;
        sectionsContent[calendarSectionKey] = calendarPageHTML;
        if (appNavigationHistory.length === 0 || appNavigationHistory.length - 1 !== calendarSectionKey) {
            appNavigationHistory.push(calendarSectionKey);
        }
        hideAppContent().then(() => { displaySection(calendarSectionKey); });

    } else if (action && action.startsWith('confirm_booking_')) {
        if (!selectedCalendarDate) { return; }

        const actionParts = action.split('_');
        const barberId = actionParts[2];
        const serviceContext = actionParts[3];

        const barberData = (typeof barberSetup !== 'undefined' && barberSetup.barbers) ? barberSetup.barbers.find(b => b.id === barberId) : null;
        const barberName = barberData ? barberData.name : 'Ismeretlen mester';

        let serviceNameDisplay = serviceContext.replace(/_/g, ' ').toUpperCase();
        let serviceDuration = "N/A";
        let servicePrice = "N/A";

        const serviceKeyForDetails = `szolgaltatas_${serviceContext}`;
        if (sectionsContent[serviceKeyForDetails]) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sectionsContent[serviceKeyForDetails];
            const mainTitleEl = tempDiv.querySelector('.service-detail-title span');
            const subtitleEl = tempDiv.querySelector('.service-subtitle');
            const timeInfoEl = tempDiv.querySelector('.service-info .info-value');
            const priceInfoEl = tempDiv.querySelectorAll('.service-info .info-value')[1];

            let baseServiceName = mainTitleEl ? mainTitleEl.textContent : serviceNameDisplay;
            serviceNameDisplay = subtitleEl ? `${baseServiceName} (${subtitleEl.textContent})` : baseServiceName;
            if (timeInfoEl) serviceDuration = timeInfoEl.textContent;
            if (priceInfoEl) servicePrice = priceInfoEl.textContent;
        }

        const bookingDetails = {
            day: selectedCalendarDate,
            time: appContent.querySelector('.selected-time') ? appContent.querySelector('.selected-time').textContent : selectedTimeSlot || '--:--',
            month: appContent.querySelector('.month-display') ? appContent.querySelector('.month-display').textContent : 'N/A',
            year: new Date().getFullYear(),
            serviceNameDisplay: serviceNameDisplay,
            barberName: barberName,
            duration: serviceDuration,
            price: servicePrice
        };

        if (appNavigationHistory[appNavigationHistory.length - 1] !== 'loading_view_section') {
            appNavigationHistory.push('loading_view_section');
        }
        hideAppContent().then(() => {
            displaySection('loading_view_section');
            setTimeout(() => {
                if (appNavigationHistory[appNavigationHistory.length - 1] === 'loading_view_section') {
                    appNavigationHistory.pop();
                }
                const successHTML = generateSuccessMessageHTML(bookingDetails);
                const successSectionKey = `success_view_section_for_${Date.now()}`;
                sectionsContent[successSectionKey] = successHTML;

                if (appNavigationHistory[appNavigationHistory.length - 1] !== successSectionKey) {
                     appNavigationHistory.push(successSectionKey);
                }
                hideAppContent().then(() => {
                    displaySection(successSectionKey);
                });
            }, 4000);
        });

    } else if (action === 'booking_confirmed_go_to_services') {
        event.preventDefault();
        appNavigationHistory = [];
        selectedBarberId = null;
        selectedCalendarDate = null;
        selectedTimeSlot = null;
        const visszaAnimacioTeljesIdeje = 1500;
        introKontener.classList.add('vissza-animacio-aktiv');
        vezereltKattintasTiltas(visszaAnimacioTeljesIdeje + cooldownMs);
        hideAppContent();
        visszaGombAnimacioTimeoutId = setTimeout(function() {
            introKontener.classList.remove('menupont-kattintva');
            introKontener.classList.remove('vissza-animacio-aktiv');
            visszaGombAnimacioTimeoutId = null;
        }, visszaAnimacioTeljesIdeje);
    } else if (serviceName) {
        selectedBarberId = null;
        const detailSectionKey = `szolgaltatas_${serviceName}`;
        if (appNavigationHistory.length === 0 || appNavigationHistory[appNavigationHistory.length - 1] !== detailSectionKey) {
            appNavigationHistory.push(detailSectionKey);
        }
        hideAppContent().then(() => { displaySection(detailSectionKey); });
    } else if (sectionTarget) {
        const targetIndex = appNavigationHistory.lastIndexOf(sectionTarget);
        if (targetIndex !== -1) { appNavigationHistory.length = targetIndex + 1; }
        else { appNavigationHistory = [sectionTarget]; }
        hideAppContent().then(() => { displaySection(sectionTarget); });
    } else if (action === 'go-to-main-menu') {
         appNavigationHistory = [];
         if (visszaGomb) visszaGomb.click();
    }
}

function attachDynamicLinkListeners() {
    setTimeout(() => {
        const dynamicInteractiveElements = appContent.querySelectorAll('a[data-service], a[data-section-target], a[data-action], button[data-action], .ref-thumbnail, .photo-nav-wrapper, .barber-circle, .day-cell, .time-arrow');
        dynamicInteractiveElements.forEach(el => {
            let handler;
            if (el.matches('a[data-service], a[data-section-target], a[data-action], button[data-action]')) {
                handler = handleServiceOrInternalNav;
            } else if (el.matches('.barber-circle')) {
                handler = handleBarberSelection;
            } else if (el.matches('.ref-thumbnail')) {
                handler = handleThumbnailClick;
            } else if (el.matches('.photo-nav-wrapper')) {
                handler = handlePhotoNavigation;
            } else if (el.matches('.day-cell') && !el.classList.contains('other-month')) {
                handler = handleDaySelection;
            }
            if (handler) {
                el.removeEventListener('click', handler);
                el.addEventListener('click', handler);
            }
        });
    }, 0);
}

function initInfiniteScroll(containerSelector) {
    const scrollContainer = appContent.querySelector(containerSelector);
    if (!scrollContainer) { return; }
    if (scrollContainer._previousInfiniteScrollListener) {
        scrollContainer.removeEventListener('scroll', scrollContainer._previousInfiniteScrollListener);
    }
    const oldClones = scrollContainer.querySelectorAll('.clone');
    oldClones.forEach(clone => clone.remove());
    const items = Array.from(scrollContainer.children).filter(child => !child.classList.contains('clone'));
    if (items.length === 0) { return; }
    if (typeof VISIBLE_BARBER_CIRCLES_DESIGN === 'undefined') { console.error("HIBA: VISIBLE_BARBER_CIRCLES_DESIGN nincs definiálva!"); return; }
    const itemsToCloneCount = Math.min(VISIBLE_BARBER_CIRCLES_DESIGN, items.length);
    if (items.length <= VISIBLE_BARBER_CIRCLES_DESIGN) {
        scrollContainer.style.justifyContent = 'center';
        scrollContainer.style.overflowX = 'hidden';
        return;
    }
    scrollContainer.style.justifyContent = 'flex-start';
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.scrollBehavior = 'auto';
    for (let i = 0; i < itemsToCloneCount; i++) {
        const clone = items[i].cloneNode(true);
        clone.classList.add('clone');
        if(items[i].dataset.barberId) clone.dataset.originalId = items[i].dataset.barberId;
        scrollContainer.appendChild(clone);
    }
    for (let i = 0; i < itemsToCloneCount; i++) {
        const clone = items[items.length - 1 - i].cloneNode(true);
        clone.classList.add('clone');
        if(items[items.length - 1 - i].dataset.barberId) clone.dataset.originalId = items[items.length - 1 - i].dataset.barberId;
        scrollContainer.insertBefore(clone, scrollContainer.firstChild);
    }
    const allBarberCirclesNow = scrollContainer.querySelectorAll('.barber-circle');
    allBarberCirclesNow.forEach(circle => {
        circle.removeEventListener('click', handleBarberSelection);
        circle.addEventListener('click', handleBarberSelection);
    });
    if (items.length === 0 || !items[0]) { return; }
    const itemWidth = items[0].offsetWidth;
    const gapWidth = parseInt(getComputedStyle(scrollContainer).gap || "0px");
    const oneElementScrollStep = itemWidth + gapWidth;
    const initialScrollPosition = itemsToCloneCount * oneElementScrollStep;
    scrollContainer.scrollLeft = initialScrollPosition;
    updateBarberSelectionVisuals(scrollContainer);
    let isTeleporting = false;
    scrollContainer._infiniteScrollListener = function() {
        if (isTeleporting) return;
        const originalContentScrollWidth = items.length * oneElementScrollStep;
        let currentScrollLeft = scrollContainer.scrollLeft;
        if (currentScrollLeft >= (initialScrollPosition + originalContentScrollWidth - (oneElementScrollStep / 2) )) {
            isTeleporting = true;
            scrollContainer.scrollLeft -= originalContentScrollWidth;
            updateBarberSelectionVisuals(scrollContainer);
        } else if (currentScrollLeft <= (initialScrollPosition - oneElementScrollStep + (oneElementScrollStep / 2) )) {
            isTeleporting = true;
            scrollContainer.scrollLeft += originalContentScrollWidth;
            updateBarberSelectionVisuals(scrollContainer);
        }
        if (isTeleporting) { setTimeout(() => { isTeleporting = false; }, 30); }
    };
    scrollContainer.addEventListener('scroll', scrollContainer._infiniteScrollListener);
    scrollContainer._previousInfiniteScrollListener = scrollContainer._infiniteScrollListener;
}

// ------------------- REFERENCIÁK DINAMIKUS JS BETÖLTÉSE -------------------

function loadReferenciaJS() {
    return new Promise((resolve, reject) => {
        if (window._referenciaLoaded) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'referenciak.js';
        script.onload = () => { window._referenciaLoaded = true; resolve(); };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// ------------------- MENÜ ESEMÉNYKEZELŐK (referenciák dinamikusan) -------------------

if (introKontener) {
    const introTeljesIdeje = 2400;
    introKontener.classList.add('intro-aktiv');
    vezereltKattintasTiltas(introTeljesIdeje + cooldownMs);
    introAnimacioTimeoutId = setTimeout(function() {
        if (introKontener.classList.contains('intro-aktiv')) {
            introKontener.classList.remove('intro-aktiv');
        }
    }, introTeljesIdeje);

    const fomenurolKitoltesIdeje = 1300;
    menuLinkIds.forEach(function(linkId) {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            if (linkId === 'referenciak-link') {
                linkElement.addEventListener('click', function(event) {
                    event.preventDefault();
                    if (visszaGombAnimacioTimeoutId) clearTimeout(visszaGombAnimacioTimeoutId);
                    if (introAnimacioTimeoutId) {
                        clearTimeout(introAnimacioTimeoutId);
                        introAnimacioTimeoutId = null;
                        introKontener.classList.remove('intro-aktiv');
                    }
                    introKontener.classList.remove('vissza-animacio-aktiv');
                    introKontener.classList.add('menupont-kattintva');
                    vezereltKattintasTiltas(fomenurolKitoltesIdeje + cooldownMs);
                    const sectionNameToLoad = linkId.replace('-link', '');
                    appNavigationHistory = [sectionNameToLoad];
                    selectedBarberId = null;
                    updateBookingButtonState();
                    hideAppContent().then(() => {
                        setTimeout(() => {
                            // REFERENCIÁK: csak ekkor töltjük be a referenciak.js-t!
                            loadReferenciaJS().then(() => {
                                if (typeof loadReferenciaSection === 'function') {
                                    loadReferenciaSection(appContent);
                                } else {
                                    appContent.innerHTML = '<section><h2>Referencia oldal</h2><p>Nem sikerült betölteni a referenciák tartalmat.</p></section>';
                                }
                            });
                        }, 200);
                    });
                });
            } else {
                // A többi menüpont működése változatlan
                linkElement.addEventListener('click', function(event) {
                    event.preventDefault();
                    if (visszaGombAnimacioTimeoutId) clearTimeout(visszaGombAnimacioTimeoutId);
                    if (introAnimacioTimeoutId) {
                        clearTimeout(introAnimacioTimeoutId);
                        introAnimacioTimeoutId = null;
                        introKontener.classList.remove('intro-aktiv');
                    }
                    introKontener.classList.remove('vissza-animacio-aktiv');
                    introKontener.classList.add('menupont-kattintva');
                    vezereltKattintasTiltas(fomenurolKitoltesIdeje + cooldownMs);
                    const sectionNameToLoad = linkId.replace('-link', '');
                    appNavigationHistory = [sectionNameToLoad];
                    selectedBarberId = null;
                    updateBookingButtonState();
                    hideAppContent().then(() => {
                        setTimeout(() => {
                            displaySection(sectionNameToLoad);
                        }, 200);
                    });
                });
            }
        }
    });

    const visszaAnimacioTeljesIdeje = 1500;
    if (visszaGomb) {
        visszaGomb.addEventListener('click', function() {
            if (visszaGombAnimacioTimeoutId) clearTimeout(visszaGombAnimacioTimeoutId);
            if (introAnimacioTimeoutId) { clearTimeout(introAnimacioTimeoutId); introAnimacioTimeoutId = null; introKontener.classList.remove('intro-aktiv'); }

            if (appNavigationHistory.length > 0) {
                const currentView = appNavigationHistory[appNavigationHistory.length - 1];
                if (currentView === 'loading_view_section' || currentView.startsWith('success_view_section_for_')) {
                    while(appNavigationHistory.length > 0 &&
                          appNavigationHistory[appNavigationHistory.length -1] !== 'idopontfoglalas' &&
                          !appNavigationHistory[appNavigationHistory.length -1].startsWith('szolgaltatas_') &&
                          !appNavigationHistory[appNavigationHistory.length -1].startsWith('barber_profile_for_') &&
                          !appNavigationHistory[appNavigationHistory.length -1].startsWith('calendar_page_for_')
                          ) {
                        appNavigationHistory.pop();
                    }
                     if (appNavigationHistory.length > 0 && (appNavigationHistory[appNavigationHistory.length -1] === 'loading_view_section' || appNavigationHistory[appNavigationHistory.length -1].startsWith('success_view_section_for_'))) {
                        appNavigationHistory.pop();
                     }
                     if (appNavigationHistory.length > 0 && appNavigationHistory[appNavigationHistory.length -1].startsWith('calendar_page_for_')) {
                        appNavigationHistory.pop();
                     }
                } else {
                     appNavigationHistory.pop();
                }
            }

            if (appNavigationHistory.length > 0) {
                const previousSection = appNavigationHistory[appNavigationHistory.length - 1];
                vezereltKattintasTiltas(550 + cooldownMs);
                hideAppContent().then(() => { displaySection(previousSection); });
            } else {
                selectedBarberId = null;
                selectedCalendarDate = null;
                selectedTimeSlot = null;
                introKontener.classList.add('vissza-animacio-aktiv');
                vezereltKattintasTiltas(visszaAnimacioTeljesIdeje + cooldownMs);
                hideAppContent();
                visszaGombAnimacioTimeoutId = setTimeout(function() {
                    introKontener.classList.remove('menupont-kattintva');
                    introKontener.classList.remove('vissza-animacio-aktiv');
                    visszaGombAnimacioTimeoutId = null;
                }, visszaAnimacioTeljesIdeje);
            }
        });
    }
}