/**
 *@NApiVersion 2.0
*@NScriptType UserEventScript
*/
define(['N/record', 'N/search', 'N/format'], function (record, search, format) {

    function afterSubmit(context) {
        try {
            log.debug({
                title: "LINE 10"
            })
            if (context.type == context.UserEventType.CREATE) {
                log.debug({
                    title: "LINE 14"
                })
                var recId = context.newRecord.id;
                log.debug({
                    title: 'recId is',
                    details: recId
                });
                var recObj = record.load({
                    type: record.Type.INVOICE,
                    id: recId,
                    isDynamic: true
                })
                var customer = recObj.getValue({
                    fieldId: 'entity'
                })
                log.debug({
                    title: 'customer',
                    details: customer
                })
                /*var fieldLookUp = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customer,
                    columns: ['defaulttaxreg']
                });
                var customerTaxReg = fieldLookUp.defaulttaxreg[0].value;
                if (customerTaxReg) {*/
                    var date = recObj.getValue({
                        fieldId: 'trandate'
                    })
                    log.debug({
                        title: 'date',
                        details: date
                    })
                    var formatDate1 = format.format({
                        value: date,
                        type: format.Type.DATE
                    })
                    log.debug({
                        title: 'formatDate1',
                        details: formatDate1
                    })
                    var splitDate = formatDate1.split('/')
                    var month = splitDate[1]
                    var year = splitDate[2]
                    var fromDate;
                    var toDate;
                    if (month == '01' || month == '02' || month == '03') {
                        var fromFiancialYear = parseFloat(year) - 1
                        fromDate = '01/04/' + fromFiancialYear
                        toDate = '31/03/' + year
                        log.debug({
                            title: fromDate,
                            details: toDate
                        })
                    }
                    else if (month != '01' || month != '02' || month != '03') {
                        var toFiancialYear = parseFloat(year) + 1
                        fromDate = '01/04/' + year
                        toDate = '31/03/' + toFiancialYear
                        log.debug({
                            title: fromDate,
                            details: toDate
                        })
                    }
                    var formatfromDate = format.parse({
                        value: fromDate,
                        type: format.Type.DATE
                    })
                    var formatToDate = format.parse({
                        value: toDate,
                        type: format.Type.DATE
                    })
                    log.debug({
                        title: formatfromDate,
                        details: formatToDate
                    })
                    var lineCount = recObj.getLineCount({
                        sublistId: 'item'
                    })
                    var userTotal = 0;
                    for (var i = 0; i < lineCount; i++) {
                        var natureOfItem = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_in_nature_of_item',
                            line: i
                        })
                        if (natureOfItem == '1' || natureOfItem == '2') {
                            var lineAmount = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i
                            })
                            userTotal = parseFloat(userTotal) + parseFloat(lineAmount)
                        }
                    }
                    var amountToApplied = 0;
                    var getCustomerRec = getCustomerRecord(customer, fromDate, toDate)
                    var customerRecId = getCustomerRec.custRecId;
                    var tcsApplied = getCustomerRec.tcsApplied;
                    var amount = getCustomerRec.amount;
                    if (customerRecId) {
                        if (tcsApplied == true) {
                            amountToApplied = (parseFloat(0.1) * parseFloat(userTotal)) / 100
                            log.debug({
                                title: 'amountToApplied',
                                details: amountToApplied
                            })
                            recObj.selectNewLine({
                                sublistId: 'item'
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: 9
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: 1
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: amountToApplied
                            })
                            recObj.commitLine({
                                sublistId: 'item'
                            })
                        }
                        else {
                            var finalTotal = parseFloat(amount) + parseFloat(userTotal)
                            record.submitFields({
                                type: 'customrecord_xxflx_custome_tcs_payable',
                                id: customerRecId,
                                values: {
                                    custrecord_xxflx_payable_total_amount: finalTotal
                                }
                            })
                            if (finalTotal > 5000000) {
                                var remamingAmount = parseFloat(finalTotal) - 5000000
                                log.debug({
                                    title: 'remamingAmount',
                                    details: remamingAmount
                                })
                                amountToApplied = (parseFloat(0.1) * parseFloat(remamingAmount)) / 100
                                log.debug({
                                    title: 'amountToApplied',
                                    details: amountToApplied
                                })
                                recObj.selectNewLine({
                                    sublistId: 'item'
                                })
                                recObj.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: 9
                                })
                                recObj.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: 1
                                })
                                recObj.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    value: amountToApplied
                                })
                                recObj.commitLine({
                                    sublistId: 'item'
                                })
                                record.submitFields({
                                    type: 'customrecord_xxflx_custome_tcs_payable',
                                    id: customerRecId,
                                    values: {
                                        custrecord_xxflx_tcs_applied_payable: true
                                    }
                                })
                            }
                        }
                    }
                    else {
                        var customerTcsRec = record.create({
                            type: 'customrecord_xxflx_custome_tcs_payable',
                            isDynamic: false
                        })
                        customerTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_tcs_payable_customer',
                            value: customer
                        })
                        customerTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_payable_total_amount',
                            value: userTotal
                        })
                        customerTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_from_date_payable',
                            value: formatfromDate
                        })
                        customerTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_to_date_payable',
                            value: formatToDate
                        })
                        if (userTotal > 5000000) {
                            customerTcsRec.setValue({
                                fieldId: 'custrecord_xxflx_tcs_applied_payable',
                                value: true
                            })
                            var remamingAmount = parseFloat(userTotal) - 5000000
                            amountToApplied = (parseFloat(0.1) * parseFloat(remamingAmount)) / 100
                            recObj.selectNewLine({
                                sublistId: 'item'
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: 9
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: 1
                            })
                            recObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: amountToApplied
                            })
                            recObj.commitLine({
                                sublistId: 'item'
                            })
                        }
                        customerTcsRec.save()
                    }
               // }
                recObj.save()
            }
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                log.debug({
                    title: "LINE 14"
                })
                var recId = context.newRecord.id;
                log.debug({
                    title: 'recId is',
                    details: recId
                });
                var recObj = record.load({
                    type: record.Type.INVOICE,
                    id: recId,
                    isDynamic: true
                })
                var customer = recObj.getValue({
                    fieldId: 'entity'
                })
                log.debug({
                    title: 'customer',
                    details: customer
                })
                /*var fieldLookUp = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customer,
                    columns: ['defaulttaxreg']
                });
                var customerTaxReg = fieldLookUp.defaulttaxreg[0].value;
                log.debug({
                    title: 'customerTaxReg',
                    details: customerTaxReg
                })*/
                var lineCount = recObj.getLineCount({
                    sublistId: 'item'
                })
                var finalAmount = 0;
                for (var i = 0; i < lineCount; i++) {
                    var item = recObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    })
                    log.debug({
                        title: 'item',
                        details: item
                    })
                    if (item != '9' && item != '8') {
                        log.debug({
                            title: "going in 280"
                        })
                        var amount = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: i
                        })
                        finalAmount = parseFloat(finalAmount) + parseFloat(amount)
                    }
                }
                recObj.setValue({
                    fieldId: 'custbody_xxflx_base_amount',
                    value: finalAmount
                })
                recObj.save()
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    function getCustomerRecord(customer, fromDate, toDate) {
        try {
            var customrecord_xxflx_vendor_tcs_receivableSearchObj = search.create({
                type: "customrecord_xxflx_custome_tcs_payable",
                filters:
                    [
                        ["custrecord_xxflx_tcs_payable_customer", "anyof", customer],
                        "AND",
                        ["custrecord_xxflx_from_date_payable", "on", fromDate],
                        "AND",
                        ["custrecord_xxflx_to_date_payable", "on", toDate]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_xxflx_payable_total_amount", label: "Total Amount" }),
                        search.createColumn({ name: "custrecord_xxflx_tcs_applied_payable", label: "TCS Applied" }),
                    ]
            });
            var searchResultCount = customrecord_xxflx_vendor_tcs_receivableSearchObj.runPaged().count;
            log.debug("customrecord_xxflx_vendor_tcs_receivableSearchObj result count", searchResultCount);
            var custRecId;
            var tcsApplied;
            var amount;
            customrecord_xxflx_vendor_tcs_receivableSearchObj.run().each(function (result) {
                custRecId = result.id;
                tcsApplied = result.getValue({
                    name: 'custrecord_xxflx_tcs_applied_payable'
                })
                amount = result.getValue({
                    name: 'custrecord_xxflx_payable_total_amount'
                })
                return true;
            });
            return {
                custRecId: custRecId,
                tcsApplied: tcsApplied,
                amount: amount
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    return {
        afterSubmit: afterSubmit
    }
});
