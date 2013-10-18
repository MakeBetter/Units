
var navigationMenu = document.querySelector("nav"),
    class_menuSelected = "menu-selected";

document.addEventListener("scroll", onDocumentScroll_highlightMenu);

navigationMenu.addEventListener("click", function(event) {
    navigateToSection(event.target.parentNode);
});

/**
 * Implement scroll spy
 * @param event
 */
function onDocumentScroll_highlightMenu(event) {
    var sections = document.querySelectorAll("main>section"),
        body = document.body,
        currentlySelectedMenuOption = navigationMenu.querySelector("." + class_menuSelected),
        headerHeight = 0,
        correspondingMenuOption;

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i],
            sectionPositionTop = section.getBoundingClientRect().top;

        if (sectionPositionTop > headerHeight && sectionPositionTop < 150) {
            correspondingMenuOption = document.getElementById(section.dataset.menuid); // Every section has its
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
    if (body.scrollHeight - 200 <= window.innerHeight + body.scrollTop) {
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
    console.log("click");
//    var sectionId = menuItem.dataset.target,
//        section = document.getElementById(sectionId),
//        pos = section && $(section).offset();
//
//    // Scroll to section
//    window.scroll(pos.left, pos.top - headerHeight);
//
    // Highlight menu item
    highlightMenuItem(menuItem);
}
