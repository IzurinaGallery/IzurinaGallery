// ===============================================
// 1. โค้ดสำหรับ Image Slider (initSlider)
//    - จัดการปุ่มเลื่อนภาพและ scrollbar
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
        }
        
        //Remove event listeners on mouse up
        const handleMouseUp = () => 
        {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
        //Add event listeners for drag interaction
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    });

    // Slide images according to the slide button clicks
    slideButtons.forEach(button =>
    {
        button.addEventListener("click", () => 
        {
            const direction = button.id === "prev-slide" ? -1 : 1;
            const scrollAmount = imageList.clientWidth * direction;
            imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    });

    const handleSlideButtons = () => {
        slideButtons[0].style.display = imageList.scrollLeft <= 0 ? "none" : "block";
        slideButtons[1].style.display = imageList.scrollLeft >= maxScrollLeft ? "none" : "block";
    }

    //Update scrollbar thumb position based on image scroll
    const updateScrollThumbPosition = () => {
        const scrollPosition = imageList.scrollLeft;
        const thumbPosition = (scrollPosition / maxScrollLeft) * (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
        scrollbarThumb.style.left = `${thumbPosition}px`;
    }
    imageList.addEventListener("scroll", () => 
    {
        handleSlideButtons();
        updateScrollThumbPosition();
    });
}

// ===============================================
// 2. โค้ดสำหรับ Timeline Component
//    - จัดการการเลื่อน timeline และปุ่มลูกศร
// ===============================================
(function () {
    // VARIABLES
    const timeline = document.querySelector(".timeline ol"),
      elH = document.querySelectorAll(".timeline li > div"),
      arrows = document.querySelectorAll(".timeline .arrows .arrow"),
      arrowPrev = document.querySelector(".timeline .arrows .arrow__prev"),
      arrowNext = document.querySelector(".timeline .arrows .arrow__next"),
      firstItem = document.querySelector(".timeline li:first-child"),
      lastItem = document.querySelector(".timeline li:last-child"),
      xScrolling = 300,
      disabledClass = "disabled";
    
    // START
    // window.addEventListener("load", init); // บรรทัดนี้จะถูกรวมไปใน window.addEventListener("load") ด้านล่าง

    function init() {
      setEqualHeights(elH);
      animateTl(xScrolling, arrows, timeline);
      setSwipeFn(timeline, arrowPrev, arrowNext);
      setKeyboardFn(arrowPrev, arrowNext);
    }
    
    // SET EQUAL HEIGHTS
    function setEqualHeights(el) {
      let counter = 0;
      for (let i = 0; i < el.length; i++) {
        const singleHeight = el[i].offsetHeight;
    
        if (counter < singleHeight) {
          counter = singleHeight;
        }
      }
    
      for (let i = 0; i < el.length; i++) {
        el[i].style.height = `${counter}px`;
      }
    }
    
    // CHECK IF AN ELEMENT IS IN VIEWPORT
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    
    // SET STATE OF PREV/NEXT ARROWS
    function setBtnState(el, flag = true) {
      if (flag) {
        el.classList.add(disabledClass);
      } else {
        if (el.classList.contains(disabledClass)) {
          el.classList.remove(disabledClass);
        }
        el.disabled = false;
      }
    }
    
    // ANIMATE TIMELINE
    function animateTl(scrolling, el, tl) {
      let counter = 0;
      for (let i = 0; i < el.length; i++) {
        el[i].addEventListener("click", function () {
          if (!arrowPrev.disabled) {
            arrowPrev.disabled = true;
          }
          if (!arrowNext.disabled) {
            arrowNext.disabled = true;
          }
          const sign = this.classList.contains("arrow__prev") ? "" : "-";
          if (counter === 0) {
            tl.style.transform = `translateX(-${scrolling}px)`;
          } else {
            const tlStyle = getComputedStyle(tl);
            const tlTransform =
              tlStyle.getPropertyValue("-webkit-transform") ||
              tlStyle.getPropertyValue("transform");
            const values =
              parseInt(tlTransform.split(",")[4]) +
              parseInt(`${sign}${scrolling}`);
            tl.style.transform = `translateX(${values}px)`;
          }
    
          setTimeout(() => {
            isElementInViewport(firstItem)
              ? setBtnState(arrowPrev)
              : setBtnState(arrowPrev, false);
            isElementInViewport(lastItem)
              ? setBtnState(arrowNext)
              : setBtnState(arrowNext, false);
          }, 1100);
    
          counter++;
        });
      }
    }
    
    // ADD SWIPE SUPPORT FOR TOUCH DEVICES
    function setSwipeFn(tl, prev, next) {
      // ตรวจสอบว่า hammer.fn() มีอยู่หรือไม่
      if (typeof Hammer !== 'undefined' && Hammer.fn) {
        const hammer = Hammer.fn();
        hammer.on("swipeleft", () => next.click());
        hammer.on("swiperight", () => prev.click());
      } else {
        console.warn("Hammer.js not loaded. Swipe functionality disabled.");
      }
    }
    
    // ADD BASIC KEYBOARD FUNCTIONALITY
    function setKeyboardFn(prev, next) {
      document.addEventListener("keydown", (e) => {
        if (e.which === 37 || e.which === 39) {
          const timelineOfTop = timeline.offsetTop;
          const y = window.pageYOffset;
          if (timelineOfTop !== y) {
            window.scrollTo(0, timelineOfTop);
          }
          if (e.which === 37) {
            prev.click();
          } else if (e.which === 39) {
            next.click();
          }
        }
      });
    }

    // ทำให้ฟังก์ชัน init สามารถเข้าถึงได้จากภายนอก closure นี้
    // เพื่อให้เรียกใช้ใน window.addEventListener("load") ได้
    window.initTimeline = init; 
})();

// หมายเหตุ: โค้ด setEqualHeights ซ้ำกัน ควรลบอันล่างนี้ออก
// const elH = document.querySelectorAll(".timeline li > div");
// window.addEventListener("load", init); // อันนี้ก็ซ้ำ
// function init() { setEqualHeights(elH); } // อันนี้ก็ซ้ำ
// function setEqualHeights(el) { ... } // อันนี้ก็ซ้ำ


// ===============================================
// 3. โค้ดสำหรับ Calendar
//    - แสดงผลปฏิทิน และจัดการการเปลี่ยนเดือน/ปี
// ===============================================
var currentMonth = document.querySelector(".current-month");
var calendarDays = document.querySelector(".calendar-days");
var today = new Date();
var date = new Date(); // ใช้ date นี้สำหรับการแสดงผลปฏิทิน

currentMonth.textContent = date.toLocaleDateString("en-US", {month:'long', year:'numeric'});
today.setHours(0,0,0,0);
renderCalendar(); // เรียก renderCalendar() ครั้งแรก

function renderCalendar(){
    const prevLastDay = new Date(date.getFullYear(),date.getMonth(),0).getDate();
    const totalMonthDay = new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
    const startWeekDay = new Date(date.getFullYear(),date.getMonth(),1).getDay();
    
    calendarDays.innerHTML = "";

    let totalCalendarDay = 6 * 7; // แสดง 6 แถวของสัปดาห์
    for (let i = 0; i < totalCalendarDay; i++) {
        let day = i-startWeekDay;

        if(i < startWeekDay){ // แก้ไขเงื่อนไขตรงนี้จาก <= เป็น <
            // adding previous month days
            calendarDays.innerHTML += `<div class='padding-day'>${prevLastDay-startWeekDay+i+1}</div>`; // แก้ไขการคำนวณวันก่อนหน้าให้ถูกต้อง
        }else if(day < totalMonthDay){ // แก้ไขเงื่อนไขตรงนี้จาก <= เป็น <
            // adding this month days
            // ไม่ควรใช้ date.setDate(day) ตรงนี้ เพราะจะเปลี่ยน global date object
            // ให้สร้าง Date object ชั่วคราวสำหรับการเปรียบเทียบ
            let currentDayInLoop = new Date(date.getFullYear(), date.getMonth(), day + 1); // +1 เพราะ day เริ่มจาก 0
            currentDayInLoop.setHours(0,0,0,0);

            let dayClass = currentDayInLoop.getTime() === today.getTime() ? 'today' : 'month-day'; // เปลี่ยน 'current-day' เป็น 'today' ตาม CSS

            // *** หากต้องการเชื่อมโยงกับกิจกรรม ***
            // ตรงนี้จะเป็นจุดที่เพิ่ม class 'has-event' หรือ event-dot
            // ต้องมีข้อมูล events ที่ fetch มาแล้ว (เช่น เก็บในตัวแปร global หรือส่งผ่าน parameter)
            // และใช้ currentDayInLoop เพื่อตรวจสอบว่ามีกิจกรรมในวันนี้หรือไม่
            // ตัวอย่าง: if (events.some(e => new Date(e.date).toDateString() === currentDayInLoop.toDateString())) { dayClass += ' has-event'; }
            
            calendarDays.innerHTML += `<div class='${dayClass}'>${day + 1}</div>`; // แสดงวัน +1
        }else{
            // adding next month days
            calendarDays.innerHTML += `<div class='padding-day'>${day-totalMonthDay+1}</div>`; // แสดงวัน +1
        }
    }
    // หากมีการเชื่อมโยง calendar กับ event dots
    // addEventDotsToCalendar(window.allEvents); // เรียกฟังก์ชันเพิ่มจุด (ถ้ามีข้อมูล allEvents ทั่วโลก)
}

document.querySelectorAll(".month-btn").forEach(function (element) {
    element.addEventListener("click", function () {
        date = new Date(currentMonth.textContent); // ใช้ date ตัวแปร global
        date.setMonth(date.getMonth() + (element.classList.contains("prev") ? -1 : 1));
        currentMonth.textContent = date.toLocaleDateString("en-US", {month:'long', year:'numeric'});
        renderCalendar();
    });
});

document.querySelectorAll(".btn").forEach(function (element) {
    element.addEventListener("click", function () {
        let btnClass = element.classList;
        date = new Date(currentMonth.textContent); // ใช้ date ตัวแปร global
        if(btnClass.contains("today"))
            date = new Date();
        else if(btnClass.contains("prev-year"))
            date = new Date(date.getFullYear()-1, 0, 1);
        else
            date = new Date(date.getFullYear()+1, 0, 1);
        
    currentMonth.textContent = date.toLocaleDateString("en-US", {month:'long', year:'numeric'});
    renderCalendar();
    });
});


// ===============================================
// 4. โค้ดสำหรับดึงข้อมูล Event จาก Google Sheet API และสร้าง Event Card
//    - นี่คือส่วนสำคัญที่เพิ่มเข้ามาเพื่อแก้ไขปัญหาวันที่ไม่ตรงกัน
// ===============================================

// URL ของ Google Apps Script Web App ของคุณ
// **สำคัญ: คุณต้องแทนที่ 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' ด้วย URL จริงของคุณ**
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzv3smff4oYC8yUN5-sA4wX-QmOykyP9vq1PAfu1tIPzsSOQ8LcxAkFQEk3I6SuNBka/exec'; 

// ฟังก์ชันสำหรับดึงข้อมูลกิจกรรมและแสดงผลบน Event Cards
async function fetchEventsAndRenderCards() {
    const eventCardsContainer = document.getElementById('event-cards-container');
    const loadingOverlay = document.getElementById('loading-overlay');

    // แสดง Loading Overlay
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json(); // สมมติว่าได้ข้อมูลเป็น Array ของ Object
        
        // เก็บข้อมูล events ไว้ในตัวแปร global หรือส่งผ่าน เพื่อให้ calendar สามารถใช้ได้
        // window.allEvents = events; // หากต้องการเชื่อมโยงกับ calendar

        // ล้าง Event Cards เดิมที่มีอยู่ (ถ้ามี)
        eventCardsContainer.innerHTML = '';

        // วนลูปสร้าง Event Card สำหรับแต่ละกิจกรรม
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('box'); // ใช้ class 'box' ตาม CSS ของคุณ

            // แปลงรูปแบบวันที่เพื่อแสดงผล (หากข้อมูลจาก Sheet ไม่ตรงตามที่ต้องการ)
            let displayDate = event.date; // ใช้ค่าจาก event.date โดยตรงก่อน
            if (event.date) { // ตรวจสอบว่ามีข้อมูลวันที่
                try {
                    const dateObj = new Date(event.date); // สร้าง Date object จาก string
                    // ตรวจสอบว่าวันที่ที่แปลงมาถูกต้องหรือไม่ (เช่น ไม่ใช่ Invalid Date)
                    if (!isNaN(dateObj.getTime())) {
                        // แปลงรูปแบบวันที่เป็น "Month Day, Year" เช่น "May 31, 2025"
                        displayDate = dateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    } else {
                        // ถ้าแปลงไม่ได้ ก็ใช้ค่าเดิมจาก sheet (เช่น "2025-05-31")
                        displayDate = event.date;
                    }
                } catch (e) {
                    console.error("Error parsing date:", event.date, e);
                    displayDate = event.date; // ใช้ค่าเดิมหากเกิดข้อผิดพลาด
                }
            } else {
                displayDate = 'วันที่ไม่ระบุ'; // ถ้าไม่มีข้อมูลวันที่ใน sheet
            }

            eventCard.innerHTML = `
                <img src="${event.image || 'https://placehold.co/400x200/cccccc/333333?text=No+Image'}" 
                     alt="${event.title || 'No Image'}" 
                     class="box-image"
                     onerror="this.onerror=null;this.src='https://placehold.co/400x200/cccccc/333333?text=Image+Error';">
                <div class="title-flex">
                    <h3 class="box-title">${event.title || 'No Title'}</h3>
                </div>
                <p class="description">
                    <strong>Date:</strong> ${displayDate}<br>
                    <strong>Time:</strong> ${event.time || 'N/A'}<br>
                    <strong>Place:</strong> ${event.place || 'N/A'}<br>
                    ${event.detail ? `<br>${event.detail}` : ''}
                </p>
                <a href="${event.link || '#'}" class="bttn" target="_blank">View</a>
            `;
            eventCardsContainer.appendChild(eventCard);
        });

    } catch (error) {
        console.error('Failed to fetch events:', error);
        eventCardsContainer.innerHTML = `<p style="color: red; text-align: center; width: 100%;">
                                            ไม่สามารถโหลดข้อมูลกิจกรรมได้: ${error.message}
                                        </p>`;
    } finally {
        // ซ่อน Loading Overlay เมื่อโหลดเสร็จสิ้น (ไม่ว่าจะสำเร็จหรือล้มเหลว)
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
}


// ===============================================
// 5. Global Event Listener เมื่อหน้าเว็บโหลดเสร็จ
//    - เรียกใช้ฟังก์ชันหลักทั้งหมด
// ===============================================

window.addEventListener("load", () => {
    initSlider(); // เรียกใช้ฟังก์ชัน Image Slider
    
    // เรียกใช้ฟังก์ชัน initTimeline หากคุณมี Hammer.js และต้องการใช้ Timeline
    if (window.initTimeline) {
        window.initTimeline();
    } else {
        console.warn("initTimeline is not defined. Ensure Hammer.js is loaded and timeline script initializes correctly.");
    }

    // เรียกใช้ Calendar และ Event Card Fetcher
    renderCalendar(); // เรียกใช้ Calendar
    fetchEventsAndRenderCards(); // <--- เรียกใช้ฟังก์ชันดึงข้อมูลและสร้าง Event Card
});
