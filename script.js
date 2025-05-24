document.addEventListener('DOMContentLoaded', function() {
    // --- API Configuration ---
    // !!! สำคัญมาก: เปลี่ยน 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' เป็น URL ที่คุณได้จากการ Deploy Google Apps Script !!!
    const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzv3smff4oYC8yUN5-sA4wX-QmOykyP9vq1PAfu1tIPzsSOQ8LcxAkFQEk3I6SuNBka/exec'; 

    let allEvents = []; // เก็บกิจกรรมทั้งหมดที่ดึงมาจาก Google Sheet

    // --- Calendar Logic (โค้ดปฏิทินเดิมของคุณ แต่มีการปรับปรุง) ---
    const calendarDays = document.querySelector(".calendar-days");
    const currentMonthEl = document.querySelector(".current-month");
    const prevMonthBtn = document.querySelector(".prev.month-btn");
    const nextMonthBtn = document.querySelector(".next.month-btn");
    const prevYearBtn = document.querySelector(".btn.prev-year");
    const nextYearBtn = document.querySelector(".btn.next-year");
    const todayBtn = document.querySelector(".btn.today");
    const eventCardsContainer = document.getElementById('event-cards-container'); // อ้างอิงถึง div สำหรับ Event Card

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
        calendarDays.innerHTML = ""; // ล้างวันเดิมออก
        currentMonthEl.textContent = `${months[currentMonth]} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7; // ปรับให้วันเสาร์เป็นวันแรกของสัปดาห์ (0)

        // เพิ่มช่องว่างสำหรับวันก่อนต้นเดือน
        for (let i = 0; i < firstWeekday; i++) {
            const blankDay = document.createElement("div");
            blankDay.classList.add("day", "blank");
            calendarDays.appendChild(blankDay);
        }

        // เพิ่มวันในเดือนพร้อมกิจกรรม
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement("div");
            dayEl.classList.add("day");
            dayEl.textContent = day;

            const fullDate = `<span class="math-inline">\{currentYear\}\-</span>{String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // กรองหากิจกรรมของวันนี้
            const eventsForThisDay = allEvents.filter(event => event.date === fullDate);

            if (eventsForThisDay.length > 0) {
                dayEl.classList.add("has-event"); // เพิ่ม class เพื่อให้มีสไตล์พิเศษ

                // เพิ่มจุดแสดงกิจกรรม (Event Dot)
                eventsForThisDay.forEach(event => {
                    const eventDot = document.createElement("div");
                    eventDot.classList.add("event-dot");
                    if (event.highlight && event.highlight.toUpperCase() === 'TRUE') {
                        eventDot.style.backgroundColor = '#EE6EEA'; // ใช้สีไฮไลท์
                    } else if (event.highlight && event.highlight.startsWith('#')) {
                        eventDot.style.backgroundColor = event.highlight; // ใช้สีที่กำหนดเอง
                    }
                    dayEl.appendChild(eventDot);
                });

                // เพิ่ม Event Listener เมื่อคลิกที่วันที่มีกิจกรรม จะเลื่อนไปที่ Event Card
                dayEl.addEventListener('click', () => {
                    scrollToDateEvents(fullDate);
                });
            }

            // กำหนด class 'today' สำหรับวันปัจจุบัน
            if (day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
                dayEl.classList.add("today");
            }
            calendarDays.appendChild(dayEl);
        }
    }

    // ฟังก์ชันเปลี่ยนเดือน
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

    // ฟังก์ชันเปลี่ยนปี
    function changeYear(delta) {
        currentYear += delta;
        renderCalendar();
    }

    // ฟังก์ชันกลับไปวันปัจจุบัน
    function goToToday() {
        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();
        renderCalendar();
    }

    // Event Listener สำหรับปุ่มควบคุมปฏิทิน
    prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => changeMonth(1));
    prevYearBtn.addEventListener("click", () => changeYear(-1));
    nextYearBtn.addEventListener("click", () => changeYear(1));
    todayBtn.addEventListener("click", goToToday);

    // --- Event Card Rendering (การสร้าง Event Card) ---
    function renderEventCards(eventsToRender) {
        eventCardsContainer.innerHTML = ''; // ล้าง Event Card เดิมออกทั้งหมด

        // เรียงลำดับกิจกรรมตามวันที่และเวลา
        eventsToRender.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // ถ้าวันที่เดียวกัน ให้เรียงตามเวลา (ถ้าเวลาอยู่ในรูปแบบที่เปรียบเทียบได้)
            if (a.time && b.time) {
                return a.time.localeCompare(b.time);
            }
            return 0;
        });

        // ถ้าไม่มีกิจกรรมให้แสดงข้อความ
        if (eventsToRender.length === 0) {
            eventCardsContainer.innerHTML = '<p style="text-align: center; color: #555;">No upcoming events found.</p>';
            return;
        }

        // สร้าง Event Card แต่ละอัน
        eventsToRender.forEach(event => {
            const box = document.createElement('div');
            box.classList.add('box');
            box.setAttribute('data-event-date', event.date); // เพิ่ม attribute เพื่อใช้เลื่อนหน้าจอ

            const boxTop = document.createElement('div');
            boxTop.classList.add('box-top');

            const img = document.createElement('img');
            img.classList.add('box-image');
            img.src = event.image; // ดึงรูปภาพจาก Google Sheet
            img.alt = event.title;

            const titleFlex = document.createElement('div');
            titleFlex.classList.add('title-flex');

            const title = document.createElement('h3');
            title.classList.add('box-title');
            title.textContent = event.title; // ดึงชื่อกิจกรรมจาก Google Sheet

            const description = document.createElement('p');
            description.classList.add('description');
            // ดึงข้อมูลวันที่, เวลา, ช่องทางจาก Google Sheet
            description.innerHTML = `Date : ${event.date}<br>Time : ${event.time}<br>Channel : ${event.channel}`;

            const linkBtn = document.createElement('a');
            linkBtn.href = event.link; // ดึงลิงก์จาก Google Sheet
            linkBtn.classList.add('bttn');
            linkBtn.target = '_blank'; // เปิดในแท็บใหม่
            linkBtn.textContent = 'View';

            titleFlex.appendChild(title);
            boxTop.appendChild(img);
            boxTop.appendChild(titleFlex);
            boxTop.appendChild(description);
            box.appendChild(boxTop);
            box.appendChild(linkBtn);

            eventCardsContainer.appendChild(box); // เพิ่ม Event Card เข้าไปใน HTML
        });
    }

    // ฟังก์ชันสำหรับเลื่อนหน้าจอไปที่ Event Card ของวันที่นั้นๆ
    function scrollToDateEvents(date) {
        const targetElement = document.querySelector(`.box[data-event-date="${date}"]`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Optional: เพิ่ม highlight ชั่วคราวให้ card
            targetElement.style.border = '2px solid #ee6eea';
            setTimeout(() => {
                targetElement.style.border = ''; // ลบ highlight หลังจาก 2 วินาที
            }, 2000);
        }
    }

    // --- Data Fetching (การดึงข้อมูลจาก Google Sheet API) ---
    async function fetchEvents() {
        try {
            const response = await fetch(GOOGLE_SHEET_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // กรองกิจกรรมที่ไม่สมบูรณ์ (ไม่มีวันที่หรือชื่อ)
            allEvents = data.filter(event => event.date && event.title); 
            console.log('Fetched events:', allEvents); // สำหรับ Debugging ใน Console
            renderCalendar(); // แสดงปฏิทินพร้อมจุดกิจกรรม
            renderEventCards(allEvents); // แสดง Event Card ทั้งหมด
        } catch (error) {
            console.error("Could not fetch events:", error);
            eventCardsContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load events. Please try again later.</p>';
        }
    }

    // เริ่มต้นโดยการดึงข้อมูลกิจกรรมเมื่อหน้าเว็บโหลดเสร็จ
    fetchEvents();
});
