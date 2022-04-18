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
                    type: record.Type.VENDOR_BILL,
                    id: recId,
                    isDynamic: true
                })
                var vendor = recObj.getValue({
                    fieldId: 'entity'
                })
                var vendorRegNum = recObj.getValue({
                    fieldId: 'entitytaxregnum'
                })
                log.debug({
                    title: 'vendorRegNum',
                    details: vendorRegNum
                })
                if (vendorRegNum) {
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
                    var getVendorRec = getVendorRecord(vendor, fromDate, toDate)
                    var vendorRecId = getVendorRec.venRecId;
                    var tcsApplied = getVendorRec.tcsApplied;
                    var amount = getVendorRec.amount;
                    if (vendorRecId) {
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
                                value: 8
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
                                type: 'customrecord_xxflx_vendor_tcs_receivable',
                                id: vendorRecId,
                                values: {
                                    custrecord_xxflx_total_amount: finalTotal
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
                                    value: 8
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
                                    type: 'customrecord_xxflx_vendor_tcs_receivable',
                                    id: vendorRecId,
                                    values: {
                                        custrecord_xxflx_tcs_applied: true
                                    }
                                })
                            }
                        }
                    }
                    else {
                        var vendorTcsRec = record.create({
                            type: 'customrecord_xxflx_vendor_tcs_receivable',
                            isDynamic: false
                        })
                        vendorTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_tcs_vendor',
                            value: vendor
                        })
                        vendorTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_tcs_vendor',
                            value: vendor
                        })
                        vendorTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_total_amount',
                            value: userTotal
                        })
                        vendorTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_from_date',
                            value: formatfromDate
                        })
                        vendorTcsRec.setValue({
                            fieldId: 'custrecord_xxflx_to_date',
                            value: formatToDate
                        })
                        if (userTotal > 5000000) {
                            vendorTcsRec.setValue({
                                fieldId: 'custrecord_xxflx_tcs_applied',
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
                                value: 8
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
                        vendorTcsRec.save()
                    }
                }
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
                    type: record.Type.VENDOR_BILL,
                    id: recId,
                    isDynamic: true
                })
                var oenNumber = recObj.getValue({
                    fieldId: 'custbody_xxflx_oen_number'
                })
                if (oenNumber) {
                    var projectId = getProjectId(oenNumber)
                }
                var lineCount = recObj.getLineCount({
                    sublistId: 'item'
                })
                var finalAmount = 0;
                for (var i = 0; i < lineCount; i++) {
                    recObj.selectLine({
                        sublistId: 'item',
                        line: i
                    })
                    var item = recObj.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                    })
                    log.debug({
                        title: 'item',
                        details: item
                    })
                    if (item != '9' && item != '8') {
                        log.debug({
                            title: "going in 280"
                        })
                        var amount = recObj.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                        })
                        finalAmount = parseFloat(finalAmount) + parseFloat(amount)
                    }
                    if(projectId){
                        recObj.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'customer',
                            value: projectId
                        })
                    }
                    recObj.commitLine({
                        sublistId: 'item'
                    })
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
    function getVendorRecord(vendor, fromDate, toDate) {
        try {
            var customrecord_xxflx_vendor_tcs_receivableSearchObj = search.create({
                type: "customrecord_xxflx_vendor_tcs_receivable",
                filters:
                    [
                        ["custrecord_xxflx_tcs_vendor", "anyof", vendor],
                        "AND",
                        ["custrecord_xxflx_from_date", "on", fromDate],
                        "AND",
                        ["custrecord_xxflx_to_date", "on", toDate]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_xxflx_total_amount", label: "Total Amount" }),
                        search.createColumn({ name: "custrecord_xxflx_tcs_applied", label: "TCS Applied" }),
                    ]
            });
            var searchResultCount = customrecord_xxflx_vendor_tcs_receivableSearchObj.runPaged().count;
            log.debug("customrecord_xxflx_vendor_tcs_receivableSearchObj result count", searchResultCount);
            var venRecId;
            var tcsApplied;
            var amount;
            customrecord_xxflx_vendor_tcs_receivableSearchObj.run().each(function (result) {
                venRecId = result.id;
                tcsApplied = result.getValue({
                    name: 'custrecord_xxflx_tcs_applied'
                })
                amount = result.getValue({
                    name: 'custrecord_xxflx_total_amount'
                })
                return true;
            });
            return {
                venRecId: venRecId,
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
    function getProjectId(oenNumber) {
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["internalidnumber", "equalto", oenNumber],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "jobMain",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        var projectId
        salesorderSearchObj.run().each(function (result) {
            projectId = result.getValue({
                name: "internalid",
                join: "jobMain",
            })
            return true;
        });
        return projectId;
    }
    return {
        afterSubmit: afterSubmit
    }
});
