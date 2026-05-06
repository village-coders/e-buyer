var V12 = V12 ? V12 : {};

(function (parent) {
    var financeProducts = [];

    parent.getV12FinanceProducts = function (data) {
        if (financeProducts.length == 0) {
            var allFinProducts = $("div#financeOptionsGenericWrapper").data("finproducts");
            if (allFinProducts) {
                $.each(allFinProducts, function () {
                    financeProducts.push(this);
                });
            }
            else {
                if (data) {
                    $.each(data, function () {
                        financeProducts.push(this);
                    });
                }
            }
        }

        if (!data) {
            return financeProducts;
        }
        else {
            var retFinanceProducts = [];

            $.each(data, function () {
                for (var i = 0; i < financeProducts.length; i++) {
                    if (financeProducts[i].productId == this.productId) {
                        retFinanceProducts.push(financeProducts[i]);
                    }
                }
            });
            return retFinanceProducts;
        }
    };

    parent.getFinanceProduct = function (id) {
        for (var i = 0; i < financeProducts.length; i++) {
            if (financeProducts[i].productId == id) {
                return financeProducts[i];
            }
        }
        return null;
    };

    parent.getFinanceProducts = function (data) {
        var finproducts = parent.getV12FinanceProducts(data);
        return finproducts;
    };

    parent.calculateApr = function (loan, instalment, deferred, term) {
        var result = parseFloat(0);
        var high = parseFloat(200);
        var low = parseFloat(0);
        var n, x, j, q, r, y, x;

        if (deferred > 1) {
            n = term + deferred + 1;
        } else {
            n = term + 1;
        }

        x = 1;

        while (x < 20) {
            result = (high + low) / 2;

            j = parseFloat(Math.pow(1.0000 + result / 100.0000, 1.0000 / 12.0000));

            q = parseFloat(1.0000 / j);

            if (deferred < 1) {
                y = parseFloat((instalment * (1.0000 - Math.pow(q, n))) / (1 - q) - instalment);

                z = parseFloat(0.00);
            } else {
                y = parseFloat((instalment * (1.0000 - Math.pow(q, n - 1))) / (1 - q) - instalment);

                z = parseFloat((instalment * (1.0000 - Math.pow(q, deferred))) / (1 - q) - instalment);
            }

            if (y - z < loan) {
                high = result;
            } else {
                low = result;
            }

            x++;
        }

        return result;
    };

    parent.sumCashFlows = function (months, cashflows) {
        var total = parseFloat(0.00);

        for (var i = 1; i < months; i++) {
            total = parseFloat(total + parseFloat(cashflows[i - 1].cashFlows));
        }

        return total;
    };

    parent.earliestDate = function (cashflows, months) {
        var earliest = cashflows[0].dataDate;

        for (var i = 1; i < months; i++) {
            if (moment(cashflows[i].dataDate).isBefore(earliest)) {
                earliest = cashflows[i].dataDate;
            }
        }

        return earliest;
    };

    parent.presentValue = function (cashflows, irr, loanTerm, checkdate, numdays) {
        var presValue = parseFloat(0.0);

        for (var i = 0; i < loanTerm; i++) {
            var cf = parseFloat(cashflows[i].cashFlows);

            var diff = parseFloat(moment(checkdate).diff(cashflows[i].dataDate, "days"));

            presValue += parseFloat(cf / Math.pow(1 + irr, diff) / numdays);
        }

        return presValue;
    };

    parent.XIRR = function (values, dates, guess) {
        // Credits: algorithm inspired by Apache OpenOffice

        // Calculates the resulting amount
        var irrResult = function (values, dates, rate) {
            var r = rate + 1;
            var result = values[0];
            for (var i = 1; i < values.length; i++) {
                result += values[i] / Math.pow(r, moment(dates[i]).diff(moment(dates[0]), "days") / 365);
            }
            return result;
        };

        // Calculates the first derivation
        var irrResultDeriv = function (values, dates, rate) {
            var r = rate + 1;
            var result = 0;
            for (var i = 1; i < values.length; i++) {
                var frac = moment(dates[i]).diff(moment(dates[0]), "days") / 365;
                result -= (frac * values[i]) / Math.pow(r, frac + 1);
            }
            return result;
        };

        // Check that values contains at least one positive value and one negative value
        var positive = false;
        var negative = false;
        for (var i = 0; i < values.length; i++) {
            if (values[i] > 0) positive = true;
            if (values[i] < 0) negative = true;
        }

        // Return error if values does not contain at least one positive value and one negative value
        if (!positive || !negative) return "#NUM!";

        // Initialize guess and resultRate
        var guess = typeof guess === "undefined" ? 0.1 : guess;
        var resultRate = guess;

        // Set maximum epsilon for end of iteration
        var epsMax = 1e-10;

        // Set maximum number of iterations
        var iterMax = 50;

        // Implement Newton's method
        var newRate, epsRate, resultValue;
        var iteration = 0;
        var contLoop = true;
        do {
            resultValue = irrResult(values, dates, resultRate);
            newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
            epsRate = Math.abs(newRate - resultRate);
            resultRate = newRate;
            contLoop = epsRate > epsMax && Math.abs(resultValue) > epsMax;
        } while (contLoop && ++iteration < iterMax);

        if (contLoop) return "#NUM!";

        // Return internal rate of return
        return resultRate;
    };

    parent.calculateAprFromIrr = function (loan, monthlyinstalment, loanTerm, documentfee, documentfeecollectionmonth) {
        var startDate = new Date();
        var incomeTable = [];
        var dateTable = [];

        var checkDate;
        var incomeObject = { cashFlows: 0, dataDate: 0 };
        var irr, irrPrev, presentValuePrev, pv;

        if (documentfeecollectionmonth == 0) {
            incomeTable.push(parseFloat(loan * -1) + documentfee);
        } else {
            incomeTable.push(parseFloat(loan * -1));
        }
        dateTable.push(startDate);

        for (var i = 1; i <= loanTerm; i++) {
            var nextDate = moment(startDate).add("M", i);
            dateTable.push(nextDate);

            if (i - 1 == documentfeecollectionmonth && documentfeecollectionmonth > 0) {
                incomeTable.push(parseFloat(monthlyinstalment + documentfee));
            } else {
                incomeTable.push(parseFloat(monthlyinstalment));
            }
        }
        var r = parent.XIRR(incomeTable, dateTable, 0.1);

        return Math.round(r * 10000) / 100;
    };

    parent.calculateFromProductCode = function (productCode, cashPrice, deposit) {
        return parent.calculate(parent.getFinanceProduct(productCode), cashPrice, deposit);
    };

    //Calculates all financial parameters
    parent.calculate = function (financeProduct, cashPrice, deposit) {
        var apr = parseFloat(financeProduct.apr);
        var monthlyrate = parseFloat(financeProduct.monthlyRate);
        var calculatedApr;
        var months = parseFloat(financeProduct.months);
        var serviceFee = parseFloat(financeProduct.serviceFee);
        var balancePayable = parseFloat(0.0);
        var documentFee = 0;

        cashPrice = parseFloat(cashPrice);

        deposit = parseFloat(deposit);

        var loanAmount = cashPrice - deposit;
        var initialPayments, finalPayment, balancePayable;

        balancePayable = loanAmount;

        documentFee = financeProduct.documentFee + loanAmount * financeProduct.documentFeePercentage;

        if (financeProduct.documentFeeMinimum > 0 && documentFee < financeProduct.documentFeeMinimum) {
            documentFee = financeProduct.documentFeeMinimum;
        }
        if (financeProduct.documentFeeMaximum > 0 && documentFee > financeProduct.documentFeeMaximum) {
            documentFee = financeProduct.documentFeeMaximum;
        }

        if (monthlyrate == 0) {
            initialPayments = Math.round((loanAmount / months) * 100) / 100;

            if (initialPayments * months < loanAmount) {
                initialPayments += 0.01;
            }

            finalPayment = loanAmount - initialPayments * (months - 1);

            calculatedApr = 0;
        } else {
            var yieldValue = Math.pow(apr / 100 + 1, 1.0 / 12);

            var pv = loanAmount - serviceFee;

            if (financeProduct.deferredPeriod > 1) {
                pv = pv * Math.pow(yieldValue, financeProduct.deferredPeriod - 1);
            }

            initialPayments =
                Math.floor((0 - pv / ((Math.pow(yieldValue, 0 - months) - 1) / (yieldValue - 1))) * 100) / 100;

            finalPayment = initialPayments;

            balancePayable = initialPayments * months;

            calculatedApr = parent.calculateApr(
                loanAmount - financeProduct.serviceFee,
                initialPayments,
                financeProduct.deferredPeriod,
                months,
            );
        }

        if (documentFee > 0) {
            calculatedApr = parent.calculateAprFromIrr(
                loanAmount,
                initialPayments,
                months,
                parseFloat(documentFee),
                parseFloat(financeProduct.documentFeeCollectionMonth),
            );
        }

        //balancePayable = initialPayments * (months - 1);
        //balancePayable += finalPayment;

        var interest = balancePayable - loanAmount;

        var chargeForCredit = interest + serviceFee + documentFee;

        var amountPayable = balancePayable + serviceFee + documentFee + deposit;

        var productAvailable = true;
        var availabilityReason = "";

        /******************* REmoved and replaced by block below *********************
        var divV12FinanceProd = $("#divV12FinanceProducts");


        if (loanAmount < financeProduct.minLoan) {
            productAvailable = false;

            var dataMinLoan = divV12FinanceProd.data("availabilityminloan");
            var reasonMinLoan = "Only available on loan amounts over £";

            if (dataMinLoan && dataMinLoan.length > 0) {
                reasonMinLoan = dataMinLoan;
            }

            availabilityReason = reasonMinLoan + financeProduct.minLoan.toFixed(2);
        }
        else if (loanAmount > financeProduct.maxLoan) {
            productAvailable = false;

            var dataMaxLoan = divV12FinanceProd.data("availabilitymaxloan");
            var reasonMaxLoan = "Only available on loan amounts under £";

            if (dataMaxLoan && dataMinLoan.length > 0) {
                reasonMaxLoan = dataMaxLoan;
            }

            availabilityReason = reasonMaxLoan + financeProduct.maxLoan.toFixed(2);
        }
        *******************************************************************/

        /************ REplacement block ************* */
        if (loanAmount < financeProduct.minLoan) {
            productAvailable = false;

            availabilityReason = "Only available on loan amounts over £" + financeProduct.minLoan.toFixed(2);
        } else if (loanAmount > financeProduct.maxLoan) {
            productAvailable = false;

            availabilityReason = "Only available on loan amounts under £" + financeProduct.maxLoan.toFixed(2);
        }

        var annualRate = (((interest / loanAmount) * 100) / ((months + financeProduct.deferredPeriod) / 12));

        var financeCalculation = {
            initialPayments: initialPayments.toFixed(2),
            finalPayment: finalPayment.toFixed(2),
            balancePayable: balancePayable.toFixed(2),
            interest: interest.toFixed(2),
            chargeForCredit: chargeForCredit.toFixed(2),
            amountPayable: amountPayable.toFixed(2),
            cashPrice: cashPrice.toFixed(2),
            deposit: deposit.toFixed(2),
            loanAmount: loanAmount.toFixed(2),
            months: months,
            monthsDeferred: financeProduct.deferredPeriod,
            apr: calculatedApr.toFixed(2),
            productAvailable: productAvailable,
            availabilityReason: availabilityReason,
            productId: financeProduct.productId,
            productGuid: financeProduct.productGuid,
            name: financeProduct.name,
            settlementFee: financeProduct.settlementFee.toFixed(2),
            serviceFee: serviceFee.toFixed(2),
            documentFee: documentFee.toFixed(2),
            documentFeeMinimum: financeProduct.documentFeeMinimum,
            documentFeeMaximum: financeProduct.documentFeeMaximum,
            documentFeeCollectionMonth: financeProduct.documentFeeCollectionMonth,
            documentFeePercentage: financeProduct.documentFeePercentage,
            annualRate: annualRate.toFixed(2)
        };

        return financeCalculation;
    };

    parent.calculateAll = function (cashPrice, deposit) {
        var financeCalculations = [];
        parent.getFinanceProducts();
        $(financeProducts).each(function () {
            financeCalculations.push(parent.calculate(this, cashPrice, deposit));
        });
        return financeCalculations;
    };
})(V12);