/* =====================================================
QAS PROPERTIES - PUBLIC WEBSITE
Content (contact details, projects, videos, smart-living)
lives in site-config.js. Property listings come from
Supabase (only properties marked "Published" appear).
===================================================== */

(function () {

    "use strict";

    const SUPABASE_URL = "https://epoufuxwjtfckkmuukbl.supabase.co";

    // Publishable key: safe to use in website code
    const SUPABASE_KEY = "sb_publishable_dEnnKqJDLUp36-VlqrfV-A_g0uoIDhF";


    /* =================================
    SETTINGS + HELPERS
    ================================= */

    const cfg = Object.assign(
        {
            name: "QAS Properties Nigeria Limited",
            address: "No 5 Kwaji Close, Maitama, Abuja FCT",
            phoneDisplay: "+234 913 888 8887",
            phoneLink: "+2349138888887",
            whatsapp: "2349138888887",
            email: "qashodeinde@yahoo.com",
            tagline: "We build it, you love it.",
            projects: [],
            videos: [],
            smartFeatures: [],
            testimonials: [],
            faq: []
        },
        typeof SITE !== "undefined" ? SITE : {}
    );

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    // Makes text safe to place inside HTML
    function esc(value) {

        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return String(value === null || value === undefined ? "" : value)
            .replace(/[&<>"']/g, function (char) {
                return map[char];
            });

    }

    function isSafeUrl(text) {

        try {

            const url = new URL(text);

            return url.protocol === "https:" || url.protocol === "http:";

        } catch (error) {

            return false;

        }

    }

    function formatPrice(value) {

        if (value === null || value === undefined || value === "") {
            return "Price on request";
        }

        return "\u20A6" + Number(value).toLocaleString("en-NG");

    }

    function whatsappLink(text) {

        return "https://wa.me/" + cfg.whatsapp +
            "?text=" + encodeURIComponent(text);

    }

    function youtubeId(url) {

        try {

            const parsed = new URL(url);

            let id = null;

            if (parsed.hostname === "youtu.be") {

                id = parsed.pathname.slice(1);

            } else if (parsed.hostname.endsWith("youtube.com")) {

                if (parsed.pathname === "/watch") {

                    id = parsed.searchParams.get("v");

                } else {

                    const match =
                        parsed.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);

                    if (match) id = match[2];

                }

            }

            return id && /^[\w-]{6,20}$/.test(id) ? id : null;

        } catch (error) {

            return null;

        }

    }

    function youtubeEmbed(id, autoplay) {

        return "https://www.youtube-nocookie.com/embed/" + id +
            "?rel=0" + (autoplay ? "&autoplay=1" : "");

    }

    const IFRAME_ATTRS =
        'allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" ' +
        'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"';


    /* =================================
    SITE CONTENT (from site-config.js)
    ================================= */

    function bindSiteContent() {

        $$("[data-bind]").forEach(function (element) {

            const value = cfg[element.dataset.bind];

            if (value) element.textContent = value;

        });

        $$('[data-href="tel"]').forEach(function (element) {
            element.href = "tel:" + cfg.phoneLink;
        });

        $$('[data-href="mailto"]').forEach(function (element) {
            element.href = "mailto:" + cfg.email;
        });

        $$("[data-wa]").forEach(function (element) {

            element.href = whatsappLink(
                element.dataset.waText ||
                "Hello QAS Properties, I would like to make an enquiry."
            );

        });

        const year = $("#year");

        if (year) year.textContent = new Date().getFullYear();

    }


    /* =================================
    HEADER + MENU
    ================================= */

    const header = $("#siteHeader");
    const nav = $("#siteNav");
    const menuToggle = $("#menuToggle");

    function updateHeader() {

        header.classList.toggle("is-solid", window.scrollY > 40);

    }

    function setMenu(open) {

        nav.classList.toggle("is-open", open);

        header.classList.toggle("menu-open", open);

        menuToggle.setAttribute("aria-expanded", String(open));

        menuToggle.setAttribute(
            "aria-label",
            open ? "Close menu" : "Open menu"
        );

    }

    window.addEventListener("scroll", updateHeader, { passive: true });

    updateHeader();

    menuToggle.addEventListener("click", function () {
        setMenu(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {

        if (event.target.closest("a")) setMenu(false);

    });

    // Highlight the menu link for the section on screen

    const menuLinks = $$('.nav a[href^="#"]').filter(function (link) {
        return !link.classList.contains("btn");
    });

    if ("IntersectionObserver" in window) {

        const sectionObserver = new IntersectionObserver(function (entries) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) return;

                menuLinks.forEach(function (link) {

                    link.classList.toggle(
                        "is-active",
                        link.getAttribute("href") === "#" + entry.target.id
                    );

                });

            });

        }, { rootMargin: "-40% 0px -55% 0px" });

        menuLinks.forEach(function (link) {

            const section = $(link.getAttribute("href"));

            if (section) sectionObserver.observe(section);

        });

    }


    /* =================================
    SCROLL ANIMATION
    ================================= */

    const revealObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(function (entries, observer) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("is-in");

                    observer.unobserve(entry.target);

                }

            });

        }, { threshold: 0.02, rootMargin: "0px 0px 0px 0px" })
        : null;

    function watchReveals() {

        $$(".reveal:not(.is-in)").forEach(function (element) {

            if (revealObserver) {
                revealObserver.observe(element);
            } else {
                element.classList.add("is-in");
            }

        });

    }


    /* =================================
    SMART LIVING
    ================================= */

    function renderFeatures() {

        const list = $("#featureList");

        const features = cfg.smartFeatures || [];

        if (features.length === 0) {

            $("#smart").hidden = true;

            const link = $('.nav a[href="#smart"]');

            if (link) link.closest("li").hidden = true;

            return;

        }

        list.innerHTML = features.map(function (feature, index) {

            return `
                <div class="feature reveal" style="--rd: ${index * 0.08}s">
                    <svg class="i" aria-hidden="true">
                        <use href="#i-${esc(feature.icon || "shield")}"/>
                    </svg>
                    <h3>${esc(feature.title)}</h3>
                    <p>${esc(feature.text)}</p>
                </div>
            `;

        }).join("");

    }


    /* =================================
    PROJECTS
    ================================= */

    function renderProjects() {

        const projects = cfg.projects || [];

        if (projects.length === 0) return;

        $("#projectList").innerHTML = projects.map(function (project) {

            const status = String(project.status || "");

            const media = project.image
                ? `
                    <div class="project__media">
                        <img
                            src="${esc(project.image)}"
                            alt="${esc(project.title)}"
                            loading="lazy"
                        >
                    </div>
                `
                : `
                    <div class="project__media project__media--empty">
                        <img src="logo.png" alt="">
                    </div>
                `;

            const location = project.location
                ? `
                    <p class="project__loc">
                        <svg class="i" aria-hidden="true">
                            <use href="#i-pin"/>
                        </svg>
                        ${esc(project.location)}
                    </p>
                `
                : "";

            return `
                <article
                    class="project reveal"
                    data-status="${esc(status.toLowerCase())}"
                >
                    ${media}
                    <div>
                        <span class="project__status">${esc(status)}</span>
                        <h3 class="project__title">${esc(project.title)}</h3>
                        ${location}
                        <p class="project__text">${esc(project.description || "")}</p>
                    </div>
                </article>
            `;

        }).join("");

        $("#projects").hidden = false;

        const item = $('[data-section="projects"]');

        if (item) item.hidden = false;

    }


    // One shared, read-only client. Visitors are always anonymous,
    // never the admin, and this never touches localStorage.
    const publicClient = window.supabase
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        })
        : null;


    /* =================================
    TESTIMONIALS
    ================================= */

    function renderTestimonials() {

        const testimonials = cfg.testimonials || [];

        if (testimonials.length === 0) return;

        $("#testimonialList").innerHTML = testimonials.map(function (item) {

            return `
                <div class="testimonial reveal">
                    <p>&ldquo;${esc(item.quote)}&rdquo;</p>
                    <strong>${esc(item.name)}</strong>
                    ${item.detail ? `<span>${esc(item.detail)}</span>` : ""}
                </div>
            `;

        }).join("");

        $("#testimonials").hidden = false;

        const item = $('[data-section="testimonials"]');

        if (item) item.hidden = false;

    }


    /* =================================
    FAQ
    ================================= */

    function renderFAQ() {

        const faq = cfg.faq || [];

        if (faq.length === 0) return;

        $("#faqList").innerHTML = faq.map(function (item) {

            return `
                <details class="faq-item">
                    <summary>${esc(item.question)}</summary>
                    <p>${esc(item.answer)}</p>
                </details>
            `;

        }).join("");

        $("#faq").hidden = false;

        const item = $('[data-section="faq"]');

        if (item) item.hidden = false;

    }


    /* =================================
    HERO PHOTO SLIDESHOW
    ================================= */

    // Once the logo animation has had time to finish, and every 30
    // seconds after that, this fades in the next property photo.
    // If no property has a photo yet, it falls back to hero.jpg
    // (upload one yourself to use it), or the plain navy background.

    const HERO_LOGO_TIME = 3000;
    const HERO_INTERVAL = 30000;
    const HERO_FADE = 1600;

    let heroPhotos = [];
    let heroIndex = 0;
    let heroTimer = null;
    let heroStarted = false;

    function loadImage(url) {

        return new Promise(function (resolve) {

            const image = new Image();

            image.onload = function () { resolve(true); };

            image.onerror = function () { resolve(false); };

            image.src = url;

        });

    }

    function setHeroImage(url) {

        const photo = $("#heroPhoto");

        photo.classList.remove("is-on");

        setTimeout(function () {

            photo.style.backgroundImage = 'url("' + url + '")';

            photo.classList.add("is-on");

        }, photo.classList.contains("is-on") ? 0 : HERO_FADE);

    }

    function collectHeroPhotos() {

        const seen = [];

        const photos = [];

        allProperties.forEach(function (property) {

            const image = Array.isArray(property.images) ? property.images[0] : null;

            if (image && !seen.includes(image)) {

                seen.push(image);

                photos.push(image);

            }

        });

        return photos.slice(0, 10);

    }

    function advanceHero() {

        heroIndex = (heroIndex + 1) % heroPhotos.length;

        setHeroImage(heroPhotos[heroIndex]);

    }

    async function startHeroSlideshow() {

        if (heroStarted) return;

        heroPhotos = collectHeroPhotos();

        if (heroPhotos.length === 0) {

            const fallbackFound = await loadImage("hero.jpg");

            if (fallbackFound) setHeroImage("hero.jpg");

            return;

        }

        heroStarted = true;

        heroIndex = 0;

        setHeroImage(heroPhotos[0]);

        if (heroPhotos.length > 1) {

            heroTimer = setInterval(advanceHero, HERO_INTERVAL);

        }

    }

    function ensureHero() {

        // Waits for the logo animation, then 30 seconds, before the
        // first photo appears; new listings are picked up if the
        // slideshow has not started yet.
        setTimeout(function () {

            setTimeout(startHeroSlideshow, HERO_INTERVAL);

        }, HERO_LOGO_TIME);

    }


    /* =================================
    PROPERTIES
    ================================= */

    let allProperties = [];

    let activeType = "All";

    let searchText = "";

    let sortMode = "newest";

    const grid = $("#propertyGrid");

    function showNotice(title, text) {

        const message =
            "Hello QAS Properties, I would like to know about your available properties.";

        grid.innerHTML = `
            <div class="notice">
                <h3>${esc(title)}</h3>
                <p>${esc(text)}</p>
                <div class="notice__actions">
                    <a
                        class="btn btn--brand"
                        href="${whatsappLink(message)}"
                        target="_blank"
                        rel="noopener"
                    >Ask on WhatsApp</a>
                    <a class="btn btn--line" href="tel:${esc(cfg.phoneLink)}">
                        Call us
                    </a>
                </div>
            </div>
        `;

    }

    function cardHTML(property, index) {

        const images = Array.isArray(property.images) ? property.images : [];

        const hasImage = images.length > 0;

        const media = hasImage
            ? `<img
                    src="${esc(images[0])}"
                    alt="${esc(property.name)}"
                    loading="lazy"
                >`
            : `<img src="logo.png" alt="">`;

        const type = property.type
            ? `<span class="card__type">${esc(property.type)}</span>`
            : "";

        const photos = images.length > 1
            ? `
                <span class="card__photos">
                    <svg class="i" aria-hidden="true">
                        <use href="#i-photos"/>
                    </svg>
                    ${images.length}
                </span>
            `
            : "";

        const facts = [];

        if (Number(property.bedrooms) > 0) {

            facts.push(`
                <li>
                    <svg class="i" aria-hidden="true"><use href="#i-bed"/></svg>
                    ${esc(property.bedrooms)} bed
                </li>
            `);

        }

        if (Number(property.bathrooms) > 0) {

            facts.push(`
                <li>
                    <svg class="i" aria-hidden="true"><use href="#i-bath"/></svg>
                    ${esc(property.bathrooms)} bath
                </li>
            `);

        }

        const factsHTML = facts.length
            ? `<ul class="card__facts">${facts.join("")}</ul>`
            : "";

        const location = property.location
            ? `
                <p class="card__loc">
                    <svg class="i" aria-hidden="true"><use href="#i-pin"/></svg>
                    ${esc(property.location)}
                </p>
            `
            : "";

        return `
            <article
                class="card"
                tabindex="0"
                role="button"
                aria-label="View details: ${esc(property.name)}"
                data-id="${esc(property.id)}"
                style="--n: ${Math.min(index, 8)}"
            >
                <div class="card__media${hasImage ? "" : " card__media--empty"}">
                    ${media}
                    ${type}
                    ${photos}
                </div>
                <div class="card__body">
                    <p class="card__price">${esc(formatPrice(property.price))}</p>
                    <h3 class="card__title">${esc(property.name)}</h3>
                    ${location}
                    ${factsHTML}
                </div>
            </article>
        `;

    }

    function visibleProperties() {

        const query = searchText.trim().toLowerCase();

        const list = allProperties.filter(function (property) {

            if (activeType !== "All" && property.type !== activeType) {
                return false;
            }

            if (!query) return true;

            return [
                property.name,
                property.location,
                property.type,
                property.description
            ].join(" ").toLowerCase().includes(query);

        });

        if (sortMode === "priceLow" || sortMode === "priceHigh") {

            const priceOf = function (property) {

                return property.price === null || property.price === undefined
                    ? null
                    : Number(property.price);

            };

            list.sort(function (a, b) {

                const priceA = priceOf(a);
                const priceB = priceOf(b);

                if (priceA === null && priceB === null) return 0;
                if (priceA === null) return 1;
                if (priceB === null) return -1;

                return sortMode === "priceLow"
                    ? priceA - priceB
                    : priceB - priceA;

            });

        }

        return list;

    }

    function renderProperties() {

        const list = visibleProperties();

        $("#resultCount").textContent =
            list.length === 1 ? "1 property" : list.length + " properties";

        if (list.length === 0) {

            showNotice(
                "No matching properties",
                "Try a different search or filter, or contact us and we will help you find the right property."
            );

            return;

        }

        grid.innerHTML = list.map(cardHTML).join("");

    }

    function buildTypeChips() {

        const types = [];

        allProperties.forEach(function (property) {

            if (property.type && !types.includes(property.type)) {
                types.push(property.type);
            }

        });

        const chips = $("#typeChips");

        if (types.length < 2) {

            chips.style.display = "none";

            return;

        }

        chips.innerHTML = ["All"].concat(types).map(function (type) {

            return `
                <button
                    class="chip"
                    type="button"
                    data-type="${esc(type)}"
                    aria-pressed="${type === "All"}"
                >${esc(type)}</button>
            `;

        }).join("");

    }

    function fillPropertySelect() {

        const select = $("#fProperty");

        allProperties.forEach(function (property) {

            const option = document.createElement("option");

            option.value = property.id;

            option.textContent = property.name;

            select.appendChild(option);

        });

    }

    async function loadProperties() {

        if (!window.supabase) {

            grid.setAttribute("aria-busy", "false");

            $("#resultCount").textContent = "";

            showNotice(
                "We could not load our listings",
                "Please check your connection and refresh, or contact us and we will send you our available properties."
            );

            return;

        }

        try {

            const result = await publicClient
                .from("properties")
                .select("*")
                .eq("status", "published")
                .order("created_at", { ascending: false });

            grid.setAttribute("aria-busy", "false");

            if (result.error) throw result.error;

            allProperties = result.data || [];

        } catch (error) {

            console.error(error);

            grid.setAttribute("aria-busy", "false");

            $("#resultCount").textContent = "";

            showNotice(
                "We could not load our listings",
                "Please check your connection and refresh, or contact us and we will send you our available properties."
            );

            return;

        }

        if (allProperties.length === 0) {

            $(".filters").style.display = "none";

            $("#resultCount").textContent = "";

            showNotice(
                "New listings coming soon",
                "We are preparing our next properties. Contact us to hear about what is available."
            );

            return;

        }

        buildTypeChips();

        fillPropertySelect();

        renderProperties();

        collectVideos();

        ensureHero();

        // Opens a specific property if the page was opened with ?property=ID
        const sharedId = new URLSearchParams(window.location.search).get("property");

        if (sharedId && allProperties.some(function (p) { return p.id === sharedId; })) {

            showProperty(sharedId);

        }

    }

    // Filters and search

    $("#typeChips").addEventListener("click", function (event) {

        const button = event.target.closest(".chip");

        if (!button) return;

        activeType = button.dataset.type;

        $$(".chip").forEach(function (chip) {
            chip.setAttribute("aria-pressed", String(chip === button));
        });

        renderProperties();

    });

    let searchTimer = null;

    $("#searchInput").addEventListener("input", function (event) {

        const value = event.target.value;

        clearTimeout(searchTimer);

        searchTimer = setTimeout(function () {

            searchText = value;

            renderProperties();

        }, 200);

    });

    $("#sortSelect").addEventListener("change", function (event) {

        sortMode = event.target.value;

        renderProperties();

    });


    /* =================================
    POP-UP WINDOWS (property + video)
    ================================= */

    const propertyModal = $("#propertyModal");

    const propertyPanel = $("#propertyPanel");

    const videoModal = $("#videoModal");

    let openModalElement = null;

    let lastFocused = null;

    let gallery = { images: [], index: 0, name: "" };

    function openModal(modal) {

        lastFocused = document.activeElement;

        openModalElement = modal;

        modal.classList.add("is-open");

        document.body.classList.add("no-scroll");

        setTimeout(function () {

            const closeButton = $(".modal__close", modal);

            if (closeButton) closeButton.focus();

        }, 60);

    }

    function closeModal() {

        if (!openModalElement) return;

        const modal = openModalElement;

        modal.classList.remove("is-open");

        document.body.classList.remove("no-scroll");

        // Removing the player stops the video
        if (modal === videoModal) $("#videoFrame").innerHTML = "";

        openModalElement = null;

        if (lastFocused && lastFocused.focus) lastFocused.focus();

    }

    [propertyModal, videoModal].forEach(function (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target.closest("[data-close]")) closeModal();

        });

    });

    function stepGallery(step) {

        const total = gallery.images.length;

        if (total < 2) return;

        gallery.index = (gallery.index + step + total) % total;

        updateGallery(true);

    }

    function updateGallery(animate) {

        const image = $("#galleryImage");

        if (!image) return;

        image.src = gallery.images[gallery.index];

        image.alt = gallery.name + " photo " + (gallery.index + 1);

        if (animate) {

            image.classList.remove("is-fading");

            void image.offsetWidth;

            image.classList.add("is-fading");

        }

        const count = $("#galleryCount");

        if (count) {

            count.textContent =
                (gallery.index + 1) + " / " + gallery.images.length;

        }

        $$(".gallery__thumb", propertyPanel).forEach(function (thumb, index) {

            if (index === gallery.index) {
                thumb.setAttribute("aria-current", "true");
                thumb.scrollIntoView({ block: "nearest", inline: "nearest" });
            } else {
                thumb.removeAttribute("aria-current");
            }

        });

    }

    function showProperty(id) {

        const property = allProperties.find(function (item) {
            return item.id === id;
        });

        if (!property) return;

        const images = Array.isArray(property.images)
            ? property.images.slice()
            : [];

        gallery = { images: images, index: 0, name: property.name };

        const stage = images.length
            ? `
                <img id="galleryImage" src="${esc(images[0])}" alt="${esc(property.name)} photo 1">
                ${images.length > 1 ? `
                    <button class="gallery__nav gallery__nav--prev" type="button" data-step="-1" aria-label="Previous photo">&#8249;</button>
                    <button class="gallery__nav gallery__nav--next" type="button" data-step="1" aria-label="Next photo">&#8250;</button>
                    <span class="gallery__count" id="galleryCount">1 / ${images.length}</span>
                ` : ""}
            `
            : `<div class="gallery__empty"><img src="logo.png" alt=""></div>`;

        const thumbs = images.length > 1
            ? `
                <div class="gallery__thumbs">
                    ${images.map(function (url, index) {

                        return `
                            <button
                                class="gallery__thumb"
                                type="button"
                                data-thumb="${index}"
                                aria-label="Show photo ${index + 1}"
                                ${index === 0 ? 'aria-current="true"' : ""}
                            >
                                <img src="${esc(url)}" alt="" loading="lazy">
                            </button>
                        `;

                    }).join("")}
                </div>
            `
            : "";

        const facts = [];

        if (Number(property.bedrooms) > 0) {

            facts.push(`
                <li>
                    <svg class="i" aria-hidden="true"><use href="#i-bed"/></svg>
                    ${esc(property.bedrooms)} bedrooms
                </li>
            `);

        }

        if (Number(property.bathrooms) > 0) {

            facts.push(`
                <li>
                    <svg class="i" aria-hidden="true"><use href="#i-bath"/></svg>
                    ${esc(property.bathrooms)} bathrooms
                </li>
            `);

        }

        const videos = (property.video_urls || [])
            .filter(isSafeUrl)
            .map(function (url) {

                const id = youtubeId(url);

                return id
                    ? `
                        <div class="video" style="cursor: default">
                            <iframe
                                src="${youtubeEmbed(id, false)}"
                                title="Video of ${esc(property.name)}"
                                loading="lazy"
                                ${IFRAME_ATTRS}
                            ></iframe>
                        </div>
                    `
                    : `
                        <a
                            class="btn btn--line"
                            href="${esc(url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >Watch video</a>
                    `;

            }).join("");

        const message =
            'Hello QAS Properties, I am interested in "' + property.name + '"' +
            (property.location ? " in " + property.location : "") +
            " (" + formatPrice(property.price) + "). Please share more details.";

        propertyPanel.innerHTML = `

            <button class="modal__close" type="button" data-close aria-label="Close">&times;</button>

            <div class="gallery">
                <div class="gallery__stage">${stage}</div>
                ${thumbs}
            </div>

            <div class="modal__info">

                ${property.type ? `<span class="modal__type">${esc(property.type)}</span>` : ""}

                <h3 class="modal__title">${esc(property.name)}</h3>

                <p class="modal__price">${esc(formatPrice(property.price))}</p>

                ${property.location ? `
                    <p class="modal__loc">
                        <svg class="i" aria-hidden="true"><use href="#i-pin"/></svg>
                        ${esc(property.location)}
                    </p>
                ` : ""}

                ${facts.length ? `<ul class="modal__facts">${facts.join("")}</ul>` : ""}

                ${property.description ? `<p class="modal__desc">${esc(property.description)}</p>` : ""}

                ${videos ? `<div class="modal__videos">${videos}</div>` : ""}

                <div class="modal__actions">

                    <a
                        class="btn btn--brand"
                        href="${whatsappLink(message)}"
                        target="_blank"
                        rel="noopener"
                    >
                        <svg class="i" aria-hidden="true"><use href="#i-chat"/></svg>
                        Enquire on WhatsApp
                    </a>

                    <button
                        class="btn btn--line"
                        type="button"
                        data-inspect="${esc(property.id)}"
                    >Book an inspection</button>

                    <a class="btn btn--line" href="tel:${esc(cfg.phoneLink)}">
                        <svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>
                        Call ${esc(cfg.phoneDisplay)}
                    </a>

                    <button
                        class="btn btn--line"
                        type="button"
                        data-share="${esc(property.id)}"
                    >Share this property</button>

                </div>

            </div>
        `;

        propertyPanel.scrollTop = 0;

        openModal(propertyModal);

    }

    // Property cards

    grid.addEventListener("click", function (event) {

        const card = event.target.closest(".card");

        if (card) showProperty(card.dataset.id);

    });

    grid.addEventListener("keydown", function (event) {

        if (event.key !== "Enter" && event.key !== " ") return;

        const card = event.target.closest(".card");

        if (!card) return;

        event.preventDefault();

        showProperty(card.dataset.id);

    });

    // Buttons inside the property window

    propertyPanel.addEventListener("click", function (event) {

        const step = event.target.closest("[data-step]");

        if (step) {

            stepGallery(Number(step.dataset.step));

            return;

        }

        const thumb = event.target.closest("[data-thumb]");

        if (thumb) {

            gallery.index = Number(thumb.dataset.thumb);

            updateGallery(true);

            return;

        }

        const share = event.target.closest("[data-share]");

        if (share) {

            const url = window.location.origin + window.location.pathname +
                "?property=" + encodeURIComponent(share.dataset.share);

            const shareText = "Check out this property from QAS Properties: " + gallery.name;

            if (navigator.share) {

                navigator.share({
                    title: gallery.name,
                    text: shareText,
                    url: url
                }).catch(function () {});

            } else if (navigator.clipboard) {

                navigator.clipboard.writeText(url).then(function () {

                    alert("Link copied. You can now paste it anywhere.");

                }).catch(function () {

                    prompt("Copy this link:", url);

                });

            } else {

                prompt("Copy this link:", url);

            }

            return;

        }

        const inspect = event.target.closest("[data-inspect]");

        if (inspect) {

            const propertyId = inspect.dataset.inspect;

            closeModal();

            $("#fProperty").value = propertyId;

            setTimeout(function () {

                $("#contact").scrollIntoView({ behavior: "smooth" });

            }, 80);

        }

    });

    // Swipe to change photo on phones

    let touchStartX = null;

    propertyPanel.addEventListener("touchstart", function (event) {

        touchStartX = event.target.closest(".gallery__stage")
            ? event.touches[0].clientX
            : null;

    }, { passive: true });

    propertyPanel.addEventListener("touchend", function (event) {

        if (touchStartX === null) return;

        const distance = event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(distance) > 50) stepGallery(distance < 0 ? 1 : -1);

        touchStartX = null;

    });

    // Keyboard: Escape, arrow keys, and keeping Tab inside the window

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            setMenu(false);

            closeModal();

            return;

        }

        if (!openModalElement) return;

        if (openModalElement === propertyModal) {

            if (event.key === "ArrowLeft") stepGallery(-1);

            if (event.key === "ArrowRight") stepGallery(1);

        }

        if (event.key === "Tab") {

            const focusable = $$(
                'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
                openModalElement
            ).filter(function (element) {
                return element.getClientRects().length > 0;
            });

            if (focusable.length === 0) return;

            const first = focusable[0];

            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {

                event.preventDefault();

                last.focus();

            } else if (!event.shiftKey && document.activeElement === last) {

                event.preventDefault();

                first.focus();

            }

        }

    });


    /* =================================
    VIDEOS
    ================================= */

    let firstVideoId = null;

    function openVideo(id) {

        $("#videoFrame").innerHTML = `
            <iframe
                src="${youtubeEmbed(id, true)}"
                title="Video player"
                ${IFRAME_ATTRS}
            ></iframe>
        `;

        openModal(videoModal);

    }

    function collectVideos() {

        const seen = [];

        const items = [];

        function add(url, title) {

            const id = youtubeId(url);

            if (!id || seen.includes(id)) return;

            seen.push(id);

            items.push({ id: id, title: title || "QAS Properties video" });

        }

        (cfg.videos || []).forEach(function (video) {
            add(video.url, video.title);
        });

        allProperties.forEach(function (property) {

            (property.video_urls || []).forEach(function (url) {
                add(url, property.name);
            });

        });

        if (items.length === 0) return;

        firstVideoId = items[0].id;

        $("#videoList").innerHTML = items.map(function (video, index) {

            return `
                <div class="reveal" style="--rd: ${Math.min(index, 5) * 0.08}s">
                    <button
                        class="video"
                        type="button"
                        data-video="${esc(video.id)}"
                        aria-label="Play video: ${esc(video.title)}"
                    >
                        <img
                            src="https://i.ytimg.com/vi/${esc(video.id)}/hqdefault.jpg"
                            alt=""
                            loading="lazy"
                        >
                        <span class="video__play">
                            <svg class="i" aria-hidden="true"><use href="#i-play"/></svg>
                        </span>
                    </button>
                    <p class="video-title">${esc(video.title)}</p>
                </div>
            `;

        }).join("");

        $("#videos").hidden = false;

        const item = $('[data-section="videos"]');

        if (item) item.hidden = false;

        $("#heroFeatured").hidden = false;

        watchReveals();

    }

    $("#videoList").addEventListener("click", function (event) {

        const button = event.target.closest("[data-video]");

        if (button) openVideo(button.dataset.video);

    });

    $("#heroFeatured").addEventListener("click", function () {

        if (firstVideoId) openVideo(firstVideoId);

    });


    /* =================================
    INSPECTION FORM
    ================================= */

    const form = $("#inspectionForm");

    const formNote = $("#formNote");

    $("#fDate").min = new Date().toISOString().slice(0, 10);

    async function saveInspection(details) {

        if (!publicClient) return;

        try {

            const result = await publicClient.from("inspections").insert({
                name: details.name,
                phone: details.phone,
                email: details.email || null,
                property_id: details.propertyId || null,
                property_name: details.propertyName || null,
                preferred_date: details.date || null,
                message: details.message || null
            });

            if (result.error) console.error(result.error);

        } catch (error) {

            // A failed save should never block WhatsApp or email
            console.error(error);

        }

    }

    function buildEnquiry() {

        const name = $("#fName").value.trim();

        const phone = $("#fPhone").value.trim();

        const email = $("#fEmail").value.trim();

        const date = $("#fDate").value;

        const message = $("#fMessage").value.trim();

        const propertyId = $("#fProperty").value;

        const property = allProperties.find(function (item) {
            return item.id === propertyId;
        });

        const lines = [
            "Hello QAS Properties, I would like to book an inspection.",
            "",
            "Name: " + name,
            "Phone: " + phone
        ];

        if (email) lines.push("Email: " + email);

        lines.push(
            property
                ? "Property: " + property.name +
                    (property.location ? " (" + property.location + ")" : "")
                : "Enquiry: General"
        );

        if (date) {

            lines.push(
                "Preferred date: " +
                new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })
            );

        }

        if (message) lines.push("", message);

        return {
            name: name,
            phone: phone,
            email: email,
            date: date,
            message: message,
            propertyId: propertyId || null,
            propertyName: property ? property.name : null,
            text: lines.join("\n")
        };

    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        if (!form.reportValidity()) return;

        const enquiry = buildEnquiry();

        saveInspection(enquiry);

        const link = document.createElement("a");

        link.href = whatsappLink(enquiry.text);

        link.target = "_blank";

        link.rel = "noopener";

        link.click();

        formNote.textContent =
            "Opening WhatsApp with your request. Just press send there.";

    });

    $("#emailBtn").addEventListener("click", function () {

        if (!form.reportValidity()) return;

        const enquiry = buildEnquiry();

        saveInspection(enquiry);

        window.location.href =
            "mailto:" + cfg.email +
            "?subject=" + encodeURIComponent("Inspection request - " + enquiry.name) +
            "&body=" + encodeURIComponent(enquiry.text);

        formNote.textContent =
            "Opening your email app. If nothing happens, email us at " +
            cfg.email + ".";

    });


    /* =================================
    START
    ================================= */

    bindSiteContent();

    renderFeatures();

    renderProjects();

    renderTestimonials();

    renderFAQ();

    collectVideos();

    watchReveals();

    loadProperties();

})();
