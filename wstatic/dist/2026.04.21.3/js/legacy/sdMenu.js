(function (window, $, undefined) {
    "use strict";

    /**
     * Handlebars templates for client-side loading of menu - if these are updated, the templates in 'HandlebarsTemplates.cs'
     * in MenuApi project should also be updated.
     */
    var toplevel =
        "{{#if isCmsMenuEnabled}}" +
        '<ul data-id="{{tabid}}" id="ulTopLevelMenu" class="RootGroup nostyle PromoTemplateMenu CmsMenu_Container">' +
        "{{else}}" +
        '<ul data-id="{{tabid}}" id="ulTopLevelMenu" class="RootGroup nostyle PromoTemplateMenu">' +
        "{{/if}}" +
        "    {{#each nodes}}" +
        '		    <li data-id="{{tabid}}" id="liTopLevelMenu_{{tabid}}" class="{{terms}}">' +
        '		        <a data-id="{{tabid}}" id="lnkTopLevelMenu_{{tabid}}" class="lnkLevel2" href="{{Url}}"{{#if noFollow}} rel="nofollow"{{/if}}>{{Text}}</a>' +
        "             {{{HTML}}}" +
        "             {{#if isCmsMenuEnabled}}" +
        '                 <div class="SubMenuWrapper" style="overflow: hidden; left: 0px;">' +
        ' 		            <ul class="{{Text}}">' +
        "                        {{#if hasTabMenuItems}}" +
        '                          <li class="{{Text}}Center Center" style="display:inline-block;">' +
        "                          {{>tabmenu}}" +
        "                           </li>" +
        "                        {{else}}" +
        "                          {{>genericmenu}}" +
        "                        {{/if}}" +
        "                     </ul>" +
        "                 </div>" +
        "             {{/if}}" +
        "             {{#if UseOld}}" +
        '                 <div class="SubMenuWrapper" style="overflow: hidden; left: 0px;">' +
        ' 		            <ul class="{{Text}}">' +
        "                        {{>oldmiddlelevel}}" +
        "                     </ul>" +
        "                 </div>" +
        "             {{/if}}" +
        "             {{#if UseNew}}" +
        '               <div class="NewMenuWrap">' +
        '		            <div class="LinkLevel2 NewMenu">' +
        "		    	        <ul>" +
        "		    	            {{#each Children}}" +
        "		    		            {{>middlelevel}}" +
        "		    	            {{/each}}" +
        "		    	        </ul>" +
        "		            </div>" +
        "               </div>" +
        "             {{/if}}" +
        "		    </li>" +
        "    {{/each}}" +
        " </ul>";

    var newmiddlelevel =
        '<li class="{{terms}}">' +
        '		<a href="{{Url}}"{{#if noFollow}} rel="nofollow"{{/if}}>{{Text}}</a>' +
        "     {{{HTML}}}" +
        "		{{#if hasDropdown}}" +
        '         <div class="DropdownWrap">' +
        '             <div class="Dropdown {{terms}}">' +
        '		            <div class="{{tabid}}Top Top"></div>' +
        '		            <div class="{{tabid}}Left Left"></div>' +
        '		            <div class="{{tabid}}Center Center">' +
        "		                <ul>" +
        "                         {{#each Children}}" +
        "                             {{#if colstart}}" +
        '                                 <li class="columnGroup clearfix">' +
        "                                     <ul>" +
        "                             {{/if}}" +
        "		        	                {{>bottomLevel}}" +
        "                             {{#if colend}}" +
        "                                     </ul>" +
        "                                 </li>" +
        "                             {{/if}}" +
        "                         {{/each}}" +
        "		                </ul>" +
        "	                </div>" +
        '	                <div class="{{tabid}}Right Right"></div>' +
        '		            <div class="{{tabid}}Bottom Bottom"></div>' +
        '                 <div class="clearfix"></div>' +
        "             </div>" +
        "         </div>" +
        "	    {{/if}}" +
        "</li>";

    var oldmiddlelevel =
        '<li class="{{Text}}Top Top" style="display:inline-block;"><div class="{{tabid}}Top Top"></div></li>' +
        ' <li class="{{Text}}Left Left" style="display:inline-block;"><div class="{{tabid}}Left Left"></div></li>' +
        ' <li class="{{Text}}Center Center"style="display:inline-block;"><div class="{{tabid}}Center Center"></div>' +
        "     <ul>" +
        "         {{#each Children}}" +
        "             {{#if colstart}}" +
        '                 <li class="columnGroup clearfix">' +
        "                     <ul>" +
        "             {{/if}}" +
        '             <li class="{{terms}}">' +
        '                 {{#unless hiddenHeader}}<a href="{{Url}}">{{Text}}</a>{{{HTML}}}{{/unless}}' +
        ' 	            <div class="{{tabid}}Center Center"></div>' +
        "                 {{#if hasDropdown}}" +
        "                     <ul>" +
        '                         <li class="{{Text}}Left Left" style="display:inline-block;"><div class="{{tabid}}Left Left ThirdLevelMenuLeft"></div></li>' +
        "                         {{#each Children}}" +
        "                             {{#if colstart}}" +
        '                                 <li class="columnGroup clearfix">' +
        "                                     <ul>" +
        "                             {{/if}}" +
        "                             {{>bottomLevel}}" +
        "                             {{#if colend}}" +
        "                                     </ul>" +
        "                                 </li>" +
        "                             {{/if}}" +
        "                         {{/each}}" +
        '                         <li class="{{Text}}Right Right" style="display:inline-block;"><div class="{{tabid}}Right Right ThirdLevelMenuRight"></div></li>' +
        "                     </ul>" +
        "                 {{/if}}" +
        "             </li>" +
        "             {{#if colend}}" +
        "                     </ul>" +
        "                 </li>" +
        "             {{/if}}" +
        "         {{/each}}" +
        "     </ul>" +
        " </li>" +
        ' <li class="{{Text}}Right Right" style="display:inline-block;"><div class="{{tabid}}Right Right"></div></li>' +
        ' <li class="{{Text}}Bottom Bottom" style="display:inline-block;"><div class="{{tabid}}Bottom Bottom"></div></li>';

    var bottomlevel =
        '<li class="{{terms}}">' +
        '	<a href="{{Url}}"{{#if noFollow}} rel="nofollow"{{/if}}>{{Text}}</a>' +
        " {{{HTML}}}" +
        "</li>";

    var mobiletemplate =
        '<ul id="ulTopLevelMobileMenu">' +
        "{{#each nodes}}" +
        "{{>level backbutton=../backbutton}}" +
        "{{/each}}" +
        "</ul>" +
        '<div class="secondaryLevelContainer">' +
        "{{>secondlevelmobilemenutemplate}}" +
        "</div>";

    var secondlevelmobilemenutemplate =
        "{{#each nodes}}" + '<div id="divSubMenu_{{tabid}}" class="secondLevelMobileMenu">' + " </div>" + "{{/each}}";

    var viewAllMobileMenuItem =
        "       {{#if showViewAllButton}}" +
        '           <li class="mobOnly mobMenToplink"><a class="menuitemtext MobMenChevron" href="{{Url}}">{{ viewAllButton }}</a></li>' +
        "       {{/if}}";

    var mobilesubtemplate =
        "" +
        '<div class="mp-level">' +
        '   <p class="menulevelheader">' +
        '       <a href="#" rel="nofollow" class="mp-header-back">{{Text}}</a>' +
        "       {{{HTML}}}" +
        "   </p>" +
        '   <a href="#" class="mp-back" rel="nofollow"><span class="mp-back-text">{{backbutton}}</span></a>' +
        '   <a href="#" class="mp-close" rel="nofollow"><span class="mp-close-icon"></span></a>' +
        "   <ul>" +
        "       {{>viewAllMobileMenuItem}}" +
        "       {{#each nodes}}" +
        "           {{>delayedlevel backbutton=../backbutton}}" +
        "       {{/each}}" +
        "   </ul>" +
        "</div>";

    var level =
        '<li {{#if hasDropdown}} data-id="{{tabid}}" id="liTopLevelMenu_{{tabid}}" class="has-dropdown {{terms}}" {{/if}} {{#unless hasDropdown}} class="{{terms}}" {{/unless}}>' +
        ' <a class="menuitemtext MobMenChevron{{#unless Url}} disable-link{{/unless}}" {{#unless hasDropdown}}href="{{Url}}"{{/unless}}>' +
        '     {{#if MobileMenuImageEnabled }}<img src="{{featureImage}}" alt="{{Text}}">{{/if}}' +
        "     {{Text}}" +
        "     {{{HTML}}}" +
        " </a>" +
        " {{#if hasDropdown}}" +
        '     <div class="mp-level">' +
        '         <p class="menulevelheader">' +
        '             <a href="#" rel="nofollow" class="mp-header-back">{{Text}}</a>' +
        "             {{{HTML}}}" +
        "         </p>" +
        '         <a href="#" class="mp-back" rel="nofollow"><span class="mp-back-text">{{backbutton}}</span></a>' +
        '         <a href="#" class="mp-close" rel="nofollow"><span class="mp-close-icon"></span></a>' +
        '         <ul class="mobMenGroup">' +
        "           {{>viewAllMobileMenuItem}}" +
        "           {{#each Children}}" +
        "               {{>level backbutton=../backbutton}}" +
        "           {{/each}}" +
        "         </ul>" +
        "     </div>" +
        " {{/if}}" +
        "</li>";

    var delayedlevel =
        '<li {{#if hasDropdown}} class="has-dropdown {{terms}}" {{/if}} {{#unless hasDropdown}} class="{{terms}}" {{/unless}}>' +
        ' <a class="menuitemtext MobMenChevron{{#unless Url}} disable-link{{/unless}}" {{#unless hasDropdown}}href="{{Url}}"{{/unless}}>' +
        '     {{#if MobileMenuImageEnabled }}<img src="{{featureImage}}" alt="{{Text}}">{{/if}}' +
        "     {{Text}}" +
        "     {{{HTML}}}" +
        " </a>" +
        " {{#if hasDropdown}}" +
        '     <div class="mp-level">' +
        '         <p class="menulevelheader">' +
        '             <a href="#" rel="nofollow" class="mp-header-back">{{Text}}</a>' +
        "             {{{HTML}}}" +
        "         </p>" +
        '         <a href="#" class="mp-back" rel="nofollow"><span class="mp-back-text">{{backbutton}}</span></a>' +
        '         <a href="#" class="mp-close" rel="nofollow"><span class="mp-close-icon"></span></a>' +
        '         <ul class="mobMenGroup" style="display:none">' +
        "           {{>viewAllMobileMenuItem}}" +
        "           {{#each Children}}" +
        "               {{>level backbutton=../backbutton}}" +
        "           {{/each}}" +
        "         </ul>" +
        "     </div>" +
        " {{/if}}" +
        "</li>";

    var tabmenu = '<ul class="TabMenu_Container">  {{#each tabMenuItems}}    {{>tabmenuitem}}  {{/each}}  </ul>';

    var tabmenuitem =
        "" +
        '  <li class="mmHasChild level1 sdmColHeader">' +
        '    <a href="{{href}}">{{title}}</a>' +
        '    <div class="Center"></div>' +
        "    <ul>" +
        "      {{>genericmenu}}" +
        "    </ul>" +
        "  </li>";

    var genericmenu =
        '<div class="GenericMenu_container">' +
        '  <div class="GenericMenu_menu">' +
        "    {{#if hasQuickLinkMenuItems}}" +
        "      {{>quicklinkmenu}}" +
        "    {{/if}}" +
        "    {{#each columnMenuItems}}" +
        "      {{>columnmenuitem}}" +
        "    {{/each}}" +
        "  </div>" +
        "</div>" +
        "{{#if hasBannerMenuItems}}" +
        "  {{>bannermenu}}" +
        "{{/if}}";

    var logomenu =
        '<div class="LogoMenu_menu" data-testid="logo-menu">' +
        "  {{#each logoMenuItems}}" +
        "    {{>logomenuitem}}" +
        "  {{/each}}" +
        "</div>";

    var bannermenu =
        '<div class="BannerMenu_menu" data-testid="banner-menu">' +
        "  {{#each bannerMenuItems}}" +
        "    {{>bannermenuitem}}" +
        "  {{/each}}" +
        "</div>";

    var bannermenuitem =
        '<div class="BannerMenu_menuitem">' +
        '  <a href = "{{href}}" class="BannerMenu_link">' +
        '    <img class="Image_image" height="268" width="460" src="{{image.src}}" alt="{{title}}" />' +
        '    <span class="Typography_subheading2 Typography_text-black BannerMenu_caption">{{ title }}</span>' +
        "  </a>" +
        "</div>";

    var quicklinkmenu =
        '<div class="QuickLinkMenu_container" data-testid="quick-link-menu">' +
        '  <ul class="QuickLinkMenu_menu">' +
        "    {{#each quickLinkMenuItems}}" +
        "      {{>quicklinkmenuitem}}" +
        "    {{/each}}" +
        "  </ul>" +
        "</div > ";

    var quicklinkmenuitem =
        '<li class="QuickLinkMenuItem">' +
        '  <a href="{{href}}"><span class="Typography_body2 Typography_font-bold QuickLinkMenu_title">{{title}}</span></a>' +
        "</li>";

    var stackedColumnMenuItem =
        '<div class="StackedColumnMenu">' +
        "   {{#if title}}" +
        '       <a href="{{href}}" class="MenuLink_link{{#unless href}} disable-link{{/unless}}"><span class="Typography_body2 Typography_font-bold ColumnMenu_title">{{title}}</span></a>' +
        "   {{/if}}" +
        '   <div class="ColumnMenu_grid ColumnMenu_grid-cols-{{numberOfColumns}}">' +
        "    {{#each productMenuItems}}" +
        "      {{>productmenuitem}}" +
        "    {{/each}}" +
        "  </div>" +
        "</div>";

    var columnmenuitem =
        '<div class="ColumnMenu_col-span-{{numberOfColumns}}">' +
        "    {{#if hasQuickLinkMenuItems}}" +
        "      {{>quicklinkmenu}}" +
        "    {{/if}}" +
        "   {{#if title}}" +
        '       <a href="{{href}}" class="MenuLink_link{{#unless href}} disable-link{{/unless}}"><span class="Typography_body2 Typography_font-bold ColumnMenu_title">{{title}}</span></a>' +
        "   {{/if}}" +
        "   {{#if requireTitleSpacer}}" +
        '       <span class="ColumnMenu_title titleSpacer"></span>' +
        "   {{/if}}" +
        '   <div class="ColumnMenu_grid ColumnMenu_grid-cols-{{numberOfColumns}}">' +
        "    {{#each productMenuItems}}" +
        "      {{>productmenuitem}}" +
        "    {{/each}}" +
        "    {{#each stackedColumnItems}}" +
        "      {{>stackedColumnMenuItem}}" +
        "    {{/each}}" +
        "    {{#each linkTitleItems}}" +
        "      {{>linktitleitem}}" +
        "    {{/each}}" +
        "    {{#if hasLogoMenuItems}}" +
        "      {{>logomenu}}" +
        "    {{/if}}" +
        "  </div>" +
        "</div>";

    var productmenuitem =
        "{{#if hasExtraClasses}}" +
        '<div class="ProductMenu_Container {{extraClasses}}" data-testid="product-menu">' +
        "{{else}}" +
        '<div class="ProductMenu_Container" data-testid="product-menu">' +
        "{{/if}}" +
        "  {{#if title}}" +
        '  <a href="{{href}}"{{#unless href}} class="disable-link"{{/unless}}><span class="Typography_body2 Typography_font-bold ProductMenu_title">{{title}}</span></a>' +
        "  {{/if}}" +
        '  <ul class="ProductMenu_menu{{#if hasLinks}} hasLinks{{/if}}">' +
        "    {{#each links}}" +
        "      {{>productmenulink}}" +
        "    {{/each}}" +
        "  </ul>" +
        "</div>";

    var productmenulink =
        '        <li {{#if newTag}} class="newTag" {{/if}}><a href="{{href}}"{{#unless href}} class="disable-link"{{/unless}}><span class="Typography_body1">{{title}}</span></a></li>';

    var linktitleitem =
        '<a class="Link_root" href="{{href}}">' +
        '  <div class="LinkTitleContainer">' +
        '    <img class="Image" height="380" width="550" src="{{src}}" />' +
        "  </div>" +
        "</a>";

    var logomenuitem =
        '<a class="Link_root LogoMenu_link" href="{{href}}">' +
        '  <img class="Image_image Image_cover LogoMenu_image" height="150" width="150" src="{{image.src}}" alt="{{title}}" data-testid="picture-image" />' +
        "</a>";

    var autoOpenMenuClass = "AutoOpenMenu";
    var desktopMenuRequested = false;
    var desktopMenuHovered = false;
    var desktopMenuData = null;
    var mobileMenuRequested = false;
    var mobileMenuData = null;
    var cmsMenuData = null;
    var promosRequested = false;
    var domReadyDone = false;
    var mobileMenu = null;
    var menuChangeCallbacks = [];
    var shouldLoadServerSide = false;
    var menuIsSticky = false;
    var stickyMenuScrollPixelVal = 0;
    var stickyMenuScrollTopOffset = 0;
    var nonMenuLightBoxesEnabled = false;
    var shouldDelayMenuRendering = false;
    var autoclosemenuonhoverout = true;
    var useOptimisedMenuClose = false;
    var delayedMenuRenderDone = false;
    var subLevelsDone = false;
    var $mpContainer = $(".mp-container");
    var $mpMenu = $mpContainer.find("#mp-menu");
    var $MobileMenuContentWrap = $mpMenu.find(".MobileMenuContentWrap");
    $("li#liMobileLanguageSelector, li#liMobileCurrencySelector").addClass("has-dropdown");
    var $liListWithDropDown = $MobileMenuContentWrap.find("li.has-dropdown, li.root");
    var subMenuTemplate = null;
    var lastOpenedMenuId = -1;
    var isCmsMenuEnabled = false;
    let contentOffset = null;

    const COLUMN_MENU_ITEM = "FgpColumnMenuItem";
    const STACKED_COLUMN_MENU_ITEM = "FgpStackedColumnMenuItem";
    const PRODUCT_MENU_ITEM = "FgpProductMenuItem";
    const QUICK_LINK_MENU_ITEM = "FgpQuickLinkMenuItem";
    const LINK_TILE_MENU_ITEM = "FgpLinkTileMenuItem";
    const LOGO_MENU_ITEM = "FgpLogoMenuItem";
    const TAB_MENU_ITEM = "FgpTabMenuItem";
    const BANNER_MENU_ITEM = "FgpBannerMenuItem";
    const contentWrapper = document.querySelector(".ContentWrapper");

    cacheContentPosition();
    initMenu();
    setUpTopLinkDropDownMenu();

    window.addEventListener("resize", cacheContentPosition);

    function registerPartials() {
        Handlebars.registerPartial("oldmiddlelevel", oldmiddlelevel);
        Handlebars.registerPartial("middlelevel", newmiddlelevel);
        Handlebars.registerPartial("bottomLevel", bottomlevel);
        Handlebars.registerPartial("level", level);
        Handlebars.registerPartial("viewAllMobileMenuItem", viewAllMobileMenuItem);
        Handlebars.registerPartial("delayedlevel", delayedlevel);
        Handlebars.registerPartial("secondlevelmobilemenutemplate", secondlevelmobilemenutemplate);
        Handlebars.registerPartial("logomenuitem", logomenuitem);
        Handlebars.registerPartial("logomenu", logomenu);
        Handlebars.registerPartial("linktitleitem", linktitleitem);
        Handlebars.registerPartial("productmenulink", productmenulink);
        Handlebars.registerPartial("productmenuitem", productmenuitem);
        Handlebars.registerPartial("stackedColumnMenuItem", stackedColumnMenuItem);
        Handlebars.registerPartial("columnmenuitem", columnmenuitem);
        Handlebars.registerPartial("genericmenu", genericmenu);
        Handlebars.registerPartial("quicklinkmenuitem", quicklinkmenuitem);
        Handlebars.registerPartial("quicklinkmenu", quicklinkmenu);
        Handlebars.registerPartial("bannermenuitem", bannermenuitem);
        Handlebars.registerPartial("bannermenu", bannermenu);
        Handlebars.registerPartial("tabmenu", tabmenu);
        Handlebars.registerPartial("tabmenuitem", tabmenuitem);
    }

    function initMenu() {
        updateContentCover(true);

        // check if menu loaded server-side
        var menuAttrs = $("#menuAttrs");
        if (menuAttrs.length) {
            shouldLoadServerSide = $("#menuAttrs").data("shouldloadserverside") === "True";
            menuIsSticky = $("#menuAttrs").data("menuissticky") === "True";
            stickyMenuScrollPixelVal = parseInt($("#menuAttrs").data("stickymenuscrollpixelval"));
            stickyMenuScrollTopOffset = parseInt($("#menuAttrs").data("stickymenuscrolltopoffset"));
            shouldDelayMenuRendering = $("#menuAttrs").data("delayrendering") === "True";
            autoclosemenuonhoverout = $("#menuAttrs").data("autoclosemenuonhoverout") === "True";
            useOptimisedMenuClose = $("#menuAttrs").data("useoptimisedmenuclose") === "True";
            isCmsMenuEnabled = $("#menuAttrs").data("iscmsmenuenabled") === "True";
        }

        nonMenuLightBoxesEnabled = $("#hdnLightboxNonMenuEnabled").val() === "True";

        $("#topMenuWrapper").on({
            mouseenter: function () {
                desktopMenuHovered = true;
                $("#Body").addClass("activeMenuHover");
            },
            mouseleave: function () {
                $("#Body").removeClass("activeMenuHover");
            },
        });

        if ($("#trigger").is(":visible") && mobileMenuRequested == false) {
            mobileMenuRequested = true;
            loadMenu("mobile", loadMobileCallback);
        } else if ($("#topMenuWrapper").is(":visible") && desktopMenuRequested == false) {
            desktopMenuRequested = true;
            loadMenu("desktop", shouldDelayMenuRendering ? loadDesktopDataOnlyCallback : loadDesktopCallback);
        } else {
            setMenuIntent();
        }
    }
    function setupLevel2Menu() {
        $(".persistentLevel2Selection").click(function (e) {
            if (!$("#HeaderGroup").hasClass("secondLevelMenuSelected")) {
                $("#HeaderGroup").addClass("secondLevelMenuSelected");
            }
            $(".persistentLevel2Selection").removeClass("sdHover secondLevelMenuClick");
            $(this).closest("li").addClass("secondLevelMenuClick");
            var currentSelectedTopLevelMenuTabIndex = $(this).index() + 1;
            if (currentSelectedTopLevelMenuTabIndex != window.selectedTopLevelMenuTabIndex) {
                window.selectedTopLevelMenuTabIndex = currentSelectedTopLevelMenuTabIndex;
                window.selectedLevel2MenuTabId = $(this).closest("li").data("id");
                setMenuCookie(window.selectedTopLevelMenuTabIndex);
                if ($(this).hasClass("menuitemtext MobMenChevron")) {
                    return true; // In responsive tablet/mobile mode the html element contains MobMenChevron class and must lawys return true to open sub-menu
                }
                return false; // In desktop mode do not redirect the user to URL on first click. First click must display the sub menu.
            } else {
                return true;
            }
        });
    }

    function getMenuStyle() {
        "use strict";
        var homeMenu = $("ul#homeMenu[data-menuStyle]");
        if (homeMenu.length > 0) {
            return homeMenu.length ? homeMenu.attr("data-menuStyle") : "Default";
        }

        return "Default";
    }

    //Return the delay rendering state. True if render successfully.
    function delayRenderingMenu(triggerElement) {
        if (delayedMenuRenderDone || !shouldDelayMenuRendering) return false;
        loadDesktopCallback(null, triggerElement);
        delayedMenuRenderDone = true;
        return true;
    }

    function loadDesktopDataOnlyCallback(data) {
        if (!data) return;
        if (!isCmsMenuEnabled) desktopMenuData = data;
        else cmsMenuData = data.fgpMenu;
        if (desktopMenuHovered) {
            loadDesktopCallback();
        }

        $("#topMenuWrapper").on({
            mouseenter: function () {
                delayRenderingMenu();
            },
        });

        displaySelectedLevel2Menu();
        setTimeout(function () {
            displaySelectedLevel2Menu();
        }, 500); // sometime some ghost function causes the menu to disappear after 300 milisec, need investigation
    }

    function loadDesktopCallback(data, triggerElement) {
        if (data && !isCmsMenuEnabled) {
            desktopMenuData = data;
        }
        if (data && isCmsMenuEnabled) {
            cmsMenuData = data.fgpMenu;
        }
        processDesktopMenuData(triggerElement);
        if (!promosRequested && !shouldLoadServerSide) {
            getMenuPromos();
        }
        displaySelectedLevel2Menu();
        setTimeout(function () {
            displaySelectedLevel2Menu();
        }, 500); // sometime some ghost function causes the menu to disappear after 300 milisec, need investigation
    }

    function loadMenu(menu, callback) {
        // Skip ajax call if data already loaded server-side
        if (shouldLoadServerSide) {
            callback();
            return;
        }

        var mainMenu = $(".MenuAttr_Main");
        var nodeselector = null;
        var CoBrand = null;

        if (mainMenu.length > 0) {
            nodeselector = mainMenu.data("nodeselector");
            CoBrand = mainMenu.data("cobrand");
        }

        if (!isCmsMenuEnabled) {
            $.ajax({
                type: "GET",
                data: {
                    MenuType: menu,
                    GetAdverts: true,
                    NodeSelector: nodeselector,
                    CoBrand: CoBrand,
                },
                url: "/api/menu/v1/get/ajax",
                success: callback,
            });
        } else {
            $.ajax({
                type: "GET",
                data: {
                    MenuType: menu,
                    GetAdverts: true,
                    NodeSelector: nodeselector,
                    CoBrand: CoBrand,
                },
                url: "/api/menu/v1/get/json",
                success: callback,
            });
        }
    }

    function getLinkOptions(item) {
        return {
            title: !item.hideTitle ? item.title : null,
            hideTitle: item.hideTitle,
            newTag: item.showNewBadge,
            href: item.href,
        };
    }

    function getProductMenuItem(productMenuItem) {
        const linkOptions = getLinkOptions(productMenuItem);
        // This was to hide the title if it matched the column title
        // let title = i.title !== item.title ? i.title : '';
        let links = productMenuItem.links;
        if (productMenuItem.links && productMenuItem.links.length > 0) {
            links = productMenuItem.links.map((link) => {
                const linkOptions = getLinkOptions(link);
                return { ...link, ...linkOptions };
            });
        }
        return { ...productMenuItem, ...linkOptions, links, hasLinks: links?.length > 0 };
    }

    function getColumnMenuItems(items) {
        const columnMenuItems = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].__typename !== COLUMN_MENU_ITEM) {
                continue;
            }

            let productMenuItems = items[i].items
                .filter((i) => i.__typename === PRODUCT_MENU_ITEM)
                .map((i) => getProductMenuItem(i));

            const quickLinkMenuItems = items[i].items
                .filter((i) => i.__typename === QUICK_LINK_MENU_ITEM)
                .map((item) => ({ ...item, title: item.title }));

            const linkTitleItems = items[i].items.filter((i) => i.__typename === LINK_TILE_MENU_ITEM);
            const logoMenuItems = items[i].items.filter((i) => i.__typename === LOGO_MENU_ITEM);
            const linkOptions = getLinkOptions(items[i]);

            const stackedColumnItems = [];

            for (let s = i + 1; s < items.length; s++) {
                if (items[s].__typename !== STACKED_COLUMN_MENU_ITEM) {
                    break;
                }

                const stackedProductMenuItems = items[s].items
                    .filter((i) => i.__typename === PRODUCT_MENU_ITEM)
                    .map((i) => getProductMenuItem(i));

                stackedColumnItems.push({ ...items[s], productMenuItems: stackedProductMenuItems });
            }

            columnMenuItems.push({
                ...items[i],
                productMenuItems,
                hasProductMenuItems: productMenuItems.length > 0,
                flatten: productMenuItems.length === 1,
                linkTitleItems,
                hasLinkTitleItems: linkTitleItems.length > 0,
                logoMenuItems,
                hasLogoMenuItems: logoMenuItems.length > 0,
                quickLinkMenuItems,
                hasQuickLinkMenuItems: quickLinkMenuItems.length > 0,
                stackedColumnItems,
                requireTitleSpacer:
                    (!items[i].title || items[i].hideTitle) &&
                    productMenuItems?.length > 0 &&
                    !productMenuItems[0].title,
                ...linkOptions,
            });
        }

        return columnMenuItems;
    }

    function getMobileColumnMenuItems(items) {
        const columnMenuItems = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].__typename !== COLUMN_MENU_ITEM && items[i].__typename !== STACKED_COLUMN_MENU_ITEM) {
                continue;
            }

            let productMenuItems = items[i].items
                .filter((i) => i.__typename === PRODUCT_MENU_ITEM)
                .map((i) => getProductMenuItem(i));

            const quickLinkMenuItems = items[i].items
                .filter((i) => i.__typename === QUICK_LINK_MENU_ITEM)
                .map((item) => ({ ...item, title: item.title }));

            const linkOptions = getLinkOptions(items[i]);

            columnMenuItems.push({
                ...items[i],
                productMenuItems,
                hasProductMenuItems: productMenuItems.length > 0,
                flatten: productMenuItems.length === 1,
                quickLinkMenuItems,
                hasQuickLinkMenuItems: quickLinkMenuItems.length > 0,
                ...linkOptions,
            });
        }

        return columnMenuItems;
    }

    function getQuickLinkMenuItems(items) {
        return items
            .filter((item) => item.__typename === QUICK_LINK_MENU_ITEM)
            .map((item) => ({ ...item, title: item.title }));
    }

    function getBannerMenuItems(items) {
        return items.filter((item) => item.__typename === BANNER_MENU_ITEM);
    }

    function getTabMenuItems(items) {
        return items
            .filter((item) => item.__typename === TAB_MENU_ITEM)
            .map((item) => {
                let columnMenuItems = getColumnMenuItems(item.items);
                let bannerMenuItems = getBannerMenuItems(item.items);
                let quickLinkMenuItems = getQuickLinkMenuItems(item.items);
                return {
                    ...item,
                    columnMenuItems,
                    bannerMenuItems,
                    quickLinkMenuItems,
                    hasColumnMenuItems: columnMenuItems.length > 0,
                    hasBannerMenuItems: bannerMenuItems.length > 0,
                    hasQuickLinkMenuItems: quickLinkMenuItems.length > 0,
                };
            });
    }

    function getMenuItemStyleClass(style) {
        return !!style && typeof style === "string" ? style.replace("_", "-").toLowerCase() : "";
    }

    function getRootMenuTerms(title, hasTabs, style) {
        const terms = ["root", "mmHasChild", "has-dropdown", "multicolumn", `MenuGroup${title}`];

        if (hasTabs) {
            terms.push("sidebarSubMenu");
        } else {
            terms.push("sixCol", "promoEnabled");
        }

        if (!!style) {
            terms.push(getMenuItemStyleClass(style));
        }

        return terms.join(" ");
    }

    function getCmsMenuNodes(items) {
        let index = 1;
        return items.map((item) => {
            const quickLinkMenuItems = getQuickLinkMenuItems(item.items);
            const columnMenuItems = getColumnMenuItems(item.items);
            const tabMenuItems = getTabMenuItems(item.items);
            const bannerMenuItems = getBannerMenuItems(item.items);
            const terms = getRootMenuTerms(item.title, tabMenuItems.length > 0, item.style);
            return {
                ...item,
                Text: item.title,
                Name: item.title,
                terms,
                tabId: index++,
                Url: item.href,
                isCmsMenuEnabled: true,
                quickLinkMenuItems,
                columnMenuItems,
                tabMenuItems,
                bannerMenuItems,
                hasTabMenuItems: tabMenuItems.length > 0,
                hasColumnMenuItems: columnMenuItems.length > 0,
                hasBannerMenuItems: bannerMenuItems.length > 0,
                hasQuickLinkMenuItems: quickLinkMenuItems.length > 0,
                UseOld: false,
                UseNew: false,
                WasOld: false,
            };
        });
    }

    function processDesktopMenuData(triggerElement) {
        // skip menu loading if data loaded server-side
        if (
            !domReadyDone ||
            (!shouldLoadServerSide && !isCmsMenuEnabled && desktopMenuData == null) ||
            (!shouldLoadServerSide && isCmsMenuEnabled && cmsMenuData == null)
        ) {
            return;
        }

        if (!shouldLoadServerSide) {
            var menudata = {
                isCmsMenuEnabled: !!isCmsMenuEnabled,
                nodes: desktopMenuData ? desktopMenuData.Nodes : [],
            };
            if (isCmsMenuEnabled) {
                menudata.nodes = getCmsMenuNodes(cmsMenuData.items);
            }
            var template = window.Handlebars.compile(toplevel);
            var menuHtml = template(menudata);
            $("#topMenu")
                .html(menuHtml)
                .promise()
                .done(function () {
                    getMenuPromos();
                    if (triggerElement) {
                        handleTopMenuItemClick(true, $("#liTopLevelMenu_" + triggerElement));
                    }
                });
        }

        setMenuIntent();
        setupSideBarSubmenu();
        displaySelectedLevel2Menu();
    }

    function displaySelectedLevel2Menu() {
        if (!domReadyDone) return;
        if (window.selectedTopLevelMenuTabIndex > 0) {
            if (!$("#HeaderGroup").hasClass("secondLevelMenuSelected")) {
                $("#HeaderGroup").addClass("secondLevelMenuSelected");
            }
            if (!$("#liTopLevelMenu_" + window.selectedLevel2MenuTabId).hasClass("secondLevelMenuClick")) {
                $(".persistentLevel2Selection").removeClass("sdHover secondLevelMenuClick");
                $("#liTopLevelMenu_" + window.selectedLevel2MenuTabId).addClass("secondLevelMenuClick");
            }
        }
        setupLevel2Menu();
    }

    function processMobileProductMenu(list, item, inheritTitle = false) {
        item.productMenuItems.forEach((productItem) => {
            if (productItem.title || (inheritTitle && item.title)) {
                list.push({
                    Name: productItem.title || item.title,
                    Text: productItem.title || item.title,
                    Url: productItem.href,
                    terms: "level2 sdmColHeader",
                    UseOld: true,
                    hasDropdown: false,
                    Enabled: true,
                    Children: [],
                });
            }
            productItem.links?.forEach((link) => {
                list.push({
                    Name: link.title,
                    Text: link.title,
                    Url: link.href,
                    terms: !!link.newTag ? "level2 newTag" : "level2",
                    UseOld: true,
                    hasDropdown: false,
                    Enabled: true,
                    Nodes: [],
                });
            });
        });
    }

    function createMobileQuickLinkMenuNode(quickLink, isHeader = false) {
        return {
            Name: quickLink.title,
            Text: quickLink.title,
            Url: quickLink.href,
            terms: !isHeader ? "level2" : "sdmColHeader",
            UseOld: true,
            hasDropdown: false,
            Enabled: true,
            Nodes: [],
        };
    }

    function createMenuNode(item, title) {
        const terms = ["level1"];
        let hasChildren = false;

        if (item.items?.length > 0) {
            hasChildren = true;
            terms.push("sdmColHeader", "mmHasChild");
        }

        if (!!item.style) {
            terms.push(item.style.replace("_", "-").toLowerCase());
        }

        return {
            Name: title,
            Text: title,
            Url: item.href,
            UseOld: true,
            hasDropdown: hasChildren,
            Enabled: true,
            Children: [],
            terms: terms.join(" "),
            MobileMenuImageEnabled: !!item.image?.src,
            featureImage: item.image?.src,
            viewAllButton: mobileMenuData.MobileViewAllText,
            showViewAllButton: !!item.href,
        };
    }

    function getColumnQuickLinkMenuItems(items) {
        const quickLinkMenuItems = [];

        for (let columnIndex = 0; columnIndex < items.length; columnIndex++) {
            if (items[columnIndex].__typename !== COLUMN_MENU_ITEM) {
                continue;
            }

            for (let quickIndex = 0; quickIndex < items[columnIndex].items.length; quickIndex++) {
                if (items[columnIndex].items[quickIndex].__typename !== QUICK_LINK_MENU_ITEM) {
                    continue;
                }

                quickLinkMenuItems.push(items[columnIndex].items[quickIndex]);
            }
        }

        return quickLinkMenuItems;
    }

    function getMobileColumnMenuNodes(items) {
        const columnMenuItems = getMobileColumnMenuItems(items);
        const combineProductMenu =
            columnMenuItems.filter((i) => i.productMenuItems?.length > 0 && !i.hideTitle).length === 1;

        const mobileColumnMenuNode = [];
        let name = null;
        let prev = null;

        for (let i = 0; i < columnMenuItems.length; i++) {
            const item = columnMenuItems[i];

            if (!item.productMenuItems || item.productMenuItems.length === 0) {
                continue;
            }

            if (combineProductMenu) {
                processMobileProductMenu(mobileColumnMenuNode, item, true);
                continue;
            }

            let title = item.title;

            if (item.hideTitle && !title && item.productMenuItems?.length > 0) {
                title = item.productMenuItems[0].title;
            }

            if (!title) {
                processMobileProductMenu(prev.Children, item);
                continue;
            }

            let lastChar = title[title.length - 1];
            let isNumber = lastChar >= "0" && lastChar <= "9";

            if (!name || !title.startsWith(name)) {
                name = title;
                prev = createMenuNode(item, title);

                processMobileProductMenu(prev.Children, item);

                if (item.hideTitle && prev.Children && prev.Children.length > 0) {
                    // If item title is set to first child title then remove first child item
                    prev.Children.splice(0, 1);
                }

                mobileColumnMenuNode.push(prev);
            } else if (title.length === name.length + 1 && title.startsWith(name) && isNumber) {
                processMobileProductMenu(prev.Children, item);
            }
        }

        return mobileColumnMenuNode;
    }

    function getMobileTabMenuNodes(items) {
        const tabMenuItems = getTabMenuItems(items);
        const tabMenuNodes = [];

        tabMenuItems.forEach((tabMenuItem) => {
            const newNode = createMenuNode(tabMenuItem, tabMenuItem.title);

            tabMenuItem.columnMenuItems.forEach((item) => {
                if (item.items && item.items.length > 0) {
                    processMobileProductMenu(newNode.Children, item);
                }
            });

            tabMenuItem.quickLinkMenuItems.forEach((quickLink) => {
                newNode.Children.push(createMobileQuickLinkMenuNode(quickLink, true));
            });

            tabMenuNodes.push(newNode);
        });

        return tabMenuNodes;
    }

    function getMobileSecondLevelMenuNodes(items) {
        const mobileSecondLevelMenuNodes = [];

        const columnMenuNodes = getMobileColumnMenuNodes(items);
        columnMenuNodes.forEach((n) => mobileSecondLevelMenuNodes.push(n));

        const tabMenuNodes = getMobileTabMenuNodes(items);
        tabMenuNodes.forEach((n) => mobileSecondLevelMenuNodes.push(n));

        const quickLinkMenuItems = getColumnQuickLinkMenuItems(items);
        quickLinkMenuItems.forEach((i) => mobileSecondLevelMenuNodes.push(createMobileQuickLinkMenuNode(i, i.title)));

        return mobileSecondLevelMenuNodes;
    }

    function loadMobileCallback(data) {
        if (!data) {
            console.warn("No mobile menu data");
            return;
        }

        if (!isCmsMenuEnabled) {
            mobileMenuData = data;
        } else {
            cmsMenuData = data.fgpMenu;
            mobileMenuData = {
                AllDepartmentsText: "All Departments",
                BackbuttonText: "Back",
                MobileViewAllText: data.MobileViewAllText ?? "View All",
                Nodes: [],
            };
            const cmsMenuItems = getCmsMenuNodes(cmsMenuData.items);
            cmsMenuItems.forEach((item) => {
                const terms = getRootMenuTerms(item.title, false, item.style);
                let MobileMenuImageEnabled = false;
                let featureImage = undefined;
                if (item.image && item.image.src) {
                    MobileMenuImageEnabled = true;
                    featureImage = item.image.src;
                }
                const newNode = {
                    Name: item.title,
                    Text: item.title,
                    Url: item.href,
                    UseOld: true,
                    hasDropdown: true,
                    Enabled: true,
                    MobileMenuImageEnabled,
                    featureImage,
                    Children: [],
                    terms,
                };
                if (item.items && item.items.length > 0) {
                    const childNodes = getMobileSecondLevelMenuNodes(item.items);
                    childNodes.forEach((node) => newNode.Children.push(node));
                }
                mobileMenuData.Nodes.push(newNode);
            });
        }
        processMobileMenuData();
        if ($("#hdnShowAccountSubmenu").val().toLowerCase() === "true") {
            $(".mp-menu").addClass("show-account");
        }
        displayDefaultMenuItemOfMobileMenu();
    }

    function displayDefaultMenuItemOfMobileMenu() {
        if (!domReadyDone || IsDesktopView()) return;
        if ($(".persistentLevel2Selection").length > 0) {
            var selectedTopLevelMobileMenu = null;
            if ($("#ulTopLevelMobileMenu").find(".persistentLevel2Selection").length > 0) {
                if (window.selectedTopLevelMenuTabIndex > 0) {
                    selectedTopLevelMobileMenu = $("#ulTopLevelMobileMenu").find(
                        "#liTopLevelMenu_" + window.selectedLevel2MenuTabId,
                    );
                } else {
                    selectedTopLevelMobileMenu = $("#ulTopLevelMobileMenu").find(".persistentLevel2Selection").first();
                }
            } else {
                var menuStyle = getMenuStyle();
                if (menuStyle === "Accordion") {
                    if (window.selectedTopLevelMenuTabIndex > 0) {
                        selectedTopLevelMobileMenu = $(".shop ul")
                            .first()
                            .find('[data-id="' + window.selectedLevel2MenuTabId + '"]');
                    } else {
                        selectedTopLevelMobileMenu = $(".shop ul").first().find(".persistentLevel2Selection").first();
                    }
                }
            }
            if (selectedTopLevelMobileMenu !== undefined || selectedTopLevelMobileMenu !== null) {
                selectedTopLevelMobileMenu.click();
                if (!$(selectedTopLevelMobileMenu).hasClass("open")) {
                    $(selectedTopLevelMobileMenu).addClass("open");
                }
            }
        }
    }
    function processMobileMenuData() {
        if (!domReadyDone || (!shouldLoadServerSide && mobileMenuData == null)) {
            return;
        }
        var menuStyle = getMenuStyle();
        if (!shouldLoadServerSide) {
            if (mobileMenuData == null || !domReadyDone) return;

            if (shouldDelayMenuRendering) {
                // If we are in accordion style, add the 'all departments' object
                if (menuStyle === "Accordion") {
                    var allDepts =
                        '<li id="liAllDepts"><a class="menuitemtext">' +
                        mobileMenuData.AllDepartmentsText +
                        "</a></li>";
                    $(".shop ul").first().prepend(allDepts);
                }
            } else {
                var menudata = {
                    nodes: mobileMenuData.Nodes,
                    backbutton: mobileMenuData.BackButtonText,
                };

                // If we are in accordion style, add the 'all departments' object
                if (menuStyle === "Accordion") {
                    mobiletemplate =
                        '<ul id="ulTopLevelMobileMenu" >' +
                        '<li id="liAllDepts"><a class="menuitemtext">' +
                        mobileMenuData.AllDepartmentsText +
                        "</a></li>" +
                        "{{#each nodes}}" +
                        "{{>level backbutton=../backbutton}}" +
                        "{{/each}}" +
                        "</ul>";
                    // Append secondlevelmobilemenutemplate only if the menu has class persistentLevel2Selection
                    if ($(".persistentLevel2Selection").length > 0) {
                        mobiletemplate =
                            mobiletemplate +
                            '<div class="secondaryLevelContainer">' +
                            "{{>secondlevelmobilemenutemplate}}" +
                            "</div>";
                    }
                }

                var template = window.Handlebars.compile(mobiletemplate);
                var menuHtml = template(menudata);
                $(".shop").first().html(menuHtml);
            }
        }

        if (menuStyle === "Accordion") {
            $(function () {
                mobileMenu = mobileAccordionMenu($mpContainer);
            });
        } else if (menuStyle === "Slider") {
            if (!shouldDelayMenuRendering) {
                populateSubLevels();
            }
            useSliderMenu();
        } else {
            //current menu

            $(function () {
                new mlPushMenu(document.getElementById("mp-menu"), document.getElementById("trigger"), {
                    type: "cover",
                });
            });
        }

        setupCloseOnClickOff();

        function hideMobileMenu() {
            if (document.querySelector("body.body-menu-open") === null) {
                return;
            }

            if (menuStyle === "Accordion" && mobileMenu) {
                mobileMenu.toggle();
            } else if (menuStyle === "Slider") {
                hideSliderMenu();
            }
        }

        function configureClickOffClosesMenu() {
            document.querySelector("#MenuOpenContentCover")?.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                hideMobileMenu();
            });

            document.querySelector("#HeaderGroup")?.addEventListener("click", function (e) {
                if (e.target.id === "trigger" || document.getElementById("mp-menu").contains(e.target)) {
                    return;
                }

                hideMobileMenu();
            });
        }

        function setupCloseOnClickOff() {
            if (window.clickOffClosesMenu === true) {
                if (useOptimisedMenuClose) {
                    configureClickOffClosesMenu();
                } else {
                    $(document).click(function (e) {
                        var menuShowing = $("body").hasClass("body-menu-open");
                        if (!menuShowing) return;

                        // If its a descendant of the menu, or its from the menu opener/closers,
                        // we don't want to honour it
                        var isDescendant = $.contains($("#mp-menu")[0], event.target);
                        if (isDescendant || event.target.id === "trigger") return;

                        // Simulate a click on the trigger ele
                        $("#trigger").click();
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
            }
        }

        /*----- Slider Menu -----*/
        function useSliderMenu() {
            $("body").on("click", ".menu-trigger", toggleSliderMenu);
            if ($("#mobile-menu-footer-content").length > 0) {
                // if mobile menu bottom wrapper is there
                $("body").on("click", "#mp-menu .mmHasChild:not(.panel)", showMenuSubLevel);

                $("#mobile-menu-footer-content .collapsable-item").click(function (e) {
                    var collapseContainer = $(this).data("target");
                    $(collapseContainer).collapse("toggle");
                    $("#mobile-menu-footer-content .collapsable-item").not(this).removeClass("open");
                    $(this).toggleClass("open");
                    e.stopPropagation();
                });

                $("#mobile-menu-footer-content").on("show.bs.collapse", ".collapse", function () {
                    $("#mobile-menu-footer-content").find(".collapse.in").collapse("hide");
                    var $card = $(this).closest(".panel");
                    var $parent = $card.parents(".mp-level").first();
                    $parent.animate({ scrollTop: $parent.scrollTop() + ($card.offset().top - $parent.offset().top) });
                });
            } else {
                $("body").on(
                    "click",
                    "#mp-menu .mmHasChild, #liMobileLanguageSelector, #liMobileCurrencySelector",
                    showMenuSubLevel,
                );
            }
            $("body").on("click", ".mp-back, .mp-header-back", hideCurrentSubmenu);
            $("body").on("click", ".mp-close, .mobile-overlay", hideSliderMenu);
            $(".root-menu-item").on("click", triggerSliderMenuRootNode);
        }

        function triggerSliderMenuRootNode(e, id, isMenuOpen) {
            if (id) {
                if (id != lastOpenedMenuId || isMenuOpen) {
                    lastOpenedMenuId = id;
                } else {
                    return;
                }
            } else {
                if ($(this).data("id") != lastOpenedMenuId) {
                    var $rootMenuItem = $MobileMenuContentWrap.find('li.root[data-id="' + lastOpenedMenuId + '"]');
                    if ($rootMenuItem) {
                        var backButton = $rootMenuItem.find(".mp-back").first();
                        if (backButton) {
                            hideAllSubMenus();
                        }
                    }

                    lastOpenedMenuId = $(this).data("id");
                }
            }
            if (isMenuOpen) {
                selectRootMenuItem();
            }

            var $rootMenuItem = $MobileMenuContentWrap.find('li.root[data-id="' + lastOpenedMenuId + '"]');
            if ($rootMenuItem) {
                $(".root-menu-item").removeClass("active");
                $(".mobile-root-menu")
                    .find('a[data-id="' + lastOpenedMenuId + '"]')
                    .addClass("active");
                showMenuSubLevel(null, $rootMenuItem);
            }
        }

        function selectRootMenuItem() {
            var urlRootMenuPart = "";
            var breadCrumbRootMenuPart = "";

            //set url root category if available
            if (window.location.pathname && window.location.pathname.split("/").length > 1) {
                urlRootMenuPart = window.location.pathname.split("/")[1].toUpperCase();
            }

            //set breadcrumb top category if avalable
            if (
                $("#BreadcrumbGroup .breadcrumb li") &&
                $("#BreadcrumbGroup .breadcrumb li").length > 1 &&
                $($("#BreadcrumbGroup .breadcrumb li")[1]).find("a span").length > 0
            ) {
                breadCrumbRootMenuPart = $($("#BreadcrumbGroup .breadcrumb li")[1])
                    .find("a span")[0]
                    .innerText.toUpperCase();
            }

            $(".mobile-root-menu .root-menu-item").each(function () {
                if (
                    $(this).data("href") &&
                    (urlRootMenuPart === $(this).data("href").toUpperCase() ||
                        breadCrumbRootMenuPart === $(this).data("href").toUpperCase())
                ) {
                    lastOpenedMenuId = $(this).data("id");
                }
            });
        }

        function toggleSliderMenu(e) {
            e.preventDefault();
            // if filter open, close it.
            if (!$("#mp-menu").hasClass("menu-open") && $("#FilterContainer:visible").length > 0) {
                $("#mobclsfltrs").click();
            }

            $("body").toggleClass("body-menu-open");
            $("#mp-menu").toggleClass("menu-open");

            var sliderMenuVisible = $("#mp-menu").hasClass("menu-open");
            if (sliderMenuVisible) {
                $(".mobile-overlay").addClass("activeOverlay");
                $(".mp-level").each(function () {
                    $(this).removeClass("show-level");
                    $(this).removeClass("child-open");
                });
                addMobileFooter();
                updateContentCover(false, true);
                if ($(".mobile-root-menu").length) {
                    var menuId = lastOpenedMenuId;
                    if (menuId == -1) {
                        menuId = $MobileMenuContentWrap.find("li.root").first().data("id");
                    }
                    triggerSliderMenuRootNode(null, menuId, true);
                }
            } else {
                $("#mp-menu").removeClass("menu-open");
                updateContentCover(true, false);
            }
            $(document).trigger("sd-mob-menu-toggled", sliderMenuVisible);
        }

        function showMenuSubLevel(e, element) {
            var menuIndex = $liListWithDropDown.index(this);
            if (element) {
                menuIndex = $liListWithDropDown.index(element);
            }

            if (shouldDelayMenuRendering) {
                populateSubLevels(menuIndex);
            }
            $(".mp-level").scrollTop(0);
            var elem = this;
            if (element) {
                elem = element;
            }
            var subLevel = $(elem).find(".mp-level").first();
            var parentLevel = $(elem).closest(".mp-level").first();
            if (subLevel.length && !parentLevel.hasClass("child-open")) {
                $(subLevel).find(".mobMenGroup").first().show();
                parentLevel.addClass("child-open");
                subLevel.addClass("show-level");
                addMobileFooter($(elem));
            }
        }

        function addMobileFooter(element) {
            //skip if element is mobile footer item(no need to append footer for footer menu)
            if (
                $("#mobile-menu-footer-content").length != 1 ||
                (element && element.parents("#mobile-menu-footer-content").length > 0)
            )
                return;

            //add the footer to current submenu.
            if (
                $(".MobileMenuContentWrap .show-level").not(".child-open").length > 0 &&
                $(".MobileMenuContentWrap .show-level").not(".child-open").children(".mobile-menu-footer-content")
                    .length == 0
            ) {
                $(".MobileMenuContentWrap .show-level")
                    .not(".child-open")
                    .last()
                    .append($("#mobile-menu-footer-content"));
            }
            //if  there is no submenu, add it to the top level. check the footer is already there before adding.
            else if ($("#mobile-menu-footer-content").parent().id != "mobile-menu-footer") {
                $("#mobile-menu-footer").append($("#mobile-menu-footer-content"));
            }
        }

        function hideCurrentSubmenu(event) {
            event.stopPropagation();
            $(this).closest(".mp-level").first().removeClass("show-level");
            $(this).closest(".mp-level.child-open").first().removeClass("child-open");
            addMobileFooter($(this));
        }

        function hideAllSubMenus() {
            $mpMenu.find(".mp-level").removeClass("show-level");
            $mpMenu.find(".mp-level.child-open").removeClass("child-open");
        }

        function hideSliderMenu(event) {
            $(".mobile-overlay").removeClass("activeOverlay");

            $("body").removeClass("body-menu-open");
            $("#mp-menu").removeClass("menu-open");

            $(".mp-level").each(function () {
                $(this).removeClass("show-level");
            });

            $(".mp-level.child-open").each(function () {
                $(this).removeClass("child-open");
            });
            if (event) {
                event.stopPropagation();
            }
            updateContentCover(true, false);

            $(document).trigger("sd-mob-menu-toggled", false);
        }

        /*----- /Slider Menu -----*/

        //Mobile accordian menu
        function mobileAccordionMenu(mp_container) {
            "use strict";
            //hide to start with
            var $mpContainer = mp_container;
            var accordionMenuVisible = false;
            var $footer = $("footer");
            var $ContentWrapper = $(".ContentWrapper");
            var openClass = "open";
            var menuStateStorageKey = "mobile_accordion_menu_state";
            var mobileMenuScrollTopOnClick =
                $("ul#homeMenu[data-mobileScrollTop]").attr("data-mobileScrollTop").toLowerCase() == "true"
                    ? true
                    : false;
            var animationString = mobileMenuScrollTopOnClick ? "slow" : "fast";

            $MobileMenuContentWrap.addClass("accordionMenuContentWrap");
            var saveMenuState = shouldSaveMenuState() | false;

            var $HeaderGroup = $("#HeaderGroup");
            //set position so that menu always stays below header
            var headerRectBoundingClient = $HeaderGroup[0].getBoundingClientRect();

            initAccordionMenu();

            $MobileMenuContentWrap.find("li").on("click", function (e) {
                e.stopPropagation();
            });

            $MobileMenuContentWrap.find("li#liAllDepts a").on("click", function (e) {
                var li = $(this).closest("li");

                showAllSiblings(li);
                closeChildren(li);

                e.stopPropagation();
            });

            function siblingWork(ele, open) {
                ele.siblings()
                    .not("#liAllDepts")
                    .each(function () {
                        if (open) {
                            $(this).slideDown("slow", function () {
                                $(this).removeClass("open");
                            });
                        } else if (!$(".shop li").hasClass("persistentLevel2Selection")) {
                            // If 'persistent level 2 selection' type menu is enabled, don't collapse siblings
                            $(this).slideUp("slow", function () {
                                $(this).removeClass("open");
                            });
                        }

                        // Close all children
                        $("ul", this).slideUp("slow");

                        // But don't hide the children elements
                        $("li", this).slideDown("slow");
                    });
            }

            function hideAllSiblings(ele) {
                siblingWork(ele, false);
            }
            function showAllSiblings(ele) {
                siblingWork(ele, true);
            }

            function closeChildren(ele) {
                // Close open children menus
                $("ul", ele).slideUp("slow");

                // But don't hide the children elements
                $("li", ele).slideDown("slow");

                $(".shop a.MobMenChevron").each(function () {
                    $(this).removeClass("rotate-90");
                });
            }

            function menuItemOnClick(e, el) {
                var $this = $(this);
                if (el) $this = el;
                if (!$this.hasClass("has-dropdown")) return;

                e.preventDefault();
                $this.toggleClass(openClass);

                if ($this.hasClass("persistentLevel2Selection")) {
                    var submenuDivId = "#divSubMenu_" + $this.data("id");
                    $(".secondLevelMobileMenu").removeClass("activeMobileMenu");
                    if (shouldDelayMenuRendering) {
                        if (
                            $(submenuDivId).css("display") == "block" &&
                            $(submenuDivId).html() !== "" &&
                            window.selectedTopLevelMenuTabIndex == $this.index()
                        ) {
                            $(submenuDivId).slideUp("slow");
                        } else {
                            openSubMenu($this);
                            if (!$this.hasClass("open")) {
                                $this.addClass("open");
                            }
                        }
                    } else {
                        var topmenuId = "#liTopLevelMenu_" + $this.data("id");
                        if ($(submenuDivId).html().trim() === "") {
                            var subMenuDiv = $(topmenuId).children(".am-level");
                            $(submenuDivId).html(subMenuDiv.html());
                            subMenuDiv.html("");
                            var listElement = $(submenuDivId).find("li");
                            bindClickEventForMobileSubMenu(listElement);
                        }
                        $(".mobMenGroup").hide();
                        if (window.selectedTopLevelMenuTabIndex != $this.index() || $this.hasClass("open")) {
                            $(submenuDivId).children(".mobMenGroup").slideDown("slow");
                            $(".persistentLevel2Selection").removeClass(openClass);
                            $this.addClass("open");
                        }
                    }
                    if (!$(submenuDivId).hasClass("activeMobileMenu")) {
                        $(submenuDivId).addClass("activeMobileMenu");
                    }
                    if (!$HeaderGroup.hasClass("secondLevelMenuSelected")) {
                        $HeaderGroup.addClass("secondLevelMenuSelected");
                    }
                    $(".secondLevelMobileMenu").removeAttr("style");
                    window.selectedLevel2MenuTabId = $this.data("id");
                    window.selectedTopLevelMenuTabIndex = $this.index();
                    setMenuCookie(window.selectedTopLevelMenuTabIndex);
                    //set
                } else if (window.selectedTopLevelMenuTabIndex > 0) {
                    $this.hasClass(openClass) ? openSubMenu($this) : closeSubMenus($this, true);
                } else {
                    if ($this.hasClass(openClass)) {
                        openSubMenu($this);
                        hideAllSiblings($this);
                    } else {
                        closeSubMenus($this, true);
                        showAllSiblings($this);
                        closeChildren($this);
                    }
                }

                if (saveMenuState) {
                    try {
                        window.localStorage.setItem(menuStateStorageKey, getMenuState());
                    } catch (e) {
                        saveMenuState = false;
                    }
                }

                function getMenuState() {
                    return $liListWithDropDown
                        .map(function () {
                            if ($(this).hasClass(openClass)) {
                                return $liListWithDropDown.index($(this));
                            }
                        })
                        .get()
                        .join(",");
                }

                function setScrollPosition(menu) {
                    var menuClientrect = $("#homeMenu")[0].getBoundingClientRect();

                    //scroll to position
                    var top = menuClientrect.top - headerRectBoundingClient.height + $(".am-menu").scrollTop();
                    if (top >= 0) {
                        $(".am-menu").animate({ scrollTop: menu[0].offsetTop });
                    }
                }

                var openMenus = $MobileMenuContentWrap.find("." + openClass);
                if (openMenus.length === 0) {
                    if (mobileMenuScrollTopOnClick) {
                        setTimeout(setScrollPosition($this), 500);
                    }
                }
            }

            if (!shouldDelayMenuRendering) {
                $liListWithDropDown = $MobileMenuContentWrap.find("li.has-dropdown");
            }
            $liListWithDropDown.on("click", menuItemOnClick);

            var menuButton = $("#trigger");
            var mobileSearchTrigger = $("#mobileSearchTrigger");

            $(".MenuCloseActive").on("click", function (e) {
                menuButton.click();
            });
            menuButton.on("click", function (e) {
                e.preventDefault();
                // if filter open, close it.
                if ($("#FilterContainer:visible").length > 0) {
                    $("#mobclsfltrs").click();
                }

                toggleAccordionMenu(e);
            });
            mobileSearchTrigger.on("click", function (e) {
                e.preventDefault();
                toggleAccordionMenu(e);
                $("#MobtxtSearch").focus();
            });

            $(window).resize(function () {
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(function (e) {
                    if (!menuButton.is(":visible")) {
                        if (accordionMenuVisible) {
                            toggleAccordionMenu(e);
                        }
                    }
                }, 500);
            });

            // auto-open mobile menu if querystring present
            if (window.location.search.toLowerCase().indexOf("showmenu=true") > -1) {
                toggleAccordionMenu();
            }

            function toggleAccordionMenu(e) {
                accordionMenuVisible = !accordionMenuVisible;
                if (accordionMenuVisible) {
                    $("body").addClass("body-menu-open");
                    showAccordionMenu(e);
                    menuButton.addClass(openClass);
                } else {
                    $("body").removeClass("body-menu-open");
                    hideAccordionMenu();
                    menuButton.removeClass(openClass);
                }
                $(document).trigger("sd-mob-menu-toggled", accordionMenuVisible);
            }

            setMenuState();

            function openSubMenu(menu) {
                // Populate all the sub-levels
                var isExcluded =
                    menu.is("#liMobileLanguageSelector") ||
                    menu.is(".liMyAccount") ||
                    menu.is("#liMobileCurrencySelector");
                var menuIndex = $liListWithDropDown.index(menu);
                if (shouldDelayMenuRendering && !isExcluded) {
                    populateSubLevels(menuIndex);
                }
                menu.children("li ul").slideDown(animationString, changePosition);
                menu.children("div").children("li ul").slideDown(animationString, changePosition);
                menu.children("div").children("li ul").children("li").slideDown(animationString);

                menu.children("a").find(".glyphicon-chevron-right").addClass("rotate-90");
                menu.children("a.MobMenChevron").addClass("rotate-90");

                //Special case. If the menu is liMobileLanguageSelector, close all open menus that is not liMobileLanguageSelector
                if (isExcluded) {
                    resetAllExcept(menu);
                } else {
                    //find all open items with this menu level.
                    menu.closest("ul")
                        .find("li.open")
                        .not(menu)
                        .each(function () {
                            closeSubMenus($(this), false, menuIndex);
                        });

                    $("li#liMobileLanguageSelector.open")
                        .not(menu)
                        .each(function () {
                            closeSubMenus($(this), false, menuIndex);
                        });
                    $("li#liMobileCurrencySelector.open")
                        .not(menu)
                        .each(function () {
                            closeSubMenus($(this), false, menuIndex);
                        });
                    $("li.liMyAccount.open")
                        .not(menu)
                        .each(function () {
                            closeSubMenus($(this), false, menuIndex);
                        });
                }

                function changePosition() {
                    var ignoreScrollingElement = [
                        "liMobileCurrencySelector",
                        "liMobileLanguageSelector",
                        "mob-myaccount",
                    ];
                    if (jQuery.inArray($(menu[0]).attr("id"), ignoreScrollingElement) !== -1) {
                        var clickedItemTopPosition = $(menu[0]).position().top;

                        $(".am-menu").animate(
                            {
                                scrollTop: clickedItemTopPosition,
                            },
                            animationString,
                            "linear",
                        );
                        return;
                    }
                    if (mobileMenuScrollTopOnClick) {
                        var menuClientrect = menu[0].getBoundingClientRect();
                        // Scroll to position
                        var top = menuClientrect.top - headerRectBoundingClient.height + $(".am-menu").scrollTop();

                        if (top > 0) {
                            $(".am-menu").animate({ scrollTop: 0 });
                        }
                    } else {
                        $(".am-menu").animate(
                            {
                                scrollTop: menu.children("li").first.offsetTop,
                            },
                            animationString,
                            "linear",
                        );
                    }
                }
            }

            function closeSubMenus(menu, scrollToParent, toOpenMenuIndex) {
                var thisMenuIndex = $liListWithDropDown.index(menu);
                if (typeof toOpenMenuIndex != "undefined" && toOpenMenuIndex > thisMenuIndex) {
                    $MobileMenuContentWrap.css("bottom", $MobileMenuContentWrap.css("bottom"));
                    try {
                        closeit(true);
                    } finally {
                        $MobileMenuContentWrap.css("bottom", "auto");
                    }
                } else {
                    closeit();
                }

                function closeit(noAnimation) {
                    if (menu.hasClass(openClass)) {
                        menu.removeClass(openClass);
                    }
                    if (noAnimation) {
                        menu.children("li ul").hide();
                        menu.children("div").children("li ul").hide();
                    } else {
                        menu.children("li ul").slideUp(animationString);
                        menu.children("div").children("li ul").slideUp(animationString);
                    }
                    if (!mobileMenuScrollTopOnClick && scrollToParent) {
                        var nodeToClose = $(menu[0]);
                        if (nodeToClose.hasClass("root")) {
                            // Scroll to top of element
                            $(".am-menu").animate(
                                {
                                    scrollTop: 0,
                                },
                                animationString,
                                "linear",
                            );
                        } else {
                            var nodeParent = nodeToClose.parents("li")[0];
                            if (nodeParent) {
                                $(".am-menu").animate(
                                    {
                                        scrollTop: nodeParent.offsetTop,
                                    },
                                    animationString,
                                    "linear",
                                );
                            }
                        }
                    }

                    menu.children("a").find(".glyphicon-chevron-right").removeClass("rotate-90");
                    menu.children("a.MobMenChevron").removeClass("rotate-90");
                }
            }

            function hideAccordionMenu() {
                var hideAccordionProcess = setTimeout(function () {
                    // Running in separate process to remove lag on animate
                    $mpContainer.removeClass("showAccordianMenu");

                    var newLeft = ($MobileMenuContentWrap[0].getBoundingClientRect().width + 1) * -1;
                    $mpMenu.animate({ left: newLeft }, 500, function () {
                        $mpMenu.hide();
                        updateContentCover();
                    });
                    $footer.css("visibility", "visible");
                    $footer.show();
                    $ContentWrapper.show();

                    // Call the change callbacks
                    for (var i = 0, len = menuChangeCallbacks.length; i < len; i++) menuChangeCallbacks[i](false);

                    clearTimeout(hideAccordionProcess);
                }, 0);
            }

            function showAccordionMenu(e) {
                var showAccordionProcess = setTimeout(function () {
                    // Running in separate process to remove lag on animate
                    $mpContainer.addClass("showAccordianMenu");

                    $mpMenu.show().animate({ left: "0" }, animationString, function () {
                        $("body").removeClass("body-search-open");
                    });

                    updateContentCover(false, true);

                    // Call the change callbacks
                    for (var i = 0, len = menuChangeCallbacks.length; i < len; i++) menuChangeCallbacks[i](true);

                    clearTimeout(showAccordionProcess);
                }, 0);
            }

            function removeChevronRightIfNoChildMenu() {
                $MobileMenuContentWrap
                    .find("li")
                    .not("#liMobileLanguageSelector, #liMobileCurrencySelector")
                    .each(function () {
                        if (!$(this).is(".has-dropdown")) {
                            $(this).find("span.glyphicon-chevron-right").hide();
                        }
                    });
            }

            function resetAllExcept(menuItemToIgnore) {
                $MobileMenuContentWrap
                    .find("li.open")
                    .not(menuItemToIgnore)
                    .each(function () {
                        closeSubMenus($(this), false);
                    });
            }

            function setMenuState() {
                if (!saveMenuState) return;
                try {
                    var menuState = window.localStorage.getItem(menuStateStorageKey);
                    if (menuState != "undefined" && menuState != null) {
                        $(menuState.split(",")).each(function () {
                            $($liListWithDropDown.get(this)).trigger("click");
                        });
                    }
                } catch (e) {
                    saveMenuState = false;
                }
            }

            function initAccordionMenu() {
                removeChevronRightIfNoChildMenu();

                //hide all menus to start with
                $MobileMenuContentWrap.find("ul").hide();
                $MobileMenuContentWrap.find(".menulevelheader").hide();
                $MobileMenuContentWrap.find(".mp-back").hide();
                $MobileMenuContentWrap.find("#spanLanguageHeaderMob").hide();
                $("#liMobileCurrencySelector").find(".mp-back").hide();
                $("#liMobileCurrencySelector").find("#spanCurrencyHeaderMob").hide();

                //change classes so that standard menu styles dont kick in.
                $mpContainer
                    .removeClass("mp-container")
                    .addClass("am-container")
                    .find(".mp-pusher")
                    .removeClass("mp-pusher")
                    .addClass("am-pusher")
                    .find(".mp-menu")
                    .removeClass("mp-menu")
                    .addClass("am-menu")
                    .find(".mp-level")
                    .removeClass("mp-level")
                    .addClass("am-level");

                $("li span.MobMenIcon.glyphicon.glyphicon-user").closest("li.has-dropdown").addClass("liMyAccount");

                $mpMenu
                    .css("left", -5000)
                    .css("top", headerRectBoundingClient.height)
                    .css("z-index", $HeaderGroup.css("z-index"));

                //show only first level
                $MobileMenuContentWrap.children("ul").show();
                $MobileMenuContentWrap.find("div.shop").children("ul").show();
                $MobileMenuContentWrap.find("div.shop").children("ul").show();
                $MobileMenuContentWrap.find("div#divCurrencyLanguageMobile").children("ul").show();
            }

            function shouldSaveMenuState() {
                var homeMenu = $("ul#homeMenu[data-saveMenuState]");
                if (homeMenu.length > 0) {
                    return homeMenu.length ? homeMenu.attr("data-saveMenuState") === "true" : false;
                }

                return false;
            }

            // When you click on the menu newsletter the keyboard covers the input
            // box.
            if ($(".MobileMenuContentWrap #menuNewsletter").length > 0) {
                $("#menuNewsletter").focusin(function () {
                    setTimeout(function () {
                        $(".am-menu").animate({ scrollTop: $(".am-level").height() }, animationString, "linear");
                    }, 500);
                });
            }

            return {
                init: initAccordionMenu,
                toggle: toggleAccordionMenu,
                show: showAccordionMenu,
                hide: hideAccordionMenu,
                onclick: menuItemOnClick,
            };
        }
    }

    function getMenuPromos() {
        if (desktopMenuData == null) return;
        if (isCmsMenuEnabled) return;
        var data = desktopMenuData.Adverts;
        if (data != null) {
            for (var i = 0; i < data.length; i++) {
                var currentnode = data[i];
                var leftads = renderElements(currentnode.Left);
                var rightads = renderElements(currentnode.Right);
                var centerads = renderElements(currentnode.Center);
                var topads = renderElements(currentnode.Top);
                var bottomads = renderElements(currentnode.Bottom);
                if (leftads != "") {
                    $("." + currentnode.LocationClass + "Left").data("content", leftads);
                } else {
                    $("." + currentnode.LocationClass + "Left").css("display", "none");
                }
                if (rightads != "") {
                    $("." + currentnode.LocationClass + "Right").data("content", rightads);
                } else {
                    $("." + currentnode.LocationClass + "Right").css("display", "none");
                }
                if (centerads != "") {
                    $("." + currentnode.LocationClass + "Center").data("content", centerads);
                } else {
                    $("." + currentnode.LocationClass + "Center").css("display", "none");
                }
                if (topads != "") {
                    $("." + currentnode.LocationClass + "Top").data("content", topads);
                } else {
                    $("." + currentnode.LocationClass + "Top").css("display", "none");
                }
                if (bottomads != "") {
                    $("." + currentnode.LocationClass + "Bottom").data("content", bottomads);
                } else {
                    $("." + currentnode.LocationClass + "Bottom").css("display", "none");
                }
            }
            promosRequested = true;
        }
        initPickers();
    }

    function renderElements(elements) {
        var html = "";
        for (var i = 0; i < elements.length; i++) {
            var template = elements[i].Template;
            var menuElementTemplate = window.Handlebars.compile(template);
            html = html.concat(menuElementTemplate(elements[i]));
        }
        return html;
    }

    function initPickers() {
        if ($(".Picker.tabs").length > 0) {
            var tablinks = $(".Picker.tabs > div > ul > li > a");
            for (var i = 0; i < tablinks.length; i++) {
                $("#" + tablinks[i].href.split("#")[1]).appendTo(".Picker.tabs > .PickerRight");
            }
            $(".Picker.tabs").tabs({ event: "mouseover" }).addClass("ui-tabs-vertical ui-helper-clearfix");
            $(".Picker.tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");

            $(".Picker.tabs > div > ul > li > a").on("click", function (e) {
                if (!isTouchDevice()) {
                    e.preventDefault();
                    window.location.href = this.dataset["item"];
                }
            });
        }
    }

    function populateSubLevels(index) {
        if (!shouldDelayMenuRendering) return;
        // Compile the sublevel template
        if (!subLevelsDone) {
            subMenuTemplate = window.Handlebars.compile(mobilesubtemplate);
        }
        // For each existing menu shop node
        $.each(mobileMenuData.Nodes, function (i, node) {
            // Not the requested menu
            if (index !== null && index !== undefined && index !== i) return;
            var $li = $("#mob-" + node.Name.toLowerCase());
            // Already done?
            if ($li.find("li").length > 0) return;
            $li.addClass("root");
            if (node.hasDropdown) {
                $li.addClass("mmHasChild");
                // Handlebars for the menu children
                var menudata = {
                    nodes: node.Children,
                    Url: node.Url,
                    Text: node.Text,
                    HTML: node.HTML,
                    backbutton: mobileMenuData.BackButtonText,
                    viewAllButton: mobileMenuData.MobileViewAllText,
                    showViewAllButton: !!node.Url,
                };
                var levelHtml = subMenuTemplate(menudata);

                var targetDiv = "";
                var $childEls = null;
                if ($li.hasClass("persistentLevel2Selection")) {
                    var dataId = $li.data("id");
                    targetDiv = $("#divSubMenu_" + dataId);
                    targetDiv.html(levelHtml);
                    $(".secondLevelMobileMenu").each(function (i, el) {
                        if (el.id !== $(targetDiv).attr("id")) {
                            $(el).slideUp("slow");
                        }
                    });
                    targetDiv.find("li").each(function (i, el) {
                        if ($(el).hasClass("level1")) {
                            $(el).addClass("level1Active");
                        }
                    });
                    targetDiv.slideDown("slow");
                    $childEls = targetDiv.find("li");
                } else {
                    $li.append(levelHtml);
                    $childEls = $li.find("li");
                }
                bindClickEventForMobileSubMenu($childEls);
                // Bind new click events
            } else {
                $li.children("a").attr("href", node.Url);
            }
        });

        //change classes so that standard menu styles dont kick in.
        var menuStyle = getMenuStyle();
        if (menuStyle === "Accordion") {
            $MobileMenuContentWrap.find(".menulevelheader").hide();
            $MobileMenuContentWrap.find(".mp-back").hide();
        }

        $MobileMenuContentWrap.find("#spanLanguageHeaderMob").hide();
        $(".am-container").find(".mp-level").removeClass("mp-level").addClass("am-level");

        subLevelsDone = true;
    }

    function bindClickEventForMobileSubMenu(subMenuElement) {
        subMenuElement.unbind("click");
        subMenuElement.each(function (i, el) {
            var $el = $(el);
            var menuStyle = getMenuStyle();
            if (menuStyle === "Accordion") {
                $el.click(function (e) {
                    e.stopPropagation();
                    if ($el.hasClass("has-dropdown")) {
                        onclick(e, $el);
                    }
                });
            }
        });
    }

    function setUpTopLinkDropDownMenu() {
        var topLinkDrop = $("nav#topLinkMenu li.TopLinkDrop");
        var submenu = topLinkDrop.find(".TopSubLinkMenu");

        var touch = isTouchDevice();

        if (touch) {
            if (topLinkDrop.hasClass("myaccount")) return;

            topLinkDrop.click(function (e) {
                e.stopPropagation();
                e.preventDefault();

                submenu.toggle();
            });

            submenu.click(function (e) {
                e.stopPropagation();
            });
        } else if (nonMenuLightBoxesEnabled) {
            $("body").on("click", ".languageSelectDiv", function () {
                if (!$(".header-overlay").hasClass("activeOverlay")) {
                    $(".header-overlay").addClass("activeOverlay");
                }
            });

            $("body").on("click", "#signupEmail", function () {
                if (!$(".footer-overlay").hasClass("activeOverlay")) {
                    $(".footer-overlay").addClass("activeOverlay");
                }
            });

            $("body").on("click", ".header-overlay", function () {
                $("#divCurrencyLanguageSelector").click();
                $(this).removeClass("activeOverlay");
            });

            $("body").on("click", ".footer-overlay", function () {
                $(this).removeClass("activeOverlay");
            });

            $("#divMobSearch, #mobileSearchTriggerBtn").on("click", function () {
                $(this).addClass("mobSearchLightBox");
                if (!$(".mobile-overlay").hasClass("activeOverlay")) {
                    $(".mobile-overlay").addClass("activeOverlay");
                }
            });

            $("body").on("click", ".mobile-overlay", function () {
                $("#divMobSearch").removeClass("mobSearchLightBox");
                $(".mobile-overlay").removeClass("activeOverlay");
            });
        } else {
            topLinkDrop.hover(
                function () {
                    submenu.show();
                },
                function () {
                    submenu.hide();
                },
            );
        }
    }

    var accountDropdown = $(".MenuRightLogin").find(".lillAccounts").length;
    var header = $("header");
    if (accountDropdown) {
        $(".MenuRightLogin")
            .mouseenter(function (e) {
                // lightbox
                if (nonMenuLightBoxesEnabled && !header.hasClass("showLightbox")) {
                    header.addClass("showLightbox");
                }
                header.addClass("activeAccount");
            })
            .mouseleave(function (e) {
                if (nonMenuLightBoxesEnabled) {
                    header.removeClass("showLightbox");
                }
                header.removeClass("activeAccount");
            });
    }

    var _isHamburgerMenuActive;

    function isHamburgerMenuActive() {
        if (_isHamburgerMenuActive == null) {
            _isHamburgerMenuActive = $("#topMenu .NewMenuWrapRemainSpace").length != 0;
        }
        return _isHamburgerMenuActive;
    }

    function handleTopMenuItemClick(forceShow, element, event) {
        // hide all other open menu's first
        element.siblings().each(function () {
            var $sibling = $(this);
            $sibling.removeClass("sdHover");
            $sibling.find("> div:visible").hide();
        });

        var isAutoOpenMenu = element.hasClass(autoOpenMenuClass);

        var newmenu = element.find("> div");
        var rowIsRoot = element.hasClass("root");
        if (newmenu.is(":hidden") || forceShow) {
            if (event) event.preventDefault();
            // slide menu down
            element.addClass("sdHover");
            var isHamburgerMenu = isHamburgerMenuActive();
            if (rowIsRoot && isHamburgerMenu) {
                // select first child.
                newmenu.find(".level1:first").click();
            } /*AutoMenuchanges*/ else {
                if (rowIsRoot && isAutoOpenMenu) {
                    var firstLi = element.find("li:first");
                    if (firstLi.hasClass("mmHasChild")) {
                        element.find(".mmHasChild div.DropdownWrap").each(function () {
                            $(this).hide();
                        });
                        firstLi.click();
                    }
                }
            } /*AutoMenuchanges end*/
            newmenu.show();
        } else {
            if (rowIsRoot && isHamburgerMenu) {
                element.removeClass("sdHover");
                newmenu.hide();
            }
        }
        updateContentCover();
    }

    function setMenuIntent() {
        var isHamburgerMenu = isHamburgerMenuActive();

        var menuAimLevel1Config = {
            activate: megaHoverOver,
            deactivate: megaHoverOut,
            rowSelector: "> li.root",
            submenuDirection: "below",
            submenuSelector: ".NewMenuWrap, .SubMenuWrapper",
            delayInitialOpen: true,
            exitMenu: function () {
                return true;
            },
        };

        $("nav#topMenu .RootGroup").menuAim(menuAimLevel1Config);
        var level2Submenudirection = "below";
        //If it's the hamburger menu
        if (isHamburgerMenu) {
            level2Submenudirection = "right";
        }
        var menuAimLevel2Config = {
            activate: megaHoverOver,
            deactivate: megaHoverOut,
            rowSelector: "> li",
            submenuDirection: level2Submenudirection,
            submenuSelector: ".DropdownWrap",
        };
        $(".LinkLevel2 > ul").menuAim(menuAimLevel2Config);

        $(".persistentLevel2Selection .level1").on("mouseover", function () {
            $(".level1").removeClass("sdHover");
            $(this).addClass("sdHover");
            updateContentCover();
        });
        $(".persistentLevel2Selection .level1").on("mouseout", function () {
            updateContentCover();
            $(".level1").removeClass("sdHover");
        });
        setDropdownWrapLeftVal();
        preventNavigateForEmptyLinks();
    }

    function setupSideBarSubmenu() {
        var touch = isTouchDevice();
        var topMenuWrapper = $("#topMenuWrapper");
        var sidebarSubMenu = topMenuWrapper.find(".sidebarSubMenu");
        if (sidebarSubMenu.length == 0) return;
        sidebarSubMenu.on("mouseenter", function () {
            sidebarSubMenu
                .find("ul.open")
                .removeClass("open")
                .parent()
                .removeClass("activeItem")
                .removeClass("sdHover");
            sidebarSubMenu
                .find("li.mmHasChild.level1")
                .first()
                .find("ul")
                .addClass("open")
                .parent()
                .addClass("activeItem");
            setTimeout(setSideBarSubMenuHeight, 300);
        });

        topMenuWrapper.on("mouseleave", function () {
            sidebarSubMenu.find("ul.open").removeClass("open");
            sidebarSubMenu.find("li.mmHasChild").removeClass("activeItem");
            sidebarSubMenu.find("li.mmHasChild.level1:first-of-type ul").addClass("open");
            setSideBarSubMenuHeight();
        });

        if (touch) {
            sidebarSubMenu.find("li.mmHasChild.level1 > a").on("touchstart", function (e) {
                sidebarSubMenu.find("li.mmHasChild").removeClass("activeItem");
                $(this).parent().addClass("activeItem");
                if (!$(this).parent().hasClass("sdHover")) {
                    sidebarSubMenu.find("ul.open").removeClass("open");
                    $(this).closest(".level1").find("ul").first().addClass("open");
                    sidebarSubMenu.find("li.mmHasChild").removeClass("sdHover").removeClass("activeItem");
                    $(this).parent().addClass("sdHover").addClass("activeItem");
                    e.preventDefault();
                }
            });
        } else {
            var sideBarItemHoverTimeout;
            topMenuWrapper.on("mouseenter", ".level1 > a", function () {
                clearSideBarItemHoverTimeout();
                var item = this;
                //set timeout
                sideBarItemHoverTimeout = setTimeout(function () {
                    var level = $(item).closest(".level1");
                    sidebarSubMenu.find("ul.open").removeClass("open");
                    level.find("ul").first().addClass("open");
                    sidebarSubMenu.find("li.mmHasChild").removeClass("activeItem");
                    $(item).parent().addClass("activeItem");
                    setSideBarSubMenuHeight();
                }, 300);
            });
            topMenuWrapper.on("mouseleave", ".level1 > a", function () {
                //remove timeout
                clearSideBarItemHoverTimeout();
            });
        }

        function clearSideBarItemHoverTimeout() {
            if (sideBarItemHoverTimeout) {
                clearTimeout(sideBarItemHoverTimeout);
            }
        }

        function setSideBarSubMenuHeight() {
            var wrapper = sidebarSubMenu.find(".SubMenuWrapper");
            var subMenu = sidebarSubMenu.find("ul.open");
            if (wrapper.height() < subMenu.height() + 75) {
                wrapper.css("height", subMenu.height() + 75);
            } else {
                wrapper.css("height", "auto");
            }
        }
    }

    function preventNavigateForEmptyLinks() {
        $("#topMenuWrapper a[href='']").click(function (e) {
            e.preventDefault();
        });
    }

    function setDropdownWrapLeftVal() {
        if ($("#topMenu").length != 0) {
            // set full width dropdown left values
            var leftVal = $("#topMenu").offset().left;
            var widthVal = $("#topMenu").outerWidth();
            //incase of megavaluedirect use remaining width
            if ($("#topMenu .NewMenuWrapRemainSpace").length !== 0) {
                widthVal = $("#topMenu .RootGroup").outerWidth() - $("#topMenu .NewMenuWrap").outerWidth();
            }
            $(".DropdownWrap").each(function () {
                if ($(this).parent().hasClass("AutoWidth")) {
                    $(this).css({
                        left: "auto",
                        width: "auto",
                    });
                } else {
                    $(this).css({
                        left: leftVal,
                        width: widthVal,
                    });
                }
            });
        }
    }

    function renderAds(menu) {
        //Put the pre-rendered html in
        $(menu)
            .find(".Left, .Right, .Center, .Top, .Bottom")
            .each(function () {
                var $this = $(this);
                var content = $this.data("content");
                if (typeof content == "string") {
                    $this.prepend(content);
                    $this.data("content", null);
                }
            });
    }

    var megaHoverOverTimeOut = null;

    function clearMegaTimeout() {
        if (megaHoverOverTimeOut) {
            clearTimeout(megaHoverOverTimeOut);
        }
    }

    //On Hover Over
    function megaHoverOver(row, waitMs) {
        if (!autoclosemenuonhoverout && row) {
            $(row)
                .siblings()
                .each(function () {
                    var elem = $(this);
                    var newmenu = elem.find("> div");
                    elem.removeClass("sdHover");
                    if (elem.hasClass("sdHoverLevel2Selection")) {
                        elem.removeClass("sdHoverLevel2Selection");
                        $("#Body").removeClass("activeMenuHover");
                    }
                    newmenu.hide();
                });
            $("body").addClass("body-menu-open");
        }

        clearMegaTimeout();
        var $row = $(row);
        var timeOutMs = 0;

        if (typeof waitMs !== "undefined") {
            timeOutMs = waitMs;
        } else if ($row.hasClass("root")) {
            timeOutMs = 0;
        } else if ($row.closest("." + autoOpenMenuClass).length > 0) {
            timeOutMs = 300;
            $row.on("mouseout", function () {
                if ($row.data("clearTimeOut") === true) {
                    clearMegaTimeout();
                    $row.data("clearTimeOut", false);
                }
            });
        }

        $row.data("clearTimeOut", true);

        megaHoverOverTimeOut = setTimeout(function () {
            // decide which menu type
            var touch = isTouchDevice();
            var $body = $("#Body");
            if (!touch) {
                if (!$row.hasClass("persistentLevel2Selection")) {
                    $row.addClass("sdHover");
                } else {
                    $row.addClass("sdHoverLevel2Selection");
                    $body.addClass("activeMenuHover");
                }
                //AutoMenuchanges
                if ($row.closest("." + autoOpenMenuClass).length > 0) {
                    //check if we need to close any menu
                    var siblingsToClose = $row.siblings(".sdHover").not($row);
                    if (siblingsToClose.length > 0) {
                        siblingsToClose.each(function (i, v) {
                            megaHoverOut(this);
                        });
                    }
                }

                if ($row.hasClass(autoOpenMenuClass)) {
                    var firstLi = $row.find("ul li.mmHasChild.level1:first");
                    megaHoverOver(firstLi, 0);
                }
                //AutoMenuchanges End

                if ($row.hasClass("mmHasChild")) {
                    var newmenu = $row.find("> div");
                    // new menu; need to check if root or level
                    if ($row.hasClass("root") && isHamburgerMenuActive()) {
                        // select first child.
                        megaHoverOver(newmenu.find(".level1:first"));
                    }
                    renderAds(row);
                    newmenu.show();
                    setOffset(newmenu); // check if menu is going to fit in window and move if needed
                }
                updateContentCover();
            } else {
                renderAds(row);
            }
        }, timeOutMs);
    }

    //On Hover Out
    function megaHoverOut(row) {
        clearMegaTimeout();
        var $row = $(row);
        var $body = $("#Body");
        var touch = isTouchDevice();
        if (!touch) {
            //AutoMenuchanges
            if (!$row.hasClass(autoOpenMenuClass)) {
                var autoOpenMenu = $row.closest("." + autoOpenMenuClass);
                if (autoOpenMenu.length > 0) {
                    if (autoOpenMenu.hasClass("sdHover")) {
                        var openSiblings = $row.siblings(".sdHover").not($row);
                        if (openSiblings.length === 0) {
                            return;
                        }
                    }
                }
            }
            //AutoMenuchanges End
            if (autoclosemenuonhoverout) {
                var newmenu = $row.find("> div");
                $row.removeClass("sdHover");
                if ($row.hasClass("sdHoverLevel2Selection")) {
                    $row.removeClass("sdHoverLevel2Selection");
                    $body.removeClass("activeMenuHover");
                }
                newmenu.hide();
            }
        }
        if (IsDesktopView() || IsTabletView()) {
            updateContentCover();
        }
    }

    function cacheContentPosition() {
        const contentWrapperRect = contentWrapper.getBoundingClientRect();
        contentOffset = {
            top: contentWrapperRect.top + window.scrollY,
            left: contentWrapperRect.left + window.scrollX,
        };
    }

    function updateContentCover(explicitClose, explicitOpen) {
        if (!contentWrapper) {
            return;
        }

        const hiddenClass = "is_hidden";
        const overlayActiveClass = "activeOverlay";
        const bodyWrapper = document.querySelector(".BodyWrap");
        const coverMarkup = `<div class="modal-backdrop in is_hidden" id="MenuOpenContentCover"></div>`;

        let contentCover = document.getElementById("MenuOpenContentCover");

        if (!contentCover) {
            if (explicitClose) {
                return;
            }

            bodyWrapper.append(coverMarkup);
            contentCover = document.getElementById("MenuOpenContentCover");
        }

        contentCover.style.top = contentOffset.top;

        if (explicitOpen && contentCover?.classList.contains(hiddenClass)) {
            contentCover.classList.add(overlayActiveClass);
            contentCover.classList.remove(hiddenClass);

            return;
        }

        // Check again (250ms have passed)
        function toggleActiveOverlay(explicitClose) {
            var desktopVisible =
                $("#topMenu .sdHover:visible").length > 0 ||
                $(".sdHoverLevel2Selection.mmHasChild .mmHasChild:hover ul").length != 0;
            var mobileVisible = IsMobileView() && $("#mp-menu .MobileMenuContentWrap ul:visible").length > 0;
            var showOverlay = (desktopVisible === true || mobileVisible === true) && explicitClose !== true;

            contentCover.classList.toggle(overlayActiveClass, showOverlay);
            contentCover.classList.toggle(hiddenClass, !showOverlay);
        }

        function manageActiveOverlayVisibility(explicitClose) {
            var desktopVisible =
                $("#topMenu .sdHover:visible").length > 0 ||
                $(".sdHoverLevel2Selection.mmHasChild .mmHasChild:hover ul").length != 0;
            var mobileVisible = IsMobileView() && $("#mp-menu .MobileMenuContentWrap ul:visible").length > 0;
            const sdHoverElem = document.querySelector(".sdHover");

            if ((!desktopVisible && !mobileVisible) || explicitClose) {
                setTimeout(function () {
                    toggleActiveOverlay(explicitClose);
                }, 250);
            } else if (
                !explicitClose &&
                contentCover.classList.contains(hiddenClass) &&
                sdHoverElem?.classList.contains("mmHasChild") &&
                $(".persistentLevel2Selection").length == 0
            ) {
                // not a Flannels menu
                contentCover.classList.add(overlayActiveClass);
            } else if ($(".persistentLevel2Selection").length > 0) {
                //Flannels menu
                if ($(".sdHoverLevel2Selection.mmHasChild .mmHasChild:hover ul").length != 0) {
                    contentCover.classList.toggle(overlayActiveClass, true);
                    contentCover.classList.toggle(hiddenClass, false);
                } else {
                    contentCover.classList.toggle(overlayActiveClass, false);
                    contentCover.classList.toggle(hiddenClass, true);
                }
            }
        }

        setTimeout(function () {
            manageActiveOverlayVisibility(explicitClose);
        }, 0);
    }

    function setOffset(subMenu) {
        if (subMenu.length > 0) {
            if (!subMenu.hasClass("DropdownWrap")) {
                var $win = $(window);
                subMenu.css("left", 0); // reset menu offset
                var windowWidth = $win.width();

                var offSet =
                    windowWidth +
                    $win.scrollLeft() -
                    subMenu.outerWidth() -
                    (subMenu.offset().left + $("#topMenu").offset().left);
                if (offSet < 0) {
                    var offSetSpace = subMenu.offset().left - Math.abs(offSet);
                    if (offSetSpace < 0) {
                        offSet = subMenu.offset().left * -1;
                    }
                    subMenu.css("left", offSet);
                }
            }
        }
    }

    function setSelectedLevel2MenuTabId() {
        if (!domReadyDone) return;
        if (window.selectedTopLevelMenuTabIndex > 0) {
            window.selectedLevel2MenuTabId = $("#ulTopLevelMenu > li")
                .eq(window.selectedTopLevelMenuTabIndex - 1)
                .data("id");
        }
    }

    var loginMenu = document.getElementById("loginMenu");
    if (loginMenu && loginMenu.dataset.returnUrl) {
        loginMenu.addEventListener("click", function (e) {
            e.preventDefault();
            var loginUrl = this.href;
            var returnUrl = this.dataset.returnUrl;
            var fullUrl = loginUrl + "?returnurl=" + returnUrl;

            window.location.href = fullUrl;
        });
    }

    var mobLoginMenu = document.getElementById("mobLoginMenu");
    if (mobLoginMenu && mobLoginMenu.dataset.returnUrl) {
        mobLoginMenu.addEventListener("click", function (e) {
            e.preventDefault();
            var loginUrl = this.href;
            var returnUrl = this.dataset.returnUrl;
            var fullUrl = loginUrl + "?returnurl=" + returnUrl;

            window.location.href = fullUrl;
        });
    }

    var wishlistSignInMenu = document.getElementById("wishlistSignInMenu");
    if (wishlistSignInMenu && wishlistSignInMenu.dataset.returnUrl) {
        wishlistSignInMenu.addEventListener("click", function (e) {
            e.preventDefault();
            var loginUrl = this.href;
            var returnUrl = this.dataset.returnUrl;
            var fullUrl = loginUrl + "&returnurl=" + returnUrl;

            window.location.href = fullUrl;
        });
    }

    var wishListLink = document.getElementById("aWishListLink");
    if (wishListLink && wishListLink.dataset.returnUrl) {
        wishListLink.addEventListener("click", function (e) {
            e.preventDefault();
            var loginUrl = this.href;
            var returnUrl = this.dataset.returnUrl;
            var fullUrl = loginUrl + "&returnurl=" + returnUrl;

            window.location.href = fullUrl;
        });
    }

    $(document).ready(function () {
        registerPartials();
        domReadyDone = true;
        setSelectedLevel2MenuTabId();
        processDesktopMenuData();
        processMobileMenuData();
        setTimeout(displayDefaultMenuItemOfMobileMenu, 500);
        $(window).resize(initMenu);

        var touch = isTouchDevice();
        var preventClick = false;

        $("#topMenuWrapper").on("touchstart click", "nav#topMenu .RootGroup > .mmHasChild > a", function (event) {
            if (event.type == "touchstart") {
                if ($(this).parent("li.mmHasChild").length)
                    preventClick = delayRenderingMenu($($(this).parent("li.mmHasChild")[0]).data("id"));
                event.stopPropagation();
            } else if (event.type == "click") {
                if (preventClick) {
                    event.preventDefault();
                    preventClick = false;
                } else if (touch) {
                    var linkParent = $(this).parent("li.mmHasChild");
                    if (!$(linkParent).hasClass("sdHover") && !$(linkParent).hasClass("secondLevelMenuClick")) {
                        event.preventDefault();
                    }
                    $(linkParent).toggleClass("sdHover");
                }
            }
        });

        $("#topMenuWrapper").on("click", "nav#topMenu li.root.mmHasChild, .LinkLevel2 > ul > li", function (event) {
            // stop event bubbling to document to support close when click outside
            event.stopPropagation();

            // if we are on a touch device we need to support click event
            if (touch) {
                handleTopMenuItemClick(false, $(this), event);
            }
        });

        function hideMainMenu(event) {
            // if click on touch device and menu open; prevent any link clicks
            if ($(".sdHover:visible").length != 0) {
                event.preventDefault();
            }

            // close open menu items
            $(
                "nav#topLinkMenu li.TopLinkDrop > div:visible, nav#topMenu li.root.mmHasChild > div:visible, nav#topMenu li.mmHasChild.level1 > div:visible",
            ).hide();
            $(".sdHover").removeClass("sdHover");
            updateContentCover();
        }

        function configureCloseMenuOnTouch() {
            const elements = document.querySelectorAll("#HeaderGroup, #MenuOpenContentCover");
            elements.forEach((el) =>
                el.addEventListener("click", function (e) {
                    if (e.target.id === "trigger") {
                        return;
                    }

                    hideMainMenu(e);
                }),
            );
        }

        function configureCloseMenuOnClick() {
            const elements = document.querySelectorAll("#MenuOpenContentCover, .desktopMenuClose");
            elements.forEach((el) =>
                el.addEventListener("click", function (e) {
                    hideMainMenu(e);
                    document.body.classList.remove("body-menu-open");
                }),
            );
        }

        if (autoclosemenuonhoverout) {
            // support ability to click off menu canvas on touch devices to close menu
            if (useOptimisedMenuClose) {
                if (touch && (!mobileMenuRequested || !window.clickOffClosesMenu)) {
                    configureCloseMenuOnTouch();
                }
            } else {
                $(document).click(function (event) {
                    if (touch) {
                        hideMainMenu(event);
                    }
                });
            }
        } else {
            if (useOptimisedMenuClose) {
                configureCloseMenuOnClick();
            } else {
                $(document).on("click", "#MenuOpenContentCover, .desktopMenuClose", function (event) {
                    hideMainMenu(event);
                    $("body").removeClass("body-menu-open");
                });
            }
        }

        if (menuIsSticky) {
            setUpStickyMenu();
        }

        applyKeyboardNavigation($("#topLinkMenu"), {
            hoverClass: "sdHover",
            rootClass: "TopLink",
            rootHasChildrenClass: "TopLinkDrop",
            subheadingClass: "unused",
            columnGroupClass: "unused",
            bottomRowSpanningAllColumnsClass: "unused",
        });

        applyKeyboardNavigation($("#topMenu"), {
            hoverClass: "sdHover",
            rootClass: "root",
            rootHasChildrenClass: "mmHasChild",
            subheadingClass: "colGroupStart",
            columnGroupClass: "columnGroup",
            bottomRowSpanningAllColumnsClass: "colParentBrand",
        });

        function applyKeyboardNavigation($nav, config) {
            var selectors = {
                rootLi: "li." + config.rootClass, //i.e. li.root
                subHeadingLi: "li." + config.subheadingClass, // i.e. li.colGroupStart
                columnGroupLi: "li." + config.columnGroupClass, // i.e. li.columnGroup
                rootLiWithChildren: "li." + config.rootClass + "." + config.rootHasChildrenClass, //'nav#topMenu li.root.mmHasChild'
                currentHover: "." + config.hoverClass,
            };

            var hoverClass = config.hoverClass,
                bottomRowSpanningAllColumnsClass = config.bottomRowSpanningAllColumnsClass, // single row at the bottom spanning all columns i.e. images of brands
                $rootLinks = $nav.find(selectors.rootLi + ">a"), //'#topMenu li.root>a'
                $subHeadings = $nav.find(selectors.subHeadingLi + ">a"), //'#topMenu li.colGroupStart>a'
                $columnGroups = $nav.find(selectors.columnGroupLi),
                $navLinks = $nav.find("a[href]"),
                $bottomRowSpanningAllColumnsLinks = $nav.find(
                    "." + config.bottomRowSpanningAllColumnsClass + " a[href]",
                ),
                $allLinksWithChildren = $nav.find(selectors.rootLiWithChildren + " a"); //nav#topMenu li.root.mmHasChild a
            var $SecondLevelLinks = $nav.find(".LinkLevel2 > ul > li > a");

            //Add keyboard navigation
            $allLinksWithChildren.focus(function () {
                var $parent = $(this).closest(selectors.rootLiWithChildren);

                // if already expanded, do nothing
                if ($parent.hasClass(hoverClass)) return;

                // otherwise mouseout previous root item and mouseover the current one
                megaHoverOut.call($nav.find(selectors.currentHover));
                megaHoverOver.call($parent);
            });

            $allLinksWithChildren.blur(function () {
                setTimeout(function () {
                    // check if focus on menu
                    var $focused = $(document.activeElement);
                    var $root = $focused.closest(selectors.rootLiWithChildren);

                    // if focus on menu, do nothing
                    if ($root.length > 0) return;

                    // otherwise call mouseout
                    megaHoverOut.call($nav.find(selectors.currentHover));
                }, 100);
            });

            //Add keyboard navigation
            $SecondLevelLinks.focus(function () {
                var $parent = $(this).closest(selectors.rootLiWithChildren);

                // if already expanded, do nothing
                if ($parent.hasClass(hoverClass)) return;

                // otherwise mouseout previous root item and mouseover the current one
                megaHoverOut.call($nav.find(selectors.currentHover));
                megaHoverOver.call($parent);
            });

            $SecondLevelLinks.blur(function () {
                setTimeout(function () {
                    // check if focus on menu
                    var $focused = $(document.activeElement);
                    var $root = $focused.closest(selectors.rootLiWithChildren);

                    // if focus on menu, do nothing
                    if ($root.length > 0) return;

                    // otherwise call mouseout
                    megaHoverOut.call($nav.find(selectors.currentHover));
                }, 100);
            });

            $navLinks.keydown(function (e) {
                var keyCode = e.keyCode || e.which;
                switch (keyCode) {
                    case $.ui.keyCode.ESCAPE:
                        $(document.activeElement).blur();
                        megaHoverOut.call($nav.find(selectors.currentHover));
                        break;

                    case $.ui.keyCode.UP:
                        e.preventDefault();
                        handleVerticalNavigation(this, function (i) {
                            return i - 1;
                        });
                        break;

                    case $.ui.keyCode.DOWN:
                        e.preventDefault();
                        handleVerticalNavigation(this, function (i) {
                            return i + 1;
                        });
                        break;

                    case $.ui.keyCode.LEFT:
                        e.preventDefault();
                        if ($bottomRowSpanningAllColumnsLinks.index(this) > -1) {
                            handleVerticalNavigation(this, function (i) {
                                return i - 1;
                            });
                        } else {
                            handleHorizontalNavigation(this, function (i) {
                                return i - 1;
                            });
                        }
                        break;

                    case $.ui.keyCode.RIGHT:
                        e.preventDefault();
                        if ($bottomRowSpanningAllColumnsLinks.index(this) > -1) {
                            handleVerticalNavigation(this, function (i) {
                                return i + 1;
                            });
                        } else {
                            handleHorizontalNavigation(this, function (i) {
                                return i + 1;
                            });
                        }
                        break;
                }
            });

            function handleVerticalNavigation(focusedLink, indexTransform) {
                var focusedLinkIndex = $navLinks.index(focusedLink);
                var newLinkIndex = indexTransform(focusedLinkIndex);
                if (newLinkIndex < 0 || newLinkIndex >= $navLinks.length) return;
                var $newLink = $navLinks.eq(newLinkIndex);
                $newLink.focus();
            }

            function handleHorizontalNavigation(focusedLink, indexTransform) {
                // if a root menu item is currently focused and we are not the rightmost item
                if (handleHorizontalRootNavigation(focusedLink, indexTransform)) return;

                // subheading in the menu
                if (handleHorizontalSubheadingNavigation(focusedLink, indexTransform)) return;

                handleHorizontalItemNavigation(focusedLink, indexTransform);
            }

            function handleHorizontalRootNavigation(focusedLink, indexTransform) {
                var rootIndex = $rootLinks.index(focusedLink);
                if (rootIndex >= 0) {
                    var newRootIndex = indexTransform(rootIndex);
                    if (newRootIndex >= 0 && newRootIndex < $rootLinks.length) {
                        $rootLinks.eq(newRootIndex).focus();
                    }
                    return true;
                }
                return false;
            }

            function handleHorizontalSubheadingNavigation(focusedLink, indexTransform) {
                var subHeadingIndex = $subHeadings.index(focusedLink);
                if (subHeadingIndex >= 0) {
                    var newSubHeadingIndex = indexTransform(subHeadingIndex);
                    if (newSubHeadingIndex >= 0 && newSubHeadingIndex < $subHeadings.length) {
                        $subHeadings.eq(newSubHeadingIndex).focus();
                    } else {
                        var $root = $(focusedLink).closest(selectors.rootLi).children("a");
                        handleHorizontalNavigation($root, indexTransform);
                    }
                    return true;
                }
                return false;
            }

            function handleHorizontalItemNavigation(focusedLink, indexTransform) {
                var $focusedLink = $(focusedLink);

                var $columnGroup = $focusedLink.closest(selectors.columnGroupLi);
                var columnGroupIndex = $columnGroups.index($columnGroup);
                var newColumnGroupIndex = indexTransform(columnGroupIndex);

                // if there is no next column
                if (
                    $columnGroup.length === 0 ||
                    newColumnGroupIndex < 0 ||
                    newColumnGroupIndex >= $columnGroups.length
                ) {
                    var $root = $focusedLink.closest(selectors.rootLi).children("a");
                    handleHorizontalNavigation($root, indexTransform);
                    return;
                }

                var $children = $columnGroup.find("li:not(" + selectors.subHeadingLi + ")>a");
                var $nextColumnGroup = $columnGroups.eq(newColumnGroupIndex);
                var $nextChildren = $nextColumnGroup.find("li:not(" + selectors.subHeadingLi + ")>a");

                var index = !$nextColumnGroup.find("ul>li").hasClass(bottomRowSpanningAllColumnsClass)
                    ? $children.index($focusedLink)
                    : 0;

                // if the index of children in this column is past that max in the next column
                if (index >= $nextChildren.length) {
                    index = $nextChildren.length - 1;
                }

                // if the next column has no children
                if (index < 0) {
                    handleHorizontalNavigation($columnGroup.children("a"), indexTransform);
                    return;
                }

                var $next = $nextChildren.eq(index);
                $next.focus();
            }
        }

        function setUpStickyMenu() {
            $("#BodyWrap").addClass("sticky-header-applied");
            var lastScrollTopPage = $(window).scrollTop();

            $("#topMenuWrapper").on({
                mouseenter: function () {
                    $("#topMenuWrapper").addClass("menu-interaction");
                },
                mouseleave: function () {
                    $("#topMenuWrapper").removeClass("menu-interaction");
                },
            });

            $(window).scroll(function (e) {
                // If scroll scrolls Refine off top
                if (!$("#topMenuWrapper").hasClass("menu-interaction") || window.innerWidth < 768) {
                    var st = $(this).scrollTop();
                    if (st < stickyMenuScrollTopOffset) {
                        $("#BodyWrap").removeClass("menu-search-shown");
                        $("#BodyWrap").removeClass("menu-search-hidden");
                    } else if (st > 10 && st > lastScrollTopPage + stickyMenuScrollPixelVal) {
                        // downscroll code
                        // Hide menu
                        $("#BodyWrap").removeClass("menu-search-shown");
                        $("#BodyWrap").addClass("menu-search-hidden");
                        lastScrollTopPage = st;
                    } else if (lastScrollTopPage > st + stickyMenuScrollPixelVal) {
                        // on upscroll
                        // if scroll up more than 1px
                        // Show menu
                        $("#BodyWrap").removeClass("menu-search-hidden");
                        $("#BodyWrap").addClass("menu-search-shown");
                        lastScrollTopPage = st;
                    }
                }

                if (window.scrollY === 0) {
                    const bodyWrap = document.getElementById("BodyWrap");
                    bodyWrap.classList.remove("menu-search-hidden");
                }
            });
        }
    });

    function onclick(e, el) {
        if (!mobileMenu) {
            return;
        }
        mobileMenu.onclick(e, el);
    }

    function handleOpen($element) {
        var parent = $element.parent(".panel");
        parent.addClass("active");
        parent.find(".CollapsedMarker").hide();
        parent.find(".OpenMarker").show();
    }

    function handleClose($element) {
        var parent = $element.parent(".panel");
        parent.removeClass("active");
        parent.find(".CollapsedMarker").show();
        parent.find(".OpenMarker").hide();
    }

    //Setup side menu
    $(document).ready(function () {
        try {
            var $sideMenuWrapper = $("#SideMenuWrapper");
            if ($sideMenuWrapper.length == 0) return;
            $sideMenuWrapper
                .on("show.bs.collapse", function (e) {
                    handleOpen($(e.target));
                })
                .on("hide.bs.collapse", function (e) {
                    handleClose($(e.target));
                });

            var currentPath = location.pathname;
            var currentUrl = "//" + location.hostname + currentPath;

            var $openCollapsable;
            var $selectedLink = $sideMenuWrapper.find(
                "a[data-url$='" + currentUrl + "'], a[data-url='" + currentPath + "']",
            );
            if ($selectedLink.length == 0)
                $selectedLink = $sideMenuWrapper.find("a[href$='" + currentUrl + "'], a[href='" + currentPath + "']");

            if ($selectedLink.length != 0) {
                $selectedLink.closest(".panel").addClass("selected");
                $openCollapsable = $selectedLink.closest(".panel-collapse").last();
            } else {
                $openCollapsable = $sideMenuWrapper.find(".panel-collapse").first();
            }
            $openCollapsable.addClass("in");
            handleOpen($openCollapsable);
            $sideMenuWrapper.css("visibility", "visible");
        } catch (ex) {
            console.error(ex);
        }
    });
})(window, window.jQuery);
