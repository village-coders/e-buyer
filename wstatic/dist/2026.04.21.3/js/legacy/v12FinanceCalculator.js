var v12fin = {
    // Get a list of your products and pop them into a dropdownlist
    GetProducts: function (data) {
        if (!data) {
            data = $("#viewFinanceLinkWrapper").data("finproducts");
            if (!data) {
                data = $("#financeOptionsGenericWrapper").data("finproducts");
            }
        }
        var products = V12.getFinanceProducts(data);
        var ddlProducts = document.getElementById("productsList");
        for (var i = 0; i < products.length; i++) {
            var newItem = new Option(products[i].name, products[i].productId);
            ddlProducts.appendChild(newItem);
        }
    },
    // Get details of repayments for the product selected
    CalculateRepayments: function (cashPrice, depositFactor) {
        var productId = $("#productsList").val(); // selected product
        if (!productId || productId == null) return;

        var financeProduct = V12.getFinanceProduct(productId); // get the object
        if (!cashPrice) cashPrice = $("#cashPrice").val();
        if (!depositFactor) {
            depositFactor = $("#viewFinanceLinkWrapper").data("deposit");
            if (!depositFactor) {
                depositFactor = $("#financeOptionsGenericWrapper").data("deposit");
            }
        }

        if (!depositFactor) depositFactor = $("#deposit").val();

        //	var deposit = cashPrice * (depositFactor / 100);					// 9/1/2018 V12
        var deposit = parseInt(Math.ceil(cashPrice * depositFactor)) / 100; // 9/1/2018 V12
        deposit = parseFloat(deposit.toFixed(2)); // 9/1/2018 V12

        var payments = V12.calculate(financeProduct, cashPrice, deposit);

        this.SetPaymentData(payments.productId, payments.deposit);

        this.PopulateDescription(payments);
    },
    SetPaymentData: function (productId, deposit) {
        $("input#FinanceProductId").val(productId);
        $("input#FinanceDepositAmount").val(deposit);
    },
    UpdateLoanInfo: function (amount) {
        if ($("#deposit") && $("#depRange")) $("#deposit").val($("#depRange").val());
        this.CalculateRepayments(amount);
    },
    // Show repayment plan details in the description
    PopulateDescription: function (payments) {
        $("#lblCashPrice").html("Total cash price: &pound;" + payments.cashPrice + ". ");

        if (payments.deposit > 0) {
            $("#lblDeposit").html("&pound;" + payments.deposit + " deposit. ");
            $("#lblDeposit").css("display", "");
            $("#loanDeposit").val(payments.deposit);
            $("#finProductId").val(payments.productId);
            $("input[name=Deposit]", "form").val(payments.deposit);
            $("input[name=ProductId]", "form").val(payments.productId);
            /****** Calculator Begin *******************/
            $("#calcDeposit").text(payments.deposit);
            $("#calcApr").text((payments.apr == 0 ? 0 : payments.apr) + "%");
            $("#calcMonthlyPayment").text(payments.initialPayments);
            if (payments.initialPayments != payments.finalPayment && payments.finalPayment > 0) {
                $("#calcFinalPayment").text(payments.finalPayment).parents("tr").css("display", "");
            } else {
                $("#calcFinalPayment").parents("tr").css("display", "none");
            }
            $("#calcCashPrice").text(payments.cashPrice);
            $("#calcDepositToPay").text(payments.deposit);
            $("#calcLoanAmount").text(payments.loanAmount);
            $("#calcLoanRepayment").text(payments.loanAmount);
            $("#calcCostOfLoan").text(payments.interest);
            $("#calcTotalAmountPayable").text(payments.amountPayable);
            $("#calcNumberOfMonth").text(payments.months);

            /****** Calculator End ***************/
        } else {
            $("#lblDeposit").css("display", "none");
            $("#loanDeposit").val(0);
            $("#finProductId").val(0);
            $("input[name=Deposit]", "form").val(0);
            $("input[name=ProductId]", "form").val(0);
        }

        $("#lblAmountCredit").html("Amount of credit: &pound;" + payments.loanAmount + ". ");

        var repayableText = "";
        if (payments.monthsDeferred > 0) {
            repayableText = "Non-payment period " + payments.monthsDeferred + " months, followed by ";
        } else {
            repayableText = "Repayable by ";
        }

        if (payments.initialPayments != payments.finalPayment && payments.finalPayment > 0) {
            repayableText +=
                payments.months -
                1 +
                " monthly repayments of &pound;" +
                payments.initialPayments +
                " and a final payment of &pound;" +
                payments.finalPayment +
                ". ";
        } else {
            repayableText += payments.months + " monthly repayments of &pound;" + payments.initialPayments + ". ";
        }

        $("#lblRepayable").html(repayableText);

        $("#lblApr").html("Representative APR " + payments.apr + "%. ");

        $("#lblAnnualRate").html("Annual rate of interest " + payments.annualRate + "% fixed. ");

        if (payments.documentFee > 0) {
            $("#lblArrangementFee").html("Arrangement fee &pound;" + payments.documentFee + ". ");
            $("#lblArrangementFee").css("display", "");
        } else {
            $("#lblArrangementFee").css("display", "none");
        }

        if (payments.settlementFee > 0) {
            $("#lblSettlementFee").html("Settlement fee &pound;" + payments.settlementFee + ". ");
            $("#lblSettlementFee").css("display", "");
        } else {
            $("#lblSettlementFee").css("display", "none");
        }

        $("#lblTotalRepayable").html(
            "Total amount repayable &pound;" +
            payments.amountPayable +
            " including total interest of &pound;" +
            payments.interest +
            ".",
        );

        if (payments.monthsDeferred > 0 && payments.name.indexOf("Buy Now Pay Later") >= 0) {
            $("#lblBnpl").html(
                "Buy Now Pay Later Option: If you pay the amount of credit plus the settlement fee of &pound;" +
                payments.settlementFee +
                " by the end of the non-payment period, you will pay no interest. If you have not paid the amount of credit in full before the end of the non-payment period the &pound;" +
                payments.settlementFee +
                " fee will not be payable but interest (at the rate specified above) will be charged on the outstanding credit amount, from the date we told you your agreement was live.",
            );
            $("#lblBnpl").css("display", "");
        } else {
            $("#lblBnpl").css("display", "none");
        }
    },
    AmountMeetsMinimumPurchaseAmount: function (amount, minDepositPercent, financeProducts) {
        var ret = {};
        ret.amountIsAllowedForFinance = false;
        ret.financeProductIdWithLongestRepayment = undefined;
        ret.qualifyingProducts = [];

        if (!(minDepositPercent > 0) || !(financeProducts.length > 0))
            return ret;

        $.each(financeProducts, function () {
            const minAllowed = this.minLoan + Math.ceil(this.minLoan / minDepositPercent);
            const maxAllowed = this.maxLoan + Math.floor(this.maxLoan / minDepositPercent);
            if (amount >= minAllowed && amount <= maxAllowed)
                ret.qualifyingProducts.push(this);
        });

        if (ret.qualifyingProducts.length === 0)
            return ret;

        const productWithLowestMinLoan = ret.qualifyingProducts.reduce(function (previous, current) {
            return (previous && previous.months > current.months) ? previous : current;
        });

        const productWithHighestLoanAmount = ret.qualifyingProducts.reduce(function (previous, current) {
            return (previous && previous.maxLoan > current.maxLoan) ? previous : current;
        });

        const minimumAllowedAmount = productWithLowestMinLoan.minLoan + Math.ceil(productWithLowestMinLoan.minLoan / minDepositPercent);
        const maximumAllowedAmount = productWithHighestLoanAmount.maxLoan + Math.floor(productWithHighestLoanAmount.maxLoan / minDepositPercent);
        ret.amountIsAllowedForFinance = amount >= minimumAllowedAmount && amount <= maximumAllowedAmount;
        ret.financeProductIdWithLongestRepayment = productWithLowestMinLoan.productId;
        return ret;
    },
    // Firing this will loop through your V12 products and grab the product with the lowest
    // possible monthly payments.
    GetLowestMonthlyPayments: function (cashPrice, data) {
        if (!data) {
            data = $("#viewFinanceLinkWrapper").data("finproducts");
            if (!data) {
                data = $("#financeOptionsGenericWrapper").data("finproducts");
            }
        }
        var products = V12.getFinanceProducts(data);
        var lowestMonthlyPayment = 0;
        var lowestMonthlyPaymentProductId = 0;
        var depositFactor = $("#viewFinanceLinkWrapper").data("deposit");
        if (!depositFactor) {
            depositFactor = $("#financeOptionsGenericWrapper").data("deposit");
        }

        for (var i = 0; i < products.length; i++) {
            var product = V12.getFinanceProduct(products[i].productId);
            //var cashPrice = $('#cashPrice').val();

            //		var deposit = cashPrice * (depositFactor / 100);					// 9/1/2018 V12
            var deposit = parseInt(Math.ceil(cashPrice * depositFactor)) / 100; // 9/1/2018 V12
            deposit = parseFloat(deposit.toFixed(2)); // 9/1/2018 V12

            var payments = V12.calculate(product, cashPrice, deposit);
            var monthlyPayment = payments.initialPayments;

            if (parseFloat(lowestMonthlyPayment) > parseFloat(monthlyPayment) || lowestMonthlyPayment == 0) {
                lowestMonthlyPayment = payments.initialPayments;
                lowestMonthlyPaymentProductId = product.productId;
            }
        }

        $("#productsList").val(lowestMonthlyPaymentProductId);
        this.CalculateRepayments(cashPrice);
    },
    GetLinkLowestMonthlyPayment: function (cashPrice, data, depositFactor) {
        if (!data) {
            data = $("#viewFinanceLinkWrapper").data("finproducts");
            if (!data) {
                data = $("#financeOptionsGenericWrapper").data("finproducts");
            }
        }
        var ret = {};
        var products = V12.getFinanceProducts(data);
        var lowestMonthlyPayment = 0;
        var calculatedApr = 0;
        var apr = 0;
        if (!depositFactor) {
            depositFactor = $("#viewFinanceLinkWrapper").data("deposit");
            if (!depositFactor) {
                depositFactor = $("#financeOptionsGenericWrapper").data("deposit");
            }
        }

        for (var i = 0; i < products.length; i++) {
            var product = V12.getFinanceProduct(products[i].productId);
            //		var deposit = cashPrice * (depositFactor / 100);					// 9/1/2018 V12
            var deposit = parseInt(Math.ceil(cashPrice * depositFactor)) / 100; // 9/1/2018 V12
            deposit = parseFloat(deposit.toFixed(2)); // 9/1/2018 V12

            var payments = V12.calculate(product, cashPrice, deposit);
            var monthlyPayment = payments.initialPayments;

            if (parseFloat(lowestMonthlyPayment) > parseFloat(monthlyPayment) || lowestMonthlyPayment == 0) {
                lowestMonthlyPayment = payments.initialPayments;
                calculatedApr = payments.apr;
                apr = product.apr;
            }
        }
        ret.lowestMonthlyPayment = lowestMonthlyPayment;
        ret.calculatedApr = calculatedApr == 0 ? 0 : calculatedApr;
        ret.apr = apr;

        return ret;
    },
    GetMonthlyPayments: function (depositPercent, cashPrice, data) {
        var ret = {};
        var products = V12.getFinanceProducts(data);
        var calculatedApr = 0;
        var apr = 0;
        var depositFactor = depositPercent;

        var product = V12.getFinanceProduct(products[0].productId);
        var deposit = parseInt(Math.ceil(cashPrice * depositFactor)) / 100;
        deposit = parseFloat(deposit.toFixed(2));

        var payments = V12.calculate(product, cashPrice, deposit);
        calculatedApr = payments.apr;
        apr = product.apr;
        ret.lowestMonthlyPayment = payments.initialPayments;
        ret.calculatedApr = calculatedApr == 0 ? 0 : calculatedApr;
        ret.apr = apr;

        return ret;
    },
    Init: function (amount, data) {
        this.GetProducts(data);
        // Show product with lowest monthly repayment ----
        this.GetLowestMonthlyPayments(amount, data);

        $("#productsList")
            .off("change")
            .on("change", function () {
                v12fin.CalculateRepayments(amount);
            });
        $("#depRange")
            .off("input")
            .on("input", function () {
                v12fin.UpdateLoanInfo(amount);
            });
        $("#lowestMonthlyPayments").click(function () {
            v12fin.GetLowestMonthlyPayments(amount);
        });
        $("#deposit").keyup(function () {
            var dep = $("#deposit").val();
            if (!dep) dep = $("#financeOptionsGenericWrapper").data("deposit");
            $("#depRange").val(dep);
            v12fin.CalculateRepayments(amount);
        });
    },
};

var financeHelper = {
    ShowFinanceOptions: function (amount, cashPriceType, viewType, productCount) {
        var finLnkWrapper = $("#financeOptionsGenericWrapper");
        if (finLnkWrapper.length && amount > 0) {
            $.ajax({
                url: "/wcallbacks/finance/v12finance",
                data: { amount: amount, cashPriceType: cashPriceType, viewType: viewType, productCount: productCount },
                method: "get",
                cache: false,
            })
                .done(function (data, textStatus, jqXHR) {
                    if (data && data != null && data.length > 0) {
                        // show modal
                        var options = {
                            modalName: "V12FinanceModal",
                            titleHtml: "",
                            contentHtml: data,
                            cssClass: "ProductDetailModals PopUpModal",
                        };
                        popupModal = modalHelper.setupModal(options);
                        var finPList = $("select#productsList", "#calcWrapper");
                        modalHelper.showModal(popupModal);
                        //$('.modal-body', '#V12FinanceModal').css('overflow-y', 'auto');

                        if (finPList.length) {
                            var prods = $("div#viewFinanceLinkWrapper").data("finproducts");
                            if (!prods)
                                prods = finLnkWrapper.data("finproducts");
                            v12fin.Init(amount, prods);
                        }
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                });
        }
    },
};

(function ($) {
    $(function () {
        var container = $(".MainOrderSummary .newBasketSummary #financeOptionsGenericWrapper.basketFinAvailable");
        var isBasketDetails;
        if (container.length) isBasketDetails = true;

        if (!container.length) container = $("form", ".VoucherForm").find("#financeOptionsGenericWrapper.calc-summary");

        if (container.length) {
            var data = container.data("finproducts");
            var cashPrice = container.data("cashprice");

            if (!isBasketDetails || isBasketDetails === false) {
                var finPList = $("select#productsList", container);
                if (finPList.length) {
                    v12fin.Init(cashPrice, data);
                }
            }
        }
    });
})(window.jQuery);