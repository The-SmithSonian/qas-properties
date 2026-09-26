/* =================================
SUPABASE SETUP
================================= */

const SUPABASE_URL = "https://epoufuxwjtfckkmuukbl.supabase.co";

// Publishable key: safe to use in website code
const SUPABASE_KEY = "sb_publishable_dEnnKqJDLUp36-VlqrfV-A_g0uoIDhF";

const IMAGE_BUCKET = "property-images";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* =================================
HELPERS
================================= */

// Makes text safe to place inside HTML
function escapeHTML(value) {

    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, function (char) {
        return map[char];
    });

}

// Only allow normal web links
function isSafeUrl(text) {

    try {

        const url = new URL(text);

        return url.protocol === "https:" || url.protocol === "http:";

    } catch (error) {

        return false;

    }

}


/* =================================
ADMIN LOGIN (login.html)
================================= */

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    const loginMessage = document.querySelector("#loginMessage");

    // Already logged in? Go straight to the dashboard
    sb.auth.getSession().then(function (result) {

        if (result.data.session) {
            window.location.replace("dashboard.html");
        }

    });

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.querySelector("#email").value.trim();

        const password =
            document.querySelector("#password").value;

        const loginButton =
            loginForm.querySelector("button[type='submit']");

        if (email === "" || password === "") {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
        loginMessage.textContent = "";

        const result = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (result.error) {

            console.error(result.error);

            loginMessage.textContent =
                result.error.message === "Invalid login credentials"
                    ? "Incorrect email or password."
                    : "Login failed: " + result.error.message;

            loginButton.disabled = false;
            loginButton.textContent = "Login";

            return;

        }

        window.location.href = "dashboard.html";

    });

}


/* =================================
DASHBOARD (dashboard.html)
================================= */

const addPropertyBtn =
    document.querySelector("#addPropertyBtn");

const propertyFormContainer =
    document.querySelector("#propertyFormContainer");

const closeFormBtn =
    document.querySelector("#closeFormBtn");

const propertyForm =
    document.querySelector("#propertyForm");

const propertyList =
    document.querySelector("#propertyList");

const saveDraftBtn =
    document.querySelector("#saveDraftBtn");

const logoutBtn =
    document.querySelector("#logoutBtn");

const propertyImages =
    document.querySelector("#propertyImages");

const imagePreview =
    document.querySelector("#imagePreview");

const propertyVideoLinks =
    document.querySelector("#propertyVideoLinks");


// Small message line under the image picker
const imageStatus = document.createElement("small");

if (propertyImages && imagePreview) {
    imagePreview.parentNode.insertBefore(imageStatus, imagePreview);
}


// State

let properties = [];

// null = adding a new property, otherwise the id being edited
let editingId = null;

// Image links already saved with the property being edited
let existingImages = [];

// New image files chosen but not uploaded yet
let newImageFiles = [];

let isSaving = false;

// Old saved properties have no status, so treat them as published
function getStatus(property) {
    return property.status || "published";
}


/* ---------- Guard + startup ---------- */

async function initDashboard() {

    const result = await sb.auth.getSession();

    if (!result.data.session) {

        window.location.replace("login.html");

        return;

    }

    // Show the dashboard only after we know the admin is logged in
    document.body.classList.remove("checking");

    await loadProperties();

    await loadInspections();

}

if (propertyList) {

    // If the session ends, send the admin back to login
    sb.auth.onAuthStateChange(function (event, session) {

        if (!session) {
            window.location.replace("login.html");
        }

    });

    initDashboard();

}


/* ---------- Logout ---------- */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        await sb.auth.signOut();

        window.location.replace("login.html");

    });

}


/* ---------- Open / close the form ---------- */

function openForm(isEditing) {

    propertyFormContainer.style.display = "block";

    addPropertyBtn.style.display = "none";

    const heading =
        propertyFormContainer.querySelector(".form-header h2");

    if (heading) {

        heading.textContent =
            isEditing ? "Edit Property" : "Add New Property";

    }

    propertyFormContainer.scrollIntoView({
        behavior: "smooth"
    });

}

function closeForm() {

    propertyFormContainer.style.display = "none";

    addPropertyBtn.style.display = "block";

    propertyForm.reset();

    editingId = null;

    existingImages = [];

    newImageFiles = [];

    previewCache.clear();

    renderImagePreview();

}

if (addPropertyBtn && propertyFormContainer && closeFormBtn) {

    addPropertyBtn.addEventListener("click", function () {

        editingId = null;

        existingImages = [];

        newImageFiles = [];

        propertyForm.reset();

        renderImagePreview();

        openForm(false);

    });

    closeFormBtn.addEventListener("click", closeForm);

}


/* ---------- Load from database ---------- */

async function loadProperties() {

    propertyList.innerHTML =
        '<p class="loading-text">Loading properties...</p>';

    const result = await sb
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

    if (result.error) {

        console.error(result.error);

        propertyList.innerHTML =
            '<p class="loading-text">Could not load properties. Please refresh the page.</p>';

        return;

    }

    properties = result.data || [];

    displayProperties();

}


/* ---------- Stats ---------- */

function updateStats() {

    const total = properties.length;

    const published = properties.filter(function (property) {
        return getStatus(property) === "published";
    }).length;

    const drafts = total - published;

    document.querySelector("#totalProperties").textContent = total;

    document.querySelector("#publishedProperties").textContent = published;

    document.querySelector("#draftProperties").textContent = drafts;

}


/* ---------- Image previews ---------- */

// Preview pictures for newly chosen files (read as data links,
// which work in more phone browsers than blob links)
const previewCache = new Map();

function loadPreview(file) {

    const reader = new FileReader();

    reader.onload = function () {

        previewCache.set(file, reader.result);

        renderImagePreview();

    };

    reader.onerror = function () {

        previewCache.set(file, "error");

        renderImagePreview();

    };

    reader.readAsDataURL(file);

}

function makePreviewItem(src, onRemove) {

    const item = document.createElement("div");

    item.className = "preview-item";

    if (src && src !== "error") {

        const image = document.createElement("img");

        image.src = src;

        image.alt = "Property image preview";

        item.appendChild(image);

    } else {

        const placeholder = document.createElement("div");

        placeholder.className = "preview-placeholder";

        placeholder.textContent =
            src === "error" ? "Preview unavailable" : "Loading...";

        item.appendChild(placeholder);

    }

    const removeBtn = document.createElement("button");

    removeBtn.type = "button";

    removeBtn.className = "preview-remove";

    removeBtn.textContent = "×";

    removeBtn.setAttribute("aria-label", "Remove image");

    removeBtn.addEventListener("click", onRemove);

    item.appendChild(removeBtn);

    return item;

}

function renderImagePreview(notice) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    if (notice || newImageFiles.length > 0) {

        const status = document.createElement("p");

        status.className = "preview-status";

        status.textContent =
            notice ||
            newImageFiles.length + " new photo(s) selected";

        imagePreview.appendChild(status);

    }

    existingImages.forEach(function (url, index) {

        imagePreview.appendChild(
            makePreviewItem(url, function () {

                existingImages.splice(index, 1);

                renderImagePreview();

            })
        );

    });

    newImageFiles.forEach(function (file, index) {

        imagePreview.appendChild(
            makePreviewItem(previewCache.get(file), function () {

                previewCache.delete(file);

                newImageFiles.splice(index, 1);

                renderImagePreview();

            })
        );

    });

}

let lastImageBatch = 0;

function handleImageSelection() {

    const files = Array.from(propertyImages.files || []);

    if (files.length === 0) {

        // Some browsers fire two events for one choice; ignore the second
        if (Date.now() - lastImageBatch < 1500) return;

        imageStatus.textContent =
            "The file picker did not send a photo. " +
            "Try again, or open this page in Chrome.";

        return;

    }

    let added = 0;

    files.forEach(function (file) {

        // Some Android pickers return an empty file (e.g. cloud photos)
        if (file.size === 0) return;

        newImageFiles.push(file);

        added++;

    });

    lastImageBatch = Date.now();

    // Lets the admin pick the same file again if needed
    propertyImages.value = "";

    imageStatus.textContent =
        added > 0
            ? added + " photo(s) added."
            : "That photo could not be read. Try a photo saved on your phone.";

    renderImagePreview();

}

if (propertyImages) {

    // Some Android browsers fire "input" instead of "change"
    propertyImages.addEventListener("change", handleImageSelection);

    propertyImages.addEventListener("input", handleImageSelection);

}


/* ---------- Image storage ---------- */

// Shrinks large photos before upload so pages load faster.
// Skips anything that is not a plain photo, or is already small.
function compressImage(file) {

    return new Promise(function (resolve) {

        if (!file.type.startsWith("image/") || file.size < 350000) {

            resolve(file);

            return;

        }

        const image = new Image();

        const objectUrl = URL.createObjectURL(file);

        image.onload = function () {

            URL.revokeObjectURL(objectUrl);

            const maxSide = 1600;

            const scale = Math.min(
                1,
                maxSide / Math.max(image.width, image.height)
            );

            const canvas = document.createElement("canvas");

            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(function (blob) {

                if (!blob || blob.size >= file.size) {

                    // The original was already efficient; keep it
                    resolve(file);

                    return;

                }

                resolve(new File(
                    [blob],
                    file.name.replace(/\.\w+$/, ".jpg"),
                    { type: "image/jpeg" }
                ));

            }, "image/jpeg", 0.82);

        };

        image.onerror = function () {

            URL.revokeObjectURL(objectUrl);

            // If it cannot be read as an image, upload it as-is
            resolve(file);

        };

        image.src = objectUrl;

    });

}

async function uploadImages(files) {

    const urls = [];

    for (const original of files) {

        const file = await compressImage(original);

        const cleanName =
            file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const path =
            Date.now() + "-" +
            Math.random().toString(36).slice(2, 8) + "-" +
            cleanName;

        const result = await sb.storage
            .from(IMAGE_BUCKET)
            .upload(path, file, {
                contentType: file.type || "image/jpeg",
                cacheControl: "3600"
            });

        if (result.error) throw result.error;

        const publicUrl = sb.storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(path).data.publicUrl;

        urls.push(publicUrl);

    }

    return urls;

}

async function deleteImageFiles(urls) {

    const marker = "/" + IMAGE_BUCKET + "/";

    const paths = urls.map(function (url) {

        const position = url.indexOf(marker);

        if (position === -1) return null;

        return decodeURIComponent(
            url.slice(position + marker.length)
        );

    }).filter(Boolean);

    if (paths.length === 0) return;

    const result = await sb.storage
        .from(IMAGE_BUCKET)
        .remove(paths);

    if (result.error) console.error(result.error);

}


/* ---------- Save a property ---------- */

const publishBtn =
    propertyForm ? propertyForm.querySelector(".primary-btn") : null;

function setSaving(saving) {

    isSaving = saving;

    saveDraftBtn.disabled = saving;

    publishBtn.disabled = saving;

    publishBtn.textContent =
        saving ? "Saving..." : "Publish Property";

}

async function savePropertyFromForm(status) {

    if (isSaving) return;

    const name =
        document.querySelector("#propertyName").value.trim();

    const type =
        document.querySelector("#propertyType").value;

    const price =
        document.querySelector("#propertyPrice").value;

    const location =
        document.querySelector("#propertyLocation").value.trim();

    const bedrooms =
        document.querySelector("#bedrooms").value;

    const bathrooms =
        document.querySelector("#bathrooms").value;

    const description =
        document.querySelector("#propertyDescription").value.trim();

    // One video link per line
    const videoLines = propertyVideoLinks.value
        .split("\n")
        .map(function (line) { return line.trim(); })
        .filter(function (line) { return line !== ""; });

    const invalidLinks = videoLines.filter(function (line) {
        return !isSafeUrl(line);
    });

    if (invalidLinks.length > 0) {

        alert(
            "Some video links are not valid. " +
            "Each link must start with https:// and be on its own line."
        );

        return;

    }

    setSaving(true);

    try {

        const newUrls = await uploadImages(newImageFiles);

        const propertyData = {
            name: name,
            type: type || null,
            price: price === "" ? null : Number(price),
            location: location || null,
            bedrooms: bedrooms === "" ? null : Number(bedrooms),
            bathrooms: bathrooms === "" ? null : Number(bathrooms),
            description: description || null,
            status: status,
            images: existingImages.concat(newUrls),
            video_urls: videoLines
        };

        let result;

        if (editingId) {

            result = await sb
                .from("properties")
                .update(propertyData)
                .eq("id", editingId);

        } else {

            result = await sb
                .from("properties")
                .insert(propertyData);

        }

        if (result.error) throw result.error;

        // Delete storage files for images removed during editing
        if (editingId) {

            const original = properties.find(function (property) {
                return property.id === editingId;
            });

            if (original) {

                const removed = (original.images || []).filter(function (url) {
                    return !existingImages.includes(url);
                });

                await deleteImageFiles(removed);

            }

        }

        closeForm();

        await loadProperties();

        alert(
            status === "draft" ? "Draft saved!" : "Property published!"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Could not save the property: " +
            (error.message || "unknown error") +
            "\n\nPlease try again."
        );

    } finally {

        setSaving(false);

    }

}

if (propertyForm && propertyList) {

    // Publish: the browser's required-field checks run first
    propertyForm.addEventListener("submit", function (event) {

        event.preventDefault();

        savePropertyFromForm("published");

    });

    // Draft: only the name is required
    saveDraftBtn.addEventListener("click", function () {

        const name =
            document.querySelector("#propertyName").value.trim();

        if (name === "") {

            alert("Please enter a property name to save a draft.");

            return;

        }

        savePropertyFromForm("draft");

    });

}


/* ---------- Display properties ---------- */

function displayProperties() {

    updateStats();

    propertyList.innerHTML = "";

    if (properties.length === 0) {

        propertyList.innerHTML = `
            <div class="empty-state">
                <h3>No Properties Yet</h3>
                <p>
                    Click "Add Property" to create
                    your first listing.
                </p>
            </div>
        `;

        return;

    }

    properties.forEach(function (property, cardIndex) {

        const propertyCard = document.createElement("div");

        propertyCard.className = "property-card";

        propertyCard.style.setProperty("--i", cardIndex);

        const status = getStatus(property);

        const statusLabel =
            status === "draft" ? "Draft" : "Published";

        const images = (property.images || []).map(function (url) {

            return `
                <img
                    src="${escapeHTML(url)}"
                    alt="${escapeHTML(property.name)}"
                >
            `;

        }).join("");

        const videoLinks = (property.video_urls || [])
            .filter(isSafeUrl)
            .map(function (url, index) {

                return `
                    <a
                        href="${escapeHTML(url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >Video ${index + 1}</a>
                `;

            }).join(" · ");

        const videoRow = videoLinks
            ? `
                <p class="property-videos">
                    <strong>Videos:</strong>
                    ${videoLinks}
                </p>
            `
            : "";

        propertyCard.innerHTML = `

            <div class="property-images">
                ${images}
            </div>

            <h2>${escapeHTML(property.name)}</h2>

            <p>
                <strong>Status:</strong>
                <span class="status-badge status-${status}">
                    ${statusLabel}
                </span>
            </p>

            <p>
                <strong>Property Type:</strong>
                ${escapeHTML(property.type || "-")}
            </p>

            <p>
                <strong>Price:</strong>
                ${property.price !== null && property.price !== undefined
                    ? "₦" + Number(property.price).toLocaleString()
                    : "-"}
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(property.location || "-")}
            </p>

            <p>
                <strong>Bedrooms:</strong>
                ${escapeHTML(property.bedrooms ?? "-")}
            </p>

            <p>
                <strong>Bathrooms:</strong>
                ${escapeHTML(property.bathrooms ?? "-")}
            </p>

            <p>
                <strong>Description:</strong>
                ${escapeHTML(property.description || "-")}
            </p>

            ${videoRow}

            <div class="property-actions">

                <button onclick="editProperty('${property.id}')">
                    Edit
                </button>

                <button onclick="deleteProperty('${property.id}')">
                    Delete
                </button>

            </div>

        `;

        propertyList.appendChild(propertyCard);

    });

}


/* ---------- Edit ---------- */

function editProperty(id) {

    const property = properties.find(function (item) {
        return item.id === id;
    });

    if (!property) return;

    document.querySelector("#propertyName").value =
        property.name || "";

    document.querySelector("#propertyType").value =
        property.type || "";

    document.querySelector("#propertyPrice").value =
        property.price ?? "";

    document.querySelector("#propertyLocation").value =
        property.location || "";

    document.querySelector("#bedrooms").value =
        property.bedrooms ?? "";

    document.querySelector("#bathrooms").value =
        property.bathrooms ?? "";

    document.querySelector("#propertyDescription").value =
        property.description || "";

    propertyVideoLinks.value =
        (property.video_urls || []).join("\n");

    // The property stays in the database until the admin saves
    editingId = id;

    existingImages = (property.images || []).slice();

    newImageFiles = [];

    renderImagePreview();

    openForm(true);

}


/* =================================
INSPECTION REQUESTS
================================= */

const inspectionList = document.querySelector("#inspectionList");

let inspections = [];

async function loadInspections() {

    if (!inspectionList) return;

    inspectionList.innerHTML =
        '<p class="loading-text">Loading inspection requests...</p>';

    const result = await sb
        .from("inspections")
        .select("*")
        .order("created_at", { ascending: false });

    if (result.error) {

        console.error(result.error);

        inspectionList.innerHTML =
            '<p class="loading-text">Could not load inspection requests.</p>';

        return;

    }

    inspections = result.data || [];

    displayInspections();

}

function displayInspections() {

    if (!inspectionList) return;

    if (inspections.length === 0) {

        inspectionList.innerHTML = `
            <div class="empty-state">
                <h3>No Requests Yet</h3>
                <p>
                    Requests from the website's inspection form
                    will show up here.
                </p>
            </div>
        `;

        return;

    }

    inspectionList.innerHTML = inspections.map(function (item, cardIndex) {

        const status = item.status || "new";

        const statusLabels = {
            new: "New",
            contacted: "Contacted",
            done: "Done"
        };

        const when = item.created_at
            ? new Date(item.created_at).toLocaleString()
            : "";

        const date = item.preferred_date
            ? new Date(item.preferred_date + "T00:00:00")
                .toLocaleDateString(undefined, {
                    day: "numeric", month: "long", year: "numeric"
                })
            : null;

        return `
            <div class="property-card" style="--i: ${cardIndex}">

                <h2>${escapeHTML(item.name)}</h2>

                <p>
                    <strong>Status:</strong>
                    <span class="status-badge status-${status}">
                        ${statusLabels[status] || status}
                    </span>
                </p>

                <p>
                    <strong>Phone:</strong>
                    <a href="tel:${escapeHTML(item.phone)}">${escapeHTML(item.phone)}</a>
                </p>

                ${item.email ? `
                    <p>
                        <strong>Email:</strong>
                        <a href="mailto:${escapeHTML(item.email)}">${escapeHTML(item.email)}</a>
                    </p>
                ` : ""}

                <p>
                    <strong>Property:</strong>
                    ${escapeHTML(item.property_name || "General enquiry")}
                </p>

                ${date ? `
                    <p><strong>Preferred date:</strong> ${escapeHTML(date)}</p>
                ` : ""}

                ${item.message ? `
                    <p><strong>Message:</strong> ${escapeHTML(item.message)}</p>
                ` : ""}

                <p><strong>Submitted:</strong> ${escapeHTML(when)}</p>

                <div class="property-actions">

                    <select
                        class="control"
                        style="width: auto;"
                        onchange="updateInspectionStatus('${item.id}', this.value)"
                    >
                        <option value="new" ${status === "new" ? "selected" : ""}>New</option>
                        <option value="contacted" ${status === "contacted" ? "selected" : ""}>Contacted</option>
                        <option value="done" ${status === "done" ? "selected" : ""}>Done</option>
                    </select>

                    <button onclick="deleteInspection('${item.id}')">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}

async function updateInspectionStatus(id, status) {

    const result = await sb
        .from("inspections")
        .update({ status: status })
        .eq("id", id);

    if (result.error) {

        console.error(result.error);

        alert("Could not update the request. Please try again.");

        return;

    }

    const item = inspections.find(function (i) { return i.id === id; });

    if (item) item.status = status;

}

async function deleteInspection(id) {

    const confirmDelete =
        confirm("Delete this inspection request?");

    if (!confirmDelete) return;

    const result = await sb
        .from("inspections")
        .delete()
        .eq("id", id);

    if (result.error) {

        console.error(result.error);

        alert("Could not delete the request. Please try again.");

        return;

    }

    await loadInspections();

}


/* ---------- Delete ---------- */

async function deleteProperty(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this property?");

    if (!confirmDelete) return;

    const property = properties.find(function (item) {
        return item.id === id;
    });

    // Close the form so the wrong entry isn't edited
    if (editingId !== null) closeForm();

    const result = await sb
        .from("properties")
        .delete()
        .eq("id", id);

    if (result.error) {

        console.error(result.error);

        alert("Could not delete the property. Please try again.");

        return;

    }

    if (property) {
        await deleteImageFiles(property.images || []);
    }

    await loadProperties();

}
