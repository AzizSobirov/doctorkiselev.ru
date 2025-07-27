// modal
const modal = {
  el: document.querySelector(".modal-overlay"),
  activeModal: null,

  init() {
    this.setupTriggers();
    this.setupOutsideClick();
  },

  setupTriggers() {
    const triggers = document.querySelectorAll("[data-modal]");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const modalName = trigger.dataset.modal;
        if (modalName === "close") {
          this.close();
        } else {
          this.open(modalName);
        }
      });
    });
  },

  setupOutsideClick() {
    this.el.addEventListener("click", (event) => {
      if (event.target === this.el) {
        this.close();
      }
    });
  },

  open(name) {
    const targetModal = this.el.querySelector(`[data-template="${name}"]`);

    if (targetModal) {
      this.close(true); // Close any currently active modal
      this.activeModal = targetModal;

      this.el.style.display = "flex"; // Show the overlay
      requestAnimationFrame(() => {
        this.el.classList.add("show"); // Animate overlay
        this.activeModal.style.display = "flex"; // Show modal content

        // Add animation class to modal content
        requestAnimationFrame(() => {
          this.activeModal.classList.add("show");
        });
      });
    } else {
      console.error(`Modal with name "${name}" not found.`);
    }
  },

  close(onlyModal = false) {
    if (onlyModal) {
      if (this.activeModal) {
        this.activeModal.style.display = "none"; // Fully hide modal content
        this.activeModal.classList.remove("show"); // Hide modal content
      }
    } else {
      if (this.activeModal) {
        this.activeModal.classList.remove("show"); // Hide modal content
        const modalToHide = this.activeModal; // Preserve reference for timeout
        this.activeModal = null;

        setTimeout(() => {
          modalToHide.style.display = "none"; // Fully hide after animation
        }, 250); // Match the CSS animation duration
      }

      this.el.classList.remove("show"); // Animate overlay
      this.el.addEventListener(
        "transitionend",
        () => {
          if (!this.el.classList.contains("show")) {
            this.el.style.display = "none"; // Fully hide overlay
          }
        },
        { once: true }
      );
    }
  },
};
modal.init();

// header
const header = document.querySelector(".header");
if (header) {
  const menu = header.querySelector(".header__catalog");
  const services = menu.querySelectorAll(".menu-item-has-children");
  let lastScrollY = window.scrollY;

  if (window.innerWidth > 1280) {
    window.addEventListener("scroll", () => {
      const header = document.querySelector("header");
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Scrolling Down
        header.classList.remove("up");
        header.classList.add("down");
      } else {
        // Scrolling Up
        header.classList.remove("down");
        header.classList.add("up");
      }

      header.classList.toggle("sticky", currentScrollY > 0);
      lastScrollY = currentScrollY;
    });
  }

  services.forEach((service) => {
    const subMenu = service.querySelector(".sub-menu");

    service.addEventListener("mouseenter", () => {
      subMenu.style.display = "flex"; // Ensure the submenu is visible

      // Reset any previous positioning
      subMenu.style.left = "";
      subMenu.style.right = "";

      setTimeout(() => {
        subMenu.dataset.state = "active";

        // Check if submenu overflows the viewport
        const rect = subMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // If submenu extends beyond the right edge of the viewport
        if (rect.right > viewportWidth) {
          // Position it to align with the right edge of the parent
          subMenu.style.left = "auto";
          subMenu.style.right = "0";
        }
      }, 10);
    });

    service.addEventListener("mouseleave", () => {
      subMenu.dataset.state = "inactive";

      subMenu.addEventListener("transitionend", function handler(event) {
        if (subMenu.dataset.state != "active") {
          subMenu.style.display = "none"; // Hide after fade-out
          // Reset positioning when hiding
          subMenu.style.left = "";
          subMenu.style.right = "";
          subMenu.removeEventListener("transitionend", handler);
        }
      });
    });
  });

  const tabsEl = header.querySelector(".mobile__menu-tabs");
  const tabs = tabsEl.querySelectorAll("[data-toggle]");
  const tabsBody = header.querySelector(".mobile__menu-content");
  const tabsContent = header.querySelector("#menu-content");
  const tabsContentClose = header.querySelector(".mobile__menu-close");
  const tabsContacts = tabsEl.querySelector(".mobile__menu-contacts");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const isActive = tab.classList.contains("active");
      tabs.forEach((tab) => tab.classList.remove("active"));
      tabsContacts.style.maxHeight = 0;

      if (isActive) {
        tabsBody.classList.remove("show");

        // Wait for the animation to finish before setting display to 'none'
        tabsBody.addEventListener("transitionend", function handler(event) {
          if (
            event.propertyName === "transform" &&
            !tabsBody.classList.contains("show")
          ) {
            tabsBody.style.display = "none";
            tabsContent.innerHTML = "";
            tabsBody.removeEventListener("transitionend", handler);
          }
        });
      }

      // If tab was not already active, show the content
      if (!isActive) {
        tab.classList.add("active");

        if (tab.dataset.toggle != "contacts") {
          tabsBody.style.display = "flex";

          requestAnimationFrame(() => {
            tabsBody.classList.add("show");
          });
        } else {
          tabsContacts.style.maxHeight = tabsContacts.scrollHeight + "px";
          tabsBody.classList.remove("show");

          // Wait for the animation to finish before setting display to 'none'
          tabsBody.addEventListener("transitionend", function handler(event) {
            if (
              event.propertyName === "transform" &&
              !tabsBody.classList.contains("show")
            ) {
              tabsBody.style.display = "none";
              tabsContent.innerHTML = "";
              tabsBody.removeEventListener("transitionend", handler);
            }
          });
        }

        if (tab.dataset.toggle == "menu") {
          // Get the top menu content
          const topMenu = header.querySelector(".header__top-menu .menu");
          const topMenuHtml = topMenu ? topMenu.innerHTML : "";

          tabsContent.innerHTML = `
            <ul class="menu">
            ${topMenuHtml}
            </ul>
          `;
        } else if (tab.dataset.toggle == "catalog") {
          // Get the bottom menu (catalog) content
          const catalogMenu = header.querySelector(".header__catalog .menu");
          const catalogMenuHtml = catalogMenu ? catalogMenu.innerHTML : "";

          tabsContent.innerHTML = `
            <ul class="menu">
            ${catalogMenuHtml}
            </ul>
          `;
        }
      }
    });
  });

  tabsContentClose.addEventListener("click", () => {
    // Add animation for hiding
    tabsBody.classList.remove("show");
    tabsBody.addEventListener("transitionend", function handler(event) {
      if (
        event.propertyName === "transform" &&
        !tabsBody.classList.contains("show")
      ) {
        tabsBody.style.display = "none";
        tabsContent.innerHTML = "";
        tabsBody.removeEventListener("transitionend", handler);
      }
    });

    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
  });
}

// hero
const hero = document.querySelector(".hero");
if (hero) {
  const heroVideo = document.querySelector(".hero__video");
  const heroDoctor = document.querySelector(".hero__doctor");

  const updateHeroMask = () => {
    if (heroVideo) {
      const maskPath = heroVideo.querySelector(".hero__video-mask #maskPath");

      const { width: w, height: h } = heroVideo.getBoundingClientRect();

      const r1 = 40; // radius 1
      const r2 = 74; // radius 2
      const c1 = 205; // First cut height
      const cw1 = 460; // First cut width
      const c2 = 128; // Second cut height
      const cw2 = 608; // Second cut width

      const path = `
        M 0,${r2} 
        Q 0,0 ${r2},0
        L ${w - r2},0
        Q ${w},0 ${w},${r2}
        L ${w},${h - c1 - r2}
        Q ${w},${h - c1} ${w - r2},${h - c1}
        L ${w - cw1 + r1},${h - c1}
        Q ${w - cw1},${h - c1} ${w - cw1},${h - c1 + r1}
        L ${w - cw1},${h - c2 - r1}
        Q ${w - cw1},${h - c2} ${w - cw1 - r1},${h - c2}
        L ${w - cw2 + r2},${h - c2}
        Q ${w - cw2},${h - c2} ${w - cw2},${h - c2 + r2}
        L ${w - cw2 + 1},${h - r2}
        Q ${w - cw2 + 1},${h} ${w - cw2 - r2 + 1},${h}
        L ${r2},${h}
        Q 0,${h} 0,${h - r2}
        Z
    `
        .replace(/\s+/g, " ")
        .trim();

      maskPath.setAttribute("d", path);
    }

    if (heroDoctor) {
      const maskPath = heroDoctor.querySelector(
        ".hero__doctor-mask #maskPath2"
      );

      const { width: w, height: h } = heroDoctor.getBoundingClientRect();

      const r1 = 40;
      const r2 = 50;
      const c1 = 114; // First cut height
      const cw1 = 145; // First cut width

      const path = `
        M 0,${h - c1 + r2}
        Q 0,${h - c1} ${r2},${h - c1}
        L ${cw1 - r1},${h - c1}
        Q ${cw1},${h - c1} ${cw1},${h - c1 - r1}
        L ${cw1},${r1}
        Q ${cw1},0 ${cw1 + r1},0
        L ${w - r1},0 
        Q ${w},0  ${w},${r1}
        L ${w},${h - r1}
        Q ${w},${h} ${w - r1},${h}
        L ${r2},${h}
        Q 0,${h} 0,${h - r2}
        Z
    `
        .replace(/\s+/g, " ")
        .trim();

      maskPath.setAttribute("d", path);
    }
  };

  window.addEventListener("load", updateHeroMask);
  window.addEventListener("resize", updateHeroMask);
}

// Result
const result = document.querySelector(".result");
if (result) {
  const cards = result.querySelectorAll(".card");
  cards.forEach((card) => {
    const img = card.querySelector(".card__img");
    const slider = card.querySelector(".card__img-slider");
    const thumb = card.querySelector(".card__img-thumb");
    const before = card.querySelector(".card__img-before");
    const after = card.querySelector(".card__img-after");
    const labelBefore = card.querySelector(".label--before");
    const labelAfter = card.querySelector(".label--after");

    let isDragging = false;
    let initialPosition = 50; // Start at 50%

    // Set initial position
    updateSliderPosition(initialPosition);

    // Function to update slider position
    function updateSliderPosition(position) {
      // Constrain position between 0 and 100
      position = Math.max(0, Math.min(100, position));

      // Update the clip-path for the after image
      after.style.clipPath = `inset(0 0 0 ${position}%)`;

      // Position the thumb
      thumb.style.left = `${position}%`;

      // Update label positions
      labelBefore.style.opacity = position < 20 ? "0" : "1";
      labelBefore.style.left = `${Math.max(10, position - 17)}%`;

      labelAfter.style.opacity = position > 80 ? "0" : "1";
      labelAfter.style.left = `${Math.min(85, position + 10)}%`;
    }

    // Event listeners for mouse/touch interactions
    slider.addEventListener("mousedown", startDrag);
    slider.addEventListener("touchstart", startDrag, { passive: true });

    function startDrag(e) {
      isDragging = true;
      img.classList.add("dragging");

      // Prevent default for mouse events only
      if (e.type === "mousedown") {
        e.preventDefault();
      }

      moveSlider(e);

      document.addEventListener("mousemove", moveSlider);
      document.addEventListener("touchmove", moveSlider, { passive: true });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function moveSlider(e) {
      if (!isDragging) return;

      // Get the position relative to the image
      const rect = img.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const position = (x / rect.width) * 100;

      updateSliderPosition(position);
    }

    function stopDrag() {
      isDragging = false;
      img.classList.remove("dragging");
      document.removeEventListener("mousemove", moveSlider);
      document.removeEventListener("touchmove", moveSlider);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  });
}

// specialists
const specialists = document.querySelector(".specialists");
if (specialists) {
  const specialistItems = specialists.querySelectorAll(".specialists__item");
  const specialistInfoItems = specialists.querySelectorAll(
    ".specialists__info .specialist"
  );

  specialistItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      specialistItems.forEach((el) => el.classList.remove("active"));
      // Add active class to the clicked item
      item.classList.add("active");

      // Show the corresponding info item
      specialistInfoItems.forEach((el) => el.classList.remove("active"));
      // Add active class to the corresponding info item
      specialistInfoItems[index].classList.add("active");
    });
  });
}

// Footer
const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// Swiper
const specialistsSwiper = new Swiper(".specialists__swiper", {
  slidesPerView: 1,
  effect: "fade",
  thumbs: {
    swiper: {
      el: ".specialists__thumbs",
      slidesPerView: 4,
    },
  },
});

// Initialize the fancybox
const fancyboxTriggers = Array.from(
  document.querySelectorAll("[data-fancybox]")
).filter((trigger) => trigger.dataset.fancybox);
if (fancyboxTriggers) {
  const fancyboxInstances = [];
  fancyboxTriggers.forEach((trigger) => {
    const name = trigger.dataset.fancybox;
    if (fancyboxInstances.includes(name)) {
      return; // Skip if already bound
    }
    // Add the name to the `fancyboxInstances` list
    fancyboxInstances.push(name);
  });
  fancyboxInstances.forEach((name) => {
    Fancybox.bind(`[data-fancybox="${name}"]`, {
      Images: { Panzoom: { maxScale: 3 } },
    });
  });
}

// init phone mask
const phoneMasks = document.querySelectorAll("input[name='phone']");
phoneMasks.forEach((input) => {
  let keyCode;
  function mask(event) {
    event.keyCode && (keyCode = event.keyCode);
    let pos = this.selectionStart;
    if (pos < 3) event.preventDefault();
    let matrix = "+7 (___) ___-__-__",
      i = 0,
      def = matrix.replace(/\D/g, ""),
      val = this.value.replace(/\D/g, ""),
      newValue = matrix.replace(/[_\d]/g, function (a) {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      });
    i = newValue.indexOf("_");
    if (i != -1) {
      i < 5 && (i = 3);
      newValue = newValue.slice(0, i);
    }
    let reg = matrix
      .substr(0, this.value.length)
      .replace(/_+/g, function (a) {
        return "\\d{1," + a.length + "}";
      })
      .replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (
      !reg.test(this.value) ||
      this.value.length < 5 ||
      (keyCode > 47 && keyCode < 58)
    )
      this.value = newValue;
    if (event.type == "blur" && this.value.length < 5) this.value = "";

    if (this.value.length == 18 || this.value.length == 0) {
      input.dataset.numbervalid = "true";
    } else {
      input.dataset.numbervalid = "false";
    }
  }

  input.addEventListener("input", mask, false);
  input.addEventListener("focus", mask, false);
  input.addEventListener("blur", mask, false);
  input.addEventListener("keydown", mask, false);
});

// form
function successSend() {
  modal.open("success");

  setTimeout(() => {
    modal.close();
  }, 3000);
}

const forms = document.querySelectorAll(".the-form");
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    successSend();
  });
});
