(function (window) {
    let printessComponent = null;
    let printessPersonalisationModal = null;
    let printessWindowScrollPos = 0;

    document.addEventListener("DOMContentLoaded", () => {
        initPrintess();
    });

    function initPrintess() {
        const printessContainer = document.querySelector(".printess-container");

        if (!printessContainer) return;

        document.querySelectorAll(".printess-container .printess-button-cta").forEach((button) => {
            button.addEventListener("click", () => {
                const container = button.closest(".printess-container");
                if (handlePdpValidation(container, button)) return;
                showPrintessModal(container);
            });
        });
    }

    function showPrintessModal(container) {
        const printessContainerData = container.dataset;
        const labels = JSON.parse(printessContainerData.printessLabels);
        const printessSaveDetails = printessContainerData.printessSaveDetails
            ? JSON.parse(printessContainerData.printessSaveDetails)
            : null;
        const saveToken = printessSaveDetails?.SaveToken ?? printessSaveDetails?.saveToken;
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);

        printessPersonalisationModal = modalHelper.setupModal({
            modalName: "printess-personalisation-modal",
            titleHtml: labels.filter((x) => x.name == "Personalisation")[0].value,
            cssClass: "printess-personalisation-modal-dialog",
            preventDefaultCloseButtonBehaviour: true,
        });

        if (!printessPersonalisationModal[0].querySelector(".modal-body printess-component")) {
            const modalBody = printessPersonalisationModal[0].querySelector(".modal-body");

            initPrintessPersonalisationComponent(container);

            modalBody.classList.add("printess-loading");

            printessPersonalisationModal[0].querySelector(".close").addEventListener("click", () => {
                closePrintessModal();
            });

            printessPersonalisationModal[0].addEventListener("click", (e) => {
                const outsideModalClicked =
                    e.target.id == "printess-personalisation-modal" && e.target.classList.contains("in");
                if (outsideModalClicked) {
                    closePrintessModal();
                }
            });
        } else if (printessComponent) {
            printessComponent.api.attachAllHandlers();
            const templateName = !!saveToken
                ? saveToken
                : isCartOrWishlist
                ? JSON.parse(printessContainerData.printessData)[0].printessTemplate
                : productDetailsShared.getCurrentColourVariant().PrintessTemplateName;
            printessComponent.api.loadTemplateAndFormFields(
                templateName,
                undefined,
                null,
                null,
                getFormFieldProperties(printessContainerData),
            );
        }

        container.classList.add("printess-editing");
        modalHelper.showModal(printessPersonalisationModal);
        printessWindowScrollPos = window.scrollY;
        preventBodyScrolling();
    }

    function preventBodyScrolling() {
        document.body.style.position = "fixed";
        document.body.style.top = `-${printessWindowScrollPos}px`;
        document.body.style.width = "100%";
    }

    function reAddBodyScrolling() {
        document.body.style.position = "";
        document.body.style.top = ``;
        document.body.style.width = "";

        window.scrollTo(0, printessWindowScrollPos);
    }

    function handlePdpValidation(container, button) {
        const printessContainerData = container.dataset;
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);

        if (isCartOrWishlist) return false;

        const jqButton = $(button);
        const scope = productDetailsShared.getProductScope(jqButton);
        if (productDetailsShared.showSizeRequiredMessage(jqButton, scope)) return true;
    }

    function getSaveRequest(token, thumbnailUrl, variantId, printessFormFields, printessData) {
        let printessPersChildItems = [];
        const formFields = JSON.parse(printessFormFields);

        printessData.forEach((x) => {
            const field = formFields[x.printessFieldName];

            if (!field || (field.type == "checkbox" && field.value == "false") || field.value == "") return;

            let childPersItem = {
                PersProductSku: x.persProductSku,
                FieldName: x.printessFieldName,
                FieldValue: field.value,
                FieldType: field.type,
                FieldUiLabel: field.uiLabel ?? x.printessFieldName,
                IsChargeable: x.isChargeable,
                DisplayOrder: x.displayOrder,
                ConvertedPrice: x.convertedSellingPrice,
                ConvertedFormattedPrice: x.convertedFormattedSellingPrice,
            };

            if (x.isChargePerLetter) {
                childPersItem.Quantity = field.value.length;
            } else {
                childPersItem.Quantity = field.value.length > 0 ? 1 : 0;
            }

            printessPersChildItems.push(childPersItem);
        });

        const saveRequest = {
            VariantId: variantId,
            SaveToken: token,
            ThumbnailUrl: thumbnailUrl,
            PrintessPersChildItems: printessPersChildItems,
        };

        return JSON.stringify(saveRequest);
    }

    function getTranslations(printessContainerData) {
        const labels = JSON.parse(printessContainerData.printessLabels);

        return {
            ui: {
                buttonBasket: labels.filter((x) => x.name == "Apply")[0].value,
                personalisation: labels.filter((x) => x.name == "Personalisation")[0].value,
            },
        };
    }

    function priceChangeCallback(priceInfo) {
        const container = document.querySelector(".printess-container.printess-editing");
        if (!container) return;

        const printessContainerData = container.dataset;
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);
        const printessData = isCartOrWishlist
            ? JSON.parse(printessContainerData.printessData)
            : JSON.parse(printessContainerData.printessData).filter(
                  (x) => x.productCode == productDetailsShared.getCurrentColourVariant().ColVarId,
              );
        const labels = JSON.parse(printessContainerData.printessLabels);
        let totalPersPrice = 0;
        const formFields = priceInfo.priceRelevantFormFields;

        container.setAttribute("data-printess-form-fields", JSON.stringify(formFields));

        printessData.forEach((x) => {
            const field = formFields[x.printessFieldName];
            if (!field) return;

            const isBool = field.type == "checkbox";
            const noOfCharacters = field.value.length;

            if (x.isChargeable) {
                if (isBool) {
                    totalPersPrice += field.value == "true" ? x.convertedSellingPrice : 0;
                } else {
                    if (x.isChargePerLetter) {
                        totalPersPrice += x.convertedSellingPrice * noOfCharacters;
                    } else {
                        totalPersPrice += x.convertedSellingPrice;
                    }
                }
            }
        });

        const legalNoticeHtml = getLegalNoticeHtml(printessContainerData, labels);

        const r = {
            price: `${labels.filter((x) => x.name == "Total")[0].value}: ${_currencyFormatter.FormatCurrencyValue(
                totalPersPrice,
            )}`,
            legalNotice: legalNoticeHtml,
            infoUrl: `<a href="${
                printessContainerData.personalisationHelpUrl
            }" target="_blank" rel="noopener noreferrer">${labels.filter((x) => x.name == "GetDetails")[0].value}</a>`,
        };

        // ** Set price display in printess
        printessComponent.ui.refreshPriceDisplay(r);
    }

    function getLegalNoticeHtml(printessContainerData, labels) {
        const legalNoticeHtml = document.createElement("ul");
        const nonRefundableLabel = document.createElement("li");
        const footballShirtMessagingLabel = document.createElement("li");
        const extraProcessingLabel = document.createElement("li");
        const additionalInfoLabelText = labels.filter((x) => x.name == "AdditionalInfoLabel")[0]?.value ?? null;

        legalNoticeHtml.classList.add("printess-legal-notice");

        nonRefundableLabel.innerText = labels.filter((x) => x.name == "NonRefundable")[0].value;
        footballShirtMessagingLabel.innerText = printessContainerData.footballShirtMessaging;
        extraProcessingLabel.innerText = labels.filter((x) => x.name == "ExtraProcessing")[0].value;

        legalNoticeHtml.appendChild(nonRefundableLabel);

        if (printessContainerData.footballShirtMessaging) {
            legalNoticeHtml.appendChild(footballShirtMessagingLabel);
        }

        legalNoticeHtml.appendChild(extraProcessingLabel);

        if (additionalInfoLabelText) {
            var additionalInfoLabel = document.createElement("li");

            additionalInfoLabel.innerText = additionalInfoLabelText;
            additionalInfoLabel.classList.add('printess-additional-info-label')
            legalNoticeHtml.appendChild(additionalInfoLabel);
        }

        return legalNoticeHtml.outerHTML;
    }

    function addToBasketCallback(token, thumbnailUrl) {
        const container = document.querySelector(".printess-container.printess-editing");
        const printessContainerData = container.dataset;
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);
        const variantId = isCartOrWishlist
            ? container.closest("[data-product-line-item]").getAttribute("data-productid")?.substring(0, 8)
            : productDetailsShared.getCurrentColourVariant().ColVarId;
        const printessData = JSON.parse(printessContainerData.printessData).filter((x) => x.productCode == variantId);
        const printessFormFields = container.getAttribute("data-printess-form-fields");
        const saveRequest = getSaveRequest(token, thumbnailUrl, variantId, printessFormFields, printessData);

        container.setAttribute("data-printess-save-details", saveRequest);

        if (isCartOrWishlist) {
            //trigger a cart update
            const productLineCard = container.closest("[data-product-line-item]");
            const lineItemIsWishlist = productLineCard.getAttribute("data-is-wishlist").toLowerCase() === "true";

            window.ProductLineItem.updateLineItem(productLineCard, lineItemIsWishlist);
        } else {
            container.classList.add("personalisation-applied");

            const pdpPersonalisedContainerTemplateClass = "printess-pdp-personalised-container-template";
            const pdpPersonalisedContainerInDom = container.querySelector(
                `.printess-pdp-personalised-container:not(.${pdpPersonalisedContainerTemplateClass})`,
            );
            const pdpPersonalisedContainer = container
                .querySelector(`.${pdpPersonalisedContainerTemplateClass}`)
                .cloneNode(true);
            const pdpPersonalisedEditButton = pdpPersonalisedContainer.querySelector("[data-pdp-edit-personalisation]");
            const pdpPersonalisedRemoveButton = pdpPersonalisedContainer.querySelector(
                "[data-pdp-remove-personalisation]",
            );
            const prices = JSON.parse(saveRequest).PrintessPersChildItems.map((x) => x.ConvertedPrice * x.Quantity);
            const total = prices.reduce((sum, price) => sum + price, 0);
            const convertedTotal = _currencyFormatter.FormatCurrencyValue(total);

            pdpPersonalisedContainer.classList.remove(pdpPersonalisedContainerTemplateClass);
            pdpPersonalisedContainer.querySelector("[data-pdp-total-value]").innerHTML = convertedTotal;

            if (pdpPersonalisedContainerInDom) {
                pdpPersonalisedContainerInDom.remove();
            }

            container.append(pdpPersonalisedContainer);

            pdpPersonalisedEditButton.addEventListener("click", () => {
                showPrintessModal(container);
            });
            pdpPersonalisedRemoveButton.addEventListener("click", () => {
                clearPersonalisation(container);
            });
        }

        closePrintessModal();
    }

    function clearPersonalisation(container) {
        container.setAttribute("data-printess-save-details", "null");
        container
            .querySelector(".printess-pdp-personalised-container:not(.printess-pdp-personalised-container-template)")
            .remove();
        container.classList.remove("personalisation-applied");
    }

    function closePrintessModal() {
        const container = document.querySelector(".printess-container.printess-editing");

        reAddBodyScrolling();
        printessComponent?.api.detachAllHandlers();
        modalHelper.hideModal(printessPersonalisationModal);
        container?.classList.remove("printess-editing");
    }

    function getFormFieldProperties(printessContainerData) {
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);
        const formFields = isCartOrWishlist
            ? JSON.parse(printessContainerData.printessData)
            : JSON.parse(printessContainerData.printessData).filter(
                  (x) => x.productCode == productDetailsShared.getCurrentColourVariant().ColVarId,
              );
        const fieldProperties = [];
        const allFieldsChargeable = formFields.every((x) => x.isChargeable) ?? false;
        const allFieldsChargedPerLetter = formFields.every((x) => x.isChargePerLetter) ?? false;
        const someFieldsChargedPerLetter = formFields.some((x) => x.isChargePerLetter) ?? false;

        if (printessContainerData.personalisationType) {
            fieldProperties.push({
                name: "PersonalisationType",
                addNew: "label",
                caption: printessContainerData.personalisationType,
                classNames: "printess-personalisation-type",
            });
        }

        if (
            (!allFieldsChargeable && !someFieldsChargedPerLetter) ||
            (allFieldsChargeable && !allFieldsChargedPerLetter)
        )
            return fieldProperties;

        formFields.forEach((x) => {
            const field = {
                name: x.printessFieldName,
                hasPerLetterPricing: x.isChargePerLetter,
                priceDisplay: x.convertedSellingPrice,
                pricePrefix: `+ ${_currencyFormatter.CurrencySymbol}`,
            };

            fieldProperties.push(field);
        });

        return fieldProperties;
    }

    function getPriceCategoryLabels(printessContainerData) {
        const isCartOrWishlist = JSON.parse(printessContainerData.isCartOrWishlist);
        const formFields = isCartOrWishlist
            ? JSON.parse(printessContainerData.printessData)
            : JSON.parse(printessContainerData.printessData).filter(
                  (x) => x.productCode == productDetailsShared.getCurrentColourVariant().ColVarId,
              );
        const priceCategories = {};

        formFields.forEach((x) => {
            if (x.isChargeable && !x.isChargePerLetter) {
                priceCategories[x.printessFieldName] = _currencyFormatter.FormatCurrencyValue(x.convertedSellingPrice);
            }
        });

        return priceCategories;
    }

    function initPrintessPersonalisationComponent(container) {
        const printessContainerData = container.dataset;
        const isCartOrWishlist = JSON.parse(printessContainerData?.isCartOrWishlist);
        const editSaveToken = printessContainerData?.saveToken;
        const printessTemplateName = !isCartOrWishlist
            ? productDetailsShared.getCurrentColourVariant().PrintessTemplateName
            : null;
        const shopToken = printessContainerData?.shopToken;
        const printessSaveData =
            printessContainerData?.printessSaveDetails != ""
                ? JSON.parse(printessContainerData.printessSaveDetails)
                : null;
        const saveToken = printessSaveData != null ? printessSaveData.saveToken : editSaveToken;
        const theme = printessContainerData?.printessTemplateTheme;
        const printessEditorUrl = printessContainerData?.printessEditorUrl;
        const templateName = !!saveToken ? saveToken : printessTemplateName;
        const translations = getTranslations(printessContainerData);
        const formFieldProperties = getFormFieldProperties(printessContainerData);
        const priceCategoryLabels = getPriceCategoryLabels(printessContainerData);
        const modalBody = printessPersonalisationModal[0].querySelector(".modal-body");

        printessLoader
            .load({
                basketId: dataLayerData.visitorId,
                container: modalBody,
                mergeTemplates: [],
                formFields: [],
                offensiveCheckAll: true,
                templateName: `${templateName}`,
                formFieldProperties: formFieldProperties,
                priceCategoryLabels: priceCategoryLabels,
                token: `${shopToken}`,
                theme: theme,
                suppressLoadingAnimation: true,
                translationKey: "en",
                translations: translations,
                resourcePath: printessEditorUrl,
                noUserInteractionOnStage: true,
                priceChangeCallback: (priceInfo) => {
                    priceChangeCallback(priceInfo);
                },
                addToBasketCallback: (token, thumbnailUrl) => {
                    addToBasketCallback(token, thumbnailUrl);
                },
            })
            .then((component) => {
                printessComponent = component;
                setTimeout(() => {
                    modalBody.classList.remove("printess-loading");
                }, 500);
            });
    }

    function isPersonalisationApplied(parentEl) {
        const printessContainer = parentEl.querySelector(".printess-container");

        if (!printessContainer) return false;

        const isPersonalisationApplied =
            printessContainer.getAttribute("data-printess-save-details") != "null" ?? false;
        return isPersonalisationApplied;
    }

    function handleColourHoverEnterPrintessPdp(parentEl) {
        if (!isPersonalisationApplied(parentEl)) return;
        parentEl.querySelector(".printess-container")?.classList.remove("personalisation-applied");
    }

    function handleColourHoverLeavePrintessPdp(parentEl) {
        if (!isPersonalisationApplied(parentEl)) return;
        parentEl.querySelector(".printess-container")?.classList.add("personalisation-applied");
    }

    function handleColourChangedPrintessPdp(parentEl) {
        if (!isPersonalisationApplied(parentEl)) return;

        const printessContainer = parentEl.querySelector(".printess-container");
        printessContainer.setAttribute("data-printess-save-details", "null");
        printessContainer.classList.remove("personalisation-applied");
        printessContainer
            .querySelector(".printess-pdp-personalised-container:not(.printess-pdp-personalised-container-template)")
            .remove();
    }

    function resetPrintessPersonalisation() {
        const container = document.querySelector(".printess-container.personalisation-applied");

        if (!container) return;

        clearPersonalisation(container);
    }

    window.Printess = {
        initPrintess: initPrintess,
        handleColourHoverEnterPrintessPdp: handleColourHoverEnterPrintessPdp,
        handleColourHoverLeavePrintessPdp: handleColourHoverLeavePrintessPdp,
        handleColourChangedPrintessPdp: handleColourChangedPrintessPdp,
        resetPrintessPersonalisation: resetPrintessPersonalisation,
    };
})(window);
