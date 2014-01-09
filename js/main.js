
var navigationMenu = document.querySelector("nav"),
    class_menuSelected = "menu-selected";

function setup() {
    document.addEventListener("scroll", onDocumentScroll_highlightMenu);

    document.getElementsByClassName("install-button")[0].addEventListener("click", showChromeInstallExtensionUI);

    navigationMenu.addEventListener("click", function(event) {
        var target = event.target,
            targetLi = target.tagName.toLowerCase() === 'li' ? target : target.parentNode;

        navigateToSection(targetLi);

        return false;
    });

    setNavigationMenuPosition();
    window.onresize = onWindowResize;

}

function onWindowResize() {
    setNavigationMenuPosition();

    var windowWidth = window.innerWidth;
    if (window.innerWidth < 1100 && windowWidth > 767) {
        document.querySelector("main").classList.remove("offset-by-one");
    }
}

function setNavigationMenuPosition() {
    var mainContainer = document.querySelector("main"),
        mainContainerLeft = mainContainer.getBoundingClientRect().left;

    navigationMenu.style.left = (mainContainerLeft - navigationMenu.offsetWidth - 20) + "px";
}

/**
 * Implement scroll spy
 * @param event
 */
function onDocumentScroll_highlightMenu(event) {
    var sections = document.querySelectorAll("main>section, main>h2"),
        body = document.body,
        currentlySelectedMenuOption = navigationMenu.querySelector("." + class_menuSelected),
        headerHeight = 0,
        correspondingMenuOption;

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i],
            sectionPositionTop = section.getBoundingClientRect().top;

        if (sectionPositionTop > headerHeight && sectionPositionTop < 150) {
            correspondingMenuOption = navigationMenu.querySelector("[data-target='" + section.id + "']");
//            correspondingMenuOption = document.getElementById(section.dataset.menuid); // Every section has its
            // corresponding menu option's id in its data

            if (correspondingMenuOption !== currentlySelectedMenuOption) {
                highlightMenuItem(correspondingMenuOption);
                return;
            }
        }
    }

    // Special case for the last section.
    // If the scrollbar is close to the bottom of the page, and the last section's menu option is not highlighted
    // yet, then do that.
    if (body.scrollHeight - 20 <= window.innerHeight + body.scrollTop) {
        correspondingMenuOption = navigationMenu.querySelector("li:last-child");
        if (correspondingMenuOption !== currentlySelectedMenuOption) {
            highlightMenuItem(correspondingMenuOption);
        }
    }
}

function highlightMenuItem(menuItem) {
    if (!menuItem) {
        return;
    }

    var selectedMenu = navigationMenu.querySelector("." + class_menuSelected);
    selectedMenu && selectedMenu.classList.remove(class_menuSelected);

    menuItem.classList.add(class_menuSelected);
}

function navigateToSection(menuItem) {
    var sectionId = menuItem.dataset.target,
        section = document.getElementById(sectionId),
        pos = section && $(section).offset();

    // Scroll to section
    var posTop = Math.max(pos.top - 20, 0);
//    window.scroll(pos.left, scrollTop);

    $('html,body').animate({scrollTop: posTop}, 400);

    // Highlight menu item
    highlightMenuItem(menuItem);
    window.location = "#" + sectionId;
}

function showChromeInstallExtensionUI(event) {
    var overlay = document.getElementsByClassName('overlay')[0];

    // show the overlay (with privacy message) after a timeout. This is to sync with the chrome extension UI which seems
    // to take some time to come up.
    setTimeout(function() {
        overlay.style.display = 'block';
    }, 500);

    // Show inline chrome installation UI
    chrome.webstore.install("https://chrome.google.com/webstore/detail/nhigacflkpibihampdilikhaoehddmnc", hideInstallExtensionOverlay, hideInstallExtensionOverlay);
}

// Hide overlay
function hideInstallExtensionOverlay() {
    var overlay = document.getElementsByClassName('overlay')[0];
    overlay.style.display = 'none';
}

setup();
