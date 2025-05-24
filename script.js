document.addEventListener('DOMContentLoaded', function() {
    // --- API Configuration ---
    const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyjZwmlsqBjbOKPdaV5bs05h_7k6xbQcLepRDGDc3M/dev'; 

    let allEvents = []; 

    // --- Calendar Logic ---
    const calendarDays = document.querySelector(".calendar-days");
    const currentMonthEl = document.querySelector(".current-month");
    const prevMonthBtn = document.querySelector(".prev.month-btn");
    const nextMonthBtn = document.querySelector(".next.month-btn");
    const prevYearBtn = document.querySelector(".btn.prev-year");
    const nextYearBtn = document.querySelector(".btn.next-year");
    const todayBtn = document.querySelector(".btn.today");
    const eventCardsContainer = document.getElementById('event-cards-container'); 
    
    // --- เพิ่มตรงนี้: อ้างอิงถึง loading overlay ---
    const loadingOverlay = document.getElementById('loading-overlay'); 

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
        calendarDays.innerHTML = ""; 
        currentMonthEl.textContent = `${months[currentMonth]} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7; 
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        for (let i = 0; i < firstWeekday; i++) {
            const blankDay = document.createElement("div");
            blankDay.classList.add("day", "blank");
            calendarDays.appendChild(blankDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement("div");
            dayEl.classList.add("day");
            dayEl.textContent = day;

            const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const eventsForThisDay = allEvents.filter(event => 
                event.date && event.date.split('T')[0] === fullDate
            );

            if (eventsForThisDay.length > 0) {
                dayEl.classList.add("has-event"); 
                
                eventsForThisDay.forEach(event => {
                    const eventDot = document.createElement("div");
                    eventDot.classList.add("event-dot");
                    if (event.highlight && event.highlight.toUpperCase() === 'TRUE') {
                        eventDot.style.backgroundColor = '#EE6EEA'; 
                    } else if (event.highlight && event.highlight.startsWith('#')) {
                        eventDot.style.backgroundColor = event.highlight; 
                    }
                    dayEl.appendChild(eventDot);
                });

                dayEl.addEventListener('click', () => {
                    scrollToDateEvents(fullDate); 
                });
            }

            if (day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
                dayEl.classList.add("today");
            }
            calendarDays.appendChild(dayEl);
        }
    }

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    function changeYear(delta) {
        currentYear += delta;
        renderCalendar();
    }

    function goToToday() {
        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();
        renderCalendar();
    }

    prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => changeMonth(1));
    prevYearBtn.addEventListener("click", () => changeYear(-1));
    nextYearBtn.addEventListener("click", () => changeYear(1));
    todayBtn.addEventListener("click", goToToday);

    // --- Event Card Rendering (การสร้าง Event Card) ---
    function renderEventCards(eventsToRender) {
        eventCardsContainer.innerHTML = ''; 
        
        eventsToRender.sort((a, b) => {
            const dateTimeA = new Date(a.date);
            const dateTimeB = new Date(b.date);
            return dateTimeA.getTime() - dateTimeB.getTime();
        });

        if (eventsToRender.length === 0) {
            eventCardsContainer.innerHTML = '<p style="text-align: center; color: #555;">No upcoming events found.</p>';
            return;
        }

        eventsToRender.forEach(event => {
            const box = document.createElement('div');
            box.classList.add('box');
            const eventDateForDataAttr = event.date ? event.date.split('T')[0] : '';
            box.setAttribute('data-event-date', eventDateForDataAttr); 

            const boxTop = document.createElement('div');
            boxTop.classList.add('box-top');

            if (event.image) {
                const img = document.createElement('img');
                img.classList.add('box-image');
                img.src = event.image; 
                img.alt = event.title || 'Event Image';
                img.loading = 'lazy'; 
                boxTop.appendChild(img);
            }

            const titleFlex = document.createElement('div');
            titleFlex.classList.add('title-flex');

            const title = document.createElement('h3');
            title.classList.add('box-title');
            title.textContent = event.title; 
            titleFlex.appendChild(title);
            
            boxTop.appendChild(titleFlex);

            const description = document.createElement('p');
            description.classList.add('description');
            
            let detailsHtml = '';
            if (event.date) {
                const displayDate = event.date.split('T')[0]; 
                detailsHtml += `Date : ${displayDate}<br>`;
            }
            if (event.time) detailsHtml += `Time : ${event.time}<br>`;
            if (event.place) detailsHtml += `Place : ${event.place}<br>`; 
            if (event.channel) detailsHtml += `Channel : ${event.channel}<br>`; 
            if (event.details) detailsHtml += `Details : ${event.details}`; 

            description.innerHTML = detailsHtml;
            boxTop.appendChild(description);
            
            box.appendChild(boxTop);

            if (event.link) {
                const linkBtn = document.createElement('a');
                linkBtn.href = event.link; 
                linkBtn.classList.add('bttn');
                linkBtn.target = '_blank'; 
                linkBtn.textContent = 'View';
                box.appendChild(linkBtn);
            } else {
                const noLinkText = document.createElement('p');
                noLinkText.classList.add('bttn', 'no-link'); 
                noLinkText.textContent = 'No Link Available';
                noLinkText.style.cursor = 'default';
                noLinkText.style.backgroundColor = '#ccc'; 
                noLinkText.style.color = '#666';
                box.appendChild(noLinkText);
            }

            eventCardsContainer.appendChild(box); 
        });
    }

    function scrollToDateEvents(date) {
        const targetElement = document.querySelector(`.box[data-event-date="${date}"]`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetElement.style.border = '2px solid #ee6eea';
            setTimeout(() => {
                targetElement.style.border = ''; 
            }, 2000);
        }
    }

    // --- Data Fetching (การดึงข้อมูลจาก Google Sheet API) ---
    async function fetchEvents() {
        // --- เพิ่มตรงนี้: แสดง Loading Overlay เมื่อเริ่มดึงข้อมูล ---
        loadingOverlay.classList.remove('hidden'); 

        try {
            const response = await fetch(GOOGLE_SHEET_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            allEvents = data.filter(event => event.date && event.title)
                            .map(event => {
                                if (event.date && event.date.includes('T')) {
                                    return { ...event, date: event.date.split('T')[0] };
                                }
                                return event;
                            });
            
            console.log('Fetched events:', allEvents); 
            renderCalendar(); 
            renderEventCards(allEvents); 
        } catch (error) {
            console.error("Could not fetch events:", error);
            eventCardsContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load events. Please try again later.</p>';
        } finally {
            // --- เพิ่มตรงนี้: ซ่อน Loading Overlay เมื่อดึงข้อมูลเสร็จสิ้น (ไม่ว่าจะสำเร็จหรือล้มเหลว) ---
            loadingOverlay.classList.add('hidden'); 
        }
    }

    // เริ่มต้นโดยการดึงข้อมูลกิจกรรมเมื่อหน้าเว็บโหลดเสร็จ
    fetchEvents();
});


// scrollbar //
// ===============================================
const initSlider = () => {
    const imageList = document.querySelector(".slider-wrapper .image-list");
    const slideButtons = document.querySelectorAll(".slider-wrapper .slide-button");
    const sliderScrollbar = document.querySelector(".container .slider-scrollbar");
    const scrollbarThumb = sliderScrollbar.querySelector(".scrollbar-thumb");
    const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
    
    //Handle scrollbar thumb drag
    scrollbarThumb.addEventListener("mousedown", (e) => 
    {
        const startX = e.clientX;
        const thumbPosition = scrollbarThumb.offsetLeft;

        //Update thumb position on mouse move
        const handleMouseMove = (e) =>
        {
            const deltaX = e.clientX - startX;
            const newThumbPosition = thumbPosition + deltaX;
            const maxThumbPosition = sliderScrollbar.getBoundingClientRect().width - scrollbarThumb.offsetLeft;

            const boundedPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition));
            const scrollPosition = (boundedPosition / maxThumbPosition) * maxScrollLeft;

            scrollbarThumb.style.left = `${boundedPosition}px`;
            imageList.scrollLeft = scrollPosition;
