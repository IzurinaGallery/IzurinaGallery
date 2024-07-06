const initSlider = () =>
    {
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
    
    window.addEventListener("load", initSlider);
    
    
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
        window.addEventListener("load", init);
      
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
        // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
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
                // add more browser prefixes if needed here
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
          const hammer = hammer.fn();
          hammer.on("swipeleft", () => next.click());
          hammer.on("swiperight", () => prev.click());
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
      })();
    
// VARIABLES
const elH = document.querySelectorAll(".timeline li > div");

// START
window.addEventListener("load", init);

function init() {
  setEqualHeights(elH);
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

const weekArray = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"];
const monthArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const current = new Date();
const todaysDate = current.getDate();
const currentYear = current.getFullYear();
const currentMonth = current.getMonth();

window.onload = function () {
  const currentDate = new Date();
  generateCalendarDays(currentDate);

  let calendarWeek = document.getElementsByClassName("calendar-week")[0];
  let calendarTodayButton = document.getElementsByClassName(
    "calendar-today-button"
  )[0];
  calendarTodayButton.textContent = `Today ${todaysDate}`;

  calendarTodayButton.addEventListener("click", () => {
    generateCalendarDays(currentDate);
  });

  weekArray.forEach((week) => {
    let li = document.createElement("li");
    li.textContent = week;
    li.classList.add("calendar-week-day");
    calendarWeek.appendChild(li);
  });

  const calendarMonths = document.getElementsByClassName("calendar-months")[0];
  const calendarYears = document.getElementsByClassName("calendar-years")[0];
  const monthYear = document.getElementsByClassName("calendar-month-year")[0];

  const selectedMonth = parseInt(monthYear.getAttribute("data-month") || 0);
  const selectedYear = parseInt(monthYear.getAttribute("data-year") || 0);

  monthArray.forEach((month, index) => {
    let option = document.createElement("option");
    option.textContent = month;
    option.value = index;
    option.selected = index === selectedMonth;
    calendarMonths.appendChild(option);
  });

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 60;
  const endYear = currentYear + 60;
  let newYear = startYear;
  while (newYear <= endYear) {
    let option = document.createElement("option");
    option.textContent = newYear;
    option.value = newYear;
    option.selected = newYear === selectedYear;
    calendarYears.appendChild(option);
    newYear++;
  }

  const leftArrow = document.getElementsByClassName("calendar-left-arrow")[0];

  leftArrow.addEventListener("click", () => {
    const monthYear = document.getElementsByClassName("calendar-month-year")[0];
    const month = parseInt(monthYear.getAttribute("data-month") || 0);
    const year = parseInt(monthYear.getAttribute("data-year") || 0);

    let newMonth = month === 0 ? 11 : month - 1;
    let newYear = month === 0 ? year - 1 : year;
    let newDate = new Date(newYear, newMonth, 1);
    generateCalendarDays(newDate);
  });

  const rightArrow = document.getElementsByClassName("calendar-right-arrow")[0];

  rightArrow.addEventListener("click", () => {
    const monthYear = document.getElementsByClassName("calendar-month-year")[0];
    const month = parseInt(monthYear.getAttribute("data-month") || 0);
    const year = parseInt(monthYear.getAttribute("data-year") || 0);
    let newMonth = month + 1;
    newMonth = newMonth === 12 ? 0 : newMonth;
    let newYear = newMonth === 0 ? year + 1 : year;
    let newDate = new Date(newYear, newMonth, 1);
    generateCalendarDays(newDate);
  });

  calendarMonths.addEventListener("change", function () {
    let newDate = new Date(calendarYears.value, calendarMonths.value, 1);
    generateCalendarDays(newDate);
  });

  calendarYears.addEventListener("change", function () {
    let newDate = new Date(calendarYears.value, calendarMonths.value, 1);
    generateCalendarDays(newDate);
  });
};

function generateCalendarDays(currentDate) {
  const newDate = new Date(currentDate);
  const year = newDate.getFullYear();
  const month = newDate.getMonth();
  const totalDaysInMonth = getTotalDaysInAMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  let calendarDays = document.getElementsByClassName("calendar-days")[0];

  removeAllChildren(calendarDays);

  let firstDay = 1;
  while (firstDay <= firstDayOfWeek) {
    let li = document.createElement("li");
    li.classList.add("calendar-day");
    calendarDays.appendChild(li);
    firstDay++;
  }

  let day = 1;
  while (day <= totalDaysInMonth) {
    let li = document.createElement("li");
    li.textContent = day;
    li.classList.add("calendar-day");
    if (todaysDate === day && currentMonth === month && currentYear === year) {
      li.classList.add("calendar-day-active");
    }
    calendarDays.appendChild(li);
    day++;
  }

  const monthYear = document.getElementsByClassName("calendar-month-year")[0];
  monthYear.setAttribute("data-month", month);
  monthYear.setAttribute("data-year", year);
  const calendarMonths = document.getElementsByClassName("calendar-months")[0];
  const calendarYears = document.getElementsByClassName("calendar-years")[0];
  calendarMonths.value = month;
  calendarYears.value = year;
}

function getTotalDaysInAMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
