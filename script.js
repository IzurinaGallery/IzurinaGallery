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

